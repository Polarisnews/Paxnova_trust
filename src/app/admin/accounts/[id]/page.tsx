import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft, CalendarDays, ShieldCheck, UserCircle2 } from "lucide-react";
import { db } from "@/db";
import { accounts, transactions, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { currency, formatDate, maskAccount } from "@/lib/format";
import { AccountDetailClient } from "./AccountDetailClient";

export const metadata: Metadata = {
  title: "Account · Admin",
};

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/15 text-success",
  frozen: "bg-orange-500/15 text-orange-500",
  code: "bg-violet-500/15 text-violet-500",
  custom: "bg-gold-500/15 text-gold-700 dark:text-gold-300",
  pending: "bg-muted text-muted-foreground",
  closed: "bg-danger/15 text-danger",
};

export default async function AdminAccountDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await props.params;
  const accountId = Number(id);
  if (!Number.isFinite(accountId)) notFound();

  const account = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, accountId))
    .get();
  if (!account) notFound();

  const owner = account.userId
    ? db.select().from(users).where(eq(users.id, account.userId)).get()
    : null;

  const tx = db
    .select()
    .from(transactions)
    .where(eq(transactions.accountId, accountId))
    .orderBy(desc(transactions.createdAt))
    .all();

  // Serialize timestamps to ISO strings so the client component never has
  // to deal with Drizzle's Date objects re-serializing across the boundary.
  const txSerialized = tx.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    description: t.description,
    category: t.category ?? "",
    counterparty: t.counterparty ?? "",
    balanceAfter: t.balanceAfter,
    referenceNumber: t.referenceNumber ?? null,
    createdAtIso: (t.createdAt as unknown as Date).toISOString(),
  }));

  const totals = tx.reduce(
    (s, t) => {
      if (t.type === "credit") s.credits += t.amount;
      else s.debits += t.amount;
      return s;
    },
    { credits: 0, debits: 0 },
  );

  const openedAtIso = (account.createdAt as unknown as Date).toISOString();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/admin/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All accounts
      </Link>

      {/* Account header */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                  (STATUS_STYLE[account.status] ?? STATUS_STYLE.active)
                }
              >
                <ShieldCheck className="size-3" />
                {account.status}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {account.type}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {account.currency || "USD"}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {account.name}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {maskAccount(account.accountNumber)}
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <UserCircle2 className="size-4" />
              {owner ? (
                <>
                  {owner.firstName} {owner.lastName}
                  <span className="text-muted-foreground/60">·</span>
                  <a
                    href={`mailto:${owner.email}`}
                    className="text-violet-500 hover:text-violet-600"
                  >
                    {owner.email}
                  </a>
                </>
              ) : (
                <span>No owner on file</span>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Current balance
            </p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
              {currency(account.balance, account.currency || "USD")}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="-mt-0.5 mr-1 inline size-3" />
              Opened {formatDate(account.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-border p-6 sm:grid-cols-3">
          <Stat
            label="Total credits"
            value={currency(totals.credits, account.currency || "USD")}
            tone="success"
          />
          <Stat
            label="Total debits"
            value={currency(totals.debits, account.currency || "USD")}
            tone="muted"
          />
          <Stat
            label="Transactions"
            value={tx.length.toLocaleString()}
            tone="muted"
          />
        </div>
      </section>

      <AccountDetailClient
        accountId={account.id}
        accountCurrency={account.currency || "USD"}
        openedAtIso={openedAtIso}
        transactions={txSerialized}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "muted";
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={
          "mt-1 font-display text-lg font-semibold tabular-nums " +
          (tone === "success" ? "text-success" : "text-foreground")
        }
      >
        {value}
      </p>
    </div>
  );
}
