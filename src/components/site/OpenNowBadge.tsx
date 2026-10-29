import type { Closure, OpeningHour } from "@/types/database";
import { isOpenNow } from "@/lib/opening-hours";
import { getActiveClosure } from "@/lib/closures";
import { getT } from "@/lib/lang";


export async function OpenNowBadge({ hours, closures = [] }: { hours: OpeningHour[]; closures?: Closure[] }) {
  const t = await getT();
  const open = getActiveClosure(closures) ? false : isOpenNow(hours);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-green-600" : "bg-red-600"}`} />
      {open ? t("Ouvert maintenant") : t("Fermé")}
    </span>
  );
}
