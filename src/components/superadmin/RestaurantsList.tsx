import Link from "next/link";
import type { RestaurantOverview } from "@/lib/superadmin/get-restaurants-overview";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

const STATUS_LABELS: Record<string, { label: string; tone: "warning" | "success" | "danger" }> = {
  demo: { label: "Démo", tone: "warning" },
  active: { label: "Actif", tone: "success" },
  suspended: { label: "Suspendu", tone: "danger" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "jamais";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function RestaurantsList({ restaurants }: { restaurants: RestaurantOverview[] }) {
  if (restaurants.length === 0) {
    return <Card className="flex flex-col items-center py-12 text-center"><Building2 className="h-8 w-8 text-slate-700" /><p className="mt-3 text-sm font-semibold text-slate-700">Aucun restaurant pour l’instant</p><p className="mt-1 text-xs text-slate-700">Crée un établissement pour commencer.</p></Card>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {restaurants.map((r) => {
        return (
          <li key={r.id}>
            <Link
              href={`/superadmin/${r.id}`}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm shadow-slate-900/[0.025] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Building2 className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold text-slate-900">{r.name}</p><Badge tone={STATUS_LABELS[r.status].tone}>{STATUS_LABELS[r.status].label}</Badge></div>
                <p className="mt-1 text-xs text-slate-700">
                  /{r.slug} · créé le {formatDate(r.created_at)} · {r.reservationsThisMonth} résa. ce mois-ci
                </p>
                <p className="mt-1 truncate text-xs text-slate-700">
                  {r.ownerEmail ?? "pas de propriétaire"} · dernière connexion : {formatDate(r.ownerLastSignInAt)}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-700 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
