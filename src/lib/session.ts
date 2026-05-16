import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";

export type SessionData = {
  userId?: number;
  email?: string;
  role?: "user" | "admin";
  firstName?: string;
};

const isProd = process.env.NODE_ENV === "production";

const password = process.env.SESSION_SECRET;

if (isProd && !password) {
  throw new Error(
    "SESSION_SECRET is required in production. Generate one with: openssl rand -base64 48"
  );
}

const effectivePassword =
  password ??
  "paxnovatrust-dev-only-fallback-rotate-before-deploy-32+chars";

if (effectivePassword.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long.");
}

// __Host- prefix locks the cookie to the exact origin and forbids the Domain
// attribute, eliminating subdomain hijack risk. It requires secure=true and
// path=/, which we already set. Browsers reject __Host- cookies over HTTP, so
// we only use the prefix in production where TLS is mandatory.
const COOKIE_NAME = isProd
  ? "__Host-paxnovatrust-session"
  : "paxnovatrust-session";

export const SESSION_COOKIE_NAME = COOKIE_NAME;

export const sessionOptions: SessionOptions = {
  password: effectivePassword,
  cookieName: COOKIE_NAME,
  cookieOptions: {
    secure: isProd,
    httpOnly: true,
    // strict eliminates CSRF risk on top-level navigations.
    // Demo flows like OAuth callbacks would need lax — we have none.
    sameSite: isProd ? "strict" : "lax",
    path: "/",
  },
  // 24h hard expiry — banking sessions should not live for a week.
  ttl: 60 * 60 * 24,
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
