import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = { title: "Business banking" };

const tiers = [
  {
    name: "Startup",
    price: "$0/mo",
    description: "For founders with their first customer.",
    features: [
      "Operating account, no minimums",
      "Up to 5 virtual cards",
      "Free incoming wires",
      "Founder-friendly onboarding",
    ],
    cta: "Open Startup account",
    accent: false,
  },
  {
    name: "Growth",
    price: "$30/mo",
    description: "When you've got payroll and a finance team.",
    features: [
      "Everything in Startup",
      "Lines of credit up to $250k",
      "Expense management & receipts",
      "Multi-user roles and approvals",
      "Sweep accounts (4.10% APY)",
    ],
    cta: "Talk to a specialist",
    accent: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For complex treasury and global needs.",
    features: [
      "Everything in Growth",
      "Dedicated treasury banker",
      "Multi-currency accounts (USD, EUR, GBP, +30)",
      "API-first with sandbox + production",
      "SOC 2, ISO 27001 audited",
    ],
    cta: "Schedule a consult",
    accent: false,
  },
];

const counters = [
  { label: "Managed for SMBs", value: "$2.4B" },
  { label: "Avg approval speed", value: "11 min" },
  { label: "Active business customers", value: "32,000+" },
  { label: "Treasury yield (Q1)", value: "4.10%" },
];

const treasury = [
  {
    q: "What is automated treasury sweep?",
    a: "Idle operating cash is automatically swept into a money-market product paying current Fed Funds + 0.10%. Withdrawals are instant during banking hours.",
  },
  {
    q: "Do you integrate with our accounting stack?",
    a: "Yes — native sync with QuickBooks, Xero, Netsuite, and a webhook API for anything else.",
  },
  {
    q: "Can we issue cards to contractors?",
    a: "Yes. Up to 100 virtual or physical cards per business with per-merchant and per-amount controls.",
  },
];

export default function BusinessPage() {
  return (
    <>
      <section className="gradient-hero text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            Business banking
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight text-balance lg:text-6xl">
            From first invoice to IPO — one bank.
          </h1>
          <p className="mt-5 max-w-2xl text-white/75">
            Modern operating accounts, automated treasury, and a real human on call.
            Built for venture-backed startups and 40-person agencies alike.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/apply?product=business"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-navy-900 shadow-glow-gold hover:bg-gold-300"
            >
              Open a business account
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold backdrop-blur hover:bg-white/10"
            >
              Talk to a banker
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-8 lg:grid-cols-4">
          {counters.map((c) => (
            <div key={c.label} className="text-center">
              <p className="font-display text-3xl font-semibold tracking-tight text-violet-500">
                {c.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Plans
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">
            Banking that scales with you.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-2xl border bg-card p-7 ${
                t.accent ? "border-violet-500 shadow-glow-violet" : "border-border"
              }`}
            >
              {t.accent && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-violet-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {t.name}
              </h3>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-violet-500">
                {t.price}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/apply?product=business"
                className={`mt-6 inline-flex h-10 items-center justify-center rounded-full text-sm font-semibold ${
                  t.accent
                    ? "bg-violet-500 text-white hover:bg-violet-600"
                    : "border border-border hover:bg-muted"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card/30 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Treasury services, demystified
          </h2>
          <Accordion className="mt-6">
            {treasury.map((f, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
