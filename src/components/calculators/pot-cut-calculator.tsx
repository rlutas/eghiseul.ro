'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * POT/CUT buildable-area calculator: land area (m² or ari) + POT% (from the
 * certificat de urbanism) → maximum ground footprint; optional CUT → maximum
 * total (unfolded) floor area + rough storey estimate. Formulas per Legea
 * 350/2001 anexa 2: POT = Sc/S×100, CUT = Scd/S.
 */

const nf = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });

export function PotCutCalculator() {
  const [suprafata, setSuprafata] = useState('');
  const [unit, setUnit] = useState<'mp' | 'ari'>('mp');
  const [pot, setPot] = useState('');
  const [cut, setCut] = useState('');

  const result = useMemo(() => {
    const sRaw = parseFloat(suprafata.replace(',', '.'));
    const potVal = parseFloat(pot.replace(',', '.'));
    const cutVal = parseFloat(cut.replace(',', '.'));
    if (!Number.isFinite(sRaw) || sRaw <= 0 || !Number.isFinite(potVal) || potVal <= 0) return null;

    const terenMp = unit === 'ari' ? sRaw * 100 : sRaw;
    const amprenta = (terenMp * Math.min(potVal, 100)) / 100;
    const liber = terenMp - amprenta;
    const desfasurata = Number.isFinite(cutVal) && cutVal > 0 ? terenMp * cutVal : null;
    // Rough storey count: total floor area over the footprint. Informative
    // only — the real height regime comes from the PUG/PUZ, not from CUT alone.
    const niveluri = desfasurata && amprenta > 0 ? desfasurata / amprenta : null;

    return { terenMp, amprenta, liber, desfasurata, niveluri, potVal };
  }, [suprafata, unit, pot, cut]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="pc-teren">Suprafața terenului</Label>
          <Input
            id="pc-teren"
            inputMode="decimal"
            placeholder={unit === 'mp' ? 'ex: 500' : 'ex: 5'}
            value={suprafata}
            onChange={(e) => setSuprafata(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-unit">Unitate</Label>
          <select
            id="pc-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'mp' | 'ari')}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="mp">metri pătrați (mp)</option>
            <option value="ari">ari (1 ar = 100 mp)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pc-pot">POT maxim (%)</Label>
          <Input
            id="pc-pot"
            inputMode="decimal"
            placeholder="ex: 35"
            value={pot}
            onChange={(e) => setPot(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="pc-cut">CUT maxim (opțional)</Label>
          <Input
            id="pc-cut"
            inputMode="decimal"
            placeholder="ex: 0,9"
            value={cut}
            onChange={(e) => setCut(e.target.value)}
          />
        </div>
        <p className="self-end pb-1 text-xs text-neutral-500 sm:col-span-2">
          POT și CUT sunt scrise în certificatul de urbanism pentru informare (sau în PUG/PUZ-ul zonei).
        </p>
      </div>

      {result && (
        <div className="rounded-xl bg-primary-50 p-4 space-y-2">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-secondary-700">Construcția poate ocupa la sol maximum</span>
            <span className="text-2xl font-extrabold text-secondary-900 whitespace-nowrap">
              {nf.format(result.amprenta)} mp
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-secondary-700">Teren rămas liber (curte, grădină, alei)</span>
            <span className="font-semibold text-secondary-900 whitespace-nowrap">
              {nf.format(result.liber)} mp ({nf.format(100 - result.potVal)}%)
            </span>
          </div>
          {result.desfasurata != null && (
            <>
              <div className="flex items-baseline justify-between gap-4 text-sm border-t border-primary-100 pt-2">
                <span className="text-secondary-700">Suprafață construită desfășurată maximă (toate etajele)</span>
                <span className="font-semibold text-secondary-900 whitespace-nowrap">
                  {nf.format(result.desfasurata)} mp
                </span>
              </div>
              {result.niveluri != null && (
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-secondary-700">Orientativ, la amprenta maximă</span>
                  <span className="font-semibold text-secondary-900 whitespace-nowrap">
                    ~{nf.format(result.niveluri)} niveluri
                  </span>
                </div>
              )}
            </>
          )}
          <p className="pt-1 text-xs text-neutral-500">
            Calcul orientativ după formulele din Legea 350/2001 (anexa 2). Valorile POT/CUT exacte ale
            parcelei tale sunt cele din certificatul de urbanism — regimul de înălțime real îl dă PUG/PUZ-ul.
          </p>
        </div>
      )}
    </div>
  );
}
