import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className = "", id, children, ...props },
  ref,
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative mt-1">
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          className={`min-h-12 w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-base text-slate-900 shadow-sm shadow-slate-900/[0.02] transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${
            error ? "border-red-400 focus:border-red-500" : "border-slate-400 focus:border-indigo-500"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700" />
      </div>
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});
