import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paxnova Trust Bank",
    short_name: "Paxnova",
    description:
      "A premium digital-first bank. Personal, business, and wealth management — banking, refined.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A1A3C",
    theme_color: "#5A2EDC",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon1",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Transfer money",
        short_name: "Transfer",
        description: "Send money or wire funds",
        url: "/dashboard/transfer",
      },
      {
        name: "Cards",
        short_name: "Cards",
        description: "View and manage your cards",
        url: "/dashboard/cards",
      },
      {
        name: "Statements",
        short_name: "Statements",
        description: "Download monthly statements",
        url: "/dashboard/statements",
      },
    ],
  };
}
