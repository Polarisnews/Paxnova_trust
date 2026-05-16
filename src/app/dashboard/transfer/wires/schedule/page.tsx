import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, wireRecipients } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { ScheduleWireWizard } from "./ScheduleWireWizard";

export const metadata: Metadata = { title: "Schedule a wire" };

export default async function ScheduleWirePage(props: {
  searchParams: Promise<{ to?: string }>;
}) {
  const user = await requireAuth();
  const { to } = await props.searchParams;
  const preselect = to ? Number(to) : 0;

  const recipients = db
    .select()
    .from(wireRecipients)
    .where(eq(wireRecipients.userId, user.id))
    .orderBy(desc(wireRecipients.createdAt))
    .all();

  const userAccounts = db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id))
    .all();

  if (recipients.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have any wire recipients yet. Add one before
            scheduling a wire.
          </p>
          <Link
            href="/dashboard/transfer/wires/recipients/new"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Add a recipient
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ScheduleWireWizard
      preselectedRecipientId={preselect}
      recipients={recipients.map((r) => ({
        id: r.id,
        recipientName: r.recipientName,
        recipientNickname: r.recipientNickname,
        bankName: r.bankName,
        accountNumber: r.accountNumber,
      }))}
      accounts={userAccounts.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balance,
        accountNumber: a.accountNumber,
        currency: a.currency || "USD",
      }))}
    />
  );
}
