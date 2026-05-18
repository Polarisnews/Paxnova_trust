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
  title: "Compliance & Regulatory Disclosures",
  description:
    "The regulatory framework that governs Paxnova Trust Bank — and the programs we operate to comply.",
};

const EFFECTIVE_DATE = "January 1, 2026";
const LAST_UPDATED = "May 1, 2026";

const SECTIONS = [
  { id: "framework", label: "1. Regulatory framework" },
  { id: "bsa-aml", label: "2. BSA / AML / OFAC program" },
  { id: "cip", label: "3. Customer Identification Program (CIP)" },
  { id: "fcra", label: "4. Fair Credit Reporting Act" },
  { id: "ecoa", label: "5. Equal Credit Opportunity Act" },
  { id: "cra", label: "6. Community Reinvestment Act" },
  { id: "scra", label: "7. Servicemembers Civil Relief Act" },
  { id: "reg-e", label: "8. Regulation E — your EFT rights" },
  { id: "reg-z", label: "9. Regulation Z — your credit-card rights" },
  { id: "reg-cc", label: "10. Regulation CC — funds availability" },
  { id: "complaints", label: "11. How to file a complaint" },
  { id: "whistleblower", label: "12. Whistleblower & ethics hotline" },
  { id: "contact", label: "13. Contact our Compliance Officer" },
];

