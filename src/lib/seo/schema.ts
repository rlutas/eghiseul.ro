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
    ...(input.aggregateRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: input.aggregateRating.ratingValue,
            reviewCount: input.aggregateRating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

/** Standalone Service page: returns the full @graph array. */
export function buildServicePageGraph(input: ServiceSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organizationNode(),
      websiteNode(),
      breadcrumbNode(input.breadcrumb),
      serviceNode(input),
    ],
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
