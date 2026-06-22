'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { varstaPensionare } from '@/lib/pensii-anexa5';

/**
 * Calculator vârstă de pensionare — Anexa 5, Legea 360/2023. Pe baza sexului și
 * a datei nașterii întoarce vârsta standard de pensionare, data ieșirii la pensie
 * și stagiile de cotizare (complet și minim).
 */
const LUNI = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];
const aniLuni = (y: number, m: number) => (m > 0 ? `${y} ani și ${m} luni` : `${y} ani`);

export function VarstaPensionareCalculator() {
  const [gen, setGen] = useState<'f' | 'b'>('f');
  const [anStr, setAn] = useState('');
  const [luna, setLuna] = useState(0);

  const an = parseInt(anStr, 10);
  const valid = !isNaN(an) && an >= 1940 && an <= 2010;

  const r = valid ? varstaPensionare(gen, an, luna + 1) : null;
  let retLabel = '';
  if (valid && r) {
    const retYM = an * 12 + luna + (r.ageY * 12 + r.ageM);
    retLabel = `${LUNI[retYM % 12]} ${Math.floor(retYM / 12)}`;
  }

  return (
    <div>
      <Label className="mb-1.5 block">Sex</Label>
      <div className="flex gap-2 mb-4">
        {([['f', 'Femeie'], ['b', 'Bărbat']] as ['f' | 'b', string][]).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setGen(k)}
            className={cn('flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all', gen === k ? 'bg-primary-500 border-primary-500 text-secondary-900' : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300')}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vp-an" className="mb-1.5 block">Anul nașterii</Label>
          <Input id="vp-an" inputMode="numeric" value={anStr} onChange={(e) => setAn(e.target.value)} placeholder="ex. 1965" />
        </div>
        <div>
          <Label htmlFor="vp-luna" className="mb-1.5 block">Luna nașterii</Label>
          <select
            id="vp-luna"
            value={luna}
            onChange={(e) => setLuna(parseInt(e.target.value, 10))}
            className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {LUNI.map((l, i) => (
              <option key={l} value={i}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {valid && r ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <span className="block text-sm text-neutral-600">Vârsta standard de pensionare</span>
            <span className="block text-2xl font-extrabold text-secondary-900 mt-0.5">{aniLuni(r.ageY, r.ageM)}</span>
            <span className="block text-sm text-neutral-500 mt-1">Te poți pensiona în <strong>{retLabel}</strong></span>
          </div>
          <div className="rounded-xl border border-neutral-200 overflow-hidden">
            <div className="divide-y divide-neutral-100">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Stagiu complet de cotizare</span>
                <span className="text-sm font-bold text-secondary-900">{aniLuni(r.scY, r.scM)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-sm text-neutral-700">Stagiu minim de cotizare</span>
                <span className="text-sm font-bold text-secondary-900">{aniLuni(r.sminY, r.sminM)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-500">
            Conform Anexei 5 din Legea 360/2023. Vârsta standard crește treptat, egalizându-se la 65 de ani pentru femei
            și bărbați (femeile născute din 1970 → 65 de ani). Pensionarea anticipată (parțială) e posibilă cu stagiu
            peste cel complet. Estimare orientativă — verifică la Casa de Pensii.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Alege sexul, anul (1940–2010) și luna nașterii.</p>
      )}
    </div>
  );
}
