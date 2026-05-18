"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Clock,
  Crosshair,
  Filter,
  Landmark,
  Map as MapIcon,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  filterLocations,
  getCities,
  LOCATIONS,
  type Location,
} from "@/lib/locations";
import { cn } from "@/lib/utils";

// The Leaflet map is dynamic + ssr:false because the leaflet package touches
// `window` at module-load time.
const LocatorMap = dynamic(
  () => import("./LocatorMap").then((m) => m.LocatorMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">Loading map…</p>
      </div>
    ),
  },
);

type Tab = "all" | "branch" | "atm";

const TAB_LABEL: Record<Tab, string> = {
  all: "All",
  branch: "Branches",
  atm: "ATMs",
};

export function LocatorClient({
  initialMode = "branch",
}: {
  initialMode?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialMode);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>("");
  const [focusId, setFocusId] = useState<string | null>(null);
  // On mobile we toggle between list view and map view to save real estate.
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const cities = useMemo(() => getCities(), []);

  const filtered = useMemo(
    () =>
      filterLocations(LOCATIONS, {
        type: tab,
        query,
        city: city || undefined,
      }),
    [tab, query, city],
  );

  // When filters change, keep the focus pin only if it's still in view.
  useEffect(() => {
    if (focusId && !filtered.some((l) => l.id === focusId)) {
      setFocusId(null);
    }
  }, [filtered, focusId]);

  const branchCount = LOCATIONS.filter((l) => l.type !== "atm").length;
  const atmCount = LOCATIONS.filter((l) => l.type !== "branch").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
            Branches &amp; ATMs
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Find a Paxnova Trust near you.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Flagship branches across {cities.length} U.S. cities and{" "}
            {atmCount} fee-free ATMs nationwide. Type a city, ZIP, or branch
            name — the map updates in real time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <LegendDot color="#D4AF37" label="Flagship" ring />
          <LegendDot color="#6E3FF3" label="Branch" />
          <LegendDot color="#0A1A3C" label="ATM" small />
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by city, ZIP, branch name, or service…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm shadow-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
            aria-label="Search locations"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex h-12 items-center rounded-full border border-border bg-card p-1">
            {(["all", "branch", "atm"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "h-10 rounded-full px-4 text-xs font-semibold transition",
                  tab === t
                    ? "bg-violet-500 text-white shadow-soft"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {TAB_LABEL[t]}
                <span className="ml-1 opacity-70">
                  {t === "all"
                    ? LOCATIONS.length
                    : t === "branch"
                      ? branchCount
                      : atmCount}
                </span>
              </button>
            ))}
          </div>
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-12 rounded-full border border-border bg-card px-4 text-sm focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30"
          aria-label="Filter by city"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile view toggle */}
      <div className="mb-3 inline-flex rounded-full border border-border bg-card p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView("list")}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition",
            mobileView === "list"
              ? "bg-navy-900 text-white"
              : "text-muted-foreground",
          )}
        >
          <Filter className="size-3.5" />
          List ({filtered.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileView("map")}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition",
            mobileView === "map"
              ? "bg-navy-900 text-white"
              : "text-muted-foreground",
          )}
        >
          <MapIcon className="size-3.5" />
          Map
        </button>
      </div>

      {/* Body */}
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        {/* List */}
        <div
          className={cn(
            "rounded-2xl border border-border bg-card",
            mobileView === "map" && "hidden lg:block",
          )}
        >
          <div className="border-b border-border px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
              {city && ` in ${city}`}
            </p>
          </div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <MapPin className="size-8 text-muted-foreground" />
              <p className="mt-3 font-display text-base font-semibold">
                No locations match.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try widening the city or removing the search term.
              </p>
            </div>
          ) : (
            <ul
              className="overflow-y-auto"
              style={{ maxHeight: "min(70dvh, 640px)" }}
            >
              {filtered.map((l, i) => (
                <li
                  key={l.id}
                  className={cn(
                    "transition",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setFocusId(l.id);
                      setMobileView("map");
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-muted/50 active:scale-[0.995]",
                      focusId === l.id && "bg-violet-500/8",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                        l.flagship
                          ? "bg-gold-500 text-navy-900"
                          : l.type === "atm"
                            ? "bg-navy-900 text-white"
                            : "bg-violet-500 text-white",
                      )}
                    >
                      {l.flagship ? (
                        <Sparkles className="size-5" />
                      ) : l.type === "atm" ? (
                        <Wallet className="size-5" />
                      ) : (
                        <Landmark className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-sm font-semibold leading-tight">
                          {l.name}
                        </p>
                        {l.flagship && (
                          <span className="rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-300">
                            Flagship
                          </span>
                        )}
                        {l.type === "atm" && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            ATM only
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {l.street}, {l.city}, {l.state} {l.zip}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="size-3" />
                          {l.hours}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3" />
                          {l.phone}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {l.services.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-300"
                          >
                            {s}
                          </span>
                        ))}
                        {l.services.length > 3 && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            +{l.services.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            `${l.street}, ${l.city}, ${l.state} ${l.zip}`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 font-semibold text-violet-500 hover:text-violet-600"
                        >
                          <Crosshair className="size-3" />
                          Directions
                        </a>
                        <a
                          href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 font-semibold text-foreground/85 hover:text-foreground"
                        >
                          <Phone className="size-3" />
                          Call
                        </a>
                        <span className="text-violet-500">
                          Tap to view on map →
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map */}
        <div
          className={cn(
            "h-[60dvh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-soft lg:h-[680px]",
            mobileView === "list" && "hidden lg:block",
          )}
        >
          <LocatorMap
            locations={filtered}
            focusId={focusId}
            onPick={(id) => setFocusId(id)}
          />
        </div>
      </div>

      {/* Footer note + summary stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Landmark}
          label="Flagship branches"
          value={LOCATIONS.filter((l) => l.flagship).length}
          body="Full-service banking with private banker desks."
        />
        <SummaryCard
          icon={Building2}
          label="Branches nationwide"
          value={branchCount}
          body="Across 24 cities — every region of the U.S. covered."
        />
        <SummaryCard
          icon={Wallet}
          label="Fee-free ATMs"
          value={atmCount}
          body="Plus 55,000 AllPoint network ATMs at no charge."
        />
      </div>
    </div>
  );
}

function LegendDot({
  color,
  label,
  ring,
  small,
}: {
  color: string;
  label: string;
  ring?: boolean;
  small?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex">
        {ring && (
          <span
            aria-hidden
            className="absolute -inset-1 rounded-full"
            style={{ border: `2px solid ${color}`, opacity: 0.35 }}
          />
        )}
        <span
          aria-hidden
          className="relative inline-block rounded-full"
          style={{
            width: small ? 8 : 12,
            height: small ? 8 : 12,
            background: color,
            border: "2px solid white",
            boxShadow: "0 0 0 1px rgba(10,26,60,0.15)",
          }}
        />
      </span>
      {label}
    </span>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
          <Icon className="size-4" />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
    </div>
  );
}
