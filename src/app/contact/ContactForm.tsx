"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactAction, type ActionState } from "@/app/actions/banking";

const initial: ActionState = { ok: false };

const topics = [
  "General question",
  "Open an account",
  "Existing account",
  "Press / media",
  "Careers",
];

export function ContactForm() {
  const [state, formAction, pending] = useActionState(contactAction, initial);

  useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (state.message && !state.ok && !state.fieldErrors) toast.error(state.message);
  }, [state]);

  return (
    <form
      action={formAction}
      className="space-y-4"
      key={state.ok ? "submitted" : "form"}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" name="name" required aria-invalid={Boolean(state.fieldErrors?.name)} />
          {state.fieldErrors?.name && (
            <p className="text-xs text-danger">{state.fieldErrors.name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-danger">{state.fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="topic">Topic</Label>
        <select
          id="topic"
          name="topic"
          required
          defaultValue={topics[0]}
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          aria-invalid={Boolean(state.fieldErrors?.message)}
        />
        {state.fieldErrors?.message && (
          <p className="text-xs text-danger">{state.fieldErrors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>
    </form>
  );
}
