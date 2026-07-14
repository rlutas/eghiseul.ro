'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LAND_UNITS } from '@/components/calculators/unitati-teren-data';

type Mode = 'vechi' | 'invers';

const MODES: { key: Mode; label: string }[] = [
  { key: 'vechi', label: 'Unitate veche → m² / ari / ha' },
  { key: 'invers', label: 'm² → unități vechi' },
];

function fmt(n: number, maxDigits = 2): string {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat('ro-RO', { maximumFractionDigits: maxDigits }).format(n);
}

export function UnitatiTerenCalculator() {
  const [mode, setMode] = useState<Mode>('vechi');
  const [value, setValue] = useState('');
  const [unitId, setUnitId] = useState('jugar-cadastral');

  const n = parseFloat(value.replace(',', '.'));
  const valid = !isNaN(n) && n >= 0;
  const unit = LAND_UNITS.find((u) => u.id === unitId) ?? LAND_UNITS[0];
  const mp = valid ? n * unit.mp : NaN;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-semibold border transition-all',
              mode === m.key
                ? 'bg-primary-500 border-primary-500 text-secondary-900'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'vechi' ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teren-valoare" className="mb-1.5 block">Cantitate</Label>
              <Input
                id="teren-valoare"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="ex. 2"
              />
            </div>
            <div>
              <Label htmlFor="teren-unitate" className="mb-1.5 block">Unitate veche</Label>
              <select
                id="teren-unitate"
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {LAND_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
            {valid ? (
              <>
                <p className="text-sm text-neutral-600">
                  {fmt(n)} × {unit.label} ({fmt(unit.mp, 4)} m²/unitate) =
                </p>
                <p className="text-3xl font-extrabold text-secondary-900 mt-1">{fmt(mp)} m²</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white/70 border border-primary-100 px-3 py-2">
                    <p className="text-neutral-500">Ari</p>
                    <p className="font-bold text-secondary-900">{fmt(mp / 100)}</p>
                  </div>
                  <div className="rounded-lg bg-white/70 border border-primary-100 px-3 py-2">
                    <p className="text-neutral-500">Hectare</p>
                    <p className="font-bold text-secondary-900">{fmt(mp / 10000, 4)}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-600">Introdu cantitatea și alege unitatea</p>
                <p className="text-3xl font-extrabold text-secondary-900 mt-1">—</p>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="teren-mp" className="mb-1.5 block">Suprafață (m²)</Label>
            <Input
              id="teren-mp"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="ex. 5000"
            />
          </div>

          <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
            {valid ? (
              <>
                <p className="text-sm text-neutral-600 mb-3">
                  {fmt(n)} m² = {fmt(n / 100)} ari = {fmt(n / 10000, 4)} hectare, adică:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-primary-200 text-left text-neutral-600">
                        <th className="py-2 pr-3 font-semibold">Unitate veche</th>
                        <th className="py-2 pr-3 font-semibold">Regiune</th>
                        <th className="py-2 font-semibold text-right">Echivalent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LAND_UNITS.filter((u) => u.region !== 'unitate metrică').map((u) => (
                        <tr key={u.id} className="border-b border-primary-100/60 last:border-0">
                          <td className="py-2 pr-3 font-semibold text-secondary-900">{u.label}</td>
                          <td className="py-2 pr-3 text-neutral-600">{u.region}</td>
                          <td className="py-2 text-right font-bold text-secondary-900">
                            {fmt(n / u.mp, 4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-neutral-600">Introdu suprafața în metri pătrați</p>
                <p className="text-3xl font-extrabold text-secondary-900 mt-1">—</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
