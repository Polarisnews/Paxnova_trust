import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { CARD_PRODUCTS } from "@/lib/card-products";
import { CARD_THEMES } from "@/lib/card-themes";
import { CardApplyWizard } from "./CardApplyWizard";

export const metadata: Metadata = { title: "Apply for a card" };

export default async function ApplyCardPage() {
  const user = await requireAuth();
  return (
    <CardApplyWizard
      products={CARD_PRODUCTS}
      themes={CARD_THEMES}
      defaults={{
        cardHolder: `${user.firstName} ${user.lastName}`.trim(),
        billingStreet: user.streetAddress ?? "",
        billingCity: user.city ?? "",
        billingState: user.stateRegion ?? "",
        billingZip: user.postalCode ?? "",
        billingCountry: user.country ?? "US",
        employmentStatus: user.employmentStatus ?? "",
        employerName: user.employerName ?? "",
        annualIncome: user.annualIncome ?? "",
      }}
    />
  );
}
