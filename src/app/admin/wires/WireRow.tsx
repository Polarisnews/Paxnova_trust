"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  approveWireAction,
  rejectWireAction,
} from "@/app/actions/wires";

export function WireRow({
  wireId,
  referenceNumber,
}: {
  wireId: number;
  referenceNumber: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    start(async () => {
      const res = await approveWireAction(wireId);
      if (res.ok) {
        toast.success(`Wire ${referenceNumber} approved.`);
        router.refresh();
      } else {
        toast.error(res.message ?? "Couldn't approve wire.");
      }
    });
  }

  function reject() {
    if (reason.trim().length < 4) {
      toast.error("Reason needs at least 4 characters.");
      return;
    }
    start(async () => {
      const res = await rejectWireAction(wireId, reason);
      if (res.ok) {
        toast.success(`Wire ${referenceNumber} rejected.`);
        setOpen(false);
        setReason("");
        router.refresh();
      } else {
        toast.error(res.message ?? "Couldn't reject wire.");
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={approve}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-success/15 px-3 text-xs font-medium text-success hover:bg-success/25 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <>
            <Check className="size-3.5" />
            Approve
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-danger/15 px-3 text-xs font-medium text-danger hover:bg-danger/25 disabled:opacity-60"
      >
        <X className="size-3.5" />
        Reject
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-foreground/30"
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-elev">
            <h3 className="font-display text-base font-semibold">
              Reject wire {referenceNumber}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              The customer will see this reason on their rejection receipt.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 400))}
              rows={4}
              autoFocus
              placeholder="e.g. Documentation incomplete — please resubmit with a signed wire authorization."
              className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{400 - reason.length} chars left</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setReason("");
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={reject}
                  disabled={pending || reason.trim().length < 4}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-danger px-4 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <>
                      <X className="size-3.5" /> Reject wire
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
