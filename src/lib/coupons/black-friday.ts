/**
 * Black Friday 2026: one public code, a different percent per service, applied
 * to the base price only. Options, urgency, translation, legalization and
 * delivery keep their full price, and they are charged separately on the order.
 *
 * Pure module: the wizard (client) and the order routes (server) must compute
 * the same amount. The end date is fixed and must never be extended: the
 * countdown shown to customers has to be true. Delete this module and its
 * callers after the campaign.
 */

export const BLACK_FRIDAY_CODE = 'BLACKFRIDAY';

/** Monday 16.11.2026, 23:59:59 Romanian time (UTC+2). */
export const BLACK_FRIDAY_ENDS_AT = '2026-11-16T21:59:59Z';

const TOP_RATE_SLUGS = [
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-auto',
  'cazier-fiscal',
  'certificat-integritate',
  'certificat-nastere',
  'certificat-casatorie',
];

const STANDARD_RATE_SLUGS = [
  'certificat-constatator',
  'certificat-celibat',
  'extras-multilingv-certificat-casatorie',
  'extras-multilingv-certificat-nastere',
  'extras-carte-funciara',
  'extras-cf-colectiv',
  'extras-plan-cadastral',
  'actualizare-adresa-cf',
  'certificat-detineri-imobile',
  'certificat-sarcini',
  'certificat-urbanism-informare',
  'copie-arhiva-ocpi',
  'copie-carte-funciara',
  'copie-contract-vanzare',
  'copie-intabulare',
  'copie-inventar-coordonate',
  'copie-plan-cadastral',
  'copie-plan-incadrare',
  'copie-releveu',
  'identificare-imobil',
  'identificare-imobile-proprietar',
  'plan-amplasament-delimitare',
];

const RATES = new Map<string, number>([
  ...TOP_RATE_SLUGS.map((slug): [string, number] => [slug, 20]),
  ...STANDARD_RATE_SLUGS.map((slug): [string, number] => [slug, 10]),
]);

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function isBlackFridayCode(code: string | null | undefined): boolean {
  return (code ?? '').trim().toUpperCase() === BLACK_FRIDAY_CODE;
}

export function isBlackFridayActive(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(BLACK_FRIDAY_ENDS_AT).getTime();
}

/** A campaign that names the code must stop with the offer, even with contacts left to send to. */
export function isExpiredBlackFridayCampaign(bodyText: string | null | undefined, now: Date = new Date()): boolean {
  return (bodyText ?? '').toUpperCase().includes(BLACK_FRIDAY_CODE) && !isBlackFridayActive(now);
}

/** Percent for one service; 0 means the service is not part of the campaign. */
export function blackFridayRate(serviceSlug: string | null | undefined): number {
  return RATES.get(serviceSlug ?? '') ?? 0;
}

export interface CouponAmountInput {
  code?: string | null;
  discount_type: string;
  discount_value: number | string;
}

export interface CouponOrderContext {
  serviceSlug?: string | null;
  basePrice: number;
}

/**
 * The discount in RON for a coupon that already passed its validity checks.
 * Every coupon path calls this, so Black Friday cannot drift between them.
 */
export function couponAmount(
  coupon: CouponAmountInput,
  subtotal: number,
  order: CouponOrderContext
): number {
  const raw = isBlackFridayCode(coupon.code)
    ? (order.basePrice * blackFridayRate(order.serviceSlug)) / 100
    : coupon.discount_type === 'percentage'
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);
  return round2(Math.min(raw, subtotal));
}
