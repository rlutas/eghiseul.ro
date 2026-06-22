'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator termene procedurale — Cod Procedură Civilă art. 181-183 / Cod
 * Procedură Penală art. 269-271. Sistemul „zile libere" (ambele capete excluse)
 * e identic în civil și penal pentru termenele procedurale; „zile pline" (ambele
 * capete incluse) se aplică doar măsurilor preventive (art. 271 CPP).
 * Ultima zi nelucrătoare → prima zi lucrătoare (art. 181 alin 2 / art. 269 alin 4).
 */

const ORTHODOX_EASTER: Record<number, string> = {
  2025: '2025-04-20',
  2026: '2026-04-12',
  2027: '2027-05-02',
};

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function holidaysForYear(y: number): string[] {
  // Sărbători legale fixe (Codul Muncii art. 139)
  const days = [
    `${y}-01-01`, `${y}-01-02`, `${y}-01-06`, `${y}-01-07`, `${y}-01-24`,
    `${y}-05-01`, `${y}-06-01`, `${y}-08-15`, `${y}-11-30`, `${y}-12-01`, `${y}-12-25`, `${y}-12-26`,
  ];
  const e = ORTHODOX_EASTER[y];
  if (e) {
    const easter = new Date(`${e}T00:00:00`);
    const add = (n: number) => {
      const d = new Date(easter);
      d.setDate(d.getDate() + n);
      return isoOf(d);
    };
    days.push(add(-2), add(1), add(49), add(50)); // Vinerea Mare, a 2-a zi Paște, Rusalii (2 zile)
  }
  return days;
}

const HOLIDAYS = new Set([...holidaysForYear(2025), ...holidaysForYear(2026), ...holidaysForYear(2027)]);

function isNonWorking(d: Date): boolean {
  const wd = d.getDay();
  return wd === 0 || wd === 6 || HOLIDAYS.has(isoOf(d));
}
function bump(d: Date): { date: Date; bumped: boolean } {
  const r = new Date(d);
  let bumped = false;
  while (isNonWorking(r)) {
    r.setDate(r.getDate() + 1);
    bumped = true;
  }
  return { date: r, bumped };
}
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function addMonths(start: Date, n: number): Date {
  const r = new Date(start);
  r.setMonth(r.getMonth() + n);
  if (r.getDate() < start.getDate()) r.setDate(0); // 31 → ultima zi a lunii (art. 181 pct 3)
  return r;
}
function addYears(start: Date, n: number): Date {
  const r = new Date(start);
  r.setFullYear(r.getFullYear() + n);
  if (r.getDate() < start.getDate()) r.setDate(0); // 29 feb → 28 feb
  return r;
}

type Unit = 'zile' | 'saptamani' | 'luni' | 'ani';
const UNITS: [Unit, string][] = [
  ['zile', 'Zile'],
  ['saptamani', 'Săptămâni'],
  ['luni', 'Luni'],
  ['ani', 'Ani'],
];

function parseDate(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  return isNaN(d.getTime()) ? null : d;
}

export function TermeneCalculator() {
  const [startStr, setStart] = useState('');
  const [nStr, setN] = useState('5');
  const [unit, setUnit] = useState<Unit>('zile');
  const [system, setSystem] = useState<'libere' | 'pline'>('libere');

  const start = parseDate(startStr);
  const n = parseInt(nStr, 10);
  const valid = start !== null && !isNaN(n) && n > 0;

  let result: { date: Date; bumped: boolean } | null = null;
  if (valid && start) {
    let raw: Date;
    if (unit === 'zile') raw = addDays(start, system === 'libere' ? n + 1 : n - 1);
    else if (unit === 'saptamani') raw = addDays(start, n * 7);
    else if (unit === 'luni') raw = addMonths(start, n);
    else raw = addYears(start, n);
    result = bump(raw);
  }

  const formatLong = (d: Date) =>
    d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="term-start" className="mb-1.5 block">
            Data de început
          </Label>
          <Input id="term-start" type="date" value={startStr} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="term-n" className="mb-1.5 block">
            Durata termenului
          </Label>
          <Input id="term-n" inputMode="numeric" value={nStr} onChange={(e) => setN(e.target.value)} placeholder="ex. 5" />
        </div>
      </div>

      <div className="mt-4">
        <Label className="mb-1.5 block">Unitate</Label>
        <div className="flex flex-wrap gap-2">
          {UNITS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setUnit(k)}
              className={cn(
                'flex-1 min-w-[80px] px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                unit === k
                  ? 'bg-primary-500 border-primary-500 text-secondary-900'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {unit === 'zile' && (
        <div className="mt-4">
          <Label className="mb-1.5 block">Mod de calcul</Label>
          <div className="flex gap-2">
            {(
              [
                ['libere', 'Zile libere (procedural)'],
                ['pline', 'Zile pline (măsuri preventive)'],
              ] as ['libere' | 'pline', string][]
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSystem(k)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  system === k
                    ? 'bg-primary-500 border-primary-500 text-secondary-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {result ? (
        <div className="mt-6 space-y-3">
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <span className="block text-sm text-neutral-600">Termenul se împlinește</span>
            <span className="block text-2xl font-extrabold text-secondary-900 capitalize mt-0.5">
              {formatLong(result.date)}
            </span>
          </div>
          {result.bumped && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
              Ultima zi cădea într-o zi nelucrătoare (weekend sau sărbătoare legală), așa că termenul s-a prelungit până
              în prima zi lucrătoare (art. 181 alin. 2 CPC / art. 269 alin. 4 CPP).
            </p>
          )}
          <p className="text-xs text-neutral-500">
            La termenele pe zile nu se socotesc nici ziua de început, nici ziua împlinirii (sistemul „zile libere”, art.
            181 CPC / art. 269 CPP). Estimare orientativă — verifică termenul exact pentru cazul tău.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Alege data de început și durata pentru a calcula termenul.</p>
      )}
    </div>
  );
}
