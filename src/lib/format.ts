export const currency = (n: number, opts?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  }).format(n);

export const compactCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const formatDate = (d: Date | number, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(typeof d === "number" ? new Date(d * 1000) : d);

export const formatRelative = (d: Date | number) => {
  const date = typeof d === "number" ? new Date(d * 1000) : d;
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
