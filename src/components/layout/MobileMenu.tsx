"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { primaryNav } from "@/lib/site";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="lg:hidden"
          >
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="flex items-center justify-between">
            <Logo variant="full" size={24} />
            <ThemeToggle />
          </SheetTitle>
        </SheetHeader>

        <AnimatePresence>
          {open && (
            <nav className="flex flex-col px-6 py-6">
              {primaryNav.map((section, idx) => (
                <motion.div
                  key={section.label}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: idx * 0.04,
                    duration: 0.32,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    href={section.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-2xl font-display font-semibold tracking-tight"
                  >
                    {section.label}
                  </Link>
                  <div className="space-y-1 pb-4 pl-1">
                    {section.groups
                      .flatMap((g) => g.items)
                      .slice(0, 3)
                      .map((item) => (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {item.title}
                        </Link>
                      ))}
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.32 }}
                className="mt-6 flex flex-col gap-3"
              >
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-violet-500 px-5 text-sm font-semibold text-white shadow-soft hover:bg-violet-600 ring-focus"
                >
                  Sign in
                </Link>
                <Link
                  href="/personal"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted ring-focus"
                >
                  Open an account
                </Link>
              </motion.div>
            </nav>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
