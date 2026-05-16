"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  FileText,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export type ProfileUser = {
  id: number;
  username?: string | null;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
};

export function ProfileButton({ user }: { user: ProfileUser }) {
  const [open, setOpen] = useState(false);
  const initials =
    `${(user.firstName ?? "?")[0] ?? "?"}${(user.lastName ?? "?")[0] ?? ""}`.toUpperCase();

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
            className="fixed inset-0 z-30 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-elev"
          >
            <div className="border-b border-border p-3">
              <p className="text-sm font-semibold">
                {user.firstName} {user.lastName}
              </p>
              {user.username && (
                <p className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </p>
              )}
              {user.role === "admin" && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-gold-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-700 dark:text-gold-300">
                  <Shield className="size-3" />
                  Administrator
                </span>
              )}
            </div>
            <div className="p-1">
              <DropdownItem
                href="/dashboard/profile"
                icon={User}
                label="Profile"
                onPick={() => setOpen(false)}
              />
              <DropdownItem
                href="/dashboard/notifications"
                icon={Bell}
                label="Notifications"
                onPick={() => setOpen(false)}
              />
              <DropdownItem
                href="/dashboard/settings"
                icon={Settings}
                label="Settings"
                onPick={() => setOpen(false)}
              />
              <DropdownItem
                href="/dashboard/statements"
                icon={FileText}
                label="Statements"
                onPick={() => setOpen(false)}
              />
              {user.role === "admin" && (
                <DropdownItem
                  href="/admin"
                  icon={Shield}
                  label="Admin panel"
                  onPick={() => setOpen(false)}
                />
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
  onPick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onPick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onPick}
      className="inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
    >
      <Icon className="size-4 text-muted-foreground" />
      {label}
    </Link>
  );
}
