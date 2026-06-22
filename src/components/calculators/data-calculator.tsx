'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { isNonWorking } from '@/lib/holidays';

/** Calculator dată — adună/scade zile/luni/ani la o dată, sau diferența între două date. */
function parseDate(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  return isNaN(d.getTime()) ? null : d;
}
const formatLong = (d: Date) => d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function DataCalculator() {
  const [mod, setMod] = useState<'aduna' | 'diferenta'>('aduna');
  // adună/scade
  const [startStr, setStart] = useState('');
  const [semn, setSemn] = useState<1 | -1>(1);
  const [nStr, setN] = useState('');
  const [unit, setUnit] = useState<'zile' | 'luni' | 'ani' | 'lucratoare'>('zile');
  // diferență
  const [d1Str, setD1] = useState('');
  const [d2Str, setD2] = useState('');

  // adună result
  let rezultat: Date | null = null;
  const start = parseDate(startStr);
  const n = parseInt(nStr, 10);
  if (mod === 'aduna' && start && !isNaN(n) && n >= 0) {
    const r = new Date(start);
    if (unit === 'zile') r.setDate(r.getDate() + semn * n);
    else if (unit === 'luni') r.setMonth(r.getMonth() + semn * n);
    else if (unit === 'ani') r.setFullYear(r.getFullYear() + semn * n);
    else {
      // zile lucrătoare
      let rest = n;
      while (rest > 0) {
        r.setDate(r.getDate() + semn);
        if (!isNonWorking(r)) rest--;
      }
    }
    rezultat = r;
  }

  // diferență
  const d1 = parseDate(d1Str);
  const d2 = parseDate(d2Str);
  let difZile = 0;
  let difLucratoare = 0;
  if (mod === 'diferenta' && d1 && d2) {
    const lo = d1 <= d2 ? d1 : d2;
    const hi = d1 <= d2 ? d2 : d1;
    difZile = Math.round((hi.getTime() - lo.getTime()) / 86400000);
    const d = new Date(lo);
    let guard = 0;
    while (d < hi && guard < 8000) {
      d.setDate(d.getDate() + 1);
      if (!isNonWorking(d)) difLucratoare++;
      guard++;
    }
  }

  const btn = (active: boolean) =>
    cn(
      'px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
      active ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
    );

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setMod('aduna')} className={cn(btn(mod === 'aduna'), 'flex-1')}>Adună / scade</button>
        <button type="button" onClick={() => setMod('diferenta')} className={cn(btn(mod === 'diferenta'), 'flex-1')}>Diferență între date</button>
      </div>

      {mod === 'aduna' ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dt-start" className="mb-1.5 block">Data de început</Label>
              <Input id="dt-start" type="date" value={startStr} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dt-n" className="mb-1.5 block">Număr</Label>
              <Input id="dt-n" inputMode="numeric" value={nStr} onChange={(e) => setN(e.target.value)} placeholder="ex. 30" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Label className="mb-1.5 block">Operație</Label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSemn(1)} className={cn(btn(semn === 1), 'flex-1')}>Adună (+)</button>
                <button type="button" onClick={() => setSemn(-1)} className={cn(btn(semn === -1), 'flex-1')}>Scade (−)</button>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Unitate</Label>
              <div className="flex flex-wrap gap-2">
                {(['zile', 'lucratoare', 'luni', 'ani'] as const).map((u) => (
                  <button key={u} type="button" onClick={() => setUnit(u)} className={cn(btn(unit === u), 'flex-1 min-w-[70px]')}>
                    {u === 'lucratoare' ? 'Zile lucr.' : u.charAt(0).toUpperCase() + u.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {rezultat ? (
            <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
              <span className="block text-sm text-neutral-600">Data rezultat</span>
              <span className="block text-2xl font-extrabold text-secondary-900 capitalize mt-0.5">{formatLong(rezultat)}</span>
            </div>
          ) : (
            <p className="mt-6 text-sm text-neutral-500">Alege data, numărul și unitatea.</p>
          )}
        </>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dt-d1" className="mb-1.5 block">Prima dată</Label>
              <Input id="dt-d1" type="date" value={d1Str} onChange={(e) => setD1(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="dt-d2" className="mb-1.5 block">A doua dată</Label>
              <Input id="dt-d2" type="date" value={d2Str} onChange={(e) => setD2(e.target.value)} />
            </div>
          </div>
          {d1 && d2 ? (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 flex items-center justify-between">
                <span className="font-bold text-secondary-900">Zile calendaristice</span>
                <span className="text-2xl font-extrabold text-secondary-900">{difZile}</span>
              </div>
              <div className="rounded-xl border border-neutral-200 px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-neutral-700">Din care zile lucrătoare</span>
                <span className="font-bold text-secondary-900">{difLucratoare}</span>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-neutral-500">Alege cele două date.</p>
          )}
        </>
      )}
    </div>
  );
}
