'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Amenzi circulație + puncte — OUG 195/2002. Punct-amendă = 10% salariu minim. */
const CLASSES: { key: string; label: string; min: number; max: number }[] = [
  { key: 'I', label: 'Clasa I (2-3 p.a.)', min: 2, max: 3 },
  { key: 'II', label: 'Clasa II (4-5 p.a.)', min: 4, max: 5 },
  { key: 'III', label: 'Clasa III (6-8 p.a.)', min: 6, max: 8 },
  { key: 'IV', label: 'Clasa IV (9-20 p.a.)', min: 9, max: 20 },
];

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

function speeding(over: number): { pts: number; susp: number } {
  if (over <= 10) return { pts: 0, susp: 0 };
  if (over <= 20) return { pts: 2, susp: 0 };
  if (over <= 30) return { pts: 3, susp: 0 };
  if (over <= 40) return { pts: 4, susp: 0 };
  if (over <= 50) return { pts: 6, susp: 0 };
  if (over <= 70) return { pts: 6, susp: 90 };
  return { pts: 6, susp: 120 };
}

export function AmendaCalculator() {
  const [mode, setMode] = useState<'clasa' | 'viteza'>('clasa');
  const [afterJul, setAfterJul] = useState(false);
  const [cls, setCls] = useState('I');
  const [over, setOver] = useState('');

  const punct = afterJul ? 432.5 : 405;
  const c = CLASSES.find((x) => x.key === cls)!;
  const fineMin = c.min * punct;
  const fineMax = c.max * punct;
  const early = 0.5 * fineMin;

  const nover = parseInt(over) || 0;
  const sp = speeding(nover);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {([['clasa', 'După clasa de amendă'], ['viteza', 'Depășire de viteză']] as ['clasa' | 'viteza', string][]).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setMode(k)}
            className={cn('px-4 py-2 rounded-full text-sm font-semibold border transition-all',
              mode === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
            {l}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 mb-4 text-sm text-neutral-700 cursor-pointer">
        <input type="checkbox" checked={afterJul} onChange={(e) => setAfterJul(e.target.checked)} className="w-4 h-4 accent-primary-600" />
        Contravenție de la 1 iulie 2026 (punct-amendă 432,50 lei în loc de 405)
      </label>

      {mode === 'clasa' ? (
        <>
          <Label className="mb-1.5 block">Clasa de amendă</Label>
          <div className="flex flex-wrap gap-2">
            {CLASSES.map((x) => (
              <button key={x.key} type="button" onClick={() => setCls(x.key)}
                className={cn('px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  cls === x.key ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
            <p className="text-sm text-neutral-600">Amendă (clasa {cls})</p>
            <p className="text-2xl font-extrabold text-secondary-900 mt-1">{fmt(fineMin)} – {fmt(fineMax)} lei</p>
            <p className="text-sm text-neutral-700 mt-2">Plată în 15 zile (jumătate din minim): <strong>{fmt(early)} lei</strong></p>
          </div>
        </>
      ) : (
        <>
          <Label htmlFor="am-over" className="mb-1.5 block">Cu câți km/h ai depășit limita?</Label>
          <Input id="am-over" inputMode="numeric" value={over} onChange={(e) => setOver(e.target.value)} placeholder="ex. 35" className="max-w-xs" />
          {nover > 0 && (
            <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
              <p className="text-sm text-neutral-600">Depășire cu {nover} km/h</p>
              <p className="text-2xl font-extrabold text-secondary-900 mt-1">{sp.pts} puncte de penalizare</p>
              {sp.susp > 0 && <p className="text-sm text-red-600 font-semibold mt-2">Suspendare permis: {sp.susp} de zile</p>}
              <p className="text-xs text-neutral-500 mt-2">La 15 puncte de penalizare acumulate → suspendare 30 de zile. Punctele expiră în 6 luni de la constatare.</p>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-neutral-500 mt-4">
        Estimare orientativă (OUG 195/2002). Valoarea exactă în limita clasei o stabilește agentul
        constatator. Verifică procesul-verbal.
      </p>
    </div>
  );
}
