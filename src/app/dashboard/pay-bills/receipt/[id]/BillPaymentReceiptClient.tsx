"use client";

import {
  CheckCircle2,
  Clock,
  Download,
  Mail,
  Printer,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { currency, maskAccount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buildBillPaymentPdf } from "@/lib/bill-pdf";

type PaymentLite = {
  id: number;
  referenceNumber: string;
  amount: number;
  status: "scheduled" | "paid" | "failed" | "cancelled";
  memo: string | null;
  scheduledDateIso: string;
  createdAtIso: string;
};

type PayeeLite = {
  name: string;
  nickname: string | null;
  accountNumber: string;
  category: string | null;
  payeeType: string | null;
  bankName: string | null;
  routingNumber: string | null;
};

type AccountLite = {
  name: string;
  type: string;
  accountNumber: string;
  currency: string;
};

type CustomerLite = {
  firstName: string;
  lastName: string;
  email: string;
};

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  paid: {
    label: "Paid",
    cls: "bg-success/15 text-success",
  },
  scheduled: {
    label: "Scheduled",
    cls: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  },
  failed: { label: "Failed", cls: "bg-danger/15 text-danger" },
  cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground" },
};
const STATUS_ICON: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  paid: CheckCircle2,
  scheduled: Clock,
  failed: XCircle,
  cancelled: XCircle,
};

