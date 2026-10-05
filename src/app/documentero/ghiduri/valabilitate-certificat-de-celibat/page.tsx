import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, FaqList, H2, InfoTable, RelatedServices, Section, UpdatedLine } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroArticleGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { fmtDateRo, LAWYER, PROCESSING_STATS } from '@/lib/documentero/content';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const SLUG = 'valabilitate-certificat-de-celibat';
const PATH = `/ghiduri/${SLUG}/`;
const TITLE = 'Cât e valabil certificatul de celibat? Termenele cerute în Germania, Italia, Spania, Franța și UK';
const DESCRIPTION =
  'Formularul românesc nu are termen de valabilitate. Termenul îl pune instituția care îl primește. Ce cer Germania, Franța, Spania, Italia și Regatul Unit, în ce ordine faci apostila și traducerea și când să-l comanzi.';
const DATE_PUBLISHED = '2026-10-05';
const DATE_MODIFIED = '2026-10-05';
const IMAGE = '/images/documentero/cuplu-certificat-casatorie.webp';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: IMAGE,
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'Ce scrie pe adeverință'],
  ['s2', 'De unde vin „6 luni” și „90 de zile”'],
  ['s3', 'Ce cer alte state'],
  ['s4', 'Apostilă și traducere: ordinea'],
  ['s5', 'Când să-l comanzi'],
  ['s6', 'Divorț sau căsătorie neînscrise în România'],
  ['faq', 'Întrebări frecvente'],
  ['surse', 'Surse'],
] as const;

const FAQ = [
  {
    q: 'Scrie pe certificatul de celibat până când e valabil?',
    a: 'Nu. Modelul din Anexa 18 la H.G. 255/2024 are datele tale, numărul actului de naștere, statutul civil „la data eliberării” și semnătura ofițerului. Nu are o rubrică de valabilitate. Termenul îl stabilește instituția care îl primește.',
  },
  {
    q: 'Atunci de unde vine regula de 6 luni?',
    a: 'Din regulile statelor care primesc actul. În Germania, de exemplu, certificatul de capacitate matrimonială își pierde efectul dacă nunta nu are loc în 6 luni de la emitere (§1309 BGB). Multe oficii aplică o limită asemănătoare și actelor venite din alte state.',
  },
  {
    q: 'Și cele 90 de zile?',
    a: 'Nu există o regulă europeană de 90 de zile. Regulamentul (UE) 2016/1191 nu fixează vechimea actelor. Un termen de 3 luni apare în reguli naționale. Chiar România îl aplică străinilor care se căsătoresc aici: dovada din țara lor trebuie să fie de cel mult 3 luni, dacă nu are alt termen scris pe ea.',
  },
  {
    q: 'Dacă dosarul se amână, trebuie să cer altul?',
    a: 'Dacă la noua dată adeverința a depășit termenul cerut de oficiul străin, da. Situația ta poate să nu se fi schimbat, dar termenul se socotește de la data eliberării scrisă pe adeverință.',
  },
  {
    q: 'În UE am nevoie de apostilă pe certificatul de celibat?',
    a: 'De regulă, nu. Regulamentul (UE) 2016/1191 scutește documentele publice despre starea civilă de apostilă între statele membre. La cerere, ofițerul de stare civilă eliberează și formularul standard multilingv atașat adeverinței, care te scutește în multe cazuri de traducere.',
  },
  {
    q: 'Am divorțat în Italia. Ce scrie pe adeverința din România?',
    a: 'Scrie doar ce e înscris în registrele românești. Dacă divorțul nu a fost înscris ca mențiune pe actul tău din România, adeverința te arată în continuare căsătorit. Întâi se înscrie mențiunea, apoi se cere adeverința.',
  },
];

