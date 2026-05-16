"use client";

import { ArrowDownLeft, ArrowUpRight, Printer } from "lucide-react";
import { currency, formatDate, maskAccount } from "@/lib/format";

type Transaction = {
  id: number;
  type: "debit" | "credit";
  amount: number;
  description: string;
  category: string | null;
  counterparty: string | null;
  counterpartyBank: string | null;
  counterpartyAccountNumber: string | null;
  remark: string | null;
  referenceNumber: string | null;
  balanceAfter: number;
  createdAt: number;
};

type Account = {
  name: string;
  type: string;
  accountNumber: string;
  currency: string;
};

export function ReceiptCard({
  transaction,
  account,
}: {
  transaction: Transaction;
  account: Account;
}) {
  const isCredit = transaction.type === "credit";

  return (
    <>
      <div className="no-print flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
        >
          <Printer className="size-3.5" />
          Print
        </button>
      </div>

      <div
        className="rounded-2xl border border-border bg-card shadow-soft"
        style={{ colorScheme: "light" }}
      >
        <div className="border-b border-border px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Paxnova Trust Bank
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Transaction receipt
              </h1>
            </div>
            <span
              className={
                "inline-flex size-12 items-center justify-center rounded-full " +
                (isCredit
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground")
              }
            >
              {isCredit ? (
                <ArrowDownLeft className="size-6" />
              ) : (
                <ArrowUpRight className="size-6" />
              )}
            </span>
          </div>
        </div>

        <div className="px-8 py-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {isCredit ? "Credit" : "Debit"} amount
          </p>
          <p
            className={
              "mt-1 font-display text-4xl font-semibold tracking-tight " +
              (isCredit ? "text-success" : "")
            }
          >
            {isCredit ? "+" : "−"}
            {currency(transaction.amount, account.currency)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {transaction.description}
          </p>
        </div>

        <Section title="Account">
          <Row label="Account" value={account.name} />
          <Row
            label="Account number"
            value={maskAccount(account.accountNumber)}
          />
          <Row label="Account type" value={capitalize(account.type)} />
        </Section>

        {(transaction.counterparty ||
          transaction.counterpartyBank ||
          transaction.counterpartyAccountNumber) && (
          <Section title={isCredit ? "Sender" : "Receiver"}>
            {transaction.counterparty && (
              <Row label="Name" value={transaction.counterparty} />
            )}
            {transaction.counterpartyBank && (
              <Row label="Bank" value={transaction.counterpartyBank} />
            )}
            {transaction.counterpartyAccountNumber && (
              <Row
                label="Account number"
                value={transaction.counterpartyAccountNumber}
                mono
              />
            )}
          </Section>
        )}

        <Section title="Details">
          <Row label="Date" value={formatDate(transaction.createdAt)} />
          <Row label="Category" value={transaction.category ?? "Transaction"} />
          {transaction.remark && (
            <Row label="Remark" value={transaction.remark} />
          )}
          {transaction.referenceNumber && (
            <Row
              label="Reference"
              value={transaction.referenceNumber}
              mono
            />
          )}
          <Row
            label="Balance after"
            value={currency(transaction.balanceAfter, account.currency)}
            mono
          />
        </Section>

        <div className="border-t border-border px-8 py-4 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
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
    <div className="border-t border-border px-8 py-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <dl className="mt-3 grid gap-2">{children}</dl>
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

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
