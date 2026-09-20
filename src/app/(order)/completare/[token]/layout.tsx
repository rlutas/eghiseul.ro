/**
 * Layout pentru pagina publică de COMPLETARE comandă telefonică (acte +
 * semnătură, după plată). Header-ul global vine din root layout.
 */

import { BrandFooter as Footer } from '@/components/shared/brand-footer';

import type { Metadata } from 'next';
import { getBrand } from '@/lib/brand/server';

/** Title on the brand of the host (the page itself reads the ORDER's brand for its content). */
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: { absolute: `Completează comanda — ${brand.name}` },
    robots: { index: false, follow: false },
  };
}

export default function CompletionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
