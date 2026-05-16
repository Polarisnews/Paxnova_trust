"use client";

import { useActionState, useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteApplicationAction,
  editApplicationAction,
  setUserPasswordAction,
  type AdminState,
} from "@/app/actions/admin";

type ManageProps = {
  app: {
    id: number;
    referenceNumber: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string | null;
    product: string;
    fundingAmount: number | null;
    notes: string | null;
    userId: number | null;
  };
};

const initial: AdminState = { ok: false };

const PRODUCTS = [
  { value: "checking", label: "Apex Checking" },
  { value: "savings", label: "Reserve High-Yield Savings" },
  { value: "credit-card", label: "Signature Rewards Card" },
  { value: "mortgage", label: "Mortgage Pre-approval" },
  { value: "business", label: "Business Operating Account" },
];

export function ApplicationManageActions({ app }: ManageProps) {
  const [editing, setEditing] = useState(false);
  const [resettingPw, setResettingPw] = useState(false);
  const [deletePending, startDelete] = useTransition();

  function handleDelete() {
    const ok = window.confirm(
      `Permanently delete application ${app.referenceNumber}? This removes uploaded documents from disk too. The customer's user account is not deleted.`
    );
    if (!ok) return;
    startDelete(async () => {
      const res = await deleteApplicationAction(app.id);
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
          Admin manage
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing((v) => !v);
              if (resettingPw) setResettingPw(false);
            }}
            className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card px-3 text-[11px] font-semibold hover:bg-muted"
          >
            {editing ? (
              <>
                <X className="size-3" /> Cancel edit
              </>
            ) : (
              <>
                <Pencil className="size-3" /> Edit
              </>
            )}
          </button>
          {app.userId != null && (
            <button
              type="button"
              onClick={() => {
                setResettingPw((v) => !v);
                if (editing) setEditing(false);
              }}
              className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card px-3 text-[11px] font-semibold hover:bg-muted"
            >
              {resettingPw ? (
                <>
                  <X className="size-3" /> Cancel
                </>
              ) : (
                <>
                  <KeyRound className="size-3" /> Reset password
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletePending}
            className="inline-flex h-7 items-center gap-1 rounded-full bg-danger/15 px-3 text-[11px] font-semibold text-danger hover:bg-danger/25 disabled:opacity-60"
          >
            {deletePending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            Delete
          </button>
        </div>
      </div>

      {editing && <EditForm app={app} onDone={() => setEditing(false)} />}
      {resettingPw && app.userId != null && (
        <ResetPasswordForm
          userId={app.userId}
          email={app.applicantEmail}
          onDone={() => setResettingPw(false)}
        />
      )}
    </div>
  );
}

function EditForm({
  app,
  onDone,
}: {
  app: ManageProps["app"];
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    editApplicationAction,
    initial
  );

  // After a successful edit, close the panel and surface the toast.
  if (state.ok && state.message) {
    toast.success(state.message);
    queueMicrotask(onDone);
  } else if (state.message && !state.fieldErrors && state.ok === false) {
    // Only toast non-field errors; field errors render inline below.
    toast.error(state.message);
  }

  const err = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-2 rounded-md bg-card p-3 text-xs">
      <input type="hidden" name="id" value={app.id} />

      <div className="grid gap-2 sm:grid-cols-2">
        <Field
          label="Applicant name"
          name="applicantName"
          defaultValue={app.applicantName}
          error={err.applicantName}
        />
        <Field
          label="Email"
          name="applicantEmail"
          type="email"
          defaultValue={app.applicantEmail}
          error={err.applicantEmail}
        />
        <Field
          label="Phone"
          name="applicantPhone"
          defaultValue={app.applicantPhone ?? ""}
          error={err.applicantPhone}
        />
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Product
          </label>
          <select
            name="product"
            defaultValue={app.product}
            className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          >
            {PRODUCTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Funding amount"
          name="fundingAmount"
          type="number"
          defaultValue={app.fundingAmount?.toString() ?? ""}
          error={err.fundingAmount}
        />
        <Field
          label="Funding source"
          name="fundingSource"
          defaultValue=""
          error={err.fundingSource}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Notes
        </label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={app.notes ?? ""}
          className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-7 items-center rounded-full border border-border bg-card px-3 text-[11px] font-semibold hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-violet-500 px-3 text-[11px] font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Save className="size-3" />
          )}
          Save changes
        </button>
      </div>
    </form>
  );
}

function ResetPasswordForm({
  userId,
  email,
  onDone,
}: {
  userId: number;
  email: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    setUserPasswordAction,
    initial
  );
  const [show, setShow] = useState(false);

  if (state.ok && state.message) {
    toast.success(state.message);
    queueMicrotask(onDone);
  } else if (state.message && !state.fieldErrors && state.ok === false) {
    toast.error(state.message);
  }

  const err = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-2 rounded-md bg-card p-3 text-xs"
    >
      <input type="hidden" name="userId" value={userId} />
      <p>
        Setting a new sign-in password for{" "}
        <span className="font-mono">{email}</span>. They&apos;ll use this on
        their next sign-in.
      </p>
      <div className="space-y-1">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          New password
        </label>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            required
            minLength={8}
            placeholder="At least 8 chars · 1 uppercase · 1 number"
            className="h-8 w-full rounded-md border border-input bg-transparent px-2 pr-8 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide" : "Show"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          >
            {show ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
          </button>
        </div>
        {err.password && (
          <p className="text-[11px] text-danger">{err.password}</p>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-7 items-center rounded-full border border-border bg-card px-3 text-[11px] font-semibold hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-violet-500 px-3 text-[11px] font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <KeyRound className="size-3" />
          )}
          Set new password
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
      />
      {error && <p className="text-[11px] text-danger">{error}</p>}
    </div>
  );
}
