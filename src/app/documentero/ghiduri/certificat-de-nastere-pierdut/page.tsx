import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, H2, InfoTable, Section } from '@/components/documentero/ui';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroArticleGraph } from '@/lib/seo/documentero-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { fmtDateRo, GUIDES, guideHref, LAWYER, LEGAL_BASIS, PROCESSING_STATS } from '@/lib/documentero/content';
import { SITE_AUTHOR } from '@/lib/seo/author';
import { DOCUMENTERO_INDEXABLE } from '@/config/documentero-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/certificat-de-nastere-pierdut/';
const TITLE = 'Certificat de naștere pierdut: ce faci în 2026';
const DESCRIPTION = 'Nu te duci la poliție, nu te duci neapărat în orașul natal și nu plătești taxă de stat. Unde se cere duplicatul, ce acte trebuie, cât durează de fapt, ce faci din străinătate.';
const DATE_PUBLISHED = '2026-09-19';
const DATE_MODIFIED = '2026-09-21';

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
  ['s3', 'Cine poate cere'],
  ['s4', 'Actele necesare'],
  ['s5', 'Cât durează, de fapt'],
  ['s6', 'Cazuri particulare'],
  ['s7', 'Dacă ești în străinătate'],
  ['s8', 'Cât costă'],
  ['s9', 'Ce faci cu duplicatul după ce îl ai'],
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

