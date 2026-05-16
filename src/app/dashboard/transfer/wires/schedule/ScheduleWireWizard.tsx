"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currency, maskAccount } from "@/lib/format";
import {
  WIRE_FEE,
  DAILY_WIRE_LIMIT,
  WIRE_CUTOFF_LABEL,
} from "@/lib/banking-constants";
import {
  scheduleWireAction,
  type WireActionState,
} from "@/app/actions/wires";

type Recipient = {
  id: number;
  recipientName: string;
  recipientNickname: string | null;
  bankName: string;
  accountNumber: string;
};

type Account = {
  id: number;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  currency: string;
};

type Step = "form" | "review";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ScheduleWireWizard({
  recipients,
  accounts,
  preselectedRecipientId,
}: {
  recipients: Recipient[];
  accounts: Account[];
  preselectedRecipientId: number;
}) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [recipientId, setRecipientId] = useState<number>(
    preselectedRecipientId || recipients[0].id
  );
  const [fromAccountId, setFromAccountId] = useState<number>(
    accounts[0]?.id ?? 0
  );
  const [amountText, setAmountText] = useState("");
  const [isRepeating, setIsRepeating] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState<
    "weekly" | "biweekly" | "monthly"
  >("monthly");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [wireDate, setWireDate] = useState(todayIso());
  const [messageToBank, setMessageToBank] = useState("");
  const [messageToRecipient, setMessageToRecipient] = useState("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const amount = Number(amountText) || 0;
  const total = amount + WIRE_FEE;
  const recipient = recipients.find((r) => r.id === recipientId);
  const fromAccount = accounts.find((a) => a.id === fromAccountId);
  const insufficient =
    fromAccount &&
    fromAccount.type !== "credit" &&
    total > fromAccount.balance;

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const code = fromAccount?.currency || "USD";
    if (!recipientId) errs.recipientId = "Pick a recipient";
    if (!fromAccountId) errs.fromAccountId = "Pick an account";
    if (!amount || amount <= 0) errs.amount = "Enter an amount";
    if (amount > DAILY_WIRE_LIMIT)
      errs.amount = `Daily wire limit is ${currency(DAILY_WIRE_LIMIT, code)}`;
    if (insufficient) {
      errs.amount = `Insufficient funds — total ${currency(
        total,
        code
      )} exceeds ${currency(fromAccount?.balance ?? 0, code)}.`;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(wireDate)) errs.wireDate = "Pick a date";
    if (isRepeating && !repeatUntil) {
      errs.repeatUntil = "Pick an end date for the repeating wire";
    }
    if (messageToBank.length > 100)
      errs.messageToBank = "100 characters max";
    if (messageToRecipient.length > 140)
      errs.messageToRecipient = "140 characters max";
    if (memo.length > 100) errs.memo = "100 characters max";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onConfirm() {
    setPending(true);
    const fd = new FormData();
    fd.set("recipientId", String(recipientId));
    fd.set("fromAccountId", String(fromAccountId));
    fd.set("amount", String(amount));
    fd.set("isRepeating", isRepeating ? "on" : "");
    if (isRepeating) {
      fd.set("repeatFrequency", repeatFrequency);
      fd.set("repeatUntil", repeatUntil);
    }
    fd.set("wireDate", wireDate);
    fd.set("messageToBank", messageToBank);
    fd.set("messageToRecipient", messageToRecipient);
    fd.set("memo", memo);

    const res = (await scheduleWireAction(
      { ok: false } satisfies WireActionState,
      fd
    )) as WireActionState;
    setPending(false);
    if (!res.ok || !res.referenceNumber) {
      toast.error(res.message ?? "Couldn't schedule wire.");
      if (res.fieldErrors) setErrors(res.fieldErrors);
      setStep("form");
      return;
    }
    router.push(
      `/dashboard/transfer/wires/schedule/processing?ref=${encodeURIComponent(
        res.referenceNumber
      )}`
    );
  }

  if (step === "review") {
    return (
      <ReviewView
        recipient={recipient}
        fromAccount={fromAccount}
        amount={amount}
        wireDate={wireDate}
        isRepeating={isRepeating}
        repeatFrequency={repeatFrequency}
        repeatUntil={repeatUntil}
        messageToBank={messageToBank}
        messageToRecipient={messageToRecipient}
        memo={memo}
        pending={pending}
        onCancel={() => router.push("/dashboard/transfer")}
        onBack={() => setStep("form")}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validate()) setStep("review");
        }}
        className="space-y-5 rounded-2xl border border-border bg-card p-6"
      >
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Schedule a wire
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Wire to" htmlFor="recipientId" error={errors.recipientId}>
            <select
              id="recipientId"
              value={recipientId}
              onChange={(e) => setRecipientId(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {recipients.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.recipientName}
                  {r.recipientNickname ? ` (${r.recipientNickname})` : ""} ·{" "}
                  {r.bankName}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Wire from"
            htmlFor="fromAccountId"
            error={errors.fromAccountId}
          >
            <select
              id="fromAccountId"
              value={fromAccountId}
              onChange={(e) => setFromAccountId(Number(e.target.value))}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {maskAccount(a.accountNumber)} ·{" "}
                  {currency(a.balance, a.currency)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Wire amount" htmlFor="amount" error={errors.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              className="pl-7"
              placeholder="0.00"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Your daily wire limit is{" "}
            {currency(DAILY_WIRE_LIMIT, fromAccount?.currency || "USD")}.
          </p>
        </Field>

        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="font-medium">Make this a repeating wire</span>
              <span className="block text-xs text-muted-foreground">
                We&apos;ll send this wire on a schedule until the end date.
              </span>
            </span>
            <button
              type="button"
              onClick={() => setIsRepeating((v) => !v)}
              role="switch"
              aria-checked={isRepeating}
              className={
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition " +
                (isRepeating ? "bg-violet-500" : "bg-muted-foreground/30")
              }
            >
              <span
                className={
                  "inline-block size-5 transform rounded-full bg-white shadow transition " +
                  (isRepeating ? "translate-x-5" : "translate-x-0.5")
                }
              />
            </button>
          </label>
          {isRepeating && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Frequency" htmlFor="repeatFrequency">
                <select
                  id="repeatFrequency"
                  value={repeatFrequency}
                  onChange={(e) =>
                    setRepeatFrequency(
                      e.target.value as "weekly" | "biweekly" | "monthly"
                    )
                  }
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Every two weeks</option>
                  <option value="monthly">Monthly</option>
                </select>
              </Field>
              <Field label="End date" htmlFor="repeatUntil" error={errors.repeatUntil}>
                <Input
                  id="repeatUntil"
                  type="date"
                  min={wireDate}
                  value={repeatUntil}
                  onChange={(e) => setRepeatUntil(e.target.value)}
                />
              </Field>
            </div>
          )}
        </div>

        <Field label="Wire date" htmlFor="wireDate" error={errors.wireDate}>
          <Input
            id="wireDate"
            type="date"
            min={todayIso()}
            value={wireDate}
            onChange={(e) => setWireDate(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Wires submitted before {WIRE_CUTOFF_LABEL} usually start processing
            the same business day. Anything later moves to the next business
            day.
          </p>
        </Field>

        <div className="space-y-4 rounded-xl border border-border bg-background p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Additional information
          </h3>
          <Field
            label="Message to recipient bank"
            htmlFor="messageToBank"
            error={errors.messageToBank}
          >
            <textarea
              id="messageToBank"
              maxLength={100}
              value={messageToBank}
              onChange={(e) => setMessageToBank(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
              placeholder="Optional — up to 100 characters"
            />
          </Field>
          <Field
            label="Message to recipient"
            htmlFor="messageToRecipient"
            error={errors.messageToRecipient}
          >
            <textarea
              id="messageToRecipient"
              maxLength={140}
              value={messageToRecipient}
              onChange={(e) => setMessageToRecipient(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
              placeholder="Optional — up to 140 characters"
            />
          </Field>
          <Field label="Memo (for your records)" htmlFor="memo" error={errors.memo}>
            <textarea
              id="memo"
              maxLength={100}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background p-3 text-sm"
              placeholder="Optional — your recipient won't see this"
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
          <Link
            href="/dashboard/transfer"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </Link>
          <div className="flex gap-3">
            <Link
              href="/dashboard/transfer/wires/recipients"
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
            >
              Back
            </Link>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600"
            >
              Next
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-3 self-start rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Wire Summary
        </p>
        <SummaryRow
          label="Wire amount"
          value={currency(amount, fromAccount?.currency || "USD")}
        />
        <SummaryRow
          label="Wire transfer fee"
          value={currency(WIRE_FEE, fromAccount?.currency || "USD")}
        />
        <div className="h-px bg-border" />
        <SummaryRow
          label="Total"
          value={currency(total, fromAccount?.currency || "USD")}
          strong
        />
        <p className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          Heads-up: repeating wires of the same amount each cycle help you stay
          on schedule. You can pause or cancel any time before the next wire
          date.
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between text-sm " +
        (strong ? "font-semibold" : "")
      }
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}

function ReviewView({
  recipient,
  fromAccount,
  amount,
  wireDate,
  isRepeating,
  repeatFrequency,
  repeatUntil,
  messageToBank,
  messageToRecipient,
  memo,
  pending,
  onCancel,
  onBack,
  onConfirm,
}: {
  recipient: Recipient | undefined;
  fromAccount: Account | undefined;
  amount: number;
  wireDate: string;
  isRepeating: boolean;
  repeatFrequency: string;
  repeatUntil: string;
  messageToBank: string;
  messageToRecipient: string;
  memo: string;
  pending: boolean;
  onCancel: () => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const total = amount + WIRE_FEE;
  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Does everything look OK?
      </h2>

      <Card title="Account details">
        <Row
          label="Wire to"
          value={
            recipient
              ? `${recipient.recipientName}${
                  recipient.recipientNickname
                    ? ` (${recipient.recipientNickname})`
                    : ""
                } · ${recipient.bankName}`
              : "—"
          }
        />
        <Row
          label="Wire from"
          value={
            fromAccount
              ? `${fromAccount.name} · ${maskAccount(fromAccount.accountNumber)}`
              : "—"
          }
        />
      </Card>

      <Card title="Sender information">
        <Row label="Wire date" value={wireDate} />
        {isRepeating && (
          <>
            <Row label="Repeats" value={repeatFrequency} />
            <Row label="Ends on" value={repeatUntil} />
          </>
        )}
        <Row
          label="Wire amount"
          value={currency(amount, fromAccount?.currency || "USD")}
        />
        <Row
          label="Outgoing wire transfer fee"
          value={currency(WIRE_FEE, fromAccount?.currency || "USD")}
        />
        <Row
          label="Total"
          value={currency(total, fromAccount?.currency || "USD")}
          strong
        />
      </Card>

      <Card title="Additional information">
        <Row label="Message to recipient bank" value={messageToBank || "None"} />
        <Row label="Message to recipient" value={messageToRecipient || "None"} />
        <Row label="Memo" value={memo || "None"} />
      </Card>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p>
          If your recipient&apos;s bank is outside the U.S., this will be
          processed as an international wire. Be sure the recipient country
          you chose is correct before continuing.
        </p>
        <p className="mt-2">
          Wires received before {WIRE_CUTOFF_LABEL} on a business day are
          typically sent the same day. The receiving bank may take additional
          time to apply the funds.
        </p>
        <p className="mt-2">
          By clicking <strong>Schedule Wire</strong>, you agree to the Paxnova
          Trust Wire Transfer Service Addendum and confirm the details above
          are accurate.
        </p>
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Scheduling…
              </>
            ) : (
              "Schedule Wire"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <dl className="grid gap-2">{children}</dl>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-4 text-sm " +
        (strong ? "font-semibold" : "")
      }
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono">{value}</dd>
    </div>
  );
}
