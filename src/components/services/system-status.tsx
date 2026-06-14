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
export function SystemStatus({ className = '' }: { className?: string }) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch('/api/status', { cache: 'no-store' });
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
  }, []);

  const operational = status?.operational ?? true; // optimistic before first load
  const dot = (up: boolean) => (up ? 'bg-green-500' : 'bg-red-500');

  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {operational && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:hidden" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dot(operational)}`} />
          </span>
          <span className="text-sm font-semibold text-secondary-900">
            {loading ? 'Verificăm starea sistemului…' : operational ? 'Sistem operațional' : 'Funcționare cu întârzieri'}
          </span>
        </div>
        <span className="text-xs font-medium text-green-700">Eliberare automată · 24/7</span>
      </div>

      {status && (
        <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {Object.entries(status.services).map(([key, s]) => (
            <div key={key} className="flex items-center gap-2 text-xs text-neutral-600">
              <span className={`inline-block h-2 w-2 rounded-full ${dot(s.up)}`} />
              {s.label}: <span className="font-medium text-secondary-900">{s.up ? 'operațional' : 'indisponibil'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