export default async function GhidPierdutPage() {
  const p = await getServicePricing('certificat-nastere');
  const stats = PROCESSING_STATS.byService['certificat-nastere'];
  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: '/images/documentero/avocat-ghiseu-stare-civila.webp',
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Certificat de naștere pierdut', path: PATH }],
  });
  const related = GUIDES.filter((g) => g.published && g.slug !== 'certificat-de-nastere-pierdut').slice(0, 3);

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
              <span className="text-d-ink">Certificat de naștere pierdut</span>
            </nav>
            <Eyebrow>Naștere · 9 minute de citit</Eyebrow>
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
              <Image src="/images/documentero/avocat-ghiseu-stare-civila.webp" alt="Depunerea cererii la ghișeul de stare civilă" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <Card className="flex flex-col gap-2 border-l-4 border-l-d-acc p-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-d-muted">Pe scurt</span>
              <P>Certificatul de naștere pierdut se înlocuiește cu un duplicat, cerut la orice primărie din România (din 2023), pe baza actului de naștere din registru. Nu e nevoie de declarație la poliție. Cererea o depune titularul, părintele pentru minor sau un avocat cu împuternicire. Termen legal: cel mult 30 de zile. Taxa de stat: 0 lei sau o taxă locală de câțiva lei.</P>
            </Card>

            <H id="s1">Ce NU trebuie să faci</H>
            <P>Nu e nevoie de declarație la poliție și nici de anunț în Monitorul Oficial. Certificatul pierdut nu se „anulează”: pur și simplu se eliberează un duplicat, iar cel vechi, dacă reapare, nu mai are valoare. Mulți pierd o zi la secția de poliție pentru o adeverință pe care primăria nu o cere. Excepția e furtul: dacă ți s-a furat portofelul cu buletin cu tot, la poliție te duci pentru buletin, nu pentru certificat.</P>
            <P>Nu te duci nici la notar. Dacă vrei să ceară altcineva în locul tău, ai două variante: o procură notarială (drum, taxă, și tot trebuie cineva care să meargă la primărie) sau împuternicirea avocațială, pe care o semnezi electronic. A doua e ce folosim noi.</P>

            <H id="s2">Unde se cere duplicatul</H>
            <P>Din 2023, cererea se depune la orice primărie din România, nu doar la cea unde a fost înregistrată nașterea. Primăria unde depui trimite cererea, prin sistemul informatic de stare civilă, la primăria care păstrează actul, iar duplicatul se eliberează pe formularul actual, cu CNP. În București, fiecare sector are propriul oficiu de stare civilă, dar regula e aceeași: depui la oricare.</P>
            <P>Contează totuși unde e actul. Dacă e deja scanat în sistem, duplicatul iese repede. Dacă e într-un registru de hârtie din 1958, la o primărie de comună, cineva trebuie să-l caute și să-l scaneze întâi. De aici vine toată diferența de termen de mai jos.</P>

            <H id="s3">Cine poate cere</H>
            <P>Titularul, cu actul de identitate valabil. Părintele sau tutorele, pentru copilul minor. Un avocat cu împuternicire avocațială, în temeiul {LEGAL_BASIS.long}. Sau orice persoană cu procură notarială specială. Un soț, un frate sau un prieten nu pot cere „așa”, fără împuternicire, chiar dacă au certificatul vechi în mână.</P>
            <P>Pentru un părinte decedat, când ai nevoie de dovada nașterii lui la succesiune, nu se cere duplicat, ci un extras pentru uz oficial, pe care notarul îl solicită de regulă direct. Dacă ești în cazul ăsta, <A href="/contact/">scrie-ne</A> și îți spunem ce document e potrivit.</P>

            <H id="s4">Actele necesare</H>
            <ul className="m-0 flex flex-col gap-1.5 pl-6 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">
              <li>Actul de identitate al solicitantului, în termen de valabilitate (buletin sau pașaport)</li>
              <li>Datele nașterii: data, localitatea, numele părinților (le ai din buletin sau din pașaport)</li>
              <li>Pentru minor: actul de identitate al părintelui care depune; peste 14 ani, copilul semnează și el</li>
              <li>Prin avocat: împuternicirea avocațială, generată automat în <A href="/certificat-de-nastere/">comanda noastră</A></li>
            </ul>
            <P>Nu ai nevoie de certificatul vechi, de o copie a lui, de certificatul de căsătorie sau de vreo adeverință. Dacă buletinul ți-a expirat, întâi îl reînnoiești; primăria nu primește cereri cu act de identitate expirat, și e motivul cel mai des pentru care o cerere se întoarce.</P>

            <H id="s5">Cât durează, de fapt</H>
            <P>Termenul legal maxim este de 30 de zile de la depunere. Hub-ul MAI dă ca medie 3 zile lucrătoare. Ce vezi tu, ca om care așteaptă, e undeva între: dacă actul e digitalizat, duplicatul iese în câteva zile; pentru acte vechi, nescanate, primăria de origine caută în registrul de hârtie și se apropie de termenul maxim.</P>
            <P>Cifrele noastre: din comenzile de duplicat plătite de la {PROCESSING_STATS.since}, {stats.done} au fost finalizate până la {fmtDateRo(PROCESSING_STATS.asOf)}. Jumătate au ajuns la client în cel mult {stats.medianDays} zile de la plată, 8 din 10 în cel mult {stats.p80Days} zile, cu curier cu tot. E un eșantion mic și îl actualizăm pe măsură ce crește; nu promitem „3 zile” ca să vindem.</P>

            <H id="s6">Cazuri particulare</H>
            <InfoTable
              head={['Situația', 'Ce se schimbă']}
              rows={[
                ['Certificatul copilului', 'Cere părintele, cu buletinul lui. Nu contează la ce părinte locuiește copilul; nu e nevoie de acordul celuilalt.'],
                ['Născut înainte de 1990, act la o comună comasată', 'Actul e la primăria care a preluat arhiva. Scrii localitatea așa cum o știi; avocatul identifică primăria corectă.'],
                ['Certificatul vechi, tipizat, era încă bun', 'Duplicatul iese oricum pe modelul nou, cu CNP. Îl vei folosi mai ușor la pașaport și în străinătate.'],
                ['Numele s-a schimbat între timp (căsătorie, divorț)', 'Duplicatul de naștere iese cu numele de la naștere, plus mențiunile. Pentru numele actual folosești certificatul de căsătorie.'],
                ['Datele din act sunt greșite', 'Duplicatul reproduce actul cu greșeală cu tot. Corectarea e altă procedură (rectificare), la primăria care are actul.'],
                ['Născut în străinătate, fără act românesc', 'Nu e duplicat, e transcriere: certificatul străin se înscrie întâi în registrele din România.'],
                ['Certificatul a fost distrus (incendiu, inundație)', 'La fel ca pierdut. Nu trebuie dovada distrugerii.'],
                ['Certificatul e plastifiat', 'Se consideră deteriorat: pe el nu se mai pot înscrie mențiuni. Se cere duplicat, plastifiatul se predă.'],
              ]}
            />

            <H id="s7">Dacă ești în străinătate</H>
            <P>Consulatul poate prelua cererea, dar o trimite tot la primăria din România și termenele ajung la 30–60 de zile, plus programarea la consulat, care în Italia sau Spania se ia cu săptămâni înainte. Prin avocat, cererea intră direct la primărie, iar tu semnezi împuternicirea de pe telefon, de oriunde.</P>
            <P>Înainte să comanzi, întreabă instituția străină ce vrea exact. În UE, de cele mai multe ori nu vrea certificatul, ci <A href="/extras-multilingv/">extrasul multilingv</A>, acceptat fără traducere și fără apostilă. În afara UE (Regatul Unit, SUA, Canada, Elveția) vrea certificatul cu <A href="/ghiduri/apostila-acte-stare-civila/">apostilă</A> și traducere. Amândouă se pot adăuga în aceeași comandă.</P>

            <H id="s8">Cât costă</H>
            <P>La ghișeu, duplicatul este gratuit sau costă o taxă locală de câțiva lei, stabilită de consiliul local. Prin documentero.ro plătești {lei(p.basePrice)} lei, cu TVA: onorariul avocatului, împuternicirea, depunerea și ridicarea, scanul pe email și pregătirea pentru curier. Curierul se plătește separat, la alegere, în România sau în străinătate. Dacă primăria refuză și nu se poate rezolva, primești banii înapoi.</P>

            <H id="s9">Ce faci cu duplicatul după ce îl ai</H>
            <P>Îl păstrezi ca pe original, fiindcă asta e: singurul certificat valabil de acum înainte. Nu îl plastifia. Fă-i o poză clară și ține-o în telefon; pentru cele mai multe formulare online ajunge scanul, iar originalul rămâne acasă. Dacă îl găsești pe cel vechi, nu îl mai folosi: instituțiile verifică numărul certificatului în sistem și îl văd ca înlocuit.</P>
            <P>Dacă ai pierdut și certificatul de căsătorie, procedura e aceeași: <A href="/certificat-de-casatorie/">duplicat certificat de căsătorie</A>, cerut de oricare dintre soți. Iar dacă urmează o căsătorie în străinătate, lângă duplicatul de naștere ți se va cere și <A href="/certificat-de-celibat/">certificatul de celibat</A>.</P>
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
            <Link href="/certificat-de-nastere/" className="flex flex-col gap-2 rounded-2xl border border-d-line bg-d-card p-5 hover:border-d-acc">
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-d-acc">Serviciu</span>
              <span className="text-[18px] font-bold leading-[1.25]">Duplicat certificat de naștere, prin avocat</span>
            </Link>
          </div>
        </Section>
      </main>
    </>
  );
}
