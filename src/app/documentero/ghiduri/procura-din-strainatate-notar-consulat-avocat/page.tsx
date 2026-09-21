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

const SLUG = 'procura-din-strainatate-notar-consulat-avocat';
const PATH = `/ghiduri/${SLUG}/`;
const TITLE = 'Procură din străinătate pentru acte de stare civilă: notar, consulat sau avocat';
const DESCRIPTION =
  'Ești plecat și ai nevoie de certificatul de naștere, de căsătorie sau de celibat din România. Trei căi ca să ceară cineva în locul tău: procura la notarul de acolo, procura la consulat, împuternicirea avocațială. Ce costă, cât durează, ce poate merge prost.';
const DATE_PUBLISHED = '2026-09-21';
const DATE_MODIFIED = '2026-09-21';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/client-acasa-certificat.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'De ce ai nevoie de cineva în locul tău'],
  ['s2', 'Calea 1: procura la notarul din străinătate'],
  ['s3', 'Calea 2: procura la consulatul României'],
  ['s4', 'Calea 3: împuternicirea avocațială'],
  ['s5', 'Comparația, pe scurt'],
  ['s6', 'Ce poate merge prost'],
  ['s7', 'Ce faci cu documentul după ce ajunge la tine'],
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

export default async function GhidProcuraPage() {
  const nastere = await getServicePricing('certificat-nastere');
  const celibat = await getServicePricing('certificat-celibat');
  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: '/images/documentero/client-acasa-certificat.webp',
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Procură din străinătate', path: PATH }],
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
              <span className="text-d-ink">Procură din străinătate</span>
            </nav>
            <Eyebrow>Diaspora · 7 minute de citit</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[54px]">{TITLE}</h1>
            <p className="m-0 text-[18px] leading-[1.55] text-d-muted sm:text-[20px]">{DESCRIPTION}</p>
            <div className="flex items-center gap-3.5 border-y border-d-line py-4">
              <Image src={SITE_AUTHOR.photo} alt={SITE_AUTHOR.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold">
                  <a href={SITE_AUTHOR.url} className="hover:underline">{SITE_AUTHOR.name}</a>, fondator eghiseul.ro și documentero.ro
                </span>
                <span className="text-[13px] text-d-muted">Actualizat {fmtDateRo(DATE_MODIFIED)} · procedura verificată cu <Link href="/despre/" className="underline underline-offset-2 hover:text-d-acc">av. {LAWYER.name}, Baroul Satu Mare</Link></span>
              </div>
            </div>
            <div className="h-[240px] overflow-hidden rounded-[20px] sm:h-[380px]">
              <Image src="/images/documentero/client-acasa-certificat.webp" alt="Clientă în străinătate, cu certificatul primit prin curier" width={1152} height={928} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <Card className="flex flex-col gap-2 border-l-4 border-l-d-acc p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
              <P>Actele de stare civilă din România (certificat de naștere, de căsătorie, adeverința de celibat, extrasul multilingv) se eliberează titularului sau unei persoane împuternicite. Din străinătate ai trei căi: procură la un notar de acolo (apoi apostilă și traducere), procură la consulatul României (programare, apoi tot un om în țară care să depună) sau împuternicire avocațială ({LEGAL_BASIS.short}), semnată electronic, cu care avocatul depune și ridică fără să ai pe nimeni în România.</P>
            </Card>

            <H id="s1">De ce ai nevoie de cineva în locul tău</H>
            <P>Primăria nu trimite certificate prin poștă la cerere prin email și nu eliberează nimic unui străin de dosar. Certificatul se dă titularului, părintelui pentru minor, sau unei persoane cu împuternicire. Consulatul poate prelua cererea, dar nu o rezolvă el: o trimite la primăria din România și așteaptă răspunsul, de regulă 30–60 de zile, după o programare pe care în Italia, Spania sau Regatul Unit o prinzi cu săptămâni înainte. De aici întrebarea pe care o primim cel mai des de la diaspora: „pe cine împuternicesc și cum?”.</P>

            <H id="s2">Calea 1: procura la notarul din străinătate</H>
            <P>Mergi la un notar din țara unde locuiești și faci o procură specială pentru „obținerea duplicatului certificatului de naștere” (sau ce act îți trebuie), pe numele unei rude sau al unui prieten din România. Procura străină nu e valabilă în România așa cum e: are nevoie de apostilă (în statele Convenției de la Haga) sau de supralegalizare, apoi de traducere autorizată în română, făcută în România sau de un traducător recunoscut. Abia atunci persoana împuternicită merge la primărie.</P>
            <UL items={[
              'Costă: onorariul notarului străin (în Italia sau Germania, de regulă 50–150 de euro), apostila, traducerea.',
              'Durează: drumul la notar, apostila (de la o zi la două săptămâni, după țară), curierul cu originalul spre România, traducerea, drumul rudei la primărie.',
              'Depinde de: un om din țară care are timp, buletin valabil și răbdare la ghișeu.',
            ]} />

            <H id="s3">Calea 2: procura la consulatul României</H>
            <P>Consulatul român face procuri notariale în română, deci sare peste apostilă și traducere. Prinzi însă programarea: în orașele mari, sistemul de programări e plin cu săptămâni înainte, iar pentru o procură trebuie să te prezinți personal, cu actul de identitate. Procura consulară pleacă apoi tot în România, la ruda sau prietenul care merge la primărie. Unele consulate primesc direct și cererea de duplicat, dar tot ele o trimit la primăria din țară, cu așteptarea de 30–60 de zile.</P>
            <UL items={[
              'Costă: taxa consulară, mică sau zero pentru multe acte.',
              'Durează: programarea (săptămâni), drumul la consulat, curierul spre România, drumul rudei la primărie.',
              'Depinde de: programare și de un om în țară.',
            ]} />

            <H id="s4">Calea 3: împuternicirea avocațială</H>
            <P>Legea 119/1996 (art. 10) permite ca certificatele de stare civilă să fie cerute și de un avocat, în baza împuternicirii avocațiale, iar Legea 51/1995 și Statutul profesiei îi dau împuternicirii forța necesară în fața instituțiilor. Practic: semnezi un contract de asistență juridică și împuternicirea, electronic, în formularul nostru, de pe telefon; avocatul depune cererea la primăria competentă, ridică documentul și ți-l trimite prin curier oriunde ești. Fără notar, fără consulat, fără rudă în țară.</P>
            <UL items={[
              `Costă: ${lei(nastere.basePrice)} lei pentru duplicatul de naștere sau de căsătorie, ${lei(celibat.basePrice)} lei pentru certificatul de celibat, cu TVA, plus curierul la final.`,
              'Durează: semnezi în 5 minute; depunerea a doua zi lucrătoare; termenul legal de eliberare de cel mult 30 de zile; curier 3–7 zile în UE.',
              'Depinde de: un act de identitate valabil și de datele corecte ale actului.',
            ]} />
            <P>Fiecare împuternicire și fiecare contract primesc un număr din registrul Baroului, deci primăria vede exact cine depune și în ce temei. Cine depune pentru tine: <A href="/despre/">avocata noastră, Tarța Ana Gabriela, Baroul Satu Mare</A>.</P>

            <H id="s5">Comparația, pe scurt</H>
            <InfoTable
              head={['', 'Notar în străinătate', 'Consulat', 'Avocat (noi)']}
              rows={[
                ['Drumuri pe care le faci tu', 'notar + poștă', 'consulat, cu programare', 'niciunul; semnezi pe telefon'],
                ['Apostilă și traducere pe procură', 'da, amândouă', 'nu', 'nu'],
                ['Om în România care să depună', 'da, obligatoriu', 'da, sau consulatul trimite cererea', 'nu; depune avocatul'],
                ['Cost estimat', '50–150 € + apostilă + traducere', 'taxă consulară mică', `${lei(nastere.basePrice)} lei, tot inclus`],
                ['Timp până depune cineva la primărie', '2–4 săptămâni', '3–8 săptămâni (programarea)', '1–2 zile lucrătoare'],
                ['Cine ridică și trimite', 'ruda', 'ruda sau consulatul', 'avocatul; curier oriunde'],
              ]}
            />

            <H id="s6">Ce poate merge prost</H>
            <UL items={[
              'Procura e generală, nu specială. Primăria vrea să scrie în ea exact actul cerut. O procură „pentru orice acte” se refuză des.',
              'Apostila lipsește sau e pe copie, nu pe original. Procura străină fără apostilă nu se acceptă.',
              'Ruda are buletinul expirat sau nu are timp. Cererea stă.',
              'Actul tău de identitate e expirat. Nicio cale nu merge fără act valabil; pașaportul valabil salvează situația.',
              'Datele actului sunt scrise altfel în pașaportul străin (nume fără diacritice, altă dată). Îți spunem înainte de plată dacă vedem o diferență; uneori e nevoie de rectificare, nu de duplicat.',
              'Te-ai născut în străinătate și nu ai avut niciodată act românesc: atunci nu e duplicat, e transcriere, altă procedură.',
            ]} />

            <H id="s7">Ce faci cu documentul după ce ajunge la tine</H>
            <P>Dacă îl folosești într-un stat UE, cere de la început <A href="/extras-multilingv/">extrasul multilingv</A>: instituțiile din Uniune îl acceptă fără traducere și fără apostilă. În afara UE, duplicatul are nevoie de <A href="/ghiduri/apostila-acte-stare-civila/">apostilă</A> pe original și de traducere; le facem noi, în ordinea corectă, înainte să plece curierul. Pentru căsătoria în străinătate, lângă certificatul de naștere ți se cere și <A href="/certificat-de-celibat/">certificatul de celibat</A>, valabil 6 luni în România și de regulă 90 de zile pentru instituțiile străine, deci comandă-l când știi data depunerii dosarului.</P>
          </article>

          <aside className="flex flex-col gap-5 self-start lg:sticky lg:top-24 lg:col-span-3 lg:col-start-10">
            <Card className="flex flex-col gap-2.5 rounded-2xl p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Cuprins</span>
              {TOC.map(([id, t]) => (
                <a key={id} href={`#${id}`} className="text-[14px] leading-[1.4] text-d-ink hover:text-d-acc">{t}</a>
              ))}
            </Card>
            <div className="flex flex-col gap-3 rounded-2xl bg-d-ink p-5 text-d-bg">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-acc">Fără om în țară</span>
              <span className="text-[18px] font-bold leading-[1.25]">Avocatul depune cu împuternicirea semnată pe telefon</span>
              <div className="flex flex-col gap-1.5 text-[14px]">
                <Link href="/certificat-de-nastere/" className="underline underline-offset-2 hover:text-d-acc">Certificat de naștere · {lei(nastere.basePrice)} lei</Link>
                <Link href="/certificat-de-casatorie/" className="underline underline-offset-2 hover:text-d-acc">Certificat de căsătorie</Link>
                <Link href="/certificat-de-celibat/" className="underline underline-offset-2 hover:text-d-acc">Certificat de celibat · {lei(celibat.basePrice)} lei</Link>
                <Link href="/extras-multilingv/" className="underline underline-offset-2 hover:text-d-acc">Extras multilingv</Link>
              </div>
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
