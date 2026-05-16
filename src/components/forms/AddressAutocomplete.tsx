"use client";

// Address autocomplete. Two implementations behind one UI:
//   1. Real Google Places (New) — used when NEXT_PUBLIC_GOOGLE_MAPS_KEY is set.
//      Calls places.googleapis.com directly from the browser (CORS-enabled),
//      with a per-session token so autocomplete + details are billed as one
//      session.
//   2. Stub fallback — used when no key is present. Matches a bundled demo
//      list so dev / offline still feels like real autocomplete.

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export type AddressPick = {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string; // ISO-2
};

// ────────────────────────────────────────────────────────────────────────
// Stub fallback dataset
// ────────────────────────────────────────────────────────────────────────

const DEMO: AddressPick[] = [
  { line1: "270 Park Avenue", city: "New York", state: "NY", zip: "10017", country: "US" },
  { line1: "1 Bryant Park", city: "New York", state: "NY", zip: "10036", country: "US" },
  { line1: "388 Greenwich Street", city: "New York", state: "NY", zip: "10013", country: "US" },
  { line1: "200 Park Avenue", city: "New York", state: "NY", zip: "10166", country: "US" },
  { line1: "30 Rockefeller Plaza", city: "New York", state: "NY", zip: "10112", country: "US" },
  { line1: "55 Hudson Yards", city: "New York", state: "NY", zip: "10001", country: "US" },
  { line1: "1455 Market Street", city: "San Francisco", state: "CA", zip: "94103", country: "US" },
  { line1: "555 California Street", city: "San Francisco", state: "CA", zip: "94104", country: "US" },
  { line1: "1700 Smith Street", city: "Houston", state: "TX", zip: "77002", country: "US" },
  { line1: "200 West Madison Street", city: "Chicago", state: "IL", zip: "60606", country: "US" },
  { line1: "100 Federal Street", city: "Boston", state: "MA", zip: "02110", country: "US" },
  { line1: "1201 Third Avenue", city: "Seattle", state: "WA", zip: "98101", country: "US" },
  { line1: "8 Canada Square", city: "London", state: "", zip: "E14 5HQ", country: "GB" },
  { line1: "1 Raffles Quay", city: "Singapore", state: "", zip: "048583", country: "SG" },
  { line1: "Bahnhofstrasse 45", city: "Zurich", state: "", zip: "8001", country: "CH" },
  { line1: "200 Bay Street", city: "Toronto", state: "ON", zip: "M5J 2J1", country: "CA" },
  { line1: "275 Kent Street", city: "Sydney", state: "NSW", zip: "2000", country: "AU" },
];

function stubLookup(query: string): AddressPick[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  return DEMO.filter((d) => {
    const haystack = `${d.line1} ${d.city} ${d.state} ${d.zip} ${d.country}`.toLowerCase();
    return tokens.every((t) => haystack.includes(t));
  }).slice(0, 6);
}

// ────────────────────────────────────────────────────────────────────────
// Google Places (New) types and helpers
// ────────────────────────────────────────────────────────────────────────

