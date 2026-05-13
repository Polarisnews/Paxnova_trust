"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = { ok: false };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signupAction, initial);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const strength = scorePw(pw);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            aria-invalid={Boolean(state.fieldErrors?.firstName)}
          />
          {state.fieldErrors?.firstName && (
            <p className="text-xs text-danger">{state.fieldErrors.firstName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            aria-invalid={Boolean(state.fieldErrors?.lastName)}
          />
          {state.fieldErrors?.lastName && (
            <p className="text-xs text-danger">{state.fieldErrors.lastName}</p>
          )}
        </div>
      </div>

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
            autoComplete="new-password"
            required
            minLength={8}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="At least 8 characters"
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
        <div className="flex h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full transition-all"
            style={{
              width: `${(strength.score / 4) * 100}%`,
              background: strength.color,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{strength.label}</p>
        {state.fieldErrors?.password && (
          <p className="text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      {state.message && !state.fieldErrors && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        By continuing you agree to Nova Trust&apos;s Terms and Privacy Policy. We&apos;ll
        run a soft credit pull that doesn&apos;t affect your score.
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft transition hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Creating account…
          </>
        ) : (
          "Create account"
        )}
      </button>
    </form>
  );
}

function scorePw(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const labels = ["Weak", "Fair", "Decent", "Strong", "Excellent"];
  const colors = ["#E11D48", "#F97316", "#F59E0B", "#10B981", "#0E9F6E"];
  return { score, label: labels[score], color: colors[score] };
}
