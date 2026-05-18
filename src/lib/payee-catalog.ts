// Catalog of payees that get auto-seeded for every Paxnova Trust customer.
//
// Personal customers receive the full personal set (~50 payees across
// utilities, telecom, streaming, insurance, credit cards, lifestyle, and
// recurring services). Business customers receive the business vendor set
// (~25 payees across software, payroll, payments, marketing, and office).
// Users who hold both kinds of accounts get both sets.
//
// Each template specifies:
//   • the brand name and category
//   • a base monthly amount and the variance pattern (flat / seasonal
//     utility / variable / annual) used to generate realistic 12-month
//     history
//   • the day of the month the payment recurs (1–28; the seeder picks one
//     deterministically if a range is given)

export type VariancePattern =
  | "flat" // ±2% noise around base
  | "seasonal-utility" // winter + summer spikes, lower in shoulder months
  | "variable" // ±30–50% (cc, ride-share, food delivery)
  | "annual"; // single billing per year, no monthly noise

export type PayeeAudience = "personal" | "business";

export type PayeeTemplate = {
  name: string;
  nickname?: string;
  category: string;
  payeeType: "person" | "business" | "utility" | "external-bank";
  preferredMethod?: "zelle" | "ach" | "wire";
  /** Base monthly amount in USD. */
  baseAmount: number;
  variancePattern: VariancePattern;
  /** For "variable" — fraction of base (0.3 = ±30%). Ignored otherwise. */
  variancePct?: number;
  /** Day-of-month range. Seeder picks once deterministically per user+payee. */
  paymentDayRange: [number, number];
  /** Cadence in months. 1 = monthly (default). 3 = quarterly. 12 = annual. */
  cadenceMonths?: number;
  audience: PayeeAudience;
};

// ──────────────────────────────────────────────────────────────────────
// Personal payees — ~50 entries across the categories an average U.S.
// household actually pays every month
// ──────────────────────────────────────────────────────────────────────

