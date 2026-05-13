"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Calendar, CheckCircle2, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addPayeeAction,
  cancelPaymentAction,
  schedulePaymentAction,
  type ActionState,
} from "@/app/actions/banking";
import { currency, formatDate, maskAccount } from "@/lib/format";

type Account = { id: number; name: string; balance: number; accountNumber: string };
type Payee = {
  id: number;
  name: string;
  nickname: string | null;
  accountNumber: string;
  category: string | null;
};
type Scheduled = {
  id: number;
  payeeName: string;
  accountName: string;
  amount: number;
  scheduledDate: number;
  status: "scheduled" | "paid" | "cancelled" | "failed";
};

const initial: ActionState = { ok: false };

export function PayBillsClient({
  accounts,
  payees,
  scheduled,
}: {
  accounts: Account[];
  payees: Payee[];
  scheduled: Scheduled[];
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        <SchedulePaymentForm accounts={accounts} payees={payees} />
        <ScheduledList items={scheduled} />
      </div>
      <AddPayeeCard />
      <PayeesList items={payees} />
    </div>
  );
}

function SchedulePaymentForm({
  accounts,
  payees,
}: {
  accounts: Account[];
  payees: Payee[];
}) {
  const [state, formAction, pending] = useActionState(schedulePaymentAction, initial);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (state.message && !state.ok && !state.fieldErrors) toast.error(state.message);
  }, [state]);

  if (payees.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Add a payee on the right to schedule your first payment.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">Schedule a payment</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="payeeId">Payee</Label>
          <select
            id="payeeId"
            name="payeeId"
            required
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            defaultValue={payees[0]?.id}
          >
            {payees.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.nickname ? `(${p.nickname})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fromAccountId">From account</Label>
          <select
            id="fromAccountId"
            name="fromAccountId"
            required
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
            defaultValue={accounts[0]?.id}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {currency(a.balance)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="scheduledDate">Date</Label>
          <Input id="scheduledDate" name="scheduledDate" type="date" defaultValue={today} required />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="memo">Memo (optional)</Label>
          <Input id="memo" name="memo" maxLength={80} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="payNow" className="size-4 accent-violet-500" />
        Pay immediately instead of scheduling
      </label>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Saving…
          </>
        ) : (
          "Schedule payment"
        )}
      </button>
    </form>
  );
}

function ScheduledList({ items }: { items: Scheduled[] }) {
  const [pending, start] = useTransition();
  const cancel = (id: number) =>
    start(async () => {
      const res = await cancelPaymentAction(id);
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold">Scheduled & history</h2>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">
          No scheduled payments yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="font-medium">{p.payeeName}</p>
                <p className="text-xs text-muted-foreground">
                  {p.accountName} · {formatDate(new Date(p.scheduledDate))}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold">{currency(p.amount)}</p>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                    p.status === "scheduled"
                      ? "text-violet-500"
                      : p.status === "paid"
                      ? "text-success"
                      : "text-muted-foreground"
                  }`}
                >
                  {p.status === "scheduled" && <Clock className="size-3" />}
                  {p.status === "paid" && <CheckCircle2 className="size-3" />}
                  {p.status}
                </span>
              </div>
              {p.status === "scheduled" && (
                <button
                  onClick={() => cancel(p.id)}
                  disabled={pending}
                  aria-label="Cancel"
                  className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddPayeeCard() {
  const [state, formAction, pending] = useActionState(addPayeeAction, initial);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      setOpen(false);
    } else if (state.message && !state.ok && !state.fieldErrors) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Add a payee</h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted"
          aria-label={open ? "Cancel" : "Add payee"}
        >
          <Plus className={`size-4 transition ${open ? "rotate-45" : ""}`} />
        </button>
      </div>
      {open && (
        <form action={formAction} className="mt-4 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="payee-name">Name</Label>
            <Input id="payee-name" name="name" required placeholder="e.g. Con Edison" />
            {state.fieldErrors?.name && (
              <p className="text-xs text-danger">{state.fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="payee-nickname">Nickname (optional)</Label>
            <Input id="payee-nickname" name="nickname" placeholder="Electricity" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="payee-account">Account number</Label>
            <Input id="payee-account" name="accountNumber" required placeholder="123456789" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="payee-category">Category</Label>
            <Input id="payee-category" name="category" placeholder="Utilities" />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-9 w-full items-center justify-center rounded-full bg-navy-900 text-xs font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add payee"}
          </button>
        </form>
      )}
    </div>
  );
}

function PayeesList({ items }: { items: Payee[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-base font-semibold">Your payees</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          You haven&apos;t added any payees yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((p) => (
            <li key={p.id} className="rounded-lg bg-muted/40 p-3 text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.nickname ? `${p.nickname} · ` : ""}
                {maskAccount(p.accountNumber)}
                {p.category ? ` · ${p.category}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
