import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { requireGuest } from "@/lib/auth";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = { title: "Open an account" };

const benefits = [
  "FDIC-insured up to $250,000",
  "4.85% APY on savings, no minimums",
  "Approved in 8 minutes, opened in 24 hours",
  "Zero monthly fees on every personal account",
];

export default async function SignUpPage() {
  await requireGuest();

  return (
    <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col items-stretch gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 lg:py-24">
      <aside className="hidden w-full max-w-md flex-col justify-between rounded-2xl bg-navy-900 p-8 text-white shadow-elev lg:flex">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">
            Banking, refined.
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight">
            Open a Nova Trust account in minutes.
          </h1>
          <p className="mt-4 text-white/70">
            One account, every product. The fastest way to bank like the next decade
            is already here.
          </p>
          <ul className="mt-8 space-y-3">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-300" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-12 text-xs text-white/50">
          Equal Housing Lender · Member FDIC
        </p>
      </aside>

      <div className="w-full max-w-md flex-1">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elev">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All you need is an email and a strong password. We&apos;ll open a Checking
            account on the spot.
          </p>

          <div className="mt-6">
            <SignUpForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already a customer?{" "}
            <Link
              href="/signin"
              className="font-medium text-violet-500 hover:text-violet-600"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
