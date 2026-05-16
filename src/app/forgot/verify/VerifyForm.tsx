"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  verifyResetCodeAction,
  type VerifyResetState,
} from "@/app/actions/auth";

const initial: VerifyResetState = { ok: false };

export function VerifyForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(verifyResetCodeAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.ok && state.verified && state.token) {
      router.replace(`/forgot/reset?token=${encodeURIComponent(state.token)}`);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <label htmlFor="code" className="text-xs font-medium">
          6-digit code
        </label>
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          placeholder="123456"
          className="text-center text-lg tracking-[0.4em] font-mono"
          aria-invalid={Boolean(state.fieldErrors?.code)}
        />
        {state.fieldErrors?.code && (
          <p className="text-xs text-danger">{state.fieldErrors.code}</p>
        )}
        {state.message && !state.fieldErrors && (
          <p className="text-xs text-danger">{state.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Verifying…
          </>
        ) : (
          "Verify code"
        )}
      </button>
    </form>
  );
}
