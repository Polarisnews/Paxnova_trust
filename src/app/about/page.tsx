import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  ChartLine,
  Globe2,
  Heart,
  Leaf,
  Newspaper,
  Scale,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Paxnova Trust",
  description:
    "Paxnova Trust Bank is a fully-regulated U.S. bank rebuilt as a 2026 software company. Read our story, leadership, ESG commitments, and how we measure community impact.",
};

const story = [
  "Paxnova Trust was founded in 2002 on a single conviction: the institutions Americans trust with their money should feel as modern as the people who actually use them. For more than two decades we have grown alongside our clients — through three Fed cycles, two recessions, and one global pandemic — without ever forgetting that.",
  "We are a fully-chartered U.S. national bank — supervised by the OCC, insured by the FDIC, and governed by the same capital and liquidity standards as the largest financial institutions in the country. What we have always done differently is everything else.",
  "Every product we offer — from a checking account to a $250M syndicated loan — runs on the same modern core, is reviewed by the same senior team, and is built around the same idea: transparent pricing, plain English, and human service when the moment demands it.",
];

const stats = [
  { value: "$28.4B", label: "Total assets under management" },
  { value: "184,200", label: "Personal & business clients" },
  { value: "4.85%", label: "High-yield savings APY" },
  { value: "A+", label: "BauerFinancial safety rating" },
];

const principles = [
  {
    icon: Scale,
    title: "Fiduciary by default",
    body: "On every wealth, advisory, and lending product, our advisors act as fiduciaries — full stop. No hidden incentives, no quotas, no payment for order flow.",
  },
  {
    icon: Shield,
    title: "Capitalized to outlast cycles",
    body: "We hold a Common Equity Tier 1 ratio of 14.8% — comfortably above the 7% regulatory minimum. Liquidity coverage exceeds 130% of stressed outflows.",
  },
  {
    icon: Sparkles,
    title: "Built like software, run like a bank",
    body: "Modern engineering and disciplined risk are not at odds. Every release goes through the same change-management process used by our investment-bank counterparts — just shipped in days, not quarters.",
  },
  {
    icon: Heart,
    title: "Service over scripts",
    body: "Phone support staffed by named bankers, in your time zone, who can resolve issues without escalation 92% of the time. No interactive voice maze.",
  },
];

const timeline = [
  {
    year: "2002",
    event:
      "Founded in New York as Paxnova Trust Bank, N.A. by a group of veteran bankers and an early-internet engineering team. Original mandate: build the first U.S. bank designed natively for online customers.",
  },
  {
    year: "2008",
    event:
      "Through the financial crisis, Paxnova Trust takes no government bailout. We end the year above $4B in deposits and a 13.2% Tier 1 ratio — among the strongest of any bank our size.",
  },
  {
    year: "2014",
    event:
      "Mortgage origination, wealth management, and the first Signature card platform launch. The bank crosses $10B in assets and earns its first Outstanding CRA rating from the OCC.",
  },
  {
    year: "2020",
    event:
      "Paxnova Trust originates $1.8B in PPP loans for small businesses during the pandemic. Mobile-first onboarding launches publicly and adds 90,000 clients in nine months.",
  },
  {
    year: "2024",
    event:
      "Commercial real estate, syndicated finance, and treasury services for $50M+ balance sheets all expand. Total AUM crosses $25B.",
  },
  {
    year: "2026",
    event:
      "Self-directed brokerage, managed portfolios, and multi-currency international accounts go live. Total assets under management reach $28.4B.",
  },
];

