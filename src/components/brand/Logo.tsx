import { cn } from "@/lib/utils";

type LogoVariant = "full" | "mark" | "mono-light" | "mono-dark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /**
   * Mark height in pixels. Wordmark scales proportionally.
   */
  size?: number;
}

/**
 * Nova Trust Bank logo.
 *
 * Mark: two interlocking diagonal bars (navy + violet) crossed by a gold
 * accent stripe — speed, intersection, and trust. The wordmark "Nova Trust"
 * is set in the display font with the T-crossbar extended in gold.
 */
export function Logo({ variant = "full", className, size = 32 }: LogoProps) {
  const isMono = variant === "mono-light" || variant === "mono-dark";
  const markFill1 = variant === "mono-light" ? "#FFFFFF" : variant === "mono-dark" ? "#0A1A3C" : "#0A1A3C";
  const markFill2 = variant === "mono-light" ? "#FFFFFF" : variant === "mono-dark" ? "#0A1A3C" : "#6E3FF3";
  const accentFill = isMono ? "currentColor" : "#D4AF37";
  const wordFill = variant === "mono-light" ? "#FFFFFF" : variant === "mono-dark" ? "#0A1A3C" : "#0A1A3C";
  const accentWord = isMono ? "currentColor" : "#D4AF37";

  return (
    <span
      className={cn("inline-flex items-center gap-2.5 leading-none", className)}
      aria-label="Nova Trust Bank"
      role="img"
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <title>Nova Trust</title>
        {/* Navy bar: diagonal top-left to bottom-right */}
        <path
          d="M6 4 H16 L42 36 V44 H32 L6 12 Z"
          fill={markFill1}
        />
        {/* Violet bar: diagonal bottom-left to top-right */}
        <path
          d="M6 44 V36 L32 4 H42 V12 L16 44 Z"
          fill={markFill2}
          fillOpacity={isMono ? 1 : 0.94}
        />
        {/* Gold accent: small center node */}
        <circle cx="24" cy="24" r="3.25" fill={accentFill} />
      </svg>

      {variant !== "mark" && (
        <span
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: size * 0.65, color: wordFill, lineHeight: 1 }}
        >
          Nova{" "}
          <span style={{ position: "relative", display: "inline-block" }}>
            T
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: "0.18em",
                left: "-0.12em",
                width: "1em",
                height: "0.12em",
                background: accentWord,
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
