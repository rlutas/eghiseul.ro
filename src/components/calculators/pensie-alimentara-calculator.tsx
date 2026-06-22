'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Calculator pensie alimentară (întreținere copii) — Cod Civil art. 529.
 * Cote MAXIME din venitul net lunar al părintelui debitor: 1/4 (1 copil),
 * 1/3 (2 copii), 1/2 (3+ copii); plafon global 1/2 (alin. 3). Fără venituri →
 * referință salariul minim net (2.574 lei H1 / 2.699 lei H2 2026, HG 146/2025).
 */

const PERCENT: Record<number, number> = { 1: 1 / 4, 2: 1 / 3, 3: 1 / 2 };
// Salariul minim NET 2026 (HG 146/2025): ian–iun 2.574 / iul–dec 2.699
function netMinWage(): number {
  const d = new Date();
  if (d.getFullYear() === 2026) return d.getMonth() < 6 ? 2574 : 2699;
  return d.getFullYear() < 2026 ? 2574 : 2699;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

const ORDINAL = ['Primul copil', 'Al doilea copil', 'Al treilea copil', 'Al patrulea copil'];

export function PensieAlimentaraCalculator() {
  const [venitStr, setVenit] = useState('');
  const [copii, setCopii] = useState(1);
  const [faraVenit, setFaraVenit] = useState(false);

  const minWage = netMinWage();
  const venitRaw = parse(venitStr);
  const base = faraVenit ? minWage : !isNaN(venitRaw) && venitRaw > 0 ? venitRaw : 0;
  const valid = base > 0;

  const pct = PERCENT[Math.min(copii, 3)];
  const total = valid ? base * pct : 0;
  const perChild = valid ? total / copii : 0;

  return (
    <div>
      {/* Sursă venit */}
      <Label className="mb-1.5 block">Venitul părintelui obligat</Label>
      <div className="flex gap-2 mb-4">
        {([[false, 'Venit declarat'], [true, 'Fără venituri (salariul minim)']] as [boolean, string][]).map(
          ([k, l]) => (
            <button
              key={l}
              type="button"
              onClick={() => setFaraVenit(k)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                faraVenit === k
                  ? 'bg-primary-500 border-primary-500 text-secondary-900'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
              )}
            >
              {l}
            </button>
          )
        )}
      </div>

      {!faraVenit ? (
        <div>
          <Label htmlFor="pa-venit" className="mb-1.5 block">
            Venit net lunar (lei)
          </Label>
          <Input
            id="pa-venit"
            inputMode="numeric"
            value={venitStr}
            onChange={(e) => setVenit(e.target.value)}
            placeholder="ex. 4000"
          />
        </div>
      ) : (
        <p className="text-sm text-neutral-600 rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
          Se folosește salariul minim net pe economie ca reper: <strong>{fmt(minWage)} lei/lună</strong> (2026).
          Instanța prezumă capacitatea de a câștiga cel puțin minimul legal.
        </p>
      )}

      {/* Număr copii */}
      <div className="mt-4">
        <Label className="mb-1.5 block">Număr de copii minori</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCopii(n)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                copii === n
                  ? 'bg-primary-500 border-primary-500 text-secondary-900'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
              )}
            >
              {n}
              {n === 4 ? '+' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Rezultate */}
      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <div>
              <span className="block font-bold text-secondary-900">Pensie alimentară totală</span>
              <span className="text-xs text-neutral-500">
                {copii === 1 ? '1/4' : copii === 2 ? '1/3' : '1/2'} din {fmt(base)} lei (maxim legal)
              </span>
            </div>
            <span className="text-2xl font-extrabold text-secondary-900 whitespace-nowrap">{fmt(total)} lei</span>
          </div>

          {copii > 1 && (
            <div className="rounded-xl border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-100 px-4 py-2.5 text-sm font-bold text-secondary-900">Pe fiecare copil</div>
              <div className="divide-y divide-neutral-100">
                {Array.from({ length: copii }, (_, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-neutral-700">{ORDINAL[i]}</span>
                    <span className="text-sm font-bold text-secondary-900">{fmt(perChild)} lei</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-neutral-500">
            Cotele sunt <strong>maxime</strong> (Cod Civil art. 529: „până la” 1/4, 1/3, 1/2) — instanța sau acordul
            parental pot stabili mai puțin, după nevoile copilului și mijloacele părintelui. Totalul întreținerii (copii
            + eventual soț) nu poate depăși 1/2 din venitul net (art. 529 alin. 3). Întreținerea se datorează până la 18
            ani, iar dacă copilul continuă studiile, până la finalizarea lor, dar cel mult 26 de ani.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu venitul net pentru a estima pensia alimentară.</p>
      )}
    </div>
  );
}
