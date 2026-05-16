import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { wireRecipients } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { CreateGroupForm } from "./CreateGroupForm";

export const metadata: Metadata = { title: "Create a group" };

export default async function CreateGroupPage() {
  const user = await requireAuth();
  const recipients = db
    .select()
    .from(wireRecipients)
    .where(eq(wireRecipients.userId, user.id))
    .orderBy(desc(wireRecipients.createdAt))
    .all();
  return (
    <CreateGroupForm
      recipients={recipients.map((r) => ({
        id: r.id,
        recipientName: r.recipientName,
        recipientNickname: r.recipientNickname,
        bankName: r.bankName,
        accountNumber: r.accountNumber,
      }))}
    />
  );
}
