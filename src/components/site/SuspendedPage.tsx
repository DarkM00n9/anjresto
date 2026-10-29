/** Page neutre affichée quand un restaurant est suspendu — volontairement sans branding. */
export function SuspendedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-xl font-semibold text-neutral-800">Site momentanément indisponible</h1>
      <p className="max-w-sm text-sm text-slate-600">
        Merci de votre visite. Ce site sera de nouveau en ligne prochainement.
      </p>
    </main>
  );
}
