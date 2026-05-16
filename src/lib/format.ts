// Currency formatter. Pass `code` to render in a non-USD currency
// (Intl.NumberFormat picks the right symbol + grouping for the locale +
// currency combo). All callers can rely on `code` defaulting to USD so
// existing code stays correct after the per-account currency feature.
export function currency(
  n: number,
  codeOrOpts: string | Intl.NumberFormatOptions = "USD",
  opts?: Intl.NumberFormatOptions
): string {
  let code = "USD";
  let extra: Intl.NumberFormatOptions | undefined = opts;
  if (typeof codeOrOpts === "string") {
    code = codeOrOpts || "USD";
  } else if (codeOrOpts) {
    // Backwards-compat: callers that used the old `currency(n, opts)`
    // signature land here.
    extra = codeOrOpts;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...extra,
  }).format(n);
}

export const compactCurrency = (n: number, code: string = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

// Date helpers. When a `number` is passed it's treated as JS-native
// **milliseconds** since epoch (what `Date.getTime()` returns and what
// every client component already passes after pre-converting via the
// `typeof x === "number" ? x * 1000 : x.getTime()` pattern). Callers
// with raw SQLite Unix seconds must multiply by 1000 themselves.
export const formatDate = (d: Date | number, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(typeof d === "number" ? new Date(d) : d);

export const formatRelative = (d: Date | number) => {
  const date = typeof d === "number" ? new Date(d) : d;
  const diff = Date.now() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  return formatDate(date);
};

export const maskAccount = (acctNumber: string) =>
  acctNumber.length >= 4
    ? `•••• ${acctNumber.slice(-4)}`
    : acctNumber;