function H(props: { id: string; children: string }) {
  return <h2 id={props.id} className="m-0 mt-7 scroll-mt-24 text-[26px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[30px]">{props.children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">{children}</p>;
}
function A({ href, children }: { href: string; children: string }) {
  return <Link href={href} className="font-semibold text-d-ink underline underline-offset-2 hover:text-d-acc">{children}</Link>;
}
function Ext({ href, children }: { href: string; children: string }) {
  return <a href={href} rel="noopener noreferrer" target="_blank" className="font-semibold text-d-ink underline underline-offset-2 hover:text-d-acc">{children}</a>;
}

export default async function GhidValabilitateCelibatPage() {
  const p = await getServicePricing('certificat-celibat');
  const stats = PROCESSING_STATS.byService['certificat-celibat'];
  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: IMAGE,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Valabilitatea certificatului de celibat', path: PATH }],
    faq: FAQ,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="/ghiduri/" />
      <main id="main-content">
        <Section className="mt-10 grid gap-8 lg:grid-cols-12">
          <article className="flex flex-col gap-5 lg:col-span-8">
            <nav aria-label="breadcrumb" className="flex gap-2 text-[13px] text-d-muted">
              <Link href="/" className="hover:text-d-ink">Acasă</Link><span>/</span>
              <Link href="/ghiduri/" className="hover:text-d-ink">Ghiduri</Link><span>/</span>
              <span className="text-d-ink">Valabilitatea certificatului de celibat</span>
            </nav>
            <Eyebrow>Celibat · 7 minute de citit</Eyebrow>
            <h1 className="m-0 text-[34px] font-bold leading-[1.06] tracking-[-0.035em] sm:text-[50px]">{TITLE}</h1>
            <p className="m-0 text-[18px] leading-[1.55] text-d-muted sm:text-[20px]">{DESCRIPTION}</p>
            <div className="flex items-center gap-3.5 border-y border-d-line py-4">
              <Image src={SITE_AUTHOR.photo} alt={SITE_AUTHOR.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold">
                  <a href={SITE_AUTHOR.url} className="hover:underline">{SITE_AUTHOR.name}</a>, fondator eghiseul.ro și documentero.ro
                </span>
                <span className="text-[13px] text-d-muted">Publicat {fmtDateRo(DATE_PUBLISHED)} · procedura verificată cu <Link href="/despre/" className="underline underline-offset-2 hover:text-d-acc">av. {LAWYER.name}, Baroul Satu Mare</Link></span>
              </div>
            </div>
            <div className="h-[240px] overflow-hidden rounded-[20px] sm:h-[380px]">
              <Image src={IMAGE} alt="Doi logodnici la birou, verificând actele pentru căsătorie lângă laptop și pașaport" width={1370} height={1148} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <Card className="flex flex-col gap-2 border-l-4 border-l-d-acc p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
              <P>Certificatul de celibat se numește în lege adeverință cu privire la statutul civil (Anexa 18 la H.G. 255/2024). Formularul nu are termen de valabilitate: arată starea ta civilă la data eliberării. Cât de nou trebuie să fie îl decide instituția care îl primește. În practică sunt 3 sau 6 luni, socotite de la data de pe adeverință. Comandă-l după ce afli data depunerii dosarului.</P>
              <UpdatedLine date={DATE_MODIFIED} />
            </Card>

            <H id="s1">Ce scrie pe adeverință</H>
            <P>Modelul din Anexa 18 are patru părți: identitatea ta (nume, CNP, data și locul nașterii, actul de identitate), numărul actului de naștere din registru, statutul civil și semnătura ofițerului de stare civilă. Statutul are patru variante: necăsătorit, căsătorit, divorțat sau văduv. Fiecare e formulată „la data eliberării prezentei adeverințe” și se bazează pe mențiunile scrise pe marginea actului de naștere.</P>
            <P>Atât. Nu există rubrică pentru valabilitate și nici o frază de tipul „valabilă 6 luni”. În metodologia veche, documentul folosit ca dovadă de celibat era Anexa 9 la H.G. 64/2011. Nici formularul acela nu avea vreun termen.</P>
            <P>Adeverința o pot cere titularul, reprezentantul legal sau un împuternicit cu procură specială ori cu împuternicire avocațială (art. 12 lit. o din Norme). Poate fi eliberată și electronic, cu semnătura emitentului și un cod de verificare.</P>

            <H id="s2">De unde vin „6 luni” și „90 de zile”</H>
            <P>Amândouă cifrele vin de la instituțiile care primesc actul. Logica e simplă: adeverința spune cum stăteai la data eliberării, iar oficiul străin vrea să știe cum stai acum. Așa că fiecare stat își pune o limită.</P>
            <P>Germania o scrie în lege. Certificatul de capacitate matrimonială își pierde efectul dacă nunta nu are loc în 6 luni de la emitere, iar dacă pe el e scris un termen mai scurt, se aplică acela (§1309 BGB). România face la fel cu străinii care se căsătoresc la noi: dovada din țara lor trebuie să fie din ultimele 3 luni, dacă nu are alt termen scris (art. 66 din Norme). De aici vin „cele 90 de zile”.</P>
            <P>Regulamentul (UE) 2016/1191 scoate apostila dintre statele membre și introduce formularele multilingve. Despre cât de vechi poate fi actul nu spune nimic. Dacă cineva îți spune că „legea europeană zice 90 de zile”, cere-i textul.</P>

            <H id="s3">Ce cer alte state</H>
            <P>Mai jos e doar ce am putut verifica în surse publice. Cerințele diferă de la un oficiu la altul, așa că ia de la primăria sau registrul care te căsătorește lista de acte în scris.</P>
            <InfoTable
              head={['Țara', 'Ce cer', 'Cât de nou']}
              rows={[
                ['Germania', 'Certificat de capacitate matrimonială. Dacă statul tău nu emite așa ceva, scutire de la președintele Curții de Apel regionale (OLG)', '6 luni (§1309 BGB); scutirea e tot pe 6 luni'],
                ['Franța', 'Primăria poate cere certificat de cutumă și certificat de celibat sau de capacitate; plus extras de naștere cu filiație', 'Extrasul de naștere: maximum 6 luni. Pentru celibat: întreabă primăria'],
                ['Spania', 'Certificat de capacitate sau de celibat, după legea țării tale (exemplu: Registrul Civil din Galicia)', 'Certificatul de naștere: sub 6 luni. Pentru celibat: întreabă registrul'],
                ['Italia', 'Declarația autorității din țara ta că nu există piedici la căsătorie, „nulla osta” (art. 116 Cod civil italian)', 'Nu am găsit un termen în lege. Verifică la primăria italiană'],
                ['Anglia și Țara Galilor', 'La notificarea căsătoriei: pașaport, dovada adresei și a statutului de imigrare, sentința de divorț dacă ai fost căsătorit', 'Ghidul GOV.UK nu cere certificat de celibat'],
              ]}
            />
            <P>Lista completă de acte pentru căsătoria în fiecare țară e un subiect separat, pe care îl tratăm într-un ghid viitor.</P>

            <H id="s4">Apostilă și traducere: în ce ordine</H>
            <P>În UE, de regulă, nu ai nevoie de apostilă. Ceri, odată cu adeverința, formularul standard multilingv. Îl eliberează ofițerul de stare civilă, la cerere, pentru statul membru pe care îl numești (art. 180 și 181 din Norme). Formularul nu are valoare juridică singur. Merge doar împreună cu adeverința în original și ajută ca să nu mai plătești traducere.</P>
            <P>În afara UE, ordinea contează:</P>
            <ol className="m-0 flex flex-col gap-1.5 pl-6 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">
              <li>adeverința, eliberată de starea civilă;</li>
              <li>apostila, pusă de Instituția Prefectului pe originalul adeverinței;</li>
              <li>traducerea autorizată, făcută după apostilă, ca să cuprindă și textul apostilei;</li>
              <li>legalizarea notarială a traducerii și apostila Camerei Notarilor pe ea, doar dacă statul o cere.</li>
            </ol>
            <P>Apostila și traducerea nu resetează termenul. Termenul curge de la data eliberării adeverinței, deci zilele pierdute cu ele se scad din fereastra ta. Detalii despre cine pune apostila și unde nu e nevoie de ea găsești în <A href="/ghiduri/apostila-acte-stare-civila/">ghidul despre apostila pe acte de stare civilă</A>.</P>

            <H id="s5">Când să-l comanzi</H>
            <P>Pleci de la data la care depui dosarul la oficiul străin, nu de la data nunții. Află termenul pe care îl aplică oficiul, apoi numără înapoi. Îți trebuie destule zile pentru eliberare, apostilă și traducere, dacă ai nevoie de ele, plus curier. În același timp, adeverința nu trebuie să ajungă prea veche până la depunere.</P>
            <P>Termenul legal de eliberare e de până la 30 de zile. La comenzile noastre de certificat de celibat plătite de la {PROCESSING_STATS.since}, jumătate au ajuns la client în cel mult {stats.medianDays} zile de la plată și 8 din 10 în cel mult {stats.p80Days} zile, cu apostilă, traducere și curier acolo unde au fost alese. E un eșantion mic, de {stats.done} comenzi finalizate. Pentru o fereastră de 3 luni, comanda cu 4–6 săptămâni înainte de depunere lasă loc și pentru o întârziere, și pentru termen.</P>
            <P>Nu-l comanda „ca să fie”, cu cinci-șase luni înainte, când data nunții nu e încă sigură. Dacă dosarul se amână, îl plătești a doua oară.</P>

            <H id="s6">Divorț sau căsătorie neînscrise în România</H>
            <P>Adeverința reflectă doar registrele românești. Dacă te-ai căsătorit sau ai divorțat în străinătate, ai obligația să ceri înscrierea mențiunii în registrele din România în 6 luni de la înregistrarea în străinătate (art. 135 din Norme). Dacă n-ai făcut-o, adeverința arată starea veche. Un divorț neînscris înseamnă „căsătorit” pe hârtie, iar oficiul străin oprește dosarul.</P>
            <P>Verifică asta înainte să comanzi. Dacă ai fost căsătorit, unele state cer în plus <A href="/certificat-de-casatorie/">certificatul de căsătorie cu mențiunea de divorț</A>.</P>

            <H id="faq">Întrebări frecvente</H>
            <FaqList items={FAQ} />

            <H id="surse">Surse</H>
            <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[15px] leading-[1.6] text-d-body">
              <li><Ext href="https://legislatie.just.ro/Public/DetaliiDocument/280597">H.G. 255/2024, pe legislatie.just.ro</Ext></li>
              <li><Ext href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/280598">Normele metodologice: art. 12, 66, 135, 180, 181 și Anexa 18</Ext></li>
              <li><Ext href="https://depabd.mai.gov.ro/Regulament_1191_2016.html">DEPABD: Regulamentul (UE) 2016/1191</Ext></li>
              <li><Ext href="https://eur-lex.europa.eu/legal-content/RO/TXT/?uri=CELEX:32016R1191">Regulamentul (UE) 2016/1191 pe EUR-Lex</Ext></li>
              <li><Ext href="https://www.gesetze-im-internet.de/bgb/__1309.html">§1309 BGB (Germania)</Ext></li>
              <li><Ext href="https://www.service-public.gouv.fr/particuliers/vosdroits/F930">service-public.gouv.fr: căsătoria în Franța</Ext></li>
              <li><Ext href="https://www.xustiza.gal/documents/d/xustiza-portal/VI-Matrimonio_civil-Instrucc-ES">Xustiza.gal: căsătoria civilă în Galicia</Ext></li>
              <li><Ext href="https://www.filodiritto.com/codici/codice-civile/capo-iii-del-matrimonio-celebrato-davanti-allufficiale-dello-stato-civile/art-116">Art. 116 Cod civil italian</Ext></li>
              <li><Ext href="https://www.gov.uk/marriages-civil-partnerships/documents-youll-need-to-give-notice">GOV.UK: actele pentru notificarea căsătoriei</Ext></li>
            </ul>
          </article>

          <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-24 lg:col-span-3 lg:col-start-10">
            <Card className="flex flex-col gap-2.5 rounded-2xl p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Cuprins</span>
              {TOC.map(([id, t]) => (
                <a key={id} href={`#${id}`} className="text-[14px] leading-[1.4] text-d-ink hover:text-d-acc">{t}</a>
              ))}
            </Card>
            <div className="flex flex-col gap-3 rounded-2xl bg-d-ink p-5 text-d-bg">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-acc">Fără drum în țară</span>
              <span className="text-[18px] font-bold leading-[1.25]">Certificatul de celibat, obținut de avocat, cu apostilă și traducere la alegere</span>
              <span className="text-[26px] font-extrabold tracking-[-0.04em]">{lei(p.basePrice)} lei</span>
              <span className="text-[13px] text-d-dark-muted">La ghișeu: gratuit sau taxă locală, dacă mergi tu.</span>
              <Link href="/comanda/certificat-celibat/" className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-d-acc text-[15px] font-bold text-d-ink hover:opacity-90">Comandă</Link>
              <Link href="/certificat-de-celibat/" className="text-center text-[13px] text-d-dark-muted underline underline-offset-2 hover:text-d-bg">Detalii, acte, opțiuni</Link>
            </div>
          </aside>
        </Section>

        <Section className="mt-16">
          <Card className="flex flex-col gap-2 p-6">
            <H2 className="sm:text-[24px]">Cine scrie aici</H2>
            <p className="m-0 text-[15px] leading-[1.6] text-d-muted">documentero.ro e un serviciu privat, nu o instituție publică și nu are legătură cu primăriile. Adeverința o eliberează serviciul de stare civilă; noi o obținem în numele tău, prin avocat. Poți să o ceri și singur, la ghișeu, gratuit sau cu taxă locală.</p>
          </Card>
        </Section>

        <RelatedServices
          title="Citește și"
          items={[
            ['Certificat de celibat', 'Ce e, cine îl poate cere, cât costă și cum îl obținem din străinătate.', '/certificat-de-celibat/'],
            ['Apostila pe acte de stare civilă', 'Unde nu mai e nevoie de ea și cine o pune pe original.', '/ghiduri/apostila-acte-stare-civila/'],
            ['Procură din străinătate', 'Notar, consulat sau avocat: trei căi ca să ceară cineva în locul tău.', '/ghiduri/procura-din-strainatate-notar-consulat-avocat/'],
          ]}
        />
      </main>
    </>
  );
}
