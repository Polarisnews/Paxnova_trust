import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import {
  accounts,
  scheduledWires,
  users,
  wireRecipients,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { SlipView } from "./SlipView";

export const metadata: Metadata = { title: "Wire slip" };
export const dynamic = "force-dynamic";

export default async function WireSlipPage(props: {
  params: Promise<{ ref: string }>;
}) {
  const user = await requireAuth();
  const { ref } = await props.params;

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
  if (!wire) notFound();

  // Wire slip is only meaningful for approved wires. Anything else bounces
  // back to the detail page so the user sees the right banner.
  if (wire.status !== "approved") {
    redirect(`/dashboard/wires/${encodeURIComponent(ref)}`);
  }

  const recipient = db
    .select()
    .from(wireRecipients)
    .where(eq(wireRecipients.id, wire.recipientId))
    .get();
  const fromAccount = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, wire.fromAccountId))
    .get();
  const reviewer = wire.reviewedBy
    ? db.select().from(users).where(eq(users.id, wire.reviewedBy)).get()
    : null;

  if (!fromAccount || !recipient) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print">
        <Link
          href={`/dashboard/wires/${encodeURIComponent(ref)}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to wire details
        </Link>
      </div>

      <SlipView
        wire={{
          referenceNumber: wire.referenceNumber,
          amount: wire.amount,
          fee: wire.fee,
          wireDate:
            typeof wire.wireDate === "number"
              ? wire.wireDate * 1000
              : wire.wireDate.getTime(),
          scheduledAt:
            typeof wire.createdAt === "number"
              ? wire.createdAt * 1000
              : wire.createdAt.getTime(),
          reviewedAt: wire.reviewedAt
            ? typeof wire.reviewedAt === "number"
              ? wire.reviewedAt * 1000
              : wire.reviewedAt.getTime()
            : null,
          messageToBank: wire.messageToBank,
          messageToRecipient: wire.messageToRecipient,
          memo: wire.memo,
        }}
        fromAccount={{
          name: fromAccount.name,
          accountNumber: fromAccount.accountNumber,
          routingNumber: fromAccount.routingNumber,
          currency: fromAccount.currency || "USD",
        }}
        recipient={{
          recipientName: recipient.recipientName,
          recipientNickname: recipient.recipientNickname,
          bankName: recipient.bankName,
          bankRoutingNumber: recipient.bankRoutingNumber,
          bankCountry: recipient.bankCountry,
          bankAddress: [
            recipient.bankAddress,
            recipient.bankCity,
            recipient.bankState,
            recipient.bankZip,
          ]
            .filter(Boolean)
            .join(", ") || null,
          accountNumber: recipient.accountNumber,
          recipientAddress: [
            recipient.recipientAddress1,
            recipient.recipientCity,
            recipient.recipientState,
            recipient.recipientZip,
          ]
            .filter(Boolean)
            .join(", ") || null,
        }}
        reviewerName={
          reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : null
        }
      />
    </div>
  );
}
