import type { Metadata } from "next";
import { Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Paxnova Trust Bank's websites, mobile apps, and online banking services.",
};

const EFFECTIVE_DATE = "March 1, 2026";
const LAST_UPDATED = "May 12, 2026";

const SECTIONS = [
  { id: "acceptance", label: "1. Acceptance of these Terms" },
  { id: "eligibility", label: "2. Eligibility & account opening" },
  { id: "your-account", label: "3. Your account and credentials" },
  { id: "services", label: "4. The services we provide" },
  { id: "banking-agreement", label: "5. Banking products & separate agreements" },
  { id: "electronic", label: "6. Electronic communications & E-SIGN consent" },
  { id: "fees", label: "7. Fees, interest & rates" },
  { id: "acceptable-use", label: "8. Acceptable use" },
  { id: "third-party", label: "9. Third-party content & links" },
  { id: "intellectual-property", label: "10. Intellectual property" },
  { id: "disclaimers", label: "11. Disclaimers" },
  { id: "liability", label: "12. Limitation of liability" },
  { id: "indemnification", label: "13. Indemnification" },
  { id: "termination", label: "14. Termination & suspension" },
  { id: "disputes", label: "15. Disputes, arbitration & class waiver" },
  { id: "governing-law", label: "16. Governing law" },
  { id: "changes", label: "17. Changes to these Terms" },
  { id: "contact", label: "18. Contact" },
];

