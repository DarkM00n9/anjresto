import type { Metadata } from "next";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { LoginForm } from "@/components/admin/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await requireCurrentRestaurant();
  return { title: `Connexion — ${restaurant.name}` };
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const restaurant = await requireCurrentRestaurant();
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold text-neutral-900">{restaurant.name}</h1>
        <p className="mt-1 text-center text-sm text-neutral-500">Espace restaurateur</p>

        {error === "acces-refuse" && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
            Ce compte n&apos;est pas rattaché à ce restaurant.
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
