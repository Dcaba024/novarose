import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-[rgba(94,241,197,0.42)] bg-[var(--aqua)] text-[var(--ink)] shadow-[0_18px_55px_rgba(32,201,151,0.2)] hover:bg-[#8df7d7]",
  secondary: "border border-white/14 bg-white/[0.055] text-[var(--foreground)] hover:bg-white/[0.09]",
  ghost: "border border-transparent bg-transparent text-[var(--muted-strong)] hover:bg-white/[0.06]"
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base"
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--aqua)] disabled:pointer-events-none disabled:opacity-50";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({ children, className, size = "md", variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function ButtonLink({ children, className, size = "md", variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <a className={cn(baseClasses, variants[variant], sizes[size], className)} {...props}>
      {children}
    </a>
  );
}