export function BillPaymentReceiptClient({
  payment,
  payee,
  account,
  customer,
}: {
  payment: PaymentLite;
  payee: PayeeLite | null;
  account: AccountLite | null;
  customer: CustomerLite;
}) {
  const StatusIcon = STATUS_ICON[payment.status] ?? Clock;
  const pill = STATUS_PILL[payment.status] ?? STATUS_PILL.scheduled;
  const code = account?.currency ?? "USD";
  const scheduled = new Date(payment.scheduledDateIso);
  const created = new Date(payment.createdAtIso);

  function print() {
    window.print();
  }

  async function downloadPdf() {
    const blob = await buildBillPaymentPdf({
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      currency: code,
      status: payment.status,
      memo: payment.memo,
      scheduledDate: scheduled.getTime(),
      createdAt: created.getTime(),
      customerName: `${customer.firstName} ${customer.lastName}`.trim(),
      customerEmail: customer.email,
      fromAccountName: account?.name ?? "—",
      fromAccountNumber: account?.accountNumber ?? "",
      fromAccountType: account?.type ?? "",
      payeeName: payee?.name ?? "—",
      payeeNickname: payee?.nickname ?? null,
      payeeAccountNumber: payee?.accountNumber ?? "",
      payeeCategory: payee?.category ?? null,
      payeeBank: payee?.bankName ?? null,
      payeeRoutingNumber: payee?.routingNumber ?? null,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paxnova-trust-receipt-${payment.referenceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Toolbar — hidden on print */}
      <div className="print:hidden mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Payment receipt
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {payment.referenceNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={print}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
          >
            <Printer className="size-4" />
            Print
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-violet-500 px-4 text-sm font-semibold text-white shadow-soft hover:bg-violet-600"
          >
            <Download className="size-4" />
            <span className="hidden sm:inline">Download</span> PDF
          </button>
        </div>
      </div>

      {/* The receipt itself */}
      <article
        id="receipt"
        className="overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-soft print:border-0 print:shadow-none"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border bg-gradient-to-br from-navy-900 to-[#050B1F] px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <Logo variant="mono-light" size={32} noAnimate />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-300">
              Payment receipt
            </p>
            <p className="mt-0.5 font-mono text-xs">
              {payment.referenceNumber}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-white/70">
              <ShieldCheck className="size-3 text-gold-300" />
              Member FDIC · NMLS #2026-NT
            </p>
          </div>
        </header>

        {/* Hero amount */}
        <div className="flex flex-col items-center gap-2 border-b border-border px-6 py-7 text-center">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
              pill.cls,
            )}
          >
            <StatusIcon className="size-3.5" />
            {pill.label}
          </span>
          <p className="font-display text-5xl font-semibold tabular-nums tracking-tight">
            {currency(payment.amount, code)}
          </p>
          <p className="text-xs text-muted-foreground">
            {payment.status === "paid"
              ? `Paid on ${formatDate(scheduled)}`
              : payment.status === "scheduled"
                ? `Scheduled for ${formatDate(scheduled)}`
                : payment.status === "failed"
                  ? `Failed on ${formatDate(scheduled)}`
                  : `Cancelled`}
          </p>
        </div>

        {/* From / To grid */}
        <section className="grid gap-0 border-b border-border sm:grid-cols-2">
          <div className="border-b border-border p-6 sm:border-b-0 sm:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">
              From
            </p>
            <p className="mt-2 font-display text-lg font-semibold tracking-tight">
              {`${customer.firstName} ${customer.lastName}`.trim()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {customer.email}
            </p>
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row label="Account" value={account?.name ?? "—"} />
              <Row
                label="Number"
                value={
                  account?.accountNumber
                    ? maskAccount(account.accountNumber)
                    : "—"
                }
              />
              <Row
                label="Type"
                value={
                  account?.type
                    ? account.type[0].toUpperCase() + account.type.slice(1)
                    : "—"
                }
              />
              <Row label="Bank" value="Paxnova Trust Bank, N.A." />
            </dl>
          </div>
          <div className="p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">
              To
            </p>
            <p className="mt-2 font-display text-lg font-semibold tracking-tight">
              {payee?.nickname ?? payee?.name ?? "—"}
            </p>
            {payee?.nickname && payee?.name && (
              <p className="mt-1 text-xs text-muted-foreground">
                {payee.name}
              </p>
            )}
            <dl className="mt-4 space-y-1.5 text-sm">
              <Row label="Account at payee" value={payee?.accountNumber ?? "—"} />
              <Row label="Category" value={payee?.category ?? "—"} />
              <Row
                label="Type"
                value={
                  payee?.payeeType
                    ? payee.payeeType.replace("-", " ")
                    : "—"
                }
              />
              {payee?.bankName && (
                <Row label="Receiving bank" value={payee.bankName} />
              )}
              {payee?.routingNumber && (
                <Row label="Routing" value={payee.routingNumber} />
              )}
            </dl>
          </div>
        </section>

        {/* Meta block */}
        <section className="grid gap-0 sm:grid-cols-3">
          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Reference number
            </p>
            <p className="mt-1 font-mono text-sm font-semibold">
              {payment.referenceNumber}
            </p>
          </div>
          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Submitted
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatDateTime(created)}
            </p>
          </div>
          <div className="p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {payment.status === "scheduled"
                ? "Scheduled for"
                : "Payment date"}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {formatDate(scheduled)}
            </p>
          </div>
        </section>

        {payment.memo && (
          <section className="border-t border-border bg-muted/30 px-6 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Memo
            </p>
            <p className="mt-1 text-sm">{payment.memo}</p>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-border bg-card px-6 py-5 text-[11px] leading-relaxed text-muted-foreground">
          <p>
            Keep this receipt for your records. The reference number above is
            required for any disputes or inquiries. Funds availability and
            posting timing at the receiving institution may vary; most
            domestic payees post within 1–2 business days.
          </p>
          <p className="mt-2">
            Paxnova Trust Bank, N.A. · 1000 N Point St, San Francisco, CA
            94109 · 1-800-PAXNOVA-1 · paxnovatrust.com · Member FDIC
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5">
            <Mail className="size-3" />
            Questions? Email{" "}
            <a
              href="mailto:billpay@paxnovatrust.com"
              className="text-violet-500"
            >
              billpay@paxnovatrust.com
            </a>
          </p>
        </footer>
      </article>

      {/* Print stylesheet — drop everything except the receipt + force a
          clean white page. */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 18mm 14mm; size: letter; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0 last:pb-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono text-sm">{value}</dd>
    </div>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
