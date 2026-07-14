'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Cadastru + intabulare cost calculator. Two scenarios:
 *
 * A. Prima înregistrare (imobil fără cadastru): taxă ANCPI FIXĂ 120 lei/imobil
 *    (recepție + înființare CF, cod 2.1.1, Ordin ANCPI 16/2019) — urgență
 *    120 + 4×120 = 600 lei — PLUS onorariul topografului autorizat (piață
 *    liberă, intervale orientative pe tip de imobil).
 *
 * B. Intabulare după cumpărare (documentația cadastrală există): taxă ANCPI
 *    procentuală — 0,15% din preț pentru PF (cod 2.3.2) / 0,50% pentru PJ
 *    (cod 2.3.1), minim 60 lei/imobil. Urgență = 5× taxa, cu supliment
 *    plafonat la 5.000 lei → total = taxă + min(4×taxă, 5.000). Fără topograf.
 */

type TipImobil = 'apartament' | 'casa' | 'teren-intravilan' | 'teren-extravilan';
type Context = 'prima-inregistrare' | 'intabulare-cumparare';
type Cumparator = 'pf' | 'pj';
type Regim = 'normal' | 'urgenta';

const TAXA_PRIMA_INREGISTRARE = 120; // lei, cod 2.1.1
const URGENTA_MULTIPLU = 4; // supliment = 4× tariful normal
const PLAFON_SUPLIMENT_URGENTA = 5000; // lei, plafon supliment (Ordin 16/2019)
const TAXA_INTABULARE_MIN = 60; // lei/imobil

/** Onorarii topograf autorizat — intervale orientative de piață (lei). */
const ONORARIU_TOPOGRAF: Record<TipImobil, { min: number; max: number; label: string }> = {
  apartament: { min: 700, max: 1100, label: 'apartament' },
  casa: { min: 1400, max: 2500, label: 'casă cu teren' },
  'teren-intravilan': { min: 900, max: 1800, label: 'teren intravilan' },
  'teren-extravilan': { min: 700, max: 1500, label: 'teren extravilan' },
};

const nf = new Intl.NumberFormat('ro-RO', { maximumFractionDigits: 2 });

const selectClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm';

