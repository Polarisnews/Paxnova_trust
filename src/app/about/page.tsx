import type { Metadata } from "next";
import { Leaf, Sparkles, Target, Users } from "lucide-react";

export const metadata: Metadata = { title: "About Nova Trust" };

const story = [
  "Nova Trust started in 2024 with a simple frustration: banks treat their customers like account numbers, not people. The biggest banks have the worst apps; the most innovative fintechs aren't actually banks.",
  "We chartered Nova Trust as a real, fully-regulated U.S. bank — but built it like a 2026 software company. Every product, from the checking account to the trust desk, runs on the same modern stack and the same human team.",
  "We're a fiduciary at every touchpoint. Your money grows because we built compounding into the core, not the marketing.",
];

const timeline = [
  { year: "2024", event: "Founded by ex-Stripe and ex-Charles Schwab operators" },
  { year: "2025", event: "Series A led by Founders Fund; checking + savings launched" },
  { year: "2026", event: "Mortgages + business banking + wealth go live" },
  { year: "2027 (planned)", event: "International multi-currency accounts" },
];

const leadership = [
  { name: "Avery Sterling", role: "CEO & Co-founder", initials: "AS", color: "#6E3FF3", bio: "Previously VP Product at Charles Schwab. Builds banks that don't feel like banks." },
  { name: "Mara Khoury", role: "President & Chief Banker", initials: "MK", color: "#0A1A3C", bio: "Former Head of Consumer Lending at JPMorgan. Believes in old-school underwriting and new-school speed." },
  { name: "Dawit Mengistu", role: "CTO", initials: "DM", color: "#D4AF37", bio: "Ex-Stripe principal. Wrote the original Connect ledger system. Cares about correctness." },
  { name: "Jules Park", role: "Chief Risk Officer", initials: "JP", color: "#6E3FF3", bio: "20 years at the OCC and BBVA. Keeps us boring in all the right ways." },
  { name: "Riya Banerjee", role: "Head of Wealth", initials: "RB", color: "#0A1A3C", bio: "Built a $14B AUM RIA before joining. Fiduciary to her core." },
  { name: "Cole Hartley", role: "Chief Compliance Officer", initials: "CH", color: "#D4AF37", bio: "Translates regulators for engineers and vice versa." },
];

const esg = [
  { icon: Leaf, title: "Climate", body: "Carbon neutral operations; we publish our financed emissions quarterly." },
  { icon: Users, title: "Community", body: "1% of net interest revenue funds community development lending." },
  { icon: Target, title: "Diversity", body: "Pay-equity audited annually by an independent firm; 51% under-represented leadership." },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            About
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight text-balance lg:text-6xl">
            We rebuilt banking from first principles.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        {story.map((p, i) => (
          <p key={i} className="mt-5 text-lg leading-relaxed text-pretty">
            {p}
          </p>
        ))}
      </section>

      <section className="bg-card/30 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Where we&apos;ve been
          </h2>
          <ol className="mt-8 space-y-6">
            {timeline.map((t) => (
              <li key={t.year} className="flex items-start gap-5">
                <span className="font-display text-xl font-semibold text-violet-500">
                  {t.year}
                </span>
                <span className="mt-1 inline-block size-2 rounded-full bg-gold-500" />
                <p className="flex-1 text-muted-foreground">{t.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="leadership" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Leadership
          </h2>
          <p className="mt-2 text-muted-foreground">
            The team building Nova Trust. Reach any of us by email — we mean it.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leadership.map((p) => (
            <div key={p.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex size-12 items-center justify-center rounded-full font-display text-sm font-semibold text-white"
                  style={{ background: p.color }}
                >
                  {p.initials}
                </span>
                <div>
                  <p className="font-display text-base font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{p.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="esg" className="bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Responsibility
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
              Built to be a good steward
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {esg.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-success/15 text-success">
                  <s.icon className="size-4" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="careers" className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
          <Sparkles className="size-5" />
        </span>
        <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight">
          Build the bank of the next decade.
        </h2>
        <p className="mt-3 text-muted-foreground">
          We&apos;re hiring across engineering, banking, compliance, and customer
          experience. Remote-friendly with hubs in NYC and SF.
        </p>
      </section>
    </>
  );
}
