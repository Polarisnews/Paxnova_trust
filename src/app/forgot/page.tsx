import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, UserSearch } from "lucide-react";
import { requireGuest } from "@/lib/auth";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Forgot Username or Password" };

export default async function ForgotPage() {
  await requireGuest();
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-elev">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Account recovery
            </h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ll help you back into your account.
            </p>
          </div>
        </div>

        <ForgotForm />

        <p className="mt-6 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <UserSearch className="size-3" />
          Remembered after all?{" "}
          <Link
            href="/signin"
            className="font-medium text-violet-500 hover:text-violet-600"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
