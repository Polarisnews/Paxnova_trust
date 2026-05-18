"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/**
 * Theme toggle. Plain HTML <button> (not the base-ui Button primitive) so
 * its onClick is the canonical native click — no chance of a primitive
 * swallowing the event on touch.
 *
 * The Sun/Moon icons are both rendered absolutely inside the button so they
 * can crossfade. The button itself is `relative` so the absolute icons
 * position relative to it rather than the body.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Pre-mount we render the light icon to match the SSR default and avoid a
  // hydration mismatch flash.
  const current = mounted ? (resolvedTheme ?? theme) : "light";
  const isDark = current === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted active:scale-95 md:size-9",
        className,
      )}
      suppressHydrationWarning
    >
      <Sun
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-300 ease-out",
          isDark
            ? "scale-0 -rotate-90 opacity-0"
            : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        aria-hidden
        className={cn(
          "absolute size-5 transition-all duration-300 ease-out",
          isDark
            ? "scale-100 rotate-0 opacity-100"
            : "scale-0 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
