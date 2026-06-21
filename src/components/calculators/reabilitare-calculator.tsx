'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** Reabilitare — Cod Penal art. 165-167 (termene fixe, fără fracție). */
const TYPES: { key: string; label: string; years: number; kind: string }[] = [
  { key: 'drept', label: 'Amendă, închisoare ≤ 2 ani sau suspendare sub supraveghere', years: 3, kind: 'de drept (automată)' },
  { key: 'j4', label: 'Închisoare 2–5 ani', years: 4, kind: 'judecătorească' },
  { key: 'j5', label: 'Închisoare 5–10 ani', years: 5, kind: 'judecătorească' },
  { key: 'j7', label: 'Închisoare peste 10 ani', years: 7, kind: 'judecătorească' },
];

function fmtDate(d: Date): string {
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function ReabilitareCalculator() {
  const [type, setType] = useState('drept');
  const [date, setDate] = useState('');

  const t = TYPES.find((x) => x.key === type)!;
  const start = date ? new Date(date) : null;
  let result: Date | null = null;
  if (start && !isNaN(start.getTime())) {
    result = new Date(start);
    result.setFullYear(result.getFullYear() + t.years);
  }

  return (
    <div>
      <div className="mb-4">
        <Label className="mb-1.5 block">Tipul pedepsei</Label>
        <div className="grid gap-2">
          {TYPES.map((x) => (
            <button
              key={x.key}
              type="button"
              onClick={() => setType(x.key)}
              className={cn('text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
                type === x.key ? 'bg-primary-50 border-primary-400 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}
            >
              {x.label}
              <span className="block text-xs text-neutral-500 mt-0.5">Termen: {x.years} ani · reabilitare {x.kind}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-xs">
        <Label htmlFor="reab-date" className="mb-1.5 block">Data executării pedepsei (sau a achitării amenzii)</Label>
        <Input id="reab-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {result && (
        <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm text-neutral-600">Reabilitarea ({t.kind}) intervine după {t.years} ani, la data:</p>
          <p className="text-2xl font-extrabold text-secondary-900 mt-1">{fmtDate(result)}</p>
          <p className="text-xs text-neutral-500 mt-2">
            {t.key === 'drept'
              ? 'Reabilitarea de drept operează automat, dacă nu intervine o nouă infracțiune în termen.'
              : 'Reabilitarea judecătorească se obține prin cerere la instanță, după împlinirea termenului, dacă sunt îndeplinite condițiile (fără nouă infracțiune, plata cheltuielilor și a despăgubirilor).'}
          </p>
        </div>
      )}

      <p className="text-xs text-neutral-500 mt-4">
        Estimare orientativă conform Codului Penal (art. 165-167). Pentru situații cu condamnări
        succesive sau detențiune pe viață, termenele diferă — consultă un avocat.
      </p>
    </div>
  );
}
