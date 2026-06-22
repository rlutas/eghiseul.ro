'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator impozit pe pensie 2026 — impozit 10% și CASS 10% pe partea care
 * depășește 3.000 lei/lună. CASS se calculează prima și se scade din baza
 * impozitului (Cod Fiscal art. 100-101; CASS pe pensii: Legea 141/2025, 2026-2027).
 */
const PRAG = 3000;
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

export function ImpozitPensieCalculator() {
  const [brutStr, setBrut] = useState('');

  const brut = parse(brutStr);
  const valid = !isNaN(brut) && brut > 0;

  const cass = valid ? Math.round(0.1 * Math.max(0, brut - PRAG)) : 0;
  const bazaImp = valid ? Math.max(0, brut - PRAG - cass) : 0;
  const impozit = Math.round(0.1 * bazaImp);
  const net = valid ? brut - cass - impozit : 0;

  return (
    <div>
      <div>
        <Label htmlFor="pen-brut" className="mb-1.5 block">
          Pensie brută lunară (lei)
        </Label>
        <Input id="pen-brut" inputMode="numeric" value={brutStr} onChange={(e) => setBrut(e.target.value)} placeholder="ex. 4000" />
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <span className="font-bold text-secondary-900">Pensie netă încasată</span>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(net)} lei</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">CASS (10% peste 3.000 lei)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(cass)} lei</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Impozit (10% peste 3.000 lei, după CASS)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(impozit)} lei</span>
              </div>
            </div>
          </div>
          {brut <= PRAG && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-2.5">
              Pensiile până în 3.000 lei/lună sunt scutite integral de impozit și CASS.
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Impozitul (10%) și CASS (10%) se aplică doar părții care depășește 3.000 lei. CASS se reține înaintea
            impozitului și reduce baza acestuia. CASS pe pensii este în vigoare 2026-2027 (Legea 141/2025) — măsură
            contestată la CCR. Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu pensia brută lunară pentru a calcula impozitul și suma netă.</p>
      )}
    </div>
  );
}
