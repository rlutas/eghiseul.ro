'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator spor de noapte / ore suplimentare / sărbători — Codul Muncii:
 * spor noapte min. 25% (art. 126), ore suplimentare min. 75% (art. 123),
 * muncă în sărbători legale min. 100% = dublu (art. 142). Minime legale.
 */
const fmt2 = (n: number) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

export function SporSalarialCalculator() {
  const [salStr, setSal] = useState('');
  const [oreLunarStr, setOreLunar] = useState('168');
  const [noapteStr, setNoapte] = useState('');
  const [suplStr, setSupl] = useState('');
  const [sarbStr, setSarb] = useState('');

  const sal = parse(salStr);
  const oreLunar = parse(oreLunarStr) || 168;
  const valid = !isNaN(sal) && sal > 0 && oreLunar > 0;
  const tarif = valid ? sal / oreLunar : 0;

  const oreNoapte = parse(noapteStr) || 0;
  const oreSupl = parse(suplStr) || 0;
  const oreSarb = parse(sarbStr) || 0;

  const sporNoapte = tarif * oreNoapte * 0.25;
  const plataSupl = tarif * oreSupl * 1.75;
  const plataSarb = tarif * oreSarb * 2.0;
  const totalExtra = sporNoapte + plataSupl + plataSarb;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sp-sal" className="mb-1.5 block">Salariu de bază lunar (lei)</Label>
          <Input id="sp-sal" inputMode="numeric" value={salStr} onChange={(e) => setSal(e.target.value)} placeholder="ex. 5000" />
        </div>
        <div>
          <Label htmlFor="sp-ore" className="mb-1.5 block">Ore lucrătoare/lună</Label>
          <Input id="sp-ore" inputMode="numeric" value={oreLunarStr} onChange={(e) => setOreLunar(e.target.value)} placeholder="168" />
        </div>
        <div>
          <Label htmlFor="sp-noapte" className="mb-1.5 block">Ore de noapte (22:00–06:00)</Label>
          <Input id="sp-noapte" inputMode="numeric" value={noapteStr} onChange={(e) => setNoapte(e.target.value)} placeholder="ex. 40" />
        </div>
        <div>
          <Label htmlFor="sp-supl" className="mb-1.5 block">Ore suplimentare</Label>
          <Input id="sp-supl" inputMode="numeric" value={suplStr} onChange={(e) => setSupl(e.target.value)} placeholder="ex. 10" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="sp-sarb" className="mb-1.5 block">Ore lucrate în sărbători legale</Label>
          <Input id="sp-sarb" inputMode="numeric" value={sarbStr} onChange={(e) => setSarb(e.target.value)} placeholder="ex. 8" />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-neutral-200 px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-neutral-700">Tarif orar</span>
            <span className="font-bold text-secondary-900">{fmt2(tarif)} lei/oră</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Spor de noapte (+25%)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(sporNoapte)} lei</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Ore suplimentare (+75%, bază + spor)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(plataSupl)} lei</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Sărbători legale (+100%, dublu)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(plataSarb)} lei</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-primary-50">
                <span className="text-sm font-semibold text-secondary-900">Total sporuri</span>
                <span className="text-sm font-bold text-secondary-900">{fmt2(totalExtra)} lei</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Procente minime legale (Codul Muncii art. 123, 126, 142): spor noapte minim 25%, ore suplimentare minim 75%
            (dacă nu se compensează cu timp liber), muncă în sărbători legale minim 100%. Contractul colectiv poate
            stabili valori mai mari. Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu salariul de bază și orele pentru a calcula sporurile.</p>
      )}
    </div>
  );
}
