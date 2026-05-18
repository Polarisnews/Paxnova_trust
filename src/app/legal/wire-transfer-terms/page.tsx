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
  title: "Online Wire Transfer Terms",
  description:
    "The terms that govern domestic wire transfers initiated through Paxnova Trust's online and mobile banking — your rights, our liability, fees, cutoff times, and how to recall a wire.",
};

const EFFECTIVE_DATE = "January 1, 2026";
const LAST_UPDATED = "April 28, 2026";

const SECTIONS = [
  { id: "scope", label: "1. Scope of these Terms" },
  { id: "definitions", label: "2. Definitions" },
  { id: "eligibility", label: "3. Eligibility & enrollment" },
  { id: "authorization", label: "4. Authorization & authentication" },
  { id: "cutoff", label: "5. Cutoff times & processing schedule" },
  { id: "fees", label: "6. Fees" },
  { id: "limits", label: "7. Limits & risk-based holds" },
  { id: "recall", label: "8. Recall, cancellation & corrections" },
  { id: "ucc4a", label: "9. UCC Article 4A — your rights, our liability" },
  { id: "errors", label: "10. Erroneous transfers & duplicate payments" },
  { id: "unauthorized", label: "11. Notice of unauthorized transfers" },
  { id: "fraud", label: "12. Fraud screening & call-back verification" },
  { id: "records", label: "13. Records, statements & receipts" },
  { id: "responsibility", label: "14. Your responsibilities" },
  { id: "suspension", label: "15. Suspension & termination" },
  { id: "amendments", label: "16. Amendments" },
  { id: "governing", label: "17. Governing law & venue" },
  { id: "contact", label: "18. Contact us" },
];

