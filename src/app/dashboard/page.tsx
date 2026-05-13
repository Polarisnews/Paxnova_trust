import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { currency, formatRelative, maskAccount } from "@/lib/format";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  business: TrendingUp,
};

export default async function DashboardHome() {
  const user = await requireAuth();
  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();

  const accountIds = userAccounts.map((a) => a.id);
  const recentTx = accountIds.length
    ? db
        .select()
        .from(transactions)
        .where(inArray(transactions.accountId, accountIds))
        .orderBy(desc(transactions.createdAt))
        .limit(10)
        .all()
    : [];

  const totalAssets = userAccounts
    .filter((a) => a.type !== "credit")
    .reduce((s, a) => s + a.balance, 0);
  const totalCredit = userAccounts
    .filter((a) => a.type === "credit")
    .reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets + totalCredit;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Net position
        </p>
        <p className="font-display text-4xl font-semibold tracking-tight">
          {currency(netWorth)}
        </p>
        <p className="text-sm text-muted-foreground">
          Assets {currency(totalAssets)} · Credit balance {currency(totalCredit)}
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {userAccounts.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any accounts yet.
            </p>
            <Link
              href="/personal/checking"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-500"
            >
              <Plus className="size-4" /> Open your first account
            </Link>
          </div>
        )}

        {userAccounts.map((a) => {
          const Icon = ICONS[a.type] ?? Wallet;
          const isCredit = a.type === "credit";
          return (
            <Link
              key={a.id}
              href={`/dashboard/accounts/${a.id}`}
              className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div className="inline-flex size-10 items-center justify-center rounded-lg bg-navy-900 text-white">
                  <Icon className="size-4" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {maskAccount(a.accountNumber)}
                </span>
              </div>
              <p className="mt-5 text-sm font-medium text-muted-foreground">
                {a.name}
              </p>
              <p
                className={`mt-1 font-display text-2xl font-semibold tracking-tight ${
                  isCredit && a.balance < 0 ? "text-foreground" : ""
                }`}
              >
                {currency(a.balance)}
              </p>
              {a.apy != null && a.type !== "credit" && (
                <p className="mt-1 text-xs text-violet-500">{a.apy}% APY</p>
              )}
              {isCredit && a.creditLimit && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {currency(a.creditLimit + a.balance)} available of {currency(a.creditLimit)}
                </p>
              )}
            </Link>
          );
        })}

        <Link
          href="/personal/savings"
          className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-sm font-medium text-muted-foreground hover:border-violet-500 hover:text-violet-500"
        >
          <Plus className="mr-1.5 size-4" /> Open new account
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
            <Link
              href="/dashboard/statements"
              className="text-xs font-medium text-violet-500 hover:text-violet-600"
            >
              View statements
            </Link>
          </div>
          {recentTx.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentTx.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full ${
                        t.type === "credit"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.type === "credit" ? (
                        <ArrowDownLeft className="size-4" />
                      ) : (
                        <ArrowUpRight className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {t.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.category ?? "Transaction"} · {formatRelative(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`shrink-0 font-mono text-sm font-semibold ${
                      t.type === "credit" ? "text-success" : ""
                    }`}
                  >
                    {t.type === "credit" ? "+" : "−"}
                    {currency(t.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard/transfer"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition hover:shadow-soft"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
              <TrendingUp className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Transfer money</p>
              <p className="text-xs text-muted-foreground">
                Between your accounts, instantly
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/pay-bills"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition hover:shadow-soft"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-gold-500/15 text-gold-700 dark:text-gold-300">
              <Wallet className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Pay a bill</p>
              <p className="text-xs text-muted-foreground">
                Schedule or send to a payee
              </p>
            </div>
          </Link>
          <Link
            href="/dashboard/cards"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 transition hover:shadow-soft"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-navy-900 text-white">
              <CreditCard className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Manage cards</p>
              <p className="text-xs text-muted-foreground">
                Freeze, set limits, view PIN
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
