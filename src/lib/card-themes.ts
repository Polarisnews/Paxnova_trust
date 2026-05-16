// Four selectable card-art themes. Each is a CSS background-image string +
// a few accent tokens. The CardArt component picks the theme at render
// time and applies the gradient + foreground colors.

export type CardThemeKey = "obsidian" | "aurora" | "sand" | "crimson";

export type CardTheme = {
  key: CardThemeKey;
  label: string;
  // Tailwind-friendly gradient applied as the card background.
  gradient: string;
  // Foreground text color (typically a high-contrast off-white or near-black).
  text: string;
  // Soft secondary text color for less-important rows (expiry, holder).
  textSubtle: string;
  // Accent used by the chip rim and minor flourishes.
  accent: string;
  // Chip top-color (the gold/silver inlay).
  chip: string;
};

export const CARD_THEMES: CardTheme[] = [
  {
    key: "obsidian",
    label: "Obsidian",
    gradient:
      "linear-gradient(135deg, #0A1A3C 0%, #1B1244 45%, #3A1E68 100%)",
    text: "#F4F2FF",
    textSubtle: "rgba(244,242,255,0.7)",
    accent: "#D4AF37",
    chip: "linear-gradient(135deg, #E0BC52 0%, #B8862E 100%)",
  },
  {
    key: "aurora",
    label: "Aurora",
    gradient:
      "linear-gradient(135deg, #0B2D2A 0%, #134E7A 50%, #3E2E8C 100%)",
    text: "#EAF6FF",
    textSubtle: "rgba(234,246,255,0.7)",
    accent: "#7BE0FF",
    chip: "linear-gradient(135deg, #CFE7F2 0%, #7BA9C7 100%)",
  },
  {
    key: "sand",
    label: "Sand",
    gradient:
      "linear-gradient(135deg, #E2C079 0%, #C58F3E 55%, #6E4117 100%)",
    text: "#241300",
    textSubtle: "rgba(36,19,0,0.7)",
    accent: "#5B2A06",
    chip: "linear-gradient(135deg, #FFEABF 0%, #C0903A 100%)",
  },
  {
    key: "crimson",
    label: "Crimson",
    gradient:
      "linear-gradient(135deg, #4B0913 0%, #2B0512 45%, #0E0306 100%)",
    text: "#FCE6EA",
    textSubtle: "rgba(252,230,234,0.7)",
    accent: "#FF6079",
    chip: "linear-gradient(135deg, #F3D1A1 0%, #B88340 100%)",
  },
];

export function getCardTheme(key: CardThemeKey | string | null | undefined): CardTheme {
  return CARD_THEMES.find((t) => t.key === key) ?? CARD_THEMES[0];
}