const leadership = [
  {
    name: "Avery Sterling",
    role: "Chief Executive Officer & Co-founder",
    initials: "AS",
    color: "#6E3FF3",
    bio: "Previously VP of Product at Charles Schwab, where she led the launch of Schwab's mobile-first investing platform. CFA charterholder, B.A. Stanford, M.B.A. Wharton.",
  },
  {
    name: "Mara Khoury",
    role: "President & Chief Banking Officer",
    initials: "MK",
    color: "#0A1A3C",
    bio: "Former Head of Consumer Lending at JPMorgan Chase (2014–2022). Built the bank's digital mortgage origination platform. Chairs the Paxnova Trust Lending Committee.",
  },
  {
    name: "Dawit Mengistu",
    role: "Chief Technology Officer & Co-founder",
    initials: "DM",
    color: "#D4AF37",
    bio: "Principal engineer #14 at Stripe. Architect of the original Connect platform ledger. Holds 8 patents in distributed systems. Believes the bug-free ledger is achievable.",
  },
  {
    name: "Jules Park",
    role: "Chief Risk Officer",
    initials: "JP",
    color: "#6E3FF3",
    bio: "20 years across the OCC and BBVA Compass. Former Senior National Bank Examiner. Translates regulation into engineering specifications so we stay boring in all the right ways.",
  },
  {
    name: "Riya Banerjee",
    role: "Head of Wealth Management",
    initials: "RB",
    color: "#0A1A3C",
    bio: "Founded Halcyon Capital Advisors, a $14B-AUM RIA acquired by Paxnova Trust in 2026. CFP, ChFC. Authored 'The Quiet Wealth Playbook' (Bloomberg Press, 2023).",
  },
  {
    name: "Cole Hartley",
    role: "Chief Compliance Officer",
    initials: "CH",
    color: "#D4AF37",
    bio: "Former Acting Director, FinCEN. Designed the bank's BSA/AML program from scratch. Hosts the firm's weekly 'compliance office hours' open to every team.",
  },
  {
    name: "Imani Ofori",
    role: "Chief Financial Officer",
    initials: "IO",
    color: "#6E3FF3",
    bio: "Ex-Goldman Sachs Financials team. Led IPO advisory engagements totaling $42B in market cap. CPA, Columbia Business School.",
  },
  {
    name: "Soren Vinje",
    role: "General Counsel",
    initials: "SV",
    color: "#0A1A3C",
    bio: "Previously partner at Sullivan & Cromwell's bank regulatory practice. Advises the board on charter, M&A, and prudential matters. J.D. Yale Law.",
  },
];

const board = [
  "Marcia Whitfield — Chair · former Vice Chair, Federal Reserve Board",
  "Hideo Tanaka — former Group CFO, Mitsubishi UFJ Financial Group",
  "Linda Crowe — Senior Partner Emerita, Wachtell, Lipton, Rosen & Katz",
  "Robert Achebe — former President, Africa, Visa Inc.",
  "Avery Sterling — CEO, Paxnova Trust Bank",
];

const investorHighlights = [
  { label: "Q4 2026 net interest income", value: "$412M", delta: "+38% YoY" },
  { label: "Net interest margin", value: "3.84%" },
  { label: "Common Equity Tier 1 ratio", value: "14.8%" },
  { label: "Efficiency ratio", value: "52.1%" },
  { label: "Liquidity coverage ratio", value: "131%" },
  { label: "Non-performing loan ratio", value: "0.31%" },
];

const esg = [
  {
    icon: Leaf,
    title: "Climate",
    body: "Operationally carbon neutral since 2025. Committed to net-zero financed emissions by 2050, with interim 2030 targets disclosed against the PCAF framework.",
  },
  {
    icon: Heart,
    title: "Community",
    body: "$2.4B committed to community development lending since founding — affordable housing, small business, and CRA-qualified loans in low- to moderate-income census tracts.",
  },
  {
    icon: Target,
    title: "Diversity",
    body: "Pay-equity audited annually by an independent third party. 51% of senior leadership are women or under-represented minorities. Workforce data published in our annual ESG report.",
  },
];

const community = [
  {
    label: "Affordable housing",
    value: "$1.4B",
    body: "Direct construction and permanent financing for 8,400 affordable units.",
  },
  {
    label: "Small business",
    value: "$680M",
    body: "Loans to LMI-owned and minority-owned small businesses through our SBA program.",
  },
  {
    label: "Financial literacy",
    value: "$58M",
    body: "Free curricula reaching 240,000 students through partnerships with NextGen Personal Finance.",
  },
];

type PressItem = {
  date: string;
  headline: string;
  outlet: string;
  category: "Press release" | "In the news" | "Award" | "Earnings" | "Filing";
  summary: string;
  href: string;
};

