import type { Reservation, Restaurant, WaitlistEntry } from "@/types/database";
import { buildCalendarLinks } from "@/lib/calendar";

interface EmailContent {
  subject: string;
  html: string;
}

/** Échappe le texte saisi par un client avant de l'insérer dans le HTML de l'e-mail. */
function esc(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(date: string): string {
  const text = new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function addressOf(restaurant: Restaurant): string {
  return [restaurant.address_line, [restaurant.postal_code, restaurant.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

interface LayoutOptions {
  /** Texte d'aperçu affiché dans la liste des e-mails. */
  preheader: string;
  /** Titre principal dans l'en-tête coloré. */
  title: string;
  /** Pastille de statut au-dessus du titre (ex. « Confirmée »). */
  badge?: string;
  bodyHtml: string;
}

function baseLayout(restaurant: Restaurant, opts: LayoutOptions): string {
  const color = restaurant.theme.primary_color || "#b45309";
  const address = addressOf(restaurant);

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${esc(opts.title)}</title>
    <style>
      body { margin:0 !important; padding:0 !important; width:100% !important; -webkit-text-size-adjust:100%; }
      a { color:${color}; }
      @media only screen and (max-width: 600px) {
        .container { width:100% !important; border-radius:0 !important; }
        .px { padding-left:20px !important; padding-right:20px !important; }
        .btn { display:block !important; width:100% !important; box-sizing:border-box; text-align:center !important; margin:0 0 10px 0 !important; }
        .big { font-size:22px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f2;font-family:${FONT};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(opts.preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f2;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">
            <tr>
              <td class="px" align="center" style="background:${color};padding:28px 32px;">
                ${restaurant.logo_url ? `<img src="${esc(restaurant.logo_url)}" alt="" width="56" height="56" style="display:block;margin:0 auto 12px;border-radius:50%;border:2px solid rgba(255,255,255,0.7);object-fit:cover;" />` : ""}
                <div style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">${esc(restaurant.name)}</div>
                ${opts.badge ? `<div style="display:inline-block;margin-top:14px;padding:5px 14px;border-radius:999px;background:rgba(255,255,255,0.2);color:#ffffff;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${esc(opts.badge)}</div>` : ""}
                <h1 class="big" style="margin:12px 0 0;font-size:26px;line-height:1.25;font-weight:700;color:#ffffff;">${esc(opts.title)}</h1>
              </td>
            </tr>
            <tr>
              <td class="px" style="padding:28px 32px;color:#1f2937;font-size:16px;line-height:1.6;">
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td class="px" style="padding:20px 32px 28px;border-top:1px solid #eeeeec;background:#fafaf9;color:#6b7280;font-size:13px;line-height:1.6;" align="center">
                <strong style="color:#374151;">${esc(restaurant.name)}</strong><br />
                ${address ? `${esc(address)}<br />` : ""}
                ${restaurant.phone ? `<a href="tel:${esc(restaurant.phone.replace(/\s+/g, ""))}" style="color:#6b7280;text-decoration:none;">${esc(restaurant.phone)}</a>` : ""}
              </td>
            </tr>
          </table>
          <div style="padding:16px 0 0;font-size:11px;color:#9ca3af;">E-mail automatique · ANJ Agency</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1f2937;">${text}</p>`;
}

/** Carte récapitulative : date et heure en grand, puis les détails. */
function summaryBlock(restaurant: Restaurant, reservation: Reservation): string {
  const color = restaurant.theme.primary_color || "#b45309";
  const row = (label: string, value: string) =>
    `<tr>
       <td style="padding:8px 0;border-top:1px solid #e7e5e4;font-size:14px;color:#6b7280;">${label}</td>
       <td align="right" style="padding:8px 0;border-top:1px solid #e7e5e4;font-size:15px;font-weight:600;color:#111827;">${value}</td>
     </tr>`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;background:#faf9f7;border:1px solid #e7e5e4;border-radius:12px;">
      <tr>
        <td style="padding:20px 20px 12px;" align="center">
          <div style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">${esc(formatDate(reservation.reservation_date))}</div>
          <div style="margin-top:4px;font-size:40px;line-height:1.1;font-weight:700;color:${color};">${reservation.reservation_time.slice(0, 5)}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${row("Personnes", String(reservation.party_size))}
            ${row("Nom", esc(reservation.customer_name))}
            ${row("Téléphone", esc(reservation.customer_phone))}
            ${reservation.notes ? row("Message", esc(reservation.notes)) : ""}
          </table>
        </td>
      </tr>
    </table>`;
}

function button(url: string, label: string, bg: string, color = "#ffffff"): string {
  return `<a class="btn" href="${esc(url)}" style="display:inline-block;background:${bg};color:${color};text-decoration:none;padding:14px 26px;border-radius:999px;font-weight:700;font-size:15px;margin:0 8px 10px 0;">${esc(label)}</a>`;
}

function calendarLink(restaurant: Restaurant, reservation: Reservation): string {
  const { google } = buildCalendarLinks({
    title: `Réservation — ${restaurant.name}`,
    date: reservation.reservation_date,
    time: reservation.reservation_time.slice(0, 5),
    durationMinutes: 90,
    location: addressOf(restaurant),
  });
  return `<a href="${esc(google)}" style="color:#374151;font-size:14px;font-weight:600;">Ajouter à mon agenda</a>`;
}

/** Adresse en clair, hors balise <a> : reste utilisable si le lien cliquable est réécrit par le suivi de clics du service d'envoi. */
function directLink(url: string): string {
  return `<p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#9ca3af;word-break:break-all;">Lien direct : ${esc(url)}</p>`;
}

function cancelBlock(cancelUrl: string, intro: string): string {
  return `<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #eeeeec;font-size:14px;color:#6b7280;">${intro}
    <a href="${esc(cancelUrl)}" style="color:#6b7280;">Annuler ma réservation</a></p>
    ${directLink(cancelUrl)}`;
}

export function customerPendingEmail(restaurant: Restaurant, reservation: Reservation, baseUrl: string): EmailContent {
  const cancelUrl = `${baseUrl}/annulation/${reservation.cancellation_token}`;
  return {
    subject: `Demande de réservation reçue — ${restaurant.name}`,
    html: baseLayout(restaurant, {
      preheader: `Votre demande pour le ${formatDate(reservation.reservation_date)} à ${reservation.reservation_time.slice(0, 5)} est bien reçue.`,
      badge: "En attente",
      title: "Demande bien reçue",
      bodyHtml: `${paragraph(`Bonjour ${esc(reservation.customer_name)},`)}
        ${paragraph("Nous avons bien reçu votre demande de réservation. Le restaurant la confirme très vite : vous recevrez un nouvel e-mail.")}
        ${summaryBlock(restaurant, reservation)}
        ${cancelBlock(cancelUrl, "Un empêchement ?")}`,
    }),
  };
}

export function customerConfirmedEmail(restaurant: Restaurant, reservation: Reservation, baseUrl: string): EmailContent {
  const cancelUrl = `${baseUrl}/annulation/${reservation.cancellation_token}`;
  return {
    subject: `Réservation confirmée — ${restaurant.name}`,
    html: baseLayout(restaurant, {
      preheader: `Table confirmée le ${formatDate(reservation.reservation_date)} à ${reservation.reservation_time.slice(0, 5)}.`,
      badge: "Confirmée",
      title: "Votre table est réservée",
      bodyHtml: `${paragraph(`Bonjour ${esc(reservation.customer_name)},`)}
        ${paragraph("Votre réservation est confirmée. Nous nous réjouissons de vous accueillir !")}
        ${summaryBlock(restaurant, reservation)}
        <p style="margin:0;text-align:center;">${calendarLink(restaurant, reservation)}</p>
        ${cancelBlock(cancelUrl, "Un empêchement ?")}`,
    }),
  };
}

export function customerRefusedEmail(restaurant: Restaurant, reservation: Reservation): EmailContent {
  return {
    subject: `Réservation non disponible — ${restaurant.name}`,
    html: baseLayout(restaurant, {
      preheader: "Nous ne pouvons pas honorer votre demande pour ce créneau.",
      title: "Créneau indisponible",
      bodyHtml: `${paragraph(`Bonjour ${esc(reservation.customer_name)},`)}
        ${paragraph(`Nous ne pouvons malheureusement pas honorer votre demande pour le ${esc(formatDate(reservation.reservation_date))} à ${reservation.reservation_time.slice(0, 5)}.`)}
        ${paragraph(`N'hésitez pas à nous contacter pour trouver un autre créneau${restaurant.phone ? ` : <strong>${esc(restaurant.phone)}</strong>` : ""}.`)}`,
    }),
  };
}

export function customerReminderEmail(restaurant: Restaurant, reservation: Reservation, baseUrl: string): EmailContent {
  const cancelUrl = `${baseUrl}/annulation/${reservation.cancellation_token}`;
  return {
    subject: `Rappel : réservation demain — ${restaurant.name}`,
    html: baseLayout(restaurant, {
      preheader: `Rappel : votre table est demain à ${reservation.reservation_time.slice(0, 5)}.`,
      badge: "Rappel",
      title: "À demain !",
      bodyHtml: `${paragraph(`Bonjour ${esc(reservation.customer_name)},`)}
        ${paragraph("Petit rappel : vous avez une réservation demain.")}
        ${summaryBlock(restaurant, reservation)}
        ${cancelBlock(cancelUrl, "Empêché ?")}`,
    }),
  };
}

export function restaurantNewReservationEmail(
  restaurant: Restaurant,
  reservation: Reservation,
  baseUrl: string,
  autoConfirm: boolean,
): EmailContent {
  const acceptUrl = `${baseUrl}/resa/${reservation.action_token}?action=accept`;
  const refuseUrl = `${baseUrl}/resa/${reservation.action_token}?action=refuse`;

  return {
    subject: autoConfirm
      ? `Nouvelle réservation confirmée — ${reservation.customer_name}`
      : `Nouvelle demande de réservation — ${reservation.customer_name}`,
    html: baseLayout(restaurant, {
      preheader: `${reservation.customer_name} · ${reservation.party_size} pers. · ${formatDate(reservation.reservation_date)} ${reservation.reservation_time.slice(0, 5)}`,
      badge: autoConfirm ? "Confirmée automatiquement" : "À valider",
      title: autoConfirm ? "Nouvelle réservation" : "Nouvelle demande",
      bodyHtml: `${summaryBlock(restaurant, reservation)}
        ${
          autoConfirm
            ? ""
            : `<div style="margin-top:8px;">
                ${button(acceptUrl, "Accepter", "#15803d")}
                ${button(refuseUrl, "Refuser", "#b91c1c")}
              </div>
              ${directLink(acceptUrl)}${directLink(refuseUrl)}`
        }`,
    }),
  };
}

export function waitlistSpotEmail(restaurant: Restaurant, entry: WaitlistEntry, baseUrl: string): EmailContent {
  const color = restaurant.theme.primary_color || "#b45309";
  return {
    subject: `Une place s'est libérée — ${restaurant.name}`,
    html: baseLayout(restaurant, {
      preheader: `Une table vient de se libérer le ${formatDate(entry.wanted_date)}.`,
      badge: "Liste d'attente",
      title: "Une place s'est libérée",
      bodyHtml: `${paragraph(`Bonjour ${esc(entry.customer_name)},`)}
        ${paragraph(`Bonne nouvelle : une table vient peut-être de se libérer le <strong>${esc(formatDate(entry.wanted_date))}</strong> pour ${entry.party_size} personne${entry.party_size > 1 ? "s" : ""}.`)}
        ${paragraph("Les places partent vite, réservez dès maintenant :")}
        ${button(`${baseUrl}/reservation`, "Réserver maintenant", color)}`,
    }),
  };
}

export function serviceCancelledEmail(restaurant: Restaurant, reservation: Reservation, message: string): EmailContent {
  return {
    subject: `Votre réservation est annulée — ${restaurant.name}`,
    html: baseLayout(restaurant, {
      preheader: "Nous sommes désolés : votre réservation doit être annulée.",
      badge: "Annulée",
      title: "Réservation annulée",
      bodyHtml: `${paragraph(`Bonjour ${esc(reservation.customer_name)},`)}
        ${paragraph(`Nous devons malheureusement annuler votre réservation du ${esc(formatDate(reservation.reservation_date))} à ${reservation.reservation_time.slice(0, 5)}.`)}
        ${message ? `<p style="margin:0 0 16px;padding:14px 16px;background:#faf9f7;border-left:4px solid #d6d3d1;border-radius:8px;font-size:15px;line-height:1.6;color:#374151;">${esc(message)}</p>` : ""}
        ${paragraph(`Nous sommes sincèrement désolés${restaurant.phone ? ` et restons joignables au <strong>${esc(restaurant.phone)}</strong>` : ""}.`)}`,
    }),
  };
}

export function customerCancelledEmail(restaurant: Restaurant, reservation: Reservation): EmailContent {
  return {
    subject: `Réservation annulée — ${restaurant.name}`,
    html: baseLayout(restaurant, {
      preheader: "Votre réservation a dû être annulée.",
      badge: "Annulée",
      title: "Réservation annulée",
      bodyHtml: `${paragraph(`Bonjour ${esc(reservation.customer_name)},`)}
        ${paragraph(`Nous sommes au regret de vous informer que votre réservation du ${esc(formatDate(reservation.reservation_date))} à ${reservation.reservation_time.slice(0, 5)} a dû être annulée.`)}
        ${paragraph(`N'hésitez pas à nous contacter pour retrouver un créneau${restaurant.phone ? ` : <strong>${esc(restaurant.phone)}</strong>` : ""}.`)}`,
    }),
  };
}
