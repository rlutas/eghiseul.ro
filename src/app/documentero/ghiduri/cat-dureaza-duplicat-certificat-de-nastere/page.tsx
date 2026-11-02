import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, FaqList, H2, InfoTable, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroArticleGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { fmtDateRo, GUIDES, guideHref, LAWYER, PROCESSING_STATS } from '@/lib/documentero/content';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const SLUG = 'cat-dureaza-duplicat-certificat-de-nastere';
const PATH = `/ghiduri/${SLUG}/`;
const TITLE = 'Cât durează duplicatul certificatului de naștere și se poate mai repede?';
const DESCRIPTION =
  'Legea dă două termene: pe loc sau până la 30 de zile. De ce depinde în care intri, ce primării au regim de urgență contra taxă și cât au durat, pe etape, comenzile noastre.';
const DATE_PUBLISHED = '2026-11-02';
const DATE_MODIFIED = '2026-11-02';
const IMAGE = '/images/documentero/avocat-ghiseu-stare-civila.webp';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: 'Cât durează duplicatul certificatului de naștere (2026)',
  description: DESCRIPTION,
  path: PATH,
  ogImage: IMAGE,
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'Ce spune legea, cuvânt cu cuvânt'],
  ['s2', 'De ce la unii durează o oră și la alții o lună'],
  ['s3', 'Calendarul, pe drumuri'],
  ['s4', 'Regimul de urgență'],
  ['s5', 'Prin noi: unde se duc zilele'],
  ['s6', 'Dacă au trecut 30 de zile'],
  ['faq', 'Întrebări frecvente'],
  ['surse', 'Surse'],
] as const;

/*
 * Verificat 02.11.2026 pe textul consolidat al Normelor metodologice (H.G. 255/2024),
 * https://legislatie.just.ro/Public/DetaliiDocument/280598 :
 * - art. 162 alin. (2): certificatele eliberate la cerere „se tipăresc în prezența solicitantului sau se emit
 *   electronic odată cu depunerea cererii, ori ulterior, dacă sunt necesare verificări, într-un termen de până
 *   la 30 de zile”;
 * - art. 28 alin. (3): actele încă nevalidate în registrul electronic se verifică și se validează „în termen de
 *   3 zile, la solicitarea nominală” a serviciului care are cererea;
 * - art. 158 alin. (1): eliberează oricare S.P.C.L.E.P./primărie și misiunile diplomatice/oficiile consulare;
 *   alin. (4): cererea se înregistrează în Registrul local de intrare-ieșire; alin. (5): act de identitate
 *   expirat → eliberare după verificarea în S.N.I.E.P., iar dacă fizionomia nu corespunde, întâi act nou;
 * - art. 163 alin. (2): cererea pentru certificat pierdut/furat/deteriorat descrie împrejurările.
 * Urgență (taxe locale, nu naționale):
 * - Primăria Târgu Frumos: 100 lei / 3 ore, 50 lei / 24 de ore,
 *   https://primariatgfrumos.ro/wp-content/uploads/2023/01/Eliberare-la-cerere-a-certificatelor-de-nastere-1.pdf
 * - Orașul Târgu Ocna, HCL 137/23.12.2025, Anexa 3 lit. D: 40 lei, eliberare a doua zi,
 *   https://www.orasul-targuocna.ro/wp-content/uploads/2026/01/ANEXA-NR.3-Taxe-speciale-primarie.pdf
 * Cifrele noastre: PROCESSING_STATS (src/lib/documentero/content.ts), recalculate 02.11.2026 din orders +
 * order_history. Prețul și opțiunea de urgență: tabelele services / service_options (getServicePricing).
 */
