import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { Card, Check, Eyebrow, FaqList, H2, Prose, Section, SeoBlock } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/extras-multilingv/';
const TITLE = 'Extras Multilingv Certificat de Naștere: Acceptat în UE, prin Avocat';
const DESCRIPTION =
  'Extrasul multilingv al actului de naștere (Regulamentul UE 2016/1191), obținut de un avocat de la starea civilă și livrat prin curier. Acceptat în toată Uniunea fără traducere și fără apostilă. Variantă și pentru căsătorie.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-19';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/curier-livrare-plic.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const COUNTRIES = ['Italia', 'Spania', 'Germania', 'Franța', 'Austria', 'Belgia', 'Olanda', 'Portugalia', 'Grecia', 'Irlanda', 'Suedia', 'Danemarca', 'Polonia', 'Ungaria', 'Cehia', '+ restul UE'];

const FAQ = [
  { q: 'Cât durează?', a: 'Legal, până la 30 de zile de la depunere. Multe primării îl eliberează în câteva zile, pe loc dacă actul e deja digitalizat. Adaugă curierul.' },
  { q: 'Are termen de valabilitate?', a: 'Extrasul nu expiră. Unele autorități cer însă un document mai nou de 3–6 luni; verifică cu instituția care ți-l cere.' },
  { q: 'Pot cere extrasul pentru copilul meu?', a: 'Da, ca părinte. Pentru un alt adult, doar el semnează împuternicirea.' },
  { q: 'Ce diferență e față de „certificatul cu traducere pe verso”?', a: 'Formularul UE e recunoscut prin regulament, în toate statele; traducerea pe verso e o practică mai veche, acceptată neuniform.' },
];

