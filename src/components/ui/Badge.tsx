import type { PropsWithChildren } from "react";

interface BadgeProps extends PropsWithChildren {
  tone?: "default" | "primary" | "muted";
}

const TONES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-black/5 text-black/70",
  primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
  muted: "bg-black/5 text-black/40",
};

export function Badge({ tone = "default", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}
