"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { setUserCredentialsAction } from "@/app/actions/admin";

export function EditCredentialsDialog({
  open,
  onClose,
  userId,
  currentUsername,
  userName,
}: {
  open: boolean;
  onClose: () => void;
  userId: number;
  currentUsername: string | null;
  userName: string;
}) {
  const [username, setUsername] = useState(currentUsername ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  // Reset fields whenever the dialog re-opens for a different user.
  useEffect(() => {
    if (open) {
      setUsername(currentUsername ?? "");
      setPassword("");
      setShowPw(false);
      // Tiny delay so the input is mounted before we focus it.
      requestAnimationFrame(() => usernameRef.current?.focus());
    }
  }, [open, currentUsername]);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    // Require at least one field.
    if (!username.trim() && !password) {
      toast.error("Enter a new username, password, or both.");
      return;
    }
    setSubmitting(true);
    const res = await setUserCredentialsAction(userId, {
      username: username.trim() || undefined,
      password: password || undefined,
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success(res.message ?? "Updated.");
      onClose();
    } else {
      toast.error(res.message ?? "Could not update credentials.");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-creds-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h2
              id="edit-creds-title"
              className="font-display text-lg font-semibold leading-tight"
            >
              Reset login
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update {userName}&apos;s username, password, or both.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <label htmlFor="new-username" className="text-xs font-medium">
              New username
            </label>
            <input
              ref={usernameRef}
              id="new-username"
              type="text"
              autoComplete="off"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))
              }
              placeholder="3–24 chars · letters, numbers, dot, dash, underscore"
              className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            />
            <p className="text-[11px] text-muted-foreground">
              Leave unchanged to keep the current username.
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-password" className="text-xs font-medium">
              New password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ chars · 1 uppercase · 1 number"
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 pr-10 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              >
                {showPw ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Leave blank to keep the existing password. Share the new one
              with the user through a secure channel.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
