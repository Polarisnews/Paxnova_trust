import type { Metadata } from "next";
import Link from "next/link";
import { Building2, DollarSign, HelpCircle } from "lucide-react";

export const metadata: Metadata = { title: "Transfer" };

export default function TransferLanding() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Move money
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Choose how you&apos;d like to send
          </h1>
        </div>
        <Link
          href="/dashboard/transfer/learn-more"
          className="hidden items-center gap-1.5 text-xs font-medium text-violet-500 hover:text-violet-600 sm:inline-flex"
        >
          <HelpCircle className="size-3.5" />
          Learn more about these payment methods
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-1 flex-col items-center px-6 pb-2 pt-8 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
              <DollarSign className="size-7" />
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
              Zelle<sup className="ml-0.5 text-xs">®</sup>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay people &amp; small businesses
            </p>
            <dl className="mt-6 w-full max-w-xs space-y-3 text-left text-sm">
              <Row label="Delivery time" value="In minutes" />
              <Row label="Standard fee" value="No additional fees" />
              <Row label="Daily limit" value="Varies" />
            </dl>
          </div>
          <div className="grid grid-cols-1 border-t border-border">
            <Link
              href="/dashboard/transfer/send-money"
              className="py-3.5 text-center text-sm font-semibold text-violet-500 hover:bg-muted/50"
            >
              Send money
            </Link>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex flex-1 flex-col items-center px-6 pb-2 pt-8 text-center">
            <div className="inline-flex size-14 items-center justify-center rounded-full bg-navy-900 text-white">
              <Building2 className="size-7" />
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
              Wires &amp; global transfers
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Send money almost anywhere
            </p>
            <dl className="mt-6 w-full max-w-xs space-y-3 text-left text-sm">
              <Row label="Delivery time" value="1 to 5 business days" />
              <Row label="Standard fee" value="$0 to $40" />
              <Row label="Daily limit" value="$100,000" />
            </dl>
          </div>
          <div className="grid grid-cols-2 border-t border-border">
            <Link
              href="/dashboard/transfer/wires"
              className="border-r border-border py-3.5 text-center text-sm font-semibold text-violet-500 hover:bg-muted/50"
            >
              Schedule wire
            </Link>
            <Link
              href="/dashboard/transfer/wires/recipients/new"
              className="py-3.5 text-center text-sm font-semibold text-violet-500 hover:bg-muted/50"
            >
              Add recipient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
