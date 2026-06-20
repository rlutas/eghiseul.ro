/**
 * Contractul anti-thin pentru paginile de locație.
 *
 * O pagină de oraș se publică DOAR dacă trece aceste praguri — altfel build-ul
 * eșuează (rulat în `cities.ts` la încărcare + într-un test). Scopul: să nu
 * existe niciodată o pagină „doorway" (city swap pe template identic), care e
 * exact tiparul penalizat de Google (martie 2024). Vezi
 * docs/plans/2026-06-19-location-seo-engine.md §3.
 */
import type { CityData } from './types';

/** Aruncă dacă orașul nu are ancorele minime reale. */
export function assertLocationPageQuality(data: CityData): void {
  const problems: string[] = [];

  // Adresa instituției = ancora principală anti-thin.
  if (!data.ipj?.address || data.ipj.address.trim().length < 10) {
    problems.push('lipsește adresa reală a biroului IPJ');
  }
  // Context local care DEPINDE de oraș (testul anti-swap).
  if (!data.localContext || !data.localContext.includes(data.name)) {
    problems.push('localContext trebuie să menționeze numele orașului (test anti-swap)');
  }
  // FAQ specific orașului.
  if (!data.localFaq || data.localFaq.length < 2) {
    problems.push('necesită minimum 2 FAQ-uri locale');
  }
  if (!data.judetAbbr) {
    problems.push('lipsește judetAbbr');
  }

  if (problems.length > 0) {
    throw new Error(`[location quality] „${data.slug}": ${problems.join('; ')}`);
  }
}

/** Validează tot registrul; întoarce orașele valide (aruncă la prima problemă). */
export function assertAllCities(cities: CityData[]): CityData[] {
  for (const c of cities) assertLocationPageQuality(c);
  return cities;
}
