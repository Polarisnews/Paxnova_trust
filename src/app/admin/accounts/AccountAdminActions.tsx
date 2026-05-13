"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  adjustBalanceAction,
  setAccountStatusAction,
  type AdminState,
} from "@/app/actions/admin";

const initial: AdminState = { ok: false };

export function AccountAdminActions({
  accountId,
  status,
}: {
  accountId: number;
  status: "active" | "frozen" | "closed";
}) {
  const [pending, start] = useTransition();
  const [state, formAction, saving] = useActionState(adjustBalanceAction, initial);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      setOpen(false);
    } else if (state.message && !state.ok) toast.error(state.message);
  }, [state]);

  const flip = (next: "active" | "frozen" | "closed") =>
    start(async () => {
      const res = await setAccountStatusAction(accountId, next);
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      {status === "active" ? (
        <button
          onClick={() => flip("frozen")}
          disabled={pending}
          className="inline-flex h-7 items-center rounded-full bg-violet-500/15 px-3 font-medium text-violet-500 hover:bg-violet-500/25 disabled:opacity-60"
        >
          Freeze
        </button>
      ) : (
        <button
          onClick={() => flip("active")}
          disabled={pending}
          className="inline-flex h-7 items-center rounded-full bg-success/15 px-3 font-medium text-success hover:bg-success/25 disabled:opacity-60"
        >
          Reactivate
        </button>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 items-center rounded-full bg-muted px-3 font-medium hover:bg-muted/70"
      >
        Adjust
      </button>
      {open && (
        <form
          action={formAction}
          className="absolute right-8 mt-32 w-72 -translate-y-32 rounded-xl border border-border bg-card p-4 shadow-elev"
        >
          <input type="hidden" name="accountId" value={accountId} />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Manual ledger entry
          </p>
          <div className="mt-3 space-y-2">
            <Input name="delta" type="number" step="0.01" placeholder="Amount (+/−)" required />
            <Input name="reason" maxLength={80} placeholder="Reason" required />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-full bg-violet-500 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-3 animate-spin" /> : "Post adjustment"}
          </button>
        </form>
      )}
    </div>
  );
}
