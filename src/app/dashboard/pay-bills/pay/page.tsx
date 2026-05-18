import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, payees } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { PayBillWizard } from "./PayBillWizard";

export const metadata: Metadata = { title: "Pay a bill" };

export default async function PayBillPage(props: {
  searchParams: Promise<{ payee?: string }>;
}) {
  const user = await requireAuth();
  const { payee: payeeQuery } = await props.searchParams;

  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all()
    .filter((a) => a.type !== "credit"); // bill pay debits a cash account

  const userPayees = db
    .select()
    .from(payees)
    .where(eq(payees.userId, user.id))
    .all();

  return (
    <PayBillWizard
      preselectedPayeeId={
        payeeQuery ? Number(payeeQuery) : null
      }
      accounts={userAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balance,
        accountNumber: a.accountNumber,
        currency: a.currency || "USD",
      }))}
      payees={userPayees.map((p) => ({
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        accountNumber: p.accountNumber,
        category: p.category ?? "Other",
        payeeType: p.payeeType ?? "business",
      }))}
    />
  );
}
