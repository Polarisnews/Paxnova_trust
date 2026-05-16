import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireGuest } from "@/lib/auth";
import { VerifyForm } from "./VerifyForm";

export const metadata: Metadata = { title: "Verify your code" };

export default async function VerifyPage(props: {
  searchParams: Promise<{ token?: string; channel?: string; dest?: string }>;
}) {
  await requireGuest();
  const { token, channel, dest } = await props.searchParams;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elev text-center">
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find your reset request. Start again from{" "}
            <Link href="/forgot" className="text-violet-500">
              Forgot Username/Password
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  const channelLabel = channel === "sms" ? "text message" : "email";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-elev">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Enter your code
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a 6-digit code by {channelLabel}
              {dest ? ` to ${dest}` : ""}.
            </p>
          </div>
        </div>

        <VerifyForm token={token} />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Didn&apos;t get the code?{" "}
          <Link
            href="/forgot"
            className="font-medium text-violet-500 hover:text-violet-600"
          >
            Try again
          </Link>
        </p>
      </div>
    </div>
  );
}
