"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const branches = [
  { name: "Nova Trust — Manhattan Flagship", coords: [40.7589, -73.9851] as [number, number], hours: "Mon–Sat · 8a–7p" },
  { name: "Nova Trust — Downtown Brooklyn", coords: [40.6928, -73.9903] as [number, number], hours: "Mon–Fri · 9a–6p" },
  { name: "Nova Trust — Long Island City", coords: [40.7505, -73.9407] as [number, number], hours: "Mon–Sat · 8a–7p" },
  { name: "Nova Trust — Upper West Side", coords: [40.7872, -73.9754] as [number, number], hours: "Mon–Fri · 9a–6p" },
  { name: "Nova Trust — SoHo", coords: [40.7233, -74.0030] as [number, number], hours: "Mon–Sat · 10a–7p" },
];

const novaPin = L.divIcon({
  className: "",
  html: `
    <span style="
      display:inline-block;width:18px;height:18px;border-radius:9999px;
      background:#6E3FF3;border:3px solid white;
      box-shadow:0 4px 12px rgba(110,63,243,0.5);
    "></span>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function BranchMap() {
  useEffect(() => {
    // Force a resize so tiles render correctly after lazy load.
    setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
  }, []);

  return (
    <MapContainer
      center={[40.7505, -73.9857]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
      />
      {branches.map((b) => (
        <Marker key={b.name} position={b.coords} icon={novaPin}>
          <Popup>
            <div style={{ fontFamily: "inherit" }}>
              <strong style={{ color: "#0A1A3C" }}>{b.name}</strong>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>{b.hours}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
