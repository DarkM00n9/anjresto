import type { Closure, OpeningHour } from "@/types/database";
import { Section } from "@/components/ui/Section";
import { OpenNowBadge } from "./OpenNowBadge";
import { groupHoursByDay } from "@/lib/opening-hours";
import { getActiveClosure } from "@/lib/closures";
import { Card } from "@/components/ui/Card";

interface OpeningHoursBlockProps {
  hours: OpeningHour[];
  closures: Closure[];
}

export function OpeningHoursBlock({ hours, closures }: OpeningHoursBlockProps) {
  const schedule = groupHoursByDay(hours);
  const activeClosure = getActiveClosure(closures);

  return (
    <Section id="horaires" spacing="py-20 md:py-32">
      <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="flex flex-col items-start gap-5 lg:sticky lg:top-28">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              <span className="h-px w-8 bg-[var(--color-primary)]" />À votre rythme
            </p>
            <h2 className="mt-6 font-[family-name:var(--font-title)] text-4xl font-normal tracking-[-0.035em] text-[var(--color-secondary)] sm:text-5xl">
              Horaires
            </h2>
          </div>
          <OpenNowBadge hours={hours} closures={closures} />
          <p className="max-w-sm text-sm leading-6 text-stone-600">Nous serons ravis de vous accueillir. Pensez à réserver votre table pour le créneau qui vous convient.</p>
        </div>

        {activeClosure && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-start-2">
            {activeClosure.message || "Fermeture exceptionnelle en cours."}
          </div>
        )}

        <Card className="divide-y divide-black/[0.07] rounded-2xl border-stone-200/80 p-0 shadow-sm lg:col-start-2">
          <ul className="divide-y divide-black/[0.07]">
            {schedule.map((day) => (
              <li
                key={day.day}
                className={`flex items-center justify-between gap-4 px-5 py-4 text-sm sm:px-6 ${
                  day.isToday ? "font-semibold text-[var(--color-primary)]" : "text-stone-700"
                }`}
              >
                <span>{day.label}</span>
                <span className="text-right">
                  {day.isClosed
                    ? "Fermé"
                    : day.slots.map((slot) => `${slot.opensAt} – ${slot.closesAt}`).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Section>
  );
}
