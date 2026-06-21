'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Period {
  start: string;
  end: string;
}

/** Diferența în zile inclusive între două date ISO. */
function daysBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return 0;
  return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1; // inclusiv
}

export function VechimeCalculator() {
  const [periods, setPeriods] = useState<Period[]>([{ start: '', end: '' }]);

  const update = (i: number, key: keyof Period, val: string) => {
    setPeriods((p) => p.map((row, idx) => (idx === i ? { ...row, [key]: val } : row)));
  };
  const add = () => setPeriods((p) => [...p, { start: '', end: '' }]);
  const remove = (i: number) => setPeriods((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));

  const totalDays = periods.reduce((sum, p) => sum + daysBetween(p.start, p.end), 0);
  const ani = Math.floor(totalDays / 365);
  const rest = totalDays % 365;
  const luni = Math.floor(rest / 30);
  const zile = rest % 30;
  const has = totalDays > 0;

  return (
    <div>
      <Label className="mb-2 block">Perioade de muncă</Label>
      <div className="space-y-3">
        {periods.map((p, i) => (
          <div key={i} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[140px]">
              <span className="text-xs text-neutral-500">De la</span>
              <Input type="date" value={p.start} onChange={(e) => update(i, 'start', e.target.value)} />
            </div>
            <div className="flex-1 min-w-[140px]">
              <span className="text-xs text-neutral-500">Până la</span>
              <Input type="date" value={p.end} onChange={(e) => update(i, 'end', e.target.value)} />
            </div>
            {periods.length > 1 && (
              <button type="button" onClick={() => remove(i)} aria-label="Șterge perioada"
                className="h-10 w-10 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:text-red-600 hover:border-red-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline">
        <Plus className="w-4 h-4" /> Adaugă perioadă
      </button>

      {has && (
        <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm text-neutral-600">Vechime totală în muncă</p>
          <p className="text-3xl font-extrabold text-secondary-900 mt-1">
            {ani} ani, {luni} luni, {zile} zile
          </p>
          <p className="text-xs text-neutral-500 mt-2">Total: {totalDays.toLocaleString('ro-RO')} zile. Estimare orientativă (lună = 30 zile, an = 365 zile).</p>
        </div>
      )}
    </div>
  );
}
