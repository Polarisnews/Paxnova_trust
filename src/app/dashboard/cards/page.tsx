import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, cards } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { CardsClient } from "./CardsClient";

export const metadata: Metadata = { title: "Cards" };

export default async function CardsPage() {
  const user = await requireAuth();
  const list = db
    .select({
      card: cards,
      account: accounts,
    })
    .from(cards)
    .leftJoin(accounts, eq(cards.accountId, accounts.id))
    .where(eq(cards.userId, user.id))
    .all();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Wallet
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Your cards
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Freeze a card, change the daily spend limit, or rotate its virtual number.
        </p>
      </header>
      <CardsClient
        cards={list.map((row) => ({
          id: row.card.id,
          brand: row.card.brand,
          cardType: row.card.cardType,
          lastFour: row.card.lastFour,
          cardHolder: row.card.cardHolder,
          expiryMonth: row.card.expiryMonth,
          expiryYear: row.card.expiryYear,
          frozen: row.card.frozen,
          spendLimit: row.card.spendLimit ?? 0,
          accountName: row.account?.name ?? "—",
        }))}
      />
    </div>
  );
}
