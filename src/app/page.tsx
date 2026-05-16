import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProductGrid } from "@/components/home/ProductGrid";
import { RatesTicker } from "@/components/home/RatesTicker";
import { SavingsCalculator } from "@/components/home/SavingsCalculator";
import { AppShowcase } from "@/components/home/AppShowcase";
import { Testimonials } from "@/components/home/Testimonials";
import { BranchTeaser } from "@/components/home/BranchTeaser";
import { requireGuest } from "@/lib/auth";

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
