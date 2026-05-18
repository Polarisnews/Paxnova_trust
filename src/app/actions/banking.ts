"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  accounts,
  billPayments,
  cards,
  payees,
  transactions,
  transfers,
} from "@/db/schema";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { generateReferenceNumber } from "@/lib/password";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  /** Optional — set by addPayeeAction so callers (e.g. the Pay Bills wizard)
   *  can auto-select the newly created payee without a full refetch. */
  payeeId?: number;
  /** Optional — set by schedulePaymentAction so the wizard can deep-link
   *  to the newly created bill-payment receipt. */
  paymentId?: number;
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
const payeeSchema = z
  .object({
    name: z.string().min(1, "Name required").max(80),
    accountNumber: z.string().min(3, "Account number required").max(40),
    category: z.string().max(40).optional().or(z.literal("")),
    nickname: z.string().max(40).optional().or(z.literal("")),
    payeeType: z
      .enum(["person", "business", "utility", "external-bank"])
      .default("business"),
    bankName: z.string().max(80).optional().or(z.literal("")),
    routingNumber: z
      .string()
      .max(20)
      .optional()
      .or(z.literal(""))
      .refine(
        (s) => !s || /^\d{9}$/.test(s),
        "Routing number must be 9 digits"
      ),
    accountType: z.enum(["checking", "savings"]).optional(),
    email: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    phone: z.string().max(40).optional().or(z.literal("")),
  })
  .refine(
    (d) =>
      d.payeeType === "person"
        ? (d.email ?? "").length > 0 || (d.phone ?? "").length > 0
        : true,
    {
      message: "Person payees need an email or phone (for Zelle)",
      path: ["email"],
    }
  )
  .refine(
    (d) =>
      d.payeeType === "external-bank" || d.payeeType === "business"
        ? (d.routingNumber ?? "").length === 9
        : true,
    {
      message: "Routing number is required for bank/business payees",
      path: ["routingNumber"],
    }
  );

function derivePreferredMethod(
  payeeType: "person" | "business" | "utility" | "external-bank"
): "zelle" | "ach" | "wire" {
  return payeeType === "person" ? "zelle" : "ach";
}

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
    payeeType: formData.get("payeeType") || "business",
    bankName: formData.get("bankName") || undefined,
    routingNumber: formData.get("routingNumber") || undefined,
    accountType: formData.get("accountType") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: flatten(parsed.error) };

  const inserted = db
    .insert(payees)
    .values({
      userId: user.id,
      name: parsed.data.name,
      accountNumber: parsed.data.accountNumber,
      category: parsed.data.category || null,
      nickname: parsed.data.nickname || null,
      payeeType: parsed.data.payeeType,
      bankName: parsed.data.bankName || null,
      routingNumber: parsed.data.routingNumber || null,
      accountType: parsed.data.accountType ?? null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      preferredMethod: derivePreferredMethod(parsed.data.payeeType),
    })
    .returning({ id: payees.id })
    .all();
  const payeeId = inserted[0]?.id;

  revalidatePath("/dashboard/transfer");
  revalidatePath("/dashboard/pay-bills");
  return {
    ok: true,
    message: `${parsed.data.name} added as a recipient.`,
    payeeId,
  };
}

// ---------- ENHANCED TRANSFER (own / payee, internal / Zelle / ACH / Wire)
// --------------------------------------------------------------------------

const WIRE_FEE = 25;

const initiateTransferSchema = z
  .object({
    fromAccountId: z.coerce.number().int().positive("Choose a source"),
    destinationKind: z.enum(["own", "payee"]),
    toAccountId: z.coerce.number().int().optional(),
    toPayeeId: z.coerce.number().int().optional(),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    memo: z.string().max(120).optional().or(z.literal("")),
    sendByWire: z.string().optional(),
  })
  .refine(
    (d) =>
      d.destinationKind === "own" ? (d.toAccountId ?? 0) > 0 : true,
    { message: "Pick a destination account", path: ["toAccountId"] }
  )
  .refine(
    (d) => (d.destinationKind === "payee" ? (d.toPayeeId ?? 0) > 0 : true),
    { message: "Pick a recipient", path: ["toPayeeId"] }
  );

/**
 * Returns a Date N business days in the future. Skips Saturdays + Sundays.
 * Doesn't know about US federal holidays — fine for demo fidelity.
 */
function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) remaining--;
  }
  return d;
}

