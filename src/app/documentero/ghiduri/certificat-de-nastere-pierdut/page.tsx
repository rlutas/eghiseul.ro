import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, H2, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroArticleGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { GUIDES, guideHref } from '@/lib/documentero/content';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/certificat-de-nastere-pierdut/';
const TITLE = 'Certificat de naștere pierdut: ce faci în 2026';
const DESCRIPTION = 'Nu te duci la poliție, nu te duci neapărat în orașul natal și nu plătești taxă de stat. Unde se cere duplicatul, ce acte trebuie, cât durează de fapt, ce faci din străinătate.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-19';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/avocat-ghiseu-stare-civila.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'Ce NU trebuie să faci'],
  ['s2', 'Unde se cere duplicatul'],
  ['s3', 'Actele necesare'],
  ['s4', 'Cât durează, de fapt'],
  ['s5', 'Dacă ești în străinătate'],
  ['s6', 'Cât costă'],
] as const;

function H(props: { id: string; children: string }) {
  return <h2 id={props.id} className="m-0 mt-7 scroll-mt-24 text-[26px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[30px]">{props.children}</h2>;
}
function P({ children }: { children: string }) {
  return <p className="m-0 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">{children}</p>;
}

export default async function GhidPierdutPage() {
  const p = await getServicePricing('certificat-nastere');
  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: '/images/documentero/avocat-ghiseu-stare-civila.webp',
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Certificat de naștere pierdut', path: PATH }],
  });
  const related = GUIDES.filter((g) => g.slug !== 'certificat-de-nastere-pierdut').slice(0, 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <HeaderDocumentero active="Ghiduri" />
      <main id="main-content">
        <Section className="mt-10 grid gap-8 lg:grid-cols-12">
          <article className="flex flex-col gap-5 lg:col-span-8">
            <nav aria-label="breadcrumb" className="flex gap-2 text-[13px] text-d-muted">
              <Link href="/" className="hover:text-d-ink">Acasă</Link><span>/</span>
              <Link href="/ghiduri/" className="hover:text-d-ink">Ghiduri</Link><span>/</span>
              <span className="text-d-ink">Certificat de naștere pierdut</span>
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
                <span className="text-[13px] text-d-muted">Actualizat 19 septembrie 2026 · procedura verificată cu avocatul nostru, Baroul Satu Mare</span>
              </div>
            </div>
            <div className="h-[240px] overflow-hidden rounded-[20px] sm:h-[380px]">
              <Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Depunerea cererii la ghișeul de stare civilă" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <H id="s1">Ce NU trebuie să faci</H>
            <P>Nu e nevoie de declarație la poliție și nici de anunț în Monitorul Oficial. Certificatul pierdut nu se „anulează”: pur și simplu se eliberează un duplicat, iar cel vechi, dacă reapare, nu mai are valoare fără mențiune. Mulți pierd o zi la secția de poliție pentru o adeverință pe care primăria nu o cere.</P>

            <H id="s2">Unde se cere duplicatul</H>
            <P>Din 2023, cererea se depune la orice primărie din România, nu doar la cea unde a fost înregistrată nașterea. Primăria unde depui trimite cererea, prin sistemul informatic de stare civilă, la primăria care păstrează actul. În București, fiecare sector are propriul oficiu.</P>
            <P>Cine poate cere: titularul, părintele pentru copilul minor, sau un avocat cu împuternicire avocațială, în temeiul art. 10 din Legea 119/1996. Așa lucrăm noi: tu semnezi împuternicirea pe telefon, avocatul depune și ridică.</P>

            <H id="s3">Actele necesare</H>
            <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">
              <li>Actul de identitate al solicitantului, în termen de valabilitate</li>
              <li>Datele nașterii: data, localitatea, numele părinților (le ai din buletin sau din pașaport)</li>
              <li>Pentru minor: actul de identitate al părintelui care depune</li>
              <li>Prin avocat: împuternicirea avocațială, generată automat în comanda noastră</li>
            </ul>

            <H id="s4">Cât durează, de fapt</H>
            <P>Termenul legal maxim este de 30 de zile de la depunere. În practică, dacă actul de naștere e deja digitalizat, duplicatul iese în câteva zile; pentru acte vechi, nescanate, primăria de origine trebuie să caute în registrul de hârtie și se apropie de termenul maxim. Promitem doar ce putem garanta: te anunțăm la fiecare schimbare de stare.</P>

            <H id="s5">Dacă ești în străinătate</H>
            <P>Consulatul poate prelua cererea, dar o trimite tot la primăria din România și termenele ajung la 30–60 de zile. Prin avocat, cererea intră direct la primărie. Dacă ai nevoie de certificat pentru o autoritate străină, întreabă dacă acceptă extrasul multilingv (în UE, da) sau cere apostilă pe duplicat.</P>

            <H id="s6">Cât costă</H>
            <P>{`La ghișeu, duplicatul este gratuit sau costă o taxă locală de câțiva lei. Prin documentero.ro plătești ${lei(p.basePrice)} lei, cu TVA: onorariul avocatului, împuternicirea, depunerea și ridicarea, scanul pe email și pregătirea pentru curier. Curierul se plătește separat, la alegere, în România sau în străinătate.`}</P>
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
            </div>
          </aside>
        </Section>

        <Section className="mt-16 flex flex-col gap-5">
          <H2 className="sm:text-[28px]">Citește și</H2>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((g) => (
              <Link key={g.slug} href={guideHref(g)} className="flex flex-col gap-2 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
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
