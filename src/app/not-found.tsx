import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Pagina nu a fost găsită (404)',
  robots: { index: false, follow: true },
};

/**
 * Brand-neutral on purpose (10.11.2026). The root not-found tree is embedded in
 * the RSC payload of every page on every host, so the eghiseul footer and links
 * that used to live here showed up in the HTML of cazierfiscal.com.
 */

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <p className="text-6xl font-bold tracking-tight text-primary sm:text-7xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Pagina nu a fost găsită
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Pagina căutată nu există sau a fost mutată. Verifică adresa sau întoarce-te pe pagina principală.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="size-4" />
              Înapoi acasă
            </Link>
          </Button>
        </div>

      </section>
    </main>
  );
}
