import Image from 'next/image';
import Link from 'next/link';
import { HeaderDocumentero } from '@/components/documentero/header';
import { Card, Eyebrow, H2, Section } from '@/components/documentero/ui';
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
const DESCRIPTION =
  'În UE nu mai ai nevoie de apostilă pe certificatul de naștere sau de căsătorie: extrasul multilingv o înlocuiește. În afara UE, apostila o pune Prefectura, pe original. Cine o cere, cât durează, ce se apostilează și ce nu.';
const DATE_PUBLISHED = '2026-09-20';
const DATE_MODIFIED = '2026-09-20';

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: TITLE,
  description: DESCRIPTION,
  path: PATH,
  ogImage: '/images/documentero/curier-livrare-plic.webp',
  noindex: !DOCUMENTERO_INDEXABLE,
});

const TOC = [
  ['s1', 'Ce este apostila, pe scurt'],
  ['s2', 'În UE: nu mai e nevoie'],
  ['s3', 'În afara UE: unde se pune'],
  ['s4', 'Apostilă pe original sau pe traducere?'],
  ['s5', 'Cât durează și cât costă'],
  ['s6', 'Țări care nu acceptă apostila'],
] as const;

function H(props: { id: string; children: string }) {
  return <h2 id={props.id} className="m-0 mt-7 scroll-mt-24 text-[26px] font-bold leading-[1.15] tracking-[-0.03em] sm:text-[30px]">{props.children}</h2>;
}
function P({ children }: { children: string }) {
  return <p className="m-0 text-[17px] leading-[1.7] text-d-body sm:text-[18px]">{children}</p>;
}

