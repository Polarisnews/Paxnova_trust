"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  accounts,
  scheduledWires,
  transactions,
  transfers,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type VerifyState =
  | { ok: true; status: string; completedAt?: string }
  | { ok: false; message: string };

type ResolvedTarget =
  | {
      kind: "transfer";
      row: typeof transfers.$inferSelect;
    }
  | {
      kind: "wire";
      row: typeof scheduledWires.$inferSelect;
    };

async function resolveByReference(
  referenceNumber: string,
  userId: number
): Promise<ResolvedTarget | null> {
  const t = db
    .select()
    .from(transfers)
    .where(
      and(
        eq(transfers.referenceNumber, referenceNumber),
        eq(transfers.userId, userId)
      )
    )
    .get();
  if (t) return { kind: "transfer", row: t };

  const w = db
    .select()
    .from(scheduledWires)
    .where(
      and(
        eq(scheduledWires.referenceNumber, referenceNumber),
        eq(scheduledWires.userId, userId)
      )
    )
    .get();
  if (w) return { kind: "wire", row: w };
  return null;
}

// ────────────────────────────────────────────────────────────────────────
// TCV — gate the transfer at the ACH-operator step.
// ────────────────────────────────────────────────────────────────────────

export async function verifyTcvCodeAction(
  referenceNumber: string,
  code: string
): Promise<VerifyState> {
  const user = await requireAuth();
  const target = await resolveByReference(referenceNumber, user.id);
  if (!target) return { ok: false, message: "Transfer not found." };

  const expectedStatus = "pending_tcv";
  if (target.row.status !== expectedStatus) {
    return {
      ok: false,
      message: `Not awaiting TCV (current status: ${target.row.status}).`,
    };
  }

  const fromAccountId = target.row.fromAccountId;
  const source = db.select().from(accounts).where(eq(accounts.id, fromAccountId)).get();
  if (!source) return { ok: false, message: "Source account not found." };
  if (!source.tcvCode) {
    return { ok: false, message: "No TCV code is set for this account." };
  }
  if (code.trim().toUpperCase() !== source.tcvCode.toUpperCase()) {
    return { ok: false, message: "That TCV code is incorrect." };
  }

  const now = new Date();
  if (target.kind === "transfer") {
    db.update(transfers)
      .set({ status: "pending_aml", tcvVerifiedAt: now })
      .where(eq(transfers.id, target.row.id))
      .run();
  } else {
    db.update(scheduledWires)
      .set({ status: "pending_aml", tcvVerifiedAt: now })
      .where(eq(scheduledWires.id, target.row.id))
      .run();
  }

  return { ok: true, status: "pending_aml" };
}

// ────────────────────────────────────────────────────────────────────────
// AML — final clearance. On success, actually move money / mark scheduled.
// ────────────────────────────────────────────────────────────────────────

export async function verifyAmlCodeAction(
  referenceNumber: string,
  code: string
): Promise<VerifyState> {
  const user = await requireAuth();
  const target = await resolveByReference(referenceNumber, user.id);
  if (!target) return { ok: false, message: "Transfer not found." };

  if (target.row.status !== "pending_aml") {
    return {
      ok: false,
      message: `Not awaiting AML (current status: ${target.row.status}).`,
    };
  }

  const fromAccountId = target.row.fromAccountId;
  const source = db.select().from(accounts).where(eq(accounts.id, fromAccountId)).get();
  if (!source) return { ok: false, message: "Source account not found." };
  if (!source.amlCode) {
    return { ok: false, message: "No AML code is set for this account." };
  }
  if (code.trim().toUpperCase() !== source.amlCode.toUpperCase()) {
    return { ok: false, message: "That AML code is incorrect." };
  }

  const now = new Date();

  if (target.kind === "transfer") {
    const row = target.row;
    const fee = row.fee ?? 0;
    const totalDebit = Number((row.amount + fee).toFixed(2));

    if (source.type !== "credit" && source.balance < totalDebit) {
      // Mark failed so it doesn't get stuck in limbo.
      db.update(transfers)
        .set({ status: "failed", amlVerifiedAt: now })
        .where(eq(transfers.id, row.id))
        .run();
      return {
        ok: false,
        message: "Funds are no longer sufficient. The transfer was cancelled.",
      };
    }

    db.transaction(() => {
      const newFromBal = Number((source.balance - totalDebit).toFixed(2));
      db.update(accounts)
        .set({ balance: newFromBal })
        .where(eq(accounts.id, source.id))
        .run();

      db.insert(transactions)
        .values({
          accountId: source.id,
          type: "debit",
          amount: totalDebit,
          description:
            row.transferMethod === "internal"
              ? `Transfer to ${row.toAccountName}`
              : `${row.transferMethod.toUpperCase()} to ${row.toAccountName}${
                  row.memo ? ` — ${row.memo}` : ""
                }`,
          category: "Transfer",
          counterparty: row.toAccountName,
          counterpartyBank: row.toBankName,
          counterpartyAccountNumber: row.toAccountLast4
            ? `••••${row.toAccountLast4}`
            : null,
          remark: row.memo || null,
          referenceNumber: row.referenceNumber,
          balanceAfter: newFromBal,
        })
        .run();

      if (row.transferMethod === "internal" && row.toAccountId) {
        const toAccount = db
          .select()
          .from(accounts)
          .where(eq(accounts.id, row.toAccountId))
          .get();
        if (toAccount) {
          const newToBal = Number((toAccount.balance + row.amount).toFixed(2));
          db.update(accounts)
            .set({ balance: newToBal })
            .where(eq(accounts.id, toAccount.id))
            .run();
          db.insert(transactions)
            .values({
              accountId: toAccount.id,
              type: "credit",
              amount: row.amount,
              description: `Transfer from ${row.fromAccountName}${
                row.memo ? ` — ${row.memo}` : ""
              }`,
              category: "Transfer",
              counterparty: row.fromAccountName,
              counterpartyBank: "Paxnova Trust Bank",
              counterpartyAccountNumber: `••••${row.fromAccountLast4}`,
              remark: row.memo || null,
              referenceNumber: row.referenceNumber,
              balanceAfter: newToBal,
            })
            .run();
        }
      }

      db.update(transfers)
        .set({
          status: "completed",
          amlVerifiedAt: now,
          completedAt: now,
        })
        .where(eq(transfers.id, row.id))
        .run();
    });

    revalidatePath("/dashboard");
    return { ok: true, status: "completed", completedAt: now.toISOString() };
  }

  // Scheduled wires don't move money on completion — they just become
  // "scheduled" so they're queued for the wire date.
  db.update(scheduledWires)
    .set({ status: "scheduled", amlVerifiedAt: now })
    .where(eq(scheduledWires.id, target.row.id))
    .run();

  revalidatePath("/dashboard");
  return { ok: true, status: "scheduled" };
}

// ────────────────────────────────────────────────────────────────────────
// Status probe — lets the client re-read state after a redirect or refresh.
// ────────────────────────────────────────────────────────────────────────

export async function getTransferStateAction(
  referenceNumber: string
): Promise<
  | { ok: true; kind: "transfer" | "wire"; status: string }
  | { ok: false; message: string }
> {
  const user = await requireAuth();
  const target = await resolveByReference(referenceNumber, user.id);
  if (!target) return { ok: false, message: "Transfer not found." };
  return { ok: true, kind: target.kind, status: target.row.status };
}
