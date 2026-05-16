"use client";

// Lightweight in-house theme provider that replaces `next-themes`. We rolled
// our own because next-themes injects an inline <script> through a client
// component, and React 19 / Turbopack now warn loudly:
//   "Encountered a script tag while rendering React component."
// The anti-FOUC script lives in the server-rendered <head> of the root
// layout instead (see `src/app/layout.tsx`), so no React warning fires.
//
// API surface matches what the rest of the codebase already imports from
// next-themes: `useTheme()` returns `{ theme, resolvedTheme, setTheme }`.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type Ctx = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
};

const STORAGE_KEY = "theme";

const ThemeContext = createContext<Ctx | null>(null);

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // private mode etc.
  }
  return "system";
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyClass(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSR returns "system" / "light" — the real value lands after mount.
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
  }, []);

  // Whenever the picked theme changes, recompute resolved + persist + apply.
  useEffect(() => {
    const r: ResolvedTheme =
      theme === "dark" || (theme === "system" && systemPrefersDark())
        ? "dark"
        : "light";
    setResolved(r);
    applyClass(r);
    try {
      if (theme === "system") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, theme);
      }
    } catch {
      // ignore
    }
  }, [theme]);

  // Track OS-level theme changes while in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      const r: ResolvedTheme = e.matches ? "dark" : "light";
      setResolved(r);
      applyClass(r);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme: resolved, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Ctx {
  return (
    useContext(ThemeContext) ?? {
      theme: "system",
      resolvedTheme: "light",
      setTheme: () => {},
    }
  );
}
