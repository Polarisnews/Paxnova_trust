import type { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  FileText,
  Globe2,
  Lock,
  Scale,
  Send,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Legal & disclosures",
  description:
    "Paxnova Trust Bank's terms of service, privacy notice, accessibility statement, FDIC notice, and compliance disclosures.",
};

const PAGES = [
  {
    href: "/legal/terms",
    title: "Terms of Service",
    description:
      "The agreement between you and Paxnova Trust governing use of our websites, apps, and online banking services.",
    icon: FileText,
    updated: "May 12, 2026",
  },
  {
    href: "/legal/privacy",
    title: "Privacy Notice",
    description:
      "How we collect, use, share, and protect your personal information under the Gramm-Leach-Bliley Act, CCPA, and other privacy laws.",
    icon: Lock,
    updated: "April 22, 2026",
  },
  {
    href: "/legal/accessibility",
    title: "Accessibility Statement",
    description:
      "Our WCAG 2.1 AA commitment for digital experiences, plus ADA accommodations across branches and ATMs.",
    icon: Accessibility,
    updated: "May 5, 2026",
  },
  {
    href: "/legal/fdic",
    title: "FDIC Notice",
    description:
      "How FDIC deposit insurance protects your money — what's insured, what isn't, and how to maximize coverage.",
    icon: ShieldCheck,
    updated: "April 30, 2026",
  },
  {
    href: "/legal/compliance",
    title: "Compliance",
    description:
      "Our regulatory framework — OCC, FDIC, CFPB, FinCEN, OFAC — plus your rights under Reg E, Reg Z, FCRA, and how to file a complaint.",
    icon: Scale,
    updated: "May 1, 2026",
  },
  {
    href: "/legal/wire-transfer-terms",
    title: "Online Wire Transfer Terms",
    description:
      "Cutoff times, fees, recall mechanics, and your rights under UCC Article 4A for every domestic wire you send through the app.",
    icon: Send,
    updated: "April 28, 2026",
  },
  {
    href: "/legal/global-transfer-services",
    title: "Global Transfer Services Agreement",
    description:
      "How FX rates are set, what intermediary banks may deduct, OFAC screening, FinCEN Travel-Rule data, and FATCA / FBAR obligations for international wires.",
    icon: Globe2,
    updated: "May 6, 2026",
  },
];

export default function LegalIndexPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
          Paxnova Trust Bank, N.A.
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Disclosures &amp; policies, in plain English (and the full legal
          text).
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every page below opens with a plain-language summary, followed by
          the binding text. Effective dates and revision history are at the
          top of each document.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {PAGES.map(({ href, title, description, icon: Icon, updated }) => (
          <li key={href}>
            <Link
              href={href}
              className="group/legal flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-violet-500 hover:shadow-soft"
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 group-hover/legal:bg-violet-500 group-hover/legal:text-white">
                  <Icon className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold leading-tight">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Updated {updated}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover/legal:translate-x-0.5 group-hover/legal:text-violet-500" />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        Need a previous version of any document? Email{" "}
        <a
          href="mailto:legal@paxnovatrust.com"
          className="text-violet-500 hover:text-violet-600"
        >
          legal@paxnovatrust.com
        </a>{" "}
        with the document name and effective date you need.
      </p>
    </div>
  );
}
