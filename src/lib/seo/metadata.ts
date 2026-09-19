/**
 * Next.js Metadata helpers — standard meta tags, canonical, OpenGraph, Twitter.
 *
 * Usage in page.tsx:
 *
 *   export const metadata = buildPageMetadata({
 *     title: 'Cazier Judiciar Online — Obține Rapid Fără Drumuri',
 *     description: '...',
 *     path: '/servicii/cazier-judiciar-online/',
 *     ogImage: '/og/cazier-judiciar.png',
 *   });
 */

import type { Metadata } from 'next';
import { BASE_URL, ORGANIZATION } from './constants';
import { BRANDS, type Brand, type BrandId } from '@/lib/brand/brands';

export interface PageMetadataInput {
  /**
   * Which public site the page belongs to. Default eghiseul (BASE_URL,
   * eGhișeul.ro as siteName) — every existing page is unchanged. documentero
   * pages pass `brand: 'documentero'` and get absolute canonical/OG URLs on
   * documentero.ro.
   */
  brand?: Brand | BrandId;
  /** Browser tab title + SERP headline. Aim 50-60 chars. */
  title: string;
  /** SERP snippet. Aim 140-160 chars. */
  description: string;
  /** Page path WITH leading and trailing slash, e.g. '/servicii/cazier-judiciar-online/'. */
  path: string;
  /** OG image path (1200×630 recommended). Optional. */
  ogImage?: string;
  /** Set `noindex: true` for staging or temporary pages. */
  noindex?: boolean;
  /**
   * `noindex, follow` — pagina nu intră în index, dar linkurile ei contează.
   * Pentru pagini reale, utile omului, pe care Google le refuză oricum
   * (ex. cele 40 de pagini-oraș cvasi-duplicate, audit 28.07.2026). Diferă de
   * `noindex`, care taie și follow — ăla e pentru staging/pagini temporare.
   */
  noindexFollow?: boolean;
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const brand: Brand | null = !input.brand
    ? null
    : typeof input.brand === 'string'
      ? BRANDS[input.brand]
      : input.brand;
  const base = brand?.baseUrl ?? BASE_URL;
  const url = `${base}${input.path}`;
  // Fallback la imaginea OG default când pagina nu specifică una proprie,
  // altfel openGraph de aici suprascrie default-ul din root layout fără imagine.
  const ogImage = `${base}${input.ogImage ?? brand?.ogDefault ?? '/og/default.png'}`;

  return {
    // Brand pages carry the whole title: the root layout's `%s | eGhiseul.ro`
    // template must not be appended to a documentero page.
    title: brand && brand.id !== 'eghiseul' ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: input.title,
      description: input.description,
      siteName: brand?.name ?? ORGANIZATION.name,
      locale: 'ro_RO',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
    robots: input.noindex
      ? { index: false, follow: false }
      : input.noindexFollow
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-snippet': -1,
            'max-image-preview': 'large',
            'max-video-preview': -1,
          },
        },
  };
}
