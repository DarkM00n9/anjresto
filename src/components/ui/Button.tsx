import type { AnchorHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "outline-white";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform active:scale-95";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-primary)] text-white hover:brightness-110",
  outline:
    "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
  "outline-white": "border-2 border-white text-white hover:bg-white/10",
};

export function ButtonLink({ variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return <a className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}
