import { notFound } from "next/navigation";
import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { accounts, transfers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { TransferReceiptClient } from "./TransferReceiptClient";

export const dynamic = "force-dynamic";

export default async function ReceiptPage(props: {
  params: Promise<{ ref: string }>;
}) {
  const user = await requireAuth();
  const { ref } = await props.params;

  const t = db
    .select()
    .from(transfers)
    .where(
      and(eq(transfers.referenceNumber, ref), eq(transfers.userId, user.id))
    )
    .get();
  if (!t) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="no-print flex items-center justify-between">
        <Link
          href="/dashboard/transfer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to send money
        </Link>
      </div>

      <TransferReceiptClient
        transfer={{
          referenceNumber: t.referenceNumber,
          amount: t.amount,
          fee: t.fee,
          method: t.transferMethod,
          status: t.status,
          memo: t.memo,
          fromAccountName: t.fromAccountName,
          fromAccountLast4: t.fromAccountLast4,
          toAccountName: t.toAccountName,
          toAccountLast4: t.toAccountLast4,
          toBankName: t.toBankName,
          toRoutingNumber: t.toRoutingNumber,
          currency:
            db
              .select({ currency: accounts.currency })
              .from(accounts)
              .where(eq(accounts.id, t.fromAccountId))
              .get()?.currency || "USD",
          initiatedAt:
            typeof t.initiatedAt === "number"
              ? t.initiatedAt * 1000
              : t.initiatedAt.getTime(),
          completedAt: t.completedAt
            ? typeof t.completedAt === "number"
              ? t.completedAt * 1000
              : t.completedAt.getTime()
            : null,
          estimatedSettlement:
            typeof t.estimatedSettlement === "number"
              ? t.estimatedSettlement * 1000
              : t.estimatedSettlement.getTime(),
        }}
      />
    </div>
  );
}
