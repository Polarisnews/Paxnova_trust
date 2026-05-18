import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { MobileMarketingCTA } from "@/components/layout/MobileMarketingCTA";
import { AccountWizard } from "@/components/layout/AccountWizard";
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
  applicationName: "Paxnova Trust",
  appleWebApp: {
    capable: true,
    title: "Paxnova",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Paxnova Trust Bank",
    description: "Banking, refined.",
    type: "website",
  },
};

/**
 * `viewport-fit=cover` plus the `theme-color` values let the page draw under
 * iOS notches and the Android status bar, which is what makes the installed
 * PWA feel like a native app. `themeColor` is duplicated for light/dark so
 * the system chrome matches whichever mode the user is in.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5A2EDC" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1A3C" },
  ],
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
            does not trip React 19's "script tag while rendering" warning.

            suppressHydrationWarning: browsers wipe the `nonce` attribute from
            the DOM after the script executes (per CSP spec), so React 19 sees
            server `nonce="…"` vs client `nonce=""` and would otherwise flag a
            hydration mismatch. The script itself is fine — only the warning is. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('theme');var r=t==='dark'?'dark':'light';var d=document.documentElement;d.classList.add(r);d.style.colorScheme=r;}catch(e){var d=document.documentElement;d.classList.add('light');d.style.colorScheme='light';}})();",
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
            <MobileMarketingCTA />
            <AccountWizard />
          </div>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
