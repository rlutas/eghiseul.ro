import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { ServiceHero } from '@/components/documentero/service-hero';
import { Card, CertificateMock, Eyebrow, FaqList, H2, Prose, Section, SeoBlock } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroServiceGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/certificat-de-nastere/';
const TITLE = 'Certificat de Naștere Online: Duplicat prin Avocat, Livrat Acasă';
const DESCRIPTION =
  'Duplicat certificat de naștere obținut de un avocat de la starea civilă: pierdut, deteriorat, model vechi sau pentru străinătate. Semnezi pe telefon, fără programare, fără notar. Originalul vine prin curier.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-19';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/client-acasa-certificat.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const SITUATIONS = [
  ['L-am pierdut sau mi-a fost furat', 'Fără declarație la poliție. Se cere direct duplicatul.', '/ghiduri/certificat-de-nastere-pierdut/'],
  ['E deteriorat sau plastifiat', 'Plastifierea îl face nevalabil. Vechiul se predă la eliberare.', '/ghiduri/'],
  ['Am modelul vechi, tipizat', 'Rămâne valabil, dar pentru pașaport sau străinătate vrei modelul nou, cu CNP.', '/ghiduri/'],
  ['Locuiesc în străinătate', 'Semnezi de acolo. Livrăm oriunde, opțional cu apostilă sau extras multilingv.', '/extras-multilingv/'],
  ['Pentru copilul meu', 'Părintele cere duplicatul minorului. Peste 14 ani, copilul semnează și el.', '/ghiduri/'],
  ['Pentru un părinte decedat', 'Pentru succesiune se poate cere un extras. Îți spunem ce document ai nevoie.', '/contact/'],
] as const;

const FAQ = [
  { q: 'Cât durează?', a: 'Legal, până la 30 de zile de la depunere. În practică, multe primării eliberează în câteva zile. Adaugă curierul: 1–2 zile în România, 3–7 în străinătate.' },
  { q: 'Trebuie să merg la notar pentru împuternicire?', a: 'Nu. Împuternicirea avocațială se semnează electronic în formular și e recunoscută de starea civilă în temeiul Legii 119/1996.' },
  { q: 'Pot cere duplicatul pentru altcineva?', a: 'Pentru copilul tău minor, da. Pentru un adult, doar el poate semna împuternicirea, chiar dacă plătești tu.' },
  { q: 'Trebuie să știu exact primăria unde am fost înregistrat?', a: 'Ajută, dar nu e obligatoriu. Din 2023 cererea se depune la orice primărie și e trimisă electronic la cea care păstrează actul. Scrii localitatea nașterii și ne ocupăm noi.' },
  { q: 'Ce se întâmplă cu certificatul vechi, dacă îl găsesc?', a: 'La eliberarea duplicatului, cel vechi își pierde valabilitatea. Dacă îl mai ai, se predă primăriei.' },
  { q: 'Ce se întâmplă dacă primăria refuză?', a: 'Te sunăm, îți explicăm motivul și, dacă nu se poate rezolva, returnăm banii conform politicii de anulare.' },
];

