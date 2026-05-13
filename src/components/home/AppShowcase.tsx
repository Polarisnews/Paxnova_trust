"use client";

import { motion } from "framer-motion";
import { Apple, Smartphone, Sparkles, Wifi, Battery, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const features = [
  {
    title: "Smart insights",
    body: "AI nudges that anticipate cashflow gaps and suggest moves before you notice.",
  },
  {
    title: "Instant transfers",
    body: "Move money between Nova Trust accounts in under a second, 24/7.",
  },
  {
    title: "Card controls",
    body: "Freeze, set merchant rules, and rotate digital card numbers from your wrist.",
  },
];

export function AppShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            The Nova Trust app
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Your bank on the device you trust most.
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Native iOS and Android apps with biometric sign-in, transaction-level
            search, and the same private-bank experience whether you have $100 or
            $100M.
          </p>

          <ul className="mt-8 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <StoreBadge
              icon={<Apple className="size-5" />}
              line1="Download on the"
              line2="App Store"
            />
            <StoreBadge
              icon={<Smartphone className="size-5" />}
              line1="Get it on"
              line2="Google Play"
            />
          </div>
        </div>

        <div className="order-1 mx-auto lg:order-2">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

function StoreBadge({
  icon,
  line1,
  line2,
}: {
  icon: React.ReactNode;
  line1: string;
  line2: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-soft"
    >
      <span className="text-foreground">{icon}</span>
      <span>
        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
          {line1}
        </span>
        <span className="block font-display text-base font-semibold tracking-tight">
          {line2}
        </span>
      </span>
    </button>
  );
}

function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: -3 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto h-[640px] w-[320px] rounded-[3rem] border border-white/10 bg-gradient-to-b from-navy-900 to-[#050B1F] p-3 shadow-2xl"
      style={{
        boxShadow:
          "0 40px 80px -20px rgba(10, 26, 60, 0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
      }}
    >
      {/* Notch / Dynamic Island */}
      <div className="absolute left-1/2 top-4 z-10 h-7 w-28 -translate-x-1/2 rounded-full bg-black/80" />

      <div className="h-full w-full overflow-hidden rounded-[2.4rem] bg-[#0F1216] text-white">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-4 text-xs">
          <span className="font-mono">9:41</span>
          <div className="flex items-center gap-1.5">
            <Wifi className="size-3.5" />
            <Battery className="size-4" />
          </div>
        </div>

        {/* App content */}
        <div className="px-6 pt-10">
          <p className="text-xs uppercase tracking-wider text-white/50">Good morning</p>
          <p className="font-display text-xl font-semibold">Jordan,</p>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 p-5">
            <p className="text-xs uppercase tracking-wider text-white/70">
              Total balance
            </p>
            <p className="mt-1 font-display text-3xl font-semibold">$33,342.65</p>
            <div className="mt-4 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/15 py-2 text-xs font-semibold backdrop-blur">
                <ArrowDownLeft className="size-3.5" /> Receive
              </button>
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/15 py-2 text-xs font-semibold backdrop-blur">
                <ArrowUpRight className="size-3.5" /> Send
              </button>
            </div>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-white/60">
            Recent activity
          </p>
          <ul className="mt-3 space-y-3">
            {[
              { name: "Blue Bottle Coffee", amount: "-$32.50", category: "Food" },
              { name: "Helio Labs payroll", amount: "+$4,250.00", category: "Income" },
              { name: "Whole Foods", amount: "-$128.40", category: "Groceries" },
            ].map((t) => (
              <li key={t.name} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-white/50">{t.category}</p>
                </div>
                <p
                  className={`font-mono text-sm ${
                    t.amount.startsWith("+") ? "text-emerald-400" : "text-white/90"
                  }`}
                >
                  {t.amount}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