const press: PressItem[] = [
  {
    date: "May 12, 2026",
    category: "Press release",
    outlet: "Paxnova Trust Newsroom",
    headline:
      "Paxnova Trust raises Reserve Savings APY to 4.85% as Fed holds rates steady",
    summary:
      "The new rate takes effect immediately on all Reserve Savings balances, including existing customer balances — with no tiers or caps.",
    href: "https://example.com",
  },
  {
    date: "May 4, 2026",
    category: "In the news",
    outlet: "Bloomberg",
    headline:
      "How Paxnova Trust quietly became the country's fastest-growing mid-size bank",
    summary:
      "A profile of how the 24-year-old bank's mobile-first rebuild has added $9B in deposits in 18 months without acquiring a single competitor.",
    href: "https://example.com",
  },
  {
    date: "Apr 28, 2026",
    category: "Earnings",
    outlet: "Paxnova Trust Investor Relations",
    headline:
      "Q1 2026 results — Net interest income $412M, up 38% year-over-year",
    summary:
      "CET1 capital ratio 14.8%, efficiency ratio 52.1%, and non-performing loan ratio held steady at 0.31%. Call deck and 10-Q available.",
    href: "https://example.com",
  },
  {
    date: "Apr 17, 2026",
    category: "Award",
    outlet: "American Banker",
    headline:
      "Paxnova Trust named 'Best Mid-Size Bank' in 2026 American Banker Tech Awards",
    summary:
      "Editors cited the bank's open-banking API, real-time wire tracking, and the speed of its mortgage close — median 19 days end-to-end.",
    href: "https://example.com",
  },
  {
    date: "Apr 9, 2026",
    category: "Press release",
    outlet: "Paxnova Trust Newsroom",
    headline:
      "Paxnova Trust launches multi-currency Global Accounts in 30+ currencies",
    summary:
      "Personal and business clients can now hold, send, and receive balances in EUR, GBP, JPY, SGD, HKD, AUD, CAD, and 25 more — under a single login.",
    href: "https://example.com",
  },
  {
    date: "Mar 24, 2026",
    category: "In the news",
    outlet: "The Wall Street Journal",
    headline:
      "Inside Paxnova Trust's bet on tax-loss harvesting for the mass market",
    summary:
      "Daily TLH was once a perk reserved for $5M+ accounts. Paxnova Trust just made it free for any managed portfolio above $50,000.",
    href: "https://example.com",
  },
  {
    date: "Mar 11, 2026",
    category: "Press release",
    outlet: "Paxnova Trust Newsroom",
    headline:
      "Paxnova Trust commits an additional $400M to affordable housing through 2030",
    summary:
      "Bringing the bank's total community development commitment to $2.4B, with a new focus on workforce housing in Texas, North Carolina, and Arizona.",
    href: "https://example.com",
  },
  {
    date: "Mar 4, 2026",
    category: "Award",
    outlet: "J.D. Power",
    headline:
      "Paxnova Trust mobile app rated #1 among U.S. direct banks for the third consecutive year",
    summary:
      "Highest scores in account opening, transaction clarity, and customer service responsiveness — overall satisfaction score 873/1000.",
    href: "https://example.com",
  },
  {
    date: "Feb 20, 2026",
    category: "In the news",
    outlet: "Reuters",
    headline:
      "Paxnova Trust opens commercial flagship in San Francisco, hiring 80",
    summary:
      "The Embarcadero office expands the bank's CRE, syndicated finance, and treasury teams to serve a growing West Coast client roster.",
    href: "https://example.com",
  },
  {
    date: "Feb 6, 2026",
    category: "Filing",
    outlet: "Paxnova Trust Investor Relations",
    headline: "2025 Annual Report (10-K) and Proxy Statement filed with the SEC",
    summary:
      "Full-year results, executive compensation, audit-committee report, and 2026 director slate. PDFs and XBRL exhibits available for download.",
    href: "https://example.com",
  },
  {
    date: "Jan 15, 2026",
    category: "Press release",
    outlet: "Paxnova Trust Newsroom",
    headline:
      "Paxnova Trust deploys real-time fraud screening across the entire card network",
    summary:
      "Sub-30-millisecond risk decisioning, on-device biometric step-up, and a new in-app fraud claim flow reduce average resolution time to under 4 hours.",
    href: "https://example.com",
  },
  {
    date: "Jan 7, 2026",
    category: "In the news",
    outlet: "American Banker",
    headline:
      "Paxnova Trust adds 90,000 net new clients in December — its single biggest month",
    summary:
      "Mobile-first onboarding cuts median account-opening time to 4 minutes, with 91% of applications approved instantly.",
    href: "https://example.com",
  },
];

