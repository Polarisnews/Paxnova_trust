"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  contactMessages,
  contactReplies,
  type ContactMessage,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";

export type ContactAdminState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const replySchema = z.object({
  threadId: z.coerce.number().int().positive(),
  body: z
    .string()
    .min(2, "Type a reply")
    .max(8000, "Replies are capped at 8,000 characters"),
  newStatus: z
    .enum(["open", "in_progress", "responded", "closed"])
    .optional()
    .default("responded"),
});

const statusSchema = z.object({
  threadId: z.coerce.number().int().positive(),
  status: z.enum(["open", "in_progress", "responded", "closed"]),
});

const assignSchema = z.object({
  threadId: z.coerce.number().int().positive(),
  toMe: z.coerce.boolean().optional(),
});

function flatten(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────
// Reply to a contact thread. Inserts a row in contact_replies, emails
// the user, and bumps the thread's status to "responded" (unless the
// admin explicitly chose something else like "in_progress").
// ──────────────────────────────────────────────────────────────────────

export async function replyToContactAction(
  _prev: ContactAdminState,
  formData: FormData,
): Promise<ContactAdminState> {
  const admin = await requireAdmin();
  const parsed = replySchema.safeParse({
    threadId: formData.get("threadId"),
    body: formData.get("body"),
    newStatus: formData.get("newStatus") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }

  const thread = db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, parsed.data.threadId))
    .get() as ContactMessage | undefined;
  if (!thread) {
    return { ok: false, message: "Thread not found." };
  }

  const now = new Date();
  const subject = `Re: ${thread.topic} — Paxnova Trust`;
  const greeting = thread.name?.split(" ")[0] ?? "there";
  const html = renderReplyEmail({
    greeting,
    body: parsed.data.body,
    originalTopic: thread.topic,
    originalMessage: thread.message,
    adminName: `${admin.firstName} ${admin.lastName}`,
  });

  // Email first. If the mail call throws we'll roll back the DB write.
  try {
    await sendMail({
      to: thread.email,
      subject,
      html,
      text: parsed.data.body,
    });
  } catch (e) {
    console.error("[contact-admin] mail send failed", e);
    return {
      ok: false,
      message:
        "Reply was not saved — email delivery failed. Please check the mail integration.",
    };
  }

  db.insert(contactReplies)
    .values({
      threadId: thread.id,
      authorId: admin.id,
      authorRole: "admin",
      body: parsed.data.body,
      emailedTo: thread.email,
      emailedAt: now,
    })
    .run();

  db.update(contactMessages)
    .set({
      status: parsed.data.newStatus,
      lastActivityAt: now,
      // Claim the thread on first reply if nobody had claimed it yet.
      assignedTo: thread.assignedTo ?? admin.id,
    })
    .where(eq(contactMessages.id, thread.id))
    .run();

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${thread.id}`);

  return {
    ok: true,
    message: `Reply emailed to ${thread.email}.`,
  };
}

// ──────────────────────────────────────────────────────────────────────
// Change thread status (Open / In progress / Responded / Closed).
// ──────────────────────────────────────────────────────────────────────

export async function updateContactStatusAction(
  formData: FormData,
): Promise<ContactAdminState> {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    threadId: formData.get("threadId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  const now = new Date();
  db.update(contactMessages)
    .set({ status: parsed.data.status, lastActivityAt: now })
    .where(eq(contactMessages.id, parsed.data.threadId))
    .run();
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${parsed.data.threadId}`);
  return { ok: true, message: `Status set to ${parsed.data.status}.` };
}

// Claim / unclaim a thread.
export async function assignContactAction(
  formData: FormData,
): Promise<ContactAdminState> {
  const admin = await requireAdmin();
  const parsed = assignSchema.safeParse({
    threadId: formData.get("threadId"),
    toMe: formData.get("toMe") === "on" || formData.get("toMe") === "true",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flatten(parsed.error) };
  }
  db.update(contactMessages)
    .set({ assignedTo: parsed.data.toMe ? admin.id : null })
    .where(eq(contactMessages.id, parsed.data.threadId))
    .run();
  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${parsed.data.threadId}`);
  return { ok: true };
}

// ──────────────────────────────────────────────────────────────────────
// Email template — light, branded, doesn't depend on external CSS.
// ──────────────────────────────────────────────────────────────────────

function renderReplyEmail({
  greeting,
  body,
  originalTopic,
  originalMessage,
  adminName,
}: {
  greeting: string;
  body: string;
  originalTopic: string;
  originalMessage: string;
  adminName: string;
}): string {
  const safeBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 14px 0;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const safeOriginal = originalMessage
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#F7F8FC;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0B1220;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(10,26,60,0.05);">
            <tr>
              <td style="background:linear-gradient(135deg,#6E3FF3,#0A1A3C);padding:24px 32px;color:#fff;">
                <p style="margin:0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#E8C76A;">Paxnova Trust</p>
                <p style="margin:6px 0 0 0;font-size:18px;font-weight:600;">A reply to your message</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;font-size:15px;line-height:1.55;">
                <p style="margin:0 0 14px 0;">Hi ${greeting},</p>
                ${safeBody}
                <p style="margin:18px 0 0 0;">— ${adminName}<br/>Paxnova Trust Customer Care</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <table role="presentation" width="100%" style="background:#F4F5FB;border-radius:12px;padding:14px 16px;font-size:13px;color:#4A5568;">
                  <tr>
                    <td>
                      <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6E3FF3;font-weight:600;">Your original message</p>
                      <p style="margin:0 0 6px 0;font-weight:600;color:#0B1220;">${originalTopic}</p>
                      <p style="margin:0;">${safeOriginal}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#0A1A3C;padding:18px 32px;color:rgba(255,255,255,0.7);font-size:11px;line-height:1.5;">
                You received this because you contacted Paxnova Trust Bank. Reply
                directly to this email to continue the conversation.
                <br/><br/>
                Paxnova Trust Bank, N.A. is a Member FDIC institution. NMLS #2026-NT.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
