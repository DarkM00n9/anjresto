import { computeTotals, formatDateFR, formatEUR, type CompanySettings, type Quote } from "@/lib/quotes";

/** Devis prêt à imprimer (le menu du superadmin est masqué à l'impression). */
export function QuoteDocument({ quote, company }: { quote: Quote; company: CompanySettings }) {
  const vatRate = Number(company.vat_rate) || 0;
  const t = computeTotals(quote, vatRate);
  const legalLine = [
    `${company.legal_name} — ${company.legal_form}${company.share_capital ? ` au capital de ${company.share_capital}` : ""}`,
    company.address_line && `${company.address_line}, ${company.postal_code ?? ""} ${company.city}`.trim(),
    company.siret && `SIRET ${company.siret}`,
    company.rcs && `RCS ${company.rcs}`,
    company.vat_number && `TVA ${company.vat_number}`,
  ].filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-white p-6 text-[14px] leading-6 text-slate-900 shadow-sm sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <header className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <p className="text-xl font-bold">{company.legal_name}</p>
          <p className="text-slate-700">
            {company.legal_form}
            {company.address_line && <><br />{company.address_line}<br />{company.postal_code} {company.city}</>}
            {company.email && <><br />{company.email}</>}
            {company.phone && <><br />{company.phone}</>}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-2xl font-bold tracking-tight">DEVIS</p>
          <p className="font-semibold">{quote.number}</p>
          <p className="text-slate-700">Date : {formatDateFR(quote.quote_date)}</p>
          {quote.valid_until && <p className="text-slate-700">Valable jusqu&apos;au {formatDateFR(quote.valid_until)}</p>}
        </div>
      </header>

      <section className="mt-8 rounded-xl border border-slate-300 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Client</p>
        <p className="font-semibold">{quote.client_name}</p>
        <p className="text-slate-700">
          {quote.client_representative && <>{quote.client_representative}<br /></>}
          {quote.client_address && <>{quote.client_address}<br /></>}
          {[quote.client_email, quote.client_phone].filter(Boolean).join(" — ")}
        </p>
      </section>

      <table className="mt-8 w-full border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-slate-900 text-xs uppercase tracking-wide">
            <th className="py-2 pr-2">Désignation</th>
            <th className="px-2 py-2 text-right">Qté</th>
            <th className="px-2 py-2 text-right">P.U. HT</th>
            <th className="py-2 pl-2 text-right">Total HT</th>
          </tr>
        </thead>
        <tbody>
          {quote.lines.map((l, i) => (
            <tr key={i} className="border-b border-slate-200 align-top">
              <td className="py-3 pr-2">
                <span className="font-semibold">{l.label}</span>
                {l.description && <span className="mt-0.5 block text-slate-700">{l.description}</span>}
              </td>
              <td className="px-2 py-3 text-right">{l.quantity}</td>
              <td className="whitespace-nowrap px-2 py-3 text-right">{formatEUR(l.unit_price)}</td>
              <td className="whitespace-nowrap py-3 pl-2 text-right font-semibold">{formatEUR(l.quantity * l.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto mt-4 w-full max-w-xs space-y-1">
        <div className="flex justify-between"><dt>Total HT</dt><dd>{formatEUR(t.ht)}</dd></div>
        <div className="flex justify-between"><dt>TVA ({vatRate} %)</dt><dd>{formatEUR(t.vat)}</dd></div>
        <div className="flex justify-between border-t border-slate-900 pt-1 text-base font-bold"><dt>Total TTC</dt><dd>{formatEUR(t.ttc)}</dd></div>
      </dl>
      {vatRate === 0 && <p className="mt-2 text-xs text-slate-600">TVA non applicable, art. 293 B du CGI.</p>}

      <section className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Modalités de paiement</p>
        <ul className="mt-1 space-y-0.5">
          <li>Acompte de {quote.deposit_percent} % à la signature : <strong>{formatEUR(t.deposit)}</strong></li>
          <li>Solde à la livraison : <strong>{formatEUR(t.balance)}</strong></li>
          {company.iban && <li className="text-slate-700">Virement : IBAN {company.iban}{company.bic ? ` — BIC ${company.bic}` : ""}</li>}
        </ul>
      </section>

      {quote.monthly_price > 0 && (
        <section className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Abonnement mensuel</p>
          <p className="mt-1"><strong>{formatEUR(t.monthlyHt)} HT par mois</strong>{vatRate > 0 && <> ({formatEUR(t.monthlyTtc)} TTC)</>}, à compter de la mise en ligne.</p>
          {quote.monthly_description && <p className="text-slate-700">{quote.monthly_description}</p>}
        </section>
      )}

      <section className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Conditions</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-800">
          <li>Livraison sous {quote.delivery_days} jours ouvrés après réception de l&apos;acompte et des éléments fournis par le restaurant (logo, photos, carte, horaires).</li>
          <li>Les contenus fournis restent la propriété du restaurant, qui garantit en détenir les droits.</li>
          <li>L&apos;acompte n&apos;est pas remboursable une fois le travail commencé.</li>
          <li>Le nom de domaine personnalisé n&apos;est pas inclus.</li>
        </ul>
        {quote.notes && <p className="mt-2 whitespace-pre-line text-slate-800">{quote.notes}</p>}
      </section>

      <section className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Bon pour accord</p>
        <p className="text-xs text-slate-600">Date, mention « Bon pour accord » et signature.</p>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div className="h-28 rounded-xl border border-slate-300 p-3 text-xs text-slate-600">{company.legal_name}</div>
          <div className="h-28 rounded-xl border border-slate-300 p-3 text-xs text-slate-600">Le client</div>
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-[11px] text-slate-600">{legalLine.join(" · ")}</footer>
    </article>
  );
}
