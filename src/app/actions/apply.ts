"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateReferenceNumber } from "@/lib/password";

export type ApplyState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const VALID_PRODUCTS = ["checking", "savings", "credit-card", "mortgage", "business"] as const;

const applySchema = z.object({
  product: z.enum(VALID_PRODUCTS),
  applicantName: z.string().min(2, "Enter your full name"),
  applicantEmail: z.string().email("Enter a valid email"),
  applicantPhone: z.string().min(7, "Enter a phone number").max(30),
  fundingAmount: z.coerce.number().min(0).max(1_000_000).optional(),
  fundingSource: z.string().max(80).optional(),
  notes: z.string().max(500).optional(),
});

export async function applyAction(
  _prev: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const parsed = applySchema.safeParse({
    product: formData.get("product"),
    applicantName: formData.get("applicantName"),
    applicantEmail: formData.get("applicantEmail"),
    applicantPhone: formData.get("applicantPhone"),
    fundingAmount: formData.get("fundingAmount") || undefined,
    fundingSource: formData.get("fundingSource") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      const p = i.path[0]?.toString();
      if (p && !fieldErrors[p]) fieldErrors[p] = i.message;
    }
    return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
  }

  const currentUser = await getCurrentUser();
  const reference = generateReferenceNumber();

  db.insert(applications)
    .values({
      userId: currentUser?.id ?? null,
      product: parsed.data.product,
      applicantName: parsed.data.applicantName,
      applicantEmail: parsed.data.applicantEmail.toLowerCase(),
      applicantPhone: parsed.data.applicantPhone,
      fundingAmount: parsed.data.fundingAmount,
      fundingSource: parsed.data.fundingSource,
      notes: parsed.data.notes,
      referenceNumber: reference,
      status: "pending",
    })
    .run();

  revalidatePath("/admin/applications");
  redirect(`/apply/success?ref=${encodeURIComponent(reference)}`);
}
