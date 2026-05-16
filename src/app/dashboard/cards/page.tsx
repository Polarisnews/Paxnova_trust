import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/db";
import { accounts, cards } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { CardsClient } from "./CardsClient";

export const metadata: Metadata = { title: "Cards" };
export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Wallet
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Your cards
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reveal the full number when you need it, freeze instantly, and
            adjust your spending limits.
          </p>
        </div>
        <Link
          href="/dashboard/cards/apply"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
        >
          <Plus className="size-4" />
          Apply for a card
        </Link>
      </header>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have a Paxnova Trust card yet.
          </p>
          <Link
            href="/dashboard/cards/apply"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
          >
            <Plus className="mr-1.5 size-4" /> Apply for your first card
          </Link>
        </div>
      ) : (
        <CardsClient
          cards={list.map((row) => ({
            id: row.card.id,
            network:
              (row.card.network as "visa" | "mastercard" | "amex") ??
              (row.card.brand as "visa" | "mastercard" | "amex"),
            tier: (row.card.tier as "core" | "plus" | "black") ?? "core",
            theme:
              (row.card.theme as "obsidian" | "aurora" | "sand" | "crimson") ??
              "obsidian",
            cardType: row.card.cardType,
            lastFour: row.card.lastFour,
            cardHolder: row.card.cardHolder,
            expiryMonth: row.card.expiryMonth,
            expiryYear: row.card.expiryYear,
            frozen: row.card.frozen,
            status:
              (row.card.status as "pending" | "active" | "frozen" | "closed") ??
              "active",
            spendLimit: row.card.spendLimit ?? 0,
            dailyLimit: row.card.dailyLimit ?? row.card.spendLimit ?? 0,
            txnLimit: row.card.txnLimit ?? row.card.spendLimit ?? 0,
            apr: row.card.apr ?? null,
            annualFee: row.card.annualFee ?? 0,
            accountName: row.account?.name ?? "—",
            accountCurrency: row.account?.currency || "USD",
          }))}
        />
      )}
    </div>
  );
}
