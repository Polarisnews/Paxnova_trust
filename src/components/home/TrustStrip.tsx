const outlets = [
  "FINANCIAL TIMES",
  "BLOOMBERG",
  "FORBES",
  "WSJ",
  "TECHCRUNCH",
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-card/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Trusted reporting from
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {outlets.map((name) => (
            <li
              key={name}
              className="font-display text-sm font-semibold tracking-[0.18em] text-muted-foreground/80"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
