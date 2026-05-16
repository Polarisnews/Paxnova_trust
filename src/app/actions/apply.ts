"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { applications, documents, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import {
  generateReferenceNumber,
  hashPassword,
} from "@/lib/password";
import { getSession } from "@/lib/session";
import { digitsOnly, PHONE_RE, SSN_RE, ZIP_RE, isAdult } from "@/lib/kyc";
import { docsForProduct } from "@/lib/doc-specs";
import { saveUpload } from "@/lib/uploads";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

export type ApplyState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const VALID_PRODUCTS = [
  "checking",
  "savings",
  "credit-card",
  "mortgage",
  "business",
] as const;

// ---- Shared CIP / KYC schema (for guests opening their first account) ----
const kycSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  middleName: z.string().trim().max(60).optional().or(z.literal("")),
  lastName: z.string().trim().min(1, "Required").max(60),
  suffix: z.string().trim().max(10).optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker")
    .refine((d) => isAdult(d), "You must be at least 18"),
  ssn: z
    .string()
    .transform((s) => digitsOnly(s))
    .refine((d) => SSN_RE.test(d), "Enter a valid 9-digit SSN"),
  citizenshipStatus: z.enum([
    "us-citizen",
    "permanent-resident",
    "non-resident-alien",
  ]),
  countryOfCitizenship: z.string().trim().max(2).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .transform((s) => digitsOnly(s))
    .refine((d) => PHONE_RE.test(d), "Enter a valid U.S. phone"),
  streetAddress: z.string().trim().min(3, "Required").max(120),
  addressLine2: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Required").max(60),
  stateRegion: z.string().trim().length(2, "Select a state"),
  postalCode: z.string().trim().regex(ZIP_RE, "Enter a valid ZIP"),
  employmentStatus: z.enum([
    "employed",
    "self-employed",
    "retired",
    "student",
    "unemployed",
    "homemaker",
  ]),
  occupation: z.string().trim().max(80).optional().or(z.literal("")),
  employerName: z.string().trim().max(120).optional().or(z.literal("")),
  annualIncome: z.string().min(1, "Required"),
  sourceOfFunds: z.string().min(1, "Required"),
});

// ---- Product-specific subschemas ----------------------------------------

const fundingSchema = z.object({
  fundingAmount: z.coerce.number().min(0).max(1_000_000).optional(),
  fundingSource: z.string().max(80).optional().or(z.literal("")),
  jointApplicant: z.string().trim().max(120).optional().or(z.literal("")),
});

const creditCardSchema = z.object({
  requestedCreditLimit: z.coerce.number().min(500).max(100_000),
  monthlyHousingPayment: z.coerce.number().min(0).max(50_000),
  housingStatus: z.enum(["own", "rent", "live-with-family", "other"]),
  totalAssets: z.coerce.number().min(0).optional(),
  authorizedUserName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .or(z.literal("")),
});

const mortgageSchema = z.object({
  loanPurpose: z.enum(["purchase", "refinance", "cash-out", "construction"]),
  propertyUse: z.enum(["primary", "secondary", "investment"]),
  propertyType: z.enum([
    "single-family",
    "condo",
    "townhouse",
    "multi-family",
    "manufactured",
  ]),
  propertyAddress: z.string().trim().min(3, "Required").max(160),
  propertyCity: z.string().trim().min(1, "Required").max(60),
  propertyState: z.string().trim().length(2, "Required"),
  propertyZip: z.string().trim().regex(ZIP_RE, "Enter a valid ZIP"),
  purchasePrice: z.coerce.number().min(10_000).max(50_000_000),
  loanAmount: z.coerce.number().min(10_000).max(50_000_000),
  downPayment: z.coerce.number().min(0).max(50_000_000),
  monthlyHousingPayment: z.coerce.number().min(0).max(50_000),
  totalAssets: z.coerce.number().min(0),
  totalLiabilities: z.coerce.number().min(0),
  hasCoBorrower: z.coerce.boolean().optional().default(false),
  coBorrowerName: z.string().trim().max(120).optional().or(z.literal("")),
  coBorrowerEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
});

const beneficialOwnerSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  ssn: z
    .string()
    .transform((s) => digitsOnly(s))
    .refine((d) => SSN_RE.test(d), "9 digits"),
  ownershipPct: z.coerce.number().min(25).max(100),
  address: z.string().trim().min(3, "Required").max(160),
  title: z.string().trim().max(60).optional().or(z.literal("")),
});

const businessSchema = z.object({
  legalName: z.string().trim().min(1, "Required").max(160),
  dba: z.string().trim().max(160).optional().or(z.literal("")),
  ein: z
    .string()
    .transform((s) => digitsOnly(s))
    .refine((d) => /^\d{9}$/.test(d), "EIN must be 9 digits"),
  entityType: z.enum([
    "sole-prop",
    "llc-single",
    "llc-multi",
    "c-corp",
    "s-corp",
    "partnership",
    "nonprofit",
    "trust",
  ]),
  stateOfFormation: z.string().trim().length(2, "Required"),
  dateOfFormation: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  industry: z.string().min(1, "Required"),
  naicsCode: z
    .string()
    .trim()
    .max(6)
    .optional()
    .or(z.literal("")),
  annualRevenue: z.string().min(1, "Required"),
  numEmployees: z.coerce.number().int().min(0).max(1_000_000),
  businessAddress: z.string().trim().min(3, "Required").max(160),
  businessCity: z.string().trim().min(1, "Required").max(60),
  businessState: z.string().trim().length(2, "Required"),
  businessZip: z.string().trim().regex(ZIP_RE, "Enter a valid ZIP"),
  businessPhone: z
    .string()
    .transform((s) => digitsOnly(s))
    .refine((d) => PHONE_RE.test(d), "Enter a valid phone"),
  businessWebsite: z.string().max(200).optional().or(z.literal("")),
  // Control prong (FinCEN CDD)
  controlPersonName: z.string().trim().min(1, "Required").max(120),
  controlPersonTitle: z.string().trim().min(1, "Required").max(60),
  controlPersonDob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Required"),
  controlPersonSsn: z
    .string()
    .transform((s) => digitsOnly(s))
    .refine((d) => SSN_RE.test(d), "9 digits"),
  // Beneficial owners (JSON-encoded — parse separately below)
  beneficialOwners: z.string(),
});

// Consent flags required at the end of every application.
const consentSchema = z.object({
  agreeTerms: z.literal("on", { message: "You must accept the Terms" }),
  agreeEsign: z.literal("on", {
    message: "You must consent to electronic disclosures",
  }),
  agreePatriot: z.literal("on", {
    message: "You must acknowledge the USA PATRIOT Act notice",
  }),
  authorizeCreditPull: z.literal("on", {
    message: "Authorization required to process this application",
  }),
});

function flattenErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".");
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}

