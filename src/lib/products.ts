import {
  Banknote,
  Briefcase,
  Building2,
  Car,
  CreditCard,
  Home,
  Landmark,
  LineChart,
  PiggyBank,
  Sun,
  TrendingUp,
  Wallet,
} from "lucide-react";

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
  cds: {
    slug: "cds",
    applyAs: "cd",
    category: "Personal",
    title: "Certificates of deposit",
    icon: Landmark,
    hero: "Lock today's rate. Sleep through the next cycle.",
    subhead:
      "Fixed-rate CDs from 6 to 60 months with no early-withdrawal penalty on the first 30 days. FDIC-insured to $250,000.",
    cta: "Open a CD",
    rate: { label: "12-month CD APY", value: "5.20%" },
    fees: [
      { label: "Minimum opening", value: "$500" },
      { label: "Monthly fee", value: "$0" },
      { label: "Early withdrawal", value: "90 days of interest" },
      { label: "Auto-renew", value: "Optional, at then-current rate" },
    ],
    features: [
      { title: "Six terms to choose from", body: "6, 9, 12, 18, 24, and 60-month CDs, all fixed-rate." },
      { title: "30-day grace period", body: "Withdraw within 30 days of opening with no penalty." },
      { title: "Maturity alerts", body: "We notify 14 days before maturity so you choose, not us." },
      { title: "Brokered CD access", body: "Build CD ladders with brokered CDs inside Paxnova Investing." },
    ],
    faqs: [
      {
        q: "Can I add money to my CD?",
        a: "Funds are locked once the CD opens. Open additional CDs to ladder your savings.",
      },
      {
        q: "What happens at maturity?",
        a: "You get a 10-day grace period to withdraw, change term, or auto-renew at the new rate.",
      },
    ],
  },
  heloc: {
    slug: "heloc",
    applyAs: "heloc",
    category: "Personal",
    title: "Home equity line of credit",
    icon: Building2,
    hero: "Borrow against your home — only when you need to.",
    subhead:
      "Tap up to 85% of your equity, variable rates from 7.12% APR, draw period of 10 years.",
    cta: "Check my equity",
    rate: { label: "Variable APR (from)", value: "7.12%" },
    fees: [
      { label: "Origination fee", value: "$0" },
      { label: "Annual fee", value: "$0" },
      { label: "Closing costs", value: "Paxnova Trust pays up to $1,000" },
      { label: "Draw period", value: "10 years" },
    ],
    features: [
      { title: "Variable APR floor", body: "Floor at 4.99% APR — protects you in low-rate cycles." },
      { title: "Fixed-rate locks", body: "Convert any portion of your balance to a fixed payment." },
      { title: "No appraisal fee", body: "We use AVM (automated valuation) for 80% of files." },
      { title: "Same-day funding", body: "Once the file closes, draws fund the same business day." },
    ],
    faqs: [
      {
        q: "What's the difference between a HELOC and a home equity loan?",
        a: "A HELOC is a revolving line you draw on as needed. A home equity loan is a lump sum, fixed-rate, paid back in installments.",
      },
    ],
  },
  auto: {
    slug: "auto",
    applyAs: "auto-refi",
    category: "Personal",
    title: "Auto refinance",
    icon: Car,
    hero: "Refinance your auto loan in 4 minutes.",
    subhead:
      "Fixed-rate, no application fee, no penalty. Average member saves $1,420 in total interest.",
    cta: "Check my rate",
    rate: { label: "APR (from)", value: "5.49%" },
    fees: [
      { label: "Application fee", value: "$0" },
      { label: "Prepayment penalty", value: "None" },
      { label: "DMV title fee", value: "Pass-through, ~$25" },
      { label: "Minimum loan", value: "$7,500" },
    ],
    features: [
      { title: "Soft credit pre-qualify", body: "Check rates without a hit to your credit." },
      { title: "Skip a payment", body: "Once per year, no fee, no questions." },
      { title: "GAP coverage available", body: "Optional protection in case of total loss." },
      { title: "Direct lien payoff", body: "We handle the old lender — you keep driving." },
    ],
    faqs: [
      {
        q: "What vehicles qualify?",
        a: "Cars, SUVs, light trucks, and motorcycles up to 10 model years old.",
      },
    ],
  },
  investing: {
    slug: "investing",
    applyAs: "brokerage",
    category: "Personal",
    title: "Self-directed investing",
    icon: TrendingUp,
    hero: "Commission-free stocks, ETFs, and options.",
    subhead:
      "$0 trades, fractional shares from $1, real-time market data, all in your Paxnova Trust app.",
    cta: "Open a brokerage account",
    fees: [
      { label: "Stock & ETF trades", value: "$0" },
      { label: "Options contract fee", value: "$0.50" },
      { label: "Mutual fund trades", value: "$0 on 3,000+ funds" },
      { label: "Account minimum", value: "$0" },
    ],
    features: [
      { title: "Fractional investing", body: "Buy a slice of any S&P 500 stock from $1." },
      { title: "Streaming quotes", body: "Real-time Level 1 quotes included, free." },
      { title: "Auto-invest schedules", body: "Recurring buys, dividend reinvestment, rebalance reminders." },
      { title: "Cash sweep at 4.85%", body: "Idle cash earns the same APY as Reserve Savings." },
    ],
    faqs: [
      {
        q: "Are my investments insured?",
        a: "Brokerage assets are covered by SIPC up to $500,000. SIPC does not cover market losses.",
      },
    ],
  },
  managed: {
    slug: "managed",
    applyAs: "managed",
    category: "Personal",
    title: "Managed portfolios",
    icon: LineChart,
    hero: "Investing on autopilot — at a price that doesn't punish you.",
    subhead:
      "0.25% advisory fee, diversified globally, tax-aware, rebalanced automatically. Minimum to start: $500.",
    cta: "Start a managed portfolio",
    fees: [
      { label: "Advisory fee", value: "0.25% AUM/year" },
      { label: "Minimum to start", value: "$500" },
      { label: "Trade commission", value: "Included" },
      { label: "Custody fee", value: "$0" },
    ],
    features: [
      { title: "Built by a CFA team", body: "Six risk-graded portfolios using low-cost iShares & Vanguard ETFs." },
      { title: "Tax-loss harvesting", body: "Daily TLH for accounts over $50k — captures ~0.4% extra after-tax return." },
      { title: "ESG and Halal options", body: "Choose values-aligned tracks at the same fee." },
      { title: "Goal-based modeling", body: "Plan for retirement, a home, or your kid's college — all in one view." },
    ],
    faqs: [
      {
        q: "Are you a fiduciary?",
        a: "Yes. Paxnova Trust Wealth Advisors LLC is a registered investment adviser acting as a fiduciary.",
      },
    ],
  },
  retirement: {
    slug: "retirement",
    applyAs: "ira",
    category: "Personal",
    title: "Retirement (IRA)",
    icon: Sun,
    hero: "Tax-advantaged investing for the future you.",
    subhead:
      "Open a Roth, Traditional, or Rollover IRA in minutes. Same $0 trades, same low fees, same app.",
    cta: "Open an IRA",
    fees: [
      { label: "Account opening", value: "$0" },
      { label: "Annual maintenance", value: "$0" },
      { label: "Stock/ETF trade", value: "$0" },
      { label: "Closing fee", value: "$0" },
    ],
    features: [
      { title: "Roth or Traditional", body: "Pick the tax treatment that fits your career stage." },
      { title: "Rollover assistance", body: "We coordinate the 401(k) rollover with your former employer." },
      { title: "Automated contributions", body: "Schedule annual maxes ($7,000 / $8,000 catch-up)." },
      { title: "Backdoor Roth support", body: "Built-in workflow for high-income contributors." },
    ],
    faqs: [
      {
        q: "What's the difference between Roth and Traditional IRAs?",
        a: "Roth contributions are after-tax; withdrawals in retirement are tax-free. Traditional contributions may be tax-deductible now; withdrawals are taxed later.",
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
