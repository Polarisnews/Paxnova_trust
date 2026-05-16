"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const quotes = [
  {
    quote:
      "Paxnova Trust replaced three accounts and two apps for me. The savings APY alone has earned me more than my old bank did in a decade.",
    name: "Priya M.",
    role: "Product designer, Brooklyn",
    initials: "PM",
    color: "#6E3FF3",
  },
  {
    quote:
      "Closing on our mortgage was twenty-one days, end to end. The banker on my account knew our file by the time we hopped on the call.",
    name: "Daniel & Reyna O.",
    role: "First-time homeowners, Austin",
    initials: "DO",
    color: "#D4AF37",
  },
  {
    quote:
      "I run a 40-person agency. The treasury sweep, virtual cards, and approval rules give us back two hours of finance work a week.",
    name: "Marcus T.",
    role: "Founder, Northbeam Studios",
    initials: "MT",
    color: "#0A1A3C",
  },
];

export function Testimonials() {
  return (
    <section className="bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            From the people who bank with us
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Built around real lives, not legacy systems.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {quotes.map((q, i) => (
            <motion.figure
              key={q.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 shadow-soft"
            >
              <div className="flex gap-0.5 text-gold-500">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-balance text-base leading-relaxed">
                “{q.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className="inline-flex size-10 items-center justify-center rounded-full font-display text-sm font-semibold text-white"
                  style={{ background: q.color }}
                >
                  {q.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
