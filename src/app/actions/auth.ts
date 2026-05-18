"use server";

import { and, eq, gt, isNull, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  accounts,
  documents,
  passwordResetTokens,
  users,
} from "@/db/schema";
import {
  generateAccountNumber,
  hashPassword,
  verifyPassword,
} from "@/lib/password";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/session";
import { sendMail } from "@/lib/mailer";
import { getClientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { sendSms } from "@/lib/sms";
import {
  digitsOnly,
  isAdult,
  PHONE_RE,
  SSN_RE,
  ZIP_RE,
} from "@/lib/kyc";
import { SIGNUP_DOCS } from "@/lib/doc-specs";
import { saveUpload } from "@/lib/uploads";

export type AuthState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const signupSchema = z
  .object({
    // Legal name
    firstName: z.string().trim().min(1, "Required").max(60),
    middleName: z.string().trim().max(60).optional().or(z.literal("")),
    lastName: z.string().trim().min(1, "Required").max(60),
    suffix: z.string().trim().max(10).optional().or(z.literal("")),

    // CIP
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

    // Contact
    email: z.string().email("Enter a valid email"),
    phone: z
      .string()
      .transform((s) => digitsOnly(s))
      .refine((d) => PHONE_RE.test(d), "Enter a valid U.S. phone number"),
    phoneType: z.enum(["mobile", "home", "work"]),

    // Address
    streetAddress: z.string().trim().min(3, "Required").max(120),
    addressLine2: z.string().trim().max(60).optional().or(z.literal("")),
    city: z.string().trim().min(1, "Required").max(60),
    stateRegion: z.string().trim().length(2, "Select a state"),
    postalCode: z
      .string()
      .trim()
      .regex(ZIP_RE, "Enter a valid ZIP code"),
    yearsAtAddress: z.coerce.number().int().min(0).max(99),
    housingStatus: z.enum(["own", "rent", "live-with-family", "other"]),

    // ID verification (CIP documentary method)
    idType: z.enum([
      "drivers-license",
      "state-id",
      "passport",
      "permanent-resident-card",
      "military-id",
    ]),
    idNumber: z.string().trim().min(3, "Required").max(40),
    idIssuingState: z.string().trim().max(2).optional().or(z.literal("")),
    idIssuingCountry: z.string().trim().max(2).optional().or(z.literal("")),
    idExpirationDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Required")
      .refine((d) => new Date(d) > new Date(), "ID must not be expired"),

    // Employment & financial profile
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
    intendedUseOfAccount: z.string().min(1, "Required"),

    // Risk
    isPep: z.coerce.boolean().optional().default(false),

    // Credentials
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "At least 3 characters")
      .max(24, "24 characters or less")
      .regex(/^[a-z0-9._-]+$/, "Letters, numbers, dot, dash, underscore only"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),

    // Consent (HTML checkboxes — must be "on")
    agreeTerms: z.literal("on", { message: "You must accept the Terms" }),
    agreeEsign: z.literal("on", {
      message: "You must consent to electronic disclosures",
    }),
    agreePatriot: z.literal("on", {
      message: "You must acknowledge the USA PATRIOT Act notice",
    }),
    certifyW9: z.literal("on", {
      message: "You must certify your tax information",
    }),
  })
  .refine(
    (d) =>
      d.employmentStatus === "employed" || d.employmentStatus === "self-employed"
        ? (d.occupation ?? "").length > 0
        : true,
    { message: "Required", path: ["occupation"] }
  )
  .refine(
    (d) =>
      d.idType === "drivers-license" || d.idType === "state-id"
        ? (d.idIssuingState ?? "").length === 2
        : true,
    { message: "Select the issuing state", path: ["idIssuingState"] }
  )
  .refine(
    (d) =>
      d.idType === "passport"
        ? (d.idIssuingCountry ?? "").length === 2
        : true,
    { message: "Enter the issuing country (ISO-2)", path: ["idIssuingCountry"] }
  );

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Enter your username")
    .max(24, "Enter your username"),
  password: z.string().min(1, "Password required"),
});

const forgotIdentifierSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Enter your username or email");

const channelSchema = z.enum(["email", "sms"]);

