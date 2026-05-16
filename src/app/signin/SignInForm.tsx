"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { loginAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { ok: false };
const REMEMBER_KEY = "nt:rememberedUsername";

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const [showPw, setShowPw] = useState(false);
  const [username, setUsername] = useState("");
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setUsername(saved);
        setRemember(true);
      }
    } catch {
      // localStorage may be unavailable in private mode — silently ignore.
    }
  }, []);

  function persistRemember(e: React.FormEvent<HTMLFormElement>) {
    try {
      if (remember) {
        window.localStorage.setItem(REMEMBER_KEY, username.toLowerCase().trim());
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      // ignore
    }
    // continue with normal form submit
    void e;
  }

  return (
    <form action={formAction} onSubmit={persistRemember} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="space-y-1.5">
        <Input
          id="username"
          name="username"
          type="text"
          inputMode="text"
          autoComplete="username"
          required
          value={username}
          onChange={(e) =>
            setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))
          }
          placeholder="Username"
          aria-invalid={Boolean(state.fieldErrors?.username)}
        />
        {state.fieldErrors?.username && (
          <p className="text-xs text-danger">{state.fieldErrors.username}</p>
        )}
      </div>

      <div className="h-px bg-border" aria-hidden="true" />

      <div className="space-y-1.5">
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Password"
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

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="size-4 accent-violet-500"
        />
        Remember Username
      </label>

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

      <p className="pt-2 text-center">
        <Link
          href="/forgot"
          className="text-sm font-medium text-violet-500 hover:text-violet-600"
        >
          Forgot Username/Password?
        </Link>
      </p>
    </form>
  );
}
