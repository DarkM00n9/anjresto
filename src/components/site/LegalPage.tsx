import type { ReactNode } from "react";

/** Gabarit éditorial des pages légales et de service (fond crème, titre serif, texte lisible). */
export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="maison-home">
      <div className="maison-shell max-w-3xl py-14 sm:py-20">
        <p className="maison-eyebrow text-[var(--color-primary)]">
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 className="maison-title mt-5 text-[clamp(2.25rem,8vw,3.75rem)] leading-[1.05]">{title}</h1>
        <div className="mt-8 space-y-5 border-t border-stone-300/70 pt-8 text-[15px] leading-7 text-stone-700">{children}</div>
      </div>
    </div>
  );
}
