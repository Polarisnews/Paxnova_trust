import type { Metadata } from "next";
import { LocatorClient } from "@/components/locator/LocatorClient";

export const metadata: Metadata = {
  title: "Find a branch or ATM",
  description:
    "Find a Paxnova Trust branch or ATM near you. Flagship locations across 24 U.S. cities and 55,000 fee-free ATMs nationwide.",
};

export default async function BranchesPage(props: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await props.searchParams;
  const initialMode =
    type === "atm" || type === "branch" || type === "all" ? type : "branch";
  return (
    <section className="bg-canvas dark:bg-background">
      <LocatorClient initialMode={initialMode} />
    </section>
  );
}
