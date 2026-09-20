/**
 * Layout for the public document-upload page: adds the site footer under the
 * upload card (the global header already comes from the root layout) so the
 * token-gated page doesn't feel detached from the rest of the site.
 */

import { BrandFooter as Footer } from '@/components/shared/brand-footer';

import type { Metadata } from 'next';
import { getBrand } from '@/lib/brand/server';

/** Title on the brand of the host (the page itself reads the ORDER's brand for its content). */
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: { absolute: `Încarcă documentele — ${brand.name}` },
    robots: { index: false, follow: false },
  };
}

export default function ReuploadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
