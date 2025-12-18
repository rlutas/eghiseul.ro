/**
 * Romanian Counties and Localities Data
 * Includes county codes, names, and abbreviation mappings
 * Localities sourced from https://github.com/romania/localitati
 */

import localitiesData from './romania-localities.json';

export interface County {
  code: string;      // Auto plate code (e.g., "SM")
  name: string;      // Full name (e.g., "Satu Mare")
  region: string;    // Development region
}

// Localities by county code
export const LOCALITIES_BY_CODE: Record<string, string[]> = localitiesData;

// Complete list of Romanian counties
export const COUNTIES: County[] = [
  { code: 'AB', name: 'Alba', region: 'Centru' },
  { code: 'AR', name: 'Arad', region: 'Vest' },
  { code: 'AG', name: 'Argeș', region: 'Sud-Muntenia' },
  { code: 'BC', name: 'Bacău', region: 'Nord-Est' },
  { code: 'BH', name: 'Bihor', region: 'Nord-Vest' },
  { code: 'BN', name: 'Bistrița-Năsăud', region: 'Nord-Vest' },
  { code: 'BT', name: 'Botoșani', region: 'Nord-Est' },
  { code: 'BV', name: 'Brașov', region: 'Centru' },
  { code: 'BR', name: 'Brăila', region: 'Sud-Est' },
  { code: 'B', name: 'București', region: 'București-Ilfov' },
  { code: 'BZ', name: 'Buzău', region: 'Sud-Est' },
  { code: 'CS', name: 'Caraș-Severin', region: 'Vest' },
  { code: 'CL', name: 'Călărași', region: 'Sud-Muntenia' },
  { code: 'CJ', name: 'Cluj', region: 'Nord-Vest' },
  { code: 'CT', name: 'Constanța', region: 'Sud-Est' },
  { code: 'CV', name: 'Covasna', region: 'Centru' },
  { code: 'DB', name: 'Dâmbovița', region: 'Sud-Muntenia' },
  { code: 'DJ', name: 'Dolj', region: 'Sud-Vest Oltenia' },
  { code: 'GL', name: 'Galați', region: 'Sud-Est' },
  { code: 'GR', name: 'Giurgiu', region: 'Sud-Muntenia' },
  { code: 'GJ', name: 'Gorj', region: 'Sud-Vest Oltenia' },
  { code: 'HR', name: 'Harghita', region: 'Centru' },
  { code: 'HD', name: 'Hunedoara', region: 'Vest' },
  { code: 'IL', name: 'Ialomița', region: 'Sud-Muntenia' },
  { code: 'IS', name: 'Iași', region: 'Nord-Est' },
  { code: 'IF', name: 'Ilfov', region: 'București-Ilfov' },
  { code: 'MM', name: 'Maramureș', region: 'Nord-Vest' },
  { code: 'MH', name: 'Mehedinți', region: 'Sud-Vest Oltenia' },
  { code: 'MS', name: 'Mureș', region: 'Centru' },
  { code: 'NT', name: 'Neamț', region: 'Nord-Est' },
  { code: 'OT', name: 'Olt', region: 'Sud-Vest Oltenia' },
  { code: 'PH', name: 'Prahova', region: 'Sud-Muntenia' },
  { code: 'SM', name: 'Satu Mare', region: 'Nord-Vest' },
  { code: 'SJ', name: 'Sălaj', region: 'Nord-Vest' },
  { code: 'SB', name: 'Sibiu', region: 'Centru' },
  { code: 'SV', name: 'Suceava', region: 'Nord-Est' },
  { code: 'TR', name: 'Teleorman', region: 'Sud-Muntenia' },
  { code: 'TM', name: 'Timiș', region: 'Vest' },
  { code: 'TL', name: 'Tulcea', region: 'Sud-Est' },
  { code: 'VS', name: 'Vaslui', region: 'Nord-Est' },
  { code: 'VL', name: 'Vâlcea', region: 'Sud-Vest Oltenia' },
  { code: 'VN', name: 'Vrancea', region: 'Sud-Est' },
];

// Quick lookup by code
export const COUNTY_BY_CODE: Record<string, County> = COUNTIES.reduce(
  (acc, county) => ({ ...acc, [county.code]: county }),
  {}
);

// Quick lookup by name (lowercase for matching)
export const COUNTY_BY_NAME: Record<string, County> = COUNTIES.reduce(
  (acc, county) => ({ ...acc, [county.name.toLowerCase()]: county }),
  {}
);

// Get county names for select dropdown
export const COUNTY_NAMES = COUNTIES.map(c => c.name).sort();

/**
 * Find county by code, name, or partial match
 * Handles: "SM", "Satu Mare", "satu mare", "SATU MARE", etc.
 */
export function findCounty(input: string | undefined | null): County | null {
  if (!input) return null;

  const normalized = input.trim().toUpperCase();

  // Try exact code match first
  if (COUNTY_BY_CODE[normalized]) {
    return COUNTY_BY_CODE[normalized];
  }

  // Try name match (case insensitive)
  const byName = COUNTY_BY_NAME[input.toLowerCase()];
  if (byName) return byName;

  // Try partial match
  const partial = COUNTIES.find(c =>
    c.name.toLowerCase().includes(input.toLowerCase()) ||
    c.code.toLowerCase() === input.toLowerCase()
  );
  if (partial) return partial;

  return null;
}

/**
 * Get county name from code or abbreviation
 */
export function getCountyName(codeOrName: string | undefined | null): string {
  const county = findCounty(codeOrName);
  return county?.name || codeOrName || '';
}

/**
 * Get localities for a county (by name or code)
 * Returns sorted list of locality names
 */
export function getLocalitiesForCounty(countyNameOrCode: string | undefined | null): string[] {
  if (!countyNameOrCode) return [];

  // First try to find the county to get its code
  const county = findCounty(countyNameOrCode);
  const code = county?.code || countyNameOrCode.toUpperCase();

  // Return localities for this county code
  return LOCALITIES_BY_CODE[code] || [];
}

/**
 * Search localities across all counties
 * Returns matches with county info
 */
export function searchLocalities(query: string, limit = 20): Array<{ name: string; county: string; code: string }> {
  if (!query || query.length < 2) return [];

  const normalizedQuery = query.toLowerCase();
  const results: Array<{ name: string; county: string; code: string }> = [];

  for (const county of COUNTIES) {
    const localities = LOCALITIES_BY_CODE[county.code] || [];
    for (const locality of localities) {
      if (locality.toLowerCase().includes(normalizedQuery)) {
        results.push({
          name: locality,
          county: county.name,
          code: county.code,
        });
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}
