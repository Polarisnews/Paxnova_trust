import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = { title: "Application submitted" };

export default async function SubmittedPage(props: {
  searchParams: Promise<{ ref?: string }>;
}) {
  await requireAuth();
  const { ref } = await props.searchParams;

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-soft">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
          Application submitted
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A Paxnova Trust operations officer will review your application within 1
          business day. We&apos;ll email you the moment it&apos;s approved and
          the new card will appear on your dashboard.
        </p>

        {ref && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
            <Mail className="size-3.5 text-muted-foreground" />
            Reference <span className="font-mono">{ref}</span>
          </p>
        )}

        <div className="mt-8 flex flex-col items-stretch justify-center gap-2 sm:flex-row">
          <Link
            href="/dashboard/cards"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold hover:bg-muted"
          >
            View my cards
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-8 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Done
          </Link>
        </div>
      </div>
    </div>
  );
}
