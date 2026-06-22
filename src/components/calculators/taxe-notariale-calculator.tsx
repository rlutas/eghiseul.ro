'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Home, Gift, Users, Scale } from 'lucide-react';

/**
 * Calculator taxe notariale 2026 — vânzare / donație / succesiune / partaj.
 * Surse: onorarii OMJ 177/C/2024 (Anexa 2 Pct. I + Anexa 3) — grile PRE-TVA;
 * TVA 21% (Legea 141/2025); intabulare ANCPI 0,15% PF / 0,5% PJ; impozit transfer
 * Cod Fiscal art. 111 (3% ≤3 ani / 1% >3 ani, fără deducere); extras CF 20 lei online.
 * Onorariile sunt MINIME/orientative; valorile validate față de notariate.ro.
 */

// OMJ 177/C/2024, Anexa 2 Pct. I — vânzare & donație (pre-TVA)
const SALE_BRACKETS = [
  { upper: 20000, base: 0, rate: 0.022, over: 0, min: 230 },
  { upper: 35000, base: 440, rate: 0.019, over: 20000, min: 0 },
  { upper: 65000, base: 725, rate: 0.016, over: 35000, min: 0 },
  { upper: 100000, base: 1205, rate: 0.015, over: 65000, min: 0 },
  { upper: 200000, base: 1705, rate: 0.011, over: 100000, min: 0 },
  { upper: 600000, base: 2805, rate: 0.009, over: 200000, min: 0 },
  { upper: Infinity, base: 6405, rate: 0.006, over: 600000, min: 0 },
];

// OMJ 177/C/2024, Anexa 3 — succesiune (pre-TVA)
const SUCCESSION_BRACKETS = [
  { upper: 20000, base: 0, rate: 0.027, over: 0, min: 240 },
  { upper: 35000, base: 540, rate: 0.019, over: 20000, min: 0 },
  { upper: 65000, base: 725, rate: 0.016, over: 35000, min: 0 },
  { upper: Infinity, base: 1205, rate: 0.0085, over: 65000, min: 0 },
];

const TVA = 0.21;
const INTABULARE_PF = 0.0015;
const INTABULARE_PJ = 0.005;
const EXTRAS_CF = 40; // extras de autentificare CF (validat vs notariate.ro)
const PARTAJ_FLOOR_BASE = 450;
const PARTAJ_PER_LOT = 115;

type Bracket = { upper: number; base: number; rate: number; over: number; min: number };
function onorariu(value: number, brackets: Bracket[]): number {
  if (value <= 0) return 0;
  for (const b of brackets) {
    if (value <= b.upper) return Math.max(b.base + b.rate * (value - b.over), b.min);
  }
  return 0;
}