function generateResetCode(): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function generateResetToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function findUserByIdentifier(identifier: string) {
  return db
    .select()
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, identifier)))
    .get();
}

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
  // Strip file entries before zod (they're processed separately).
  const raw: Record<string, FormDataEntryValue> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string") raw[k] = v;
  }
  const parsed = signupSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }

  // Validate required documents server-side (defense in depth).
  const fileErrors: Record<string, string> = {};
  for (const slot of SIGNUP_DOCS) {
    if (!slot.required) continue;
    const f = formData.get(`doc:${slot.kind}`);
    if (!(f instanceof File) || f.size === 0) {
      fileErrors[`doc:${slot.kind}`] = "Required";
    }
  }
  if (Object.keys(fileErrors).length > 0) {
    return {
      ok: false,
      message: "Upload the required documents before continuing.",
      fieldErrors: fileErrors,
    };
  }

  const data = parsed.data;
  const normalizedEmail = data.email.toLowerCase().trim();
  const normalizedUsername = data.username.toLowerCase().trim();

  const existingEmail = db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .get();

  if (existingEmail) {
    return {
      ok: false,
      message: "An account with that email already exists.",
      fieldErrors: { email: "Email already in use" },
    };
  }

  const existingUsername = db
    .select()
    .from(users)
    .where(eq(users.username, normalizedUsername))
    .get();

  if (existingUsername) {
    return {
      ok: false,
      message: "That username is taken — try another.",
      fieldErrors: { username: "Username already in use" },
    };
  }

  const passwordHash = await hashPassword(data.password);
  const ssnHash = await hashPassword(data.ssn);
  const ssnLast4 = data.ssn.slice(-4);
  const now = new Date();

  const [user] = db
    .insert(users)
    .values({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      suffix: data.suffix || null,
      phone: data.phone,
      phoneType: data.phoneType,
      dateOfBirth: data.dateOfBirth,
      ssnLast4,
      ssnHash,
      citizenshipStatus: data.citizenshipStatus,
      countryOfCitizenship: data.countryOfCitizenship || "US",
      streetAddress: data.streetAddress,
      addressLine2: data.addressLine2 || null,
      city: data.city,
      stateRegion: data.stateRegion,
      postalCode: data.postalCode,
      country: "US",
      yearsAtAddress: data.yearsAtAddress,
      housingStatus: data.housingStatus,
      idType: data.idType,
      idNumber: data.idNumber,
      idIssuingState: data.idIssuingState || null,
      idIssuingCountry: data.idIssuingCountry || null,
      idExpirationDate: data.idExpirationDate,
      employmentStatus: data.employmentStatus,
      occupation: data.occupation || null,
      employerName: data.employerName || null,
      annualIncome: data.annualIncome,
      sourceOfFunds: data.sourceOfFunds,
      intendedUseOfAccount: data.intendedUseOfAccount,
      isPep: data.isPep ?? false,
      agreedTermsAt: now,
      agreedEsignAt: now,
      agreedPatriotNoticeAt: now,
      certifiedW9At: now,
      kycStatus: "pending",
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

  // Auto-seed the standard payee catalog + 12 months of payment history so
  // /dashboard/pay-bills isn't empty on day one. Wrapped in try/catch so a
  // seeding hiccup never blocks account creation.
  try {
    const { seedPayeesForUser } = await import("@/lib/payee-seed");
    seedPayeesForUser(user.id);
  } catch (err) {
    console.error("[signup] payee seed failed (non-fatal):", err);
  }

  // Persist uploaded KYC documents. Failures here are logged but don't block
  // signup — the admin can request re-upload during review.
  for (const slot of SIGNUP_DOCS) {
    const f = formData.get(`doc:${slot.kind}`);
    if (!(f instanceof File) || f.size === 0) continue;
    try {
      const saved = await saveUpload("users", user.id, slot.kind, f);
      db.insert(documents)
        .values({
          userId: user.id,
          kind: slot.kind,
          originalName: saved.originalName,
          mimeType: saved.mimeType,
          size: saved.size,
          storagePath: saved.storagePath,
        })
        .run();
    } catch (err) {
      console.error(`[signup] failed to save ${slot.kind}:`, err);
    }
  }

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.firstName = user.firstName;
  await session.save();

  redirect("/dashboard?welcome=1");
}

// Tunable brute-force guards. The IP bucket catches credential stuffing
// (many usernames, same source). The per-account counter is the durable
// guard — it persists across process restarts and across IP rotation.
const LOGIN_IP_BURST = 15;          // tokens per bucket
const LOGIN_IP_WINDOW_SEC = 60;     // refill window
const LOGIN_ACCOUNT_MAX_FAILS = 8;  // threshold to lock the account
const LOGIN_LOCK_MINUTES = 30;      // duration of an account lockout

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const ip = await getClientIp();

  // Per-IP rate limit — runs before any DB lookup so a flood of requests
  // doesn't even hit the database.
  const ipCheck = rateLimit("login.ip", ip, LOGIN_IP_BURST, LOGIN_IP_WINDOW_SEC);
  if (!ipCheck.ok) {
    await audit("login.rate_limited", { outcome: "blocked", metadata: { ip } });
    return {
      ok: false,
      message: `Too many sign-in attempts. Try again in ${ipCheck.retryAfterSeconds}s.`,
    };
  }

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors: flattenErrors(parsed.error),
    };
  }

  const { username, password } = parsed.data;

  const user = db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  // Generic message — never confirm or deny that an account exists.
  const generic = "Invalid username or password.";

  if (!user || user.status !== "active") {
    await audit("login.fail", {
      outcome: "failure",
      metadata: { username, reason: "no_user_or_suspended" },
    });
    return { ok: false, message: generic };
  }

  // Honor an active lockout BEFORE running bcrypt — cheap rejection.
  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutesLeft = Math.max(
      1,
      Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000)
    );
    await audit("login.locked", {
      userId: user.id,
      outcome: "blocked",
      metadata: { minutesLeft },
    });
    return {
      ok: false,
      message: `This account is temporarily locked. Try again in ~${minutesLeft} minute(s).`,
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const nextFails = (user.failedLoginAttempts ?? 0) + 1;
    const shouldLock = nextFails >= LOGIN_ACCOUNT_MAX_FAILS;
    db.update(users)
      .set({
        failedLoginAttempts: nextFails,
        lastFailedLoginAt: new Date(),
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60_000)
          : user.lockedUntil ?? null,
      })
      .where(eq(users.id, user.id))
      .run();

    await audit("login.fail", {
      userId: user.id,
      outcome: "failure",
      metadata: { attempt: nextFails, locked: shouldLock },
    });

    if (shouldLock) {
      return {
        ok: false,
        message: `Too many failed attempts. This account is locked for ${LOGIN_LOCK_MINUTES} minutes.`,
      };
    }
    return { ok: false, message: generic };
  }

  // Success — clear counters + the IP bucket so a legitimate retry from
  // a shared NAT doesn't tip us into the rate-limit zone.
  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    db.update(users)
      .set({ failedLoginAttempts: 0, lockedUntil: null, lastFailedLoginAt: null })
      .where(eq(users.id, user.id))
      .run();
  }
  resetRateLimit("login.ip", ip);

  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  session.firstName = user.firstName;
  await session.save();

  await audit("login.success", { userId: user.id, outcome: "success" });

  const next = (formData.get("next") as string) || "/dashboard";
  redirect(next.startsWith("/") ? next : "/dashboard");
}