const PERSONAL: PayeeTemplate[] = [
  // ── Utilities (seasonal) ──────────────────────────────────────────
  { name: "Pacific Gas & Electric", nickname: "Power & gas", category: "Utilities", payeeType: "utility", baseAmount: 215, variancePattern: "seasonal-utility", paymentDayRange: [10, 18], audience: "personal" },
  { name: "Con Edison",             nickname: "Power",        category: "Utilities", payeeType: "utility", baseAmount: 185, variancePattern: "seasonal-utility", paymentDayRange: [10, 22], audience: "personal" },
  { name: "City Water Department",  nickname: "Water bill",   category: "Utilities", payeeType: "utility", baseAmount: 78,  variancePattern: "seasonal-utility", paymentDayRange: [5, 15],  audience: "personal" },
  { name: "Republic Services",      nickname: "Trash & recycling", category: "Utilities", payeeType: "utility", baseAmount: 42, variancePattern: "flat", paymentDayRange: [1, 5], audience: "personal" },
  { name: "SoCalGas",               nickname: "Natural gas",  category: "Utilities", payeeType: "utility", baseAmount: 95,  variancePattern: "seasonal-utility", paymentDayRange: [10, 20], audience: "personal" },

  // ── Telecom (flat) ────────────────────────────────────────────────
  { name: "Verizon Wireless",       nickname: "Mobile",       category: "Telecom",   payeeType: "business", baseAmount: 145, variancePattern: "flat", paymentDayRange: [12, 18], audience: "personal" },
  { name: "T-Mobile",               nickname: "Mobile family plan", category: "Telecom", payeeType: "business", baseAmount: 165, variancePattern: "flat", paymentDayRange: [4, 10], audience: "personal" },
  { name: "Xfinity (Comcast)",      nickname: "Internet",     category: "Telecom",   payeeType: "business", baseAmount: 89,  variancePattern: "flat", paymentDayRange: [16, 24], audience: "personal" },
  { name: "Spectrum",               nickname: "Internet + TV", category: "Telecom",  payeeType: "business", baseAmount: 119, variancePattern: "flat", paymentDayRange: [3, 9],   audience: "personal" },
  { name: "AT&T Fiber",             nickname: "Home internet", category: "Telecom", payeeType: "business", baseAmount: 75,  variancePattern: "flat", paymentDayRange: [20, 26], audience: "personal" },

  // ── Streaming & media (flat) ──────────────────────────────────────
  { name: "Netflix",                category: "Streaming", payeeType: "business", baseAmount: 22.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Spotify",                category: "Streaming", payeeType: "business", baseAmount: 16.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Disney+ Bundle",         category: "Streaming", payeeType: "business", baseAmount: 19.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Max (HBO)",              category: "Streaming", payeeType: "business", baseAmount: 16.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Apple TV+",              category: "Streaming", payeeType: "business", baseAmount: 9.99,  variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "YouTube Premium",        category: "Streaming", payeeType: "business", baseAmount: 13.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Audible",                category: "Streaming", payeeType: "business", baseAmount: 14.95, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Hulu",                   category: "Streaming", payeeType: "business", baseAmount: 17.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },

  // ── Insurance (mostly flat; auto + home sometimes annual) ─────────
  { name: "GEICO Auto Insurance",   nickname: "Car insurance", category: "Insurance", payeeType: "business", baseAmount: 165, variancePattern: "flat", paymentDayRange: [12, 18], audience: "personal" },
  { name: "State Farm Homeowners",  nickname: "Home insurance", category: "Insurance", payeeType: "business", baseAmount: 145, variancePattern: "flat", paymentDayRange: [5, 12], audience: "personal" },
  { name: "Blue Cross Blue Shield", nickname: "Health insurance", category: "Insurance", payeeType: "business", baseAmount: 425, variancePattern: "flat", paymentDayRange: [1, 7], audience: "personal" },
  { name: "Progressive Life",       nickname: "Life insurance", category: "Insurance", payeeType: "business", baseAmount: 38, variancePattern: "flat", paymentDayRange: [22, 28], audience: "personal" },
  { name: "Lemonade Renters",       nickname: "Renters insurance", category: "Insurance", payeeType: "business", baseAmount: 18, variancePattern: "flat", paymentDayRange: [9, 14], audience: "personal" },

  // ── Credit cards (variable) ───────────────────────────────────────
  { name: "Chase Sapphire Reserve", nickname: "Travel card", category: "Credit cards", payeeType: "external-bank", baseAmount: 1850, variancePattern: "variable", variancePct: 0.45, paymentDayRange: [18, 26], audience: "personal" },
  { name: "American Express Gold",  nickname: "Amex Gold",   category: "Credit cards", payeeType: "external-bank", baseAmount: 1240, variancePattern: "variable", variancePct: 0.5,  paymentDayRange: [8, 16],  audience: "personal" },
  { name: "Capital One Venture X",  nickname: "Venture X",   category: "Credit cards", payeeType: "external-bank", baseAmount: 985,  variancePattern: "variable", variancePct: 0.4,  paymentDayRange: [3, 11],  audience: "personal" },
  { name: "Citi Double Cash",       nickname: "Citi cash card", category: "Credit cards", payeeType: "external-bank", baseAmount: 620, variancePattern: "variable", variancePct: 0.4, paymentDayRange: [25, 28], audience: "personal" },
  { name: "Apple Card (Goldman)",   nickname: "Apple Card",  category: "Credit cards", payeeType: "external-bank", baseAmount: 380, variancePattern: "variable", variancePct: 0.5,  paymentDayRange: [1, 5],  audience: "personal" },

  // ── Buy Now Pay Later (variable, smaller amounts) ─────────────────
  { name: "Affirm",                 category: "BNPL", payeeType: "business", baseAmount: 145, variancePattern: "variable", variancePct: 0.6, paymentDayRange: [10, 22], audience: "personal" },
  { name: "Klarna",                 category: "BNPL", payeeType: "business", baseAmount: 92,  variancePattern: "variable", variancePct: 0.7, paymentDayRange: [4, 18],  audience: "personal" },
  { name: "Afterpay",               category: "BNPL", payeeType: "business", baseAmount: 68,  variancePattern: "variable", variancePct: 0.7, paymentDayRange: [6, 22],  audience: "personal" },

  // ── Housing (fixed) ───────────────────────────────────────────────
  { name: "Greystar Property Mgmt", nickname: "Rent",        category: "Housing", payeeType: "business", baseAmount: 3250, variancePattern: "flat", paymentDayRange: [1, 1],  audience: "personal" },
  { name: "Rocket Mortgage",        nickname: "Mortgage",    category: "Housing", payeeType: "external-bank", baseAmount: 2940, variancePattern: "flat", paymentDayRange: [1, 5], audience: "personal" },
  { name: "HOA — Highland Park",    nickname: "HOA fees",    category: "Housing", payeeType: "business", baseAmount: 320,  variancePattern: "flat", paymentDayRange: [1, 5], audience: "personal" },

  // ── Auto loan & misc transportation ───────────────────────────────
  { name: "Toyota Financial",       nickname: "Car loan",    category: "Auto",   payeeType: "external-bank", baseAmount: 485, variancePattern: "flat", paymentDayRange: [15, 22], audience: "personal" },
  { name: "Tesla Financing",        nickname: "EV loan",     category: "Auto",   payeeType: "external-bank", baseAmount: 720, variancePattern: "flat", paymentDayRange: [20, 26], audience: "personal" },

  // ── Education ─────────────────────────────────────────────────────
  { name: "Nelnet",                 nickname: "Student loans", category: "Education", payeeType: "external-bank", baseAmount: 410, variancePattern: "flat", paymentDayRange: [17, 22], audience: "personal" },
  { name: "Sallie Mae",             nickname: "Private student loan", category: "Education", payeeType: "external-bank", baseAmount: 275, variancePattern: "flat", paymentDayRange: [9, 14], audience: "personal" },

  // ── Subscriptions / SaaS (flat) ───────────────────────────────────
  { name: "iCloud+ (Apple)",        category: "Subscriptions", payeeType: "business", baseAmount: 9.99,  variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Google One",             category: "Subscriptions", payeeType: "business", baseAmount: 9.99,  variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Microsoft 365 Family",   category: "Subscriptions", payeeType: "business", baseAmount: 12.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Adobe Creative Cloud",   category: "Subscriptions", payeeType: "business", baseAmount: 59.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Notion Personal Pro",    category: "Subscriptions", payeeType: "business", baseAmount: 10,    variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "1Password Family",       category: "Subscriptions", payeeType: "business", baseAmount: 7.99,  variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "The New York Times",     category: "Subscriptions", payeeType: "business", baseAmount: 17,    variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },

  // ── Fitness ───────────────────────────────────────────────────────
  { name: "Equinox",                nickname: "Gym",         category: "Fitness", payeeType: "business", baseAmount: 305, variancePattern: "flat", paymentDayRange: [1, 5],  audience: "personal" },
  { name: "Peloton All-Access",     category: "Fitness", payeeType: "business", baseAmount: 44, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "ClassPass",              category: "Fitness", payeeType: "business", baseAmount: 79, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },

  // ── Lifestyle / variable ──────────────────────────────────────────
  { name: "Uber",                   category: "Ride-share",   payeeType: "business", baseAmount: 95,  variancePattern: "variable", variancePct: 0.7, paymentDayRange: [3, 27], audience: "personal" },
  { name: "Lyft",                   category: "Ride-share",   payeeType: "business", baseAmount: 62,  variancePattern: "variable", variancePct: 0.7, paymentDayRange: [3, 27], audience: "personal" },
  { name: "DoorDash",               category: "Food delivery", payeeType: "business", baseAmount: 78, variancePattern: "variable", variancePct: 0.6, paymentDayRange: [3, 27], audience: "personal" },
  { name: "Uber Eats",              category: "Food delivery", payeeType: "business", baseAmount: 54, variancePattern: "variable", variancePct: 0.6, paymentDayRange: [3, 27], audience: "personal" },
  { name: "Instacart+",             category: "Food delivery", payeeType: "business", baseAmount: 9.99, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },

  // ── Kids & pets ───────────────────────────────────────────────────
  { name: "Bright Horizons Daycare", nickname: "Daycare",    category: "Kids", payeeType: "business", baseAmount: 1850, variancePattern: "flat", paymentDayRange: [1, 5],  audience: "personal" },
  { name: "Little League Eastside", nickname: "Kids sports", category: "Kids", payeeType: "business", baseAmount: 95,   variancePattern: "flat", paymentDayRange: [10, 14], audience: "personal" },
  { name: "Chewy Autoship",         nickname: "Pet food",    category: "Pets", payeeType: "business", baseAmount: 78,   variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
  { name: "Trupanion Pet Insurance", nickname: "Pet insurance", category: "Pets", payeeType: "business", baseAmount: 62, variancePattern: "flat", paymentDayRange: [16, 21], audience: "personal" },

  // ── Home services ─────────────────────────────────────────────────
  { name: "TruGreen Lawn Care",     category: "Home services", payeeType: "business", baseAmount: 95,  variancePattern: "flat", paymentDayRange: [10, 15], audience: "personal" },
  { name: "Molly Maid Cleaning",    category: "Home services", payeeType: "business", baseAmount: 220, variancePattern: "flat", paymentDayRange: [12, 22], audience: "personal" },
  { name: "Vivint Smart Home",      nickname: "Home security", category: "Home services", payeeType: "business", baseAmount: 65, variancePattern: "flat", paymentDayRange: [3, 8], audience: "personal" },

  // ── Charity (flat monthly) ────────────────────────────────────────
  { name: "Doctors Without Borders", nickname: "Charity",     category: "Giving", payeeType: "business", baseAmount: 35, variancePattern: "flat", paymentDayRange: [3, 27], audience: "personal" },
];

// ──────────────────────────────────────────────────────────────────────
// Business vendors — ~25 entries that an average U.S. SMB pays
// ──────────────────────────────────────────────────────────────────────

const BUSINESS: PayeeTemplate[] = [
  // ── Cloud & dev tools ─────────────────────────────────────────────
  { name: "Amazon Web Services",   nickname: "AWS",        category: "Cloud & dev",    payeeType: "business", baseAmount: 3850, variancePattern: "variable", variancePct: 0.35, paymentDayRange: [3, 5],   audience: "business" },
  { name: "Vercel Pro",            category: "Cloud & dev",    payeeType: "business", baseAmount: 240, variancePattern: "flat", paymentDayRange: [12, 17], audience: "business" },
  { name: "GitHub Enterprise",     category: "Cloud & dev",    payeeType: "business", baseAmount: 480, variancePattern: "flat", paymentDayRange: [8, 14],  audience: "business" },
  { name: "Datadog",               category: "Cloud & dev",    payeeType: "business", baseAmount: 1450, variancePattern: "variable", variancePct: 0.25, paymentDayRange: [3, 7], audience: "business" },
  { name: "Sentry",                category: "Cloud & dev",    payeeType: "business", baseAmount: 320, variancePattern: "flat", paymentDayRange: [13, 19], audience: "business" },

  // ── Productivity & comms ──────────────────────────────────────────
  { name: "Slack Enterprise",      category: "Productivity",   payeeType: "business", baseAmount: 850,  variancePattern: "flat", paymentDayRange: [1, 5],   audience: "business" },
  { name: "Zoom One Business",     category: "Productivity",   payeeType: "business", baseAmount: 320,  variancePattern: "flat", paymentDayRange: [16, 22], audience: "business" },
  { name: "Google Workspace",      category: "Productivity",   payeeType: "business", baseAmount: 540,  variancePattern: "flat", paymentDayRange: [7, 12],  audience: "business" },
  { name: "Microsoft 365 Business", category: "Productivity",  payeeType: "business", baseAmount: 480,  variancePattern: "flat", paymentDayRange: [20, 25], audience: "business" },
  { name: "Notion Business",       category: "Productivity",   payeeType: "business", baseAmount: 245,  variancePattern: "flat", paymentDayRange: [10, 15], audience: "business" },

  // ── Payroll, HR, accounting ───────────────────────────────────────
  { name: "Gusto Payroll",         nickname: "Payroll",         category: "Payroll & HR", payeeType: "business", baseAmount: 1850, variancePattern: "variable", variancePct: 0.15, paymentDayRange: [1, 3],   audience: "business" },
  { name: "Rippling HRIS",         category: "Payroll & HR",   payeeType: "business", baseAmount: 1240, variancePattern: "flat", paymentDayRange: [25, 28], audience: "business" },
  { name: "QuickBooks Online",     nickname: "Accounting SaaS", category: "Payroll & HR", payeeType: "business", baseAmount: 240, variancePattern: "flat", paymentDayRange: [4, 9],  audience: "business" },

  // ── Payments & finance ────────────────────────────────────────────
  { name: "Stripe",                nickname: "Payment processor", category: "Payments", payeeType: "business", baseAmount: 4250, variancePattern: "variable", variancePct: 0.4, paymentDayRange: [1, 1],   audience: "business" },
  { name: "Brex Card",             nickname: "Corporate card",   category: "Payments",   payeeType: "external-bank", baseAmount: 6850, variancePattern: "variable", variancePct: 0.35, paymentDayRange: [25, 28], audience: "business" },
  { name: "American Express Business Platinum", nickname: "Amex business", category: "Payments", payeeType: "external-bank", baseAmount: 4280, variancePattern: "variable", variancePct: 0.4, paymentDayRange: [12, 18], audience: "business" },

  // ── Marketing & ads ───────────────────────────────────────────────
  { name: "Google Ads",            category: "Marketing", payeeType: "business", baseAmount: 5400, variancePattern: "variable", variancePct: 0.4, paymentDayRange: [3, 5], audience: "business" },
  { name: "Meta Ads",              nickname: "Facebook + Instagram", category: "Marketing", payeeType: "business", baseAmount: 3850, variancePattern: "variable", variancePct: 0.45, paymentDayRange: [4, 8], audience: "business" },
  { name: "LinkedIn Ads",          category: "Marketing", payeeType: "business", baseAmount: 1850, variancePattern: "variable", variancePct: 0.4, paymentDayRange: [10, 15], audience: "business" },
  { name: "HubSpot",               nickname: "CRM + marketing", category: "Marketing", payeeType: "business", baseAmount: 1200, variancePattern: "flat", paymentDayRange: [15, 20], audience: "business" },

  // ── Office & ops ──────────────────────────────────────────────────
  { name: "WeWork All Access",     nickname: "Coworking", category: "Office & ops", payeeType: "business", baseAmount: 850, variancePattern: "flat", paymentDayRange: [1, 3], audience: "business" },
  { name: "Iron Mountain",         nickname: "Records storage", category: "Office & ops", payeeType: "business", baseAmount: 320, variancePattern: "flat", paymentDayRange: [12, 18], audience: "business" },
  { name: "FedEx Business",        category: "Office & ops", payeeType: "business", baseAmount: 685, variancePattern: "variable", variancePct: 0.5, paymentDayRange: [8, 14], audience: "business" },

  // ── Vendors / legal / insurance ───────────────────────────────────
  { name: "Sullivan & Cromwell LLP", nickname: "Outside counsel", category: "Legal & advisory", payeeType: "business", baseAmount: 12500, variancePattern: "variable", variancePct: 0.6, paymentDayRange: [22, 28], audience: "business" },
  { name: "Hub International Business Insurance", nickname: "Liability + E&O", category: "Insurance", payeeType: "business", baseAmount: 1850, variancePattern: "flat", paymentDayRange: [3, 8], audience: "business" },
];

export function getCatalogFor(audience: PayeeAudience): PayeeTemplate[] {
  return audience === "personal" ? PERSONAL : BUSINESS;
}

export const PERSONAL_PAYEE_COUNT = PERSONAL.length;
export const BUSINESS_PAYEE_COUNT = BUSINESS.length;
