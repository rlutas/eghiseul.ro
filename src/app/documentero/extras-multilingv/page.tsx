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
const TITLE = 'Extras Multilingv Certificat de Naștere: în 23 de State, prin Avocat';
const DESCRIPTION =
  'Extras multilingv de naștere (Convenția CIEC nr. 16), obținut prin avocat: fără traducere și apostilă în Italia, Spania, Germania, Franța și alte 19 state.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-11-02';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/curier-livrare-plic.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

// States where Convention CIEC no. 16 is in force, besides Romania (ciec1.org status chart, 2026).
const COUNTRIES = ['Italia', 'Spania', 'Germania', 'Franța', 'Austria', 'Belgia', 'Olanda', 'Luxemburg', 'Portugalia', 'Polonia', 'Elveția', 'Turcia', 'Republica Moldova', 'Bulgaria', 'Croația', 'Slovenia', 'Lituania', 'Estonia', 'Serbia', 'Bosnia și Herțegovina', 'Muntenegru', 'Macedonia de Nord', 'Capul Verde'];

const FAQ = [
  { q: 'Cât durează?', a: `Legal, până la 30 de zile de la depunere. La comenzile noastre de extras de naștere din vara lui 2026, jumătate au ajuns la client în cel mult ${PROCESSING_STATS.byService['extras-multilingv-certificat-nastere'].medianDays} zile de la plată, cu curier cu tot. Dacă actul e deja scanat, primăria îl eliberează în câteva zile.` },
  { q: 'Are termen de valabilitate?', a: 'Convenția nu îi stabilește un termen. Unele autorități cer însă un document eliberat în ultimele 3–6 luni; verifică la instituția care ți-l cere.' },
  { q: 'Extrasul multilingv înlocuiește certificatul de naștere?', a: 'În fața autorităților din statele care aplică Convenția CIEC nr. 16, da: are aceeași putere doveditoare ca certificatul. În România nu se folosește; aici ți se cere certificatul. De aceea mulți comandă amândouă, în aceeași depunere.' },
  { q: 'Pot cere extrasul pentru copilul meu?', a: 'Da, ca părinte. Pentru un alt adult, doar el semnează împuternicirea.' },
  { q: 'Ce diferență e față de un certificat tradus?', a: 'Extrasul multilingv e acceptat fără traducere în toate statele care aplică Convenția CIEC nr. 16. Un certificat tradus e primit după regulile fiecărei instituții, iar traducerea autorizată o plătești separat.' },
  { q: 'E același lucru cu „certificatul de naștere internațional”?', a: 'Așa îi spun mulți. Temeiul lui e Convenția CIEC nr. 16 (Viena, 1976), la care România a aderat prin Legea nr. 65/2012. Nu-l confunda cu formularul standard multilingv din Regulamentul (UE) 2016/1191: acela e o anexă de traducere care însoțește certificatul și se folosește doar între statele UE.' },
  { q: 'Trebuie să merg la notar pentru împuternicire?', a: `Nu. Împuternicirea avocațială se semnează electronic în formular și e recunoscută de starea civilă în temeiul ${LEGAL_BASIS.shortGen}.` },
];

/*
 * Primăria competentă (verificat 02.11.2026): HG 255/2024, Normele metodologice de stare civilă, în vigoare
 * 31.03.2024 — art. 158 alin. (1): certificatele de stare civilă se eliberează „de către oricare S.P.C.L.E.P. sau,
 * după caz, primărie”; art. 171 alin. (1): la fel extrasele multilingve; art. 12 lit. o): ofițerii de stare civilă
 * din S.P.C.L.E.P. eliberează adeverința privind statutul civil (Anexa 18); art. 28 alin. (3): un act nedigitizat
 * se validează în 3 zile la cererea serviciului care are cererea. https://legislatie.just.ro/Public/DetaliiDocument/280598
 * Aplicat de SPCLEP: https://primariatgfrumos.ro/wp-content/uploads/2023/01/Extrasele-multilingve-1.pdf
 * Era „din 2023” — regula vine din HG 255/2024.
 */
