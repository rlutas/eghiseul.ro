/**
 * Brands served by this codebase.
 *
 * One deployment, two public brands: eghiseul.ro (the generalist platform)
 * and documentero.ro (civil-status documents only, launched 2026-09 after the
 * August 2026 spam update took ~50% of revenue with it — analysis in
 * docs/seo/2026-09-19-site-satelit-stare-civila.md). Same company, same
 * lawyer, same admin, same DB, same Stripe account — only the public face
 * differs.
 *
 * Rules:
 *  - A REQUEST's brand comes from its host (`brandFromHost`).
 *  - An ORDER's brand comes from `orders.platform`, stamped at creation, and
 *    never from the host of whoever is looking at it later (emails, Stripe
 *    return URLs, resume links). See `for-order.ts`.
 *  - eghiseul is the default everywhere a brand cannot be determined, so
 *    every existing code path keeps behaving exactly as before.
 *
 * This file is plain data + pure functions: safe to import from client
 * components, tests and next.config.
 */

import type { RegistryPlatform } from '@/lib/registry/client';

export type BrandId = 'eghiseul' | 'documentero';

export interface Brand {
  id: BrandId;
  /** Public display name, exactly as written on the site. */
  name: string;
  /** Apex domain, no scheme, no `www.`. */
  domain: string;
  /** Absolute origin without trailing slash. */
  baseUrl: string;
  contactEmail: string;
  /** Human-readable phone, shared support line. */
  phoneDisplay: string;
  /** `wa.me` number (digits only). */
  whatsappNumber: string;
  /** Resend `from` header. The domain must be verified in Resend. */
  emailFrom: string;
  /** Absolute URL of the logo used in email headers. */
  emailLogoUrl: string;
  /** Email header background + CTA colors (inline styles, hex). */
  emailHeaderBg: string;
  emailCtaBg: string;
  emailCtaFg: string;
  /** Default OG image path (relative to baseUrl). */
  ogDefault: string;
  /**
   * DB `services.slug` values this brand sells. `null` = every active
   * service (eghiseul). Used by nav/sitemap/order entry guards — NOT by the
   * shared wizard, which serves any slug it is given.
   */
  serviceSlugs: readonly string[] | null;
  registryPlatform: RegistryPlatform;
  /** One-line disclosure used in email footers and order screens. */
  legalTagline: string;
  /**
   * Absolute origin of the legal pages (T&C, confidențialitate, anulare).
   * documentero points at eghiseul.ro until it has its own texts.
   */
  legalBaseUrl: string;
}

export const DEFAULT_BRAND_ID: BrandId = 'eghiseul';

export const DOCUMENTERO_SERVICE_SLUGS = [
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie',
] as const;

export const BRANDS: Record<BrandId, Brand> = {
  eghiseul: {
    id: 'eghiseul',
    name: 'eGhișeul.ro',
    domain: 'eghiseul.ro',
    baseUrl: 'https://eghiseul.ro',
    contactEmail: 'contact@eghiseul.ro',
    phoneDisplay: '+40 757 708 181',
    whatsappNumber: '40757708181',
    emailFrom: 'eGhișeul.ro <contact@eghiseul.ro>',
    emailLogoUrl: 'https://eghiseul.ro/images/brand/logo-wide-white.png',
    emailHeaderBg: '#0B1B33',
    emailCtaBg: '#ECB95F',
    emailCtaFg: '#0B1B33',
    ogDefault: '/og/default.png',
    serviceSlugs: null,
    registryPlatform: 'eghiseul',
    legalBaseUrl: 'https://eghiseul.ro',
    legalTagline:
      'eDigitalizare SRL · CUI RO49278701 · eGhișeul.ro este un serviciu privat de asistență la obținerea de documente; nu suntem instituție de stat.',
  },
  documentero: {
    id: 'documentero',
    name: 'documentero.ro',
    domain: 'documentero.ro',
    baseUrl: 'https://documentero.ro',
    contactEmail: 'contact@documentero.ro',
    phoneDisplay: '+40 757 708 181',
    whatsappNumber: '40757708181',
    emailFrom: 'documentero.ro <contact@documentero.ro>',
    emailLogoUrl: 'https://documentero.ro/images/brand/documentero-email-logo.png',
    // Paleta C1 (docs/documentero/design.md): pădure, mentă.
    emailHeaderBg: '#0F2A22',
    emailCtaBg: '#2FBF8F',
    emailCtaFg: '#0F2A22',
    ogDefault: '/og/documentero-default.png',
    serviceSlugs: DOCUMENTERO_SERVICE_SLUGS,
    registryPlatform: 'documentero',
    legalBaseUrl: 'https://eghiseul.ro',
    legalTagline:
      'eDigitalizare SRL · CUI RO49278701 · documentero.ro este un serviciu privat de asistență la obținerea actelor de stare civilă; nu suntem instituție de stat.',
  },
};

