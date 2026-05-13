import { TrendingUp } from "lucide-react";

const rates = [
  { label: "High-yield savings APY", value: "4.85%" },
  { label: "30-yr fixed mortgage", value: "6.42%" },
  { label: "15-yr fixed mortgage", value: "5.78%" },
  { label: "1-yr CD", value: "5.20%" },
  { label: "5-yr CD", value: "4.55%" },
  { label: "Personal loan APR (from)", value: "6.99%" },
  { label: "Auto refinance APR (from)", value: "5.49%" },
  { label: "HELOC rate (from)", value: "7.12%" },
];

export function RatesTicker() {
  return (
    <section className="pause-on-hover relative overflow-hidden border-y border-border bg-navy-900 py-5 text-white">
      <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 bg-navy-900 px-4 py-2 sm:px-8">
        <TrendingUp className="size-4 text-gold-300" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
          Today&apos;s rates
        </span>
      </div>
      <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-navy-900 to-transparent" />

      <div className="flex w-max animate-marquee">
        {[...rates, ...rates].map((r, i) => (
          <div
            key={`${r.label}-${i}`}
            className="flex shrink-0 items-baseline gap-3 px-8 text-sm"
          >
            <span className="text-white/60">{r.label}</span>
            <span className="font-display text-base font-semibold text-gold-300">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
