'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator inflație — putere de cumpărare între doi ani, pe baza ratei medii
 * anuale a inflației (IPC) publicate de INS. Factor cumulat = produsul (1 + rata/100)
 * pentru anii de la anul_start+1 până la anul_final.
 */
const RATE: Record<number, number> = {
  2000: 45.7, 2001: 34.5, 2002: 22.5, 2003: 15.3, 2004: 11.9, 2005: 9.0, 2006: 6.6, 2007: 4.8,
  2008: 7.9, 2009: 5.6, 2010: 6.1, 2011: 5.8, 2012: 3.3, 2013: 4.0, 2014: 1.1, 2015: -0.6,
  2016: -1.5, 2017: 1.3, 2018: 4.6, 2019: 3.8, 2020: 2.6, 2021: 5.1, 2022: 13.8, 2023: 10.4,
  2024: 5.6, 2025: 7.3,
};
const YEARS = Object.keys(RATE).map(Number).sort((a, b) => a - b);
const MIN_Y = YEARS[0];
const MAX_Y = YEARS[YEARS.length - 1];

const fmt2 = (n: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

function factor(from: number, to: number): number {
  let f = 1;
  for (let y = from + 1; y <= to; y++) f *= 1 + (RATE[y] ?? 0) / 100;
  return f;
}

export function InflatieCalculator() {
  const [sumaStr, setSuma] = useState('1000');
  const [from, setFrom] = useState(2015);
  const [to, setTo] = useState(MAX_Y);

  const suma = parse(sumaStr);
  const valid = !isNaN(suma) && suma > 0 && to > from;

  const f = valid ? factor(from, to) : 1;
  const echiv = valid ? suma * f : 0;
  const inflatiePct = (f - 1) * 100;

  const Select = (id: string, value: number, set: (v: number) => void) => (
    <select
      id={id}
      value={value}
      onChange={(e) => set(parseInt(e.target.value, 10))}
      className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {YEARS.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <div>
        <Label htmlFor="inf-suma" className="mb-1.5 block">
          Sumă (lei)
        </Label>
        <Input id="inf-suma" inputMode="numeric" value={sumaStr} onChange={(e) => setSuma(e.target.value)} placeholder="ex. 1000" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="inf-from" className="mb-1.5 block">
            Din anul
          </Label>
          {Select('inf-from', from, setFrom)}
        </div>
        <div>
          <Label htmlFor="inf-to" className="mb-1.5 block">
            Până în anul
          </Label>
          {Select('inf-to', to, setTo)}
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-3">
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <span className="block text-sm text-neutral-600">
              {fmt2(suma)} lei în {from} valorează în {to}
            </span>
            <span className="block text-2xl font-extrabold text-secondary-900 mt-0.5">{fmt2(echiv)} lei</span>
          </div>
          <p className="text-sm text-neutral-600">
            Inflația cumulată {from}–{to}: <strong>{fmt2(inflatiePct)}%</strong>. Cu alte cuvinte, puterea de cumpărare a
            scăzut — îți trebuie {fmt2(echiv)} lei azi ca să cumperi ce cumpărai cu {fmt2(suma)} lei în {from}.
          </p>
          <p className="text-xs text-neutral-500">
            Pe baza ratei medii anuale a inflației (IPC) publicate de INS. Date {MIN_Y}–{MAX_Y}. Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Alege suma și intervalul de ani (anul final după cel de început).</p>
      )}
    </div>
  );
}
