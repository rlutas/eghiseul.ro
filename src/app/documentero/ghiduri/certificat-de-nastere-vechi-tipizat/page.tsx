import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, FaqList, H2, InfoTable, RelatedServices, Section, UpdatedLine } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroArticleGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { fmtDateRo, LAWYER, LEGAL_BASIS } from '@/lib/documentero/content';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const SLUG = 'certificat-de-nastere-vechi-tipizat';
const PATH = `/ghiduri/${SLUG}/`;
const TITLE = 'Certificat de naștere vechi (model tipizat): mai e valabil în 2026?';
const DESCRIPTION =
  'Da, legea din 2024 spune expres că certificatele vechi rămân valabile. Când trebuie totuși schimbat, ce aduce modelul nou, de unde îl ceri și cum procedezi dacă locuiești în străinătate.';
const DATE_PUBLISHED = '2026-10-05';
const DATE_MODIFIED = '2026-10-05';
const IMAGE = '/images/documentero/certificat-pe-masa.webp';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: IMAGE,
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'Ce spune legea'],
  ['s2', 'Cum arată modelul nou'],
  ['s3', 'Când trebuie schimbat'],
  ['s4', 'Ce se întâmplă cu certificatul vechi'],
  ['s5', 'Cum ceri modelul nou'],
  ['s6', 'Dacă locuiești în străinătate'],
  ['faq', 'Întrebări frecvente'],
  ['surse', 'Surse'],
] as const;

