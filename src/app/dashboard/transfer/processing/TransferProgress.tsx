"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  CustomInterruptCard,
  FrozenCard,
} from "../_components/InterruptCards";
import {
  verifyAmlCodeAction,
  verifyTcvCodeAction,
} from "@/app/actions/transfer-verify";

type Status =
  | "processing"
  | "completed"
  | "failed"
  | "pending_tcv"
  | "pending_aml"
  | "interrupted_custom"
  | "rejected_frozen";

type Props = {
  referenceNumber: string;
  amount: number;
  fee: number;
  method: string;
  fromAccountName: string;
  fromAccountLast4: string;
  toAccountName: string;
  toAccountLast4: string;
  toBankName: string | null;
  status: Status;
  accountType: string;
  accountCurrency: string;
  interruptMessage: string | null;
};

const CUSTOM_TARGET_PCT = 43;
const CUSTOM_ANIM_MS = 2500;

export function TransferProgress(props: Props) {
  const router = useRouter();
  const stages = useMemo(
    () => buildStages({ method: props.method, bankName: props.toBankName }),
    [props.method, props.toBankName]
  );
  const [status, setStatus] = useState<Status>(props.status);
  const [currentStage, setCurrentStage] = useState(0);
  const [customPct, setCustomPct] = useState(0);
  const customDoneRef = useRef(false);

  // ── Frozen: render the card immediately, no animation.
  // ── Custom: linear animation to 43% then card.
  // ── Pending_tcv / pending_aml: animate to the gate, pause for input.
  // ── Processing / completed: animate through all stages, redirect to receipt.

  useEffect(() => {
    if (status === "rejected_frozen") return;
    if (status === "interrupted_custom") {
      if (customDoneRef.current) return;
      const start = Date.now();
      const id = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.min(
          CUSTOM_TARGET_PCT,
          (elapsed / CUSTOM_ANIM_MS) * CUSTOM_TARGET_PCT
        );
        setCustomPct(pct);
        if (elapsed >= CUSTOM_ANIM_MS) {
          customDoneRef.current = true;
          clearInterval(id);
        }
      }, 50);
      return () => clearInterval(id);
    }

    const target = targetStageFor(status, stages.length);
    if (currentStage >= target) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let acc = 0;
    for (let i = currentStage; i < target; i++) {
      acc += stages[i].durationMs;
      const idx = i + 1;
      timers.push(setTimeout(() => setCurrentStage(idx), acc));
    }
    if (
      target === stages.length &&
      (status === "completed" || status === "processing")
    ) {
      timers.push(
        setTimeout(() => {
          router.replace(
            `/dashboard/transfer/receipt/${encodeURIComponent(
              props.referenceNumber
            )}`
          );
        }, acc + 700)
      );
    }
    return () => timers.forEach((t) => clearTimeout(t));
    // currentStage intentionally not in deps — the timers schedule the
    // increments themselves, re-running on each tick would double-fire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, stages, props.referenceNumber, router]);

  // ── Render ─────────────────────────────────────────────────────────

  if (status === "rejected_frozen") {
    return (
      <FrozenCard
        accountType={props.accountType}
        referenceNumber={props.referenceNumber}
      />
    );
  }

  if (status === "interrupted_custom" && customPct >= CUSTOM_TARGET_PCT) {
    return (
      <CustomInterruptCard
        message={
          props.interruptMessage ||
          "Your transfer was interrupted by an internal review hold."
        }
        referenceNumber={props.referenceNumber}
        pct={CUSTOM_TARGET_PCT}
      />
    );
  }

  // Progress shell — used for normal flow, custom-mid-animation, and gates.
  const totalDebit = props.amount + props.fee;
  const pct =
    status === "interrupted_custom"
      ? customPct
      : Math.min(100, (currentStage / stages.length) * 100);
  const target = targetStageFor(status, stages.length);
  const atGate = currentStage >= target && currentStage < stages.length;

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Transfer in progress
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Sending {currency(totalDebit, props.accountCurrency)}
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-2 text-xs">
          <Row label="From">
            {props.fromAccountName} ·••••{props.fromAccountLast4}
          </Row>
          <Row label="To">
            {props.toAccountName} ·••••{props.toAccountLast4}
            {props.toBankName ? ` · ${props.toBankName}` : ""}
          </Row>
          <Row label="Method">
            <span className="uppercase tracking-wider">{props.method}</span>
          </Row>
          <Row label="Reference">
            <span className="font-mono">{props.referenceNumber}</span>
          </Row>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-600 transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        {status !== "interrupted_custom" && (
          <ul className="mt-5 space-y-3">
            {stages.map((stage, i) => {
              const done = i < currentStage;
              const active = i === currentStage && !atGate;
              return (
                <li
                  key={stage.label}
                  className={cn(
                    "flex items-center gap-3 text-sm transition",
                    done || active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition",
                      done && "border-success bg-success text-white",
                      active && "border-violet-500 bg-violet-500/10",
                      !done && !active && "border-border bg-card"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4" />
                    ) : active ? (
                      <Loader2 className="size-3 animate-spin text-violet-500" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </span>
                  <span className="flex-1">{stage.label}</span>
                  {done && (
                    <span className="text-[10px] uppercase tracking-wider text-success">
                      Done
                    </span>
                  )}
                  {active && (
                    <span className="text-[10px] uppercase tracking-wider text-violet-500">
                      Working…
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {atGate && status === "pending_tcv" && (
        <CodeGate
          kind="tcv"
          length={10}
          referenceNumber={props.referenceNumber}
          onVerified={(newStatus) => setStatus(newStatus as Status)}
        />
      )}
      {atGate && status === "pending_aml" && (
        <CodeGate
          kind="aml"
          length={12}
          referenceNumber={props.referenceNumber}
          onVerified={(newStatus) => setStatus(newStatus as Status)}
        />
      )}

      {status === "processing" || status === "completed" ? (
        <p className="text-center text-xs text-muted-foreground">
          Please keep this window open. We&apos;ll redirect you automatically
          once the transfer settles.
        </p>
      ) : null}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────

function targetStageFor(status: Status, total: number): number {
  if (status === "pending_tcv") return 2; // pause when "Submitting" is about to start
  if (status === "pending_aml") return total - 1; // pause just before the final stage
  if (status === "completed" || status === "processing") return total;
  return total;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

function buildStages({
  method,
  bankName,
}: {
  method: string;
  bankName: string | null;
}): { label: string; durationMs: number }[] {
  const recipient = bankName ?? "recipient";
  if (method === "internal") {
    return [
      { label: "Verifying account details", durationMs: 1300 },
      { label: "Authorizing transfer", durationMs: 1300 },
      { label: "Posting to your destination account", durationMs: 1200 },
    ];
  }
  if (method === "zelle") {
    return [
      { label: "Verifying recipient's Zelle profile", durationMs: 1400 },
      { label: "Securing connection", durationMs: 1300 },
      { label: "Routing through the Zelle network", durationMs: 1700 },
      { label: "Confirming delivery", durationMs: 1200 },
    ];
  }
  if (method === "wire") {
    return [
      { label: "Verifying recipient's bank routing", durationMs: 1300 },
      { label: "Encrypting payment instruction", durationMs: 1400 },
      { label: `Submitting wire to ${recipient} via Fedwire`, durationMs: 2000 },
      { label: "Awaiting Fedwire confirmation", durationMs: 1300 },
      { label: "Finalizing", durationMs: 900 },
    ];
  }
  // ACH
  return [
    { label: "Verifying recipient routing & account", durationMs: 1300 },
    { label: "Encrypting NACHA payment batch", durationMs: 1400 },
    {
      label: `Submitting to ACH operator for ${recipient}`,
      durationMs: 1800,
    },
    { label: "Recording pending settlement", durationMs: 1100 },
  ];
}

// ────────────────────────────────────────────────────────────────────────
// Code gate (TCV + AML share the same UI)
// ────────────────────────────────────────────────────────────────────────

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
      className="w-full rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6"
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
