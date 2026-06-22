'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator estimare pensie (limită de vârstă) — Legea 360/2023.
 * Pensie = (puncte de contributivitate + puncte de stabilitate) × VPR.
 * VPR 2026 = 81 lei (înghețat, Legea 141/2025). Salariu mediu brut pe economie
 * (BASS) 2026 ≈ 9.192 lei. Estimare orientativă — calculul exact CNPP folosește
 * istoricul real al venitului anual.
 */
const VPR = 81;
const SAL_MEDIU = 9192;
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const fmt2 = (n: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

function puncteStabilitate(ani: number): number {
  return 0.5 * Math.min(Math.max(ani - 25, 0), 5) + 0.75 * Math.min(Math.max(ani - 30, 0), 5) + 1.0 * Math.max(ani - 35, 0);
}

export function EstimarePensieCalculator() {
  const [aniStr, setAni] = useState('');
  const [salStr, setSal] = useState('');
  const [mediuStr, setMediu] = useState(String(SAL_MEDIU));

  const ani = parse(aniStr);
  const sal = parse(salStr);
  const mediu = parse(mediuStr) || SAL_MEDIU;
  const valid = !isNaN(ani) && ani > 0 && !isNaN(sal) && sal > 0;

  const raport = valid ? sal / mediu : 0;
  const puncteContrib = raport * (valid ? ani : 0);
  const puncteStab = valid ? puncteStabilitate(ani) : 0;
  const total = puncteContrib + puncteStab;
  const pensie = total * VPR;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ep-ani" className="mb-1.5 block">Stagiu de cotizare (ani)</Label>
          <Input id="ep-ani" inputMode="numeric" value={aniStr} onChange={(e) => setAni(e.target.value)} placeholder="ex. 35" />
        </div>
        <div>
          <Label htmlFor="ep-sal" className="mb-1.5 block">Salariu brut mediu al tău (lei)</Label>
          <Input id="ep-sal" inputMode="numeric" value={salStr} onChange={(e) => setSal(e.target.value)} placeholder="ex. 9000" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="ep-mediu" className="mb-1.5 block">Salariu mediu brut pe economie (lei)</Label>
          <Input id="ep-mediu" inputMode="numeric" value={mediuStr} onChange={(e) => setMediu(e.target.value)} placeholder="9192" />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <div>
              <span className="block font-bold text-secondary-900">Pensie estimată / lună</span>
              <span className="text-xs text-neutral-500">{fmt2(total)} puncte × {VPR} lei (VPR 2026)</span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(pensie)} lei</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Puncte de contributivitate ({fmt2(raport)} × {ani} ani)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(puncteContrib)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Puncte de stabilitate (peste 25 de ani)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(puncteStab)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Estimare orientativă (Legea 360/2023). Pensia = total puncte × valoarea punctului de referință (81 lei,
            înghețat în 2026). Punctele de stabilitate se acordă pentru stagiul peste 25 de ani (0,50/an pentru anii
            26-30, 0,75/an pentru 31-35, 1,00/an peste 35). Calculul oficial CNPP folosește venitul real raportat la
            câștigul mediu din fiecare an — rezultatul poate diferi.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu stagiul de cotizare și salariul brut mediu pentru a estima pensia.</p>
      )}
    </div>
  );
}
