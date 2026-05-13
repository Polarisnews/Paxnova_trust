import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ProductGrid } from "@/components/home/ProductGrid";
import { RatesTicker } from "@/components/home/RatesTicker";
import { SavingsCalculator } from "@/components/home/SavingsCalculator";
import { AppShowcase } from "@/components/home/AppShowcase";
import { Testimonials } from "@/components/home/Testimonials";
import { BranchTeaser } from "@/components/home/BranchTeaser";

export default function Home() {
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
