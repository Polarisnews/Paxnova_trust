"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  FolderPlus,
  PenLine,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { maskAccount } from "@/lib/format";
import {
  deleteWireRecipientAction,
  deleteGroupAction,
  type WireActionState,
} from "@/app/actions/wires";

type Recipient = {
  id: number;
  recipientName: string;
  recipientNickname: string | null;
  bankName: string;
  accountNumber: string;
  groupId: number | null;
};

type Group = { id: number; name: string };

export function WiresShell({
  recipients,
  groups,
  children,
}: {
  recipients: Recipient[];
  groups: Group[];
  children: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [recipientsModal, setRecipientsModal] = useState(false);
  const [groupsModal, setGroupsModal] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return recipients;
    const q = search.toLowerCase();
    return recipients.filter(
      (r) =>
        r.recipientName.toLowerCase().includes(q) ||
        (r.recipientNickname ?? "").toLowerCase().includes(q) ||
        r.bankName.toLowerCase().includes(q)
    );
  }, [search, recipients]);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <Section title="Manage recipients">
          <ActionRow
            onClick={() => setRecipientsModal(true)}
            icon={Edit3}
            label="Edit / delete recipient"
            disabled={recipients.length === 0}
          />
          <LinkRow
            href="/dashboard/transfer/wires/recipients/new"
            icon={UserPlus}
            label="Add a recipient"
          />
          <ActionRow
            onClick={() => setGroupsModal(true)}
            icon={PenLine}
            label="Edit / delete a group"
            disabled={groups.length === 0}
          />
          <LinkRow
            href="/dashboard/transfer/wires/groups/new"
            icon={FolderPlus}
            label="Create a group"
          />
        </Section>

        <Section title="My wire recipients">
          <div className="relative px-1 pb-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipients"
              className="h-9 pl-8 text-xs"
            />
          </div>
          <ul className="space-y-0.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-muted-foreground">
                {recipients.length === 0 ? "None" : "No matches"}
              </li>
            ) : (
              filtered.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/transfer/wires/schedule?to=${r.id}`}
                    className="block rounded-lg px-3 py-2 text-xs hover:bg-muted"
                  >
                    <p className="font-medium">
                      {r.recipientNickname || r.recipientName}
                    </p>
                    <p className="text-muted-foreground">
                      {r.bankName} · {maskAccount(r.accountNumber)}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </Section>
      </aside>

      <section className="min-w-0">{children}</section>

      {recipientsModal && (
        <RecipientsModal
          recipients={recipients}
          onClose={() => setRecipientsModal(false)}
        />
      )}
      {groupsModal && (
        <GroupsModal
          groups={groups}
          onClose={() => setGroupsModal(false)}
        />
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-2">
      <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}

function ActionRow({
  onClick,
  icon: Icon,
  label,
  disabled,
}: {
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function LinkRow({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-violet-500 transition hover:bg-violet-500/5"
    >
      <Icon className="size-3.5" />
      {label}
    </Link>
  );
}

function RecipientsModal({
  recipients,
  onClose,
}: {
  recipients: Recipient[];
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <ModalShell title="Manage recipients" onClose={onClose}>
      {recipients.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          You haven&apos;t added any recipients yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {recipients.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {r.recipientNickname
                    ? `${r.recipientName} (${r.recipientNickname})`
                    : r.recipientName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.bankName} · {maskAccount(r.accountNumber)}
                </p>
              </div>
              <Link
                href={`/dashboard/transfer/wires/recipients/new?edit=${r.id}`}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Edit recipient"
              >
                <Edit3 className="size-4" />
              </Link>
              <form
                action={async (fd) => {
                  fd.set("id", String(r.id));
                  const res = (await deleteWireRecipientAction(
                    { ok: false } satisfies WireActionState,
                    fd
                  )) as WireActionState;
                  if (res.ok) {
                    toast.success("Recipient removed.");
                    router.refresh();
                  } else {
                    toast.error(res.message ?? "Couldn't remove recipient.");
                  }
                }}
              >
                <button
                  type="submit"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete recipient"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
}

function GroupsModal({
  groups,
  onClose,
}: {
  groups: Group[];
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <ModalShell title="Manage groups" onClose={onClose}>
      {groups.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
          You haven&apos;t created any groups yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {groups.map((g) => (
            <li key={g.id} className="flex items-center gap-3 py-3">
              <Users className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate text-sm font-medium">
                {g.name}
              </span>
              <form
                action={async (fd) => {
                  fd.set("id", String(g.id));
                  const res = (await deleteGroupAction(
                    { ok: false } satisfies WireActionState,
                    fd
                  )) as WireActionState;
                  if (res.ok) {
                    toast.success("Group removed.");
                    router.refresh();
                  } else {
                    toast.error(res.message ?? "Couldn't remove group.");
                  }
                }}
              >
                <button
                  type="submit"
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  aria-label="Delete group"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <button
        type="button"
        aria-hidden
        onClick={onClose}
        className="fixed inset-0 z-40 bg-foreground/30"
      />
      <div className="fixed left-1/2 top-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-elev">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </>
  );
}
