import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { recipientGroups } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { AddRecipientWizard } from "./AddRecipientWizard";

export const metadata: Metadata = { title: "Add a wire recipient" };

export default async function AddRecipientPage() {
  const user = await requireAuth();
  const groups = db
    .select()
    .from(recipientGroups)
    .where(eq(recipientGroups.userId, user.id))
    .orderBy(desc(recipientGroups.createdAt))
    .all();
  return (
    <AddRecipientWizard
      groups={groups.map((g) => ({ id: g.id, name: g.name }))}
    />
  );
}
