'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, Mail, BellRing, CheckCircle2 } from 'lucide-react';

const KEY = 'egh_newsletter';
const SUPPRESS_DAYS = 30;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pop-up de captare email — apare pe paginile de calculator după ce userul a
 * derulat ~50% (a văzut rezultatul). Dismissable, nu reapare 30 de zile (sau
 * după abonare). GDPR: consimțământ explicit + link la politică.
 */
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok'>('idle');
  const [err, setErr] = useState('');
  const pathname = usePathname();

  const suppress = useCallback(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ t: Date.now() }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const { t } = JSON.parse(raw);
        if (Date.now() - t < SUPPRESS_DAYS * 86400000) return;
      }
    } catch {
      /* ignore */
    }
    let shown = false;
    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.body.scrollHeight;
      if (!shown && total > 0 && scrolled / total > 0.5) {
        shown = true;
        setOpen(true);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => {
    setOpen(false);
    suppress();
  };

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
    const slug = pathname?.split('/').filter(Boolean).pop() ?? '';
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent: true, source: `calculator:${slug}` }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('ok');
        suppress();
      } else {
        setStatus('idle');
        setErr(data.error || 'A apărut o eroare. Încearcă din nou.');
      }
    } catch {
      setStatus('idle');
      setErr('Eroare de rețea. Încearcă din nou.');
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Abonare la alerte și ghiduri"
      className="fixed z-[60] bottom-0 inset-x-0 sm:bottom-5 sm:right-5 sm:inset-x-auto sm:max-w-sm w-full"
    >
      <div className="m-3 sm:m-0 rounded-2xl border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(6,16,31,0.18)] overflow-hidden">
        <div className="relative bg-gradient-to-br from-secondary-900 to-[#0C1A2F] px-5 pt-5 pb-4">
          <button
            type="button"
            onClick={close}
            aria-label="Închide"
            className="absolute top-3 right-3 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-primary-400 mb-1.5">
            <BellRing className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Gratuit</span>
          </div>
          <h3 className="text-white font-extrabold text-lg leading-snug">
            Alerte fiscale + ghiduri pe email
          </h3>
        </div>

        <div className="p-5">
          {status === 'ok' ? (
            <div className="flex items-start gap-3 py-2">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-secondary-900">Gata, te-ai abonat!</p>
                <p className="text-sm text-neutral-600">Îți trimitem alertele și ghidurile importante. Poți închide fereastra.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <p className="text-sm text-neutral-600">
                Primește alerte despre schimbările fiscale și legislative + ghiduri gratuite, direct pe email.
              </p>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplu.ro"
                  aria-label="Adresa ta de email"
                  className="w-full h-11 pl-9 pr-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <label className="flex items-start gap-2 text-xs text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-primary-600 flex-shrink-0"
                />
                <span>
                  Sunt de acord să primesc emailuri și am citit{' '}
                  <Link href="/politica-de-confidentialitate/" className="text-primary-700 underline" target="_blank">
                    politica de confidențialitate
                  </Link>
                  .
                </span>
              </label>
              {err && <p className="text-xs text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold text-sm transition-colors disabled:opacity-60"
              >
                {status === 'loading' ? 'Se trimite…' : 'Abonează-mă gratuit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
