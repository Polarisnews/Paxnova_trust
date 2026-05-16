import { Banknote, Briefcase, CreditCard, Home, PiggyBank, TrendingUp, Wallet } from "lucide-react";

export type ProductDetail = {
  slug: string;
  applyAs?: string;
  category: "Personal" | "Business";
  title: string;
  hero: string;
  subhead: string;
  icon: React.ComponentType<{ className?: string }>;
  cta: string;
  rate?: { label: string; value: string };
  fees: { label: string; value: string }[];
  features: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
};

export const PRODUCTS: Record<string, ProductDetail> = {
  checking: {
    slug: "checking",
    applyAs: "checking",
    category: "Personal",
    title: "Apex Checking",
    icon: Wallet,
    hero: "Everyday banking, finally worth looking at.",
    subhead:
      "Zero-fee checking with insights that anticipate your next move. Get paid up to two days early.",
    cta: "Open Apex Checking",
    rate: { label: "Earnings rate", value: "0.50% APY" },
    fees: [
      { label: "Monthly fee", value: "$0" },
      { label: "Overdraft", value: "$0" },
      { label: "ATM fees (reimbursed)", value: "Unlimited" },
      { label: "Foreign transaction", value: "0%" },
    ],
    features: [
      { title: "Early direct deposit", body: "Funds available up to two business days before payday." },
      { title: "Cashflow insights", body: "Forecast bills and avoid red days with AI-powered cashflow." },
      { title: "Virtual cards", body: "Spin up disposable card numbers for every subscription." },
      { title: "Joint accounts", body: "Add a partner with shared limits and individual analytics." },
    ],
    faqs: [
      {
        q: "Is there a minimum balance?",
        a: "No minimum balance and no monthly maintenance fee, ever.",
      },
      {
        q: "How do ATM reimbursements work?",
        a: "We refund every domestic ATM operator fee, automatically, at the end of the day.",
      },
    ],
  },
  savings: {
    slug: "savings",
    applyAs: "savings",
    category: "Personal",
    title: "Reserve High-Yield Savings",
    icon: PiggyBank,
    hero: "4.85% APY. No tricks. No tiers.",
    subhead:
      "FDIC-insured, accessible, and one of the highest yields in the country. Move money instantly to and from your Checking.",
    cta: "Open Reserve Savings",
    rate: { label: "APY", value: "4.85%" },
    fees: [
      { label: "Monthly fee", value: "$0" },
      { label: "Minimum balance", value: "$0" },
      { label: "Withdrawal fee", value: "$0" },
      { label: "Tiered rates", value: "None" },
    ],
    features: [
      { title: "FDIC insured", body: "Up to $250,000 per depositor through our member bank." },
      { title: "Daily compounding", body: "Interest paid monthly, calculated daily." },
      { title: "Goal envelopes", body: "Carve out balances for vacations, weddings, or rainy days." },
      { title: "Instant access", body: "Pull funds to Checking 24/7, no holds." },
    ],
    faqs: [
      {
        q: "Will the rate change?",
        a: "Rates are variable and tied to the Fed Funds rate. We update within 24 hours of any change.",
      },
      {
        q: "Can I link an external bank?",
        a: "Yes. Plaid linking is supported for fast, no-friction transfers.",
      },
    ],
  },
  cards: {
    slug: "cards",
    applyAs: "credit-card",
    category: "Personal",
    title: "Credit cards",
    icon: CreditCard,
    hero: "Three cards. Real rewards. Zero theatre.",
    subhead:
      "Pick the one that fits how you actually live — Apex (cash back), Reserve (travel), or Signature (concierge).",
    cta: "See if I qualify",
    fees: [
      { label: "Apex annual fee", value: "$0" },
      { label: "Reserve annual fee", value: "$95" },
      { label: "Signature annual fee", value: "$495" },
      { label: "Foreign transaction", value: "0%" },
    ],
    features: [
      { title: "Apex Cash", body: "2% on everything, no caps, no rotating categories." },
      { title: "Reserve Travel", body: "3x on flights and hotels, $300 travel credit, lounge access." },
      { title: "Signature Black", body: "5x on travel, dedicated concierge, premium global benefits." },
      { title: "Instant virtual card", body: "Approved? Use a virtual card on day one." },
    ],
    faqs: [
      {
        q: "Will applying hurt my credit score?",
        a: "Our pre-qualification uses a soft pull. A hard pull only occurs once you accept an offer.",
      },
    ],
  },
  mortgages: {
    slug: "mortgages",
    applyAs: "mortgage",
    category: "Personal",
    title: "Mortgages",
    icon: Home,
    hero: "Pre-approved in 8 minutes. Closed in 21 days.",
    subhead:
      "A real, named banker on your file from minute one. Lock today's rate while you shop.",
    cta: "Start pre-approval",
    rate: { label: "30-year fixed (from)", value: "6.42%" },
    fees: [
      { label: "Application fee", value: "$0" },
      { label: "Lender credit", value: "Up to $5,000" },
      { label: "Rate lock", value: "60 days, free" },
      { label: "Prepayment penalty", value: "None" },
    ],
    features: [
      { title: "Soft credit pre-approval", body: "No impact to your score for the first 30 days." },
      { title: "Same banker, end to end", body: "Your application doesn't get passed to four different teams." },
      { title: "Jumbo & ARM options", body: "Loans up to $5M with competitive ARM and IO products." },
      { title: "Rate-match guarantee", body: "Beat a competitor's locked rate or we'll pay $1,500." },
    ],
    faqs: [
      {
        q: "How fast can you actually close?",
        a: "Median is 21 days from offer accepted. We've closed in 14 when needed.",
      },
    ],
  },
  loans: {
    slug: "loans",
    applyAs: "checking",
    category: "Personal",
    title: "Personal loans",
    icon: Banknote,
    hero: "Loans built like savings — clear, fixed, and fair.",
    subhead:
      "$2,000 to $50,000. Rates from 6.99% APR. Funded next business day after approval.",
    cta: "Check my rate",
    rate: { label: "APR (from)", value: "6.99%" },
    fees: [
      { label: "Origination fee", value: "$0" },
      { label: "Late fee", value: "$0" },
      { label: "Prepayment penalty", value: "None" },
      { label: "Application", value: "Free, no credit impact" },
    ],
    features: [
      { title: "Fixed monthly payment", body: "Pick a term (2-7 years) and your rate is locked." },
      { title: "Soft credit check", body: "Pre-qualify and see your real rate in minutes." },
      { title: "Funded next day", body: "Approved loans land in your linked account in 1-2 business days." },
      { title: "Skip-a-payment", body: "One skipped payment per year, no penalty, when life happens." },
    ],
    faqs: [
      {
        q: "What can I use this loan for?",
        a: "Anything except postsecondary education, gambling, or securities. Most members use it for debt consolidation.",
      },
    ],
  },
  wealth: {
    slug: "wealth",
    applyAs: "savings",
    category: "Personal",
    title: "Wealth management",
    icon: TrendingUp,
    hero: "Private banking for a generation that grew up online.",
    subhead:
      "Dedicated banker, tax-aware portfolios, and trust & estate planning — without the marble lobby.",
    cta: "Talk to a wealth banker",
    fees: [
      { label: "Advisory fee", value: "0.30% AUM" },
      { label: "Minimum to start", value: "$250,000" },
      { label: "Brokerage trades", value: "$0" },
      { label: "Inactivity fee", value: "$0" },
    ],
    features: [
      { title: "Tax-loss harvesting", body: "Automated daily, with portfolio drift kept under 0.5%." },
      { title: "Direct indexing", body: "Customize at the security level — exclude sectors, employers, ethics." },
      { title: "Trust & estate", body: "Wills, trusts, gifting strategy with in-house counsel." },
      { title: "Concierge banking", body: "Same-day wires up to $5M, dedicated banker, 24/7." },
    ],
    faqs: [
      {
        q: "Are you a fiduciary?",
        a: "Yes. Paxnova Trust Wealth Advisors LLC is a fiduciary at all times, on every account.",
      },
    ],
  },
};
