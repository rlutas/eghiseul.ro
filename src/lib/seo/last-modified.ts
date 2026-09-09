/**
 * Data ultimei modificări per pagină hardcodată — pentru `<lastmod>` în sitemap.
 *
 * De ce există: sitemap-ul nu emitea `lastmod` pe niciun URL (audit 28.07.2026),
 * deci Google n-avea cum să prioritizeze recrawl-ul — problemă reală pe cele ~50
 * de pagini de oraș care stau neindexate. Datele EXISTAU deja, dar erau închise
 * în constanta `DATE_MODIFIED` din fiecare `page.tsx` și inaccesibile din
 * sitemap.
 *
 * ⚠️ NU pune aici data build-ului sau `new Date()` pentru pagini nemodificate:
 * un `lastmod` care se schimbă la fiecare deploy îl învață pe Google să
 * ignore complet semnalul.
 *
 * Sincronizare: testul `tests/unit/lib/seo/last-modified.test.ts` verifică la
 * fiecare rulare că fiecare intrare de aici corespunde cu `DATE_MODIFIED` din
 * pagina respectivă și că nicio pagină cu `DATE_MODIFIED` nu lipsește din
 * registru. Dacă schimbi data într-un articol, testul îți spune să o schimbi și
 * aici (CI cade altfel).
 *
 * Generat inițial din cele 48 de pagini existente, 28.07.2026.
 */
export const PAGE_LAST_MODIFIED: Record<string, string> = {
  'acte-necesare-casatorie': '2026-09-09',
  'acte-necesare-certificat-de-nastere': '2026-09-09',
  'amenda-rovinieta-2025-tarife-plata-online-ghid-complet': '2026-09-09',
  'cazier-fiscal-fara-spv': '2026-08-07',
  'ancpi-nu-functioneaza': '2026-08-21',
  'anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania': '2026-08-28',
  'cat-costa-cadastrul-si-intabularea': '2026-07-14',
  'cazier-si-certificat-de-integritate-pentru-profesori': '2026-07-29',
  'cazier-judiciar-vs-certificat-integritate-comportamentala': '2026-06-16',
  'cele-4-tipuri-de-certificat-constatator-online': '2026-08-28',
  'cum-aflam-numarul-carte-functionara-si-nr-cadastral': '2026-09-09',
  'cum-vor-arata-documentele-de-stare-civila-2025': '2026-09-09',
  'eliberare-certificat-constatator-onrc-ghid': '2026-06-16',
  'extras-carte-funciara-gratuit': '2026-07-13',
  'ghid-complet-certificat-de-integritate-comportamentala': '2026-09-09',
  'informatii-cazier-auto-online': '2026-09-09',
  'rolul-si-atributiile-onrc-romania': '2026-08-24',
  'schimbare-certificat-de-nastere-vechi': '2026-06-19',
  'sms-fals-amenda-ghiseul-ro': '2026-08-28',
  'tabel-varsta-pensionare-anticipata-femei': '2026-06-16',
  'taxa-cazier-judiciar': '2026-08-24',
  'totul-despre-cartea-funciara-colectiva': '2026-08-24',
  'tva-9-locuinte-31-iulie-2026': '2026-09-09',
  'valabilitate-extras-de-carte-funciara': '2026-06-16',
  'verificare-proprietar-imobil': '2026-08-28',
};

/** Data de modificare pentru un slug de pagină, ca `Date` — sau undefined. */
export function pageLastModified(slug: string): Date | undefined {
  const iso = PAGE_LAST_MODIFIED[slug];
  return iso ? new Date(iso) : undefined;
}
