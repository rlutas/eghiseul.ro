'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Contribuții PFA + Declarația Unică (Cod Fiscal). Plafoanele folosesc salariul
 * minim de la 1 ian al anului de venit = 4.050 lei (NU se schimbă la mijloc de an).
 * CASS plafon max: 60 salarii minime (venit 2025) / 72 (venit 2026).
 */
const W = 4050;
const CASS_FLOOR_BASE = 6 * W; // 24.300
const CAS_T1 = 12 * W; // 48.600
const CAS_T2 = 24 * W; // 97.200
const MIN_CASS = 0.1 * CASS_FLOOR_BASE; // 2.430

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);

export function PfaCalculator() {
  const [year, setYear] = useState<'2025' | '2026'>('2026');
  const [netStr, setNet] = useState('');
  const [altaSursa, setAltaSursa] = useState(false);

  const net = parseFloat(netStr.replace(/[.\s]/g, '').replace(',', '.'));
  const valid = !isNaN(net) && net >= 0;

  const cassCeiling = (year === '2026' ? 72 : 60) * W;

  let cass = 0;
  let cas = 0;
  let impozit = 0;
  if (valid) {
    if (net >= CASS_FLOOR_BASE) cass = 0.1 * Math.min(net, cassCeiling);
    else cass = altaSursa ? 0 : MIN_CASS;

    if (net >= CAS_T2) cas = 0.25 * CAS_T2;
    else if (net >= CAS_T1) cas = 0.25 * CAS_T1;
    else cas = 0;

    impozit = 0.1 * Math.max(0, net - cas - cass);
  }
  const total = Math.round(cass + cas + impozit);
  const venitDupa = valid ? Math.round(net - total) : 0;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pfa-net" className="mb-1.5 block">Venit net anual (lei)</Label>
          <Input id="pfa-net" inputMode="numeric" value={netStr} onChange={(e) => setNet(e.target.value)} placeholder="ex. 120000" />
          <p className="text-xs text-neutral-500 mt-1.5">Venit brut − cheltuieli deductibile (sistem real).</p>
        </div>
        <div>
          <Label className="mb-1.5 block">Anul de venit</Label>
          <div className="flex gap-2">
            {(['2025', '2026'] as const).map((y) => (
              <button key={y} type="button" onClick={() => setYear(y)}
                className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  year === y ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
                {y}
              </button>
            ))}
          </div>
          <p className="text-xs text-neutral-500 mt-1.5">Plafon CASS: {year === '2026' ? '72' : '60'} salarii minime.</p>
        </div>
      </div>

      <label className="flex items-center gap-2 mt-4 text-sm text-neutral-700 cursor-pointer">
        <input type="checkbox" checked={altaSursa} onChange={(e) => setAltaSursa(e.target.checked)} className="w-4 h-4 accent-primary-600" />
        Sunt deja asigurat din altă sursă (salariat / pensionar)
      </label>

      {valid && (
        <div className="mt-6">
          <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 mb-4">
            <p className="text-xs text-neutral-500 mb-1">Total contribuții + impozit</p>
            <p className="text-2xl font-extrabold text-secondary-900">{fmt(total)} lei</p>
            <p className="text-xs text-neutral-500 mt-1">Rămas după taxe: {fmt(venitDupa)} lei</p>
          </div>
          <table className="w-full text-sm">
            <tbody className="[&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-neutral-100">
              <tr><td className="text-neutral-600">CASS (sănătate, 10%)</td><td className="text-right tabular-nums">{fmt(Math.round(cass))} lei</td></tr>
              <tr><td className="text-neutral-600">CAS (pensie, 25%)</td><td className="text-right tabular-nums">{fmt(Math.round(cas))} lei</td></tr>
              <tr><td className="text-neutral-600">Impozit pe venit (10%)</td><td className="text-right tabular-nums">{fmt(Math.round(impozit))} lei</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-neutral-500 mt-3">
            Estimare orientativă (Declarația Unică). CAS se datorează doar peste 12 salarii minime;
            CASS are minim {fmt(MIN_CASS)} lei. Verifică cu un contabil pentru situații speciale.
          </p>
        </div>
      )}
    </div>
  );
}