export default function TermsPage() {
  return (
    <div className="space-y-8">
      <LegalHeader
        title="Terms of Service"
        effective={EFFECTIVE_DATE}
        updated={LAST_UPDATED}
        summary={`These Terms govern your access to and use of Paxnova Trust's websites and apps. By creating an account, you agree to be bound by these Terms, by your separate Deposit Account Agreement, and by any product-specific terms. If you don't agree, please don't use the services.`}
      />

      <TableOfContents sections={SECTIONS} />

      <Section id="acceptance" title="1. Acceptance of these Terms">
        <P>
          These Terms of Service (the &ldquo;Terms&rdquo;) form a binding
          agreement between you and Paxnova Trust Bank, N.A. (&ldquo;Paxnova
          Trust,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
          a national banking association chartered by the Office of the
          Comptroller of the Currency (OCC) and insured by the Federal Deposit
          Insurance Corporation (FDIC). By accessing, signing into, or
          otherwise using our websites, applications, branches, or services
          (collectively, the &ldquo;Services&rdquo;), you accept these Terms.
        </P>
        <P>
          If you do not agree, you must not use the Services. Some Services may
          be subject to additional terms (for example, your Deposit Account
          Agreement, our Wire Transfer Agreement, or our Cardholder
          Agreement). To the extent of a conflict between these Terms and a
          product-specific agreement, the product-specific agreement controls
          for that product.
        </P>
      </Section>

      <Section id="eligibility" title="2. Eligibility & account opening">
        <P>
          You must be at least 18 years old (19 in Alabama and Nebraska, 21 in
          Mississippi and Puerto Rico) and a legal U.S. resident with a valid
          U.S. taxpayer identification number to open most personal accounts.
          Business accounts require a U.S.-registered entity in good standing.
          Some products have additional eligibility criteria disclosed at the
          point of application.
        </P>
        <P>
          Federal law (the USA PATRIOT Act, Section 326) requires us to obtain,
          verify, and record information identifying every person and entity
          that opens an account. We may decline to open an account, or close an
          existing account, if we cannot verify your identity or if doing so
          would conflict with applicable law, our risk policies, or any
          sanctions program administered by OFAC.
        </P>
      </Section>

      <Section id="your-account" title="3. Your account and credentials">
        <P>
          You are responsible for the activity on any account or credential you
          control. Keep your password, biometric factors, one-time codes, and
          recovery codes confidential. Never share them with anyone — including
          someone claiming to be from Paxnova Trust. We will never call,
          email, or text you and ask for your full password or one-time codes.
        </P>
        <P>
          Notify us immediately at <strong>1-800-PAXNOVA-1</strong> if you
          believe your credentials have been compromised, your device lost or
          stolen, or any unauthorized transaction has occurred. Your potential
          liability for unauthorized electronic fund transfers is limited under
          Regulation E when you notify us promptly.
        </P>
      </Section>

      <Section id="services" title="4. The services we provide">
        <P>
          The Services include online and mobile banking, account management,
          payments, wires, card controls, statements, and customer support. We
          reserve the right to add, modify, or discontinue features at any
          time. Scheduled maintenance, service availability, transaction
          cutoffs, and limits are published in the app and on this site and may
          change to reflect operating conditions or regulatory requirements.
        </P>
      </Section>

      <Section
        id="banking-agreement"
        title="5. Banking products & separate agreements"
      >
        <P>
          Deposit accounts (Checking, Savings, CDs), credit cards, lending
          products, and brokerage and advisory products are governed by their
          own agreements, disclosures, and fee schedules — including but not
          limited to:
        </P>
        <Ul
          items={[
            "Deposit Account Agreement and Truth-in-Savings disclosures",
            "Electronic Fund Transfer Agreement (Regulation E)",
            "Cardholder Agreement and Truth-in-Lending disclosures (Regulation Z)",
            "Wire Transfer Agreement and Funds Availability Policy (Regulation CC)",
            "Paxnova Trust Wealth Advisors LLC Form ADV and advisory agreement",
            "Brokerage Customer Agreement (FINRA-member affiliate)",
          ]}
        />
        <P>
          You agree that the terms of those agreements supplement these Terms.
        </P>
      </Section>

      <Section
        id="electronic"
        title="6. Electronic communications & E-SIGN consent"
      >
        <P>
          To open an account, you consent to receive disclosures, agreements,
          tax documents (including 1099-INT, 1098, 1099-DIV), and notices
          electronically under the federal Electronic Signatures in Global and
          National Commerce Act (15 U.S.C. § 7001 et seq.). You may withdraw
          this consent at any time by writing to us — withdrawal does not
          affect the legal effectiveness, validity, or enforceability of
          electronic records or signatures predating it. To access electronic
          documents you need a current browser, a working email address, and
          (for some documents) PDF-reader software.
        </P>
      </Section>

      <Section id="fees" title="7. Fees, interest & rates">
        <P>
          Account fees, interest rates, and APYs are disclosed in your
          product&apos;s Truth-in-Savings or Truth-in-Lending disclosure and on
          our website. Variable rates are tied to externally-published indices
          and may change without prior notice except where applicable law
          requires advance notice. Fee schedules are subject to change with
          30 days&apos; written notice (or such other period as required by
          law).
        </P>
      </Section>

      <Section id="acceptable-use" title="8. Acceptable use">
        <P>You agree not to use the Services to:</P>
        <Ul
          items={[
            "Violate any applicable law, regulation, or third-party right",
            "Conduct or facilitate money laundering, terrorist financing, fraud, or sanctioned-country transactions",
            "Send unsolicited communications, viruses, or other harmful code",
            "Reverse-engineer, decompile, or attempt to extract source code from any Paxnova Trust software",
            "Use automated means (scraping, bots, scripts) without our prior written consent",
            "Impersonate another person or misrepresent your affiliation",
            "Attempt to interfere with, disrupt, or gain unauthorized access to any account, server, or network",
          ]}
        />
      </Section>

      <Section id="third-party" title="9. Third-party content & links">
        <P>
          The Services may contain links to third-party sites or content. We do
          not control and are not responsible for any third-party content or
          services. Your use of a linked site is governed by that site&apos;s
          terms and privacy policy.
        </P>
      </Section>

      <Section id="intellectual-property" title="10. Intellectual property">
        <P>
          Paxnova Trust, the Paxnova Trust mark, and the Aurora P design are
          trademarks of Paxnova Trust Bank, N.A. All other trademarks belong to
          their respective owners. Subject to your compliance with these Terms,
          we grant you a personal, limited, non-exclusive, non-transferable,
          revocable license to access and use the Services for your own
          informational and account-management purposes. All other rights are
          reserved.
        </P>
      </Section>

      <Section id="disclaimers" title="11. Disclaimers">
        <P>
          Except as expressly stated in writing, the Services are provided
          &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the maximum
          extent permitted by law, we disclaim all warranties — including
          merchantability, fitness for a particular purpose, accuracy, and
          non-infringement. Information on the Services is for general
          informational purposes only and is not financial, tax, or legal
          advice.
        </P>
      </Section>

      <Section id="liability" title="12. Limitation of liability">
        <P>
          To the maximum extent permitted by law, Paxnova Trust and our
          affiliates, directors, officers, employees, and agents will not be
          liable for indirect, incidental, special, consequential, exemplary,
          or punitive damages, or loss of profits, revenue, data, or goodwill,
          arising from or related to your use of the Services. Our aggregate
          liability for any claim arising from the Services will not exceed the
          greater of (a) the fees we received from you in the twelve months
          preceding the claim or (b) $100. Nothing in these Terms limits any
          rights or remedies that cannot be limited under applicable law,
          including Regulation E for unauthorized electronic fund transfers and
          Regulation Z for credit card billing errors.
        </P>
      </Section>

      <Section id="indemnification" title="13. Indemnification">
        <P>
          You agree to indemnify and hold harmless Paxnova Trust and our
          affiliates from any claim, loss, or expense (including reasonable
          attorneys&apos; fees) arising from your breach of these Terms, your
          misuse of the Services, or your violation of any law or third-party
          right.
        </P>
      </Section>

      <Section id="termination" title="14. Termination & suspension">
        <P>
          We may suspend or terminate your access to the Services — and close
          your account — at any time, with or without cause, in accordance
          with applicable law. We&apos;ll return any balance you are entitled
          to after deducting outstanding obligations. You may close your
          account at any time by contacting us.
        </P>
      </Section>

      <Section
        id="disputes"
        title="15. Disputes, arbitration & class waiver"
      >
        <Callout intent="warning">
          <strong>Please read carefully.</strong> This section affects how
          claims between you and Paxnova Trust are resolved. It requires most
          disputes to be resolved through binding individual arbitration rather
          than in court and waives class-action rights.
        </Callout>
        <P>
          Any dispute, claim, or controversy arising out of or relating to the
          Services or these Terms, including their formation, interpretation,
          breach, or termination (a &ldquo;Dispute&rdquo;), will be resolved by
          binding individual arbitration administered by the American
          Arbitration Association under its Consumer Arbitration Rules,
          except that either party may bring a qualifying small-claims action
          and either party may seek temporary injunctive relief in court.
        </P>
        <P>
          You and Paxnova Trust each waive any right to a jury trial and any
          right to participate in a class, collective, or representative
          action. The arbitrator may not consolidate claims or preside over a
          representative or class proceeding. You may opt out of this
          arbitration agreement within 30 days of first accepting these Terms
          by emailing <strong>arbitration-opt-out@paxnovatrust.com</strong>{" "}
          with your account email and a clear statement of opt-out intent.
        </P>
      </Section>

      <Section id="governing-law" title="16. Governing law">
        <P>
          These Terms are governed by the laws of the State of New York and
          applicable U.S. federal law, without regard to conflict-of-laws
          rules. Subject to the arbitration provision above, any action must
          be brought in the state or federal courts located in New York
          County, New York.
        </P>
      </Section>

      <Section id="changes" title="17. Changes to these Terms">
        <P>
          We may update these Terms from time to time. Material changes will be
          posted on this page and, where required by law, sent to your
          designated electronic address with at least 30 days&apos; notice
          before the effective date. Your continued use of the Services after
          changes take effect constitutes acceptance.
        </P>
      </Section>

      <Section id="contact" title="18. Contact">
        <P>
          Paxnova Trust Bank, N.A.
          <br />
          Attn: Office of the General Counsel
          <br />
          1000 N Point St, San Francisco, CA 94109
          <br />
          Email:{" "}
          <a
            href="mailto:legal@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            legal@paxnovatrust.com
          </a>
          <br />
          Phone: 1-800-PAXNOVA-1
        </P>
      </Section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Shared layout helpers — exported from this file so other legal pages
// can re-import them without a separate component module.
// ──────────────────────────────────────────────────────────────────────

export function LegalHeader({
  title,
  effective,
  updated,
  summary,
}: {
  title: string;
  effective: string;
  updated: string;
  summary: string;
}) {
  return (
    <header>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
        Paxnova Trust Bank, N.A.
      </p>
      <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective {effective} · Last updated {updated}
      </p>
      <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm leading-relaxed">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-violet-500" />
          <p>
            <strong className="font-semibold">Plain-language summary:</strong>{" "}
            {summary}
          </p>
        </div>
      </div>
    </header>
  );
}

export function TableOfContents({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  return (
    <nav
      aria-label="On this page"
      className="rounded-2xl border border-border bg-card p-5"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        On this page
      </p>
      <ol className="grid gap-1 sm:grid-cols-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="block rounded-md px-2 py-1.5 text-sm text-foreground/85 transition hover:bg-muted hover:text-violet-500"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

export function Ul({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-1 space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            aria-hidden
            className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-violet-500"
          />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

export function Callout({
  intent = "info",
  children,
}: {
  intent?: "info" | "warning";
  children: React.ReactNode;
}) {
  const tone =
    intent === "warning"
      ? "border-gold-500/30 bg-gold-500/8"
      : "border-violet-500/20 bg-violet-500/5";
  return (
    <div className={`rounded-xl border p-4 text-sm ${tone}`}>{children}</div>
  );
}
