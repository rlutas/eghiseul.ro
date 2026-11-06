/**
 * eghiseul.ro chrome — every public eghiseul route lives under this group so
 * the header stays a static, brand-fixed component (no `headers()` call, so
 * ISR/static pages stay static). The shared order/account routes are in
 * `(order)`, where the header is chosen per host; documentero's public pages
 * are in `documentero/` with their own chrome.
 */
import { Header } from '@/components/shared/header';
import { BlackFridayBar } from '@/components/shared/black-friday-bar';
import { WhatsAppFloat } from '@/components/shared/whatsapp-float';
import { CookieConsent } from '@/components/consent/cookie-consent';

export default function EghiseulLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* After Header: it is fixed, and its spacer pushes the bar below it. */}
      <Header />
      <BlackFridayBar belowFixedHeader />
      {children}
      <WhatsAppFloat />
      <CookieConsent />
    </>
  );
}
