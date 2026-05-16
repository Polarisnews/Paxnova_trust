"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { logoutAction } from "@/app/actions/auth";
import { useSessionUser } from "@/lib/useSessionUser";
import { ProfileButton } from "@/components/layout/ProfileButton";

export function Header() {
  const pathname = usePathname();
  const isAppRoute =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { user, loaded } = useSessionUser();

  if (isAppRoute) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background,backdrop-filter,border-color] duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Paxnova Trust home"
          className="ring-focus rounded-md"
        >
          <Logo variant="full" size={32} />
        </Link>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-command-palette"));
            }}
          >
            <Search className="size-5" />
          </Button>

          {loaded && user && <ProfileButton user={user} />}

          <ThemeToggle />

          {loaded && user ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/signin"
              className="hidden h-9 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-medium text-white shadow-soft transition hover:bg-violet-600 ring-focus md:inline-flex"
            >
              Sign in
            </Link>
          )}

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
