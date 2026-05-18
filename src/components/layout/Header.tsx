"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Anchor,
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  Briefcase,
  Building,
  Building2,
  Calculator,
  Car,
  Coins,
  CreditCard,
  Crown,
  Euro,
  FileCheck,
  Globe2,
  HandCoins,
  Heart,
  HeartPulse,
  Home,
  Inbox,
  Landmark,
  Layers,
  Leaf,
  LineChart,
  LogOut,
  Mailbox,
  MapPin,
  MessageSquare,
  Network,
  Newspaper,
  PiggyBank,
  Plane,
  Receipt,
  ScrollText,
  Search,
  Send,
  Shield,
  Sparkles,
  Store,
  Sun,
  TerminalSquare,
  TrendingUp,
  Truck,
  Users,
  Vault,
  Wallet,
  Wrench,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { logoutAction } from "@/app/actions/auth";
import { useSessionUser } from "@/lib/useSessionUser";
import { ProfileButton } from "@/components/layout/ProfileButton";
import { primaryNav } from "@/lib/site";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

// Map of lucide icon names referenced from `site.ts → primaryNav` to the
// actual React component. Keeping this in the Header (the only consumer)
// avoids dragging icon imports into the data layer.
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Anchor,
  ArrowLeftRight,
  Banknote,
  Briefcase,
  Building,
  Building2,
  Calculator,
  Car,
  Coins,
  CreditCard,
  Crown,
  Euro,
  FileCheck,
  Globe2,
  HandCoins,
  Heart,
  HeartPulse,
  Home,
  Inbox,
  Landmark,
  Layers,
  Leaf,
  LineChart,
  Mailbox,
  MapPin,
  MessageSquare,
  Network,
  Newspaper,
  PiggyBank,
  Plane,
  Receipt,
  ScrollText,
  Send,
  Shield,
  Sparkles,
  Store,
  Sun,
  TerminalSquare,
  TrendingUp,
  Truck,
  Users,
  Vault,
  Wallet,
  Wrench,
};

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
        // Transitioning `backdrop-filter` suspends touch events on iOS Safari
        // for the duration of the transition. Only transition the cheap props
        // so the header's icon buttons remain tappable while it morphs on
        // scroll.
        "sticky top-0 z-50 w-full transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
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

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList className="gap-0.5">
            {primaryNav.map((section) => (
              <NavigationMenuItem key={section.label}>
                <NavigationMenuTrigger
                  className={cn(
                    "pn-nav-trigger relative bg-transparent text-sm font-medium",
                    "hover:bg-transparent focus:bg-transparent",
                    "data-popup-open:bg-transparent data-popup-open:hover:bg-transparent",
                  )}
                >
                  {section.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[min(960px,90vw)] p-6">
                    {/* Tagline strip — gives each section a distinct voice */}
                    {section.tagline && (
                      <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                        <span
                          aria-hidden
                          className="block size-1.5 rounded-full bg-gradient-to-r from-violet-500 to-gold-500"
                        />
                        <p className="text-sm font-medium text-foreground/85">
                          {section.tagline}
                        </p>
                        <Link
                          href={section.href}
                          className="group/all ml-auto inline-flex items-center gap-1 text-xs font-semibold text-violet-600 transition hover:text-violet-700 dark:text-violet-300 dark:hover:text-violet-200"
                        >
                          See all {section.label.toLowerCase()}
                          <ArrowRight className="size-3.5 transition-transform group-hover/all:translate-x-0.5" />
                        </Link>
                      </div>
                    )}

                    {/* Groups grid — adapts 2 → 3 → 4 cols by viewport */}
                    <div
                      className={cn(
                        "grid gap-x-5 gap-y-6",
                        section.groups.length >= 4
                          ? "sm:grid-cols-2 lg:grid-cols-4"
                          : section.groups.length === 3
                            ? "sm:grid-cols-2 lg:grid-cols-3"
                            : "sm:grid-cols-2",
                      )}
                    >
                      {section.groups.map((group) => (
                        <div key={group.heading}>
                          <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">
                            {group.heading}
                          </p>
                          <ul className="space-y-0.5">
                            {group.items.map((item) => {
                              const Icon: React.ComponentType<{
                                className?: string;
                              }> =
                                (item.icon ? ICONS[item.icon] : undefined) ??
                                ArrowRight;
                              return (
                                <li key={item.title}>
                                  <Link
                                    href={item.href}
                                    className={cn(
                                      "group/item relative flex items-start gap-3 rounded-xl p-2.5 transition-all",
                                      "hover:bg-violet-500/8 hover:-translate-y-px",
                                      item.feature &&
                                        "bg-gradient-to-br from-violet-500/12 via-violet-500/4 to-transparent ring-1 ring-violet-500/15",
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                                        item.feature
                                          ? "bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-[0_4px_14px_-2px_rgba(110,63,243,0.45)]"
                                          : "bg-muted text-foreground/70 group-hover/item:bg-violet-500 group-hover/item:text-white group-hover/item:shadow-[0_4px_12px_-2px_rgba(110,63,243,0.3)]",
                                      )}
                                    >
                                      <Icon className="size-4" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold leading-tight text-foreground">
                                        {item.title}
                                      </p>
                                      <p className="mt-1 line-clamp-2 text-xs leading-snug text-muted-foreground">
                                        {item.description}
                                      </p>
                                    </div>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-command-palette"));
            }}
            className="inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95 md:size-9"
          >
            <Search className="size-5" />
          </button>

          {loaded && user && <ProfileButton user={user} />}

          <ThemeToggle />

          {loaded && user ? (
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="inline-flex size-11 items-center justify-center gap-1.5 rounded-full text-foreground transition-colors hover:bg-muted md:size-auto md:h-9 md:rounded-full md:border md:border-border md:bg-background md:px-4 md:text-sm md:font-medium"
              >
                <LogOut className="size-5 md:size-4" />
                <span className="hidden md:inline">Sign out</span>
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
