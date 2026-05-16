import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { db } from "@/db";
import { accounts, scheduledWires, wireRecipients } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { currency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Wire scheduled" };

export default async function WireDonePage(props: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await requireAuth();
  const { ref } = await props.searchParams;
  if (!ref) redirect("/dashboard/transfer");

  const wire = db
    .select()
    .from(scheduledWires)
    .where(
      and(
        eq(scheduledWires.referenceNumber, ref),
        eq(scheduledWires.userId, user.id)
      )
    )
    .get();
  if (!wire) redirect("/dashboard/transfer");

  // Done page is only valid for fully-scheduled wires. If the wire got
  // interrupted by a status gate (frozen / pending_* / custom), bounce back
  // to the processing page so the right interrupt UI shows.
  if (wire.status !== "scheduled" && wire.status !== "completed") {
    redirect(
      `/dashboard/transfer/wires/schedule/processing?ref=${encodeURIComponent(ref)}`
    );
  }

  const recipient = db
    .select()
    .from(wireRecipients)
    .where(eq(wireRecipients.id, wire.recipientId))
    .get();
  const source = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, wire.fromAccountId))
    .get();
  const code = source?.currency || "USD";

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Your wire has been scheduled
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A Paxnova Trust operations officer will review and approve your wire
          shortly. You&apos;ll receive a confirmation email once it&apos;s
          released, and you can track the status from your dashboard.
        </p>

        <dl className="mx-auto mt-6 grid max-w-sm gap-2 text-left text-sm">
          <Row label="Reference" value={wire.referenceNumber} />
          <Row label="Amount" value={currency(wire.amount, code)} />
          <Row label="Fee" value={currency(wire.fee, code)} />
          <Row
            label="Total"
            value={currency(wire.amount + wire.fee, code)}
            strong
          />
          <Row label="Recipient" value={recipient?.recipientName ?? "—"} />
          <Row label="Wire date" value={formatDate(wire.wireDate)} />
        </dl>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-2 sm:flex-row">
          <Link
            href={`/dashboard/wires/${encodeURIComponent(wire.referenceNumber)}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold hover:bg-muted"
          >
            View wire details
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-8 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-4 border-b border-border/60 pb-1.5 last:border-0 last:pb-0 " +
        (strong ? "font-semibold" : "")
      }
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-mono">{value}</dd>
    </div>
  );
}
