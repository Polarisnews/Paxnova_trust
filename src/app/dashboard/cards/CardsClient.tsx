"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Loader2, Lock, Snowflake, Sun } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  setCardLimitAction,
  toggleCardFreezeAction,
  type ActionState,
} from "@/app/actions/banking";
import { currency } from "@/lib/format";

type CardRow = {
  id: number;
  brand: string;
  cardType: string;
  lastFour: string;
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  frozen: boolean;
  spendLimit: number;
  accountName: string;
};

const initial: ActionState = { ok: false };

const palettes: Record<string, string> = {
  debit: "linear-gradient(135deg, #0A1A3C 0%, #1E3A6B 60%, #050B1F 100%)",
  credit: "linear-gradient(135deg, #6E3FF3 0%, #4F22C7 60%, #2B1373 100%)",
};

export function CardsClient({ cards }: { cards: CardRow[] }) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No cards on file yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cards.map((c) => (
        <CardRowView key={c.id} card={c} />
      ))}
    </div>
  );
}

function CardRowView({ card }: { card: CardRow }) {
  const [pending, start] = useTransition();
  const [state, formAction, savingLimit] = useActionState(setCardLimitAction, initial);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (state.message && !state.ok && !state.fieldErrors) toast.error(state.message);
  }, [state]);

  const onFreeze = () =>
    start(async () => {
      const res = await toggleCardFreezeAction(card.id);
      if (res.ok && res.message) toast.success(res.message);
      else if (res.message) toast.error(res.message);
    });

  return (
    <div className="grid gap-5 rounded-2xl border border-border bg-card p-6 lg:grid-cols-[340px_1fr]">
      <CardArt card={card} />

      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {card.cardType === "debit" ? "Debit" : "Credit"} card — linked to{" "}
            {card.accountName}
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
            {card.brand.toUpperCase()} •••• {card.lastFour}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onFreeze}
            disabled={pending}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition ${
              card.frozen
                ? "bg-success text-white hover:bg-success/90"
                : "bg-muted text-foreground hover:bg-muted/70"
            } disabled:opacity-60`}
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : card.frozen ? (
              <Sun className="size-3.5" />
            ) : (
              <Snowflake className="size-3.5" />
            )}
            {card.frozen ? "Unfreeze card" : "Freeze card"}
          </button>
          <button
            disabled
            title="Coming soon"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted/40 px-4 text-xs font-semibold text-muted-foreground"
          >
            <Lock className="size-3.5" />
            Rotate virtual number
          </button>
        </div>

        <form action={formAction} className="flex items-end gap-3">
          <input type="hidden" name="cardId" value={card.id} />
          <div className="flex-1 space-y-1">
            <Label htmlFor={`limit-${card.id}`}>Daily spend limit</Label>
            <Input
              id={`limit-${card.id}`}
              name="spendLimit"
              type="number"
              step="50"
              min="0"
              defaultValue={card.spendLimit}
            />
            <p className="text-[11px] text-muted-foreground">
              Currently {currency(card.spendLimit)}
            </p>
          </div>
          <button
            type="submit"
            disabled={savingLimit}
            className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-5 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {savingLimit ? <Loader2 className="size-3.5 animate-spin" /> : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CardArt({ card }: { card: CardRow }) {
  const bg = palettes[card.cardType] ?? palettes.debit;
  return (
    <div
      className="relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-5 text-white shadow-elev"
      style={{ background: bg }}
    >
      {card.frozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-navy-900/60 backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <Snowflake className="size-3.5" /> Frozen
          </span>
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="size-8 rounded bg-gradient-to-br from-gold-300 to-gold-700" />
        <span className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-300">
          Nova Trust
        </span>
      </div>
      <p className="mt-12 font-mono text-base tracking-widest">
        •••• •••• •••• {card.lastFour}
      </p>
      <div className="mt-3 flex items-end justify-between text-xs">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-white/55">Holder</p>
          <p className="font-mono text-[11px]">{card.cardHolder}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-white/55">Exp</p>
          <p className="font-mono text-[11px]">
            {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}
          </p>
        </div>
        <p className="font-display text-base font-bold uppercase tracking-wider text-gold-300">
          {card.brand}
        </p>
      </div>
    </div>
  );
}
