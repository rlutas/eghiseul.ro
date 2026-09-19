'use client';

import { useEffect, useState } from 'react';
import { GHID_SEEN_EVENT, GHID_SEEN_KEY } from '@/app/(eghiseul)/admin/ghid/mark-seen';

/**
 * Badge cu numărul livrărilor nevăzute, pe itemul „Ghid & noutăți" din meniu.
 * „Văzut" = a deschis pagina (MarkGhidSeen). Fără vizită anterioară, numărăm
 * livrările din ultimele 14 zile — un coleg nou vede că e ceva de citit.
 */
export function GhidNavBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let dates: string[] = [];
    const compute = () => {
      let lastSeen: string | null = null;
      try {
        lastSeen = localStorage.getItem(GHID_SEEN_KEY);
      } catch {
        /* ignore */
      }
      const since = lastSeen ?? new Date(Date.now() - 14 * 86400_000).toISOString().slice(0, 10);
      setCount(dates.filter((d) => d > since).length);
    };
    fetch('/api/admin/knowledge/feed')
      .then((r) => r.json())
      .then((json) => {
        dates = Array.isArray(json?.data?.dates) ? json.data.dates : [];
        compute();
      })
      .catch(() => setCount(0));
    window.addEventListener(GHID_SEEN_EVENT, compute);
    return () => window.removeEventListener(GHID_SEEN_EVENT, compute);
  }, []);

  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[11px] font-bold text-secondary-900">
      {count > 9 ? '9+' : count}
    </span>
  );
}
