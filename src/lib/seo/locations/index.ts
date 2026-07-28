/**
 * Location SEO engine — barrel + getters + schema builder.
 *
 * Vezi types.ts (model de date), quality.ts (contract anti-thin), cities.ts
 * (datele reale per oraș). Schema per pagină = Organization + WebSite +
 * BreadcrumbList + Service(areaServed: City) — FĂRĂ LocalBusiness (n-avem birou
 * fizic) și fără FAQPage (convenția proiectului, vezi schema.ts).
 */
import { BASE_URL } from '../constants';
import { organizationNode, websiteNode, breadcrumbNode, type BreadcrumbItem } from '../schema';
import { CITIES } from './cities';
import type { CityData } from './types';

export * from './types';
export { assertLocationPageQuality, assertAllCities } from './quality';
export { CITIES };

export function getCity(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function allCitySlugs(): string[] {
  return CITIES.map((c) => c.slug);
}

/**
 * Orașele care merită să rămână indexabile.
 *
 * Măsurat pe 28.07.2026 cu Search Console API (`gsc_inspect.py` pe toate cele
 * 48 de pagini): doar 8 sunt indexate, 22 „Discovered — currently not indexed",
 * 18 „URL is unknown to Google" (necrawlate niciodată, inclusiv Bucureștiul).
 * Corelație perfectă: exact cele 8 indexate sunt și singurele cu afișări în GSC.
 *
 * Cauza: paginile au 1650-1770 de cuvinte și diferă între ele prin 1-2
 * paragrafe — Google le tratează ca doorway pages și refuză să le indexeze.
 * Contra-exemplu în același site: paginile de județ pentru extras CF au ~1130-1340
 * de cuvinte (deci MAI PUȚIN text) și sunt indexate 94%, fiindcă un județ are
 * date proprii reale (birou OCPI, tarife, termene).
 *
 * Cele 40 fără indexare primesc `noindex, follow`: rămân accesibile omului și
 * pasează link equity, dar nu mai diluează percepția de calitate a domeniului cu
 * conținut cvasi-duplicat pe care Google l-a refuzat deja.
 *
 * ⚠️ Ca să promovezi un oraș aici: dă-i date locale REALE (adresa și programul
 * IPJ-ului, termen efectiv în județ, particularități), nu variații de text.
 * Apoi verifică indexarea cu:
 *   ~/.claude/skills/seo/bin/claude-seo run gsc_inspect.py <url>
 * Vezi docs/seo/audit-2026-07-28/findings/technical.md §2.3.
 */
export const INDEXABLE_CITY_SLUGS: readonly string[] = [
  'cluj-napoca',
  'timisoara',
  'iasi',
  'constanta',
  'ramnicu-valcea',
  'focsani',
  'piatra-neamt',
  'satu-mare',
];

/** True când pagina orașului trebuie să rămână indexabilă (vezi lista de mai sus). */
export function isCityIndexable(slug: string): boolean {
  return INDEXABLE_CITY_SLUGS.includes(slug);
}

export function nearbyCities(slug: string): CityData[] {
  const city = getCity(slug);
  if (!city) return [];
  return city.nearbyCitySlugs.map(getCity).filter((c): c is CityData => Boolean(c));
}

export interface LocationGraphInput {
  /** Numele serviciului localizat, ex. "Cazier Judiciar Online Cluj-Napoca". */
  serviceName: string;
  description: string;
  /** Calea paginii, ex. "/servicii/cazier-judiciar-online/cluj-napoca/". */
  path: string;
  cityName: string;
  price: number;
  breadcrumb: BreadcrumbItem[];
}

/** @graph pentru o pagină de locație: Org + WebSite + Breadcrumb + Service(City). */
export function buildLocationPageGraph(input: LocationGraphInput) {
  const url = `${BASE_URL}${input.path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode(),
      { ...breadcrumbNode(input.breadcrumb), '@id': `${url}#breadcrumb` },
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: input.serviceName,
        description: input.description,
        url,
        provider: { '@id': `${BASE_URL}/#organization` },
        areaServed: { '@type': 'City', name: input.cityName },
        offers: {
          '@type': 'Offer',
          price: input.price,
          priceCurrency: 'RON',
          availability: 'https://schema.org/InStock',
          url,
        },
      },
    ],
  };
}
