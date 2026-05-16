// Shared option lists + validation helpers used by signup, /apply, and admin
// review screens. Values are stable identifiers; labels are display strings.

export const US_STATES: { value: string; label: string }[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "PR", label: "Puerto Rico" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export const CITIZENSHIP = [
  { value: "us-citizen", label: "U.S. citizen" },
  { value: "permanent-resident", label: "U.S. permanent resident (Green Card)" },
  { value: "non-resident-alien", label: "Non-resident alien" },
] as const;

export const PHONE_TYPES = [
  { value: "mobile", label: "Mobile" },
  { value: "home", label: "Home" },
  { value: "work", label: "Work" },
] as const;

export const HOUSING_STATUS = [
  { value: "own", label: "I own my home" },
  { value: "rent", label: "I rent" },
  { value: "live-with-family", label: "Live with family / friends" },
  { value: "other", label: "Other" },
] as const;

export const ID_TYPES = [
  { value: "drivers-license", label: "U.S. driver's license" },
  { value: "state-id", label: "U.S. state-issued ID" },
  { value: "passport", label: "Passport" },
  { value: "permanent-resident-card", label: "Permanent resident card" },
  { value: "military-id", label: "U.S. military ID" },
] as const;

export const EMPLOYMENT_STATUS = [
  { value: "employed", label: "Employed" },
  { value: "self-employed", label: "Self-employed" },
  { value: "retired", label: "Retired" },
  { value: "student", label: "Student" },
  { value: "homemaker", label: "Homemaker" },
  { value: "unemployed", label: "Not currently employed" },
] as const;

export const ANNUAL_INCOME = [
  { value: "under-25k", label: "Under $25,000" },
  { value: "25k-50k", label: "$25,000 – $50,000" },
  { value: "50k-75k", label: "$50,000 – $75,000" },
  { value: "75k-100k", label: "$75,000 – $100,000" },
  { value: "100k-150k", label: "$100,000 – $150,000" },
  { value: "150k-250k", label: "$150,000 – $250,000" },
  { value: "250k-500k", label: "$250,000 – $500,000" },
  { value: "over-500k", label: "$500,000+" },
] as const;

export const SOURCE_OF_FUNDS = [
  { value: "employment", label: "Employment income / salary" },
  { value: "business", label: "Business income" },
  { value: "investments", label: "Investment income" },
  { value: "savings", label: "Personal savings" },
  { value: "inheritance", label: "Inheritance / gift" },
  { value: "retirement", label: "Retirement / pension" },
  { value: "real-estate", label: "Real estate proceeds" },
  { value: "other", label: "Other" },
] as const;

export const INTENDED_USE = [
  { value: "daily-banking", label: "Everyday banking" },
  { value: "saving", label: "Saving toward a goal" },
  { value: "bill-pay", label: "Paying bills" },
  { value: "payroll", label: "Receiving payroll" },
  { value: "investing", label: "Investing" },
  { value: "business-ops", label: "Business operations" },
  { value: "international", label: "International transfers" },
  { value: "other", label: "Other" },
] as const;

export const EXPECTED_MONTHLY_DEPOSITS = [
  { value: "under-2k", label: "Under $2,000" },
  { value: "2k-10k", label: "$2,000 – $10,000" },
  { value: "10k-25k", label: "$10,000 – $25,000" },
  { value: "25k-50k", label: "$25,000 – $50,000" },
  { value: "over-50k", label: "More than $50,000" },
] as const;

export const MARITAL_STATUS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "domestic-partner", label: "Domestic partner" },
  { value: "separated", label: "Separated" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
] as const;

export const FUNDING_SOURCES = [
  { value: "external-bank", label: "External bank account (ACH)" },
  { value: "wire", label: "Wire transfer" },
  { value: "direct-deposit", label: "Direct deposit" },
  { value: "check", label: "Mobile check deposit" },
  { value: "card", label: "Debit card" },
  { value: "fund-later", label: "I'll fund later" },
] as const;

