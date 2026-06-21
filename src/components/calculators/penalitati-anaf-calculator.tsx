'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Penalități și dobânzi ANAF — Cod proc. fiscală (Legea 207/2015), art. 174/176/181. */
const DOBANDA = 0.0002; // 0,02%/zi
const PEN_INTARZIERE = 0.0001; // 0,01%/zi
const PEN_NEDECLARARE = 0.0008; // 0,08%/zi

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 }).format(n);

export function PenalitatiAnafCalculator() {
  const [debitStr, setDebit] = useState('');
  const [scadenta, setScadenta] = useState('');
  const [plata, setPlata] = useState('');
  const [tip, setTip] = useState<'declarat' | 'nedeclarat'>('declarat');
  const [reducere, setReducere] = useState(false);

  const debit = parseFloat(debitStr.replace(/[.\s]/g, '').replace(',', '.'));
  const ds = scadenta ? new Date(scadenta) : null;
  const dp = plata ? new Date(plata) : null;
  const zile = ds && dp && !isNaN(ds.getTime()) && !isNaN(dp.getTime()) && dp > ds
    ? Math.floor((dp.getTime() - ds.getTime()) / 86400000)
    : 0;
  const valid = !isNaN(debit) && debit > 0 && zile > 0;

  const dobanda = valid ? debit * DOBANDA * zile : 0;
  let penalitate = 0;
  if (valid) {
    if (tip === 'declarat') penalitate = debit * PEN_INTARZIERE * zile;
    else {
      penalitate = debit * PEN_NEDECLARARE * zile;
      penalitate = Math.min(penalitate, debit); // plafon: nu depășește debitul
      if (reducere) penalitate *= 0.25; // reducere 75%
    }
  }
  const totalAccesorii = dobanda + penalitate;
  const totalPlata = valid ? debit + totalAccesorii : 0;

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="an-debit" className="mb-1.5 block">Sumă datorată (lei)</Label>
          <Input id="an-debit" inputMode="numeric" value={debitStr} onChange={(e) => setDebit(e.target.value)} placeholder="ex. 5000" />
        </div>
        <div>
          <Label htmlFor="an-scad" className="mb-1.5 block">Data scadenței</Label>
          <Input id="an-scad" type="date" value={scadenta} onChange={(e) => setScadenta(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="an-plata" className="mb-1.5 block">Data plății</Label>
          <Input id="an-plata" type="date" value={plata} onChange={(e) => setPlata(e.target.value)} />
        </div>
      </div>

      <div className="mt-4">
        <Label className="mb-1.5 block">Situație</Label>
        <div className="flex flex-wrap gap-2">
          {([['declarat', 'Declarat, dar neplătit'], ['nedeclarat', 'Nedeclarat (control ANAF)']] as ['declarat' | 'nedeclarat', string][]).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTip(k)}
              className={cn('px-4 py-2 rounded-full text-sm font-semibold border transition-all',
                tip === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {tip === 'nedeclarat' && (
        <label className="flex items-center gap-2 mt-3 text-sm text-neutral-700 cursor-pointer">
          <input type="checkbox" checked={reducere} onChange={(e) => setReducere(e.target.checked)} className="w-4 h-4 accent-primary-600" />
          Aplică reducerea de 75% (plată în termen / eșalonare)
        </label>
      )}

      {valid && (
        <div className="mt-6">
          <div className="rounded-xl bg-primary-50 border border-primary-100 p-4 mb-4">
            <p className="text-xs text-neutral-500 mb-1">Total de plată ({zile} zile întârziere)</p>
            <p className="text-2xl font-extrabold text-secondary-900">{fmt(totalPlata)} lei</p>
          </div>
          <table className="w-full text-sm">
            <tbody className="[&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-neutral-100">
              <tr><td className="text-neutral-600">Debit</td><td className="text-right tabular-nums">{fmt(debit)} lei</td></tr>
              <tr><td className="text-neutral-600">Dobândă (0,02%/zi)</td><td className="text-right tabular-nums">{fmt(dobanda)} lei</td></tr>
              <tr><td className="text-neutral-600">{tip === 'declarat' ? 'Penalitate de întârziere (0,01%/zi)' : 'Penalitate de nedeclarare (0,08%/zi)'}</td><td className="text-right tabular-nums">{fmt(penalitate)} lei</td></tr>
              <tr><td className="text-neutral-600 font-semibold">Total accesorii</td><td className="text-right tabular-nums font-semibold">{fmt(totalAccesorii)} lei</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-neutral-500 mt-3">
            Estimare orientativă conform Legii 207/2015. La sume nedeclarate, penalitatea de nedeclarare
            nu poate depăși debitul. Verifică cuantumul exact pe decizia ANAF.
          </p>
        </div>
      )}
    </div>
  );
}
