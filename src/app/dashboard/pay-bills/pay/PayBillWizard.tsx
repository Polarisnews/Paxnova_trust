"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Plus,
  Search,
  Send,
  UserPlus,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addPayeeAction,
  schedulePaymentAction,
  type ActionState,
} from "@/app/actions/banking";
import { currency, maskAccount } from "@/lib/format";
import { cn } from "@/lib/utils";

type Account = {
  id: number;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  currency: string;
};
type Payee = {
  id: number;
  name: string;
  nickname: string | null;
  accountNumber: string;
  category: string;
  payeeType: string;
};

type Step = "from" | "payee" | "amount" | "review" | "done";
const STEPS: { id: Step; label: string }[] = [
  { id: "from", label: "From account" },
  { id: "payee", label: "Payee" },
  { id: "amount", label: "Amount" },
  { id: "review", label: "Review" },
];

const initial: ActionState = { ok: false };

export function PayBillWizard({
  accounts,
  payees: initialPayees,
  preselectedPayeeId,
}: {
  accounts: Account[];
  payees: Payee[];
  preselectedPayeeId: number | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    schedulePaymentAction,
    initial,
  );
  // Local copy of payees so newly-created ones appear immediately without
  // bouncing off the server. The wrapped router.refresh() in the add-payee
  // flow still resyncs the server data — this is the optimistic update.
  const [payees, setPayees] = useState(initialPayees);
  const [showAddPayee, setShowAddPayee] = useState(false);

  // ── Wizard state ─────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(
    preselectedPayeeId ? "amount" : accounts.length > 0 ? "from" : "from",
  );
  const [fromAccountId, setFromAccountId] = useState<number | null>(
    accounts[0]?.id ?? null,
  );
  const [payeeId, setPayeeId] = useState<number | null>(preselectedPayeeId);
  const [amountText, setAmountText] = useState("");
  const [scheduledDate, setScheduledDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [memo, setMemo] = useState("");
  const [payNow, setPayNow] = useState(true);
  const [payeeQuery, setPayeeQuery] = useState("");

  // ── Resolve picks ────────────────────────────────────────────────
  const fromAccount = useMemo(
    () => accounts.find((a) => a.id === fromAccountId) ?? null,
    [accounts, fromAccountId],
  );
  const payee = useMemo(
    () => payees.find((p) => p.id === payeeId) ?? null,
    [payees, payeeId],
  );
  const amount = Number(amountText) || 0;
  const insufficient =
    payNow && fromAccount != null && amount > fromAccount.balance;

  // ── Group payees by category, with quick filter ──────────────────
  const grouped = useMemo(() => {
    const q = payeeQuery.trim().toLowerCase();
    const filtered = q
      ? payees.filter((p) =>
          `${p.name} ${p.nickname ?? ""} ${p.category}`
            .toLowerCase()
            .includes(q),
        )
      : payees;
    const byCat = new Map<string, Payee[]>();
    for (const p of filtered) {
      const arr = byCat.get(p.category) ?? [];
      arr.push(p);
      byCat.set(p.category, arr);
    }
    // Sort categories alphabetically, payees alphabetically within
    const ordered = Array.from(byCat.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, list]) => [cat, list.sort((a, b) => a.name.localeCompare(b.name))] as const);
    return ordered;
  }, [payees, payeeQuery]);

  // ── Server feedback ──────────────────────────────────────────────
  const [lastPaymentId, setLastPaymentId] = useState<number | null>(null);
  useEffect(() => {
    if (state.ok) {
      setStep("done");
      if (state.paymentId) setLastPaymentId(state.paymentId);
      toast.success(
        payNow
          ? `Payment sent to ${payee?.name ?? "your payee"}.`
          : `Payment scheduled for ${scheduledDate}.`,
      );
    } else if (state.message) {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ── Step navigation ──────────────────────────────────────────────
  function next() {
    if (step === "from" && !fromAccountId) return;
    if (step === "payee" && !payeeId) return;
    if (step === "amount" && (amount <= 0 || insufficient)) return;
    const order: Step[] = ["from", "payee", "amount", "review"];
    const idx = order.indexOf(step);
    if (idx >= 0 && idx < order.length - 1) setStep(order[idx + 1]);
  }
  function back() {
    const order: Step[] = ["from", "payee", "amount", "review"];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  const code = fromAccount?.currency ?? "USD";

  // ── Done state ───────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-12 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {payNow ? "Payment sent" : "Payment scheduled"}
        </h1>
        <p className="text-muted-foreground">
          {payNow
            ? `${currency(amount, code)} to ${payee?.name} from ${fromAccount?.name}.`
            : `${currency(amount, code)} to ${payee?.name} on ${new Date(scheduledDate).toLocaleDateString()}.`}
        </p>
        <div className="flex flex-col items-stretch gap-2 pt-3 sm:flex-row sm:justify-center">
          {lastPaymentId && (
            <Link
              href={`/dashboard/pay-bills/receipt/${lastPaymentId}`}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600"
            >
              View receipt
              <ArrowRight className="size-4" />
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setStep("from");
              setPayeeId(null);
              setAmountText("");
              setMemo("");
              setLastPaymentId(null);
            }}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
          >
            <Send className="size-4" />
            Pay another bill
          </button>
          <Link
            href="/dashboard/pay-bills"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
          >
            Back to Pay Bills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between">
        <Link
          href="/dashboard/pay-bills"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Pay Bills
        </Link>
        <button
          type="button"
          onClick={() => router.push("/dashboard/pay-bills")}
          aria-label="Close wizard"
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </header>

      {/* Step indicator */}
      <ol className="flex w-full items-center gap-2">
        {STEPS.map((s, i) => {
          const stepIdx = STEPS.findIndex((x) => x.id === step);
          const state =
            i < stepIdx ? "done" : i === stepIdx ? "current" : "todo";
          return (
            <li
              key={s.id}
              className="flex flex-1 items-center gap-2 last:flex-none"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                    state === "done" && "border-violet-500 bg-violet-500 text-white",
                    state === "current" && "border-violet-500 bg-card text-violet-600",
                    state === "todo" && "border-border bg-card text-muted-foreground",
                  )}
                >
                  {state === "done" ? <Check className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-xs font-medium md:inline",
                    state === "todo"
                      ? "text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1 transition-colors",
                    i < stepIdx ? "bg-violet-500" : "bg-border",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
          Step {STEPS.findIndex((s) => s.id === step) + 1} of {STEPS.length}
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {step === "from" && "Which account is paying?"}
          {step === "payee" && "Who are you paying?"}
          {step === "amount" && "How much, and when?"}
          {step === "review" && "Review and confirm"}
        </h2>
      </div>

      {/* ── Step 1: Pick funding account ─────────────────────────── */}
      {step === "from" && (
        <ul className="space-y-2">
          {accounts.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              You don&apos;t have a cash account yet. Open a Checking or
              Savings account first.
            </li>
          )}
          {accounts.map((a) => {
            const active = fromAccountId === a.id;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setFromAccountId(a.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-left transition",
                    active
                      ? "border-violet-500 ring-2 ring-violet-500/30"
                      : "border-border hover:border-violet-500/40",
                  )}
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                    <Wallet className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {maskAccount(a.accountNumber)} ·{" "}
                      {a.type[0].toUpperCase() + a.type.slice(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold">
                      {currency(a.balance, a.currency)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Available
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Step 2: Pick payee ───────────────────────────────────── */}
      {step === "payee" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={payeeQuery}
                onChange={(e) => setPayeeQuery(e.target.value)}
                placeholder="Search by name, nickname, or category"
                className="h-11 w-full rounded-full border border-border bg-background pl-10 pr-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowAddPayee(true)}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/8 px-4 text-sm font-semibold text-violet-600 transition hover:bg-violet-500/15 dark:text-violet-300"
            >
              <UserPlus className="size-4" />
              <span className="hidden sm:inline">Add new payee</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>

          {showAddPayee && (
            <AddPayeePanel
              onClose={() => setShowAddPayee(false)}
              onCreated={(p) => {
                // Append optimistically + auto-select + advance to step 3.
                setPayees((prev) => [...prev, p]);
                setPayeeId(p.id);
                setShowAddPayee(false);
                setStep("amount");
                router.refresh();
              }}
            />
          )}
          {grouped.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No payees match &ldquo;{payeeQuery}&rdquo;. Try a different
              search.
            </div>
          ) : (
            <div className="max-h-[60dvh] space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-4">
              {grouped.map(([category, list]) => (
                <div key={category}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {category}
                  </p>
                  <ul className="space-y-1">
                    {list.map((p) => {
                      const active = payeeId === p.id;
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => setPayeeId(p.id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition",
                              active
                                ? "bg-violet-500/10 ring-1 ring-violet-500"
                                : "hover:bg-muted",
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "inline-flex size-8 items-center justify-center rounded-lg text-xs font-semibold",
                                active
                                  ? "bg-violet-500 text-white"
                                  : "bg-muted text-foreground/70",
                              )}
                            >
                              {p.name[0]}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {p.nickname ?? p.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {p.name} · {p.accountNumber}
                              </p>
                            </div>
                            {active && (
                              <Check className="size-4 text-violet-500" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Amount + date ────────────────────────────────── */}
      {step === "amount" && (
        <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Amount ({code})
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display text-lg text-muted-foreground">
                $
              </span>
              <input
                id="amount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
                placeholder="0.00"
                className="h-14 w-full rounded-xl border border-border bg-background pl-9 pr-3 font-mono text-2xl focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
              />
            </div>
            {fromAccount && (
              <p className="mt-1 text-xs text-muted-foreground">
                Available: {currency(fromAccount.balance, code)}
              </p>
            )}
            {insufficient && (
              <p className="mt-1 text-xs text-danger">
                Amount exceeds your available balance.
              </p>
            )}
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <input
              type="checkbox"
              checked={payNow}
              onChange={(e) => setPayNow(e.target.checked)}
              className="mt-0.5 size-4 accent-violet-500"
            />
            <span>
              <span className="font-medium">Pay now</span>
              <span className="block text-xs text-muted-foreground">
                Uncheck to schedule the payment for a later date.
              </span>
            </span>
          </label>

          {!payNow && (
            <div>
              <label
                htmlFor="scheduledDate"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Pay on
              </label>
              <div className="relative mt-1.5">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="scheduledDate"
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="memo"
              className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Memo (optional)
            </label>
            <input
              id="memo"
              type="text"
              maxLength={80}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="What's this for?"
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
            />
          </div>
        </div>
      )}

      {/* ── Step 4: Review + submit ──────────────────────────────── */}
      {step === "review" && (
        <form action={formAction} className="space-y-4">
          <input
            type="hidden"
            name="fromAccountId"
            value={fromAccountId ?? ""}
            readOnly
          />
          <input
            type="hidden"
            name="payeeId"
            value={payeeId ?? ""}
            readOnly
          />
          <input type="hidden" name="amount" value={amount} readOnly />
          <input
            type="hidden"
            name="scheduledDate"
            value={payNow ? new Date().toISOString().slice(0, 10) : scheduledDate}
            readOnly
          />
          <input type="hidden" name="memo" value={memo} readOnly />
          <input
            type="hidden"
            name="payNow"
            value={payNow ? "on" : ""}
            readOnly
          />

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
              Payment summary
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <Row
                label="From"
                value={fromAccount?.name ?? "—"}
                sub={fromAccount ? maskAccount(fromAccount.accountNumber) : ""}
              />
              <Row
                label="To"
                value={payee?.name ?? "—"}
                sub={payee ? `${payee.category} · ${payee.accountNumber}` : ""}
              />
              <Row
                label="Amount"
                value={currency(amount, code)}
                strong
              />
              <Row
                label={payNow ? "Pay now" : "Scheduled for"}
                value={
                  payNow
                    ? "Immediately"
                    : new Date(scheduledDate).toLocaleDateString()
                }
              />
              {memo && <Row label="Memo" value={memo} />}
            </dl>
          </div>

          {state.message && !state.ok && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-violet-500 px-6 text-sm font-semibold text-white shadow-soft hover:bg-violet-600 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="size-4" />
                {payNow ? "Pay now" : "Schedule payment"}
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer nav */}
      {step !== "review" && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === "from"}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium hover:bg-muted disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={
              (step === "from" && !fromAccountId) ||
              (step === "payee" && !payeeId) ||
              (step === "amount" && (amount <= 0 || insufficient))
            }
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {step === "review" && (
        <button
          type="button"
          onClick={back}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="mr-1.5 size-4" />
          Edit details
        </button>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Add-new-payee inline panel. Lives inside step 2 of the wizard so a user
// who can't find their payee can create one and continue paying without
// leaving the flow.
// ──────────────────────────────────────────────────────────────────────

const PAYEE_TYPE_OPTIONS = [
  { value: "business", label: "Business" },
  { value: "utility", label: "Utility" },
  { value: "external-bank", label: "External bank" },
  { value: "person", label: "Person" },
] as const;

const CATEGORY_HINTS = [
  "Utilities",
  "Telecom",
  "Streaming",
  "Insurance",
  "Credit cards",
  "Housing",
  "Auto",
  "Education",
  "Subscriptions",
  "Fitness",
  "Ride-share",
  "Food delivery",
  "Kids",
  "Pets",
  "Home services",
  "Giving",
  "Other",
];

function AddPayeePanel({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Payee) => void;
}) {
  const [state, formAction, pending] = useActionState(addPayeeAction, initial);
  const [payeeType, setPayeeType] = useState<string>("business");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [category, setCategory] = useState("Other");
  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">(
    "checking",
  );
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const needsBank = payeeType === "external-bank" || payeeType === "business";

  // When the action resolves successfully, lift the new payee up to the
  // wizard so it can auto-select and advance.
  useEffect(() => {
    if (!state.ok || !state.payeeId) return;
    toast.success(state.message ?? "Payee added.");
    onCreated({
      id: state.payeeId,
      name,
      nickname: nickname || null,
      accountNumber,
      category,
      payeeType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
            New payee
          </p>
          <h3 className="font-display text-base font-semibold tracking-tight">
            Add and pay them in one step
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close add payee"
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="payeeType" value={payeeType} readOnly />

        {/* Payee type chips */}
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Payee type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PAYEE_TYPE_OPTIONS.map((opt) => {
              const active = payeeType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPayeeType(opt.value)}
                  className={cn(
                    "inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition",
                    active
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-border bg-background hover:bg-muted",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Name"
            name="name"
            required
            value={name}
            onChange={setName}
            placeholder="e.g. Pacific Gas & Electric"
            error={state.fieldErrors?.name}
          />
          <Input
            label="Nickname (optional)"
            name="nickname"
            value={nickname}
            onChange={setNickname}
            placeholder="e.g. Power bill"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Account number at payee"
            name="accountNumber"
            required
            value={accountNumber}
            onChange={setAccountNumber}
            placeholder="As shown on the bill"
            error={state.fieldErrors?.accountNumber}
          />
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
            >
              {CATEGORY_HINTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {needsBank && (
          <div className="grid gap-3 rounded-xl border border-border bg-background p-3 sm:grid-cols-2">
            <Input
              label="Bank name"
              name="bankName"
              value={bankName}
              onChange={setBankName}
              placeholder="e.g. Chase Bank"
              error={state.fieldErrors?.bankName}
            />
            <Input
              label="Routing number (9 digits)"
              name="routingNumber"
              value={routingNumber}
              onChange={setRoutingNumber}
              maxLength={9}
              inputMode="numeric"
              placeholder="021000021"
              error={state.fieldErrors?.routingNumber}
            />
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Account type
              </label>
              <div className="inline-flex rounded-full bg-muted p-1">
                {(["checking", "savings"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAccountType(t)}
                    className={cn(
                      "h-8 rounded-full px-4 text-xs font-semibold transition",
                      accountType === t
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t[0].toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="hidden"
                name="accountType"
                value={accountType}
                readOnly
              />
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Email (optional)"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="receipts@payee.com"
            error={state.fieldErrors?.email}
          />
          <Input
            label="Phone (optional)"
            name="phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="(415) 555-0100"
          />
        </div>

        {state.message && !state.ok && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-xs text-danger">
            {state.message}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Save &amp; continue
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type,
  required,
  placeholder,
  maxLength,
  inputMode,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type ?? "text"}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 w-full rounded-lg border bg-background px-3 text-sm transition focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
          error ? "border-danger" : "border-border",
        )}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  strong,
}: {
  label: string;
  value: string;
  sub?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right">
        <p
          className={cn(
            "font-medium",
            strong && "font-display text-lg font-semibold tracking-tight",
          )}
        >
          {value}
        </p>
        {sub && (
          <p className="text-[11px] text-muted-foreground">{sub}</p>
        )}
      </dd>
    </div>
  );
}
