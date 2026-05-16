"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSessionUser } from "@/lib/useSessionUser";
import { logoutAction } from "@/app/actions/auth";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { user, loaded } = useSessionUser();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="md:hidden"
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center justify-between">
            <Logo variant="full" size={27} />
            <ThemeToggle />
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-6 py-6">
          {loaded && user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
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
            </>
          ) : (
            <>
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
              >
                Open an account
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
