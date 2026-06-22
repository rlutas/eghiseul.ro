import Link from 'next/link';
import { Calculator } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata } from '@/lib/seo';
import { CALCULATORS_NAV } from '@/config/calculators-nav';

const TITLE = 'Calculatoare Online Gratuite 2026 — eGhișeul.ro';
const DESCRIPTION =
  'Peste 30 de calculatoare online gratuite: salariu, taxe, dividende, credite, notariale, juridice și de timp. Rapide, actualizate 2026, fără cont.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/calculator/',
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculatoare Online Gratuite')}`,
});

// Descrieri scurte pe slug (afișate pe carduri). Slug = href.split('/')[2].
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
};

function slugOf(href: string): string {
  return href.split('/').filter(Boolean)[1] ?? '';
}

export default function Page() {
  return (
    <>
      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-20 lg:pb-24">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[900px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <Calculator className="w-3.5 h-3.5" /> Instrumente gratuite
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-4">
              Calculatoare online gratuite
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">{DESCRIPTION}</p>
          </div>
        </header>

        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4 max-w-[900px] space-y-10">
            {CALCULATORS_NAV.map((group) => (
              <div key={group.category}>
                <h2 className="text-xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                  {group.category}
                  <span className="text-sm font-normal text-neutral-400">({group.items.length})</span>
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
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
                        {DESC[slugOf(item.href)] && (
                          <p className="text-sm text-neutral-600 mt-0.5">{DESC[slugOf(item.href)]}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
