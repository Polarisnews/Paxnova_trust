import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ApplyForm } from "./ApplyForm";

export const metadata: Metadata = { title: "Open an account" };

const PRODUCTS: Record<
  string,
  { label: string; tagline: string; openingMin: number }
> = {
  checking: {
    label: "Apex Checking",
    tagline: "No-fee everyday banking with smart insights.",
    openingMin: 0,
  },
  savings: {
    label: "Reserve High-Yield Savings",
    tagline: "4.85% APY, FDIC-insured, no minimums.",
    openingMin: 0,
  },
  "credit-card": {
    label: "Signature Rewards Card",
    tagline: "Travel and cash back without the fine print.",
    openingMin: 0,
  },
  mortgage: {
    label: "Nova Mortgage Pre-approval",
    tagline: "Pre-approved in 8 minutes, closed in 21 days.",
    openingMin: 0,
  },
  business: {
    label: "Business Operating Account",
    tagline: "From your first invoice to your IPO.",
    openingMin: 250,
  },
};

const benefits = [
  "Fully digital, paperless application",
  "Soft credit pull — no impact to your score",
  "Approved in minutes, funded the same business day",
  "$250,000 FDIC insurance on every deposit account",
];

export default async function ApplyPage(props: {
  searchParams: Promise<{ product?: string }>;
}) {
  const { product } = await props.searchParams;
  const user = await getCurrentUser();
  const selected = product && PRODUCTS[product] ? product : "checking";
  const info = PRODUCTS[selected];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 lg:py-24">
      <aside className="hidden w-full max-w-md flex-col rounded-2xl bg-navy-900 p-8 text-white lg:flex">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-300">
          Opening your {info.label}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight">
          A bank built for who you&apos;ll be tomorrow.
        </h1>
        <p className="mt-3 text-white/70">{info.tagline}</p>
        <ul className="mt-8 space-y-3">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-gold-300" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-12 text-xs text-white/50">
          Equal Housing Lender · Member FDIC
        </p>
      </aside>

      <div className="flex-1">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elev">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Application
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes about 3 minutes. We&apos;ll email you the next step.
          </p>
          <div className="mt-6">
            <ApplyForm
              defaultProduct={selected}
              prefill={
                user
                  ? {
                      name: `${user.firstName} ${user.lastName}`,
                      email: user.email,
                      phone: user.phone ?? "",
                    }
                  : undefined
              }
            />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            By submitting you authorize Nova Trust Bank to verify the information
            you provide. See our{" "}
            <Link href="/about" className="text-violet-500 hover:underline">
              privacy notice
            </Link>{" "}
            for details.
          </p>
        </div>
      </div>
    </div>
  );
}
