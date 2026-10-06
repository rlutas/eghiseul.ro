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
  'cazier-fiscal-fara-spv': '2026-09-09',
  'ancpi-nu-functioneaza': '2026-08-21',
  'anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania': '2026-08-28',
  'cat-costa-cadastrul-si-intabularea': '2026-09-09',
  'cazier-si-certificat-de-integritate-pentru-profesori': '2026-07-29',
  'cazier-judiciar-vs-certificat-integritate-comportamentala': '2026-06-16',
  'cele-4-tipuri-de-certificat-constatator-online': '2026-08-28',
  'cum-aflam-numarul-carte-functionara-si-nr-cadastral': '2026-09-09',
  'cum-vor-arata-documentele-de-stare-civila-2025': '2026-09-09',
  'eliberare-certificat-constatator-onrc-ghid': '2026-09-09',
  'extras-carte-funciara-gratuit': '2026-07-13',
  'ghid-complet-certificat-de-integritate-comportamentala': '2026-09-09',
  'informatii-cazier-auto-online': '2026-09-09',
  'rolul-si-atributiile-onrc-romania': '2026-09-09',
  'schimbare-certificat-de-nastere-vechi': '2026-09-25',
  'sms-fals-amenda-ghiseul-ro': '2026-08-28',
  'tabel-varsta-pensionare-anticipata-femei': '2026-06-16',
  'plan-de-amplasament-si-delimitare-copie-sau-intocmire': '2026-10-06',
  'taxa-cazier-judiciar': '2026-08-24',
  'totul-despre-cartea-funciara-colectiva': '2026-08-24',
  'tva-9-locuinte-31-iulie-2026': '2026-09-09',
  'valabilitate-extras-de-carte-funciara': '2026-06-16',
  'verificare-proprietar-imobil': '2026-08-28',
};

/**
 * Data ultimei modificări reale pentru paginile din sitemap care NU sunt
 * articole: pagini statice, servicii, sub-rute, calculatoare, tool-uri.
 *
 * Generat pe 06.10.2026 din istoricul git al fiecărui `page.tsx`
 * (`git log --follow`), sărind commit-urile care doar au MUTAT fișierul
 * (mutarea în grupul `(eghiseul)` din 19.09 nu schimbă conținutul). Paginile
 * de serviciu cu casetă „Pe scurt” au 2026-10-06, aceeași dată ca „Actualizat
 * la” din pagină.
 *
 * Când schimbi conținutul unei pagini de aici, actualizează-i și data. Testul
 * `tests/unit/lib/seo/sitemap-lastmod.test.ts` cere ca fiecare URL din sitemap
 * să aibă o dată și ca nicio dată să nu fie din viitor sau data build-ului.
 */
