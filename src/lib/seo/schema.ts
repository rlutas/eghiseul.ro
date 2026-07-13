/**
 * Schema.org @graph builders.
 *
 * Use these in page.tsx files to produce canonical JSON-LD nodes.
 * Always wrap nodes in a single `@graph` array — Google prefers one
 * `<script type="application/ld+json">` per page with linked entities.
 *
 * Refs:
 * - https://developers.google.com/search/docs/appearance/structured-data
 * - https://schema.org/Service
 *
 * NOT included (deprecated by Google for non-gov/non-healthcare):
 * - FAQPage (rich results removed Aug 2023)
 * - HowTo (rich results removed Sept 2023)
 */

import { BASE_URL, ORGANIZATION } from './constants';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ServiceOfferInput {
  name: string;
  price: number;
  priceCurrency?: string;
  availability?: string;
  url?: string;
}

export interface ServiceSchemaInput {
  slug: string;
  name: string;
  description: string;
  serviceType?: string;
  offers: ServiceOfferInput[];
  aggregateRating?: { ratingValue: number; reviewCount: number };
  breadcrumb: BreadcrumbItem[];
  /**
   * Optional editorial review metadata — boosts E-E-A-T signal (Author/Reviewer)
   * for AI Overviews and Google quality raters. If provided, emits a WebPage
   * node with dateModified + reviewedBy linking to a Person node.
   */
  reviewedBy?: {
    name: string;
    jobTitle?: string;
    url?: string;
    organizationName?: string;
  };
  dateModified?: string; // ISO 8601 — e.g. '2026-05-20'
  datePublished?: string; // ISO 8601
}

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: ORGANIZATION.contactPoint.telephone,
      contactType: ORGANIZATION.contactPoint.contactType,
      areaServed: ORGANIZATION.contactPoint.areaServed,
      availableLanguage: ORGANIZATION.contactPoint.availableLanguage,
    },
    ...(ORGANIZATION.sameAs.length > 0 ? { sameAs: ORGANIZATION.sameAs } : {}),
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: ORGANIZATION.name,
    inLanguage: 'ro-RO',
    publisher: { '@id': `${BASE_URL}/#organization` },
  };
}

export function breadcrumbNode(items: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function serviceNode(input: ServiceSchemaInput) {
  const url = `${BASE_URL}/servicii/${input.slug}/`;
  return {
    '@type': 'Service',
    '@id': `${url}#service`,
    name: input.name,
    description: input.description,
    ...(input.serviceType ? { serviceType: input.serviceType } : {}),
    url,
    provider: { '@id': `${BASE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Romania' },
    offers: input.offers.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      price: o.price,
      priceCurrency: o.priceCurrency ?? 'RON',
      availability: o.availability ?? 'https://schema.org/InStock',
      ...(o.url ? { url: o.url } : { url }),
    })),
  };
}

/**
 * Product node carrying the aggregateRating. Google review snippets do NOT
 * support `Service` as parent type (GSC error: "Tip de obiect nevalid pentru
 * <parent_node>", 2026-07-13) — supported types are Product, LocalBusiness,
 * etc. LocalBusiness/Organization self-ratings are "self-serving" and also
 * invalid, so the rating lives on a Product describing the offered service.
 */
export function productNode(input: ServiceSchemaInput) {
  if (!input.aggregateRating) return null;
  const url = `${BASE_URL}/servicii/${input.slug}/`;
  const prices = input.offers.map((o) => o.price);
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: input.name,
    description: input.description,
    image: `${BASE_URL}/og/default.png`,
    url,
    brand: { '@id': `${BASE_URL}/#organization` },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      priceCurrency: input.offers[0]?.priceCurrency ?? 'RON',
      offerCount: input.offers.length,
      availability: 'https://schema.org/InStock',
      url,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: input.aggregateRating.ratingValue,
      reviewCount: input.aggregateRating.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
}

function personNode(input: NonNullable<ServiceSchemaInput['reviewedBy']>) {
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    '@type': 'Person',
    '@id': `${BASE_URL}/#person-${slug}`,
    name: input.name,
    ...(input.jobTitle ? { jobTitle: input.jobTitle } : {}),
    ...(input.url ? { url: input.url } : {}),
    ...(input.organizationName
      ? { worksFor: { '@type': 'Organization', name: input.organizationName } }
      : { worksFor: { '@id': `${BASE_URL}/#organization` } }),
  };
}

function webPageNode(input: ServiceSchemaInput) {
  const url = `${BASE_URL}/servicii/${input.slug}/`;
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: 'ro-RO',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    primaryImageOfPage: undefined, // can be added when OG image canonical
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    ...(input.reviewedBy
      ? {
          reviewedBy: {
            '@id': `${BASE_URL}/#person-${input.reviewedBy.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
          },
          lastReviewed: input.dateModified ?? input.datePublished,
        }
      : {}),
    breadcrumb: { '@id': `${url}#breadcrumb` },
    about: { '@id': `${url}#service` },
  };
}

/** Standalone Service page: returns the full @graph array. */
export function buildServicePageGraph(input: ServiceSchemaInput) {
  const graph: Record<string, unknown>[] = [
    organizationNode(),
    websiteNode(),
    { ...breadcrumbNode(input.breadcrumb), '@id': `${BASE_URL}/servicii/${input.slug}/#breadcrumb` },
    serviceNode(input),
  ];
  const product = productNode(input);
  if (product) {
    graph.push(product);
  }
  // Add WebPage node when we have editorial metadata to expose
  if (input.dateModified || input.datePublished || input.reviewedBy) {
    graph.push(webPageNode(input));
  }
  if (input.reviewedBy) {
    graph.push(personNode(input.reviewedBy));
  }
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export interface ArticleSchemaInput {
  slug: string;
  headline: string;
  description: string;
  datePublished: string; // ISO 8601
  dateModified?: string; // ISO 8601
  author?: { name: string; url?: string };
  image?: string;
  breadcrumb: BreadcrumbItem[];
}

export function articleNode(input: ArticleSchemaInput) {
  const url = `${BASE_URL}/${input.slug}/`;
  return {
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: input.headline,
    description: input.description,
    url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    ...(input.image ? { image: input.image } : {}),
    author: input.author
      ? {
          '@type': 'Person',
          name: input.author.name,
          ...(input.author.url ? { url: input.author.url } : {}),
        }
      : { '@id': `${BASE_URL}/#organization` },
    publisher: { '@id': `${BASE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export function buildArticlePageGraph(input: ArticleSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode(),
      breadcrumbNode(input.breadcrumb),
      articleNode(input),
    ],
  };
}