const FAQ = [
  {
    q: 'Certificatul meu de naștere e din anii ’80, completat de mână. Mai e bun?',
    a: 'Da. H.G. 255/2024 nu îi pune termen și nici Legea 119/1996 nu are o regulă de expirare pentru certificate. Îl schimbi dacă e deteriorat, plastifiat sau modificat ori dacă instituția la care îl depui îți cere un exemplar eliberat recent.',
  },
  {
    q: 'Trebuie să predau certificatul vechi când îl primesc pe cel nou?',
    a: 'Normele nu au o regulă generală de predare. Ofițerul reține doar certificatele cu ștersături sau adăugiri (art. 165). Contează altceva: noul certificat de naștere îl anulează pe cel emis anterior (art. 166 alin. 2). Hârtia veche poate rămâne în sertar, dar nu o mai folosești ca act.',
  },
  {
    q: 'Pot cere modelul nou de la primăria din orașul unde locuiesc acum?',
    a: 'Da. Din 2024, art. 158 din Normele metodologice permite eliberarea de către oricare serviciu public comunitar local de evidență a persoanelor, nu doar de cel din localitatea de naștere.',
  },
  {
    q: 'Certificatul plastifiat mai e valabil?',
    a: 'Normele pun plastifierea pe aceeași listă cu pierderea și deteriorarea: în toate aceste cazuri ți se eliberează, la cerere, un certificat nou (art. 163). În practică, cel plastifiat e tratat ca un act care trebuie înlocuit.',
  },
  {
    q: 'Pot avea în același timp certificatul pe hârtie și cel electronic?',
    a: 'Da. Art. 162 alin. 3 spune că poți deține simultan ambele variante. Varianta electronică are semnătura emitentului și un cod de verificare.',
  },
  {
    q: 'Cât costă schimbarea?',
    a: 'La ghișeu e gratuită sau costă o taxă locală mică, stabilită de consiliul local. Dacă vrei să se ocupe altcineva, plătești onorariul acelei persoane sau al avocatului, nu certificatul.',
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

export default async function GhidCertificatVechiPage() {
  const p = await getServicePricing('certificat-nastere');
  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: IMAGE,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Certificat de naștere vechi', path: PATH }],
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
              <span className="text-d-ink">Certificat de naștere vechi</span>
            </nav>
            <Eyebrow>Naștere · 7 minute de citit</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[54px]">{TITLE}</h1>
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
              <Image src={IMAGE} alt="Certificat de naștere pe masă, lângă plicul în care a venit" width={1370} height={1148} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <Card className="flex flex-col gap-2 border-l-4 border-l-d-acc p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
              <P>Certificatul de naștere pe model vechi rămâne valabil. H.G. 255/2024 spune asta expres pentru certificatele eliberate după metodologiile din 1997 și din 2011, iar legea nu dă niciun termen de expirare. Ceri unul nou dacă cel vechi e deteriorat, plastifiat, are ștersături, ți-a fost reținut de o autoritate străină sau dacă instituția care îl primește vrea un exemplar recent. Îl poți cere la orice serviciu de stare civilă din țară.</P>
              <UpdatedLine date={DATE_MODIFIED} />
            </Card>

            <H id="s1">Ce spune legea</H>
            <P>Din 31 martie 2024 se aplică Normele metodologice aprobate prin H.G. 255/2024. Articolul 2 alin. (2) din hotărâre e scurt: certificatele de stare civilă eliberate după Metodologia nr. 1/1997 și după metodologia aprobată prin H.G. 64/2011 „sunt și rămân valabile”. Aceeași regulă e scrisă și pentru extrasele multilingve eliberate înainte.</P>
            <P>Pentru certificatele de dinainte de 1997, hotărârea nu are o frază separată. Nici Legea 119/1996 nu dă vreun termen de valabilitate. Ce contează juridic e actul de naștere din registru; certificatul e dovada lui. Câtă vreme datele din certificat corespund registrului, hârtia e bună, chiar dacă e completată de mână și îngălbenită.</P>

            <H id="s2">Cum arată modelul nou</H>
            <P>Modelul din Anexa 1 la Norme are codul numeric personal chiar sub titlu, iar fiecare rubrică e etichetată și în franceză, și în engleză („Certificat de naissance / Birth certificate”). Are serie și număr tipărite jos, pe hârtie specială.</P>
            <P>Mai sunt două noutăți. Certificatul poate fi eliberat și în format electronic, semnat electronic, cu sigiliul sistemului informatic de stare civilă și un cod de verificare (art. 158 alin. 1). Iar la cerere, pe verso se poate tipări traducerea într-o limbă oficială a UE (art. 158 alin. 2). Mențiunile de pe certificat nu se traduc.</P>
            <P>Termenul de la care primăriile completează registrele de stare civilă exclusiv în format digital a fost amânat de la 24 septembrie 2024 la 31 martie 2025. Actele vechi, de hârtie, intră în sistem pe măsură ce sunt scanate și validate.</P>

            <H id="s3">Când trebuie schimbat</H>
            <P>Normele enumeră situațiile în care ți se eliberează, la cerere, un certificat nou (art. 163). Le adunăm aici, plus cazurile care apar la dosarele din străinătate.</P>
            <InfoTable
              head={['Situația', 'Ce se întâmplă']}
              rows={[
                ['Deteriorat, rupt, șters', 'Ceri un certificat nou. În cerere descrii pe scurt ce s-a întâmplat cu cel vechi.'],
                ['Plastifiat', 'Plastifierea e trecută în lege lângă pierdere și deteriorare. Ceri unul nou.'],
                ['Cu adăugiri sau corecturi făcute de mână', 'Ofițerul de stare civilă îl reține și îl anulează (art. 165 alin. 2). Ai nevoie de altul.'],
                ['Reținut de o autoritate străină', 'E un caz scris explicit în art. 163. Ceri unul nou în România.'],
                ['Ți s-a schimbat numele sau starea civilă', 'Noul certificat preia mențiunile din registru. Cele eliberate anterior nu mai produc efecte (art. 162 alin. 4).'],
                ['Instituția vrea un act „recent”', 'Nu are legătură cu modelul. Un certificat din 1990 e valabil, dar nu e eliberat în ultimele luni.'],
              ]}
            />
            <P>Ultimul rând e cel mai ușor de ratat. Primăria din Franța cere, pentru căsătorie, un extras de naștere de cel mult 6 luni. Registrul civil din Galicia, în Spania, cere certificatul de naștere eliberat cu mai puțin de șase luni înainte. Certificatul tău vechi e valabil, dar nu trece de regula asta, oricât de bine ar fi păstrat. Aici nu ajută decât un exemplar eliberat recent.</P>

            <H id="s4">Ce se întâmplă cu certificatul vechi</H>
            <P>Art. 166 alin. (2) spune că eliberarea unui nou certificat de naștere îl anulează pe cel similar emis anterior. Deci din ziua în care ai certificatul nou, pe cel vechi nu-l mai folosești la nicio instituție și nu-l mai pui în dosare. Dacă îl ai în original într-un dosar depus deja, de exemplu la o bancă, nu se întâmplă nimic retroactiv. Doar că de acum înainte prezinți actul nou.</P>

            <H id="s5">Cum ceri modelul nou</H>
            <P>Din 2024, cererea se poate depune la oricare serviciu public comunitar local de evidență a persoanelor din țară (art. 158 alin. 1). Unde nu există un astfel de serviciu, la primăria comunei. Nu mai trebuie să mergi în localitatea de naștere.</P>
            <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">
              <li>Cine cere: titularul, reprezentantul legal pentru minor, o persoană cu procură specială sau un avocat cu împuternicire avocațială (art. 166 alin. 1)</li>
              <li>Ce aduci: actul de identitate în termen de valabilitate; dacă ți-a expirat, ofițerul verifică datele în evidența persoanelor sau îți spune să-ți faci întâi buletinul (art. 158 alin. 5)</li>
              <li>Certificatul vechi, dacă îl mai ai, ca să se vadă de ce ceri unul nou</li>
              <li>Cererea, completată la ghișeu, cu motivul: deteriorat, plastifiat, reținut</li>
            </ul>
            <P>Termenul: certificatul se tipărește pe loc sau, dacă sunt necesare verificări, în cel mult 30 de zile (art. 162 alin. 2). La acte vechi, nescanate, verificarea înseamnă căutarea în registrul de hârtie al primăriei care l-a întocmit. Asta lungește lucrurile, nu modelul.</P>

            <H id="s6">Dacă locuiești în străinătate</H>
            <P>Ai trei variante. Prima e consulatul: Normele pun misiunile diplomatice și oficiile consulare de carieră printre emitenții de certificate. Rămâne de văzut cât de repede găsești o programare acolo unde locuiești.</P>
            <P>A doua e procura specială pentru cineva din țară, făcută la un notar local sau la consulat. Pașii, cu apostilă și traducere, sunt în <A href="/ghiduri/procura-din-strainatate-notar-consulat-avocat/">ghidul despre procura din străinătate</A>. A treia e împuternicirea avocațială, pe temeiul {LEGAL_BASIS.short}: o semnezi pe telefon, iar avocatul depune cererea și ridică certificatul. Asta face serviciul nostru de <A href="/certificat-de-nastere/">duplicat certificat de naștere</A>.</P>
            <P>Înainte să alegi, întreabă instituția străină ce vrea de fapt. În UE se poate să nu aibă nevoie de certificatul nou: <A href="/extras-multilingv/">extrasul multilingv</A> sau formularul standard multilingv din Regulamentul (UE) 2016/1191 înlocuiesc traducerea. În afara UE, certificatul nou primește <A href="/ghiduri/apostila-acte-stare-civila/">apostila</A> de la Prefectură. Iar dacă certificatul nu mai e deloc de găsit, citește <A href="/ghiduri/certificat-de-nastere-pierdut/">ce faci cu un certificat de naștere pierdut</A>.</P>

            <H id="faq">Întrebări frecvente</H>
            <FaqList items={FAQ} />

            <H id="surse">Surse</H>
            <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[15px] leading-[1.6] text-d-body">
              <li><Ext href="https://legislatie.just.ro/Public/DetaliiDocument/280597">H.G. 255/2024, art. 2 alin. (2), pe legislatie.just.ro</Ext></li>
              <li><Ext href="https://legislatie.just.ro/Public/DetaliiDocumentAfis/280598">Normele metodologice, art. 158, 162, 163, 165, 166 și Anexa 1</Ext></li>
              <li><Ext href="https://www.juridice.ro/775122/se-modifica-termenele-pentru-implementarea-normelor-de-stare-civila-in-format-digital.html">Termenul pentru registrele digitale (juridice.ro, 17.03.2025)</Ext></li>
              <li><Ext href="https://depabd.mai.gov.ro/Regulament_1191_2016.html">DEPABD: Regulamentul (UE) 2016/1191 și formularele multilingve</Ext></li>
              <li><Ext href="https://www.service-public.gouv.fr/particuliers/vosdroits/F930">service-public.gouv.fr: actele cerute la căsătorie în Franța</Ext></li>
              <li><Ext href="https://www.xustiza.gal/documents/d/xustiza-portal/VI-Matrimonio_civil-Instrucc-ES">Xustiza.gal: actele pentru căsătoria civilă în Galicia</Ext></li>
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
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-acc">Model nou, fără drum</span>
              <span className="text-[18px] font-bold leading-[1.25]">Certificatul nou, obținut de avocat și trimis prin curier</span>
              <span className="text-[26px] font-extrabold tracking-[-0.04em]">{lei(p.basePrice)} lei</span>
              <span className="text-[13px] text-d-dark-muted">La ghișeu: gratuit sau taxă locală, dacă mergi tu.</span>
              <Link href="/comanda/certificat-nastere/" className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-d-acc text-[15px] font-bold text-d-ink hover:opacity-90">Comandă</Link>
              <Link href="/certificat-de-nastere/" className="text-center text-[13px] text-d-dark-muted underline underline-offset-2 hover:text-d-bg">Detalii, acte, opțiuni</Link>
            </div>
          </aside>
        </Section>

        <Section className="mt-16">
          <Card className="flex flex-col gap-2 p-6">
            <H2 className="sm:text-[24px]">Cine scrie aici</H2>
            <p className="m-0 text-[15px] leading-[1.6] text-d-muted">documentero.ro e un serviciu privat, nu o instituție publică și nu are legătură cu primăriile. Certificatul îl eliberează serviciul de stare civilă; noi îl obținem în numele tău, prin avocat. Poți să-l ceri și singur, la ghișeu, gratuit sau cu taxă locală.</p>
          </Card>
        </Section>

        <RelatedServices
          title="Citește și"
          items={[
            ['Certificat de naștere pierdut', 'Pașii, actele și termenul real când nu mai ai deloc certificatul.', '/ghiduri/certificat-de-nastere-pierdut/'],
            ['Acte necesare pentru duplicat', 'Lista pe cazuri: pentru tine, pentru copil, prin avocat.', '/ghiduri/acte-necesare-duplicat-certificat-de-nastere/'],
            ['Duplicat certificat de naștere', 'Modelul nou, obținut de avocat și livrat oriunde.', '/certificat-de-nastere/'],
          ]}
        />
      </main>
    </>
  );
}
