import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, payees } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { SendMoneyWizard } from "./SendMoneyWizard";

export const metadata: Metadata = { title: "Send money" };

export default async function SendMoneyPage() {
  const user = await requireAuth();
  const accountList = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();

  const payeeList = db
    .select()
    .from(payees)
    .where(eq(payees.userId, user.id))
    .all();

  // Split payees by the rail they can take.
  const zelleContacts = payeeList.filter(
    (p) =>
      p.preferredMethod === "zelle" && (Boolean(p.email) || Boolean(p.phone))
  );
  const externalBanks = payeeList.filter(
    (p) =>
      p.preferredMethod !== "zelle" &&
      Boolean(p.routingNumber) &&
      Boolean(p.accountNumber)
  );

  return (
    <SendMoneyWizard
      accounts={accountList.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        status: a.status,
        balance: a.balance,
        accountNumber: a.accountNumber,
        currency: a.currency || "USD",
      }))}
      zelleContacts={zelleContacts.map((p) => ({
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        email: p.email,
        phone: p.phone,
      }))}
      externalBanks={externalBanks.map((p) => ({
        id: p.id,
        name: p.name,
        nickname: p.nickname,
        bankName: p.bankName,
        accountNumber: p.accountNumber,
        accountType: p.accountType,
      }))}
    />
  );
}
