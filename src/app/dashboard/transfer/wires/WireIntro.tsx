"use client";

import Link from "next/link";
import { useState } from "react";
import { Globe2, ShieldCheck, TagIcon } from "lucide-react";

export function WireIntro() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center shadow-soft">
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          A smarter way to move your money
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Whether you&apos;re sending funds to a relative across town or paying
          an overseas supplier, Paxnova Trust wires get your money where it needs
          to go quickly, safely, and without surprises.
        </p>

        <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
          <Feature
            Icon={Globe2}
            heading="Send domestically &amp; worldwide"
            body="Schedule wire transfers any time, day or night."
          />
          <Feature
            Icon={ShieldCheck}
            heading="Security you can trust"
            body="Every wire is monitored end-to-end to help keep your funds protected."
          />
          <Feature
            Icon={TagIcon}
            heading="Transparent pricing"
            body="Know your fee before you send. No surprise charges."
          />
        </div>

        <label className="mx-auto mt-12 flex max-w-xl items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 text-left text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-violet-500"
          />
          <span>
            I&apos;ve read and agree to the{" "}
            <Link
              href="/legal/wire-transfer-terms"
              target="_blank"
              rel="noreferrer"
              className="text-violet-500 underline"
            >
              Online Wire Transfer Terms
            </Link>{" "}
            and the{" "}
            <Link
              href="/legal/global-transfer-services"
              target="_blank"
              rel="noreferrer"
              className="text-violet-500 underline"
            >
              Paxnova Trust Global Transfer Services Agreement
            </Link>
            .
          </span>
        </label>

        <div className="mt-6 flex justify-center">
          <Link
            href={agreed ? "/dashboard/transfer/wires/recipients" : "#"}
            aria-disabled={!agreed}
            onClick={(e) => {
              if (!agreed) e.preventDefault();
            }}
            className={
              "inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-8 text-sm font-semibold text-white transition " +
              (agreed
                ? "hover:bg-violet-600"
                : "cursor-not-allowed opacity-50")
            }
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}

function Feature({
  Icon,
  heading,
  body,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  heading: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
        <Icon className="size-5" />
      </span>
      <p
        className="mt-3 font-semibold"
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
