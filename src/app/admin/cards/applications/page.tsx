import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cardApplications, users } from "@/db/schema";
import { currency, formatDate } from "@/lib/format";
import { getCardProduct } from "@/lib/card-products";
import { CardApplicationRow } from "./CardApplicationRow";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending review", cls: "bg-violet-500/15 text-violet-500" },
  approved: { label: "Approved", cls: "bg-success/15 text-success" },
  rejected: { label: "Rejected", cls: "bg-danger/15 text-danger" },
};

export default async function AdminCardApplications() {
  const rows = db
    .select({ app: cardApplications, owner: users })
    .from(cardApplications)
    .leftJoin(users, eq(users.id, cardApplications.userId))
    .orderBy(desc(cardApplications.createdAt))
    .all();

  const pending = rows.filter((r) => r.app.status === "pending");
  const reviewed = rows.filter((r) => r.app.status !== "pending");

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Operations
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Card applications
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve to issue the card immediately (a credit account is opened
          and the PAN/CVV/PIN are generated). Reject with a reason and the
          customer sees it in their dashboard.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pending review ({pending.length})
        </h2>
        <Table rows={pending} actionable />
      </section>

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recently reviewed
          </h2>
          <Table rows={reviewed.slice(0, 30)} />
        </section>
      )}
    </div>
  );
}

function Table({
  rows,
  actionable,
}: {
  rows: {
    app: typeof cardApplications.$inferSelect;
    owner: typeof users.$inferSelect | null;
  }[];
  actionable?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Nothing here.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Reference</th>
            <th className="px-4 py-3 text-left font-semibold">Applicant</th>
            <th className="px-4 py-3 text-left font-semibold">Card</th>
            <th className="px-4 py-3 text-right font-semibold">Requested</th>
            <th className="px-4 py-3 text-left font-semibold">Submitted</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ app, owner }) => {
            const product = getCardProduct(app.productKey);
            const pill = STATUS_PILL[app.status] ?? STATUS_PILL.pending;
            return (
              <tr key={app.id} className="align-top">
                <td className="px-4 py-3 font-mono text-xs">
                  {app.referenceNumber}
                </td>
                <td className="px-4 py-3">
                  {owner ? (
                    <>
                      <p className="font-medium">
                        {owner.firstName} {owner.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {owner.email}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {product?.name ?? app.productKey}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Theme: {app.theme} · Holder: {app.cardHolder}
                  </p>
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-mono font-semibold">
                    {currency(app.requestedLimit)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    daily {currency(app.dailyLimit)} · txn{" "}
                    {currency(app.txnLimit)}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatDate(app.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${pill.cls}`}
                  >
                    {pill.label}
                  </span>
                  {app.status === "rejected" && app.rejectionReason && (
                    <p
                      className="mt-1 max-w-[180px] truncate text-[10px] text-muted-foreground"
                      title={app.rejectionReason}
                    >
                      {app.rejectionReason}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {actionable && (
                    <CardApplicationRow
                      applicationId={app.id}
                      reference={app.referenceNumber}
                      requestedLimit={app.requestedLimit}
                      product={product}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
