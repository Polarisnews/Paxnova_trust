import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { currency, maskAccount } from "@/lib/format";
import { AccountAdminActions } from "./AccountAdminActions";

export default async function AdminAccounts() {
  const list = db
    .select({ account: accounts, owner: users })
    .from(accounts)
    .leftJoin(users, eq(accounts.userId, users.id))
    .orderBy(desc(accounts.createdAt))
    .all();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Freeze suspicious accounts and post manual balance adjustments. Each adjustment writes a ledger entry.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Account</th>
              <th className="px-4 py-3 text-left font-semibold">Owner</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-right font-semibold">Balance</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map(({ account, owner }) => (
              <tr key={account.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {maskAccount(account.accountNumber)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  {owner ? (
                    <>
                      <p className="font-medium">
                        {owner.firstName} {owner.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{owner.email}</p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 capitalize">{account.type}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {currency(account.balance)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      account.status === "active"
                        ? "bg-success/15 text-success"
                        : account.status === "frozen"
                        ? "bg-violet-500/15 text-violet-500"
                        : "bg-danger/15 text-danger"
                    }`}
                  >
                    {account.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AccountAdminActions
                    accountId={account.id}
                    status={account.status as "active" | "frozen" | "closed"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
