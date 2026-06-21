'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const RATES = [21, 11, 9] as const;
type Direction = 'add' | 'extract';

function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function TvaCalculator() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState<number>(21);
  const [dir, setDir] = useState<Direction>('add');

  const val = parseFloat(amount.replace(',', '.'));
  const valid = !isNaN(val) && val >= 0;

  let net = 0;
  let tva = 0;
  let gross = 0;
  if (valid) {
    if (dir === 'add') {
      net = val;
      tva = val * (rate / 100);
      gross = net + tva;
    } else {
      gross = val;
      net = val / (1 + rate / 100);
      tva = gross - net;
    }
  }

  return (
    <div>
      {/* Direction */}
      <div className="flex flex-wrap gap-2 mb-5">
        {([['add', 'Adaugă TVA (la preț fără TVA)'], ['extract', 'Extrage TVA (din preț cu TVA)']] as [Direction, string][]).map(
          ([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDir(key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold border transition-all',
                dir === key
                  ? 'bg-primary-500 border-primary-500 text-secondary-900'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
              )}
            >
              {label}
            </button>
          )
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tva-amount" className="mb-1.5 block">
            {dir === 'add' ? 'Sumă fără TVA (lei)' : 'Sumă cu TVA (lei)'}
          </Label>
          <Input
            id="tva-amount"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="tva-rate" className="mb-1.5 block">Cotă TVA</Label>
          <div className="flex gap-2">
            {RATES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRate(r)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  rate === r
                    ? 'bg-primary-500 border-primary-500 text-secondary-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                )}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500 mb-1">Fără TVA</p>
          <p className="text-lg font-bold text-secondary-900">{valid ? fmt(net) : '—'}</p>
        </div>
        <div className="rounded-xl bg-primary-50 border border-primary-100 p-4">
          <p className="text-xs text-neutral-500 mb-1">TVA ({rate}%)</p>
          <p className="text-lg font-bold text-primary-700">{valid ? fmt(tva) : '—'}</p>
        </div>
        <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-4">
          <p className="text-xs text-neutral-500 mb-1">Cu TVA</p>
          <p className="text-lg font-bold text-secondary-900">{valid ? fmt(gross) : '—'}</p>
        </div>
      </div>
    </div>
  );
}
