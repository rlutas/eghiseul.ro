'use client';

import { useState } from 'react';
import { Bell, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface OutageAlertSignupProps {
  /** Serviciul așteptat — trebuie să fie în lista albă din API ('ancpi' | 'onrc'). */
  service: string;
  /** Numele afișat al serviciului, ex. „ANCPI". */
  serviceLabel: string;
  /** Pagina de pe care se face înscrierea, pentru atribuire. */
  sourcePage: string;
}

/**
 * Captură de email pentru cei care NU comandă acum.
 *
 * Publicul unui articol de outage e împărțit în două: cei care plasează comanda
 * imediat (au CTA-ul lor) și cei care vor documentul dar așteaptă revenirea
 * sistemului — majoritatea. Al doilea grup pleca fără urmă.
 *
 * Promisiunea e îngustă și verificabilă („un singur email, când revine"), ceea
 * ce ridică rata de completare față de un newsletter generic. Bifa de marketing
 * e separată și neselectată — alerta nu e temei pentru comunicări comerciale.
 */
export function OutageAlertSignup({ service, serviceLabel, sourcePage }: OutageAlertSignupProps) {
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'loading') return;
    setState('loading');
    setError(null);
    try {
      const res = await fetch('/api/outage-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, email, marketingConsent, sourcePage }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Nu am putut salva înscrierea.');
        setState('error');
        return;
      }
      setState('done');
    } catch {
      setError('Eroare de rețea. Încearcă din nou.');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="not-prose my-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <p className="text-lg font-bold text-emerald-900">Gata — te anunțăm noi</p>
            <p className="mt-1 text-sm leading-relaxed text-emerald-800">
              Primești un email în momentul în care {serviceLabel} revine. Un singur mesaj, nimic
              altceva. Până atunci nu trebuie să verifici nimic.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose my-8 rounded-2xl border border-secondary-200 bg-secondary-50/60 p-6">
      <div className="mb-3 flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-secondary-700" />
        <div>
          <p className="text-lg font-bold text-secondary-900">
            Nu vrei să comanzi acum? Te anunțăm când revine {serviceLabel}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-secondary-900/70">
            Monitorizăm sistemele automat, la fiecare 15 minute. Îți trimitem{' '}
            <strong>un singur email</strong>, în momentul în care revin — ca să nu stai tu să
            verifici zilnic.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="adresa ta de email"
            autoComplete="email"
            disabled={state === 'loading'}
            className="h-11 grow rounded-xl border border-neutral-300 px-4 text-sm outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-100 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state === 'loading' || !email.trim()}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-secondary-900 px-5 text-sm font-bold text-white transition-all hover:bg-secondary-800 disabled:opacity-50"
          >
            {state === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Anunță-mă'
            )}
          </button>
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-secondary-900/60">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-neutral-300"
          />
          <span>
            Vreau să primesc și alte informații utile despre acte și documente (opțional — poți
            renunța oricând).
          </span>
        </label>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
