"use client";

// Stylized inline-SVG store badges. Same general visual style as the
// official Apple "Download on the App Store" and Google "Get it on Google
// Play" badges (rounded dark plaque, brand glyph, two-line label), drawn
// from scratch — not a reproduction of the official artwork.
//
// Clicking either badge opens a smart in-app dialog that briefly mimics a
// "connecting to the store" loading state, then surfaces a maintenance
// message. The badges intentionally do NOT navigate to a real store while
// the app build is on hold — the dialog is the destination.

import { useEffect, useState } from "react";
import { Loader2, Sparkles, Wrench, BellRing, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Size = "sm" | "md";
type Platform = "apple" | "google";

export function AppleStoreBadge({ size = "md" }: { size?: Size }) {
  const [open, setOpen] = useState(false);
  const dims = sizeMap(size);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Download on the App Store"
        className="inline-flex items-center gap-3 rounded-xl bg-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-zinc-900 active:scale-[0.98]"
        style={{
          paddingLeft: dims.padX,
          paddingRight: dims.padX,
          paddingTop: dims.padY,
          paddingBottom: dims.padY,
          gap: dims.gap,
        }}
      >
        <AppleGlyph size={dims.glyph} />
        <span className="flex flex-col leading-none">
          <span
            className="font-medium tracking-wide text-white/85"
            style={{ fontSize: dims.line1 }}
          >
            Download on the
          </span>
          <span
            className="font-display font-semibold tracking-tight"
            style={{ fontSize: dims.line2, marginTop: 2 }}
          >
            App Store
          </span>
        </span>
      </button>
      <StoreMaintenanceDialog
        open={open}
        onOpenChange={setOpen}
        platform="apple"
      />
    </>
  );
}

