import Link from 'next/link';
import { Calculator, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/home/footer';
import { buildPageMetadata } from '@/lib/seo';
import { HARDCODED_CALCULATOR_SLUGS } from '@/lib/seo/constants';

const TITLE = 'Calculatoare Online Gratuite — eGhișeul.ro';
const DESCRIPTION =
  'Calculatoare online gratuite: procente, salariu, impozit auto, TVA și altele. Rapid, fără instalare.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/calculator/',
  ogImage: '/og/default.png',
});

// Catalog afișat — extinde pe măsură ce se construiesc calculatoarele (vezi REBUILD-QUEUE).
const CATALOG: Record<string, { title: string; desc: string }> = {
  'calculator-impozit-auto': {
    title: 'Calculator Impozit Auto',
    desc: 'Taxa auto anuală 2026 după capacitate cilindrică și normă de poluare.',
  },
  salariu: {
    title: 'Calculator Salariu Net/Brut',
    desc: 'Conversie brut↔net cu rate 2026 (CAS, CASS, impozit, deducere personală).',
  },
  'amenda-circulatie': {
    title: 'Calculator Amendă Circulație',
    desc: 'Amenda pe clase + puncte de penalizare + plata redusă în 15 zile (2026).',
  },
  'concediu-medical': {
    title: 'Calculator Concediu Medical',
    desc: 'Indemnizația de concediu medical 2026 (procent progresiv, prima zi neplătită).',
  },
  'contributii-pfa': {
    title: 'Calculator Contribuții PFA',
    desc: 'CAS, CASS și impozit pentru Declarația Unică, cu plafoanele 2026.',
  },
  'vechime-in-munca': {
    title: 'Calculator Vechime în Muncă',
    desc: 'Adună perioadele de angajare → vechime totală în ani, luni, zile.',
  },
  'zile-concediu-odihna': {
    title: 'Calculator Zile Concediu de Odihnă',
    desc: 'Zile de concediu cuvenite proporțional cu lunile lucrate.',
  },
  'indemnizatie-somaj': {
    title: 'Calculator Indemnizație de Șomaj',
    desc: 'Indemnizația de șomaj 2026: bază + supliment pe stagiu, durată, CASS.',
  },
  'impozit-chirie': {
    title: 'Calculator Impozit pe Chirie',
    desc: 'Impozit 10% pe venit net (deducere 20%) + CASS pe plafoane.',
  },
  'penalitati-anaf': {
    title: 'Calculator Penalități ANAF',
    desc: 'Dobânzi și penalități de întârziere/nedeclarare pentru taxe neplătite.',
  },
  'calculator-indemnizatie-crestere-copil': {
    title: 'Calculator Indemnizație Creștere Copil',
    desc: 'ICC 2026: 85% din venitul net, între 1.650 și 8.500 lei brut.',
  },
  'taxa-judiciara-de-timbru': {
    title: 'Calculator Taxă Judiciară de Timbru',
    desc: 'Taxa de timbru pe tranșe (OUG 80/2013) + taxe fixe frecvente.',
  },
  reabilitare: {
    title: 'Calculator Reabilitare Cazier',
    desc: 'Când se șterge condamnarea din cazier — termenele din Codul Penal.',
  },
  tva: {
    title: 'Calculator TVA',
    desc: 'Adaugă sau extrage TVA cu cotele 2026 (21% standard, 11% redus).',
  },
  'calculator-procente': {
    title: 'Calculator Procente',
    desc: 'X% dintr-o valoare, cât la sută reprezintă un număr din altul, variație procentuală.',
  },
  'taxe-notariale': {
    title: 'Calculator Taxe Notariale',
    desc: 'Onorariu notarial, intabulare, impozit și extras CF pentru vânzare, donație, succesiune, partaj.',
  },
  'pensie-alimentara': {
    title: 'Calculator Pensie Alimentară',
    desc: 'Pensia de întreținere pentru copii: 1/4, 1/3 sau 1/2 din venitul net (Cod Civil art. 529).',
  },
  'termene-judiciare': {
    title: 'Calculator Termene Judiciare',
    desc: 'Termene procedurale pe zile, săptămâni, luni sau ani (Cod Proc. Civilă/Penală), cu sărbători legale.',
  },
  dividende: {
    title: 'Calculator Dividende',
    desc: 'Impozit pe dividende 16% (2026) + CASS pe plafoane; suma netă încasată.',
  },
  'taxe-srl': {
    title: 'Calculator Taxe SRL',
    desc: 'Micro 1% sau profit 16% + impozit dividende și CASS; câți bani rămân în mână.',
  },
  'rambursare-anticipata': {
    title: 'Calculator Rambursare Anticipată',
    desc: 'Cât economisești dacă plătești anticipat creditul: reduci durata sau rata.',
  },
};

export default function Page() {
  const items = HARDCODED_CALCULATOR_SLUGS.filter((s) => CATALOG[s]).map((s) => ({ slug: s, ...CATALOG[s] }));
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
          <div className="relative container mx-auto px-4 max-w-[820px]">
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
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="grid sm:grid-cols-2 gap-4">
              {items.map((c) => (
                <Link
                  key={c.slug}
                  href={`/calculator/${c.slug}/`}
                  className="group flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <Calculator className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-secondary-900 group-hover:text-primary-700">{c.title}</p>
                    <p className="text-sm text-neutral-600">{c.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto flex-shrink-0 mt-1 group-hover:text-primary-600" />
                </Link>
              ))}
            </div>
            <p className="text-sm text-neutral-500 mt-6">Mai multe calculatoare în curând.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
