'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureAttribution } from '@/lib/analytics/attribution';

/**
 * Capturează sursa traficului la fiecare navigare.
 *
 * `usePathname` + `useSearchParams` ca să prindem și navigările client-side —
 * App Router nu remontează componenta la schimbarea rutei.
 */
function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureAttribution();
  }, [pathname, searchParams]);

  return null;
}

/**
 * Randat în layout, deci rulează pe tot site-ul. Nu afișează nimic.
 *
 * Suspense e obligatoriu: `useSearchParams` forțează CSR bailout pentru tot ce
 * e deasupra lui, iar fără boundary paginile statice ar deveni dinamice.
 */
export function AttributionTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
