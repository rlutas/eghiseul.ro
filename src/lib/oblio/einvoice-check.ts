/**
 * Verificarea exportului e-Factura (SPV) pentru o factură deja emisă.
 *
 * Problema pe care o rezolvă: Oblio EMITE factura chiar dacă datele clientului
 * nu trec validările ANAF. Blocajul apare abia la „Trimite în SPV", pe care îl
 * apasă echipa manual — așa că descoperirea venea cu zile întârziere (raport
 * 27.07.2026: facturi din 8, 10, 12, 14 și 25 iulie, toate blocate).
 *
 * Oblio expune per factură un link `einvoice`. Când datele sunt valide,
 * răspunsul e XML-ul UBL; când nu, e un mic HTML cu exact mesajul pe care îl
 * vede echipa în interfață („Adauga Tara Clientului", „Selecteaza un Judet
 * valid Clientului tau", ...). Verificăm acel răspuns și salvăm rezultatul pe
 * comandă, ca blocajul să fie vizibil în admin din prima secundă.
 */

import { oblioRequest, getOblioConfig } from './client';

export interface EinvoiceCheckResult {
  /** true = exportul e-Factura trece; false = ANAF/Oblio refuză. */
  ok: boolean;
  /** Mesajul Oblio, curățat de HTML (doar când ok === false). */
  error?: string;
}

/** Textul din `<error>...</error>`, fără taguri și cu entitățile decodate. */
function extractOblioError(body: string): string | null {
  const m = body.match(/<error>([\s\S]*?)<\/error>/i);
  if (!m) return null;
  return m[1]
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Verifică dacă factura poate fi exportată/trimisă în SPV.
 *
 * Nu aruncă: orice problemă de rețea/API întoarce `{ ok: true }` (fail-open) —
 * un fals pozitiv de „blocat" pe o eroare de infrastructură ar trimite echipa
 * să caute o problemă inexistentă.
 */
export async function checkEinvoiceExport(
  seriesName: string,
  number: string,
): Promise<EinvoiceCheckResult> {
  try {
    const config = getOblioConfig();
    const doc = await oblioRequest<{ einvoice?: string; link?: string }>({
      endpoint: `/docs/invoice?cif=${config.companyCif}&seriesName=${encodeURIComponent(seriesName)}&number=${encodeURIComponent(number)}`,
      method: 'GET',
    });
    if (!doc?.einvoice) return { ok: true };

    const res = await fetch(doc.einvoice);
    const body = await res.text();

    const error = extractOblioError(body);
    if (error) return { ok: false, error };

    // XML-ul UBL = export valid. Orice alt HTML fără <error> îl tratăm ca OK
    // (fail-open) ca să nu inventăm blocaje.
    return { ok: true };
  } catch (err) {
    console.error(
      '[einvoice-check] verificare eșuată pentru',
      `${seriesName}-${number}:`,
      err instanceof Error ? err.message : err,
    );
    return { ok: true };
  }
}

/** Desparte „EGH-0172" / „EGI2024-24312" în serie + număr. */
export function splitInvoiceNumber(
  invoiceNumber: string,
): { seriesName: string; number: string } | null {
  const idx = (invoiceNumber || '').lastIndexOf('-');
  if (idx < 1) return null;
  const seriesName = invoiceNumber.slice(0, idx).trim();
  const number = invoiceNumber.slice(idx + 1).trim();
  if (!seriesName || !number) return null;
  return { seriesName, number };
}
