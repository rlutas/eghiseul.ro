import { createPublicClient } from '@/lib/supabase/public';
import { serviceUrl } from '@/lib/seo';
import { getServiceSpecimen, type ServiceSpecimen } from '@/config/service-specimens';
import { formatEstimatedDays, type Service } from '@/types/services';

/**
 * Product cards for the "related services" band, the sticky bar and the
 * desktop rail on articles and calculators. Price and term come from the
 * `services` row (same source as the service pages), never hardcoded, so a
 * price change in admin reaches every article.
 */

export interface RelatedServiceInput {
  /** DB service slug — resolved through serviceUrl(). Ignored if `href` is set. */
  slug?: string;
  /** Explicit href for non-service targets (calculators, tools, other articles). */
  href?: string;
  label: string;
  desc: string;
}

export interface ServiceCard {
  slug: string;
  href: string;
  label: string;
  desc: string;
  /** VAT-inclusive, as stored in services.base_price. */
  priceWithVat: number;
  priceExVat: number;
  term: string;
  image: ServiceSpecimen | null;
}

export interface GuideLink {
  href: string;
  label: string;
  desc: string;
}

// Images for the article/calculator cards that the wizard does not show.
const EXTRA_SPECIMENS: Record<string, ServiceSpecimen> = {
  // Services without a document specimen get a generated illustration
  // (no text, no emblems — never a fake official document).
  'identificare-imobil': {
    src: '/images/servicii-ilustratii/identificare-imobil.webp',
    alt: 'Hartă cadastrală tipărită, cu o parcelă evidențiată sub lupă',
    illustration: true,
  },
  'plan-amplasament-delimitare': {
    src: '/images/servicii-ilustratii/plan-amplasament-delimitare.webp',
    alt: 'Plan de amplasament și delimitare pe masă, cu conturul parcelei, casa și riglă',
    illustration: true,
  },
  'extras-plan-cadastral': {
    src: '/images/servicii-ilustratii/plan-cadastral.webp',
    alt: 'Ortofotoplan tipărit cu parcela conturată în galben și aceeași parcelă pe telefon',
    illustration: true,
  },
  'copie-plan-cadastral': {
    src: '/images/servicii-ilustratii/plan-cadastral.webp',
    alt: 'Ortofotoplan tipărit cu parcela conturată în galben și aceeași parcelă pe telefon',
    illustration: true,
  },
  'copie-carte-funciara': {
    src: '/images/servicii-ilustratii/copie-arhiva.webp',
    alt: 'Dosar de arhivă cu acte vechi și o copie nouă, tipărită, pe birou',
    illustration: true,
  },
  'copie-arhiva-ocpi': {
    src: '/images/servicii-ilustratii/copie-arhiva.webp',
    alt: 'Dosar de arhivă cu acte vechi și o copie nouă, tipărită, pe birou',
    illustration: true,
  },
  'copie-intabulare': {
    src: '/images/servicii-ilustratii/copie-arhiva.webp',
    alt: 'Dosar de arhivă cu acte vechi și o copie nouă, tipărită, pe birou',
    illustration: true,
  },
  'copie-contract-vanzare': {
    src: '/images/servicii-ilustratii/copie-arhiva.webp',
    alt: 'Dosar de arhivă cu acte vechi și o copie nouă, tipărită, pe birou',
    illustration: true,
  },
  'extras-multilingv-certificat-nastere': {
    src: '/images/specimens/extras-multilingv-nastere.webp',
    alt: 'Specimen extras multilingv de naștere',
  },
  'extras-multilingv-certificat-casatorie': {
    src: '/images/specimens/extras-multilingv-casatorie.webp',
    alt: 'Specimen extras multilingv de căsătorie',
  },
};

export const fmtPrice = (v: number) =>
  Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',');

export async function getServiceCards(
  related: RelatedServiceInput[],
): Promise<{ cards: ServiceCard[]; guides: GuideLink[] }> {
  const serviceItems = related.filter((r) => !r.href && r.slug);
  const guides: GuideLink[] = related
    .filter((r) => r.href)
    .map((r) => ({ href: r.href as string, label: r.label, desc: r.desc }));

  if (serviceItems.length === 0) return { cards: [], guides };

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('services')
    .select('slug, base_price, estimated_days, processing_config')
    .in('slug', serviceItems.map((s) => s.slug as string))
    .eq('is_active', true);

  if (error) console.error('getServiceCards: services lookup failed', error.message);
  const bySlug = new Map(
    ((data ?? []) as Pick<Service, 'slug' | 'base_price' | 'estimated_days' | 'processing_config'>[]).map(
      (s) => [s.slug, s],
    ),
  );

  const cards: ServiceCard[] = [];
  for (const item of serviceItems) {
    const slug = item.slug as string;
    const row = bySlug.get(slug);
    // Inactive or unknown service: keep it as a plain link so the internal link survives.
    // Free or affiliate entries (price 0) are not our product: plain link.
    if (!row || !(Number(row.base_price) > 0)) {
      guides.unshift({ href: serviceUrl(slug), label: item.label, desc: item.desc });
      continue;
    }
    const priceWithVat = Number(row.base_price) || 0;
    cards.push({
      slug,
      href: serviceUrl(slug),
      label: item.label,
      desc: item.desc,
      priceWithVat,
      priceExVat: Math.round((priceWithVat / 1.21) * 100) / 100,
      term: formatEstimatedDays(row),
      image: getServiceSpecimen(slug) ?? EXTRA_SPECIMENS[slug] ?? null,
    });
  }
  return { cards, guides };
}
