import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { requireGuest } from "@/lib/auth";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  await requireGuest();
  const { token } = await props.searchParams;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elev text-center">
          <p className="text-sm text-muted-foreground">
            Your reset link is missing or expired.{" "}
            <Link href="/forgot" className="text-violet-500">
              Start over
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-elev">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
            <Lock className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Set a new password
            </h1>
            <p className="text-sm text-muted-foreground">
              At least 8 characters, with an uppercase letter and a number.
            </p>
          </div>
        </div>

        <ResetForm token={token} />
      </div>
    </div>
  );
}
