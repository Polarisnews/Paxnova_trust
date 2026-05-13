import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { getSession } from "@/lib/session";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session.userId) return null;

  const user = db.select().from(users).where(eq(users.id, session.userId)).get();
  return user ?? null;
});

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function requireGuest(): Promise<void> {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
}
