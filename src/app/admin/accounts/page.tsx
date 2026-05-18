import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { currency, maskAccount } from "@/lib/format";
import { AccountAdminActions } from "./AccountAdminActions";

const STATUS_PILL: Record<string, { label: string; cls: string }> = {
  active: {
    label: "Active",
    cls: "bg-success/15 text-success",
  },
  frozen: {
    label: "Frozen",
    cls: "bg-orange-500/15 text-orange-500",
  },
  code: {
    label: "Code",
    cls: "bg-violet-500/15 text-violet-500",
  },
  custom: {
    label: "Custom",
    cls: "bg-gold-500/15 text-gold-700 dark:text-gold-300",
  },
  pending: {
    label: "Pending",
    cls: "bg-muted text-muted-foreground",
  },
  closed: {
    label: "Closed",
    cls: "bg-danger/15 text-danger",
  },
};

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
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Operations
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Change an account&apos;s status, mint compliance codes, or post
          manual ledger entries. Status changes take effect on the user&apos;s
          next transfer attempt.
        </p>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[1100px] text-sm">
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
            {list.map(({ account, owner }) => {
              const pill = STATUS_PILL[account.status] ?? STATUS_PILL.active;
              return (
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
                        <p className="text-xs text-muted-foreground">
                          {owner.email}
                        </p>
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 capitalize">{account.type}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-mono">
                      {currency(account.balance, account.currency || "USD")}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {account.currency || "USD"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${pill.cls}`}
                    >
                      {pill.label}
                    </span>
                    {account.status === "code" && (account.tcvCode || account.amlCode) && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {account.tcvCode ? "TCV ✓" : "TCV —"}
                        {" · "}
                        {account.amlCode ? "AML ✓" : "AML —"}
                      </p>
                    )}
                    {account.status === "custom" && account.customMessage && (
                      <p
                        className="mt-1 max-w-[180px] truncate text-[10px] text-muted-foreground"
                        title={account.customMessage}
                      >
                        {account.customMessage}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/accounts/${account.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground transition hover:bg-violet-500 hover:text-white"
                        title="Backdate & edit transactions"
                      >
                        <ExternalLink className="size-3" />
                        Manage
                      </Link>
                      <AccountAdminActions
                        accountId={account.id}
                        accountName={account.name}
                        accountType={account.type}
                        status={account.status}
                        tcvCode={account.tcvCode}
                        amlCode={account.amlCode}
                        customMessage={account.customMessage}
                        currency={account.currency || "USD"}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
