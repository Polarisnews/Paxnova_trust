"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  accounts,
  applications,
  cards,
  transactions,
  users,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { generateAccountNumber } from "@/lib/password";

export type AdminState = {
  ok: boolean;
  message?: string;
};

export async function approveApplicationAction(
  applicationId: number
): Promise<AdminState> {
  await requireAdmin();
  const app = db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .get();
  if (!app) return { ok: false, message: "Application not found." };
  if (app.status !== "pending")
    return { ok: false, message: "Application already reviewed." };

  let userId = app.userId;

  // If this application isn't tied to an existing user yet, try to link by email.
  if (!userId) {
    const existing = db
      .select()
      .from(users)
      .where(eq(users.email, app.applicantEmail.toLowerCase()))
      .get();
    if (existing) userId = existing.id;
  }

  db.transaction(() => {
    db.update(applications)
      .set({ status: "approved", reviewedAt: new Date() })
      .where(eq(applications.id, applicationId))
      .run();

    if (userId) {
      const productName: Record<string, string> = {
        checking: "Apex Checking",
        savings: "Reserve Savings",
        "credit-card": "Signature Credit",
        business: "Business Operating",
      };
      const type =
        app.product === "credit-card"
          ? "credit"
          : app.product === "business"
          ? "business"
          : (app.product as "checking" | "savings");

      const [newAccount] = db
        .insert(accounts)
        .values({
          userId,
          type,
          name: productName[app.product] ?? "New account",
          accountNumber: generateAccountNumber(),
          balance: app.fundingAmount ?? 0,
          status: "active",
          apy: type === "savings" ? 4.85 : type === "checking" ? 0.5 : null,
          creditLimit: type === "credit" ? 5000 : null,
        })
        .returning()
        .all();

      if (app.fundingAmount && app.fundingAmount > 0) {
        db.insert(transactions)
          .values({
            accountId: newAccount.id,
            type: "credit",
            amount: app.fundingAmount,
            description: "Opening deposit",
            category: "Funding",
            counterparty: app.fundingSource ?? "External transfer",
            balanceAfter: newAccount.balance,
          })
          .run();
      }
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/applications");
  revalidatePath("/dashboard");
  return { ok: true, message: "Application approved." };
}

export async function rejectApplicationAction(
  applicationId: number,
  note?: string
): Promise<AdminState> {
  await requireAdmin();
  db.update(applications)
    .set({ status: "rejected", reviewedAt: new Date(), notes: note ?? null })
    .where(eq(applications.id, applicationId))
    .run();
  revalidatePath("/admin/applications");
  return { ok: true, message: "Application rejected." };
}

export async function setAccountStatusAction(
  accountId: number,
  status: "active" | "frozen" | "closed"
): Promise<AdminState> {
  await requireAdmin();
  db.update(accounts).set({ status }).where(eq(accounts.id, accountId)).run();
  revalidatePath("/admin/accounts");
  return { ok: true, message: `Account ${status}.` };
}

const adjustSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  delta: z.coerce.number(),
  reason: z.string().min(1).max(80),
});

export async function adjustBalanceAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = adjustSchema.safeParse({
    accountId: formData.get("accountId"),
    delta: formData.get("delta"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { ok: false, message: "Check the fields." };

  const acct = db.select().from(accounts).where(eq(accounts.id, parsed.data.accountId)).get();
  if (!acct) return { ok: false, message: "Account not found." };

  const newBal = Number((acct.balance + parsed.data.delta).toFixed(2));

  db.transaction(() => {
    db.update(accounts).set({ balance: newBal }).where(eq(accounts.id, acct.id)).run();
    db.insert(transactions)
      .values({
        accountId: acct.id,
        type: parsed.data.delta >= 0 ? "credit" : "debit",
        amount: Math.abs(parsed.data.delta),
        description: `Admin adjustment — ${parsed.data.reason}`,
        category: "Adjustment",
        counterparty: "Nova Trust Operations",
        balanceAfter: newBal,
      })
      .run();
  });

  revalidatePath("/admin/accounts");
  return { ok: true, message: "Balance adjusted." };
}

export async function setUserRoleAction(
  userId: number,
  role: "user" | "admin"
): Promise<AdminState> {
  await requireAdmin();
  db.update(users).set({ role }).where(eq(users.id, userId)).run();
  revalidatePath("/admin/users");
  return { ok: true, message: role === "admin" ? "Promoted to admin." : "Demoted to user." };
}

export async function setUserStatusAction(
  userId: number,
  status: "active" | "suspended"
): Promise<AdminState> {
  await requireAdmin();
  db.update(users).set({ status }).where(eq(users.id, userId)).run();
  revalidatePath("/admin/users");
  return { ok: true, message: `User ${status}.` };
}

export async function adminFreezeCardAction(cardId: number): Promise<AdminState> {
  await requireAdmin();
  const card = db.select().from(cards).where(eq(cards.id, cardId)).get();
  if (!card) return { ok: false, message: "Card not found." };
  db.update(cards).set({ frozen: !card.frozen }).where(eq(cards.id, cardId)).run();
  revalidatePath("/admin/cards");
  return { ok: true, message: card.frozen ? "Card unfrozen." : "Card frozen." };
}
