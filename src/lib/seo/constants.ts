/**
 * SEO Constants — single source of truth pentru URL-uri canonice.
 *
 * `HARDCODED_SERVICE_SLUGS` = URL-urile WP păstrate literal în Next.js sub
 * `src/app/servicii/[slug]/` ca foldere cu pagini hand-tuned (Schema rich,
 * conținut 3000+ cuvinte, FAQ ample, internal linking).
 *
 * Adaugă aici slug-ul WP **înainte** să faci `src/app/servicii/[slug]/page.tsx`.
 * Sitemap-ul se regenerează automat din această listă.
 *
 * Sursa: GSC export 2026-05-20 (pagini cu > 100 click-uri / 16 luni).
 */

export const BASE_URL = 'https://eghiseul.ro';

/** Service pages with hand-tuned SEO content (folder per WP URL). */
export const HARDCODED_SERVICE_SLUGS = [
  'cazier-judiciar-online',
  'cazier-fiscal-online',
  'cazier-auto-online',
  'verificare-rovinieta-online',
  'eliberare-certificat-de-nastere',
  'eliberare-certificat-de-casatorie',
  'eliberare-certificat-de-celibat',
  'extras-de-carte-funciara',
  'identificare-imobil',
  'extras-plan-cadastral',
  'certificat-constatator-online',
  'certificat-de-integritate-comportamentala',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie',
] as const;

export type HardcodedServiceSlug = (typeof HARDCODED_SERVICE_SLUGS)[number];

/**
 * Hand-tuned sub-route pages that live UNDER a hardcoded service folder
 * (not their own top-level WP slug). Paths are relative to BASE_URL, no
 * leading/trailing slash. These must be listed in the sitemap explicitly
 * because they are not covered by HARDCODED_SERVICE_SLUGS.
 */
export const HARDCODED_SERVICE_SUBROUTE_PATHS = [
  'servicii/cazier-judiciar-online/persoana-fizica',
  'servicii/cazier-judiciar-online/persoana-juridica',
] as const;

/**
 * DB slugs that are 301-redirected to a hardcoded SEO URL (see next.config.ts).
 * Exclude these from the dynamic /servicii/[slug] sitemap fallback so we never
 * emit a redirecting URL into the sitemap.
 */
export const DB_SLUGS_WITH_HARDCODED_PAGE = [
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'extras-carte-funciara',
  'cazier-fiscal',
  'cazier-auto',
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'certificat-constatator',
  'certificat-integritate',
] as const;

/**
 * DB service slug -> canonical on-site URL. Services with a hand-tuned hardcoded
 * page resolve to that page; everything else resolves to the dynamic
 * /servicii/[slug]/ route. ALWAYS use `serviceUrl()` for internal links so we
 * never point at a slug that 301-redirects (which would dilute link equity).
 */
const SERVICE_URL_OVERRIDES: Record<string, string> = {
  'cazier-judiciar': '/servicii/cazier-judiciar-online/',
  'cazier-judiciar-persoana-fizica': '/servicii/cazier-judiciar-online/persoana-fizica/',
  'cazier-judiciar-persoana-juridica': '/servicii/cazier-judiciar-online/persoana-juridica/',
  // WP slug parity: hardcoded SEO pages live at the indexed WP URLs (traffic + backlinks)
  'extras-carte-funciara': '/servicii/extras-de-carte-funciara/',
  'cazier-fiscal': '/servicii/cazier-fiscal-online/',
  'cazier-auto': '/servicii/cazier-auto-online/',
  'certificat-nastere': '/servicii/eliberare-certificat-de-nastere/',
  'certificat-casatorie': '/servicii/eliberare-certificat-de-casatorie/',
  'certificat-celibat': '/servicii/eliberare-certificat-de-celibat/',
  'certificat-constatator': '/servicii/certificat-constatator-online/',
  'certificat-integritate': '/servicii/certificat-de-integritate-comportamentala/',
};

/** Canonical on-site URL for a service, given its DB slug. */
export function serviceUrl(slug: string): string {
  return SERVICE_URL_OVERRIDES[slug] ?? `/servicii/${slug}/`;
}

/** Calculator pages (ported from WP /calculator/*). */
export const HARDCODED_CALCULATOR_SLUGS = [
  'calculator-impozit-auto',
  'varsta-pensionare',
  'salariu',
  'pensie-invaliditate',
  'calculator-indemnizatie-crestere-copil',
  'tva',
  'termene-judiciare',
  'calculator-procente',
  'reabilitare',
  'taxa-judiciara-de-timbru',
] as const;

/** Tools pages (ported from WP /tools/*). */
export const HARDCODED_TOOL_SLUGS = [
  'verificare-rovinieta-online',
] as const;

/**
 * Blog articles at WP root path (no /articole/ prefix — preserves backlinks).
 */
export const HARDCODED_ARTICLE_SLUGS = [
  'tabel-varsta-pensionare-anticipata-femei',
  'cum-aflam-numarul-carte-functionara-si-nr-cadastral',
  'anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania',
  'ghid-complet-certificat-de-integritate-comportamentala',
  'informatii-cazier-auto-online',
  'amenda-rovinieta-2025-tarife-plata-online-ghid-complet',
  'cum-vor-arata-documentele-de-stare-civila-2025',
  'taxa-cazier-judiciar',
  'eliberare-certificat-constatator-onrc-ghid',
  'valabilitate-extras-de-carte-funciara',
  'cele-4-tipuri-de-certificat-constatator-online',
  'totul-despre-cartea-funciara-colectiva',
  'cazier-judiciar-vs-certificat-integritate-comportamentala',
  'importanta-extras-de-carte-funciara-colectiva',
  'extras-de-carte-funciara-pentru-casa-verde',
] as const;

/** Organization-wide metadata for Schema.org Organization node. */
export const ORGANIZATION = {
  name: 'eGhișeul.ro',
  legalName: 'RapidCert SRL',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  contactPoint: {
    telephone: '+40-770-194-101',
    contactType: 'customer service',
    areaServed: 'RO',
    availableLanguage: ['Romanian', 'English'],
  },
  sameAs: [
    // populate when available
  ],
} as const;
