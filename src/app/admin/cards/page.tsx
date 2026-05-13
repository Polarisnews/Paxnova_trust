import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, cards, users } from "@/db/schema";
import { CardAdminActions } from "./CardAdminActions";

export default async function AdminCards() {
  const list = db
    .select({ card: cards, account: accounts, owner: users })
    .from(cards)
    .leftJoin(accounts, eq(cards.accountId, accounts.id))
    .leftJoin(users, eq(cards.userId, users.id))
    .orderBy(desc(cards.createdAt))
    .all();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Operations</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Cards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Freeze cards on report of fraud. Replacement issuance is queued via the operations team.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Card</th>
              <th className="px-4 py-3 text-left font-semibold">Holder</th>
              <th className="px-4 py-3 text-left font-semibold">Account</th>
              <th className="px-4 py-3 text-left font-semibold">Expiry</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map(({ card, account, owner }) => (
              <tr key={card.id}>
                <td className="px-4 py-3">
                  <p className="font-mono text-sm">
                    {card.brand.toUpperCase()} •••• {card.lastFour}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {card.cardType}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{card.cardHolder}</p>
                  <p className="text-xs text-muted-foreground">{owner?.email}</p>
                </td>
                <td className="px-4 py-3">{account?.name}</td>
                <td className="px-4 py-3 font-mono text-xs">
                  {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      card.frozen
                        ? "bg-violet-500/15 text-violet-500"
                        : "bg-success/15 text-success"
                    }`}
                  >
                    {card.frozen ? "Frozen" : "Active"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <CardAdminActions cardId={card.id} frozen={card.frozen} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