// Onorariu contract de ipotecă — OMJ 177/C/2024 Anexa 2 Pct. V, pe suma creditului, +TVA 21%.
function onorariuIpoteca(loan: number): number {
  if (loan <= 0) return 0;
  let pre: number;
  if (loan <= 50000) pre = Math.max(loan * 0.0085, 150);
  else if (loan <= 100000) pre = (loan - 50000) * 0.005 + 425;
  else if (loan <= 200000) pre = (loan - 100000) * 0.0046 + 750;
  else if (loan <= 500000) pre = (loan - 200000) * 0.0019 + 1209;
  else pre = (loan - 500000) * 0.001 + 1778;
  return Math.round(pre * (1 + TVA));
}
// Intabulare ipotecă (ANCPI) — 0,1% din credit + 100 lei, fără TVA.
function intabulareIpoteca(loan: number): number {
  return loan > 0 ? Math.round(loan * 0.001 + 100) : 0;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

const TABS = [
  { k: 'vanzare', label: 'Vânzare', icon: Home },
  { k: 'donatie', label: 'Donație', icon: Gift },
  { k: 'succesiune', label: 'Succesiune', icon: Users },
  { k: 'partaj', label: 'Partaj', icon: Scale },
] as const;
type TabKey = (typeof TABS)[number]['k'];

interface Row {
  label: string;
  value: number;
  note?: string;
}

export function TaxeNotarialeCalculator() {
  const [tab, setTab] = useState<TabKey>('vanzare');
  const [valStr, setVal] = useState('');
  const [cur, setCur] = useState<'lei' | 'eur'>('lei');
  const [bnr, setBnr] = useState<{ eur: number; date: string | null } | null>(null);
  const [pj, setPj] = useState(false);
  const [sub3, setSub3] = useState(false);
  const [ruda, setRuda] = useState(true);
  const [peste2, setPeste2] = useState(false);
  const [loturiStr, setLoturi] = useState('2');
  const [modPlata, setModPlata] = useState<'fara' | 'ipotecar' | 'noua'>('fara');
  const [creditStr, setCredit] = useState('');

  useEffect(() => {
    fetch('/api/bnr-rate')
      .then((r) => r.json())
      .then(setBnr)
      .catch(() => {});
  }, []);

  const eur = bnr?.eur ?? 5.07;
  const raw = parse(valStr);
  const value = !isNaN(raw) && raw > 0 ? (cur === 'eur' ? raw * eur : raw) : 0;
  const valid = value > 0;
  const creditRaw = parse(creditStr);
  const loanValue = !isNaN(creditRaw) && creditRaw > 0 ? (cur === 'eur' ? creditRaw * eur : creditRaw) : 0;

  // Build result groups per tab.
  const groups: { title: string; subtitle?: string; rows: Row[] }[] = [];
  let total = 0;

  if (valid) {
    const onorTva = onorariu(value, SALE_BRACKETS) * (1 + TVA);
    const intab = value * (pj ? INTABULARE_PJ : INTABULARE_PF);
    const impozit = value * (sub3 ? 0.03 : 0.01);

    if (tab === 'vanzare') {
      // Noua Casă: onorariul de vânzare are reducere 30% și nu se adaugă liniile de ipotecă.
      const saleOnor = onorariu(value, SALE_BRACKETS) * (modPlata === 'noua' ? 0.7 : 1) * (1 + TVA);
      const buyer: Row[] = [
        {
          label: modPlata === 'noua' ? 'Onorariu notarial (Noua Casă, cu TVA 21%)' : 'Onorariu notarial (cu TVA 21%)',
          value: saleOnor,
        },
        { label: `Intabulare (${pj ? '0,5% PJ' : '0,15% PF'})`, value: intab },
      ];
      if (modPlata === 'ipotecar' && loanValue > 0) {
        buyer.push({ label: 'Onorariu ipotecă (cu TVA 21%)', value: onorariuIpoteca(loanValue) });
        buyer.push({ label: 'Intabulare ipotecă', value: intabulareIpoteca(loanValue) });
      }
      const seller: Row[] = [
        { label: `Impozit la stat (${sub3 ? '3% sub 3 ani' : '1% peste 3 ani'})`, value: impozit },
        { label: 'Extras de carte funciară', value: EXTRAS_CF },
      ];
      groups.push({ title: 'Taxe cumpărător', rows: buyer });
      groups.push({ title: 'Taxe vânzător', rows: seller });
      total = buyer.concat(seller).reduce((s, r) => s + r.value, 0);
    } else if (tab === 'donatie') {
      const imp = ruda ? 0 : value * (sub3 ? 0.03 : 0.01);
      const rows: Row[] = [
        { label: 'Onorariu notarial (cu TVA 21%)', value: onorTva },
        { label: `Intabulare (${pj ? '0,5% PJ' : '0,15% PF'})`, value: intab },
        {
          label: 'Impozit la stat',
          value: imp,
          note: ruda ? 'scutit între rude până la gradul III + soți' : sub3 ? '3% (sub 3 ani)' : '1% (peste 3 ani)',
        },
        { label: 'Extras de carte funciară', value: EXTRAS_CF },
      ];
      groups.push({ title: 'Taxe dobânditor (donatar)', rows });
      total = rows.reduce((s, r) => s + r.value, 0);
    } else if (tab === 'succesiune') {
      const onorSucc = onorariu(value, SUCCESSION_BRACKETS) * (1 + TVA);
      const imp = peste2 ? value * 0.01 : 0;
      const rows: Row[] = [
        { label: 'Onorariu dezbatere succesorală (cu TVA 21%)', value: onorSucc },
        {
          label: 'Impozit la stat',
          value: imp,
          note: peste2 ? '1% (dezbătută peste 2 ani de la deces)' : 'scutit (în primii 2 ani de la deces)',
        },
        { label: 'Intabulare moștenitori (0,15%)', value: value * INTABULARE_PF },
        { label: 'Extras de carte funciară', value: EXTRAS_CF },
      ];
      groups.push({ title: 'Taxe moștenitori', rows });
      total = rows.reduce((s, r) => s + r.value, 0);
    } else if (tab === 'partaj') {
      const nLot = Math.max(parseInt(loturiStr) || 1, 1);
      const floor = PARTAJ_FLOOR_BASE + PARTAJ_PER_LOT * nLot;
      const onorBrut = Math.max(onorariu(value, SALE_BRACKETS), floor);
      const rows: Row[] = [
        { label: 'Onorariu partaj (cu TVA 21%)', value: onorBrut * (1 + TVA), note: `minim ${fmt(floor)} lei (${nLot} loturi)` },
        { label: `Intabulare (${pj ? '0,5% PJ' : '0,15% PF'})`, value: intab },
        { label: 'Impozit la stat', value: 0, note: 'partajul este scutit; 1%/3% doar pe sulta peste cotă' },
        { label: 'Extras de carte funciară', value: EXTRAS_CF },
      ];
      groups.push({ title: 'Taxe copărtași', rows });
      total = rows.reduce((s, r) => s + r.value, 0);
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setTab(t.k)}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all',
              tab === t.k
                ? 'bg-primary-500 border-primary-500 text-secondary-900'
                : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Valoare + monedă */}
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor="notar-val" className="mb-1.5 block">
            {tab === 'vanzare'
              ? 'Preț vânzare'
              : tab === 'donatie'
                ? 'Valoarea imobilului'
                : tab === 'succesiune'
                  ? 'Valoarea masei succesorale'
                  : 'Valoarea bunurilor partajate'}
          </Label>
          <Input
            id="notar-val"
            inputMode="numeric"
            value={valStr}
            onChange={(e) => setVal(e.target.value)}
            placeholder="ex. 350000"
          />
        </div>
        <div className="flex gap-1">
          {(['eur', 'lei'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCur(c)}
              className={cn(
                'px-3 h-10 rounded-lg text-sm font-bold border transition-all',
                cur === c
                  ? 'bg-primary-500 border-primary-500 text-secondary-900'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
              )}
            >
              {c === 'eur' ? '€' : 'Lei'}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-1.5">
        {bnr
          ? `Curs BNR${bnr.date ? ` ${bnr.date}` : ''}: 1€ = ${eur.toFixed(4)} lei`
          : 'Se încarcă cursul BNR…'}
        {cur === 'eur' && valid && ` · echivalent ${fmt(value)} lei`}
      </p>

      {/* Mod plată (doar vânzare) */}
      {tab === 'vanzare' && (
        <div className="mt-5">
          <Label className="mb-1.5 block">Mod plată</Label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['fara', 'Fără credit'],
                ['ipotecar', 'Credit ipotecar'],
                ['noua', 'Credit Noua Casă'],
              ] as ['fara' | 'ipotecar' | 'noua', string][]
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setModPlata(k)}
                className={cn(
                  'flex-1 min-w-[120px] px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                  modPlata === k
                    ? 'bg-primary-500 border-primary-500 text-secondary-900'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                )}
              >
                {l}
              </button>
            ))}
          </div>
          {modPlata === 'ipotecar' && (
            <div className="mt-3">
              <Label htmlFor="notar-credit" className="mb-1.5 block">
                Suma creditului ({cur === 'eur' ? '€' : 'lei'})
              </Label>
              <Input
                id="notar-credit"
                inputMode="numeric"
                value={creditStr}
                onChange={(e) => setCredit(e.target.value)}
                placeholder={cur === 'eur' ? 'ex. 80000' : 'ex. 300000'}
              />
            </div>
          )}
        </div>
      )}

      {/* Opțiuni specifice */}
      <div className="grid sm:grid-cols-2 gap-4 mt-5">
        {(tab === 'vanzare' || tab === 'donatie' || tab === 'partaj') && (
          <div>
            <Label className="mb-1.5 block">{tab === 'partaj' ? 'Copărtași' : 'Cumpărător / dobânditor'}</Label>
            <div className="flex gap-2">
              {([[false, 'Persoană fizică'], [true, 'Persoană juridică']] as [boolean, string][]).map(([k, l]) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setPj(k)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                    pj === k
                      ? 'bg-primary-500 border-primary-500 text-secondary-900'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {(tab === 'vanzare' || (tab === 'donatie' && !ruda)) && (
          <div>
            <Label className="mb-1.5 block">Vechimea proprietății</Label>
            <div className="flex gap-2">
              {([[false, 'Peste 3 ani'], [true, 'Sub 3 ani']] as [boolean, string][]).map(([k, l]) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSub3(k)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                    sub3 === k
                      ? 'bg-primary-500 border-primary-500 text-secondary-900'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'donatie' && (
          <div>
            <Label className="mb-1.5 block">Relația dintre părți</Label>
            <div className="flex gap-2">
              {([[true, 'Rude (≤ gradul III)'], [false, 'Alte persoane']] as [boolean, string][]).map(([k, l]) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setRuda(k)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                    ruda === k
                      ? 'bg-primary-500 border-primary-500 text-secondary-900'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'succesiune' && (
          <div>
            <Label className="mb-1.5 block">Termen de la deces</Label>
            <div className="flex gap-2">
              {([[false, 'În 2 ani'], [true, 'Peste 2 ani']] as [boolean, string][]).map(([k, l]) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setPeste2(k)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border transition-all',
                    peste2 === k
                      ? 'bg-primary-500 border-primary-500 text-secondary-900'
                      : 'bg-white border-neutral-200 text-neutral-700 hover:border-primary-300'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === 'partaj' && (
          <div>
            <Label htmlFor="notar-lot" className="mb-1.5 block">
              Număr de loturi
            </Label>
            <Input
              id="notar-lot"
              inputMode="numeric"
              value={loturiStr}
              onChange={(e) => setLoturi(e.target.value)}
              placeholder="ex. 2"
            />
          </div>
        )}
      </div>

      {/* Rezultate */}
      {valid ? (
        <div className="mt-6 space-y-4">
          {groups.map((g) => (
            <div key={g.title} className="rounded-xl border border-neutral-200 overflow-hidden">
              <div className="bg-neutral-100 px-4 py-2.5 text-sm font-bold text-secondary-900">{g.title}</div>
              <div className="divide-y divide-neutral-100">
                {g.rows.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                    <div>
                      <span className="text-sm text-neutral-700">{r.label}</span>
                      {r.note && <span className="block text-xs text-neutral-400">{r.note}</span>}
                    </div>
                    <span className="text-sm font-bold text-secondary-900 whitespace-nowrap">{fmt(r.value)} lei</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl bg-primary-50 border border-primary-100 px-5 py-4">
            <span className="font-bold text-secondary-900">Total taxe estimate</span>
            <span className="text-xl font-extrabold text-secondary-900">{fmt(total)} lei</span>
          </div>
          <p className="text-xs text-neutral-500">
            Estimare orientativă. Onorariile notariale sunt minime (notarul poate percepe peste grilă, OMJ 177/C/2024);
            cursul BNR și valoarea de grilă pot modifica rezultatul. Verifică la biroul notarial.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Introdu o valoare pentru a estima taxele notariale.</p>
      )}
    </div>
  );
}
