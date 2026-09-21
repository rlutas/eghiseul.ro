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

const PATH = '/certificat-de-nastere/';
const TITLE = 'Certificat de Naștere Online: Duplicat prin Avocat, Livrat Acasă';
const DESCRIPTION =
  'Duplicat certificat de naștere obținut de un avocat de la starea civilă: pierdut, deteriorat, model vechi sau pentru străinătate. Semnezi pe telefon, fără programare, fără notar. Originalul vine prin curier.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-21';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/clienta-usa-certificat.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

/** [title, text, href?] — a card without href is a situation we handle but have no guide for yet. */
const SITUATIONS: Array<[string, string, string?]> = [
  ['L-am pierdut sau mi-a fost furat', 'Fără declarație la poliție, fără anunț în Monitorul Oficial. Se cere direct duplicatul.', '/ghiduri/certificat-de-nastere-pierdut/'],
  ['E deteriorat sau plastifiat', 'Un certificat plastifiat nu mai e acceptat: nu se pot pune mențiuni pe el. Cel vechi se predă la eliberare.'],
  ['Am modelul vechi, tipizat', 'Rămâne valabil în țară. Pentru pașaport, pentru străinătate sau pentru copil ți se cere tot mai des modelul nou, cu CNP.'],
  ['Locuiesc în străinătate', 'Semnezi de acolo, fără procură la notar sau consulat. Livrăm oriunde; pentru UE adaugi extrasul multilingv.', '/ghiduri/procura-din-strainatate-notar-consulat-avocat/'],
  ['Pentru copilul meu', 'Părintele cere duplicatul minorului. Copilul de peste 14 ani semnează și el cererea.'],
  ['Pentru un părinte decedat', 'Pentru succesiune se cere un extras pentru uz oficial, nu un duplicat. Scrie-ne și îți spunem ce document e potrivit.', '/contact/'],
];

const WHO_CAN_ASK = [
  ['Titularul', 'Tu, pentru propriul certificat, cu actul de identitate valabil. De la 14 ani ai buletin și poți semna singur, cu un părinte alături.'],
  ['Părintele sau tutorele', 'Pentru copilul minor. Depune cu actul lui de identitate; nu e nevoie de acordul celuilalt părinte.'],
  ['Avocatul cu împuternicire', `În temeiul ${LEGAL_BASIS.shortGen}. Împuternicirea avocațială se semnează electronic, fără notar. Așa lucrăm noi.`],
  ['O persoană cu procură notarială', 'Merge și așa, dar procura se face la notar sau la consulat, costă și durează. Împuternicirea avocațială o înlocuiește.'],
] as const;

const MISMATCH = [
  ['Numele e scris altfel în pașaport', 'Diacritice lipsă sau „Ş” cu sedilă în loc de „Ș”: nu contează, duplicatul iese după actul de naștere. Pentru autoritățile străine, extrasul multilingv are numele exact ca în act.'],
  ['Data nașterii sau numele părinților sunt greșite în act', 'Duplicatul reproduce actul, cu greșeală cu tot. Corectarea se numește rectificare, se face de primăria care are actul, prin dispoziție a primarului, și e o procedură separată. Îți spunem înainte să plătești dacă vedem o problemă.'],
  ['Nu știu la ce primărie e actul', 'Scrie localitatea nașterii așa cum o știi. Din 2023 cererea se depune la orice primărie și pleacă electronic la cea care păstrează actul; avocatul nostru găsește primăria corectă și pentru sate care s-au comasat între timp.'],
  ['Născut în străinătate, fără act românesc', 'Atunci nu ai nevoie de duplicat, ci de transcriere: certificatul străin se înscrie în registrele din România. E alt serviciu, cu alte acte; nu-l vindem încă, dar îți spunem ce trebuie.'],
] as const;

