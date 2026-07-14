'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { CALCULATORS_NAV } from '@/config/calculators-nav';
import { normalizeText } from '@/lib/services/service-search';

/**
 * Searchable calculator directory for /calculator — same live-search UX as the
 * services catalog (diacritics-insensitive, matches name + description).
 * Default view keeps the SEO-friendly grouping by category; an active query
 * switches to a flat grid with a result count.
 */

// Short card descriptions by slug (slug = href.split('/')[2]).
const DESC: Record<string, string> = {
  salariu: 'Conversie brut↔net cu rate 2026 (CAS, CASS, impozit, deducere).',
  'contributii-pfa': 'CAS, CASS și impozit pentru Declarația Unică, cu plafoanele 2026.',
  'concediu-medical': 'Indemnizația 2026 (procent progresiv, prima zi neplătită).',
  'indemnizatie-somaj': 'Indemnizația de șomaj 2026: bază + supliment pe stagiu, durată.',
  'calculator-indemnizatie-crestere-copil': 'ICC 2026: 85% din venit, între 1.650 și 8.500 lei.',
  'vechime-in-munca': 'Adună perioadele de angajare → vechime în ani, luni, zile.',
  'zile-concediu-odihna': 'Zile de concediu cuvenite proporțional cu lunile lucrate.',
  'impozit-pensie': 'Impozit 10% + CASS pe partea peste 3.000 lei; pensia netă (2026).',
  diurna: 'Diurna neimpozabilă (57,5 lei/zi în țară, per țară în străinătate).',
  'concediu-maternitate': 'Indemnizația 2026: 85% din venit, 126 zile, neimpozabilă.',
  'concediu-paternal': 'Zilele de concediu paternal (10 + 5 cu curs) și indemnizația.',
  'spor-salarial': 'Spor de noapte, ore suplimentare și muncă în sărbători legale.',
  'varsta-pensionare': 'Vârsta standard de pensionare și data ieșirii (Anexa 5, Legea 360/2023).',
  'estimare-pensie': 'Cuantumul pensiei: puncte de contributivitate + stabilitate × VPR (81 lei).',
  'pensie-invaliditate': 'Pensia de invaliditate pe grade (I/II/III) + indemnizația de însoțitor.',
  tva: 'Adaugă sau extrage TVA cu cotele 2026 (21% standard, 11% redus).',
  dividende: 'Impozit pe dividende 16% (2026) + CASS; suma netă încasată.',
  'taxe-srl': 'Micro 1% sau profit 16% + dividende și CASS; câți bani rămân.',
  'calculator-impozit-auto': 'Taxa auto anuală 2026 după capacitate cilindrică și normă.',
  'impozit-chirie': 'Impozit 10% pe venit net (deducere 20%) + CASS pe plafoane.',
  'penalitati-anaf': 'Dobânzi și penalități de întârziere pentru taxe neplătite.',
  'rambursare-anticipata': 'Cât economisești dacă plătești anticipat: reduci durata sau rata.',
  inflatie: 'Puterea de cumpărare a banilor între doi ani, pe baza ratelor INS.',
  'impozit-casa': 'Impozit pe clădiri 2026 după suprafață, tip, zonă și vechime.',
  'credit-ipotecar': 'Rata lunară, total de plată și total dobândă (anuitate).',
  'grad-indatorare': 'Gradul de îndatorare (DTI) și cât mai poți împrumuta.',
  'taxe-notariale': 'Onorariu, intabulare, impozit și extras CF (vânzare, donație, partaj).',
  'pensie-alimentara': 'Pensia de întreținere: 1/4, 1/3 sau 1/2 din venitul net (art. 529).',
  'termene-judiciare': 'Termene procedurale pe zile/luni/ani, cu sărbătorile legale.',
  'taxa-judiciara-de-timbru': 'Taxa de timbru pe tranșe (OUG 80/2013) + taxe fixe.',
  reabilitare: 'Când se șterge condamnarea din cazier (Codul Penal).',
  'amenda-circulatie': 'Amenda pe clase + puncte + plata redusă în 15 zile (2026).',
  'dobanda-legala': 'Dobânda legală penalizatoare/remuneratorie (OG 13/2011, rata BNR).',
  'zile-lucratoare': 'Zile lucrătoare dintr-un interval, fără weekend și sărbători.',
  'calculator-data': 'Adună/scade zile la o dată sau diferența între două date.',
  'calculator-procente': 'X% dintr-o valoare, cât % reprezintă, variație procentuală.',
  'jugar-stanjen-in-mp': 'Jugăr, stânjen, falce, pogon → metri pătrați, ari și hectare.',
};

function slugOf(href: string): string {
  return href.split('/').filter(Boolean)[1] ?? '';
}

interface CalcItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  desc?: string;
}

function CalculatorCard({ item }: { item: CalcItem }) {
  return (
    <Link
      href={item.href}
      className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 hover:border-primary-300 hover:shadow-md transition-all"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
        <item.icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-bold text-secondary-900 group-hover:text-primary-700 leading-tight">
          {item.name}
        </p>
        {item.desc && <p className="text-sm text-neutral-600 mt-0.5">{item.desc}</p>}
      </div>
    </Link>
  );
}

export function CalculatorsDirectory() {
  const [query, setQuery] = useState('');

  const groups = useMemo(
    () =>
      CALCULATORS_NAV.map((group) => ({
        category: group.category,
        items: group.items.map((item) => ({ ...item, desc: DESC[slugOf(item.href)] })),
      })),
    []
  );

  const q = normalizeText(query.trim());
  const results = useMemo(() => {
    if (!q) return [];
    return groups.flatMap((g) =>
      g.items.filter((item) =>
        normalizeText(`${item.name} ${item.desc ?? ''} ${g.category}`).includes(q)
      )
    );
  }, [groups, q]);

  return (
    <div className="space-y-10">
      {/* Search — sticky on mobile, same UX as the services catalog. */}
      <div className="sticky top-16 z-30 -mx-4 bg-neutral-50/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/80 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută calculator (ex. salariu, TVA, pensie, jugăr)…"
            aria-label="Caută calculator"
            className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-12 pr-11 text-[15px] text-secondary-900 shadow-sm outline-none placeholder:text-neutral-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Șterge căutarea"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-secondary-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!q ? (
        groups.map((group) => (
          <div key={group.category}>
            <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
              {group.category}
              <span className="text-sm font-normal text-neutral-400">({group.items.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {group.items.map((item) => (
                <CalculatorCard key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))
      ) : results.length > 0 ? (
        <div>
          <p className="mb-4 text-sm text-neutral-500">
            {results.length === 1 ? 'Un calculator găsit' : `${results.length} calculatoare găsite`}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {results.map((item) => (
              <CalculatorCard key={item.href} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <p className="font-semibold text-secondary-900">Niciun calculator găsit pentru „{query}”</p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Șterge căutarea și vezi toate calculatoarele
          </button>
        </div>
      )}
    </div>
  );
}
