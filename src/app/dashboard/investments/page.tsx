import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = { title: "Investments" };

export default async function InvestmentsPage() {
  await requireAuth();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-3xl border border-border bg-card p-10 text-center">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
          <TrendingUp className="size-5" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">
          Wealth, by Nova Trust
        </h1>
        <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
          Managed portfolios and self-directed investing are launching in Q3 2026.
          Join the waitlist to get early access and a fee-free starter portfolio.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/personal/wealth"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-violet-500 px-5 text-xs font-semibold text-white hover:bg-violet-600"
          >
            <Sparkles className="size-3.5" />
            Join the waitlist
          </Link>
          <Link
            href="/personal/savings"
            className="inline-flex h-10 items-center rounded-full border border-border px-5 text-xs font-semibold hover:bg-muted"
          >
            Try 4.85% APY savings instead
          </Link>
        </div>
      </div>
    </div>
  );
}
