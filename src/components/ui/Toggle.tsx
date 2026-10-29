import { forwardRef, type InputHTMLAttributes } from "react";

interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { label, className = "", ...props },
  ref,
) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-3 ${className}`}>
      {label && <span className="text-sm font-medium text-slate-800">{label}</span>}
      <span className="relative inline-block h-6 w-11 shrink-0">
        <input ref={ref} type="checkbox" className="peer absolute inset-0 z-10 cursor-pointer opacity-0" {...props} />
        <span className="absolute inset-0 rounded-full border border-slate-400/60 bg-slate-300 transition-colors peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/20" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-slate-900/10 transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
});
