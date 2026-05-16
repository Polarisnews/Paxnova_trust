import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { currency, formatRelative, maskAccount } from "@/lib/format";

export default async function AccountDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await requireAuth();
  const accountId = Number(id);
  if (!Number.isFinite(accountId)) notFound();

  const account = db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, user.id)))
    .get();
  if (!account) notFound();

  const tx = db
    .select()
    .from(transactions)
    .where(eq(transactions.accountId, account.id))
    .orderBy(desc(transactions.createdAt))
    .all();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {account.type === "credit" ? "Credit card" : "Account"}
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{account.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {maskAccount(account.accountNumber)} · Routing {account.routingNumber}
        </p>
      </header>

      <div className="rounded-2xl bg-navy-900 p-8 text-white shadow-elev">
        <p className="text-xs uppercase tracking-wider text-white/60">
          {account.type === "credit" ? "Current balance" : "Available balance"}
        </p>
        <p className="mt-1 font-display text-4xl font-semibold tracking-tight">
          {currency(account.balance, account.currency || "USD")}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wider text-white/50">
          {account.currency || "USD"}
        </p>
        {account.apy != null && account.type !== "credit" && (
          <p className="mt-2 text-sm text-gold-300">Earning {account.apy}% APY</p>
        )}
        {account.creditLimit != null && (
          <p className="mt-2 text-sm text-white/70">
            Credit limit {currency(account.creditLimit, account.currency || "USD")} ·
            Available{" "}
            {currency(account.creditLimit + account.balance, account.currency || "USD")}
          </p>
        )}
      </div>

      <section className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Activity</h2>
        </div>
        {tx.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">
            No transactions on this account yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {tx.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/transactions/${t.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-muted/50"
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
                        {t.category ?? "—"} · {formatRelative(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-mono text-sm font-semibold ${
                        t.type === "credit" ? "text-success" : ""
                      }`}
                    >
                      {t.type === "credit" ? "+" : "−"}
                      {currency(t.amount, account.currency || "USD")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Bal {currency(t.balanceAfter, account.currency || "USD")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
