import type { Metadata } from "next";
import Image from "next/image";
import { requireCurrentRestaurant } from "@/lib/get-current-restaurant";
import { LoginForm } from "@/components/admin/LoginForm";
import { Card } from "@/components/ui/Card";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-200 px-4">
      <div className="w-full max-w-sm">
        {restaurant.logo_url ? (
          <Image
            src={restaurant.logo_url}
            alt=""
            width={64}
            height={64}
            className="mx-auto h-16 w-16 rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-semibold text-indigo-700">
            {restaurant.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="mt-4 text-center text-2xl font-bold text-neutral-900">{restaurant.name}</h1>
        <p className="mt-1 text-center text-sm text-slate-700">Espace restaurateur</p>

        {error === "acces-refuse" && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">
            Ce compte n&apos;est pas rattaché à ce restaurant.
          </p>
        )}

        <Card className="mt-6">
          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
