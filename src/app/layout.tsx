import type { Metadata } from "next";
import { getLang } from "@/lib/lang";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANJ Agency",
  description: "Sites de restaurants propulsés par ANJ Agency.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
