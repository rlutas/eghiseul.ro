'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isNonWorking, isHoliday } from '@/lib/holidays';

/**
 * Calculator zile lucrătoare — numărul de zile lucrătoare dintr-un interval,
 * excluzând weekendurile și sărbătorile legale (Codul Muncii art. 139).
 */
function parseDate(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  return isNaN(d.getTime()) ? null : d;
}

export function ZileLucratoareCalculator() {
  const [startStr, setStart] = useState('');
  const [endStr, setEnd] = useState('');

  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const valid = start !== null && end !== null && end >= start;

  let total = 0;
  let lucratoare = 0;
  let weekend = 0;
  let sarbatori = 0;
  if (valid && start && end) {
    const d = new Date(start);
    let guard = 0;
    while (d <= end && guard < 4000) {
      total++;
      const isHol = isHoliday(d);
      const wd = d.getDay();
      if (wd === 0 || wd === 6) weekend++;
      if (isHol && wd !== 0 && wd !== 6) sarbatori++;
      if (!isNonWorking(d)) lucratoare++;
      d.setDate(d.getDate() + 1);
      guard++;
    }
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zl-start" className="mb-1.5 block">
            De la data
          </Label>
          <Input id="zl-start" type="date" value={startStr} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="zl-end" className="mb-1.5 block">
            Până la data (inclusiv)
          </Label>
          <Input id="zl-end" type="date" value={endStr} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <span className="font-bold text-secondary-900">Zile lucrătoare</span>
            <span className="text-2xl font-extrabold text-secondary-900">{lucratoare}</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Total zile calendaristice</span>
                <span className="text-sm font-bold text-secondary-900">{total}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Zile de weekend</span>
                <span className="text-sm font-bold text-secondary-900">{weekend}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Sărbători legale (în zile lucrătoare)</span>
                <span className="text-sm font-bold text-secondary-900">{sarbatori}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Se exclud sâmbetele, duminicile și sărbătorile legale (Codul Muncii art. 139), inclusiv cele mobile (Paște,
            Rusalii). Interval inclusiv la ambele capete.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Alege data de început și data de final (finalul după început).</p>
      )}
    </div>
  );
}
