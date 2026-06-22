'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Calculator rambursare anticipată credit — câtă dobândă economisești dacă plătești
 * anticipat o sumă, alegând să reduci durata sau rata. Matematică standard de
 * amortizare (anuitate). Fără TVA/comisioane (variabile de la bancă la bancă).
 */
const fmt = (n: number) => new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 0 }).format(Math.round(n));
const parse = (s: string) => parseFloat(s.replace(/[.\s]/g, '').replace(',', '.'));

function monthlyPayment(P: number, i: number, n: number): number {
  if (n <= 0) return 0;
  return i > 0 ? (P * i) / (1 - Math.pow(1 + i, -n)) : P / n;
}
function termMonths(P: number, i: number, pay: number): number {
  if (P <= 0) return 0;
  if (i <= 0) return Math.ceil(P / pay);
  if (pay <= P * i) return Infinity; // rata nu acoperă dobânda
  return Math.ceil(-Math.log(1 - (P * i) / pay) / Math.log(1 + i));
}

export function RambursareAnticipataCalculator() {
  const [soldStr, setSold] = useState('');
  const [rataDobStr, setRataDob] = useState('');
  const [luniStr, setLuni] = useState('');
  const [plataStr, setPlata] = useState('');

  const P = parse(soldStr);
  const r = parse(rataDobStr);
  const n = parseInt(luniStr, 10);
  const X = parse(plataStr) || 0;
  const valid = !isNaN(P) && P > 0 && !isNaN(r) && r >= 0 && !isNaN(n) && n > 0;

  const i = valid ? r / 12 / 100 : 0;
  const pay = valid ? monthlyPayment(P, i, n) : 0;
  const dobandaCurenta = valid ? pay * n - P : 0;

  const Pnou = Math.max(P - X, 0);
  const platit = valid && X > 0;
  const fullyPaid = platit && Pnou <= 0;

  // Reduci durata (păstrezi rata)
  const nNou = platit ? termMonths(Pnou, i, pay) : n;
  const dobandaDurata = platit ? (fullyPaid ? 0 : pay * nNou - Pnou) : dobandaCurenta;
  const economieDurata = dobandaCurenta - dobandaDurata;

  // Reduci rata (păstrezi durata)
  const payNou = platit ? monthlyPayment(Pnou, i, n) : pay;
  const dobandaRata = platit ? payNou * n - Pnou : dobandaCurenta;
  const economieRata = dobandaCurenta - dobandaRata;

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ra-sold" className="mb-1.5 block">
            Sold rămas (lei)
          </Label>
          <Input id="ra-sold" inputMode="numeric" value={soldStr} onChange={(e) => setSold(e.target.value)} placeholder="ex. 150000" />
        </div>
        <div>
          <Label htmlFor="ra-dob" className="mb-1.5 block">
            Dobândă anuală (%)
          </Label>
          <Input id="ra-dob" inputMode="decimal" value={rataDobStr} onChange={(e) => setRataDob(e.target.value)} placeholder="ex. 7,5" />
        </div>
        <div>
          <Label htmlFor="ra-luni" className="mb-1.5 block">
            Luni rămase
          </Label>
          <Input id="ra-luni" inputMode="numeric" value={luniStr} onChange={(e) => setLuni(e.target.value)} placeholder="ex. 180" />
        </div>
        <div>
          <Label htmlFor="ra-plata" className="mb-1.5 block">
            Sumă rambursată anticipat (lei)
          </Label>
          <Input id="ra-plata" inputMode="numeric" value={plataStr} onChange={(e) => setPlata(e.target.value)} placeholder="ex. 30000" />
        </div>
      </div>

      {valid ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-neutral-200 px-5 py-3 flex items-center justify-between">
            <div>
              <span className="text-sm text-neutral-700">Rata lunară actuală</span>
              <span className="block text-xs text-neutral-400">dobândă totală rămasă: {fmt(dobandaCurenta)} lei</span>
            </div>
            <span className="font-bold text-secondary-900">{fmt(pay)} lei</span>
          </div>

          {platit ? (
            fullyPaid ? (
              <div className="rounded-xl bg-primary-50 border border-primary-100 px-5 py-4 flex items-baseline justify-between gap-4">
                <span className="font-bold text-secondary-900">Credit achitat integral — dobândă economisită</span>
                <span className="text-2xl font-extrabold text-secondary-900">{fmt(economieDurata)} lei</span>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
                  <span className="block text-sm font-bold text-secondary-900">Reduci perioada</span>
                  <span className="block text-xs text-neutral-500 mb-2">păstrezi aceeași rată</span>
                  <span className="block text-lg font-extrabold text-secondary-900">{nNou} luni</span>
                  <span className="block text-xs text-neutral-500">în loc de {n} luni</span>
                  <span className="block mt-2 text-sm font-semibold text-green-700">
                    Economisești {fmt(economieDurata)} lei
                  </span>
                </div>
                <div className="rounded-xl border border-neutral-200 p-4">
                  <span className="block text-sm font-bold text-secondary-900">Reduci rata</span>
                  <span className="block text-xs text-neutral-500 mb-2">păstrezi aceeași durată</span>
                  <span className="block text-lg font-extrabold text-secondary-900">{fmt(payNou)} lei/lună</span>
                  <span className="block text-xs text-neutral-500">în loc de {fmt(pay)} lei</span>
                  <span className="block mt-2 text-sm font-semibold text-green-700">
                    Economisești {fmt(economieRata)} lei
                  </span>
                </div>
              </div>
            )
          ) : (
            <p className="text-sm text-neutral-500">Introdu suma rambursată anticipat pentru a vedea economia de dobândă.</p>
          )}

          <p className="text-xs text-neutral-500">
            Estimare orientativă pentru un credit cu rate egale (anuitate). Nu include comisioanele de rambursare
            anticipată — la creditele cu dobândă variabilă acestea sunt de regulă 0, la cele cu dobândă fixă pot fi până
            la 1%. Verifică în contractul de credit.
          </p>
        </div>
      ) : (
        <p className="mt-6 text-sm text-neutral-500">Completează soldul, dobânda și lunile rămase pentru a calcula.</p>
      )}
    </div>
  );
}
