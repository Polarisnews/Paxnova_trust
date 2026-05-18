"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  accounts,
  applications,
  billPayments,
  cards,
  documents,
  scheduledWires,
  transactions,
  transfers,
  users,
} from "@/db/schema";
import { convert, getExchangeRate } from "@/lib/fx";
import {
  generateTransactions,
  type IndustryKey,
  type Style,
} from "@/lib/transaction-generator";
import { requireAdmin } from "@/lib/auth";
import { generateAccountNumber, hashPassword } from "@/lib/password";
import { deleteUploadsForOwner } from "@/lib/uploads";

export type AdminState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
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
      .set({
        status: "approved",
        reviewedAt: new Date(),
        // Persist the user link we resolved by email so the manage panel
        // (Reset password) can act on this application going forward.
        userId: userId ?? null,
      })
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

// ──────────────────────────────────────────────────────────────────────
// V2 status flow + Code/Custom payloads
// ──────────────────────────────────────────────────────────────────────

export type AccountStatusV2 = "active" | "frozen" | "code" | "custom";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0, no I/1/L
function randomCode(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export async function setAccountStatusV2Action(
  accountId: number,
  status: AccountStatusV2,
  payload?: { customMessage?: string }
): Promise<AdminState> {
  await requireAdmin();
  const update: Partial<typeof accounts.$inferInsert> = { status };
  if (status === "custom") {
    update.customMessage = (payload?.customMessage ?? "").trim() || null;
  }
  // Clear customMessage when leaving Custom so it doesn't linger.
  if (status !== "custom") {
    update.customMessage = null;
  }
  db.update(accounts).set(update).where(eq(accounts.id, accountId)).run();
  revalidatePath("/admin/accounts");
  return { ok: true, message: `Status set to ${status}.` };
}

export async function generateTcvCodeAction(
  accountId: number
): Promise<AdminState & { code?: string }> {
  await requireAdmin();
  const code = randomCode(10);
  db.update(accounts)
    .set({ tcvCode: code, tcvCodeGeneratedAt: new Date() })
    .where(eq(accounts.id, accountId))
    .run();
  revalidatePath("/admin/accounts");
  return { ok: true, message: "TCV code generated.", code };
}

export async function generateAmlCodeAction(
  accountId: number
): Promise<AdminState & { code?: string }> {
  await requireAdmin();
  const code = randomCode(12);
  db.update(accounts)
    .set({ amlCode: code, amlCodeGeneratedAt: new Date() })
    .where(eq(accounts.id, accountId))
    .run();
  revalidatePath("/admin/accounts");
  return { ok: true, message: "AML code generated.", code };
}

export async function setAccountCurrencyAction(
  accountId: number,
  currency: string
): Promise<AdminState> {
  await requireAdmin();
  const normalized = (currency ?? "").trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return { ok: false, message: "Pick a valid 3-letter currency code." };
  }

  const acct = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .get();
  if (!acct) return { ok: false, message: "Account not found." };

  const fromCurrency = acct.currency || "USD";
  if (fromCurrency === normalized) {
    return { ok: true, message: `Currency is already ${normalized}.` };
  }

  // Fetch FX rate (live with static fallback). This is the one async piece —
  // SQLite transactions below run synchronously.
  const fx = await getExchangeRate(fromCurrency, normalized);

  db.transaction(() => {
    // Account balance + credit limit.
    db.update(accounts)
      .set({
        balance: convert(acct.balance, fx.rate),
        creditLimit:
          acct.creditLimit != null ? convert(acct.creditLimit, fx.rate) : null,
        currency: normalized,
      })
      .where(eq(accounts.id, accountId))
      .run();

    // Re-denominate every transaction on this account so historical rows
    // display in the new currency. amount + balanceAfter.
    const txns = db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .all();
    for (const t of txns) {
      db.update(transactions)
        .set({
          amount: convert(t.amount, fx.rate),
          balanceAfter: convert(t.balanceAfter, fx.rate),
        })
        .where(eq(transactions.id, t.id))
        .run();
    }

    // Send-money transfers that drew from this account.
    const xfers = db
      .select()
      .from(transfers)
      .where(eq(transfers.fromAccountId, accountId))
      .all();
    for (const x of xfers) {
      db.update(transfers)
        .set({
          amount: convert(x.amount, fx.rate),
          fee: convert(x.fee, fx.rate),
        })
        .where(eq(transfers.id, x.id))
        .run();
    }

    // Scheduled wires drawing from this account (pending, approved, rejected).
    const wires = db
      .select()
      .from(scheduledWires)
      .where(eq(scheduledWires.fromAccountId, accountId))
      .all();
    for (const w of wires) {
      db.update(scheduledWires)
        .set({
          amount: convert(w.amount, fx.rate),
          fee: convert(w.fee, fx.rate),
        })
        .where(eq(scheduledWires.id, w.id))
        .run();
    }

    // Bill payments drawing from this account.
    const bills = db
      .select()
      .from(billPayments)
      .where(eq(billPayments.fromAccountId, accountId))
      .all();
    for (const b of bills) {
      db.update(billPayments)
        .set({ amount: convert(b.amount, fx.rate) })
        .where(eq(billPayments.id, b.id))
        .run();
    }
  });

  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: `Converted ${fromCurrency} → ${normalized} at ${fx.rate.toFixed(
      4
    )} (${fx.source === "live" ? "live" : "fallback"} rate).`,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Add transaction (replaces the legacy Adjust action in the UI)
// ──────────────────────────────────────────────────────────────────────

const addTxnSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  type: z.enum(["credit", "debit"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  counterpartyName: z.string().trim().min(1, "Required").max(120),
  counterpartyBank: z.string().trim().max(120).optional().or(z.literal("")),
  counterpartyAccountNumber: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  remark: z.string().trim().max(160).optional().or(z.literal("")),
});

export async function addAccountTransactionAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = addTxnSchema.safeParse({
    accountId: formData.get("accountId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    counterpartyName: formData.get("counterpartyName"),
    counterpartyBank: formData.get("counterpartyBank"),
    counterpartyAccountNumber: formData.get("counterpartyAccountNumber"),
    remark: formData.get("remark"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const p = i.path[0]?.toString();
      if (p && !fieldErrors[p]) fieldErrors[p] = i.message;
    }
    return { ok: false, message: "Check the fields.", fieldErrors };
  }
  const d = parsed.data;

  const acct = db.select().from(accounts).where(eq(accounts.id, d.accountId)).get();
  if (!acct) return { ok: false, message: "Account not found." };

  const signed = d.type === "credit" ? d.amount : -d.amount;
  const newBal = Number((acct.balance + signed).toFixed(2));

  const description =
    d.type === "credit"
      ? `Deposit from ${d.counterpartyName}`
      : `Withdrawal to ${d.counterpartyName}`;

  db.transaction(() => {
    db.update(accounts)
      .set({ balance: newBal })
      .where(eq(accounts.id, acct.id))
      .run();
    db.insert(transactions)
      .values({
        accountId: acct.id,
        type: d.type,
        amount: d.amount,
        description,
        category: d.type === "credit" ? "Deposit" : "Withdrawal",
        counterparty: d.counterpartyName,
        counterpartyBank: d.counterpartyBank || null,
        counterpartyAccountNumber: d.counterpartyAccountNumber || null,
        remark: d.remark || null,
        balanceAfter: newBal,
      })
      .run();
  });

  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard");
  return { ok: true, message: "Transaction posted." };
}

// ──────────────────────────────────────────────────────────────────────
// Generate transaction history — deterministic templates, no LLM call.
// ──────────────────────────────────────────────────────────────────────

const VALID_INDUSTRIES = [
  "plumbing",
  "construction",
  "retail",
  "restaurant",
  "tech-services",
  "personal",
] as const;
type ValidIndustry = (typeof VALID_INDUSTRIES)[number];

const generateHistorySchema = z.object({
  accountId: z.coerce.number().int().positive(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a from date"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a to date"),
  count: z.coerce.number().int().min(1).max(500),
  // `industries` is parsed manually from formData.getAll() because zod can't
  // pull array values out of a FormData object directly.
  style: z.enum(["business", "personal"]),
  seed: z.string().trim().max(60).optional().or(z.literal("")),
});

export type GenerateHistoryState = AdminState & {
  summary?: {
    generated: number;
    credits: number;
    debits: number;
    netChange: number;
    openingBalance: number;
    finalBalance: number;
  };
  /** Per-industry breakdown — count emitted from each selected industry. */
  perIndustry?: { industry: string; count: number }[];
};

export async function generateHistoryAction(
  _prev: GenerateHistoryState,
  formData: FormData
): Promise<GenerateHistoryState> {
  await requireAdmin();

  // Parse industries array from FormData (admin can pick 1–6 via checkbox UI).
  const rawIndustries = formData.getAll("industries").map(String);
  const industries = rawIndustries.filter((s): s is ValidIndustry =>
    (VALID_INDUSTRIES as readonly string[]).includes(s),
  );
  if (industries.length === 0) {
    return {
      ok: false,
      message: "Pick at least one industry.",
      fieldErrors: { industries: "Pick at least one industry" },
    };
  }
  if (industries.length > VALID_INDUSTRIES.length) {
    return {
      ok: false,
      message: "Too many industries selected.",
      fieldErrors: { industries: "Pick fewer industries" },
    };
  }

  const parsed = generateHistorySchema.safeParse({
    accountId: formData.get("accountId"),
    from: formData.get("from"),
    to: formData.get("to"),
    count: formData.get("count"),
    style: formData.get("style"),
    seed: formData.get("seed") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const p = i.path[0]?.toString();
      if (p && !fieldErrors[p]) fieldErrors[p] = i.message;
    }
    return { ok: false, message: "Check the inputs.", fieldErrors };
  }
  const d = parsed.data;

  const fromTime = new Date(`${d.from}T00:00:00`).getTime();
  const toTime = new Date(`${d.to}T23:59:59`).getTime();
  if (toTime <= fromTime) {
    return {
      ok: false,
      message: "'To' must be after 'From'.",
      fieldErrors: { to: "Pick a later date" },
    };
  }
  const spanDays = (toTime - fromTime) / (1000 * 60 * 60 * 24);
  if (spanDays < 7) {
    return {
      ok: false,
      message: "Date range must span at least a week.",
      fieldErrors: { to: "Range too short" },
    };
  }
  if (spanDays > 365 * 6) {
    return {
      ok: false,
      message: "Date range can't exceed 6 years.",
      fieldErrors: { to: "Range too long" },
    };
  }

  const acct = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, d.accountId))
    .get();
  if (!acct) return { ok: false, message: "Account not found." };

  const openingBalance = acct.balance;

  // Split the requested count across the selected industries. Earlier
  // industries get the remainder so totals always equal the requested count.
  const base = Math.floor(d.count / industries.length);
  const remainder = d.count - base * industries.length;
  const perIndustry: { industry: string; count: number }[] = [];
  const allRows: ReturnType<typeof generateTransactions>["rows"] = [];
  let runningBalance = openingBalance;
  let totalCredits = 0;
  let totalDebits = 0;

  for (let i = 0; i < industries.length; i++) {
    const chunkSize = base + (i < remainder ? 1 : 0);
    if (chunkSize === 0) {
      perIndustry.push({ industry: industries[i], count: 0 });
      continue;
    }
    const result = generateTransactions({
      accountId: d.accountId,
      industry: industries[i] as IndustryKey,
      style: d.style as Style,
      from: fromTime,
      to: toTime,
      count: chunkSize,
      openingBalance: runningBalance,
      isCreditAccount: acct.type === "credit",
      // Seed is varied per industry so two runs with the same seed still
      // give industry-specific output rather than identical rows.
      seed: d.seed ? `${d.seed}:${industries[i]}` : undefined,
    });
    allRows.push(...result.rows);
    runningBalance = result.finalBalance;
    totalCredits += result.totalCredits;
    totalDebits += result.totalDebits;
    perIndustry.push({
      industry: industries[i],
      count: result.rows.length,
    });
  }

  // Combine across industries, re-sort by `createdAt`, and recompute the
  // balance chain so balance_after stays accurate across the merged stream.
  allRows.sort((a, b) => {
    const ta = (a.createdAt as unknown as Date).getTime();
    const tb = (b.createdAt as unknown as Date).getTime();
    return ta - tb;
  });
  let rebal = openingBalance;
  for (const r of allRows) {
    rebal += r.type === "credit" ? r.amount : -r.amount;
    r.balanceAfter = Number(rebal.toFixed(2));
  }
  const finalBalance = Number(rebal.toFixed(2));

  db.transaction(() => {
    for (const row of allRows) {
      db.insert(transactions).values(row).run();
    }
    db.update(accounts)
      .set({ balance: finalBalance })
      .where(eq(accounts.id, d.accountId))
      .run();
  });

  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/accounts/${d.accountId}`);

  return {
    ok: true,
    message: `Generated ${allRows.length} transactions across ${industries.length} ${
      industries.length === 1 ? "industry" : "industries"
    }.`,
    summary: {
      generated: allRows.length,
      credits: Number(totalCredits.toFixed(2)),
      debits: Number(totalDebits.toFixed(2)),
      netChange: Number((totalCredits - totalDebits).toFixed(2)),
      openingBalance,
      finalBalance,
    },
    perIndustry,
  };
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
        counterparty: "Paxnova Trust Operations",
        balanceAfter: newBal,
      })
      .run();
  });

  revalidatePath("/admin/accounts");
  return { ok: true, message: "Balance adjusted." };
}

// ─── Backdate an account's open date ─────────────────────────────────
const backdateSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  openedAt: z.string().min(8), // YYYY-MM-DD or full ISO
});

export async function backdateAccountAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = backdateSchema.safeParse({
    accountId: formData.get("accountId"),
    openedAt: formData.get("openedAt"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Pick a valid date." };
  }
  const date = new Date(parsed.data.openedAt);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, message: "That date isn't valid." };
  }
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() > tomorrow.getTime()) {
    return { ok: false, message: "Open date can't be in the future." };
  }
  const acct = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, parsed.data.accountId))
    .get();
  if (!acct) return { ok: false, message: "Account not found." };

  db.update(accounts)
    .set({ createdAt: date })
    .where(eq(accounts.id, parsed.data.accountId))
    .run();

  revalidatePath("/admin/accounts");
  revalidatePath(`/admin/accounts/${parsed.data.accountId}`);
  revalidatePath(`/dashboard/accounts/${parsed.data.accountId}`);
  return {
    ok: true,
    message: `Open date set to ${date.toLocaleDateString()}.`,
  };
}

// ─── Update / delete a single transaction ────────────────────────────
const editTxSchema = z.object({
  transactionId: z.coerce.number().int().positive(),
  type: z.enum(["debit", "credit"]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().trim().min(1, "Required").max(200),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  counterparty: z.string().trim().max(160).optional().or(z.literal("")),
  createdAt: z.string().min(8),
});

export async function updateTransactionAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();
  const parsed = editTxSchema.safeParse({
    transactionId: formData.get("transactionId"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    description: formData.get("description"),
    category: formData.get("category"),
    counterparty: formData.get("counterparty"),
    createdAt: formData.get("createdAt"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const p = i.path[0]?.toString();
      if (p && !fieldErrors[p]) fieldErrors[p] = i.message;
    }
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors,
    };
  }
  const newDate = new Date(parsed.data.createdAt);
  if (Number.isNaN(newDate.getTime())) {
    return {
      ok: false,
      message: "Invalid date.",
      fieldErrors: { createdAt: "Pick a valid date" },
    };
  }
  const tx = db
    .select()
    .from(transactions)
    .where(eq(transactions.id, parsed.data.transactionId))
    .get();
  if (!tx) return { ok: false, message: "Transaction not found." };

  db.transaction(() => {
    db.update(transactions)
      .set({
        type: parsed.data.type,
        amount: Number(parsed.data.amount.toFixed(2)),
        description: parsed.data.description,
        category: parsed.data.category || null,
        counterparty: parsed.data.counterparty || null,
        createdAt: newDate,
      })
      .where(eq(transactions.id, tx.id))
      .run();
    rebalanceAccount(tx.accountId);
  });

  revalidatePath("/admin/accounts");
  revalidatePath(`/admin/accounts/${tx.accountId}`);
  revalidatePath(`/dashboard/accounts/${tx.accountId}`);
  revalidatePath(`/dashboard/transactions/${tx.id}`);
  return { ok: true, message: "Transaction updated everywhere." };
}

export async function deleteTransactionAction(
  transactionId: number
): Promise<AdminState> {
  await requireAdmin();
  const tx = db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .get();
  if (!tx) return { ok: false, message: "Transaction not found." };

  db.transaction(() => {
    db.delete(transactions).where(eq(transactions.id, transactionId)).run();
    rebalanceAccount(tx.accountId);
  });

  revalidatePath("/admin/accounts");
  revalidatePath(`/admin/accounts/${tx.accountId}`);
  revalidatePath(`/dashboard/accounts/${tx.accountId}`);
  return { ok: true, message: "Transaction deleted." };
}

/**
 * Replay every transaction for an account chronologically, fixing the
 * `balance_after` chain on every row and the account's current balance.
 * Call from inside a db.transaction() after any insert/update/delete.
 */
function rebalanceAccount(accountId: number): void {
  const all = db
    .select()
    .from(transactions)
    .where(eq(transactions.accountId, accountId))
    .all();
  all.sort((a, b) => {
    const ta = (a.createdAt as unknown as Date).getTime();
    const tb = (b.createdAt as unknown as Date).getTime();
    if (ta !== tb) return ta - tb;
    return a.id - b.id;
  });
  let running = 0;
  for (const t of all) {
    running += t.type === "credit" ? t.amount : -t.amount;
    const rounded = Number(running.toFixed(2));
    if (rounded !== t.balanceAfter) {
      db.update(transactions)
        .set({ balanceAfter: rounded })
        .where(eq(transactions.id, t.id))
        .run();
    }
  }
  db.update(accounts)
    .set({ balance: Number(running.toFixed(2)) })
    .where(eq(accounts.id, accountId))
    .run();
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

// ---------------------------------------------------------------------------
// Application management (edit / delete / reset linked user password)
// ---------------------------------------------------------------------------

const editApplicationSchema = z.object({
  id: z.coerce.number().int().positive(),
  applicantName: z.string().trim().min(1, "Required").max(160),
  applicantEmail: z.string().email("Invalid email"),
  applicantPhone: z.string().trim().max(40).optional().or(z.literal("")),
  product: z.enum([
    "checking",
    "savings",
    "credit-card",
    "mortgage",
    "business",
  ]),
  fundingAmount: z.coerce.number().min(0).max(50_000_000).optional(),
  fundingSource: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function editApplicationAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();

  const parsed = editApplicationSchema.safeParse({
    id: formData.get("id"),
    applicantName: formData.get("applicantName"),
    applicantEmail: formData.get("applicantEmail"),
    applicantPhone: formData.get("applicantPhone"),
    product: formData.get("product"),
    fundingAmount: formData.get("fundingAmount") || undefined,
    fundingSource: formData.get("fundingSource"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const p = i.path[0]?.toString();
      if (p && !fieldErrors[p]) fieldErrors[p] = i.message;
    }
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  const {
    id,
    applicantName,
    applicantEmail,
    applicantPhone,
    product,
    fundingAmount,
    fundingSource,
    notes,
  } = parsed.data;

  const existing = db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .get();
  if (!existing) return { ok: false, message: "Application not found." };

  db.update(applications)
    .set({
      applicantName,
      applicantEmail: applicantEmail.toLowerCase(),
      applicantPhone: applicantPhone || null,
      product,
      fundingAmount: fundingAmount ?? null,
      fundingSource: fundingSource || null,
      notes: notes || null,
    })
    .where(eq(applications.id, id))
    .run();

  revalidatePath("/admin/applications");
  return { ok: true, message: "Application updated." };
}

export async function deleteApplicationAction(
  applicationId: number
): Promise<AdminState> {
  await requireAdmin();
  const app = db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .get();
  if (!app) return { ok: false, message: "Application not found." };

  // FK on documents.applicationId is ON DELETE CASCADE, so the document rows
  // go away with the application. Files on disk we clean up explicitly.
  db.delete(applications).where(eq(applications.id, applicationId)).run();
  await deleteUploadsForOwner("applications", applicationId);

  revalidatePath("/admin/applications");
  return { ok: true, message: "Application deleted." };
}

const setPasswordSchema = z.object({
  userId: z.coerce.number().int().positive(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
});

export async function setUserPasswordAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  await requireAdmin();

  const parsed = setPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const p = i.path[0]?.toString();
      if (p && !fieldErrors[p]) fieldErrors[p] = i.message;
    }
    return {
      ok: false,
      message: "Password didn't meet requirements.",
      fieldErrors,
    };
  }

  const target = db
    .select()
    .from(users)
    .where(eq(users.id, parsed.data.userId))
    .get();
  if (!target) return { ok: false, message: "User not found." };

  const passwordHash = await hashPassword(parsed.data.password);
  db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, parsed.data.userId))
    .run();

  revalidatePath("/admin/users");
  return {
    ok: true,
    message: `Password reset for ${target.email}.`,
  };
}
