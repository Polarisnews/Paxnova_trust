"use client";

import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

type Quote = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  /** 1–5 stars. Anything below 5 typically signals a constructive note. */
  rating: 4 | 5;
  /** True when the review is constructive — surfaced visually so it doesn't
   *  look hidden among the 5-star wall of praise. */
  constructive?: boolean;
};

const QUOTES: Quote[] = [
  {
    quote:
      "Paxnova Trust replaced three accounts and two apps for me. The savings APY alone has earned me more than my old bank did in a decade.",
    name: "Priya M.",
    role: "Product designer · Brooklyn, NY",
    initials: "PM",
    color: "#6E3FF3",
    rating: 5,
  },
  {
    quote:
      "Closing on our mortgage was twenty-one days, end to end. The banker on my account knew our file by the time we hopped on the call.",
    name: "Daniel & Reyna O.",
    role: "First-time homeowners · Austin, TX",
    initials: "DO",
    color: "#D4AF37",
    rating: 5,
  },
  {
    quote:
      "I run a 40-person agency. The treasury sweep, virtual cards, and approval rules give us back two hours of finance work a week.",
    name: "Marcus T.",
    role: "Founder, Northbeam Studios · Denver, CO",
    initials: "MT",
    color: "#0A1A3C",
    rating: 5,
  },
  {
    quote:
      "I moved $180k from my old big-bank savings to Reserve. The 4.85% is real — the first month's interest was four times what I'd been getting all year combined.",
    name: "Kelvin Ofori",
    role: "Software engineer · Seattle, WA",
    initials: "KO",
    color: "#6E3FF3",
    rating: 5,
  },
  {
    quote:
      "Honestly the service is great and the app is the best I've used. My one complaint: the in-network ATM coverage is thin where I live. Out-of-network reimbursements help, but I'd love to see more partner networks rolled out in rural Vermont.",
    name: "Sofia Reyes",
    role: "Veterinarian · Burlington, VT",
    initials: "SR",
    color: "#0A1A3C",
    rating: 4,
    constructive: true,
  },
  {
    quote:
      "The Signature card has saved me $1,400 in foreign FX this year alone. The concierge actually picks up when I call from Bangkok at 3 AM.",
    name: "Jordan H.",
    role: "CFO, Apex Health · San Francisco, CA",
    initials: "JH",
    color: "#D4AF37",
    rating: 5,
  },
  {
    quote:
      "Self-directed investing is solid but I'm waiting on advanced order types — trailing stops and conditional brackets are still missing. I have to flip to a separate broker for active trading.",
    name: "Priya Narayan",
    role: "Quant analyst · Jersey City, NJ",
    initials: "PN",
    color: "#6E3FF3",
    rating: 4,
    constructive: true,
  },
  {
    quote:
      "We refinanced our $1.6M jumbo with Paxnova after three other lenders ghosted us for a week each. Paxnova replied to our application in 41 minutes.",
    name: "Anna Tellechea",
    role: "Anesthesiologist · La Jolla, CA",
    initials: "AT",
    color: "#0A1A3C",
    rating: 5,
  },
  {
    quote:
      "I'd love to see a true budgeting envelope feature built in — I currently bridge to YNAB. Even basic 'sub-accounts with auto-allocation rules' would let me drop a $90/year subscription.",
    name: "Marco Vialli",
    role: "Hospitality consultant · Miami, FL",
    initials: "MV",
    color: "#D4AF37",
    rating: 4,
    constructive: true,
  },
  {
    quote:
      "My private banker at Paxnova is on par with anyone I dealt with at Goldman, only she actually emails me back the same day. Trust & estate planning was handled in-house with their counsel — saved me a $14k bill.",
    name: "Renata B.",
    role: "Retired CEO · Greenwich, CT",
    initials: "RB",
    color: "#6E3FF3",
    rating: 5,
  },
  {
    quote:
      "Mortgage pre-approval was great once I got through the form — but the form itself took 45 minutes on mobile. Real-time field validation would have helped me spot a wrong date 30 minutes earlier than I did.",
    name: "Sebastian Yu",
    role: "Industrial designer · Portland, OR",
    initials: "SY",
    color: "#0A1A3C",
    rating: 4,
    constructive: true,
  },
  {
    quote:
      "Our small business loan funded in eleven days. The competitor we'd been talking to was still asking for the same docs three weeks in. Night and day.",
    name: "Tariq Faruqi",
    role: "Owner, Cedar Coffee Roasters · Cambridge, MA",
    initials: "TF",
    color: "#D4AF37",
    rating: 5,
  },
  {
    quote:
      "App is gorgeous. Could the default theme respect system dark mode more aggressively? On my OLED iPhone the bright marketing pages keep me from showing the app off in the evening.",
    name: "Elena Sokolova",
    role: "Photographer · Brooklyn, NY",
    initials: "ES",
    color: "#6E3FF3",
    rating: 4,
    constructive: true,
  },
];

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Continuous auto-advance using requestAnimationFrame. Pauses while the
  // user is interacting (touch, wheel, mousedown) and resumes after a short
  // idle period. We render the list twice so we can seamlessly wrap on
  // either side of the boundary.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Respect users who explicitly opted out of motion.
    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let last = performance.now();
    let lastUserAt = 0;
    let rafId = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // ~25 pixels per second feels like a slow magazine flip — fast enough
      // to be obvious, slow enough to read mid-card.
      const speed = 25;
      if (now - lastUserAt > 1500) {
        el.scrollLeft += (speed * dt) / 1000;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const markUser = () => {
      lastUserAt = performance.now();
    };
    // Only listen to user-initiated events so programmatic scrollLeft
    // changes don't pause the loop forever.
    el.addEventListener("touchstart", markUser, { passive: true });
    el.addEventListener("mousedown", markUser);
    el.addEventListener("wheel", markUser, { passive: true });
    el.addEventListener("pointerenter", markUser);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("touchstart", markUser);
      el.removeEventListener("mousedown", markUser);
      el.removeEventListener("wheel", markUser);
      el.removeEventListener("pointerenter", markUser);
    };
  }, []);

  // Render the deck twice so the scroll boundary is invisible.
  const deck = [...QUOTES, ...QUOTES];

  return (
    <section className="bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
              From the people who bank with us
            </p>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Real reviews. Real names. Including the constructive ones.
            </h2>
          </div>
          <p className="text-xs text-muted-foreground sm:max-w-xs sm:text-right">
            We publish 4-star feedback alongside 5-star — the only way to keep
            getting better is to keep listening.
          </p>
        </div>
      </div>

      {/* Edge fades so the carousel appears to flow off into the canvas */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-[var(--background)] via-[var(--background)]/80 to-transparent sm:w-20"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-[var(--background)] via-[var(--background)]/80 to-transparent sm:w-20"
        />

        <div
          ref={containerRef}
          className="no-scrollbar flex gap-5 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8"
          style={{
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
          }}
          aria-label="Customer reviews"
        >
          {deck.map((q, i) => (
            <figure
              key={`${q.name}-${i}`}
              className="relative flex h-full w-[85vw] shrink-0 snap-start flex-col rounded-2xl border border-border bg-card p-6 shadow-soft sm:w-[380px] md:w-[420px]"
            >
              {q.constructive && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-300">
                  Constructive
                </span>
              )}
              <div className="flex gap-0.5 text-gold-500">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    className={
                      "size-4 " + (k < q.rating ? "fill-current" : "opacity-25")
                    }
                  />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-balance text-base leading-relaxed">
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  aria-hidden
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
            </figure>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-2xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
        Reviews collected via TrustPilot, the App Store, Google Play, and our
        own NPS survey. Constructive feedback is forwarded to the product team
        every Monday — and a member of leadership reads every single submission.
      </p>
    </section>
  );
}
