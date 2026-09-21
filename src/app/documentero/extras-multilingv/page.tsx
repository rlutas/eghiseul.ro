import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { ReviewsDocumentero } from '@/components/documentero/reviews';
import { Card, Check, Eyebrow, FaqList, H2, InfoTable, Prose, QuickAnswer, RelatedServices, Section, SeoBlock } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { LEGAL_BASIS, PROCESSING_STATS } from '@/lib/documentero/content';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/extras-multilingv/';
const TITLE = 'Extras Multilingv Certificat de Naștere: Acceptat în UE, prin Avocat';
const DESCRIPTION =
  'Extrasul multilingv al actului de naștere (Regulamentul UE 2016/1191), obținut de un avocat de la starea civilă și livrat prin curier. Acceptat în toată Uniunea fără traducere și fără apostilă. Variantă și pentru căsătorie.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-21';

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
  { q: 'Cât durează?', a: `Legal, până la 30 de zile de la depunere. La comenzile noastre de extras de naștere din vara lui 2026, jumătate au ajuns la client în cel mult ${PROCESSING_STATS.byService['extras-multilingv-certificat-nastere'].medianDays} zile de la plată, cu curier cu tot. Dacă actul e deja scanat, primăria îl eliberează în câteva zile.` },
  { q: 'Are termen de valabilitate?', a: 'Extrasul nu expiră. Unele autorități cer însă un document mai nou de 3–6 luni; verifică cu instituția care ți-l cere.' },
  { q: 'Extrasul multilingv înlocuiește certificatul de naștere?', a: 'În fața instituțiilor din UE, da: are aceleași date, pe formularul standard european. În România ți se cere în continuare certificatul. De aceea mulți comandă amândouă, în aceeași depunere.' },
  { q: 'Pot cere extrasul pentru copilul meu?', a: 'Da, ca părinte. Pentru un alt adult, doar el semnează împuternicirea.' },
  { q: 'Ce diferență e față de „certificatul cu traducere pe verso”?', a: 'Formularul UE e recunoscut prin regulament, în toate statele; traducerea pe verso e o practică mai veche, acceptată neuniform.' },
  { q: 'E același lucru cu „certificatul de naștere internațional”?', a: 'Așa îi spun mulți. Există și extrasul multilingv după Convenția CIEC nr. 16 (Viena, 1976), acceptat în statele semnatare, inclusiv în afara UE (de exemplu Elveția, Turcia, Moldova). Pentru UE se folosește formularul din Regulamentul 2016/1191. Îți spunem care e potrivit pentru țara ta.' },
  { q: 'Trebuie să merg la notar pentru împuternicire?', a: `Nu. Împuternicirea avocațială se semnează electronic în formular și e recunoscută de starea civilă în temeiul ${LEGAL_BASIS.shortGen}.` },
];

