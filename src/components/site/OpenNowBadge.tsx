import type { OpeningHour } from "@/types/database";
import { isOpenNow } from "@/lib/opening-hours";

export function OpenNowBadge({ hours }: { hours: OpeningHour[] }) {
  const open = isOpenNow(hours);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-green-600" : "bg-red-600"}`} />
      {open ? "Ouvert maintenant" : "Fermé"}
    </span>
  );
}
