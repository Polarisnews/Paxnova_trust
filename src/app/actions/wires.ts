"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  accounts,
  recipientGroups,
  scheduledWires,
  wireRecipients,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { generateReferenceNumber } from "@/lib/password";
import { sendMail } from "@/lib/mailer";
import { WIRE_FEE, DAILY_WIRE_LIMIT } from "@/lib/banking-constants";
import { currency } from "@/lib/format";

export type WireActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  recipientId?: number;
  referenceNumber?: string;
  groupId?: number;
};

async function requireUserId(): Promise<number> {
  const session = await getSession();
  if (!session.userId) throw new Error("Not authenticated");
  return session.userId;
}

const recipientSchema = z.object({
  bankCountry: z.string().trim().length(2, "Pick a country"),
  bankRoutingNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9]{8,11}$/,
      "Enter 8 to 11 characters (letters and numbers only)"
    ),
  bankName: z.string().trim().min(2, "Required").max(120),
  bankAddress: z.string().trim().max(160).optional().or(z.literal("")),
  bankCity: z.string().trim().max(80).optional().or(z.literal("")),
  bankState: z.string().trim().max(40).optional().or(z.literal("")),
  bankZip: z.string().trim().max(20).optional().or(z.literal("")),
  recipientName: z.string().trim().min(2, "Required").max(120),
  recipientNickname: z.string().trim().max(60).optional().or(z.literal("")),
  recipientCountry: z.string().trim().length(2, "Pick a country"),
  recipientAddress1: z.string().trim().max(160).optional().or(z.literal("")),
  recipientAddress2: z.string().trim().max(80).optional().or(z.literal("")),
  recipientCity: z.string().trim().max(80).optional().or(z.literal("")),
  recipientState: z.string().trim().max(40).optional().or(z.literal("")),
  recipientZip: z.string().trim().max(20).optional().or(z.literal("")),
  accountNumber: z
    .string()
    .trim()
    .min(4, "At least 4 characters")
    .max(15, "Up to 15 characters")
    .regex(/^[A-Za-z0-9]+$/, "Letters and numbers only"),
  messageToBank: z.string().trim().max(100).optional().or(z.literal("")),
  groupId: z.coerce.number().int().positive().optional(),
});

function flatten(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path[0]?.toString();
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}

export async function addWireRecipientAction(
  _prev: WireActionState,
  formData: FormData
): Promise<WireActionState> {
  const userId = await requireUserId();
  const raw: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") raw[k] = v;
  }
  const parsed = recipientSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const verify = (formData.get("verifyAccountNumber") as string) ?? "";
  if (verify && verify !== parsed.data.accountNumber) {
    return {
      ok: false,
      fieldErrors: { verifyAccountNumber: "Account numbers don't match" },
    };
  }

  const d = parsed.data;
  const [row] = db
    .insert(wireRecipients)
    .values({
      userId,
      bankCountry: d.bankCountry,
      bankRoutingNumber: d.bankRoutingNumber,
      bankName: d.bankName,
      bankAddress: d.bankAddress || null,
      bankCity: d.bankCity || null,
      bankState: d.bankState || null,
      bankZip: d.bankZip || null,
      recipientName: d.recipientName,
      recipientNickname: d.recipientNickname || null,
      recipientCountry: d.recipientCountry,
      recipientAddress1: d.recipientAddress1 || null,
      recipientAddress2: d.recipientAddress2 || null,
      recipientCity: d.recipientCity || null,
      recipientState: d.recipientState || null,
      recipientZip: d.recipientZip || null,
      accountNumber: d.accountNumber,
      messageToBank: d.messageToBank || null,
      groupId: d.groupId ?? null,
    })
    .returning()
    .all();

  return { ok: true, recipientId: row.id, message: "Recipient added." };
}

export async function updateWireRecipientAction(
  _prev: WireActionState,
  formData: FormData
): Promise<WireActionState> {
  const userId = await requireUserId();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return { ok: false, message: "Missing recipient id." };

  const raw: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") raw[k] = v;
  }
  const parsed = recipientSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flatten(parsed.error),
    };
  }
  const d = parsed.data;
  db.update(wireRecipients)
    .set({
      bankCountry: d.bankCountry,
      bankRoutingNumber: d.bankRoutingNumber,
      bankName: d.bankName,
      bankAddress: d.bankAddress || null,
      bankCity: d.bankCity || null,
      bankState: d.bankState || null,
      bankZip: d.bankZip || null,
      recipientName: d.recipientName,
      recipientNickname: d.recipientNickname || null,
      recipientCountry: d.recipientCountry,
      recipientAddress1: d.recipientAddress1 || null,
      recipientAddress2: d.recipientAddress2 || null,
      recipientCity: d.recipientCity || null,
      recipientState: d.recipientState || null,
      recipientZip: d.recipientZip || null,
      accountNumber: d.accountNumber,
      messageToBank: d.messageToBank || null,
      groupId: d.groupId ?? null,
    })
    .where(and(eq(wireRecipients.id, id), eq(wireRecipients.userId, userId)))
    .run();
  return { ok: true, recipientId: id, message: "Recipient updated." };
}

