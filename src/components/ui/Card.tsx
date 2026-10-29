import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className = "", interactive = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-300/70 bg-white p-5 shadow-md shadow-slate-900/[0.07] ${
        interactive ? "transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.06]" : ""
      } ${className}`}
      {...props}
    />
  );
}
