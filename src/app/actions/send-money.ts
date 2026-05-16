"use server";

import { z } from "zod";
import { db } from "@/db";
import { payees } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type SendMoneyActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  payeeId?: number;
};

function flatten(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const p = i.path[0]?.toString();
    if (p && !out[p]) out[p] = i.message;
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────
// Add a Zelle contact
// ────────────────────────────────────────────────────────────────────────

const zelleContactSchema = z
  .object({
    name: z.string().trim().min(1, "Required").max(120),
    nickname: z.string().trim().max(60).optional().or(z.literal("")),
    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .min(10, "Enter at least 10 digits")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (d) => Boolean(d.email && d.email.length) || Boolean(d.phone && d.phone.length),
    {
      message: "Add an email or phone for this contact",
      path: ["email"],
    }
  );

export async function addZelleContactAction(
  formData: FormData
): Promise<SendMoneyActionState> {
  const user = await requireAuth();
  const parsed = zelleContactSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  const d = parsed.data;
  const zelleId = (d.email || d.phone || "").toLowerCase();

  const [row] = db
    .insert(payees)
    .values({
      userId: user.id,
      name: d.name,
      nickname: d.nickname || null,
      accountNumber: zelleId,
      category: "Person",
      payeeType: "person",
      email: d.email || null,
      phone: d.phone || null,
      preferredMethod: "zelle",
    })
    .returning()
    .all();

  return { ok: true, payeeId: row.id, message: `${d.name} added.` };
}

// ────────────────────────────────────────────────────────────────────────
// Add an External Bank recipient (ACH transfer)
// ────────────────────────────────────────────────────────────────────────

const externalBankSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  nickname: z.string().trim().max(60).optional().or(z.literal("")),
  bankName: z.string().trim().min(2, "Required").max(120),
  routingNumber: z
    .string()
    .trim()
    .regex(/^\d{9}$/, "Routing number must be 9 digits"),
  accountNumber: z
    .string()
    .trim()
    .min(4, "Account number is too short")
    .max(20, "Account number is too long")
    .regex(/^[0-9A-Za-z]+$/, "Letters and numbers only"),
  accountType: z.enum(["checking", "savings"]),
});

export async function addExternalBankAction(
  formData: FormData
): Promise<SendMoneyActionState> {
  const user = await requireAuth();
  const parsed = externalBankSchema.safeParse({
    name: formData.get("name"),
    nickname: formData.get("nickname") || undefined,
    bankName: formData.get("bankName"),
    routingNumber: formData.get("routingNumber"),
    accountNumber: formData.get("accountNumber"),
    accountType: formData.get("accountType"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  const d = parsed.data;

  const [row] = db
    .insert(payees)
    .values({
      userId: user.id,
      name: d.name,
      nickname: d.nickname || null,
      accountNumber: d.accountNumber,
      category: "External bank",
      payeeType: "external-bank",
      bankName: d.bankName,
      routingNumber: d.routingNumber,
      accountType: d.accountType,
      preferredMethod: "ach",
    })
    .returning()
    .all();

  return { ok: true, payeeId: row.id, message: `${d.name} added.` };
}