export async function deleteWireRecipientAction(
  _prev: WireActionState,
  formData: FormData
): Promise<WireActionState> {
  const userId = await requireUserId();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return { ok: false, message: "Missing recipient id." };
  db.delete(wireRecipients)
    .where(and(eq(wireRecipients.id, id), eq(wireRecipients.userId, userId)))
    .run();
  return { ok: true, message: "Recipient removed." };
}

const groupSchema = z.object({
  name: z.string().trim().min(2, "Required").max(60),
});

export async function createGroupAction(
  _prev: WireActionState,
  formData: FormData
): Promise<WireActionState> {
  const userId = await requireUserId();
  const parsed = groupSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  const [row] = db
    .insert(recipientGroups)
    .values({ userId, name: parsed.data.name })
    .returning()
    .all();

  // Optional: attach selected recipients to the new group in one shot.
  const memberIds = formData.getAll("memberIds").map((v) => Number(v)).filter(Boolean);
  for (const rid of memberIds) {
    db.update(wireRecipients)
      .set({ groupId: row.id })
      .where(and(eq(wireRecipients.id, rid), eq(wireRecipients.userId, userId)))
      .run();
  }

  return { ok: true, groupId: row.id, message: "Group created." };
}

export async function updateGroupAction(
  _prev: WireActionState,
  formData: FormData
): Promise<WireActionState> {
  const userId = await requireUserId();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return { ok: false, message: "Missing group id." };
  const parsed = groupSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, fieldErrors: flatten(parsed.error) };
  db.update(recipientGroups)
    .set({ name: parsed.data.name })
    .where(and(eq(recipientGroups.id, id), eq(recipientGroups.userId, userId)))
    .run();
  return { ok: true, groupId: id, message: "Group updated." };
}

export async function deleteGroupAction(
  _prev: WireActionState,
  formData: FormData
): Promise<WireActionState> {
  const userId = await requireUserId();
  const id = Number(formData.get("id") ?? 0);
  if (!id) return { ok: false, message: "Missing group id." };
  // Detach any recipients first so we don't orphan rows.
  db.update(wireRecipients)
    .set({ groupId: null })
    .where(
      and(eq(wireRecipients.groupId, id), eq(wireRecipients.userId, userId))
    )
    .run();
  db.delete(recipientGroups)
    .where(and(eq(recipientGroups.id, id), eq(recipientGroups.userId, userId)))
    .run();
  return { ok: true, message: "Group removed." };
}

// ──────────────────────────────────────────────────────────────────────────
// Schedule a wire
// ──────────────────────────────────────────────────────────────────────────

const scheduleSchema = z.object({
  recipientId: z.coerce.number().int().positive("Pick a recipient"),
  fromAccountId: z.coerce.number().int().positive("Pick an account"),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .max(DAILY_WIRE_LIMIT, `Daily wire limit is ${currency(DAILY_WIRE_LIMIT)}`),
  isRepeating: z.coerce.boolean().optional().default(false),
  repeatFrequency: z.enum(["weekly", "biweekly", "monthly"]).optional(),
  repeatUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick an end date")
    .optional()
    .or(z.literal("")),
  wireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a wire date"),
  messageToBank: z.string().trim().max(100).optional().or(z.literal("")),
  messageToRecipient: z.string().trim().max(140).optional().or(z.literal("")),
  memo: z.string().trim().max(100).optional().or(z.literal("")),
});

