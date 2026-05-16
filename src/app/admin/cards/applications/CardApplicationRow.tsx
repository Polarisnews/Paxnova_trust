"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  approveCardApplicationAction,
  rejectCardApplicationAction,
} from "@/app/actions/cards";
import type { CardProduct } from "@/lib/card-products";
import { currency } from "@/lib/format";

export function CardApplicationRow({
  applicationId,
  reference,
  requestedLimit,
  product,
}: {
  applicationId: number;
  reference: string;
  requestedLimit: number;
  product?: CardProduct;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [overrideLimit, setOverrideLimit] = useState<number>(requestedLimit);

  function approve() {
    start(async () => {
      const res = await approveCardApplicationAction(
        applicationId,
        overrideLimit
      );
      if (res.ok) {
        toast.success(`Card issued for ${reference}.`);
        setApproveOpen(false);
        router.refresh();
      } else {
        toast.error(res.message ?? "Couldn't approve.");
      }
    });
  }

  function reject() {
    if (reason.trim().length < 4) {
      toast.error("Reason needs at least 4 characters.");
      return;
    }
    start(async () => {
      const res = await rejectCardApplicationAction(applicationId, reason);
      if (res.ok) {
        toast.success(`Application ${reference} rejected.`);
        setRejectOpen(false);
        setReason("");
        router.refresh();
      } else {
        toast.error(res.message ?? "Couldn't reject.");
      }
    });
  }

  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={() => setApproveOpen((v) => !v)}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-success/15 px-3 text-xs font-medium text-success hover:bg-success/25 disabled:opacity-60"
      >
        <Check className="size-3.5" /> Approve
      </button>
      <button
        type="button"
        onClick={() => setRejectOpen((v) => !v)}
        disabled={pending}
        className="inline-flex h-8 items-center gap-1 rounded-full bg-danger/15 px-3 text-xs font-medium text-danger hover:bg-danger/25 disabled:opacity-60"
      >
        <X className="size-3.5" /> Reject
      </button>

      {approveOpen && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setApproveOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-foreground/30"
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-elev">
            <h3 className="font-display text-base font-semibold">
              Approve {reference}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              A new credit account opens with the approved limit, and the
              card is issued immediately.
              {product
                ? ` Limits must be between ${currency(product.limitMin)} and ${currency(product.limitMax)}.`
                : ""}
            </p>
            <div className="mt-3 space-y-1.5">
              <label htmlFor="overrideLimit" className="text-xs font-medium">
                Approved credit limit
              </label>
              <input
                id="overrideLimit"
                type="number"
                step={500}
                min={product?.limitMin ?? 100}
                max={product?.limitMax ?? 1_000_000}
                value={overrideLimit}
                onChange={(e) => setOverrideLimit(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setApproveOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={approve}
                disabled={pending}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-success px-4 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Check className="size-3.5" /> Issue card
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {rejectOpen && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setRejectOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-foreground/30"
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-elev">
            <h3 className="font-display text-base font-semibold">
              Reject {reference}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              The applicant sees this reason on their dashboard.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 400))}
              rows={4}
              autoFocus
              placeholder="e.g. Insufficient income documentation. Please resubmit with the last two pay stubs."
              className="mt-3 w-full rounded-lg border border-border bg-background p-3 text-sm"
            />
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{400 - reason.length} chars left</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRejectOpen(false)}
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
                      <X className="size-3.5" /> Reject
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