const upcomingEvents = [
  {
    date: "Jun 4, 2026",
    label: "Q2 2026 earnings call",
    body: "8:30 AM ET — webcast and dial-in at ir.paxnovatrust.com.",
  },
  {
    date: "Jul 9, 2026",
    label: "Annual Shareholder Meeting",
    body: "Virtual, 11:00 AM ET. Proxy materials available in the IR portal.",
  },
  {
    date: "Sep 18, 2026",
    label: "2026 Investor Day",
    body: "New York Stock Exchange — capital allocation plan, AI roadmap, and the international expansion update.",
  },
];

const PRESS_CATEGORY_STYLE: Record<PressItem["category"], string> = {
  "Press release":
    "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  "In the news":
    "bg-navy-900/10 text-navy-700 dark:bg-white/10 dark:text-white/85",
  Award: "bg-gold-500/15 text-gold-700 dark:text-gold-300",
  Earnings: "bg-success/15 text-success",
  Filing: "bg-muted text-foreground/70",
};

const dei = [
  { label: "Women in leadership (VP+)", value: "47%" },
  { label: "URM in leadership (VP+)", value: "29%" },
  { label: "Pay-equity ratio (women vs. men)", value: "1.00 : 1.00" },
  { label: "Pay-equity ratio (URM vs. white)", value: "0.99 : 1.00" },
  { label: "Supplier-diversity spend", value: "$172M (2026)" },
  { label: "Veteran hires", value: "11% of new joiners" },
];

