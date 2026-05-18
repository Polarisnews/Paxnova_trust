"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * A plain-React mobile drawer. No portal, no third-party primitives, no
 * `render` prop indirection — just state-controlled CSS transforms. This
 * is the workaround for cases where the base-ui Sheet's `SheetTrigger
 * render={...}` pattern fails to attach onClick on mobile (which we hit
 * repeatedly on iOS Safari).
 *
 * Pass `open` + `onClose` from the parent. Anything inside `children`
 * stays inside the drawer; you control header and content yourself.
 */
export function MobileDrawer({
  open,
  onClose,
  side = "right",
  className,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left";
  className?: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  // Lock body scroll while the drawer is open so the page underneath
  // doesn't shift / scroll when the user drags inside the drawer.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop — always rendered, opacity-controlled, no `display: none`
          so the drawer's transition can run smoothly on first open. */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "fixed inset-y-0 z-[70] flex w-[88vw] max-w-md flex-col bg-card text-foreground shadow-elev transition-transform duration-200 ease-out",
          side === "right" ? "right-0 border-l border-border" : "left-0 border-r border-border",
          side === "right" && (open ? "translate-x-0" : "translate-x-full"),
          side === "left" && (open ? "translate-x-0" : "-translate-x-full"),
          // The drawer must NOT swallow taps when invisible; pointer-events
          // off while closed lets the page underneath remain interactive.
          open ? "pointer-events-auto" : "pointer-events-none",
          className,
        )}
        // Stop clicks bubbling to the backdrop so tapping inside the drawer
        // doesn't close it. We still allow clicks to children normally.
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
}
