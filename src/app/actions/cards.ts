"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  accounts,
  cardApplications,
  cards,
  users,
} from "@/db/schema";
import { getCurrentUser, requireAdmin, requireAuth } from "@/lib/auth";
import {
  generateAccountNumber,
  generateReferenceNumber,
  hashPassword,
  verifyPassword,
} from "@/lib/password";
import { getCardProduct } from "@/lib/card-products";
import { encrypt, safeDecrypt } from "@/lib/crypto";
import { audit } from "@/lib/audit";

export type CardActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  referenceNumber?: string;
  applicationId?: number;
};

function flatten(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const p = i.path[0]?.toString();
    if (p && !out[p]) out[p] = i.message;
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────
// PAN / CVV generation
// ──────────────────────────────────────────────────────────────────────

function luhnCheckDigit(prefix: string): string {
  // Standard Luhn: double every second digit from the right (excluding the
  // not-yet-attached check digit), subtract 9 if > 9, sum, then 10 - (sum %
  // 10) gives the check digit.
  const digits = prefix.split("").map((d) => Number.parseInt(d, 10));
  let sum = 0;
  let isDouble = digits.length % 2 === 0; // for a future appended check digit
  for (let i = 0; i < digits.length; i++) {
    let n = digits[i];
    if (isDouble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    isDouble = !isDouble;
  }
  return String((10 - (sum % 10)) % 10);
}

function randomDigit(): string {
  return String(Math.floor(Math.random() * 10));
}

function generatePan(network: "visa" | "mastercard" | "amex"): string {
  // 16 digits across networks; Amex IRL is 15 but we keep 16 for visual
  // consistency in this demo.
  let prefix: string;
  if (network === "visa") {
    prefix = "4";
  } else if (network === "mastercard") {
    // 51–55 is the classic Mastercard range.
    prefix = "5" + String(1 + Math.floor(Math.random() * 5));
  } else {
    prefix = Math.random() < 0.5 ? "34" : "37";
  }
  const body = Array.from({ length: 16 - prefix.length - 1 }, randomDigit).join("");
  const partial = prefix + body;
  return partial + luhnCheckDigit(partial);
}

function generateCvv(network: "visa" | "mastercard" | "amex"): string {
  const len = network === "amex" ? 4 : 3;
  return Array.from({ length: len }, randomDigit).join("");
}

// ──────────────────────────────────────────────────────────────────────
// Apply for a card (user)
// ──────────────────────────────────────────────────────────────────────

const applySchema = z.object({
  productKey: z.string().refine((k) => Boolean(getCardProduct(k)), "Pick a card product"),
  requestedLimit: z.coerce.number().int().positive(),
  dailyLimit: z.coerce.number().int().positive(),
  txnLimit: z.coerce.number().int().positive(),
  cardHolder: z.string().trim().min(2, "Required").max(60),
  billingStreet: z.string().trim().min(2, "Required").max(160),
  billingCity: z.string().trim().min(1, "Required").max(80),
  billingState: z.string().trim().min(2, "Required").max(40),
  billingZip: z.string().trim().min(3, "Required").max(20),
  billingCountry: z.string().trim().min(2).max(2).default("US"),
  employmentStatus: z.string().trim().max(40).optional().or(z.literal("")),
  employerName: z.string().trim().max(120).optional().or(z.literal("")),
  annualIncome: z.string().trim().max(40).optional().or(z.literal("")),
  pin: z.string().regex(/^\d{4}$/, "Enter a 4-digit PIN"),
  pinConfirm: z.string(),
  theme: z.enum(["obsidian", "aurora", "sand", "crimson"]),
});

export async function applyForCardAction(
  _prev: CardActionState,
  formData: FormData
): Promise<CardActionState> {
  const user = await requireAuth();
  const raw: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string") raw[k] = v;
  const parsed = applySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flatten(parsed.error),
    };
  }
  const d = parsed.data;
  if (d.pin !== d.pinConfirm) {
    return { ok: false, fieldErrors: { pinConfirm: "PINs don't match" } };
  }

  const product = getCardProduct(d.productKey);
  if (!product) return { ok: false, message: "Unknown card product." };
  if (d.requestedLimit < product.limitMin || d.requestedLimit > product.limitMax) {
    return {
      ok: false,
      fieldErrors: {
        requestedLimit: `Limit must be between $${product.limitMin.toLocaleString()} and $${product.limitMax.toLocaleString()}.`,
      },
    };
  }

  const pinHash = await hashPassword(d.pin);
  const reference = `CC-${generateReferenceNumber().replace(/^NT-/, "")}`;

  const [row] = db
    .insert(cardApplications)
    .values({
      userId: user.id,
      productKey: d.productKey,
      requestedLimit: d.requestedLimit,
      dailyLimit: d.dailyLimit,
      txnLimit: d.txnLimit,
      cardHolder: d.cardHolder,
      billingStreet: d.billingStreet,
      billingCity: d.billingCity,
      billingState: d.billingState,
      billingZip: d.billingZip,
      billingCountry: d.billingCountry,
      employmentStatus: d.employmentStatus || null,
      employerName: d.employerName || null,
      annualIncome: d.annualIncome || null,
      pinHash,
      theme: d.theme,
      status: "pending",
      referenceNumber: reference,
    })
    .returning()
    .all();

  revalidatePath("/admin/cards/applications");
  revalidatePath("/dashboard/cards");
  return {
    ok: true,
    referenceNumber: reference,
    applicationId: row.id,
    message: "Application submitted.",
  };
}

