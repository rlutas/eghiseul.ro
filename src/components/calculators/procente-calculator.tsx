'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Mode = 'din' | 'cat' | 'variatie';

const MODES: { key: Mode; label: string }[] = [
  { key: 'din', label: 'X% din Y' },
  { key: 'cat', label: 'Cât % e X din Y' },
  { key: 'variatie', label: 'Creștere / scădere %' },
];

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 }).format(n);
}

export function ProcenteCalculator() {
  const [mode, setMode] = useState<Mode>('din');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  const na = parseFloat(a.replace(',', '.'));
  const nb = parseFloat(b.replace(',', '.'));
  const valid = !isNaN(na) && !isNaN(b === '' ? NaN : nb);

  let result: string | null = null;
  let resultLabel = '';
  if (valid) {
    if (mode === 'din') {
      result = fmt((na / 100) * nb);
      resultLabel = `${fmt(na)}% din ${fmt(nb)} =`;
    } else if (mode === 'cat') {
      result = nb !== 0 ? `${fmt((na / nb) * 100)}%` : '—';
      resultLabel = `${fmt(na)} reprezintă din ${fmt(nb)}:`;
    } else {
      result = na !== 0 ? `${fmt(((nb - na) / na) * 100)}%` : '—';
      resultLabel = `Variația de la ${fmt(na)} la ${fmt(nb)}:`;
    }
  }

  const labels: Record<Mode, [string, string]> = {
    din: ['Procent (%)', 'Valoare (Y)'],
    cat: ['Valoare (X)', 'Total (Y)'],
    variatie: ['Valoare inițială', 'Valoare finală'],
  };

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

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="calc-a" className="mb-1.5 block">{labels[mode][0]}</Label>
          <Input
            id="calc-a"
            inputMode="decimal"
            value={a}
            onChange={(e) => setA(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="calc-b" className="mb-1.5 block">{labels[mode][1]}</Label>
          <Input
            id="calc-b"
            inputMode="decimal"
            value={b}
            onChange={(e) => setB(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-5">
        <p className="text-sm text-neutral-600">{result ? resultLabel : 'Completează ambele câmpuri'}</p>
        <p className="text-3xl font-extrabold text-secondary-900 mt-1">{result ?? '—'}</p>
      </div>
    </div>
  );
}
