"use client";

import { useActionState, useEffect } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { transferAction, type ActionState } from "@/app/actions/banking";
import { currency, maskAccount } from "@/lib/format";

type Account = {
  id: number;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
};

const initial: ActionState = { ok: false };

export function TransferForm({ accounts }: { accounts: Account[] }) {
  const [state, formAction, pending] = useActionState(transferAction, initial);

  useEffect(() => {
    if (state.message) {
      if (state.ok) toast.success(state.message);
      else if (!state.fieldErrors) toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="fromAccountId">From</Label>
        <select
          id="fromAccountId"
          name="fromAccountId"
          required
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          defaultValue={accounts[0]?.id}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {maskAccount(a.accountNumber)} · {currency(a.balance)}
            </option>
          ))}
        </select>
        {state.fieldErrors?.fromAccountId && (
          <p className="text-xs text-danger">{state.fieldErrors.fromAccountId}</p>
        )}
      </div>

      <div className="flex justify-center text-muted-foreground">
        <ArrowDown className="size-5" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="toAccountId">To</Label>
        <select
          id="toAccountId"
          name="toAccountId"
          required
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          defaultValue={accounts[1]?.id ?? accounts[0]?.id}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {maskAccount(a.accountNumber)}
            </option>
          ))}
        </select>
        {state.fieldErrors?.toAccountId && (
          <p className="text-xs text-danger">{state.fieldErrors.toAccountId}</p>
        )}
      </div>

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
              className="pl-7"
              placeholder="0.00"
            />
          </div>
          {state.fieldErrors?.amount && (
            <p className="text-xs text-danger">{state.fieldErrors.amount}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="memo">Memo (optional)</Label>
          <Input id="memo" name="memo" maxLength={80} placeholder="What's this for?" />
        </div>
      </div>

      {state.message && !state.ok && !state.fieldErrors && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || accounts.length < 2}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Sending…
          </>
        ) : (
          "Transfer"
        )}
      </button>

      {accounts.length < 2 && (
        <p className="text-center text-xs text-muted-foreground">
          You need at least two accounts to transfer between them.
        </p>
      )}
    </form>
  );
}