export default async function ExtrasMultilingvPage() {
  const pN = await getServicePricing('extras-multilingv-certificat-nastere');
  const pC = await getServicePricing('extras-multilingv-certificat-casatorie');
  const pachet = optionPrice(pN, 'certificat_pachet', 498);

  const graph = documenteroServiceGraph({
    path: PATH,
    name: 'Extras multilingv de naștere',
    description: DESCRIPTION,
    serviceType: 'Obținere acte de stare civilă prin avocat',
    offers: [
      { name: 'Extras multilingv de naștere', price: pN.basePrice },
      { name: 'Extras multilingv de căsătorie', price: pC.basePrice },
      { name: 'Pachet: extras + certificat de naștere', price: pN.basePrice + pachet },
    ],
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Extras multilingv', path: PATH }],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="/extras-multilingv/" />
      <main id="main-content">
        <ServiceHero
          crumb="Extras multilingv de naștere"
          eyebrow="Regulamentul UE 2016/1191 · formular standard multilingv"
          title="Extrasul multilingv de naștere: acceptat în UE fără traducere și fără apostilă."
          intro="Un formular oficial, emis de starea civilă din România, cu datele tale de naștere în toate limbile Uniunii. Îl depui direct la primăria, notarul sau autoritatea din statul UE unde locuiești. Avocatul nostru îl obține și ți-l trimite prin curier."
          orderSlug="extras-multilingv-certificat-nastere"
          cta="Comandă extrasul"
          secondary={{ label: 'Când nu e suficient', href: '#limite' }}
          facts={[['24 de limbi', 'rubricile formularului UE'], ['0 traduceri', 'și 0 apostile, în UE'], ['≤ 30 de zile', 'termen legal de eliberare']]}
          priceLabel="Extras multilingv de naștere"
          price={pN.basePrice}
          optionsTitle="Pachet"
          options={[{ name: 'Adaugă și certificatul de naștere', desc: 'duplicatul și extrasul, dintr-o singură depunere', price: pachet, featured: true }]}
          note={`Există și extrasul multilingv de căsătorie, ${lei(pC.basePrice)} lei, cu aceeași procedură (mai jos).`}
        />

        <Section className="mt-10">
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <span key={c} className="rounded-full border border-d-line bg-d-card px-3 py-2 text-[13px] font-semibold">{c}</span>
            ))}
          </div>
        </Section>

        <Section className="mt-24 grid items-center gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="h-[300px] overflow-hidden rounded-3xl sm:h-[420px] lg:col-span-6">
            <Image src="/images/documentero/curier-livrare-plic.webp" alt="Curierul predă plicul cu extrasul" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 640px, 100vw" />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
            <Eyebrow>Extras sau certificat?</Eyebrow>
            <H2 className="sm:text-[36px]">Extrasul e certificatul, tradus oficial în 24 de limbi.</H2>
            <p className="m-0 text-[16px] leading-[1.6] text-d-muted">Are aceleași date ca certificatul de naștere (nume, dată, loc, părinți), dar pe formularul standard european din Regulamentul 2016/1191. Autoritatea străină nu mai poate cere traducere autorizată sau apostilă pentru el.</p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {['Emis de starea civilă din România, cu ștampilă', 'Valabil în toate statele membre UE', 'Fără traducere, fără apostilă, fără notar', 'Se cere de obicei împreună cu certificatul'].map((t) => (
                <li key={t} className="flex items-center gap-2.5"><Check className="shrink-0 text-d-acc" /> {t}</li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="casatorie" className="mt-24 lg:mt-32">
          <Card className="grid items-center gap-6 p-7 lg:grid-cols-12 lg:p-10">
            <div className="flex flex-col gap-3 lg:col-span-8">
              <Eyebrow>Extras multilingv de căsătorie</Eyebrow>
              <H2 className="sm:text-[32px]">Aceeași procedură, pentru actul de căsătorie.</H2>
              <Prose paras={['Pentru rezidența partenerului, schimbarea numelui în actele străine sau pensia de urmaș, instituțiile din UE acceptă extrasul multilingv de căsătorie în locul certificatului tradus și apostilat. Îl cere oricare dintre soți; avocatul depune la primăria care păstrează actul de căsătorie.']} />
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4">
              <div className="flex items-baseline gap-2"><span className="text-[48px] font-extrabold leading-none tracking-[-0.05em]">{lei(pC.basePrice)}</span><span className="text-[18px] font-bold">lei</span></div>
              <Link href="/comanda/extras-multilingv-certificat-casatorie/" className="inline-flex h-[52px] items-center justify-center rounded-xl bg-d-acc text-[16px] font-bold text-d-ink hover:opacity-90">Comandă extrasul de căsătorie</Link>
            </div>
          </Card>
        </Section>

        <Section id="limite" className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Când NU e suficient</Eyebrow>
            <H2 className="sm:text-[36px]">Trei cazuri în care ai nevoie de altceva</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-3 lg:col-span-8">
            {[
              ['În afara UE', 'Marea Britanie, SUA, Canada, Elveția, Norvegia: acolo ai nevoie de certificat + apostilă (Haga) + traducere.'],
              ['Autoritatea cere expres certificatul', 'Unele consulate și instanțe cer certificatul cu apostilă chiar și în UE. Verificăm cu tine țara și scopul.'],
              ['Pentru celibat', 'Extrasul nu atestă starea civilă actuală. Pentru căsătorie ai nevoie de dovada de celibat (Anexa 9).'],
            ].map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 rounded-2xl p-6">
                <span className="text-[17px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <SeoBlock
          title="Extras multilingv de naștere online: ce este, cine îl acceptă, cât costă"
          intro={[
            'Extrasul multilingv al actului de naștere este formularul standard european introdus prin Regulamentul (UE) 2016/1191. Are exact datele din certificatul tău de naștere, dar tipărite pe formularul cu rubricile traduse în toate limbile oficiale ale Uniunii. De aceea o primărie din Italia, un „Bürgeramt” din Germania sau un „registro civil” din Spania îl acceptă ca atare: fără traducere autorizată, fără apostilă, fără legalizare. Mulți îl caută drept „certificat de naștere multilingv” sau „certificat de naștere internațional”; e același document.',
            `Îl eliberează oficiul de stare civilă care păstrează actul de naștere, la cerere, titularului sau unui avocat cu împuternicire. Se cere de obicei împreună cu duplicatul certificatului, pentru că unele instituții străine vor amândouă. De aceea avem pachetul: extrasul și certificatul, dintr-o singură depunere, ${lei(pN.basePrice)} + ${lei(pachet)} lei.`,
          ]}
          acte={['Act de identitate valabil (buletin sau pașaport), poză față-verso', 'Datele nașterii: data, localitatea, numele părinților', 'Țara în care folosești extrasul', 'Semnătura ta, în formular']}
          rows={[
            ['Unde depui', 'la primăria care are actul, cu programare', 'nicăieri; depune avocatul'],
            ['Traducere', 'nu e nevoie (formular UE)', 'nu e nevoie'],
            ['Apostilă', 'nu e nevoie în UE', 'nu e nevoie în UE; în afara UE îți spunem ce trebuie'],
            ['Taxă', '0 lei sau taxă locală', `${lei(pN.basePrice)} lei, tot inclus`],
            ['Termen', 'legal, până la 30 de zile', 'același termen; status la fiecare pas'],
            ['Din străinătate', 'consulat: 30–60 de zile', 'direct la primărie, curier internațional'],
          ]}
          diasporaTitle="Pentru cine e gândit extrasul: cei care locuiesc în UE"
          diaspora={[
            'Cel mai des îl cer românii stabiliți în Italia, Spania, Germania și Franța, pentru înscrierea copilului la școală, pentru căsătorie, pentru dosarul de rezidență sau pentru pensie. Până în 2019 aceleași instituții cereau certificatul cu traducere legalizată și apostilă, două drumuri în plus și 300–400 de lei. Regulamentul 2016/1191 a scos exact aceste două cerințe pentru actele de stare civilă între statele membre.',
            'Atenție la două lucruri. Extrasul nu spune nimic despre starea civilă actuală: pentru căsătorie ai nevoie și de dovada de celibat. Și nu e recunoscut automat în afara Uniunii: pentru Regatul Unit, Elveția, Norvegia, SUA sau Canada rămâne varianta certificat plus apostilă plus traducere.',
          ]}
          guides={[
            { title: 'Extras multilingv sau certificat cu apostilă?', desc: 'Depinde de țară. Tabelul pe scurt.', href: '/ghiduri/apostila-acte-stare-civila/' },
            { title: 'Transcrierea certificatului de naștere emis în străinătate', desc: 'Copil născut în Italia sau Spania.', href: '/ghiduri/' },
            { title: 'Certificat de naștere pierdut: ce faci în 2026', desc: 'Pașii, actele, termenul real.', href: '/ghiduri/certificat-de-nastere-pierdut/' },
          ]}
        />

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre extrasul multilingv</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>
      </main>
    </>
  );
}
