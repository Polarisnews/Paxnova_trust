"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadStatementPdf, type StatementTxn } from "@/lib/statement-pdf";

export type StatementEntry = {
  year: number;
  month: number; // 1-indexed
  openingBalance: number;
  closingBalance: number;
  transactions: StatementTxn[];
};

type AccountInfo = {
  name: string;
  accountNumber: string;
  accountType: string;
  accountCurrency: string;
  routingNumber: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function StatementsList({
  entries,
  account,
}: {
  entries: StatementEntry[];
  account: AccountInfo;
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function onDownload(entry: StatementEntry) {
    const key = `${entry.year}-${entry.month}`;
    setBusyKey(key);
    try {
      await downloadStatementPdf({
        accountName: account.name,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        accountCurrency: account.accountCurrency,
        routingNumber: account.routingNumber,
        period: { year: entry.year, month: entry.month },
        openingBalance: entry.openingBalance,
        closingBalance: entry.closingBalance,
        transactions: entry.transactions,
      });
    } catch (err) {
      console.error("[statements] pdf failed", err);
      toast.error("Couldn't build the PDF — check the browser console.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <ul className="divide-y divide-border">
      {entries.map((e) => {
        const key = `${e.year}-${e.month}`;
        const busy = busyKey === key;
        return (
          <li
            key={key}
            className="flex items-center justify-between px-6 py-4 text-sm"
          >
            <span className="flex items-center gap-3">
              <FileText className="size-4 text-muted-foreground" />
              {MONTH_NAMES[e.month - 1]} {e.year} statement
              <span className="text-xs text-muted-foreground">
                · {e.transactions.length} txn
                {e.transactions.length === 1 ? "" : "s"}
              </span>
            </span>
            <button
              type="button"
              onClick={() => onDownload(e)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <>
                  <Download className="size-3.5" /> PDF
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
