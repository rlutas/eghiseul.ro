import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { FooterCazierFiscal } from '@/components/cazierfiscal/footer';
import { RevealObserver } from '@/components/documentero/reveal';
import { BrandProvider } from '@/lib/brand/client';
import { CookieConsent } from '@/components/consent/cookie-consent';
import { BRANDS } from '@/lib/brand/brands';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

const brand = BRANDS.cazierfiscal;

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-bricolage',
  display: 'swap',
  axes: ['opsz'],
});

/**
 * cazier-fiscal.ro public pages (third brand, 2026-11-10). Reached ONLY
 * through the host rewrite in next.config.ts (cazier-fiscal.ro/x →
 * /cazierfiscal/x); the internal path is refused in src/proxy.ts.
 *
 * It reuses the documentero design system (`d-*` tokens, ui.tsx); the
 * `[data-brand="cazierfiscal"]` block in globals.css gives it its own palette.
 * Each page renders its own <HeaderCazierFiscal active=…>.
 */
export const metadata: Metadata = {
  metadataBase: new URL(brand.baseUrl),
  title: {
    default: 'Cazier fiscal online prin avocat, fără SPV | cazier-fiscal.ro',
    template: '%s | cazier-fiscal.ro',
  },
  authors: [{ name: brand.name }],
  creator: brand.name,
  openGraph: { siteName: brand.name, locale: 'ro_RO', type: 'website' },
  robots: CAZIERFISCAL_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
};

export default function CazierFiscalLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider brandId="cazierfiscal">
      <div
        data-brand="cazierfiscal"
        className={`${bricolage.variable} min-h-screen bg-d-bg text-d-ink font-[family-name:var(--font-bricolage)] antialiased`}
      >
        {children}
        <FooterCazierFiscal />
        <RevealObserver />
        <CookieConsent />
      </div>
    </BrandProvider>
  );
}
