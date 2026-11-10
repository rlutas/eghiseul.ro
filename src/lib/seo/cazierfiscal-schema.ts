/**
 * JSON-LD for cazierfiscal.com, copied from documentero-schema.ts with the
 * brand swapped. Same company (ORGANIZATION), `parentOrganization` eghiseul.ro.
 * No aggregateRating, no invented authors (content rules §3), and no new
 * FAQPage: Google retired FAQ rich results on 07.05.2026, so callers do not
 * pass `faq`.
 */
import { BRANDS } from '@/lib/brand/brands';
import { BASE_URL, ORGANIZATION } from './constants';
import { authorNode, authorSchemaId, SITE_AUTHOR } from './author';

const brand = BRANDS.cazierfiscal;
const BASE = brand.baseUrl;

export function cazierFiscalOrganizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${BASE}/#organization`,
    name: brand.name,
    legalName: ORGANIZATION.legalName,
    url: BASE,
    logo: `${BASE}${brand.ogDefault}`,
    parentOrganization: { '@type': 'Organization', '@id': `${BASE_URL}/#organization`, name: ORGANIZATION.name, url: BASE_URL },
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORGANIZATION.address.street,
      addressLocality: ORGANIZATION.address.locality,
      addressRegion: ORGANIZATION.address.region,
      addressCountry: ORGANIZATION.address.country,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: ORGANIZATION.contactPoint.telephone,
      email: brand.contactEmail,
      contactType: 'customer service',
      areaServed: 'RO',
      availableLanguage: ['Romanian', 'English'],
    },
    sameAs: [BASE_URL, ...ORGANIZATION.sameAs],
  };
}

export function cazierFiscalWebsiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    url: BASE,
    name: brand.name,
    inLanguage: 'ro-RO',
    publisher: { '@id': `${BASE}/#organization` },
  };
}

export function cazierFiscalBreadcrumb(items: Array<{ name: string; path: string }>, pagePath: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${BASE}${pagePath}#breadcrumb`,
    itemListElement: items.map((it, idx) => ({ '@type': 'ListItem', position: idx + 1, name: it.name, item: `${BASE}${it.path}` })),
  };
}

export interface CazierFiscalServiceInput {
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

export function cazierFiscalServiceGraph(input: CazierFiscalServiceInput) {
  const url = `${BASE}${input.path}`;
  const prices = input.offers.map((o) => o.price);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      cazierFiscalOrganizationNode(),
      cazierFiscalWebsiteNode(),
      cazierFiscalBreadcrumb(input.breadcrumb, input.path),
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
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          priceCurrency: 'RON',
          offerCount: input.offers.length,
          url,
        },
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

export function cazierFiscalArticleGraph(input: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  breadcrumb: Array<{ name: string; path: string }>;
  /** Only when the same questions are rendered on the page (FaqList). */
  faq?: Array<{ q: string; a: string }>;
}) {
  const url = `${BASE}${input.path}`;
  const author = { name: SITE_AUTHOR.name, url: SITE_AUTHOR.url };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      cazierFiscalOrganizationNode(),
      cazierFiscalWebsiteNode(),
      cazierFiscalBreadcrumb(input.breadcrumb, input.path),
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: input.headline,
        description: input.description,
        url,
        datePublished: input.datePublished,
        dateModified: input.dateModified,
        ...(input.image ? { image: `${BASE}${input.image}` } : {}),
        author: { '@id': authorSchemaId(author) },
        publisher: { '@id': `${BASE}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        inLanguage: 'ro-RO',
      },
      authorNode(author),
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

export function cazierFiscalHomeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      cazierFiscalOrganizationNode(),
      cazierFiscalWebsiteNode(),
      {
        '@type': 'WebPage',
        '@id': `${BASE}/#webpage`,
        url: `${BASE}/`,
        name: 'cazierfiscal.com — cazier fiscal prin avocat, fără SPV',
        inLanguage: 'ro-RO',
        isPartOf: { '@id': `${BASE}/#website` },
      },
    ],
  };
}
