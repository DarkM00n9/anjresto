import { forwardRef, type ButtonHTMLAttributes } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "neutral" | "danger";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { tone = "neutral", className = "", ...props },
  ref,
) {
  const toneClass =
    tone === "danger"
      ? "text-slate-700 hover:bg-red-50 hover:text-red-600"
      : "text-slate-700 hover:bg-neutral-100 hover:text-slate-800";

  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${toneClass} ${className}`}
      {...props}
    />
  );
});
