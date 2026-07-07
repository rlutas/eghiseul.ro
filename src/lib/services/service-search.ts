/**
 * Pure, UI-agnostic search/filter helpers for the services catalog.
 * Used by the /servicii page filter and (indirectly) any service picker.
 *
 * Romanian users type without diacritics ("cazier judiciar", "carte funciara"),
 * so all matching is diacritic- and case-insensitive. Category synonyms let a
 * query like "firma" or "teren" resolve to the right institution group even
 * when the service name doesn't contain that word.
 */
import type { Service, ServiceCategory } from '@/types/services';

/** Lowercase + strip diacritics (ă→a, ș→s, ț→t, î→i, â→a). */
export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Extra search terms per category, so common lay words map to the right group.
 * All terms are stored already-normalized (no diacritics, lowercase).
 */
const CATEGORY_SYNONYMS: Record<ServiceCategory, string[]> = {
  imobiliare: ['imobil', 'teren', 'casa', 'apartament', 'cadastru', 'carte funciara', 'cf', 'ancpi', 'ocpi', 'intabulare'],
  juridice: ['cazier', 'penal', 'politie', 'integritate', 'judiciar', 'antecedente'],
  comerciale: ['firma', 'companie', 'srl', 'pfa', 'onrc', 'registrul comertului', 'constatator'],
  fiscale: ['fiscal', 'anaf', 'datorii', 'taxe', 'impozit'],
  personale: ['nastere', 'casatorie', 'celibat', 'stare civila', 'primarie', 'certificat'],
  auto: ['auto', 'masina', 'rovinieta', 'permis', 'vehicul', 'rutier'],
};

/** Human category labels for filter chips (short form). */
export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  imobiliare: 'Carte Funciară',
  juridice: 'Caziere',
  comerciale: 'Firme',
  fiscale: 'Fiscal',
  personale: 'Stare Civilă',
  auto: 'Auto',
};

/** Does a single service match a free-text query? Empty query matches all. */
export function serviceMatchesQuery(service: Service, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = normalizeText(
    [
      service.name,
      service.short_description ?? '',
      service.description ?? '',
      CATEGORY_LABELS[service.category] ?? '',
      ...(CATEGORY_SYNONYMS[service.category] ?? []),
    ].join(' ')
  );

  // Match on every whitespace-separated token so "cazier auto" narrows results.
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

/** Filter by category (null/`'all'` = no category filter) then by query. */
export function filterServices(
  services: Service[],
  category: ServiceCategory | 'all',
  query: string
): Service[] {
  return services.filter(
    (s) =>
      (category === 'all' || s.category === category) &&
      serviceMatchesQuery(s, query)
  );
}
