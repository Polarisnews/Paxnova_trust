// Seeds Paxnova Trust payees + 12 months of realistic payment history for
// any user. Idempotent — running multiple times will not duplicate payees.
//
// The audience is auto-detected from the user's accounts: any "business"
// account → seed the business vendor set; any other account → seed the
// personal set. Users with both get both sets.

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, billPayments, payees } from "@/db/schema";
import {
  getCatalogFor,
  type PayeeAudience,
  type PayeeTemplate,
  type VariancePattern,
} from "@/lib/payee-catalog";

export type SeedResult = {
  payeesAdded: number;
  paymentsAdded: number;
  audiences: PayeeAudience[];
};

/**
 * Detects which catalogs apply to a user based on their account types.
 * Business accounts → business vendors. Anything else → personal payees.
 */
function detectAudiences(userId: number): PayeeAudience[] {
  const rows = db
    .select({ type: accounts.type })
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .all();
  if (rows.length === 0) return ["personal"]; // no accounts yet — seed personal anyway
  const out = new Set<PayeeAudience>();
  for (const r of rows) {
    if (r.type === "business") out.add("business");
    else out.add("personal");
  }
  return Array.from(out);
}

/**
 * Picks a deterministic-ish "primary funding account" for bill payments.
 * Prefers a checking account, falls back to savings, then anything.
 */
function pickFundingAccountId(userId: number): number | null {
  const ownAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .all();
  if (ownAccounts.length === 0) return null;
  const checking = ownAccounts.find((a) => a.type === "checking");
  if (checking) return checking.id;
  const savings = ownAccounts.find((a) => a.type === "savings");
  if (savings) return savings.id;
  return ownAccounts[0].id;
}

/**
 * Generate a stable, USA-style ACH-looking account number for a payee
 * built from the brand name + user id. Deterministic across runs so re-
 * seeding doesn't generate a different number for the same payee.
 */
function fakeAccountNumber(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const right8 = (h >>> 0).toString().padStart(10, "0").slice(-8);
  // Format as XXXX-XXXX
  return right8.slice(0, 4) + "-" + right8.slice(4);
}

/** Mulberry32 PRNG — deterministic from a seed, no external dep. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * For a given month (0–11) and variance pattern, return the multiplier we
 * apply to the base amount. Seasonal-utility peaks in mid-winter and
 * mid-summer, dips in shoulder months — matches real PG&E / Con Ed bills.
 */
const SEASONAL_FACTORS = [
  1.45, 1.4, 1.1, 0.85, 0.75, 0.85, 1.3, 1.35, 1.0, 0.8, 0.9, 1.3,
];