const careerPillars = [
  {
    icon: Briefcase,
    title: "Real ownership",
    body: "Equity in every offer letter from intern through senior leader. Vesting accelerates if we're acquired.",
  },
  {
    icon: Globe2,
    title: "Remote-first, hub-friendly",
    body: "Anywhere in the U.S. with hubs in New York, San Francisco, Austin, and London. Quarterly company-paid offsites.",
  },
  {
    icon: ChartLine,
    title: "Career runway",
    body: "Two promotion cycles per year, transparent leveling rubric, and a $5,000 annual learning budget per employee.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            About Paxnova Trust
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl lg:text-6xl">
            A modern bank, built on principles older than software.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/75 text-pretty sm:text-lg">
            Paxnova Trust Bank, N.A. is a fully-regulated national bank serving
            individuals, businesses, and institutions. We combine the discipline
            of a 150-year-old institution with the velocity of a modern software
            company — without compromising on either.
          </p>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-xs uppercase tracking-wider text-white/55">
                  {s.label}
                </dt>
                <dd className="mt-1 font-display text-2xl font-semibold tracking-tight text-gold-300 sm:text-3xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Our story ───────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
          Our story
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Why we built another bank.
        </h2>
        {story.map((p, i) => (
          <p key={i} className="mt-5 text-base leading-relaxed text-pretty sm:text-lg">
            {p}
          </p>
        ))}
      </section>

      {/* ───────── Principles ───────── */}
      <section className="bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Operating principles
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The four ideas we will not compromise on.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {principles.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Timeline ───────── */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
          Where we&apos;ve been
        </p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          A short history.
        </h2>
        <ol className="mt-10 space-y-8 border-l border-border pl-6">
          {timeline.map((t) => (
            <li key={t.year} className="relative">
              <span
                aria-hidden
                className="absolute -left-[31px] top-1.5 inline-block size-3 rounded-full border-2 border-violet-500 bg-background"
              />
              <p className="font-display text-lg font-semibold text-violet-500">
                {t.year}
              </p>
              <p className="mt-1 text-base text-foreground/85">{t.event}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── Leadership ───────── */}
      <section
        id="leadership"
        className="bg-card/30 py-20 scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Leadership
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The team running the bank.
            </h2>
            <p className="mt-3 text-muted-foreground">
              You can email any of us. Names below are real, accountability is
              real, and the buck stops with the person whose initials are on the
              file.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leadership.map((p) => (
              <div
                key={p.name}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span
                  className="inline-flex size-12 items-center justify-center rounded-full font-display text-sm font-semibold text-white"
                  style={{ background: p.color }}
                  aria-hidden
                >
                  {p.initials}
                </span>
                <p className="mt-4 font-display text-base font-semibold leading-tight">
                  {p.name}
                </p>
                <p className="mt-0.5 text-xs text-violet-500">{p.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.bio}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Board of directors
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 text-sm">
              {board.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-2 inline-block size-1.5 shrink-0 rounded-full bg-gold-500"
                  />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Investor relations ───────── */}
      <section id="investors" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Investor relations
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The numbers behind the story.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We publish quarterly results within 30 days of close — including
              the call deck, transcript, and our full 10-Q. Annual reports,
              proxy materials, and Pillar 3 disclosures are archived back to
              charter date.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://example.com/ir"
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-navy-900 px-5 text-sm font-semibold text-white hover:bg-navy-700"
              >
                Latest quarterly results
                <ArrowUpRight className="size-4" />
              </a>
              <a
                href="https://example.com/sec"
                className="inline-flex h-11 items-center gap-1 rounded-full border border-border px-5 text-sm font-medium hover:bg-muted"
              >
                SEC filings
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {investorHighlights.map((h) => (
              <div
                key={h.label}
                className="rounded-xl border border-border bg-card p-5"
              >
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  {h.label}
                </dt>
                <dd className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  {h.value}
                </dd>
                {h.delta && (
                  <p className="mt-1 text-xs font-medium text-success">
                    {h.delta}
                  </p>
                )}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Sustainability & ESG ───────── */}
      <section id="esg" className="bg-card/30 py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Sustainability &amp; responsibility
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Measured, published, audited.
            </h2>
            <p className="mt-3 text-muted-foreground">
              We publish an annual ESG report under SASB and TCFD frameworks,
              and disclose our financed emissions quarterly under the PCAF
              methodology. The most recent report is independently assured by
              KPMG.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {esg.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-success/15 text-success">
                  <Icon className="size-4" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <a
              href="https://example.com/esg"
              className="inline-flex items-center gap-1 text-sm font-semibold text-violet-500 hover:text-violet-600"
            >
              Download the 2026 ESG report (PDF)
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Community impact ───────── */}
      <section
        id="community"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20"
      >
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Community impact
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            $2.4B committed since founding.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Under the Community Reinvestment Act, we&apos;re measured on how we
            serve the neighborhoods where we operate. Our most recent OCC CRA
            rating is <strong>Outstanding</strong>.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {community.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-violet-500">
                {c.value}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── DEI ───────── */}
      <section id="dei" className="bg-card/30 py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Diversity, equity &amp; inclusion
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              The full picture — published.
            </h2>
            <p className="mt-3 text-muted-foreground">
              An independent firm (PwC) audits our pay equity and workforce
              composition annually. We publish the data unsanitized — the good
              and the not-yet-good — because the only way to make progress is
              to be honest about where we are.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {dei.map((d) => (
              <div
                key={d.label}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <dt className="text-xs text-muted-foreground">{d.label}</dt>
                <dd className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Newsroom / Press ───────── */}
      <section
        id="press"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 scroll-mt-20"
      >
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              Newsroom
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Press releases, coverage &amp; filings.
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Everything we&apos;ve announced and everything written about
              Paxnova Trust in the last few months. Media inquiries reach our
              press team within one business hour at{" "}
              <a
                href="mailto:press@paxnovatrust.com"
                className="font-medium text-violet-500 hover:text-violet-600"
              >
                press@paxnovatrust.com
              </a>
              .
            </p>
          </div>
          <a
            href="https://example.com/rss"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-semibold transition hover:bg-muted"
          >
            <Newspaper className="size-3.5" />
            Subscribe to the news feed
          </a>
        </div>

        {/* Featured headline — the most-recent press release */}
        <a
          href={press[0].href}
          target="_blank"
          rel="noreferrer"
          className="group relative mb-6 flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-violet-500/10 via-card to-card p-6 transition hover:shadow-soft sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                PRESS_CATEGORY_STYLE[press[0].category]
              }
            >
              <Sparkles className="size-3" />
              {press[0].category}
            </span>
            <span className="text-xs text-muted-foreground">
              {press[0].date} · {press[0].outlet}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-violet-500 transition-transform group-hover:translate-x-0.5">
              Read story
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold tracking-tight text-balance sm:text-2xl">
            {press[0].headline}
          </h3>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {press[0].summary}
          </p>
        </a>

        {/* The rest, in two columns */}
        <ul className="grid gap-3 md:grid-cols-2">
          {press.slice(1).map((p) => (
            <li key={p.headline}>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider " +
                      PRESS_CATEGORY_STYLE[p.category]
                    }
                  >
                    {p.category}
                  </span>
                  <span className="text-muted-foreground">{p.date}</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span className="font-medium text-foreground/85">
                    {p.outlet}
                  </span>
                  <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="text-sm font-semibold leading-snug">
                  {p.headline}
                </p>
                <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                  {p.summary}
                </p>
              </a>
            </li>
          ))}
        </ul>

        {/* Upcoming events */}
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
            Upcoming events
          </p>
          <ul className="grid gap-4 sm:grid-cols-3">
            {upcomingEvents.map((e) => (
              <li key={e.label} className="flex flex-col gap-1">
                <p className="font-display text-xs font-semibold uppercase tracking-wider text-violet-500">
                  {e.date}
                </p>
                <p className="text-sm font-semibold">{e.label}</p>
                <p className="text-xs text-muted-foreground">{e.body}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Spokespeople + media kit links */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Media contacts
            </p>
            <p className="mt-2 text-sm">
              <strong>Corporate &amp; consumer:</strong>{" "}
              <a
                href="mailto:press@paxnovatrust.com"
                className="text-violet-500 hover:text-violet-600"
              >
                press@paxnovatrust.com
              </a>
            </p>
            <p className="mt-1 text-sm">
              <strong>Investor relations:</strong>{" "}
              <a
                href="mailto:ir@paxnovatrust.com"
                className="text-violet-500 hover:text-violet-600"
              >
                ir@paxnovatrust.com
              </a>
            </p>
            <p className="mt-1 text-sm">
              <strong>After-hours:</strong>{" "}
              <span className="font-mono">+1 (212) 555-0188</span> (rotating
              duty officer)
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Media kit
            </p>
            <ul className="mt-2 grid gap-1 text-sm">
              <li>
                <a
                  href="https://example.com/brand"
                  className="inline-flex items-center gap-1 text-violet-500 hover:text-violet-600"
                >
                  Logos &amp; brand assets
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://example.com/exec-photos"
                  className="inline-flex items-center gap-1 text-violet-500 hover:text-violet-600"
                >
                  Executive headshots
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://example.com/factsheet"
                  className="inline-flex items-center gap-1 text-violet-500 hover:text-violet-600"
                >
                  Company fact sheet (PDF)
                  <ArrowUpRight className="size-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ───────── Careers ───────── */}
      <section
        id="careers"
        className="bg-navy-900 py-24 text-white scroll-mt-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
              Careers
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Build the bank of the next decade.
            </h2>
            <p className="mt-4 text-white/75">
              We&apos;re hiring across engineering, design, banking, risk,
              compliance, customer experience, and finance. Our offers compete
              with top-tier tech companies and are benchmarked publicly.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {careerPillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-gold-500/15 text-gold-300">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-white/70">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="https://example.com/careers"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-navy-900 hover:bg-gold-300"
            >
              See open roles
              <ArrowRight className="size-4" />
            </a>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold backdrop-blur hover:bg-white/10"
            >
              Reach the people team
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Footer recognition ───────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Recognition
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
          <li className="flex items-start gap-2">
            <Award className="mt-0.5 size-4 shrink-0 text-gold-500" />
            J.D. Power #1 Direct Bank — 2025, 2026
          </li>
          <li className="flex items-start gap-2">
            <Newspaper className="mt-0.5 size-4 shrink-0 text-gold-500" />
            American Banker &quot;Best Mid-Size Bank&quot; — 2026
          </li>
          <li className="flex items-start gap-2">
            <Award className="mt-0.5 size-4 shrink-0 text-gold-500" />
            Forbes World&apos;s Best Banks — 2026
          </li>
          <li className="flex items-start gap-2">
            <Award className="mt-0.5 size-4 shrink-0 text-gold-500" />
            BauerFinancial A+ Safety Rating (16 consecutive quarters)
          </li>
        </ul>
      </section>
    </>
  );
}
