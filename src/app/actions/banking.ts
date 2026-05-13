"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { accounts, billPayments, cards, payees, transactions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

function flatten(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const p = i.path[0]?.toString();
    if (p && !out[p]) out[p] = i.message;
  }
  return out;
}

// ---------- TRANSFER -----------------------------------------------
const transferSchema = z.object({
  fromAccountId: z.coerce.number().int().positive("Choose a source"),
  toAccountId: z.coerce.number().int().positive("Choose a destination"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  memo: z.string().max(80).optional(),
});

export async function transferAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  const parsed = transferSchema.safeParse({
    fromAccountId: formData.get("fromAccountId"),
    toAccountId: formData.get("toAccountId"),
    amount: formData.get("amount"),
    memo: formData.get("memo") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  const { fromAccountId, toAccountId, amount, memo } = parsed.data;

  if (fromAccountId === toAccountId) {
    return { ok: false, message: "Source and destination must be different." };
  }

  const owned = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();
  const from = owned.find((a) => a.id === fromAccountId);
  const to = owned.find((a) => a.id === toAccountId);

  if (!from || !to) {
    return { ok: false, message: "Account not found." };
  }
  if (from.status !== "active" || to.status !== "active") {
    return { ok: false, message: "One of the accounts is not active." };
  }
  if (from.balance < amount && from.type !== "credit") {
    return { ok: false, message: "Insufficient funds in source account." };
  }

  db.transaction(() => {
    const newFromBal = Number((from.balance - amount).toFixed(2));
    const newToBal = Number((to.balance + amount).toFixed(2));

    db.update(accounts)
      .set({ balance: newFromBal })
      .where(eq(accounts.id, from.id))
      .run();
    db.update(accounts)
      .set({ balance: newToBal })
      .where(eq(accounts.id, to.id))
      .run();

    db.insert(transactions)
      .values({
        accountId: from.id,
        type: "debit",
        amount,
        description: `Transfer to ${to.name}`,
        category: "Transfer",
        counterparty: to.name,
        balanceAfter: newFromBal,
      })
      .run();
    db.insert(transactions)
      .values({
        accountId: to.id,
        type: "credit",
        amount,
        description: `Transfer from ${from.name}${memo ? ` — ${memo}` : ""}`,
        category: "Transfer",
        counterparty: from.name,
        balanceAfter: newToBal,
      })
      .run();
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transfer");
  return { ok: true, message: `Transferred $${amount.toFixed(2)} to ${to.name}.` };
}

// ---------- PAYEES -------------------------------------------------
const payeeSchema = z.object({
  name: z.string().min(1, "Name required").max(60),
  accountNumber: z.string().min(3, "Account number required").max(40),
  category: z.string().max(40).optional(),
  nickname: z.string().max(40).optional(),
});

export async function addPayeeAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  const parsed = payeeSchema.safeParse({
    name: formData.get("name"),
    accountNumber: formData.get("accountNumber"),
    category: formData.get("category") || undefined,
    nickname: formData.get("nickname") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: flatten(parsed.error) };

  db.insert(payees)
    .values({
      userId: user.id,
      name: parsed.data.name,
      accountNumber: parsed.data.accountNumber,
      category: parsed.data.category,
      nickname: parsed.data.nickname,
    })
    .run();

  revalidatePath("/dashboard/pay-bills");
  return { ok: true, message: `${parsed.data.name} added as a payee.` };
}

const paymentSchema = z.object({
  payeeId: z.coerce.number().int().positive(),
  fromAccountId: z.coerce.number().int().positive(),
  amount: z.coerce.number().positive(),
  scheduledDate: z.string().min(1),
  memo: z.string().max(80).optional(),
  payNow: z.string().optional(),
});

export async function schedulePaymentAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  const parsed = paymentSchema.safeParse({
    payeeId: formData.get("payeeId"),
    fromAccountId: formData.get("fromAccountId"),
    amount: formData.get("amount"),
    scheduledDate: formData.get("scheduledDate"),
    memo: formData.get("memo") || undefined,
    payNow: formData.get("payNow") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: flatten(parsed.error) };

  const { payeeId, fromAccountId, amount, scheduledDate, memo, payNow } = parsed.data;
  const payNowFlag = payNow === "on" || payNow === "true";

  const account = db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, fromAccountId), eq(accounts.userId, user.id)))
    .get();
  const payee = db
    .select()
    .from(payees)
    .where(and(eq(payees.id, payeeId), eq(payees.userId, user.id)))
    .get();
  if (!account || !payee) {
    return { ok: false, message: "Account or payee not found." };
  }
  if (payNowFlag && account.balance < amount) {
    return { ok: false, message: "Insufficient funds to pay now." };
  }

  db.transaction(() => {
    if (payNowFlag) {
      const newBal = Number((account.balance - amount).toFixed(2));
      db.update(accounts)
        .set({ balance: newBal })
        .where(eq(accounts.id, account.id))
        .run();
      db.insert(transactions)
        .values({
          accountId: account.id,
          type: "debit",
          amount,
          description: `Payment to ${payee.name}${memo ? ` — ${memo}` : ""}`,
          category: "Bill pay",
          counterparty: payee.name,
          balanceAfter: newBal,
        })
        .run();
      db.insert(billPayments)
        .values({
          userId: user.id,
          payeeId: payee.id,
          fromAccountId: account.id,
          amount,
          scheduledDate: new Date(scheduledDate),
          status: "paid",
          memo,
        })
        .run();
    } else {
      db.insert(billPayments)
        .values({
          userId: user.id,
          payeeId: payee.id,
          fromAccountId: account.id,
          amount,
          scheduledDate: new Date(scheduledDate),
          status: "scheduled",
          memo,
        })
        .run();
    }
  });

  revalidatePath("/dashboard/pay-bills");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: payNowFlag
      ? `Paid ${payee.name} $${amount.toFixed(2)}.`
      : `Payment of $${amount.toFixed(2)} scheduled to ${payee.name}.`,
  };
}

