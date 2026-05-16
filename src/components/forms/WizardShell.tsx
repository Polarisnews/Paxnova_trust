"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  title: string;
  subtitle?: string;
};

export function WizardProgress({
  steps,
  current,
}: {
  steps: WizardStep[];
  current: number;
}) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition",
                  state === "done" &&
                    "border-violet-500 bg-violet-500 text-white",
                  state === "current" &&
                    "border-violet-500 bg-card text-violet-600",
                  state === "todo" &&
                    "border-border bg-card text-muted-foreground"
                )}
              >
                {state === "done" ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium md:inline",
                  state === "todo"
                    ? "text-muted-foreground"
                    : "text-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-px flex-1 transition-colors",
                  i < current ? "bg-violet-500" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function WizardStepHeader({
  step,
  index,
  total,
}: {
  step: WizardStep;
  index: number;
  total: number;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">
        Step {index + 1} of {total}
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
        {step.title}
      </h3>
      {step.subtitle && (
        <p className="mt-1 text-sm text-muted-foreground">{step.subtitle}</p>
      )}
    </div>
  );
}

export function WizardNav({
  canBack,
  onBack,
  onNext,
  isLast,
  pending,
  nextLabel = "Continue",
  submitLabel = "Submit application",
}: {
  canBack: boolean;
  onBack: () => void;
  onNext?: () => void;
  isLast: boolean;
  pending: boolean;
  nextLabel?: string;
  submitLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={!canBack || pending}
        className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-40"
      >
        Back
      </button>
      <button
        type={isLast ? "submit" : "button"}
        onClick={isLast ? undefined : onNext}
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 disabled:opacity-60"
      >
        {pending && isLast ? "Submitting…" : isLast ? submitLabel : nextLabel}
      </button>
    </div>
  );
}
