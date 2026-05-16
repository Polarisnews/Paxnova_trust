// FX conversion. Live rates from `open.er-api.com` (free, no key, 160+
// currencies). If the network call fails or returns a currency we don't
// know, we fall back to a bundled static table — approximate ECB-style
// snapshot rates so unit tests / offline dev still work. All static rates
// are expressed as **USD per 1 unit of the named currency**.

export type FxResult = {
  rate: number; // multiplier: amount_in_FROM × rate = amount_in_TO
  source: "live" | "fallback";
  asOf: string; // ISO date or "fallback"
};

// USD per 1 unit of <code>. Hand-curated approximation; the live fetch
// supersedes these whenever it succeeds.
const STATIC_USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  CAD: 0.74,
  AUD: 0.66,
  NZD: 0.61,
  JPY: 0.0067,
  CNY: 0.14,
  HKD: 0.128,
  SGD: 0.75,
  KRW: 0.00074,
  INR: 0.012,
  TWD: 0.031,
  THB: 0.029,
  MYR: 0.21,
  IDR: 0.000063,
  PHP: 0.018,
  VND: 0.000041,
  PKR: 0.0036,
  BDT: 0.0091,
  LKR: 0.0033,
  CHF: 1.13,
  SEK: 0.094,
  NOK: 0.094,
  DKK: 0.144,
  ISK: 0.0073,
  PLN: 0.25,
  CZK: 0.044,
  HUF: 0.0027,
  RON: 0.22,
  BGN: 0.55,
  TRY: 0.029,
  UAH: 0.024,
  RUB: 0.011,
  ILS: 0.27,
  AED: 0.272,
  SAR: 0.266,
  QAR: 0.275,
  KWD: 3.25,
  BHD: 2.65,
  OMR: 2.6,
  JOD: 1.41,
  LBP: 0.000011,
  EGP: 0.02,
  MAD: 0.1,
  TND: 0.32,
  ZAR: 0.053,
  NGN: 0.00067,
  KES: 0.0077,
  GHS: 0.069,
  ETB: 0.0079,
  TZS: 0.00039,
  UGX: 0.00027,
  MXN: 0.05,
  BRL: 0.19,
  ARS: 0.0011,
  CLP: 0.0011,
  COP: 0.00024,
  PEN: 0.27,
  UYU: 0.024,
  VES: 0.027,
  CRC: 0.0019,
  PAB: 1.0,
  DOP: 0.017,
  JMD: 0.0064,
  BSD: 1.0,
  BBD: 0.5,
  TTD: 0.15,
  KZT: 0.0021,
  GEL: 0.37,
  AMD: 0.0026,
  AZN: 0.59,
  IE: 0,
  // Anything missing falls back to 1.0 (treated as USD-pegged for safety).
};

function staticRate(from: string, to: string): number {
  const f = STATIC_USD_PER_UNIT[from] ?? 1;
  const t = STATIC_USD_PER_UNIT[to] ?? 1;
  if (t === 0) return 1;
  return f / t;
}

async function liveRate(from: string, to: string): Promise<{ rate: number; asOf: string } | null> {
  try {
    // open.er-api.com returns { base_code, rates: { USD: 1, EUR: 0.92, ... },
    // time_last_update_utc, ... }. We pull the base = `from` and read `to`.
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${encodeURIComponent(from)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result !== "success" || !data.rates) return null;
    const r = data.rates[to];
    if (typeof r !== "number" || !isFinite(r) || r <= 0) return null;
    return { rate: r, asOf: data.time_last_update_utc ?? new Date().toISOString() };
  } catch {
    return null;
  }
}

export async function getExchangeRate(
  from: string,
  to: string
): Promise<FxResult> {
  const FROM = from.toUpperCase();
  const TO = to.toUpperCase();
  if (FROM === TO) {
    return { rate: 1, source: "live", asOf: new Date().toISOString() };
  }
  const live = await liveRate(FROM, TO);
  if (live) return { rate: live.rate, source: "live", asOf: live.asOf };
  return { rate: staticRate(FROM, TO), source: "fallback", asOf: "fallback" };
}

export function convert(amount: number, rate: number): number {
  return Number((amount * rate).toFixed(2));
}

// ──────────────────────────────────────────────────────────────────────
// Rates table — for callers that need to convert many balances at once
// (e.g. the dashboard's aggregate cards). Cached by Next.js for 1 hour so
// we don't hammer open.er-api.com on every render.
// ──────────────────────────────────────────────────────────────────────

export type UsdRates = Record<string, number>; // <code> → units of <code> per 1 USD

const STATIC_USD_RATES: UsdRates = Object.fromEntries(
  Object.entries(STATIC_USD_PER_UNIT).map(([code, usdPerUnit]) => [
    code,
    usdPerUnit > 0 ? 1 / usdPerUnit : 1,
  ])
);

export async function getUsdRates(): Promise<{
  rates: UsdRates;
  source: "live" | "fallback";
}> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
    };
    if (data.result !== "success" || !data.rates) {
      throw new Error("unexpected payload");
    }
    // Always make sure USD itself is present and exactly 1.
    return { rates: { USD: 1, ...data.rates }, source: "live" };
  } catch {
    return { rates: STATIC_USD_RATES, source: "fallback" };
  }
}

export function convertWithUsdRates(
  amount: number,
  from: string,
  to: string,
  rates: UsdRates
): number {
  const FROM = from.toUpperCase();
  const TO = to.toUpperCase();
  if (FROM === TO) return amount;
  const f = rates[FROM] ?? STATIC_USD_RATES[FROM] ?? 1;
  const t = rates[TO] ?? STATIC_USD_RATES[TO] ?? 1;
  if (f === 0) return amount;
  // amount FROM → (amount / f) USD → (amount / f) × t in TO
  return Number(((amount / f) * t).toFixed(2));
}
