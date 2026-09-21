/**
 * JSON-LD for documentero.ro. Same company (ORGANIZATION), other brand:
 * `Organization` node named documentero.ro with `parentOrganization` eghiseul.ro,
 * a `WebSite` node, and Service/Product/Article graphs anchored on the
 * documentero base URL. No aggregateRating, no invented authors
 * (.claude/rules/content-and-seo.md §3).
 */
import { BRANDS } from '@/lib/brand/brands';
import { BASE_URL, ORGANIZATION } from './constants';
import { authorNode, authorSchemaId, SITE_AUTHOR } from './author';

const brand = BRANDS.documentero;
const BASE = brand.baseUrl;

export function documenteroOrganizationNode() {
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

export function documenteroWebsiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE}/#website`,
    url: BASE,
    name: brand.name,
    inLanguage: 'ro-RO',
    publisher: { '@id': `${BASE}/#organization` },
  };
}

export function documenteroBreadcrumb(items: Array<{ name: string; path: string }>, pagePath: string) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${BASE}${pagePath}#breadcrumb`,
    itemListElement: items.map((it, idx) => ({ '@type': 'ListItem', position: idx + 1, name: it.name, item: `${BASE}${it.path}` })),
  };
}

export interface DocumenteroServiceInput {
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

export function documenteroServiceGraph(input: DocumenteroServiceInput) {
  const url = `${BASE}${input.path}`;
  const prices = input.offers.map((o) => o.price);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      documenteroOrganizationNode(),
      documenteroWebsiteNode(),
      documenteroBreadcrumb(input.breadcrumb, input.path),
      {
        '@type': 'Service',
        '@id': `${url}#service`,
        name: input.name,
        description: input.description,
        serviceType: input.serviceType,
        url,
        provider: { '@id': `${BASE}/#organization` },
        areaServed: { '@type': 'Country', name: 'România' },
      },
      {
        '@type': 'Product',
        '@id': `${url}#product`,
        name: input.name,
        description: input.description,
        image: `${BASE}${brand.ogDefault}`,
        url,
        brand: { '@type': 'Brand', name: brand.name },
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          priceCurrency: 'RON',
          offerCount: input.offers.length,
          availability: 'https://schema.org/InStock',
          url,
          hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', applicableCountry: 'RO', returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted' },
          shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'RON' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'RO' } },
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

export function documenteroArticleGraph(input: {
  path: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  image?: string;
  breadcrumb: Array<{ name: string; path: string }>;
}) {
  const url = `${BASE}${input.path}`;
  const author = { name: SITE_AUTHOR.name, url: SITE_AUTHOR.url };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      documenteroOrganizationNode(),
      documenteroWebsiteNode(),
      documenteroBreadcrumb(input.breadcrumb, input.path),
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
    ],
  };
}

export function documenteroHomeGraph(faq: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      documenteroOrganizationNode(),
      documenteroWebsiteNode(),
      {
        '@type': 'WebPage',
        '@id': `${BASE}/#webpage`,
        url: `${BASE}/`,
        name: 'documentero.ro — acte de stare civilă prin avocat, livrate acasă',
        inLanguage: 'ro-RO',
        isPartOf: { '@id': `${BASE}/#website` },
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE}/#faq`,
        mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
}
