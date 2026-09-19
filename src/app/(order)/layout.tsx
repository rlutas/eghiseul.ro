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

export default async function OrderLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand();
  const isDocumentero = brand.id === 'documentero';
  return (
    <BrandProvider brandId={brand.id}>
      {isDocumentero ? <HeaderDocumentero /> : <Header />}
      {children}
      {!isDocumentero && <WhatsAppFloat />}
    </BrandProvider>
  );
}
