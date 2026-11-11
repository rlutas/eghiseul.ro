import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { FooterConstatator } from '@/components/constatator/footer';
import { RevealObserver } from '@/components/documentero/reveal';
import { BrandProvider } from '@/lib/brand/client';
import { CookieConsent } from '@/components/consent/cookie-consent';
import { BRANDS } from '@/lib/brand/brands';
import { CONSTATATOR_INDEXABLE } from '@/config/constatator-nav';

const brand = BRANDS.constatator;

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-bricolage',
  display: 'swap',
  axes: ['opsz'],
});

/**
 * certificat-constatator-express.ro public pages (fourth brand, 2026-11-11).
 * Reached ONLY through the host rewrite in next.config.ts
 * (certificat-constatator-express.ro/x → /constatator/x); the internal path
 * is refused in src/proxy.ts.
 *
 * It reuses the documentero design system (`d-*` tokens, ui.tsx); the
 * `[data-brand="constatator"]` block in globals.css gives it its own palette.
 * Each page renders its own <HeaderConstatator active=…>.
 */
export const metadata: Metadata = {
  metadataBase: new URL(brand.baseUrl),
  title: {
    absolute: 'Certificat constatator online | Constatator Express',
    template: '%s | Constatator Express',
  },
  authors: [{ name: brand.name }],
  // Override the root layout's eghiseul values: its canonical and its GSC
  // token must not reach this host (GSC here is verified by DNS TXT).
  alternates: {},
  // GSC is verified by DNS TXT; Bing gets its own token at launch.
  verification: {},
  creator: brand.name,
  openGraph: { siteName: brand.name, locale: 'ro_RO', type: 'website', images: [{ url: `${brand.baseUrl}${brand.ogDefault}` }] },
  twitter: { card: 'summary_large_image', images: [`${brand.baseUrl}${brand.ogDefault}`] },
  robots: CONSTATATOR_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
};

export default function ConstatatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider brandId="constatator">
      <div
        data-brand="constatator"
        className={`${bricolage.variable} min-h-screen bg-d-bg text-d-ink font-[family-name:var(--font-bricolage)] antialiased`}
      >
        {children}
        <FooterConstatator />
        <RevealObserver />
        <CookieConsent />
      </div>
    </BrandProvider>
  );
}
