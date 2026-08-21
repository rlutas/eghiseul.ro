'use client';

import { useEffect, useState } from 'react';

interface StatusResponse {
  operational: boolean;
  services: Record<string, { up: boolean; label: string }>;
  /** Start of the currently-open outage window (platform_outages), if any. */
  outageSince?: string | null;
  updatedAt: string;
}

/**
 * "Stare sistem" badge for digital, auto-issued services (Certificat Constatator).
 * Shows whether the ONRC portal + automated issuance are operational. Polls /api/status.
 */
export function SystemStatus({
  className = '',
  service = 'onrc',
  autoIssued = true,
  compact = false,
}: {
  className?: string;
  /** Which provider's status to show: 'onrc' (constatator) or 'ancpi' (carte funciară). */
  service?: 'onrc' | 'ancpi';
  /**
   * False for manual services that merely DEPEND on the portal (identificare
   * imobil, copii CF) — hides the „Eliberare automată · 24/7" claim, which is
   * only true for worker-issued services.
   */
  autoIssued?: boolean;
  /**
   * O singură linie: bulină + „Sistem ANCPI indisponibil (din 14 iulie)".
   * Pentru cardul de preț de pe paginile de servicii, unde varianta completă
   * (griduri + paragraful amber) lungea prea mult secțiunea (feedback Raul,
   * 05.08.2026). Când sistemul e operațional nu randează NIMIC — nu ocupă loc.
   */
  compact?: boolean;
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

  if (compact) {
    // Nimic cât timp e operațional (sau încă verificăm) — linia apare doar la
    // căderi. Detaliile complete rămân în wizard (varianta full din sidebar).
    if (loading || operational) return null;
    const since = status?.outageSince
      ? new Date(status.outageSince).toLocaleString('ro-RO', {
          day: 'numeric',
          month: 'long',
          timeZone: 'Europe/Bucharest',
        })
      : null;
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 ${className}`}
      >
        <span className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-red-500" aria-hidden="true" />
        <span className="text-xs font-medium text-red-900">
          {service === 'ancpi' ? (
            <>
              Platformele online ANCPI pentru public sunt încă oprite
              {since ? ` (din ${since})` : ''} — extrasul îl obținem în{' '}
              <strong>2 zile lucrătoare</strong>, prin partener autorizat.
            </>
          ) : (
            <>
              Sistemul ONRC este momentan indisponibil{since ? ` (din ${since})` : ''}
            </>
          )}
        </span>
      </div>
    );
  }

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
          {autoIssued ? 'Eliberare automată · 24/7' : `Portal ${service === 'ancpi' ? 'ANCPI' : 'ONRC'}`}
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

      {/* Since-when marker for the current outage — real data from our own
          portal monitoring (platform_outages), not a static label. */}
      {!loading && !operational && status?.outageSince && (
        <p className="mt-2 text-xs text-neutral-500">
          Indisponibil din{' '}
          <span className="font-semibold text-secondary-900">
            {new Date(status.outageSince).toLocaleString('ro-RO', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Europe/Bucharest',
            })}
          </span>{' '}
          {service === 'ancpi'
            ? ' — monitorizăm continuu, iar între timp eliberăm extrasul prin partener autorizat.'
            : ' — monitorizăm continuu și reluăm eliberarea automat la revenire.'}
        </p>
      )}

      {/* Reassurance while the provider portal is down: orders keep queuing and
          the worker issues them automatically the moment the portal recovers —
          the customer doesn't need to wait or come back. */}
      {/* ANCPI, din 21.08: nu mai așteptăm portalul public — cererea o depune
          la OCPI un partener autorizat, cu acces la e-Terra din 12 august.
          Promisiunea „se eliberează automat la revenire" devenise falsă. */}
      {!loading && !operational && service === 'ancpi' && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          <strong>Atenție:</strong> sistemele ANCPI revin <strong>etapizat</strong>, dar încă cu
          probleme — platformele online pentru public rămân oprite, iar la ghișee s-au adunat
          cererile din perioada blocajului. <strong>Poți comanda în continuare:</strong> cererea o
          depune la OCPI un <strong>partener autorizat</strong>, iar termenul nostru este de{' '}
          <strong>2 zile lucrătoare</strong>. Primești extrasul pe email.
        </p>
      )}

      {!loading && !operational && service !== 'ancpi' && (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
          <strong>Atenție:</strong> sistemele naționale ONRC sunt temporar indisponibile, însă{' '}
          <strong>poți plasa comanda în continuare</strong>. Cererea ta este înregistrată și va fi
          procesată <strong>cu prioritate, automat</strong>, imediat ce sistemele redevin
          funcționale. Monitorizăm permanent situația și te anunțăm pe email când documentul este
          eliberat. Mulțumim pentru înțelegere!
        </p>
      )}
    </div>
  );
}
