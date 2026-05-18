import { useId } from "react";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "mark" | "mono-light" | "mono-dark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Mark height in pixels. Wordmark scales proportionally. */
  size?: number;
  /** Disable mount + ambient animations for static contexts (PDFs, dense lists). */
  noAnimate?: boolean;
}

/**
 * Paxnova Trust Bank logo — "Aurora Vault".
 *
 * Layer stack (back → front):
 *   1. Conic-gradient aurora orb (HTML span) — slowly orbits behind the glass
 *   2. Diagonal shimmer sweep (HTML span) — periodic light wipe across the face
 *   3. SVG: frosted top highlight + polished inner edge ring
 *   4. HTML P glyph in Geist Black 900 — the dominant focal element
 *
 * The P is real type (not an SVG path) so it inherits Geist's professional
 * letterform at any size, with a navy text-shadow lift that keeps it crisp
 * against any color rotating through the aurora behind it.
 *
 * Mono variants drop the orb/shimmer and render just a rounded outline +
 * the heavy P — print-safe.
 */
export function Logo({
  variant = "full",
  className,
  size = 32,
  noAnimate = false,
}: LogoProps) {
  const uid = useId().replace(/:/g, "");
  const id = (suffix: string) => `pn-${suffix}-${uid}`;

  const isMonoLight = variant === "mono-light";
  const isMonoDark = variant === "mono-dark";
  const isMono = isMonoLight || isMonoDark;
  const monoColor = isMonoLight ? "#FFFFFF" : "#0A1A3C";

  return (
    <span
      className={cn(
        "pn-logo group inline-flex items-center gap-2.5 leading-none align-middle",
        !noAnimate && "pn-logo--animated",
        className,
      )}
      aria-label="Paxnova Trust Bank"
      role="img"
    >
      <span
        className="pn-logo__mark relative inline-flex shrink-0"
        style={{ width: size, height: size }}
      >
        {!isMono && (
          <>
            {/* 1. Conic-gradient aurora orb — slowly orbits behind the glass */}
            <span aria-hidden className="pn-logo__orb" />
            {/* 2. Diagonal shimmer sweep — periodic light wipe */}
            <span aria-hidden className="pn-logo__shimmer" />
          </>
        )}

        <svg
          viewBox="0 0 48 48"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="pn-logo__svg pointer-events-none absolute inset-0 block h-full w-full"
        >
          <title>Paxnova Trust</title>

          {!isMono && (
            <defs>
              {/* Frosted top highlight — fades from bright to clear */}
              <linearGradient
                id={id("frost")}
                x1="4"
                y1="4"
                x2="4"
                y2="44"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.40" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Polished inner edge ring — bright top-left, soft bottom-right */}
              <linearGradient
                id={id("edge")}
                x1="6"
                y1="6"
                x2="42"
                y2="42"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.28" />
              </linearGradient>
            </defs>
          )}

          {/* Mono: flat rounded outline (no orb behind) */}
          {isMono && (
            <rect
              className="pn-logo__base"
              x="4"
              y="4"
              width="40"
              height="40"
              rx="11"
              fill="transparent"
              stroke={monoColor}
              strokeWidth="2"
            />
          )}

          {/* Aurora: frosted highlight + polished edge ring above the orb */}
          {!isMono && (
            <>
              <rect
                x="4"
                y="4"
                width="40"
                height="40"
                rx="11"
                fill={`url(#${id("frost")})`}
                pointerEvents="none"
              />
              <rect
                x="4.5"
                y="4.5"
                width="39"
                height="39"
                rx="10.5"
                fill="none"
                stroke={`url(#${id("edge")})`}
                strokeWidth="1"
                pointerEvents="none"
              />
            </>
          )}
        </svg>

        {/* The P — real Geist Black 900 type, sits crisp on the very top */}
        <span
          aria-hidden
          className={cn(
            "pn-logo__p-text font-display",
            !isMono && "pn-logo__p-text--lift",
          )}
          style={{
            fontSize: size * 0.86,
            color: isMono ? monoColor : "#FFFFFF",
          }}
        >
          P
        </span>
      </span>

      {variant !== "mark" && (
        <span
          className={cn(
            "pn-logo__wordmark font-display font-bold tracking-tight",
            !isMono && "pn-logo__wordmark--sheen",
          )}
          style={{
            fontSize: size * 0.68,
            lineHeight: 1,
            ...(isMono ? { color: monoColor } : {}),
          }}
        >
          <span className="pn-logo__pax">Paxnova</span>
          <span>{" "}</span>
          <span
            className="pn-logo__trust"
            style={{
              position: "relative",
              display: "inline-block",
              ...(isMono ? {} : { color: "#6E3FF3" }),
            }}
          >
            T
            <span
              aria-hidden
              className="pn-logo__t-crossbar"
              style={{
                position: "absolute",
                top: "0.18em",
                left: "-0.12em",
                width: "1em",
                height: "0.12em",
                background: isMono ? monoColor : "#D4AF37",
                borderRadius: "999px",
              }}
            />
            rust
          </span>
        </span>
      )}
    </span>
  );
}
