import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, transfers } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { TransferProgress } from "./TransferProgress";

export const dynamic = "force-dynamic";

export default async function ProcessingPage(props: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await requireAuth();
  const { ref } = await props.searchParams;
  if (!ref) redirect("/dashboard/transfer");

  const t = db
    .select()
    .from(transfers)
    .where(
      and(eq(transfers.referenceNumber, ref), eq(transfers.userId, user.id))
    )
    .get();
  if (!t) redirect("/dashboard/transfer");

  // Source account — we need its type for the Frozen card header.
  const source = db
    .select()
    .from(accounts)
    .where(eq(accounts.id, t.fromAccountId))
    .get();

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-12rem)] max-w-2xl items-center justify-center">
      <TransferProgress
        referenceNumber={t.referenceNumber}
        amount={t.amount}
        fee={t.fee}
        method={t.transferMethod}
        fromAccountName={t.fromAccountName}
        fromAccountLast4={t.fromAccountLast4}
        toAccountName={t.toAccountName}
        toAccountLast4={t.toAccountLast4}
        toBankName={t.toBankName}
        status={t.status}
        accountType={source?.type ?? "checking"}
        accountCurrency={source?.currency || "USD"}
        interruptMessage={t.interruptMessage}
      />
    </div>
  );
}
