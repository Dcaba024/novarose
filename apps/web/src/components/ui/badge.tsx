import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-3.5 py-1.5 text-sm text-[var(--muted-strong)]",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--aqua)]" />
      {children}
    </span>
  );
}
