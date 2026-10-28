import type { Closure, OpeningHour } from "@/types/database";
import { Section } from "@/components/ui/Section";
import { OpenNowBadge } from "./OpenNowBadge";
import { groupHoursByDay } from "@/lib/opening-hours";
import { getActiveClosure } from "@/lib/closures";
import type { LayoutPreset } from "@/lib/layout-presets";

interface OpeningHoursBlockProps {
  hours: OpeningHour[];
  closures: Closure[];
  preset: LayoutPreset;
}

export function OpeningHoursBlock({ hours, closures, preset }: OpeningHoursBlockProps) {
  const schedule = groupHoursByDay(hours);
  const activeClosure = getActiveClosure(closures);

  return (
    <Section id="horaires" spacing={preset.sectionSpacing}>
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-title)] text-3xl font-bold text-[var(--color-secondary)]">
            Horaires
          </h2>
          <OpenNowBadge hours={hours} closures={closures} />
        </div>

        {activeClosure && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {activeClosure.message || "Fermeture exceptionnelle en cours."}
          </div>
        )}

        <ul className="divide-y divide-black/5">
          {schedule.map((day) => (
            <li
              key={day.day}
              className={`flex items-center justify-between py-3 text-sm ${
                day.isToday ? "font-semibold text-[var(--color-primary)]" : "text-black/70"
              }`}
            >
              <span>{day.label}</span>
              <span>
                {day.isClosed
                  ? "Fermé"
                  : day.slots.map((slot) => `${slot.opensAt} – ${slot.closesAt}`).join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
