"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, Clock, Download, Loader2, Printer, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { currency, formatDate, maskAccount } from "@/lib/format";
import { downloadWirePdf } from "@/lib/wire-pdf";

type Wire = {
  referenceNumber: string;
  amount: number;
  fee: number;
  status: string;
  wireDate: number;
  createdAt: number;
  reviewedAt: number | null;
  isRepeating: boolean;
  repeatFrequency: string | null;
  messageToBank: string | null;
  messageToRecipient: string | null;
  memo: string | null;
  interruptMessage: string | null;
  rejectionReason: string | null;
};

type Account = {
  name: string;
  accountNumber: string;
  routingNumber: string;
  currency: string;
};

type Recipient = {
  recipientName: string;
  recipientNickname: string | null;
  bankName: string;
  bankRoutingNumber: string;
  bankCountry: string;
  bankAddress: string | null;
  bankCity: string | null;
  bankState: string | null;
  bankZip: string | null;
  accountNumber: string;
  recipientCountry: string | null;
  recipientAddress1: string | null;
  recipientCity: string | null;
  recipientState: string | null;
  recipientZip: string | null;
};

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "Pending", cls: "bg-violet-500/15 text-violet-500" },
  approved: { label: "Completed", cls: "bg-success/15 text-success" },
  rejected: { label: "Rejected", cls: "bg-danger/15 text-danger" },
  pending_tcv: { label: "Awaiting TCV", cls: "bg-violet-500/15 text-violet-500" },
  pending_aml: { label: "Awaiting AML", cls: "bg-violet-500/15 text-violet-500" },
  interrupted_custom: { label: "Interrupted", cls: "bg-gold-500/15 text-gold-700 dark:text-gold-300" },
  rejected_frozen: { label: "Account frozen", cls: "bg-danger/15 text-danger" },
};

