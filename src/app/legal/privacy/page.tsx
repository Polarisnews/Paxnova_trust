import type { Metadata } from "next";
import {
  Callout,
  LegalHeader,
  P,
  Section,
  TableOfContents,
  Ul,
} from "@/app/legal/terms/page";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "How Paxnova Trust Bank collects, uses, shares, and protects your personal information — under the Gramm-Leach-Bliley Act, CCPA, and other applicable law.",
};

const EFFECTIVE_DATE = "March 1, 2026";
const LAST_UPDATED = "April 22, 2026";

const SECTIONS = [
  { id: "scope", label: "1. Scope of this Notice" },
  { id: "collect", label: "2. Information we collect" },
  { id: "use", label: "3. How we use your information" },
  { id: "share", label: "4. How we share — GLBA categories" },
  { id: "rights", label: "5. Your rights (CCPA / state law)" },
  { id: "opt-out", label: "6. Opt-out of sharing" },
  { id: "cookies", label: "7. Cookies & tracking" },
  { id: "children", label: "8. Children's privacy (COPPA)" },
  { id: "security", label: "9. Data security" },
  { id: "retention", label: "10. Data retention" },
  { id: "international", label: "11. International transfers" },
  { id: "changes", label: "12. Changes to this Notice" },
  { id: "contact", label: "13. Contact our Privacy Officer" },
];

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <LegalHeader
        title="Privacy Notice"
        effective={EFFECTIVE_DATE}
        updated={LAST_UPDATED}
        summary={`We collect the information needed to identify you, run your accounts, and meet our legal obligations as a bank. We do not sell your personal information. You have the right to access, correct, and (in many cases) delete the data we hold, and to opt out of certain sharing.`}
      />

      <TableOfContents sections={SECTIONS} />

      <Section id="scope" title="1. Scope of this Notice">
        <P>
          This Privacy Notice describes how Paxnova Trust Bank, N.A. and our
          affiliates (collectively, &ldquo;Paxnova Trust&rdquo;) collect, use,
          share, and protect personal information when you visit our websites,
          use our mobile applications, open or maintain accounts, apply for
          credit, or otherwise interact with us. It is published in compliance
          with the federal Gramm-Leach-Bliley Act (15 U.S.C. § 6801 et seq.),
          the California Consumer Privacy Act as amended (Cal. Civ. Code §
          1798.100 et seq.), and other applicable state and federal privacy
          law.
        </P>
      </Section>

      <Section id="collect" title="2. Information we collect">
        <P>
          We collect personal information from you, from third parties (credit
          bureaus, identity-verification providers, public records), and from
          our own observations of your interactions with our Services. The
          categories of information we collect include:
        </P>
        <Ul
          items={[
            "Identifiers — name, address, date of birth, taxpayer ID (SSN/EIN), driver's-license or passport number, IP address, device identifiers",
            "Contact information — phone, email, mailing address, preferred language",
            "Financial information — account numbers, balances, transaction history, credit history, income, employment",
            "Commercial information — products purchased, application history",
            "Internet activity — pages viewed, links clicked, app interactions, time stamps",
            "Geolocation — IP-derived city/state and (with your consent) precise mobile location",
            "Biometric data — voiceprints for phone authentication; on-device biometric templates remain on your device",
            "Audio / image — calls to our service desk (recorded with notice) and uploaded ID documents",
            "Sensitive categories — SSN, account credentials, government-issued ID details; collected only as needed to identify you or to deliver requested services",
          ]}
        />
      </Section>

      <Section id="use" title="3. How we use your information">
        <P>We process personal information to:</P>
        <Ul
          items={[
            "Open and maintain your account, including identity verification under USA PATRIOT Act § 326",
            "Process transactions and meet record-keeping obligations under the Bank Secrecy Act",
            "Underwrite credit and verify employment/income (Regulation B, Fair Credit Reporting Act)",
            "Detect, prevent, and investigate fraud, money laundering, and unauthorized access",
            "Provide customer service, including authenticated phone, secure-message, and branch support",
            "Communicate with you about your account, products, and required regulatory disclosures",
            "Tailor your experience and, with consent, market additional products that may interest you",
            "Comply with court orders, subpoenas, regulatory exams, and law-enforcement requests",
          ]}
        />
      </Section>

      <Section id="share" title="4. How we share — GLBA categories">
        <P>
          We share personal information in the ordinary course of running a
          bank. Under the Gramm-Leach-Bliley Act, we disclose the following
          categories:
        </P>
        <Ul
          items={[
            "To process transactions, service accounts, or report to credit bureaus — sharing is permitted by law and you cannot opt out",
            "To our affiliates (e.g., Paxnova Trust Wealth Advisors LLC) for everyday business purposes such as cross-product servicing — you may not opt out of this sharing under federal law, but state law (such as Vermont) may grant additional rights",
            "To our affiliates for marketing — you can opt out (see Section 6)",
            "To service providers under contractual confidentiality obligations (cloud, document storage, KYC vendors, fraud-screening, mailers, card processors)",
            "To unaffiliated joint-marketing partners — limited and contractually restricted; you can opt out",
            "To regulators, law enforcement, courts, and credit bureaus as required by law",
          ]}
        />
        <P>
          <strong>We do not sell your personal information</strong> for money
          or other valuable consideration, and we do not engage in
          cross-context behavioral advertising as defined under California law.
        </P>
      </Section>

      <Section id="rights" title="5. Your rights (CCPA & state law)">
        <P>
          Depending on where you live, you may have the following rights with
          respect to your personal information:
        </P>
        <Ul
          items={[
            "Know what personal information we have collected, used, disclosed, or sold/shared in the prior 12 months",
            "Access a portable copy of the personal information we hold about you",
            "Correct inaccurate personal information we maintain",
            "Delete personal information, subject to exceptions for legal record-keeping (we are required to keep most banking records for at least five years)",
            "Limit our use and disclosure of sensitive personal information beyond what is necessary to deliver requested services",
            "Opt out of sale or sharing of personal information (we do not sell; we honor opt-out requests for any sharing covered by state law)",
            "Receive non-discriminatory service if you exercise any right above",
            "Designate an authorized agent to submit a request on your behalf",
          ]}
        />
        <P>
          To exercise a right, sign into your account and visit{" "}
          <strong>Settings → Privacy</strong>, email{" "}
          <a
            href="mailto:privacy@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            privacy@paxnovatrust.com
          </a>
          , or call <strong>1-800-PAXNOVA-1</strong>. We will verify your
          identity before responding and may take up to 45 days, with one
          45-day extension where reasonable.
        </P>
      </Section>

      <Section id="opt-out" title="6. Opt-out of sharing">
        <P>You may opt out of the following:</P>
        <Ul
          items={[
            "Affiliate sharing for marketing — under the Fair Credit Reporting Act § 624",
            "Joint-marketing arrangements with unaffiliated third parties",
            "Receiving prescreened credit / insurance offers (1-888-5-OPT-OUT or optoutprescreen.com)",
          ]}
        />
        <P>
          To opt out, sign into your account, visit{" "}
          <strong>Settings → Communications &amp; Sharing</strong>, or contact
          us at <strong>privacy@paxnovatrust.com</strong>. Opt-outs typically
          take effect within 30 days.
        </P>
      </Section>

      <Section id="cookies" title="7. Cookies & tracking">
        <P>
          We and authorized service providers use cookies, pixels, SDKs, and
          similar technologies to keep you signed in, prevent fraud, remember
          preferences, measure performance, and (with your consent) personalize
          marketing. You can manage non-essential cookies via the &ldquo;Cookie
          settings&rdquo; link in the footer or your browser settings.
          We honor the Global Privacy Control signal for residents of
          jurisdictions that recognize it.
        </P>
      </Section>

      <Section id="children" title="8. Children's privacy (COPPA)">
        <P>
          Our Services are not directed to children under 13, and we do not
          knowingly collect personal information from anyone under 13 (or
          under 16 in jurisdictions where stricter standards apply). If you
          believe we have collected information from a child, please contact
          our Privacy Officer immediately and we will delete it.
        </P>
      </Section>

      <Section id="security" title="9. Data security">
        <P>
          We follow the safeguards required by the Federal Financial
          Institutions Examination Council (FFIEC) and the Gramm-Leach-Bliley
          Safeguards Rule. Controls include encryption in transit (TLS 1.2+)
          and at rest (AES-256), multi-factor authentication, role-based
          access, hardware-backed key management, continuous monitoring, and
          annual penetration testing by independent firms.
        </P>
        <Callout>
          <strong>No system is perfect.</strong> If you suspect unauthorized
          access to your account, contact us within 60 days of the statement
          showing the unauthorized activity. Reporting promptly may protect
          your funds under Regulation E.
        </Callout>
      </Section>

      <Section id="retention" title="10. Data retention">
        <P>
          We retain personal information for as long as your account is open
          and for the periods required by law thereafter — generally five
          years from your last transaction under the Bank Secrecy Act, seven
          years for IRS-reportable records, and longer for certain anti-money-
          laundering records. After the required retention period we either
          delete or anonymize the data.
        </P>
      </Section>

      <Section id="international" title="11. International transfers">
        <P>
          We process and store personal information in the United States.
          Where we transfer personal information to vendors outside the U.S.
          for limited service-delivery purposes, we use contractual safeguards
          and, where applicable, the EU Standard Contractual Clauses.
        </P>
      </Section>

      <Section id="changes" title="12. Changes to this Notice">
        <P>
          We will post material changes here and, where required by law,
          notify you in advance by email or in-app banner. The &ldquo;Last
          updated&rdquo; date at the top of this page indicates when the
          notice was last revised.
        </P>
      </Section>

      <Section id="contact" title="13. Contact our Privacy Officer">
        <P>
          Paxnova Trust Bank, N.A.
          <br />
          Attn: Chief Privacy Officer
          <br />
          1000 N Point St, San Francisco, CA 94109
          <br />
          Email:{" "}
          <a
            href="mailto:privacy@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            privacy@paxnovatrust.com
          </a>
          <br />
          Phone: 1-800-PAXNOVA-1
        </P>
      </Section>
    </div>
  );
}
