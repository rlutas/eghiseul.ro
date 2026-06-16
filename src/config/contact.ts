/**
 * Central contact / social-proof config used by CTAs and badges site-wide.
 * WhatsApp is the preferred support channel (faster than phone).
 */

/** WhatsApp support number — digits only, for wa.me links. */
export const WHATSAPP_NUMBER = '40757708181';
export const WHATSAPP_DISPLAY = '+40 757 708 181';

/** Default prefilled WhatsApp message. */
export const WHATSAPP_DEFAULT_MSG = 'Bună ziua! Am o întrebare despre serviciile eGhișeul.';

/** Builds a wa.me link with an optional prefilled message. */
export function whatsappUrl(message: string = WHATSAPP_DEFAULT_MSG): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Public Google Business Profile (reviews) share link. */
export const GOOGLE_REVIEWS_URL = 'https://share.google/stngA2rQbVPY2l57p';

export const GOOGLE_RATING = 4.9;
/** Display label — kept as "peste 450" so we never have to update an exact count. */
export const GOOGLE_REVIEW_COUNT_LABEL = 'peste 450';
