import "server-only";
import crypto from "node:crypto";

/**
 * AES-256-GCM encryption helpers for at-rest protection of sensitive
 * card data (PAN, CVV) and any other field that must be stored reversibly
 * but never leaked from a database dump.
 *
 * Key handling
 *   - Reads from process.env.ENCRYPTION_KEY.
 *   - Accepts the key as 64-char hex OR 44-char base64 (raw 32 bytes).
 *   - In production the env var is REQUIRED — boot fails loudly otherwise.
 *   - In development a deterministic fallback is used so the demo runs
 *     without ceremony; do not deploy without setting ENCRYPTION_KEY.
 *
 * Format
 *   The packed ciphertext is `v1.<iv>.<tag>.<ciphertext>`, all base64url.
 *   Storing this string in a single TEXT column lets you re-key later by
 *   bumping the version prefix without touching the column type.
 */

const ALG = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_BYTES = 32;

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) return cachedKey;

  const raw = process.env.ENCRYPTION_KEY;

  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ENCRYPTION_KEY is required in production. Generate one with: " +
          "openssl rand -base64 32"
      );
    }
    // Dev-only deterministic fallback. The marker string is intentionally
    // unusable: anyone who runs the app in production without setting the
    // env var will hit the throw above first.
    console.warn(
      "[crypto] ENCRYPTION_KEY not set — using deterministic dev fallback. " +
        "Set ENCRYPTION_KEY before deploying."
    );
    cachedKey = crypto
      .createHash("sha256")
      .update("paxnovatrust-dev-only-fallback-rotate-before-deploy")
      .digest();
    return cachedKey;
  }

  let buf: Buffer;
  if (/^[0-9a-f]{64}$/i.test(raw)) {
    buf = Buffer.from(raw, "hex");
  } else {
    buf = Buffer.from(raw, "base64");
  }

  if (buf.length !== KEY_BYTES) {
    throw new Error(
      `ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${buf.length}). ` +
        "Generate with: openssl rand -base64 32"
    );
  }

  cachedKey = buf;
  return cachedKey;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decrypt(packed: string): string {
  const parts = packed.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") {
    throw new Error("Invalid ciphertext format");
  }
  const key = getKey();
  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  const ciphertext = Buffer.from(parts[3], "base64url");
  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** True when a value looks like a v1 encrypted payload. */
export function isEncrypted(value: string | null | undefined): boolean {
  return !!value && value.startsWith("v1.") && value.split(".").length === 4;
}

/**
 * Idempotent encrypt — if the value is already a v1 payload, return as-is;
 * otherwise encrypt it. Useful when transitioning a column from plaintext
 * to ciphertext.
 */
export function ensureEncrypted(value: string | null): string | null {
  if (!value) return value;
  if (isEncrypted(value)) return value;
  return encrypt(value);
}

/**
 * Safe decrypt — returns the plaintext for encrypted values, or the raw
 * value if it predates the encryption migration. Lets reveal flows work
 * across pre- and post-migration rows.
 */
export function safeDecrypt(value: string | null): string | null {
  if (!value) return value;
  if (!isEncrypted(value)) return value;
  return decrypt(value);
}

/**
 * Timing-safe string equality. Use for verifying short tokens (TOTP,
 * reset codes, API keys) that must not leak via response-time deltas.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return crypto.timingSafeEqual(ab, bb);
}
