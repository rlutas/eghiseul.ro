'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Taxă judiciară de timbru — Art. 3 OUG 80/2013 (cereri evaluabile în bani). */
function taxaEvaluabila(v: number): number {
  if (v <= 0) return 0;
  if (v <= 500) return Math.max(20, v * 0.08);
  if (v <= 5000) return 40 + (v - 500) * 0.07;
  if (v <= 25000) return 355 + (v - 5000) * 0.05;
  if (v <= 50000) return 1355 + (v - 25000) * 0.03;
  if (v <= 250000) return 2105 + (v - 50000) * 0.02;
  return 6105 + (v - 250000) * 0.01;
}

const FIXED = [
  ['Divorț prin acord / din culpă', '200 lei'],
  ['Divorț din motive de sănătate', '50 lei'],
  ['Cereri accesorii divorț (locuință, autoritate părintească)', '20 lei / cerere'],
  ['Ordonanță președințială (neevaluabilă)', '20 lei'],
  ['Daune morale', '100 lei'],
  ['Cereri necontencioase (catch-all, Art. 27)', '20 lei'],
  ['Apel', '50% din taxă (min. 20 lei)'],
];

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);

export function TaxaTimbruCalculator() {
  const [value, setValue] = useState('');
  const v = parseFloat(value.replace(/[.\s]/g, '').replace(',', '.'));
  const valid = !isNaN(v) && v > 0;
  const taxa = valid ? Math.round(taxaEvaluabila(v)) : 0;

  return (
    <div>
      <div className="max-w-sm">
        <Label htmlFor="timbru-val" className="mb-1.5 block">Valoarea cererii / a pretenției (lei)</Label>
        <Input id="timbru-val" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="ex. 100000" />
        <p className="text-xs text-neutral-500 mt-1.5">Pentru cereri evaluabile în bani (Art. 3 OUG 80/2013).</p>
      </div>

      {valid && (
        <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm text-neutral-600">Taxă judiciară de timbru estimată</p>
          <p className="text-3xl font-extrabold text-secondary-900 mt-1">{fmt(taxa)} lei</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold text-secondary-900 mb-2 text-sm">Taxe fixe frecvente</h3>
        <table className="w-full text-sm">
          <tbody className="[&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-neutral-100">
            {FIXED.map(([k, val]) => (
              <tr key={k}>
                <td className="text-neutral-600 pr-4">{k}</td>
                <td className="text-right font-medium text-secondary-900 whitespace-nowrap">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-neutral-500 mt-3">Valori orientative conform OUG 80/2013 (text 2026). Verifică încadrarea exactă pentru cazul tău.</p>
      </div>
    </div>
  );
}
