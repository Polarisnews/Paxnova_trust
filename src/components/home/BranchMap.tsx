"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LOCATIONS } from "@/lib/locations";

// Two pin styles for the home-page preview: a small violet dot for branches
// and a slightly larger gold dot with a soft ring for flagships.
const violetPin = L.divIcon({
  className: "",
  html: `<span style="display:inline-block;width:14px;height:14px;border-radius:9999px;background:#6E3FF3;border:3px solid white;box-shadow:0 4px 12px rgba(110,63,243,0.45);"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});
const goldPin = L.divIcon({
  className: "",
  html: `<span style="position:relative;display:inline-block;width:18px;height:18px;"><span style="position:absolute;inset:-4px;border:2px solid #D4AF37;border-radius:9999px;opacity:.4"></span><span style="display:block;width:18px;height:18px;border-radius:9999px;background:#D4AF37;border:3px solid white;box-shadow:0 4px 14px rgba(212,175,55,0.45);"></span></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Force the map to re-measure its container on mount and on every container
// resize. Without this, Leaflet often paints a blank gray box when the
// container was sized after Leaflet finished its initial layout pass.
function MapBootstrap() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    const r1 = requestAnimationFrame(() => map.invalidateSize());
    const t1 = window.setTimeout(() => map.invalidateSize(), 120);
    const t2 = window.setTimeout(() => map.invalidateSize(), 350);
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);

    // Fit the bounds to all branch pins so the preview frames the U.S.
    // footprint instead of relying on the static center/zoom.
    const branches = LOCATIONS.filter((l) => l.type !== "atm");
    if (branches.length > 1) {
      const bounds = L.latLngBounds(branches.map((b) => b.coords));
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 6 });
    }

    return () => {
      cancelAnimationFrame(r1);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

export function BranchMap() {
  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      minZoom={3}
      maxZoom={10}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", minHeight: 320 }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      <MapBootstrap />
      {LOCATIONS.filter((l) => l.type !== "atm").map((b) => (
        <Marker
          key={b.id}
          position={b.coords}
          icon={b.flagship ? goldPin : violetPin}
        >
          <Popup>
            <div style={{ fontFamily: "inherit" }}>
              <strong style={{ color: "#0A1A3C" }}>{b.name}</strong>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>
                {b.city}, {b.state} · {b.hours}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
