import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { accounts, scheduledWires, wireRecipients } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { WireProgress } from "./WireProgress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Scheduling your wire…" };

export default async function WireProcessingPage(props: {
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

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-2xl items-center justify-center">
      <WireProgress
        referenceNumber={wire.referenceNumber}
        amount={wire.amount}
        fee={wire.fee}
        recipientName={recipient?.recipientName ?? "your recipient"}
        status={wire.status}
        accountType={source?.type ?? "checking"}
        accountCurrency={source?.currency || "USD"}
        interruptMessage={wire.interruptMessage}
      />
    </div>
  );
}
