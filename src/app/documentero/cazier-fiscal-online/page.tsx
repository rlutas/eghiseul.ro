import Image from 'next/image';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { Card, Check, Eyebrow, FaqList, H2, QuickAnswer, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { LEGAL_BASIS } from '@/lib/documentero/content';

// Paid-search landing (05.10.2026). Always noindex and kept out of the
// documentero sitemap: organically, cazier fiscal belongs to eghiseul.ro and
// cazierjudiciaronline.com, and a third indexable copy would compete with them.

export const revalidate = 3600;

const PATH = '/cazier-fiscal-online/';
const TITLE = 'Cazier fiscal online, fără SPV și fără drum la ANAF';
const DESCRIPTION =
  'Cazier fiscal pentru persoane fizice, obținut de avocat, fără cont SPV și fără drum la ANAF. Scan pe email, originalul prin curier. Serviciu privat.';
const UPDATED = '2026-10-06';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/avocat-ghiseu-stare-civila.webp',
  noindex: true,
});

const CHOICES = [
  ['La ghișeul ANAF', 'Mergi la administrația financiară cu actul de identitate, în programul ghișeului. Gratuit.'],
  ['Singur, în SPV', 'Gratuit, dacă ai cont activ în Spațiul Privat Virtual al ANAF.'],
  ['Prin noi', 'Când nu ai SPV, nu ajungi la ghișeu sau ai nevoie de el repede pentru un dosar.'],
] as const;

const FAQ = [
  { q: 'Sunteți ANAF sau un site al statului?', a: 'Nu. Documentero este un serviciu privat. Cazierul fiscal îl eliberează ANAF; noi depunem cererea în numele tău, prin avocat, și ți-l trimitem.' },
  { q: 'Pot să-l obțin gratuit?', a: 'Da, la ghișeul ANAF sau din SPV, dacă ai cont activ. La noi plătești avocatul și procesarea, nu documentul.' },
  { q: 'Cazierul fiscal arată datoriile la stat?', a: 'Nu. Arată faptele fiscale sancționate înscrise pe numele tău sau al firmei. Datoriile apar în certificatul de atestare fiscală, care e alt document.' },
  { q: 'Cât e valabil?', a: '30 de zile de la emitere și doar pentru scopul pentru care a fost cerut. Pentru două dosare diferite îți trebuie două certificate.' },
  { q: 'Merge și pentru firmă?', a: 'Nu. Obținem cazierul fiscal doar pentru persoane fizice. Dacă îți trebuie pentru o firmă (de exemplu la înființare sau la o licitație), îl comanzi pe numele asociatului sau al administratorului, ca persoană fizică.' },
  { q: 'Ce trebuie să trimit?', a: 'Actul de identitate, scopul pentru care îl ceri și semnătura în formular. Durează câteva minute de pe telefon.' },
];

export default async function CazierFiscalAdsPage() {
  const p = await getServicePricing('cazier-fiscal');
  const urgenta = optionPrice(p, 'urgenta', 100);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const apostila = optionPrice(p, 'apostila_haga', 198);

  const graph = documenteroServiceGraph({
    path: PATH,
    name: 'Cazier fiscal, obținut prin avocat',
    description: DESCRIPTION,
    serviceType: 'Obținere cazier fiscal prin avocat',
    offers: [
      { name: 'Cazier fiscal', price: p.basePrice },
      { name: 'Cazier fiscal, procesare urgentă', price: p.basePrice + urgenta },
    ],
    datePublished: UPDATED,
    dateModified: UPDATED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Cazier fiscal', path: PATH }],
    faq: FAQ,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active={PATH} />
      <main id="main-content">
        <ServiceHero
          crumb="Cazier fiscal"
          eyebrow="Persoane fizice · serviciu privat, nu ANAF"
          title="Cazier fiscal fără SPV și fără drum la ANAF."
          intro="Semnezi împuternicirea pe telefon, avocatul depune cererea, iar ANAF eliberează cazierul fiscal. Îl primești scanat pe email, iar originalul prin curier, dacă îl alegi."
          orderSlug="cazier-fiscal"
          cta="Comandă cazierul fiscal"
          secondary={{ label: 'Variantele gratuite', href: '#variante' }}
          facts={[[`${p.estimatedDays ?? 3} zile`, 'lucrătoare, standard'], ['Fără SPV', 'nu-ți trebuie cont ANAF'], ['Scan + original', 'email și curier']]}
          media={<Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Avocata depune o cerere la ghișeu" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" />}
          priceLabel="Cazier fiscal"
          price={p.basePrice}
          optionsTitle="Opțional"
          options={[
            { name: 'Procesare urgentă', desc: 'prioritate la depunere', price: urgenta },
            { name: 'Traducere autorizată', desc: 'pentru străinătate', price: traducere },
            { name: 'Apostilă de la Haga', desc: 'pentru state din afara UE', price: apostila },
          ]}
          note="Prețul include onorariul avocatului și procesarea. Opțiunile se aleg în formular; totalul îl vezi înainte de plată."
        />

        <QuickAnswer updated={UPDATED}>
          Cazierul fiscal îl eliberează ANAF. Arată faptele fiscale sancționate, nu datoriile, și e valabil 30 de zile, doar pentru scopul cerut. Îl poți obține gratuit la ghișeul ANAF sau din SPV. Documentero este un serviciu privat: un avocat cu împuternicire ({LEGAL_BASIS.short}) depune cererea pentru tine, fără cont SPV și fără drum. Costă {lei(p.basePrice)} lei, cu urgență {lei(p.basePrice + urgenta)} lei.
        </QuickAnswer>

        <Section id="variante" className="mt-24 flex scroll-mt-24 flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Trei variante</Eyebrow>
            <H2 className="sm:text-[36px]">Două sunt gratuite. A treia te scutește de SPV și de drum.</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {CHOICES.map(([t, d], i) => (
              <Card key={t} className={`flex flex-col gap-2.5 rounded-2xl p-6 ${i === 2 ? 'border-[1.5px] border-d-acc bg-d-soft' : ''}`}>
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <H2 className="sm:text-[32px]">Cum îl obținem</H2>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ['Completezi formularul', 'Datele tale, actul de identitate și semnătura.'],
                ['Plătești online', 'Cu cardul, prin Stripe. Primești factură pe email.'],
                ['Avocatul depune cererea', 'Cu împuternicire avocațială, la ANAF.'],
                ['Primești cazierul fiscal', 'Scanat pe email; originalul prin curier, în țară sau în străinătate.'],
              ].map(([t, d], i) => (
                <Card key={t} className="flex flex-col gap-2.5 rounded-2xl p-6">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-d-ink font-bold text-d-bg">{i + 1}</span>
                  <span className="text-[16px] font-bold">{t}</span>
                  <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
                </Card>
              ))}
            </div>
          </div>
          <Card className="flex flex-col gap-4 self-start p-6 lg:col-span-4 lg:col-start-9">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Ce plătești, de fapt</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {[
                'Onorariul avocatului și împuternicirea',
                'Depunerea cererii la ANAF și urmărirea ei',
                'Cazierul fiscal scanat pe email, originalul prin curier',
                'Banii înapoi dacă cererea nu se poate rezolva',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <span className="text-[13px] text-d-muted">Cazierul fiscal în sine e gratuit. Noi vindem drumul și dosarul.</span>
          </Card>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre cazierul fiscal</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>
      </main>
    </>
  );
}
