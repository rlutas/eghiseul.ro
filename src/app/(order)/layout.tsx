/**
 * Shared order/account routes (wizard, checkout, status, account, auth,
 * completare, reincarca-poza) — the SAME pages serve both brands. The chrome
 * is picked per request host; these routes are dynamic anyway (session
 * cookies, drafts), so reading `headers()` here costs nothing extra.
 *
 * Client components below read the brand through `useBrand()` — never from
 * `window.location`, which would mismatch SSR and hydration.
 */
import { Header } from '@/components/shared/header';
import { WhatsAppFloat } from '@/components/shared/whatsapp-float';
import { HeaderDocumentero } from '@/components/documentero/header';
import { BrandProvider } from '@/lib/brand/client';
import { getBrand } from '@/lib/brand/server';
import { CookieConsent } from '@/components/consent/cookie-consent';
import { Bricolage_Grotesque } from 'next/font/google';

/** documentero's face on the shared routes (wizard, checkout, cont). */
const bricolage = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], variable: '--font-bricolage', display: 'swap', axes: ['opsz'] });

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
