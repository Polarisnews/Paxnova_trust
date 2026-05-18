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
  title: "Global Transfer Services Agreement",
  description:
    "The agreement that governs international wires, foreign-currency transfers, FX conversion, and SWIFT messaging through Paxnova Trust.",
};

const EFFECTIVE_DATE = "January 1, 2026";
const LAST_UPDATED = "May 6, 2026";

const SECTIONS = [
  { id: "scope", label: "1. Scope of this Agreement" },
  { id: "definitions", label: "2. Definitions" },
  { id: "info-required", label: "3. Information you must provide" },
  { id: "fx", label: "4. Currency conversion & FX rates" },
  { id: "charges", label: "5. Charge codes — OUR, SHA, BEN" },
  { id: "fees", label: "6. Fees & intermediary deductions" },
  { id: "limits", label: "7. Limits & risk holds" },
  { id: "swift", label: "8. SWIFT messaging & routing" },
  { id: "sanctions", label: "9. Sanctions & OFAC compliance" },
  { id: "bsa", label: "10. BSA, AML & FinCEN reporting" },
  { id: "country", label: "11. Country & corridor restrictions" },
  { id: "recall", label: "12. Recall, amendment & cancellation" },
  { id: "returns", label: "13. Refused, rejected & returned payments" },
  { id: "fatca", label: "14. FATCA, FBAR & tax obligations" },
  { id: "liability", label: "15. Liability & UCC § 4A" },
  { id: "bilingual", label: "16. Disclosures in other languages" },
  { id: "force", label: "17. Force majeure" },
  { id: "governing", label: "18. Governing law & disputes" },
  { id: "contact", label: "19. Contact us" },
];

