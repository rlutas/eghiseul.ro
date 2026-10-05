import Image from 'next/image';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { Card, Check, Eyebrow, FaqList, H2, QuickAnswer, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { LEGAL_BASIS } from '@/lib/documentero/content';

// Paid-search landing (05.10.2026). Always noindex and kept out of the
// documentero sitemap: organically, cazier judiciar belongs to eghiseul.ro and
// cazierjudiciaronline.com, and a third indexable copy would compete with them.

export const revalidate = 3600;

const PATH = '/cazier-judiciar-online/';
const TITLE = 'Cazier judiciar online, obținut prin avocat';
const DESCRIPTION =
  'Cazier judiciar pentru persoane fizice, obținut de avocat cu împuternicire, fără drum la poliție. PDF pe email și original prin curier. Serviciu privat, nu Poliția.';
const UPDATED = '2026-10-05';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/avocat-ghiseu-stare-civila.webp',
  noindex: true,
});

const CHOICES = [
  ['La ghișeu', 'Mergi cu buletinul la poliția din județ, în programul ghișeului. Gratuit.'],
  ['Singur, pe hub.mai.gov.ro sau ghiseul.ro', 'Gratuit pentru cetățenii români, în format electronic. Îți faci cont și îți confirmi identitatea. Varianta tipărită a cazierului electronic nu are valoare.'],
  ['Prin noi', 'Când nu prinzi programul, ești plecat din țară, ai nevoie de cazier pe hârtie sau de traducere și apostilă pe el.'],
] as const;

const FAQ = [
  { q: 'Sunteți Poliția sau un site al statului?', a: 'Nu. Documentero este un serviciu privat. Cazierul îl eliberează Poliția Română; noi depunem cererea în numele tău, prin avocat, și ți-l trimitem.' },
  { q: 'Pot să-l obțin gratuit?', a: 'Da. La ghișeul poliției sau, în format electronic, pe hub.mai.gov.ro ori ghiseul.ro, dacă ești cetățean român și îți faci cont. La noi plătești avocatul, drumul și livrarea, nu documentul.' },
  { q: 'Cât e valabil cazierul judiciar?', a: '6 luni de la eliberare. Unele instituții sau state străine cer unul mai nou; verifică înainte să comanzi.' },
  { q: 'Ce trebuie să trimit?', a: 'Actul de identitate (poză față-verso), un selfie cu el și semnătura în formular. Durează câteva minute de pe telefon.' },
  { q: 'Sunt plecat din țară. Merge?', a: 'Da. Semnezi împuternicirea online, iar originalul ți-l trimitem prin curier internațional. Dacă documentul e pentru alt stat, poți adăuga traducere și apostilă.' },
  { q: 'Ce se întâmplă dacă cererea e respinsă?', a: 'Te sunăm și îți spunem de ce. Dacă nu se poate rezolva, îți dăm banii înapoi, conform politicii de anulare.' },
];

export default async function CazierJudiciarAdsPage() {
  const p = await getServicePricing('cazier-judiciar-persoana-fizica');
  const urgenta = optionPrice(p, 'urgenta', 80);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const integritate = optionPrice(p, 'addon_certificat_integritate', 100);

  const graph = documenteroServiceGraph({
    path: PATH,
    name: 'Cazier judiciar persoană fizică, obținut prin avocat',
    description: DESCRIPTION,
    serviceType: 'Obținere cazier judiciar prin avocat',
    offers: [
      { name: 'Cazier judiciar', price: p.basePrice },
      { name: 'Cazier judiciar, procesare urgentă', price: p.basePrice + urgenta },
    ],
    datePublished: UPDATED,
    dateModified: UPDATED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Cazier judiciar', path: PATH }],
    faq: FAQ,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active={PATH} />
      <main id="main-content">
        <ServiceHero
          crumb="Cazier judiciar"
          eyebrow="Persoane fizice · serviciu privat, nu Poliția"
          title="Cazier judiciar fără drum la poliție. Îl obține avocatul, tu îl primești."
          intro="Semnezi împuternicirea pe telefon, avocatul depune cererea, iar Poliția eliberează cazierul. Ți-l trimitem în PDF pe email și originalul prin curier, în țară sau în străinătate."
          orderSlug="cazier-judiciar-persoana-fizica"
          cta="Comandă cazierul"
          secondary={{ label: 'Variantele gratuite', href: '#variante' }}
          facts={[[`${p.estimatedDays ?? 5} zile`, 'lucrătoare, standard'], ['6 luni', 'valabilitate'], ['PDF + original', 'email și curier']]}
          media={<Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Avocata depune o cerere la ghișeu" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" />}
          priceLabel="Cazier judiciar, persoană fizică"
          price={p.basePrice}
          optionsTitle="Opțional"
          options={[
            { name: 'Procesare urgentă', desc: 'prioritate la depunere', price: urgenta },
            { name: 'Certificat de integritate', desc: 'în aceeași comandă', price: integritate },
            { name: 'Traducere autorizată', desc: 'pentru străinătate', price: traducere },
            { name: 'Apostilă de la Haga', desc: 'pentru state din afara UE', price: apostila },
          ]}
          note="Prețul include onorariul avocatului și procesarea. Opțiunile și curierul se aleg în formular; totalul îl vezi înainte de plată."
        />

        <QuickAnswer updated={UPDATED}>
          Cazierul judiciar îl eliberează Poliția Română și e valabil 6 luni. Îl poți cere gratuit la ghișeu sau, în format electronic, pe hub.mai.gov.ro și ghiseul.ro. Documentero este un serviciu privat: un avocat cu împuternicire ({LEGAL_BASIS.short}) depune cererea pentru tine, iar tu primești cazierul pe hârtie și în PDF, fără să mergi nicăieri. Costă {lei(p.basePrice)} lei, cu urgență {lei(p.basePrice + urgenta)} lei.
        </QuickAnswer>

        <Section id="variante" className="mt-24 flex scroll-mt-24 flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Trei variante</Eyebrow>
            <H2 className="sm:text-[36px]">Două sunt gratuite. A treia te scutește de drum.</H2>
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
                ['Completezi formularul', 'Datele tale, poza actului de identitate, un selfie și semnătura.'],
                ['Plătești online', 'Cu cardul, prin Stripe. Primești factură pe email.'],
                ['Avocatul depune cererea', 'Cu împuternicire avocațială, la poliție.'],
                ['Primești cazierul', 'PDF pe email, originalul prin curier.'],
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
                'Onorariul avocatului și împuternicirea, cu număr din registrul Baroului',
                'Depunerea cererii și ridicarea cazierului',
                'PDF pe email și originalul prin curier',
                'Banii înapoi dacă cererea nu se poate rezolva',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <span className="text-[13px] text-d-muted">Cazierul în sine e gratuit. Noi vindem drumul și dosarul.</span>
          </Card>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre cazierul judiciar</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>
      </main>
    </>
  );
}