export const PATH_LAST_MODIFIED: Record<string, string> = {
  '/': '2026-09-09',
  '/servicii/': '2026-09-17',
  '/calculator/': '2026-07-14',
  '/tools/': '2026-06-23',
  '/blog/': '2026-08-07',
  '/despre-noi/': '2026-09-09',
  '/despre-noi/raul-lutas/': '2026-09-09',
  '/curs-valutar/': '2026-06-22',
  '/contact/': '2026-09-09',
  '/termeni-si-conditii/': '2026-09-09',
  '/politica-de-confidentialitate/': '2026-09-17',
  '/gdpr/': '2026-06-27',
  '/politica-cookies/': '2026-09-09',
  '/politica-de-anulare/': '2026-07-15',
  '/servicii/cazier-judiciar-online/': '2026-10-06',
  '/servicii/cazier-fiscal-online/': '2026-10-06',
  '/servicii/cazier-auto-online/': '2026-09-29',
  '/servicii/rovinieta-online/': '2026-09-09',
  '/servicii/eliberare-certificat-de-nastere/': '2026-10-06',
  '/servicii/eliberare-certificat-de-casatorie/': '2026-10-06',
  '/servicii/eliberare-certificat-de-celibat/': '2026-10-06',
  '/servicii/extras-de-carte-funciara/': '2026-10-06',
  '/servicii/identificare-imobil/': '2026-09-25',
  '/servicii/extras-plan-cadastral/': '2026-09-09',
  '/servicii/certificat-constatator-online/': '2026-10-06',
  '/servicii/certificat-de-integritate-comportamentala/': '2026-09-09',
  '/servicii/extras-multilingv-certificat-nastere/': '2026-10-06',
  '/servicii/extras-multilingv-certificat-casatorie/': '2026-10-06',
  '/servicii/certificat-urbanism-informare/': '2026-09-09',
  '/servicii/certificat-sarcini/': '2026-09-09',
  '/servicii/copie-carte-funciara/': '2026-09-09',
  '/servicii/copie-plan-cadastral/': '2026-09-09',
  '/servicii/copie-inventar-coordonate/': '2026-09-09',
  '/servicii/copie-intabulare/': '2026-09-09',
  '/servicii/copie-releveu/': '2026-09-09',
  '/servicii/copie-arhiva-ocpi/': '2026-09-09',
  '/servicii/copie-contract-vanzare/': '2026-09-09',
  '/servicii/plan-amplasament-delimitare/': '2026-10-06',
  '/servicii/copie-plan-incadrare/': '2026-09-09',
  '/servicii/extras-cf-colectiv/': '2026-09-09',
  '/servicii/actualizare-adresa-cf/': '2026-09-09',
  '/servicii/identificare-imobile-proprietar/': '2026-09-25',
  '/servicii/certificat-detineri-imobile/': '2026-09-09',
  '/servicii/cazier-judiciar-online/persoana-fizica/': '2026-09-09',
  '/servicii/cazier-judiciar-online/persoana-juridica/': '2026-09-09',
  '/calculator/calculator-impozit-auto/': '2026-06-22',
  '/calculator/salariu/': '2026-09-09',
  '/calculator/amenda-circulatie/': '2026-06-22',
  '/calculator/concediu-medical/': '2026-06-22',
  '/calculator/contributii-pfa/': '2026-06-22',
  '/calculator/calculator-indemnizatie-crestere-copil/': '2026-09-09',
  '/calculator/vechime-in-munca/': '2026-06-22',
  '/calculator/zile-concediu-odihna/': '2026-06-22',
  '/calculator/indemnizatie-somaj/': '2026-06-22',
  '/calculator/impozit-chirie/': '2026-06-22',
  '/calculator/penalitati-anaf/': '2026-06-22',
  '/calculator/tva/': '2026-06-22',
  '/calculator/taxa-judiciara-de-timbru/': '2026-06-22',
  '/calculator/reabilitare/': '2026-10-06',
  '/calculator/calculator-procente/': '2026-09-09',
  '/calculator/taxe-notariale/': '2026-06-22',
  '/calculator/pensie-alimentara/': '2026-06-22',
  '/calculator/termene-judiciare/': '2026-09-09',
  '/calculator/dividende/': '2026-06-22',
  '/calculator/taxe-srl/': '2026-06-22',
  '/calculator/rambursare-anticipata/': '2026-06-22',
  '/calculator/impozit-pensie/': '2026-06-22',
  '/calculator/inflatie/': '2026-06-22',
  '/calculator/diurna/': '2026-06-22',
  '/calculator/impozit-casa/': '2026-06-22',
  '/calculator/credit-ipotecar/': '2026-06-22',
  '/calculator/zile-lucratoare/': '2026-06-22',
  '/calculator/calculator-data/': '2026-06-22',
  '/calculator/concediu-maternitate/': '2026-06-22',
  '/calculator/dobanda-legala/': '2026-06-22',
  '/calculator/grad-indatorare/': '2026-09-09',
  '/calculator/concediu-paternal/': '2026-06-22',
  '/calculator/spor-salarial/': '2026-06-22',
  '/calculator/varsta-pensionare/': '2026-06-22',
  '/calculator/estimare-pensie/': '2026-06-22',
  '/calculator/pensie-invaliditate/': '2026-06-22',
  '/calculator/jugar-stanjen-in-mp/': '2026-09-09',
  '/calculator/cat-pot-construi/': '2026-09-09',
  '/calculator/valabilitate-documente/': '2026-09-09',
  '/calculator/cost-cadastru-intabulare/': '2026-09-25',
  '/tools/verificare-rovinieta-online/': '2026-09-09',
};

/** Data de modificare pentru o cale publică (`/servicii/x/`), ca `Date` — sau undefined. */
export function pathLastModified(path: string): Date | undefined {
  const iso = PATH_LAST_MODIFIED[path];
  return iso ? new Date(iso) : undefined;
}

/** Data de modificare pentru un slug de pagină, ca `Date` — sau undefined. */
export function pageLastModified(slug: string): Date | undefined {
  const iso = PAGE_LAST_MODIFIED[slug];
  return iso ? new Date(iso) : undefined;
}
