import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, payees } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { listScheduledPayments } from "@/app/actions/banking";
import { PayBillsClient } from "./PayBillsClient";

export const metadata: Metadata = { title: "Pay bills" };

export default async function PayBillsPage() {
  const user = await requireAuth();
  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();
  const userPayees = db
    .select()
    .from(payees)
    .where(eq(payees.userId, user.id))
    .all();
  const scheduled = await listScheduledPayments();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Bill pay
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Pay bills & manage payees
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay any business or person. Schedule one-time or recurring payments.
        </p>
      </header>

      <PayBillsClient
        accounts={userAccounts.map((a) => ({
          id: a.id,
          name: a.name,
          balance: a.balance,
          accountNumber: a.accountNumber,
        }))}
        payees={userPayees.map((p) => ({
          id: p.id,
          name: p.name,
          nickname: p.nickname,
          accountNumber: p.accountNumber,
          category: p.category,
        }))}
        scheduled={scheduled.map((s) => ({
          id: s.payment.id,
          payeeName: s.payee?.name ?? "—",
          accountName: s.account?.name ?? "—",
          amount: s.payment.amount,
          scheduledDate:
            typeof s.payment.scheduledDate === "number"
              ? s.payment.scheduledDate * 1000
              : s.payment.scheduledDate.getTime(),
          status: s.payment.status,
        }))}
      />
    </div>
  );
}