const FAQ = [
  { q: 'Cât durează să obțin duplicatul certificatului de naștere?', a: `Termenul legal este de cel mult 30 de zile de la depunere. La comenzile noastre din vara lui 2026, jumătate au ajuns la client în cel mult ${PROCESSING_STATS.byService['certificat-nastere'].medianDays} zile de la plată, cu tot cu curier. Actele vechi, nescanate, ajung aproape de termenul maxim, fiindcă primăria de origine le caută în registrul de hârtie.` },
  { q: 'Trebuie să merg la notar pentru împuternicire?', a: `Nu. Împuternicirea avocațială se semnează electronic în formular și este recunoscută de oficiile de stare civilă în temeiul ${LEGAL_BASIS.shortGen}.` },
  { q: 'Cine poate cere duplicatul certificatului de naștere?', a: 'Titularul, părintele pentru copilul minor, o persoană cu procură notarială sau un avocat cu împuternicire avocațială. Pentru un alt adult (soț, frate, prieten) nu poți cere tu, chiar dacă plătești tu comanda: el semnează împuternicirea, de pe telefonul lui.' },
  { q: 'Trebuie să știu exact primăria unde am fost înregistrat?', a: 'Ajută, dar nu e obligatoriu. Din 2023 cererea se depune la orice primărie și e trimisă electronic la cea care păstrează actul. Scrii localitatea nașterii și ne ocupăm noi.' },
  { q: 'Cât costă duplicatul la primărie?', a: 'Nimic sau o taxă locală de câțiva lei, stabilită de consiliul local. La noi plătești avocatul, împuternicirea, depunerea, urmărirea dosarului și livrarea, nu documentul.' },
  { q: 'Ce se întâmplă cu certificatul vechi, dacă îl găsesc?', a: 'La eliberarea duplicatului, cel vechi își pierde valabilitatea. Dacă îl mai ai, se predă primăriei. Dacă apare mai târziu, nu îl mai folosești.' },
  { q: 'Duplicatul iese pe modelul nou, cu CNP?', a: 'Da. Orice duplicat eliberat acum iese pe formularul actual, cu CNP și elemente de siguranță, indiferent de anul nașterii. Certificatele vechi, tipizate, rămân valabile, dar la pașaport sau în străinătate ți se cere tot mai des modelul nou.' },
  { q: 'Ce se întâmplă dacă primăria refuză?', a: 'Te sunăm, îți explicăm motivul și, dacă nu se poate rezolva, returnăm banii conform politicii de anulare. Cele mai dese motive: act de identitate expirat sau o cerere de transcriere confundată cu una de duplicat.' },
];

