import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Search,
  Send,
  Tag,
} from "lucide-react";
import { db } from "@/db";
import { billPayments, payees } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { currency } from "@/lib/format";

export const metadata: Metadata = { title: "Manage payees" };

export default async function PayeesPage(props: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const user = await requireAuth();
  const { category, q = "" } = await props.searchParams;

  const allPayees = db
    .select()
    .from(payees)
    .where(eq(payees.userId, user.id))
    .all();

  // Pull all bill payments for the user to compute per-payee aggregates
  // (count + most recent date + sum paid in last 90 days). One query, then
  // we index by payeeId.
  const allPayments = db
    .select()
    .from(billPayments)
    .where(eq(billPayments.userId, user.id))
    .orderBy(desc(billPayments.scheduledDate))
    .all();

  type Agg = { count: number; lastDate: number | null; sum90: number };
  const byPayee = new Map<number, Agg>();
  const ninetyAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  for (const p of allPayments) {
    const a = byPayee.get(p.payeeId) ?? { count: 0, lastDate: null, sum90: 0 };
    a.count++;
    const ts = (p.scheduledDate as unknown as Date).getTime();
    if (a.lastDate == null || ts > a.lastDate) a.lastDate = ts;
    if (p.status === "paid" && ts >= ninetyAgo) a.sum90 += p.amount;
    byPayee.set(p.payeeId, a);
  }

  // Filter
  const lcQ = q.trim().toLowerCase();
  const filtered = allPayees.filter((p) => {
    if (category && (p.category ?? "Other") !== category) return false;
    if (lcQ) {
      const hay = `${p.name} ${p.nickname ?? ""} ${p.category ?? ""}`.toLowerCase();
      if (!hay.includes(lcQ)) return false;
    }
    return true;
  });

  // Group by category, alpha-sort within
  const groups = new Map<string, typeof allPayees>();
  for (const p of filtered) {
    const cat = p.category ?? "Other";
    const arr = groups.get(cat) ?? [];
    arr.push(p);
    groups.set(cat, arr);
  }
  const groupList = Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([cat, list]) =>
        [
          cat,
          list.sort((a, b) =>
            (a.nickname ?? a.name).localeCompare(b.nickname ?? b.name),
          ),
        ] as const,
    );

  // All categories for the filter row
  const allCategories = Array.from(
    new Set(allPayees.map((p) => p.category ?? "Other")),
  )
    .sort()
    .map((cat) => ({
      cat,
      count: allPayees.filter((p) => (p.category ?? "Other") === cat).length,
    }));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/dashboard/pay-bills"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Pay Bills
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Bill pay
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Manage payees
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {allPayees.length} payees grouped across {allCategories.length}{" "}
            categories. Tap any payee to see its full payment history.
          </p>
        </div>
        <Link
          href="/dashboard/pay-bills/pay"
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600"
        >
          <Send className="size-4" />
          Pay a bill
        </Link>
      </header>

      {/* Filter / search */}
      <form
        method="get"
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search payees by name, nickname, or category"
            className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          />
        </div>
        {category && (
          <input type="hidden" name="category" value={category} readOnly />
        )}
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-700"
        >
          Search
        </button>
      </form>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={{
            pathname: "/dashboard/pay-bills/payees",
            query: q ? { q } : {},
          }}
          className={
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition " +
            (!category
              ? "border-violet-500 bg-violet-500 text-white"
              : "border-border bg-card hover:bg-muted")
          }
        >
          <Tag className="size-3" />
          All
          <span
            className={
              "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums " +
              (!category
                ? "bg-white/25 text-white"
                : "bg-muted text-muted-foreground")
            }
          >
            {allPayees.length}
          </span>
        </Link>
        {allCategories.map(({ cat, count }) => {
          const active = category === cat;
          return (
            <Link
              key={cat}
              href={{
                pathname: "/dashboard/pay-bills/payees",
                query: { category: cat, ...(q ? { q } : {}) },
              }}
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition " +
                (active
                  ? "border-violet-500 bg-violet-500 text-white"
                  : "border-border bg-card hover:bg-muted")
              }
            >
              {cat}
              <span
                className={
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums " +
                  (active
                    ? "bg-white/25 text-white"
                    : "bg-muted text-muted-foreground")
                }
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Groups */}
      {groupList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No payees match this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {groupList.map(([cat, list]) => (
            <section
              key={cat}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <header className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                <p className="font-display text-sm font-semibold uppercase tracking-wider text-violet-500">
                  {cat}
                </p>
                <p className="text-xs text-muted-foreground">
                  {list.length} payee{list.length === 1 ? "" : "s"}
                </p>
              </header>
              <ul className="divide-y divide-border">
                {list.map((p) => {
                  const agg = byPayee.get(p.id);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/dashboard/pay-bills/payees/${p.id}`}
                        className="flex items-center gap-3 px-5 py-3 transition hover:bg-muted/40"
                      >
                        <span
                          aria-hidden
                          className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted font-display text-sm font-semibold text-foreground/70"
                        >
                          {(p.nickname ?? p.name)[0].toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {p.nickname ?? p.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.name} · {p.accountNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs font-semibold">
                            {agg ? currency(agg.sum90, "USD") : "—"}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Paid · 90d
                          </p>
                        </div>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