export default async function ExtrasMultilingvPage() {
  const pN = await getServicePricing('extras-multilingv-certificat-nastere');
  const pC = await getServicePricing('extras-multilingv-certificat-casatorie');
  const pachet = optionPrice(pN, 'certificat_pachet', 498);
  const stats = PROCESSING_STATS.byService['extras-multilingv-certificat-nastere'];

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
    faq: FAQ,
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

        <QuickAnswer updated={DATE_MODIFIED}>
          Extrasul multilingv al actului de naștere este formularul standard multilingv din Regulamentul (UE) 2016/1191, emis de oficiul de stare civilă din România pe baza actului de naștere. Are datele certificatului cu rubricile în toate limbile oficiale ale Uniunii și este acceptat în orice stat membru fără traducere autorizată și fără apostilă. Îl poate cere titularul, părintele pentru minor sau un avocat cu împuternicire avocațială ({LEGAL_BASIS.short}). Nu expiră; termen legal de eliberare: cel mult 30 de zile.
        </QuickAnswer>

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
              <Prose paras={['Pentru rezidența partenerului, schimbarea numelui în actele străine sau pensia de urmaș, instituțiile din UE acceptă extrasul multilingv de căsătorie în locul certificatului tradus și apostilat. Îl cere oricare dintre soți; avocatul depune la primăria care păstrează actul de căsătorie. Dacă ai divorțat, mențiunea apare și pe extras, cu condiția să fie înscrisă pe actul de căsătorie din România.']} />
              <p className="m-0 text-[14px] text-d-muted">
                Ai nevoie și de certificatul de căsătorie pe hârtie? Vezi <Link href="/certificat-de-casatorie/" className="font-semibold text-d-ink underline underline-offset-2 hover:text-d-acc">duplicatul certificatului de căsătorie</Link>, cu extrasul ca opțiune în aceeași comandă.
              </p>
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
              ['În afara UE', 'Marea Britanie, SUA, Canada, Elveția, Norvegia: acolo ai nevoie de certificat + apostilă (Haga) + traducere. Vezi pagina certificatului de naștere.', '/certificat-de-nastere/'],
              ['Autoritatea cere expres certificatul', 'Unele consulate și instanțe cer certificatul cu apostilă chiar și în UE. Verificăm cu tine țara și scopul.', '/ghiduri/apostila-acte-stare-civila/'],
              ['Pentru celibat', 'Extrasul nu atestă starea civilă actuală. Pentru căsătorie ai nevoie de adeverința privind statutul civil, certificatul de celibat.', '/certificat-de-celibat/'],
            ].map(([t, d, h]) => (
              <Link key={t} href={h} className="flex flex-col gap-2 rounded-2xl border border-d-line bg-d-card p-6 hover:border-d-acc">
                <span className="text-[17px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
                <span className="text-[15px] font-bold text-d-acc">Vezi →</span>
              </Link>
            ))}
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-5 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Două formulare, două temeiuri</Eyebrow>
            <H2 className="sm:text-[36px]">Formularul UE sau extrasul CIEC? Depinde de țară.</H2>
            <p className="m-0 max-w-[760px] text-[15px] leading-[1.6] text-d-muted">România emite două tipuri de extras multilingv. Amândouă vin de la starea civilă și amândouă au rubricile traduse; diferă unde sunt recunoscute automat.</p>
          </div>
          <InfoTable
            head={['', 'Formular standard multilingv UE', 'Extras multilingv CIEC']}
            rows={[
              ['Temei', 'Regulamentul (UE) 2016/1191', 'Convenția CIEC nr. 16, Viena, 1976'],
              ['Unde e acceptat fără traducere', 'în toate cele 27 de state membre UE', 'în statele semnatare ale convenției: UE, Elveția, Turcia, Moldova, Muntenegru, Macedonia de Nord și altele'],
              ['Apostilă', 'nu, în UE', 'nu, în statele semnatare'],
              ['Ce este, tehnic', 'un formular anexat certificatului, care îl „traduce”', 'un extras de sine stătător după actul de naștere'],
              ['Când îl recomandăm', 'instituție dintr-un stat UE', 'stat semnatar din afara UE sau instituție care îl cere expres'],
            ]}
          />
          <p className="m-0 text-[14px] text-d-muted">Scrie țara și instituția în formular; alegem varianta potrivită și îți spunem dacă e nevoie și de certificatul propriu-zis.</p>
        </Section>

        <SeoBlock
          title="Extras multilingv de naștere online: ce este, cine îl acceptă, cât costă"
          intro={[
            'Extrasul multilingv al actului de naștere este formularul standard european introdus prin Regulamentul (UE) 2016/1191. Are exact datele din certificatul tău de naștere, dar tipărite pe formularul cu rubricile traduse în toate limbile oficiale ale Uniunii. De aceea o primărie din Italia, un „Bürgeramt” din Germania sau un „registro civil” din Spania îl acceptă ca atare: fără traducere autorizată, fără apostilă, fără legalizare. Mulți îl caută drept „certificat de naștere multilingv” sau „certificat de naștere internațional”; e același document.',
            `Îl eliberează oficiul de stare civilă care păstrează actul de naștere, la cerere, titularului sau unui avocat cu împuternicire (${LEGAL_BASIS.short}). Se cere de obicei împreună cu duplicatul certificatului, pentru că unele instituții străine vor amândouă. De aceea avem pachetul: extrasul și certificatul, dintr-o singură depunere, ${lei(pN.basePrice)} + ${lei(pachet)} lei.`,
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
            'Atenție la două lucruri. Extrasul nu spune nimic despre starea civilă actuală: pentru căsătorie ai nevoie și de certificatul de celibat. Și nu e recunoscut automat în afara Uniunii: pentru Regatul Unit, Elveția, Norvegia, SUA sau Canada rămâne varianta certificat plus apostilă plus traducere, sau extrasul CIEC acolo unde statul e semnatar.',
          ]}
          guides={[
            { title: 'Apostila pe acte de stare civilă: când e nevoie și când nu', desc: 'Depinde de țară. Tabelul pe scurt.', href: '/ghiduri/apostila-acte-stare-civila/' },
            { title: 'Certificat de naștere pierdut: ce faci în 2026', desc: 'Pașii, actele, termenul real.', href: '/ghiduri/certificat-de-nastere-pierdut/' },
            { title: 'Transcrierea certificatului de naștere emis în străinătate', desc: 'Copil născut în Italia sau Spania.' },
          ]}
        />

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <Eyebrow>Termenul real</Eyebrow>
            <H2 className="sm:text-[36px]">Cât durează, de fapt?</H2>
            <Prose
              paras={[
                `Din comenzile de extras multilingv de naștere plătite de la ${PROCESSING_STATS.since}, ${stats.done} au fost finalizate până la ${PROCESSING_STATS.asOf.split('-').reverse().join('.')}: jumătate au ajuns la client în cel mult ${stats.medianDays} zile de la plată, 8 din 10 în cel mult ${stats.p80Days} zile, cu curier internațional cu tot. Cele mai rapide au fost gata în 3 zile lucrătoare, la primării cu actul deja scanat.`,
                'Curierul contează aici mai mult decât la alte acte, fiindcă aproape toți clienții sunt în afara țării: 3–7 zile în UE cu curier expres. Îl alegi la ultimul pas, cu prețul afișat.',
              ]}
            />
          </div>
          <Card className="flex flex-col gap-4 self-start p-6 lg:col-span-4 lg:col-start-9">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Ce plătești, de fapt</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {[
                'Onorariul avocatului și împuternicirea avocațială, cu număr din registrul Baroului',
                'Depunerea cererii și ridicarea extrasului de la primărie',
                'Alegerea formularului potrivit pentru țara ta (UE sau CIEC)',
                'Scanul pe email în ziua ridicării, originalul prin curier, oriunde în UE',
                'Banii înapoi dacă primăria refuză și nu se poate rezolva',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <span className="text-[13px] text-d-muted">Extrasul în sine e gratuit la ghișeu. Noi vindem drumul și dosarul.</span>
          </Card>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre extrasul multilingv</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>

        <ReviewsDocumentero match={/multilingv/i} title="Ce spun clienții despre extrasele multilingve" />

        <RelatedServices
          items={[
            ['Certificat de naștere, duplicat', 'Pentru România sau pentru statele din afara UE, cu apostilă și traducere.', '/certificat-de-nastere/'],
            ['Certificat de celibat', 'Pentru căsătoria în străinătate: extrasul nu atestă starea civilă actuală.', '/certificat-de-celibat/'],
            ['Certificat de căsătorie, duplicat', 'Cu extrasul multilingv de căsătorie ca opțiune, în aceeași comandă.', '/certificat-de-casatorie/'],
          ]}
        />
      </main>
    </>
  );
}
