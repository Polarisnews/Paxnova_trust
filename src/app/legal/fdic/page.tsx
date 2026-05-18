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
  title: "FDIC Notice",
  description:
    "How FDIC deposit insurance works at Paxnova Trust — what's covered, what's not, and how to maximize protection.",
};

const EFFECTIVE_DATE = "January 1, 2026";
const LAST_UPDATED = "April 30, 2026";

const SECTIONS = [
  { id: "basics", label: "1. FDIC insurance basics" },
  { id: "covered", label: "2. What's insured" },
  { id: "not-covered", label: "3. What's not insured" },
  { id: "categories", label: "4. Ownership categories & coverage" },
  { id: "max-coverage", label: "5. Maximizing your coverage" },
  { id: "joint", label: "6. Joint accounts & beneficiaries" },
  { id: "retirement", label: "7. Retirement accounts (IRAs)" },
  { id: "business", label: "8. Business & nonprofit deposits" },
  { id: "failure", label: "9. What happens if a bank fails" },
  { id: "advertising", label: "10. The FDIC sign & advertising rule" },
  { id: "more", label: "11. More information" },
];

export default function FdicPage() {
  return (
    <div className="space-y-8">
      <LegalHeader
        title="FDIC Notice & Deposit Insurance Overview"
        effective={EFFECTIVE_DATE}
        updated={LAST_UPDATED}
        summary={`Deposits at Paxnova Trust Bank, N.A. are insured by the FDIC up to $250,000 per depositor, per insured bank, per ownership category. Investments, crypto, and uninsured products are NOT FDIC-insured and may lose value.`}
      />

      <Callout intent="info">
        <strong>FDIC-insured.</strong> Paxnova Trust Bank, N.A. (FDIC Cert. No.
        2026-NT) is a Member FDIC institution. Backed by the full faith and
        credit of the U.S. government.
      </Callout>

      <TableOfContents sections={SECTIONS} />

      <Section id="basics" title="1. FDIC insurance basics">
        <P>
          The Federal Deposit Insurance Corporation (FDIC) is an independent
          agency of the United States government that protects depositors of
          insured banks against the loss of their deposits if the bank fails.
          The FDIC is backed by the full faith and credit of the United States
          government. No depositor has ever lost a penny of insured funds as a
          result of a bank failure since the FDIC was established in 1933.
        </P>
        <P>
          The standard insurance amount is{" "}
          <strong>$250,000 per depositor, per insured bank, for each
          account ownership category</strong>. This means a single individual
          can be insured for substantially more than $250,000 at one bank by
          using multiple ownership categories (see Section 4 below).
        </P>
      </Section>

      <Section id="covered" title="2. What's insured">
        <P>FDIC deposit insurance covers all types of deposits, including:</P>
        <Ul
          items={[
            "Checking accounts (Apex Checking and business operating accounts)",
            "Savings accounts (Reserve High-Yield Savings and business savings)",
            "Money market deposit accounts",
            "Certificates of Deposit (CDs)",
            "Negotiable Order of Withdrawal (NOW) accounts",
            "Cashier's checks, money orders, and other official bank items issued by us",
          ]}
        />
      </Section>

      <Section id="not-covered" title="3. What's not insured">
        <P>
          The FDIC does <strong>not</strong> insure non-deposit investment
          products, even when offered through an insured bank. Specifically:
        </P>
        <Ul
          items={[
            "Stocks, bonds, mutual funds, and ETFs",
            "Brokerage and managed-portfolio assets at Paxnova Trust Wealth Advisors LLC (these are protected by SIPC, not FDIC)",
            "Annuities, life insurance, and crypto-asset positions",
            "Safe-deposit-box contents",
            "U.S. Treasury bills, notes, and bonds (these are backed directly by the U.S. government but are not FDIC-insured)",
            "Cryptocurrency, NFTs, and digital-asset products",
          ]}
        />
        <Callout intent="warning">
          <strong>Important:</strong> Investments at Paxnova Trust Wealth
          Advisors LLC and our broker-dealer affiliate are{" "}
          <strong>not FDIC-insured</strong>, are <strong>not bank
          deposits</strong>, are <strong>not guaranteed by the bank</strong>,
          and <strong>may lose value</strong>. Brokerage accounts are protected
          by SIPC up to $500,000 (including $250,000 for cash claims) against
          the failure of the broker-dealer — not against market loss.
        </Callout>
      </Section>

      <Section id="categories" title="4. Ownership categories & coverage">
        <P>
          The FDIC provides $250,000 of coverage <strong>per ownership
          category</strong>. A single person can be insured for far more than
          $250,000 at a single bank by spreading deposits across multiple
          categories. The most common categories at Paxnova Trust are:
        </P>
        <Ul
          items={[
            "Single accounts — owned by one person, $250,000 of coverage",
            "Joint accounts — owned by two or more people, $250,000 per co-owner ($500,000 for a two-person joint account)",
            "Certain retirement accounts (IRAs) — $250,000 of coverage, separate from non-retirement deposits at the same bank",
            "Revocable trust accounts (POD/Totten) — $250,000 per unique beneficiary, up to five beneficiaries",
            "Irrevocable trust accounts — $250,000 per unique beneficiary",
            "Employee Benefit Plan accounts — coverage on a pass-through basis to each participant's non-contingent interest",
            "Corporation, partnership, and unincorporated association accounts — $250,000 per entity",
            "Government accounts — coverage by category under 12 CFR § 330.15",
          ]}
        />
      </Section>

      <Section id="max-coverage" title="5. Maximizing your coverage">
        <P>You can increase your protection by:</P>
        <Ul
          items={[
            "Adding a joint owner — a two-person joint account is insured to $500,000",
            "Naming a beneficiary on a revocable trust (POD/ITF) — adds $250,000 per beneficiary, up to five",
            "Opening an IRA in addition to a checking/savings account — the IRA has its own $250,000",
            "Spreading deposits across multiple FDIC-insured banks (Paxnova Trust offers a sweep program that allocates excess deposits to network banks for additional FDIC coverage — see your Account Agreement)",
          ]}
        />
        <P>
          The FDIC's free <strong>Electronic Deposit Insurance Estimator
          (EDIE)</strong> at{" "}
          <a
            href="https://edie.fdic.gov"
            target="_blank"
            rel="noreferrer"
            className="text-violet-500 hover:text-violet-600"
          >
            edie.fdic.gov
          </a>{" "}
          will calculate your exact coverage in under a minute. Our private
          bankers will also walk through it with you on request.
        </P>
      </Section>

      <Section id="joint" title="6. Joint accounts & beneficiaries">
        <P>
          To qualify as a joint account for FDIC purposes, all of the following
          must be true: (1) all co-owners are living natural persons; (2) all
          co-owners have equal withdrawal rights; and (3) all co-owners have
          signed the account signature card (or the bank&apos;s electronic
          equivalent at opening). Each co-owner is insured up to $250,000 for
          all joint accounts at the same bank combined.
        </P>
      </Section>

      <Section id="retirement" title="7. Retirement accounts (IRAs)">
        <P>
          Deposit-based Traditional, Roth, Rollover, SEP, and SIMPLE IRAs at
          Paxnova Trust are aggregated and insured up to $250,000 — separate
          from your non-retirement deposits. Retirement assets invested in
          mutual funds, ETFs, or other securities (even when held in an IRA)
          are not FDIC-insured; they are protected by SIPC.
        </P>
      </Section>

      <Section id="business" title="8. Business & nonprofit deposits">
        <P>
          Corporation, partnership, LLC, and unincorporated association
          deposits are insured up to $250,000 per legal entity, per bank.
          Sole-proprietorships are insured under the owner&apos;s Single
          Account category. Nonprofit accounts qualify on a pass-through
          basis to the named beneficiaries where the deposit-broker rules
          permit.
        </P>
      </Section>

      <Section id="failure" title="9. What happens if a bank fails">
        <P>
          If an FDIC-insured bank fails, the FDIC pays insured deposits as
          quickly as possible — usually by the next business day. Funds are
          paid by check, by transfer to an account at a successor bank, or by
          opening a new account at another insured bank. Uninsured amounts are
          paid as dividends from the recovered assets of the failed bank, on
          a pro-rata basis.
        </P>
      </Section>

      <Section id="advertising" title="10. The FDIC sign & advertising rule">
        <P>
          The FDIC official sign &mdash; &ldquo;Member FDIC&rdquo; &mdash;
          appears in our branch lobbies, on our ATMs, on the homepage of our
          website, in our mobile app sign-in screen, and on disclosures for
          deposit products. As required by 12 CFR Part 328, we never imply that
          non-deposit investment products are FDIC-insured. When deposit and
          non-deposit products appear together, we clearly distinguish them.
        </P>
      </Section>

      <Section id="more" title="11. More information">
        <Ul
          items={[
            <>
              FDIC Consumer Hotline:{" "}
              <strong>1-877-ASK-FDIC (1-877-275-3342)</strong>
            </>,
            <>
              Online:{" "}
              <a
                href="https://www.fdic.gov"
                target="_blank"
                rel="noreferrer"
                className="text-violet-500 hover:text-violet-600"
              >
                fdic.gov
              </a>{" "}
              · <a
                href="https://edie.fdic.gov"
                target="_blank"
                rel="noreferrer"
                className="text-violet-500 hover:text-violet-600"
              >
                edie.fdic.gov
              </a>
            </>,
            <>
              Mail: FDIC, Attention: Consumer Response Center, 1100 Walnut St.,
              Box #11, Kansas City, MO 64106
            </>,
            <>
              Paxnova Trust Customer Service: <strong>1-800-PAXNOVA-1</strong>{" "}
              — ask for the Deposit Insurance Help desk for a free coverage
              review
            </>,
          ]}
        />
      </Section>
    </div>
  );
}
