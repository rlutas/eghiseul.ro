'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BLACK_FRIDAY_CODE, BLACK_FRIDAY_ENDS_AT, isBlackFridayActive } from '@/lib/coupons/black-friday';

const HIDDEN_PREFIXES = ['/admin', '/colaborator'];
const END_MS = new Date(BLACK_FRIDAY_ENDS_AT).getTime();

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const pad = (n: number) => String(n).padStart(2, '0');
  const clock = `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  return days > 0 ? `${days}z ${clock}` : clock;
}

/**
 * The countdown counts to a fixed date and the bar disappears when it ends.
 * The clock starts after mount so server and client render the same markup.
 */
export function BlackFridayBar({ belowFixedHeader = false }: { belowFixedHeader?: boolean }) {
  const pathname = usePathname();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(END_MS - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isBlackFridayActive()) return null;
  if (remaining !== null && remaining <= 0) return null;
  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) return null;

  return (
    <aside
      aria-label="Black Friday"
      className={`relative z-40 bg-neutral-950 px-4 py-2 text-center text-white ${belowFixedHeader ? 'xl:-mt-9' : ''}`}
    >
      <p className="text-sm font-semibold">
        Black Friday: −20% la caziere, integritate, naștere, căsătorie; −10% la restul documentelor.{' '}
        <span className="whitespace-nowrap">
          Cod <span className="font-mono font-bold text-amber-300">{BLACK_FRIDAY_CODE}</span>, aplicat automat ·{' '}
          <span className="inline-block min-w-[6.5rem] text-left font-mono font-bold tabular-nums text-amber-300">
            {remaining === null ? '' : formatRemaining(remaining)}
          </span>
        </span>
      </p>
      <p className="mt-0.5 text-xs text-neutral-300">
        Până luni, 16.11.2026, ora 23:59. La prețul de bază, fără opțiuni, urgență, traducere, legalizare, livrare, rovinietă.
      </p>
    </aside>
  );
}
