"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CreditCard,
  FileCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Send,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/accounts", label: "Accounts", icon: Wallet },
  { href: "/admin/applications", label: "Applications", icon: FileCheck },
  { href: "/admin/cards/applications", label: "Card applications", icon: CreditCard },
  { href: "/admin/wires", label: "Wires", icon: Send },
  { href: "/admin/cards", label: "Cards", icon: CreditCard },
];

export function AdminShell({
  user,
  children,
}: {
  user: { firstName: string; lastName: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-close the mobile drawer on route change.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const navList = (
    <ul className="space-y-0.5">
      {nav.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "inline-flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-white/10 font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const footerBlock = (
    <>
      <div className="mt-6 border-t border-white/10 pt-4">
        <Link
          href="/dashboard"
          className="inline-flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
        >
          ← Back to user dashboard
        </Link>
      </div>
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="px-3 text-xs">
          <span className="block font-semibold text-white">
            {user.firstName} {user.lastName}
          </span>
          <span className="block text-white/60 truncate">{user.email}</span>
        </p>
        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-canvas dark:bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-navy-900 text-white lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo variant="mono-light" size={25} />
        </div>
        <div className="mx-3 mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-300">
          <ShieldAlert className="size-3" />
          Administrator
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">{navList}</nav>
        <div className="border-t border-white/10 p-3">
          <p className="px-3 text-xs">
            <span className="block font-semibold text-white">
              {user.firstName} {user.lastName}
            </span>
            <span className="block text-white/60 truncate">{user.email}</span>
          </p>
          <form action={logoutAction} className="mt-2">
            <button
              type="submit"
              className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          {/* Mobile: hamburger drawer trigger */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  aria-label="Open admin menu"
                  className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted lg:hidden"
                >
                  <Menu className="size-5" />
                </button>
              }
            />
            <SheetContent
              side="left"
              className="w-full max-w-xs bg-navy-900 p-0 text-white"
            >
              <SheetHeader className="border-b border-white/10 px-5 py-4">
                <SheetTitle className="flex items-center justify-between text-white">
                  <Logo variant="mono-light" size={25} />
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-300">
                    <ShieldAlert className="size-3" />
                    Admin
                  </span>
                </SheetTitle>
              </SheetHeader>
              <nav className="px-3 py-4">
                {navList}
                {footerBlock}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 lg:hidden">
            <Logo variant="mark" size={29} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </span>
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            Admin Dashboard
          </p>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <form action={logoutAction} className="lg:hidden">
              <button
                type="submit"
                aria-label="Sign out"
                className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted"
              >
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
