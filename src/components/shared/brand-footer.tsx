'use client';

import { Footer } from '@/components/home/footer';
import { FooterDocumentero } from '@/components/documentero/footer';
import { FooterCazierFiscal } from '@/components/cazierfiscal/footer';
import { useBrand } from '@/lib/brand/client';

/**
 * Footer for the SHARED routes (status, auth, account, completare,
 * reincarca-poza): the eghiseul footer or the documentero one, decided by the
 * brand of the request (`BrandProvider` in src/app/(order)/layout.tsx). Keeps
 * documentero visitors from landing on a footer full of eghiseul links.
 */
export function BrandFooter() {
  const brand = useBrand();
  if (brand.id === 'documentero') return <FooterDocumentero />;
  if (brand.id === 'cazierfiscal') return <FooterCazierFiscal />;
  return <Footer />;
}
