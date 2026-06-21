import Link from 'next/link';
import {
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  CheckCircle,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceFAQ } from '@/components/services/service-faq';
import { Footer } from '@/components/home/footer';
import { buildLocationPageGraph, type CityData } from '@/lib/seo/locations';

const HUB_PATH = '/servicii/cazier-judiciar-online/';
const ORDER_PATH = '/comanda/cazier-judiciar-persoana-fizica/';
const PRICE = 198;

interface OtherCity {
  slug: string;
  name: string;
}

const STEPS = [
  'Completezi datele online, în 2-3 minute (fără cont).',
  'Semnezi împuternicirea direct în aplicație și plătești cu cardul.',
  'Depunem cererea la IPJ în numele tău, pe bază de împuternicire.',
  'Primești cazierul prin curier sau pe email, în 2-4 zile lucrătoare.',
];

const BENEFITS = ['Fără drum la IPJ', 'Fără cozi sau programare', 'Livrare 2-4 zile', 'Plată securizată cu cardul'];

export function CazierLocationPage({ city, otherCities }: { city: CityData; otherCities: OtherCity[] }) {
  const path = `${HUB_PATH}${city.slug}/`;
  const title = `Cazier Judiciar Online ${city.name}`;
  const description = `Obține cazierul judiciar în ${city.name} fără drum la IPJ ${city.judet}. Comandă online, livrare în 2-4 zile pe email sau curier.`;

  const jsonLd = buildLocationPageGraph({
    serviceName: `${title} — eGhișeul.ro`,
    description,
    path,
    cityName: city.name,
    price: PRICE,
    breadcrumb: [
      { name: 'Acasă', url: 'https://eghiseul.ro/' },
      { name: 'Cazier Judiciar Online', url: `https://eghiseul.ro${HUB_PATH}` },
      { name: city.name, url: `https://eghiseul.ro${path}` },
    ],
  });

  const scheduleRows = city.ipj.schedule ? Object.entries(city.ipj.schedule) : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
              <Link href="/" className="hover:text-primary-500 transition-colors">Acasă</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href={HUB_PATH} className="hover:text-primary-500 transition-colors">Cazier Judiciar Online</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white/80">{city.name}</span>
            </nav>

            <span className="inline-block px-3 py-1 bg-primary-500 text-secondary-900 text-xs font-bold rounded-full mb-4">
              Cazier judiciar {city.judet}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight mb-5">
              Cazier Judiciar Online {city.name} — Rapid, Fără Drum la Ghișeu
            </h1>

            <p className="text-lg text-white/85 leading-relaxed mb-8">
              {city.localContext} Prin eGhișeul.ro obții cazierul judiciar din {city.name} fără să stai
              la coadă: depunem cererea la IPJ {city.judet} în numele tău și primești documentul prin
              curier sau pe email.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
              >
                <Link href={ORDER_PATH}>
                  Comandă cazierul — de la {PRICE} RON
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl transition-all duration-200"
              >
                <Link href={HUB_PATH}>Vezi detaliile serviciului</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Local IPJ office — anti-thin anchor, overlaps the hero like the hubs */}
        <section className="bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <div className="relative -mt-16 lg:-mt-20 rounded-2xl border border-neutral-200 bg-white p-6 lg:p-8 shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-1">
                Unde se eliberează cazierul judiciar în {city.name}
              </h2>
              <p className="text-sm text-neutral-600 mb-6">
                La ghișeu, cazierul se obține de la biroul de specialitate din cadrul IPJ {city.judet}.
                Mai jos găsești datele oficiale — sau eviți complet drumul comandând online.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-secondary-900">{city.ipj.name}</h3>
                  </div>
                  <ul className="space-y-2.5 text-sm text-neutral-700">
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                      {city.ipj.address}
                    </li>
                    {city.ipj.phone && (
                      <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <a href={`tel:${city.ipj.phone.replace(/\s/g, '')}`} className="hover:text-primary-700">
                          {city.ipj.phone}
                        </a>
                      </li>
                    )}
                    {city.ipj.website && (
                      <li className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-primary-600 flex-shrink-0" />
                        <a
                          href={city.ipj.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-700 font-medium hover:text-primary-800"
                        >
                          Pagina oficială IPJ {city.judet}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
                {scheduleRows.length > 0 && (
                  <div className="md:border-l md:border-neutral-200 md:pl-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-secondary-900">Program cu publicul</h3>
                    </div>
                    <table className="w-full text-sm text-neutral-700">
                      <tbody>
                        {scheduleRows.map(([day, hours]) => (
                          <tr key={day} className="border-b border-neutral-100 last:border-0">
                            <td className="py-1.5 pr-4 font-medium">{day}</td>
                            <td className="py-1.5 text-right tabular-nums">{hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-5">
                Date publice, preluate de pe pagina oficială a IPJ {city.judet}. Programul se poate
                modifica — verifică pe site-ul instituției înainte de deplasare. Cu eGhișeul.ro nu mai
                depinzi de program.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[820px]">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6">
              Cum obții cazierul online în {city.name}
            </h2>
            <ol className="grid sm:grid-cols-2 gap-4">
              {STEPS.map((step, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-5 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500 text-secondary-900 font-bold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-neutral-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-700">
              {BENEFITS.map((b) => (
                <span key={b} className="inline-flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" /> {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Local FAQ */}
        <ServiceFAQ title={`Întrebări frecvente — cazier judiciar ${city.name}`} faqs={city.localFaq} />

        {/* Other cities */}
        {otherCities.length > 0 && (
          <section className="py-12 lg:py-16 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-[820px]">
              <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-4">
                Cazier judiciar și în alte orașe
              </h2>
              <div className="flex flex-wrap gap-3">
                {otherCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`${HUB_PATH}${c.slug}/`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-700 hover:shadow-sm transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-primary-600" /> Cazier judiciar {c.name}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-neutral-600 mt-5">
                Indiferent de localitate, comanzi online prin{' '}
                <Link href={HUB_PATH} className="text-primary-700 font-medium hover:underline">
                  serviciul de cazier judiciar
                </Link>{' '}
                — depunem cererea la IPJ-ul competent în numele tău.
              </p>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="relative py-14 lg:py-20 bg-gradient-to-b from-secondary-900 to-[#0C1A2F] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #ECB95F 1px, transparent 0)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>
          <div className="relative container mx-auto px-4 max-w-[820px] text-center">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-4">
              Comandă cazierul judiciar din {city.name} acum
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
              Fără drum la IPJ {city.judet}, fără cozi. Completezi în câteva minute și primești
              documentul prin curier sau pe email.
            </p>
            <Button
              asChild
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-6 text-lg rounded-xl shadow-[0_6px_14px_rgba(236,185,95,0.35)] hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Link href={ORDER_PATH}>
                Comandă acum — de la {PRICE} RON
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
