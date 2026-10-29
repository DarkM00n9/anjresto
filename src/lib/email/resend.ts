import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;

function getResendClient(): Resend {
  if (!client) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY manquant");
    client = new Resend(process.env.RESEND_API_KEY);
  }
  return client;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/** Best-effort : un email qui échoue ne doit jamais faire échouer la réservation elle-même. */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY absent — email non envoyé:", subject, "->", to);
    return;
  }

  try {
    const resend = getResendClient();
    const from = process.env.RESEND_FROM_EMAIL ?? "ANJ Agency <onboarding@resend.dev>";
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) console.error("Erreur d'envoi Resend:", error);
  } catch (error) {
    console.error("Erreur d'envoi Resend:", error);
  }
}

/** Envoi dont on veut connaître le résultat (ex. devis) : renvoie l'erreur au lieu de l'avaler. */
export async function sendEmailStrict({ to, subject, html, replyTo }: SendEmailParams & { replyTo?: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY manquant." };
  try {
    const from = process.env.RESEND_FROM_EMAIL ?? "ANJ Agency <onboarding@resend.dev>";
    const { error } = await getResendClient().emails.send({ from, to, subject, html, ...(replyTo ? { replyTo } : {}) });
    return error ? { ok: false, error: error.message } : { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur d'envoi." };
  }
}
