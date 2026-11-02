import { describe, it, expect } from 'vitest';
import {
  buildServicePageGraph,
  buildArticlePageGraph,
  breadcrumbNode,
  organizationNode,
  serviceNode,
  articleNode,
} from '@/lib/seo/schema';
import { BASE_URL } from '@/lib/seo/constants';

describe('organizationNode', () => {
  it('produces a fully linked Organization with stable @id', () => {
    const node = organizationNode();
    expect(node['@type']).toBe('Organization');
    expect(node['@id']).toBe(`${BASE_URL}/#organization`);
    expect(node.name).toBe('eGhișeul.ro');
    expect(node.contactPoint['@type']).toBe('ContactPoint');
  });
});

describe('breadcrumbNode', () => {
  it('numbers positions starting from 1', () => {
    const node = breadcrumbNode([
      { name: 'Acasă', url: `${BASE_URL}/` },
      { name: 'Servicii', url: `${BASE_URL}/servicii/` },
      { name: 'Cazier', url: `${BASE_URL}/servicii/cazier-judiciar-online/` },
    ]);
    expect(node['@type']).toBe('BreadcrumbList');
    expect(node.itemListElement).toHaveLength(3);
    expect(node.itemListElement[0].position).toBe(1);
    expect(node.itemListElement[2].position).toBe(3);
    expect(node.itemListElement[2].name).toBe('Cazier');
  });
});

describe('serviceNode', () => {
  it('emits Service with two-tier Offer (standard + urgent)', () => {
    const node = serviceNode({
      slug: 'cazier-judiciar-online',
      name: 'Cazier Judiciar Online',
      description: 'Obține cazierul judiciar online.',
      serviceType: 'Document Processing',
      breadcrumb: [],
      offers: [
        { name: 'Standard', price: 198 },
        { name: 'Urgent', price: 278 },
      ],
    });

    expect(node['@type']).toBe('Service');
    expect(node['@id']).toBe(`${BASE_URL}/servicii/cazier-judiciar-online/#service`);
    expect(node.url).toBe(`${BASE_URL}/servicii/cazier-judiciar-online/`);
    expect(node.provider).toEqual({ '@id': `${BASE_URL}/#organization` });
    expect(node.areaServed).toEqual({ '@type': 'Country', name: 'Romania' });

    expect(node.offers).toHaveLength(2);
    expect(node.offers[0]).toMatchObject({
      '@type': 'Offer',
      name: 'Standard',
      price: 198,
      priceCurrency: 'RON',
      availability: 'https://schema.org/InStock',
    });
    expect(node.offers[1].price).toBe(278);
  });

  it('never carries aggregateRating (unsupported parent type for review snippets)', () => {
    const node = serviceNode({
      slug: 'x',
      name: 'X',
      description: 'x',
      breadcrumb: [],
      offers: [{ name: 'a', price: 1 }],
    });
    expect((node as Record<string, unknown>).aggregateRating).toBeUndefined();
  });
});

describe('buildServicePageGraph', () => {
  it('wraps a 4-node @graph (Org + Website + Breadcrumb + Service), no Product', () => {
    const graph = buildServicePageGraph({
      slug: 'cazier-judiciar-online',
      name: 'Cazier Judiciar',
      description: 'd',
      breadcrumb: [
        { name: 'Acasă', url: `${BASE_URL}/` },
        { name: 'Cazier', url: `${BASE_URL}/servicii/cazier-judiciar-online/` },
      ],
      offers: [{ name: 'Standard', price: 198 }],
    });

    expect(graph['@context']).toBe('https://schema.org');
    // Product scos 02.11.2026: purta un shippingRate 0 fals; prețul stă pe Service › Offer.
    expect(graph['@graph']).toHaveLength(4);
    const types = graph['@graph'].map((n) => n['@type']);
    expect(types).toEqual(['Organization', 'WebSite', 'BreadcrumbList', 'Service']);
    const json = JSON.stringify(graph);
    expect(json).not.toContain('shippingRate');
    expect(json).not.toContain('aggregateRating');
    const service = graph['@graph'][3] as { offers: { price: number; priceCurrency: string }[] };
    expect(service.offers[0]).toMatchObject({ price: 198, priceCurrency: 'RON' });
  });
});

describe('articleNode', () => {
  it('uses datePublished as default dateModified', () => {
    const node = articleNode({
      slug: 'taxa-cazier-judiciar',
      headline: 'Taxa Cazier Judiciar 2026',
      description: 'd',
      datePublished: '2026-01-15T10:00:00Z',
      breadcrumb: [],
    });
    expect(node.datePublished).toBe('2026-01-15T10:00:00Z');
    expect(node.dateModified).toBe('2026-01-15T10:00:00Z');
  });

  it('uses dateModified when provided', () => {
    const node = articleNode({
      slug: 'x',
      headline: 'X',
      description: 'd',
      datePublished: '2026-01-15T10:00:00Z',
      dateModified: '2026-05-20T08:00:00Z',
      breadcrumb: [],
    });
    expect(node.dateModified).toBe('2026-05-20T08:00:00Z');
  });

  it('defaults author to organization when omitted', () => {
    const node = articleNode({
      slug: 'x',
      headline: 'X',
      description: 'd',
      datePublished: '2026-01-15T10:00:00Z',
      breadcrumb: [],
    });
    expect(node.author).toEqual({ '@id': `${BASE_URL}/#organization` });
  });

  it('referă nodul Person al autorului, nu unul inline', () => {
    const node = articleNode({
      slug: 'x',
      headline: 'X',
      description: 'd',
      datePublished: '2026-01-15T10:00:00Z',
      author: { name: 'Av. Ion Popescu', url: 'https://linkedin.com/in/ion' },
      breadcrumb: [],
    });
    // Referință prin `@id`: nodul Person complet e emis o singură dată în graf,
    // de `buildArticlePageGraph`. Inline ieșeau două noduri deconectate.
    expect(node.author).toEqual({ '@id': `${BASE_URL}/#autor-av-ion-popescu` });
  });
});

