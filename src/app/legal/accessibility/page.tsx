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
  title: "Accessibility Statement",
  description:
    "Paxnova Trust is committed to providing accessible banking products and services to every customer, including those with disabilities.",
};

const EFFECTIVE_DATE = "January 12, 2026";
const LAST_UPDATED = "May 5, 2026";

const SECTIONS = [
  { id: "commitment", label: "1. Our commitment" },
  { id: "standards", label: "2. Standards we follow" },
  { id: "digital", label: "3. Website & mobile accessibility" },
  { id: "branches", label: "4. Branch & ATM accessibility" },
  { id: "telephone", label: "5. Telephone & relay services" },
  { id: "alt-formats", label: "6. Alternative formats" },
  { id: "limitations", label: "7. Known limitations" },
  { id: "feedback", label: "8. Feedback & assistance" },
  { id: "contact", label: "9. Contact our Accessibility Officer" },
];

export default function AccessibilityPage() {
  return (
    <div className="space-y-8">
      <LegalHeader
        title="Accessibility Statement"
        effective={EFFECTIVE_DATE}
        updated={LAST_UPDATED}
        summary={`Paxnova Trust is committed to making banking accessible to everyone. Our websites and apps aim to meet WCAG 2.1 Level AA, our branches and ATMs meet the Americans with Disabilities Act, and a dedicated Accessibility team responds to every request within two business days.`}
      />

      <TableOfContents sections={SECTIONS} />

      <Section id="commitment" title="1. Our commitment">
        <P>
          Paxnova Trust Bank, N.A. is committed to providing an inclusive
          experience for every customer, regardless of ability or assistive
          technology in use. Accessibility is owned by an executive sponsor at
          the bank (the Chief Operating Officer) and operationalized by a
          permanent cross-functional team spanning design, engineering, branch
          operations, customer experience, and compliance.
        </P>
      </Section>

      <Section id="standards" title="2. Standards we follow">
        <P>Our digital experiences are designed and tested against:</P>
        <Ul
          items={[
            "Web Content Accessibility Guidelines (WCAG) 2.1 Level AA",
            "Section 508 of the Rehabilitation Act of 1973 (29 U.S.C. § 794d)",
            "Americans with Disabilities Act (ADA) Titles II and III, as interpreted by current DOJ guidance",
            "EN 301 549 (European harmonized standard) for international users",
          ]}
        />
        <P>
          Our branches and ATMs are designed to the 2010 ADA Standards for
          Accessible Design. ATMs are PCI PIN Transaction Security compliant
          and include voice guidance, tactile keypads, and Braille labelling.
        </P>
      </Section>

      <Section id="digital" title="3. Website & mobile accessibility">
        <P>
          We continuously audit our websites and mobile apps with a combination
          of automated tooling (axe-core, Lighthouse, Pa11y) and manual testing
          by people who use assistive technology. Specific accommodations
          include:
        </P>
        <Ul
          items={[
            "Full keyboard navigation with visible focus indicators",
            "Skip-to-content links on every page",
            "Semantic HTML, ARIA landmarks, and announced state changes for screen readers (NVDA, JAWS, VoiceOver, TalkBack)",
            "Color contrast ratios at or above 4.5:1 for body text and 3:1 for large text",
            "Captioned and transcribed video content; auto-generated captions reviewed by a human",
            "Resizable text up to 200% without loss of content or function; supports browser zoom to 400%",
            "Reduced-motion respect — animations honor prefers-reduced-motion",
            "Dark mode for users sensitive to light",
            "Form fields labeled programmatically with inline error messages and clear instructions",
          ]}
        />
      </Section>

      <Section id="branches" title="4. Branch & ATM accessibility">
        <P>Every Paxnova Trust branch provides:</P>
        <Ul
          items={[
            "Accessible parking, entrances, and teller counters",
            "Wheelchair-accessible interior paths and restrooms",
            "Service animals welcomed in all customer areas",
            "Bilingual signage and on-staff Spanish translators at major-metro branches; remote interpreters in 240+ languages available within 60 seconds via Language Line",
            "Quiet appointment rooms with adjustable lighting",
            "Magnification devices and styli for signing tablets",
          ]}
        />
        <P>Our ATMs are designed to be accessible to customers who are:</P>
        <Ul
          items={[
            "Blind or have low vision — audio guidance via 3.5mm headphone jack; tactile keypads with Braille; voice prompts available in English and Spanish",
            "Deaf or hard of hearing — visual transaction confirmations and text-based screens",
            "Wheelchair users — reach height compliant with ADA Sections 308 and 309; clear floor space at each unit",
          ]}
        />
      </Section>

      <Section id="telephone" title="5. Telephone & relay services">
        <P>
          Customer service is available 24/7 at <strong>1-800-PAXNOVA-1</strong>
          . Customers who are deaf, hard of hearing, deafblind, or have speech
          disabilities can reach us through the Telecommunications Relay
          Service (TRS) by dialing <strong>711</strong> from any U.S. phone.
          Video Relay Service (VRS) is available for ASL users; please call our
          dedicated VRS line at <strong>(415) 555-0188</strong> during business
          hours or request a callback through your relay provider.
        </P>
      </Section>

      <Section id="alt-formats" title="6. Alternative formats">
        <P>
          Account statements, disclosures, and notices are available in:
        </P>
        <Ul
          items={[
            "Large print (16-point or larger)",
            "Braille (Grade 2 UEB) on request",
            "Audio (MP3) delivered via secure portal",
            "Accessible PDF tagged for screen readers",
            "Spanish, Mandarin, Cantonese, Vietnamese, Korean, and Tagalog (additional languages on request)",
          ]}
        />
        <P>
          To enroll in an alternative format, sign into your account and visit{" "}
          <strong>Settings → Accessibility</strong>, or contact our team using
          the details below. There is no charge for any accommodation.
        </P>
      </Section>

      <Section id="limitations" title="7. Known limitations">
        <P>
          We&apos;re honest about the gaps we&apos;re still working on:
        </P>
        <Ul
          items={[
            "A small number of legacy disclosure PDFs (pre-2023) have not yet been re-tagged for screen readers — we re-issue accessible versions on request within one business day",
            "Live transcripts on our investor-day broadcasts are auto-generated; human-reviewed transcripts are posted within 48 hours",
            "Some third-party widgets (regulator-required calculators) reside on external sites whose accessibility we monitor but cannot directly control",
          ]}
        />
      </Section>

      <Section id="feedback" title="8. Feedback & assistance">
        <P>
          If you encounter a barrier — anywhere on our site, in our app, in a
          branch, or on an ATM — we want to hear about it and fix it. Email{" "}
          <a
            href="mailto:accessibility@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            accessibility@paxnovatrust.com
          </a>{" "}
          with a description of the issue (including the page URL or branch
          address, what you were trying to do, and any assistive technology
          you were using) and our Accessibility team will respond within two
          business days.
        </P>
        <Callout>
          <strong>Urgent help:</strong> If you need an accommodation to access
          your funds or complete a time-sensitive transaction, please call{" "}
          <strong>1-800-PAXNOVA-1</strong> and ask for the Accessibility
          Customer Care queue. We will prioritize your call.
        </Callout>
      </Section>

      <Section id="contact" title="9. Contact our Accessibility Officer">
        <P>
          Paxnova Trust Bank, N.A.
          <br />
          Attn: Accessibility Officer
          <br />
          1000 N Point St, San Francisco, CA 94109
          <br />
          Email:{" "}
          <a
            href="mailto:accessibility@paxnovatrust.com"
            className="text-violet-500 hover:text-violet-600"
          >
            accessibility@paxnovatrust.com
          </a>
          <br />
          Phone: 1-800-PAXNOVA-1 · TRS: 711 · VRS: (415) 555-0188
        </P>
      </Section>
    </div>
  );
}
