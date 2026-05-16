"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Snowflake,
  Sparkles,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardArt } from "@/components/cards/CardArt";
import { currency } from "@/lib/format";
import {
  revealCardDetailsAction,
  setCardFrozenAction,
  updateCardLimitsAction,
  type CardActionState,
  type RevealedCard,
} from "@/app/actions/cards";

type CardRow = {
  id: number;
  network: "visa" | "mastercard" | "amex";
  tier: "core" | "plus" | "black";
  theme: "obsidian" | "aurora" | "sand" | "crimson";
  cardType: string;
  lastFour: string;
  cardHolder: string;
  expiryMonth: number;
  expiryYear: number;
  frozen: boolean;
  status: "pending" | "active" | "frozen" | "closed";
  spendLimit: number;
  dailyLimit: number;
  txnLimit: number;
  apr: number | null;
  annualFee: number;
  accountName: string;
  accountCurrency: string;
};

const initial: CardActionState = { ok: false };

export function CardsClient({ cards }: { cards: CardRow[] }) {
  return (
    <div className="space-y-8">
      {cards.map((card) => (
        <CardPanel key={card.id} card={card} />
      ))}
    </div>
  );
}

function CardPanel({ card }: { card: CardRow }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState<RevealedCard | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [frozenPending, startFrozen] = useTransition();
  const [state, formAction, saving] = useActionState(
    updateCardLimitsAction,
    initial
  );

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    if (state.message && !state.ok && !state.fieldErrors) toast.error(state.message);
  }, [state]);

  // Auto re-mask after 30 seconds to avoid leaving secrets on screen.
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setRevealed(null), 30_000);
    return () => clearTimeout(t);
  }, [revealed]);

  async function reveal() {
    setRevealing(true);
    const res = await revealCardDetailsAction(card.id);
    setRevealing(false);
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    setRevealed(res.card);
  }

  function toggleFreeze() {
    startFrozen(async () => {
      const res = await setCardFrozenAction(card.id, !card.frozen);
      if (res.ok) {
        toast.success(res.message ?? "");
        router.refresh();
      } else {
        toast.error(res.message ?? "Couldn't update card.");
      }
    });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <CardArt
          network={card.network}
          theme={card.theme}
          cardHolder={card.cardHolder}
          lastFour={card.lastFour}
          pan={revealed?.pan ?? null}
          expiryMonth={card.expiryMonth}
          expiryYear={card.expiryYear}
          revealed={Boolean(revealed)}
          frozen={card.frozen}
          size="lg"
        />
        {revealed && (
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 text-xs">
            <p className="font-semibold text-violet-600 dark:text-violet-300">
              <Sparkles className="-mt-0.5 mr-1 inline size-3.5" />
              Card details revealed — auto-hiding in 30 seconds.
            </p>
            <dl className="mt-2 grid gap-1 font-mono">
              <Row label="CVV" value={revealed.cvv} />
              <Row
                label="Expiry"
                value={`${String(revealed.expiryMonth).padStart(2, "0")}/${String(
                  revealed.expiryYear
                ).slice(-2)}`}
              />
              <Row label="Holder" value={revealed.cardHolder} />
            </dl>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {card.accountName}
          </p>
          <p className="font-display text-lg font-semibold tracking-tight">
            {card.network === "visa"
              ? "Apex Visa Core"
              : card.network === "mastercard"
              ? "Reserve Mastercard Plus"
              : "Signature Amex Black"}
          </p>
        </div>

        <dl className="grid gap-2 text-sm">
          <Row label="Credit limit" value={currency(card.spendLimit, card.accountCurrency)} />
          <Row label="APR" value={card.apr != null ? `${card.apr}%` : "—"} />
          <Row label="Annual fee" value={currency(card.annualFee, card.accountCurrency)} />
          <Row
            label="Status"
            value={card.frozen ? "Frozen" : card.status === "active" ? "Active" : card.status}
          />
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={revealed ? () => setRevealed(null) : reveal}
            disabled={revealing}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet-500 px-4 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {revealing ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : revealed ? (
              <>
                <EyeOff className="size-3.5" /> Hide
              </>
            ) : (
              <>
                <Eye className="size-3.5" /> Reveal details
              </>
            )}
          </button>
          <button
            type="button"
            onClick={toggleFreeze}
            disabled={frozenPending}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted disabled:opacity-60"
          >
            {frozenPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : card.frozen ? (
              <>
                <Sun className="size-3.5" /> Un-freeze
              </>
            ) : (
              <>
                <Snowflake className="size-3.5" /> Freeze
              </>
            )}
          </button>
        </div>

        <form action={formAction} className="space-y-3 border-t border-border pt-4">
          <input type="hidden" name="cardId" value={card.id} />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Spending limits
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`daily-${card.id}`} className="text-xs">
                Daily limit
              </Label>
              <Input
                id={`daily-${card.id}`}
                name="dailyLimit"
                type="number"
                min={50}
                step={50}
                defaultValue={card.dailyLimit}
                aria-invalid={Boolean(state.fieldErrors?.dailyLimit)}
              />
              {state.fieldErrors?.dailyLimit && (
                <p className="text-xs text-danger">
                  {state.fieldErrors.dailyLimit}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`txn-${card.id}`} className="text-xs">
                Per-transaction
              </Label>
              <Input
                id={`txn-${card.id}`}
                name="txnLimit"
                type="number"
                min={10}
                step={10}
                defaultValue={card.txnLimit}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-9 items-center justify-center rounded-full bg-violet-500 px-4 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Lock className="mr-1.5 size-3.5" /> Update limits
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
