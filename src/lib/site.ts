// Site-wide navigation taxonomy.
//
// The structure of `primaryNav` is modeled after the menus used by the
// top US/UK retail and commercial banks (Chase, Bank of America, JPMorgan,
// Goldman Sachs Marcus, HSBC). Sections are deliberately overlapping in
// places — that's how the real banks do it — because a "Credit cards"
// shopper might be Personal or Business, and a "Lending" shopper might
// be Commercial or International. The icons are imported per-section in
// the Header so this file stays a pure data module.

export const siteConfig = {
  name: "Paxnova Trust Bank",
  tagline: "Banking, refined.",
  description:
    "A premium digital-first bank for the wealth of tomorrow. Personal, business, commercial, international, and wealth products engineered for the next decade.",
  url: "https://paxnovatrust.com",
  routine: {
    fdicNotice:
      "Paxnova Trust Bank is a member of the FDIC. Deposits are insured up to $250,000 per depositor. NMLS #2026-NT (illustrative).",
  },
};

export type NavGroupItem = {
  title: string;
  description: string;
  href: string;
  /** Optional Lucide icon name resolved in the Header at render time. */
  icon?: string;
  /** Set on the *first* item per section that should render as a feature
   *  card with a richer background. Mirrors what Chase / JPM do. */
  feature?: boolean;
};

export type NavGroup = {
  heading: string;
  items: NavGroupItem[];
};

export type NavSection = {
  label: string;
  href: string;
  /** Short marketing strap that appears next to the section name in the
   *  mega menu — gives the menu more personality than a plain list. */
  tagline?: string;
  groups: NavGroup[];
};

