'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator salariu net/brut 2026 (rate verificate — vezi
 * docs/seo/calculator-formulas-2026.md). CAS 25%, CASS 10%, impozit 10%.
 * Constante pe perioadă (salariul minim crește la 1 iulie 2026).
 */
type Period = 's1' | 's2';

const PERIODS: Record<Period, { label: string; min: number; scutire: number; scutireCap: number }> = {
  s1: { label: 'Ian–Iun 2026', min: 4050, scutire: 300, scutireCap: 4300 },
  s2: { label: 'Iul–Dec 2026', min: 4325, scutire: 200, scutireCap: 4600 },
};

const r = (n: number) => Math.round(n);
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(n);

interface Result {
  gross: number; cas: number; cass: number; tax: number; deduction: number; exempt: number; net: number; cam: number; totalCost: number;
}

function netFromGross(gross: number, p: Period, deps: number, under26: boolean, childrenEdu: number): Result {
  const { min, scutire, scutireCap } = PERIODS[p];
  // Scutirea (300/200) se aplică la salariul minim cu normă întreagă.
  const exempt = gross === min && gross <= scutireCap ? scutire : 0;
  const cas = r((gross - exempt) * 0.25);
  const cass = r((gross - exempt) * 0.1);

  let deduction = 0;
  if (gross <= min + 2000) {
    const basePct = [20, 25, 30, 35][deps] ?? 45; // 4+ persoane = 45%
    const steps = Math.floor(Math.max(0, gross - min) / 50);
    const pct = Math.max(0, basePct - 0.5 * steps);
    deduction += (pct / 100) * min;
    if (under26) deduction += 0.15 * min;
  }
  deduction += childrenEdu * 100; // fără plafon de venit
  deduction = r(deduction);

  const taxBase = Math.max(0, gross - cas - cass - deduction - exempt);
  const tax = r(taxBase * 0.1);
  const net = gross - cas - cass - tax;
  const cam = r(gross * 0.0225);
  return { gross, cas, cass, tax, deduction, exempt, net, cam, totalCost: gross + cam };
}

function grossFromNet(targetNet: number, p: Period, deps: number, under26: boolean, childrenEdu: number): Result {
  let lo = targetNet;
  let hi = targetNet / 0.55 + 1000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const net = netFromGross(r(mid), p, deps, under26, childrenEdu).net;
    if (net < targetNet) lo = mid; else hi = mid;
  }
  return netFromGross(r(hi), p, deps, under26, childrenEdu);
}

export function SalariuCalculator() {
  const [mode, setMode] = useState<'brut' | 'net'>('brut');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<Period>('s1');
  const [deps, setDeps] = useState(0);
  const [under26, setUnder26] = useState(false);
  const [childrenEdu, setChildrenEdu] = useState(0);

  const val = parseFloat(amount.replace(/[.\s]/g, '').replace(',', '.'));
  const valid = !isNaN(val) && val > 0;
  const res: Result | null = valid
    ? mode === 'brut'
      ? netFromGross(r(val), period, deps, under26, childrenEdu)
      : grossFromNet(r(val), period, deps, under26, childrenEdu)
    : null;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {([['brut', 'Din brut → net'], ['net', 'Din net → brut']] as ['brut' | 'net', string][]).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            className={cn('px-4 py-2 rounded-full text-sm font-semibold border transition-all',
              mode === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sal-amount" className="mb-1.5 block">{mode === 'brut' ? 'Salariu brut (lei)' : 'Salariu net (lei)'}</Label>
          <Input id="sal-amount" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
        </div>
        <div>
          <Label htmlFor="sal-period" className="mb-1.5 block">Perioada</Label>
          <div className="flex gap-2">
            {(Object.keys(PERIODS) as Period[]).map((p) => (
              <button key={p} type="button" onClick={() => setPeriod(p)}
                className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  period === p ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}>
                {PERIODS[p].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="sal-deps" className="mb-1.5 block">Persoane în întreținere</Label>
          <Input id="sal-deps" inputMode="numeric" value={deps} onChange={(e) => setDeps(Math.max(0, parseInt(e.target.value) || 0))} />
        </div>
        <div>
          <Label htmlFor="sal-children" className="mb-1.5 block">Copii în învățământ (+100 lei/copil)</Label>
          <Input id="sal-children" inputMode="numeric" value={childrenEdu} onChange={(e) => setChildrenEdu(Math.max(0, parseInt(e.target.value) || 0))} />
        </div>
      </div>

      <label className="flex items-center gap-2 mt-4 text-sm text-neutral-700 cursor-pointer">
        <input type="checkbox" checked={under26} onChange={(e) => setUnder26(e.target.checked)} className="w-4 h-4 accent-primary-600" />
        Angajat sub 26 de ani (deducere suplimentară)
      </label>

      {res && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
              <p className="text-xs text-neutral-500 mb-1">Salariu net (în mână)</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(res.net)} lei</p>
            </div>
            <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-xs text-neutral-500 mb-1">Salariu brut</p>
              <p className="text-2xl font-extrabold text-secondary-900">{fmt(res.gross)} lei</p>
            </div>
          </div>
          <table className="w-full text-sm mt-4">
            <tbody className="[&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-neutral-100">
              <tr><td className="text-neutral-600">CAS (pensie, 25%)</td><td className="text-right tabular-nums">{fmt(res.cas)} lei</td></tr>
              <tr><td className="text-neutral-600">CASS (sănătate, 10%)</td><td className="text-right tabular-nums">{fmt(res.cass)} lei</td></tr>
              <tr><td className="text-neutral-600">Deducere personală</td><td className="text-right tabular-nums">{fmt(res.deduction)} lei</td></tr>
              <tr><td className="text-neutral-600">Impozit pe venit (10%)</td><td className="text-right tabular-nums">{fmt(res.tax)} lei</td></tr>
              <tr><td className="text-neutral-600">Cost total angajator (cu CAM 2,25%)</td><td className="text-right tabular-nums font-semibold">{fmt(res.totalCost)} lei</td></tr>
            </tbody>
          </table>
          <p className="text-xs text-neutral-500 mt-3">
            Rezultate orientative, conform ratelor 2026. Scutirea de impozit se aplică doar la salariul minim cu normă întreagă.
          </p>
        </div>
      )}
    </div>
  );
}
