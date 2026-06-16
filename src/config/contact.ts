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

/**
 * Public Google reviews URL.
 * TODO: replace with the real Google Business Profile review link when available
 * (e.g. https://g.page/r/<id>/review). The search fallback always resolves.
 */
export const GOOGLE_REVIEWS_URL =
  'https://www.google.com/search?q=eghiseul.ro+recenzii';

export const GOOGLE_RATING = 4.9;
export const GOOGLE_REVIEW_COUNT = 450;
