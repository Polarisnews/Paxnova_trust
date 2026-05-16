"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  FileText,
  LayoutGrid,
  LogOut,
  PiggyBank,
  Receipt,
  Search,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ProfileButton } from "@/components/layout/ProfileButton";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const primary: Item[] = [
  { href: "/dashboard", label: "Accounts", icon: LayoutGrid },
  { href: "/dashboard/transfer", label: "Transfer", icon: TrendingUp },
  { href: "/dashboard/pay-bills", label: "Pay bills", icon: Receipt },
  { href: "/dashboard/cards", label: "Cards", icon: CreditCard },
  { href: "/dashboard/investments", label: "Investments", icon: PiggyBank },
  { href: "/dashboard/statements", label: "Statements", icon: FileText },
];

export type DashboardUser = {
  id: number;
  email: string;
  username?: string | null;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
};

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-canvas dark:bg-background">
      <aside className="sticky top-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/" aria-label="Paxnova Trust home">
            <Logo variant="full" size={27} />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <NavList items={primary} pathname={pathname} />
          {user.role === "admin" && (
            <>
              <p className="mt-6 mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
              <NavList
                items={[
                  { href: "/admin", label: "Admin panel", icon: Shield },
                ]}
                pathname={pathname}
              />
            </>
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/" aria-label="Paxnova Trust home">
              <Logo variant="mark" size={30} />
            </Link>
          </div>
          <div className="hidden min-w-0 text-sm text-muted-foreground lg:block">
            Welcome back,{" "}
            <span className="font-medium text-foreground">{user.firstName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Search"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <Search className="size-4" />
            </button>
            <ProfileButton
              user={{
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
              }}
            />
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm font-medium hover:bg-muted"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] sm:px-6 sm:py-8 lg:px-8 lg:pb-8">
          {children}
        </main>

        <MobileTabBar pathname={pathname} />
      </div>
    </div>
  );
}

function NavList({ items, pathname }: { items: Item[]; pathname: string }) {
  return (
    <ul className="space-y-0.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "inline-flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-violet-500/10 text-violet-600 dark:text-violet-300 font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
}

function MobileTabBar({ pathname }: { pathname: string }) {
  const items: Item[] = [
    { href: "/dashboard", label: "Home", icon: LayoutGrid },
    { href: "/dashboard/transfer", label: "Transfer", icon: TrendingUp },
    { href: "/dashboard/cards", label: "Cards", icon: CreditCard },
    { href: "/dashboard/statements", label: "Activity", icon: FileText },
    { href: "/dashboard/profile", label: "Account", icon: Wallet },
  ];
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Primary"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-medium transition active:scale-95",
              active
                ? "text-violet-500"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute top-0 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-b-full bg-violet-500"
              />
            )}
            <Icon className="size-5" />
            <span className="leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
