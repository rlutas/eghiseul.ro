'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Newsletter-gated lead magnet: subscribe (GDPR opt-in via /api/newsletter,
 * tracked `source`) → the checklist PDF download unlocks. The file itself is
 * a public static asset — the gate is a soft exchange, not DRM.
 */
export function ChecklistDownload({
  file,
  title,
  description,
  source,
}: {
  /** Public path of the PDF, e.g. /downloads/checklist-cadastru-intabulare.pdf */
  file: string;
  title: string;
  description: string;
  /** Newsletter source tag, e.g. 'checklist-cadastru' */
  source: string;
}) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok'>('idle');
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!EMAIL_RE.test(email.trim())) {
      setErr('Introdu o adresă de email validă.');
      return;
    }
    if (!consent) {
      setErr('Bifează consimțământul pentru a continua.');
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent: true, source }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('ok');
        // Kick off the download right away — the visible link stays as backup.
        window.location.href = file;
      } else {
        setStatus('idle');
        setErr(data.error || 'A apărut o eroare. Încearcă din nou.');
      }
    } catch {
      setStatus('idle');
      setErr('Eroare de rețea. Încearcă din nou.');
    }
  };

  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-primary-200">
      <div className="bg-gradient-to-br from-secondary-900 to-[#0C1A2F] px-6 py-5">
        <p className="flex items-center gap-2 text-base font-bold text-white">
          <FileText className="h-5 w-5 text-primary-500" aria-hidden="true" />
          {title}
        </p>
        <p className="mt-1 text-sm text-white/80">{description}</p>
      </div>
      <div className="bg-primary-50 px-6 py-5">
        {status === 'ok' ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-secondary-900">✓ Gata — descărcarea a început.</p>
            <a
              href={file}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Descarcă din nou (PDF)
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresa ta de email"
                aria-label="Adresa de email"
                className="h-11 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="h-11 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {status === 'loading' ? 'Se trimite…' : 'Descarcă gratuit'}
              </button>
            </div>
            <label className="flex items-start gap-2 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Sunt de acord să primesc pe email ghiduri și noutăți de la eGhișeul.ro. Mă pot dezabona
                oricând, cu un click.
              </span>
            </label>
            {err && <p className="text-xs font-semibold text-red-600">{err}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
