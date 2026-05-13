"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import {
  generateAccountNumber,
  hashPassword,
  verifyPassword,
} from "@/lib/password";
import { getSession } from "@/lib/session";

export type AuthState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const signupSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
});

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password required"),
});

function flattenErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path[0]?.toString();
    if (path && !out[path]) out[path] = issue.message;
  }
  return out;
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }

  const { firstName, lastName, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .get();

  if (existing) {
    return {
      ok: false,
      message: "An account with that email already exists.",
      fieldErrors: { email: "Email already in use" },
    };
  }

  const passwordHash = await hashPassword(password);

  const [user] = db
    .insert(users)
    .values({
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      role: "user",
    })
    .returning()
    .all();

  // Auto-create a starter Checking account so the dashboard has data immediately.
  db.insert(accounts)
    .values({
      userId: user.id,
      type: "checking",
      name: "Apex Checking",
      accountNumber: generateAccountNumber(),
      balance: 0,
      apy: 0.5,
      status: "active",
    })
    .run();

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.firstName = user.firstName;
  await session.save();

  redirect("/dashboard?welcome=1");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }

  const { email, password } = parsed.data;

  const user = db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase().trim()))
    .get();

  if (!user || user.status !== "active") {
    return { ok: false, message: "Invalid email or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, message: "Invalid email or password." };

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.firstName = user.firstName;
  await session.save();

  const next = (formData.get("next") as string) || "/dashboard";
  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  revalidatePath("/", "layout");
  redirect("/");
}
