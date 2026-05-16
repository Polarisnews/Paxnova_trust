"use client";

import Link from "next/link";
import { AlertTriangle, ShieldOff } from "lucide-react";

// Shared interrupt cards used by both the transfer-processing page and the
// wire-schedule processing page so the user sees the same UI regardless of
// which path they came through.

export function FrozenCard({
  accountType,
  referenceNumber,
}: {
  accountType: string;
  referenceNumber: string;
}) {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-danger/30 bg-card p-8 text-center shadow-soft">
      <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-danger/15 text-danger">
        <ShieldOff className="size-7" />
      </span>
      <h2 className="mt-4 font-display text-2xl font-bold text-danger sm:text-3xl">
        Your {accountType} account has been frozen!!!
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-foreground">
        Please visit our nearest branch for a biometric verification to unlock
        your account, or contact our Account Support at{" "}
        <a
          href="mailto:accounts@paxnovatrust.com"
          className="font-medium underline"
        >
          accounts@paxnovatrust.com
        </a>
        .
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        Reference: <span className="font-mono">{referenceNumber}</span>
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-8 text-sm font-semibold text-white hover:bg-violet-600"
      >
        Back to dashboard
      </Link>
    </div>
  );
}

export function CustomInterruptCard({
  message,
  referenceNumber,
  pct,
}: {
  message: string;
  referenceNumber: string;
  pct: number;
}) {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
      <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-gold-500/15 text-gold-700 dark:text-gold-300">
        <AlertTriangle className="size-7" />
      </span>
      <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
        Transfer interrupted at {Math.round(pct)}%
      </p>
      <div className="mx-auto mt-3 h-2 max-w-md overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mx-auto mt-6 max-w-md whitespace-pre-line text-base font-medium text-foreground">
        {message}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">
        Reference: <span className="font-mono">{referenceNumber}</span>
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-8 text-sm font-semibold text-white hover:bg-violet-600"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
