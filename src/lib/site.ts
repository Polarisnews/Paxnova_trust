export const siteConfig = {
  name: "Nova Trust Bank",
  tagline: "Banking, refined.",
  description:
    "A premium digital-first bank for the wealth of tomorrow. Personal, business, and wealth products engineered for the next decade.",
  url: "https://novatrust.example.com",
  routine: {
    fdicNotice:
      "Nova Trust Bank is a member of the FDIC. Deposits are insured up to $250,000 per depositor. NMLS #2026-NT (illustrative).",
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
          { title: "Leadership", description: "Meet the team behind Nova Trust.", href: "/about#leadership" },
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
