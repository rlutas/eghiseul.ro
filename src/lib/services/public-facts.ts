import { createPublicClient } from '@/lib/supabase/public';
import { serviceUrl } from '@/lib/seo/constants';
import { formatEstimatedDays, formatUrgentDays, type Service } from '@/types/services';

/**
 * Price + term of a service, as the service pages show them.
 *
 * Single source for the homepage and llms.txt (SEO audit 02.11.2026, H1): both
 * used to carry their own copy of the facts („24-48 de ore", „instant pe
 * email", „89 RON + TVA") and contradicted the service pages. The term is
 * `formatEstimatedDays()` — the same `processing_config.estimated_days_display`
 * text the `/servicii/*` pages render — and the price is `services.base_price`
 * (VAT included). Edit them in admin (Setări → Servicii), never here.
 *
 * Uses the anonymous client (no cookies, no `headers()`), so the static
 * eghiseul pages that call it stay static/ISR.
 */
export interface PublicServiceFact {
  slug: string;
  href: string;
  /** VAT-inclusive, as stored in services.base_price. */
  priceWithVat: number;
  /** e.g. „3-5 zile lucrătoare", „câteva minute (24/7)". */
  term: string;
  urgentTerm: string | null;
}

export type PublicServiceFacts = Record<string, PublicServiceFact | undefined>;

type Row = Pick<
  Service,
  'slug' | 'base_price' | 'estimated_days' | 'urgent_days' | 'processing_config'
>;

export function toPublicServiceFact(row: Row): PublicServiceFact | undefined {
  const price = Number(row.base_price);
  // Price 0 = not our product (rovinieta is an affiliate link): no facts to state.
  if (!(price > 0)) return undefined;
  return {
    slug: row.slug,
    href: serviceUrl(row.slug),
    priceWithVat: price,
    term: formatEstimatedDays(row),
    urgentTerm: formatUrgentDays(row),
  };
}

/**
 * Active services by DB slug. A missing key means „unknown / inactive /
 * lookup failed": callers then leave the term out instead of guessing one.
 */
export async function getPublicServiceFacts(slugs: string[]): Promise<PublicServiceFacts> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('services')
    .select('slug, base_price, estimated_days, urgent_days, processing_config')
    .in('slug', slugs)
    .eq('is_active', true);

  if (error) console.error('getPublicServiceFacts: services lookup failed', error.message);
  const facts: PublicServiceFacts = {};
  for (const row of (data ?? []) as Row[]) {
    facts[row.slug] = toPublicServiceFact(row);
  }
  return facts;
}

/** „198" / „73,55" — Romanian decimal comma, no trailing zeros on integers. */
export function formatLei(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',');
}
