// Pure document checklist data — safe to import from client or server.
// Keep file-system helpers out of this file (see lib/uploads.ts for those).

export type DocSpec = {
  kind: string;
  label: string;
  hint?: string;
  required: boolean;
};

/** Documents collected at signup (every Paxnova Trust customer). */
export const SIGNUP_DOCS: DocSpec[] = [
  {
    kind: "selfie",
    label: "Selfie / passport-style photograph",
    hint: "A clear head-and-shoulders photo of yourself. We compare this against your ID.",
    required: true,
  },
  {
    kind: "id-front",
    label: "Government-issued ID — front",
    hint: "Driver's license, state ID, passport bio page, or permanent-resident card.",
    required: true,
  },
  {
    kind: "id-back",
    label: "Government-issued ID — back (if applicable)",
    hint: "Required for driver's licenses and state IDs. Skip for passports.",
    required: false,
  },
];

/** Documents asked for on a Checking or Savings application. */
const DEPOSIT_DOCS: DocSpec[] = [
  {
    kind: "id-front",
    label: "Government-issued ID — front",
    required: true,
  },
  {
    kind: "id-back",
    label: "Government-issued ID — back (if applicable)",
    required: false,
  },
  {
    kind: "proof-of-address",
    label: "Proof of residential address",
    hint: "Utility bill, lease, or bank statement from the last 90 days showing your name and address.",
    required: false,
  },
];

const CREDIT_CARD_DOCS: DocSpec[] = [
  { kind: "id-front", label: "Government-issued ID — front", required: true },
  { kind: "id-back", label: "Government-issued ID — back", required: false },
  {
    kind: "proof-of-income",
    label: "Proof of income",
    hint: "Most recent pay stub, W-2, or 1099.",
    required: false,
  },
  {
    kind: "proof-of-address",
    label: "Proof of address",
    hint: "Utility bill or lease from the last 90 days.",
    required: false,
  },
];

const MORTGAGE_DOCS: DocSpec[] = [
  { kind: "id-front", label: "Government-issued ID — front", required: true },
  { kind: "id-back", label: "Government-issued ID — back", required: false },
  {
    kind: "tax-return-prior-1",
    label: "Federal tax return — prior year",
    hint: "1040 with all schedules.",
    required: false,
  },
  {
    kind: "tax-return-prior-2",
    label: "Federal tax return — two years ago",
    required: false,
  },
  {
    kind: "w2-prior-1",
    label: "W-2 — prior year",
    required: false,
  },
  {
    kind: "w2-prior-2",
    label: "W-2 — two years ago",
    required: false,
  },
  {
    kind: "pay-stubs",
    label: "Most recent 30 days of pay stubs",
    hint: "Combine into one PDF if possible.",
    required: false,
  },
  {
    kind: "bank-statements",
    label: "Bank statements — last 2 months",
    required: false,
  },
  {
    kind: "purchase-contract",
    label: "Signed purchase contract",
    hint: "Required if you've already made an offer.",
    required: false,
  },
  {
    kind: "homeowners-insurance",
    label: "Homeowners insurance quote / binder",
    required: false,
  },
];

/** Business documents that EVERY entity must provide. */
const BUSINESS_DOCS_COMMON: DocSpec[] = [
  {
    kind: "ein-letter",
    label: "IRS EIN confirmation (CP-575 or 147C)",
    hint: "The letter the IRS sent when you applied for your EIN.",
    required: true,
  },
  {
    kind: "control-person-id",
    label: "Control person — government-issued ID",
    hint: "ID of the individual with significant managerial authority (CEO, Managing Member, etc.).",
    required: true,
  },
  {
    kind: "business-license",
    label: "Business license / permit (if applicable)",
    hint: "City or state operating license, professional license, sales tax permit.",
    required: false,
  },
  {
    kind: "proof-of-address-business",
    label: "Proof of business address",
    hint: "Lease agreement or recent utility bill at the business address.",
    required: false,
  },
];

function beneficialOwnerSpec(): DocSpec {
  return {
    kind: "beneficial-owner-ids",
    label: "Government ID for each beneficial owner (≥25% ownership)",
    hint: "Combine the IDs of all listed beneficial owners into one PDF, or upload as separate files.",
    required: false,
  };
}

/** Per-entity-type extra documents. */
export function businessDocsForEntity(entityType: string | undefined): DocSpec[] {
  const common = BUSINESS_DOCS_COMMON.slice();
  switch (entityType) {
    case "llc-single":
    case "llc-multi":
      return [
        ...common,
        {
          kind: "articles-of-organization",
          label: "Articles of Organization",
          hint: "Stamped/filed copy from your Secretary of State.",
          required: true,
        },
        {
          kind: "operating-agreement",
          label: "Operating Agreement",
          required: false,
        },
        {
          kind: "good-standing",
          label: "Certificate of Good Standing (if available)",
          required: false,
        },
        beneficialOwnerSpec(),
      ];
    case "c-corp":
    case "s-corp":
      return [
        ...common,
        {
          kind: "articles-of-incorporation",
          label: "Articles of Incorporation",
          hint: "Stamped/filed copy from your Secretary of State.",
          required: true,
        },
        {
          kind: "bylaws",
          label: "Corporate Bylaws",
          required: false,
        },
        {
          kind: "corporate-resolution",
          label: "Corporate Resolution authorizing this account",
          hint: "Board resolution naming the signers on the account.",
          required: false,
        },
        beneficialOwnerSpec(),
      ];
    case "partnership":
      return [
        ...common,
        {
          kind: "partnership-agreement",
          label: "Partnership Agreement",
          required: true,
        },
        {
          kind: "certificate-lp-llp",
          label: "Certificate of LP / LLP (if applicable)",
          required: false,
        },
        beneficialOwnerSpec(),
      ];
    case "sole-prop":
      return [
        ...common,
        {
          kind: "dba-filing",
          label: "DBA / Fictitious Business Name filing",
          hint: "If operating under a name other than your legal name.",
          required: false,
        },
      ];
    case "nonprofit":
      return [
        ...common,
        {
          kind: "articles-of-incorporation",
          label: "Articles of Incorporation",
          required: true,
        },
        {
          kind: "501c-determination",
          label: "IRS 501(c) determination letter",
          required: true,
        },
        {
          kind: "bylaws",
          label: "Bylaws",
          required: false,
        },
      ];
    case "trust":
      return [
        ...common,
        {
          kind: "trust-agreement",
          label: "Trust Agreement (full or Certificate of Trust)",
          required: true,
        },
        {
          kind: "trustee-id",
          label: "Trustee's government-issued ID",
          required: true,
        },
      ];
    default:
      return common;
  }
}

export function docsForProduct(
  product: string,
  entityType?: string
): DocSpec[] {
  switch (product) {
    case "checking":
    case "savings":
      return DEPOSIT_DOCS;
    case "credit-card":
      return CREDIT_CARD_DOCS;
    case "mortgage":
      return MORTGAGE_DOCS;
    case "business":
      return businessDocsForEntity(entityType);
    default:
      return DEPOSIT_DOCS;
  }
}

export function humanizeDocKind(kind: string): string {
  return kind
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
    .replace(/\bId\b/g, "ID")
    .replace(/\bEin\b/g, "EIN")
    .replace(/\bW2\b/g, "W-2")
    .replace(/\b501c\b/g, "501(c)")
    .replace(/Prior 1/, "(prior year)")
    .replace(/Prior 2/, "(2 years ago)");
}
