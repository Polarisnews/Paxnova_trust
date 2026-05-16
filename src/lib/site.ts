export const siteConfig = {
  name: "Paxnova Trust Bank",
  tagline: "Banking, refined.",
  description:
    "A premium digital-first bank for the wealth of tomorrow. Personal, business, and wealth products engineered for the next decade.",
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
};

export type NavGroup = {
  heading: string;
  items: NavGroupItem[];
};

export type NavSection = {
  label: string;
  href: string;
  groups: NavGroup[];
};

export const primaryNav: NavSection[] = [
  {
    label: "Personal",
    href: "/personal",
    groups: [
      {
        heading: "Everyday banking",
        items: [
          { title: "Checking", description: "No-fee everyday accounts with smart insights.", href: "/personal#checking" },
          { title: "Savings", description: "4.85% APY high-yield with no minimums.", href: "/personal#savings" },
          { title: "Credit cards", description: "Reward your real life, not your fees.", href: "/personal#cards" },
        ],
      },
      {
        heading: "Borrowing",
        items: [
          { title: "Mortgages", description: "Pre-approved in 8 minutes, closed in 21 days.", href: "/personal#mortgages" },
          { title: "Personal loans", description: "Rates from 6.99% APR, no origination.", href: "/personal#loans" },
        ],
      },
    ],
  },
  {
    label: "Business",
    href: "/business",
    groups: [
      {
        heading: "Banking by stage",
        items: [
          { title: "Startup", description: "Zero-fee operating accounts for new ventures.", href: "/business#startup" },
          { title: "Growth", description: "Lines of credit, expense cards, payroll.", href: "/business#growth" },
          { title: "Enterprise", description: "Dedicated treasury and global cash management.", href: "/business#enterprise" },
        ],
      },
      {
        heading: "Treasury",
        items: [
          { title: "Cash management", description: "Sweep, invest, forecast — automatically.", href: "/business#treasury" },
          { title: "International", description: "Multi-currency accounts and FX hedging.", href: "/business#international" },
        ],
      },
    ],
  },
  {
    label: "Commercial",
    href: "/commercial",
    groups: [
      {
        heading: "Lending & finance",
        items: [
          { title: "Commercial real estate", description: "Acquisition, construction, and bridge loans up to $250M.", href: "/commercial#real-estate" },
          { title: "Asset-based lending", description: "Working capital secured by receivables or inventory.", href: "/commercial#asset-based" },
          { title: "Syndicated finance", description: "Lead and participation roles in club deals.", href: "/commercial#syndicated" },
        ],
      },
      {
        heading: "Treasury & payments",
        items: [
          { title: "Commercial treasury", description: "Sweep, lockbox, and liquidity for $50M+ balance sheets.", href: "/commercial#treasury" },
          { title: "Merchant services", description: "Card acquiring, ACH origination, and same-day settlement.", href: "/commercial#payments" },
          { title: "Specialized industries", description: "Healthcare, logistics, real estate, and franchise banking.", href: "/commercial#industries" },
        ],
      },
    ],
  },
  {
    label: "International",
    href: "/international",
    groups: [
      {
        heading: "Cross-border banking",
        items: [
          { title: "Global accounts", description: "Hold and transact in 30+ currencies with one login.", href: "/international#accounts" },
          { title: "Foreign exchange", description: "Real-time FX with mid-market spreads and hedging.", href: "/international#fx" },
          { title: "Trade finance", description: "Letters of credit, documentary collections, supply-chain finance.", href: "/international#trade" },
        ],
      },
      {
        heading: "Regional desks",
        items: [
          { title: "Asia-Pacific", description: "Dedicated bankers in Hong Kong, Singapore, and Tokyo.", href: "/international#apac" },
          { title: "Europe & UK", description: "SEPA, Faster Payments, and EUR/GBP correspondent banking.", href: "/international#emea" },
          { title: "Americas", description: "USD clearing for LATAM operations and US-bound trade.", href: "/international#americas" },
        ],
      },
    ],
  },
  {
    label: "Wealth",
    href: "/personal#wealth",
    groups: [
      {
        heading: "Grow your wealth",
        items: [
          { title: "Investing", description: "Managed portfolios with private-bank insight.", href: "/personal#wealth" },
          { title: "Private banking", description: "A dedicated banker for $1M+ relationships.", href: "/personal#wealth" },
          { title: "Trust & estate", description: "Plan, preserve, and pass on with confidence.", href: "/personal#wealth" },
        ],
      },
    ],
  },
  {
    label: "About",
    href: "/about",
    groups: [
      {
        heading: "The bank",
        items: [
          { title: "Our story", description: "How we're rebuilding banking from first principles.", href: "/about" },
          { title: "Leadership", description: "Meet the team behind Paxnova Trust.", href: "/about#leadership" },
          { title: "Responsibility", description: "Our ESG and community commitments.", href: "/about#esg" },
          { title: "Careers", description: "Build the bank of the next decade.", href: "/about#careers" },
        ],
      },
    ],
  },
];

export const footerNav = [
  {
    heading: "Products",
    links: [
      { label: "Checking", href: "/personal#checking" },
      { label: "Savings", href: "/personal#savings" },
      { label: "Credit cards", href: "/personal#cards" },
      { label: "Mortgages", href: "/personal#mortgages" },
      { label: "Business", href: "/business" },
      { label: "Commercial", href: "/commercial" },
      { label: "International", href: "/international" },
      { label: "Wealth", href: "/personal#wealth" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Leadership", href: "/about#leadership" },
      { label: "Careers", href: "/about#careers" },
      { label: "Press", href: "/about" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help center", href: "/contact" },
      { label: "Rates & fees", href: "/personal" },
      { label: "Security", href: "/signin" },
      { label: "Branch locator", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms of service", href: "/about" },
      { label: "Privacy", href: "/about" },
      { label: "Accessibility", href: "/about" },
      { label: "Compliance", href: "/about" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: "Status", href: "/contact" },
      { label: "Investor relations", href: "/about" },
      { label: "Sustainability", href: "/about#esg" },
    ],
  },
];

export const socials = [
  { label: "Twitter / X", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
  { label: "Instagram", href: "https://instagram.com" },
];