export default function GlobalTransferServicesPage() {
  return (
    <div className="space-y-8">
      <LegalHeader
        title="Paxnova Trust Global Transfer Services Agreement"
        effective={EFFECTIVE_DATE}
        updated={LAST_UPDATED}
        summary={`This Agreement governs every wire transfer you send through Paxnova Trust that crosses a U.S. border or is denominated in a non-U.S. currency. It explains how exchange rates are calculated, what intermediary banks may deduct, why certain countries are restricted, what we must report to FinCEN and OFAC, and what your rights are when something goes wrong.`}
      />

      <TableOfContents sections={SECTIONS} />

      <Section id="scope" title="1. Scope of this Agreement">
        <P>
          This Paxnova Trust Global Transfer Services Agreement (the
          &ldquo;Agreement&rdquo;) governs international wire transfers and
          any wire denominated in or settled in a non-U.S. currency
          (collectively, &ldquo;International Wires&rdquo;) that you
          initiate through Paxnova Trust&apos;s websites, mobile apps,
          branches, or by phone. Domestic U.S. wires are governed instead
          by the <strong>Online Wire Transfer Terms</strong>.
        </P>
        <P>
          This Agreement supplements your Deposit Account Agreement and
          any product-specific terms. Where there is a direct conflict
          relating to an International Wire, this Agreement controls.
        </P>
      </Section>

      <Section id="definitions" title="2. Definitions">
        <Ul
          items={[
            <>
              <strong>&ldquo;Beneficiary&rdquo;</strong> &mdash; the person
              or entity receiving the funds.
            </>,
            <>
              <strong>&ldquo;Beneficiary Bank&rdquo;</strong> &mdash; the
              non-U.S. or U.S. financial institution where the
              Beneficiary&apos;s account is held.
            </>,
            <>
              <strong>&ldquo;Correspondent Bank&rdquo;</strong> /{" "}
              <strong>&ldquo;Intermediary Bank&rdquo;</strong> &mdash; any
              bank that stands between Paxnova Trust and the Beneficiary
              Bank in the payment chain. Multiple intermediaries are common.
            </>,
            <>
              <strong>&ldquo;FX Rate&rdquo;</strong> &mdash; the exchange
              rate at which we will convert one currency to another for an
              International Wire, including the spread retained by Paxnova
              Trust as described in Section 4.
            </>,
            <>
              <strong>&ldquo;ISO 20022 / MX&rdquo;</strong> &mdash; the
              ISO-standard XML messaging format progressively replacing the
              legacy SWIFT MT message set in 2025–2026.
            </>,
            <>
              <strong>&ldquo;OFAC&rdquo;</strong> &mdash; the U.S.
              Treasury&apos;s Office of Foreign Assets Control, the agency
              responsible for administering economic and trade sanctions.
            </>,
            <>
              <strong>&ldquo;SWIFT&rdquo;</strong> &mdash; the Society for
              Worldwide Interbank Financial Telecommunication, the
              cooperative that operates the global secure messaging network
              used to instruct International Wires.
            </>,
            <>
              <strong>&ldquo;Travel Rule&rdquo;</strong> &mdash; 31 CFR §
              1010.410(f), which requires us to include certain originator
              information on every Funds Transfer of $3,000 or more.
            </>,
          ]}
        />
      </Section>

      <Section
        id="info-required"
        title="3. Information you must provide"
      >
        <P>
          To execute an International Wire we are required to obtain &mdash;
          and the Beneficiary Bank, intermediary banks, and regulators may
          rely on &mdash; the following information for each Payment Order:
        </P>
        <Ul
          items={[
            "Beneficiary's full legal name and residential or registered address",
            "Beneficiary's account number or IBAN (mandatory in the European Economic Area)",
            "Beneficiary Bank's BIC/SWIFT code, full name, and address",
            "Where required, the intermediary or correspondent bank BIC/SWIFT",
            "Currency code (ISO 4217) and amount",
            "Purpose-of-payment statement and, for transfers above $10,000-equivalent, source-of-funds detail",
            "Your tax-residency country (FATCA Form W-9 or W-8BEN on file)",
          ]}
        />
        <P>
          Some corridors require additional fields &mdash; for example, IFSC
          (India), CLABE (Mexico), CNAPS (China), routing-code variants
          (Australia BSB, Canada Transit + Institution), or a national tax
          identifier. Our app prompts for these inline when the corridor is
          selected.
        </P>
      </Section>

      <Section id="fx" title="4. Currency conversion & FX rates">
        <P>
          When the Wire is denominated in a currency other than U.S. dollars
          (or when you fund a USD wire and the Beneficiary Bank requires
          local-currency settlement), Paxnova Trust converts the funds at
          our then-current FX Rate. The FX Rate is:
        </P>
        <Ul
          items={[
            "Derived from a mid-market reference rate sourced from our liquidity providers (typically Bloomberg, Refinitiv, or our prime-brokerage feed)",
            "Adjusted by a transparent spread shown on the review screen before you confirm — typically 0.40% to 1.20% depending on currency and amount",
            "Locked at the moment you confirm the Payment Order, not at the moment the Wire actually settles",
            "Subject to change without notice between confirmations as market conditions move",
          ]}
        />
        <Callout intent="warning">
          The FX Rate at which the Beneficiary Bank converts a USD wire it
          receives may differ from the FX Rate you would have seen if you
          had converted to local currency on our side. To lock the rate you
          actually receive, send the Wire in the local currency.
        </Callout>
      </Section>

      <Section
        id="charges"
        title="5. Charge codes — OUR, SHA, BEN"
      >
        <P>
          For every International Wire you must select a charge-code under
          ISO 11649:
        </P>
        <Ul
          items={[
            <>
              <strong>OUR</strong> &mdash; you pay all charges, including
              intermediary-bank charges. The Beneficiary receives the full
              wire amount.
            </>,
            <>
              <strong>SHA</strong> &mdash; you pay Paxnova Trust&apos;s
              outgoing fee; the Beneficiary pays any intermediary and
              receiving-bank fees out of the wire amount. Default for most
              consumer wires.
            </>,
            <>
              <strong>BEN</strong> &mdash; the Beneficiary pays all fees,
              including ours, deducted from the wire amount.
            </>,
          ]}
        />
        <P>
          Intermediary-bank deductions under SHA and BEN are typically{" "}
          <strong>$15 – $40 per intermediary</strong>. Paxnova Trust does
          not control intermediary-bank fees and cannot guarantee the
          deducted amount in advance. The actual amount credited to the
          Beneficiary may be less than the amount you sent.
        </P>
      </Section>

      <Section
        id="fees"
        title="6. Fees & intermediary deductions"
      >
        <P>
          Our standard outgoing International Wire fee is{" "}
          <strong>$40 (USD-denominated)</strong> or{" "}
          <strong>$25 (foreign-currency-denominated)</strong>, plus the FX
          spread if applicable. Fees in effect for a Wire are those displayed
          at confirmation. Investigations and amendments are $50 per
          request. We may waive or rebate fees as part of relationship
          pricing.
        </P>
      </Section>

      <Section id="limits" title="7. Limits & risk holds">
        <P>
          Your default outgoing International Wire limit is{" "}
          <strong>$100,000-equivalent per Business Day</strong>. Larger
          relationships unlock higher limits subject to underwriting and
          enhanced due diligence. We may place any Wire on hold for
          additional review and may decline any Wire that would conflict
          with our risk policies or applicable law.
        </P>
      </Section>

      <Section id="swift" title="8. SWIFT messaging & routing">
        <P>
          We send International Wires primarily as SWIFT MT 103 / pacs.008
          messages over SWIFT&apos;s gpi rails. gpi-enabled wires offer
          end-to-end tracking, intermediary-fee transparency, and confirmed
          credit messages. Where a Beneficiary Bank is not on gpi, we use
          legacy MT 103 with status messages where available.
        </P>
        <P>
          Once we release a Wire to SWIFT, settlement passes through one or
          more correspondent banks before reaching the Beneficiary Bank.
          Settlement typically completes in <strong>1–3 Business Days</strong>{" "}
          for major-currency corridors. Less-liquid corridors may take up
          to <strong>5 Business Days</strong>.
        </P>
      </Section>

      <Section id="sanctions" title="9. Sanctions & OFAC compliance">
        <P>
          Every International Wire is screened in real time against the
          OFAC Specially Designated Nationals (SDN) list and other
          sanctioned-party lists (the EU Consolidated List, the U.K.
          OFSI list, U.N. Security Council Consolidated List, and various
          country-specific sanctions). If a Wire matches any listed party
          or country &mdash; including a name match that turns out to be
          false &mdash; we are required by law to:
        </P>
        <Ul
          items={[
            "Block or reject the Wire (we cannot return blocked funds without OFAC authorization)",
            "Report the transaction to OFAC within ten Business Days",
            "Request additional information from you to support a license application where appropriate",
          ]}
        />
        <P>
          We are prohibited from sending Wires to or through sanctioned
          jurisdictions, including (without limitation) Cuba, Iran, North
          Korea, Syria, and the so-called &ldquo;Donetsk People&apos;s
          Republic,&rdquo; &ldquo;Luhansk People&apos;s Republic,&rdquo; and
          Crimea regions of Ukraine. The list of sanctioned parties and
          jurisdictions changes; we apply the program in effect at the
          moment of settlement.
        </P>
      </Section>

      <Section
        id="bsa"
        title="10. BSA, AML & FinCEN reporting"
      >
        <P>
          Paxnova Trust is required under the Bank Secrecy Act to file the
          following reports for International Wires:
        </P>
        <Ul
          items={[
            "Currency Transaction Reports (CTRs) for cash transactions involving an International Wire that aggregate to more than $10,000 in a single Business Day (31 CFR § 1010.311)",
            "Suspicious Activity Reports (SARs) when a Wire shows red-flag indicators of money laundering, terrorist financing, fraud, or evasion of reporting thresholds (31 CFR § 1020.320)",
            "Travel Rule data on every Wire of $3,000 or more — originator name, address, account number, beneficiary name and account, amount, and date (31 CFR § 1010.410(f))",
          ]}
        />
        <P>
          By submitting a Payment Order you authorize us to include the
          Travel Rule information &mdash; including your name, address, and
          tax-residency country &mdash; on the SWIFT message and to share
          that data with intermediary banks, the Beneficiary Bank, and
          regulators in any jurisdiction touched by the payment chain.
        </P>
      </Section>

      <Section
        id="country"
        title="11. Country & corridor restrictions"
      >
        <P>
          Beyond the sanctioned jurisdictions above, we maintain a list of{" "}
          <strong>high-risk corridors</strong> that require enhanced due
          diligence and may take longer to process. We may, in our sole
          discretion, decline a Wire to any country or any Beneficiary Bank
          that does not meet our risk standards or our correspondent
          banking program. The current list of supported corridors is
          available inside the app under{" "}
          <strong>Transfer → Wires → Supported countries</strong>.
        </P>
      </Section>

      <Section
        id="recall"
        title="12. Recall, amendment & cancellation"
      >
        <P>
          Once an International Wire has been released to SWIFT, recall is
          not guaranteed and is entirely subject to the Beneficiary
          Bank&apos;s discretion and the law of the Beneficiary&apos;s
          jurisdiction. On your written request we will:
        </P>
        <Ul
          items={[
            "Send a SWIFT MT 192 (or pacs.007) cancellation request along the original payment chain",
            "Apply the $50 investigation fee whether or not the recall succeeds",
            "Return any recovered funds to your account in the original currency, after any intermediary deductions and FX losses",
          ]}
        />
        <P>
          Future-dated International Wires can be cancelled up until 4:00
          p.m. Eastern Time on the Business Day before the scheduled wire
          date.
        </P>
      </Section>

      <Section
        id="returns"
        title="13. Refused, rejected & returned payments"
      >
        <P>
          A Wire may be refused or returned at the Beneficiary Bank because
          of incorrect Beneficiary information, account closure, sanctions
          screening, internal policy at the receiving institution, or
          regulatory requirements in the receiving country. When a Wire is
          returned:
        </P>
        <Ul
          items={[
            "We credit the returned amount to your account in U.S. dollars at the FX Rate in effect on the date the funds are received back",
            "You bear any FX gain or loss between the original conversion and the return",
            "Intermediary deductions taken on the outbound and return legs are not recoverable from Paxnova Trust",
            "If the return is delayed beyond 10 Business Days, we will open an investigation at your request (investigation fee applies)",
          ]}
        />
      </Section>

      <Section
        id="fatca"
        title="14. FATCA, FBAR & tax obligations"
      >
        <P>
          You are responsible for your own tax reporting in connection with
          International Wires, including:
        </P>
        <Ul
          items={[
            "FBAR (FinCEN Form 114) if you have a financial interest in or signature authority over foreign accounts whose aggregate value exceeds $10,000 at any point in the calendar year",
            "Form 8938 (Statement of Specified Foreign Financial Assets) under FATCA if you exceed the applicable threshold",
            "Form 3520 for certain large foreign gifts and inheritances",
            "Reporting income earned abroad on your U.S. federal income-tax return",
          ]}
        />
        <P>
          Paxnova Trust complies with FATCA and the Common Reporting
          Standard (CRS) where applicable. We may withhold 30% on certain
          U.S.-source payments to non-U.S. payees who have not provided a
          valid W-8.
        </P>
      </Section>

      <Section
        id="liability"
        title="15. Liability & UCC § 4A"
      >
        <P>
          International Wires are governed by UCC Article 4A as adopted by
          the State of New York where not preempted by federal law or the
          law of a relevant non-U.S. jurisdiction. Subject to applicable
          law:
        </P>
        <Ul
          items={[
            "Our liability for any error, delay, or failure to execute an International Wire is limited to actually-incurred losses and interest at the federal funds rate.",
            "We are NOT liable for indirect, consequential, special, exemplary, or punitive damages — including lost business or lost profit.",
            "We are NOT liable for the acts, omissions, fees, or insolvency of any intermediary or Beneficiary Bank.",
            "We are NOT liable for FX-rate movements between submission and settlement.",
            "Any claim for an unauthorized or improperly-executed International Wire must be reported within ONE (1) YEAR of the statement reflecting the Wire.",
          ]}
        />
      </Section>

      <Section
        id="bilingual"
        title="16. Disclosures in other languages"
      >
        <P>
          On request we will provide this Agreement in Spanish, Mandarin,
          Cantonese, Korean, Vietnamese, Tagalog, French, or Portuguese.
          The English version is the binding text in case of any conflict.
          Translated copies are available from{" "}
          <a
            href="mailto:legal@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            legal@paxnovatrust.com
          </a>
          .
        </P>
      </Section>

      <Section id="force" title="17. Force majeure">
        <P>
          We are not liable for any failure to perform under this Agreement
          caused by circumstances beyond our reasonable control &mdash;
          including but not limited to network outages affecting SWIFT,
          Fedwire, or any correspondent bank; armed conflict; sanctions or
          embargoes imposed after a Payment Order is accepted; natural
          disasters; pandemics; government actions; or extended civil
          unrest in a corridor.
        </P>
      </Section>

      <Section
        id="governing"
        title="18. Governing law & disputes"
      >
        <P>
          This Agreement is governed by federal U.S. law and, to the extent
          not preempted, by the laws of the State of New York (including UCC
          Article 4A) without regard to conflict-of-laws principles. Any
          dispute arising under this Agreement is subject to the binding
          arbitration and class-action-waiver provisions of the Paxnova
          Trust Terms of Service, except that either party may seek
          temporary injunctive relief in a court of competent jurisdiction
          in New York County, New York.
        </P>
      </Section>

      <Section id="contact" title="19. Contact us">
        <P>
          Paxnova Trust Bank, N.A.
          <br />
          Attn: Global Transfer Services
          <br />
          1000 N Point St, San Francisco, CA 94109
          <br />
          Phone: 1-800-PAXNOVA-1 (24/7)
          <br />
          Email:{" "}
          <a
            href="mailto:globaltransfers@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            globaltransfers@paxnovatrust.com
          </a>
        </P>
      </Section>
    </div>
  );
}