export async function applyAction(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  // Strip File entries; zod schemas operate only on text fields.
  const raw: Record<string, FormDataEntryValue> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") raw[k] = v;
  }

  const productParse = z.enum(VALID_PRODUCTS).safeParse(raw.product);
  if (!productParse.success) {
    return { ok: false, message: "Pick a product to continue." };
  }
  const product = productParse.data;

  const currentUser = await getCurrentUser();

  // KYC: required for guests OR if a logged-in user is opening a new product
  // type that needs the data again (e.g. business / mortgage). To keep this
  // realistic but simple, we require KYC fields only when no user is signed
  // in. Otherwise we read from the existing user record.
  let kyc: z.infer<typeof kycSchema>;
  if (!currentUser) {
    const kycParse = kycSchema.safeParse(raw);
    if (!kycParse.success) {
      return {
        ok: false,
        message: "Please correct the highlighted fields.",
        fieldErrors: flattenErrors(kycParse.error),
      };
    }
    kyc = kycParse.data;
  } else {
    kyc = {
      firstName: currentUser.firstName,
      middleName: currentUser.middleName ?? "",
      lastName: currentUser.lastName,
      suffix: currentUser.suffix ?? "",
      dateOfBirth: currentUser.dateOfBirth ?? "1990-01-01",
      ssn: "000000000",
      citizenshipStatus:
        (currentUser.citizenshipStatus as
          | "us-citizen"
          | "permanent-resident"
          | "non-resident-alien"
          | null) ?? "us-citizen",
      countryOfCitizenship: currentUser.countryOfCitizenship ?? "",
      email: currentUser.email,
      phone: currentUser.phone ?? "",
      streetAddress: currentUser.streetAddress ?? "",
      addressLine2: currentUser.addressLine2 ?? "",
      city: currentUser.city ?? "",
      stateRegion: currentUser.stateRegion ?? "",
      postalCode: currentUser.postalCode ?? "",
      employmentStatus:
        (currentUser.employmentStatus as
          | "employed"
          | "self-employed"
          | "retired"
          | "student"
          | "unemployed"
          | "homemaker"
          | null) ?? "employed",
      occupation: currentUser.occupation ?? "",
      employerName: currentUser.employerName ?? "",
      annualIncome: currentUser.annualIncome ?? "",
      sourceOfFunds: currentUser.sourceOfFunds ?? "",
    };
  }

  // ---- Product-specific parsing -----------------------------------------
  let productData: Record<string, unknown> = {};

  if (product === "checking" || product === "savings") {
    const p = fundingSchema.safeParse(raw);
    if (!p.success) {
      return {
        ok: false,
        message: "Please correct the highlighted fields.",
        fieldErrors: flattenErrors(p.error),
      };
    }
    productData = p.data;
  } else if (product === "credit-card") {
    const p = creditCardSchema.safeParse(raw);
    if (!p.success) {
      return {
        ok: false,
        message: "Please correct the highlighted fields.",
        fieldErrors: flattenErrors(p.error),
      };
    }
    productData = p.data;
  } else if (product === "mortgage") {
    const p = mortgageSchema.safeParse(raw);
    if (!p.success) {
      return {
        ok: false,
        message: "Please correct the highlighted fields.",
        fieldErrors: flattenErrors(p.error),
      };
    }
    productData = p.data;
  } else if (product === "business") {
    const p = businessSchema.safeParse(raw);
    if (!p.success) {
      return {
        ok: false,
        message: "Please correct the highlighted fields.",
        fieldErrors: flattenErrors(p.error),
      };
    }
    let owners: unknown = [];
    try {
      owners = JSON.parse(p.data.beneficialOwners);
    } catch {
      return {
        ok: false,
        message: "Beneficial owner data was malformed.",
      };
    }
    const ownersParse = z
      .array(beneficialOwnerSchema)
      .max(4)
      .safeParse(owners);
    if (!ownersParse.success) {
      const errs: Record<string, string> = {};
      for (const i of ownersParse.error.issues) {
        const path = `bo.${i.path.join(".")}`;
        if (!errs[path]) errs[path] = i.message;
      }
      return {
        ok: false,
        message:
          "Each beneficial owner (≥25% ownership) must include name, DOB, SSN, address, and ownership %.",
        fieldErrors: errs,
      };
    }
    productData = { ...p.data, beneficialOwners: ownersParse.data };
  }

  const consent = consentSchema.safeParse(raw);
  if (!consent.success) {
    return {
      ok: false,
      message: "All required disclosures must be acknowledged.",
      fieldErrors: flattenErrors(consent.error),
    };
  }

  // Documents are optional at signup — any uploaded files still get
  // persisted below, but missing ones no longer block submission.
  const entityTypeForDocs = (productData as { entityType?: string }).entityType;
  const docSlots = docsForProduct(product, entityTypeForDocs);

  // ---- Guest: create user account so they can sign in --------------------
  // If we're already signed in, applicantUserId == currentUser.id and we
  // skip this whole block. Otherwise we treat this submission as a hybrid
  // "register + apply" and provision a user with the KYC the guest provided.
  let applicantUserId: number | null = currentUser?.id ?? null;
  if (!currentUser) {
    const passwordParse = passwordSchema.safeParse(raw.password);
    if (!passwordParse.success) {
      return {
        ok: false,
        message: "Set a password before submitting.",
        fieldErrors: { password: passwordParse.error.issues[0].message },
      };
    }

    const normalizedEmail = kyc.email.toLowerCase().trim();
    const existing = db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .get();
    if (existing) {
      return {
        ok: false,
        message:
          "An account with that email already exists. Please sign in and try again.",
        fieldErrors: { email: "Email already in use" },
      };
    }

    const passwordHash = await hashPassword(passwordParse.data);
    const ssnHash = await hashPassword(kyc.ssn);
    const now = new Date();

    const [created] = db
      .insert(users)
      .values({
        email: normalizedEmail,
        passwordHash,
        firstName: kyc.firstName,
        middleName: kyc.middleName || null,
        lastName: kyc.lastName,
        suffix: kyc.suffix || null,
        phone: kyc.phone,
        dateOfBirth: kyc.dateOfBirth,
        ssnLast4: kyc.ssn.slice(-4),
        ssnHash,
        citizenshipStatus: kyc.citizenshipStatus,
        countryOfCitizenship: kyc.countryOfCitizenship || "US",
        streetAddress: kyc.streetAddress,
        addressLine2: kyc.addressLine2 || null,
        city: kyc.city,
        stateRegion: kyc.stateRegion,
        postalCode: kyc.postalCode,
        country: "US",
        employmentStatus: kyc.employmentStatus,
        occupation: kyc.occupation || null,
        employerName: kyc.employerName || null,
        annualIncome: kyc.annualIncome,
        sourceOfFunds: kyc.sourceOfFunds,
        agreedTermsAt: now,
        agreedEsignAt: now,
        agreedPatriotNoticeAt: now,
        kycStatus: "pending",
        role: "user",
      })
      .returning()
      .all();

    applicantUserId = created.id;

    const session = await getSession();
    session.userId = created.id;
    session.email = created.email;
    session.role = created.role;
    session.firstName = created.firstName;
    await session.save();
  }

  const reference = generateReferenceNumber();
  const applicantName = `${kyc.firstName}${
    kyc.middleName ? " " + kyc.middleName : ""
  } ${kyc.lastName}${kyc.suffix ? " " + kyc.suffix : ""}`.trim();

  // Build the merged JSON payload for the admin to review.
  const dataPayload = {
    kyc: {
      ...kyc,
      ssn: undefined, // never persist full SSN to JSON
      ssnLast4: kyc.ssn.slice(-4),
    },
    product: productData,
    consent: {
      termsAt: new Date().toISOString(),
      esignAt: new Date().toISOString(),
      patriotAt: new Date().toISOString(),
      creditPullAt: new Date().toISOString(),
    },
  };

  const fundingAmount =
    (productData as { fundingAmount?: number }).fundingAmount ??
    (productData as { downPayment?: number }).downPayment ??
    undefined;
  const fundingSource =
    (productData as { fundingSource?: string }).fundingSource ?? undefined;

  const [inserted] = db
    .insert(applications)
    .values({
      userId: applicantUserId,
      product,
      applicantName,
      applicantEmail: kyc.email.toLowerCase(),
      applicantPhone: kyc.phone,
      fundingAmount,
      fundingSource,
      notes: (raw.notes as string | undefined)?.toString().slice(0, 500),
      referenceNumber: reference,
      status: "pending",
      data: JSON.stringify(dataPayload),
    })
    .returning()
    .all();

  // Persist uploaded supporting documents. Failures are logged but never
  // block the application — a missing recommended doc is something the
  // admin can request after the fact.
  for (const slot of docSlots) {
    const f = formData.get(`doc:${slot.kind}`);
    if (!(f instanceof File) || f.size === 0) continue;
    try {
      const saved = await saveUpload(
        "applications",
        inserted.id,
        slot.kind,
        f
      );
      db.insert(documents)
        .values({
          applicationId: inserted.id,
          kind: slot.kind,
          originalName: saved.originalName,
          mimeType: saved.mimeType,
          size: saved.size,
          storagePath: saved.storagePath,
        })
        .run();
    } catch (err) {
      console.error(`[apply] failed to save ${slot.kind}:`, err);
    }
  }

  revalidatePath("/admin/applications");
  redirect(`/apply/success?ref=${encodeURIComponent(reference)}`);
}
