import type { Metadata } from "next";
import { eq, or, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  // Count of contact threads that still need attention. We treat any thread
  // that isn't `closed` and hasn't been replied to as "open" for the badge —
  // an admin's "inbox zero" is when this number hits 0.
  const openCountRow = db
    .select({ n: sql<number>`count(*)` })
    .from(contactMessages)
    .where(
      or(
        eq(contactMessages.status, "open"),
        eq(contactMessages.status, "in_progress"),
      ),
    )
    .get();
  const openMessageCount = Number(openCountRow?.n ?? 0);

  return (
    <AdminShell
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      }}
      openMessageCount={openMessageCount}
    >
      {children}
    </AdminShell>
  );
}
