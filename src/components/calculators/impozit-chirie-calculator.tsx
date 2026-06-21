'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Impozit pe venitul din chirii — Cod Fiscal (Legea 227/2015). 2026: deducere forfetară 20% (lung) / 30% (scurt), impozit 10%, CASS pe plafoane. */
const W = 4050;
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);

function cass(cumulat: number): number {
  if (cumulat < 6 * W) return 0;
  if (cumulat < 12 * W) return 0.1 * 6 * W; // 2.430
  if (cumulat < 24 * W) return 0.1 * 12 * W; // 4.860
  return 0.1 * 24 * W; // 9.720
}

export function ImpozitChirieCalculator() {
  const [chirieStr, setChirie] = useState('');
  const [tip, setTip] = useState<'lung' | 'scurt'>('lung');
  const [chirias, setChirias] = useState<'pf' | 'pj'>('pf');
  const [alteStr, setAlte] = useState('');

  const chirie = parseFloat(chirieStr.replace(/[.\s]/g, '').replace(',', '.'));
  const alte = parseFloat(alteStr.replace(/[.\s]/g, '').replace(',', '.')) || 0;
  const valid = !isNaN(chirie) && chirie > 0;

  const brutAnual = valid ? chirie * 12 : 0;
  const deducere = tip === 'lung' ? 0.2 : 0.3;
  const venitNet = Math.round(brutAnual * (1 - deducere));
  const impozit = Math.round(venitNet * 0.1);
  const cassDat = valid ? Math.round(cass(venitNet + alte)) : 0;
  const total = impozit + cassDat;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ch-suma" className="mb-1.5 block">Chirie lunară (lei)</Label>
          <Input id="ch-suma" inputMode="numeric" value={chirieStr} onChange={(e) => setChirie(e.target.value)} placeholder="ex. 2500" />
        </div>
        <div>
          <Label htmlFor="ch-alte" className="mb-1.5 block">Alte venituri pasive nete/an (opțional)</Label>
          <Input id="ch-alte" inputMode="numeric" value={alteStr} onChange={(e) => setAlte(e.target.value)} placeholder="pentru plafon CASS" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="mb-1.5 block">Tip închiriere</Label>
          <div className="flex gap-2">
            {([['lung', 'Termen lung'], ['scurt', 'Turistic (scurt)']] as ['lung' | 'scurt', string][]).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setTip(k)}
                className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  tip === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Chiriașul este</Label>
          <div className="flex gap-2">
            {([['pf', 'Persoană fizică'], ['pj', 'Firmă (PJ)']] as ['pf' | 'pj', string][]).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setChirias(k)}
                className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  chirias === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {valid && (
        <div className="mt-6">
          <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 mb-4">
            <p className="text-xs text-neutral-500 mb-1">Total obligații fiscale / an</p>
            <p className="text-2xl font-extrabold text-secondary-900">{fmt(total)} lei</p>
          </div>
          <table className="w-full text-sm">
            <tbody className="[&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-neutral-100">
              <tr><td className="text-neutral-600">Venit brut anual</td><td className="text-right tabular-nums">{fmt(brutAnual)} lei</td></tr>
              <tr><td className="text-neutral-600">Deducere forfetară ({Math.round(deducere * 100)}%)</td><td className="text-right tabular-nums">−{fmt(brutAnual - venitNet)} lei</td></tr>
              <tr><td className="text-neutral-600">Venit net impozabil</td><td className="text-right tabular-nums">{fmt(venitNet)} lei</td></tr>
              <tr><td className="text-neutral-600">Impozit 10% {chirias === 'pj' && '(reținut la sursă de firmă)'}</td><td className="text-right tabular-nums">{fmt(impozit)} lei</td></tr>
              <tr><td className="text-neutral-600">CASS (plafon)</td><td className="text-right tabular-nums">{fmt(cassDat)} lei</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-neutral-500 mt-3">
            Estimare orientativă 2026 (deducere 20% termen lung / 30% turistic). CASS se datorează doar
            peste 6 salarii minime venit net cumulat. Declari prin Declarația Unică.
          </p>
        </div>
      )}
    </div>
  );
}
