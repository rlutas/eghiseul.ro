import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, FaqList, H2, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroArticleGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei, optionPrice } from '@/lib/documentero/services';
import { GUIDES, guideHref } from '@/lib/documentero/content';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const SLUG = 'apostila-acte-stare-civila';
const PATH = `/ghiduri/${SLUG}/`;
const TITLE = 'Apostila de la Haga pe acte de stare civilă: când e nevoie și când nu';
// <title> and meta description stay within 60 / 155 characters.
const META_TITLE = 'Apostila pe acte de stare civilă: când e nevoie și unde';
const META_DESCRIPTION =
  'În UE certificatul de stare civilă nu mai cere apostilă. În afara UE o pune Prefectura, gratuit. Cine o cere, pe ce act și în ce ordine cu traducerea.';
const DESCRIPTION =
  'În UE nu mai ai nevoie de apostilă pe certificatul de naștere sau de căsătorie. În afara UE, apostila o pune Prefectura, pe original, iar pe traducerea legalizată o pune Camera Notarilor. Cine o cere, în ce ordine, cât durează și cât costă.';
const DATE_PUBLISHED = '2026-09-20';
const DATE_MODIFIED = '2026-10-06';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: META_TITLE,
  description: META_DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/curier-livrare-plic.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'Ce este apostila, pe scurt'],
  ['s2', 'Cine pune apostila, pe ce act'],
  ['s3', 'În UE: nu mai e nevoie'],
  ['s4', 'În afara UE: apostila pe original'],
  ['s5', 'Ordinea: apostilă, traducere, legalizare'],
  ['s6', 'Dacă locuiești în străinătate'],
  ['s7', 'Cât durează și cât costă'],
  ['s8', 'Țări care nu acceptă apostila'],
  ['faq', 'Întrebări frecvente'],
  ['surse', 'Surse'],
] as const;

