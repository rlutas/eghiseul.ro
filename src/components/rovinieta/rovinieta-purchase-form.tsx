'use client';

import { useState } from 'react';
import { ArrowRight, Lock, BadgeCheck, Zap } from 'lucide-react';

const CHECKOUT_BASE = 'https://erovinieta.net/checkout';
const UTM = 'utm_source=eghiseul&utm_medium=referral&utm_campaign=rovinieta-landing&utm_content=hero-form';

// Categorii oficiale CNAIR (A-H). Motocicletele sunt scutite (nu există rovinietă).
const CATEGORIES = [
  { value: 'A', label: 'A - Autoturisme (până la 3,5t)' },
  { value: 'B', label: 'B - Marfă, până la 3,5t' },
  { value: 'C', label: 'C - Marfă, 3,5 - 7,5t' },
  { value: 'D', label: 'D - Marfă, 7,5 - 12t' },
  { value: 'E', label: 'E - Marfă, peste 12t (max 3 axe)' },
  { value: 'F', label: 'F - Marfă, peste 12t (min 4 axe)' },
  { value: 'G', label: 'G - Transport persoane (9-23 locuri)' },
  { value: 'H', label: 'H - Transport persoane (peste 23 locuri)' },
];

// Perioadele pentru categoria A (autoturisme), cazul majoritar. La finalizare,
// platforma erovinieta.net afișează perioadele corecte pentru categoria aleasă.
const PERIODS = [
  { value: 'TWELVE_MONTHS', label: '12 luni - cea mai populară' },
  { value: 'SIXTY_DAYS', label: '60 de zile' },
  { value: 'THIRTY_DAYS', label: '30 de zile' },
  { value: 'TEN_DAYS', label: '10 zile' },
  { value: 'ONE_DAY', label: '1 zi' },
];

export function RovinietaPurchaseForm() {
  const [category, setCategory] = useState('A');
  const [period, setPeriod] = useState('TWELVE_MONTHS');
  const [plate, setPlate] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = plate.replace(/\s/g, '').toUpperCase();
    if (cleaned.length < 4) {
      setError(true);
      return;
    }
    setError(false);
    const url = `${CHECKOUT_BASE}?category=${category}&period=${period}&plate=${encodeURIComponent(cleaned)}&${UTM}`;
    window.open(url, '_blank', 'noopener');
  }

  return (
    <div className="relative rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-neutral-100">
      <div className="absolute top-0 left-10 right-10 h-1 rounded-b bg-primary-500" aria-hidden="true" />

      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-secondary-900">Cumpără Rovinieta</h2>
        <p className="text-sm text-neutral-600 mt-1">Completează datele și continuă către plată</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="categoria" className="block text-sm font-semibold text-secondary-900 mb-2">
            Categorie vehicul <span className="text-primary-600">*</span>
          </label>
          <select
            id="categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base font-medium text-secondary-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/15 transition"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="perioada" className="block text-sm font-semibold text-secondary-900 mb-2">
            Perioada de valabilitate <span className="text-primary-600">*</span>
          </label>
          <select
            id="perioada"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full rounded-xl border-2 border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base font-medium text-secondary-900 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/15 transition"
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="nr-inmatriculare" className="block text-sm font-semibold text-secondary-900 mb-2">
            Număr de înmatriculare <span className="text-primary-600">*</span>
          </label>
          <input
            id="nr-inmatriculare"
            type="text"
            value={plate}
            onChange={(e) => { setPlate(e.target.value.toUpperCase()); if (error) setError(false); }}
            placeholder="Ex: B 123 ABC"
            aria-invalid={error}
            className={`w-full rounded-xl border-2 px-4 py-3.5 text-base font-medium text-secondary-900 focus:outline-none focus:ring-4 transition ${
              error
                ? 'border-red-400 bg-red-50 focus:ring-red-500/15'
                : 'border-neutral-200 bg-neutral-50 focus:border-primary-500 focus:bg-white focus:ring-primary-500/15'
            }`}
          />
          {error && (
            <p className="text-xs text-red-600 mt-1.5">Te rugăm să introduci numărul de înmatriculare.</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-4 text-lg font-bold text-secondary-900 shadow-lg shadow-primary-500/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/40 transition"
        >
          Continuă către plată
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 pt-5 border-t border-neutral-100">
        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-600"><Lock className="h-4 w-4 text-primary-600" aria-hidden="true" /> Securizat</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-600"><BadgeCheck className="h-4 w-4 text-primary-600" aria-hidden="true" /> Oficial CNAIR</span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-600"><Zap className="h-4 w-4 text-primary-600" aria-hidden="true" /> Activare instant</span>
      </div>
    </div>
  );
}
