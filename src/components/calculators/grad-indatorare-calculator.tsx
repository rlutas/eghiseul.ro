'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator grad de îndatorare (DTI) — Regulament BNR 17/2012 (mod. 6/2018):
 * max 40% din venitul net pentru credite RON (45% prima locuință), 20% în valută
 * (25% prima locuință).
 */
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

export function GradIndatorareCalculator() {
  const [venitStr, setVenit] = useState('');
  const [rateStr, setRate] = useState('');
  const [valuta, setValuta] = useState<'ron' | 'fx'>('ron');
  const [primaCasa, setPrimaCasa] = useState(false);

  const venit = parse(venitStr);
  const rate = parse(rateStr) || 0;
  const valid = !isNaN(venit) && venit > 0;

  const maxPct = (valuta === 'ron' ? 40 : 20) + (primaCasa ? 5 : 0);
  const grad = valid ? (rate / venit) * 100 : 0;
  const rataMax = valid ? venit * (maxPct / 100) : 0;
  const disponibil = Math.max(rataMax - rate, 0);
  const peste = grad > maxPct;

  const btn = (active: boolean) =>
    cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all', active ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300');

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gi-venit" className="mb-1.5 block">Venit net lunar (lei)</Label>
          <Input id="gi-venit" inputMode="numeric" value={venitStr} onChange={(e) => setVenit(e.target.value)} placeholder="ex. 6000" />
        </div>
        <div>
          <Label htmlFor="gi-rate" className="mb-1.5 block">Rate lunare existente (lei)</Label>
          <Input id="gi-rate" inputMode="numeric" value={rateStr} onChange={(e) => setRate(e.target.value)} placeholder="ex. 800" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="mb-1.5 block">Moneda creditului</Label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setValuta('ron')} className={btn(valuta === 'ron')}>Lei (RON)</button>
            <button type="button" onClick={() => setValuta('fx')} className={btn(valuta === 'fx')}>Valută</button>
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Prima locuință?</Label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPrimaCasa(true)} className={btn(primaCasa)}>Da</button>
            <button type="button" onClick={() => setPrimaCasa(false)} className={btn(!primaCasa)}>Nu</button>
          </div>
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-3">
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 flex items-center justify-between">
            <div>
              <span className="block font-bold text-secondary-900">Grad de îndatorare actual</span>
              <span className="text-xs text-neutral-500">maxim admis: {maxPct}%</span>
            </div>
            <span className={cn('text-2xl font-extrabold', peste ? 'text-red-600' : 'text-secondary-900')}>{grad.toFixed(1)}%</span>
          </div>
          <div className="rounded-xl border border-neutral-200 px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-700">Rată maximă disponibilă pentru un credit nou</span>
            <span className="font-bold text-secondary-900">{fmt(disponibil)} lei/lună</span>
          </div>
          {peste && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
              Gradul de îndatorare depășește plafonul de {maxPct}% — un credit nou ar putea fi respins.
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Plafoane BNR: 40% din venitul net pentru credite în lei (45% pentru prima locuință), 20% în valută (25%
            prima locuință). Băncile aplică și un test de stres (șoc de dobândă/curs). Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu venitul net și ratele existente pentru a calcula gradul de îndatorare.</p>
      )}
    </div>
  );
}