// ──────────────────────────────────────────────────────────────────────────
// Forgot username / password — verification by email or SMS code.
// ──────────────────────────────────────────────────────────────────────────

export type ForgotState = AuthState & {
  token?: string;
  channel?: "email" | "sms";
  destination?: string;
};

const RESET_TTL_MS = 15 * 60 * 1000;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const head = local.slice(0, Math.min(2, local.length));
  return `${head}${"•".repeat(Math.max(1, local.length - 2))}@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return phone;
  return `••• ••• ${digits.slice(-4)}`;
}

export async function requestPasswordResetAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const identifier = forgotIdentifierSchema.safeParse(formData.get("identifier"));
  const channel = channelSchema.safeParse(formData.get("channel"));
  if (!identifier.success || !channel.success) {
    return {
      ok: false,
      message: "Tell us your username or email, then pick a delivery method.",
    };
  }

  const user = findUserByIdentifier(identifier.data);
  // Always pretend success to avoid leaking account existence.
  if (!user) {
    return {
      ok: true,
      message: "If that account exists, a code is on the way.",
      token: "stub",
      channel: channel.data,
      destination: channel.data === "email" ? "the email on file" : "the phone on file",
    };
  }

  const code = generateResetCode();
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  db.insert(passwordResetTokens)
    .values({
      userId: user.id,
      token,
      code,
      channel: channel.data,
      purpose: "password",
      expiresAt,
    })
    .run();

  const codeMessage = `Your Paxnova Trust verification code is ${code}. It expires in 15 minutes. If you didn't request this, you can ignore the message.`;

  try {
    if (channel.data === "email") {
      await sendMail({
        to: user.email,
        subject: "Reset your Paxnova Trust password",
        text: codeMessage,
        html: `<p>Your Paxnova Trust verification code is <strong>${code}</strong>.</p><p>This code expires in 15 minutes. If you didn't request this, you can safely ignore this message.</p>`,
      });
    } else if (user.phone) {
      await sendSms({ to: user.phone, body: codeMessage });
    }
  } catch (err) {
    console.error("[auth] reset delivery failed", err);
  }

  return {
    ok: true,
    message: "Code sent — enter it on the next screen.",
    token,
    channel: channel.data,
    destination:
      channel.data === "email"
        ? maskEmail(user.email)
        : user.phone
        ? maskPhone(user.phone)
        : "your phone on file",
  };
}

