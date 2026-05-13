import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";

export type SessionData = {
  userId?: number;
  email?: string;
  role?: "user" | "admin";
  firstName?: string;
};

const password =
  process.env.SESSION_SECRET ??
  "novatrust-fallback-secret-please-set-SESSION_SECRET-in-env-32chars";

if (password.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long.");
}

export const sessionOptions: SessionOptions = {
  password,
  cookieName: "novatrust-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
  ttl: 60 * 60 * 24 * 7,
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
