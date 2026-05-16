// Shared banking limits + fees, surfaced in both the send-money composer and the
// wire wizard so changing them in one place flows everywhere.

export const WIRE_FEE = 25;
export const DAILY_WIRE_LIMIT = 100_000;
export const ZELLE_DAILY_LIMIT = 5_000;
export const WIRE_CUTOFF_LABEL = "4:00 PM ET";
