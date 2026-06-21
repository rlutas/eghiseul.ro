'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Indemnizație de șomaj — Legea 76/2002, art. 39. Bază 75% ISR (660) + supliment pe stagiu. CASS 10% reținut (din aug 2025). */
const ISR = 660;
const BASE = 0.75 * ISR; // 495

const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);

function tier(ani: number): number {
  if (ani >= 20) return 0.10;
  if (ani >= 10) return 0.07;
  if (ani >= 5) return 0.05;
  if (ani >= 3) return 0.03;
  return 0;
}
function durata(ani: number): number {
  if (ani > 10) return 12;
  if (ani >= 5) return 9;
  if (ani >= 1) return 6;
  return 0;
}

export function SomajCalculator() {
  const [aniStr, setAni] = useState('');
  const [salStr, setSal] = useState('');

  const ani = parseFloat(aniStr.replace(',', '.'));
  const sal = parseFloat(salStr.replace(/[.\s]/g, '').replace(',', '.'));
  const eligibil = !isNaN(ani) && ani >= 1;
  const valid = eligibil && !isNaN(sal) && sal > 0;

  const t = valid ? tier(ani) : 0;
  const brut = valid ? Math.round(BASE + t * sal) : 0;
  const net = Math.round(brut * 0.9);
  const luni = eligibil ? durata(ani) : 0;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sj-ani" className="mb-1.5 block">Stagiu de cotizare (ani)</Label>
          <Input id="sj-ani" inputMode="decimal" value={aniStr} onChange={(e) => setAni(e.target.value)} placeholder="ex. 8" />
        </div>
        <div>
          <Label htmlFor="sj-sal" className="mb-1.5 block">Salariu mediu brut (ultimele 12 luni)</Label>
          <Input id="sj-sal" inputMode="numeric" value={salStr} onChange={(e) => setSal(e.target.value)} placeholder="ex. 5000" />
        </div>
      </div>

      {!isNaN(ani) && ani < 1 && (
        <p className="mt-4 text-sm text-red-600">Pentru indemnizație de șomaj e nevoie de minimum 1 an de cotizare în ultimele 2 ani.</p>
      )}

      {valid && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
              <p className="text-xs text-neutral-500 mb-1">Indemnizație netă / lună</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(net)} lei</p>
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500 mb-1">Indemnizație brută / lună</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(brut)} lei</p>
            </div>
          </div>
          <p className="text-sm text-neutral-600 mt-3">
            Bază 495 lei (75% × ISR) + {Math.round(t * 100)}% din salariul mediu. Durată:{' '}
            <strong>{luni} luni</strong>. Se reține CASS 10%.
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            Estimare orientativă (Legea 76/2002). Absolvenții au regim separat (50% ISR). Cuantumul
            exact se stabilește de ANOFM.
          </p>
        </div>
      )}
    </div>
  );
}