export default async function NasterePage() {
  const p = await getServicePricing('certificat-nastere');
  const extras = optionPrice(p, 'extras_multilingv', 398);
  const apostila = optionPrice(p, 'apostila_haga', 198);
  const traducere = optionPrice(p, 'traducere', 178.5);
  const legalizare = optionPrice(p, 'legalizare', 99);
  const stats = PROCESSING_STATS.byService['certificat-nastere'];

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
    faq: FAQ,
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
          media={<Image src="/images/documentero/clienta-usa-certificat.webp" alt="Clientă în ușa apartamentului, cu certificatul de naștere scos din plic" width={1370} height={1148} className="h-full w-full object-cover" sizes="(min-width: 1024px) 760px, 100vw" priority />}
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

        <QuickAnswer updated={DATE_MODIFIED}>
          Duplicatul certificatului de naștere se eliberează de oficiul de stare civilă, pe baza actului de naștere din registru, și din 2023 se poate cere la orice primărie din România. Cererea o depune titularul, părintele pentru minor sau un avocat cu împuternicire avocațială ({LEGAL_BASIS.short}). Termenul legal este de cel mult 30 de zile. Taxa de stat: 0 lei sau o taxă locală de câțiva lei. Prin documentero.ro, avocatul depune cererea în locul tău și primești originalul prin curier.
        </QuickAnswer>

        <Section id="situatii" className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Eyebrow>Situații frecvente</Eyebrow>
            <H2>Oricare ar fi motivul, procedura e aceeași: un duplicat nou.</H2>
            <p className="m-0 text-[16px] leading-[1.55] text-d-muted">Din 2023, duplicatul se poate cere de la orice primărie. Noi mergem oricum acolo unde e actul.</p>
            <div className="h-[240px] overflow-hidden rounded-[20px]">
              <Image src="/images/documentero/certificat-pe-masa.webp" alt="Certificat de naștere pe masă, lângă plicul în care a venit" width={1370} height={1148} className="h-full w-full object-cover" sizes="(min-width: 1024px) 520px, 100vw" />
            </div>
          </div>
          <div className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-7">
            {SITUATIONS.map(([t, d, h]) =>
              h ? (
                <Link key={t} href={h} className="flex flex-col gap-1.5 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
                  <span className="text-[17px] font-bold">{t}</span>
                  <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
                </Link>
              ) : (
                <div key={t} className="flex flex-col gap-1.5 rounded-2xl border border-d-line bg-d-card p-5">
                  <span className="text-[17px] font-bold">{t}</span>
                  <span className="text-[14px] leading-[1.5] text-d-muted">{d}</span>
                </div>
              ),
            )}
          </div>
        </Section>

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Cine semnează cererea</Eyebrow>
            <H2 className="sm:text-[36px]">Cine poate cere duplicatul certificatului de naștere?</H2>
            <p className="m-0 text-[15px] leading-[1.6] text-d-muted">Certificatul se eliberează doar titularului sau cuiva care îl reprezintă legal. De aceea un prieten sau un frate nu poate cere în locul tău fără o împuternicire.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {WHO_CAN_ASK.map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 rounded-2xl p-6">
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <SeoBlock
          title="Duplicat certificat de naștere online: cum funcționează prin avocat"
          intro={[
            'Duplicatul certificatului de naștere se eliberează pe baza actului de naștere aflat în registrul de stare civilă al primăriei unde a fost înregistrată nașterea. Cererea o poate depune titularul, un părinte pentru minor sau un avocat cu împuternicire avocațială, în temeiul articolului 10 din Legea 119/1996 și al Legii 51/1995 privind profesia de avocat. Din 2023 cererea se depune la orice primărie din țară, iar sistemul informatic de stare civilă o trimite la cea care păstrează actul. Duplicatul iese pe formularul actual, cu CNP, indiferent de anul nașterii.',
            'La noi merge așa: completezi datele nașterii (data, localitatea, numele părinților), încarci o poză a actului de identitate și semnezi împuternicirea pe telefon. Avocatul depune cererea, ridică duplicatul și îl trimitem prin curier, cu scanul pe email în ziua ridicării. Nu există taxă de stat pentru eliberare; ce plătești este onorariul avocatului, împuternicirea, depunerea, urmărirea și livrarea.',
            'Un lucru pe care îl lămurim înainte de plată, fiindcă aduce comenzi greșite: duplicatul nu e același lucru cu transcrierea. Dacă te-ai născut în străinătate și nu ai avut niciodată certificat românesc, certificatul străin trebuie mai întâi înscris în registrele din România. Aia e transcriere, cu alte acte și alt termen. Duplicatul se cere doar pentru un act care există deja în registrele românești.',
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
            `Pentru instituțiile din UE, extrasul multilingv de naștere înlocuiește traducerea și apostila; îl adaugi în aceeași comandă, ${lei(extras)} lei, și pleacă în același plic. Pentru Regatul Unit, Elveția, SUA sau Canada rămâne duplicatul cu apostilă și traducere, pe care le facem noi, în ordinea corectă: întâi apostila pe original, apoi traducerea.`,
          ]}
          guides={[
            { title: 'Certificat de naștere pierdut: ce faci în 2026', desc: 'Pașii, actele, termenul real.', href: '/ghiduri/certificat-de-nastere-pierdut/' },
            { title: 'Apostila pe acte de stare civilă: când e nevoie și când nu', desc: 'În UE nu; în afara UE, pe original.', href: '/ghiduri/apostila-acte-stare-civila/' },
            { title: 'Acte necesare pentru duplicatul certificatului de naștere', desc: 'Lista scurtă, pe cazuri, plus sectoarele din București.', href: '/ghiduri/acte-necesare-duplicat-certificat-de-nastere/' },
          ]}
        />

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-7">
            <Eyebrow>Termenul real</Eyebrow>
            <H2 className="sm:text-[36px]">Cât durează, de fapt?</H2>
            <Prose
              paras={[
                'Legea spune „cel mult 30 de zile” de la depunere. Hub-ul MAI dă ca medie 3 zile lucrătoare. Amândouă sunt adevărate și niciuna nu spune cât așteaptă omul, fiindcă depinde de un singur lucru: dacă actul tău de naștere e deja scanat în sistemul informatic sau stă într-un registru de hârtie, într-o arhivă de primărie.',
                `Cifrele noastre, nu ale altora: din comenzile de duplicat plătite pe documentero.ro și eghiseul.ro de la ${PROCESSING_STATS.since}, ${stats.done} au fost finalizate până la ${PROCESSING_STATS.asOf.split('-').reverse().join('.')}. Jumătate au ajuns la client în cel mult ${stats.medianDays} zile de la plată, 8 din 10 în cel mult ${stats.p80Days} zile. Timpul include depunerea, așteptarea la primărie și curierul. Eșantionul e mic și îl actualizăm pe măsură ce crește.`,
                'Ce nu putem controla: primăria care caută un act din 1962 într-un registru legat cu sfoară. Ce controlăm: depunerea în ziua următoare semnării și un mesaj la fiecare schimbare de stare, ca să nu suni tu să întrebi.',
              ]}
            />
          </div>
          <Card className="flex flex-col gap-4 self-start p-6 lg:col-span-4 lg:col-start-9">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Ce plătești, de fapt</span>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {[
                'Onorariul avocatului și împuternicirea avocațială, cu număr din registrul Baroului',
                'Depunerea cererii și ridicarea duplicatului de la primărie',
                'Urmărirea dosarului și un mesaj la fiecare schimbare de stare',
                'Scanul pe email în ziua ridicării, originalul prin curier',
                'Banii înapoi dacă primăria refuză și nu se poate rezolva',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Check className="mt-0.5 shrink-0 text-d-acc" /><span>{t}</span></li>
              ))}
            </ul>
            <span className="text-[13px] text-d-muted">Certificatul în sine e gratuit la ghișeu. Noi vindem drumul și dosarul.</span>
          </Card>
        </Section>

        <Section className="mt-24 flex flex-col gap-7 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Înainte să plătești</Eyebrow>
            <H2 className="sm:text-[36px]">Când datele nu se potrivesc</H2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {MISMATCH.map(([t, d]) => (
              <Card key={t} className="flex flex-col gap-2 rounded-2xl p-6">
                <span className="text-[18px] font-bold">{t}</span>
                <span className="text-[14px] leading-[1.55] text-d-muted">{d}</span>
              </Card>
            ))}
          </div>
        </Section>

        <Section className="mt-24 flex flex-col gap-5 lg:mt-32">
          <div className="flex flex-col gap-3">
            <Eyebrow>Pentru ce îl cer instituțiile</Eyebrow>
            <H2 className="sm:text-[36px]">Duplicat sau extras multilingv? Depinde cine ți-l cere.</H2>
          </div>
          <InfoTable
            head={['Ai nevoie de el pentru', 'Ce ți se cere de obicei', 'Ce comanzi']}
            rows={[
              ['Buletin sau pașaport, în România', 'certificatul de naștere, de preferat modelul nou', 'duplicatul'],
              ['Pașaportul copilului', 'certificatul copilului, modelul cu CNP', 'duplicatul'],
              ['Rezidență, școală, căsătorie în UE', 'certificat acceptat fără traducere', 'extrasul multilingv, singur sau cu duplicatul'],
              ['Cetățenie sau viză în afara UE', 'certificat apostilat și tradus', 'duplicatul cu apostilă și traducere'],
              ['Succesiune după un părinte', 'dovada filiației', 'extras pentru uz oficial; scrie-ne'],
              ['Rectificarea unei greșeli din act', 'nu duplicat', 'altă procedură; îți spunem pașii'],
            ]}
          />
        </Section>

        <Section className="mt-24 lg:mt-32">
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

        <Section className="mt-24 grid gap-8 lg:mt-32 lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Eyebrow>Întrebări frecvente</Eyebrow>
            <H2 className="sm:text-[36px]">Despre duplicatul certificatului de naștere</H2>
          </div>
          <div className="lg:col-span-8"><FaqList items={FAQ} /></div>
        </Section>

        <ReviewsDocumentero match={/naștere/i} title="Ce spun clienții despre certificatul de naștere" />

        <RelatedServices
          items={[
            ['Extras multilingv de naștere', 'Pentru UE: același act, acceptat fără traducere și fără apostilă.', '/extras-multilingv/'],
            ['Certificat de căsătorie, duplicat', 'Aceeași procedură, pentru actul de căsătorie. Cu mențiunea de divorț, dacă e cazul.', '/certificat-de-casatorie/'],
            ['Certificat de celibat', 'Pentru căsătoria în străinătate ți se cere împreună cu certificatul de naștere.', '/certificat-de-celibat/'],
          ]}
        />
      </main>
    </>
  );
}