// ──────────────────────────────────────────────────────────────────────
// Admin: approve / reject
// ──────────────────────────────────────────────────────────────────────

export async function approveCardApplicationAction(
  applicationId: number,
  overrideLimit?: number
): Promise<CardActionState> {
  const admin = await requireAdmin();
  const app = db
    .select()
    .from(cardApplications)
    .where(eq(cardApplications.id, applicationId))
    .get();
  if (!app) return { ok: false, message: "Application not found." };
  if (app.status !== "pending") {
    return { ok: false, message: `Application is already ${app.status}.` };
  }

  const product = getCardProduct(app.productKey);
  if (!product) return { ok: false, message: "Unknown card product." };

  const approvedLimit =
    typeof overrideLimit === "number" && overrideLimit > 0
      ? overrideLimit
      : app.requestedLimit;
  if (
    approvedLimit < product.limitMin ||
    approvedLimit > product.limitMax
  ) {
    return {
      ok: false,
      message: `Limit must be between $${product.limitMin.toLocaleString()} and $${product.limitMax.toLocaleString()}.`,
    };
  }

  const pan = generatePan(product.network);
  const cvv = generateCvv(product.network);
  const lastFour = pan.slice(-4);
  const today = new Date();
  const expiryMonth = today.getMonth() + 1;
  const expiryYear = today.getFullYear() + 4;
  const panHash = await hashPassword(pan);
  const cvvHash = await hashPassword(cvv);

  db.transaction(() => {
    // Open the credit account that backs the new card.
    const [account] = db
      .insert(accounts)
      .values({
        userId: app.userId,
        type: "credit",
        name: product.name,
        accountNumber: generateAccountNumber(),
        balance: 0,
        creditLimit: approvedLimit,
        apy: null,
        currency: "USD",
        status: "active",
      })
      .returning()
      .all();

    db.insert(cards)
      .values({
        accountId: account.id,
        userId: app.userId,
        brand: product.network,
        cardType: "credit",
        network: product.network,
        tier: product.tier,
        apr: product.apr,
        annualFee: product.annualFee,
        theme: app.theme,
        lastFour,
        cardHolder: app.cardHolder,
        expiryMonth,
        expiryYear,
        frozen: false,
        spendLimit: approvedLimit,
        dailyLimit: app.dailyLimit,
        txnLimit: app.txnLimit,
        billingStreet: app.billingStreet,
        billingCity: app.billingCity,
        billingState: app.billingState,
        billingZip: app.billingZip,
        billingCountry: app.billingCountry,
        panHash,
        cvvHash,
        pinHash: app.pinHash,
        // PAN + CVV are encrypted at rest with AES-256-GCM. Plaintext is
        // recovered only inside revealCardDetailsAction by the cardholder
        // or an admin — never returned by routine selects.
        panPlain: encrypt(pan),
        cvvPlain: encrypt(cvv),
        status: "active",
      })
      .run();

    db.update(cardApplications)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: admin.id,
        rejectionReason: null,
      })
      .where(eq(cardApplications.id, applicationId))
      .run();
  });

  revalidatePath("/admin/cards/applications");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/cards");
  return { ok: true, message: "Card issued." };
}

export async function rejectCardApplicationAction(
  applicationId: number,
  reason: string
): Promise<CardActionState> {
  const admin = await requireAdmin();
  const trimmed = (reason ?? "").trim();
  if (trimmed.length < 4) {
    return { ok: false, message: "Provide a reason (at least 4 characters)." };
  }
  const app = db
    .select()
    .from(cardApplications)
    .where(eq(cardApplications.id, applicationId))
    .get();
  if (!app) return { ok: false, message: "Application not found." };
  if (app.status !== "pending") {
    return { ok: false, message: `Application is already ${app.status}.` };
  }
  db.update(cardApplications)
    .set({
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      rejectionReason: trimmed.slice(0, 400),
    })
    .where(eq(cardApplications.id, applicationId))
    .run();
  revalidatePath("/admin/cards/applications");
  return { ok: true, message: "Application rejected." };
}

