import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Static security headers. CSP itself is set per-request in middleware.ts
 * (it carries a per-request nonce). Everything else is safe to put here.
 */
const staticSecurityHeaders = [
  // HTTPS for 2 years, all subdomains, eligible for HSTS preload list.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disallow MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy clickjacking guard (CSP frame-ancestors is the modern equivalent and is set in middleware).
  { key: "X-Frame-Options", value: "DENY" },
  // Trim referer leakage.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop the powered-by hint that older Next versions used to leak.
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Block legacy XSS auditor mis-fires (still useful on old browsers).
  { key: "X-XSS-Protection", value: "0" },
  // Lock down powerful features that this app does not use.
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "autoplay=()",
      "browsing-topics=()",
      "camera=()",
      "clipboard-write=(self)",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=()",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "sync-xhr=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", "),
  },
  // Cross-origin isolation. same-origin-allow-popups lets external auth/payment popups still work.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

const nextConfig: NextConfig = {
  // Stop announcing the framework in HTTP responses.
  poweredByHeader: false,

  // Disable production source maps so client JS cannot be trivially reverse-engineered.
  productionBrowserSourceMaps: false,

  // Strip console.{log,info,debug,trace} from production bundles; keep error/warn for ops.
  compiler: isProd
    ? { removeConsole: { exclude: ["error", "warn"] } }
    : undefined,

  // React strict mode catches latent bugs early.
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
      // Only accept Server Action calls whose Origin matches the deploy domain in production.
      allowedOrigins: isProd
        ? ["paxnovatrust.com", "www.paxnovatrust.com"]
        : undefined,
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: staticSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;