export default function CompliancePage() {
  return (
    <div className="space-y-8">
      <LegalHeader
        title="Compliance & Regulatory Disclosures"
        effective={EFFECTIVE_DATE}
        updated={LAST_UPDATED}
        summary={`Paxnova Trust Bank, N.A. is supervised by the OCC, insured by the FDIC, and subject to the same federal banking laws as the largest U.S. institutions. This page summarizes the consumer-facing pieces of our compliance program and tells you how to raise a concern.`}
      />

      <TableOfContents sections={SECTIONS} />

      <Section id="framework" title="1. Regulatory framework">
        <P>
          Paxnova Trust Bank, N.A. is a national banking association chartered
          by the Office of the Comptroller of the Currency (OCC). Our
          principal regulators include:
        </P>
        <Ul
          items={[
            "Office of the Comptroller of the Currency (OCC) — primary prudential supervisor",
            "Federal Deposit Insurance Corporation (FDIC) — deposit insurance and resolution authority",
            "Federal Reserve Bank of San Francisco — for monetary-policy-related supervision",
            "Consumer Financial Protection Bureau (CFPB) — consumer-protection rules",
            "Financial Crimes Enforcement Network (FinCEN) — Bank Secrecy Act administrator",
            "Office of Foreign Assets Control (OFAC) — sanctions enforcement",
            "Securities and Exchange Commission (SEC) and FINRA — for our broker-dealer affiliate",
            "Each state where we operate — through the state banking department",
          ]}
        />
      </Section>

      <Section id="bsa-aml" title="2. BSA / AML / OFAC program">
        <P>
          Paxnova Trust maintains a comprehensive Bank Secrecy Act and Anti-
          Money Laundering compliance program reasonably designed to detect
          and report money laundering, terrorist financing, and other illicit
          finance activity. The program includes:
        </P>
        <Ul
          items={[
            "A board-approved policy and a designated BSA Officer",
            "Risk-based customer due diligence (CDD) and enhanced due diligence (EDD) for higher-risk relationships",
            "Beneficial ownership identification for legal-entity customers (FinCEN's CDD Rule, 31 CFR § 1010.230)",
            "Real-time and post-transaction surveillance with case management and SAR filing",
            "Currency Transaction Reports (CTRs) for cash transactions over $10,000",
            "OFAC sanctions screening on every transaction and party",
            "Annual independent testing and ongoing training for relevant employees",
          ]}
        />
      </Section>

      <Section id="cip" title="3. Customer Identification Program (CIP)">
        <P>
          As required by Section 326 of the USA PATRIOT Act, we obtain,
          verify, and record information identifying every person and entity
          that opens an account: name, date of birth (for individuals), tax
          identification number, and a physical address. We may also ask for
          a government-issued photo ID or perform documentary or non-
          documentary verification (electronic identity-proofing,
          knowledge-based questions, public records).
        </P>
      </Section>

      <Section id="fcra" title="4. Fair Credit Reporting Act">
        <P>
          When you apply for a credit product, we may obtain a consumer
          report. Under the Fair Credit Reporting Act (15 U.S.C. § 1681) you
          have the right to:
        </P>
        <Ul
          items={[
            "Receive a free copy of the report we used if we deny your application",
            "Dispute inaccurate or incomplete information directly with the consumer reporting agency",
            "Place a fraud alert or security freeze on your file",
            "Opt out of prescreened credit offers at 1-888-5-OPT-OUT or optoutprescreen.com",
          ]}
        />
        <P>
          We furnish accurate account information to the major consumer
          reporting agencies on a monthly basis and investigate every dispute
          within the time periods required by law.
        </P>
      </Section>

      <Section id="ecoa" title="5. Equal Credit Opportunity Act & Fair Lending">
        <P>
          The federal Equal Credit Opportunity Act (15 U.S.C. § 1691) prohibits
          creditors from discriminating against any applicant on the basis of
          race, color, religion, national origin, sex (including sexual
          orientation and gender identity), marital status, age (provided the
          applicant has the capacity to contract); because all or part of the
          applicant&apos;s income comes from any public assistance program; or
          because the applicant has in good faith exercised any right under
          the Consumer Credit Protection Act.
        </P>
        <P>
          Paxnova Trust is also an Equal Housing Lender under the Fair Housing
          Act. Our lending decisions are based on creditworthiness — not on
          any prohibited basis. We file Home Mortgage Disclosure Act (HMDA)
          data annually and make our modified Loan Application Register
          available to the public on request.
        </P>
      </Section>

      <Section id="cra" title="6. Community Reinvestment Act">
        <P>
          The Community Reinvestment Act (12 U.S.C. § 2901) requires us to
          help meet the credit needs of the entire communities we serve,
          including low- and moderate-income (LMI) neighborhoods. Our most
          recent CRA Performance Evaluation from the OCC rated Paxnova Trust{" "}
          <strong>Outstanding</strong>. Our CRA Public File — including the
          full evaluation, our assessment areas, and our affiliate-CRA
          election — is available at every branch and online at{" "}
          <a
            href="/about#community"
            className="text-violet-500 hover:text-violet-600"
          >
            paxnovatrust.com/about#community
          </a>
          .
        </P>
      </Section>

      <Section id="scra" title="7. Servicemembers Civil Relief Act">
        <P>
          We honor the protections of the Servicemembers Civil Relief Act (50
          U.S.C. App. § 3901 et seq.) for active-duty servicemembers, including
          a 6% cap on pre-service obligations, foreclosure protections, and
          lease-termination rights. Eligible servicemembers can submit a
          written request along with a copy of their orders to{" "}
          <a
            href="mailto:scra@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            scra@paxnovatrust.com
          </a>{" "}
          for prompt application of these benefits.
        </P>
      </Section>

      <Section id="reg-e" title="8. Regulation E — your EFT rights">
        <P>
          Regulation E (12 CFR Part 1005) gives you rights when an electronic
          fund transfer (EFT) is made from your consumer account. If your
          statement shows an EFT you did not authorize, notify us within{" "}
          <strong>60 days</strong> of the statement to limit your liability:
        </P>
        <Ul
          items={[
            "Within 2 business days of learning of the loss or theft: up to $50",
            "After 2 business days but before 60 days: up to $500",
            "After 60 days: potentially unlimited for the unauthorized transfers in that period",
          ]}
        />
        <P>
          To dispute an EFT, call <strong>1-800-PAXNOVA-1</strong>, send a
          secure message in the app, or write to our Compliance Officer at the
          address below.
        </P>
      </Section>

      <Section id="reg-z" title="9. Regulation Z — your credit-card rights">
        <P>
          Regulation Z (12 CFR Part 1026) implements the Truth-in-Lending Act
          and gives you the right to dispute billing errors on credit-card
          statements within 60 days, to receive periodic statements with
          clear cost disclosures, and to have your liability for unauthorized
          credit-card use capped at $50. We will not bill you for any disputed
          amount or interest on that amount while we investigate.
        </P>
      </Section>

      <Section id="reg-cc" title="10. Regulation CC — funds availability">
        <P>
          Our Funds Availability Policy explains when deposits become
          available for withdrawal. Most electronic deposits (direct deposit,
          wires, internal transfers) are available the same business day. Most
          checks are available the next business day, subject to standard
          exception holds for new accounts, large deposits ($5,525 or more in
          a single banking day), and certain repeated overdrafts. Our full
          policy is included in your Deposit Account Agreement.
        </P>
      </Section>

      <Section id="complaints" title="11. How to file a complaint">
        <P>
          We work hard to resolve every concern internally. If you are not
          satisfied with our response, you may escalate to our regulators:
        </P>
        <Ul
          items={[
            <>
              <strong>OCC Customer Assistance Group</strong> — for national
              banks. Online:{" "}
              <a
                href="https://helpwithmybank.gov"
                target="_blank"
                rel="noreferrer"
                className="text-violet-500 hover:text-violet-600"
              >
                helpwithmybank.gov
              </a>{" "}
              · Phone: 1-800-613-6743 · Mail: P.O. Box 53570, Houston, TX
              77052
            </>,
            <>
              <strong>Consumer Financial Protection Bureau (CFPB)</strong> —
              Online:{" "}
              <a
                href="https://www.consumerfinance.gov/complaint"
                target="_blank"
                rel="noreferrer"
                className="text-violet-500 hover:text-violet-600"
              >
                consumerfinance.gov/complaint
              </a>{" "}
              · Phone: 1-855-411-2372
            </>,
            <>
              <strong>FDIC Consumer Response Center</strong> — Phone: 1-877-
              ASK-FDIC · Online:{" "}
              <a
                href="https://www.fdic.gov/resources/consumers/consumer-assistance-topics/index.html"
                target="_blank"
                rel="noreferrer"
                className="text-violet-500 hover:text-violet-600"
              >
                fdic.gov
              </a>
            </>,
          ]}
        />
      </Section>

      <Section id="whistleblower" title="12. Whistleblower & ethics hotline">
        <Callout>
          <strong>EthicsLine — anonymous, 24/7.</strong>
          <br />
          1-855-PAX-ETHICS · ethics@paxnovatrust.com ·{" "}
          <a
            href="https://paxnovatrust.ethicspoint.com"
            target="_blank"
            rel="noreferrer"
            className="text-violet-500 hover:text-violet-600"
          >
            paxnovatrust.ethicspoint.com
          </a>
        </Callout>
        <P>
          Employees, customers, vendors, and members of the public can report
          suspected misconduct anonymously through our EthicsLine, operated
          by an independent third party. Federal law protects whistleblowers
          from retaliation; Paxnova Trust does not tolerate retaliation in any
          form. Reports involving financial reporting are also escalated to
          our Audit Committee independently of management.
        </P>
      </Section>

      <Section id="contact" title="13. Contact our Compliance Officer">
        <P>
          Paxnova Trust Bank, N.A.
          <br />
          Attn: Chief Compliance Officer
          <br />
          1000 N Point St, San Francisco, CA 94109
          <br />
          Email:{" "}
          <a
            href="mailto:compliance@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            compliance@paxnovatrust.com
          </a>
          <br />
          Phone: 1-800-PAXNOVA-1
        </P>
      </Section>
    </div>
  );
}
