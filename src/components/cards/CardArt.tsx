"use client";

// Embossed-card visual. The network glyphs are my own stylized SVG paths —
// in the same general visual style as Visa / Mastercard / Amex marks but
// drawn from scratch, not reproductions of the official artwork.

import { type CardNetwork } from "@/lib/card-products";
import { type CardThemeKey, getCardTheme } from "@/lib/card-themes";

type Size = "sm" | "md" | "lg";

type CardArtProps = {
  network: CardNetwork;
  theme: CardThemeKey;
  cardHolder: string;
  // Either a full 16-digit string (revealed) OR a 4-digit lastFour (masked).
  pan?: string | null;
  lastFour?: string | null;
  expiryMonth: number;
  expiryYear: number;
  revealed?: boolean;
  size?: Size;
  frozen?: boolean;
};

const SIZES: Record<Size, { w: number; h: number; pad: number; radius: number; chipW: number; chipH: number; nameSize: number; numberSize: number; brandSize: number }> = {
  sm: { w: 264, h: 166, pad: 16, radius: 16, chipW: 32, chipH: 24, nameSize: 11, numberSize: 14, brandSize: 28 },
  md: { w: 320, h: 200, pad: 20, radius: 20, chipW: 38, chipH: 28, nameSize: 12, numberSize: 17, brandSize: 36 },
  lg: { w: 400, h: 250, pad: 26, radius: 24, chipW: 46, chipH: 34, nameSize: 13, numberSize: 22, brandSize: 48 },
};

function formatPan(full: string): string {
  return full.replace(/(.{4})/g, "$1 ").trim();
}

function maskedPan(lastFour: string): string {
  return `•••• •••• •••• ${lastFour.padStart(4, "•")}`;
}

export function CardArt({
  network,
  theme,
  cardHolder,
  pan,
  lastFour,
  expiryMonth,
  expiryYear,
  revealed = false,
  size = "md",
  frozen = false,
}: CardArtProps) {
  const t = getCardTheme(theme);
  const dims = SIZES[size];

  const numberDisplay =
    revealed && pan ? formatPan(pan) : maskedPan(lastFour ?? "0000");

  return (
    <div
      className="relative overflow-hidden font-mono shadow-elev"
      style={{
        width: dims.w,
        height: dims.h,
        borderRadius: dims.radius,
        background: t.gradient,
        color: t.text,
        padding: dims.pad,
        opacity: frozen ? 0.55 : 1,
        filter: frozen ? "grayscale(0.6)" : "none",
      }}
    >
      {/* Subtle highlight overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)",
        }}
      />

      {/* Frozen overlay text */}
      {frozen && (
        <div
          className="absolute right-3 top-3 z-10 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
        >
          Frozen
        </div>
      )}

      <div className="relative flex h-full flex-col justify-between">
        {/* Top row: bank wordmark */}
        <div className="flex items-center justify-between">
          <p
            className="font-display font-semibold tracking-tight"
            style={{ color: t.text, fontSize: dims.nameSize + 1 }}
          >
            Paxnova Trust
          </p>
          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: t.textSubtle }}
          >
            {network === "amex" ? "Black Card" : network === "mastercard" ? "Plus" : "Core"}
          </p>
        </div>

        {/* Chip */}
        <div
          aria-hidden="true"
          style={{
            width: dims.chipW,
            height: dims.chipH,
            borderRadius: 6,
            background: t.chip,
            boxShadow:
              "inset 0 -1px 1px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.4)",
            position: "relative",
          }}
        >
          {/* Chip embossed dot grid */}
          <div
            className="absolute inset-1 grid grid-cols-3 grid-rows-2 gap-px"
            style={{ opacity: 0.35 }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="rounded-sm"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.35) 100%)",
                }}
              />
            ))}
          </div>
        </div>

        {/* PAN */}
        <p
          className="select-text tracking-[0.18em]"
          style={{ fontSize: dims.numberSize, color: t.text, fontWeight: 500 }}
        >
          {numberDisplay}
        </p>

        {/* Bottom row: holder + expiry + network glyph */}
        <div className="flex items-end justify-between">
          <div>
            <p
              className="uppercase tracking-[0.15em]"
              style={{ color: t.textSubtle, fontSize: dims.nameSize - 2 }}
            >
              Cardholder
            </p>
            <p
              className="uppercase tracking-wider"
              style={{ color: t.text, fontSize: dims.nameSize, fontWeight: 600 }}
            >
              {cardHolder || "—"}
            </p>
          </div>
          <div className="text-right">
            <p
              className="uppercase tracking-[0.15em]"
              style={{ color: t.textSubtle, fontSize: dims.nameSize - 2 }}
            >
              Expires
            </p>
            <p
              style={{ color: t.text, fontSize: dims.nameSize, fontWeight: 600 }}
            >
              {String(expiryMonth).padStart(2, "0")}/{String(expiryYear).slice(-2)}
            </p>
          </div>
          <NetworkGlyph network={network} size={dims.brandSize} />
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Network glyphs — my own stylised renditions, not the official artwork.
// ────────────────────────────────────────────────────────────────────────

function NetworkGlyph({ network, size }: { network: CardNetwork; size: number }) {
  if (network === "visa") return <VisaGlyph size={size} />;
  if (network === "mastercard") return <MastercardGlyph size={size} />;
  return <AmexGlyph size={size} />;
}

function VisaGlyph({ size }: { size: number }) {
  // Bold geometric wordmark in a single-weight sans, italicised, accent
  // stripe under the third letter.
  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 90 36"
      aria-label="Visa-style network mark"
    >
      <text
        x="0"
        y="26"
        fontFamily="Geist, system-ui, -apple-system, sans-serif"
        fontWeight={900}
        fontSize="28"
        fontStyle="italic"
        letterSpacing="1"
        fill="#ffffff"
      >
        VISA
      </text>
      <rect x="0" y="31" width="90" height="3" fill="#F7B600" rx="1.5" />
    </svg>
  );
}

function MastercardGlyph({ size }: { size: number }) {
  // Two overlapping discs in red + amber with a multiply blend through the
  // overlap.
  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 56 36"
      aria-label="Mastercard-style network mark"
    >
      <circle cx="20" cy="18" r="14" fill="#EB001B" />
      <circle cx="36" cy="18" r="14" fill="#F79E1B" opacity="0.95" />
      {/* Overlap */}
      <path
        d="M28 6 a14 14 0 0 1 0 24 a14 14 0 0 1 0 -24 z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexGlyph({ size }: { size: number }) {
  // Compact navy plaque with a stylised shield + "AMERICAN EXPRESS" caps.
  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 72 44"
      aria-label="American Express-style network mark"
    >
      <rect width="72" height="44" rx="3" fill="#0F4E96" />
      <path
        d="M36 8 L48 16 L48 30 C48 33 42 38 36 38 C30 38 24 33 24 30 L24 16 Z"
        fill="#0A3A75"
        stroke="#EAF1FF"
        strokeWidth="0.8"
      />
      <text
        x="36"
        y="22"
        textAnchor="middle"
        fontFamily="Geist, system-ui, -apple-system, sans-serif"
        fontWeight={700}
        fontSize="5"
        fill="#EAF1FF"
        letterSpacing="0.5"
      >
        AMERICAN
      </text>
      <text
        x="36"
        y="29"
        textAnchor="middle"
        fontFamily="Geist, system-ui, -apple-system, sans-serif"
        fontWeight={700}
        fontSize="5"
        fill="#EAF1FF"
        letterSpacing="0.5"
      >
        EXPRESS
      </text>
    </svg>
  );
}
