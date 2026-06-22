'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator taxe SRL 2026 — microîntreprindere 1% (cotă unică, 3% eliminată
 * OUG 89/2025, plafon 100.000 EUR) sau impozit pe profit 16%, plus impozit pe
 * dividende 16% (Legea 141/2025) + CASS pe plafoane (6/12/24 salarii minime).
 */
const W = 4050;
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

function cassDiv(base: number): number {
  if (base < 6 * W) return 0;
  if (base < 12 * W) return 0.1 * 6 * W;
  if (base < 24 * W) return 0.1 * 12 * W;
  return 0.1 * 24 * W;
}

export function TaxeSrlCalculator() {
  const [venStr, setVen] = useState('');
  const [cheltStr, setChelt] = useState('');
  const [regim, setRegim] = useState<'micro' | 'profit'>('micro');
  const [dividende, setDividende] = useState(true);

  const venituri = parse(venStr);
  const cheltuieli = parse(cheltStr) || 0;
  const valid = !isNaN(venituri) && venituri > 0;

  const profitBrut = Math.max(venituri - cheltuieli, 0);
  const impozitFirma = valid ? (regim === 'micro' ? venituri * 0.01 : profitBrut * 0.16) : 0;
  const distribuibil = Math.max((valid ? venituri : 0) - cheltuieli - impozitFirma, 0);
  const impozitDiv = dividende ? distribuibil * 0.16 : 0;
  const cass = dividende ? cassDiv(distribuibil) : 0;
  const inMana = dividende ? distribuibil - impozitDiv - cass : distribuibil;
  const totalTaxe = impozitFirma + impozitDiv + cass;
  const rata = valid && venituri > 0 ? (totalTaxe / venituri) * 100 : 0;
  const profitWins = valid && cheltuieli > 0.8 * venituri;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="srl-ven" className="mb-1.5 block">
            Venituri anuale (lei)
          </Label>
          <Input id="srl-ven" inputMode="numeric" value={venStr} onChange={(e) => setVen(e.target.value)} placeholder="ex. 300000" />
        </div>
        <div>
          <Label htmlFor="srl-chelt" className="mb-1.5 block">
            Cheltuieli deductibile/an (lei)
          </Label>
          <Input id="srl-chelt" inputMode="numeric" value={cheltStr} onChange={(e) => setChelt(e.target.value)} placeholder="ex. 100000" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div>
          <Label className="mb-1.5 block">Regim fiscal</Label>
          <div className="flex gap-2">
            {([['micro', 'Micro 1%'], ['profit', 'Profit 16%']] as ['micro' | 'profit', string][]).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setRegim(k)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  regim === k
                    ? 'bg-primary-500 border-primary-500 text-secondary-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="mb-1.5 block">Distribui dividende?</Label>
          <div className="flex gap-2">
            {([[true, 'Da'], [false, 'Nu (rămân în firmă)']] as [boolean, string][]).map(([k, l]) => (
              <button
                key={l}
                type="button"
                onClick={() => setDividende(k)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  dividende === k
                    ? 'bg-primary-500 border-primary-500 text-secondary-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <div>
              <span className="block font-bold text-secondary-900">{dividende ? 'Bani în mână (după toate taxele)' : 'Profit rămas în firmă'}</span>
              <span className="text-xs text-neutral-500">rată efectivă {rata.toFixed(1)}% din venituri</span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900">{fmt(inMana)} lei</span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">{regim === 'micro' ? 'Impozit micro (1% pe venituri)' : 'Impozit pe profit (16%)'}</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(impozitFirma)} lei</span>
              </div>
              {dividende && (
                <>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-neutral-700">Impozit dividende (16%)</span>
                    <span className="text-sm font-bold text-secondary-900">{fmt(impozitDiv)} lei</span>
                  </div>
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-neutral-700">CASS dividende</span>
                    <span className="text-sm font-bold text-secondary-900">{fmt(cass)} lei</span>
                  </div>
                </>
              )}
              <div className="flex justify-between px-4 py-2.5 bg-neutral-50">
                <span className="text-sm font-semibold text-secondary-900">Total taxe</span>
                <span className="text-sm font-bold text-secondary-900">{fmt(totalTaxe)} lei</span>
              </div>
            </div>
          </div>
          {profitWins && regim === 'micro' && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
              Cheltuielile depășesc 80% din venituri — impozitul pe profit (16% pe profit) ar putea fi mai avantajos
              decât micro (1% pe toate veniturile). Compară ambele regimuri.
            </p>
          )}
          <p className="text-xs text-neutral-500">
            Micro 1% (plafon 100.000 EUR, min. 1 salariat) sau profit 16%; dividendele se impozitează cu 16% (2026) +
            CASS pe plafoane. Nu include salariul/contractul de mandat al administratorului. Estimare orientativă.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu veniturile anuale pentru a estima taxele SRL.</p>
      )}
    </div>
  );
}
