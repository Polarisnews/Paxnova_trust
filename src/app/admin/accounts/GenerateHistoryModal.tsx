"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, ChevronDown, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  generateHistoryAction,
  type GenerateHistoryState,
} from "@/app/actions/admin";

const INDUSTRY_OPTIONS = [
  { value: "personal", label: "Personal / family" },
  { value: "plumbing", label: "Plumbing" },
  { value: "construction", label: "Construction" },
  { value: "retail", label: "Retail / e-commerce" },
  { value: "restaurant", label: "Restaurant / hospitality" },
  { value: "tech-services", label: "Technology / SaaS" },
] as const;

const INDUSTRY_LABEL: Record<string, string> = Object.fromEntries(
  INDUSTRY_OPTIONS.map((o) => [o.value, o.label]),
);

const initial: GenerateHistoryState = { ok: false };

function todayIso(offsetMonths = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return d.toISOString().slice(0, 10);
}

export function GenerateHistoryModal({
  accountId,
  accountName,
  accountCurrency,
  accountType,
  onClose,
}: {
  accountId: number;
  accountName: string;
  accountCurrency: string;
  accountType: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [from, setFrom] = useState(todayIso(-12));
  const [to, setTo] = useState(todayIso(0));
  const [count, setCount] = useState(50);
  // Multi-select industries. Default seeded with one based on account type.
  const [industries, setIndustries] = useState<Set<string>>(
    () =>
      new Set([accountType === "business" ? "tech-services" : "personal"]),
  );
  const [industryOpen, setIndustryOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);

  const [style, setStyle] = useState<"business" | "personal">(
    accountType === "business" || accountType === "credit" ? "business" : "personal"
  );
  const [seed, setSeed] = useState("");
  const [pending, setPending] = useState(false);
  const [state, setState] = useState<GenerateHistoryState>(initial);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  // Close the industry dropdown when clicking outside its container.
  useEffect(() => {
    if (!industryOpen) return;
    function onDocClick(e: MouseEvent) {
      if (
        industryRef.current &&
        !industryRef.current.contains(e.target as Node)
      ) {
        setIndustryOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [industryOpen]);

  function toggleIndustry(value: string) {
    setIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        // Don't allow zero — require at least one selected.
        if (next.size > 1) next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function selectAllIndustries() {
    setIndustries(new Set(INDUSTRY_OPTIONS.map((o) => o.value)));
  }
  function selectOnly(value: string) {
    setIndustries(new Set([value]));
  }

  const industryLabel =
    industries.size === 0
      ? "Pick an industry"
      : industries.size === 1
        ? INDUSTRY_LABEL[Array.from(industries)[0]] ?? "1 selected"
        : industries.size === INDUSTRY_OPTIONS.length
          ? `All ${industries.size} industries`
          : `${industries.size} industries selected`;

  const estDurationMs = useMemo(() => Math.max(800, count * 12), [count]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setState(initial);
    setProgress(0);
    const started = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - started;
      // Asymptote at 92 % while the action runs; jump to 100 on success.
      const pct = Math.min(92, (elapsed / estDurationMs) * 92);
      setProgress(pct);
    }, 60);

    const fd = new FormData();
    fd.set("accountId", String(accountId));
    fd.set("from", from);
    fd.set("to", to);
    fd.set("count", String(count));
    // Append every selected industry as a separate "industries" entry so the
    // server can read them via formData.getAll("industries").
    for (const i of industries) fd.append("industries", i);
    fd.set("style", style);
    fd.set("seed", seed);

    const res = (await generateHistoryAction(
      initial,
      fd
    )) as GenerateHistoryState;
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(100);
    setPending(false);
    setState(res);
    if (res.ok) {
      router.refresh();
    } else if (res.message && !res.fieldErrors) {
      toast.error(res.message);
    }
  }

  return (
    <>
      <button
        type="button"
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-foreground/30"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-elev">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <h3 className="font-display text-base font-semibold">
              Generate transaction history
            </h3>
            <p className="text-xs text-muted-foreground">
              {accountName} · {accountCurrency}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="from" className="text-xs font-medium">
                Date from
              </Label>
              <Input
                id="from"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                aria-invalid={Boolean(state.fieldErrors?.from)}
              />
              {state.fieldErrors?.from && (
                <p className="text-xs text-danger">{state.fieldErrors.from}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to" className="text-xs font-medium">
                Date to
              </Label>
              <Input
                id="to"
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                min={from}
                aria-invalid={Boolean(state.fieldErrors?.to)}
              />
              {state.fieldErrors?.to && (
                <p className="text-xs text-danger">{state.fieldErrors.to}</p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="count" className="text-xs font-medium">
                Number of transactions
              </Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.min(500, Math.max(1, Number(e.target.value) || 50))
                  )
                }
              />
              <p className="text-[11px] text-muted-foreground">
                Up to 500. Posts as real ledger rows; account balance updates
                to the final running total.
              </p>
            </div>
            <div className="space-y-1.5" ref={industryRef}>
              <Label className="text-xs font-medium">
                Industries
                <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                  ({industries.size} selected)
                </span>
              </Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIndustryOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={industryOpen}
                  className={cn(
                    "flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-background px-3 text-left text-sm transition",
                    industryOpen
                      ? "border-violet-500 ring-2 ring-violet-500/30"
                      : "border-border hover:border-violet-500/40",
                    state.fieldErrors?.industries && "border-danger",
                  )}
                >
                  <span className="truncate">{industryLabel}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      industryOpen && "rotate-180",
                    )}
                  />
                </button>
                {industryOpen && (
                  <div
                    role="listbox"
                    aria-multiselectable
                    className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-elev"
                  >
                    <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2 text-[10px]">
                      <button
                        type="button"
                        onClick={selectAllIndustries}
                        className="font-semibold text-violet-500 hover:text-violet-600"
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          selectOnly(
                            accountType === "business"
                              ? "tech-services"
                              : "personal",
                          )
                        }
                        className="font-medium text-muted-foreground hover:text-foreground"
                      >
                        Reset
                      </button>
                    </div>
                    <ul className="max-h-60 overflow-y-auto py-1">
                      {INDUSTRY_OPTIONS.map((o) => {
                        const checked = industries.has(o.value);
                        return (
                          <li key={o.value}>
                            <label
                              className={cn(
                                "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition hover:bg-muted",
                                checked && "bg-violet-500/8",
                              )}
                            >
                              <span
                                aria-hidden
                                className={cn(
                                  "inline-flex size-4 shrink-0 items-center justify-center rounded border transition",
                                  checked
                                    ? "border-violet-500 bg-violet-500 text-white"
                                    : "border-border bg-background",
                                )}
                              >
                                {checked && <Check className="size-3" />}
                              </span>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleIndustry(o.value)}
                                className="sr-only"
                              />
                              <span className="flex-1">{o.label}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
              {state.fieldErrors?.industries && (
                <p className="text-xs text-danger">
                  {state.fieldErrors.industries}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Count is split evenly across selected industries. Pick 1–
                {INDUSTRY_OPTIONS.length}.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Style</Label>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setStyle("business")}
                className={
                  "rounded-full px-3 py-1.5 font-semibold transition " +
                  (style === "business"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Business
              </button>
              <button
                type="button"
                onClick={() => setStyle("personal")}
                className={
                  "rounded-full px-3 py-1.5 font-semibold transition " +
                  (style === "personal"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                Personal
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Business style mixes in payroll / rent / utility patterns and
              targets a slight cash-positive ratio.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seed" className="text-xs font-medium">
              Seed (optional)
            </Label>
            <Input
              id="seed"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Same seed = same output. Useful for reruns."
            />
          </div>

          {(pending || progress > 0) && !state.summary && (
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
              <p className="flex items-center gap-2 text-xs font-medium text-violet-600 dark:text-violet-300">
                <Loader2 className="size-3.5 animate-spin" />
                {pending
                  ? `Generating ${count} transactions…`
                  : "Wrapping up…"}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-500/15">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {state.summary && (
            <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-xs">
              <p className="flex items-center gap-2 font-semibold text-success">
                <CheckCircle2 className="size-4" />
                Generated {state.summary.generated} transactions
              </p>
              {state.perIndustry && state.perIndustry.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {state.perIndustry.map((p) => (
                    <span
                      key={p.industry}
                      className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-300"
                    >
                      {INDUSTRY_LABEL[p.industry] ?? p.industry}
                      <span className="rounded-full bg-white/40 px-1 tabular-nums dark:bg-white/10">
                        {p.count}
                      </span>
                    </span>
                  ))}
                </div>
              )}
              <dl className="mt-2 grid gap-1 text-foreground">
                <Row
                  label="Total credits"
                  value={currency(state.summary.credits, accountCurrency)}
                />
                <Row
                  label="Total debits"
                  value={currency(state.summary.debits, accountCurrency)}
                />
                <Row
                  label="Net change"
                  value={currency(state.summary.netChange, accountCurrency)}
                />
                <Row
                  label="Opening balance"
                  value={currency(state.summary.openingBalance, accountCurrency)}
                />
                <Row
                  label="New balance"
                  value={currency(state.summary.finalBalance, accountCurrency)}
                  strong
                />
              </dl>
            </div>
          )}

          {state.message && !state.ok && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-xs text-danger">
              {state.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-background px-4 text-xs font-medium hover:bg-muted"
            >
              {state.ok ? "Close" : "Cancel"}
            </button>
            {!state.ok && (
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-4 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
              >
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="size-3.5" /> Generate
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={
        "flex items-baseline justify-between gap-3 " +
        (strong ? "border-t border-success/20 pt-1.5 font-semibold" : "")
      }
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  );
}
