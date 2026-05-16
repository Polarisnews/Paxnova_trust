"use client";

import { useState } from "react";
import { Download, Loader2, Printer, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { currency, maskAccount } from "@/lib/format";
import { downloadWirePdf } from "@/lib/wire-pdf";

type Wire = {
  referenceNumber: string;
  amount: number;
  fee: number;
  wireDate: number;
  scheduledAt: number;
  reviewedAt: number | null;
  messageToBank: string | null;
  messageToRecipient: string | null;
  memo: string | null;
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
  accountNumber: string;
  recipientAddress: string | null;
};

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SlipView({
  wire,
  fromAccount,
  recipient,
  reviewerName,
}: {
  wire: Wire;
  fromAccount: Account;
  recipient: Recipient;
  reviewerName: string | null;
}) {
  const [busy, setBusy] = useState(false);

  async function downloadPdf() {
    setBusy(true);
    try {
      await downloadWirePdf({
        referenceNumber: wire.referenceNumber,
        amount: wire.amount,
        fee: wire.fee,
        currency: fromAccount.currency,
        wireDate: wire.wireDate,
        scheduledAt: wire.scheduledAt,
        reviewedAt: wire.reviewedAt,
        reviewerName,
        status: "approved",
        fromAccountName: fromAccount.name,
        fromAccountNumber: fromAccount.accountNumber,
        fromBankName: "Paxnova Trust Bank",
        fromRoutingNumber: fromAccount.routingNumber,
        recipientName: recipient.recipientName,
        recipientNickname: recipient.recipientNickname,
        recipientBank: recipient.bankName,
        recipientBankRouting: recipient.bankRoutingNumber,
        recipientBankCountry: recipient.bankCountry,
        recipientBankAddress: recipient.bankAddress,
        recipientAccountNumber: recipient.accountNumber,
        recipientAddress: recipient.recipientAddress,
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

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5in;
          }
          body {
            background: white !important;
          }
        }
      `}</style>

      <div className="no-print flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          <Printer className="size-4" />
          Send to printer
        </button>
        <button
          type="button"
          onClick={downloadPdf}
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Download className="size-4" />
              Download as PDF
            </>
          )}
        </button>
      </div>

      <div
        className="rounded-2xl border border-border bg-white text-black shadow-soft print:rounded-none print:border-0 print:shadow-none"
        style={{ colorScheme: "light" }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-10 py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-2xl font-bold tracking-tight">
                Paxnova Trust Bank
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Member FDIC · Routing 026013577
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                Outgoing Wire Transfer
              </p>
              <p className="mt-1 font-mono text-xs text-gray-500">
                Reference {wire.referenceNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Status banner */}
        <div className="border-b border-gray-200 bg-emerald-50 px-10 py-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">
                Completed
              </p>
              <p className="text-xs text-emerald-700/80">
                Released to the wire network. Funds credited to the recipient&apos;s account.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 px-10 py-8">
          <Section title="Sender">
            <Row label="Account holder" value={fromAccount.name} />
            <Row
              label="Account number"
              value={maskAccount(fromAccount.accountNumber)}
            />
            <Row label="Bank" value="Paxnova Trust Bank" />
            <Row label="Routing (ABA)" value={fromAccount.routingNumber} mono />
          </Section>

          <Section title="Beneficiary">
            <Row
              label="Name"
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
              label="Bank routing / SWIFT"
              value={recipient.bankRoutingNumber}
              mono
            />
            <Row label="Bank country" value={recipient.bankCountry} />
            {recipient.bankAddress && (
              <Row label="Bank address" value={recipient.bankAddress} />
            )}
            {recipient.recipientAddress && (
              <Row
                label="Recipient address"
                value={recipient.recipientAddress}
              />
            )}
          </Section>

          <Section title="Amount">
            <Row
              label="Wire amount"
              value={currency(wire.amount, fromAccount.currency)}
              mono
            />
            <Row
              label="Outgoing wire fee"
              value={currency(wire.fee, fromAccount.currency)}
              mono
            />
            <Row
              label="Total debited"
              value={currency(wire.amount + wire.fee, fromAccount.currency)}
              mono
              strong
            />
          </Section>

          {(wire.messageToBank ||
            wire.messageToRecipient ||
            wire.memo) && (
            <Section title="Messages">
              {wire.messageToBank && (
                <Row
                  label="To recipient bank"
                  value={wire.messageToBank}
                />
              )}
              {wire.messageToRecipient && (
                <Row
                  label="To recipient"
                  value={wire.messageToRecipient}
                />
              )}
              {wire.memo && (
                <Row label="Memo (sender)" value={wire.memo} />
              )}
            </Section>
          )}

          <Section title="Lifecycle">
            <Row label="Submitted" value={fmtDate(wire.scheduledAt)} />
            <Row label="Wire date" value={fmtDate(wire.wireDate)} />
            {wire.reviewedAt && (
              <Row
                label="Approved"
                value={`${fmtDate(wire.reviewedAt)}${
                  reviewerName ? ` by ${reviewerName}` : ""
                }`}
              />
            )}
          </Section>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-10 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Paxnova Trust Bank · Member FDIC
        </div>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
        {title}
      </p>
      <div className="border-t border-gray-200 pt-3">
        <dl className="grid gap-2.5">{children}</dl>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  strong,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-gray-500">{label}</dt>
      <dd
        className={
          (strong ? "font-bold " : "font-medium ") +
          (mono ? "font-mono " : "") +
          "text-right text-gray-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}
