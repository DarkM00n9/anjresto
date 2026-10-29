import type { PropsWithChildren, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AdminPageProps extends PropsWithChildren {
  width?: "wide" | "narrow";
  className?: string;
}

export function AdminPage({ children, width = "wide", className = "" }: AdminPageProps) {
  const widthClass = width === "narrow" ? "max-w-3xl" : "max-w-6xl";
  return (
    <div className={`mx-auto w-full ${widthClass} px-4 py-7 sm:px-6 lg:px-8 lg:py-10 ${className}`}>
      {children}
    </div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  backHref?: string;
  backLabel?: string;
  action?: ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  eyebrow = "Espace restaurateur",
  backHref,
  backLabel = "Retour",
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function AdminPanel({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-2xl border border-slate-300 bg-white p-5 shadow-sm shadow-slate-900/[0.025] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}
