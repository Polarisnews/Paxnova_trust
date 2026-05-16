import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Clock,
  CreditCard,
  PiggyBank,
  Plus,
  Send,
  ShieldCheck,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { db } from "@/db";
import { accounts, cards, scheduledWires, transactions, wireRecipients } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { currency, formatDate, formatRelative, maskAccount } from "@/lib/format";
import { convertWithUsdRates, getUsdRates } from "@/lib/fx";
import { CardArt } from "@/components/cards/CardArt";

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
  const currencyByAccount = new Map(
    userAccounts.map((a) => [a.id, a.currency || "USD"])
  );
  const recentTx = accountIds.length
    ? db
        .select()
        .from(transactions)
        .where(inArray(transactions.accountId, accountIds))
        .orderBy(desc(transactions.createdAt))
        .limit(10)
        .all()
    : [];

  // Active cards belonging to the user — surfaced as a row of CardArt
  // previews on the dashboard.
  const userCards = db
    .select()
    .from(cards)
    .where(eq(cards.userId, user.id))
    .all();

  // Most recent wires this user has on file, regardless of status, so the
  // dashboard surfaces "Pending review", approved (with PDF), and rejected
  // entries together.
  const recentWiresRaw = db
    .select({
      wire: scheduledWires,
      recipient: wireRecipients,
      sourceCurrency: accounts.currency,
    })
    .from(scheduledWires)
    .leftJoin(wireRecipients, eq(wireRecipients.id, scheduledWires.recipientId))
    .leftJoin(accounts, eq(accounts.id, scheduledWires.fromAccountId))
    .where(eq(scheduledWires.userId, user.id))
    .orderBy(desc(scheduledWires.createdAt))
    .limit(5)
    .all();

  // Pick a display currency for the aggregate cards. We use whichever account
  // has the biggest absolute USD-equivalent balance — that way an account the
  // user just re-denominated tends to win, since its number is now larger in
  // the new currency. Falls back to USD when there are no accounts.
  const { rates: usdRates } = await getUsdRates();
  const ranked = [...userAccounts]
    .map((a) => ({
      a,
      usdEquivalent:
        Math.abs(a.balance) /
        (usdRates[(a.currency || "USD").toUpperCase()] ?? 1),
    }))
    .sort((x, y) => y.usdEquivalent - x.usdEquivalent);
  const displayCurrency =
    ranked[0]?.a.currency || "USD";

  // Aggregates are computed by converting each account's balance to the
  // chosen display currency. Sums across mixed currencies are now meaningful.
  const convertTo = (a: (typeof userAccounts)[number]) =>
    convertWithUsdRates(
      a.balance,
      a.currency || "USD",
      displayCurrency,
      usdRates
    );

  const totalAssets = userAccounts
    .filter((a) => a.type !== "credit")
    .reduce((s, a) => s + convertTo(a), 0);
  const totalCredit = userAccounts
    .filter((a) => a.type === "credit")
    .reduce((s, a) => s + convertTo(a), 0);
  const netWorth = Number((totalAssets + totalCredit).toFixed(2));
  // Available = cash on hand only. Frozen / pending accounts are excluded so
  // this matches "amount available for withdrawal".
  const availableBalance = userAccounts
    .filter((a) => a.type !== "credit" && a.status === "active")
    .reduce((s, a) => s + convertTo(a), 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Net position
        </p>
        <p className="font-display text-4xl font-semibold tracking-tight">
          {currency(netWorth, displayCurrency)}
        </p>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-muted/40 px-4 py-3">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Assets
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold">
              {currency(totalAssets, displayCurrency)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/40 px-4 py-3">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Available balance
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold">
              {currency(availableBalance, displayCurrency)}
            </dd>
          </div>
          <div className="rounded-xl bg-muted/40 px-4 py-3">
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Credit balance
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold">
              {currency(totalCredit, displayCurrency)}
            </dd>
          </div>
        </dl>
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
                {currency(a.balance, a.currency || "USD")}
              </p>
              {a.apy != null && a.type !== "credit" && (
                <p className="mt-1 text-xs text-violet-500">{a.apy}% APY</p>
              )}
              {isCredit && a.creditLimit && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {currency(a.creditLimit + a.balance, a.currency || "USD")}{" "}
                  available of {currency(a.creditLimit, a.currency || "USD")}
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

      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold">Your cards</h2>
          <Link
            href={
              userCards.length > 0
                ? "/dashboard/cards"
                : "/dashboard/cards/apply"
            }
            className="text-xs font-medium text-violet-500 hover:text-violet-600"
          >
            {userCards.length > 0 ? "Manage cards" : "Apply for a card"}
          </Link>
        </div>
        {userCards.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No active card yet. Pick from Visa Core, Mastercard Plus, or
              Amex Black.
            </p>
            <Link
              href="/dashboard/cards/apply"
              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-violet-500 px-4 text-xs font-semibold text-white hover:bg-violet-600"
            >
              <Plus className="size-3.5" />
              Apply for a card
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 px-6 py-5">
            {userCards.map((c) => (
              <Link
                key={c.id}
                href="/dashboard/cards"
                className="transition hover:-translate-y-0.5"
              >
                <CardArt
                  network={
                    (c.network as "visa" | "mastercard" | "amex") ??
                    (c.brand as "visa" | "mastercard" | "amex")
                  }
                  theme={
                    (c.theme as "obsidian" | "aurora" | "sand" | "crimson") ??
                    "obsidian"
                  }
                  cardHolder={c.cardHolder}
                  lastFour={c.lastFour}
                  expiryMonth={c.expiryMonth}
                  expiryYear={c.expiryYear}
                  frozen={c.frozen}
                  size="sm"
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      {recentWiresRaw.length > 0 && (
        <section className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-lg font-semibold">Wires</h2>
            <Link
              href="/dashboard/transfer/wires"
              className="text-xs font-medium text-violet-500 hover:text-violet-600"
            >
              Schedule a wire
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentWiresRaw.map(({ wire, recipient, sourceCurrency }) => {
              const code = sourceCurrency || "USD";
              const isPending = wire.status === "scheduled";
              const isApproved = wire.status === "approved";
              const isRejected = wire.status === "rejected";
              const isInterrupted =
                wire.status === "pending_tcv" ||
                wire.status === "pending_aml" ||
                wire.status === "interrupted_custom" ||
                wire.status === "rejected_frozen";
              const StatusIcon = isApproved
                ? ShieldCheck
                : isRejected
                ? XCircle
                : Clock;
              const statusColor = isApproved
                ? "bg-success/15 text-success"
                : isRejected
                ? "bg-danger/15 text-danger"
                : isInterrupted
                ? "bg-gold-500/15 text-gold-700 dark:text-gold-300"
                : "bg-violet-500/15 text-violet-500";
              const statusLabel = isApproved
                ? "Wire completed"
                : isRejected
                ? "Rejected"
                : isPending
                ? "Wire pending"
                : isInterrupted
                ? "Action needed"
                : wire.status;
              return (
                <li key={wire.id}>
                  <Link
                    href={`/dashboard/wires/${encodeURIComponent(
                      wire.referenceNumber
                    )}`}
                    className="flex items-center gap-4 px-6 py-4 transition hover:bg-muted/50"
                  >
                    <span
                      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${statusColor}`}
                    >
                      <StatusIcon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm">
                        <span className="font-medium truncate">
                          {recipient?.recipientName ?? "Wire recipient"}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        <span className="font-mono">{wire.referenceNumber}</span>{" "}
                        · Wire date {formatDate(wire.wireDate)}
                      </p>
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="font-mono text-sm font-semibold">
                        {currency(wire.amount, code)}
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        + {currency(wire.fee, code)} fee
                      </span>
                    </p>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
                          {t.category ?? "Transaction"} ·{" "}
                          {formatRelative(t.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`shrink-0 font-mono text-sm font-semibold ${
                        t.type === "credit" ? "text-success" : ""
                      }`}
                    >
                      {t.type === "credit" ? "+" : "−"}
                      {currency(
                        t.amount,
                        currencyByAccount.get(t.accountId) ?? "USD"
                      )}
                    </p>
                  </Link>
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
