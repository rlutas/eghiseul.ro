/**
 * Validation for `admin_settings.translation_price_list` (the admin-editable
 * per-language translation price list — /admin/settings → Traduceri).
 * Pure module so the PATCH route stays thin and the rules are unit-testable.
 * Row shape: see `TranslationPriceRow` in `src/config/translation-languages.ts`.
 */

const VALID_GROUPS = new Set(['I', 'II', 'III', 'IV', 'V', 'VI']);

/** Returns an error message (Romanian, user-facing), or null when valid. */
export function validateTranslationPriceList(value: unknown): string | null {
  if (!Array.isArray(value)) return 'Lista de prețuri trebuie să fie un array';
  if (value.length > 200) return 'Prea multe rânduri (max 200)';
  const seen = new Set<string>();
  for (const [i, row] of value.entries()) {
    if (!row || typeof row !== 'object') return `Rândul ${i + 1}: format invalid`;
    const r = row as Record<string, unknown>;
    const lang = typeof r.language === 'string' ? r.language.trim() : '';
    if (lang.length < 2 || lang.length > 60) return `Rândul ${i + 1}: limba lipsește sau e invalidă`;
    const langKey = lang.toLowerCase();
    if (seen.has(langKey)) return `Limba „${lang}" apare de două ori`;
    seen.add(langKey);
    if (!VALID_GROUPS.has(String(r.group))) return `Rândul ${i + 1} (${lang}): grupa trebuie să fie I-VI`;
    if (typeof r.active !== 'boolean') return `Rândul ${i + 1} (${lang}): activ trebuie să fie da/nu`;
    for (const f of ['ourCostDoc', 'ourCostPage', 'clientPriceDoc'] as const) {
      const v = r[f];
      if (v !== null && v !== undefined && (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 10000)) {
        return `Rândul ${i + 1} (${lang}): ${f} trebuie să fie număr 0-10000 sau gol`;
      }
    }
    if (r.notes !== undefined && r.notes !== null && (typeof r.notes !== 'string' || r.notes.length > 300)) {
      return `Rândul ${i + 1} (${lang}): nota e prea lungă (max 300)`;
    }
  }
  return null;
}
