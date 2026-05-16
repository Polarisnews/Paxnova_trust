import "server-only";
import { db } from "@/db";
import { auditLog } from "@/db/schema";
import { headers } from "next/headers";
import { getClientIp } from "@/lib/rate-limit";

type Outcome = "success" | "failure" | "blocked";

/**
 * Record a security-relevant event in the audit log. Best-effort — failures
 * are swallowed so audit pressure cannot break a user-facing flow.
 */
export async function audit(
  action: string,
  options: {
    userId?: number | null;
    outcome?: Outcome;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const ip = await getClientIp();
    const h = await headers();
    const ua = h.get("user-agent") ?? null;
    db.insert(auditLog)
      .values({
        userId: options.userId ?? null,
        action,
        outcome: options.outcome ?? "success",
        ipAddress: ip || null,
        userAgent: ua,
        metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      })
      .run();
  } catch (err) {
    console.error("[audit] failed", err);
  }
}
