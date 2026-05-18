"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LogOut, Menu, User, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { MobileDrawer } from "@/components/ui/mobile-drawer";
import { useSessionUser } from "@/lib/useSessionUser";
import { logoutAction } from "@/app/actions/auth";
import { primaryNav } from "@/lib/site";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { user, loaded } = useSessionUser();

  const close = () => {
    setOpen(false);
    setOpenSection(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95 md:hidden"
      >
        <Menu className="size-6" />
      </button>

      <MobileDrawer
        open={open}
        onClose={close}
        side="right"
        labelledBy="mobile-menu-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div
            id="mobile-menu-title"
            className="flex items-center gap-3"
          >
            <Logo variant="full" size={27} />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Sections */}
        <nav
          aria-label="Site sections"
          className="flex-1 overflow-y-auto px-2 py-3"
        >
          <ul className="space-y-0.5">
            {primaryNav.map((section) => {
              const expanded = openSection === section.label;
              return (
                <li key={section.label}>
                  <div className="flex items-stretch">
                    <Link
                      href={section.href}
                      onClick={close}
                      className="flex flex-1 items-center rounded-l-lg px-4 py-3 text-base font-semibold hover:bg-muted"
                    >
                      {section.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSection(expanded ? null : section.label)
                      }
                      aria-label={`${expanded ? "Hide" : "Show"} ${section.label} products`}
                      aria-expanded={expanded}
                      className="inline-flex w-12 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-muted"
                    >
                      <ChevronDown
                        className={
                          "size-5 transition-transform " +
                          (expanded ? "rotate-180" : "")
                        }
                      />
                    </button>
                  </div>
                  {expanded && (
                    <div className="px-4 pb-3 pt-1">
                      {section.groups.map((group) => (
                        <div key={group.heading} className="mt-2 first:mt-0">
                          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.heading}
                          </p>
                          <ul className="mt-1 space-y-0.5">
                            {group.items.map((item) => (
                              <li key={item.title}>
                                <Link
                                  href={item.href}
                                  onClick={close}
                                  className="block rounded-md px-2 py-2 hover:bg-muted"
                                >
                                  <p className="text-sm font-medium">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sticky bottom action area */}
        <div
          className="border-t border-border bg-background px-6 pt-4"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)",
          }}
        >
          {loaded && user ? (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/dashboard"
                onClick={close}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600"
              >
                <User className="size-4" />
                Go to dashboard
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link
                href="/signup"
                onClick={close}
                className="inline-flex h-11 items-center justify-center rounded-full bg-gold-500 px-5 text-sm font-semibold text-navy-900 shadow-glow-gold hover:bg-gold-300"
              >
                Open an account
              </Link>
              <Link
                href="/signin"
                onClick={close}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </MobileDrawer>
    </>
  );
}
