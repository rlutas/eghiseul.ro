import Link from 'next/link';
import { Home, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/home/footer';

export const metadata = {
  title: 'Pagina nu a fost găsită (404)',
  robots: { index: false, follow: true },
};

const suggestions = [
  { href: '/servicii/cazier-judiciar-online/', label: 'Cazier judiciar' },
  { href: '/servicii/extras-carte-funciara/', label: 'Extras carte funciară' },
  { href: '/servicii/certificat-constatator-online/', label: 'Certificat constatator' },
  { href: '/servicii/', label: 'Toate serviciile' },
];

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <p className="text-6xl font-bold tracking-tight text-primary sm:text-7xl">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Pagina nu a fost găsită
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Pagina căutată nu există sau a fost mutată. Verifică adresa sau pornește de la una dintre opțiunile de mai jos.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="size-4" />
              Înapoi acasă
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/servicii/">
              <Search className="size-4" />
              Vezi serviciile
            </Link>
          </Button>
        </div>

        <div className="mt-12 w-full max-w-xl">
          <p className="mb-4 text-sm font-medium text-muted-foreground">Servicii populare</p>
          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <FileText className="size-4 shrink-0 text-primary" />
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
