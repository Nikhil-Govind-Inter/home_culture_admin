import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StickyFormActionsProps {
  children: ReactNode;
  className?: string;
}

// Action row (Cancel / Save) pinned to the bottom of the viewport.
// Negative margins cancel the `p-6` of DashboardLayout's <main> so the bar spans the full width.
export function StickyFormActions({ children, className }: StickyFormActionsProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-40 -mx-6 -mb-6 flex justify-end gap-4 border-t bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      {children}
    </div>
  );
}
