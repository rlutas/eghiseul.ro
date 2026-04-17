/**
 * Authorized translation languages offered for certificate services.
 *
 * Mirrors the list surfaced on cazierjudiciaronline.com so we stay
 * aligned across siblings services.
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
