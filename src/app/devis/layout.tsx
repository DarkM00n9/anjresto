import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devis",
  robots: { index: false, follow: false },
};

export default function QuotePublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">{children}</div>;
}
