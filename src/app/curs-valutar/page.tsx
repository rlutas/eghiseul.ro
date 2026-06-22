import Link from 'next/link';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { buildPageMetadata } from '@/lib/seo';
import { getBnrRates, CURRENCY_NAMES, type BnrRate } from '@/lib/bnr';
import { ServiceFAQ } from '@/components/services/service-faq';
import { Footer } from '@/components/home/footer';

const TITLE = 'Curs Valutar BNR Azi — Euro, Dolar și Toate Valutele';
const DESCRIPTION =
  'Cursul valutar oficial BNR de azi: euro, dolar, liră, franc elvețian și toate valutele, actualizat zilnic din sursa oficială a Băncii Naționale a României.';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/curs-valutar/',
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Curs Valutar BNR Azi')}`,
});

const PRIORITY = ['EUR', 'USD', 'GBP', 'CHF'];
const nf = new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

function sortRates(rates: BnrRate[]): BnrRate[] {
  return [...rates].sort((a, b) => {
    const ia = PRIORITY.indexOf(a.currency);
    const ib = PRIORITY.indexOf(b.currency);
    if (ia !== -1 || ib !== -1) {
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }
    return a.currency.localeCompare(b.currency);
  });
}

export default async function Page() {
  const { date, rates } = await getBnrRates();
  const sorted = sortRates(rates);
  const dateLabel = date
    ? new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <>
      <main id="main-content" className="min-h-screen bg-neutral-50 -mt-16 lg:-mt-[112px]">
        {/* Hero */}
        <header className="relative overflow-hidden bg-gradient-to-b from-secondary-900 to-[#0C1A2F] pt-24 lg:pt-36 pb-24 lg:pb-32">
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
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-500 transition-colors">
                Acasă
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white/80">Curs valutar</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              <TrendingUp className="w-3.5 h-3.5" /> Curs oficial BNR
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Curs valutar BNR {dateLabel ? `— ${dateLabel}` : 'azi'}
            </h1>
            <p className="text-lg text-white/85 leading-relaxed">
              Cursurile de referință ale Băncii Naționale a României, actualizate zilnic din sursa oficială. 1 unitate de
              valută exprimată în lei (RON).
            </p>
          </div>
        </header>

        {/* Tabel — overlaps hero */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 shadow-lg">
              {sorted.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left text-neutral-500">
                      <th className="py-2.5 pr-3 font-semibold">Valută</th>
                      <th className="py-2.5 px-3 font-semibold">Cod</th>
                      <th className="py-2.5 pl-3 font-semibold text-right">Curs (lei)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r) => {
                      const per1 = r.value / r.multiplier;
                      const major = PRIORITY.includes(r.currency);
                      return (
                        <tr
                          key={r.currency}
                          className={major ? 'border-b border-neutral-100 bg-primary-50/40' : 'border-b border-neutral-100'}
                        >
                          <td className="py-2.5 pr-3 text-secondary-900">
                            {CURRENCY_NAMES[r.currency] ?? r.currency}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-500 font-mono">{r.currency}</td>
                          <td className="py-2.5 pl-3 text-right font-bold text-secondary-900 tabular-nums">
                            {nf.format(per1)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="text-sm text-neutral-500 py-6 text-center">
                  Cursul BNR nu este disponibil momentan. Reîncearcă peste câteva minute.
                </p>
              )}
              <p className="text-xs text-neutral-400 mt-4">
                Sursă: Banca Națională a României (cursuri de referință). Cursurile comerciale ale băncilor și caselor de
                schimb diferă de cursul BNR.
              </p>
            </div>
          </div>
        </section>

        {/* SEO content */}
        <article className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[760px]">
            <div
              className="prose prose-neutral max-w-none
                prose-headings:font-bold prose-headings:text-secondary-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-p:text-neutral-700 prose-p:leading-relaxed
                prose-li:text-neutral-700 prose-li:marker:text-primary-500
                prose-a:text-primary-700 prose-a:font-medium prose-a:underline
                prose-strong:text-secondary-900"
            >
              <h2>Ce este cursul valutar BNR</h2>
              <p>
                Banca Națională a României publică zilnic, în fiecare zi lucrătoare (în jurul orei 13:00), cursurile de
                referință pentru leu față de principalele valute. Acestea sunt cursuri <strong>oficiale</strong>,
                folosite pentru contabilitate, declarații fiscale, contracte și calcule notariale — nu sunt cursuri la
                care poți schimba efectiv bani (băncile și casele de schimb aplică propriile cursuri, ușor diferite).
              </p>
              <h2>Când se actualizează cursul</h2>
              <p>
                Cursul BNR se stabilește o singură dată pe zi și rămâne valabil până la următoarea zi lucrătoare. În
                weekend și de sărbătorile legale se folosește ultimul curs publicat. Tabelul de mai sus se actualizează
                automat din sursa oficială BNR.
              </p>
              <h2>Cum se citește cursul</h2>
              <p>
                Valoarea afișată reprezintă câți lei costă o unitate din valuta respectivă. De exemplu, un curs euro de
                5,2391 înseamnă că 1 EUR = 5,2391 lei. Pentru valutele cu valoare mică pe unitate (yen, forint), BNR
                publică oficial cursul la 100 de unități; în tabel afișăm valoarea raportată la o singură unitate.
              </p>
              <p>
                Cursul BNR este folosit și în <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>{' '}
                (pentru conversia prețului din euro în lei) și în celelalte{' '}
                <Link href="/calculator/">calculatoare</Link> de pe eGhișeul.
              </p>
            </div>
          </div>
        </article>

        <ServiceFAQ
          title="Întrebări frecvente"
          faqs={[
            {
              q: 'La ce oră se publică cursul BNR?',
              a: 'Banca Națională a României publică cursul de referință în fiecare zi lucrătoare, de regulă în jurul orei 13:00. Cursul rămâne valabil până în următoarea zi lucrătoare.',
            },
            {
              q: 'De ce cursul de la bancă este diferit de cursul BNR?',
              a: 'Cursul BNR este un curs oficial de referință, folosit pentru contabilitate și calcule fiscale. Băncile și casele de schimb aplică propriile cursuri de vânzare/cumpărare, care includ un comision și diferă de cursul BNR.',
            },
            {
              q: 'Ce curs se folosește în weekend?',
              a: 'În weekend și de sărbătorile legale BNR nu publică un curs nou, așa că se folosește ultimul curs publicat în ziua lucrătoare anterioară.',
            },
            {
              q: 'Cursul de pe această pagină este oficial?',
              a: 'Da, cursurile sunt preluate automat din sursa oficială a Băncii Naționale a României (feed-ul de cursuri de referință) și se actualizează zilnic.',
            },
          ]}
        />
      </main>

      <Footer />
    </>
  );
}
