'use client';

import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export interface ConverterCurrency {
  code: string;
  name: string;
  perUnit: number; // lei pentru 1 unitate (RON = 1)
}

const fmt = (n: number) =>
  new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

function CurrencySelect({
  id,
  value,
  onChange,
  currencies,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  currencies: ConverterCurrency[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {currencies.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name}
        </option>
      ))}
    </select>
  );
}

/**
 * Convertor valutar pe baza cursurilor BNR (toate raportate la RON).
 * amount × perUnit(from) / perUnit(to).
 */
export function CursConverter({ currencies }: { currencies: ConverterCurrency[] }) {
  const [amountStr, setAmount] = useState('100');
  const [from, setFrom] = useState('EUR');
  const [to, setTo] = useState('RON');

  const per = (code: string) => currencies.find((c) => c.code === code)?.perUnit ?? 1;
  const amount = parse(amountStr);
  const valid = !isNaN(amount) && amount >= 0;
  const result = valid ? (amount * per(from)) / per(to) : 0;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-lg">
      <h2 className="text-lg font-bold text-secondary-900 mb-4">Convertor valutar</h2>
      <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div>
          <label htmlFor="conv-amount" className="block text-xs font-semibold text-neutral-500 mb-1.5">
            Sumă
          </label>
          <div className="flex gap-2">
            <input
              id="conv-amount"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 rounded-xl border border-neutral-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="100"
            />
            <CurrencySelect id="conv-from" value={from} onChange={setFrom} currencies={currencies} />
          </div>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label="Inversează valutele"
          className="h-11 w-11 mx-auto flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-primary-300 hover:text-primary-600 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <div>
          <label htmlFor="conv-to" className="block text-xs font-semibold text-neutral-500 mb-1.5">
            În
          </label>
          <CurrencySelect id="conv-to" value={to} onChange={setTo} currencies={currencies} />
        </div>
      </div>

      {valid && (
        <div className="mt-4 rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 flex items-baseline justify-between gap-4 flex-wrap">
          <span className="text-sm text-neutral-600">
            {fmt(amount)} {from} =
          </span>
          <span className="text-2xl font-extrabold text-secondary-900">
            {fmt(result)} <span className="text-base font-bold">{to}</span>
          </span>
        </div>
      )}
      <p className="text-xs text-neutral-400 mt-3">La cursul de referință BNR. Cursurile bancare pot diferi.</p>
    </div>
  );
}