export default async function GhidApostilaPage() {
  const nastere = await getServicePricing('certificat-nastere');
  const extras = await getServicePricing('extras-multilingv-certificat-nastere');
  const apostila = optionPrice(nastere, 'apostila_haga', 198);
  const traducere = optionPrice(nastere, 'traducere_autorizata', 178.5);

  const graph = documenteroArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: DATE_PUBLISHED,
    dateModified: DATE_MODIFIED,
    image: '/images/documentero/curier-livrare-plic.webp',
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Apostila pe acte de stare civilă', path: PATH }],
  });
  const related = GUIDES.filter((g) => g.slug !== SLUG).slice(0, 3);

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
            <Eyebrow>Diaspora · 6 minute de citit</Eyebrow>
            <h1 className="m-0 text-[36px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[54px]">{TITLE}</h1>
            <p className="m-0 text-[18px] leading-[1.55] text-d-muted sm:text-[20px]">{DESCRIPTION}</p>
            <div className="flex items-center gap-3.5 border-y border-d-line py-4">
              <Image src={SITE_AUTHOR.photo} alt={SITE_AUTHOR.name} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold">
                  <a href={SITE_AUTHOR.url} className="hover:underline">{SITE_AUTHOR.name}</a>, fondator eghiseul.ro și documentero.ro
                </span>
                <span className="text-[13px] text-d-muted">Publicat 20 septembrie 2026 · procedura verificată cu avocatul nostru, Baroul Satu Mare</span>
              </div>
            </div>
            <div className="h-[240px] overflow-hidden rounded-[20px] sm:h-[380px]">
              <Image src="/images/documentero/curier-livrare-plic.webp" alt="Plicul cu actul apostilat, predat de curier" width={1264} height={848} className="h-full w-full object-cover" sizes="(min-width: 1024px) 860px, 100vw" priority />
            </div>

            <H id="s1">Ce este apostila, pe scurt</H>
            <P>Apostila e o ștampilă standard, stabilită prin Convenția de la Haga din 1961, care confirmă că semnătura și ștampila de pe un act oficial sunt autentice. Nu spune nimic despre conținutul actului; spune doar că actul e emis de o autoritate reală din România. O autoritate din alt stat semnatar al convenției e obligată să accepte actul apostilat fără alte legalizări.</P>
            <P>Pe actele de stare civilă (certificat de naștere, de căsătorie, dovada de celibat), apostila se pune în România de Instituția Prefectului din județul în care a fost emis actul. Nu de notar, nu de primărie și nu de consulat.</P>

            <H id="s2">În UE: nu mai e nevoie</H>
            <P>De la 16 februarie 2019, Regulamentul (UE) 2016/1191 scoate apostila pentru actele de stare civilă folosite între statele membre. Un certificat de naștere românesc e acceptat în Italia, Spania, Germania sau Franța fără apostilă și, dacă are atașat formularul standard multilingv, fără traducere. Formularul îl emite același oficiu de stare civilă care păstrează actul.</P>
            <P>Asta înseamnă că pentru înscrierea la școală, rezidență, căsătorie sau pensie într-un stat UE, drumul corect e extrasul multilingv, nu apostila. Dacă un funcționar din UE îți cere totuși apostilă pe certificat, îi poți indica regulamentul; în practică, majoritatea instituțiilor îl cunosc. Există excepții pe care le tratăm la final.</P>

            <H id="s3">În afara UE: unde se pune</H>
            <P>Pentru Regatul Unit, Elveția, Norvegia, Statele Unite, Canada, Australia, Turcia sau Republica Moldova, apostila rămâne necesară. O eliberează Prefectura județului care a emis certificatul, pe originalul actului. Cererea o poate depune titularul sau un împuternicit; avocatul nostru o depune în baza împuternicirii avocațiale pe care o semnezi pe telefon, în aceeași comandă cu duplicatul.</P>
            <P>Un detaliu care încurcă mulți oameni: apostila se pune pe certificatul nou, de tip actual. Certificatele vechi, tipizate, cu text de mână, sunt de obicei refuzate la apostilare; se cere mai întâi duplicatul, apoi apostila pe duplicat. De asta le comandăm împreună.</P>

            <H id="s4">Apostilă pe original sau pe traducere?</H>
            <P>Depinde de ce cere instituția străină. Cele mai multe cer apostila pe original, apoi o traducere autorizată în limba lor, făcută în țara de destinație sau în România. Unele cer și apostilă pe traducere: în cazul ăsta traducerea se legalizează la notar, iar apostila pe ea o pune Camera Notarilor Publici, nu Prefectura. Sunt două apostile diferite, pe două acte diferite.</P>
            <P>În comanda noastră poți bifa fiecare pas separat: apostila de la Prefectură pe original, traducerea autorizată, legalizarea notarială a traducerii și apostila Camerei Notarilor pe traducere. Întreabă instituția care le cere exact ce vrea înainte să bifezi tot; plătești doar ce e nevoie.</P>

            <H id="s5">Cât durează și cât costă</H>
            <P>{`Apostila de la Prefectură se eliberează de regulă în aceeași zi sau în 1–2 zile lucrătoare de la depunere, după ce duplicatul certificatului există. Prin documentero.ro, apostila pe original costă ${lei(apostila)} lei în plus față de certificat, cu depunerea și ridicarea incluse. Traducerea autorizată costă ${lei(traducere)} lei. Extrasul multilingv, alternativa pentru UE, costă ${lei(extras.basePrice)} lei și nu are nevoie nici de apostilă, nici de traducere.`}</P>
            <P>Termenul total e dat de certificat, nu de apostilă: până la 30 de zile legale pentru duplicat, apoi zilele apostilei, apoi curierul. Pentru străinătate trimitem prin DHL Express sau Poșta Română, cu AWB pe email.</P>

            <H id="s6">Țări care nu acceptă apostila</H>
            <P>Statele care nu au semnat Convenția de la Haga (de exemplu unele țări din Golf sau din Asia) cer supralegalizarea: actul trece pe la Ministerul Afacerilor Externe și apoi pe la ambasada țării respective în România. E un drum mai lung, cu termene de câteva săptămâni. Spune-ne țara în formular și îți confirmăm înainte de plată dacă putem face supralegalizarea sau dacă e nevoie de un alt traseu.</P>
            <P>Și invers: chiar în UE, unele consulate și instanțe cer certificatul cu apostilă, indiferent de regulament, pentru dosare de cetățenie sau proceduri judiciare. Când nu ești sigur, cere instituției lista de acte în scris și trimite-ne-o pe WhatsApp; verificăm gratuit ce trebuie de fapt.</P>
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
