'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ConcediuOdihnaCalculator() {
  const [perAn, setPerAn] = useState('21');
  const [luni, setLuni] = useState('12');

  const annual = parseInt(perAn) || 0;
  const months = Math.min(12, Math.max(0, parseInt(luni) || 0));
  const valid = annual > 0 && months > 0;
  const zile = valid ? Math.round((annual * months) / 12) : 0;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="co-an" className="mb-1.5 block">Zile de concediu pe an (conform contractului)</Label>
          <Input id="co-an" inputMode="numeric" value={perAn} onChange={(e) => setPerAn(e.target.value)} />
          <p className="text-xs text-neutral-500 mt-1.5">Minim legal: 20 zile lucrătoare (Codul Muncii art. 145).</p>
        </div>
        <div>
          <Label htmlFor="co-luni" className="mb-1.5 block">Luni lucrate în acest an</Label>
          <Input id="co-luni" inputMode="numeric" value={luni} onChange={(e) => setLuni(e.target.value)} />
        </div>
      </div>

      {valid && (
        <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
          <p className="text-sm text-neutral-600">Zile de concediu cuvenite (proporțional)</p>
          <p className="text-3xl font-extrabold text-secondary-900 mt-1">{zile} zile</p>
          <p className="text-xs text-neutral-500 mt-2">
            Calculat ca {annual} zile × {months}/12 luni. La încetarea contractului, zilele neefectuate
            se compensează în bani.
          </p>
        </div>
      )}
    </div>
  );
}
