// Card product catalog. Three tiers, each tied to a network. All values
// are realistic ballparks — not actual market terms.

export type CardNetwork = "visa" | "mastercard" | "amex";
export type CardTier = "core" | "plus" | "black";

export type CardProduct = {
  key: string;
  name: string;
  network: CardNetwork;
  tier: CardTier;
  tagline: string;
  annualFee: number;
  apr: number;
  limitMin: number;
  limitMax: number;
  defaultDailyLimit: number;
  defaultTxnLimit: number;
  perks: string[];
};

export const CARD_PRODUCTS: CardProduct[] = [
  {
    key: "visa-core",
    name: "Apex Visa Core",
    network: "visa",
    tier: "core",
    tagline: "Everyday spending with zero annual fee",
    annualFee: 0,
    apr: 19.99,
    limitMin: 500,
    limitMax: 10_000,
    defaultDailyLimit: 2_500,
    defaultTxnLimit: 1_000,
    perks: [
      "Contactless tap-to-pay",
      "1 % cashback on every purchase",
      "$0 fraud liability",
    ],
  },
  {
    key: "mastercard-plus",
    name: "Reserve Mastercard Plus",
    network: "mastercard",
    tier: "plus",
    tagline: "Elevated rewards for the everyday traveller",
    annualFee: 95,
    apr: 17.49,
    limitMin: 5_000,
    limitMax: 50_000,
    defaultDailyLimit: 10_000,
    defaultTxnLimit: 5_000,
    perks: [
      "2 % cashback on every purchase",
      "Two airport lounge passes per year",
      "Cell phone protection up to $1,000",
    ],
  },
  {
    key: "amex-black",
    name: "Signature Amex Black",
    network: "amex",
    tier: "black",
    tagline: "Concierge-grade banking, by invitation",
    annualFee: 695,
    apr: 16.99,
    limitMin: 25_000,
    limitMax: 250_000,
    defaultDailyLimit: 50_000,
    defaultTxnLimit: 25_000,
    perks: [
      "Unlimited airport lounge access",
      "24/7 personal concierge",
      "Comprehensive travel insurance",
      "5 % cashback on travel and dining",
    ],
  },
];

export function getCardProduct(key: string): CardProduct | undefined {
  return CARD_PRODUCTS.find((p) => p.key === key);
}
