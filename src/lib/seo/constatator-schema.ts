/**
 * JSON-LD for certificat-constatator-express.ro, copied from the cazierfiscal
 * schema with the brand swapped. No legalName, address, parentOrganization or
 * sameAs: the company data lives only in the legal pages, and the site stands
 * as its own brand (same decision as cazierfiscal, 10–11.11.2026).
 * No aggregateRating, no invented authors (content rules §3), and no new
 * FAQPage: Google retired FAQ rich results on 07.05.2026, so callers do not
 * pass `faq`.
 */
import { BRANDS } from '@/lib/brand/brands';

const brand = BRANDS.constatator;
const BASE = brand.baseUrl;

export function constatatorOrganizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${BASE}/#organization`,
    name: brand.name,
    url: BASE,
    logo: `${BASE}${brand.ogDefault}`,
    contactPoint: {
      '@type': 'ContactPoint',
      url: `${BASE}/contact/`,
      contactType: 'customer service',
      areaServed: 'RO',
      availableLanguage: ['Romanian', 'English'],
    },
  };
}

export function constatatorWebsiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    url: BASE,
    name: brand.name,
    inLanguage: 'ro-RO',
    publisher: { '@id': `${BASE}/#organization` },
  };
}

export function constatatorBreadcrumb(items: Array<{ name: string; path: string }>, pagePath: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${BASE}${pagePath}#breadcrumb`,
    itemListElement: items.map((it, idx) => ({ '@type': 'ListItem', position: idx + 1, name: it.name, item: `${BASE}${it.path}` })),
  };
}

export interface ConstatatorServiceInput {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  offers: Array<{ name: string; price: number }>;
  datePublished: string;
  dateModified: string;
  breadcrumb: Array<{ name: string; path: string }>;
  /** Questions that are visible on the page (FAQPage is emitted only then). */
  faq?: Array<{ q: string; a: string }>;
}

export function constatatorServiceGraph(input: ConstatatorServiceInput) {
  const url = `${BASE}${input.path}`;
  const prices = input.offers.map((o) => o.price);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      constatatorOrganizationNode(),
      constatatorWebsiteNode(),
      constatatorBreadcrumb(input.breadcrumb, input.path),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: input.name,
        description: input.description,
        serviceType: input.serviceType,
        url,
        provider: { '@id': `${BASE}/#organization` },
        areaServed: { '@type': 'Country', name: 'România' },
        // Service + Offer only (02.11.2026): the Product node carried a false
        // free-shipping detail and pulled the page into Merchant listings.
        offers:
          input.offers.length === 1
            ? { '@type': 'Offer', name: input.offers[0].name, price: input.offers[0].price, priceCurrency: 'RON', availability: 'https://schema.org/InStock', url: `${BASE}/comanda/certificat-constatator/` }
            : { '@type': 'AggregateOffer', lowPrice: Math.min(...prices), highPrice: Math.max(...prices), priceCurrency: 'RON', offerCount: input.offers.length, url },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: input.name,
        description: input.description,
        inLanguage: 'ro-RO',
        datePublished: input.datePublished,
        dateModified: input.dateModified,
        isPartOf: { '@id': `${BASE}/#website` },
        breadcrumb: { '@id': `${url}#breadcrumb` },
        about: { '@id': `${url}#service` },
      },
      ...(input.faq && input.faq.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              mainEntity: input.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
            },
          ]
        : []),
    ],
  };
}

export function constatatorArticleGraph(input: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  breadcrumb: Array<{ name: string; path: string }>;
  /** Only when the same questions are rendered on the page (FaqList). */
  faq?: Array<{ q: string; a: string }>;
  /** The "Surse oficiale" list shown under the guide: [label, url]. */
  citations?: ReadonlyArray<readonly [string, string]>;
}) {
  const url = `${BASE}${input.path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      constatatorOrganizationNode(),
      constatatorWebsiteNode(),
      constatatorBreadcrumb(input.breadcrumb, input.path),
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: input.headline,
        description: input.description,
        url,
        datePublished: input.datePublished,
        dateModified: input.dateModified,
        ...(input.image ? { image: `${BASE}${input.image}` } : {}),
        // Author = the brand, not SITE_AUTHOR: that person's page lives on
        // eghiseul.ro, and this brand is kept separate (10.11.2026).
        author: { '@id': `${BASE}/#organization` },
        publisher: { '@id': `${BASE}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: 'ro-RO',
        ...(input.citations && input.citations.length > 0
          ? { citation: input.citations.map(([name, href]) => ({ '@type': 'CreativeWork', name, url: href })) }
          : {}),
      },
      ...(input.faq && input.faq.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `${url}#faq`,
              mainEntity: input.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
            },
          ]
        : []),
    ],
  };
}

export function constatatorHomeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      constatatorOrganizationNode(),
      constatatorWebsiteNode(),
      {
        '@type': 'WebPage',
        '@id': `${BASE}/#webpage`,
        url: `${BASE}/`,
        name: 'Certificat constatator online',
        inLanguage: 'ro-RO',
        isPartOf: { '@id': `${BASE}/#website` },
      },
    ],
  };
}
