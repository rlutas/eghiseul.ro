/**
 * Prices and options for documentero pages, read from the SAME `services` and
 * `service_options` rows eghiseul uses (decision 19.09.2026: identical prices).
 * Pages call this at render time (ISR, `revalidate` on the page), so a price
 * change in admin shows up on both sites.
 */
import { createPublicClient } from '@/lib/supabase/public';
import { DOCUMENTERO_SERVICE_SLUGS } from '@/lib/brand/brands';

export type DocumenteroSlug = (typeof DOCUMENTERO_SERVICE_SLUGS)[number];

export interface ServicePricing {
  slug: string;
  name: string;
  basePrice: number;
  estimatedDays: number | null;
  options: Array<{ code: string | null; name: string; price: number }>;
}

/** Hard fallbacks = the DB values on 19.09.2026, so a DB hiccup never renders "0 lei". */
const FALLBACK: Record<DocumenteroSlug, ServicePricing> = {
  'certificat-nastere': { slug: 'certificat-nastere', name: 'Certificat de Naștere', basePrice: 998, estimatedDays: 30, options: [] },
  'certificat-casatorie': { slug: 'certificat-casatorie', name: 'Certificat de Căsătorie', basePrice: 998, estimatedDays: 30, options: [] },
  'certificat-celibat': { slug: 'certificat-celibat', name: 'Certificat de Celibat', basePrice: 698, estimatedDays: 30, options: [] },
  'extras-multilingv-certificat-nastere': { slug: 'extras-multilingv-certificat-nastere', name: 'Extras Multilingv Certificat de Naștere', basePrice: 798, estimatedDays: 30, options: [] },
  'extras-multilingv-certificat-casatorie': { slug: 'extras-multilingv-certificat-casatorie', name: 'Extras Multilingv Certificat de Căsătorie', basePrice: 798, estimatedDays: 30, options: [] },
};

export async function getServicePricing(slug: DocumenteroSlug): Promise<ServicePricing> {
  try {
    const supabase = createPublicClient();
    const { data: service } = await supabase
      .from('services')
      .select('id, slug, name, base_price, estimated_days')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (!service) return FALLBACK[slug];
    const { data: options } = await supabase
      .from('service_options')
      .select('code, name, price')
      .eq('service_id', service.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return {
      slug: service.slug,
      name: service.name,
      basePrice: Number(service.base_price) || FALLBACK[slug].basePrice,
      estimatedDays: service.estimated_days ?? FALLBACK[slug].estimatedDays,
      options: (options ?? []).map((o) => ({ code: o.code ?? null, name: o.name, price: Number(o.price) || 0 })),
    };
  } catch {
    return FALLBACK[slug];
  }
}

export async function getAllPricing(): Promise<Record<DocumenteroSlug, ServicePricing>> {
  const entries = await Promise.all(DOCUMENTERO_SERVICE_SLUGS.map(async (s) => [s, await getServicePricing(s)] as const));
  return Object.fromEntries(entries) as Record<DocumenteroSlug, ServicePricing>;
}

/** "998" / "178,50" — Romanian formatting, no decimals when whole. */
export function lei(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
}

export function optionPrice(p: ServicePricing, code: string, fallback: number): number {
  return p.options.find((o) => o.code === code)?.price ?? fallback;
}
