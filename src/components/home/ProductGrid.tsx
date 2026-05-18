"use client";

import Link from "next/link";
import {
  Banknote,
  Briefcase,
  CreditCard,
  Home,
  PiggyBank,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

const products = [
  {
    title: "Checking",
    icon: Banknote,
    description: "Zero-fee everyday banking with insights that anticipate your next move.",
    href: "/personal/checking",
    accent: "from-violet-500/15 to-transparent",
    ring: "group-hover:shadow-glow-violet",
  },
  {
    title: "High-yield savings",
    icon: PiggyBank,
    description: "4.85% APY, FDIC-insured, no minimums and no surprises.",
    href: "/personal/savings",
    accent: "from-gold-300/20 to-transparent",
    ring: "group-hover:shadow-glow-gold",
  },
  {
    title: "Credit cards",
    icon: CreditCard,
    description: "Travel, cash back, or premium concierge — three cards, real rewards.",
    href: "/personal/cards",
    accent: "from-violet-500/15 to-transparent",
    ring: "group-hover:shadow-glow-violet",
  },
  {
    title: "Mortgages",
    icon: Home,
    description: "Pre-approved in 8 minutes, closed in 21 days. Personal banker included.",
    href: "/personal/mortgages",
    accent: "from-violet-500/15 to-transparent",
    ring: "group-hover:shadow-glow-violet",
  },
  {
    title: "Wealth management",
    icon: TrendingUp,
    description: "Private-bank insights with the ease of a 2026 mobile experience.",
    href: "/personal/wealth",
    accent: "from-gold-300/20 to-transparent",
    ring: "group-hover:shadow-glow-gold",
  },
  {
    title: "Business banking",
    icon: Briefcase,
    description: "From your first invoice to your IPO, banking that scales with you.",
    href: "/business",
    accent: "from-violet-500/15 to-transparent",
    ring: "group-hover:shadow-glow-violet",
  },
];

export function ProductGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mb-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Built around you
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            One bank. Every product. Engineered for 2026.
          </h2>
        </div>
        <Link
          href="/personal"
          className="inline-flex items-center gap-1 text-sm font-medium text-violet-500 hover:text-violet-600"
        >
          Compare all accounts <ArrowUpRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ y: 28 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={p.href}
                className={`group relative block h-full overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 ${p.ring}`}
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100 ${p.accent}`}
                />
                <div className="flex size-12 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-violet-500">
                  Learn more
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