export function CadastruCostCalculator() {
  const [tipImobil, setTipImobil] = useState<TipImobil>('apartament');
  const [context, setContext] = useState<Context>('prima-inregistrare');
  const [pret, setPret] = useState('');
  const [cumparator, setCumparator] = useState<Cumparator>('pf');
  const [regim, setRegim] = useState<Regim>('normal');

  const result = useMemo(() => {
    const urgent = regim === 'urgenta';

    if (context === 'prima-inregistrare') {
      const taxaNormala = TAXA_PRIMA_INREGISTRARE;
      const supliment = urgent ? URGENTA_MULTIPLU * taxaNormala : 0;
      const taxaAncpi = taxaNormala + supliment; // 120 sau 600 lei
      const onorariu = ONORARIU_TOPOGRAF[tipImobil];
      return {
        scenario: 'prima' as const,
        taxaAncpi,
        supliment,
        onorariu,
        totalMin: taxaAncpi + onorariu.min,
        totalMax: taxaAncpi + onorariu.max,
        urgent,
      };
    }

    const pretVal = parseFloat(pret.replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(pretVal) || pretVal <= 0) return null;

    const procent = cumparator === 'pf' ? 0.15 : 0.5;
    const taxaNormala = Math.max((pretVal * procent) / 100, TAXA_INTABULARE_MIN);
    const suplimentBrut = URGENTA_MULTIPLU * taxaNormala;
    const supliment = urgent ? Math.min(suplimentBrut, PLAFON_SUPLIMENT_URGENTA) : 0;
    const plafonat = urgent && suplimentBrut > PLAFON_SUPLIMENT_URGENTA;
    return {
      scenario: 'intabulare' as const,
      taxaNormala,
      supliment,
      total: taxaNormala + supliment,
      procent,
      plafonat,
      urgent,
    };
  }, [context, tipImobil, pret, cumparator, regim]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cci-tip">Tip imobil</Label>
          <select
            id="cci-tip"
            value={tipImobil}
            onChange={(e) => setTipImobil(e.target.value as TipImobil)}
            className={selectClass}
          >
            <option value="apartament">Apartament</option>
            <option value="casa">Casă cu teren</option>
            <option value="teren-intravilan">Teren fără construcții (intravilan)</option>
            <option value="teren-extravilan">Teren agricol (extravilan)</option>
          </select>
          <p className="text-[11px] leading-snug text-neutral-500">
            Nu știi situația cadastrală?{' '}
            <Link
              href="/servicii/extras-de-carte-funciara/"
              className="font-semibold text-primary-600 hover:underline"
            >
              Vezi extrasul CF →
            </Link>
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cci-context">Situația</Label>
          <select
            id="cci-context"
            value={context}
            onChange={(e) => setContext(e.target.value as Context)}
            className={selectClass}
          >
            <option value="prima-inregistrare">Primă înregistrare (imobil fără cadastru)</option>
            <option value="intabulare-cumparare">
              Intabulare după cumpărare (imobilul are deja cadastru)
            </option>
          </select>
          <p className="text-[11px] leading-snug text-neutral-500">
            Ai nevoie de acte din arhiva OCPI?{' '}
            <Link
              href="/servicii/copie-carte-funciara/"
              className="font-semibold text-primary-600 hover:underline"
            >
              Copie carte funciară →
            </Link>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {context === 'intabulare-cumparare' && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="cci-pret">Prețul imobilului (lei)</Label>
              <Input
                id="cci-pret"
                inputMode="decimal"
                placeholder="ex: 450000"
                value={pret}
                onChange={(e) => setPret(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cci-cumparator">Cumpărător</Label>
              <select
                id="cci-cumparator"
                value={cumparator}
                onChange={(e) => setCumparator(e.target.value as Cumparator)}
                className={selectClass}
              >
                <option value="pf">Persoană fizică (0,15%)</option>
                <option value="pj">Persoană juridică (0,50%)</option>
              </select>
            </div>
          </>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="cci-regim">Regim</Label>
          <select
            id="cci-regim"
            value={regim}
            onChange={(e) => setRegim(e.target.value as Regim)}
            className={selectClass}
          >
            <option value="normal">Normal</option>
            <option value="urgenta">Urgență (termen 1/3 din normal)</option>
          </select>
        </div>
      </div>

      {result && result.scenario === 'prima' && (
        <div className="rounded-xl bg-primary-50 p-4 space-y-2">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-secondary-700">
              Taxă ANCPI (recepție + înființare CF, cod 2.1.1)
              {result.urgent && ' — urgență: 120 + 4×120'}
            </span>
            <span className="font-semibold text-secondary-900 whitespace-nowrap">
              {nf.format(result.taxaAncpi)} lei
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-secondary-700">
              Onorariu topograf autorizat ({result.onorariu.label}, orientativ)
            </span>
            <span className="font-semibold text-secondary-900 whitespace-nowrap">
              {nf.format(result.onorariu.min)} – {nf.format(result.onorariu.max)} lei
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-primary-100 pt-2">
            <span className="text-sm text-secondary-700">Total estimat</span>
            <span className="text-2xl font-extrabold text-secondary-900 whitespace-nowrap">
              {nf.format(result.totalMin)} – {nf.format(result.totalMax)} lei
            </span>
          </div>
          <p className="pt-1 text-xs text-neutral-500">
            Taxa ANCPI e fixă (Ordin ANCPI 16/2019). Onorariile topografilor sunt pe piață liberă și
            diferă în funcție de județ, suprafață și complexitatea actelor — cere oferta exactă înainte
            de a semna.
          </p>
        </div>
      )}

      {result && result.scenario === 'intabulare' && (
        <div className="rounded-xl bg-primary-50 p-4 space-y-2">
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-secondary-700">
              Taxă ANCPI intabulare ({nf.format(result.procent)}% din preț, minim 60 lei)
            </span>
            <span className="font-semibold text-secondary-900 whitespace-nowrap">
              {nf.format(result.taxaNormala)} lei
            </span>
          </div>
          {result.urgent && (
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-secondary-700">
                Supliment urgență (4× taxa{result.plafonat ? ', plafonat la 5.000 lei' : ''})
              </span>
              <span className="font-semibold text-secondary-900 whitespace-nowrap">
                {nf.format(result.supliment)} lei
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-4 border-t border-primary-100 pt-2">
            <span className="text-sm text-secondary-700">Total taxă ANCPI</span>
            <span className="text-2xl font-extrabold text-secondary-900 whitespace-nowrap">
              {nf.format(result.total)} lei
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className="text-secondary-700">Onorariu topograf</span>
            <span className="font-semibold text-secondary-900 whitespace-nowrap">
              0 lei (documentația cadastrală există deja)
            </span>
          </div>
          <p className="pt-1 text-xs text-neutral-500">
            Taxa se plătește de regulă prin notar, la semnarea contractului de vânzare — notarul o
            virează la ANCPI odată cu cererea de intabulare. Calcul conform Ordin ANCPI 16/2019
            (coduri 2.3.2 / 2.3.1).
          </p>
        </div>
      )}
    </div>
  );
}
