import type { Metadata } from "next";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { StatementsList, type StatementEntry } from "./StatementsList";

export const metadata: Metadata = { title: "Statements" };
export const dynamic = "force-dynamic";

export default async function StatementsPage() {
  const user = await requireAuth();
  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();

  const acctIds = userAccounts.map((a) => a.id);
  const allTxns =
    acctIds.length > 0
      ? db
          .select()
          .from(transactions)
          .where(inArray(transactions.accountId, acctIds))
          .orderBy(asc(transactions.createdAt))
          .all()
      : [];

  // Build per-account, per-(year, month) statement entries.
  const sections: {
    account: (typeof userAccounts)[number];
    entries: StatementEntry[];
  }[] = [];

  for (const account of userAccounts) {
    const txns = allTxns.filter((t) => t.accountId === account.id);
    const months = new Map<string, StatementEntry>();

    let runningPrior = 0; // balance just before the earliest txn

    for (let i = 0; i < txns.length; i++) {
      const t = txns[i];
      const createdMs =
        typeof t.createdAt === "number"
          ? t.createdAt * 1000
          : t.createdAt.getTime();
      const d = new Date(createdMs);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;

      const delta = t.type === "credit" ? t.amount : -t.amount;
      // Opening balance for this transaction = balanceAfter - delta.
      const balanceBefore = Number((t.balanceAfter - delta).toFixed(2));
      if (i === 0) runningPrior = balanceBefore;

      const existing = months.get(key);
      if (!existing) {
        months.set(key, {
          year: d.getUTCFullYear(),
          month: d.getUTCMonth() + 1,
          openingBalance: balanceBefore,
          closingBalance: t.balanceAfter,
          transactions: [
            {
              createdAt: createdMs,
              type: t.type,
              amount: t.amount,
              description: t.description,
              balanceAfter: t.balanceAfter,
            },
          ],
        });
      } else {
        existing.closingBalance = t.balanceAfter;
        existing.transactions.push({
          createdAt: createdMs,
          type: t.type,
          amount: t.amount,
          description: t.description,
          balanceAfter: t.balanceAfter,
        });
      }
    }

    // Months in reverse chronological order.
    const entries = Array.from(months.values()).sort(
      (a, b) => b.year * 12 + b.month - (a.year * 12 + a.month)
    );

    void runningPrior; // intentionally tracked but not exposed
    sections.push({ account, entries });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Documents
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Statements
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Download monthly statements as PDF for any of your accounts. Only
          months with activity are listed.
        </p>
      </header>

      {sections.map(({ account, entries }) => (
        <section key={account.id} className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-display text-lg font-semibold">
              {account.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Opened {formatDate(account.createdAt)}
            </p>
          </div>
          {entries.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground">
              No activity yet — statements will appear once transactions post.
            </p>
          ) : (
            <StatementsList
              entries={entries}
              account={{
                name: account.name,
                accountNumber: account.accountNumber,
                accountType: account.type,
                accountCurrency: account.currency || "USD",
                routingNumber: account.routingNumber,
              }}
            />
          )}
        </section>
      ))}

      {sections.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You don&apos;t have any accounts yet.
        </p>
      )}
    </div>
  );
}
