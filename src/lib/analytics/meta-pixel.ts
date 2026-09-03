/**
 * Meta Pixel (Facebook/Instagram Ads) — helper client-side.
 *
 * Pixelul se încarcă DOAR cu consimțământ de marketing (cookie-consent.tsx →
 * loadMetaPixel). Aici doar trimitem evenimente dacă `fbq` există; altfel no-op,
 * ca să nu depindă nimic din UI de starea consimțământului.
 *
 * `eventID` = cheia de dedup cu Conversions API (server, webhook Stripe):
 * pentru Purchase e numărul comenzii.
 */

type Fbq = (...args: unknown[]) => void;

export type MetaStandardEvent = 'PageView' | 'ViewContent' | 'InitiateCheckout' | 'Purchase' | 'Lead';

export function trackMeta(
  event: MetaStandardEvent,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (!fbq) return;
  try {
    if (eventId) fbq('track', event, params ?? {}, { eventID: eventId });
    else fbq('track', event, params ?? {});
  } catch {
    // pixelul nu are voie să rupă UI-ul
  }
}
