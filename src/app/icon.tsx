import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const P_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M16 10 H23 A7 7 0 0 1 23 24 H19 V36 A2 2 0 0 1 17 38 H15 A2 2 0 0 1 13 36 V12 A2 2 0 0 1 15 10 Z M19 14 H22 A3 3 0 0 1 22 20 H19 Z" fill-rule="evenodd" fill="#FFFFFF"/></svg>`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #7B5BFF 0%, #5A2EDC 45%, #0A1A3C 100%)",
          borderRadius: 6,
        }}
      >
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(P_SVG)}`}
          width={22}
          height={22}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