type PlacesAutocompleteResponse = {
  suggestions?: {
    placePrediction?: {
      placeId: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }[];
};

type PlaceComponent = {
  longText?: string;
  shortText?: string;
  types?: string[];
};

type PlaceDetailsResponse = {
  formattedAddress?: string;
  addressComponents?: PlaceComponent[];
};

type Suggestion =
  | { mode: "stub"; pick: AddressPick; key: string }
  | { mode: "places"; placeId: string; primary: string; secondary: string; key: string };

function newSessionToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function pickComponent(
  components: PlaceComponent[] | undefined,
  type: string,
  short = false
): string {
  if (!components) return "";
  const c = components.find((x) => x.types?.includes(type));
  return (short ? c?.shortText : c?.longText) ?? "";
}

function componentsToPick(
  components: PlaceComponent[] | undefined,
  formatted: string | undefined
): AddressPick {
  const streetNumber = pickComponent(components, "street_number");
  const route = pickComponent(components, "route");
  const explicitLine1 = [streetNumber, route].filter(Boolean).join(" ");
  const line1 = explicitLine1 || (formatted ? formatted.split(",")[0].trim() : "");
  const city =
    pickComponent(components, "locality") ||
    pickComponent(components, "postal_town") ||
    pickComponent(components, "sublocality") ||
    pickComponent(components, "administrative_area_level_2");
  const state = pickComponent(components, "administrative_area_level_1", true);
  const zip = pickComponent(components, "postal_code");
  const country = pickComponent(components, "country", true);
  return { line1, city, state, zip, country };
}

// ────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  name,
  id,
  required,
}: {
  value: string;
  onChange: (next: string) => void;
  onSelect: (pick: AddressPick) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const usingRealMaps = useMemo(() => Boolean(apiKey), [apiKey]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const sessionTokenRef = useRef<string>(newSessionToken());
  const boxRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced fetch. 250ms keeps it responsive without hammering the API.
  useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      setError(null);
      return;
    }

    const handle = setTimeout(async () => {
      if (usingRealMaps) {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(
            "https://places.googleapis.com/v1/places:autocomplete",
            {
              method: "POST",
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey!,
                "X-Goog-FieldMask":
                  "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
              },
              body: JSON.stringify({
                input: value,
                sessionToken: sessionTokenRef.current,
              }),
            }
          );
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            throw new Error(`Places ${res.status}: ${body || res.statusText}`);
          }
          const data = (await res.json()) as PlacesAutocompleteResponse;
          const items: Suggestion[] = (data.suggestions ?? [])
            .map((s, idx) => {
              const p = s.placePrediction;
              if (!p) return null;
              const primary =
                p.structuredFormat?.mainText?.text ??
                p.text?.text ??
                "";
              const secondary = p.structuredFormat?.secondaryText?.text ?? "";
              return {
                mode: "places" as const,
                placeId: p.placeId,
                primary,
                secondary,
                key: `${p.placeId}-${idx}`,
              };
            })
            .filter((x): x is Extract<Suggestion, { mode: "places" }> => x !== null);
          setResults(items);
          setOpen(items.length > 0);
        } catch (err) {
          if ((err as Error).name === "AbortError") return;
          console.error("[places] autocomplete failed", err);
          setError("Address lookup failed. Try again or type the address manually.");
          setResults([]);
          setOpen(true);
        } finally {
          setLoading(false);
        }
      } else {
        const stub = stubLookup(value).map((pick, idx) => ({
          mode: "stub" as const,
          pick,
          key: `${pick.line1}-${pick.zip}-${idx}`,
        }));
        setResults(stub);
        setOpen(stub.length > 0);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [value, usingRealMaps, apiKey]);

  useEffect(() => {
    function onAway(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onAway);
    return () => document.removeEventListener("mousedown", onAway);
  }, []);

  async function pickPlace(placeId: string, primary: string) {
    if (!apiKey) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(
          placeId
        )}?sessionToken=${encodeURIComponent(sessionTokenRef.current)}`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "addressComponents,formattedAddress",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Place details ${res.status}`);
      }
      const data = (await res.json()) as PlaceDetailsResponse;
      const pick = componentsToPick(data.addressComponents, data.formattedAddress);
      onChange(pick.line1 || primary);
      onSelect(pick);
      // Each pick closes the Places billing session; rotate the token.
      sessionTokenRef.current = newSessionToken();
      setOpen(false);
    } catch (err) {
      console.error("[places] details failed", err);
      setError("Couldn't load that address. Pick another or type it in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={boxRef}>
      <Input
        id={id}
        name={name}
        type="text"
        autoComplete="address-line1"
        required={required}
        placeholder={placeholder ?? "Start typing an address"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(results.length > 0)}
      />
      {!usingRealMaps && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Demo address suggestions — set{" "}
          <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> in{" "}
          <code className="font-mono">.env.local</code> to switch on real Google Places.
        </p>
      )}
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-elev">
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Searching addresses…
            </div>
          )}
          {error && !loading && (
            <p className="px-3 py-2 text-xs text-danger">{error}</p>
          )}
          {!loading && !error && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground">
              No matches — keep typing or enter the address manually.
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul className="max-h-64 overflow-auto">
              {results.map((r) =>
                r.mode === "places" ? (
                  <li key={r.key}>
                    <button
                      type="button"
                      onClick={() => pickPlace(r.placeId, r.primary)}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-violet-500" />
                      <span className="min-w-0">
                        <span className="block font-medium">{r.primary}</span>
                        {r.secondary && (
                          <span className="block truncate text-xs text-muted-foreground">
                            {r.secondary}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ) : (
                  <li key={r.key}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(r.pick.line1);
                        onSelect(r.pick);
                        setOpen(false);
                      }}
                      className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-violet-500" />
                      <span className="min-w-0">
                        <span className="block font-medium">{r.pick.line1}</span>
                        <span className="block text-xs text-muted-foreground">
                          {[r.pick.city, r.pick.state, r.pick.zip, r.pick.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
