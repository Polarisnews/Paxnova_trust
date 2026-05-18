"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Send, ShieldCheck, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  replyToContactAction,
  updateContactStatusAction,
  assignContactAction,
  type ContactAdminState,
} from "@/app/actions/contact-admin";
import { formatDate, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ContactMessage, ContactReply } from "@/db/schema";

type AdminLite = { firstName: string; lastName: string };

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
] as const;

const initial: ContactAdminState = { ok: false };

export function ContactThreadView({
  thread,
  replies,
  adminsById,
}: {
  thread: ContactMessage;
  replies: ContactReply[];
  adminsById: Record<number, AdminLite>;
}) {
  const [state, formAction, pending] = useActionState(
    replyToContactAction,
    initial,
  );
  const [draft, setDraft] = useState("");
  const [closeAfterReply, setCloseAfterReply] = useState(false);
  const [statusPending, startStatusTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Surface toast + clear the textarea after a successful reply.
  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      setDraft("");
      setCloseAfterReply(false);
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Auto-scroll the bubble list to the bottom when new replies arrive.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [replies.length]);

  function changeStatus(next: string) {
    if (next === thread.status) return;
    startStatusTransition(async () => {
      const fd = new FormData();
      fd.set("threadId", String(thread.id));
      fd.set("status", next);
      const res = await updateContactStatusAction(fd);
      if (res.ok) toast.success(res.message ?? "Status updated.");
      else toast.error(res.message ?? "Couldn't update status.");
    });
  }

  function toggleAssign(toMe: boolean) {
    startStatusTransition(async () => {
      const fd = new FormData();
      fd.set("threadId", String(thread.id));
      fd.set("toMe", toMe ? "true" : "false");
      const res = await assignContactAction(fd);
      if (res.ok) toast.success(toMe ? "Claimed." : "Unassigned.");
      else toast.error(res.message ?? "Couldn't update assignment.");
    });
  }

  // Quick-reply templates per topic — keeps support consistent.
  const templates: { label: string; body: string }[] = [
    {
      label: "Thanks + ETA",
      body: `Hi ${thread.name?.split(" ")[0] ?? "there"},\n\nThanks for reaching out — I've received your message and our team is taking a look. You can expect a follow-up within one business day.\n\nIn the meantime, please let me know if anything changes.`,
    },
    {
      label: "Need more info",
      body: `Hi ${thread.name?.split(" ")[0] ?? "there"},\n\nThanks for writing in. To help me look into this, could you share:\n\n• The account or product you're asking about\n• Any reference numbers you have\n• A brief example of what you're seeing\n\nOnce I have that I can dig in right away.`,
    },
    {
      label: "Resolved — recap",
      body: `Hi ${thread.name?.split(" ")[0] ?? "there"},\n\nWe've completed the steps we discussed. Here's a quick recap:\n\n• \n• \n\nIf anything else comes up please reply directly to this email and the thread will reopen on our side.`,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Status + assignment toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/30 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status
        </span>
        <div className="flex items-center gap-1">
          {STATUS_OPTIONS.map((opt) => {
            const active = thread.status === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={active || statusPending}
                onClick={() => changeStatus(opt.value)}
                className={cn(
                  "h-8 rounded-full border px-3 text-xs font-medium transition disabled:opacity-100",
                  active
                    ? "border-violet-500 bg-violet-500 text-white"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {thread.assignedTo ? (
            <button
              type="button"
              onClick={() => toggleAssign(false)}
              disabled={statusPending}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Unassign
            </button>
          ) : (
            <button
              type="button"
              onClick={() => toggleAssign(true)}
              disabled={statusPending}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-navy-900 px-3 text-xs font-semibold text-white hover:bg-navy-700"
            >
              <ShieldCheck className="size-3.5" />
              Claim
            </button>
          )}
        </div>
      </div>

      {/* Chat bubbles */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto p-5"
        style={{ minHeight: "320px", maxHeight: "55dvh" }}
      >
        {/* Original message */}
        <Bubble
          side="left"
          name={thread.name}
          initials={getInitials(thread.name)}
          accent="muted"
          timestamp={formatDate(thread.createdAt) + " · original message"}
          relative={formatRelative(thread.createdAt)}
        >
          {thread.message}
        </Bubble>

        {/* Replies in order */}
        {replies.map((r) => {
          const admin = r.authorId ? adminsById[r.authorId] : undefined;
          const name = admin
            ? `${admin.firstName} ${admin.lastName}`
            : r.authorRole === "admin"
              ? "Paxnova Trust Support"
              : thread.name;
          const initials = admin
            ? getInitials(`${admin.firstName} ${admin.lastName}`)
            : r.authorRole === "admin"
              ? "PT"
              : getInitials(thread.name);
          return (
            <Bubble
              key={r.id}
              side={r.authorRole === "admin" ? "right" : "left"}
              name={name}
              initials={initials}
              accent={r.authorRole === "admin" ? "violet" : "muted"}
              timestamp={
                r.emailedAt
                  ? `Emailed ${formatDate(r.emailedAt)} → ${r.emailedTo}`
                  : formatDate(r.createdAt)
              }
              relative={formatRelative(r.createdAt)}
            >
              {r.body}
            </Bubble>
          );
        })}
      </div>

      {/* Reply composer */}
      <form
        action={formAction}
        className="border-t border-border bg-card p-5"
      >
        <input type="hidden" name="threadId" value={thread.id} />
        <input
          type="hidden"
          name="newStatus"
          value={closeAfterReply ? "closed" : "responded"}
        />

        {/* Quick templates */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quick replies
          </span>
          {templates.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setDraft(t.body)}
              className="h-7 rounded-full border border-border bg-background px-2.5 text-[11px] font-medium text-foreground/85 hover:bg-muted"
            >
              {t.label}
            </button>
          ))}
        </div>

        <label htmlFor="body" className="sr-only">
          Reply body
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          maxLength={8000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Write a reply to ${thread.name?.split(" ")[0] ?? thread.email}. This will be emailed to ${thread.email}.`}
          className="w-full resize-y rounded-xl border border-border bg-background p-3 text-sm leading-relaxed focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
        />
        {state.fieldErrors?.body && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.body}</p>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              className="size-4 accent-violet-500"
              checked={closeAfterReply}
              onChange={(e) => setCloseAfterReply(e.target.checked)}
            />
            Close thread after sending
          </label>
          <button
            type="submit"
            disabled={pending || draft.trim().length < 2}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 active:scale-[0.98] disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending email…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Send & email customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Bubble({
  side,
  name,
  initials,
  accent,
  children,
  timestamp,
  relative,
}: {
  side: "left" | "right";
  name: string;
  initials: string;
  accent: "violet" | "muted";
  children: React.ReactNode;
  timestamp: string;
  relative: string;
}) {
  const align = side === "right" ? "items-end" : "items-start";
  const flexDir = side === "right" ? "flex-row-reverse" : "flex-row";
  const bubbleTone =
    side === "right"
      ? "bg-gradient-to-br from-violet-500 to-violet-700 text-white"
      : "bg-muted text-foreground";
  const avatarTone =
    accent === "violet"
      ? "bg-violet-500 text-white"
      : "bg-navy-900 text-white";

  return (
    <div className={cn("flex flex-col", align)}>
      <div className={cn("flex w-full max-w-[85%] gap-2.5 sm:max-w-[80%]", flexDir)}>
        <span
          aria-hidden
          className={cn(
            "mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold",
            avatarTone,
          )}
        >
          {side === "right" ? <ShieldCheck className="size-4" /> : (
            <span>{initials}</span>
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
              bubbleTone,
              side === "right"
                ? "rounded-tr-md"
                : "rounded-tl-md",
            )}
          >
            {children}
          </div>
          <p
            className={cn(
              "mt-1.5 text-[11px] text-muted-foreground",
              side === "right" ? "text-right" : "text-left",
            )}
          >
            <span className="font-medium text-foreground/80">{name}</span> ·{" "}
            <span title={timestamp}>{relative}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
