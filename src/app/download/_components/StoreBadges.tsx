"use client";

// Stylized inline-SVG store badges. Same general visual style as the
// official Apple "Download on the App Store" and Google "Get it on Google
// Play" badges (rounded dark plaque, brand glyph, two-line label), drawn
// from scratch — not a reproduction of the official artwork.

import Link from "next/link";

type Size = "sm" | "md";

export function AppleStoreBadge({
  href = "/download/ios",
  size = "md",
}: {
  href?: string;
  size?: Size;
}) {
  const dims =
    size === "sm"
      ? { padX: 14, padY: 6, gap: 10, glyph: 22, line1: 9, line2: 16 }
      : { padX: 18, padY: 9, gap: 12, glyph: 28, line1: 10, line2: 19 };

  return (
    <Link
      href={href}
      aria-label="Download on the App Store"
      className="inline-flex items-center gap-3 rounded-xl bg-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-zinc-900"
      style={{
        paddingLeft: dims.padX,
        paddingRight: dims.padX,
        paddingTop: dims.padY,
        paddingBottom: dims.padY,
        gap: dims.gap,
      }}
    >
      <AppleGlyph size={dims.glyph} />
      <span className="flex flex-col leading-none">
        <span
          className="font-medium tracking-wide text-white/85"
          style={{ fontSize: dims.line1 }}
        >
          Download on the
        </span>
        <span
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: dims.line2, marginTop: 2 }}
        >
          App Store
        </span>
      </span>
    </Link>
  );
}

export function GooglePlayBadge({
  href = "/download/android",
  size = "md",
}: {
  href?: string;
  size?: Size;
}) {
  const dims =
    size === "sm"
      ? { padX: 14, padY: 6, gap: 10, glyph: 22, line1: 9, line2: 16 }
      : { padX: 18, padY: 9, gap: 12, glyph: 26, line1: 10, line2: 19 };

  return (
    <Link
      href={href}
      aria-label="Get it on Google Play"
      className="inline-flex items-center gap-3 rounded-xl bg-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-zinc-900"
      style={{
        paddingLeft: dims.padX,
        paddingRight: dims.padX,
        paddingTop: dims.padY,
        paddingBottom: dims.padY,
        gap: dims.gap,
      }}
    >
      <PlayGlyph size={dims.glyph} />
      <span className="flex flex-col leading-none">
        <span
          className="font-medium tracking-[0.18em] uppercase text-white/85"
          style={{ fontSize: dims.line1 }}
        >
          Get it on
        </span>
        <span
          className="font-display font-semibold tracking-tight"
          style={{ fontSize: dims.line2, marginTop: 2 }}
        >
          Google Play
        </span>
      </span>
    </Link>
  );
}

function AppleGlyph({ size }: { size: number }) {
  // Simplified apple silhouette drawn from custom paths. A rounded body
  // with a small leaf, suggestive of an apple — not the official mark.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.4 17.9c0-3 2.4-4.4 2.5-4.5-1.4-2-3.5-2.3-4.3-2.3-1.8-.2-3.5 1.1-4.4 1.1-.9 0-2.4-1-3.9-1-2 0-3.9 1.2-4.9 3-2.1 3.6-.5 9 1.5 12 1 1.4 2.2 3 3.8 2.9 1.5-.1 2.1-1 4-1s2.4 1 4 1c1.7 0 2.7-1.4 3.7-2.8 1.2-1.6 1.7-3.2 1.7-3.3-.1 0-3.7-1.4-3.7-5.6Z" />
      <path d="M18.8 8.2c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.6.8-3.5 1.8-.8.9-1.5 2.3-1.3 3.6 1.3.1 2.7-.7 3.6-1.6Z" />
    </svg>
  );
}

function PlayGlyph({ size }: { size: number }) {
  // Triangular play mark made from four coloured facets, drawn from custom
  // paths. Evocative of the Play badge style without reproducing it.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gp-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2EC9FF" />
          <stop offset="100%" stopColor="#1A8DD8" />
        </linearGradient>
        <linearGradient id="gp-green" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#56E37A" />
          <stop offset="100%" stopColor="#16A34A" />
        </linearGradient>
        <linearGradient id="gp-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="gp-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      {/* Top-left → upper facet (cyan) */}
      <path d="M6 4 L22 15 L16 15 L6 9 Z" fill="url(#gp-cyan)" />
      {/* Right → tip (yellow) */}
      <path d="M22 15 L28 16 L22 17 Z" fill="url(#gp-yellow)" />
      {/* Bottom-left → lower facet (red) */}
      <path d="M6 28 L22 17 L16 17 L6 23 Z" fill="url(#gp-red)" />
      {/* Centre → inner facet (green) */}
      <path d="M6 9 L16 15 L16 17 L6 23 Z" fill="url(#gp-green)" />
    </svg>
  );
}
