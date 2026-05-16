import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Check,
  Clock,
  DollarSign,
  Globe2,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Zelle vs. Wires — which one to use",
};

export default function PaymentMethodsLearnMorePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link
          href="/dashboard/transfer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to Send money
        </Link>
      </div>

      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Help
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Zelle vs. Wires &amp; global transfers
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Both options move money out of your Paxnova Trust account — but they
          use different networks, settle on different timelines, and suit
          different kinds of payments. Here&apos;s how to choose.
        </p>
      </header>

      {/* Side-by-side cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        <MethodCard
          tone="violet"
          Icon={Zap}
          name="Zelle®"
          tagline="Pay people and small businesses you trust"
          best="Day-to-day payments to a friend, family member, contractor, or local merchant who already uses Zelle at their bank."
          spec={[
            ["Speed", "Usually within minutes"],
            ["Fee", "No fee from Paxnova Trust"],
            ["Daily limit", "$5,000"],
            ["What you need", "Recipient's email or U.S. mobile number"],
            ["Reach", "U.S. banks that participate in the Zelle network"],
            ["Reversible?", "No — confirm details before sending"],
          ]}
        />
        <MethodCard
          tone="navy"
          Icon={Building2}
          name="Wires & global transfers"
          tagline="Send larger amounts, across banks, around the world"
          best="High-value payments — real estate, tuition, international suppliers — or anything where you need a formal banking record."
          spec={[
            ["Speed", "1 to 5 business days"],
            ["Fee", "$0 to $40 depending on destination"],
            ["Daily limit", "$100,000"],
            [
              "What you need",
              "Recipient bank routing / SWIFT code, account number, address",
            ],
            ["Reach", "Domestic + international banks worldwide"],
            ["Reversible?", "Very limited — wires are usually final"],
          ]}
        />
      </div>

      {/* When to use which */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          A quick rule of thumb
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CompareList
            heading="Reach for Zelle when…"
            tone="success"
            items={[
              "You're sending under $5,000",
              "The recipient is in the U.S.",
              "You already have their email or mobile number",
              "You want it to land in minutes",
              "You're paying a person — not a business invoice that needs bank-to-bank traceability",
            ]}
          />
          <CompareList
            heading="Reach for a wire when…"
            tone="violet"
            items={[
              "You're sending a large or one-time amount",
              "The recipient is at another bank — domestic or international",
              "You have their full bank routing / SWIFT details",
              "You need a formal wire slip for records, closing, or compliance",
              "A few business days is acceptable",
            ]}
          />
        </div>
      </section>

      {/* Process timeline for wires */}
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          How a wire moves through Paxnova Trust
        </h2>
        <ol className="mt-4 space-y-4">
          <Step
            n={1}
            title="You schedule the wire"
            body="Pick a recipient, an amount, and a wire date. Funds are reserved on your source account."
          />
          <Step
            n={2}
            title="Operations review"
            body="A Paxnova Trust officer verifies the wire details. If compliance gates are enabled on your account, you may be prompted for a verification code."
          />
          <Step
            n={3}
            title="Released to the network"
            body="Once approved, the wire is submitted to the Fedwire (domestic) or SWIFT (international) network. The recipient bank typically credits the beneficiary the same business day."
          />
          <Step
            n={4}
            title="Confirmation"
            body="Your dashboard switches the wire status to Completed and a printable wire slip becomes available."
          />
        </ol>
      </section>

      {/* Safety notes */}
      <section className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-500">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Before you send — anything</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-violet-500" />
                Call the recipient on a phone number you already trust to
                confirm bank details. Don&apos;t rely on details from an email.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-violet-500" />
                Never share verification codes, passwords, or PINs — Paxnova Trust
                will never ask for them by email or text.
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-violet-500" />
                If a transaction feels rushed or off, pause. Money sent through
                Zelle or wire is almost always final.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/dashboard/transfer/send-money"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold hover:bg-muted"
        >
          <Zap className="size-4" />
          Send with Zelle
        </Link>
        <Link
          href="/dashboard/transfer/wires"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-violet-500 px-6 text-sm font-semibold text-white hover:bg-violet-600"
        >
          <Building2 className="size-4" />
          Schedule a wire
        </Link>
      </div>
    </div>
  );
}

function MethodCard({
  tone,
  Icon,
  name,
  tagline,
  best,
  spec,
}: {
  tone: "violet" | "navy";
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  tagline: string;
  best: string;
  spec: [string, string][];
}) {
  const badgeCls =
    tone === "violet"
      ? "bg-violet-500/10 text-violet-500"
      : "bg-navy-900 text-white";
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex size-12 items-center justify-center rounded-full ${badgeCls}`}
        >
          <Icon className="size-6" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {name}
          </h2>
          <p className="text-xs text-muted-foreground">{tagline}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-foreground">
        <strong>Best for:</strong> {best}
      </p>
      <dl className="mt-5 grid gap-2 text-sm">
        {spec.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-2 last:border-0 last:pb-0"
          >
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function CompareList({
  heading,
  items,
  tone,
}: {
  heading: string;
  items: string[];
  tone: "success" | "violet";
}) {
  const iconCls =
    tone === "success"
      ? "bg-success/15 text-success"
      : "bg-violet-500/15 text-violet-500";
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {heading}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span
              className={`mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full ${iconCls}`}
            >
              <Check className="size-3" />
            </span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-500 text-xs font-bold text-white">
        {n}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}
