import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, H2, InfoTable, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroArticleGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { fmtDateRo, GUIDES, guideHref, LAWYER, LEGAL_BASIS } from '@/lib/documentero/content';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const SLUG = 'acte-necesare-duplicat-certificat-de-nastere';
const PATH = `/ghiduri/${SLUG}/`;
const TITLE = 'Acte necesare pentru duplicatul certificatului de naștere (2026)';
const DESCRIPTION =
  'Lista scurtă, pe cazuri: pentru tine, pentru copil, prin avocat, din străinătate. Ce nu îți cere nimeni, ce te întoarce de la ghișeu, și unde depui în București, pe sectoare.';
const DATE_PUBLISHED = '2026-09-21';
const DATE_MODIFIED = '2026-09-21';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/certificat-pe-masa.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'Lista scurtă'],
  ['s2', 'Pentru copilul minor'],
  ['s3', 'Prin avocat sau cu procură'],
  ['s4', 'Din străinătate'],
  ['s5', 'Ce NU ți se cere'],
  ['s6', 'Ce te întoarce de la ghișeu'],
  ['s7', 'În București: sectoarele'],
  ['s8', 'Cât costă și cât durează'],
] as const;

function H(props: { id: string; children: string }) {
  return <h2 id={props.id} className="m-0 mt-7 scroll-mt-24 text-[26px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[30px]">{props.children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="m-0 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">{children}</p>;
}
function A({ href, children }: { href: string; children: string }) {
  return <Link href={href} className="font-semibold text-d-ink underline underline-offset-2 hover:text-d-acc">{children}</Link>;
}
function UL({ items }: { items: string[] }) {
  return (
    <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">
      {items.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

export default async function GhidActeNecesarePage() {
  const p = await getServicePricing('certificat-nastere');
  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: '/images/documentero/certificat-pe-masa.webp',
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Acte necesare pentru duplicat', path: PATH }],
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
              <span className="text-d-ink">Acte necesare pentru duplicat</span>
            </nav>
            <Eyebrow>Naștere · 6 minute de citit</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[54px]">{TITLE}</h1>
            <p className="m-0 text-[18px] leading-[1.55] text-d-muted sm:text-[20px]">{DESCRIPTION}</p>
            <div className="flex items-center gap-3.5 border-y border-d-line py-4">
              <Image src={SITE_AUTHOR.photo} alt={SITE_AUTHOR.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold">
                  <a href={SITE_AUTHOR.url} className="hover:underline">{SITE_AUTHOR.name}</a>, fondator eghiseul.ro și documentero.ro
                </span>
                <span className="text-[13px] text-d-muted">Actualizat {fmtDateRo(DATE_MODIFIED)} · lista verificată cu <Link href="/despre/" className="underline underline-offset-2 hover:text-d-acc">av. {LAWYER.name}, Baroul Satu Mare</Link></span>
              </div>
            </div>
            <div className="h-[240px] overflow-hidden rounded-[20px] sm:h-[380px]">
              <Image src="/images/documentero/certificat-pe-masa.webp" alt="Certificat de naștere pe masă, cu plicul, ochelarii și pixul" width={1370} height={1148} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <Card className="flex flex-col gap-2 border-l-4 border-l-d-acc p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
              <P>Pentru duplicatul certificatului de naștere ai nevoie de un singur act: actul tău de identitate, valabil. Restul sunt date, nu hârtii: data și localitatea nașterii, numele părinților. Pentru un minor depune părintele, cu buletinul lui. Prin avocat se adaugă împuternicirea avocațială, pe care o semnezi electronic. Certificatul vechi, o copie a lui sau vreo adeverință nu se cer.</P>
            </Card>

            <H id="s1">Lista scurtă</H>
            <P>Ce ai în mână la ghișeu, sau în telefon când comanzi la noi:</P>
            <UL items={[
              'Cartea de identitate sau pașaportul, în termen de valabilitate. Originalul la ghișeu; la noi, poză față-verso.',
              'Datele nașterii: data, localitatea, județul, numele și prenumele părinților. Le ai din buletin sau din pașaport; nu trebuie dovedite cu alt act.',
              'Cererea tip, completată la ghișeu sau generată de noi din formular.',
              'Semnătura ta: pe cerere, la ghișeu; în formular, la noi.',
            ]} />
            <P>Atât. Primăria verifică datele în registrul de stare civilă, nu în hârtiile tale. De asta lista e scurtă și de asta cererea se poate depune din 2023 la orice primărie din România, nu doar la cea unde ai fost înregistrat: sistemul informatic trimite cererea acolo unde e actul.</P>

            <H id="s2">Pentru copilul minor</H>
            <UL items={[
              'Actul de identitate al părintelui care depune. Nu e nevoie de acordul sau de prezența celuilalt părinte.',
              'Datele copilului: data, localitatea nașterii, CNP-ul dacă îl știi.',
              'Copilul de peste 14 ani semnează și el cererea, alături de părinte.',
              'Tutorele sau reprezentantul legal aduce și dispoziția prin care a fost numit.',
            ]} />
            <P>Nu contează la ce părinte locuiește copilul și nici dacă părinții sunt căsătoriți. Certificatul se eliberează pe baza actului de naștere, în care ambii părinți au aceleași drepturi.</P>

            <H id="s3">Prin avocat sau cu procură</H>
            <P>Dacă nu poți merge tu, cineva depune în locul tău. Legea ({LEGAL_BASIS.long}) acceptă două forme: procura notarială specială, făcută la notar sau la consulat, și împuternicirea avocațială, pe care o dă un avocat cu care ai un contract de asistență. La procură se adaugă drumul la notar, taxa notarială și, din străinătate, apostila pe procură plus traducerea ei. La împuternicirea avocațială nu se adaugă nimic: o semnezi electronic, în formularul nostru, și avocatul depune cu ea.</P>
            <UL items={[
              'Prin avocat (noi): actul tău de identitate, poză; datele nașterii; semnătura electronică pe împuternicire și pe contract.',
              'Prin procură: actul de identitate al persoanei împuternicite, procura în original, copia actului tău de identitate.',
            ]} />
            <P>Diferența dintre cele trei drumuri, cu costuri și timp, e în <A href="/ghiduri/procura-din-strainatate-notar-consulat-avocat/">ghidul despre procura din străinătate</A>.</P>

            <H id="s4">Din străinătate</H>
            <P>Aceleași acte. Ce se schimbă e drumul: la consulat te programezi cu săptămâni înainte, iar cererea pleacă tot la primăria din România, cu 30–60 de zile de așteptare. Prin avocat, cererea intră direct la primărie, iar tu semnezi de pe telefon. Dacă certificatul îți trebuie pentru o instituție din UE, întreabă întâi dacă nu vrea de fapt <A href="/extras-multilingv/">extrasul multilingv</A>, care se acceptă fără traducere și fără apostilă. În afara UE, cere duplicatul cu <A href="/ghiduri/apostila-acte-stare-civila/">apostilă</A> și traducere.</P>

            <H id="s5">Ce NU ți se cere</H>
            <UL items={[
              'Certificatul vechi sau o copie a lui. Duplicatul se face după actul din registru, nu după certificat.',
              'Declarație la poliție că l-ai pierdut. Nu există așa ceva pentru certificate de naștere.',
              'Anunț în Monitorul Oficial. Nu se mai cere de ani buni.',
              'Certificatul de căsătorie, chiar dacă ți-ai schimbat numele. Duplicatul de naștere iese cu numele de la naștere, plus mențiunile.',
              'Adeverință de la primăria natală. Sistemul informatic o înlocuiește.',
              'Timbre fiscale. Taxa, unde există, se plătește la casierie sau online.',
            ]} />

            <H id="s6">Ce te întoarce de la ghișeu</H>
            <P>Din cererile care ni se întorc, motivele sunt aceleași, în ordinea asta:</P>
            <UL items={[
              'Buletin expirat. Primăria nu primește cereri cu act de identitate expirat. Reînnoiește-l întâi; pentru asta ai nevoie tot de certificatul de naștere, deci e cercul vicios clasic. Ieșirea: cere duplicatul cu pașaportul valabil, dacă îl ai, sau cu cartea de identitate provizorie.',
              'Cerere de duplicat pentru un act care nu există în România. Cine s-a născut în străinătate și nu a avut niciodată certificat românesc are nevoie de transcriere, altă procedură.',
              'Solicitant fără calitate: fratele, soțul, prietenul care „are certificatul vechi la el”. Fără împuternicire, nu primește nimic.',
              'Datele nașterii scrise greșit în cerere: alt an, altă comună. Verifică-le cu pașaportul înainte.',
            ]} />

            <H id="s7">În București: sectoarele</H>
            <P>Actul de naștere e păstrat de sectorul în care a fost înregistrată nașterea, de obicei sectorul maternității. Din 2023 poți depune cererea la oricare dintre cele șase direcții, sau prin avocat, fără să te intereseze care. Dacă vrei să mergi singur, instituțiile sunt acestea:</P>
            <InfoTable
              head={['Sectorul', 'Instituția', 'Site']}
              rows={[
                ['Sector 1', 'Direcția Publică de Evidență a Persoanelor și Stare Civilă Sector 1', 'dpepscs1.ro'],
                ['Sector 2', 'Direcția Publică de Evidență Persoane și Stare Civilă Sector 2', 'dpepsc.primariasector2.ro'],
                ['Sector 3', 'Direcția Generală de Evidența Persoanelor Sector 3', 'primarie3.ro'],
                ['Sector 4', 'Direcția Generală de Evidență a Persoanelor Sector 4', 'deps4.ro'],
                ['Sector 5', 'Direcția de Evidență a Persoanelor Sector 5, stare civilă', 'sector5.ro'],
                ['Sector 6', 'Direcția Locală de Evidență a Persoanelor Sector 6, Serviciul Stare Civilă', 'evidentapersoanelor6.ro'],
              ]}
            />
            <P>Toate șase lucrează cu programare online și cu ghișee aglomerate dimineața. Sectoarele 2 și 5 au calendare separate pentru stare civilă. Direcția Generală de Evidență a Persoanelor a Municipiului București (dgepmb.ro) coordonează, dar nu eliberează certificate.</P>

            <H id="s8">Cât costă și cât durează</H>
            <P>La ghișeu: 0 lei sau o taxă locală de câțiva lei, hotărâtă de consiliul local. Termenul legal e de cel mult 30 de zile; actele scanate ies în câteva zile, cele vechi se apropie de termen. Prin documentero.ro plătești {lei(p.basePrice)} lei cu TVA, pentru avocat, împuternicire, depunere, ridicare, scan pe email și pregătirea pentru curier. Cifrele noastre reale de termen sunt pe <A href="/certificat-de-nastere/">pagina duplicatului certificatului de naștere</A>.</P>
          </article>

          <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-24 lg:col-span-3 lg:col-start-10">
            <Card className="flex flex-col gap-2.5 rounded-2xl p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Cuprins</span>
              {TOC.map(([id, t]) => (
                <a key={id} href={`#${id}`} className="text-[14px] leading-[1.4] text-d-ink hover:text-d-acc">{t}</a>
              ))}
            </Card>
            <div className="flex flex-col gap-3 rounded-2xl bg-d-ink p-5 text-d-bg">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-acc">Fără drum</span>
              <span className="text-[18px] font-bold leading-[1.25]">Duplicatul, obținut de avocat și livrat acasă</span>
              <span className="text-[26px] font-extrabold tracking-[-0.04em]">{lei(p.basePrice)} lei</span>
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
