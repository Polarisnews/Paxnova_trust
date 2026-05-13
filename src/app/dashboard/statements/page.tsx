import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Statements" };

const months = ["February", "January", "December"];

export default async function StatementsPage() {
  const user = await requireAuth();
  const userAccounts = db.select().from(accounts).where(eq(accounts.userId, user.id)).all();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Documents</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Statements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Download monthly statements and tax documents for any of your accounts.
        </p>
      </header>

      {userAccounts.map((a) => (
        <section key={a.id} className="rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-display text-lg font-semibold">{a.name}</h2>
            <p className="text-xs text-muted-foreground">Opened {formatDate(a.createdAt)}</p>
          </div>
          <ul className="divide-y divide-border">
            {months.map((m) => (
              <li key={m} className="flex items-center justify-between px-6 py-4 text-sm">
                <span className="flex items-center gap-3">
                  <FileText className="size-4 text-muted-foreground" />
                  {m} 2026 statement
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-500 hover:text-violet-600"
                >
                  <Download className="size-3.5" /> PDF
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
