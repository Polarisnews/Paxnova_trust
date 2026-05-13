import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Generates a numeric-ish account number formatted as `**** **** **** xxxx`.
 * Returns a 16-digit account number (no hyphens) suitable for storage.
 */
export function generateAccountNumber(): string {
  let num = "";
  for (let i = 0; i < 16; i++) num += Math.floor(Math.random() * 10);
  return num;
}

export function generateReferenceNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "NT-";
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}
