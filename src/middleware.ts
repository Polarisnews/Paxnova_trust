import { NextRequest, NextResponse } from "next/server";

const isProd = process.env.NODE_ENV === "production";

/**
 * Per-request security middleware. Generates a fresh CSP nonce on every
 * HTML navigation and attaches a strict Content-Security-Policy that uses
 * 'strict-dynamic' to lock down all script execution to that nonce.
 *
 * Notes:
 *   - 'unsafe-inline' is allowed for STYLES only (Tailwind + library inline
 *     styles need it). Modern browsers ignore 'unsafe-inline' on scripts
 *     when a nonce + strict-dynamic is present, so this remains safe.
 *   - In dev we relax script-src (Turbopack injects un-nonced inline
 *     scripts for HMR / fast refresh). Production uses the strict policy.
 *   - frame-ancestors 'none' is the modern equivalent of X-Frame-Options
 *     and is the active clickjacking guard.
 */
export function middleware(request: NextRequest) {
  const nonce = generateNonce();

  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' https://maps.googleapis.com https://maps.gstatic.com`
    : `'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://maps.gstatic.com`;

  const connectSrc = [
    "'self'",
    "https://open.er-api.com",
    "https://api.resend.com",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
    // Dev-only websocket for HMR
    ...(isProd ? [] : ["ws:", "wss:"]),
  ].join(" ");

  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https://*.tile.openstreetmap.org",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://*.googleusercontent.com",
  ].join(" ");

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `script-src-elem ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src ${imgSrc}`,
    `font-src 'self' data: https://fonts.gstatic.com`,
    `connect-src ${connectSrc}`,
    `media-src 'self'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `frame-src 'self' https://maps.googleapis.com`,
    ...(isProd ? [`upgrade-insecure-requests`] : []),
  ]
    .join("; ")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Forward the nonce to the app so root layout can attach it to its inline script.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

/** Base64-url nonce, 128 bits of entropy. */
function generateNonce(): string {
  const buf = new Uint8Array(16);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export const config = {
  // Only apply to HTML navigations — skip _next/static, _next/image, favicon, and any /api/* route.
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
