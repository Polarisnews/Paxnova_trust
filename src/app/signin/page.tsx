import Link from "next/link";
import type { Metadata } from "next";
import { Fingerprint, Lock, ShieldCheck } from "lucide-react";
import { requireGuest } from "@/lib/auth";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await props.searchParams;
  await requireGuest();

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-start lg:gap-16 lg:px-8 lg:py-24">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elev">
          <div className="mb-6 space-y-1">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your Nova Trust account.
            </p>
          </div>

          <SignInForm next={next} />

          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            disabled
            title="Coming soon"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2.5 text-sm font-medium text-muted-foreground"
          >
            <Fingerprint className="size-4" />
            Sign in with biometrics (coming soon)
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New to Nova Trust?{" "}
            <Link
              href="/signup"
              className="font-medium text-violet-500 hover:text-violet-600"
            >
              Open an account
            </Link>
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-muted/60 p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo accounts</p>
          <p className="mt-1">
            User · <code className="font-mono">demo@nova.test</code> /{" "}
            <code className="font-mono">Demo123!</code>
          </p>
          <p className="mt-0.5">
            Admin · <code className="font-mono">admin@nova.test</code> /{" "}
            <code className="font-mono">Admin123!</code>
          </p>
        </div>
      </div>

      <aside className="w-full max-w-md space-y-6 lg:pt-2">
        <div className="rounded-2xl bg-navy-900 p-6 text-white shadow-elev">
          <ShieldCheck className="size-6 text-gold-300" />
          <h2 className="mt-3 font-display text-xl font-semibold">
            Security tips
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>• Nova Trust will never call to ask for your password or one-time codes.</li>
            <li>• Always confirm the URL begins with <code className="font-mono text-gold-300">novatrust.com</code> before signing in.</li>
            <li>• Enable biometric and device-bound passkeys in Security settings.</li>
            <li>• If something feels off, freeze your cards from the dashboard immediately.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-border p-6">
          <Lock className="size-5 text-violet-500" />
          <h3 className="mt-2 font-semibold">Forgot your password?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Reset it using your registered email and a one-time code sent to your phone.
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex text-sm font-medium text-violet-500 hover:text-violet-600"
          >
            Start password reset →
          </Link>
        </div>
      </aside>
    </div>
  );
}
