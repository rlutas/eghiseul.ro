/**
 * Navigation + indexing switch for certificat-constatator-express.ro (fourth
 * brand, 2026-11-11). One service, so no mega menu: the order button goes
 * straight to the wizard.
 */

/**
 * false until the live page is checked by hand (copy, prices, the wizard on
 * this host) and the similarity check against the eghiseul constatator pages
 * passes (content rule §1). Then true + sitemap + IndexNow.
 */
export const CONSTATATOR_INDEXABLE = true;

export const CONSTATATOR_ORDER_HREF = '/comanda/certificat-constatator/';
export const CONSTATATOR_TRACK_HREF = '/comanda/status/';

export const CONSTATATOR_NAV = [
  { label: 'Cum funcționează', href: '/#cum-functioneaza' },
  { label: 'Tipuri și prețuri', href: '/#preturi' },
  { label: 'Întrebări', href: '/#intrebari' },
  { label: 'Despre', href: '/despre/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export interface ConstatatorGuideEntry {
  href: string;
  label: string;
  hint: string;
  updated: string;
  /**
   * false = written and reviewed, but not live yet: the page answers 404 in
   * production and the guide is left out of the menu, footer, hub, sitemap,
   * llms.txt and "Citește și". Content rule §2: at most one new guide per
   * week, so drafts wait here and go live by flipping this to true (and
   * setting `updated` to the publish date).
   */
  published: boolean;
  /** Planned publish date, for the weekly queue (docs/certificat-constatator/README.md). */
  planned?: string;
}

/**
 * Every guide, live or queued. Written 11.11.2026 and checked against the
 * ONRC pages, the 11-10-188 form, Ordin MJ 380/C/2024 and Legea 265/2022;
 * they go live one per week (docs/certificat-constatator/README.md, "Coada
 * de ghiduri").
 */
export const CONSTATATOR_ALL_GUIDES: ReadonlyArray<ConstatatorGuideEntry> = [
  {
    href: '/ghiduri/valabilitate-certificat-constatator/',
    label: 'Valabilitatea certificatului constatator',
    hint: 'Ce spune legea, de unde vin cele 30 de zile și când îți trebuie unul nou.',
    updated: '2026-11-18',
    published: false,
    planned: '2026-11-18',
  },
  {
    href: '/ghiduri/certificat-constatator-pfa-punct-de-lucru/',
    label: 'Certificat constatator pentru PFA și punct de lucru',
    hint: 'Cele două documente cu același nume și pe care ți-l cere instituția.',
    updated: '2026-11-25',
    published: false,
    planned: '2026-11-25',
  },
  {
    href: '/ghiduri/certificat-constatator-extins/',
    label: 'Certificat constatator „extins”',
    hint: 'Nu e un tip oficial. Ce conține certificatul și ce alte documente dă ONRC.',
    updated: '2026-12-02',
    published: false,
    planned: '2026-12-02',
  },
  {
    href: '/ghiduri/raport-istoric-onrc/',
    label: 'Raportul istoric ONRC',
    hint: 'Toate înregistrările unei firme, în ordine: ce conține, cât costă, cât durează.',
    updated: '2026-12-09',
    published: false,
    planned: '2026-12-09',
  },
  {
    href: '/ghiduri/certificat-constatator-licitatie-fonduri/',
    label: 'Certificat constatator pentru licitație și fonduri',
    hint: 'Ce scop bifezi, ce verifici în dosar și cât durează fiecare variantă.',
    updated: '2026-12-16',
    published: false,
    planned: '2026-12-16',
  },
];

/** Live guides only: the footer, /ghiduri/, the sitemap and "Citește și" read this list. */
export const CONSTATATOR_GUIDES = CONSTATATOR_ALL_GUIDES.filter((g) => g.published);

/**
 * Whether a guide page may render. Queued guides render in `next dev` so they
 * can be reviewed locally, and 404 everywhere else.
 */
export function constatatorGuideVisible(href: string): boolean {
  const g = CONSTATATOR_ALL_GUIDES.find((x) => x.href === href);
  if (!g) return false;
  return g.published || process.env.NODE_ENV === 'development';
}
