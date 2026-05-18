import dynamic from "next/dynamic";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProductGrid } from "@/components/home/ProductGrid";
import { RatesTicker } from "@/components/home/RatesTicker";
import { BranchTeaser } from "@/components/home/BranchTeaser";
import { requireGuest } from "@/lib/auth";

// Below-the-fold components carry the heaviest deps on this route:
//   • SavingsCalculator → recharts (~120KB gzip)
//   • AppShowcase       → framer-motion phone mockup
//   • Testimonials      → 13 quotes + RAF auto-scroll loop
// Lazy-loading them halves the home-page JS that mobile users have to
// download + parse before the Hero is interactive.
const SavingsCalculator = dynamic(
  () =>
    import("@/components/home/SavingsCalculator").then(
      (m) => m.SavingsCalculator,
    ),
  { loading: () => <SectionSkeleton height={520} /> },
);
const AppShowcase = dynamic(
  () =>
    import("@/components/home/AppShowcase").then((m) => m.AppShowcase),
  { loading: () => <SectionSkeleton height={680} /> },
);
const Testimonials = dynamic(
  () =>
    import("@/components/home/Testimonials").then((m) => m.Testimonials),
  { loading: () => <SectionSkeleton height={420} /> },
);

function SectionSkeleton({ height }: { height: number }) {
  return (
    <section
      aria-hidden
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <div
        className="animate-pulse rounded-2xl bg-muted/40"
        style={{ height }}
      />
    </section>
  );
}

export default async function Home() {
  // Signed-in users land on /dashboard — the marketing landing is for guests
  // only. `requireGuest()` short-circuits with a redirect when a session
  // exists; otherwise the marketing page renders normally.
  await requireGuest();

  return (
    <>
      <Hero />
      <TrustStrip />
      <ProductGrid />
      <RatesTicker />
      <SavingsCalculator />
      <AppShowcase />
      <Testimonials />
      <BranchTeaser />
    </>
  );
}
