"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { primaryNav } from "@/lib/site";
import { Logo } from "@/components/brand/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileMenu } from "@/components/layout/MobileMenu";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          aria-label="Nova Trust home"
          className="ring-focus rounded-md"
        >
          <Logo variant="full" size={28} />
        </Link>

        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {primaryNav.map((section) => (
              <NavigationMenuItem key={section.label}>
                <NavigationMenuTrigger className="bg-transparent">
                  {section.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[640px] grid-cols-2 gap-6 p-6">
                    {section.groups.map((group) => (
                      <div key={group.heading}>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.heading}
                        </p>
                        <ul className="space-y-1.5">
                          {group.items.map((item) => (
                            <li key={item.title}>
                              <Link
                                href={item.href}
                                className="block rounded-lg p-3 transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                              >
                                <div className="font-medium">{item.title}</div>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-1.5">
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden md:inline-flex"
            )}
          >
            <MapPin className="size-4" />
            Find a branch
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="hidden md:inline-flex"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-command-palette"));
            }}
          >
            <Search className="size-5" />
          </Button>

          <ThemeToggle className="hidden md:inline-flex" />

          <Link
            href="/signin"
            className="hidden h-9 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-medium text-white shadow-soft transition hover:bg-violet-600 ring-focus md:inline-flex"
          >
            Sign in
          </Link>

          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
