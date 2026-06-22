'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator credit ipotecar / rată credit — rata lunară pentru un credit cu
 * rate egale (anuitate): R = P·i / (1 − (1+i)^−n). Orientativ, fără comisioane/DAE.
 */
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

export function CreditIpotecarCalculator() {
  const [sumaStr, setSuma] = useState('');
  const [dobStr, setDob] = useState('');
  const [aniStr, setAni] = useState('');

  const P = parse(sumaStr);
  const r = parse(dobStr);
  const ani = parse(aniStr);
  const valid = !isNaN(P) && P > 0 && !isNaN(r) && r >= 0 && !isNaN(ani) && ani > 0;

  const i = valid ? r / 12 / 100 : 0;
  const n = valid ? Math.round(ani * 12) : 0;
  const rata = valid ? (i > 0 ? (P * i) / (1 - Math.pow(1 + i, -n)) : P / n) : 0;
  const total = rata * n;
  const dobanda = total - P;

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="ci-suma" className="mb-1.5 block">
            Sumă credit (lei)
          </Label>
          <Input id="ci-suma" inputMode="numeric" value={sumaStr} onChange={(e) => setSuma(e.target.value)} placeholder="ex. 300000" />
        </div>
        <div>
          <Label htmlFor="ci-dob" className="mb-1.5 block">
            Dobândă anuală (%)
          </Label>
          <Input id="ci-dob" inputMode="decimal" value={dobStr} onChange={(e) => setDob(e.target.value)} placeholder="ex. 6" />
        </div>
        <div>
          <Label htmlFor="ci-ani" className="mb-1.5 block">
            Perioadă (ani)
          </Label>
          <Input id="ci-ani" inputMode="numeric" value={aniStr} onChange={(e) => setAni(e.target.value)} placeholder="ex. 25" />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <div>
              <span className="block font-bold text-secondary-900">Rata lunară</span>
              <span className="text-xs text-neutral-500">{n} de rate</span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(rata)} lei</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Total de plată</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(total)} lei</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Total dobândă</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(dobanda)} lei</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Estimare pentru un credit cu rate egale (anuitate). Nu include comisioanele, asigurările sau DAE — rata reală
            comunicată de bancă poate fi ușor mai mare. Verifică oferta băncii și gradul de îndatorare.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Completează suma, dobânda și perioada pentru a calcula rata lunară.</p>
      )}
    </div>
  );
}
