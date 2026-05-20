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

export interface PageMetadataInput {
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
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const url = `${BASE_URL}${input.path}`;
  const ogImage = input.ogImage ? `${BASE_URL}${input.ogImage}` : undefined;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: input.title,
      description: input.description,
      siteName: ORGANIZATION.name,
      locale: 'ro_RO',
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    robots: input.noindex
      ? { index: false, follow: false }
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
