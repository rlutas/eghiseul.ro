'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator concediu de maternitate — OUG 158/2005: 126 zile (63 prenatal +
 * 63 postnatal), indemnizație 85% din media venitului brut din ultimele 6 luni,
 * plafonată la 12 salarii minime; neimpozabilă (net = brut).
 */
const SAL_MINIM = 4050;
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

export function ConcediuMaternitateCalculator() {
  const [venitStr, setVenit] = useState('');
  const venit = parse(venitStr);
  const valid = !isNaN(venit) && venit > 0;

  const plafon = 12 * SAL_MINIM;
  const baza = valid ? Math.min(venit, plafon) : 0;
  const lunar = baza * 0.85;
  const total = (lunar / 30) * 126;

  return (
    <div>
      <div>
        <Label htmlFor="mat-venit" className="mb-1.5 block">
          Venit brut mediu lunar (ultimele 6 luni)
        </Label>
        <Input id="mat-venit" inputMode="numeric" value={venitStr} onChange={(e) => setVenit(e.target.value)} placeholder="ex. 5000" />
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <div>
              <span className="block font-bold text-secondary-900">Indemnizație lunară (85%)</span>
              <span className="text-xs text-neutral-500">netă — neimpozabilă</span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(lunar)} lei</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Durată concediu</span>
                <span className="text-sm font-bold text-secondary-900">126 zile (63 + 63)</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Total estimat pe 126 zile</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(total)} lei</span>
              </div>
              {venit > plafon && (
                <div className="flex justify-between px-4 py-2.5 bg-amber-50">
                  <span className="text-sm text-amber-700">Baza plafonată la 12 salarii minime</span>
                  <span className="text-sm font-bold text-amber-700">{fmt(plafon)} lei</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Indemnizația de maternitate este 85% din media venitului brut din ultimele 6 luni (plafonată la 12 salarii
            minime) și este neimpozabilă — nu se rețin impozit, CAS sau CASS (OUG 158/2005, Cod Fiscal art. 62). Se
            acordă 126 de zile, minim 42 de zile postnatal obligatorii. Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu venitul brut mediu pentru a estima indemnizația.</p>
      )}
    </div>
  );
}
