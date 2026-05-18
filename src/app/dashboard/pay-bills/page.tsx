import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  ListFilter,
  Send,
  Tag,
  XCircle,
} from "lucide-react";
import { db } from "@/db";
import { accounts, billPayments, payees } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { currency, formatDate, formatRelative } from "@/lib/format";

export const metadata: Metadata = { title: "Pay bills" };

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-success/15 text-success",
  scheduled: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  failed: "bg-danger/15 text-danger",
  cancelled: "bg-muted text-muted-foreground",
};
const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> =
  {
    paid: CheckCircle2,
    scheduled: Clock,
    failed: XCircle,
    cancelled: XCircle,
  };

export default async function PayBillsPage() {
  const user = await requireAuth();

  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();
  const userPayees = db
    .select()
    .from(payees)
    .where(eq(payees.userId, user.id))
    .all();

  const allPayments = db
    .select()
    .from(billPayments)
    .where(eq(billPayments.userId, user.id))
    .orderBy(desc(billPayments.scheduledDate))
    .all();

  // Index payee by id for fast lookup.
  const payeeById = new Map(userPayees.map((p) => [p.id, p]));
  const accountById = new Map(userAccounts.map((a) => [a.id, a]));

  // Upcoming (scheduled, future or today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = allPayments
    .filter(
      (p) =>
        p.status === "scheduled" &&
        (p.scheduledDate as unknown as Date).getTime() >= today.getTime(),
    )
    .slice(0, 5);

  const recent = allPayments
    .filter((p) => p.status === "paid" || p.status === "failed")
    .slice(0, 8);

  // Group payee count by category for the chip row.
  const categoryCount = new Map<string, number>();
  for (const p of userPayees) {
    const cat = p.category ?? "Other";
    categoryCount.set(cat, (categoryCount.get(cat) ?? 0) + 1);
  }
  const categories = Array.from(categoryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // 30-day total paid
  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const last30 = allPayments
    .filter(
      (p) =>
        p.status === "paid" &&
        (p.scheduledDate as unknown as Date).getTime() >= thirtyAgo.getTime(),
    )
    .reduce((s, p) => s + p.amount, 0);

  const primaryCurrency =
    userAccounts.find((a) => a.type !== "credit")?.currency || "USD";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Bill pay
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Pay bills &amp; manage payees
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {userPayees.length} payee{userPayees.length === 1 ? "" : "s"} on
            file across {categories.length} categor
            {categories.length === 1 ? "y" : "ies"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/pay-bills/payees"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
          >
            <ListFilter className="size-4" />
            Manage payees
          </Link>
          <Link
            href="/dashboard/pay-bills/pay"
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600"
          >
            <Send className="size-4" />
            Pay a bill
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Paid in the last 30 days"
          value={currency(last30, primaryCurrency)}
        />
        <Stat
          label="Upcoming this month"
          value={upcoming.length.toString()}
        />
        <Stat
          label="Payment history (lifetime)"
          value={allPayments.length.toLocaleString()}
        />
      </section>

      {/* Category chips */}
      {categories.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Browse by category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map(([cat, count]) => (
              <Link
                key={cat}
                href={`/dashboard/pay-bills/payees?category=${encodeURIComponent(cat)}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:border-violet-500/40 hover:bg-violet-500/8"
              >
                <Tag className="size-3 text-violet-500" />
                {cat}
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Two columns: upcoming + recent */}
      <section className="grid gap-5 lg:grid-cols-2">
        {/* Upcoming */}
        <div className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <p className="font-display text-base font-semibold">
              Upcoming payments
            </p>
            <Link
              href="/dashboard/pay-bills/pay"
              className="text-xs font-semibold text-violet-500 hover:text-violet-600"
            >
              Schedule one →
            </Link>
          </header>
          {upcoming.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No payments scheduled. Tap{" "}
              <strong className="text-foreground">Pay a bill</strong> to
              schedule one.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((p) => {
                const payee = payeeById.get(p.payeeId);
                const acct = accountById.get(p.fromAccountId);
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                      <Calendar className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {payee?.name ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(p.scheduledDate)} · from{" "}
                        {acct?.name ?? "—"}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-semibold">
                      {currency(p.amount, acct?.currency ?? "USD")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent */}
        <div className="rounded-2xl border border-border bg-card">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <p className="font-display text-base font-semibold">
              Recent activity
            </p>
            <Link
              href="/dashboard/pay-bills/payees"
              className="text-xs font-semibold text-violet-500 hover:text-violet-600"
            >
              All payees →
            </Link>
          </header>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No paid bills yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((p) => {
                const payee = payeeById.get(p.payeeId);
                const acct = accountById.get(p.fromAccountId);
                const Icon = STATUS_ICON[p.status] ?? Clock;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/pay-bills/receipt/${p.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition hover:bg-muted/40"
                    >
                      <span
                        className={
                          "inline-flex size-9 shrink-0 items-center justify-center rounded-lg " +
                          (STATUS_STYLE[p.status] ?? STATUS_STYLE.scheduled)
                        }
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {payee?.name ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelative(p.scheduledDate)} ·{" "}
                          <span
                            className={
                              p.status === "failed" ? "text-danger" : ""
                            }
                          >
                            {p.status}
                          </span>
                        </p>
                      </div>
                      <p className="font-mono text-sm font-semibold">
                        {currency(p.amount, acct?.currency ?? "USD")}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}
