'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { usePreviewAs, withPreview } from '@/lib/collaborator/preview';

/**
 * Gard cu parolă pentru paginile private din portalul de colaborator
 * (Decont lunar, Serviciile mele). Parola o setează adminul, o știe titularul.
 *
 * Gardul REAL e pe server (`requirePrivateUnlock` în API-uri); componenta doar
 * întreabă starea și arată formularul. Cookie-ul de deblocare ține 8h; butonul
 * „Blochează" îl șterge pe loc (de folosit când titularul se ridică de la calculator).
 *
 * Copiii sunt montați DOAR după deblocare, deci fetch-urile lor pornesc cu
 * cookie-ul deja pus.
 */
export function PrivateGate({ children }: { children: React.ReactNode }) {
  const previewAs = usePreviewAs();
  const [state, setState] = useState<'loading' | 'locked' | 'unlocked'>('loading');
  const [required, setRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(withPreview('/api/collaborator/unlock', previewAs));
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Eroare');
      setRequired(!!json.data.required);
      setState(json.data.unlocked ? 'unlocked' : 'locked');
    } catch {
      // Dacă nu putem citi starea, nu deschidem: mai bine un formular în plus
      // decât o pagină privată deschisă din greșeală.
      setRequired(true);
      setState('locked');
    }
  }, [previewAs]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !previewAs && window.location.search.includes('as=')) return;
    void refresh();
  }, [previewAs, refresh]);

  const unlock = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/collaborator/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Parolă greșită.');
      setPassword('');
      setState('unlocked');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Parolă greșită.');
    } finally {
      setBusy(false);
    }
  };

  const lock = async () => {
    await fetch('/api/collaborator/unlock', { method: 'DELETE' });
    setState('locked');
  };

  if (state === 'loading') {
    return <p className="text-sm text-slate-500">Se încarcă...</p>;
  }

  if (state === 'locked') {
    return (
      <div className="mx-auto mt-10 max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Lock className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Pagină protejată</h2>
            <p className="text-xs text-slate-500">Decontul și prețurile se văd doar cu parola internă.</p>
          </div>
        </div>
        <form onSubmit={unlock} className="space-y-3">
          <input
            type="password"
            autoFocus
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parola internă"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy || !password}
            className="w-full rounded-lg bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 disabled:opacity-50"
          >
            {busy ? 'Se verifică...' : 'Deblochează'}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-400">
          Nu știi parola? Ea e la titularul contului. Comenzile se lucrează normal, fără parolă.
        </p>
      </div>
    );
  }

  return (
    <>
      {required && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="inline-flex items-center gap-2"><Unlock className="h-3.5 w-3.5" /> Pagină privată deblocată (8 ore).</span>
          <button type="button" onClick={lock} className="inline-flex items-center gap-1 font-medium underline hover:no-underline">
            <Lock className="h-3.5 w-3.5" /> Blochează
          </button>
        </div>
      )}
      {children}
    </>
  );
}
