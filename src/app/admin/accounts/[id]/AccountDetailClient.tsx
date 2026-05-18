"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Loader2,
  Pencil,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  backdateAccountAction,
  deleteTransactionAction,
  updateTransactionAction,
  type AdminState,
} from "@/app/actions/admin";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";

type TxRow = {
  id: number;
  type: "debit" | "credit";
  amount: number;
  description: string;
  category: string;
  counterparty: string;
  balanceAfter: number;
  referenceNumber: string | null;
  createdAtIso: string;
};

const initial: AdminState = { ok: false };

export function AccountDetailClient({
  accountId,
  accountCurrency,
  openedAtIso,
  transactions,
}: {
  accountId: number;
  accountCurrency: string;
  openedAtIso: string;
  transactions: TxRow[];
}) {
  // ── State for the backdate form ────────────────────────────────────
  const [backdateState, backdateAction, backdatePending] = useActionState(
    backdateAccountAction,
    initial,
  );
  const [openedAtInput, setOpenedAtInput] = useState(() =>
    openedAtIso.slice(0, 10),
  );

  useEffect(() => {
    if (backdateState.ok && backdateState.message) {
      toast.success(backdateState.message);
    } else if (!backdateState.ok && backdateState.message) {
      toast.error(backdateState.message);
    }
  }, [backdateState]);

  // ── State for the transactions table ───────────────────────────────
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<TxRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TxRow | null>(null);

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => {
      const hay =
        `${t.description} ${t.counterparty} ${t.category} ${t.referenceNumber ?? ""} ${t.amount}`.toLowerCase();
      return hay.includes(q);
    });
  }, [transactions, filter]);

  return (
    <div className="space-y-6">
      {/* ── Backdate form ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Backdate account open date
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Set the date this account was opened. Used on statements,
              receipts, and the customer dashboard. Must be on or before
              today.
            </p>
          </div>
          <form
            action={backdateAction}
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
          >
            <input
              type="hidden"
              name="accountId"
              value={accountId}
              readOnly
            />
            <div>
              <label
                htmlFor="openedAt"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Open date
              </label>
              <div className="relative mt-1">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="openedAt"
                  name="openedAt"
                  type="date"
                  required
                  max={new Date().toISOString().slice(0, 10)}
                  value={openedAtInput}
                  onChange={(e) => setOpenedAtInput(e.target.value)}
                  className="h-10 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={backdatePending}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
            >
              {backdatePending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save open date
            </button>
          </form>
        </div>
      </section>

      {/* ── Transactions ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Transactions
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Edit any field — amount changes recompute the balance chain
              instantly across the customer dashboard, statements, and
              receipts.
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Filter description, counterparty, ref…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-9 w-60 rounded-full border border-border bg-background pl-8 pr-3 text-xs focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No transactions match this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Counterparty
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Balance after
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {new Date(t.createdAtIso).toLocaleDateString()}
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        {new Date(t.createdAtIso).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium leading-tight">
                        {t.description}
                      </p>
                      {t.category && (
                        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          {t.category}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.counterparty || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-semibold",
                          t.type === "credit"
                            ? "text-success"
                            : "text-foreground",
                        )}
                      >
                        {t.type === "credit" ? (
                          <ArrowDownLeft className="size-3" />
                        ) : (
                          <ArrowUpRight className="size-3" />
                        )}
                        {t.type === "credit" ? "+" : "−"}
                        {currency(t.amount, accountCurrency).replace(/^[^\d-]+/, "")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                      {currency(t.balanceAfter, accountCurrency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(t)}
                          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Edit transaction"
                          title="Edit"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(t)}
                          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger"
                          aria-label="Delete transaction"
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <EditTransactionDialog
        tx={editing}
        currency={accountCurrency}
        onClose={() => setEditing(null)}
      />

      <DeleteTransactionDialog
        tx={confirmDelete}
        currency={accountCurrency}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Edit dialog
// ──────────────────────────────────────────────────────────────────────

function EditTransactionDialog({
  tx,
  currency: code,
  onClose,
}: {
  tx: TxRow | null;
  currency: string;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(
    updateTransactionAction,
    initial,
  );

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      onClose();
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state, onClose]);

  return (
    <Dialog open={Boolean(tx)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="min-w-0">
            <DialogTitle className="font-display text-base font-semibold tracking-tight">
              Edit transaction
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-muted-foreground">
              Saving rebuilds the balance chain. Customer-facing receipts and
              statements update on the next page load.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {tx && (
          <form action={action} className="space-y-3 p-5">
            <input type="hidden" name="transactionId" value={tx.id} readOnly />

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Date & time"
                error={state.fieldErrors?.createdAt}
              >
                <input
                  type="datetime-local"
                  name="createdAt"
                  required
                  defaultValue={tx.createdAtIso.slice(0, 16)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
                />
              </Field>
              <Field label="Type" error={state.fieldErrors?.type}>
                <select
                  name="type"
                  defaultValue={tx.type}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
                >
                  <option value="credit">Credit (deposit / +)</option>
                  <option value="debit">Debit (withdrawal / −)</option>
                </select>
              </Field>
            </div>

            <Field
              label={`Amount (${code})`}
              error={state.fieldErrors?.amount}
            >
              <input
                type="number"
                name="amount"
                required
                step="0.01"
                min="0.01"
                defaultValue={tx.amount}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-mono focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
              />
            </Field>

            <Field
              label="Description"
              error={state.fieldErrors?.description}
            >
              <input
                type="text"
                name="description"
                required
                maxLength={200}
                defaultValue={tx.description}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Category (optional)"
                error={state.fieldErrors?.category}
              >
                <input
                  type="text"
                  name="category"
                  maxLength={80}
                  defaultValue={tx.category}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
                />
              </Field>
              <Field
                label="Counterparty (optional)"
                error={state.fieldErrors?.counterparty}
              >
                <input
                  type="text"
                  name="counterparty"
                  maxLength={160}
                  defaultValue={tx.counterparty}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
                />
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-between">
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
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save changes
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Delete confirmation dialog
// ──────────────────────────────────────────────────────────────────────

function DeleteTransactionDialog({
  tx,
  currency: code,
  onClose,
}: {
  tx: TxRow | null;
  currency: string;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function confirm() {
    if (!tx) return;
    startTransition(async () => {
      const res = await deleteTransactionAction(tx.id);
      if (res.ok) {
        toast.success(res.message ?? "Transaction deleted.");
        onClose();
      } else {
        toast.error(res.message ?? "Couldn't delete.");
      }
    });
  }

  return (
    <Dialog open={Boolean(tx)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-md p-0">
        <div className="px-5 pb-5 pt-4">
          <DialogTitle className="font-display text-base font-semibold tracking-tight">
            Delete this transaction?
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            The balance chain for this account will recompute. The customer
            will see the change on their next dashboard load. This cannot be
            undone.
          </DialogDescription>

          {tx && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium">{tx.description}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(tx.createdAtIso).toLocaleString()} ·{" "}
                <span
                  className={
                    tx.type === "credit"
                      ? "text-success font-semibold"
                      : "text-foreground font-semibold"
                  }
                >
                  {tx.type === "credit" ? "+" : "−"}
                  {currency(tx.amount, code).replace(/^[^\d-]+/, "")} {code}
                </span>
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={pending}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-danger px-5 text-sm font-semibold text-white hover:bg-danger/90 disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete transaction
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
