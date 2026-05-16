import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  accounts,
  scheduledWires,
  users,
  wireRecipients,
} from "@/db/schema";
import { currency, formatDate, maskAccount } from "@/lib/format";
import { WireRow } from "./WireRow";

export const dynamic = "force-dynamic";

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  scheduled: { label: "Pending review", cls: "bg-violet-500/15 text-violet-500" },
  approved: { label: "Approved", cls: "bg-success/15 text-success" },
  rejected: { label: "Rejected", cls: "bg-danger/15 text-danger" },
};

export default async function AdminWiresPage() {
  // Pull every wire that's awaiting review plus the most recently
  // approved/rejected ones so admins can see what they just acted on.
  const rows = db
    .select({
      wire: scheduledWires,
      recipient: wireRecipients,
      account: accounts,
      owner: users,
    })
    .from(scheduledWires)
    .leftJoin(
      wireRecipients,
      eq(wireRecipients.id, scheduledWires.recipientId)
    )
    .leftJoin(accounts, eq(accounts.id, scheduledWires.fromAccountId))
    .leftJoin(users, eq(users.id, scheduledWires.userId))
    .orderBy(desc(scheduledWires.createdAt))
    .all();

  const pending = rows.filter((r) => r.wire.status === "scheduled");
  const reviewed = rows.filter(
    (r) => r.wire.status === "approved" || r.wire.status === "rejected"
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Operations
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Wire transfers — review queue
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Approve outgoing wires before they release to the network, or reject
          with a reason that posts back to the customer.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Pending review ({pending.length})
        </h2>
        <Table rows={pending} pill={STATUS_PILL} actionable />
      </section>

      {reviewed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recently reviewed
          </h2>
          <Table rows={reviewed.slice(0, 20)} pill={STATUS_PILL} />
        </section>
      )}
    </div>
  );
}

function Table({
  rows,
  pill,
  actionable,
}: {
  rows: {
    wire: typeof scheduledWires.$inferSelect;
    recipient: typeof wireRecipients.$inferSelect | null;
    account: typeof accounts.$inferSelect | null;
    owner: typeof users.$inferSelect | null;
  }[];
  pill: typeof STATUS_PILL;
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
            <th className="px-4 py-3 text-left font-semibold">Customer</th>
            <th className="px-4 py-3 text-left font-semibold">Recipient</th>
            <th className="px-4 py-3 text-left font-semibold">From</th>
            <th className="px-4 py-3 text-right font-semibold">Amount</th>
            <th className="px-4 py-3 text-left font-semibold">Wire date</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(({ wire, recipient, account, owner }) => {
            const p = pill[wire.status] ?? {
              label: wire.status,
              cls: "bg-muted text-muted-foreground",
            };
            return (
              <tr key={wire.id} className="align-top">
                <td className="px-4 py-3 font-mono text-xs">
                  {wire.referenceNumber}
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
                  {recipient ? (
                    <>
                      <p className="font-medium">{recipient.recipientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {recipient.bankName} ·{" "}
                        {maskAccount(recipient.accountNumber)}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {account ? (
                    <>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {maskAccount(account.accountNumber)}
                      </p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="font-mono font-semibold">
                    {currency(wire.amount, account?.currency || "USD")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    + {currency(wire.fee, account?.currency || "USD")} fee
                  </p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatDate(wire.wireDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${p.cls}`}
                  >
                    {p.label}
                  </span>
                  {wire.status === "rejected" && wire.rejectionReason && (
                    <p
                      className="mt-1 max-w-[180px] truncate text-[10px] text-muted-foreground"
                      title={wire.rejectionReason}
                    >
                      {wire.rejectionReason}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {actionable && (
                    <WireRow
                      wireId={wire.id}
                      referenceNumber={wire.referenceNumber}
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
