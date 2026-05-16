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
 * Paxnova Trust Bank logo (2026 redesign).
 *
 * Mark: a rounded "vault" in navy with a stylized P knocked out in white;
 * a gold accent orb sits inside the P's bowl as the brand spark. Strokes
 * draw in, the orb pops + breathes continuously, and the whole mark tilts
 * with a violet shadow lift on hover.
 *
 * Wordmark: "Paxnova Trust" in the display font, with the T-crossbar
 * extended in gold (or accent) as a brand signature.
 */
export function Logo({
  variant = "full",
  className,
  size = 32,
  noAnimate = false,
}: LogoProps) {
  const isMonoLight = variant === "mono-light";
  const isMonoDark = variant === "mono-dark";
  const isMono = isMonoLight || isMonoDark;

  const palette = (() => {
    if (isMonoLight) {
      return {
        baseFill: "transparent",
        baseStroke: "#FFFFFF",
        baseStrokeW: 2,
        letter: "#FFFFFF",
        orb: "#FFFFFF",
        word: "#FFFFFF",
        accent: "#FFFFFF",
        showShine: false,
      };
    }
    if (isMonoDark) {
      return {
        baseFill: "transparent",
        baseStroke: "#0A1A3C",
        baseStrokeW: 2,
        letter: "#0A1A3C",
        orb: "#0A1A3C",
        word: "#0A1A3C",
        accent: "#0A1A3C",
        showShine: false,
      };
    }
    return {
      baseFill: "#0A1A3C",
      baseStroke: "none",
      baseStrokeW: 0,
      letter: "#FFFFFF",
      orb: "#D4AF37",
      word: "var(--foreground)",
      accent: "#D4AF37",
      showShine: true,
    };
  })();

  return (
    <span
      className={cn(
        "pn-logo group inline-flex items-center gap-2.5 leading-none align-middle",
        !noAnimate && "pn-logo--animated",
        className
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

          {palette.showShine && (
            <defs>
              <linearGradient id="pn-shine" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6E3FF3" stopOpacity="0.42" />
                <stop offset="55%" stopColor="#6E3FF3" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="pn-spec" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
            </defs>
          )}

          {/* Vault base — rounded square */}
          <rect
            className="pn-logo__base"
            x="4"
            y="4"
            width="40"
            height="40"
            rx="11"
            fill={palette.baseFill}
            stroke={palette.baseStroke}
            strokeWidth={palette.baseStrokeW}
          />

          {/* Violet undertone gradient — gives the navy depth (full variant only) */}
          {palette.showShine && (
            <rect
              x="4"
              y="4"
              width="40"
              height="40"
              rx="11"
              fill="url(#pn-shine)"
              pointerEvents="none"
            />
          )}

          {/* Subtle top-left specular highlight — premium 3D feel */}
          {palette.showShine && (
            <rect
              x="4"
              y="4"
              width="40"
              height="40"
              rx="11"
              fill="url(#pn-spec)"
              pointerEvents="none"
            />
          )}

          {/* Stylized P — vertical stem */}
          <path
            className="pn-logo__p-stem"
            d="M15 13 V35"
            stroke={palette.letter}
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Stylized P — bowl */}
          <path
            className="pn-logo__p-bowl"
            d="M15 13 H23 A6 6 0 0 1 23 25 H15"
            stroke={palette.letter}
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Gold accent orb — the brand spark sitting inside the P's bowl */}
          <circle
            className="pn-logo__orb"
            cx="20"
            cy="19"
            r="2.2"
            fill={palette.orb}
          />
        </svg>
      </span>

      {variant !== "mark" && (
        <span
          className="pn-logo__wordmark font-display font-bold tracking-tight"
          style={{
            fontSize: size * 0.68,
            color: palette.word,
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
                background: palette.accent,
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
