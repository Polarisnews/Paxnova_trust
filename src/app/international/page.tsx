import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Globe2,
  Handshake,
  Plane,
  ShieldCheck,
  Ship,
} from "lucide-react";

export const metadata: Metadata = {
  title: "International banking",
  description:
    "Cross-border accounts, FX, and trade finance for companies and individuals operating across markets.",
};

const desks = [
  {
    region: "Asia-Pacific",
    cities: "Hong Kong · Singapore · Tokyo · Sydney",
    body: "RMB clearing, JPY treasury, and dedicated relationship bankers for inbound and outbound APAC trade.",
    anchor: "apac",
  },
  {
    region: "Europe & UK",
    cities: "London · Frankfurt · Zurich · Dublin",
    body: "SEPA Instant, UK Faster Payments, and EUR/GBP correspondent banking with same-day settlement.",
    anchor: "emea",
  },
  {
    region: "Americas",
    cities: "New York · Miami · São Paulo · Mexico City",
    body: "USD clearing for LATAM operations, US-bound trade finance, and NAFTA-region treasury services.",
    anchor: "americas",
  },
];

const capabilities = [
  {
    icon: Globe2,
    title: "Global accounts",
    body: "Hold and transact in 30+ currencies under a single relationship — one login, one statement, one banker.",
    anchor: "accounts",
  },
  {
    icon: Banknote,
    title: "Foreign exchange",
    body: "Real-time FX at mid-market spreads, forward contracts, and NDF hedging on 90+ currency pairs.",
    anchor: "fx",
  },
  {
    icon: Ship,
    title: "Trade finance",
    body: "Letters of credit, documentary collections, and supply-chain finance backed by a $4.2B trade book.",
    anchor: "trade",
  },
  {
    icon: ShieldCheck,
    title: "Sanctions & compliance",
    body: "In-house OFAC, FATF, and EU compliance review — most wires cleared in under 90 seconds.",
    anchor: "compliance",
  },
  {
    icon: Plane,
    title: "Expat & global mobility",
    body: "Multi-jurisdiction accounts for executives on international assignment, with tax-statement support.",
    anchor: "expat",
  },
  {
    icon: Handshake,
    title: "Correspondent banking",
    body: "USD nostro accounts and clearing for 240+ financial institutions worldwide.",
    anchor: "correspondent",
  },
];

const stats = [
  { label: "Currencies supported", value: "30+" },
  { label: "Avg wire settlement", value: "94 sec" },
  { label: "Trade-finance book", value: "$4.2B" },
  { label: "Regional desks", value: "12" },
];

export default function InternationalPage() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            International banking
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight text-balance lg:text-6xl">
            One bank. Every market your business reaches.
          </h1>
          <p className="mt-5 max-w-2xl text-white/75">
            Whether you're invoicing a supplier in Shenzhen, hedging EUR
            payroll, or opening a regional treasury in Singapore — Paxnova Trust
            gives you a single relationship for the world your business
            operates in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-navy-900 shadow-glow-gold hover:bg-gold-300"
            >
              Speak with an international banker
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/apply?product=business"
              className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold backdrop-blur hover:bg-white/10"
            >
              Open a multi-currency account
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
            Cross-border banking, without the friction.
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

      <section className="bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Regional desks
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
              Local bankers, on the ground.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {desks.map((d) => (
              <div
                key={d.region}
                id={d.anchor}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-500">
                  {d.cities}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                  {d.region}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-balance">
          Banking that follows your business across borders.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Open a multi-currency account in 10 minutes. Move funds the same day.
        </p>
        <Link
          href="/apply?product=business"
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-violet-500 px-8 text-sm font-semibold text-white shadow-glow-violet hover:bg-violet-600"
        >
          Get started
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </>
  );
}
