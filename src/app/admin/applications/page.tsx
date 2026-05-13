import { desc } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { currency, formatDate } from "@/lib/format";
import { ApplicationActions } from "./ApplicationActions";

export default async function AdminApplications() {
  const list = db
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt))
    .all();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approving opens the requested account funded with the applicant&apos;s opening deposit. Rejecting closes the case.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Reference</th>
              <th className="px-4 py-3 text-left font-semibold">Applicant</th>
              <th className="px-4 py-3 text-left font-semibold">Product</th>
              <th className="px-4 py-3 text-right font-semibold">Funding</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No applications in the queue.
                </td>
              </tr>
            )}
            {list.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-mono text-xs">{a.referenceNumber}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{a.applicantName}</p>
                  <p className="text-xs text-muted-foreground">{a.applicantEmail}</p>
                </td>
                <td className="px-4 py-3 capitalize">{a.product.replace("-", " ")}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {a.fundingAmount ? currency(a.fundingAmount) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      a.status === "pending"
                        ? "bg-gold-500/15 text-gold-700 dark:text-gold-300"
                        : a.status === "approved"
                        ? "bg-success/15 text-success"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(a.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {a.status === "pending" && (
                    <ApplicationActions applicationId={a.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
