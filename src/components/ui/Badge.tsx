import type { PropsWithChildren } from "react";

interface BadgeProps extends PropsWithChildren {
  tone?: "default" | "primary" | "muted" | "success" | "danger" | "warning" | "info";
  className?: string;
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-black/5 text-stone-700",
  primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  muted: "bg-black/5 text-stone-600",
  success: "bg-green-100 text-green-700",
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  info: "bg-indigo-100 text-indigo-700",
};

export function Badge({ tone = "default", className = "", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
