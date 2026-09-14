/**
 * Link-ul prin care un client își reia o comandă neplătită — folosit de
 * cronul recovery-emails și de emailul de follow-up după apelul telefonic.
 *
 *   abandoned (trimisă, neplătită) → /comanda/checkout/<id>
 *   draft (abandon în wizard)       → /comanda/<slug>?order=<friendly>&email=<email>
 *                                     (restore cross-device; emailul e gardă anti-IDOR)
 *
 * `?coupon=` se aplică AUTOMAT la aterizare — checkout-ul îl POST-ează la
 * /api/orders/[id]/coupon după load, iar review-step-ul din wizard îl citește
 * din URL și îl validează singur. Deci „cuponul se aplică automat" din emailuri
 * e adevărat, inclusiv pentru cuponul dat la telefon.
 */

export function appBase(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
}

export function buildResumeUrl(order: {
  id: string;
  status: string;
  friendly_order_id: string | null;
  serviceSlug: string | null;
  email: string;
  couponCode?: string | null;
}): string {
  if (order.status === 'draft' && order.serviceSlug && order.friendly_order_id) {
    const qs = new URLSearchParams({ order: order.friendly_order_id, email: order.email });
    if (order.couponCode) qs.set('coupon', order.couponCode);
    return `${appBase()}/comanda/${order.serviceSlug}?${qs.toString()}`;
  }
  const base = `${appBase()}/comanda/checkout/${order.id}`;
  return order.couponCode ? `${base}?coupon=${encodeURIComponent(order.couponCode)}` : base;
}
