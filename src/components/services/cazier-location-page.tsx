import Link from 'next/link';
import { MapPin, Phone, Clock, ArrowRight, CheckCircle, Building2, ExternalLink } from 'lucide-react';
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
      <main className="bg-white">
        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-4 pt-6 text-sm text-neutral-500 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary-600">Acasă</Link>
          <span>/</span>
          <Link href={HUB_PATH} className="hover:text-primary-600">Cazier Judiciar Online</Link>
          <span>/</span>
          <span className="text-secondary-900 font-medium">{city.name}</span>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 pt-8 pb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-secondary-900 leading-tight mb-4">
            Cazier Judiciar Online {city.name} — Rapid, Fără Drum la Ghișeu
          </h1>
          <p className="text-lg text-neutral-700 leading-relaxed mb-6 max-w-3xl">
            {city.localContext} Prin eGhișeul.ro obții cazierul judiciar din {city.name} fără să stai
            la coadă: depunem cererea la IPJ {city.judet} în numele tău și primești documentul prin
            curier sau pe email.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={ORDER_PATH}
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Comandă cazierul — de la {PRICE} RON <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href={HUB_PATH} className="text-primary-600 font-medium hover:underline">
              Vezi toate detaliile serviciului
            </Link>
          </div>
        </section>

        {/* Local IPJ office — the anti-thin anchor */}
        <section className="bg-neutral-50 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">
              Unde se eliberează cazierul judiciar în {city.name}
            </h2>
            <p className="text-neutral-600 mb-6 max-w-3xl">
              La ghișeu, cazierul se obține de la biroul de specialitate din cadrul IPJ {city.judet}.
              Mai jos găsești datele oficiale — sau eviți complet drumul comandând online.
            </p>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 grid md:grid-cols-2 gap-6">
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
                      <a href={`tel:${city.ipj.phone.replace(/\s/g, '')}`} className="hover:text-primary-600">
                        {city.ipj.phone}
                      </a>
                    </li>
                  )}
                  {city.ipj.website && (
                    <li className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <a href={city.ipj.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 break-all">
                        Pagina oficială IPJ {city.judet}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              {scheduleRows.length > 0 && (
                <div>
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
            <p className="text-sm text-neutral-500 mt-3">
              Date publice, preluate de pe pagina oficială a IPJ {city.judet}. Programul se poate
              modifica — verifică pe site-ul instituției înainte de deplasare. Cu eGhișeul.ro nu mai
              depinzi de program.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-6">
            Cum obții cazierul online în {city.name}
          </h2>
          <ol className="grid sm:grid-cols-2 gap-4">
            {STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white font-bold text-sm flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-neutral-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-neutral-700">
            {['Fără drum la IPJ', 'Fără cozi sau programare', 'Livrare 2-4 zile', 'Plată securizată cu cardul'].map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" /> {b}
              </span>
            ))}
          </div>
        </section>

        {/* Local FAQ */}
        <ServiceFAQ title={`Întrebări frecvente — cazier judiciar ${city.name}`} faqs={city.localFaq} />

        {/* Other cities */}
        {otherCities.length > 0 && (
          <section className="bg-neutral-50 py-12">
            <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-xl font-bold text-secondary-900 mb-4">Cazier judiciar și în alte orașe</h2>
              <div className="flex flex-wrap gap-3">
                {otherCities.map((c) => (
                  <Link
                    key={c.slug}
                    href={`${HUB_PATH}${c.slug}/`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-primary-300 hover:text-primary-600 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Cazier judiciar {c.name}
                  </Link>
                ))}
              </div>
              <p className="text-sm text-neutral-600 mt-5">
                Indiferent de localitate, comanzi online prin{' '}
                <Link href={HUB_PATH} className="text-primary-600 font-medium hover:underline">
                  serviciul de cazier judiciar
                </Link>{' '}
                — depunem cererea la IPJ-ul competent în numele tău.
              </p>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="max-w-5xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-secondary-900 mb-3">
            Comandă cazierul judiciar din {city.name} acum
          </h2>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            Fără drum la IPJ {city.judet}, fără cozi. Completezi în câteva minute și primești
            documentul prin curier sau pe email.
          </p>
          <Link
            href={ORDER_PATH}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors"
          >
            Comandă acum — de la {PRICE} RON <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
