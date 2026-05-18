import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, inArray } from "drizzle-orm";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Mail,
  Tag,
  UserCircle2,
} from "lucide-react";
import { db } from "@/db";
import {
  contactMessages,
  contactReplies,
  users,
  type ContactMessage,
  type ContactReply,
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ContactThreadView } from "./ContactThreadView";

export const metadata: Metadata = { title: "Message · Admin" };

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

export default async function AdminMessageThreadPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await props.params;
  const threadId = Number(id);
  if (!Number.isFinite(threadId)) notFound();

  const thread = db
    .select()
    .from(contactMessages)
    .where(eq(contactMessages.id, threadId))
    .get() as ContactMessage | undefined;
  if (!thread) notFound();

  const replies = db
    .select()
    .from(contactReplies)
    .where(eq(contactReplies.threadId, threadId))
    .orderBy(asc(contactReplies.createdAt))
    .all() as ContactReply[];

  // Pull the admins referenced in any reply so we can show their initials
  // and name. Single query, then index by id.
  const adminIds = Array.from(
    new Set(replies.map((r) => r.authorId).filter((x): x is number => !!x)),
  );
  const adminsById = new Map<
    number,
    { id: number; firstName: string; lastName: string }
  >();
  if (adminIds.length > 0) {
    const rows = db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(inArray(users.id, adminIds))
      .all();
    for (const r of rows) adminsById.set(r.id, r);
  }

  // Same lookup for thread.assignedTo (if any).
  let assignedAdmin: { firstName: string; lastName: string } | null = null;
  if (thread.assignedTo) {
    const found = adminsById.get(thread.assignedTo);
    if (found) {
      assignedAdmin = found;
    } else {
      const row = db
        .select({
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, thread.assignedTo))
        .get();
      assignedAdmin = row ?? null;
    }
  }

  const StatusIcon = STATUS_ICON[thread.status] ?? AlertCircle;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/messages"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All messages
      </Link>

      <section className="mt-4 rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  STATUS_STYLE[thread.status],
                )}
              >
                <StatusIcon className="size-3" />
                {thread.status.replace("_", " ")}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Tag className="size-3" />
                {thread.topic}
              </span>
              {assignedAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300">
                  Assigned to {assignedAdmin.firstName}{" "}
                  {assignedAdmin.lastName?.[0] ?? ""}
                </span>
              )}
            </div>
            <h1 className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-2xl font-semibold tracking-tight">
              <UserCircle2 className="size-5 text-muted-foreground" />
              {thread.name}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                — opened {formatRelative(thread.createdAt)}
              </span>
            </h1>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              <a
                href={`mailto:${thread.email}`}
                className="text-violet-500 hover:text-violet-600"
              >
                {thread.email}
              </a>
              {thread.userId && (
                <Link
                  href={`/admin/users#${thread.userId}`}
                  className="ml-1 inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300"
                >
                  Registered #{thread.userId}
                </Link>
              )}
            </p>
          </div>
        </div>

        <ContactThreadView
          thread={thread}
          replies={replies}
          adminsById={Object.fromEntries(adminsById)}
        />
      </section>
    </div>
  );
}
