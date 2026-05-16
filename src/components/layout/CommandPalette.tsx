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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen as EventListener);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-xl gap-0 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <DialogDescription className="sr-only">
          Search and navigate Paxnova Trust Bank.
        </DialogDescription>
        <Command label="Command palette" className="bg-card">
          <CommandInput
            placeholder="Search Paxnova Trust…"
            className="w-full border-b border-border bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground"
          />
          <CommandList className="max-h-[420px] overflow-auto p-2">
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
                        "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm",
                        "data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
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
          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span>Type to search, ↑↓ to navigate, ↵ to select</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">
              Esc
            </kbd>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