export async function requestUsernameRecoveryAction(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const email = z
    .string()
    .email("Enter the email on your account")
    .safeParse(formData.get("email"));
  if (!email.success) {
    return { ok: false, fieldErrors: { email: email.error.issues[0].message } };
  }
  const normalized = email.data.toLowerCase().trim();
  const user = db.select().from(users).where(eq(users.email, normalized)).get();
  if (user && user.username) {
    try {
      await sendMail({
        to: user.email,
        subject: "Your Paxnova Trust username",
        text: `Hi ${user.firstName}, the username for your Paxnova Trust account is: ${user.username}.\n\nIf you didn't request this, you can ignore this message.`,
        html: `<p>Hi ${user.firstName},</p><p>The username for your Paxnova Trust account is <strong>${user.username}</strong>.</p><p>If you didn't request this, you can safely ignore this message.</p>`,
      });
    } catch (err) {
      console.error("[auth] username delivery failed", err);
    }
  }
  return {
    ok: true,
    message:
      "If that email matches an account, we've sent the username to it. Check your inbox.",
    destination: maskEmail(normalized),
  };
}

export type VerifyResetState = AuthState & { verified?: boolean; token?: string };

export async function verifyResetCodeAction(
  _prev: VerifyResetState,
  formData: FormData
): Promise<VerifyResetState> {
  const token = String(formData.get("token") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  if (!token || !/^\d{6}$/.test(code)) {
    return {
      ok: false,
      fieldErrors: { code: "Enter the 6-digit code we sent you" },
    };
  }
  const row = db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.consumedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .get();
  if (!row || row.code !== code) {
    return { ok: false, message: "That code is incorrect or expired." };
  }
  return { ok: true, verified: true, token };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const pwParsed = z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number")
    .safeParse(password);
  if (!pwParsed.success) {
    return {
      ok: false,
      fieldErrors: { password: pwParsed.error.issues[0].message },
    };
  }
  if (password !== confirm) {
    return { ok: false, fieldErrors: { confirm: "Passwords don't match" } };
  }

  const row = db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        isNull(passwordResetTokens.consumedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .get();
  if (!row) {
    return { ok: false, message: "Your reset link has expired. Start over." };
  }

  const hash = await hashPassword(password);
  db.update(users).set({ passwordHash: hash }).where(eq(users.id, row.userId)).run();
  db.update(passwordResetTokens)
    .set({ consumedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.id))
    .run();

  return { ok: true, message: "Password updated. You can sign in now." };
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();
  session.destroy();
  // Belt-and-braces: explicitly delete the session cookie so it's guaranteed
  // to land in the redirect response. iron-session's own write sometimes
  // misses the response when `redirect` short-circuits the pipeline, leaving
  // the user with a stale cookie and a second click required.
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  revalidatePath("/", "layout");
  redirect("/");
}
