import type { Metadata } from "next";
import { Clock, Lock, Mail, MapPin, Phone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = { title: "Contact us" };

const faqs = [
  { q: "What are your hours?", a: "Customer support is 24/7 by chat and phone. Flagship branches are open Mon–Sat, 9am–6pm local time." },
  { q: "How long do transfers take?", a: "Internal transfers are instant. ACH external transfers typically settle in 1–2 business days. Same-day ACH is available for $1.50." },
  { q: "What if my card is lost or stolen?", a: "Freeze it instantly from the dashboard or the mobile app. A replacement ships the same business day at no charge." },
  { q: "Are my deposits FDIC-insured?", a: "Yes, up to $250,000 per depositor through our member bank. Joint accounts double that to $500,000." },
  { q: "Do you have ATM partnerships?", a: "Yes — 55,000 fee-free ATMs across the U.S. through the AllPoint network." },
  { q: "How do I dispute a charge?", a: "Tap any transaction in your dashboard and choose Dispute. We provisionally credit within one business day on most cases." },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">
            Contact
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-semibold leading-tight tracking-tight text-balance lg:text-6xl">
            A real person, fast — every time you ask.
          </h1>
          <p className="mt-5 max-w-2xl text-white/75">
            We aim to answer every message in under 9 minutes during business hours.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              For sensitive account questions, sign in and use Secure Message instead.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Talk to us</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Item icon={Phone} label="Customer service" value="1-800-NOVA-TRUST" />
                <Item icon={Mail} label="Email" value="hello@novatrust.example" />
                <Item icon={MapPin} label="Headquarters" value="200 West St, 14th Floor, New York, NY 10282" />
                <Item icon={Clock} label="Hours" value="Phone: 24/7 · Branches: M-Sat 9-6" />
              </dl>
            </div>

            <div className="rounded-2xl bg-navy-900 p-6 text-white">
              <Lock className="size-5 text-gold-300" />
              <p className="mt-2 font-semibold">For account-specific questions</p>
              <p className="mt-1 text-sm text-white/70">
                Sign in and send a Secure Message — it&apos;s end-to-end encrypted and
                tied to your account so we can answer faster.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section id="faq" className="bg-card/30 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <Accordion className="mt-6">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={String(i)}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-violet-500" />
      <div>
        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}
