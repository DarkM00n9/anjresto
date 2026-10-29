import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary" // couleur de marque du restaurant (site public)
  | "accent" // indigo — identité du produit ANJ Agency (admin/superadmin)
  | "secondary"
  | "outline"
  | "outline-accent"
  | "outline-white"
  | "ghost"
  | "danger"
  | "success";

export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const SIZES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[var(--color-primary)] text-white shadow-sm hover:brightness-110",
  accent: "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700",
  secondary: "bg-neutral-100 text-slate-800 hover:bg-neutral-200",
  outline:
    "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
  "outline-accent": "border border-indigo-200 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50",
  "outline-white": "border border-white/80 text-white hover:bg-white/10",
  ghost: "text-neutral-600 hover:bg-neutral-100",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  success: "bg-green-600 text-white shadow-sm hover:bg-green-700",
};

interface SharedProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  className?: string;
}

function classes(variant: ButtonVariant, size: ButtonSize, className: string) {
  return `${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`;
}

interface ButtonProps extends SharedProps, ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function Button({
  variant = "accent",
  size = "md",
  icon,
  loading,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button className={classes(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

interface ButtonLinkProps extends SharedProps, AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={classes(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}
