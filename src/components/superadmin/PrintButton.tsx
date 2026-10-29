"use client";

import type { ReactNode } from "react";

export function PrintButton({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-400 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50">
      {icon} {label}
    </button>
  );
}
