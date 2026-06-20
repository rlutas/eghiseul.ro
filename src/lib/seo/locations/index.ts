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
