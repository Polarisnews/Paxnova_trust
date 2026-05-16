import { and, eq, inArray } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { accounts, transactions, transfers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { ReceiptCard } from "./ReceiptCard";

export const dynamic = "force-dynamic";

export default async function TransactionReceiptPage(props: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id } = await props.params;
  const txnId = Number(id);
  if (!Number.isFinite(txnId) || txnId <= 0) notFound();

  // The transaction must belong to one of the current user's accounts.
  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();
  const acctIds = userAccounts.map((a) => a.id);
  if (acctIds.length === 0) notFound();

  const txn = db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.id, txnId),
        inArray(transactions.accountId, acctIds)
      )
    )
    .get();
  if (!txn) notFound();

  // If this ledger row points at a transfer (debit/credit ledger entry for
  // a user-initiated transfer), forward to the existing transfer receipt
  // so the user sees the rich receipt format.
  if (txn.referenceNumber) {
    const matching = db
      .select()
      .from(transfers)
      .where(
        and(
          eq(transfers.referenceNumber, txn.referenceNumber),
          eq(transfers.userId, user.id)
        )
      )
      .get();
    if (matching) {
      redirect(
        `/dashboard/transfer/receipt/${encodeURIComponent(matching.referenceNumber)}`
      );
    }
  }

  const account = userAccounts.find((a) => a.id === txn.accountId)!;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to dashboard
        </Link>
      </div>

      <ReceiptCard
        transaction={{
          id: txn.id,
          type: txn.type,
          amount: txn.amount,
          description: txn.description,
          category: txn.category,
          counterparty: txn.counterparty,
          counterpartyBank: txn.counterpartyBank,
          counterpartyAccountNumber: txn.counterpartyAccountNumber,
          remark: txn.remark,
          referenceNumber: txn.referenceNumber,
          balanceAfter: txn.balanceAfter,
          createdAt:
            typeof txn.createdAt === "number"
              ? txn.createdAt * 1000
              : txn.createdAt.getTime(),
        }}
        account={{
          name: account.name,
          type: account.type,
          accountNumber: account.accountNumber,
          currency: account.currency || "USD",
        }}
      />
    </div>
  );
}