describe('buildArticlePageGraph', () => {
  it('wraps a 5-node @graph (Org + Website + Breadcrumb + Article + Person)', () => {
    const graph = buildArticlePageGraph({
      slug: 'taxa-cazier-judiciar',
      headline: 'Taxa Cazier Judiciar 2026',
      description: 'd',
      datePublished: '2026-01-15T10:00:00Z',
      breadcrumb: [{ name: 'Acasă', url: `${BASE_URL}/` }],
    });

    const types = graph['@graph'].map((n) => n['@type']);
    // Person = autorul real, cu pagină proprie (seo/author.ts), adăugat 09.09.2026.
    expect(types).toEqual(['Organization', 'WebSite', 'BreadcrumbList', 'Article', 'Person']);
  });
});

describe('buildServicePageGraph — editorial metadata (E-E-A-T / GEO)', () => {
  const base = {
    slug: 'x',
    name: 'X',
    description: 'd',
    breadcrumb: [],
    offers: [{ name: 'Standard', price: 198 }],
  };

  it('adds WebPage node when dateModified provided', () => {
    const graph = buildServicePageGraph({ ...base, dateModified: '2026-05-20' });
    const types = graph['@graph'].map((n) => n['@type']);
    expect(types).toContain('WebPage');
    const webPage = graph['@graph'].find((n) => n['@type'] === 'WebPage') as Record<string, unknown>;
    expect(webPage.dateModified).toBe('2026-05-20');
  });

  it('adds Person node when reviewedBy provided', () => {
    const graph = buildServicePageGraph({
      ...base,
      dateModified: '2026-05-20',
      reviewedBy: {
        name: 'Departamentul Juridic',
        jobTitle: 'Specialiști drept administrativ',
        organizationName: 'RapidCert SRL',
      },
    });
    const types = graph['@graph'].map((n) => n['@type']);
    expect(types).toContain('Person');
    expect(types).toContain('WebPage');

    const person = graph['@graph'].find((n) => n['@type'] === 'Person') as Record<string, unknown>;
    expect(person.name).toBe('Departamentul Juridic');
    expect(person.jobTitle).toBe('Specialiști drept administrativ');
    expect(person.worksFor).toEqual({
      '@type': 'Organization',
      name: 'RapidCert SRL',
    });
  });

  it('Person stable @id slug', () => {
    const graph = buildServicePageGraph({
      ...base,
      reviewedBy: { name: 'Departamentul Juridic eGhișeul.ro' },
    });
    const person = graph['@graph'].find((n) => n['@type'] === 'Person') as Record<string, unknown>;
    // Diacritics + spaces collapsed to hyphens
    expect(person['@id']).toContain('#person-departamentul-juridic-egh');
  });

  it('WebPage.reviewedBy links to Person via @id', () => {
    const graph = buildServicePageGraph({
      ...base,
      dateModified: '2026-05-20',
      reviewedBy: { name: 'X Reviewer' },
    });
    const webPage = graph['@graph'].find((n) => n['@type'] === 'WebPage') as Record<string, unknown>;
    expect(webPage.reviewedBy).toBeDefined();
    expect((webPage.reviewedBy as { '@id': string })['@id']).toContain('#person-x-reviewer');
    expect(webPage.lastReviewed).toBe('2026-05-20');
  });

  it('skips WebPage/Person nodes when no editorial metadata', () => {
    const graph = buildServicePageGraph(base);
    const types = graph['@graph'].map((n) => n['@type']);
    expect(types).not.toContain('WebPage');
    expect(types).not.toContain('Person');
    // Graph stays at 4 nodes (Org + Website + Breadcrumb + Service), no WebPage/Person.
    expect(graph['@graph']).toHaveLength(4);
  });

  it('Breadcrumb gets a stable @id when included in service graph', () => {
    const graph = buildServicePageGraph({
      ...base,
      slug: 'cazier-judiciar-online',
      breadcrumb: [
        { name: 'Acasă', url: `${BASE_URL}/` },
        { name: 'Cazier', url: `${BASE_URL}/servicii/cazier-judiciar-online/` },
      ],
    });
    const breadcrumb = graph['@graph'].find((n) => n['@type'] === 'BreadcrumbList') as Record<string, unknown>;
    expect(breadcrumb['@id']).toBe(`${BASE_URL}/servicii/cazier-judiciar-online/#breadcrumb`);
  });
});
