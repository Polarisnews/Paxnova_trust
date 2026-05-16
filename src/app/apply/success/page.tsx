import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Application received" };

export default async function ApplySuccessPage(props: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await props.searchParams;
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <span className="inline-flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="size-8" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
        Application received
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Thanks for choosing Paxnova Trust. Our compliance team usually reviews
        applications within one business day.
      </p>
      {user && (
        <p className="mt-4 max-w-md rounded-lg border border-success/30 bg-success/5 px-4 py-3 text-sm text-foreground">
          You&apos;re signed in as <strong>{user.firstName} {user.lastName}</strong>.
          You can track this application — and any future ones — from your
          dashboard.
        </p>
      )}
      {ref && (
        <p className="mt-6 rounded-lg border border-border bg-card px-5 py-3 font-mono text-sm">
          Reference: <span className="font-semibold">{ref}</span>
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-600"
        >
          {user ? "Go to my dashboard" : "Go to dashboard"}
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm font-medium hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
