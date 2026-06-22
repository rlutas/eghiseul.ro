'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator diurnă 2026 — plafonul neimpozabil pentru delegație/detașare.
 * În țară: 2,5 × diurna publică (23 lei) = 57,5 lei/zi, plafonat și la 3 salarii
 * de bază. Străinătate: 2,5 × valoarea cat. I per țară (HG 518/1995).
 * Partea peste plafon se impozitează ca salariu (10% + CAS 25% + CASS 10%).
 * Surse: Cod Fiscal art. 76(2)(k) și art. 142.
 */
const PLAFON_ZI_RO = 57.5; // 23 × 2,5
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 }).format(n);
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

const TARI: { nume: string; valuta: string; baza: number }[] = [
  { nume: 'Germania', valuta: 'EUR', baza: 35 },
  { nume: 'Franța', valuta: 'EUR', baza: 35 },
  { nume: 'Italia', valuta: 'EUR', baza: 35 },
  { nume: 'Marea Britanie', valuta: 'EUR', baza: 35 },
  { nume: 'SUA', valuta: 'USD', baza: 53 },
];

export function DiurnaCalculator() {
  const [tip, setTip] = useState<'tara' | 'strainatate'>('tara');
  const [zileStr, setZile] = useState('5');
  const [diurnaStr, setDiurna] = useState('');
  const [salariuStr, setSalariu] = useState('');
  const [tara, setTara] = useState(0);

  const zile = parseInt(zileStr, 10);
  const diurnaZi = parse(diurnaStr);
  const salariu = parse(salariuStr) || 0;
  const valid = !isNaN(zile) && zile > 0 && !isNaN(diurnaZi) && diurnaZi > 0;

  const taraSel = TARI[tara];
  const plafonZi = tip === 'tara' ? PLAFON_ZI_RO : taraSel.baza * 2.5;
  const valuta = tip === 'tara' ? 'lei' : taraSel.valuta;

  const totalAcordat = valid ? diurnaZi * zile : 0;
  // plafon zilnic
  const plafonZilnic = plafonZi * (valid ? zile : 0);
  // plafonul de 3 salarii (doar în țară, dacă a fost completat salariul)
  const plafon3Sal = tip === 'tara' && salariu > 0 ? (3 * salariu) / 21 : Infinity;
  const plafon3SalTotal = plafon3Sal === Infinity ? Infinity : plafon3Sal * zile;
  const neimpozabil = Math.min(plafonZilnic, plafon3SalTotal);
  const impozabil = Math.max(0, totalAcordat - neimpozabil);
  // taxe pe partea impozabilă (regim salarial) — doar în țară (lei)
  const taxe = tip === 'tara' ? impozabil * (0.1 + 0.25 + 0.1) : 0;

  return (
    <div>
      <Label className="mb-1.5 block">Tipul deplasării</Label>
      <div className="flex gap-2 mb-4">
        {([['tara', 'În țară'], ['strainatate', 'Străinătate']] as ['tara' | 'strainatate', string][]).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTip(k)}
            className={cn(
              'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
              tip === k
                ? 'bg-primary-500 border-primary-500 text-secondary-900'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      {tip === 'strainatate' && (
        <div className="mb-4">
          <Label htmlFor="diu-tara" className="mb-1.5 block">
            Țara
          </Label>
          <select
            id="diu-tara"
            value={tara}
            onChange={(e) => setTara(parseInt(e.target.value, 10))}
            className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {TARI.map((t, idx) => (
              <option key={t.nume} value={idx}>
                {t.nume} (plafon {fmt(t.baza * 2.5)} {t.valuta}/zi)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="diu-zi" className="mb-1.5 block">
            Diurnă acordată/zi ({valuta})
          </Label>
          <Input id="diu-zi" inputMode="decimal" value={diurnaStr} onChange={(e) => setDiurna(e.target.value)} placeholder={tip === 'tara' ? 'ex. 80' : 'ex. 100'} />
        </div>
        <div>
          <Label htmlFor="diu-zile" className="mb-1.5 block">
            Număr de zile
          </Label>
          <Input id="diu-zile" inputMode="numeric" value={zileStr} onChange={(e) => setZile(e.target.value)} placeholder="ex. 5" />
        </div>
        {tip === 'tara' && (
          <div className="sm:col-span-2">
            <Label htmlFor="diu-sal" className="mb-1.5 block">
              Salariu de bază lunar (opțional, pentru plafonul de 3 salarii)
            </Label>
            <Input id="diu-sal" inputMode="numeric" value={salariuStr} onChange={(e) => setSalariu(e.target.value)} placeholder="ex. 6000" />
          </div>
        )}
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Total diurnă acordată</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(totalAcordat)} {valuta}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Parte neimpozabilă (plafon {fmt(plafonZi)} {valuta}/zi)</span>
                <span className="text-sm font-bold text-green-700">{fmt(neimpozabil)} {valuta}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Parte impozabilă (peste plafon)</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(impozabil)} {valuta}</span>
              </div>
              {tip === 'tara' && impozabil > 0 && (
                <div className="flex justify-between px-4 py-2.5 bg-neutral-50">
                  <span className="text-sm text-neutral-700">Taxe pe partea impozabilă (≈45%)</span>
                  <span className="text-sm font-bold text-secondary-900">{fmt(taxe)} lei</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            În țară plafonul neimpozabil este 57,5 lei/zi (2,5 × diurna publică de 23 lei), limitat și la 3 salarii de
            bază. Peste plafon, diferența se impozitează ca salariu (impozit 10% + CAS 25% + CASS 10%). În străinătate
            plafonul e 2,5 × valoarea categoriei I pe țară (HG 518/1995). Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Completează diurna pe zi și numărul de zile.</p>
      )}
    </div>
  );
}
