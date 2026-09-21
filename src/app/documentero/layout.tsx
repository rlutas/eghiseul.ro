import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { FooterDocumentero } from '@/components/documentero/footer';
import { RevealObserver } from '@/components/documentero/reveal';
import { BrandProvider } from '@/lib/brand/client';
import { CookieConsent } from '@/components/consent/cookie-consent';
import { BRANDS } from '@/lib/brand/brands';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

const brand = BRANDS.documentero;

/** Brand face: one family, docs/documentero/design.md. */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-bricolage',
  display: 'swap',
  axes: ['opsz'],
});

/**
 * documentero.ro public pages. Reached ONLY through the host rewrite in
 * next.config.ts (documentero.ro/x → /documentero/x); the internal path is
 * refused in src/proxy.ts. Pages write their own absolute canonical and OG
 * URLs via buildPageMetadata({ brand: 'documentero' }).
 *
 * Each page renders its own <HeaderDocumentero active=…>; the footer is
 * shared here.
 */
export const metadata: Metadata = {
  metadataBase: new URL(brand.baseUrl),
  title: {
    default: 'documentero.ro — Acte de stare civilă prin avocat, livrate acasă',
    template: '%s | documentero.ro',
  },
  authors: [{ name: brand.name }],
  creator: brand.name,
  // Search Console, two properties: Domain `documentero.ro` on
  // serviciiseonethut@gmail.com (token R5wF7Ny…, verified 21.09.2026 through
  // the TXT record `google-site-verification=R5wF7Ny…` in the Vercel DNS zone;
  // the meta tag alone does NOT verify a Domain property) and URL-prefix
  // `https://documentero.ro/` on sishuletz@gmail.com (token fsG8Dsy…, verified
  // through this meta tag). Keep both tokens and the DNS record.
  verification: { google: ['R5wF7NyinN-jw_HtDSh2i1ytJxpLSV4WIsVUOblPQyA', 'fsG8DsyWevuhGvHQVMLSqS-6bSrTjgC4UY1NsVYLb4M'] },
  openGraph: { siteName: brand.name, locale: 'ro_RO', type: 'website' },
  robots: DOCUMENTERO_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
};

export default function DocumenteroLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider brandId="documentero">
      <div
        data-brand="documentero"
        className={`${bricolage.variable} min-h-screen bg-d-bg text-d-ink font-[family-name:var(--font-bricolage)] antialiased`}
      >
        {children}
        <FooterDocumentero />
        <RevealObserver />
        <CookieConsent />
      </div>
    </BrandProvider>
  );
}