export async function cancelPaymentAction(
  paymentId: number
): Promise<ActionState> {
  const user = await requireAuth();
  const pmt = db
    .select()
    .from(billPayments)
    .where(and(eq(billPayments.id, paymentId), eq(billPayments.userId, user.id)))
    .get();
  if (!pmt) return { ok: false, message: "Payment not found." };
  if (pmt.status !== "scheduled") {
    return { ok: false, message: "Only scheduled payments can be cancelled." };
  }
  db.update(billPayments)
    .set({ status: "cancelled" })
    .where(eq(billPayments.id, paymentId))
    .run();
  revalidatePath("/dashboard/pay-bills");
  return { ok: true, message: "Payment cancelled." };
}

// ---------- CARDS --------------------------------------------------
export async function toggleCardFreezeAction(cardId: number): Promise<ActionState> {
  const user = await requireAuth();
  const card = db
    .select()
    .from(cards)
    .where(and(eq(cards.id, cardId), eq(cards.userId, user.id)))
    .get();
  if (!card) return { ok: false, message: "Card not found." };

  db.update(cards)
    .set({ frozen: !card.frozen })
    .where(eq(cards.id, cardId))
    .run();
  revalidatePath("/dashboard/cards");
  return {
    ok: true,
    message: card.frozen ? "Card unfrozen." : "Card frozen.",
  };
}

const limitSchema = z.object({
  cardId: z.coerce.number().int().positive(),
  spendLimit: z.coerce.number().nonnegative(),
});

export async function setCardLimitAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireAuth();
  const parsed = limitSchema.safeParse({
    cardId: formData.get("cardId"),
    spendLimit: formData.get("spendLimit"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: flatten(parsed.error) };

  const card = db
    .select()
    .from(cards)
    .where(and(eq(cards.id, parsed.data.cardId), eq(cards.userId, user.id)))
    .get();
  if (!card) return { ok: false, message: "Card not found." };

  db.update(cards)
    .set({ spendLimit: parsed.data.spendLimit })
    .where(eq(cards.id, card.id))
    .run();
  revalidatePath("/dashboard/cards");
  return { ok: true, message: "Spend limit updated." };
}

// ---------- CONTACT MESSAGE ---------------------------------------
const contactSchema = z.object({
  name: z.string().min(1, "Name required").max(80),
  email: z.string().email("Enter a valid email"),
  topic: z.string().min(1, "Choose a topic"),
  message: z.string().min(10, "Tell us a bit more").max(2000),
});

export async function contactAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    topic: formData.get("topic"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: flatten(parsed.error) };

  const { contactMessages } = await import("@/db/schema");
  db.insert(contactMessages).values(parsed.data).run();
  return { ok: true, message: "Got it. A team member will be in touch within one business day." };
}

// ---------- BILL PAYMENTS query helper (used by pages) ------------
export async function listScheduledPayments() {
  const user = await requireAuth();
  return db
    .select({
      payment: billPayments,
      payee: payees,
      account: accounts,
    })
    .from(billPayments)
    .leftJoin(payees, eq(billPayments.payeeId, payees.id))
    .leftJoin(accounts, eq(billPayments.fromAccountId, accounts.id))
    .where(eq(billPayments.userId, user.id))
    .orderBy(desc(billPayments.scheduledDate))
    .all();
}
