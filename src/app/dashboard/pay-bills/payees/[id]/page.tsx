import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Send,
  Tag,
  XCircle,
} from "lucide-react";
import { db } from "@/db";
import { accounts, billPayments, payees } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { currency, formatDate, formatRelative } from "@/lib/format";

export const metadata: Metadata = { title: "Payee" };

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

export default async function PayeeDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await props.params;
  const payeeId = Number(id);
  if (!Number.isFinite(payeeId)) notFound();

  const payee = db
    .select()
    .from(payees)
    .where(and(eq(payees.id, payeeId), eq(payees.userId, user.id)))
    .get();
  if (!payee) notFound();

  const payments = db
    .select()
    .from(billPayments)
    .where(
      and(eq(billPayments.userId, user.id), eq(billPayments.payeeId, payeeId)),
    )
    .orderBy(desc(billPayments.scheduledDate))
    .all();

  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();
  const accountById = new Map(userAccounts.map((a) => [a.id, a]));

  // Aggregate stats
  const paid = payments.filter((p) => p.status === "paid");
  const ytd = paid
    .filter((p) => {
      const d = p.scheduledDate as unknown as Date;
      return d.getFullYear() === new Date().getFullYear();
    })
    .reduce((s, p) => s + p.amount, 0);
  const lifetimePaid = paid.reduce((s, p) => s + p.amount, 0);
  const avg = paid.length > 0 ? lifetimePaid / paid.length : 0;
  const lastPayment = paid[0];
  const primaryCurrency =
    userAccounts.find((a) => a.type !== "credit")?.currency || "USD";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        href="/dashboard/pay-bills/payees"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All payees
      </Link>

      {/* Header */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag className="size-3" />
                {payee.category ?? "Other"}
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {payee.payeeType ?? "business"}
              </span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {payee.nickname ?? payee.name}
            </h1>
            {payee.nickname && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {payee.name}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3" />
                Account {payee.accountNumber}
              </span>
              {payee.email && (
                <a
                  href={`mailto:${payee.email}`}
                  className="inline-flex items-center gap-1 hover:text-violet-500"
                >
                  <Mail className="size-3" />
                  {payee.email}
                </a>
              )}
              {payee.phone && (
                <a
                  href={`tel:${payee.phone}`}
                  className="inline-flex items-center gap-1 hover:text-violet-500"
                >
                  <Phone className="size-3" />
                  {payee.phone}
                </a>
              )}
            </div>
          </div>
          <Link
            href={`/dashboard/pay-bills/pay?payee=${payee.id}`}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600"
          >
            <Send className="size-4" />
            Pay this bill
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-4">
          <Stat
            label="Paid year-to-date"
            value={currency(ytd, primaryCurrency)}
          />
          <Stat
            label="Lifetime paid"
            value={currency(lifetimePaid, primaryCurrency)}
          />
          <Stat
            label="Average payment"
            value={currency(avg, primaryCurrency)}
          />
          <Stat
            label="Last payment"
            value={lastPayment ? formatRelative(lastPayment.scheduledDate) : "—"}
          />
        </div>
      </section>

      {/* History */}
      <section className="rounded-2xl border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="font-display text-base font-semibold">
            Payment history
          </p>
          <p className="text-xs text-muted-foreground">
            {payments.length} record{payments.length === 1 ? "" : "s"}
          </p>
        </header>
        {payments.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No payments to this payee yet. Tap{" "}
            <strong className="text-foreground">Pay this bill</strong> to
            start.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((p) => {
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
                      "inline-flex size-10 shrink-0 items-center justify-center rounded-xl " +
                      (STATUS_STYLE[p.status] ?? STATUS_STYLE.scheduled)
                    }
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {formatDate(p.scheduledDate)}
                      </p>
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                          (STATUS_STYLE[p.status] ??
                            STATUS_STYLE.scheduled)
                        }
                      >
                        {p.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      From {acct?.name ?? "—"} · {formatRelative(p.createdAt)}
                      {p.memo ? ` · ${p.memo}` : ""}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {currency(p.amount, acct?.currency ?? "USD")}
                  </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}
