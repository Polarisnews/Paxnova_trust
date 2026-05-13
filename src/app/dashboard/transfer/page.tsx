import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { TransferForm } from "./TransferForm";

export const metadata: Metadata = { title: "Transfer money" };

export default async function TransferPage() {
  const user = await requireAuth();
  const list = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Move money
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Transfer between your accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Instant transfers between Nova Trust accounts, 24/7. Limits and balances
          update in real time.
        </p>
      </header>

      <TransferForm
        accounts={list.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          balance: a.balance,
          accountNumber: a.accountNumber,
        }))}
      />
    </div>
  );
}
