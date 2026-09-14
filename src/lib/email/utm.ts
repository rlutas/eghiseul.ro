/**
 * UTM-uri pentru linkurile din emailurile de marketing, ca atribuirea din
 * `lib/analytics/attribution.ts` (salvată pe `orders.attribution.last`) să
 * poată lega comanda de emailul care a adus-o. KPI-urile din /admin/marketing
 * citesc exact aceste valori:
 *
 *   utm_source=email · utm_medium=<canal> · utm_campaign=<campanie>
 *
 *   lifecycle  → expiry | cross_sell | review
 *   warmup     → warmup
 *   campaign   → camp-<primele 8 caractere din id>
 *   recovery   → recovery-step1|2|3
 */

export type UtmMedium = 'lifecycle' | 'warmup' | 'campaign' | 'recovery' | 'phone';

export function withUtm(url: string, medium: UtmMedium, campaign: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'email');
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', campaign);
    return u.toString();
  } catch {
    return url;
  }
}

export function campaignUtmKey(campaignId: string): string {
  return `camp-${campaignId.replace(/-/g, '').slice(0, 8)}`;
}