function variedAmount(
  template: PayeeTemplate,
  monthIndex: number, // 0–11 (calendar month, not "months ago")
  rng: () => number,
): number {
  const base = template.baseAmount;
  switch (template.variancePattern) {
    case "flat": {
      // ±2% noise so amounts aren't suspiciously identical
      const noise = (rng() - 0.5) * 0.04;
      return round2(base * (1 + noise));
    }
    case "seasonal-utility": {
      const factor = SEASONAL_FACTORS[monthIndex];
      const noise = (rng() - 0.5) * 0.1; // ±5%
      return round2(base * factor * (1 + noise));
    }
    case "variable": {
      const pct = template.variancePct ?? 0.4;
      const factor = 1 + (rng() - 0.5) * 2 * pct;
      return round2(Math.max(base * 0.1, base * factor));
    }
    case "annual": {
      // Annual payments are emitted once per year — caller decides
      return round2(base);
    }
    default:
      return round2(base);
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function pickPaymentDay(
  range: [number, number],
  rng: () => number,
): number {
  const [lo, hi] = range;
  if (lo === hi) return lo;
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/**
 * Generate one bill_payments row per month, going back 12 months and
 * including the current month. Most rows are "paid"; the row for the
 * upcoming due date in the current month may be "scheduled"; 1 in ~30 is
 * a "failed" payment so the demo shows realistic error states.
 */
function generateHistory(
  userId: number,
  payeeId: number,
  fromAccountId: number,
  template: PayeeTemplate,
  rng: () => number,
): Array<typeof billPayments.$inferInsert> {
  const day = pickPaymentDay(template.paymentDayRange, rng);
  const now = new Date();
  const rows: Array<typeof billPayments.$inferInsert> = [];
  const cadenceMonths = template.cadenceMonths ?? 1;

  for (let monthsBack = 12; monthsBack >= 0; monthsBack -= cadenceMonths) {
    const d = new Date(
      now.getFullYear(),
      now.getMonth() - monthsBack,
      Math.min(day, 28),
    );
    const monthIdx = d.getMonth();
    const amount = variedAmount(template, monthIdx, rng);

    // Annual variance pattern only emits once — anchor to January
    if (template.variancePattern === "annual" && d.getMonth() !== 0) continue;

    let status: "scheduled" | "paid" | "failed";
    if (d.getTime() > now.getTime()) {
      status = "scheduled";
    } else if (rng() < 1 / 30) {
      status = "failed";
    } else {
      status = "paid";
    }

    rows.push({
      userId,
      payeeId,
      fromAccountId,
      amount,
      scheduledDate: d,
      status,
      memo: null,
      createdAt: d,
    });
  }
  return rows;
}

/**
 * Main entry. Idempotent — re-running on a user only adds payees and
 * payments for templates not already present.
 */
export function seedPayeesForUser(
  userId: number,
  opts?: { audiences?: PayeeAudience[] },
): SeedResult {
  const audiences = opts?.audiences ?? detectAudiences(userId);
  const fromAccountId = pickFundingAccountId(userId);

  const existingPayees = db
    .select({ name: payees.name })
    .from(payees)
    .where(eq(payees.userId, userId))
    .all();
  const have = new Set(existingPayees.map((p) => p.name.toLowerCase()));

  let payeesAdded = 0;
  let paymentsAdded = 0;

  const seedSeed = userId * 73856093; // stable per-user PRNG seed

  db.transaction(() => {
    for (const audience of audiences) {
      const catalog = getCatalogFor(audience);
      for (let i = 0; i < catalog.length; i++) {
        const tpl = catalog[i];
        if (have.has(tpl.name.toLowerCase())) continue;

        const rng = mulberry32(seedSeed + i * 977);

        const inserted = db
          .insert(payees)
          .values({
            userId,
            name: tpl.name,
            nickname: tpl.nickname ?? null,
            accountNumber: fakeAccountNumber(`${userId}:${tpl.name}`),
            category: tpl.category,
            payeeType: tpl.payeeType,
            preferredMethod: tpl.preferredMethod ?? "ach",
            accountType: "checking",
            routingNumber: "021000021",
            bankName: tpl.payeeType === "external-bank" ? null : "Pass-through",
          })
          .returning({ id: payees.id })
          .all();
        const newPayeeId = inserted[0]?.id;
        if (!newPayeeId) continue;

        payeesAdded++;

        if (fromAccountId) {
          const history = generateHistory(
            userId,
            newPayeeId,
            fromAccountId,
            tpl,
            rng,
          );
          for (const row of history) {
            db.insert(billPayments).values(row).run();
          }
          paymentsAdded += history.length;
        }
      }
    }
  });

  return { payeesAdded, paymentsAdded, audiences };
}

/**
 * Seed every user that exists today. Used by the one-time migration. Safe
 * to call repeatedly — `seedPayeesForUser` is idempotent.
 */
export function seedAllUsers(): {
  users: number;
  payeesAdded: number;
  paymentsAdded: number;
} {
  const all = db.select({ id: accounts.userId }).from(accounts).all();
  const uniqueUserIds = Array.from(new Set(all.map((r) => r.id)));
  let payeesAdded = 0;
  let paymentsAdded = 0;
  for (const uid of uniqueUserIds) {
    const res = seedPayeesForUser(uid);
    payeesAdded += res.payeesAdded;
    paymentsAdded += res.paymentsAdded;
  }
  return {
    users: uniqueUserIds.length,
    payeesAdded,
    paymentsAdded,
  };
}
