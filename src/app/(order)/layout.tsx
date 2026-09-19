/**
 * Shared order/account routes (wizard, checkout, status, account, auth,
 * completare, reincarca-poza) — the SAME pages serve both brands. The chrome
 * is picked per request host; these routes are dynamic anyway (session
 * cookies, drafts), so reading `headers()` here costs nothing extra.
 *
 * Client components below read the brand through `useBrand()` — never from
 * `window.location`, which would mismatch SSR and hydration.
 */
import type { Metadata } from 'next';
import { Header } from '@/components/shared/header';
import { WhatsAppFloat } from '@/components/shared/whatsapp-float';
import { HeaderDocumentero } from '@/components/documentero/header';
import { BrandProvider } from '@/lib/brand/client';
import { getBrand } from '@/lib/brand/server';
import { CookieConsent } from '@/components/consent/cookie-consent';
import { Bricolage_Grotesque } from 'next/font/google';

/** documentero's face on the shared routes (wizard, checkout, cont). */
const bricolage = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], variable: '--font-bricolage', display: 'swap', axes: ['opsz'] });

/**
 * Checkout, success, status and account pages have no metadata of their own,
 * so on documentero.ro their tab title fell back to the root layout's
 * eghiseul title (test order 19.09.2026). The wizard page keeps its own
 * `generateMetadata`. On eghiseul nothing changes (empty object = root).
 */
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  if (brand.id === 'eghiseul') return {};
  return {
    metadataBase: new URL(brand.baseUrl),
    // `absolute`: the root layout's `%s | eGhiseul.ro` template must not wrap the default.
    title: { absolute: `Comanda ta — ${brand.name}`, template: `%s | ${brand.name}` },
    openGraph: { siteName: brand.name, locale: 'ro_RO', type: 'website', images: [{ url: `${brand.baseUrl}${brand.ogDefault}` }] },
    twitter: { card: 'summary_large_image', images: [`${brand.baseUrl}${brand.ogDefault}`] },
    robots: { index: false, follow: false },
  };
}

export default async function OrderLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand();
  const isDocumentero = brand.id === 'documentero';
  const body = (
    <>
      {isDocumentero ? <HeaderDocumentero /> : <Header />}
      {children}
      {!isDocumentero && <WhatsAppFloat />}
      <CookieConsent />
    </>
  );
  return (
    <BrandProvider brandId={brand.id}>
      {isDocumentero ? (
        // Re-colors every shared component through the brand tokens in
        // globals.css ([data-brand="documentero"]): gold → mint, navy → forest.
        <div data-brand="documentero" className={`${bricolage.variable} min-h-screen bg-neutral-50`}>
          {body}
        </div>
      ) : (
        body
      )}
    </BrandProvider>
  );
}
