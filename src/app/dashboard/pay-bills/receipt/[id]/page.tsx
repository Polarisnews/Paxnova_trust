import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { accounts, billPayments, payees, users } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { BillPaymentReceiptClient } from "./BillPaymentReceiptClient";

export const metadata: Metadata = { title: "Payment receipt" };

export default async function BillPaymentReceiptPage(props: {
  params: Promise<{ id: string }>;
}) {
  const sessionUser = await requireAuth();
  const { id } = await props.params;
  const paymentId = Number(id);
  if (!Number.isFinite(paymentId)) notFound();

  const payment = db
    .select()
    .from(billPayments)
    .where(
      and(
        eq(billPayments.id, paymentId),
        eq(billPayments.userId, sessionUser.id),
      ),
    )
    .get();
  if (!payment) notFound();

  const payee = db
    .select()
    .from(payees)
    .where(eq(payees.id, payment.payeeId))
    .get();
  const account = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, payment.fromAccountId))
    .get();
  const customer = db
    .select()
    .from(users)
    .where(eq(users.id, sessionUser.id))
    .get();

  // Serialize so the client component never has to deal with raw Date /
  // bigint values across the boundary.
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Print-hidden breadcrumb */}
      <Link
        href="/dashboard/pay-bills"
        className="print:hidden inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Pay Bills
      </Link>

      <BillPaymentReceiptClient
        payment={{
          id: payment.id,
          referenceNumber: buildReferenceNumber(payment.id),
          amount: payment.amount,
          status: payment.status,
          memo: payment.memo,
          scheduledDateIso: (
            payment.scheduledDate as unknown as Date
          ).toISOString(),
          createdAtIso: (payment.createdAt as unknown as Date).toISOString(),
        }}
        payee={
          payee
            ? {
                name: payee.name,
                nickname: payee.nickname,
                accountNumber: payee.accountNumber,
                category: payee.category,
                payeeType: payee.payeeType,
                bankName: payee.bankName,
                routingNumber: payee.routingNumber,
              }
            : null
        }
        account={
          account
            ? {
                name: account.name,
                type: account.type,
                accountNumber: account.accountNumber,
                currency: account.currency || "USD",
              }
            : null
        }
        customer={{
          firstName: customer?.firstName ?? "",
          lastName: customer?.lastName ?? "",
          email: customer?.email ?? "",
        }}
      />
    </div>
  );
}

/**
 * Build a user-facing reference number from the integer id. Real banks
 * encode the date + a check digit; we keep it simple but unique.
 */
function buildReferenceNumber(id: number): string {
  const padded = id.toString().padStart(8, "0");
  const date = new Date();
  const yymm = `${date.getFullYear().toString().slice(-2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `PB-${yymm}-${padded}`;
}