export const primaryNav: NavSection[] = [
  // ──────────────────────────────────────────────────────────────────
  // PERSONAL — modeled after chase.com/personal
  // ──────────────────────────────────────────────────────────────────
  {
    label: "Personal",
    href: "/personal",
    tagline: "Banking that fits your life.",
    groups: [
      {
        heading: "Banking",
        items: [
          {
            title: "Apex Checking",
            description:
              "No-fee everyday banking with AI insights that anticipate your next move.",
            href: "/personal/checking",
            icon: "Wallet",
            feature: true,
          },
          {
            title: "Reserve Savings",
            description: "4.85% APY high-yield, FDIC-insured, no minimums.",
            href: "/personal/savings",
            icon: "PiggyBank",
          },
          {
            title: "Certificates of deposit",
            description: "Locked rates from 4.55% — 6-, 12-, and 60-month terms.",
            href: "/personal/cds",
            icon: "Landmark",
          },
        ],
      },
      {
        heading: "Credit cards",
        items: [
          {
            title: "Signature Rewards",
            description:
              "3× on dining and travel, 2× on groceries, unlimited 1.5× on everything else.",
            href: "/personal/cards",
            icon: "CreditCard",
          },
          {
            title: "Reserve Travel",
            description:
              "Priority Pass, $300 travel credit, 5× points on Paxnova Travel.",
            href: "/personal/cards",
            icon: "Plane",
          },
          {
            title: "Apex Cash Back",
            description: "Flat 2% on everything, zero fees, zero foreign FX.",
            href: "/personal/cards",
            icon: "Coins",
          },
        ],
      },
      {
        heading: "Borrowing",
        items: [
          {
            title: "Mortgages",
            description:
              "Pre-approved in 8 minutes, closed in 21 days, dedicated mortgage banker.",
            href: "/personal/mortgages",
            icon: "Home",
          },
          {
            title: "Personal loans",
            description: "From 6.99% APR, no origination, $1k–$100k, fixed terms.",
            href: "/personal/loans",
            icon: "HandCoins",
          },
          {
            title: "Home equity (HELOC)",
            description:
              "Tap up to 85% of your equity — variable rates from 7.12% APR.",
            href: "/personal/heloc",
            icon: "Building2",
          },
          {
            title: "Auto refinance",
            description: "Rates from 5.49% APR, fixed-rate, no application fee.",
            href: "/personal/auto",
            icon: "Car",
          },
        ],
      },
      {
        heading: "Plan & invest",
        items: [
          {
            title: "Self-directed investing",
            description: "$0 commissions on stocks, ETFs, and fractional shares.",
            href: "/personal/investing",
            icon: "TrendingUp",
          },
          {
            title: "Managed portfolios",
            description: "Diversified, tax-aware, 0.25% advisory — auto-rebalanced.",
            href: "/personal/managed",
            icon: "LineChart",
          },
          {
            title: "Retirement (IRA)",
            description: "Roth and Traditional IRAs with the same low fees.",
            href: "/personal/retirement",
            icon: "Sun",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // BUSINESS — modeled after chase.com/business + brex/mercury
  // ──────────────────────────────────────────────────────────────────
  {
    label: "Business",
    href: "/business",
    tagline: "From first invoice to IPO.",
    groups: [
      {
        heading: "Banking",
        items: [
          {
            title: "Business Operating Account",
            description:
              "Zero-fee checking for ventures with smart cash-flow forecasting.",
            href: "/business#operating",
            icon: "Briefcase",
            feature: true,
          },
          {
            title: "Business Savings",
            description: "4.50% APY business reserve account — FDIC insured.",
            href: "/business#savings",
            icon: "PiggyBank",
          },
        ],
      },
      {
        heading: "Cards & spend",
        items: [
          {
            title: "Corporate cards",
            description:
              "Per-employee virtual cards, real-time controls, automatic categorization.",
            href: "/business#cards",
            icon: "CreditCard",
          },
          {
            title: "Expense management",
            description:
              "Approve, reimburse, and close the books — built into the app.",
            href: "/business#expenses",
            icon: "Receipt",
          },
        ],
      },
      {
        heading: "Lending",
        items: [
          {
            title: "Lines of credit",
            description: "Up to $5M revolving, prime + 0.50%, no draw fees.",
            href: "/business#credit-line",
            icon: "Banknote",
          },
          {
            title: "Term loans",
            description: "$25k–$10M, fixed rates, 6 to 84 months.",
            href: "/business#term-loans",
            icon: "Landmark",
          },
          {
            title: "SBA lending",
            description:
              "Paxnova Trust is a Preferred SBA lender — 7(a), 504, and Express.",
            href: "/business#sba",
            icon: "Shield",
          },
          {
            title: "Equipment finance",
            description: "Asset-secured loans for hardware, vehicles, machinery.",
            href: "/business#equipment",
            icon: "Wrench",
          },
        ],
      },
      {
        heading: "Payments & treasury",
        items: [
          {
            title: "ACH origination",
            description: "Same-day ACH, batch payroll, contractor 1099s.",
            href: "/business#ach",
            icon: "Send",
          },
          {
            title: "Merchant services",
            description: "Card acquiring, terminals, and online checkout.",
            href: "/business#merchant",
            icon: "TerminalSquare",
          },
          {
            title: "International payments",
            description: "FX, SWIFT, SEPA, and Faster Payments in 30+ currencies.",
            href: "/international",
            icon: "Globe2",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // COMMERCIAL — modeled after JPM Commercial Banking + BoA Business
  // ──────────────────────────────────────────────────────────────────
  {
    label: "Commercial",
    href: "/commercial",
    tagline: "Capital and treasury for the middle market.",
    groups: [
      {
        heading: "Capital & lending",
        items: [
          {
            title: "Commercial real estate",
            description:
              "Acquisition, construction, and bridge loans up to $250M.",
            href: "/commercial#real-estate",
            icon: "Building",
            feature: true,
          },
          {
            title: "Asset-based lending",
            description:
              "Working-capital lines secured by receivables, inventory, or equipment.",
            href: "/commercial#asset-based",
            icon: "Layers",
          },
          {
            title: "Syndicated finance",
            description:
              "Lead, co-lead, and participation roles in $50M+ club and broadly syndicated deals.",
            href: "/commercial#syndicated",
            icon: "Network",
          },
        ],
      },
      {
        heading: "Treasury & payments",
        items: [
          {
            title: "Commercial treasury",
            description:
              "Sweep, lockbox, liquidity, and intraday reporting for $50M+ balance sheets.",
            href: "/commercial#treasury",
            icon: "Vault",
          },
          {
            title: "Merchant services",
            description:
              "Card acquiring, ACH origination, and same-day settlement.",
            href: "/commercial#payments",
            icon: "TerminalSquare",
          },
          {
            title: "Receivables & lockbox",
            description: "Image lockbox, integrated AR feed, exception handling.",
            href: "/commercial#receivables",
            icon: "Inbox",
          },
        ],
      },
      {
        heading: "Industries",
        items: [
          {
            title: "Healthcare",
            description:
              "Practice acquisition, MOB lending, and revenue-cycle banking.",
            href: "/commercial#healthcare",
            icon: "HeartPulse",
          },
          {
            title: "Real estate",
            description:
              "Owner-occupied, multifamily, hospitality, and self-storage specialists.",
            href: "/commercial#real-estate",
            icon: "Building2",
          },
          {
            title: "Franchise banking",
            description:
              "Multi-unit and emerging-brand lending across 200+ approved concepts.",
            href: "/commercial#franchise",
            icon: "Store",
          },
          {
            title: "Government & nonprofit",
            description:
              "Tax-exempt financing, cash management, and bond-trustee services.",
            href: "/commercial#government",
            icon: "Landmark",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // INTERNATIONAL — modeled after HSBC Global + JPM Global
  // ──────────────────────────────────────────────────────────────────
  {
    label: "International",
    href: "/international",
    tagline: "One account, every currency.",
    groups: [
      {
        heading: "Cross-border banking",
        items: [
          {
            title: "Global accounts",
            description:
              "Hold and transact in 30+ currencies under a single Paxnova Trust login.",
            href: "/international#accounts",
            icon: "Globe2",
            feature: true,
          },
          {
            title: "Multi-currency cards",
            description:
              "Spend in the local currency without FX fees in 200+ countries.",
            href: "/international#cards",
            icon: "CreditCard",
          },
        ],
      },
      {
        heading: "FX & payments",
        items: [
          {
            title: "Foreign exchange",
            description:
              "Mid-market rates, FX forwards, options, and hedging programs.",
            href: "/international#fx",
            icon: "ArrowLeftRight",
          },
          {
            title: "SWIFT wires",
            description:
              "Send to 200+ countries — gpi tracking, full transparency on fees.",
            href: "/international#wires",
            icon: "Send",
          },
          {
            title: "SEPA & Faster Payments",
            description:
              "EUR and GBP rails with same-day settlement across the eurozone.",
            href: "/international#sepa",
            icon: "Euro",
          },
        ],
      },
      {
        heading: "Trade finance",
        items: [
          {
            title: "Letters of credit",
            description:
              "Documentary and standby LCs issued, advised, and confirmed worldwide.",
            href: "/international#letters-of-credit",
            icon: "FileCheck",
          },
          {
            title: "Documentary collections",
            description:
              "Sight and time drafts with full SWIFT MT 7-series messaging.",
            href: "/international#collections",
            icon: "Mailbox",
          },
          {
            title: "Supply-chain finance",
            description:
              "Approved-payable programs and receivables purchase in 12 currencies.",
            href: "/international#supply-chain",
            icon: "Truck",
          },
        ],
      },
      {
        heading: "Regional desks",
        items: [
          {
            title: "Asia-Pacific",
            description:
              "Dedicated bankers in Hong Kong, Singapore, Tokyo, and Sydney.",
            href: "/international#apac",
            icon: "MapPin",
          },
          {
            title: "Europe & UK",
            description:
              "GBP, EUR, and CHF correspondent banking with London, Paris, Zurich.",
            href: "/international#emea",
            icon: "MapPin",
          },
          {
            title: "Latin America",
            description: "USD clearing and trade routes across Mexico, Brazil, Chile.",
            href: "/international#latam",
            icon: "MapPin",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // WEALTH — modeled after JPM Private Bank + Goldman Private Wealth
  // ──────────────────────────────────────────────────────────────────
  {
    label: "Wealth",
    href: "/personal#wealth",
    tagline: "Private banking, refined.",
    groups: [
      {
        heading: "Investment management",
        items: [
          {
            title: "Discretionary portfolios",
            description:
              "Bespoke portfolios managed by your dedicated CIO and team.",
            href: "/personal/wealth",
            icon: "TrendingUp",
            feature: true,
          },
          {
            title: "Alternatives access",
            description:
              "Private equity, hedge funds, and direct real assets with $250k minimums.",
            href: "/personal/wealth#alternatives",
            icon: "Sparkles",
          },
          {
            title: "Tax-managed investing",
            description:
              "Direct indexing, loss harvesting, and concentrated-stock unwind.",
            href: "/personal/wealth#tax",
            icon: "Calculator",
          },
        ],
      },
      {
        heading: "Private banking",
        items: [
          {
            title: "Private banking deposits",
            description:
              "Concierge banking with a dedicated banker for $1M+ relationships.",
            href: "/personal/wealth#private",
            icon: "Crown",
          },
          {
            title: "Custom lending",
            description:
              "Securities-backed lines, art lending, aircraft, yacht, and bespoke credit.",
            href: "/personal/wealth#lending",
            icon: "Anchor",
          },
        ],
      },
      {
        heading: "Trust, estate & family office",
        items: [
          {
            title: "Trust & estate planning",
            description:
              "Revocable, irrevocable, dynasty, and charitable trust strategies.",
            href: "/personal/wealth#trust",
            icon: "ScrollText",
          },
          {
            title: "Family office services",
            description:
              "Consolidated reporting, governance, and next-gen education.",
            href: "/personal/wealth#family-office",
            icon: "Users",
          },
          {
            title: "Philanthropy",
            description:
              "Donor-advised funds, private foundations, mission-aligned investing.",
            href: "/personal/wealth#philanthropy",
            icon: "Heart",
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────
  // ABOUT — modeled after every major bank's company section
  // ──────────────────────────────────────────────────────────────────
  {
    label: "About",
    href: "/about",
    tagline: "The bank, refined.",
    groups: [
      {
        heading: "Company",
        items: [
          {
            title: "Our story",
            description:
              "Why we're rebuilding banking from first principles for the next decade.",
            href: "/about",
            icon: "Sparkles",
            feature: true,
          },
          {
            title: "Leadership",
            description:
              "Meet the founders, executives, and board behind Paxnova Trust.",
            href: "/about#leadership",
            icon: "Users",
          },
          {
            title: "Investor relations",
            description: "Quarterly results, governance documents, and SEC filings.",
            href: "/about#investors",
            icon: "TrendingUp",
          },
        ],
      },
      {
        heading: "Responsibility",
        items: [
          {
            title: "Sustainability & ESG",
            description:
              "Our climate, community, and governance commitments — measured publicly.",
            href: "/about#esg",
            icon: "Leaf",
          },
          {
            title: "Diversity, equity & inclusion",
            description: "Workforce data, supplier diversity, and pay-equity audits.",
            href: "/about#dei",
            icon: "Users",
          },
          {
            title: "Community impact",
            description:
              "$2.4B committed to affordable housing, small business, and education.",
            href: "/about#community",
            icon: "Heart",
          },
        ],
      },
      {
        heading: "Newsroom & careers",
        items: [
          {
            title: "Newsroom",
            description: "Press releases, analyst day, executive commentary.",
            href: "/about#press",
            icon: "Newspaper",
          },
          {
            title: "Careers",
            description:
              "Build the bank of the next decade — open roles across engineering, design, finance.",
            href: "/about#careers",
            icon: "Briefcase",
          },
          {
            title: "Contact us",
            description: "Branches, phone support, secure messaging, complaints.",
            href: "/contact",
            icon: "MessageSquare",
          },
        ],
      },
    ],
  },
];

export const footerNav = [
  {
    heading: "Personal",
    links: [
      { label: "Checking", href: "/personal/checking" },
      { label: "Savings", href: "/personal/savings" },
      { label: "Credit cards", href: "/personal/cards" },
      { label: "Mortgages", href: "/personal/mortgages" },
      { label: "Personal loans", href: "/personal/loans" },
      { label: "Investing", href: "/personal/investing" },
    ],
  },
  {
    heading: "Business & Commercial",
    links: [
      { label: "Business banking", href: "/business" },
      { label: "Commercial banking", href: "/commercial" },
      { label: "Treasury services", href: "/commercial/treasury" },
      { label: "International", href: "/international" },
      { label: "Trade finance", href: "/international/letters-of-credit" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Paxnova Trust", href: "/about" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "Sustainability", href: "/about#esg" },
      { label: "Newsroom", href: "/about#press" },
      { label: "Careers", href: "/about#careers" },
      { label: "Investor relations", href: "/about#investors" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Help center", href: "/contact" },
      { label: "Branch locator", href: "/contact" },
      { label: "Rates & fees", href: "/personal" },
      { label: "Security", href: "/signin" },
      { label: "Status", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Notice", href: "/legal/privacy" },
      { label: "Accessibility", href: "/legal/accessibility" },
      { label: "FDIC notice", href: "/legal/fdic" },
      { label: "Compliance", href: "/legal/compliance" },
    ],
  },
];

export const socials = [
  { label: "Twitter / X", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "Instagram", href: "https://instagram.com" },
];
