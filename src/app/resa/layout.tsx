import type { Metadata } from "next";

// Zone privée : ne jamais indexer.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
