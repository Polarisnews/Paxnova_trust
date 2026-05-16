// Deterministic transaction history generator. Picks dates within a range,
// samples industry-specific narration patterns + counterparties, and threads
// a running balance from a given opening balance.
//
// New industries are easy to add — extend INDUSTRIES below. Each industry
// supplies counterparties + narration patterns; the generator handles the
// scheduling, sampling, and balance threading.

import type { NewTransaction } from "@/db/schema";

export type Style = "business" | "personal";
export type IndustryKey =
  | "plumbing"
  | "construction"
  | "retail"
  | "restaurant"
  | "tech-services"
  | "personal";

type NarrationPattern = {
  pattern: string; // supports {supplier} {customer} {invoice} {check} {month}
  type: "debit" | "credit";
  amountMin: number;
  amountMax: number;
  weight: number;
  category: string;
};

type Industry = {
  key: IndustryKey;
  label: string;
  counterparties: {
    suppliers: string[];
    customers: string[];
    contractors: string[];
  };
  patterns: NarrationPattern[];
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ──────────────────────────────────────────────────────────────────────
// Industry libraries
// ──────────────────────────────────────────────────────────────────────

const PLUMBING: Industry = {
  key: "plumbing",
  label: "Plumbing",
  counterparties: {
    suppliers: [
      "ACE PIPING SUPPLY",
      "WESTPIPE LOGISTICS",
      "BLUE VALVE & FITTING CO",
      "HOME DEPOT PRO",
      "FERGUSON ENTERPRISES",
      "GRAINGER INDUSTRIAL",
      "REXEL WHOLESALE",
      "PARKER FITTINGS",
    ],
    customers: [
      "RIVERSIDE PLUMBING SVC",
      "HEARTH HOLDINGS LLC",
      "MERIDIAN PROPERTY MGMT",
      "FAIRWAY CONSTRUCTION",
      "VERANO HOMES",
      "ELMWOOD APARTMENTS",
      "BLUE OAK DEVELOPMENT",
    ],
    contractors: [
      "TINA REYES — APPRENTICE",
      "MARCO HALL — JOURNEYMAN",
      "STERLING WELDING LLC",
      "EXCAVATION PARTNERS LP",
    ],
  },
  patterns: [
    {
      pattern: "ACH CREDIT — {customer} — INV #{invoice}",
      type: "credit",
      amountMin: 1800,
      amountMax: 18000,
      weight: 8,
      category: "Customer payment",
    },
    {
      pattern: "WIRE IN — {customer} — PROGRESS DRAW",
      type: "credit",
      amountMin: 5000,
      amountMax: 45000,
      weight: 3,
      category: "Customer payment",
    },
    {
      pattern: "CHECK DEPOSIT — {customer}",
      type: "credit",
      amountMin: 350,
      amountMax: 4200,
      weight: 4,
      category: "Customer payment",
    },
    {
      pattern: "WIRE OUT — {supplier} INV #{invoice}",
      type: "debit",
      amountMin: 600,
      amountMax: 14000,
      weight: 7,
      category: "Supplies",
    },
    {
      pattern: "ACH DEBIT — {supplier} ACCT #{check}",
      type: "debit",
      amountMin: 200,
      amountMax: 3800,
      weight: 6,
      category: "Supplies",
    },
    {
      pattern: "POS — {supplier} STORE",
      type: "debit",
      amountMin: 35,
      amountMax: 850,
      weight: 5,
      category: "Supplies",
    },
    {
      pattern: "1099 — {contractor}",
      type: "debit",
      amountMin: 800,
      amountMax: 6200,
      weight: 3,
      category: "Contractor",
    },
  ],
};

const CONSTRUCTION: Industry = {
  key: "construction",
  label: "Construction",
  counterparties: {
    suppliers: [
      "BUILDERS FIRSTSOURCE",
      "84 LUMBER WHOLESALE",
      "CMC STEEL & METAL",
      "READY-MIX CONCRETE CO",
      "STERLING CRANE LEASE",
      "TOOLPRO RENTALS",
      "PROBUILD COMMERCIAL",
    ],
    customers: [
      "MARIN COUNTY DEVELOPMENT",
      "OAKRIDGE HOMES",
      "LAKEVIEW CAPITAL PARTNERS",
      "WESTBROOK MIXED-USE",
      "PHOENIX RESIDENTIAL LLC",
    ],
    contractors: [
      "DELTA ELECTRIC LLC",
      "ROOF RANGERS INC",
      "PRECISION CONCRETE LP",
      "GLASS COAST GLAZING",
      "AIRSEAL INSULATION",
    ],
  },
  patterns: [
    {
      pattern: "WIRE IN — {customer} — DRAW #{check}",
      type: "credit",
      amountMin: 25000,
      amountMax: 250000,
      weight: 5,
      category: "Project draw",
    },
    {
      pattern: "ACH CREDIT — {customer} — RETAINER",
      type: "credit",
      amountMin: 12000,
      amountMax: 80000,
      weight: 4,
      category: "Retainer",
    },
    {
      pattern: "WIRE OUT — {supplier} MATERIAL PO #{invoice}",
      type: "debit",
      amountMin: 3500,
      amountMax: 75000,
      weight: 8,
      category: "Materials",
    },
    {
      pattern: "ACH DEBIT — {contractor} — JOB #{check}",
      type: "debit",
      amountMin: 4500,
      amountMax: 32000,
      weight: 6,
      category: "Subcontractor",
    },
    {
      pattern: "WIRE OUT — {supplier} EQUIPMENT LEASE",
      type: "debit",
      amountMin: 1800,
      amountMax: 8500,
      weight: 3,
      category: "Equipment",
    },
    {
      pattern: "ACH DEBIT — PROJECT INSURANCE — {supplier}",
      type: "debit",
      amountMin: 900,
      amountMax: 4200,
      weight: 2,
      category: "Insurance",
    },
  ],
};

const RETAIL: Industry = {
  key: "retail",
  label: "Retail / e-commerce",
  counterparties: {
    suppliers: [
      "SHOPIFY MERCHANT FEES",
      "AMAZON SELLER SERVICES",
      "USPS COMMERCIAL",
      "FEDEX FREIGHT",
      "UPS GROUND",
      "STRIPE PROCESSING",
      "SQUARE INC",
      "FAIRE WHOLESALE",
      "ALIBABA TRADE ASSURANCE",
    ],
    customers: [
      "WEBSITE — SHOPIFY",
      "AMAZON FBA SETTLEMENT",
      "ETSY PAYMENT BATCH",
      "WHOLESALE — BOUTIQUE 27",
      "WHOLESALE — TRAVELLERS CO",
    ],
    contractors: [
      "INFLUENCER COLLAB — AVA M.",
      "PHOTOGRAPHER — JONAH P.",
      "WEB DEV — CRESCENT STUDIO",
    ],
  },
  patterns: [
    {
      pattern: "DEPOSIT — {customer} — BATCH #{check}",
      type: "credit",
      amountMin: 850,
      amountMax: 22000,
      weight: 9,
      category: "Sales",
    },
    {
      pattern: "STRIPE TRANSFER — SETTLEMENT",
      type: "credit",
      amountMin: 1500,
      amountMax: 35000,
      weight: 4,
      category: "Sales",
    },
    {
      pattern: "ACH CREDIT — {customer} — REFUND CHARGEBACK ADJ",
      type: "credit",
      amountMin: 50,
      amountMax: 950,
      weight: 2,
      category: "Adjustment",
    },
    {
      pattern: "ACH DEBIT — {supplier} — INV #{invoice}",
      type: "debit",
      amountMin: 380,
      amountMax: 9600,
      weight: 7,
      category: "Inventory",
    },
    {
      pattern: "WIRE OUT — {supplier} — RESTOCK PO",
      type: "debit",
      amountMin: 4500,
      amountMax: 38000,
      weight: 4,
      category: "Inventory",
    },
    {
      pattern: "PROCESSING FEE — {supplier}",
      type: "debit",
      amountMin: 120,
      amountMax: 1850,
      weight: 5,
      category: "Fees",
    },
    {
      pattern: "MARKETING — META ADS",
      type: "debit",
      amountMin: 250,
      amountMax: 4200,
      weight: 4,
      category: "Marketing",
    },
    {
      pattern: "MARKETING — GOOGLE ADS",
      type: "debit",
      amountMin: 250,
      amountMax: 4200,
      weight: 4,
      category: "Marketing",
    },
  ],
};

const RESTAURANT: Industry = {
  key: "restaurant",
  label: "Restaurant / hospitality",
  counterparties: {
    suppliers: [
      "SYSCO FOODS",
      "US FOODS",
      "RESTAURANT DEPOT",
      "PERFORMANCE FOODSERVICE",
      "BREAKTHRU BEVERAGE",
      "REINHART FOODSERVICE",
      "PG&E ELECTRIC",
      "COMCAST BUSINESS",
    ],
    customers: [
      "TOAST POS SETTLEMENT",
      "DOORDASH WEEKLY PAYOUT",
      "UBER EATS PAYOUT",
      "RESERVE — CATERING — INVOICE",
    ],
    contractors: [
      "EQUIPMENT REPAIR — COASTAL",
      "PEST CONTROL — TERMINIX",
      "LINEN — CINTAS",
    ],
  },
  patterns: [
    {
      pattern: "DEPOSIT — {customer}",
      type: "credit",
      amountMin: 1200,
      amountMax: 28000,
      weight: 9,
      category: "Sales",
    },
    {
      pattern: "WIRE IN — CATERING — INV #{invoice}",
      type: "credit",
      amountMin: 1500,
      amountMax: 12000,
      weight: 3,
      category: "Catering",
    },
    {
      pattern: "ACH DEBIT — {supplier} — INV #{invoice}",
      type: "debit",
      amountMin: 280,
      amountMax: 6200,
      weight: 8,
      category: "Food cost",
    },
    {
      pattern: "POS — {supplier} (RESTOCK)",
      type: "debit",
      amountMin: 95,
      amountMax: 1800,
      weight: 5,
      category: "Food cost",
    },
    {
      pattern: "UTILITY — {supplier}",
      type: "debit",
      amountMin: 240,
      amountMax: 2400,
      weight: 3,
      category: "Utilities",
    },
    {
      pattern: "VENDOR — {contractor}",
      type: "debit",
      amountMin: 150,
      amountMax: 1850,
      weight: 3,
      category: "Operations",
    },
  ],
};

const TECH_SERVICES: Industry = {
  key: "tech-services",
  label: "Technology / SaaS",
  counterparties: {
    suppliers: [
      "AWS AMAZON WEB SERVICES",
      "GOOGLE CLOUD PLATFORM",
      "VERCEL INC",
      "SUPABASE INC",
      "FIGMA",
      "LINEAR",
      "NOTION LABS",
      "ATLASSIAN",
      "GITHUB COPILOT",
      "OPENAI API",
    ],
    customers: [
      "STRIPE SETTLEMENT — SUBS",
      "ANNUAL CONTRACT — APEX CORP",
      "ENTERPRISE — RIDGELINE INC",
      "SAAS RENEWAL — WAYFINDER",
    ],
    contractors: [
      "DESIGN CONTRACTOR — IRIS K.",
      "DEVOPS CONSULT — KNOX SYS",
      "LEGAL — SLATE & RAVEN LLP",
    ],
  },
  patterns: [
    {
      pattern: "STRIPE TRANSFER — SETTLEMENT",
      type: "credit",
      amountMin: 4500,
      amountMax: 85000,
      weight: 7,
      category: "Revenue",
    },
    {
      pattern: "WIRE IN — {customer}",
      type: "credit",
      amountMin: 8500,
      amountMax: 220000,
      weight: 4,
      category: "Revenue",
    },
    {
      pattern: "ACH CREDIT — {customer} — INV #{invoice}",
      type: "credit",
      amountMin: 2400,
      amountMax: 38000,
      weight: 5,
      category: "Revenue",
    },
    {
      pattern: "ACH DEBIT — {supplier}",
      type: "debit",
      amountMin: 95,
      amountMax: 8800,
      weight: 8,
      category: "Cloud / tooling",
    },
    {
      pattern: "1099 — {contractor}",
      type: "debit",
      amountMin: 2200,
      amountMax: 14000,
      weight: 3,
      category: "Contractor",
    },
    {
      pattern: "AWS BILLING — REGION US-EAST-1",
      type: "debit",
      amountMin: 1850,
      amountMax: 28000,
      weight: 3,
      category: "Cloud / tooling",
    },
  ],
};

const PERSONAL: Industry = {
  key: "personal",
  label: "Personal / family",
  counterparties: {
    suppliers: [
      "WHOLE FOODS MARKET",
      "TRADER JOE'S",
      "COSTCO WHOLESALE",
      "SHELL FUEL",
      "CHEVRON STATION",
      "STARBUCKS",
      "BLUE BOTTLE COFFEE",
      "CHIPOTLE MEXICAN GRILL",
      "AMAZON.COM",
      "TARGET",
      "WALMART SUPERCENTER",
      "CVS PHARMACY",
      "WALGREENS",
      "NETFLIX SUBSCRIPTION",
      "SPOTIFY PREMIUM",
      "APPLE.COM",
    ],
    customers: [
      "PAYROLL — HELIO LABS",
      "PAYROLL — STELLAR DESIGN CO",
      "ZELLE FROM ALEX K.",
      "VENMO TRANSFER — RILEY M.",
      "TAX REFUND — IRS TREAS",
    ],
    contractors: [
      "AIRBNB BOOKING",
      "DELTA AIRLINES",
      "UBER RIDES",
      "DOORDASH",
    ],
  },
  patterns: [
    {
      pattern: "DIRECT DEPOSIT — {customer}",
      type: "credit",
      amountMin: 1800,
      amountMax: 8500,
      weight: 7,
      category: "Income",
    },
    {
      pattern: "ZELLE TRANSFER — {customer}",
      type: "credit",
      amountMin: 30,
      amountMax: 950,
      weight: 3,
      category: "Transfer",
    },
    {
      pattern: "POS — {supplier}",
      type: "debit",
      amountMin: 8,
      amountMax: 240,
      weight: 12,
      category: "Daily spend",
    },
    {
      pattern: "POS — {supplier} (LARGE)",
      type: "debit",
      amountMin: 90,
      amountMax: 580,
      weight: 5,
      category: "Daily spend",
    },
    {
      pattern: "SUBSCRIPTION — {supplier}",
      type: "debit",
      amountMin: 9.99,
      amountMax: 49.99,
      weight: 4,
      category: "Subscriptions",
    },
    {
      pattern: "TRAVEL — {contractor}",
      type: "debit",
      amountMin: 24,
      amountMax: 1450,
      weight: 3,
      category: "Travel",
    },
  ],
};

const INDUSTRIES: Record<IndustryKey, Industry> = {
  plumbing: PLUMBING,
  construction: CONSTRUCTION,
  retail: RETAIL,
  restaurant: RESTAURANT,
  "tech-services": TECH_SERVICES,
  personal: PERSONAL,
};

export const INDUSTRY_OPTIONS: { value: IndustryKey; label: string }[] =
  Object.values(INDUSTRIES).map((i) => ({ value: i.key, label: i.label }));

// ──────────────────────────────────────────────────────────────────────
// Universal patterns layered on top of any industry
// ──────────────────────────────────────────────────────────────────────

const UNIVERSAL_BUSINESS: NarrationPattern[] = [
  {
    pattern: "ADP PAYROLL — RUN #{check} — PAY PERIOD ENDING {month}",
    type: "debit",
    amountMin: 8500,
    amountMax: 65000,
    weight: 4,
    category: "Payroll",
  },
  {
    pattern: "ACH RENT — VERTEX PROPERTY MGMT — UNIT 401",
    type: "debit",
    amountMin: 3200,
    amountMax: 18000,
    weight: 2,
    category: "Rent",
  },
  {
    pattern: "UTILITY — PG&E ELECTRIC ACCT #{check}",
    type: "debit",
    amountMin: 180,
    amountMax: 1850,
    weight: 2,
    category: "Utilities",
  },
  {
    pattern: "UTILITY — COMCAST BUSINESS",
    type: "debit",
    amountMin: 120,
    amountMax: 480,
    weight: 1,
    category: "Utilities",
  },
  {
    pattern: "EST. TAX PAYMENT — IRS TREASURY — Q{check}",
    type: "debit",
    amountMin: 2200,
    amountMax: 28000,
    weight: 1,
    category: "Tax",
  },
];

const UNIVERSAL_PERSONAL: NarrationPattern[] = [
  {
    pattern: "ACH RENT — LAKEVIEW HOLDINGS LLC",
    type: "debit",
    amountMin: 1400,
    amountMax: 4800,
    weight: 2,
    category: "Rent",
  },
  {
    pattern: "UTILITY — CON EDISON — ACCT #{check}",
    type: "debit",
    amountMin: 60,
    amountMax: 380,
    weight: 2,
    category: "Utilities",
  },
  {
    pattern: "INSURANCE — STATE FARM AUTO",
    type: "debit",
    amountMin: 110,
    amountMax: 320,
    weight: 1,
    category: "Insurance",
  },
  {
    pattern: "PEDIATRICIAN — KAISER PERMANENTE",
    type: "debit",
    amountMin: 40,
    amountMax: 380,
    weight: 1,
    category: "Healthcare",
  },
];

// ──────────────────────────────────────────────────────────────────────
// Random helpers (seedable)
// ──────────────────────────────────────────────────────────────────────

function makeRng(seed: string): () => number {
  // Tiny mulberry32 from a hash of `seed`. Deterministic + fast.
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function weightedPick(rng: () => number, patterns: NarrationPattern[]): NarrationPattern {
  const total = patterns.reduce((s, p) => s + p.weight, 0);
  let r = rng() * total;
  for (const p of patterns) {
    if (r < p.weight) return p;
    r -= p.weight;
  }
  return patterns[patterns.length - 1];
}

function randomAmount(rng: () => number, min: number, max: number): number {
  const v = min + rng() * (max - min);
  // Round to cents.
  return Math.round(v * 100) / 100;
}

function substituteNarration(
  template: string,
  industry: Industry,
  rng: () => number,
  date: Date
): string {
  return template
    .replace(/\{supplier\}/g, () => pick(rng, industry.counterparties.suppliers))
    .replace(/\{customer\}/g, () => pick(rng, industry.counterparties.customers))
    .replace(/\{contractor\}/g, () => pick(rng, industry.counterparties.contractors))
    .replace(/\{invoice\}/g, () =>
      String(10000 + Math.floor(rng() * 89999))
    )
    .replace(/\{check\}/g, () =>
      String(1000 + Math.floor(rng() * 8999))
    )
    .replace(/\{month\}/g, () => MONTH_NAMES[date.getMonth()]);
}

// ──────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────

export type GenerateInput = {
  accountId: number;
  industry: IndustryKey;
  style: Style;
  from: number; // epoch ms
  to: number;
  count: number;
  openingBalance: number;
  isCreditAccount: boolean;
  seed?: string;
};

export type GeneratedTransaction = NewTransaction;

export type GenerateResult = {
  rows: GeneratedTransaction[];
  totalCredits: number;
  totalDebits: number;
  netChange: number;
  finalBalance: number;
};

export function generateTransactions(input: GenerateInput): GenerateResult {
  const industry = INDUSTRIES[input.industry];
  const rng = makeRng(input.seed ?? `${input.accountId}-${input.from}-${input.to}`);

  // Combined pattern pool: industry + universal layer.
  const pool: NarrationPattern[] = [
    ...industry.patterns,
    ...(input.style === "business" ? UNIVERSAL_BUSINESS : UNIVERSAL_PERSONAL),
  ];

  const span = Math.max(1, input.to - input.from);
  // Evenly distributed timestamps with ±20 % jitter so the spacing looks
  // human, not metronomic.
  const slotSize = span / input.count;
  const dates: Date[] = [];
  for (let i = 0; i < input.count; i++) {
    const center = input.from + slotSize * (i + 0.5);
    const jitter = (rng() - 0.5) * slotSize * 0.4;
    dates.push(new Date(Math.max(input.from, Math.min(input.to, center + jitter))));
  }
  dates.sort((a, b) => a.getTime() - b.getTime());

  const rows: GeneratedTransaction[] = [];
  let balance = input.openingBalance;
  let totalCredits = 0;
  let totalDebits = 0;

  // Target a slight cash-positive ratio. We bias the pattern type when the
  // last few have been heavily debit/credit.
  let recentDebits = 0;
  let recentCredits = 0;

  for (const date of dates) {
    // For non-credit accounts, if balance is already low, bias toward credit.
    const wantCredit =
      !input.isCreditAccount &&
      balance < 250 &&
      rng() < 0.85;

    // Bias toward business cash-positivity (credit ≈ 1.3× debit).
    const businessBias =
      input.style === "business" && recentDebits > recentCredits * 1.3
        ? "credit"
        : null;

    // Sample until we get a pattern matching our bias (or 3 tries).
    let chosen: NarrationPattern | null = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const p = weightedPick(rng, pool);
      if (wantCredit && p.type !== "credit") continue;
      if (businessBias && p.type !== businessBias) continue;
      chosen = p;
      break;
    }
    if (!chosen) chosen = weightedPick(rng, pool);

    const description = substituteNarration(chosen.pattern, industry, rng, date);
    const amount = randomAmount(rng, chosen.amountMin, chosen.amountMax);

    if (chosen.type === "credit") {
      balance = Number((balance + amount).toFixed(2));
      totalCredits += amount;
      recentCredits++;
    } else {
      balance = Number((balance - amount).toFixed(2));
      totalDebits += amount;
      recentDebits++;
    }

    rows.push({
      accountId: input.accountId,
      type: chosen.type,
      amount,
      description,
      category: chosen.category,
      counterparty: description.split(" — ")[1]?.split(" ").slice(0, 3).join(" ") ?? null,
      remark: null,
      referenceNumber: null,
      counterpartyBank: null,
      counterpartyAccountNumber: null,
      balanceAfter: balance,
      createdAt: date,
    });
  }

  return {
    rows,
    totalCredits: Number(totalCredits.toFixed(2)),
    totalDebits: Number(totalDebits.toFixed(2)),
    netChange: Number((totalCredits - totalDebits).toFixed(2)),
    finalBalance: Number(balance.toFixed(2)),
  };
}
