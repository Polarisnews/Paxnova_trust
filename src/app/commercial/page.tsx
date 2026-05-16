import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Coins,
  Factory,
  HandCoins,
  Landmark,
  Receipt,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Commercial banking",
  description:
    "Lending, treasury, and capital markets for middle-market and large corporate clients.",
};

const capabilities = [
  {
    icon: Building2,
    title: "Commercial real estate",
    body: "Acquisition, construction, and bridge financing up to $250M across multifamily, office, industrial, and retail.",
    anchor: "real-estate",
  },
  {
    icon: HandCoins,
    title: "Asset-based lending",
    body: "Working-capital lines secured by receivables, inventory, or equipment — sized to your borrowing base.",
    anchor: "asset-based",
  },
  {
    icon: Landmark,
    title: "Syndicated finance",
    body: "Lead-arranger and participation roles in club deals from $100M to $2B across investment-grade and leveraged credits.",
    anchor: "syndicated",
  },
  {
    icon: Coins,
    title: "Commercial treasury",
    body: "Sweep, lockbox, and liquidity platforms for treasurers managing $50M+ in operating balances.",
    anchor: "treasury",
  },
  {
    icon: Receipt,
    title: "Merchant services",
    body: "Card acquiring, ACH origination, and same-day settlement with transparent interchange-plus pricing.",
    anchor: "payments",
  },
  {
    icon: Factory,
    title: "Specialized industries",
    body: "Dedicated coverage for healthcare, logistics, real estate, franchise, and government contractors.",
    anchor: "industries",
  },
];

const stats = [
  { label: "Committed capital", value: "$18.4B" },
  { label: "Active relationships", value: "1,200+" },
  { label: "Avg credit decision", value: "9 days" },
  { label: "Dedicated bankers", value: "180" },
];

export default function CommercialPage() {
  return (
    <>
      <section className="gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            Commercial banking
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight text-balance lg:text-6xl">
            Capital for the companies building tomorrow's infrastructure.
          </h1>
          <p className="mt-5 max-w-2xl text-white/75">
            Middle-market and large-corporate clients work with a single
            relationship banker backed by an institutional balance sheet —
            real-estate lenders, syndications, treasury, and capital-markets
            specialists, all under one roof.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-navy-900 shadow-glow-gold hover:bg-gold-300"
            >
              Talk to a commercial banker
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/apply?product=business"
              className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold backdrop-blur hover:bg-white/10"
            >
              Open a commercial account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-semibold tracking-tight text-violet-500">
                {s.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Capabilities
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Built for finance teams that move first.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                id={c.anchor}
                className="rounded-2xl border border-border bg-card p-7 transition hover:border-violet-500/40 hover:shadow-soft"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-balance">
          A relationship banker who knows your industry.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Average client tenure with their lead banker: 7.4 years.
        </p>
        <Link
          href="/contact"
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-violet-500 px-8 text-sm font-semibold text-white shadow-glow-violet hover:bg-violet-600"
        >
          Request a consultation
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </>
  );
}
