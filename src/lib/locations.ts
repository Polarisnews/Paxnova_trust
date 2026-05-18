// Paxnova Trust branch & ATM directory. Coordinates are real lat/lng for
// each address so Leaflet pins drop in the correct city block; the street
// addresses themselves are illustrative for this demo build.
//
// Total: 24 cities including 6 flagship metros with 4–7 branches each, and
// 18 secondary metros with one anchor branch. Several entries are tagged
// `type: "both"` meaning the branch also has an ATM on-site.

export type LocationType = "branch" | "atm" | "both";

export type Location = {
  id: string;
  type: LocationType;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  /** [lat, lng] — used directly by Leaflet. */
  coords: [number, number];
  hours: string;
  services: string[];
  /** Marks the bank's HQ + flagship branches (purple pin, larger). */
  flagship?: boolean;
};

export const LOCATIONS: Location[] = [
  // ────────── San Francisco, CA — HQ ──────────────────────────────────
  {
    id: "sf-hq",
    type: "both",
    name: "Paxnova Trust — Headquarters & Flagship",
    street: "1000 N Point St",
    city: "San Francisco",
    state: "CA",
    zip: "94109",
    phone: "(415) 555-0100",
    coords: [37.8062, -122.4233],
    hours: "Mon–Sat · 8a–7p · ATM 24/7",
    services: ["Wealth Center", "Safe Deposit", "Notary", "Wires", "ATM"],
    flagship: true,
  },
  {
    id: "sf-financial",
    type: "both",
    name: "Paxnova Trust — Financial District",
    street: "555 California St",
    city: "San Francisco",
    state: "CA",
    zip: "94104",
    phone: "(415) 555-0102",
    coords: [37.7926, -122.4035],
    hours: "Mon–Fri · 8a–6p · ATM 24/7",
    services: ["Commercial banking", "Wires", "ATM"],
  },
  {
    id: "sf-mission",
    type: "both",
    name: "Paxnova Trust — Mission",
    street: "2090 Mission St",
    city: "San Francisco",
    state: "CA",
    zip: "94110",
    phone: "(415) 555-0104",
    coords: [37.7626, -122.4194],
    hours: "Mon–Sat · 9a–6p · ATM 24/7",
    services: ["Personal banking", "Bilingual (ES)", "ATM"],
  },
  {
    id: "sf-marina",
    type: "both",
    name: "Paxnova Trust — Marina",
    street: "2255 Chestnut St",
    city: "San Francisco",
    state: "CA",
    zip: "94123",
    phone: "(415) 555-0106",
    coords: [37.8005, -122.4407],
    hours: "Mon–Fri · 9a–6p · ATM 24/7",
    services: ["Mortgage center", "ATM"],
  },
  {
    id: "sf-mission-bay-atm",
    type: "atm",
    name: "Paxnova Trust ATM — Mission Bay",
    street: "1685 3rd St",
    city: "San Francisco",
    state: "CA",
    zip: "94158",
    phone: "1-800-PAXNOVA-1",
    coords: [37.7706, -122.3892],
    hours: "ATM 24/7",
    services: ["ATM", "Cash deposit"],
  },

  // ────────── New York, NY — Flagship metro ───────────────────────────
  {
    id: "ny-manhattan",
    type: "both",
    name: "Paxnova Trust — Manhattan Flagship",
    street: "350 Madison Ave",
    city: "New York",
    state: "NY",
    zip: "10017",
    phone: "(212) 555-0188",
    coords: [40.7548, -73.9799],
    hours: "Mon–Sat · 8a–7p · ATM 24/7",
    services: ["Private Banking", "Safe Deposit", "Notary", "Wires", "ATM"],
    flagship: true,
  },
  {
    id: "ny-wall-st",
    type: "both",
    name: "Paxnova Trust — Wall Street",
    street: "60 Broad St",
    city: "New York",
    state: "NY",
    zip: "10004",
    phone: "(212) 555-0189",
    coords: [40.7058, -74.0114],
    hours: "Mon–Fri · 8a–6p · ATM 24/7",
    services: ["Commercial", "Wires", "ATM"],
  },
  {
    id: "ny-soho",
    type: "both",
    name: "Paxnova Trust — SoHo",
    street: "118 Greene St",
    city: "New York",
    state: "NY",
    zip: "10012",
    phone: "(212) 555-0190",
    coords: [40.7233, -74.0014],
    hours: "Mon–Sat · 10a–7p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },
  {
    id: "ny-brooklyn",
    type: "both",
    name: "Paxnova Trust — Downtown Brooklyn",
    street: "1 MetroTech Ctr",
    city: "Brooklyn",
    state: "NY",
    zip: "11201",
    phone: "(718) 555-0191",
    coords: [40.6928, -73.9871],
    hours: "Mon–Fri · 9a–6p · ATM 24/7",
    services: ["Personal banking", "Mortgage center", "ATM"],
  },
  {
    id: "ny-lic-atm",
    type: "atm",
    name: "Paxnova Trust ATM — Long Island City",
    street: "44-02 23rd St",
    city: "Long Island City",
    state: "NY",
    zip: "11101",
    phone: "1-800-PAXNOVA-1",
    coords: [40.7505, -73.9407],
    hours: "ATM 24/7",
    services: ["ATM", "Cash deposit"],
  },
  {
    id: "ny-uws-atm",
    type: "atm",
    name: "Paxnova Trust ATM — Upper West Side",
    street: "2350 Broadway",
    city: "New York",
    state: "NY",
    zip: "10024",
    phone: "1-800-PAXNOVA-1",
    coords: [40.7872, -73.9754],
    hours: "ATM 24/7",
    services: ["ATM"],
  },

  // ────────── Los Angeles, CA ─────────────────────────────────────────
  {
    id: "la-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown LA",
    street: "633 W 5th St",
    city: "Los Angeles",
    state: "CA",
    zip: "90071",
    phone: "(213) 555-0140",
    coords: [34.0512, -118.2562],
    hours: "Mon–Sat · 8a–7p · ATM 24/7",
    services: ["Wealth Center", "Wires", "ATM"],
    flagship: true,
  },
  {
    id: "la-beverly",
    type: "both",
    name: "Paxnova Trust — Beverly Hills",
    street: "9595 Wilshire Blvd",
    city: "Beverly Hills",
    state: "CA",
    zip: "90212",
    phone: "(310) 555-0141",
    coords: [34.0670, -118.4019],
    hours: "Mon–Fri · 9a–6p · ATM 24/7",
    services: ["Private Banking", "ATM"],
  },
  {
    id: "la-santa-monica",
    type: "both",
    name: "Paxnova Trust — Santa Monica",
    street: "1314 3rd Street Promenade",
    city: "Santa Monica",
    state: "CA",
    zip: "90401",
    phone: "(310) 555-0142",
    coords: [34.0145, -118.4979],
    hours: "Mon–Sat · 9a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },
  {
    id: "la-pasadena",
    type: "both",
    name: "Paxnova Trust — Pasadena",
    street: "215 S Lake Ave",
    city: "Pasadena",
    state: "CA",
    zip: "91101",
    phone: "(626) 555-0143",
    coords: [34.1425, -118.1314],
    hours: "Mon–Fri · 9a–6p · ATM 24/7",
    services: ["Mortgage center", "ATM"],
  },

  // ────────── Chicago, IL ─────────────────────────────────────────────
  {
    id: "chi-loop",
    type: "both",
    name: "Paxnova Trust — Chicago Loop",
    street: "200 S LaSalle St",
    city: "Chicago",
    state: "IL",
    zip: "60604",
    phone: "(312) 555-0170",
    coords: [41.8800, -87.6322],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Commercial banking", "Notary", "ATM"],
    flagship: true,
  },
  {
    id: "chi-river-north",
    type: "both",
    name: "Paxnova Trust — River North",
    street: "401 N Wabash Ave",
    city: "Chicago",
    state: "IL",
    zip: "60611",
    phone: "(312) 555-0171",
    coords: [41.8896, -87.6266],
    hours: "Mon–Sat · 9a–6p · ATM 24/7",
    services: ["Personal banking", "Wires", "ATM"],
  },
  {
    id: "chi-lincoln-park",
    type: "both",
    name: "Paxnova Trust — Lincoln Park",
    street: "2400 N Clark St",
    city: "Chicago",
    state: "IL",
    zip: "60614",
    phone: "(312) 555-0172",
    coords: [41.9261, -87.6420],
    hours: "Mon–Sat · 9a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },
  {
    id: "chi-evanston-atm",
    type: "atm",
    name: "Paxnova Trust ATM — Evanston",
    street: "1700 Sherman Ave",
    city: "Evanston",
    state: "IL",
    zip: "60201",
    phone: "1-800-PAXNOVA-1",
    coords: [42.0469, -87.6843],
    hours: "ATM 24/7",
    services: ["ATM"],
  },

  // ────────── Miami, FL ───────────────────────────────────────────────
  {
    id: "mia-brickell",
    type: "both",
    name: "Paxnova Trust — Brickell",
    street: "1450 Brickell Ave",
    city: "Miami",
    state: "FL",
    zip: "33131",
    phone: "(305) 555-0210",
    coords: [25.7600, -80.1916],
    hours: "Mon–Sat · 8a–7p · ATM 24/7",
    services: ["International Banking", "Wires", "ATM"],
    flagship: true,
  },
  {
    id: "mia-design-district",
    type: "both",
    name: "Paxnova Trust — Design District",
    street: "140 NE 39th St",
    city: "Miami",
    state: "FL",
    zip: "33137",
    phone: "(305) 555-0211",
    coords: [25.8133, -80.1923],
    hours: "Mon–Sat · 9a–6p · ATM 24/7",
    services: ["Personal banking", "Bilingual (ES)", "ATM"],
  },
  {
    id: "mia-coral-gables",
    type: "both",
    name: "Paxnova Trust — Coral Gables",
    street: "2700 Ponce de Leon Blvd",
    city: "Coral Gables",
    state: "FL",
    zip: "33134",
    phone: "(305) 555-0212",
    coords: [25.7472, -80.2575],
    hours: "Mon–Fri · 9a–6p · ATM 24/7",
    services: ["Mortgage center", "ATM"],
  },
  {
    id: "mia-beach-atm",
    type: "atm",
    name: "Paxnova Trust ATM — South Beach",
    street: "1100 Collins Ave",
    city: "Miami Beach",
    state: "FL",
    zip: "33139",
    phone: "1-800-PAXNOVA-1",
    coords: [25.7836, -80.1330],
    hours: "ATM 24/7",
    services: ["ATM"],
  },

  // ────────── Boston, MA ──────────────────────────────────────────────
  {
    id: "bos-back-bay",
    type: "both",
    name: "Paxnova Trust — Back Bay",
    street: "800 Boylston St",
    city: "Boston",
    state: "MA",
    zip: "02199",
    phone: "(617) 555-0240",
    coords: [42.3475, -71.0826],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Wealth Center", "Wires", "ATM"],
    flagship: true,
  },
  {
    id: "bos-financial",
    type: "both",
    name: "Paxnova Trust — Financial District",
    street: "53 State St",
    city: "Boston",
    state: "MA",
    zip: "02109",
    phone: "(617) 555-0241",
    coords: [42.3596, -71.0567],
    hours: "Mon–Fri · 8a–6p · ATM 24/7",
    services: ["Commercial banking", "ATM"],
  },
  {
    id: "bos-cambridge",
    type: "both",
    name: "Paxnova Trust — Cambridge",
    street: "1 Kendall Sq",
    city: "Cambridge",
    state: "MA",
    zip: "02139",
    phone: "(617) 555-0242",
    coords: [42.3625, -71.0846],
    hours: "Mon–Sat · 9a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Washington, DC ──────────────────────────────────────────
  {
    id: "dc-downtown",
    type: "both",
    name: "Paxnova Trust — DC Downtown",
    street: "1001 Pennsylvania Ave NW",
    city: "Washington",
    state: "DC",
    zip: "20004",
    phone: "(202) 555-0270",
    coords: [38.8951, -77.0274],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Government banking", "Notary", "ATM"],
  },
  {
    id: "dc-georgetown",
    type: "both",
    name: "Paxnova Trust — Georgetown",
    street: "3115 M St NW",
    city: "Washington",
    state: "DC",
    zip: "20007",
    phone: "(202) 555-0271",
    coords: [38.9051, -77.0635],
    hours: "Mon–Sat · 9a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Seattle, WA ─────────────────────────────────────────────
  {
    id: "sea-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Seattle",
    street: "1201 4th Ave",
    city: "Seattle",
    state: "WA",
    zip: "98101",
    phone: "(206) 555-0300",
    coords: [47.6062, -122.3321],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Commercial banking", "Wires", "ATM"],
  },
  {
    id: "sea-capitol-hill",
    type: "atm",
    name: "Paxnova Trust ATM — Capitol Hill",
    street: "1525 Broadway",
    city: "Seattle",
    state: "WA",
    zip: "98122",
    phone: "1-800-PAXNOVA-1",
    coords: [47.6149, -122.3208],
    hours: "ATM 24/7",
    services: ["ATM"],
  },

  // ────────── Austin, TX ──────────────────────────────────────────────
  {
    id: "atx-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Austin",
    street: "300 W 6th St",
    city: "Austin",
    state: "TX",
    zip: "78701",
    phone: "(512) 555-0330",
    coords: [30.2696, -97.7460],
    hours: "Mon–Sat · 8a–7p · ATM 24/7",
    services: ["Personal banking", "Wires", "ATM"],
  },
  {
    id: "atx-domain",
    type: "atm",
    name: "Paxnova Trust ATM — The Domain",
    street: "11410 Century Oaks Ter",
    city: "Austin",
    state: "TX",
    zip: "78758",
    phone: "1-800-PAXNOVA-1",
    coords: [30.4019, -97.7252],
    hours: "ATM 24/7",
    services: ["ATM"],
  },

  // ────────── Atlanta, GA ─────────────────────────────────────────────
  {
    id: "atl-midtown",
    type: "both",
    name: "Paxnova Trust — Midtown Atlanta",
    street: "1100 Peachtree St NE",
    city: "Atlanta",
    state: "GA",
    zip: "30309",
    phone: "(404) 555-0360",
    coords: [33.7853, -84.3835],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "Mortgage center", "ATM"],
  },

  // ────────── Denver, CO ──────────────────────────────────────────────
  {
    id: "den-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Denver",
    street: "1801 California St",
    city: "Denver",
    state: "CO",
    zip: "80202",
    phone: "(303) 555-0390",
    coords: [39.7458, -104.9943],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "Wires", "ATM"],
  },

  // ────────── Philadelphia, PA ────────────────────────────────────────
  {
    id: "phl-center-city",
    type: "both",
    name: "Paxnova Trust — Center City",
    street: "1700 Market St",
    city: "Philadelphia",
    state: "PA",
    zip: "19103",
    phone: "(215) 555-0420",
    coords: [39.9533, -75.1690],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "Notary", "ATM"],
  },

  // ────────── Houston, TX ─────────────────────────────────────────────
  {
    id: "hou-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Houston",
    street: "1200 Smith St",
    city: "Houston",
    state: "TX",
    zip: "77002",
    phone: "(713) 555-0450",
    coords: [29.7572, -95.3656],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Commercial banking", "International", "ATM"],
  },

  // ────────── Dallas, TX ──────────────────────────────────────────────
  {
    id: "dal-uptown",
    type: "both",
    name: "Paxnova Trust — Uptown Dallas",
    street: "2200 Ross Ave",
    city: "Dallas",
    state: "TX",
    zip: "75201",
    phone: "(214) 555-0480",
    coords: [32.7891, -96.7990],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "Wires", "ATM"],
  },

  // ────────── Phoenix, AZ ─────────────────────────────────────────────
  {
    id: "phx-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Phoenix",
    street: "201 E Washington St",
    city: "Phoenix",
    state: "AZ",
    zip: "85004",
    phone: "(602) 555-0510",
    coords: [33.4488, -112.0707],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── San Diego, CA ───────────────────────────────────────────
  {
    id: "sd-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown San Diego",
    street: "501 W Broadway",
    city: "San Diego",
    state: "CA",
    zip: "92101",
    phone: "(619) 555-0540",
    coords: [32.7158, -117.1611],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Minneapolis, MN ─────────────────────────────────────────
  {
    id: "msp-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Minneapolis",
    street: "601 Nicollet Mall",
    city: "Minneapolis",
    state: "MN",
    zip: "55402",
    phone: "(612) 555-0570",
    coords: [44.9785, -93.2723],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Portland, OR ────────────────────────────────────────────
  {
    id: "pdx-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Portland",
    street: "900 SW 5th Ave",
    city: "Portland",
    state: "OR",
    zip: "97204",
    phone: "(503) 555-0600",
    coords: [45.5152, -122.6784],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Nashville, TN ───────────────────────────────────────────
  {
    id: "nsh-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Nashville",
    street: "401 Commerce St",
    city: "Nashville",
    state: "TN",
    zip: "37219",
    phone: "(615) 555-0630",
    coords: [36.1627, -86.7816],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Charlotte, NC ───────────────────────────────────────────
  {
    id: "clt-uptown",
    type: "both",
    name: "Paxnova Trust — Uptown Charlotte",
    street: "200 N Tryon St",
    city: "Charlotte",
    state: "NC",
    zip: "28202",
    phone: "(704) 555-0660",
    coords: [35.2271, -80.8431],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Commercial banking", "Wires", "ATM"],
  },

  // ────────── Raleigh, NC ─────────────────────────────────────────────
  {
    id: "rdu-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Raleigh",
    street: "150 Fayetteville St",
    city: "Raleigh",
    state: "NC",
    zip: "27601",
    phone: "(919) 555-0690",
    coords: [35.7796, -78.6382],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Pittsburgh, PA ──────────────────────────────────────────
  {
    id: "pit-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Pittsburgh",
    street: "600 Grant St",
    city: "Pittsburgh",
    state: "PA",
    zip: "15219",
    phone: "(412) 555-0720",
    coords: [40.4406, -79.9959],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── New Orleans, LA ─────────────────────────────────────────
  {
    id: "msy-cbd",
    type: "both",
    name: "Paxnova Trust — New Orleans CBD",
    street: "701 Poydras St",
    city: "New Orleans",
    state: "LA",
    zip: "70139",
    phone: "(504) 555-0750",
    coords: [29.9511, -90.0715],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Salt Lake City, UT ──────────────────────────────────────
  {
    id: "slc-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown SLC",
    street: "60 E South Temple",
    city: "Salt Lake City",
    state: "UT",
    zip: "84111",
    phone: "(801) 555-0780",
    coords: [40.7608, -111.8910],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["Personal banking", "ATM"],
  },

  // ────────── Honolulu, HI ────────────────────────────────────────────
  {
    id: "hnl-downtown",
    type: "both",
    name: "Paxnova Trust — Downtown Honolulu",
    street: "1132 Bishop St",
    city: "Honolulu",
    state: "HI",
    zip: "96813",
    phone: "(808) 555-0810",
    coords: [21.3099, -157.8581],
    hours: "Mon–Sat · 8a–6p · ATM 24/7",
    services: ["International banking", "ATM"],
  },
];

/** Unique cities, sorted alphabetically, with their state appended. */
export function getCities(): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const l of LOCATIONS) {
    map.set(`${l.city}, ${l.state}`, l.city);
  }
  return Array.from(map.keys())
    .sort()
    .map((k) => ({ value: k, label: k }));
}

export function filterLocations(
  list: Location[],
  filter: {
    type?: "all" | "branch" | "atm";
    query?: string;
    city?: string;
    service?: string;
  },
): Location[] {
  const type = filter.type ?? "all";
  const q = (filter.query ?? "").trim().toLowerCase();
  return list.filter((l) => {
    if (type === "branch" && l.type === "atm") return false;
    if (type === "atm" && l.type === "branch") return false;
    if (filter.city && `${l.city}, ${l.state}` !== filter.city) return false;
    if (filter.service && !l.services.includes(filter.service)) return false;
    if (q) {
      const hay = `${l.name} ${l.street} ${l.city} ${l.state} ${l.zip} ${l.services.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
