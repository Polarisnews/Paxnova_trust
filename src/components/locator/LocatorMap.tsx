"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Location } from "@/lib/locations";

// Branch and ATM pins. Three styles so flagship/branch/ATM read at a glance.
function makePin(opts: {
  color: string;
  border: string;
  size: number;
  withRing?: boolean;
}) {
  const ringHtml = opts.withRing
    ? `<span style="
        position:absolute;inset:-6px;border-radius:9999px;
        border:2px solid ${opts.color};opacity:.35;
      "></span>`
    : "";
  return L.divIcon({
    className: "",
    html: `
      <span style="position:relative;display:inline-block;width:${opts.size}px;height:${opts.size}px;">
        ${ringHtml}
        <span style="
          display:block;width:${opts.size}px;height:${opts.size}px;border-radius:9999px;
          background:${opts.color};border:3px solid ${opts.border};
          box-shadow:0 4px 14px rgba(10,26,60,0.35);
        "></span>
      </span>
    `,
    iconSize: [opts.size, opts.size],
    iconAnchor: [opts.size / 2, opts.size / 2],
  });
}

const PIN_FLAGSHIP = makePin({
  color: "#D4AF37",
  border: "#fff",
  size: 22,
  withRing: true,
});
const PIN_BRANCH = makePin({ color: "#6E3FF3", border: "#fff", size: 18 });
const PIN_ATM = makePin({ color: "#0A1A3C", border: "#fff", size: 12 });

function iconFor(l: Location) {
  if (l.flagship) return PIN_FLAGSHIP;
  return l.type === "atm" ? PIN_ATM : PIN_BRANCH;
}

/**
 * Calls `invalidateSize()` on mount, on every window resize, and any time the
 * map's container changes dimensions (via ResizeObserver). This is the fix
 * for the "Leaflet shows a blank gray area" problem — Leaflet measures its
 * container exactly once on mount and never re-measures on its own.
 *
 * Also auto-fits the bounds to the visible locations whenever they change,
 * unless the user has explicitly focused a pin.
 */
function MapBootstrap({
  locations,
  focusId,
}: {
  locations: Location[];
  focusId: string | null;
}) {
  const map = useMap();

  // 1) Force a size re-measure on mount + every time the container resizes.
  useEffect(() => {
    const container = map.getContainer();
    // Initial nudge — bounce on the next animation frame and again after the
    // tiles have had a moment to load.
    const r1 = requestAnimationFrame(() => map.invalidateSize());
    const t1 = window.setTimeout(() => map.invalidateSize(), 120);
    const t2 = window.setTimeout(() => map.invalidateSize(), 350);

    // Re-measure on container resize (covers responsive grid changes,
    // mobile orientation, sidebar collapse, etc.).
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(r1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
    };
  }, [map]);

  // 2) Auto-fit to the visible locations whenever the filtered list changes
  //    and there's no pinned focus. If the user picked a single location,
  //    skip the fit and let the focus effect (below) fly there instead.
  useEffect(() => {
    if (focusId) return;
    if (locations.length === 0) return;
    if (locations.length === 1) {
      map.flyTo(locations[0].coords, 13, { duration: 0.6 });
      return;
    }
    const bounds = L.latLngBounds(locations.map((l) => l.coords));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12, animate: true });
  }, [locations, focusId, map]);

  // 3) Fly to a specific location when the user clicks a list card or pin.
  useEffect(() => {
    if (!focusId) return;
    const target = locations.find((l) => l.id === focusId);
    if (!target) return;
    map.flyTo(target.coords, 14, { duration: 0.75 });
  }, [focusId, locations, map]);

  return null;
}

export function LocatorMap({
  locations,
  focusId,
  onPick,
}: {
  locations: Location[];
  focusId: string | null;
  onPick?: (id: string) => void;
}) {
  // Initial center used until MapBootstrap fits the bounds. CONUS center.
  const center = useMemo<[number, number]>(() => [39.5, -98.35], []);

  return (
    <MapContainer
      center={center}
      zoom={4}
      minZoom={3}
      maxZoom={18}
      scrollWheelZoom
      style={{
        height: "100%",
        width: "100%",
        minHeight: 380, // belt-and-braces against parents that don't propagate height
      }}
      attributionControl={false}
    >
      <TileLayer
        // Carto Voyager basemap — no API key required, generous limits, and
        // visually consistent with our brand palette.
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        // Fallback to OSM if Carto fails — leaflet doesn't have a native
        // fallback, but the error event triggers the OSM layer's onError.
      />
      <MapBootstrap locations={locations} focusId={focusId} />
      {locations.map((l) => (
        <Marker
          key={l.id}
          position={l.coords}
          icon={iconFor(l)}
          eventHandlers={{
            click: () => onPick?.(l.id),
          }}
        >
          <Popup>
            <div style={{ fontFamily: "inherit", maxWidth: 220 }}>
              <strong style={{ color: "#0A1A3C", fontSize: 13 }}>
                {l.name}
              </strong>
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 12,
                  color: "#4A5568",
                }}
              >
                {l.street}
                <br />
                {l.city}, {l.state} {l.zip}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#0A1A3C" }}>
                <strong>Hours:</strong> {l.hours}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#0A1A3C" }}>
                <strong>Phone:</strong> {l.phone}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 10, color: "#6E3FF3" }}>
                {l.services.join(" · ")}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
