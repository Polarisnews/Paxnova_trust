import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Paxnova Trust Bank — Banking, refined.",
    template: "%s · Paxnova Trust Bank",
  },
  description:
    "A premium digital-first bank for the wealth of tomorrow. Personal, business, and wealth management products engineered for the next decade.",
  metadataBase: new URL("https://paxnovatrust.com"),
  openGraph: {
    title: "Paxnova Trust Bank",
    description: "Banking, refined.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The middleware generates a per-request CSP nonce and forwards it via
  // x-nonce. Every inline script we render needs that nonce or the strict CSP
  // will block it. Next.js auto-attaches the nonce to its own injected scripts
  // once it sees it on the CSP header.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Anti-FOUC theme script. Runs before React hydrates so the right
            light/dark class is on <html> at first paint. Lives in <head> of
            the server-rendered HTML — not inside a client component — so it
            does not trip React 19's "script tag while rendering" warning. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='dark'||((!t||t==='system')&&p)?'dark':'light';var d=document.documentElement;d.classList.add(r);d.style.colorScheme=r;}catch(e){}})();",
          }}
        />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider>
          <CommandPalette />
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
