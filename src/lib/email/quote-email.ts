import { computeTotals, formatDateFR, formatEUR, type CompanySettings, type Quote } from "@/lib/quotes";

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function layout(title: string, body: string) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;">
<tr><td style="padding:28px 24px;font-size:15px;line-height:1.6;">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr><td style="background:#4f46e5;border-radius:999px;"><a href="${esc(href)}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-weight:600;text-decoration:none;font-size:15px;">${esc(label)}</a></td></tr></table>`;
}

function signature(company: CompanySettings) {
  return `<p style="margin:24px 0 0;color:#475569;font-size:13px;">${esc(company.legal_name)}${company.phone ? ` — ${esc(company.phone)}` : ""}${company.email ? `<br>${esc(company.email)}` : ""}</p>`;
}

export function quoteEmail(quote: Quote, company: CompanySettings, link: string) {
  const t = computeTotals(quote, Number(company.vat_rate) || 0);
  return {
    subject: `Votre devis ${quote.number} — ${company.legal_name}`,
    html: layout(
      `Devis ${quote.number}`,
      `<p style="margin:0 0 12px;">Bonjour${quote.client_representative ? ` ${esc(quote.client_representative)}` : ""},</p>
<p style="margin:0 0 12px;">Voici votre devis <strong>${esc(quote.number)}</strong> pour <strong>${esc(quote.client_name)}</strong>.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin:16px 0;"><tr><td style="padding:14px 16px;font-size:14px;">
Création du site : <strong>${formatEUR(t.ttc)} TTC</strong><br>
Acompte (${quote.deposit_percent} %) : ${formatEUR(t.deposit)}<br>
${quote.monthly_price > 0 ? `Abonnement : ${formatEUR(t.monthlyHt)} HT / mois<br>` : ""}
${quote.valid_until ? `Valable jusqu'au ${formatDateFR(quote.valid_until)}` : ""}
</td></tr></table>
<p style="margin:0;">Vous pouvez le consulter et le signer en ligne, directement depuis votre téléphone :</p>
${button(link, "Consulter et signer le devis")}
<p style="margin:0;color:#475569;font-size:13px;">Si le bouton ne fonctionne pas, copiez ce lien : <br><span style="word-break:break-all;">${esc(link)}</span></p>
${signature(company)}`,
    ),
  };
}

export function quoteSignedEmail(quote: Quote, company: CompanySettings, link: string, forClient: boolean) {
  return {
    subject: forClient ? `Devis ${quote.number} signé — merci !` : `Devis ${quote.number} signé par ${quote.client_name}`,
    html: layout(
      `Devis ${quote.number} signé`,
      forClient
        ? `<p style="margin:0 0 12px;">Bonjour,</p><p style="margin:0 0 12px;">Nous avons bien reçu votre signature pour le devis <strong>${esc(quote.number)}</strong>. Merci pour votre confiance !</p><p style="margin:0;">Nous revenons vers vous très vite pour la suite (acompte et mise en ligne).</p>${button(link, "Revoir le devis signé")}${signature(company)}`
        : `<p style="margin:0 0 12px;"><strong>${esc(quote.client_name)}</strong> vient de signer le devis <strong>${esc(quote.number)}</strong>.</p>${button(link, "Voir le devis signé")}`,
    ),
  };
}

export function quoteCodeEmail(quote: Quote, company: CompanySettings, code: string) {
  return {
    subject: `Votre code de signature : ${code}`,
    html: layout(
      "Code de signature",
      `<p style="margin:0 0 12px;">Bonjour,</p>
<p style="margin:0 0 12px;">Voici votre code pour signer le devis <strong>${esc(quote.number)}</strong> de ${esc(company.legal_name)} :</p>
<p style="margin:18px 0;text-align:center;font-size:34px;font-weight:700;letter-spacing:10px;color:#4f46e5;">${esc(code)}</p>
<p style="margin:0;color:#475569;font-size:13px;">Ce code est valable 10 minutes et ne peut être utilisé qu'une seule fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email : rien ne sera signé.</p>
${signature(company)}`,
    ),
  };
}