export default function WireTransferTermsPage() {
  return (
    <div className="space-y-8">
      <LegalHeader
        title="Online Wire Transfer Terms"
        effective={EFFECTIVE_DATE}
        updated={LAST_UPDATED}
        summary={`These terms govern domestic wire transfers you initiate through Paxnova Trust online banking and the mobile app. They explain when wires cut off, what they cost, how to recall one if you make a mistake, and exactly what your rights and our liability look like under UCC Article 4A.`}
      />

      <TableOfContents sections={SECTIONS} />

      <Section id="scope" title="1. Scope of these Terms">
        <P>
          These Online Wire Transfer Terms (the &ldquo;Terms&rdquo;) form a
          binding agreement between you and Paxnova Trust Bank, N.A.
          (&ldquo;Paxnova Trust,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) and govern every domestic U.S. wire transfer
          (each, a &ldquo;Wire&rdquo;) that you initiate through Paxnova
          Trust&apos;s websites, mobile apps, or any other electronic channel
          we may make available. International wires and any wire denominated
          in or settled in a non-U.S. currency are governed instead by the{" "}
          <strong>Paxnova Trust Global Transfer Services Agreement</strong>.
        </P>
        <P>
          These Terms supplement &mdash; and where there is a direct
          conflict, control &mdash; the broader Deposit Account Agreement and
          Electronic Fund Transfer Agreement that apply to your account, but
          only with respect to Wires.
        </P>
      </Section>

      <Section id="definitions" title="2. Definitions">
        <Ul
          items={[
            <>
              <strong>&ldquo;Beneficiary&rdquo;</strong> &mdash; the person or
              entity who receives the Wire.
            </>,
            <>
              <strong>&ldquo;Beneficiary Bank&rdquo;</strong> &mdash; the
              financial institution where the Beneficiary holds an account.
            </>,
            <>
              <strong>&ldquo;Business Day&rdquo;</strong> &mdash; Monday
              through Friday excluding U.S. federal banking holidays.
            </>,
            <>
              <strong>&ldquo;Fedwire&rdquo;</strong> &mdash; the real-time
              gross-settlement service operated by the Federal Reserve Banks
              used for most domestic Wires.
            </>,
            <>
              <strong>&ldquo;Funds Transfer&rdquo;</strong> &mdash; the
              series of transactions, beginning with your Payment Order, that
              moves money to the Beneficiary, as defined in UCC § 4A-104.
            </>,
            <>
              <strong>&ldquo;Payment Order&rdquo;</strong> &mdash; the
              instruction you give us to make a Wire.
            </>,
            <>
              <strong>&ldquo;Security Procedure&rdquo;</strong> &mdash; the
              combination of credentials, multi-factor authentication,
              transaction codes (TCV), and behavioral signals we use to
              verify the authenticity of a Payment Order.
            </>,
          ]}
        />
      </Section>

      <Section id="eligibility" title="3. Eligibility & enrollment">
        <P>
          You must be a current Paxnova Trust personal or business customer
          in good standing to initiate a Wire online. Some accounts (for
          example, certain custodial or fiduciary accounts) are not eligible
          for self-service wires. We may decline to enroll an account, or
          unenroll an account at any time, in our sole discretion, including
          if doing so would conflict with applicable law, our risk policies,
          or any sanctions program administered by the U.S. Treasury&apos;s
          Office of Foreign Assets Control (OFAC).
        </P>
      </Section>

      <Section id="authorization" title="4. Authorization & authentication">
        <P>
          A Payment Order is authorized when it is sent through your
          authenticated session and validated by our Security Procedure. By
          submitting a Payment Order you agree that:
        </P>
        <Ul
          items={[
            "The Security Procedure is commercially reasonable in light of the size of your account, your transaction history, and industry practice for similarly-situated customers.",
            "We may treat any Payment Order received through your authenticated session as authorized by you, even if it was actually sent by someone else who obtained access to your credentials, biometric factor, or one-time code.",
            "You will not share your credentials, biometric factor, or one-time codes with anyone — including someone claiming to be from Paxnova Trust.",
            "For Wires that exceed risk thresholds we set from time to time, we may require a call-back to a phone number on file before releasing the Wire.",
          ]}
        />
      </Section>

      <Section id="cutoff" title="5. Cutoff times & processing schedule">
        <P>
          Domestic Wires are processed over the Fedwire system. The cutoff
          for same-day processing is <strong>5:00 p.m. Eastern Time</strong>{" "}
          on each Business Day, subject to internal risk review. Payment
          Orders received after cutoff, on weekends, or on U.S. federal
          banking holidays are queued and processed on the next Business Day.
        </P>
        <Callout>
          Same-day Fedwire processing does not guarantee same-day{" "}
          <em>credit</em> to the Beneficiary. The Beneficiary&apos;s bank may
          have its own internal cutoff and posting schedule.
        </Callout>
      </Section>

      <Section id="fees" title="6. Fees">
        <P>
          The Wire fee in effect at the time you submit a Payment Order is
          disclosed on the review screen before you confirm. As of the
          effective date above, our standard fees are:
        </P>
        <Ul
          items={[
            "Outgoing domestic Wire: $15 (waived for Reserve Private Banking and Business Operating accounts)",
            "Incoming domestic Wire: $0",
            "Investigation / amendment / recall request: $30 per request",
            "Returned Wire: no additional fee beyond what the receiving institution may impose",
          ]}
        />
        <P>
          Fees are debited from the same account that funded the Wire. We may
          change our fees with at least 30 days&apos; advance notice (or such
          other period as applicable law may require). Fees in effect for a
          Wire are those displayed at the time you confirmed the Payment
          Order.
        </P>
      </Section>

      <Section id="limits" title="7. Limits & risk-based holds">
        <P>
          Your default outgoing-wire limit is{" "}
          <strong>$100,000 per Business Day</strong> across all of your
          eligible accounts, including any joint or business accounts on
          which you are a signer. Higher limits are available on request and
          subject to underwriting. We may, in our sole discretion and without
          notice:
        </P>
        <Ul
          items={[
            "Decline a Payment Order, place it on hold, or break it into multiple sequential transfers based on risk signals.",
            "Require additional verification (call-back, in-person, or document-based) for any Wire.",
            "Lower or suspend your limits if we detect unusual activity or are unable to verify the Beneficiary.",
            "Refuse to process any Wire that we reasonably believe may violate the Bank Secrecy Act, the USA PATRIOT Act, OFAC sanctions, or any other applicable law.",
          ]}
        />
      </Section>

      <Section
        id="recall"
        title="8. Recall, cancellation & corrections"
      >
        <P>
          Once we have submitted a Wire to Fedwire, we cannot unilaterally
          recall it. We will, on your written request, send a recall message
          to the Beneficiary Bank under SWIFT MT 192 or the equivalent
          Fedwire reversal request. The Beneficiary Bank is{" "}
          <strong>not obligated</strong> to return the funds &mdash; the
          decision lies with the Beneficiary and applicable law of the
          Beneficiary&apos;s jurisdiction. You agree to pay the
          investigation fee whether or not the recall is successful.
        </P>
        <P>
          You may cancel a Payment Order that has not yet been released to
          Fedwire by contacting us before the cutoff. Payment Orders
          scheduled for a future Business Day may be cancelled before
          midnight on the Business Day preceding the wire date.
        </P>
      </Section>

      <Section
        id="ucc4a"
        title="9. UCC Article 4A — your rights, our liability"
      >
        <P>
          Funds Transfers initiated under these Terms are governed by Article
          4A of the Uniform Commercial Code, as adopted by the State of New
          York (&ldquo;UCC § 4A&rdquo;). Under UCC § 4A:
        </P>
        <Ul
          items={[
            "If a Payment Order identifies the Beneficiary by both name and account number and the two do not match, the Beneficiary Bank may rely solely on the account number to credit the Wire. You bear the loss if the account number was incorrect.",
            "If we accept your Payment Order and fail to execute it correctly, our liability is limited to actually-incurred losses and interest at the federal funds rate. We are NOT liable for consequential, indirect, special, or punitive damages — including lost business or lost profit — unless we expressly agreed in a signed writing.",
            "If we delay or fail to execute, your remedy under UCC § 4A is generally to receive interest on the delayed amount.",
            "Your right to recover for any Wire is subject to the one-year notice rule (see Section 11 below).",
          ]}
        />
        <Callout intent="warning">
          <strong>Read carefully.</strong> Section 9 limits Paxnova
          Trust&apos;s liability for Wires. UCC § 4A is the principal source
          of law that governs Funds Transfers between banks and customers,
          and the limitations above are typical of U.S. banks but are not
          identical to your rights under Regulation E for consumer EFTs.
          Wires <strong>are not</strong> covered by Regulation E.
        </Callout>
      </Section>

      <Section
        id="errors"
        title="10. Erroneous transfers & duplicate payments"
      >
        <P>
          If you provide an incorrect Beneficiary account number, the wrong
          Beneficiary name, or both, you authorize us to debit your account
          for the amount of the Wire and to use commercially reasonable
          efforts to recover the funds. You agree to reimburse us for any
          amount we are unable to recover, together with any fees we incur
          attempting recovery. Duplicate Payment Orders (the same Payment
          Order submitted twice) are processed as separate Wires unless our
          systems flag them; you remain responsible for both Wires unless we
          successfully recall one.
        </P>
      </Section>

      <Section
        id="unauthorized"
        title="11. Notice of unauthorized transfers (1-year rule)"
      >
        <P>
          You must report any unauthorized Wire or any error in connection
          with a Wire <strong>within one (1) year</strong> after we send the
          statement or transmittal that reflects the Wire. If you do not give
          us notice within that one-year period, you waive any right to a
          refund and you will not be entitled to compensation under UCC §
          4A-505 or otherwise. We strongly encourage same-day reporting of
          any suspected unauthorized activity to maximize the chance of
          recovery.
        </P>
        <P>
          To report an unauthorized Wire, call{" "}
          <strong>1-800-PAXNOVA-1</strong> immediately. We are staffed 24
          hours a day, every day of the year.
        </P>
      </Section>

      <Section
        id="fraud"
        title="12. Fraud screening & call-back verification"
      >
        <P>
          For Wires above $25,000 to a Beneficiary you have not previously
          paid, and for any Wire that triggers our risk model, we may place
          the Wire on hold and call you at a phone number on file to verbally
          confirm the Payment Order. We will never ask for your password,
          one-time code, or PIN during a call-back. If we cannot reach you,
          we will hold the Wire until you reach us. Wires not confirmed
          within five Business Days are voided and the funds returned to
          your account, less any third-party investigation fees actually
          incurred.
        </P>
      </Section>

      <Section
        id="records"
        title="13. Records, statements & receipts"
      >
        <P>
          A confirmation of each Wire is delivered immediately to your inbox
          and to the secure-message center inside the app. Wires are
          included on your monthly account statement. The Federal Reserve
          and Paxnova Trust retain records of every Wire for the periods
          required by the Bank Secrecy Act &mdash; generally five years.
          You agree that an electronic record of a Wire constitutes prima
          facie evidence of the transaction.
        </P>
      </Section>

      <Section
        id="responsibility"
        title="14. Your responsibilities"
      >
        <P>You agree to:</P>
        <Ul
          items={[
            "Verify the Beneficiary's name, account number, and bank routing number before submitting each Payment Order — we do not validate name/account agreement.",
            "Keep your credentials, biometric factor, and recovery codes confidential.",
            "Maintain reasonable security on the devices you use to bank with us, including current operating-system updates and reputable malware protection.",
            "Promptly review every Wire confirmation and statement we send and report any concerns.",
            "Notify us immediately if you suspect any device or credential has been compromised.",
          ]}
        />
      </Section>

      <Section id="suspension" title="15. Suspension & termination">
        <P>
          We may suspend or terminate your access to the Online Wire Transfer
          service at any time, with or without cause, in accordance with
          applicable law. Suspension or termination of online wire access
          does not affect your rights or obligations with respect to Wires
          we accepted before the suspension or termination.
        </P>
      </Section>

      <Section id="amendments" title="16. Amendments">
        <P>
          We may amend these Terms from time to time. Material changes will
          be posted on this page and, where required by law, sent to your
          designated electronic address with at least 30 days&apos; advance
          notice. Your continued use of the Online Wire Transfer service
          after the amendment becomes effective constitutes acceptance.
        </P>
      </Section>

      <Section
        id="governing"
        title="17. Governing law & venue"
      >
        <P>
          These Terms are governed by the federal laws of the United States
          and, to the extent not preempted, by the laws of the State of New
          York &mdash; specifically including UCC Article 4A &mdash; without
          regard to conflict-of-laws principles. Any action arising out of
          or relating to these Terms or any Wire shall be brought in the
          state or federal courts located in New York County, New York, and
          you consent to the personal jurisdiction of those courts.
        </P>
      </Section>

      <Section id="contact" title="18. Contact us">
        <P>
          Paxnova Trust Bank, N.A.
          <br />
          Attn: Wire Services Operations
          <br />
          1000 N Point St, San Francisco, CA 94109
          <br />
          Phone: 1-800-PAXNOVA-1 (24/7)
          <br />
          Email:{" "}
          <a
            href="mailto:wires@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            wires@paxnovatrust.com
          </a>
        </P>
      </Section>
    </div>
  );
}