const FAQ = [
  {
    q: 'În cât timp se eliberează certificatul de naștere pierdut?',
    a: 'La fel ca orice duplicat: pe loc, dacă actul tău de naștere e deja validat în registrul electronic, sau în cel mult 30 de zile, dacă primăria trebuie să facă verificări. Pierderea nu adaugă un termen separat. În cerere descrii doar împrejurările în care l-ai pierdut (art. 163 din Normele metodologice).',
  },
  {
    q: 'Se poate obține certificatul de naștere la urgență?',
    a: 'Doar acolo unde consiliul local a aprobat o taxă de urgență. Nu e o regulă națională. Exemple verificate: Târgu Frumos, 100 de lei pentru 3 ore sau 50 de lei pentru 24 de ore; Târgu Ocna, 40 de lei pentru eliberare a doua zi. Fiindcă poți depune la orice primărie, poți alege una care are urgență.',
  },
  {
    q: 'Cât durează la consulat?',
    a: 'Normele pun consulatele de carieră printre emitenții de certificate, deci și acolo se aplică același termen de până la 30 de zile de la depunere. Ce lungește drumul e programarea, care se face după calendarul fiecărui consulat. Întreabă la programare dacă îl tipăresc pe loc sau îți dau o dată.',
  },
  {
    q: 'Cât durează schimbarea certificatului de naștere vechi pe modelul nou?',
    a: 'E aceeași cerere ca la duplicat, deci același termen. Certificatul vechi, completat de mână, e în continuare valabil; îl schimbi doar dacă e deteriorat, plastifiat sau ți se cere unul recent.',
  },
  {
    q: 'Termenul de 30 de zile curge de la programare sau de la depunere?',
    a: 'De la depunerea cererii, când ea primește număr în registrul de intrare-ieșire al primăriei. Zilele în care aștepți o programare la ghișeu nu intră în calcul. De aceea, la primăriile aglomerate, timpul total poate fi mai lung decât termenul legal.',
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
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );
}

/** "19 zile" / "24 de zile": Romanian puts „de” after 20+ (and after 0 mod 100). */
function zile(n: number): string {
  const r = n % 100;
  return `${n} ${r === 0 || r >= 20 ? 'de ' : ''}zile`;
}

/** 12.5 → "12,5"; 19 → "19". */
function num(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n).replace('.', ',');
}

