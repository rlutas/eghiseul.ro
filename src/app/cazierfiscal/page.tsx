import Link from 'next/link';
import { HeaderCazierFiscal } from '@/components/cazierfiscal/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { Card, Check, Eyebrow, FaqList, H2, QuickAnswer, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalServiceGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/';
const PUBLISHED = '2026-11-10';
const UPDATED = '2026-11-10';
const TITLE = 'Cazier fiscal online prin avocat, fără SPV și fără drum la ANAF';
const DESCRIPTION =
  'Cazier fiscal pentru persoane fizice: semnezi împuternicirea pe telefon, avocatul depune cererea, ANAF eliberează certificatul. Scanat pe email, originalul prin curier. Serviciu privat.';

export const metadata = buildPageMetadata({
  brand: 'cazierfiscal',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  noindex: !CAZIERFISCAL_INDEXABLE,
});

/** Read and checked on 10.11.2026. */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['OPANAF nr. 2594/2015: procedura și formularul de cerere (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/171984'],
  ['ANAF: înregistrarea în Spațiul Privat Virtual', 'https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori'],
] as const;

const ANAF_SPV = 'https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori';

/** Visible on the page. No FAQPage schema: Google retired FAQ rich results on 07.05.2026. */
const FAQ = [
  {
    q: 'Sunteți ANAF?',
    a: 'Nu. cazier-fiscal.ro este un serviciu privat al eDigitalizare SRL. Certificatul de cazier fiscal îl eliberează numai ANAF; noi depunem cererea în numele tău, prin avocat, și ți-l trimitem.',
  },
  {
    q: 'Pot să-l iau gratuit?',
    a: 'Da. La ghișeul ANAF sau din Spațiul Privat Virtual (SPV), dacă ai cont, certificatul nu costă nimic. La noi plătești avocatul, depunerea și livrarea, nu documentul.',
  },
  {
    q: 'Apar datoriile mele în cazierul fiscal?',
    a: 'Nu. Certificatul spune doar dacă ai sau nu fapte înscrise în cazierul fiscal. Datoriile la buget apar în certificatul de atestare fiscală, care este alt document.',
  },
  {
    q: 'Cât timp e valabil?',
    a: '30 de zile de la emitere și doar pentru scopul trecut în cerere (OG 39/2015, art. 9 alin. 7). Dacă îți trebuie pentru două dosare diferite, ceri două certificate.',
  },
  {
    q: 'Sunt cetățean străin. Am nevoie de el?',
    a: 'Dacă nu ești înregistrat fiscal în România, legea nu îți cere certificatul: ajunge o declarație autentică pe propria răspundere (OG 39/2015, art. 8 alin. 4). Întreabă instituția care ți-l cere înainte să comanzi.',
  },
  {
    q: 'Merge și pentru o firmă?',
    a: 'Nu. Obținem cazierul fiscal doar pentru persoane fizice. Dacă dosarul firmei cere cazierul asociatului sau al administratorului, îl comanzi pe numele lui, ca persoană fizică.',
  },
  {
    q: 'Sunt în străinătate. Se poate?',
    a: 'Da. Semnezi împuternicirea pe telefon, de oriunde, și primești certificatul scanat pe email. Originalul îl trimitem prin curier și în străinătate, cu tariful afișat înainte de plată.',
  },
  {
    q: 'Ce trimit?',
    a: 'Actul de identitate, scopul pentru care îți trebuie certificatul și semnătura în formular. Durează câteva minute de pe telefon.',
  },
];

