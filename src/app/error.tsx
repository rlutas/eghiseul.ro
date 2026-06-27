'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console (and any wired error reporter) in English.
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <main id="main-content" className="min-h-screen">
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center sm:py-32">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">A apărut o eroare</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Ne pare rău, ceva n-a mers cum trebuie. Încearcă din nou sau revino mai târziu. Dacă problema persistă,
          scrie-ne la{' '}
          <a href="mailto:contact@eghiseul.ro" className="text-primary hover:underline">
            contact@eghiseul.ro
          </a>
          .
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-muted-foreground">Cod eroare: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={reset}>
            <RotateCcw className="size-4" />
            Încearcă din nou
          </Button>
          <Button asChild variant="outline" size="lg">
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
