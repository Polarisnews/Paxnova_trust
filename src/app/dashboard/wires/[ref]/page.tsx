import type { Metadata } from "next";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import {
  accounts,
  scheduledWires,
  users,
  wireRecipients,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { WireDetail } from "./WireDetail";

export const metadata: Metadata = { title: "Wire details" };
export const dynamic = "force-dynamic";

export default async function WireDetailPage(props: {
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

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>
      </div>

      <WireDetail
        wire={{
          referenceNumber: wire.referenceNumber,
          amount: wire.amount,
          fee: wire.fee,
          status: wire.status,
          wireDate:
            typeof wire.wireDate === "number"
              ? wire.wireDate * 1000
              : wire.wireDate.getTime(),
          createdAt:
            typeof wire.createdAt === "number"
              ? wire.createdAt * 1000
              : wire.createdAt.getTime(),
          reviewedAt: wire.reviewedAt
            ? typeof wire.reviewedAt === "number"
              ? wire.reviewedAt * 1000
              : wire.reviewedAt.getTime()
            : null,
          isRepeating: Boolean(wire.isRepeating),
          repeatFrequency: wire.repeatFrequency,
          messageToBank: wire.messageToBank,
          messageToRecipient: wire.messageToRecipient,
          memo: wire.memo,
          interruptMessage: wire.interruptMessage,
          rejectionReason: wire.rejectionReason,
        }}
        fromAccount={
          fromAccount
            ? {
                name: fromAccount.name,
                accountNumber: fromAccount.accountNumber,
                routingNumber: fromAccount.routingNumber,
                currency: fromAccount.currency || "USD",
              }
            : null
        }
        recipient={
          recipient
            ? {
                recipientName: recipient.recipientName,
                recipientNickname: recipient.recipientNickname,
                bankName: recipient.bankName,
                bankRoutingNumber: recipient.bankRoutingNumber,
                bankCountry: recipient.bankCountry,
                bankAddress: recipient.bankAddress,
                bankCity: recipient.bankCity,
                bankState: recipient.bankState,
                bankZip: recipient.bankZip,
                accountNumber: recipient.accountNumber,
                recipientCountry: recipient.recipientCountry,
                recipientAddress1: recipient.recipientAddress1,
                recipientCity: recipient.recipientCity,
                recipientState: recipient.recipientState,
                recipientZip: recipient.recipientZip,
              }
            : null
        }
        reviewerName={
          reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : null
        }
      />
    </div>
  );
}
