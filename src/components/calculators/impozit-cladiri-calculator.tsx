'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator impozit pe clădiri (casă) 2026 — metoda valorii impozabile pe m²
 * (Cod Fiscal art. 457, valori indexate +79,6% pentru 2026). Rezidențial PF:
 * cotă 0,08%–0,2% (stabilită local). Orientativ — cota, zona și majorările
 * locale se stabilesc prin HCL.
 */
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

const TIPURI: { nume: string; valMp: number }[] = [
  { nume: 'Cărămidă/beton, cu instalații', valMp: 2677 },
  { nume: 'Cărămidă/beton, fără instalații', valMp: 1606 },
  { nume: 'Lemn/piatră, cu instalații', valMp: 803 },
  { nume: 'Lemn/piatră, fără instalații', valMp: 535 },
];

const RANGURI = ['0', 'I', 'II', 'III', 'IV', 'V'];
const COEF: Record<string, number[]> = {
  // zonă: [rang 0, I, II, III, IV, V]
  A: [2.6, 2.5, 2.4, 2.3, 1.1, 1.05],
  B: [2.5, 2.4, 2.3, 2.2, 1.05, 1.0],
  C: [2.4, 2.3, 2.2, 2.1, 1.0, 0.95],
  D: [2.3, 2.2, 2.1, 2.0, 0.95, 0.9],
};

export function ImpozitCladiriCalculator() {
  const [supStr, setSup] = useState('');
  const [tip, setTip] = useState(0);
  const [zona, setZona] = useState('A');
  const [rang, setRang] = useState(0);
  const [vechimeStr, setVechime] = useState('');
  const [cotaStr, setCota] = useState('0,1');

  const sup = parse(supStr);
  const vechime = parse(vechimeStr) || 0;
  const cota = parse(cotaStr);
  const valid = !isNaN(sup) && sup > 0 && !isNaN(cota) && cota > 0;

  const valMp = TIPURI[tip].valMp;
  const coef = COEF[zona][rang];
  const ajVechime = vechime > 100 ? 0.75 : vechime >= 50 ? 0.85 : 1.0;
  const valoareImpozabila = valid ? sup * valMp * coef * ajVechime : 0;
  const impozit = valoareImpozabila * (cota / 100);

  const sel = (id: string, value: number | string, set: (v: string) => void, opts: (string | number)[], labels?: string[]) => (
    <select
      id={id}
      value={value}
      onChange={(e) => set(e.target.value)}
      className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {opts.map((o, i) => (
        <option key={o} value={o}>
          {labels ? labels[i] : o}
        </option>
      ))}
    </select>
  );

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cl-sup" className="mb-1.5 block">
            Suprafață construită desfășurată (m²)
          </Label>
          <Input id="cl-sup" inputMode="decimal" value={supStr} onChange={(e) => setSup(e.target.value)} placeholder="ex. 80" />
        </div>
        <div>
          <Label htmlFor="cl-tip" className="mb-1.5 block">
            Tip construcție
          </Label>
          {sel('cl-tip', tip, (v) => setTip(parseInt(v, 10)), TIPURI.map((_, i) => i), TIPURI.map((t) => t.nume))}
        </div>
        <div>
          <Label htmlFor="cl-zona" className="mb-1.5 block">
            Zona în localitate
          </Label>
          {sel('cl-zona', zona, setZona, ['A', 'B', 'C', 'D'])}
        </div>
        <div>
          <Label htmlFor="cl-rang" className="mb-1.5 block">
            Rangul localității
          </Label>
          {sel('cl-rang', rang, (v) => setRang(parseInt(v, 10)), RANGURI.map((_, i) => i), RANGURI.map((r) => `Rang ${r}${r === '0' ? ' (București)' : ''}`))}
        </div>
        <div>
          <Label htmlFor="cl-vechime" className="mb-1.5 block">
            Vechimea clădirii (ani)
          </Label>
          <Input id="cl-vechime" inputMode="numeric" value={vechimeStr} onChange={(e) => setVechime(e.target.value)} placeholder="ex. 20" />
        </div>
        <div>
          <Label htmlFor="cl-cota" className="mb-1.5 block">
            Cota de impozitare (%)
          </Label>
          <Input id="cl-cota" inputMode="decimal" value={cotaStr} onChange={(e) => setCota(e.target.value)} placeholder="0,1" />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <span className="font-bold text-secondary-900">Impozit estimat pe clădire</span>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(impozit)} lei/an</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Valoare/m² (2026)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(valMp)} lei</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Coeficient corecție (zona {zona}, rang {RANGURI[rang]})</span>
                <span className="text-sm font-bold text-secondary-900">{coef.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Reducere vechime</span>
                <span className="text-sm font-bold text-secondary-900">{ajVechime === 1 ? '0%' : ajVechime === 0.85 ? '−15%' : '−25%'}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-neutral-50">
                <span className="text-sm font-semibold text-secondary-900">Valoare impozabilă</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(valoareImpozabila)} lei</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Orientativ. Cota exactă (0,08–0,2% pentru locuințe), zona (A–D) și eventualele majorări locale (până la +50%)
            se stabilesc prin hotărâre a consiliului local — valoarea finală e la Direcția de Taxe (DITL) a primăriei.
            Pentru clădiri nerezidențiale cota este 0,2–1,3%.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Completează suprafața și cota pentru a estima impozitul.</p>
      )}
    </div>
  );
}
