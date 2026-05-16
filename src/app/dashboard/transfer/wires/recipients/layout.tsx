import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { recipientGroups, wireRecipients } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { WiresShell } from "../WiresShell";

export default async function RecipientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const recipients = db
    .select()
    .from(wireRecipients)
    .where(eq(wireRecipients.userId, user.id))
    .orderBy(desc(wireRecipients.createdAt))
    .all();
  const groups = db
    .select()
    .from(recipientGroups)
    .where(eq(recipientGroups.userId, user.id))
    .orderBy(desc(recipientGroups.createdAt))
    .all();

  return (
    <WiresShell recipients={recipients} groups={groups}>
      {children}
    </WiresShell>
  );
}