export default async function GhidCatDureazaPage() {
  const p = await getServicePricing('certificat-nastere');
  const urgent = p.options.find((o) => o.code === 'urgenta');
  const stats = PROCESSING_STATS.byService['certificat-nastere'];
  const ph = PROCESSING_STATS.phasesNastere;
  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: IMAGE,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Cât durează duplicatul', path: PATH }],
    faq: FAQ,
  });
  const related = GUIDES.filter((g) => g.published && g.slug !== SLUG && g.category === 'Naștere').slice(0, 3);

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
              <span className="text-d-ink">Cât durează duplicatul</span>
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
                <span className="text-[13px] text-d-muted">Publicat și actualizat {fmtDateRo(DATE_MODIFIED)} · cererile le depune <Link href="/despre/" className="underline underline-offset-2 hover:text-d-acc">av. {LAWYER.name}, Baroul Satu Mare</Link></span>
              </div>
            </div>
            <div className="h-[240px] overflow-hidden rounded-[20px] sm:h-[380px]">
              <Image src={IMAGE} alt="Avocată la ghișeul de stare civilă, depunând o cerere" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <Card className="flex flex-col gap-2 border-l-4 border-l-d-acc p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
              <P>Duplicatul certificatului de naștere se tipărește pe loc, la depunere, dacă actul tău e deja validat în registrul electronic de stare civilă. Dacă primăria are de făcut verificări, termenul legal e de cel mult 30 de zile (art. 162 din H.G. 255/2024). Un act vechi, încă nevalidat, se validează în 3 zile. Unele primării eliberează în 3 ore sau a doua zi, contra unei taxe locale de urgență.</P>
            </Card>

            <H id="s1">Ce spune legea, cuvânt cu cuvânt</H>
            <P>Termenul nu stă în Legea 119/1996, ci în Normele metodologice aprobate prin H.G. 255/2024, aplicate din 31 martie 2024. Articolul 162 alineatul (2) spune că certificatele cerute ulterior „se tipăresc în prezența solicitantului sau se emit electronic odată cu depunerea cererii, ori ulterior, dacă sunt necesare verificări, într-un termen de până la 30 de zile”.</P>
            <P>Deci nu există „termenul de 30 de zile” ca regulă. Regula e eliberarea pe loc. Cele 30 de zile sunt plafonul pentru cazul în care ofițerul de stare civilă trebuie să verifice ceva înainte să tipărească.</P>
            <P>A doua prevedere care contează e articolul 28 alineatul (3). Registrul electronic se construiește progresiv, din registrele de hârtie, începând cu actele cele mai noi. Un act care nu a ajuns încă să fie verificat și validat electronic se validează „în termen de 3 zile, la solicitarea nominală” a primăriei care are cererea ta. Pe scurt: dacă actul tău e vechi și nu e încă în sistem, primăria unde ai depus cere validarea, iar primăria care ține registrul de hârtie are 3 zile să o facă.</P>

            <H id="s2">De ce la unii durează o oră și la alții o lună</H>
            <P>Același act, aceeași cerere, termene foarte diferite. Ce le deosebește:</P>
            <InfoTable
              head={['Ce influențează', 'Mai repede', 'Mai încet']}
              rows={[
                ['Unde e actul tău', 'validat deja în registrul electronic', 'doar în registrul de hârtie al primăriei unde s-a întocmit; se cere validarea, încă 3 zile'],
                ['Datele din cerere', 'aceleași cu cele din act', 'altă grafie a numelui, alt an, comuna de azi în loc de cea de atunci'],
                ['Actul de identitate', 'valabil', 'expirat: primăria te verifică în evidența persoanelor; dacă poza nu mai seamănă, întâi faci buletin nou'],
                ['Cine depune', 'titularul sau părintele, cu actul în mână', 'un împuternicit cu procură făcută în străinătate, care mai are nevoie de apostilă și traducere'],
                ['Ghișeul', 'loc liber în aceeași săptămână', 'calendar de programări plin pe săptămâni'],
              ]}
            />
            <P>Ultimul rând e cel pe care îl subestimează oamenii. Termenul legal curge de la depunere. Zilele până la programare nu se văd în nicio statistică oficială, dar se văd în calendarul tău. Din 2024 poți depune la orice primărie din România, nu doar la cea unde te-ai născut, așa că o primărie mai liberă e o alegere legitimă.</P>

            <H id="s3">Calendarul, pe drumuri</H>
            <InfoTable
              head={['Drumul', 'Cât poți aștepta', 'De ce']}
              rows={[
                ['La ghișeu, act deja validat', 'pe loc sau la data de ridicare dată de primărie', 'art. 162: se tipărește în prezența ta, dacă nu sunt necesare verificări'],
                ['La ghișeu, act nevalidat', 'câteva zile, cel mult 30', '3 zile pentru validare (art. 28), plus verificările'],
                ['La ghișeu, regim de urgență', '3 ore până a doua zi', 'doar unde consiliul local a aprobat taxa'],
                ['La consulat', 'programarea, apoi același termen', 'consulatele de carieră eliberează și ele certificate (art. 158)'],
                ['Prin cineva cu procură', 'timpul procurii, apoi drumul de la ghișeu', 'din străinătate, procura are nevoie de apostilă și traducere'],
                ['Prin documentero.ro', `jumătate în cel mult ${zile(stats.medianDays)}, 8 din 10 în cel mult ${zile(stats.p80Days)}`, 'de la plată până la livrare, cu curierul inclus'],
              ]}
            />
            <P>Dacă poți merge tu, la o primărie fără coadă, cu un act deja validat, ghișeul e mai rapid decât orice serviciu. Spunem asta deschis. Avocatul are rost când nu poți ajunge la ghișeu: ești în străinătate, ești internat, ai grijă de un copil mic, sau pur și simplu nu ai o zi liberă de pierdut. Pașii, dacă alegi procura în loc de avocat, sunt în <A href="/ghiduri/procura-din-strainatate-notar-consulat-avocat/">ghidul despre procura din străinătate</A>.</P>

            <H id="s4">Regimul de urgență</H>
            <P>Urgența nu e prevăzută în legea stării civile. O introduce, sau nu, fiecare consiliu local, ca taxă locală. Certificatul în sine nu are taxă de stat; plătești doar viteza. Două exemple verificate în documentele publicate de primării:</P>
            <UL items={[
              <>Târgu Frumos (Iași): 100 de lei pentru eliberare în 3 ore, 50 de lei pentru eliberare în 24 de ore, conform <Ext href="https://primariatgfrumos.ro/wp-content/uploads/2023/01/Eliberare-la-cerere-a-certificatelor-de-nastere-1.pdf">fișei de stare civilă a primăriei</Ext>.</>,
              <>Târgu Ocna (Bacău): 40 de lei pentru un nou certificat de stare civilă eliberat a doua zi după depunere, conform <Ext href="https://www.orasul-targuocna.ro/wp-content/uploads/2026/01/ANEXA-NR.3-Taxe-speciale-primarie.pdf">H.C.L. 137 din 23.12.2025, anexa 3</Ext>. Taxa nu se percepe la înlocuirea certificatelor de tip vechi.</>,
            ]} />
            <P>Cum afli dacă primăria ta are urgență: caută pe site-ul ei hotărârea anuală privind taxele locale, la capitolul „taxe speciale”, sau întreabă la ghișeul de stare civilă. Și ține minte că urgența grăbește tipărirea, nu validarea: dacă actul tău nu e încă în registrul electronic, cele 3 zile pentru validare rămân.</P>
            <P>
              {urgent
                ? <>Prin noi, regimul de urgență costă {lei(urgent.price)} lei peste prețul duplicatului și îl alegi în formular.</>
                : <>Noi nu vindem regim de urgență la duplicatul certificatului de naștere. Cererea o depunem în regim obișnuit și nu promitem un termen pe care nu îl controlăm.</>}
            </P>

            <H id="s5">Prin noi: unde se duc zilele</H>
            <P>Am luat cele {stats.done} comenzi de duplicat de naștere plătite de la {PROCESSING_STATS.since} și finalizate până la {fmtDateRo(PROCESSING_STATS.asOf)}, pe eghiseul.ro și documentero.ro, și le-am împărțit pe etape, după istoricul fiecărei comenzi:</P>
            <UL items={[
              <>Depunerea cererii la primărie: sub {ph.fileMaxDays} zi de la plată, la toate.</>,
              <>De la depunere până când duplicatul pleacă spre tine (primăria îl eliberează, avocata îl ridică, noi îl scanăm și îl dăm curierului): între {ph.institutionMinDays} și {zile(ph.institutionMaxDays)}, cu mediana la {num(ph.institutionMedianDays)} zile.</>,
              <>Restul e drumul la tine, în țară sau în străinătate, până la închiderea comenzii.</>,
            ]} />
            <P>Total: jumătate dintre comenzi au ajuns la client în cel mult {zile(stats.medianDays)} de la plată, 8 din 10 în cel mult {zile(stats.p80Days)}. Etapa care variază e cea de la primărie, exact unde intră actele vechi și verificările de mai sus. Sunt puține comenzi, deci luați cifrele ca ordin de mărime. Le recalculăm pe măsură ce cresc.</P>
            <P>Ce primești pe parcurs: un mesaj la fiecare schimbare de stare și scanul pe email în ziua în care avocata ridică duplicatul, înainte să plece originalul. Prețul e {lei(p.basePrice)} lei, preț final, cu onorariul avocatului și TVA. Ce intră în el și ce opțiuni ai pentru străinătate e pe <A href="/certificat-de-nastere/">pagina duplicatului certificatului de naștere</A>. Dacă certificatul îți trebuie pentru o instituție dintr-un stat al Convenției CIEC nr. 16, verifică întâi dacă nu e suficient <A href="/extras-multilingv/">extrasul multilingv</A>; are același termen.</P>

            <H id="s6">Dacă au trecut 30 de zile</H>
            <P>Cererea ta are un număr. Normele cer ca fiecare cerere de certificat să fie înregistrată în registrul local de intrare-ieșire (art. 158 alin. 4). Cu numărul și data depunerii:</P>
            <UL items={[
              'Întreabă la ghișeul unde ai depus ce verificare e în curs: validarea actului, o mențiune, o neconcordanță de date.',
              'Dacă actul e vechi, întreabă dacă s-a cerut validarea la primăria care ține registrul de hârtie. Acolo poate aștepta cererea.',
              'Cere răspunsul în scris, pe email sau la registratură, cu numărul cererii.',
              'Dacă problema e o diferență între datele tale și cele din act, duplicatul nu o rezolvă. Corectarea actului e altă procedură, rectificarea.',
            ]} />
            <P>Dacă ai pierdut certificatul și încă nu ai depus cererea, începe cu <A href="/ghiduri/certificat-de-nastere-pierdut/">ce faci când ai pierdut certificatul de naștere</A> și verifică lista din <A href="/ghiduri/acte-necesare-duplicat-certificat-de-nastere/">actele necesare pentru duplicat</A>. Dacă ai certificatul vechi, completat de mână, și te întrebi dacă merită să-l schimbi, citește <A href="/ghiduri/certificat-de-nastere-vechi-tipizat/">dacă mai e valabil certificatul vechi</A>.</P>

            <H id="faq">Întrebări frecvente</H>
            <FaqList items={FAQ} />

            <H id="surse">Surse</H>
            <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[15px] leading-[1.6] text-d-body">
              <li><Ext href="https://legislatie.just.ro/Public/DetaliiDocument/280598">Normele metodologice aprobate prin H.G. 255/2024, art. 28, 158, 162, 163, pe legislatie.just.ro</Ext></li>
              <li><Ext href="https://legislatie.just.ro/Public/DetaliiDocument/185507">Legea 1/2017, eliminarea taxelor extrajudiciare de timbru, art. VI</Ext></li>
              <li><Ext href="https://depabd.mai.gov.ro/">Direcția Generală pentru Evidența Persoanelor (DGEP)</Ext></li>
              <li><Ext href="https://primariatgfrumos.ro/wp-content/uploads/2023/01/Eliberare-la-cerere-a-certificatelor-de-nastere-1.pdf">Primăria Târgu Frumos: eliberarea la cerere a certificatelor de naștere</Ext></li>
              <li><Ext href="https://www.orasul-targuocna.ro/wp-content/uploads/2026/01/ANEXA-NR.3-Taxe-speciale-primarie.pdf">Orașul Târgu Ocna: H.C.L. 137/2025, anexa 3, taxe speciale 2026</Ext></li>
              <li>Comenzile documentero.ro și eghiseul.ro, plătite de la {PROCESSING_STATS.since}, recalculate la {fmtDateRo(PROCESSING_STATS.asOf)}</li>
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
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-acc">Nu poți ajunge la ghișeu?</span>
              <span className="text-[18px] font-bold leading-[1.25]">Duplicatul, obținut de avocat și trimis prin curier</span>
              <span className="text-[26px] font-extrabold tracking-[-0.04em]">{lei(p.basePrice)} lei</span>
              <span className="text-[13px] text-d-dark-muted">Jumătate din comenzi livrate în cel mult {zile(stats.medianDays)} de la plată.</span>
              <Link href="/comanda/certificat-nastere/" className="inline-flex h-[46px] items-center justify-center rounded-[10px] bg-d-acc text-[15px] font-bold text-d-ink hover:opacity-90">Comandă</Link>
              <Link href="/certificat-de-nastere/" className="text-center text-[13px] text-d-dark-muted underline underline-offset-2 hover:text-d-bg">Detalii, acte, opțiuni</Link>
            </div>
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
