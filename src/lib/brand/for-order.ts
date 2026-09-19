/**
 * The brand of an ORDER — stamped in `orders.platform` when the draft is
 * created and read back wherever we talk to the customer about that order
 * (confirmation email, Stripe return URLs, resume links, status page link).
 *
 * Never derive it from the current request's host: an operator on
 * eghiseul.ro/admin sending a payment link for a documentero order must send
 * a documentero link.
 */

import { brandById, type Brand } from './brands';

export interface OrderWithPlatform {
  platform?: string | null;
}

export function brandForOrder(order: OrderWithPlatform | null | undefined): Brand {
  return brandById(order?.platform ?? null);
}

/** Absolute origin for links about this order (no trailing slash). */
export function appBaseForOrder(order: OrderWithPlatform | null | undefined): string {
  const brand = brandForOrder(order);
  if (brand.id === 'eghiseul') {
    // Keep the existing dev override for the default brand.
    return process.env.NEXT_PUBLIC_APP_URL ?? brand.baseUrl;
  }
  return brand.baseUrl;
}
