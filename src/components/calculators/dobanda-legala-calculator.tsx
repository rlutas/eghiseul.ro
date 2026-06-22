'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator dobândă legală — OG 13/2011. Rata de referință BNR = 6,50% (din feb
 * 2026). Penalizatoare civilă = BNR + 4pp; profesioniști/B2B = BNR + 8pp (Legea
 * 72/2013); remuneratorie = BNR; raporturi non-profesionale = redus cu 20%.
 * dobândă = sumă × rata/100 × zile / 365.
 */
const BNR = 6.5;
const TIPURI: { nume: string; rata: number }[] = [
  { nume: 'Penalizatoare — raporturi civile (BNR + 4pp)', rata: BNR + 4 },
  { nume: 'Penalizatoare — profesioniști/B2B (BNR + 8pp)', rata: BNR + 8 },
  { nume: 'Remuneratorie (BNR)', rata: BNR },
  { nume: 'Penalizatoare civilă, non-profesionist (−20%)', rata: (BNR + 4) * 0.8 },
];
const fmt2 = (n: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));
function parseDate(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  return isNaN(d.getTime()) ? null : d;
}

export function DobandaLegalaCalculator() {
  const [sumaStr, setSuma] = useState('');
  const [tip, setTip] = useState(0);
  const [d1Str, setD1] = useState('');
  const [d2Str, setD2] = useState('');

  const suma = parse(sumaStr);
  const d1 = parseDate(d1Str);
  const d2 = parseDate(d2Str);
  const zile = d1 && d2 && d2 >= d1 ? Math.round((d2.getTime() - d1.getTime()) / 86400000) : 0;
  const valid = !isNaN(suma) && suma > 0 && zile > 0;

  const rata = TIPURI[tip].rata;
  const dobanda = valid ? (suma * (rata / 100) * zile) / 365 : 0;

  return (
    <div>
      <div>
        <Label htmlFor="dl-suma" className="mb-1.5 block">Suma datorată (lei)</Label>
        <Input id="dl-suma" inputMode="numeric" value={sumaStr} onChange={(e) => setSuma(e.target.value)} placeholder="ex. 10000" />
      </div>
      <div className="mt-4">
        <Label htmlFor="dl-tip" className="mb-1.5 block">Tip dobândă</Label>
        <select
          id="dl-tip"
          value={tip}
          onChange={(e) => setTip(parseInt(e.target.value, 10))}
          className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {TIPURI.map((t, idx) => (
            <option key={t.nume} value={idx}>{t.nume} = {fmt2(t.rata)}%</option>
          ))}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <Label htmlFor="dl-d1" className="mb-1.5 block">De la data scadenței</Label>
          <Input id="dl-d1" type="date" value={d1Str} onChange={(e) => setD1(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="dl-d2" className="mb-1.5 block">Până la data plății</Label>
          <Input id="dl-d2" type="date" value={d2Str} onChange={(e) => setD2(e.target.value)} />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-3">
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 flex items-center justify-between">
            <div>
              <span className="block font-bold text-secondary-900">Dobândă legală datorată</span>
              <span className="text-xs text-neutral-500">{zile} zile × {fmt2(rata)}% pe an</span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt2(dobanda)} lei</span>
          </div>
          <p className="text-xs text-neutral-500">
            Rata de referință BNR este 6,50% (februarie 2026). Penalizatoarea civilă = BNR + 4 puncte; între profesioniști
            = BNR + 8 puncte (Legea 72/2013); pentru raporturi non-profesionale ratele se reduc cu 20% (OG 13/2011).
            Estimare orientativă — verifică rata BNR aplicabilă perioadei.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Completează suma, tipul și intervalul (data plății după scadență).</p>
      )}
    </div>
  );
}