/*
 * Consulatul (verificat 02.11.2026): H.G. 255/2024, Normele metodologice de stare civilă,
 * https://legislatie.just.ro/Public/DetaliiDocument/280598 — art. 158 alin. (1): certificatele de stare civilă
 * se eliberează și de „misiune diplomatică sau oficiu consular de carieră a/al României în străinătate”;
 * art. 171 alin. (1): la fel extrasele multilingve; art. 158 alin. (18): la cererea depusă la consulat,
 * certificatul se poate livra în străinătate prin curier. Consulatul nu „trimite cererea în țară”, iar
 * „30–60 de zile” nu avea sursă: scos. Termenul rămâne cel din art. 162 alin. (2) (pe loc / până la 30 de zile).
 * Adeverința privind statutul civil (celibat) e în atribuțiile ofițerilor din S.P.C.L.E.P./primării (art. 12
 * lit. o); pentru consulate normele nu o spun la fel de clar, deci nu afirmăm.
 */
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
          eyebrow="Convenția CIEC nr. 16 · Legea nr. 65/2012"
          title="Extrasul multilingv de naștere: fără traducere și fără apostilă în 23 de state."
          intro="Un extras al actului tău de naștere, eliberat de starea civilă din România, cu rubricile în română și franceză și traducerea lor pe verso. Îl depui direct la primăria, notarul sau autoritatea din statul unde locuiești, dacă statul aplică Convenția CIEC nr. 16. Avocatul nostru îl obține și ți-l trimite prin curier."
          orderSlug="extras-multilingv-certificat-nastere"
          cta="Comandă extrasul"
          secondary={{ label: 'Când nu e suficient', href: '#limite' }}
          facts={[['23 de state', 'îl acceptă fără traducere'], ['0 apostile', 'în statele convenției'], ['≤ 30 de zile', 'termen legal de eliberare']]}
          priceLabel="Extras multilingv de naștere"
          price={pN.basePrice}
          optionsTitle="Pachet"
          options={[{ name: 'Adaugă și certificatul de naștere', desc: 'duplicatul și extrasul, dintr-o singură depunere', price: pachet, featured: true }]}
          note={`Există și extrasul multilingv de căsătorie, ${lei(pC.basePrice)} lei, cu aceeași procedură (mai jos).`}
        />

        <QuickAnswer updated={DATE_MODIFIED}>
          Extrasul multilingv al actului de naștere e documentul prevăzut de Convenția CIEC nr. 16 (Viena, 1976), la care România a aderat prin Legea nr. 65/2012. Îl eliberează orice serviciu de stare civilă din țară, pe baza actului de naștere din registru (din 2024), și are aceeași putere doveditoare ca certificatul. În cele 23 de state care aplică convenția e primit fără traducere, fără legalizare și fără apostilă; în fața autorităților române nu se folosește. Îl poate cere titularul, părintele pentru minor sau un avocat cu împuternicire avocațială ({LEGAL_BASIS.short}). Termen legal de eliberare: cel mult 30 de zile. Prin noi costă {lei(pN.basePrice)} lei pentru naștere și {lei(pC.basePrice)} lei pentru căsătorie, cu onorariul avocatului inclus.
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
            <H2 className="sm:text-[36px]">Extrasul are aceeași putere doveditoare ca certificatul.</H2>
            <p className="m-0 text-[16px] leading-[1.6] text-d-muted">Are aceleași date ca certificatul de naștere (nume, dată, loc, părinți), pe formularul din Convenția CIEC nr. 16. Statele care au aderat la convenție îl primesc fără traducere, fără legalizare și fără apostilă.</p>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {['Eliberat de starea civilă din România, cu ștampilă', 'Acceptat în cele 23 de state ale convenției', 'Fără traducere, fără apostilă, fără notar', 'Nu se folosește în fața autorităților române'].map((t) => (
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
              <Prose paras={['Pentru rezidența partenerului, schimbarea numelui în actele străine sau pensia de urmaș, instituțiile din statele convenției acceptă extrasul multilingv de căsătorie în locul certificatului tradus. Îl cere oricare dintre soți; avocatul depune la primăria care păstrează actul de căsătorie. Dacă ai divorțat, mențiunea apare și pe extras, cu condiția să fie înscrisă pe actul de căsătorie din România.']} />
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
              ['În statele care n-au aderat', 'Regatul Unit, Irlanda, țările nordice, Cehia, Slovacia, Ungaria, Grecia, SUA, Canada: extrasul nu e recunoscut automat. Acolo folosești certificatul, cu traducere și, în afara UE, cu apostilă.', '/certificat-de-nastere/'],
              ['Autoritatea cere expres certificatul', 'Unele consulate și instanțe cer certificatul chiar și într-un stat al convenției. Verificăm cu tine țara și scopul.', '/ghiduri/apostila-acte-stare-civila/'],
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
            <Eyebrow>Două documente, două temeiuri</Eyebrow>
            <H2 className="sm:text-[36px]">Extrasul CIEC sau formularul UE? Nu sunt același lucru.</H2>
            <p className="m-0 max-w-[760px] text-[15px] leading-[1.6] text-d-muted">Ce comanzi la noi e extrasul multilingv după Convenția CIEC nr. 16. Formularul standard multilingv din Regulamentul (UE) 2016/1191 e altceva: o anexă care însoțește certificatul și ține loc de traducere, doar între statele UE.</p>
          </div>
          <InfoTable
            head={['', 'Extras multilingv CIEC (ce comanzi la noi)', 'Formular standard multilingv UE']}
            rows={[
              ['Temei', 'Convenția CIEC nr. 16 (Viena, 1976); Legea nr. 65/2012; HG nr. 727/2013', 'Regulamentul (UE) 2016/1191'],
              ['Ce este', 'un extras de sine stătător, cu aceeași putere doveditoare ca certificatul', 'o anexă de traducere, fără valoare proprie; se prezintă doar împreună cu certificatul'],
              ['Unde e acceptat fără traducere', 'în cele 23 de state ale convenției, inclusiv Elveția, Turcia și Republica Moldova', 'în statele membre UE, atașat certificatului'],
              ['Apostilă', 'nu, în statele convenției', 'certificatul e scutit de apostilă între statele UE'],
              ['În România', 'nu se folosește', 'nu e cazul'],
            ]}
          />
          <p className="m-0 text-[14px] text-d-muted">Scrie țara și instituția în formular; îți spunem dacă extrasul e suficient acolo sau îți trebuie și certificatul.</p>
        </Section>

        <SeoBlock
          title="Certificat de naștere multilingv online: ce este extrasul, cine îl acceptă, cât costă"
          intro={[
            'Extrasul multilingv al actului de naștere e documentul prevăzut de Convenția CIEC nr. 16, semnată la Viena în 1976, la care România a aderat prin Legea nr. 65/2012. Are datele din certificatul tău de naștere, cu rubricile în română și franceză și traducerea lor pe verso. De aceea o primărie din Italia, un „Standesamt” din Germania sau un „registro civil” din Spania îl acceptă ca atare: fără traducere autorizată, fără apostilă, fără legalizare. Mulți îl caută drept „certificat de naștere multilingv” sau „certificat de naștere internațional”; e același document.',
            `Îl eliberează orice serviciu de stare civilă din țară (din 2024), la cerere, titularului sau unui avocat cu împuternicire (${LEGAL_BASIS.short}). Se cere de obicei împreună cu duplicatul certificatului, pentru că unele instituții străine vor amândouă. De aceea avem pachetul: extrasul și certificatul, dintr-o singură depunere, ${lei(pN.basePrice)} + ${lei(pachet)} lei.`,
          ]}
          acte={['Act de identitate valabil (buletin sau pașaport), poză față-verso', 'Datele nașterii: data, localitatea, numele părinților', 'Țara în care folosești extrasul', 'Semnătura ta, în formular']}
          rows={[
            ['Unde depui', 'la orice primărie, cu programare', 'nicăieri; depune avocatul'],
            ['Traducere', 'nu e nevoie în statele convenției', 'nu e nevoie în statele convenției'],
            ['Apostilă', 'nu e nevoie în statele convenției', 'nu e nevoie în statele convenției; în rest îți spunem ce trebuie'],
            ['Taxă', '0 lei sau taxă locală', `${lei(pN.basePrice)} lei, tot inclus`],
            ['Termen', 'legal, până la 30 de zile', 'același termen; status la fiecare pas'],
            ['Din străinătate', 'la consulatul de carieră, cu programare', 'avocatul depune în România, curier internațional'],
          ]}
          diasporaTitle="Pentru cine e gândit extrasul: cei care locuiesc în statele convenției"
          diaspora={[
            'Cel mai des îl cer românii stabiliți în Italia, Spania, Germania și Franța, pentru înscrierea copilului la școală, pentru căsătorie, pentru dosarul de rezidență sau pentru pensie. Fără extras, instituțiile de acolo cer de obicei certificatul cu traducere autorizată, adică un drum și o cheltuială în plus.',
            'Atenție la două lucruri. Extrasul nu spune nimic despre starea civilă actuală: pentru căsătorie ai nevoie și de certificatul de celibat. Și nu e recunoscut în statele care n-au aderat la convenție: Regatul Unit, Irlanda, țările nordice, Cehia, Slovacia, Ungaria, Grecia, SUA sau Canada. Acolo rămâne certificatul, cu traducere și, în afara UE, cu apostilă.',
          ]}
          guides={[
            { title: 'Apostila pe acte de stare civilă: când e nevoie și când nu', desc: 'Depinde de țară. Tabelul pe scurt.', href: '/ghiduri/apostila-acte-stare-civila/' },
            { title: 'Procură din străinătate: notar, consulat sau avocat', desc: 'Cum ceri extrasul fără să vii în țară.', href: '/ghiduri/procura-din-strainatate-notar-consulat-avocat/' },
            { title: 'Certificat de naștere pierdut: ce faci în 2026', desc: 'Pașii, actele, termenul real.', href: '/ghiduri/certificat-de-nastere-pierdut/' },
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
                'Verificarea țării: îți spunem dacă extrasul e acceptat acolo',
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
            ['Certificat de naștere, duplicat', 'Pentru România sau pentru statele care nu aplică convenția.', '/certificat-de-nastere/'],
            ['Certificat de celibat', 'Pentru căsătoria în străinătate: extrasul nu atestă starea civilă actuală.', '/certificat-de-celibat/'],
            ['Certificat de căsătorie, duplicat', 'Cu extrasul multilingv de căsătorie ca opțiune, în aceeași comandă.', '/certificat-de-casatorie/'],
          ]}
        />
      </main>
    </>
  );
}
