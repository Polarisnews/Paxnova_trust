"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useSessionUser } from "@/lib/useSessionUser";

/**
 * Sticky bottom CTA shown on mobile marketing pages.
 *
 * Hidden on:
 *   - Tablet/desktop (md+)
 *   - Dashboard / admin routes (the in-app shell has its own tab bar)
 *   - Auth pages (signin, signup, forgot…) so the CTAs don't compete with the form
 *   - Signed-in users (they're past acquisition)
 */
export function MobileMarketingCTA() {
  const pathname = usePathname();
  const { user, loaded } = useSessionUser();

  const isAppRoute =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");
  const isAuthRoute =
    pathname?.startsWith("/signin") ||
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/forgot") ||
    pathname?.startsWith("/apply");

  if (isAppRoute || isAuthRoute) return null;
  if (loaded && user) return null;

  return (
    <div
      className="mobile-cta-bar pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pt-3 backdrop-blur md:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      aria-label="Open account"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md gap-2.5">
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-account-wizard"))
          }
          className="inline-flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-gold-500 px-4 text-sm font-semibold text-navy-900 shadow-glow-gold transition active:scale-[0.98]"
        >
          Open an account
          <ArrowRight className="size-4" />
        </button>
        <Link
          href="/signin"
          className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold transition active:scale-[0.98]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
