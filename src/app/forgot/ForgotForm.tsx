"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  requestPasswordResetAction,
  requestUsernameRecoveryAction,
  type ForgotState,
} from "@/app/actions/auth";

const initial: ForgotState = { ok: false };

type Mode = "password" | "username";

export function ForgotForm() {
  const [mode, setMode] = useState<Mode>("password");
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const router = useRouter();

  const [pwState, pwAction, pwPending] = useActionState(
    requestPasswordResetAction,
    initial
  );
  const [unState, unAction, unPending] = useActionState(
    requestUsernameRecoveryAction,
    initial
  );

  // When the password-reset action returns a token, hand off to the verify step.
  if (pwState.ok && pwState.token && pwState.token !== "stub") {
    router.replace(
      `/forgot/verify?token=${encodeURIComponent(pwState.token)}&channel=${
        pwState.channel ?? channel
      }&dest=${encodeURIComponent(pwState.destination ?? "")}`
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1 text-xs">
        <button
          type="button"
          onClick={() => setMode("password")}
          className={
            "rounded-full px-3 py-1.5 font-semibold transition " +
            (mode === "password"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          Forgot password
        </button>
        <button
          type="button"
          onClick={() => setMode("username")}
          className={
            "rounded-full px-3 py-1.5 font-semibold transition " +
            (mode === "username"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          Forgot username
        </button>
      </div>

      {mode === "password" ? (
        <form action={pwAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="text-xs font-medium">
              Username or email on the account
            </label>
            <Input
              id="identifier"
              name="identifier"
              autoComplete="username"
              required
              placeholder="yourusername or you@example.com"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Send the verification code by</p>
            <div className="grid grid-cols-2 gap-2">
              <ChannelOption
                value="email"
                current={channel}
                onPick={setChannel}
                icon={<Mail className="size-4" />}
                label="Email"
              />
              <ChannelOption
                value="sms"
                current={channel}
                onPick={setChannel}
                icon={<MessageSquare className="size-4" />}
                label="Text message"
              />
            </div>
            <input type="hidden" name="channel" value={channel} />
          </div>

          {pwState.message && !pwState.ok && (
            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
              {pwState.message}
            </p>
          )}
          {pwState.ok && pwState.token === "stub" && (
            <p className="rounded-md bg-violet-500/10 px-3 py-2 text-sm text-violet-600 dark:text-violet-300">
              {pwState.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pwPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {pwPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Sending code…
              </>
            ) : (
              "Send verification code"
            )}
          </button>
        </form>
      ) : (
        <form action={unAction} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium">
              Email on the account
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              aria-invalid={Boolean(unState.fieldErrors?.email)}
            />
            {unState.fieldErrors?.email && (
              <p className="text-xs text-danger">{unState.fieldErrors.email}</p>
            )}
          </div>

          {unState.ok && (
            <p className="rounded-md bg-violet-500/10 px-3 py-2 text-sm text-violet-600 dark:text-violet-300">
              {unState.message}
            </p>
          )}

          <button
            type="submit"
            disabled={unPending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-500 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
          >
            {unPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Looking up…
              </>
            ) : (
              "Email me my username"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

function ChannelOption({
  value,
  current,
  onPick,
  icon,
  label,
}: {
  value: "email" | "sms";
  current: "email" | "sms";
  onPick: (v: "email" | "sms") => void;
  icon: React.ReactNode;
  label: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      className={
        "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition " +
        (active
          ? "border-violet-500 bg-violet-500/5 text-violet-600"
          : "border-border bg-background text-muted-foreground hover:border-violet-500/60 hover:text-foreground")
      }
    >
      {icon}
      {label}
    </button>
  );
}
