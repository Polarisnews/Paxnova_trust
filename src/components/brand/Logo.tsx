import { useId } from "react";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "mark" | "mono-light" | "mono-dark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Mark height in pixels. Wordmark scales proportionally. */
  size?: number;
  /** Disable mount + hover animations for static contexts (PDFs, dense lists). */
  noAnimate?: boolean;
}

/**
 * Paxnova Trust Bank logo.
 *
 * Glass-morphism mark: a vibrant violet→azure→navy gradient rounded
 * square, lit by a diagonal specular shine, a frosted top highlight,
 * a gold ember in the lower-right and a 1px inner edge — reads like a
 * polished glass tile. A solid white modernist "P" sits on top.
 * Mono variants drop the glass for solid outline + filled P (PDFs,
 * dark surfaces). Each instance generates unique gradient IDs so
 * multiple logos on one page don't collide.
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

  // Solid geometric P with a rounded stem, half-circle bowl and an
  // even-odd cutout for the bowl interior. One path = crisp at any size.
  const P_PATH =
    "M16 10 H23 A7 7 0 0 1 23 24 H19 V36 A2 2 0 0 1 17 38 H15 A2 2 0 0 1 13 36 V12 A2 2 0 0 1 15 10 Z M19 14 H22 A3 3 0 0 1 22 20 H19 Z";

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
        <svg
          viewBox="0 0 48 48"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="pn-logo__svg block"
        >
          <title>Paxnova Trust</title>

          {!isMono && (
            <defs>
              {/* Vibrant base — violet → azure → deep navy diagonal */}
              <linearGradient
                id={id("base")}
                x1="4"
                y1="4"
                x2="44"
                y2="44"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#7B5BFF" />
                <stop offset="45%" stopColor="#5A2EDC" />
                <stop offset="100%" stopColor="#0A1A3C" />
              </linearGradient>

              {/* Gold ember — soft radial glow anchored bottom-right */}
              <radialGradient
                id={id("ember")}
                cx="38"
                cy="40"
                r="18"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#E8C76A" stopOpacity="0.55" />
                <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
              </radialGradient>

              {/* Frosted glass — bright top fading to clear */}
              <linearGradient
                id={id("frost")}
                x1="4"
                y1="4"
                x2="4"
                y2="44"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.42" />
                <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Diagonal specular shine — top-left light source */}
              <linearGradient
                id={id("shine")}
                x1="6"
                y1="6"
                x2="26"
                y2="26"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>
          )}

          {/* === MONO PATH === simple outline tile + filled P */}
          {isMono && (
            <>
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
              <path
                className="pn-logo__p"
                d={P_PATH}
                fill={monoColor}
                fillRule="evenodd"
              />
            </>
          )}

          {/* === GLASS PATH === stacked tinted layers for depth */}
          {!isMono && (
            <>
              {/* 1. Vibrant gradient body */}
              <rect
                className="pn-logo__base"
                x="4"
                y="4"
                width="40"
                height="40"
                rx="11"
                fill={`url(#${id("base")})`}
              />
              {/* 2. Gold ember in lower-right */}
              <rect
                x="4"
                y="4"
                width="40"
                height="40"
                rx="11"
                fill={`url(#${id("ember")})`}
                pointerEvents="none"
              />
              {/* 3. Frosted top highlight */}
              <rect
                x="4"
                y="4"
                width="40"
                height="40"
                rx="11"
                fill={`url(#${id("frost")})`}
                pointerEvents="none"
              />
              {/* 4. Diagonal specular shine */}
              <rect
                x="4"
                y="4"
                width="40"
                height="40"
                rx="11"
                fill={`url(#${id("shine")})`}
                pointerEvents="none"
              />
              {/* 5. Glass edge — 1px inner border for that polished rim */}
              <rect
                x="4.5"
                y="4.5"
                width="39"
                height="39"
                rx="10.5"
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.22"
                strokeWidth="1"
                pointerEvents="none"
              />
              {/* 6. The P — crisp solid white sits on top of all the glass */}
              <path
                className="pn-logo__p"
                d={P_PATH}
                fill="#FFFFFF"
                fillRule="evenodd"
              />
            </>
          )}
        </svg>
      </span>

      {variant !== "mark" && (
        <span
          className="pn-logo__wordmark font-display font-bold tracking-tight"
          style={{
            fontSize: size * 0.68,
            color: isMono ? monoColor : "var(--foreground)",
            lineHeight: 1,
          }}
        >
          <span className="pn-logo__pax">Paxnova</span>
          <span>{" "}</span>
          <span style={{ position: "relative", display: "inline-block" }}>
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
