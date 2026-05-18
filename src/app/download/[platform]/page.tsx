import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Lock, Sparkles } from "lucide-react";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import {
  AppleStoreBadge,
  GooglePlayBadge,
} from "../_components/StoreBadges";

export const metadata: Metadata = { title: "Get the Paxnova Trust app" };
export const dynamic = "force-dynamic";

type Platform = "ios" | "android";

export default async function DownloadPage(props: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await props.params;
  if (platform !== "ios" && platform !== "android") notFound();
  const p = platform as Platform;

  // The gate: signed-in users with at least one funded (balance > 0) cash
  // account see the happy-path placeholder. Everyone else sees the bold red
  // "not eligible" message.
  const user = await getCurrentUser();
  let eligible = false;
  if (user) {
    const userAccounts = db
      .select({ balance: accounts.balance, type: accounts.type })
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .all();
    eligible = userAccounts.some((a) => a.type !== "credit" && a.balance > 0);
  }

  const platformName = p === "ios" ? "App Store" : "Google Play";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl flex-col items-center justify-center px-4 py-16 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        {p === "ios" ? (
          <AppleStoreBadge size="sm" />
        ) : (
          <GooglePlayBadge size="sm" />
        )}
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {platformName}
        </span>
      </div>

      {eligible ? <EligibleCard platformName={platformName} /> : <GateCard platformName={platformName} />}

      <Link
        href="/"
        className="mt-6 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        ← Back to home
      </Link>
    </div>
  );
}

function GateCard({ platformName }: { platformName: string }) {
  return (
    <div className="w-full rounded-2xl border border-danger/30 bg-card p-8 text-center shadow-soft sm:p-10">
      <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-danger/15 text-danger">
        <Lock className="size-7" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-danger sm:text-3xl">
        You are not eligible to download this app yet
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-foreground">
        Fund your Paxnova Trust account to unlock the mobile experience. Open or
        fund an account, then come back to this page to install from the{" "}
        {platformName}.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/personal"
          className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Open an account
        </Link>
        <Link
          href="/signin"
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold hover:bg-muted"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

function EligibleCard({ platformName }: { platformName: string }) {
  return (
    <div className="w-full rounded-2xl border border-success/30 bg-card p-8 text-center shadow-soft sm:p-10">
      <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
        <Sparkles className="size-7" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        You&apos;re cleared to install
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        The Paxnova Trust app on {platformName} is currently in invite-only beta.
        Your account is on the list — we&apos;ll email an install link the day
        the beta opens.
      </p>
      <p className="mx-auto mt-4 max-w-md text-xs text-muted-foreground">
        Reach out to{" "}
        <a
          href="mailto:beta@paxnovatrust.com"
          className="font-medium text-violet-500"
        >
          beta@paxnovatrust.com
        </a>{" "}
        if you want priority access.
      </p>
    </div>
  );
}
