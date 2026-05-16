"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { resetPasswordAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { ok: false };

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initial);
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      const timer = setTimeout(() => router.replace("/signin"), 1500);
      return () => clearTimeout(timer);
    }
  }, [state.ok, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-medium">
          New password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="••••••••"
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {state.fieldErrors?.password && (
          <p className="text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-xs font-medium">
          Confirm new password
        </label>
        <Input
          id="confirm"
          name="confirm"
          type={showPw ? "text" : "password"}
          autoComplete="new-password"
          required
          placeholder="••••••••"
          aria-invalid={Boolean(state.fieldErrors?.confirm)}
        />
        {state.fieldErrors?.confirm && (
          <p className="text-xs text-danger">{state.fieldErrors.confirm}</p>
        )}
      </div>

      {state.message && state.ok && (
        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          {state.message}
        </p>
      )}
      {state.message && !state.ok && !state.fieldErrors && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || state.ok}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Updating…
          </>
        ) : state.ok ? (
          "Updated — redirecting…"
        ) : (
          "Set new password"
        )}
      </button>
    </form>
  );
}