export function WireDetail({
  wire,
  fromAccount,
  recipient,
  reviewerName,
}: {
  wire: Wire;
  fromAccount: Account | null;
  recipient: Recipient | null;
  reviewerName: string | null;
}) {
  const [busy, setBusy] = useState(false);

  const isApproved = wire.status === "approved";
  const isRejected = wire.status === "rejected";
  const isPending = wire.status === "scheduled";

  async function downloadPdf() {
    if (!fromAccount || !recipient) {
      toast.error("Wire data is incomplete — can't generate PDF.");
      return;
    }
    if (!isApproved && !isRejected) {
      toast.error("PDF is only available after admin review.");
      return;
    }
    setBusy(true);
    try {
      await downloadWirePdf({
        referenceNumber: wire.referenceNumber,
        amount: wire.amount,
        fee: wire.fee,
        currency: fromAccount.currency,
        wireDate: wire.wireDate,
        scheduledAt: wire.createdAt,
        reviewedAt: wire.reviewedAt,
        reviewerName,
        status: isApproved ? "approved" : "rejected",
        rejectionReason: wire.rejectionReason,
        fromAccountName: fromAccount.name,
        fromAccountNumber: fromAccount.accountNumber,
        fromBankName: "Paxnova Trust Bank",
        fromRoutingNumber: fromAccount.routingNumber,
        recipientName: recipient.recipientName,
        recipientNickname: recipient.recipientNickname,
        recipientBank: recipient.bankName,
        recipientBankRouting: recipient.bankRoutingNumber,
        recipientBankCountry: recipient.bankCountry,
        recipientBankAddress: [
          recipient.bankAddress,
          recipient.bankCity,
          recipient.bankState,
          recipient.bankZip,
        ]
          .filter(Boolean)
          .join(", ") || null,
        recipientAccountNumber: recipient.accountNumber,
        recipientAddress: [
          recipient.recipientAddress1,
          recipient.recipientCity,
          recipient.recipientState,
          recipient.recipientZip,
        ]
          .filter(Boolean)
          .join(", ") || null,
        messageToBank: wire.messageToBank,
        messageToRecipient: wire.messageToRecipient,
        memo: wire.memo,
      });
    } catch (err) {
      console.error("[wire-pdf]", err);
      toast.error("Couldn't build the PDF.");
    } finally {
      setBusy(false);
    }
  }

  const pill = STATUS_PILL[wire.status] ?? {
    label: wire.status,
    cls: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {isPending && (
        <Banner
          tone="violet"
          icon={Clock}
          title="This wire is pending"
          body="It usually takes 1 to 5 business days to complete. You will be able to print the wire slip once completed."
        />
      )}
      {isApproved && (
        <Banner
          tone="success"
          icon={ShieldCheck}
          title="Wire completed"
          body="Funds have been credited to the recipient's account."
        />
      )}
      {isRejected && (
        <Banner
          tone="danger"
          icon={XCircle}
          title="Rejected — wire not sent"
          body={
            wire.rejectionReason ||
            "An operations officer declined this request. No funds were debited."
          }
          bold
        />
      )}

      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Wire reference
            </p>
            <p className="mt-1 font-mono text-lg">{wire.referenceNumber}</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
              {currency(wire.amount, fromAccount?.currency || "USD")}
            </h1>
            <p className="text-sm text-muted-foreground">
              + {currency(wire.fee, fromAccount?.currency || "USD")} fee · Total{" "}
              {currency(
                wire.amount + wire.fee,
                fromAccount?.currency || "USD"
              )}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${pill.cls}`}
          >
            {pill.label}
          </span>
        </div>

        {isApproved && (
          <Link
            href={`/dashboard/wires/${encodeURIComponent(
              wire.referenceNumber
            )}/slip`}
            className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
          >
            <Printer className="size-4" />
            Print wire slip
          </Link>
        )}
        {isRejected && (
          <button
            type="button"
            onClick={downloadPdf}
            disabled={busy}
            className="mt-5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Download className="size-4" />
                Download rejection receipt (PDF)
              </>
            )}
          </button>
        )}
      </div>

      {/* Wire details */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="From">
          {fromAccount ? (
            <>
              <Row label="Account" value={fromAccount.name} />
              <Row
                label="Account number"
                value={maskAccount(fromAccount.accountNumber)}
              />
              <Row label="Routing (ABA)" value={fromAccount.routingNumber} />
              <Row label="Bank" value="Paxnova Trust Bank" />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Source account closed.</p>
          )}
        </Card>

        <Card title="To">
          {recipient ? (
            <>
              <Row
                label="Recipient"
                value={
                  recipient.recipientNickname
                    ? `${recipient.recipientName} (${recipient.recipientNickname})`
                    : recipient.recipientName
                }
              />
              <Row
                label="Account number"
                value={maskAccount(recipient.accountNumber)}
              />
              <Row label="Bank" value={recipient.bankName} />
              <Row
                label="Routing / SWIFT"
                value={recipient.bankRoutingNumber}
                mono
              />
              <Row label="Bank country" value={recipient.bankCountry} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Recipient removed.</p>
          )}
        </Card>
      </div>

      <Card title="Schedule">
        <Row label="Wire date" value={formatDate(wire.wireDate)} />
        <Row label="Submitted" value={formatDate(wire.createdAt)} />
        {wire.isRepeating && wire.repeatFrequency && (
          <Row label="Repeats" value={wire.repeatFrequency} />
        )}
      </Card>

      {(wire.messageToBank || wire.messageToRecipient || wire.memo) && (
        <Card title="Messages">
          {wire.messageToBank && (
            <Row label="To recipient bank" value={wire.messageToBank} />
          )}
          {wire.messageToRecipient && (
            <Row label="To recipient" value={wire.messageToRecipient} />
          )}
          {wire.memo && <Row label="Memo (private)" value={wire.memo} />}
        </Card>
      )}
    </div>
  );
}

function Banner({
  tone,
  icon: Icon,
  title,
  body,
  bold,
}: {
  tone: "violet" | "success" | "danger";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  bold?: boolean;
}) {
  const cls =
    tone === "success"
      ? "border-success/40 bg-success/5 text-foreground"
      : tone === "danger"
      ? "border-danger/40 bg-danger/5 text-foreground"
      : "border-violet-500/30 bg-violet-500/5 text-foreground";
  const iconCls =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "danger"
      ? "bg-danger/15 text-danger"
      : "bg-violet-500/15 text-violet-500";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full ${iconCls}`}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{title}</p>
          <p
            className={
              "mt-1 text-sm " + (bold ? "font-bold" : "text-muted-foreground")
            }
          >
            {body}
          </p>
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
    <div className="rounded-2xl border border-border bg-card p-5">
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
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={"text-right " + (mono ? "font-mono" : "font-medium")}>
        {value}
      </dd>
    </div>
  );
}
