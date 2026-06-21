'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MIN = 1650; // 2.5 × ISR (660)
const MAX = 8500;
const CASS = 0.1;

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);
const r = (n: number) => Math.round(n);

export function IccCalculator() {
  const [income, setIncome] = useState('');

  const val = parseFloat(income.replace(/[.\s]/g, '').replace(',', '.'));
  const valid = !isNaN(val) && val > 0;

  let gross = 0;
  let capped: 'min' | 'max' | null = null;
  if (valid) {
    gross = 0.85 * val;
    if (gross < MIN) { gross = MIN; capped = 'min'; }
    else if (gross > MAX) { gross = MAX; capped = 'max'; }
    gross = r(gross);
  }
  const netPaid = valid ? r(gross * (1 - CASS)) : 0;

  return (
    <div>
      <div className="max-w-sm">
        <Label htmlFor="icc-income" className="mb-1.5 block">Venit net mediu lunar (lei)</Label>
        <Input id="icc-income" inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value)} placeholder="ex. 4000" />
        <p className="text-xs text-neutral-500 mt-1.5">Media venitului net din 12 luni (din 24 înainte de naștere).</p>
      </div>

      {valid && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
              <p className="text-xs text-neutral-500 mb-1">Indemnizație netă (în mână)</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(netPaid)} lei</p>
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500 mb-1">Indemnizație brută (85%)</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(gross)} lei</p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mt-3">
            {capped === 'min' && 'Sub minimul legal — se acordă indemnizația minimă (1.650 lei brut).'}
            {capped === 'max' && 'Peste plafonul maxim — se acordă indemnizația maximă (8.500 lei brut).'}
            {!capped && 'Indemnizația = 85% din venitul net mediu, între 1.650 și 8.500 lei brut.'}
            {' '}Din indemnizația brută se reține CASS 10%.
          </p>
        </div>
      )}
    </div>
  );
}
