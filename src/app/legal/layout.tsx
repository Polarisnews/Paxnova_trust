import type { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility,
  FileText,
  Globe2,
  Lock,
  Scale,
  Send,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: { default: "Legal", template: "%s · Paxnova Trust" },
};

const LEGAL_PAGES = [
  { href: "/legal/terms", label: "Terms of Service", icon: FileText },
  { href: "/legal/privacy", label: "Privacy Notice", icon: Lock },
  {
    href: "/legal/accessibility",
    label: "Accessibility",
    icon: Accessibility,
  },
  { href: "/legal/fdic", label: "FDIC Notice", icon: ShieldCheck },
  { href: "/legal/compliance", label: "Compliance", icon: Scale },
];

const PRODUCT_AGREEMENTS = [
  {
    href: "/legal/wire-transfer-terms",
    label: "Online Wire Transfer Terms",
    icon: Send,
  },
  {
    href: "/legal/global-transfer-services",
    label: "Global Transfer Services",
    icon: Globe2,
  },
];

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            Legal &amp; disclosures
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            How Paxnova Trust operates, in writing.
          </h1>
          <p className="mt-3 max-w-3xl text-white/75">
            Every page below is reviewed by Paxnova Trust&apos;s General Counsel
            and our prudential regulators. The plain-language summaries are
            informational; the binding text is in the full body of each notice.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar nav */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              On this site
            </p>
            <nav aria-label="Legal pages">
              <ul className="space-y-1">
                {LEGAL_PAGES.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group/legal flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition hover:border-border hover:bg-card"
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted text-foreground/70 group-hover/legal:bg-violet-500 group-hover/legal:text-white">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1 font-medium">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mb-2 mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Product agreements
              </p>
              <ul className="space-y-1">
                {PRODUCT_AGREEMENTS.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group/legal flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition hover:border-border hover:bg-card"
                    >
                      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-muted text-foreground/70 group-hover/legal:bg-violet-500 group-hover/legal:text-white">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1 font-medium">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Need a copy?</p>
              <p className="mt-1">
                You may request any of these notices in PDF — or in a language
                other than English — by emailing{" "}
                <a
                  href="mailto:legal@paxnovatrust.com"
                  className="text-violet-500 hover:text-violet-600"
                >
                  legal@paxnovatrust.com
                </a>
                .
              </p>
            </div>
          </aside>

          {/* Main content */}
          <article className="min-w-0">{children}</article>
        </div>
      </section>
    </>
  );
}
