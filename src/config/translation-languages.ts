/**
 * Authorized translation languages offered for certificate services.
 *
 * Mirrors the list surfaced on cazierjudiciaronline.com so we stay
 * aligned across siblings services.
 *
 * Since 2026-07-23 the live list is DB-driven: `admin_settings.
 * translation_price_list` (editable in /admin/settings → Traduceri) holds one
 * row per language with OUR cost (negotiated with the translator) + client
 * price + active flag. `TRANSLATION_LANGUAGES` remains the STATIC FALLBACK
 * (languages sold today) used when the API/DB is unreachable, and
 * `DEFAULT_TRANSLATION_PRICE_LIST` seeds the DB (migration 135) — including
 * not-yet-offered languages (active: false) so the coverage gap vs the
 * market (Kenna groups) is visible in admin.
 */
export const TRANSLATION_LANGUAGES = [
  'Engleză (UK)',
  'Engleză (SUA)',
  'Engleză (AUS)',
  'Franceză',
  'Italiană',
  'Spaniolă',
  'Portugheză',
  'Germană',
  'Olandeză',
] as const;

export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number];

/**
 * One row of the admin-editable translation price list.
 * Costs stay null until negotiated with the translator; `group` follows the
 * market convention (Kenna I-VI) purely as a cost-tier orientation.
 */
export interface TranslationPriceRow {
  /** Display name, Romanian (what the customer picks in the wizard). */
  language: string;
  /** Cost tier I-VI (market convention; higher = more expensive/rare). */
  group: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  /** Offered to customers today (drives the wizard dropdown). */
  active: boolean;
  /** OUR cost per standard 1-page document (RON) — null until negotiated. */
  ourCostDoc: number | null;
  /** OUR cost per page for variable documents (RON) — null until negotiated. */
  ourCostPage: number | null;
  /** Client price per standard document (RON). */
  clientPriceDoc: number | null;
  notes: string;
}

const CURRENT_PRICE = 178.5;

export const DEFAULT_TRANSLATION_PRICE_LIST: TranslationPriceRow[] = [
  // ── Oferite azi (lista statică istorică) ─────────────────────────────────
  ...TRANSLATION_LANGUAGES.map((language) => ({
    language,
    group: 'I' as const,
    active: true,
    ourCostDoc: null,
    ourCostPage: null,
    clientPriceDoc: CURRENT_PRICE,
    notes: '',
  })),
  // ── Neoferite încă — gap de acoperire vs piață (Kenna) ──────────────────
  { language: 'Maghiară', group: 'I', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Rusă', group: 'II', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Turcă', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Greacă', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Poloneză', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Ucraineană', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Bulgară', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Sârbă', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Slovacă', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Norvegiană', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Suedeză', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Finlandeză', group: 'III', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Arabă', group: 'IV', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: 'CERUTĂ de clienți — prioritate la negociere' },
  { language: 'Cehă', group: 'IV', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Croată', group: 'IV', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Chineză', group: 'IV', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Ebraică', group: 'V', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: 'clienți Israel existenți' },
  { language: 'Daneză', group: 'V', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Japoneză', group: 'V', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
  { language: 'Persană', group: 'VI', active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: '' },
];
