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

/**
 * How the Stripe payment page should look for this order's brand. One Stripe
 * account serves every brand and its default logo is eghiseul's, so each
 * session carries the brand's own logo, icon and name. Logos drawn in white
 * (cazierfiscal, documentero) get the brand's dark background behind them.
 */
export function stripeBrandingForOrder(order: OrderWithPlatform | null | undefined): {
  displayName: string;
  iconUrl: string;
  logoUrl: string;
  buttonColor: string;
  backgroundColor?: string;
} {
  const brand = brandForOrder(order);
  // "Certificat Constatator Express <contact@…>" → the readable name.
  const displayName = brand.emailFrom.split('<')[0].trim() || brand.name;
  const iconPath = brand.id === 'eghiseul' ? '/apple-icon.png' : `/images/${brand.id}/apple-icon.png`;
  const darkLogo = brand.id === 'eghiseul' || brand.id === 'constatator';
  return {
    displayName,
    iconUrl: `${brand.baseUrl}${iconPath}`,
    logoUrl: brand.id === 'eghiseul' ? `${brand.baseUrl}/images/brand/logo-wide.png` : brand.emailLogoUrl,
    buttonColor: brand.emailHeaderBg,
    ...(darkLogo ? {} : { backgroundColor: brand.emailHeaderBg }),
  };
}