export default async function NasterePage() {
  const p = await getServicePricing('certificat-nastere');
  const extras = optionPrice(p, 'extras_multilingv', 398);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const legalizare = optionPrice(p, 'legalizare', 99);

  const graph = documenteroServiceGraph({
    path: PATH,
    name: 'Duplicat certificat de naștere',
    description: DESCRIPTION,
    serviceType: 'Obținere acte de stare civilă prin avocat',
    offers: [
      { name: 'Duplicat certificat de naștere', price: p.basePrice },
      { name: 'Cu extras multilingv', price: p.basePrice + extras },
      { name: 'Cu apostilă și traducere', price: p.basePrice + apostila + traducere },
    ],
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Certificat de naștere', path: PATH }],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="/certificat-de-nastere/" />
      <main id="main-content">
        <ServiceHero
          crumb="Certificat de naștere"
          eyebrow="Duplicat certificat de naștere · depus de avocat"
          title="Certificatul de naștere, duplicat, fără drum la starea civilă."
          intro="Completezi în 5 minute și semnezi pe telefon. Avocatul nostru depune cererea la primăria care păstrează actul de naștere, iar originalul ajunge la tine prin curier, oriunde în România sau în lume. Fără programare, fără notar."
          orderSlug="certificat-nastere"
          cta="Comandă duplicatul"
          secondary={{ label: 'În ce situații', href: '#situatii' }}
          facts={[['≤ 30 de zile', 'termen legal de eliberare'], ['Orice primărie', 'din 2023, indiferent unde te-ai născut'], ['0 lei taxă de stat', 'plătești doar serviciul']]}
          media={<Image src="/images/documentero/client-acasa-certificat.webp" alt="Clientă acasă, cu certificatul de naștere primit prin curier" width={1152} height={928} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" priority />}
          priceLabel="Duplicat certificat de naștere"
          price={p.basePrice}
          optionsTitle="Opțional, pentru străinătate"
          options={[
            { name: 'Extras multilingv de naștere', desc: 'formularul UE, în același plic; fără traducere în UE', price: extras, featured: true },
            { name: 'Apostilă de la Haga', desc: 'Instituția Prefectului, pe original', price: apostila },
            { name: 'Traducere autorizată', desc: 'după apostilare', price: traducere },
            { name: 'Legalizare notarială', desc: 'copie legalizată, la cerere', price: legalizare },
          ]}
          note="Opțiunile se aleg în formular; prețul final se vede înainte de plată. Curierul se adaugă la final."
        />

        <Section id="situatii" className="mt-20 grid gap-8 lg:mt-[88px] lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Eyebrow>Situații frecvente</Eyebrow>
            <H2>Oricare ar fi motivul, procedura e aceeași: un duplicat nou.</H2>
            <p className="m-0 text-[16px] leading-[1.55] text-d-muted">Din 2023, duplicatul se poate cere de la orice primărie. Noi mergem oricum acolo unde e actul.</p>
            <CertificateMock />
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-7">
            {SITUATIONS.map(([t, d, h]) => (
              <Link key={t} href={h} className="flex flex-col gap-1.5 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
                <span className="text-[17px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
              </Link>
            ))}
          </div>
        </Section>

        <SeoBlock
          title="Duplicat certificat de naștere online: cum funcționează prin avocat"
          intro={[
            'Duplicatul certificatului de naștere se eliberează pe baza actului de naștere aflat în registrul de stare civilă al primăriei unde a fost înregistrată nașterea. Cererea o poate depune titularul, un părinte pentru minor sau un avocat cu împuternicire avocațială, în temeiul articolului 10 din Legea 119/1996. Din 2023 cererea se depune la orice primărie din țară, iar sistemul informatic de stare civilă o trimite la cea care păstrează actul. Duplicatul iese pe formularul actual, cu CNP, indiferent de anul nașterii.',
            'La noi merge așa: completezi datele nașterii (data, localitatea, numele părinților), încarci o poză a actului de identitate și semnezi împuternicirea pe telefon. Avocatul depune cererea, ridică duplicatul și îl trimitem prin curier, cu scanul pe email în ziua ridicării. Nu există taxă de stat pentru eliberare; ce plătești este onorariul avocatului, împuternicirea, depunerea, urmărirea și livrarea.',
          ]}
          acte={['Act de identitate valabil (buletin sau pașaport), poză față-verso', 'Datele nașterii: data, localitatea, numele părinților', 'Pentru minor: actul de identitate al părintelui care semnează', 'Semnătura ta, în formular']}
          rows={[
            ['Unde depui', 'la orice primărie, cu programare', 'nicăieri; depune avocatul'],
            ['Cine merge', 'tu, personal, sau părintele pentru minor', 'avocatul, cu împuternicire semnată pe telefon'],
            ['Taxă', '0 lei sau taxă locală', `${lei(p.basePrice)} lei, tot inclus`],
            ['Termen', 'legal, până la 30 de zile', 'același termen legal; te anunțăm la fiecare pas'],
            ['Din străinătate', 'consulat: 30–60 de zile', 'direct la primărie, curier internațional'],
            ['Pentru UE', 'extras multilingv, drum separat', 'îl adaugi în aceeași comandă'],
          ]}
          diasporaTitle="Duplicatul certificatului de naștere din străinătate"
          diaspora={[
            'Cei mai mulți clienți ai noștri pentru naștere locuiesc în Italia, Spania, Germania sau Regatul Unit și au nevoie de certificat pentru rezidență, cetățenie, căsătorie sau pentru pașaportul copilului. Consulatul poate prelua cererea, dar o trimite tot la primăria din România, cu termene de 30–60 de zile. Prin avocat, cererea intră direct la primărie.',
            `Pentru instituțiile din UE, extrasul multilingv de naștere înlocuiește traducerea și apostila; îl adaugi în aceeași comandă, ${lei(extras)} lei, și pleacă în același plic. Pentru Regatul Unit, Elveția, SUA sau Canada rămâne duplicatul cu apostilă și traducere, pe care le facem noi, în ordinea corectă.`,
          ]}
          guides={[
            { title: 'Certificat de naștere pierdut: ce faci în 2026', desc: 'Pașii, actele, termenul real.', href: '/ghiduri/certificat-de-nastere-pierdut/' },
            { title: 'Certificatul vechi, tipizat, mai e valabil?', desc: 'Da în țară, cu limite la pașaport și în străinătate.', href: '/ghiduri/' },
            { title: 'Extras multilingv sau certificat cu apostilă?', desc: 'Depinde de țară.', href: '/extras-multilingv/' },
          ]}
        />

        <Section className="mt-20 lg:mt-[88px]">
          <Card className="grid items-center gap-6 p-7 lg:grid-cols-12 lg:p-10">
            <div className="flex flex-col gap-3 lg:col-span-8">
              <Eyebrow>Pentru Uniunea Europeană</Eyebrow>
              <H2 className="sm:text-[32px]">Extrasul multilingv de naștere, în aceeași comandă.</H2>
              <Prose paras={['Formularul standard UE (Regulamentul 2016/1191) are datele certificatului în toate limbile Uniunii și e acceptat în Italia, Spania, Germania sau Franța fără traducere și fără apostilă. Dacă ai nevoie de amândouă, bifezi opțiunea în formular și pleacă în același plic.']} />
            </div>
            <div className="flex flex-col gap-3 lg:col-span-4">
              <div className="flex items-baseline gap-2"><span className="text-[48px] font-extrabold leading-none tracking-[-0.05em]">+ {lei(extras)}</span><span className="text-[18px] font-bold">lei</span></div>
              <Link href="/extras-multilingv/" className="inline-flex h-[52px] items-center justify-center rounded-xl border-[1.5px] border-d-line bg-d-card text-[16px] font-bold hover:border-d-acc">Despre extrasul multilingv</Link>
            </div>
          </Card>
        </Section>

        <Section className="mt-20 grid gap-8 lg:mt-[88px] lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre duplicatul certificatului de naștere</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>
      </main>
    </>
  );
}
