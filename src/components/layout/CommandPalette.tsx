"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calculator,
  CreditCard,
  HelpCircle,
  Home,
  LayoutDashboard,
  Lock,
  Mail,
  PiggyBank,
  Sparkles,
  User,
} from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type CmdItem = {
  label: string;
  hint?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: { heading: string; entries: CmdItem[] }[] = [
  {
    heading: "Pages",
    entries: [
      { label: "Home", href: "/", icon: Home },
      { label: "Personal banking", href: "/personal", icon: User },
      { label: "Business banking", href: "/business", icon: Building2 },
      { label: "About", href: "/about", icon: Sparkles },
      { label: "Contact", href: "/contact", icon: Mail },
      { label: "Sign in", href: "/signin", icon: Lock },
      { label: "Dashboard (demo)", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    heading: "Products",
    entries: [
      { label: "Checking", href: "/personal#checking", icon: CreditCard },
      { label: "Savings (4.85% APY)", href: "/personal#savings", icon: PiggyBank },
      { label: "Credit cards", href: "/personal#cards", icon: CreditCard },
      { label: "Mortgages", href: "/personal#mortgages", icon: Home },
      { label: "Savings calculator", href: "/#calculator", icon: Calculator },
    ],
  },
  {
    heading: "Help",
    entries: [
      { label: "Frequently asked questions", href: "/contact#faq", icon: HelpCircle },
      { label: "Security tips", href: "/signin", icon: Lock },
    ],
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (open && e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen as EventListener);
    };
  }, [open]);

  // Lock body scroll while open — matches the MobileDrawer behavior.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  // Plain-React modal — no base-ui Dialog. Always rendered; opacity +
  // pointer-events control visibility so opens stay smooth on mobile.
  return (
    <>
      <button
        aria-hidden
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-[80] cursor-default bg-black/35 backdrop-blur-sm transition-opacity duration-150",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cn(
          "fixed left-1/2 top-[14vh] z-[90] w-[min(640px,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-elev transition-all duration-150",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close search"
          className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground sm:hidden"
        >
          <X className="size-4" />
        </button>
        <Command label="Command palette" className="bg-card">
          <CommandInput
            autoFocus={open}
            placeholder="Search Paxnova Trust…"
            className="w-full border-b border-border bg-transparent px-4 py-3 pr-10 text-base outline-none placeholder:text-muted-foreground"
          />
          <CommandList className="max-h-[60dvh] overflow-auto p-2 sm:max-h-[420px]">
            <CommandEmpty className="p-6 text-center text-sm text-muted-foreground">
              No results found.
            </CommandEmpty>
            {items.map((group) => (
              <CommandGroup
                key={group.heading}
                heading={group.heading}
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
              >
                {group.entries.map((entry) => {
                  const Icon = entry.icon;
                  return (
                    <CommandItem
                      key={entry.href + entry.label}
                      value={`${group.heading} ${entry.label}`}
                      onSelect={() => go(entry.href)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2.5 text-sm",
                        "data-[selected=true]:bg-muted data-[selected=true]:text-foreground",
                      )}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span className="text-foreground">{entry.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
          <div className="hidden items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground sm:flex">
            <span>Type to search, ↑↓ to navigate, ↵ to select</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              Esc
            </kbd>
          </div>
        </Command>
      </div>
    </>
  );
}
