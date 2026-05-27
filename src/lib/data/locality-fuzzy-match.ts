/**
 * Fuzzy-match a locality name (from OCR or free-text) against the official
 * list of localities for a given county. Returns the canonical name from the
 * list if a confident match exists, otherwise returns the input unchanged.
 *
 * Why this exists (2026-05-27):
 *   Gemini OCR sometimes misreads Romanian diacritics — most commonly
 *   `ș` (s with comma below) gets returned as `č` or `š`, neither of which
 *   exist in Romanian. A real example reported by a user:
 *
 *     CI says:  "Sat.Băbășești (Com.Medieșu Aurit)"
 *     OCR gave: "Sat.Băbăcești (Com.Medieșu Aurit)"  ← Băbă-c-ești, wrong
 *
 *   We can fix this post-hoc by comparing the OCR output (diacritic-stripped
 *   + normalized) against the known list of localities for the extracted
 *   county. A unique close match wins. Multiple matches → keep original
 *   (don't guess blindly).
 *
 *   This is a safety net, not a replacement for a better OCR — the prompt
 *   in document-ocr.ts also calls out Romanian diacritic conventions
 *   explicitly to reduce these mistakes upstream.
 */

import { getLocalitiesForCounty } from './romania-counties';

/**
 * Strip Romanian diacritics + Mun./Sat./Com./Oraș prefixes + lowercase.
 * Used purely for comparison; the canonical form returned to callers
 * preserves the original casing/diacritics from the localities list.
 */
export function normalizeForMatch(input: string): string {
  return input
    .normalize('NFD')                       // decompose diacritics
    .replace(/[̀-ͯ]/g, '')        // strip combining marks
    .replace(/[șş]/gi, 's')                 // both s-comma and s-cedilla → s
    .replace(/[țţ]/gi, 't')                 // both t-comma and t-cedilla → t
    .replace(/[č]/gi, 'c')                  // misread Romanian: č should be ș, normalize to s? no, leave as c
    .replace(/[š]/gi, 's')                  // misread Romanian: š should be ș
    .replace(/^(sat\.?|com\.?|comuna|comună|mun\.?|municipiul|oraș|oras)\s*/i, '')
    .replace(/\s*\([^)]*\)\s*$/g, '')       // strip "(Com.Foo)" trailing parens
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Levenshtein distance — small, no-dependency. Used to score "almost
 * matches" when the diacritic-stripped form doesn't match exactly (e.g.
 * the OCR substituted a wrong consonant entirely).
 */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export interface FuzzyMatchResult {
  /** Canonical locality name (from the official list) if we matched, otherwise the trimmed input. */
  canonical: string;
  /** "exact" = diacritic-insensitive equal; "fuzzy" = Levenshtein within threshold; "none" = kept input. */
  kind: 'exact' | 'fuzzy' | 'none';
  /** Edit distance to the canonical when fuzzy; 0 for exact; null for none. */
  distance: number | null;
}

/**
 * Find the canonical locality name from the official list of a county.
 * Returns the input unchanged if there's no confident match or the input
 * is empty / no county provided.
 *
 * Threshold: edit distance ≤ 2 AND ≤ 25% of the canonical length.
 * Multiple candidates within the threshold → return input (we don't guess).
 */
export function fuzzyMatchLocality(
  rawLocality: string | null | undefined,
  countyNameOrCode: string | null | undefined
): FuzzyMatchResult {
  const input = (rawLocality || '').trim();
  if (!input) return { canonical: '', kind: 'none', distance: null };

  const localities = getLocalitiesForCounty(countyNameOrCode);
  if (localities.length === 0) {
    return { canonical: input, kind: 'none', distance: null };
  }

  const needle = normalizeForMatch(input);
  if (!needle) return { canonical: input, kind: 'none', distance: null };

  // Pass 1 — exact match on the normalized form. This catches the common
  // case where the only difference is a wrong diacritic OR a "Sat./Com./Mun."
  // prefix on the OCR side.
  const exact = localities.find((loc) => normalizeForMatch(loc) === needle);
  if (exact) {
    return { canonical: exact, kind: 'exact', distance: 0 };
  }

  // Pass 2 — fuzzy. Tolerate 1-2 character substitutions on long names but
  // stay strict on short ones (avoid mapping "Săpoca" → "Săpânța" which is
  // a different village 400km away).
  const maxAbsolute = 2;
  const candidates: Array<{ canonical: string; distance: number }> = [];
  for (const loc of localities) {
    const haystack = normalizeForMatch(loc);
    const d = levenshtein(needle, haystack);
    if (d > maxAbsolute) continue;
    if (d > Math.floor(haystack.length * 0.25)) continue;
    candidates.push({ canonical: loc, distance: d });
  }
  if (candidates.length === 0) {
    return { canonical: input, kind: 'none', distance: null };
  }
  // Single best match wins; ambiguity = keep original to avoid wrong fixes.
  candidates.sort((a, b) => a.distance - b.distance);
  const best = candidates[0];
  const tiedWithBest = candidates.filter((c) => c.distance === best.distance);
  if (tiedWithBest.length > 1) {
    return { canonical: input, kind: 'none', distance: null };
  }
  return { canonical: best.canonical, kind: 'fuzzy', distance: best.distance };
}
