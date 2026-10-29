import type { Reservation, Restaurant, WaitlistEntry } from "@/types/database";

interface EmailContent {
  subject: string;
  html: string;
}

function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

function baseLayout(restaurant: Pick<Restaurant, "name" | "logo_url">, color: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:92%;">
            <tr>
              <td style="background:${color};padding:24px;text-align:center;">
                ${restaurant.logo_url ? `<img src="${restaurant.logo_url}" alt="" width="56" height="56" style="border-radius:50%;object-fit:cover;" />` : ""}
                <h1 style="color:#ffffff;font-size:20px;margin:12px 0 0;font-family:inherit;">${restaurant.name}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;color:#1f2937;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function summaryBlock(reservation: Reservation): string {
  return `
    <table cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border-radius:12px;padding:16px;margin:16px 0;font-size:14px;">
      <tr><td style="padding:4px 0;"><strong>Date</strong></td><td style="padding:4px 0;text-align:right;">${formatDate(reservation.reservation_date)}</td></tr>
      <tr><td style="padding:4px 0;"><strong>Heure</strong></td><td style="padding:4px 0;text-align:right;">${reservation.reservation_time.slice(0, 5)}</td></tr>
      <tr><td style="padding:4px 0;"><strong>Couverts</strong></td><td style="padding:4px 0;text-align:right;">${reservation.party_size}</td></tr>
      <tr><td style="padding:4px 0;"><strong>Nom</strong></td><td style="padding:4px 0;text-align:right;">${reservation.customer_name}</td></tr>
      <tr><td style="padding:4px 0;"><strong>Téléphone</strong></td><td style="padding:4px 0;text-align:right;">${reservation.customer_phone}</td></tr>
      ${reservation.notes ? `<tr><td colspan="2" style="padding:8px 0 0;">${reservation.notes}</td></tr>` : ""}
    </table>`;
}

function button(url: string, label: string, color: string): string {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:9999px;font-weight:600;font-size:14px;margin:4px 4px 0 0;">${label}</a>`;
}

export function customerPendingEmail(restaurant: Restaurant, reservation: Reservation, baseUrl: string): EmailContent {
  const cancelUrl = `${baseUrl}/annulation/${reservation.cancellation_token}`;
  return {
    subject: `Demande de réservation reçue — ${restaurant.name}`,
    html: baseLayout(
      restaurant,
      restaurant.theme.primary_color,
      `<p>Bonjour ${reservation.customer_name},</p>
       <p>Nous avons bien reçu votre demande de réservation. Le restaurant va la confirmer rapidement.</p>
       ${summaryBlock(reservation)}
       <p style="font-size:13px;color:#6b7280;">Besoin d'annuler ?</p>
       ${button(cancelUrl, "Annuler ma réservation", "#9ca3af")}`,
    ),
  };
}

export function customerConfirmedEmail(restaurant: Restaurant, reservation: Reservation, baseUrl: string): EmailContent {
  const cancelUrl = `${baseUrl}/annulation/${reservation.cancellation_token}`;
  return {
    subject: `Réservation confirmée — ${restaurant.name}`,
    html: baseLayout(
      restaurant,
      restaurant.theme.primary_color,
      `<p>Bonjour ${reservation.customer_name},</p>
       <p>Votre réservation est confirmée, à bientôt !</p>
       ${summaryBlock(reservation)}
       <p style="font-size:13px;color:#6b7280;">Besoin d'annuler ?</p>
       ${button(cancelUrl, "Annuler ma réservation", "#9ca3af")}`,
    ),
  };
}

