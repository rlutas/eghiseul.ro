import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  serviceMatchesQuery,
  filterServices,
} from '@/lib/services/service-search';
import type { Service } from '@/types/services';

/** Minimal Service factory — only the fields the search helper reads. */
function svc(partial: Partial<Service> & Pick<Service, 'slug' | 'name' | 'category'>): Service {
  return {
    id: partial.slug,
    slug: partial.slug,
    name: partial.name,
    short_description: partial.short_description ?? null,
    description: partial.description ?? null,
    category: partial.category,
    base_price: 100,
    currency: 'RON',
    estimated_days: 3,
    urgent_available: false,
    is_active: true,
    is_featured: false,
    display_order: 0,
  } as unknown as Service;
}

const CATALOG: Service[] = [
  svc({ slug: 'cazier-judiciar', name: 'Cazier Judiciar', category: 'juridice' }),
  svc({ slug: 'cazier-auto', name: 'Cazier Auto', category: 'auto' }),
  svc({ slug: 'cazier-fiscal', name: 'Cazier Fiscal', category: 'fiscale' }),
  svc({ slug: 'extras-carte-funciara', name: 'Extras Carte Funciară', category: 'imobiliare' }),
  svc({ slug: 'certificat-constatator', name: 'Certificat Constatator', category: 'comerciale' }),
  svc({ slug: 'certificat-nastere', name: 'Certificat de Naștere', category: 'personale' }),
];

describe('normalizeText', () => {
  it('strips Romanian diacritics and lowercases', () => {
    expect(normalizeText('Carte Funciară')).toBe('carte funciara');
    expect(normalizeText('Naștere Căsătorie Întâi')).toBe('nastere casatorie intai');
  });
});

describe('serviceMatchesQuery', () => {
  const cf = CATALOG[3];

  it('empty query matches everything', () => {
    expect(serviceMatchesQuery(cf, '')).toBe(true);
    expect(serviceMatchesQuery(cf, '   ')).toBe(true);
  });

  it('matches name without diacritics', () => {
    expect(serviceMatchesQuery(cf, 'carte funciara')).toBe(true);
  });

  it('matches via category synonym not present in the name', () => {
    // "teren" appears nowhere in "Extras Carte Funciară" but is an imobiliare synonym
    expect(serviceMatchesQuery(cf, 'teren')).toBe(true);
    expect(serviceMatchesQuery(CATALOG[4], 'firma')).toBe(true); // constatator -> comerciale
  });

  it('requires every token to match', () => {
    expect(serviceMatchesQuery(CATALOG[1], 'cazier auto')).toBe(true);
    expect(serviceMatchesQuery(CATALOG[1], 'cazier fiscal')).toBe(false);
  });
});

describe('filterServices', () => {
  it('filters by category only', () => {
    const r = filterServices(CATALOG, 'juridice', '');
    expect(r.map((s) => s.slug)).toEqual(['cazier-judiciar']);
  });

  it('"all" + empty query returns full catalog', () => {
    expect(filterServices(CATALOG, 'all', '')).toHaveLength(CATALOG.length);
  });

  it('combines category and query', () => {
    const r = filterServices(CATALOG, 'all', 'cazier');
    expect(r.map((s) => s.slug).sort()).toEqual(['cazier-auto', 'cazier-fiscal', 'cazier-judiciar']);
  });

  it('returns empty when nothing matches', () => {
    expect(filterServices(CATALOG, 'all', 'zzzznope')).toHaveLength(0);
  });
});