const FAQ = [
  {
    q: 'Apostila se plătește la Prefectură?',
    a: 'Nu. Taxele pentru apostila pe actele administrative au fost eliminate de la 1 februarie 2017, prin Legea nr. 1/2017. Plătești doar dacă trimiți pe cineva în locul tău: un avocat, un intermediar, curierul.',
  },
  {
    q: 'Trebuie să merg la Prefectura din județul în care m-am născut?',
    a: 'Nu neapărat. Instrucțiunile Ministerului Afacerilor Interne pentru apostilă permit ca cererea pentru certificatele de stare civilă să fie depusă la orice instituție a prefectului din țară. Certificatul trebuie să existe deja; Prefectura nu eliberează duplicate.',
  },
  {
    q: 'Pot pune apostila pe o copie legalizată a certificatului?',
    a: 'Prefectura apostilează originalul certificatului. Pe o copie legalizată sau pe o traducere legalizată, apostila o pune Camera Notarilor Publici în a cărei rază lucrează notarul care a făcut legalizarea. Sunt două proceduri diferite, la două instituții diferite.',
  },
  {
    q: 'În Italia mi se cere apostilă pe certificatul de naștere. E corect?',
    a: 'Pentru o instituție dintr-un stat membru UE, Regulamentul (UE) 2016/1191 scutește certificatul românesc de stare civilă de apostilă. Arată-le regulamentul. Dacă insistă, de exemplu într-o procedură de cetățenie, e mai simplu să comanzi apostila decât să pierzi termenul.',
  },
  {
    q: 'Apostila confirmă că datele din certificat sunt adevărate?',
    a: 'Nu. Apostila confirmă doar semnătura, calitatea celui care a semnat și ștampila de pe act. Ce scrie în certificat rămâne răspunderea oficiului de stare civilă care l-a emis.',
  },
  {
    q: 'Cine poate depune cererea în locul meu?',
    a: 'Soțul sau soția, o rudă până la gradul al doilea, o persoană cu procură notarială sau un avocat cu împuternicire avocațială. O procură făcută în străinătate trebuie tradusă și legalizată ca să fie primită.',
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

export default async function GhidApostilaPage() {
  const nastere = await getServicePricing('certificat-nastere');
  const extras = await getServicePricing('extras-multilingv-certificat-nastere');
  const apostila = optionPrice(nastere, 'apostila_haga', 198);
  const traducere = optionPrice(nastere, 'traducere', 178.5);
  const legalizare = optionPrice(nastere, 'legalizare', 99);
  const apostilaNotari = optionPrice(nastere, 'apostila_notari', 83.3);

  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: '/images/documentero/curier-livrare-plic.webp',
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Apostila pe acte de stare civilă', path: PATH }],
    faq: FAQ,
  });
  const related = GUIDES.filter((g) => g.published && g.slug !== SLUG).slice(0, 3);

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
              <span className="text-d-ink">Apostila pe acte de stare civilă</span>
            </nav>
            <Eyebrow>Diaspora · 9 minute de citit</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[54px]">{TITLE}</h1>
            <p className="m-0 text-[18px] leading-[1.55] text-d-muted sm:text-[20px]">{DESCRIPTION}</p>
            <div className="flex items-center gap-3.5 border-y border-d-line py-4">
              <Image src={SITE_AUTHOR.photo} alt={SITE_AUTHOR.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold">
                  <a href={SITE_AUTHOR.url} className="hover:underline">{SITE_AUTHOR.name}</a>, fondator eghiseul.ro și documentero.ro
                </span>
                <span className="text-[13px] text-d-muted">Publicat 20 septembrie 2026 · actualizat 6 octombrie 2026 · procedura verificată cu avocatul nostru, Baroul Satu Mare</span>
              </div>
            </div>
            <div className="h-[240px] overflow-hidden rounded-[20px] sm:h-[380px]">
              <Image src="/images/documentero/curier-livrare-plic.webp" alt="Plicul cu actul apostilat, predat de curier" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <H id="s1">Ce este apostila, pe scurt</H>
            <P>Apostila e o mențiune standard, stabilită prin Convenția de la Haga din 5 octombrie 1961, care confirmă că semnătura și ștampila de pe un act public sunt autentice. Nu spune nimic despre conținutul actului. Spune doar că actul vine de la o autoritate reală din România. O autoritate dintr-un alt stat semnatar al convenției acceptă actul apostilat fără alte legalizări. România a aderat prin Ordonanța nr. 66/1999, aprobată prin Legea nr. 52/2000.</P>
            <P>Fizic, apostila e o filă atașată actului, cu o ștampilă pusă peste locul în care fila se unește cu actul, ca să nu poată fi mutată pe alt document.</P>

            <H id="s2">Cine pune apostila, pe ce act</H>
            <P>În România nu există un singur birou de apostilă. Instituția depinde de cine a emis actul:</P>
            <div className="overflow-x-auto rounded-2xl border border-d-line">
              <table className="w-full min-w-[520px] text-left text-[15px]">
                <thead className="bg-d-card text-[13px] uppercase tracking-[0.04em] text-d-muted">
                  <tr><th className="px-4 py-3">Actul</th><th className="px-4 py-3">Cine pune apostila</th></tr>
                </thead>
                <tbody className="divide-y divide-d-line">
                  <tr><td className="px-4 py-3">Certificat de naștere, de căsătorie, de deces, adeverința de celibat, extrasul multilingv (originalul)</td><td className="px-4 py-3">Instituția Prefectului</td></tr>
                  <tr><td className="px-4 py-3">Alte acte administrative, de exemplu certificatul de cazier judiciar sau dovezile de domiciliu și de cetățenie</td><td className="px-4 py-3">Instituția Prefectului</td></tr>
                  <tr><td className="px-4 py-3">Copia legalizată sau traducerea legalizată a unui certificat, procura, declarația dată la notar</td><td className="px-4 py-3">Camera Notarilor Publici în a cărei rază lucrează notarul care a făcut actul</td></tr>
                </tbody>
              </table>
            </div>
            <P>La certificatele de stare civilă există o înlesnire: cererea se poate depune la orice prefectură din țară, nu doar în județul în care s-a emis actul. Regula pentru restul actelor administrative e alta, așa că întreabă înainte dacă ai și alte documente în același dosar.</P>

            <H id="s3">În UE: nu mai e nevoie</H>
            <P>De la 16 februarie 2019, Regulamentul (UE) 2016/1191 scoate apostila pentru documentele publice despre naștere, nume, căsătorie (inclusiv capacitatea de a te căsători și starea civilă), divorț, parteneriat înregistrat și deces, atunci când sunt emise de o autoritate dintr-un stat membru și prezentate unei autorități din alt stat membru. Un certificat de naștere românesc e acceptat fără apostilă în Italia, Spania, Germania sau Franța.</P>
            <P>Pentru traducere, regulamentul a introdus formularul standard multilingv. Îl ceri de la același oficiu de stare civilă, se atașează la certificat și ține loc de traducere în multe situații. Nu circulă singur, ci doar împreună cu actul. Pentru UE, <A href="/extras-multilingv/">extrasul multilingv</A> e de obicei drumul cel mai scurt: fără apostilă și, de cele mai multe ori, fără traducere.</P>
            <P>Regulamentul nu se aplică actelor folosite în afara UE și nu obligă un stat să recunoască efectele juridice ale unui act, ci doar autenticitatea lui. Unele consulate și instanțe cer totuși apostila, mai ales în dosare de cetățenie. Când nu ești sigur, cere lista de acte în scris de la instituția care te-a trimis după ele.</P>

            <H id="s4">În afara UE: apostila pe original</H>
            <P>Pentru Regatul Unit, Elveția, Norvegia, Statele Unite, Canada sau Australia, toate semnatare ale Convenției de la Haga, apostila rămâne necesară. Se pune pe originalul certificatului. Pentru Elveția, Turcia sau Republica Moldova verifică întâi dacă nu îți ajunge extrasul multilingv emis după Convenția CIEC de la Viena din 1976, pe care aceste state îl acceptă. Cu unele state, România are tratate de asistență juridică prin care actele circulă fără nicio formalitate.</P>
            <P>Cererea o poate depune titularul, soțul sau soția, o rudă până la gradul al doilea, o persoană cu procură notarială sau un avocat cu împuternicire avocațială. Avocatul nostru o depune în baza împuternicirii pe care o semnezi pe telefon, în aceeași comandă cu certificatul.</P>
            <P>Prefecturile pot refuza apostila pe certificatele vechi, tipizate, completate de mână sau deteriorate. În practică se cere întâi un duplicat, apoi apostila pe duplicat. De asta le comandăm împreună. Despre cum recunoști un certificat vechi și dacă mai e valabil, vezi <A href="/ghiduri/certificat-de-nastere-vechi-tipizat/">ghidul despre certificatele tipizate</A>.</P>

            <H id="s5">Ordinea: apostilă, traducere, legalizare</H>
            <P>Instituțiile din afara UE cer de obicei certificatul apostilat plus o traducere autorizată în limba lor. Ordinea contează, pentru că traducerea trebuie să cuprindă și textul apostilei:</P>
            <ol className="m-0 flex list-decimal flex-col gap-2 pl-6 text-[17px] leading-[1.6] text-d-body sm:text-[18px]">
              <li>Apostila Prefecturii pe originalul certificatului.</li>
              <li>Traducerea autorizată a certificatului împreună cu apostila.</li>
              <li>Legalizarea traducerii la notar, dacă instituția o cere.</li>
              <li>Apostila Camerei Notarilor pe traducerea legalizată, dacă instituția cere apostilă și pe traducere.</li>
            </ol>
            <P>Mulți se opresc la pasul 2 sau 3. Pașii 3 și 4 îi faci doar dacă îi cere explicit instituția, altfel plătești pentru ceva ce nu se verifică. Unele state preferă traducerea făcută de un traducător autorizat la ele; și asta reiese din lista de acte primită.</P>

            <H id="s6">Dacă locuiești în străinătate</H>
            <P>Apostila nu se pune la consulat. O pune o prefectură din România, deci cineva trebuie să depună originalul aici. Ai trei variante:</P>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-6 text-[17px] leading-[1.6] text-d-body sm:text-[18px]">
              <li>o rudă până la gradul al doilea ridică certificatul și îl duce la Prefectură;</li>
              <li>o altă persoană, cu procură notarială; o procură făcută la un notar străin trebuie tradusă și legalizată, iar cea de la consulat se folosește direct (vezi <A href="/ghiduri/procura-din-strainatate-notar-consulat-avocat/">ghidul despre procura din străinătate</A>);</li>
              <li>un avocat, cu împuternicire avocațială semnată online, fără procură și fără drum la consulat. Asta facem noi.</li>
            </ul>
            <P>Originalul apostilat îți vine apoi prin curier internațional, cu număr de urmărire pe email.</P>

            <H id="s7">Cât durează și cât costă</H>
            <P>La Prefectură, apostila e gratuită: taxele de 22 de lei și de 3 lei pentru înregistrarea cererii au fost eliminate de la 1 februarie 2017, prin Legea nr. 1/2017. Instrucțiunile nu fixează un termen; cererile se rezolvă după programul și volumul fiecărui birou, de multe ori în aceeași zi sau în câteva zile lucrătoare.</P>
            <P>{`Prin documentero.ro, apostila Prefecturii pe original costă ${lei(apostila)} lei în plus față de certificat, cu depunerea și ridicarea incluse. Traducerea autorizată costă ${lei(traducere)} lei, legalizarea notarială ${lei(legalizare)} lei, iar apostila Camerei Notarilor pe traducere ${lei(apostilaNotari)} lei. Extrasul multilingv, alternativa pentru UE, costă ${lei(extras.basePrice)} lei și nu are nevoie de apostilă.`}</P>
            <P>Termenul total e dat de certificat, nu de apostilă: până la 30 de zile legale pentru duplicat, apoi apostila și traducerea, dacă le alegi, apoi curierul. Pentru străinătate trimitem prin DHL Express sau Poșta Română.</P>

            <H id="s8">Țări care nu acceptă apostila</H>
            <P>Statele care nu au semnat Convenția de la Haga cer supralegalizarea. Pentru actele românești de stare civilă, actul trece pe la Ministerul Afacerilor Externe, la Direcția Consulară, apoi pe la ambasada sau consulatul statului de destinație. Supralegalizarea la MAE e gratuită, dar drumul durează mai mult, de obicei câteva săptămâni. Spune-ne țara în formular și îți confirmăm înainte de plată dacă putem face supralegalizarea sau dacă e nevoie de alt traseu.</P>
            <P>Înainte de orice, verifică dacă statul nu a aderat între timp la convenție. Lista actualizată e pe site-ul Conferinței de la Haga (HCCH), în tabelul de stare al convenției.</P>

            <H id="faq">Întrebări frecvente</H>
            <FaqList items={FAQ} />

            <H id="surse">Surse</H>
            <ul className="m-0 flex list-disc flex-col gap-2 pl-6 text-[15px] leading-[1.6] text-d-body">
              <li><Ext href="https://www.hcch.net/en/instruments/conventions/full-text/?cid=41">Convenția de la Haga din 5 octombrie 1961 (Convenția Apostilă)</Ext></li>
              <li>Ordonanța Guvernului nr. 66/1999, aprobată prin Legea nr. 52/2000, pentru aderarea României la convenție</li>
              <li>Instrucțiunile MAI privind eliberarea apostilei de către instituțiile prefectului (Monitorul Oficial nr. 799/2016): cine poate cere apostila, depunerea la orice prefectură pentru certificatele de stare civilă</li>
              <li>Legea nr. 1/2017 privind eliminarea unor taxe și tarife (taxele de apostilă, de la 1 februarie 2017)</li>
              <li>Legea nr. 36/1995 a notarilor publici, art. 138: apostila Camerei Notarilor pe actele notariale</li>
              <li><Ext href="https://eur-lex.europa.eu/legal-content/RO/TXT/?uri=CELEX:32016R1191">Regulamentul (UE) 2016/1191 privind documentele publice</Ext></li>
              <li><Ext href="https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/civil-justice/family-law/public-documents_ro">Comisia Europeană: documente publice în UE</Ext></li>
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
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-acc">Pentru UE</span>
              <span className="text-[18px] font-bold leading-[1.25]">Extrasul multilingv: fără apostilă, fără traducere</span>
              <span className="text-[26px] font-extrabold tracking-[-0.04em]">{lei(extras.basePrice)} lei</span>
              <Link href="/extras-multilingv/" className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-d-acc text-[15px] font-bold text-d-ink hover:opacity-90">Vezi extrasul</Link>
            </div>
            <Card className="flex flex-col gap-2 rounded-2xl p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">În afara UE</span>
              <span className="text-[16px] font-bold leading-[1.3]">Certificat + apostilă, dintr-o singură comandă</span>
              <Link href="/certificat-de-nastere/" className="text-[14px] font-semibold text-d-ink underline underline-offset-4 hover:text-d-acc">Certificat de naștere</Link>
              <Link href="/certificat-de-casatorie/" className="text-[14px] font-semibold text-d-ink underline underline-offset-4 hover:text-d-acc">Certificat de căsătorie</Link>
              <Link href="/certificat-de-celibat/" className="text-[14px] font-semibold text-d-ink underline underline-offset-4 hover:text-d-acc">Certificat de celibat</Link>
            </Card>
          </aside>
        </Section>

        <Section className="mt-20 flex flex-col gap-5">
          <H2 className="sm:text-[28px]">Citește și</H2>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((g) => (
              <Link key={g.slug} href={guideHref(g) ?? '/ghiduri/'} className="flex flex-col gap-2 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
                <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-d-acc">{g.category}</span>
                <span className="text-[18px] font-bold leading-[1.25]">{g.title}</span>
              </Link>
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
