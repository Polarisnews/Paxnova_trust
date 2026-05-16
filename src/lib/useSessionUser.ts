"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type ClientUser = {
  id: number;
  username: string | null;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
};

// Re-fetches /api/me on every route change. The Header component lives in
// the root layout and stays mounted across navigation, so a mount-once
// fetch leaves stale user state visible — most visibly after sign-out,
// where the user lands on `/` but the top bar still shows the signed-in
// profile + Sign-out button because the hook never re-checked.
export function useSessionUser() {
  const pathname = usePathname();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return { user, loaded };
}
