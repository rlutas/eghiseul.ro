/**
 * TVA pe documentele Oblio — o singură sursă de adevăr + garda care nu lasă o
 * factură fără TVA să plece.
 *
 * Firma emitentă (EDIGITALIZARE S.R.L., CIF RO49278701) e plătitoare de TVA și
 * toate serviciile pe care le vindem sunt taxabile la cota standard. Nu există
 * linie scutită, nu există taxare inversă, nu există OSS — dacă vreodată apare
 * una, e o eroare, nu un caz de business.
 *
 * De ce garda: Oblio cheiază nomenclatorul de produse pe `code` și, la
 * potrivire, aplică **TVA-ul memorat pe produs**, ignorând `vatPercentage` din
 * request. În iunie–iulie 2026 au ieșit așa 129 de facturi cu 0% (32.281,29 RON
 * brut, 5.602,28 RON TVA necolectat) — produse `prod_*` create de fluxul vechi
 * Stripe→Oblio de pe WordPress și salvate ca „Scutita". Nimeni n-a observat două
 * luni; a văzut contabilul, pe jurnalul de vânzări.
 *
 * Trei straturi, în ordinea în care prind problema:
 *   1. `RO_VAT_NAME` trimis explicit pe fiecare linie — cu `vatName` pe linie,
 *      nomenclatorul nu mai poate suprascrie cota.
 *   2. `assertVatOnAllLines()` înainte de POST — dacă o linie pleacă totuși
 *      fără 21%, cererea nu mai pleacă deloc.
 *   3. `auditIssuedInvoiceVat()` în cron — verifică ce a MEMORAT Oblio, nu ce
 *      i-am trimis. Singurul strat care ar fi prins bug-ul original.
 */

import { oblioRequest, getOblioConfig } from './client';

/** Cota standard din România (19% → 21% în 2026). */
export const RO_VAT_RATE = 21;

/** Numele cotei din lista firmei în Oblio. */
export const RO_VAT_NAME = 'Normala';

interface VatBearingLine {
  name?: string;
  code?: string;
  vatName?: string;
  vatPercentage?: number;
}

/**
 * Refuză să emită un document cu vreo linie care nu e la cota standard.
 *
 * Aruncă — nu logăm și continuăm. O factură lipsă e vizibilă (cronul de
 * invoice-health-check o găsește și o reface); o factură emisă cu TVA greșit e
 * invizibilă până la declarația rectificativă.
 */
export function assertVatOnAllLines(lines: VatBearingLine[], context: string): void {
  const bad = lines.filter(
    (l) => l.vatName !== RO_VAT_NAME || Number(l.vatPercentage) !== RO_VAT_RATE
  );
  if (bad.length === 0) return;

  const detail = bad
    .map((l) => `„${l.name ?? '?'}" (${l.vatName ?? 'fără vatName'} ${l.vatPercentage ?? '?'}%)`)
    .join(', ');
  throw new Error(
    `${context}: ${bad.length} linie/linii fără TVA ${RO_VAT_RATE}% ${RO_VAT_NAME} — ${detail}. ` +
      'Firma e plătitoare de TVA; documentul NU a fost emis.'
  );
}

export interface ZeroVatInvoice {
  seriesName: string;
  number: string;
  issueDate: string;
  total: string;
  clientName: string;
  /** Liniile care NU sunt la cota standard. */
  lines: { name: string; code: string; vatName: string; vatPercentage: string }[];
}

interface OblioListInvoice {
  seriesName: string;
  number: string;
  issueDate: string;
  total: string;
  canceled?: string;
  storno?: string;
  client?: { name?: string };
  products?: {
    name?: string;
    code?: string;
    vatName?: string;
    vatPercentage?: string | number;
  }[];
}

/**
 * Citește din Oblio facturile emise în ultimele `days` zile și returnează pe
 * cele care au măcar o linie în afara cotei standard.
 *
 * Verifică ce a înregistrat Oblio, nu ce i-am trimis — exact diferența care a
 * ținut bug-ul ascuns două luni.
 */
export async function auditIssuedInvoiceVat(days = 3): Promise<ZeroVatInvoice[]> {
  const { companyCif } = getOblioConfig();
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const found: ZeroVatInvoice[] = [];
  let offset = 0;

  // Paginare pe `offset` (NU `page` — Oblio ignoră `page` și ar returna la
  // nesfârșit prima pagină).
  for (let guard = 0; guard < 20; guard++) {
    const batch =
      (await oblioRequest<OblioListInvoice[] | null>({
        method: 'GET',
        endpoint:
          `/docs/invoice/list?cif=${encodeURIComponent(companyCif)}` +
          `&issuedAfter=${iso(start)}&issuedBefore=${iso(end)}` +
          `&withProducts=1&limit=100&offset=${offset}`,
      })) ?? [];

    for (const inv of batch) {
      // Un storno oglindește linia facturii pe care o anulează, inclusiv cota.
      // Stornarea unei facturi vechi cu 0% e corectă, nu o regresie.
      if (inv.canceled === '1' || inv.storno === '1') continue;
      const lines = (inv.products ?? [])
        .filter((p) => Number(p.vatPercentage) !== RO_VAT_RATE)
        .map((p) => ({
          name: p.name ?? '',
          code: p.code ?? '',
          vatName: p.vatName ?? '',
          vatPercentage: String(p.vatPercentage ?? ''),
        }));
      if (lines.length === 0) continue;
      found.push({
        seriesName: inv.seriesName,
        number: inv.number,
        issueDate: inv.issueDate,
        total: inv.total,
        clientName: inv.client?.name ?? '',
        lines,
      });
    }

    if (batch.length < 100) break;
    offset += 100;
  }

  return found;
}
