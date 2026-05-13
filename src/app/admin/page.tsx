import Link from "next/link";
import { count, eq, sql } from "drizzle-orm";
import { ArrowUpRight, FileCheck, TrendingUp, Users, Wallet } from "lucide-react";
import { db } from "@/db";
import { accounts, applications, transactions, users } from "@/db/schema";
import { currency } from "@/lib/format";

export default async function AdminOverview() {
  const usersCount = db.select({ c: count() }).from(users).get()?.c ?? 0;
  const accountsCount = db.select({ c: count() }).from(accounts).get()?.c ?? 0;
  const pendingApps =
    db
      .select({ c: count() })
      .from(applications)
      .where(eq(applications.status, "pending"))
      .get()?.c ?? 0;

  const totalAssetsRow = db
    .select({ s: sql<number>`coalesce(sum(${accounts.balance}), 0)` })
    .from(accounts)
    .where(sql`${accounts.type} != 'credit'`)
    .get();
  const totalAssets = Number(totalAssetsRow?.s ?? 0);

  const recentTx = db
    .select()
    .from(transactions)
    .orderBy(sql`${transactions.createdAt} desc`)
    .limit(8)
    .all();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Operations
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Overview
        </h1>
        <p className="text-sm text-muted-foreground">
          Live state of the bank — users, accounts under management, and the work queue.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Customers"
          value={String(usersCount)}
          href="/admin/users"
        />
        <StatCard
          icon={Wallet}
          label="Open accounts"
          value={String(accountsCount)}
          href="/admin/accounts"
        />
        <StatCard
          icon={FileCheck}
          label="Pending applications"
          value={String(pendingApps)}
          href="/admin/applications"
          accent={pendingApps > 0}
        />
        <StatCard
          icon={TrendingUp}
          label="Deposits under management"
          value={currency(totalAssets, { maximumFractionDigits: 0 })}
        />
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Latest transactions</h2>
          <Link
            href="/admin/accounts"
            className="text-xs font-medium text-violet-500 hover:text-violet-600"
          >
            View all accounts
          </Link>
        </div>
        {recentTx.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {recentTx.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{t.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category ?? "—"} · Account #{t.accountId}
                  </p>
                </div>
                <p
                  className={`font-mono ${t.type === "credit" ? "text-success" : ""}`}
                >
                  {t.type === "credit" ? "+" : "−"}
                  {currency(t.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  accent?: boolean;
}) {
  const body = (
    <>
      <span className={`inline-flex size-9 items-center justify-center rounded-lg ${accent ? "bg-gold-500/15 text-gold-700 dark:text-gold-300" : "bg-violet-500/10 text-violet-500"}`}>
        <Icon className="size-4" />
      </span>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
      {href && (
        <span className="absolute right-4 top-4 text-muted-foreground">
          <ArrowUpRight className="size-4" />
        </span>
      )}
    </>
  );

  return href ? (
    <Link
      href={href}
      className="relative rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      {body}
    </Link>
  ) : (
    <div className="relative rounded-2xl border border-border bg-card p-5">{body}</div>
  );
}
