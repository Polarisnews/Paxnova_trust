import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import {
  AlertCircle,
  Check,
  CheckCheck,
  Clock,
  Inbox,
  Mail,
  Search,
  Tag,
  UserCircle2,
} from "lucide-react";
import { db } from "@/db";
import { contactMessages, contactReplies } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages · Admin" };

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
] as const;

const STATUS_STYLE: Record<string, string> = {
  open: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  in_progress: "bg-gold-500/15 text-gold-700 dark:text-gold-300",
  responded: "bg-success/15 text-success",
  closed: "bg-muted text-muted-foreground",
};

const STATUS_ICON: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  open: AlertCircle,
  in_progress: Clock,
  responded: Check,
  closed: CheckCheck,
};

export default async function AdminMessagesPage(props: {
  searchParams: Promise<{
    status?: string;
    topic?: string;
    q?: string;
  }>;
}) {
  await requireAdmin();
  const { status = "all", topic = "all", q = "" } =
    await props.searchParams;

  // Pull every thread + its reply count + last reply for the inbox row.
  const all = db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.lastActivityAt))
    .all();

  // Reply counts per thread — one extra round trip but with SQLite this is
  // negligible vs. pulling rows individually per thread.
  const replyRows = db.select().from(contactReplies).all();
  const replyCount = new Map<number, number>();
  for (const r of replyRows) {
    replyCount.set(r.threadId, (replyCount.get(r.threadId) ?? 0) + 1);
  }

  // Filter in-memory (admin volume is small enough).
  const lcQuery = q.trim().toLowerCase();
  const threads = all.filter((t) => {
    if (status !== "all" && t.status !== status) return false;
    if (topic !== "all" && t.topic !== topic) return false;
    if (
      lcQuery &&
      !(
        t.name.toLowerCase().includes(lcQuery) ||
        t.email.toLowerCase().includes(lcQuery) ||
        t.message.toLowerCase().includes(lcQuery)
      )
    ) {
      return false;
    }
    return true;
  });

  const counts = {
    all: all.length,
    open: all.filter((t) => t.status === "open").length,
    in_progress: all.filter((t) => t.status === "in_progress").length,
    responded: all.filter((t) => t.status === "responded").length,
    closed: all.filter((t) => t.status === "closed").length,
  } as Record<string, number>;

  // Available topics, sorted by frequency desc
  const topicCount = new Map<string, number>();
  for (const t of all)
    topicCount.set(t.topic, (topicCount.get(t.topic) ?? 0) + 1);
  const topics = Array.from(topicCount.entries()).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Customer support
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every &ldquo;Send us a message&rdquo; submission lands here, grouped
            by status. Reply emails the user directly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatBadge label="Open" value={counts.open} accent="violet" />
          <StatBadge
            label="In progress"
            value={counts.in_progress}
            accent="gold"
          />
          <StatBadge
            label="Responded"
            value={counts.responded}
            accent="success"
          />
        </div>
      </header>

      {/* Filters */}
      <form
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
        action="/admin/messages"
        method="get"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map((opt) => {
            const active = status === opt.value;
            return (
              <Link
                key={opt.value}
                href={{
                  pathname: "/admin/messages",
                  query: {
                    status: opt.value,
                    ...(topic !== "all" ? { topic } : {}),
                    ...(q ? { q } : {}),
                  },
                }}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition",
                  active
                    ? "border-violet-500 bg-violet-500 text-white"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                    active
                      ? "bg-white/25 text-white"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {counts[opt.value] ?? all.length}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:ml-auto">
          {topics.length > 0 && (
            <select
              name="topic"
              defaultValue={topic}
              className="h-9 rounded-full border border-border bg-background px-3 text-xs"
            >
              <option value="all">All topics</option>
              {topics.map(([t, n]) => (
                <option key={t} value={t}>
                  {t} ({n})
                </option>
              ))}
            </select>
          )}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, email, body…"
              className="h-9 w-44 rounded-full border border-border bg-background pl-8 pr-3 text-xs focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 sm:w-56"
            />
          </div>
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-full bg-navy-900 px-4 text-xs font-semibold text-white hover:bg-navy-700"
          >
            Apply
          </button>
        </div>
      </form>

      {/* Threads */}
      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="mt-3 font-display text-lg font-semibold">
            No messages match this filter.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try resetting the status or topic filter.
          </p>
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card">
          {threads.map((t, i) => {
            const replies = replyCount.get(t.id) ?? 0;
            const Icon = STATUS_ICON[t.status] ?? AlertCircle;
            return (
              <li
                key={t.id}
                className={cn(
                  "transition",
                  i > 0 && "border-t border-border",
                )}
              >
                <Link
                  href={`/admin/messages/${t.id}`}
                  className="grid grid-cols-1 gap-3 px-4 py-4 hover:bg-muted/40 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6 sm:px-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          STATUS_STYLE[t.status],
                        )}
                      >
                        <Icon className="size-3" />
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        <Tag className="size-3" />
                        {t.topic}
                      </span>
                      {replies > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                          <CheckCheck className="size-3" />
                          {replies} {replies === 1 ? "reply" : "replies"}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
                      <UserCircle2 className="size-4 shrink-0 text-muted-foreground" />
                      {t.name}
                      <span className="font-normal text-muted-foreground">
                        · {t.email}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {t.message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right text-xs text-muted-foreground">
                    <span>{formatRelative(t.lastActivityAt)}</span>
                    {t.userId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300">
                        Registered customer
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function StatBadge({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "violet" | "gold" | "success";
}) {
  const tone =
    accent === "violet"
      ? "bg-violet-500/10 text-violet-600 dark:text-violet-300"
      : accent === "gold"
        ? "bg-gold-500/15 text-gold-700 dark:text-gold-300"
        : "bg-success/15 text-success";
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 inline-flex min-w-[2rem] items-center justify-center rounded-full px-2 py-0.5 font-mono text-sm font-semibold tabular-nums",
          tone,
        )}
      >
        {value}
      </p>
    </div>
  );
}