export function GooglePlayBadge({ size = "md" }: { size?: Size }) {
  const [open, setOpen] = useState(false);
  const dims = sizeMap(size, "google");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Get it on Google Play"
        className="inline-flex items-center gap-3 rounded-xl bg-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-zinc-900 active:scale-[0.98]"
        style={{
          paddingLeft: dims.padX,
          paddingRight: dims.padX,
          paddingTop: dims.padY,
          paddingBottom: dims.padY,
          gap: dims.gap,
        }}
      >
        <PlayGlyph size={dims.glyph} />
        <span className="flex flex-col leading-none">
          <span
            className="font-medium uppercase tracking-[0.18em] text-white/85"
            style={{ fontSize: dims.line1 }}
          >
            Get it on
          </span>
          <span
            className="font-display font-semibold tracking-tight"
            style={{ fontSize: dims.line2, marginTop: 2 }}
          >
            Google Play
          </span>
        </span>
      </button>
      <StoreMaintenanceDialog
        open={open}
        onOpenChange={setOpen}
        platform="google"
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// The smart maintenance dialog
// ──────────────────────────────────────────────────────────────────────

const PLATFORM_LABEL: Record<Platform, string> = {
  apple: "App Store",
  google: "Google Play",
};

function StoreMaintenanceDialog({
  open,
  onOpenChange,
  platform,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: Platform;
}) {
  const [stage, setStage] = useState<"loading" | "maintenance" | "subscribed">(
    "loading",
  );
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Reset to the loading stage each time the dialog opens. The fake-load
  // delay is 1500ms — short enough to not feel sluggish, long enough that
  // the user reads "connecting" before the maintenance message lands.
  useEffect(() => {
    if (!open) return;
    setStage("loading");
    setShowEmailInput(false);
    setEmail("");
    setEmailError(null);

    const id = window.setTimeout(() => {
      setStage("maintenance");
    }, 1500);
    return () => window.clearTimeout(id);
  }, [open]);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Enter a valid email so we can notify you.");
      return;
    }
    // No network call wired up here — we'd POST this to /api/notify-launch
    // (or similar) when the launch list endpoint exists.
    setEmailError(null);
    setStage("subscribed");
  }

  const label = PLATFORM_LABEL[platform];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">
          {stage === "loading"
            ? `Connecting to ${label}`
            : stage === "subscribed"
              ? "You're on the list"
              : `${label} download temporarily unavailable`}
        </DialogTitle>
        <DialogDescription className="sr-only">
          The Paxnova Trust app on {label} is undergoing routine maintenance.
        </DialogDescription>

        {/* Header bar — mimics the platform's brand chrome */}
        <div className="flex items-center gap-3 border-b border-border bg-black px-4 py-3 text-white">
          {platform === "apple" ? (
            <AppleGlyph size={20} />
          ) : (
            <PlayGlyph size={20} />
          )}
          <p className="text-sm font-semibold">{label}</p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="ml-auto inline-flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-6">
          {stage === "loading" && <LoadingStage label={label} />}
          {stage === "maintenance" && (
            <MaintenanceStage
              label={label}
              showEmailInput={showEmailInput}
              setShowEmailInput={setShowEmailInput}
              email={email}
              setEmail={setEmail}
              emailError={emailError}
              setEmailError={setEmailError}
              onSubmitEmail={submitEmail}
              onClose={() => onOpenChange(false)}
            />
          )}
          {stage === "subscribed" && (
            <SubscribedStage
              label={label}
              email={email}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoadingStage({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="relative inline-flex">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-violet-500/30"
        />
        <span className="relative inline-flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
          <Loader2 className="size-6 animate-spin" />
        </span>
      </span>
      <p className="mt-4 font-display text-lg font-semibold tracking-tight">
        Connecting to {label}…
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Verifying availability for your device.
      </p>
      <div className="mt-4 h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="pn-progress-bar h-full bg-gradient-to-r from-violet-500 to-gold-500" />
      </div>
    </div>
  );
}

function MaintenanceStage({
  label,
  showEmailInput,
  setShowEmailInput,
  email,
  setEmail,
  emailError,
  setEmailError,
  onSubmitEmail,
  onClose,
}: {
  label: string;
  showEmailInput: boolean;
  setShowEmailInput: (b: boolean) => void;
  email: string;
  setEmail: (s: string) => void;
  emailError: string | null;
  setEmailError: (s: string | null) => void;
  onSubmitEmail: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-500/15 text-gold-700 dark:text-gold-300">
          <Wrench className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg font-semibold leading-tight tracking-tight">
            App temporarily unavailable
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
            Our app is undergoing routine maintenance at this time, it will be
            available for download shortly.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-violet-500" />
          <span className="font-medium text-foreground">
            What you can do in the meantime
          </span>
        </p>
        <ul className="mt-2 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/60" />
            Continue banking in your browser — every feature works on web.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/60" />
            Add Paxnova Trust to your home screen as a Progressive Web App.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 inline-block size-1 shrink-0 rounded-full bg-muted-foreground/60" />
            We&apos;ll email you the moment the {label} download is live.
          </li>
        </ul>
      </div>

      {!showEmailInput ? (
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row-reverse">
          <button
            type="button"
            onClick={() => setShowEmailInput(true)}
            className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-glow-violet transition hover:bg-violet-600 active:scale-[0.98]"
          >
            <BellRing className="size-4" />
            Notify me when it&apos;s ready
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted active:scale-[0.98]"
          >
            Got it
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmitEmail} className="mt-5">
          <label htmlFor="store-notify-email" className="sr-only">
            Email address
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="store-notify-email"
              type="email"
              autoFocus
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              aria-invalid={Boolean(emailError)}
              className={cn(
                "h-11 flex-1 rounded-full border bg-background px-4 text-sm outline-none transition focus-visible:border-violet-500 focus-visible:ring-3 focus-visible:ring-violet-500/30",
                emailError ? "border-danger" : "border-border",
              )}
            />
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 active:scale-[0.98]"
            >
              Notify me
            </button>
          </div>
          {emailError && (
            <p className="mt-1.5 text-xs text-danger">{emailError}</p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            We&apos;ll only email you about the {label} launch. No marketing.
          </p>
        </form>
      )}
    </div>
  );
}

function SubscribedStage({
  label,
  email,
  onClose,
}: {
  label: string;
  email: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-4 text-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
        <BellRing className="size-6" />
      </span>
      <p className="mt-4 font-display text-lg font-semibold tracking-tight">
        You&apos;re on the list.
      </p>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        We&apos;ll email{" "}
        <span className="font-mono text-foreground">{email}</span> the moment
        the Paxnova Trust app returns to {label}.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-navy-900 px-6 text-sm font-semibold text-white hover:bg-navy-700"
      >
        Close
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Layout helpers + glyphs (unchanged from before)
// ──────────────────────────────────────────────────────────────────────

function sizeMap(size: Size, variant: "apple" | "google" = "apple") {
  const glyphAdjust = variant === "google" ? (size === "sm" ? 22 : 26) : (size === "sm" ? 22 : 28);
  return size === "sm"
    ? { padX: 14, padY: 6, gap: 10, glyph: glyphAdjust, line1: 9, line2: 16 }
    : { padX: 18, padY: 9, gap: 12, glyph: glyphAdjust, line1: 10, line2: 19 };
}

function AppleGlyph({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.4 17.9c0-3 2.4-4.4 2.5-4.5-1.4-2-3.5-2.3-4.3-2.3-1.8-.2-3.5 1.1-4.4 1.1-.9 0-2.4-1-3.9-1-2 0-3.9 1.2-4.9 3-2.1 3.6-.5 9 1.5 12 1 1.4 2.2 3 3.8 2.9 1.5-.1 2.1-1 4-1s2.4 1 4 1c1.7 0 2.7-1.4 3.7-2.8 1.2-1.6 1.7-3.2 1.7-3.3-.1 0-3.7-1.4-3.7-5.6Z" />
      <path d="M18.8 8.2c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.6.8-3.5 1.8-.8.9-1.5 2.3-1.3 3.6 1.3.1 2.7-.7 3.6-1.6Z" />
    </svg>
  );
}

function PlayGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="gp-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2EC9FF" />
          <stop offset="100%" stopColor="#1A8DD8" />
        </linearGradient>
        <linearGradient id="gp-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#56E37A" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="gp-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="gp-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <path d="M6 4 L22 15 L16 15 L6 9 Z" fill="url(#gp-cyan)" />
      <path d="M22 15 L28 16 L22 17 Z" fill="url(#gp-yellow)" />
      <path d="M6 28 L22 17 L16 17 L6 23 Z" fill="url(#gp-red)" />
      <path d="M6 9 L16 15 L16 17 L6 23 Z" fill="url(#gp-green)" />
    </svg>
  );
}
