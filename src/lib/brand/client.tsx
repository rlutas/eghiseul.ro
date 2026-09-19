'use client';

/**
 * Brand of the current page, for client components (wizard, checkout,
 * status, account) that print the site name, contact email or WhatsApp
 * text. The value is decided on the server (layout) and handed down — never
 * read from `window.location`, which would differ between SSR and hydration.
 *
 * Outside a provider it resolves to eghiseul, so existing components keep
 * working untouched.
 */

import { createContext, useContext, type ReactNode } from 'react';
import { BRANDS, DEFAULT_BRAND_ID, brandById, type Brand, type BrandId } from './brands';

const BrandContext = createContext<Brand>(BRANDS[DEFAULT_BRAND_ID]);

export function BrandProvider({ brandId, children }: { brandId: BrandId; children: ReactNode }) {
  return <BrandContext.Provider value={brandById(brandId)}>{children}</BrandContext.Provider>;
}

export function useBrand(): Brand {
  return useContext(BrandContext);
}