export async function initiateTransferAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState & { referenceNumber?: string }> {
  const user = await requireAuth();
  const parsed = initiateTransferSchema.safeParse({
    fromAccountId: formData.get("fromAccountId"),
    destinationKind: formData.get("destinationKind"),
    toAccountId: formData.get("toAccountId") || undefined,
    toPayeeId: formData.get("toPayeeId") || undefined,
    amount: formData.get("amount"),
    memo: formData.get("memo") || undefined,
    sendByWire: formData.get("sendByWire") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  const {
    fromAccountId,
    destinationKind,
    toAccountId,
    toPayeeId,
    amount,
    memo,
    sendByWire,
  } = parsed.data;

  const from = db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, fromAccountId), eq(accounts.userId, user.id)))
    .get();
  if (!from) return { ok: false, message: "Source account not found." };
  // Legacy non-status states still block.
  if (from.status === "closed" || from.status === "pending")
    return { ok: false, message: "Source account is not active." };

  let transferMethod: "internal" | "zelle" | "ach" | "wire";
  let toAccount: typeof from | null = null;
  let toPayee: typeof payees.$inferSelect | null = null;
  let toAccountName: string;
  let toAccountLast4: string;
  let toBankName: string | null = null;
  let toRoutingNumber: string | null = null;
  let estimatedSettlement: Date;

  if (destinationKind === "own") {
    if (toAccountId === fromAccountId)
      return {
        ok: false,
        message: "Source and destination must be different.",
      };
    toAccount = db
      .select()
      .from(accounts)
      .where(
        and(eq(accounts.id, toAccountId!), eq(accounts.userId, user.id))
      )
      .get() as typeof from | null;
    if (!toAccount)
      return { ok: false, message: "Destination account not found." };
    if (toAccount.status !== "active")
      return { ok: false, message: "Destination account is not active." };

    transferMethod = "internal";
    toAccountName = toAccount.name;
    toAccountLast4 = toAccount.accountNumber.slice(-4);
    toBankName = "Paxnova Trust Bank";
    toRoutingNumber = toAccount.routingNumber;
    estimatedSettlement = new Date(); // instant
  } else {
    toPayee = db
      .select()
      .from(payees)
      .where(and(eq(payees.id, toPayeeId!), eq(payees.userId, user.id)))
      .get() as typeof payees.$inferSelect | null;
    if (!toPayee) return { ok: false, message: "Recipient not found." };

    const wireRequested = sendByWire === "on" || sendByWire === "true";
    if (toPayee.preferredMethod === "zelle" && !wireRequested) {
      transferMethod = "zelle";
      estimatedSettlement = new Date(Date.now() + 5 * 60 * 1000); // ~5 min
    } else if (wireRequested) {
      transferMethod = "wire";
      // Same-day if before 5 PM ET, otherwise next business day at 9 AM.
      estimatedSettlement = new Date();
    } else {
      transferMethod = "ach";
      estimatedSettlement = addBusinessDays(new Date(), 2);
    }

    toAccountName = toPayee.name;
    toAccountLast4 = (toPayee.accountNumber ?? "").slice(-4) || "----";
    toBankName = toPayee.bankName ?? null;
    toRoutingNumber = toPayee.routingNumber ?? null;
  }

  const fee = transferMethod === "wire" ? WIRE_FEE : 0;
  const totalDebit = Number((amount + fee).toFixed(2));
  const reference = `TX-${generateReferenceNumber().replace(/^NT-/, "")}`;

  // Code status only gates ACH (external bank) and wire flows.
  const codeApplies =
    from.status === "code" &&
    (transferMethod === "ach" || transferMethod === "wire");

  // Shared row shape — completed/active mutates this further below.
  const transferRow = {
    userId: user.id,
    referenceNumber: reference,
    fromAccountId: from.id,
    toType: destinationKind,
    toAccountId: toAccount?.id ?? null,
    toPayeeId: toPayee?.id ?? null,
    transferMethod,
    amount,
    fee,
    memo: memo || null,
    fromAccountName: from.name,
    fromAccountLast4: from.accountNumber.slice(-4),
    toAccountName,
    toAccountLast4,
    toBankName,
    toRoutingNumber,
    estimatedSettlement,
  };

  // ── Interrupt paths: create the transfer record with the right status
  // and return. Money is not moved. The processing page reads the status
  // and shows the appropriate interrupt UI.

  if (from.status === "frozen") {
    db.insert(transfers).values({ ...transferRow, status: "rejected_frozen" }).run();
    revalidatePath("/dashboard");
    return { ok: true, referenceNumber: reference };
  }

  if (from.status === "custom") {
    db.insert(transfers)
      .values({
        ...transferRow,
        status: "interrupted_custom",
        interruptMessage: from.customMessage ?? null,
      })
      .run();
    revalidatePath("/dashboard");
    return { ok: true, referenceNumber: reference };
  }

  if (codeApplies) {
    // Funds check upfront so the user doesn't pass both gates only to fail.
    if (from.balance < totalDebit && from.type !== "credit") {
      return {
        ok: false,
        message:
          fee > 0
            ? `Insufficient funds. Need $${totalDebit.toFixed(2)} including the $${fee} wire fee.`
            : "Insufficient funds in source account.",
      };
    }
    db.insert(transfers).values({ ...transferRow, status: "pending_tcv" }).run();
    revalidatePath("/dashboard");
    return { ok: true, referenceNumber: reference };
  }

  // ── Active path (or code-status with internal/zelle which Code ignores).

  if (from.balance < totalDebit && from.type !== "credit") {
    return {
      ok: false,
      message:
        fee > 0
          ? `Insufficient funds. Need $${totalDebit.toFixed(2)} including the $${fee} wire fee.`
          : "Insufficient funds in source account.",
    };
  }

  db.transaction(() => {
    const newFromBal = Number((from.balance - totalDebit).toFixed(2));
    db.update(accounts)
      .set({ balance: newFromBal })
      .where(eq(accounts.id, from.id))
      .run();

    db.insert(transactions)
      .values({
        accountId: from.id,
        type: "debit",
        amount: totalDebit,
        description:
          transferMethod === "internal"
            ? `Transfer to ${toAccountName}`
            : `${transferMethod.toUpperCase()} to ${toAccountName}${
                memo ? ` — ${memo}` : ""
              }`,
        category: "Transfer",
        counterparty: toAccountName,
        counterpartyBank: toBankName,
        counterpartyAccountNumber: toAccountLast4
          ? `••••${toAccountLast4}`
          : null,
        remark: memo || null,
        referenceNumber: reference,
        balanceAfter: newFromBal,
      })
      .run();

    if (transferMethod === "internal" && toAccount) {
      const newToBal = Number((toAccount.balance + amount).toFixed(2));
      db.update(accounts)
        .set({ balance: newToBal })
        .where(eq(accounts.id, toAccount.id))
        .run();
      db.insert(transactions)
        .values({
          accountId: toAccount.id,
          type: "credit",
          amount,
          description: `Transfer from ${from.name}${memo ? ` — ${memo}` : ""}`,
          category: "Transfer",
          counterparty: from.name,
          counterpartyBank: "Paxnova Trust Bank",
          counterpartyAccountNumber: `••••${from.accountNumber.slice(-4)}`,
          remark: memo || null,
          referenceNumber: reference,
          balanceAfter: newToBal,
        })
        .run();
    }

    db.insert(transfers)
      .values({
        ...transferRow,
        status: "completed",
        completedAt: new Date(),
      })
      .run();
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transfer");

  return {
    ok: true,
    message: `Transfer initiated.`,
    referenceNumber: reference,
  };
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

  // Capture the inserted bill_payments id so we can deep-link to the
  // receipt from the wizard's done screen.
  let paymentId = 0;
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
      const ins = db
        .insert(billPayments)
        .values({
          userId: user.id,
          payeeId: payee.id,
          fromAccountId: account.id,
          amount,
          scheduledDate: new Date(scheduledDate),
          status: "paid",
          memo,
        })
        .returning({ id: billPayments.id })
        .all();
      paymentId = ins[0]?.id ?? 0;
    } else {
      const ins = db
        .insert(billPayments)
        .values({
          userId: user.id,
          payeeId: payee.id,
          fromAccountId: account.id,
          amount,
          scheduledDate: new Date(scheduledDate),
          status: "scheduled",
          memo,
        })
        .returning({ id: billPayments.id })
        .all();
      paymentId = ins[0]?.id ?? 0;
    }
  });

  revalidatePath("/dashboard/pay-bills");
  revalidatePath("/dashboard");
  if (paymentId)
    revalidatePath(`/dashboard/pay-bills/receipt/${paymentId}`);
  return {
    ok: true,
    message: payNowFlag
      ? `Paid ${payee.name} $${amount.toFixed(2)}.`
      : `Payment of $${amount.toFixed(2)} scheduled to ${payee.name}.`,
    paymentId,
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
  const signedInUser = await getCurrentUser();
  const now = new Date();
  db.insert(contactMessages)
    .values({
      ...parsed.data,
      userId: signedInUser?.id ?? null,
      status: "open",
      lastActivityAt: now,
    })
    .run();
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
