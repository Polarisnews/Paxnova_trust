"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, Loader2, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskAccount } from "@/lib/format";
import {
  createGroupAction,
  type WireActionState,
} from "@/app/actions/wires";

type Recipient = {
  id: number;
  recipientName: string;
  recipientNickname: string | null;
  bankName: string;
  accountNumber: string;
};

const initial: WireActionState = { ok: false };

export function CreateGroupForm({ recipients }: { recipients: Recipient[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createGroupAction, initial);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (state.ok && state.groupId) {
      toast.success("Group created.");
      router.push("/dashboard/transfer/wires/recipients");
    }
  }, [state, router]);

  function toggleMember(id: number) {
    setMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form
      action={action}
      className="space-y-5 rounded-2xl border border-border bg-card p-6"
    >
      <h2 className="font-display text-xl font-semibold tracking-tight">
        Create a wire recipient group
      </h2>

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-medium">
          Group title
        </Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          required
          placeholder="e.g. Vendors, Family, Q4 contractors"
          aria-invalid={Boolean(state.fieldErrors?.name)}
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-danger">{state.fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Group members</Label>
        {members.size === 0 && !adding && (
          <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
            No members yet — add recipients you already have on file.
          </p>
        )}
        {members.size > 0 && (
          <ul className="space-y-1.5">
            {[...members].map((id) => {
              const r = recipients.find((x) => x.id === id);
              if (!r) return null;
              return (
                <li
                  key={id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <span className="flex-1 truncate">
                    <span className="font-medium">{r.recipientName}</span>
                    {r.recipientNickname && (
                      <span className="text-muted-foreground">
                        {" "}
                        ({r.recipientNickname})
                      </span>
                    )}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {r.bankName} · {maskAccount(r.accountNumber)}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleMember(id)}
                    aria-label="Remove from group"
                    className="rounded-md p-1 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  >
                    <X className="size-3.5" />
                  </button>
                  <input type="hidden" name="memberIds" value={id} />
                </li>
              );
            })}
          </ul>
        )}

        {adding ? (
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            {recipients.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                You don&apos;t have any recipients to add yet.
              </p>
            ) : (
              <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                {recipients
                  .filter((r) => !members.has(r.id))
                  .map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          toggleMember(r.id);
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-card"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium">{r.recipientName}</span>
                          {r.recipientNickname && (
                            <span className="text-muted-foreground">
                              {" "}
                              ({r.recipientNickname})
                            </span>
                          )}
                        </span>
                        <span className="hidden text-muted-foreground sm:inline">
                          {r.bankName} · {maskAccount(r.accountNumber)}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            )}
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Done picking
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-border bg-background px-4 text-xs font-medium hover:bg-muted"
          >
            <UserPlus className="size-3.5" />
            Add group member
          </button>
        )}
      </div>

      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
        <Link
          href="/dashboard/transfer/wires/recipients"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending || name.trim().length < 2}
          className="inline-flex h-10 items-center justify-center rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Creating…
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 size-4" /> Create group
            </>
          )}
        </button>
      </div>
    </form>
  );
}