export async function scheduleWireAction(
  _prev: WireActionState,
  formData: FormData
): Promise<WireActionState> {
  const userId = await requireUserId();
  const raw: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") raw[k] = v;
  }
  const parsed = scheduleSchema.safeParse({
    ...raw,
    isRepeating: raw.isRepeating === "on" || raw.isRepeating === "true",
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flatten(parsed.error),
    };
  }

  const d = parsed.data;
  // Confirm the recipient and source account both belong to this user.
  const recipient = db
    .select()
    .from(wireRecipients)
    .where(
      and(eq(wireRecipients.id, d.recipientId), eq(wireRecipients.userId, userId))
    )
    .get();
  if (!recipient) {
    return { ok: false, message: "That recipient is no longer available." };
  }
  const fromAccount = db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, d.fromAccountId), eq(accounts.userId, userId)))
    .get();
  if (!fromAccount) {
    return { ok: false, message: "That source account is no longer available." };
  }
  const wireDate = new Date(`${d.wireDate}T12:00:00`);
  if (Number.isNaN(wireDate.getTime())) {
    return { ok: false, fieldErrors: { wireDate: "Pick a valid date" } };
  }
  const repeatUntil = d.repeatUntil
    ? new Date(`${d.repeatUntil}T12:00:00`)
    : null;

  const referenceNumber = generateReferenceNumber();

  // Shared row shape.
  const baseRow = {
    userId,
    recipientId: d.recipientId,
    fromAccountId: d.fromAccountId,
    amount: d.amount,
    fee: WIRE_FEE,
    isRepeating: d.isRepeating,
    repeatFrequency: d.isRepeating ? d.repeatFrequency ?? "monthly" : null,
    repeatUntil,
    wireDate,
    messageToBank: d.messageToBank || null,
    messageToRecipient: d.messageToRecipient || null,
    memo: d.memo || null,
    referenceNumber,
  };

  // ── Status-driven interrupts. The wizard always returns a reference and
  // sends the client to /processing — the processing page reads the wire's
  // status and renders the right UI (frozen / code gates / custom interrupt).

  if (fromAccount.status === "frozen") {
    db.insert(scheduledWires)
      .values({ ...baseRow, status: "rejected_frozen" })
      .run();
    return { ok: true, referenceNumber };
  }

  if (fromAccount.status === "custom") {
    db.insert(scheduledWires)
      .values({
        ...baseRow,
        status: "interrupted_custom",
        interruptMessage: fromAccount.customMessage ?? null,
      })
      .run();
    return { ok: true, referenceNumber };
  }

  if (fromAccount.status === "code") {
    if (
      fromAccount.type !== "credit" &&
      fromAccount.balance < d.amount + WIRE_FEE
    ) {
      return {
        ok: false,
        fieldErrors: {
          amount: `Insufficient funds. Available: ${currency(
            fromAccount.balance,
            fromAccount.currency || "USD"
          )}`,
        },
      };
    }
    db.insert(scheduledWires)
      .values({ ...baseRow, status: "pending_tcv" })
      .run();
    return { ok: true, referenceNumber };
  }

  // ── Active path (existing behavior).
  if (
    fromAccount.type !== "credit" &&
    fromAccount.balance < d.amount + WIRE_FEE
  ) {
    return {
      ok: false,
      fieldErrors: {
        amount: `Insufficient funds. Available: ${currency(
          fromAccount.balance,
          fromAccount.currency || "USD"
        )}`,
      },
    };
  }

  db.insert(scheduledWires).values({ ...baseRow, status: "scheduled" }).run();

  // Fire-and-forget confirmation. Only sent for active wires.
  try {
    const session = await getSession();
    if (session.email) {
      const code = fromAccount.currency || "USD";
      const total = d.amount + WIRE_FEE;
      await sendMail({
        to: session.email,
        subject: `Wire scheduled — ${referenceNumber}`,
        text: `We've scheduled your wire of ${currency(
          d.amount,
          code
        )} to ${recipient.recipientName} on ${d.wireDate}. Wire fee ${currency(
          WIRE_FEE,
          code
        )}. Total ${currency(total, code)}. Reference: ${referenceNumber}.`,
        html: `<p>We've scheduled your wire of <strong>${currency(
          d.amount,
          code
        )}</strong> to <strong>${recipient.recipientName}</strong> on ${d.wireDate}.</p><p>Wire fee: ${currency(
          WIRE_FEE,
          code
        )}<br/>Total: <strong>${currency(total, code)}</strong><br/>Reference: <code>${referenceNumber}</code></p>`,
      });
    }
  } catch (err) {
    console.error("[wires] confirmation email failed", err);
  }

  return { ok: true, referenceNumber, message: "Wire scheduled." };
}

// ──────────────────────────────────────────────────────────────────────
// Admin review: approve / reject a scheduled wire
// ──────────────────────────────────────────────────────────────────────

export async function approveWireAction(
  wireId: number
): Promise<WireActionState> {
  const admin = await requireAdmin();
  const wire = db
    .select()
    .from(scheduledWires)
    .where(eq(scheduledWires.id, wireId))
    .get();
  if (!wire) return { ok: false, message: "Wire not found." };
  if (wire.status !== "scheduled") {
    return {
      ok: false,
      message: `Wire is not awaiting review (current status: ${wire.status}).`,
    };
  }
  db.update(scheduledWires)
    .set({
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      rejectionReason: null,
    })
    .where(eq(scheduledWires.id, wireId))
    .run();
  revalidatePath("/admin/wires");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/wires/${wire.referenceNumber}`);
  return { ok: true, message: "Wire approved." };
}

export async function rejectWireAction(
  wireId: number,
  reason: string
): Promise<WireActionState> {
  const admin = await requireAdmin();
  const trimmed = (reason ?? "").trim();
  if (trimmed.length < 4) {
    return {
      ok: false,
      message: "Provide a reason (at least 4 characters).",
    };
  }
  const wire = db
    .select()
    .from(scheduledWires)
    .where(eq(scheduledWires.id, wireId))
    .get();
  if (!wire) return { ok: false, message: "Wire not found." };
  if (wire.status !== "scheduled") {
    return {
      ok: false,
      message: `Wire is not awaiting review (current status: ${wire.status}).`,
    };
  }
  db.update(scheduledWires)
    .set({
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      rejectionReason: trimmed.slice(0, 400),
    })
    .where(eq(scheduledWires.id, wireId))
    .run();
  revalidatePath("/admin/wires");
  revalidatePath("/admin");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/wires/${wire.referenceNumber}`);
  return { ok: true, message: "Wire rejected." };
}
