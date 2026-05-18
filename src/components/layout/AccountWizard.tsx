"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Car,
  Check,
  ChevronDown,
  Coins,
  CreditCard,
  Crown,
  Globe2,
  HandCoins,
  Home,
  Landmark,
  Layers,
  LineChart,
  PiggyBank,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────
// Catalog — every category and its products. Each product carries the
// data the comparison card needs: a one-line "best for", 3–4 features,
// 2–3 benefits, 1–2 limitations, and 2–3 hard limits. After picking, the
// wizard routes to either /apply?product=<slug> or /contact (for products
// that aren't self-serve).
// ────────────────────────────────────────────────────────────────────────

type Product = {
  /** What pages call this — used for /apply?product=<slug>. */
  applyAs?: string;
  /** True when the product is high-touch and routes to /contact instead. */
  contact?: boolean;
  title: string;
  tagline: string;
  bestFor: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  benefits: string[];
  limitations: string[];
  limits: { label: string; value: string }[];
  /** Whether to render the product as a featured card (one per category). */
  feature?: boolean;
};

type Category = {
  id: string;
  label: string;
  tagline: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Accent class applied to the category card's selected ring + dot. */
  accent: string;
  products: Product[];
};

const CATEGORIES: Category[] = [
  // ── PERSONAL ──────────────────────────────────────────────────────
  {
    id: "personal",
    label: "Personal",
    tagline: "Day-to-day banking, savings, borrowing, and investing.",
    description:
      "Apex Checking, Reserve Savings, Signature cards, mortgages, personal loans, IRAs, and self-directed investing.",
    icon: User,
    accent: "ring-violet-500 bg-violet-500",
    products: [
      {
        applyAs: "checking",
        title: "Apex Checking",
        tagline: "No-fee everyday banking",
        bestFor: "Day-to-day spending, paychecks, and bill pay.",
        icon: Wallet,
        feature: true,
        features: [
          "Zero monthly fee, zero overdraft",
          "Get paid up to 2 days early",
          "Unlimited domestic ATM reimbursements",
          "Virtual disposable card numbers",
        ],
        benefits: [
          "No minimum balance",
          "Cashflow insights flag bills before they hit",
          "FDIC insured to $250k",
        ],
        limitations: ["Earns only 0.50% APY — pair with Reserve Savings."],
        limits: [
          { label: "Earnings rate", value: "0.50% APY" },
          { label: "Monthly fee", value: "$0" },
          { label: "ATM reimbursements", value: "Unlimited" },
        ],
      },
      {
        applyAs: "savings",
        title: "Reserve High-Yield Savings",
        tagline: "4.85% APY · FDIC insured",
        bestFor: "Emergency fund, savings goals, parked cash.",
        icon: PiggyBank,
        features: [
          "4.85% APY paid monthly",
          "Daily compounding",
          "Instant transfers to Apex Checking",
          "Goal envelopes for separate buckets",
        ],
        benefits: [
          "≈ 6× the national average",
          "Zero fees, zero minimums",
          "FDIC insured to $250k",
        ],
        limitations: [
          "Variable rate — moves with Fed Funds",
          "Some transfer types capped by Reg D",
        ],
        limits: [
          { label: "APY", value: "4.85%" },
          { label: "Minimum balance", value: "$0" },
          { label: "Withdrawal fee", value: "$0" },
        ],
      },
      {
        applyAs: "cd",
        title: "Certificate of Deposit",
        tagline: "Lock today's rate · 6mo to 5yr",
        bestFor: "Cash you won't need for a known timeframe.",
        icon: Landmark,
        features: [
          "Six fixed terms (6, 9, 12, 18, 24, 60 months)",
          "Up to 5.20% APY (12-month)",
          "30-day grace period after opening",
          "Auto-renew optional",
        ],
        benefits: [
          "Locked rate survives Fed cuts",
          "FDIC insured to $250k",
          "Maturity alerts 14 days ahead",
        ],
        limitations: [
          "Early withdrawal = 90 days of interest",
          "Funds locked until maturity",
        ],
        limits: [
          { label: "12-mo APY", value: "5.20%" },
          { label: "Minimum deposit", value: "$500" },
        ],
      },
      {
        applyAs: "credit-card",
        title: "Signature Rewards Card",
        tagline: "Three tiers · real rewards",
        bestFor: "Building credit, earning rewards, premium perks.",
        icon: CreditCard,
        features: [
          "Apex (cash back), Reserve (travel), Signature (premium)",
          "3× dining, 5× travel on the Reserve",
          "$300 annual travel credit (Reserve)",
          "Soft pre-qualification — no credit hit",
        ],
        benefits: [
          "Mobile wallet day one",
          "No foreign transaction fees",
          "Visa Infinite benefits on Signature",
        ],
        limitations: [
          "Reserve $95/yr · Signature $495/yr",
          "Hard credit pull only after offer accepted",
        ],
        limits: [
          { label: "Credit limits", value: "$500 – $50,000" },
          { label: "APR", value: "from 18.99% (variable)" },
        ],
      },
      {
        applyAs: "mortgage",
        title: "Mortgage / Refinance",
        tagline: "Pre-approved in 8 min · close in 21 days",
        bestFor: "Buying or refinancing a primary or second home.",
        icon: Home,
        features: [
          "Soft credit pre-approval",
          "Same banker, end-to-end",
          "Conventional, FHA, VA, jumbo, and ARMs",
          "Rate-match guarantee (or we pay $1,500)",
        ],
        benefits: [
          "Up to $5,000 lender credit",
          "60-day rate lock, free",
          "No prepayment penalty",
        ],
        limitations: [
          "Hard credit pull after offer accepted",
          "Property must be in an approved state",
        ],
        limits: [
          { label: "30-yr fixed (from)", value: "6.42%" },
          { label: "Jumbo cap", value: "$5M" },
        ],
      },
      {
        applyAs: "heloc",
        title: "Home Equity Line (HELOC)",
        tagline: "Borrow against your home — only when you need to",
        bestFor: "Renovations, debt consolidation, or large planned expenses.",
        icon: Building2,
        features: [
          "Variable APR from 7.12%",
          "10-year draw period",
          "Convert any portion to a fixed payment",
          "AVM appraisal — no appraisal fee",
        ],
        benefits: [
          "$0 origination, $0 annual fee",
          "Up to $1,000 closing-cost credit",
          "Same-day funding after close",
        ],
        limitations: [
          "Variable rate can rise with the Fed",
          "Your home is collateral — risk of foreclosure on default",
        ],
        limits: [
          { label: "Combined LTV cap", value: "85%" },
          { label: "Minimum line", value: "$10,000" },
        ],
      },
      {
        applyAs: "loans",
        title: "Personal loan",
        tagline: "Fixed-rate · 2 to 7 years",
        bestFor: "Debt consolidation, life events, large purchases.",
        icon: HandCoins,
        features: [
          "Rates from 6.99% APR",
          "$2,000 – $50,000",
          "Soft credit pre-qualification",
          "Funded next business day",
        ],
        benefits: [
          "No origination, no late fees, no prepayment penalty",
          "Skip-a-payment once per year",
        ],
        limitations: [
          "Not for postsecondary education or gambling",
          "Rate based on credit score",
        ],
        limits: [
          { label: "APR (from)", value: "6.99%" },
          { label: "Amount", value: "$2,000 – $50,000" },
        ],
      },
      {
        applyAs: "auto-refi",
        title: "Auto refinance",
        tagline: "Refinance in 4 minutes",
        bestFor: "Existing auto loans above ~6% APR.",
        icon: Car,
        features: [
          "Fixed rate from 5.49% APR",
          "GAP coverage optional",
          "Skip-a-payment annually",
          "We handle the title transfer + payoff",
        ],
        benefits: [
          "No application fee, no prepayment penalty",
          "Soft pre-qualify",
          "Average member saves $1,420 in interest",
        ],
        limitations: [
          "Vehicle ≤ 10 model years old",
          "Minimum $7,500 loan",
        ],
        limits: [
          { label: "APR (from)", value: "5.49%" },
          { label: "Min loan", value: "$7,500" },
        ],
      },
      {
        applyAs: "brokerage",
        title: "Self-directed investing",
        tagline: "$0 commissions · fractional shares",
        bestFor: "DIY investors who want full control.",
        icon: TrendingUp,
        features: [
          "$0 stock & ETF trades",
          "Fractional shares from $1",
          "Options at $0.50/contract",
          "Real-time Level 1 quotes",
        ],
        benefits: [
          "Idle cash earns 4.85% APY",
          "Auto-invest schedules + DRIP",
        ],
        limitations: [
          "SIPC coverage, not FDIC",
          "Market risk applies",
        ],
        limits: [
          { label: "Account minimum", value: "$0" },
          { label: "Mutual funds", value: "3,000+ at $0" },
        ],
      },
      {
        applyAs: "ira",
        title: "Retirement (IRA)",
        tagline: "Traditional · Roth · Rollover · SEP",
        bestFor: "Tax-advantaged retirement savings.",
        icon: Sparkles,
        features: [
          "Roth, Traditional, Rollover, SEP",
          "Auto contributions to annual max",
          "Backdoor Roth workflow",
          "401(k) rollover assistance",
        ],
        benefits: [
          "No account or maintenance fee",
          "Same $0 trades as brokerage",
        ],
        limitations: [
          "Annual cap: $7,000 / $8,000 (50+)",
          "Withdrawal penalty before age 59½",
        ],
        limits: [
          { label: "Account fee", value: "$0" },
          { label: "Catch-up (50+)", value: "$1,000/yr" },
        ],
      },
    ],
  },

  // ── BUSINESS ─────────────────────────────────────────────────────
  {
    id: "business",
    label: "Business",
    tagline: "From first invoice to IPO.",
    description:
      "Operating accounts, corporate cards, lines of credit, SBA lending, and payments for startups to mid-market.",
    icon: Briefcase,
    accent: "ring-gold-500 bg-gold-500",
    products: [
      {
        applyAs: "business",
        title: "Business Operating Account",
        tagline: "Zero-fee operating + cashflow forecasting",
        bestFor: "Startups, agencies, and SMBs that need a real checking.",
        icon: Briefcase,
        feature: true,
        features: [
          "Unlimited transactions",
          "Real-time cashflow forecasting",
          "QuickBooks, Xero, Pilot integrations",
          "Multi-user with role-based access",
        ],
        benefits: [
          "$0 monthly fee",
          "Free incoming domestic wires",
          "FinCEN BOI filed for you at no charge",
        ],
        limitations: [
          "No interest — pair with Business Savings",
        ],
        limits: [
          { label: "Monthly fee", value: "$0" },
          { label: "Wire (outgoing)", value: "$15 domestic" },
        ],
      },
      {
        applyAs: "business",
        title: "Business Savings",
        tagline: "4.50% APY business reserve",
        bestFor: "Operating reserves, tax escrow, runway buffer.",
        icon: PiggyBank,
        features: [
          "4.50% APY",
          "FDIC insured to $250k per signer/EIN",
          "Linked to operating account for instant moves",
        ],
        benefits: ["No monthly fee", "Daily compounding"],
        limitations: ["Variable rate"],
        limits: [
          { label: "APY", value: "4.50%" },
          { label: "Minimum", value: "$0" },
        ],
      },
      {
        applyAs: "business",
        title: "Corporate cards",
        tagline: "Per-employee virtual cards with spend rules",
        bestFor: "Distributing card spend across a growing team.",
        icon: CreditCard,
        features: [
          "Real-time spend controls",
          "Automatic GL categorization",
          "Receipt capture in-app",
          "$0 fee per card",
        ],
        benefits: ["1.5% unlimited cashback", "Instant card freeze"],
        limitations: ["Requires Business Operating Account"],
        limits: [{ label: "Cards/employees", value: "Unlimited" }],
      },
      {
        applyAs: "business",
        title: "Lines of credit & SBA",
        tagline: "Up to $5M revolving · SBA 7(a)/504",
        bestFor: "Working capital, bridge financing, and growth.",
        icon: Coins,
        features: [
          "Revolving LOC: prime + 0.50%",
          "SBA Preferred Lender — 7(a), 504, Express",
          "$25k–$10M term loans",
          "Equipment financing",
        ],
        benefits: ["Soft pre-qualification", "Annual review only"],
        limitations: [
          "Minimum revenue: $250k for revolving LOC",
          "Personal guarantee may be required",
        ],
        limits: [
          { label: "Revolving LOC", value: "up to $5M" },
          { label: "Term loan", value: "$25k – $10M" },
        ],
      },
    ],
  },

  // ── COMMERCIAL ────────────────────────────────────────────────────
  {
    id: "commercial",
    label: "Commercial",
    tagline: "Capital and treasury for the middle market.",
    description:
      "$50M+ balance-sheet banking: real estate, asset-based lending, syndicated finance, and treasury services.",
    icon: Building2,
    accent: "ring-navy-700 bg-navy-700",
    products: [
      {
        contact: true,
        title: "Commercial real estate",
        tagline: "Acquisition, construction, and bridge loans up to $250M",
        bestFor: "Real estate sponsors and operators.",
        icon: Building2,
        feature: true,
        features: [
          "Permanent, construction, and bridge debt",
          "Multifamily, office, industrial, retail, hospitality",
          "$5M – $250M deal sizes",
          "Loan syndications and club deals",
        ],
        benefits: [
          "Dedicated relationship banker + credit officer",
          "Same team underwrites and services the loan",
        ],
        limitations: [
          "Speculative single-tenant deals declined",
          "Asset classes outside our coverage referred out",
        ],
        limits: [
          { label: "Deal size", value: "$5M – $250M" },
          { label: "Markets", value: "Top 100 U.S. MSAs" },
        ],
      },
      {
        contact: true,
        title: "Asset-based lending",
        tagline: "Working capital secured by receivables or inventory",
        bestFor: "Manufacturers, distributors, and seasonal businesses.",
        icon: Layers,
        features: [
          "Revolving lines from $5M to $250M",
          "Borrowing base advances on AR, inventory, M&E",
          "DIP and turnaround financing available",
        ],
        benefits: [
          "More elastic than cashflow-only underwriting",
          "Borrowing base updated monthly",
        ],
        limitations: [
          "Field exam required at minimum annually",
        ],
        limits: [{ label: "Facility size", value: "$5M – $250M" }],
      },
      {
        contact: true,
        title: "Treasury & payments",
        tagline: "Sweep, lockbox, liquidity for $50M+ balance sheets",
        bestFor: "CFOs and treasurers consolidating banking relationships.",
        icon: ShieldCheck,
        features: [
          "Sweep + investment sweep at money-market yields",
          "Image and electronic lockbox",
          "Same-day ACH origination, RTP, FedNow",
          "Intraday balance & exception reporting",
        ],
        benefits: [
          "Onboarding led by your dedicated treasury banker",
          "Direct API for ERP/TMS integration",
        ],
        limitations: ["Implementation typically 4–8 weeks"],
        limits: [{ label: "ACH file limit", value: "$50M/day" }],
      },
    ],
  },

  // ── INTERNATIONAL ─────────────────────────────────────────────────
  {
    id: "international",
    label: "International",
    tagline: "One account, every currency.",
    description:
      "Multi-currency accounts, FX, SWIFT, SEPA, trade finance, and regional banker coverage across APAC, EMEA, and LATAM.",
    icon: Globe2,
    accent: "ring-violet-700 bg-violet-700",
    products: [
      {
        contact: true,
        title: "Global multi-currency account",
        tagline: "Hold & transact in 30+ currencies",
        bestFor: "Founders and treasurers with cross-border cashflows.",
        icon: Globe2,
        feature: true,
        features: [
          "Hold balances in USD, EUR, GBP, JPY, SGD, HKD, and 25+ more",
          "Local IBAN/account number in major markets",
          "Single Paxnova Trust login across all currencies",
        ],
        benefits: [
          "Mid-market FX with full fee disclosure",
          "Single statement consolidated to your reporting currency",
        ],
        limitations: [
          "Some currencies require business documentation",
          "FX cutoff times vary by currency",
        ],
        limits: [{ label: "Currencies", value: "30+" }],
      },
      {
        contact: true,
        title: "Foreign exchange & hedging",
        tagline: "Spot, forwards, options, and hedging programs",
        bestFor: "Businesses with material FX exposure.",
        icon: TrendingUp,
        features: [
          "Mid-market spot rates",
          "Forwards from 3 to 24 months",
          "Vanilla options and collars",
          "ISDA documentation supported",
        ],
        benefits: [
          "Dedicated FX desk + portal",
          "Hedge accounting support",
        ],
        limitations: [
          "ISDA required for derivatives over $1M notional",
        ],
        limits: [{ label: "Min FX deal", value: "$10,000" }],
      },
      {
        contact: true,
        title: "Trade finance",
        tagline: "LCs, collections, supply-chain finance",
        bestFor: "Importers, exporters, and supply chains.",
        icon: ScrollText,
        features: [
          "Documentary and standby letters of credit",
          "Sight and time-draft collections",
          "Approved-payable and AR purchase programs",
        ],
        benefits: [
          "Full SWIFT MT 7-series messaging",
          "ICC URC/UCP-compliant docs",
        ],
        limitations: [
          "Sanctioned-country flows declined",
          "OFAC and country-risk review on every transaction",
        ],
        limits: [{ label: "LC sizes", value: "$25k+" }],
      },
    ],
  },

  // ── WEALTH ────────────────────────────────────────────────────────
  {
    id: "wealth",
    label: "Wealth Management",
    tagline: "Private banking, refined.",
    description:
      "Discretionary portfolios, alternatives, custom lending, and trust & estate planning for $1M+ relationships.",
    icon: Crown,
    accent: "ring-gold-500 bg-gold-500",
    products: [
      {
        applyAs: "managed",
        title: "Managed portfolios",
        tagline: "Diversified, tax-aware, auto-rebalanced",
        bestFor: "Investors who want a portfolio managed for them.",
        icon: LineChart,
        feature: true,
        features: [
          "0.25% advisory fee",
          "Six risk-graded portfolios (CFA-built)",
          "Tax-loss harvesting (accounts $50k+)",
          "Direct indexing for $250k+",
        ],
        benefits: [
          "ESG and Halal tracks at the same fee",
          "Goal-based planning included",
          "Fiduciary advice on every account",
        ],
        limitations: [
          "Market risk applies",
          "Direct indexing requires $250k minimum",
        ],
        limits: [
          { label: "Advisory fee", value: "0.25%" },
          { label: "Minimum to start", value: "$500" },
        ],
      },
      {
        contact: true,
        title: "Private banking",
        tagline: "Concierge banking for $1M+ relationships",
        bestFor: "Established families and high-net-worth individuals.",
        icon: Crown,
        features: [
          "Dedicated private banker",
          "Same-day wires up to $5M",
          "Bespoke deposit pricing",
          "Securities-backed lending",
        ],
        benefits: [
          "24/7 banker access",
          "Premium card upgraded automatically",
        ],
        limitations: ["$1M minimum relationship balance"],
        limits: [
          { label: "Relationship min", value: "$1M" },
          { label: "Wire same-day", value: "up to $5M" },
        ],
      },
      {
        contact: true,
        title: "Trust, estate & family office",
        tagline: "Plan, preserve, and pass on with confidence",
        bestFor: "Multi-generational planning and complex estates.",
        icon: ScrollText,
        features: [
          "Revocable, irrevocable, dynasty, and charitable trusts",
          "Donor-advised funds and private foundations",
          "Consolidated reporting across family entities",
          "Next-gen education programs",
        ],
        benefits: [
          "In-house counsel on every engagement",
          "Coordinated tax, legal, and investment advice",
        ],
        limitations: ["$5M+ relationship for full family office"],
        limits: [{ label: "Family office min", value: "$5M" }],
      },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────

export function AccountWizard() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Open via the global custom event so any "Open an account" button
  // anywhere on the site can trigger the wizard.
  useEffect(() => {
    const onOpen = () => {
      setCategoryId(null);
      setExpandedId(null);
      setOpen(true);
    };
    window.addEventListener("open-account-wizard", onOpen);
    return () => window.removeEventListener("open-account-wizard", onOpen);
  }, []);

  const category = categoryId
    ? CATEGORIES.find((c) => c.id === categoryId)
    : null;
  const step: "category" | "product" = category ? "product" : "category";

  function chooseProduct(product: Product) {
    setOpen(false);
    if (product.applyAs) {
      router.push(`/apply?product=${encodeURIComponent(product.applyAs)}`);
    } else if (product.contact) {
      router.push(
        `/contact?inquiry=${encodeURIComponent(
          (category?.label ?? "") + ": " + product.title,
        )}`,
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          // Override the dialog default centering to a near-full bottom sheet
          // on mobile and a centered modal on desktop.
          "max-h-[92dvh] max-w-[calc(100%-1rem)] gap-0 overflow-hidden p-0 sm:max-w-2xl lg:max-w-4xl",
          "bg-card",
        )}
      >
        <DialogTitle className="sr-only">Open an account</DialogTitle>
        <DialogDescription className="sr-only">
          A guided wizard to help you pick the right Paxnova Trust account for
          your needs.
        </DialogDescription>

        {/* Header — step indicator + close */}
        <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
          {step === "product" && (
            <button
              type="button"
              onClick={() => setCategoryId(null)}
              className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95"
              aria-label="Back to categories"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}
          <div className="flex flex-1 flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">
              {step === "category" ? "Step 1 of 2" : "Step 2 of 2"}
            </p>
            <p className="font-display text-base font-semibold leading-tight">
              {step === "category"
                ? "Which kind of account are you opening?"
                : `Pick a ${category!.label.toLowerCase()} product`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-gold-500 transition-all duration-300"
            style={{ width: step === "category" ? "50%" : "100%" }}
          />
        </div>

        {step === "category" ? (
          <CategoryStep
            onPick={(id) => {
              setCategoryId(id);
              setExpandedId(null);
            }}
          />
        ) : (
          <ProductStep
            category={category!}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            onChoose={chooseProduct}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Step 1: pick a category ─────────────────────────────────────────────

function CategoryStep({ onPick }: { onPick: (id: string) => void }) {
  return (
    <div className="overflow-y-auto px-5 py-5">
      <p className="mb-4 text-sm text-muted-foreground">
        Pick the category that best fits what you need. We&apos;ll show you
        every product in that area on the next step so you can compare them.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c.id)}
                className="group/cat relative flex w-full items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-violet-500 hover:shadow-soft active:scale-[0.99]"
              >
                <span
                  className={cn(
                    "inline-flex size-12 shrink-0 items-center justify-center rounded-xl text-white",
                    c.accent.replace("ring-", "bg-").split(" ")[0],
                  )}
                >
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold leading-tight">
                    {c.label}
                  </p>
                  <p className="mt-1 text-xs font-medium text-violet-500">
                    {c.tagline}
                  </p>
                  <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                    {c.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover/cat:translate-x-0.5 group-hover/cat:text-violet-500" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Step 2: pick a product in the chosen category ───────────────────────

function ProductStep({
  category,
  expandedId,
  setExpandedId,
  onChoose,
}: {
  category: Category;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onChoose: (p: Product) => void;
}) {
  return (
    <div className="flex max-h-[calc(92dvh-9rem)] flex-col overflow-y-auto">
      <p className="px-5 pt-5 text-sm text-muted-foreground">
        {category.description} Tap any product to expand the details, then
        choose to continue your application.
      </p>
      <ul className="space-y-2.5 px-5 pb-6 pt-4">
        {category.products.map((p) => {
          const expanded = expandedId === p.title;
          const Icon = p.icon;
          return (
            <li key={p.title}>
              <div
                className={cn(
                  "rounded-2xl border bg-card transition-all",
                  p.feature
                    ? "border-violet-500/40 bg-gradient-to-br from-violet-500/8 via-transparent to-transparent"
                    : "border-border",
                  expanded && "shadow-soft",
                )}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : p.title)}
                  className="flex w-full items-start gap-3 p-4 text-left"
                  aria-expanded={expanded}
                >
                  <span
                    className={cn(
                      "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                      p.feature
                        ? "bg-gradient-to-br from-violet-500 to-violet-700 text-white"
                        : "bg-muted text-foreground/80",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-base font-semibold leading-tight">
                        {p.title}
                      </p>
                      {p.feature && (
                        <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                          Most popular
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-violet-500">
                      {p.tagline}
                    </p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      Best for: {p.bestFor}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
                      expanded && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>

                {expanded && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    {/* Limits row */}
                    <dl className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {p.limits.map((l) => (
                        <div
                          key={l.label}
                          className="rounded-lg bg-muted/50 px-3 py-2"
                        >
                          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {l.label}
                          </dt>
                          <dd className="mt-0.5 font-mono text-sm font-semibold">
                            {l.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    {/* Features + Benefits + Limitations grid */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <PillarList
                        heading="Features"
                        items={p.features}
                        icon={<Check className="size-3.5 text-violet-500" />}
                      />
                      <PillarList
                        heading="Benefits"
                        items={p.benefits}
                        icon={<Sparkles className="size-3.5 text-gold-500" />}
                      />
                      <PillarList
                        heading="To consider"
                        items={p.limitations}
                        icon={
                          <AlertCircle className="size-3.5 text-muted-foreground" />
                        }
                      />
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        {p.applyAs
                          ? "Self-serve application · usually 3–5 minutes"
                          : "High-touch — a banker will reach out within one business day"}
                      </p>
                      <button
                        type="button"
                        onClick={() => onChoose(p)}
                        className={cn(
                          "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition active:scale-[0.98]",
                          p.applyAs
                            ? "bg-gold-500 text-navy-900 shadow-glow-gold hover:bg-gold-300"
                            : "bg-navy-900 text-white hover:bg-navy-700",
                        )}
                      >
                        {p.applyAs
                          ? `Open ${p.title}`
                          : `Request ${p.title}`}
                        <ArrowRight className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PillarList({
  heading,
  items,
  icon,
}: {
  heading: string;
  items: string[];
  icon: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {heading}
      </p>
      <ul className="space-y-1.5">
        {items.map((t) => (
          <li
            key={t}
            className="flex items-start gap-2 text-xs leading-snug text-foreground/85"
          >
            <span className="mt-0.5 shrink-0">{icon}</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
