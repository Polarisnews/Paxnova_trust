"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutGrid,
  LogOut,
  PiggyBank,
  Receipt,
  Settings,
  Shield,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { useState } from "react";

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

const secondary: Item[] = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export type DashboardUser = {
  id: number;
  email: string;
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
    <div className="-mt-16 flex min-h-dvh bg-canvas dark:bg-background">
      <aside className="sticky top-0 z-40 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/" aria-label="Nova Trust home">
            <Logo variant="full" size={24} />
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <NavList items={primary} pathname={pathname} />
          <p className="mt-6 mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </p>
          <NavList items={secondary} pathname={pathname} />
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
        <div className="border-t border-border p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/" aria-label="Nova Trust home">
              <Logo variant="mark" size={28} />
            </Link>
          </div>
          <div className="hidden text-sm text-muted-foreground lg:block">
            Welcome back, <span className="text-foreground font-medium">{user.firstName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              aria-label="Notifications"
              className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-violet-500" />
            </Link>
            <ThemeToggle />
            <UserDropdown user={user} />
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>

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

function UserDropdown({ user }: { user: DashboardUser }) {
  const [open, setOpen] = useState(false);
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-2.5 hover:bg-muted ring-focus"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-violet-500 font-display text-xs font-semibold text-white">
          {initials}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30"
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-elev"
          >
            <div className="border-b border-border p-3">
              <p className="text-sm font-semibold">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              {user.role === "admin" && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-300">
                  <Shield className="size-3" />
                  Administrator
                </span>
              )}
            </div>
            <div className="p-1">
              <DropdownItem href="/dashboard/profile" icon={User} label="Profile" />
              <DropdownItem href="/dashboard/settings" icon={Settings} label="Settings" />
              <DropdownItem href="/dashboard/statements" icon={FileText} label="Statements" />
              <DropdownItem href="/dashboard/notifications" icon={Bell} label="Notifications" />
              {user.role === "admin" && (
                <DropdownItem href="/admin" icon={Shield} label="Admin panel" />
              )}
            </div>
            <div className="border-t border-border p-1">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
    >
      <Icon className="size-4 text-muted-foreground" />
      {label}
    </Link>
  );
}

function MobileTabBar({ pathname }: { pathname: string }) {
  const items: Item[] = [
    { href: "/dashboard", label: "Home", icon: LayoutGrid },
    { href: "/dashboard/transfer", label: "Transfer", icon: TrendingUp },
    { href: "/dashboard/cards", label: "Cards", icon: CreditCard },
    { href: "/dashboard/profile", label: "Account", icon: Wallet },
  ];
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-4 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[10px]",
              active ? "text-violet-500" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
