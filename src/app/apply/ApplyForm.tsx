"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { applyAction, type ApplyState } from "@/app/actions/apply";

const initial: ApplyState = { ok: false };

const products = [
  { value: "checking", label: "Apex Checking" },
  { value: "savings", label: "Reserve High-Yield Savings" },
  { value: "credit-card", label: "Signature Rewards Card" },
  { value: "mortgage", label: "Mortgage pre-approval" },
  { value: "business", label: "Business Operating Account" },
];

const sources = [
  "External bank account",
  "Wire transfer",
  "Direct deposit",
  "Mobile check deposit",
  "I'll fund later",
];

export function ApplyForm({
  defaultProduct,
  prefill,
}: {
  defaultProduct: string;
  prefill?: { name: string; email: string; phone: string };
}) {
  const [state, formAction, pending] = useActionState(applyAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="product">Product</Label>
        <select
          id="product"
          name="product"
          required
          defaultValue={defaultProduct}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          {products.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          About you
        </legend>
        <div className="space-y-1.5">
          <Label htmlFor="applicantName">Full legal name</Label>
          <Input
            id="applicantName"
            name="applicantName"
            required
            defaultValue={prefill?.name}
            aria-invalid={Boolean(state.fieldErrors?.applicantName)}
          />
          {state.fieldErrors?.applicantName && (
            <p className="text-xs text-danger">{state.fieldErrors.applicantName}</p>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="applicantEmail">Email</Label>
            <Input
              id="applicantEmail"
              name="applicantEmail"
              type="email"
              required
              defaultValue={prefill?.email}
              aria-invalid={Boolean(state.fieldErrors?.applicantEmail)}
            />
            {state.fieldErrors?.applicantEmail && (
              <p className="text-xs text-danger">{state.fieldErrors.applicantEmail}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="applicantPhone">Phone</Label>
            <Input
              id="applicantPhone"
              name="applicantPhone"
              type="tel"
              required
              defaultValue={prefill?.phone}
              aria-invalid={Boolean(state.fieldErrors?.applicantPhone)}
            />
            {state.fieldErrors?.applicantPhone && (
              <p className="text-xs text-danger">{state.fieldErrors.applicantPhone}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Funding (optional)
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="fundingAmount">Opening deposit</Label>
            <Input
              id="fundingAmount"
              name="fundingAmount"
              type="number"
              min="0"
              step="50"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fundingSource">Funding source</Label>
            <select
              id="fundingSource"
              name="fundingSource"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              defaultValue=""
            >
              <option value="">Select…</option>
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Anything else we should know? (optional)</Label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
        />
      </div>

      {state.message && !state.fieldErrors && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Submitting…
          </>
        ) : (
          "Submit application"
        )}
      </button>
    </form>
  );
}
