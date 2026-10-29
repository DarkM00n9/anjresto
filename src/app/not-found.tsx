import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restaurant introuvable",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Restaurant introuvable</h1>
      <p className="max-w-md text-stone-700">
        Ce lien ne correspond à aucun restaurant publié. Vérifiez l&apos;adresse ou contactez
        directement l&apos;établissement.
      </p>
    </main>
  );
}
