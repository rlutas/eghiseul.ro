import type { Metadata } from 'next';
import { HeaderDocumentero } from '@/components/documentero/header';
import { FooterDocumentero } from '@/components/documentero/footer';
import { BrandProvider } from '@/lib/brand/client';
import { BRANDS } from '@/lib/brand/brands';

const brand = BRANDS.documentero;

/**
 * documentero.ro public pages. Reached ONLY through the host rewrite in
 * next.config.ts (documentero.ro/x → /documentero/x); the internal path is
 * blocked on every host. Pages here write their own absolute canonical and OG
 * URLs via buildPageMetadata({ brand }), so the root metadataBase does not
 * matter.
 */
export const metadata: Metadata = {
  metadataBase: new URL(brand.baseUrl),
  title: {
    default: 'documentero.ro — Acte de stare civilă prin avocat, livrate acasă',
    template: '%s | documentero.ro',
  },
  authors: [{ name: brand.name }],
  creator: brand.name,
  // Search Console for documentero.ro: set once the property exists.
  verification: {},
  openGraph: {
    siteName: brand.name,
    locale: 'ro_RO',
    type: 'website',
  },
};

export default function DocumenteroLayout({ children }: { children: React.ReactNode }) {
  return (
    <BrandProvider brandId="documentero">
      <div className="min-h-screen bg-[#F3EEE4] text-[#1C1A17]">
        <HeaderDocumentero />
        {children}
        <FooterDocumentero />
      </div>
    </BrandProvider>
  );
}
