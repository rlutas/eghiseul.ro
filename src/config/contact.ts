import { SOCIAL_PROOF } from '@/lib/seo/constants';
/**
 * Central contact / social-proof config used by CTAs and badges site-wide.
 * WhatsApp is the preferred support channel (faster than phone).
 */

/** WhatsApp support number — digits only, for wa.me links. */
export const WHATSAPP_NUMBER = '40757708181';
export const WHATSAPP_DISPLAY = '+40 757 708 181';

/**
 * Phone support — same number as WhatsApp. WhatsApp is the preferred channel;
 * phone is for customers who need to call. Use PHONE_TEL for `href`, PHONE_DISPLAY for text.
 */
export const PHONE_TEL = '+40757708181';
export const PHONE_DISPLAY = '+40 757 708 181';

/** Support / working hours (Romanian), Mon–Fri 08:00–16:00. */
export const SUPPORT_HOURS = 'Luni – Vineri: 08:00 – 16:00';
export const SUPPORT_HOURS_SHORT = 'L–V 08:00–16:00';

/** Default prefilled WhatsApp message. */
export const WHATSAPP_DEFAULT_MSG = 'Bună ziua! Am o întrebare despre serviciile eGhișeul.';

/** Builds a wa.me link with an optional prefilled message. */
export function whatsappUrl(message: string = WHATSAPP_DEFAULT_MSG): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Public Google Business Profile (reviews) share link. */
export const GOOGLE_REVIEWS_URL = 'https://share.google/stngA2rQbVPY2l57p';
/** Direct "write a review" link (Google g.page). */
export const GOOGLE_REVIEW_WRITE_URL = 'https://g.page/r/CSfYKsVLbx7PEBM/review';

/**
 * Rating și număr de recenzii — reexportate din `SOCIAL_PROOF`, sursa unică.
 *
 * Erau declarate separat aici, deci existau trei surse paralele pe site. Exact
 * mecanismul care a produs „4,8 / 64" hardcodat pe 29 de pagini de serviciu, în
 * timp ce cifra reală stătea nefolosită (verificare 09.09.2026). Se actualizează
 * DOAR în `src/lib/seo/constants.ts`.
 */
export const GOOGLE_RATING = SOCIAL_PROOF.ratingValue;
/** Etichetă rotunjită în jos la zeci, ca să rămână adevărată între actualizări. */
export const GOOGLE_REVIEW_COUNT_LABEL = `peste ${SOCIAL_PROOF.roundedDown}`;