export default async function CazierFiscalHome() {
  const p = await getServicePricing('cazier-fiscal');
  const urgenta = optionPrice(p, 'urgenta', 100);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const days = p.estimatedDays ?? 3;

  const graph = cazierFiscalServiceGraph({
    path: PATH,
    name: 'Cazier fiscal pentru persoane fizice, obținut prin avocat',
    description: DESCRIPTION,
    serviceType: 'Obținere certificat de cazier fiscal prin avocat',
    offers: [
      { name: 'Cazier fiscal', price: p.basePrice },
      { name: 'Cazier fiscal, procesare urgentă', price: p.basePrice + urgenta },
    ],
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    breadcrumb: [{ name: 'Acasă', path: '/' }],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderCazierFiscal active={PATH} />
      <main id="main-content">
        <ServiceHero
          crumb="Cazier fiscal"
          eyebrow="Persoane fizice · serviciu privat, nu ANAF"
          title="Cazier fiscal fără SPV și fără drum la ANAF."
          intro="Semnezi împuternicirea avocațială pe telefon. Avocatul depune cererea, ANAF eliberează certificatul, iar tu îl primești scanat pe email. Originalul vine prin curier, dacă îl vrei."
          orderSlug="cazier-fiscal"
          cta="Comandă"
          secondary={{ label: 'Variantele gratuite', href: '#variante' }}
          facts={[[`${days} zile`, 'lucrătoare, standard'], ['Fără SPV', 'nu-ți trebuie cont ANAF'], ['Pe email', 'scanat; originalul, la cerere']]}
          priceLabel="Cazier fiscal, persoană fizică"
          price={p.basePrice}
          options={[
            { name: 'Procesare urgentă', desc: 'prioritate la depunere', price: urgenta },
            { name: 'Traducere autorizată', desc: 'pentru un dosar în străinătate', price: traducere },
            { name: 'Apostila de la Haga', desc: 'pentru state din afara UE', price: apostila },
          ]}
          note="Prețul include onorariul avocatului și depunerea. Opțiunile le alegi în formular și vezi totalul înainte de plată."
        />

        <QuickAnswer updated={UPDATED}>
          Cazierul fiscal îl eliberează ANAF, gratuit, la ghișeu sau din SPV. Arată faptele fiscale sancționate, nu
          datoriile, și e valabil 30 de zile, doar pentru scopul din cerere. Dacă nu ai cont SPV și nu ajungi la ghișeu,
          îl obținem noi: un avocat cu împuternicire depune cererea pentru tine. Costă {lei(p.basePrice)} lei, iar cu
          procesare urgentă {lei(p.basePrice + urgenta)} lei.
        </QuickAnswer>

        <Section id="variante" className="mt-24 flex scroll-mt-24 flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Ai trei variante</Eyebrow>
            <H2 className="sm:text-[36px]">Două sunt gratuite. Ți le spunem pe toate.</H2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="flex flex-col gap-2.5 rounded-2xl p-6">
              <span className="text-[18px] font-bold">Din SPV, singur</span>
              <span className="text-[14px] leading-[1.55] text-d-muted">
                Gratuit, dacă ai cont în{' '}
                <a href={ANAF_SPV} target="_blank" rel="nofollow noopener" className="underline underline-offset-2">Spațiul Privat Virtual</a>.
                Ceri din Solicitări → Eliberare documente și primești certificatul în SPV, ca PDF cu semnătura electronică a Ministerului Finanțelor.
              </span>
            </Card>
            <Card className="flex flex-col gap-2.5 rounded-2xl p-6">
              <span className="text-[18px] font-bold">La ghișeul ANAF</span>
              <span className="text-[14px] leading-[1.55] text-d-muted">
                Gratuit, la orice unitate ANAF, indiferent de domiciliu. Mergi cu actul de identitate în programul ghișeului, iar certificatul se eliberează pe loc.
              </span>
            </Card>
            <Card className="flex flex-col gap-2.5 rounded-2xl border-[1.5px] border-d-acc bg-d-soft p-6">
              <span className="text-[18px] font-bold">Prin noi, {lei(p.basePrice)} lei</span>
              <span className="text-[14px] leading-[1.55] text-d-muted">
                Când nu ai SPV, nu ai timp de ghișeu, ești în altă țară sau ți-l cere cineva până mâine.
              </span>
            </Card>
          </div>
        </Section>

        <Section id="cum-functioneaza" className="mt-24 grid scroll-mt-24 gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <H2 className="sm:text-[32px]">Cum îl obținem</H2>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ['Completezi formularul', 'Datele tale, actul de identitate, scopul și semnătura. Câteva minute, de pe telefon.'],
                ['Plătești online', 'Cu cardul, prin Stripe, sau prin transfer bancar. Factura vine pe email.'],
                ['Avocatul depune cererea', 'La ANAF, cu împuternicirea avocațială pe care ai semnat-o în formular.'],
                ['Primești certificatul', 'Scanat pe email, în ziua în care îl ridicăm. Originalul prin curier, dacă l-ai ales.'],
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
            <span id="pret" className="scroll-mt-24 text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Ce plătești, de fapt</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {[
                'Onorariul avocatului și împuternicirea',
                'Depunerea cererii la ANAF și ridicarea certificatului',
                'Certificatul scanat pe email; originalul prin curier, la cerere',
                'Banii înapoi dacă cererea nu se poate rezolva din vina noastră',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <span className="text-[13px] text-d-muted">Certificatul în sine e gratuit. Plătești drumul și dosarul.</span>
            <Link href="/comanda/cazier-fiscal/" className="inline-flex h-12 items-center justify-center rounded-xl bg-d-acc text-[15px] font-bold text-d-ink hover:opacity-90">
              Comandă · {lei(p.basePrice)} lei
            </Link>
          </Card>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-6">
            <Eyebrow>Ce arată</Eyebrow>
            <H2 className="sm:text-[32px]">Cazierul fiscal nu e lista datoriilor tale.</H2>
            <p className="m-0 text-[16px] leading-[1.65] text-d-body">
              Mulți îl confundă cu certificatul de atestare fiscală. În cazierul fiscal se înscriu faptele sancționate
              contravențional sau penal prevăzute de lege, plus situații precum inactivitatea fiscală. Faptele sancționate
              doar cu avertisment nu se înscriu. Certificatul spune scurt dacă ai sau nu fapte înscrise.
            </p>
            <p className="m-0 text-[16px] leading-[1.65] text-d-body">
              Datoriile la buget apar în certificatul de atestare fiscală, iar pe acela nu îl obținem noi.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
            <Eyebrow>Valabilitate</Eyebrow>
            <H2 className="sm:text-[32px]">30 de zile, pentru un singur scop.</H2>
            <p className="m-0 text-[16px] leading-[1.65] text-d-body">
              Certificatul e valabil 30 de zile de la emitere și doar pentru scopul pe care îl treci în cerere: angajare,
              licitație, credit sau alt dosar. Dacă îl ceri prea devreme, poate expira înainte de depunere, așa că
              comandă-l când știi data.
            </p>
          </div>
        </Section>

        <Section id="intrebari" className="mt-24 grid scroll-mt-24 gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Înainte să comanzi</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>

        <Section className="mt-20">
          <Card className="flex flex-col gap-3 p-6">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Surse oficiale</span>
            <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px] text-d-body">
              {SOURCES.map(([label, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="nofollow noopener" className="underline decoration-d-acc underline-offset-2">{label}</a>
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      </main>
    </>
  );
}
