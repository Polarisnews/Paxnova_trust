"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Info,
  Loader2,
  Plus,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addPayeeAction,
  initiateTransferAction,
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
};

type Payee = {
  id: number;
  name: string;
  nickname: string | null;
  accountNumber: string;
  payeeType: string | null;
  bankName: string | null;
  preferredMethod: string | null;
};

type Tab = "own" | "payees" | "new";

const initialAction: ActionState = { ok: false };
type TransferState = ActionState & { referenceNumber?: string };

const WIRE_FEE = 25;

export function TransferComposer({
  accounts,
  payees,
}: {
  accounts: Account[];
  payees: Payee[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(
    accounts.length >= 2 ? "own" : payees.length > 0 ? "payees" : "new"
  );
  const [fromAccountId, setFromAccountId] = useState<number>(
    accounts[0]?.id ?? 0
  );
  const [toAccountId, setToAccountId] = useState<number>(accounts[1]?.id ?? 0);
  const [toPayeeId, setToPayeeId] = useState<number>(payees[0]?.id ?? 0);
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [sendByWire, setSendByWire] = useState(false);

  const [transferState, transferFormAction, transferPending] =
    useActionState<TransferState, FormData>(
      initiateTransferAction,
      initialAction
    );

  useEffect(() => {
    if (transferState.ok && transferState.referenceNumber) {
      router.push(
        `/dashboard/transfer/processing?ref=${encodeURIComponent(
          transferState.referenceNumber
        )}`
      );
    } else if (
      transferState.message &&
      !transferState.ok &&
      !transferState.fieldErrors
    ) {
      toast.error(transferState.message);
    }
  }, [transferState, router]);

  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const toPayee = payees.find((p) => p.id === toPayeeId);
  const numericAmount = Number(amount) || 0;

  const { method, settleCopy, MethodIcon } = useMemo(() => {
    if (tab === "own")
      return {
        method: "internal" as const,
        settleCopy: "Instant · between your Paxnova Trust accounts",
        MethodIcon: Zap,
      };
    if (tab === "payees" && toPayee) {
      if (toPayee.preferredMethod === "zelle" && !sendByWire) {
        return {
          method: "zelle" as const,
          settleCopy: "Typically arrives within minutes via Zelle",
          MethodIcon: Zap,
        };
      }
      if (sendByWire) {
        return {
          method: "wire" as const,
          settleCopy: `Same business day if sent before 5:00 PM ET · $${WIRE_FEE} fee`,
          MethodIcon: Building2,
        };
      }
      return {
        method: "ach" as const,
        settleCopy: "ACH · settles in 1–2 business days",
        MethodIcon: Clock,
      };
    }
    return {
      method: "ach" as const,
      settleCopy: "Pick a recipient",
      MethodIcon: Clock,
    };
  }, [tab, toPayee, sendByWire]);

  const fee = method === "wire" ? WIRE_FEE : 0;
  const totalDebit = numericAmount + fee;
  const insufficient =
    fromAccount && fromAccount.type !== "credit"
      ? totalDebit > fromAccount.balance
      : false;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (tab === "new") {
      e.preventDefault();
      toast.error("Add the new recipient first using the form below.");
      return;
    }
    if (insufficient) {
      e.preventDefault();
      toast.error("Insufficient funds in source account.");
      return;
    }
  }

  return (
    <div className="space-y-5">
      <form
        action={transferFormAction}
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-card p-6"
      >
        {/* ── From account ───────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="fromAccountId">From</Label>
          <select
            id="fromAccountId"
            name="fromAccountId"
            required
            value={fromAccountId}
            onChange={(e) => setFromAccountId(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {maskAccount(a.accountNumber)} · {currency(a.balance)}
              </option>
            ))}
          </select>
        </div>

        {/* ── Destination tabs ───────────────────────────────────── */}
        <div>
          <Label className="mb-2 block">To</Label>
          <div className="flex gap-1 rounded-full bg-muted p-1">
            <TabButton
              active={tab === "own"}
              onClick={() => setTab("own")}
              icon={ArrowRight}
              label="My accounts"
              disabled={accounts.length < 2}
            />
            <TabButton
              active={tab === "payees"}
              onClick={() => setTab("payees")}
              icon={User}
              label="My recipients"
              disabled={payees.length === 0}
            />
            <TabButton
              active={tab === "new"}
              onClick={() => setTab("new")}
              icon={Plus}
              label="New recipient"
            />
          </div>
        </div>

        {/* ── Destination input ──────────────────────────────────── */}
        <input type="hidden" name="destinationKind" value={tab === "own" ? "own" : "payee"} />

        {tab === "own" && (
          <select
            name="toAccountId"
            value={toAccountId}
            onChange={(e) => setToAccountId(Number(e.target.value))}
            required
            className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          >
            {accounts
              .filter((a) => a.id !== fromAccountId)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskAccount(a.accountNumber)}
                </option>
              ))}
          </select>
        )}

        {tab === "payees" && (
          <>
            {payees.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
                No recipients yet. Use <strong>New recipient</strong> to add one.
              </p>
            ) : (
              <select
                name="toPayeeId"
                value={toPayeeId}
                onChange={(e) => setToPayeeId(Number(e.target.value))}
                required
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
              >
                {payees.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.nickname ? ` (${p.nickname})` : ""}
                    {p.bankName ? ` · ${p.bankName}` : ""}
                    {" · "}
                    {maskAccount(p.accountNumber)}
                  </option>
                ))}
              </select>
            )}
          </>
        )}

        {tab === "new" && (
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3 text-xs">
            <p className="font-medium text-foreground">
              Add a new recipient using the form below this card. Once saved,
              switch back to <strong>My recipients</strong> to send.
            </p>
          </div>
        )}

        {/* ── Amount + memo ──────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                placeholder="0.00"
              />
            </div>
            {transferState.fieldErrors?.amount && (
              <p className="text-xs text-danger">
                {transferState.fieldErrors.amount}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (optional)</Label>
            <Input
              id="memo"
              name="memo"
              maxLength={120}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="What's this for?"
            />
          </div>
        </div>

        {/* ── Wire option (only for payees) ──────────────────────── */}
        {tab === "payees" &&
          toPayee &&
          toPayee.preferredMethod !== "zelle" && (
            <label className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <input
                type="checkbox"
                name="sendByWire"
                checked={sendByWire}
                onChange={(e) => setSendByWire(e.target.checked)}
                className="mt-0.5 size-4 accent-violet-500"
              />
              <span>
                <strong>Send by wire</strong> — same business day · ${WIRE_FEE} fee.
                Otherwise sent via ACH which takes 1–2 business days.
              </span>
            </label>
          )}

        {/* ── Method preview ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <MethodIcon className="size-4 text-violet-500" />
          <span className="flex-1">
            <span className="font-semibold uppercase tracking-wider text-foreground">
              {method}
            </span>
            {" — "}
            {settleCopy}
          </span>
          {fee > 0 && (
            <span className="font-mono text-foreground">
              +{currency(fee)} fee
            </span>
          )}
        </div>

        {/* ── Totals ────────────────────────────────────────────── */}
        {numericAmount > 0 && (
          <div className="space-y-1 rounded-lg border border-border bg-background p-3 text-xs">
            <Row label="Amount">{currency(numericAmount)}</Row>
            {fee > 0 && <Row label="Wire fee">{currency(fee)}</Row>}
            <div className="my-1 h-px bg-border" />
            <Row label="Total debit" strong>
              {currency(totalDebit)}
            </Row>
            {insufficient && (
              <p className="mt-2 flex items-start gap-1 text-danger">
                <Info className="mt-0.5 size-3 shrink-0" />
                Insufficient funds — your {fromAccount?.name} has{" "}
                {currency(fromAccount?.balance ?? 0)}.
              </p>
            )}
          </div>
        )}

        {/* ── Submit ────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={transferPending || tab === "new" || insufficient}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 disabled:opacity-60"
        >
          {transferPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Initiating…
            </>
          ) : (
            <>
              Send {numericAmount > 0 ? currency(numericAmount) : "money"}
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </button>
      </form>

      {/* ── New recipient form ──────────────────────────────────── */}
      {tab === "new" && <AddPayeeCard onAdded={() => setTab("payees")} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-card text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function Row({
  label,
  children,
  strong,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        strong && "text-sm font-semibold"
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{children}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Add-payee inline card
// ────────────────────────────────────────────────────────────────────────

const addPayeeInitial: ActionState = { ok: false };

function AddPayeeCard({ onAdded }: { onAdded: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    addPayeeAction,
    addPayeeInitial
  );
  const [payeeType, setPayeeType] = useState<
    "person" | "business" | "utility" | "external-bank"
  >("business");

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      onAdded();
      router.refresh();
    } else if (state.message && !state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state, onAdded, router]);

  const isPerson = payeeType === "person";
  const isBankish =
    payeeType === "business" || payeeType === "external-bank";

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-border bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
          <Plus className="size-4" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">
            Add a new recipient
          </h2>
          <p className="text-xs text-muted-foreground">
            Saved to your address book for future transfers.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Recipient type</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { v: "person", label: "Person", icon: User },
              { v: "business", label: "Business", icon: Building2 },
              { v: "utility", label: "Utility", icon: Zap },
              {
                v: "external-bank",
                label: "External bank",
                icon: Building2,
              },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setPayeeType(opt.v)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition",
                payeeType === opt.v
                  ? "border-violet-500 bg-violet-500/5 text-violet-600"
                  : "border-border bg-background text-muted-foreground hover:border-violet-500/60 hover:text-foreground"
              )}
            >
              <opt.icon className="size-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="payeeType" value={payeeType} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="payee-name">Full name / business name</Label>
          <Input
            id="payee-name"
            name="name"
            required
            placeholder={isPerson ? "Riley Khan" : "Brightline Studio LLC"}
          />
          {state.fieldErrors?.name && (
            <p className="text-xs text-danger">{state.fieldErrors.name}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="payee-nickname">Nickname (optional)</Label>
          <Input
            id="payee-nickname"
            name="nickname"
            placeholder={isPerson ? "Riley" : "Office rent"}
          />
        </div>
      </div>

      {isPerson && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="payee-email">Email (for Zelle)</Label>
            <Input
              id="payee-email"
              name="email"
              type="email"
              placeholder="riley@example.com"
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-danger">{state.fieldErrors.email}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="payee-phone">Phone (alt. for Zelle)</Label>
            <Input
              id="payee-phone"
              name="phone"
              type="tel"
              placeholder="(555) 555-0100"
            />
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="payee-account">Account number</Label>
          <Input
            id="payee-account"
            name="accountNumber"
            required
            placeholder="123456789012"
          />
          {state.fieldErrors?.accountNumber && (
            <p className="text-xs text-danger">
              {state.fieldErrors.accountNumber}
            </p>
          )}
        </div>
        {isBankish && (
          <div className="space-y-1">
            <Label htmlFor="payee-routing">Routing number (ABA)</Label>
            <Input
              id="payee-routing"
              name="routingNumber"
              required
              maxLength={9}
              placeholder="026013577"
            />
            {state.fieldErrors?.routingNumber && (
              <p className="text-xs text-danger">
                {state.fieldErrors.routingNumber}
              </p>
            )}
          </div>
        )}
      </div>

      {isBankish && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="payee-bank">Bank name</Label>
            <Input
              id="payee-bank"
              name="bankName"
              placeholder="Chase, Wells Fargo, etc."
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="payee-account-type">Account type</Label>
            <select
              id="payee-account-type"
              name="accountType"
              defaultValue="checking"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="payee-category">Category (optional)</Label>
        <Input
          id="payee-category"
          name="category"
          placeholder="Utilities · Rent · Person · Vendor"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Saving…
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4" /> Save recipient
          </>
        )}
      </button>
    </form>
  );
}
