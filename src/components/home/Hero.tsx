"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, type MouseEvent } from "react";

const cards = [
  {
    name: "Signature",
    holder: "JORDAN HAYES",
    number: "•••• •••• •••• 4421",
    gradient: "linear-gradient(135deg, #0A1A3C 0%, #1E3A6B 50%, #050B1F 100%)",
    accent: "#D4AF37",
    rotation: -10,
    offsetX: -40,
    offsetY: 20,
    z: 1,
  },
  {
    name: "Reserve",
    holder: "JORDAN HAYES",
    number: "•••• •••• •••• 8132",
    gradient: "linear-gradient(135deg, #6E3FF3 0%, #4F22C7 50%, #2B1373 100%)",
    accent: "#E8C76A",
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    z: 2,
  },
  {
    name: "Apex",
    holder: "JORDAN HAYES",
    number: "•••• •••• •••• 2018",
    gradient: "linear-gradient(135deg, #D4AF37 0%, #A6831A 50%, #6B4F08 100%)",
    accent: "#0A1A3C",
    rotation: 10,
    offsetX: 40,
    offsetY: 40,
    z: 3,
  },
];

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-50, 50], [8, -8]);
  const rotateY = useTransform(mx, [-50, 50], [-8, 8]);
  const sx = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const sy = useSpring(rotateY, { stiffness: 150, damping: 20 });

  // Only mount the 3D card stack on lg+ viewports. Previously we used
  // `hidden lg:block`, but the framer-motion children still ran their
  // animations off-screen, consuming CPU + memory on mobile. Skipping
  // the mount entirely saves both. SSR renders nothing (matches initial
  // client render) so no hydration mismatch fires.
  const [showCards, setShowCards] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setShowCards(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setShowCards(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100 - 50;
    const y = ((e.clientY - rect.top) / rect.height) * 100 - 50;
    mx.set(x);
    my.set(y);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <section className="relative isolate overflow-hidden gradient-hero text-white">
      <div className="absolute inset-0 -z-10 opacity-30 bg-grid-fade pointer-events-none" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-32 lg:pb-40">
        <div>
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur"
          >
            <Sparkles className="size-3.5 text-gold-300" />
            Banking, refined.
          </motion.div>

          <motion.h1
            initial={{ y: 24 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-7xl"
          >
            Built for the
            <span className="block bg-gradient-to-r from-white via-violet-300 to-gold-300 bg-clip-text text-transparent">
              wealth of tomorrow.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-5 max-w-xl text-base text-white/75 text-pretty sm:text-lg"
          >
            One account, every product. Earn 4.85% APY, send money in seconds,
            and bank with a team that&apos;s engineered for the next decade.
          </motion.p>

          <motion.div
            initial={{ y: 16 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("open-account-wizard"))
              }
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 text-sm font-semibold text-navy-900 shadow-glow-gold transition hover:bg-gold-300 active:scale-95"
            >
              Open an account
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <Link
              href="/personal"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Explore products
            </Link>
          </motion.div>

          <motion.div
            initial={false}
            className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55"
          >
            <span>FDIC insured up to $250k</span>
            <span className="hidden size-1 rounded-full bg-white/30 sm:inline-block" />
            <span>SOC 2 Type II</span>
            <span className="hidden size-1 rounded-full bg-white/30 sm:inline-block" />
            <span>256-bit encryption</span>
          </motion.div>
        </div>

        {showCards && (
        <div
          className="relative mx-auto hidden h-[420px] w-full max-w-lg [perspective:1400px] lg:block"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <motion.div
            className="relative h-full w-full"
            style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
          >
            {cards.map((card) => (
              <motion.div
                key={card.name}
                initial={{ opacity: 0, y: 40, rotate: card.rotation - 4 }}
                animate={{
                  opacity: 1,
                  y: card.offsetY,
                  x: card.offsetX,
                  rotate: card.rotation,
                }}
                transition={{
                  duration: 0.9,
                  delay: 0.2 + card.z * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="absolute left-1/2 top-1/2 h-56 w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-2xl"
                style={{
                  background: card.gradient,
                  zIndex: card.z,
                  boxShadow:
                    "0 30px 60px -15px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset",
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="rounded-md p-1.5"
                    style={{ background: card.accent }}
                  >
                    <div className="size-6 rounded-sm border border-white/30 bg-gradient-to-br from-white/40 to-white/10" />
                  </div>
                  <span
                    className="font-display text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: card.accent }}
                  >
                    Paxnova Trust
                  </span>
                </div>

                <div className="mt-12 font-mono text-lg tracking-widest text-white/95">
                  {card.number}
                </div>

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/55">
                      Cardholder
                    </p>
                    <p className="font-mono text-sm text-white/95">{card.holder}</p>
                  </div>
                  <div>
                    <p
                      className="text-right font-display text-base font-semibold uppercase tracking-wider"
                      style={{ color: card.accent }}
                    >
                      {card.name}
                    </p>
                    <p className="text-right text-[10px] uppercase tracking-wider text-white/55">
                      Visa Infinite
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        )}
      </div>
    </section>
  );
}
