'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Impozit auto 2026 (Legea 239/2025 + OUG 78/2025) — depinde de cmc ȘI norma Euro.
 * Tabel orientativ (lei / 200 cmc). ⚠️ valorile se pot ajusta — vezi
 * docs/seo/calculator-formulas-2026.md. Variază pe primărie (cotă adițională 0-50%).
 */
// coloane: [non-euro/E0-E3, Euro 4, Euro 5, Euro 6, hibrid >50g]
const TABLE: Record<string, number[]> = {
  b1: [19.5, 18.8, 17.6, 16.5, 16.2], // ≤1600
  b2: [29.7, 28.5, 26.7, 25.1, 24.6], // 1601-2000
  b3: [92.2, 88.6, 82.8, 77.8, 76.3], // 2001-2600
  b4: [182.9, 172.8, 154.1, 151.2, 149.8], // 2601-3000
  b5: [319, 297.3, 294.4, 290, 275.5], // >3000
};
function bracket(cmc: number): string {
  if (cmc <= 1600) return 'b1';
  if (cmc <= 2000) return 'b2';
  if (cmc <= 2600) return 'b3';
  if (cmc <= 3000) return 'b4';
  return 'b5';
}

type Fuel = 'clasic' | 'hibrid_peste' | 'hibrid_sub' | 'electric';
const FUELS: [Fuel, string][] = [
  ['clasic', 'Benzină / Diesel'],
  ['hibrid_peste', 'Hibrid (>50g CO₂)'],
  ['hibrid_sub', 'Hibrid (≤50g CO₂)'],
  ['electric', 'Electric'],
];
const EURO = ['Non-Euro / E0-E3', 'Euro 4', 'Euro 5', 'Euro 6'];

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);

export function ImpozitAutoCalculator() {
  const [cmc, setCmc] = useState('');
  const [fuel, setFuel] = useState<Fuel>('clasic');
  const [euro, setEuro] = useState(3); // default Euro 6
  const [cota, setCota] = useState('0');

  const ncmc = parseInt(cmc.replace(/\D/g, '')) || 0;
  const ncota = Math.min(50, Math.max(0, parseFloat(cota.replace(',', '.')) || 0));
  const valid = ncmc > 0;

  let base = 0;
  if (valid) {
    if (fuel === 'electric') {
      base = 40;
    } else {
      const units = Math.ceil(ncmc / 200);
      const br = TABLE[bracket(ncmc)];
      if (fuel === 'hibrid_peste') base = units * br[4];
      else if (fuel === 'hibrid_sub') base = units * br[4] * 0.7;
      else base = units * br[euro];
    }
  }
  const total = Math.round(base * (1 + ncota / 100));

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="auto-cmc" className="mb-1.5 block">Capacitate cilindrică (cmc)</Label>
          <Input id="auto-cmc" inputMode="numeric" value={cmc} onChange={(e) => setCmc(e.target.value)} placeholder="ex. 1598" />
        </div>
        <div>
          <Label htmlFor="auto-cota" className="mb-1.5 block">Cotă adițională primărie (%, 0-50)</Label>
          <Input id="auto-cota" inputMode="decimal" value={cota} onChange={(e) => setCota(e.target.value)} placeholder="0" />
        </div>
      </div>

      <div className="mt-4">
        <Label className="mb-1.5 block">Tip combustibil</Label>
        <div className="flex flex-wrap gap-2">
          {FUELS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFuel(k)}
              className={cn('px-3 py-2 rounded-full text-sm font-semibold border transition-all',
                fuel === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {fuel === 'clasic' && (
        <div className="mt-4">
          <Label className="mb-1.5 block">Norma de poluare</Label>
          <div className="flex flex-wrap gap-2">
            {EURO.map((l, i) => (
              <button key={l} type="button" onClick={() => setEuro(i)}
                className={cn('px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  euro === i ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {valid && (
        <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm text-neutral-600">Impozit auto anual estimat</p>
          <p className="text-3xl font-extrabold text-secondary-900 mt-1">{fmt(total)} lei / an</p>
          {ncota > 0 && <p className="text-xs text-neutral-500 mt-1">Bază {fmt(Math.round(base))} lei + cotă adițională {ncota}%.</p>}
          <p className="text-xs text-neutral-500 mt-2">
            Valoare orientativă conform regulilor 2026. Suma finală se stabilește de primăria ta
            (cota adițională diferă pe localitate) — verifică la Direcția de Taxe locală.
          </p>
        </div>
      )}
    </div>
  );
}