// ──────────────────────────────────────────────────────────────────────
// Owner: reveal full PAN / CVV / expiry / PIN
// ──────────────────────────────────────────────────────────────────────

export type RevealedCard = {
  pan: string;
  cvv: string;
  expiryMonth: number;
  expiryYear: number;
  cardHolder: string;
};

export async function revealCardDetailsAction(
  cardId: number
): Promise<{ ok: true; card: RevealedCard } | { ok: false; message: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Not authenticated." };
  const card = db.select().from(cards).where(eq(cards.id, cardId)).get();
  if (!card) return { ok: false, message: "Card not found." };
  if (card.userId !== user.id && user.role !== "admin") {
    await audit("card.reveal", {
      userId: user.id,
      outcome: "blocked",
      metadata: { cardId, reason: "not_owner" },
    });
    return { ok: false, message: "Not allowed." };
  }
  if (!card.panPlain || !card.cvvPlain) {
    return { ok: false, message: "This card was issued before full reveal was supported." };
  }

  let pan: string;
  let cvv: string;
  try {
    // safeDecrypt accepts both v1-encrypted payloads and legacy plaintext rows
    // so cards issued before the encryption migration still reveal cleanly.
    pan = safeDecrypt(card.panPlain) ?? "";
    cvv = safeDecrypt(card.cvvPlain) ?? "";
  } catch (err) {
    console.error("[cards] decrypt failed", err);
    await audit("card.reveal", {
      userId: user.id,
      outcome: "failure",
      metadata: { cardId, reason: "decrypt_failed" },
    });
    return { ok: false, message: "Unable to reveal card details — please contact support." };
  }

  await audit("card.reveal", {
    userId: user.id,
    outcome: "success",
    metadata: { cardId, byAdmin: user.role === "admin" && card.userId !== user.id },
  });

  return {
    ok: true,
    card: {
      pan,
      cvv,
      expiryMonth: card.expiryMonth,
      expiryYear: card.expiryYear,
      cardHolder: card.cardHolder,
    },
  };
}

// ──────────────────────────────────────────────────────────────────────
// Owner: freeze + limits
// ──────────────────────────────────────────────────────────────────────

export async function setCardFrozenAction(
  cardId: number,
  frozen: boolean
): Promise<CardActionState> {
  const user = await requireAuth();
  const card = db.select().from(cards).where(eq(cards.id, cardId)).get();
  if (!card) return { ok: false, message: "Card not found." };
  if (card.userId !== user.id && user.role !== "admin") {
    return { ok: false, message: "Not allowed." };
  }
  db.update(cards)
    .set({ frozen, status: frozen ? "frozen" : "active" })
    .where(eq(cards.id, cardId))
    .run();
  revalidatePath("/dashboard/cards");
  return { ok: true, message: frozen ? "Card frozen." : "Card un-frozen." };
}

const limitsSchema = z.object({
  cardId: z.coerce.number().int().positive(),
  dailyLimit: z.coerce.number().positive(),
  txnLimit: z.coerce.number().positive(),
});

export async function updateCardLimitsAction(
  _prev: CardActionState,
  formData: FormData
): Promise<CardActionState> {
  const user = await requireAuth();
  const parsed = limitsSchema.safeParse({
    cardId: formData.get("cardId"),
    dailyLimit: formData.get("dailyLimit"),
    txnLimit: formData.get("txnLimit"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  const card = db.select().from(cards).where(eq(cards.id, parsed.data.cardId)).get();
  if (!card) return { ok: false, message: "Card not found." };
  if (card.userId !== user.id && user.role !== "admin") {
    return { ok: false, message: "Not allowed." };
  }
  if (card.spendLimit != null && parsed.data.dailyLimit > card.spendLimit) {
    return {
      ok: false,
      fieldErrors: { dailyLimit: "Daily limit can't exceed the credit limit." },
    };
  }
  db.update(cards)
    .set({
      dailyLimit: parsed.data.dailyLimit,
      txnLimit: parsed.data.txnLimit,
    })
    .where(eq(cards.id, parsed.data.cardId))
    .run();
  revalidatePath("/dashboard/cards");
  return { ok: true, message: "Limits updated." };
}

// PIN verifier — used by future tests. Not currently called from the UI.
export async function verifyCardPin(cardId: number, pin: string): Promise<boolean> {
  const card = db.select().from(cards).where(eq(cards.id, cardId)).get();
  if (!card?.pinHash) return false;
  return verifyPassword(pin, card.pinHash);
}
