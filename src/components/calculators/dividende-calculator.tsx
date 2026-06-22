'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator dividende 2026 — impozit 16% (Legea 141/2025, dividende distribuite
 * din 1 ian 2026) + CASS 10% pe plafoane (6/12/24 salarii minime) pe venitul
 * cumulat extra-salarial. Salariul minim de referință CASS 2026 = 4.050 lei.
 */
const W = 4050;
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

function cassTier(base: number): { cass: number; prag: string } {
  if (base < 6 * W) return { cass: 0, prag: 'sub 6 salarii minime (24.300 lei) — fără CASS' };
  if (base < 12 * W) return { cass: 0.1 * 6 * W, prag: '6 salarii minime (bază 24.300 lei)' };
  if (base < 24 * W) return { cass: 0.1 * 12 * W, prag: '12 salarii minime (bază 48.600 lei)' };
  return { cass: 0.1 * 24 * W, prag: '24 salarii minime (bază 97.200 lei) — plafon maxim' };
}

export function DividendeCalculator() {
  const [brutStr, setBrut] = useState('');
  const [alteStr, setAlte] = useState('');

  const brut = parse(brutStr);
  const alte = parse(alteStr) || 0;
  const valid = !isNaN(brut) && brut > 0;

  const impozit = valid ? Math.round(brut * 0.16) : 0;
  const { cass, prag } = cassTier((valid ? brut : 0) + alte);
  const net = valid ? brut - impozit - cass : 0;
  const rata = valid && brut > 0 ? ((impozit + cass) / brut) * 100 : 0;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="div-brut" className="mb-1.5 block">
            Dividende brute (lei)
          </Label>
          <Input
            id="div-brut"
            inputMode="numeric"
            value={brutStr}
            onChange={(e) => setBrut(e.target.value)}
            placeholder="ex. 100000"
          />
        </div>
        <div>
          <Label htmlFor="div-alte" className="mb-1.5 block">
            Alte venituri extra-salariale/an (opțional)
          </Label>
          <Input
            id="div-alte"
            inputMode="numeric"
            value={alteStr}
            onChange={(e) => setAlte(e.target.value)}
            placeholder="chirii, dobânzi… pentru plafon CASS"
          />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <div>
              <span className="block font-bold text-secondary-900">Dividende nete în mână</span>
              <span className="text-xs text-neutral-500">rată efectivă {rata.toFixed(1)}%</span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(net)} lei</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Impozit pe dividende (16%)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(impozit)} lei</span>
              </div>
              <div className="flex items-baseline justify-between px-4 py-2.5">
                <div>
                  <span className="text-sm text-neutral-700">CASS (sănătate, 10%)</span>
                  <span className="block text-xs text-neutral-400">{prag}</span>
                </div>
                <span className="text-sm font-bold text-secondary-900">{fmt(cass)} lei</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Impozitul de 16% se aplică dividendelor distribuite din 1 ianuarie 2026 (Legea 141/2025). CASS este o
            obligație anuală personală pe venitul extra-salarial cumulat (declarată prin Declarația Unică), în sume fixe
            pe plafoane, nu 10% din fiecare dividend. Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu dividendele brute pentru a estima impozitul și suma netă.</p>
      )}
    </div>
  );
}