export const BUSINESS_ENTITY_TYPES = [
  { value: "sole-prop", label: "Sole proprietorship" },
  { value: "llc-single", label: "LLC — single-member" },
  { value: "llc-multi", label: "LLC — multi-member" },
  { value: "c-corp", label: "Corporation — C-Corp" },
  { value: "s-corp", label: "Corporation — S-Corp" },
  { value: "partnership", label: "Partnership / LP / LLP" },
  { value: "nonprofit", label: "Non-profit (501(c))" },
  { value: "trust", label: "Trust / estate" },
] as const;

export const BUSINESS_INDUSTRIES = [
  { value: "tech", label: "Technology / SaaS" },
  { value: "professional-services", label: "Professional services" },
  { value: "retail", label: "Retail / e-commerce" },
  { value: "food-beverage", label: "Food & beverage / hospitality" },
  { value: "construction", label: "Construction / real estate" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance / insurance" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "transport", label: "Transportation / logistics" },
  { value: "education", label: "Education" },
  { value: "creative", label: "Creative / media" },
  { value: "nonprofit-industry", label: "Non-profit" },
  { value: "other-industry", label: "Other" },
] as const;

export const MORTGAGE_PROPERTY_USE = [
  { value: "primary", label: "Primary residence" },
  { value: "secondary", label: "Second / vacation home" },
  { value: "investment", label: "Investment / rental property" },
] as const;

export const MORTGAGE_PROPERTY_TYPE = [
  { value: "single-family", label: "Single-family home" },
  { value: "condo", label: "Condominium" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi-family", label: "2–4 unit multi-family" },
  { value: "manufactured", label: "Manufactured home" },
] as const;

export const MORTGAGE_LOAN_PURPOSE = [
  { value: "purchase", label: "Purchase" },
  { value: "refinance", label: "Refinance" },
  { value: "cash-out", label: "Cash-out refinance" },
  { value: "construction", label: "Construction" },
] as const;

// ---- Validation regex helpers ---------------------------------------------

// SSN: 9 digits, optionally hyphen-separated as 3-2-4. We strip non-digits.
export const SSN_RE = /^\d{9}$/;
// EIN: 9 digits, formatted XX-XXXXXXX or raw.
export const EIN_RE = /^\d{9}$/;
// US ZIP: 5 digits or ZIP+4
export const ZIP_RE = /^\d{5}(-?\d{4})?$/;
// US phone — accepts any input; we strip to digits, accept 10 or 11 (with leading 1)
export const PHONE_RE = /^1?\d{10}$/;

export function digitsOnly(s: string | null | undefined): string {
  return (s ?? "").replace(/\D/g, "");
}

export function formatPhone(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11);
  const ten = d.length === 11 && d.startsWith("1") ? d.slice(1) : d;
  if (ten.length === 0) return "";
  if (ten.length < 4) return `(${ten}`;
  if (ten.length < 7) return `(${ten.slice(0, 3)}) ${ten.slice(3)}`;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6, 10)}`;
}

export function formatSsn(raw: string): string {
  const d = digitsOnly(raw).slice(0, 9);
  if (d.length < 4) return d;
  if (d.length < 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

export function formatEin(raw: string): string {
  const d = digitsOnly(raw).slice(0, 9);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}-${d.slice(2)}`;
}

/**
 * Returns true if the applicant is at least 18 on the given dateOfBirth.
 * `dob` is ISO YYYY-MM-DD.
 */
export function isAdult(dob: string, today = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return false;
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const age =
    today.getUTCFullYear() -
    d.getUTCFullYear() -
    (today.getUTCMonth() < d.getUTCMonth() ||
    (today.getUTCMonth() === d.getUTCMonth() && today.getUTCDate() < d.getUTCDate())
      ? 1
      : 0);
  return age >= 18 && age < 120;
}
