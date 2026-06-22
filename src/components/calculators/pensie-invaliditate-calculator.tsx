'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator pensie de invaliditate — Legea 360/2023. Pensie = (puncte realizate +
 * puncte din stagiul potențial) × VPR (81 lei, 2026). Stagiul potențial (până la
 * 35 ani) e creditat cu 0,25/0,20/0,10 puncte/lună după grad (I/II/III). Gradul I
 * primește în plus indemnizația de însoțitor (2.163 lei din iulie 2026).
 */
const VPR = 81;
const SAL_MEDIU = 9192;
const STAGIU_COMPLET = 35;
const FACTOR: Record<'I' | 'II' | 'III', number> = { I: 0.25, II: 0.2, III: 0.1 };
const INDEMNIZATIE = 2163;
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const fmt2 = (n: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

export function PensieInvaliditateCalculator() {
  const [grad, setGrad] = useState<'I' | 'II' | 'III'>('II');
  const [aniStr, setAni] = useState('');
  const [salStr, setSal] = useState('');
  const [mediuStr, setMediu] = useState(String(SAL_MEDIU));

  const ani = parse(aniStr);
  const sal = parse(salStr);
  const mediu = parse(mediuStr) || SAL_MEDIU;
  const valid = !isNaN(ani) && ani > 0 && !isNaN(sal) && sal > 0;

  const raport = valid ? sal / mediu : 0;
  const puncteReal = raport * (valid ? ani : 0);
  const luniPot = Math.max(0, STAGIU_COMPLET - (valid ? ani : 0)) * 12;
  const punctePot = luniPot * FACTOR[grad];
  const total = puncteReal + punctePot;
  const pensieBaza = total * VPR;
  const indemnizatie = grad === 'I' ? INDEMNIZATIE : 0;
  const pensie = pensieBaza + indemnizatie;

  return (
    <div>
      <Label className="mb-1.5 block">Gradul de invaliditate</Label>
      <div className="flex gap-2 mb-4">
        {(
          [
            ['I', 'Gradul I'],
            ['II', 'Gradul II'],
            ['III', 'Gradul III'],
          ] as ['I' | 'II' | 'III', string][]
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setGrad(k)}
            className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all', grad === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pi-ani" className="mb-1.5 block">Stagiu realizat (ani)</Label>
          <Input id="pi-ani" inputMode="numeric" value={aniStr} onChange={(e) => setAni(e.target.value)} placeholder="ex. 15" />
        </div>
        <div>
          <Label htmlFor="pi-sal" className="mb-1.5 block">Salariu brut mediu al tău (lei)</Label>
          <Input id="pi-sal" inputMode="numeric" value={salStr} onChange={(e) => setSal(e.target.value)} placeholder="ex. 6000" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pi-mediu" className="mb-1.5 block">Salariu mediu brut pe economie (lei)</Label>
          <Input id="pi-mediu" inputMode="numeric" value={mediuStr} onChange={(e) => setMediu(e.target.value)} placeholder="9192" />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <div>
              <span className="block font-bold text-secondary-900">Pensie de invaliditate / lună</span>
              <span className="text-xs text-neutral-500">{fmt2(total)} puncte × {VPR} lei{grad === 'I' ? ' + indemnizație' : ''}</span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(pensie)} lei</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Puncte realizate ({fmt2(raport)} × {ani} ani)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(puncteReal)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Puncte stagiu potențial (grad {grad}, {FACTOR[grad]}/lună)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(punctePot)}</span>
              </div>
              {grad === 'I' && (
                <div className="flex justify-between px-4 py-2.5 bg-neutral-50">
                  <span className="text-sm text-neutral-700">Indemnizație de însoțitor</span>
                  <span className="text-sm font-bold text-secondary-900">{fmt(INDEMNIZATIE)} lei</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Estimare orientativă (Legea 360/2023). La punctele realizate se adaugă stagiul potențial (până la 35 de ani),
            creditat cu 0,25 (gradul I), 0,20 (II) sau 0,10 (III) puncte/lună. Gradul I primește și indemnizația de
            însoțitor (2.163 lei din iulie 2026). Calculul oficial CNPP poate diferi.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Alege gradul și introdu stagiul realizat și salariul brut mediu.</p>
      )}
    </div>
  );
}