export function isBrandId(value: unknown): value is BrandId {
  return value === 'eghiseul' || value === 'documentero';
}

/** Brand by id; unknown/missing ids fall back to eghiseul. */
export function brandById(id: string | null | undefined): Brand {
  return isBrandId(id) ? BRANDS[id] : BRANDS[DEFAULT_BRAND_ID];
}

/**
 * Extra hosts per brand, for previews and local dev, e.g.
 *   BRAND_HOST_OVERRIDES="documentero=documentero.local:3000,documentero-preview.vercel.app"
 * Several brands: separate groups with `;`.
 */
export function parseHostOverrides(raw: string | undefined | null): Map<string, BrandId> {
  const map = new Map<string, BrandId>();
  if (!raw) return map;
  for (const group of raw.split(';')) {
    const [id, hosts] = group.split('=');
    if (!isBrandId(id?.trim()) || !hosts) continue;
    for (const h of hosts.split(',')) {
      const host = normalizeHost(h);
      if (host) map.set(host, id.trim() as BrandId);
    }
  }
  return map;
}

/** Lower-case, no scheme, no `www.`, no trailing dot. Keeps the port. */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return '';
  let h = host.trim().toLowerCase();
  h = h.replace(/^https?:\/\//, '');
  h = h.split('/')[0] ?? '';
  h = h.replace(/\.$/, '');
  if (h.startsWith('www.')) h = h.slice(4);
  return h;
}

let overridesCache: { raw: string | undefined; map: Map<string, BrandId> } | null = null;

function hostOverrides(): Map<string, BrandId> {
  const raw = process.env.BRAND_HOST_OVERRIDES;
  if (!overridesCache || overridesCache.raw !== raw) {
    overridesCache = { raw, map: parseHostOverrides(raw) };
  }
  return overridesCache.map;
}

/**
 * The brand a request belongs to, from its `Host` header. Exact domain
 * match (with or without `www.`), then the env overrides; anything else —
 * Vercel preview URLs, localhost, a stray IP — is eghiseul, so nothing
 * changes for the existing site.
 */
export function brandFromHost(host: string | null | undefined): Brand {
  const h = normalizeHost(host);
  if (!h) return BRANDS[DEFAULT_BRAND_ID];
  const bare = h.replace(/:\d+$/, '');
  for (const brand of Object.values(BRANDS)) {
    if (bare === brand.domain) return brand;
  }
  const override = hostOverrides().get(h) ?? hostOverrides().get(bare);
  if (override) return BRANDS[override];
  return BRANDS[DEFAULT_BRAND_ID];
}

/** Whether this brand sells the service (eghiseul sells everything). */
export function brandSellsService(brand: Brand, serviceSlug: string | null | undefined): boolean {
  if (!serviceSlug) return false;
  if (brand.serviceSlugs === null) return true;
  return brand.serviceSlugs.includes(serviceSlug);
}
