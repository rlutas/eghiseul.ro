'use client';

import { useEffect, useState } from 'react';

interface StatusResponse {
  operational: boolean;
  services: Record<string, { up: boolean; label: string }>;
  updatedAt: string;
}

/**
 * "Stare sistem" badge for digital, auto-issued services (Certificat Constatator).
 * Shows whether the ONRC portal + automated issuance are operational. Polls /api/status.
 */
export function SystemStatus({
  className = '',
  service = 'onrc',
}: {
  className?: string;
  /** Which provider's status to show: 'onrc' (constatator) or 'ancpi' (carte funciară). */
  service?: 'onrc' | 'ancpi';
}) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`/api/status?service=${service}`, { cache: 'no-store' });
        const j = (await r.json()) as StatusResponse;
        if (alive) setStatus(j);
      } catch {
        /* keep last */
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [service]);

  const operational = status?.operational ?? true; // optimistic before first load
  const dot = (up: boolean) => (up ? 'bg-green-500' : 'bg-red-500');

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={loading ? 'Verificăm starea sistemului' : operational ? 'Sistem operațional, eliberare automată 24/7' : 'Sistemul funcționează cu întârzieri'}
      className={`rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            {operational && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:hidden" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot(operational)}`} />
          </span>
          <span className="text-sm font-semibold text-secondary-900">
            {loading ? 'Verificăm starea sistemului…' : operational ? 'Sistem operațional' : 'Funcționare cu întârzieri'}
          </span>
        </div>
        <span className={`text-xs font-medium ${operational ? 'text-green-700' : 'text-neutral-500'}`}>
          Eliberare automată · 24/7
        </span>
      </div>

      {status && (
        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {Object.entries(status.services).map(([key, s]) => (
            <div key={key} className="flex items-center gap-2 text-xs text-neutral-700">
              <span className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${dot(s.up)}`} aria-hidden="true" />
              <span>
                {s.label}: <span className="font-semibold text-secondary-900">{s.up ? 'operațional' : 'indisponibil'}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
