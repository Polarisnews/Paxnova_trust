"use client";

import { useActionState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { ok: false };

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const [showPw, setShowPw] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
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

      {state.message && !state.fieldErrors && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
