import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className = "", id, rows = 3, ...props },
  ref,
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={`mt-1.5 w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 shadow-sm shadow-slate-900/[0.02] transition-colors placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-400 focus:border-indigo-500"
        } ${className}`}
        {...props}
      />
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs text-slate-700">{hint}</p>}
    </div>
  );
});
