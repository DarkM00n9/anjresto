import { respondToReservationByToken } from "@/app/actions/public-reservations";

export default async function RestaurantActionPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { token } = await params;
  const { action } = await searchParams;

  if (action !== "accept" && action !== "refuse") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <p className="text-neutral-600">Lien invalide.</p>
      </main>
    );
  }

  const result = await respondToReservationByToken(token, action);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center">
        {!result.success ? (
          <p className="text-neutral-600">Réservation introuvable.</p>
        ) : result.alreadyDone ? (
          <p className="text-neutral-600">Cette réservation a déjà été traitée (statut : {result.status}).</p>
        ) : (
          <p className="text-lg font-semibold text-neutral-900">
            Réservation {result.status === "confirmed" ? "acceptée" : "refusée"} ✓
            <br />
            <span className="text-sm font-normal text-slate-600">Le client a été prévenu par email.</span>
          </p>
        )}
      </div>
    </main>
  );
}
