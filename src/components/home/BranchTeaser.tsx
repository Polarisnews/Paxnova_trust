"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, ArrowUpRight } from "lucide-react";

const BranchMap = dynamic(() => import("./BranchMap").then((m) => m.BranchMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-2xl bg-muted" />
  ),
});

export function BranchTeaser() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Branches & ATMs
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Digital-first, never digital-only.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Flagship branches in 14 cities, 55,000 fee-free ATMs nationwide. When you
            need a person, one is two blocks away.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-navy-900 px-5 text-sm font-semibold text-white transition hover:bg-navy-700"
            >
              <MapPin className="size-4" />
              Find a branch
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-1 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted"
            >
              Locate an ATM
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="h-[400px] overflow-hidden rounded-2xl border border-border shadow-soft">
          <BranchMap />
        </div>
      </div>
    </section>
  );
}
