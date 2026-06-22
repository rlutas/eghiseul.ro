'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator concediu paternal — Legea 210/1999: 10 zile lucrătoare (+5 dacă
 * tatăl a absolvit un curs de puericultură), plătit 100% de angajator.
 */
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

export function ConcediuPaternalCalculator() {
  const [salStr, setSal] = useState('');
  const [curs, setCurs] = useState(false);

  const sal = parse(salStr);
  const valid = !isNaN(sal) && sal > 0;
  const zile = 10 + (curs ? 5 : 0);
  const indemnizatie = valid ? (sal / 21) * zile : 0; // salariul pe zilele de concediu (≈21 zile lucrătoare/lună)

  return (
    <div>
      <div>
        <Label htmlFor="cp-sal" className="mb-1.5 block">Salariul de bază lunar (lei)</Label>
        <Input id="cp-sal" inputMode="numeric" value={salStr} onChange={(e) => setSal(e.target.value)} placeholder="ex. 5000" />
      </div>
      <div className="mt-4">
        <Label className="mb-1.5 block">Ai absolvit un curs de puericultură?</Label>
        <div className="flex gap-2">
          {([[true, 'Da (+5 zile)'], [false, 'Nu']] as [boolean, string][]).map(([k, l]) => (
            <button
              key={l}
              type="button"
              onClick={() => setCurs(k)}
              className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all', curs === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 flex items-center justify-between">
          <span className="font-bold text-secondary-900">Zile de concediu paternal</span>
          <span className="text-2xl font-extrabold text-secondary-900">{zile} zile</span>
        </div>
        {valid && (
          <div className="rounded-xl border border-neutral-200 px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-700">Indemnizație (salariul pe perioadă, 100%)</span>
            <span className="font-bold text-secondary-900">{fmt(indemnizatie)} lei</span>
          </div>
        )}
        <p className="text-xs text-neutral-500">
          Concediul paternal este de 10 zile lucrătoare, plus 5 zile dacă tatăl a absolvit un curs de puericultură (Legea
          210/1999). Se acordă în primele 8 săptămâni de la naștere și este plătit integral de angajator. Estimare
          orientativă.
        </p>
      </div>
    </div>
  );
}
