/**
 * Homepage JSON-LD @graph — site-wide entity signals on the canonical root URL:
 * Organization, WebSite, WebPage, ItemList (featured services), FAQPage.
 *
 * Note: no SearchAction is declared — we don't have a working `?q=` search
 * endpoint, and declaring a non-functional SearchAction is invalid.
 */

import { BASE_URL, ORGANIZATION, serviceUrl } from './constants';

interface HomepageFaq {
  question: string;
  answer: string;
}

const FEATURED_SERVICES: [name: string, slug: string][] = [
  ['Cazier judiciar online', 'cazier-judiciar'],
  ['Cazier fiscal online', 'cazier-fiscal'],
  ['Certificat constatator online', 'certificat-constatator'],
  ['Extras de carte funciară', 'extras-carte-funciara'],
  ['Certificat de integritate comportamentală', 'certificat-integritate'],
  ['Cazier auto online', 'cazier-auto'],
];

export function buildHomepageGraph(faqs: HomepageFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: ORGANIZATION.name,
        legalName: ORGANIZATION.legalName,
        url: `${BASE_URL}/`,
        logo: { '@type': 'ImageObject', url: ORGANIZATION.logo },
        image: `${BASE_URL}/og/default.png`,
        description:
          'Platformă online pentru obținerea de documente oficiale în România: cazier judiciar, ' +
          'cazier fiscal, certificat constatator, extras de carte funciară și altele. Rapid, legal, fără cozi.',
        vatID: ORGANIZATION.cui,
        taxID: ORGANIZATION.cui,
        identifier: ORGANIZATION.regCom,
        address: {
          '@type': 'PostalAddress',
          streetAddress: ORGANIZATION.address.street,
          addressLocality: ORGANIZATION.address.locality,
          addressRegion: ORGANIZATION.address.region,
          addressCountry: ORGANIZATION.address.country,
        },
        sameAs: ORGANIZATION.sameAs,
        areaServed: { '@type': 'Country', name: 'Romania' },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: ORGANIZATION.contactPoint.telephone,
          email: ORGANIZATION.contactPoint.email,
          contactType: 'customer service',
          areaServed: 'RO',
          availableLanguage: ['Romanian', 'English'],
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: 4.9,
          reviewCount: 450,
          bestRating: 5,
          worstRating: 1,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: `${BASE_URL}/`,
        name: ORGANIZATION.name,
        inLanguage: 'ro-RO',
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/#webpage`,
        url: `${BASE_URL}/`,
        name: 'Cazier Judiciar, Cazier Fiscal & Documente Oficiale Online — eGhiseul.ro',
        inLanguage: 'ro-RO',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${BASE_URL}/#organization` },
        primaryImageOfPage: `${BASE_URL}/og/default.png`,
      },
      {
        '@type': 'ItemList',
        '@id': `${BASE_URL}/#servicii`,
        name: 'Servicii eGhișeul.ro',
        itemListElement: FEATURED_SERVICES.map(([name, slug], i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name,
          url: `${BASE_URL}${serviceUrl(slug)}`,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${BASE_URL}/#faq`,
        isPartOf: { '@id': `${BASE_URL}/#webpage` },
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      },
    ],
  };
}
