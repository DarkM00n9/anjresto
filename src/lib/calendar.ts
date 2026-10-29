/** Liens "ajouter au calendrier" (Google + fichier .ics) pour une réservation. */
export function buildCalendarLinks(opts: {
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  location: string;
}) {
  const start = new Date(`${opts.date}T${opts.time}:00`);
  const end = new Date(start.getTime() + opts.durationMinutes * 60000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;

  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(opts.title)}&dates=${fmt(start)}/${fmt(end)}&location=${encodeURIComponent(opts.location)}`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${opts.title}`,
    `LOCATION:${opts.location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return { google, icsHref: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` };
}