export function customerRefusedEmail(restaurant: Restaurant, reservation: Reservation): EmailContent {
  return {
    subject: `Réservation non disponible — ${restaurant.name}`,
    html: baseLayout(
      restaurant,
      restaurant.theme.primary_color,
      `<p>Bonjour ${reservation.customer_name},</p>
       <p>Nous ne pouvons malheureusement pas honorer votre demande pour le
       ${formatDate(reservation.reservation_date)} à ${reservation.reservation_time.slice(0, 5)}.</p>
       <p>N'hésitez pas à nous contacter directement pour trouver un autre créneau${restaurant.phone ? ` : ${restaurant.phone}` : ""}.</p>`,
    ),
  };
}

export function customerReminderEmail(restaurant: Restaurant, reservation: Reservation, baseUrl: string): EmailContent {
  const cancelUrl = `${baseUrl}/annulation/${reservation.cancellation_token}`;
  return {
    subject: `Rappel : réservation demain — ${restaurant.name}`,
    html: baseLayout(
      restaurant,
      restaurant.theme.primary_color,
      `<p>Bonjour ${reservation.customer_name},</p>
       <p>Petit rappel : vous avez une réservation demain !</p>
       ${summaryBlock(reservation)}
       <p style="font-size:13px;color:#6b7280;">Empêché ?</p>
       ${button(cancelUrl, "Annuler ma réservation", "#9ca3af")}`,
    ),
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
    html: baseLayout(
      restaurant,
      restaurant.theme.primary_color,
      `<p>Nouvelle réservation ${autoConfirm ? "(confirmée automatiquement)" : "à valider"} :</p>
       ${summaryBlock(reservation)}
       ${
         autoConfirm
           ? ""
           : `<div style="margin-top:12px;">
                ${button(acceptUrl, "Accepter", "#16a34a")}
                ${button(refuseUrl, "Refuser", "#dc2626")}
              </div>`
       }`,
    ),
  };
}

export function waitlistSpotEmail(restaurant: Restaurant, entry: WaitlistEntry, baseUrl: string): EmailContent {
  const color = restaurant.theme.primary_color;
  return {
    subject: `Une place s'est libérée — ${restaurant.name}`,
    html: baseLayout(
      restaurant,
      color,
      `<p>Bonjour ${entry.customer_name},</p>
       <p>Bonne nouvelle : une table vient peut-être de se libérer le ${formatDate(entry.wanted_date)} pour ${entry.party_size} personne${entry.party_size > 1 ? "s" : ""}.</p>
       <p>Les places partent vite, réservez dès maintenant :</p>
       ${button(`${baseUrl}/reservation`, "Réserver maintenant", color)}`,
    ),
  };
}

export function serviceCancelledEmail(restaurant: Restaurant, reservation: Reservation, message: string): EmailContent {
  return {
    subject: `Votre réservation est annulée — ${restaurant.name}`,
    html: baseLayout(
      restaurant,
      restaurant.theme.primary_color,
      `<p>Bonjour ${reservation.customer_name},</p>
       <p>Nous devons malheureusement annuler votre réservation du ${formatDate(reservation.reservation_date)} à ${reservation.reservation_time.slice(0, 5)}.</p>
       ${message ? `<p style="background:#f9fafb;border-radius:12px;padding:12px 16px;">${message.replace(/</g, "&lt;")}</p>` : ""}
       <p>Nous sommes sincèrement désolés${restaurant.phone ? ` et restons joignables au ${restaurant.phone}` : ""}.</p>`,
    ),
  };
}

export function customerCancelledEmail(restaurant: Restaurant, reservation: Reservation): EmailContent {
  return {
    subject: `Réservation annulée — ${restaurant.name}`,
    html: baseLayout(
      restaurant,
      restaurant.theme.primary_color,
      `<p>Bonjour ${reservation.customer_name},</p>
       <p>Nous sommes au regret de vous informer que votre réservation du
       ${formatDate(reservation.reservation_date)} à ${reservation.reservation_time.slice(0, 5)} a dû être annulée.</p>
       <p>N'hésitez pas à nous contacter pour retrouver un créneau${restaurant.phone ? ` : ${restaurant.phone}` : ""}.</p>`,
    ),
  };
}
