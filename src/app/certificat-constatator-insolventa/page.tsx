import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-insolventa';
const TITLE = 'Certificat Constatator pentru Insolvență — Preț și Eliberare Online';
const DESCRIPTION =
  'Certificatul constatator pentru insolvență atestă dacă o firmă este sau nu în insolvență, faliment sau reorganizare. Cerut la licitații, notar și instanță. 89 lei cu taxe incluse, eliberat în maximum 24 de ore lucrătoare.';
const DATE_PUBLISHED = '2026-07-17';
const DATE_MODIFIED = '2026-07-17';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-constatator.png',
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Servicii ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="17 iulie 2026"
      updatedLabel="17 iulie 2026"
      image="/og/services/certificat-constatator.png"
      relatedServices={[
        {
          slug: 'certificat-constatator',
          label: 'Certificat Constatator Online',
          desc: 'Toate tipurile de certificat constatator, eliberate cu CUI-ul firmei.',
        },
        {
          href: '/certificat-constatator-pentru-licitatie/',
          label: 'Certificat constatator pentru licitație',
          desc: 'Ce cere documentația de atribuire și cum îl obții la timp.',
        },
        {
          href: '/certificat-constatator-pentru-notar/',
          label: 'Certificat constatator pentru notar',
          desc: 'Când îl cere notarul și în ce formă.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este certificatul constatator pentru insolvență?',
          a: 'Un raport ONRC dedicat, care atestă negru pe alb dacă firma este sau nu înregistrată în procedurile prevăzute de legea insolvenței: insolvență, faliment, reorganizare judiciară, dizolvare, lichidare. E alt document decât certificatul constatator de bază — acela doar menționează sumar starea firmei.',
        },
        {
          q: 'Unde se cere certificatul de insolvență?',
          a: 'Cel mai des la licitațiile publice (documentația de atribuire cere dovada că ofertantul nu e în insolvență), la birourile notariale pentru anumite tranzacții și la instanță (tribunal). Acestea sunt și scopurile oficiale din formularul ONRC pentru acest tip de raport.',
        },
        {
          q: 'Cât costă și cât durează?',
          a: 'La eGhișeul: 89 de lei cu toate taxele incluse. Spre deosebire de certificatul de bază (care se emite în câteva minute), raportul de insolvență trece prin backoffice-ul ONRC și durează de regulă până la 24 de ore lucrătoare. Plasezi comanda oricând, 24/7, și primești documentul pe email.',
        },
        {
          q: 'Nu văd starea de insolvență și în certificatul de bază?',
          a: 'Certificatul de bază menționează starea firmei, inclusiv insolvența, dar sumar. Când documentația de licitație sau instanța cere explicit certificat constatator „pentru insolvență” sau „conform Legii 85/2014", îți trebuie raportul dedicat — cel de bază riscă să fie respins.',
        },
        {
          q: 'Pot verifica gratuit dacă o firmă e în insolvență?',
          a: 'Orientativ, da: Buletinul Procedurilor de Insolvență (BPI) are un motor de căutare, iar starea apare și în surse publice. Dar pentru un dosar de licitație sau pentru notar îți trebuie certificatul oficial ONRC, semnat electronic — căutarea în BPI nu ține loc de document.',
        },
        {
          q: 'Ce valabilitate are certificatul?',
          a: 'Instituțiile cer de regulă un certificat recent — frecvent maximum 30 de zile de la emitere, iar la licitații uneori se cere emis chiar în luna depunerii ofertei. Verifică documentația exactă înainte să comanzi.',
        },
      ]}
    >
      <p>
        Certificatul constatator pentru insolvență e raportul ONRC care atestă oficial dacă o
        firmă figurează sau nu în procedurile legii insolvenței: insolvență, faliment,
        reorganizare, lichidare. Îl cer licitațiile publice, notarii și instanțele. Costă 89 de
        lei cu tot cu taxe și se eliberează în maximum 24 de ore lucrătoare — comanzi online, doar
        cu CUI-ul firmei.
      </p>

      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Comandă certificatul de insolvență — vine pe email în max. 24h lucrătoare
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Completezi CUI-ul, plătești cu cardul, iar noi depunem cererea la ONRC. Primești
          documentul semnat electronic, cu factura emisă automat. 89 lei, taxe incluse.
        </p>
        <Link
          href="/comanda/certificat-constatator/?tip=insolventa"
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Comandă acum — 89 lei, taxe incluse →
        </Link>
      </div>

      <h2>Ce atestă exact acest certificat</h2>
      <p>
        Raportul verifică înregistrările firmei față de procedurile Legii 85/2014 privind
        insolvența și spune explicit dacă firma:
      </p>
      <ul>
        <li>este sau nu în <strong>procedură de insolvență</strong>;</li>
        <li>este sau nu în <strong>faliment</strong>;</li>
        <li>este sau nu în <strong>reorganizare judiciară</strong>;</li>
        <li>are sau nu mențiuni de <strong>dizolvare sau lichidare</strong>.</li>
      </ul>
      <p>
        Formularea e cea care contează pentru dosare: documentul spune în clar „nu figurează”,
        semnat electronic de ONRC — exact ce cere comisia de licitație sau notarul, nu o
        interpretare a ta după o căutare pe internet.
      </p>

      <h2>De bază vs. insolvență — de ce nu merge cu cel obișnuit</h2>
      <p>
        Întrebarea vine des, pentru că certificatul de bază menționează și el starea firmei. Doar
        că o menționează sumar, ca stare curentă. Când documentația cere „certificat constatator
        din care să rezulte că ofertantul nu se află în insolvență” sau face trimitere la Legea
        85/2014, comisiile așteaptă raportul dedicat. Am văzut oferte respinse pentru exact
        diferența asta. Dacă ai dubii, cere-l pe cel dedicat — atestă explicit ce vrea dosarul.
      </p>

      <h2>Unde se cere</h2>
      <p>
        Scopurile oficiale din formularul ONRC pentru acest raport sunt trei:{' '}
        <strong>licitație</strong> (cel mai frecvent — vezi și{' '}
        <Link href="/certificat-constatator-pentru-licitatie/">ghidul pentru licitații</Link>),{' '}
        <strong>birou notarial</strong> (
        <Link href="/certificat-constatator-pentru-notar/">detalii aici</Link>) și{' '}
        <strong>tribunal</strong>. Separat, e un instrument bun de verificare comercială: înainte
        de un contract mare sau de un avans consistent, afli oficial dacă partenerul e în vreo
        procedură.
      </p>

      <h2>Cum îl obții</h2>
      <ol>
        <li>
          Intri pe{' '}
          <Link href="/comanda/certificat-constatator/?tip=insolventa">pagina de comandă</Link> —
          raportul de insolvență e deja selectat;
        </li>
        <li>Completezi CUI-ul firmei (verificat automat în baza ANAF);</li>
        <li>Alegi scopul: licitație, notar sau tribunal;</li>
        <li>Plătești cu cardul și primești confirmarea;</li>
        <li>
          Cererea intră la ONRC, iar certificatul vine pe email în{' '}
          <strong>maximum 24 de ore lucrătoare</strong>.
        </li>
      </ol>
      <p>
        Termenul de 24 de ore nu e artificiu de vânzare, e circuitul real: rapoartele de
        insolvență trec prin backoffice-ul ONRC, nu se emit instant ca{' '}
        <Link href="/certificat-constatator-de-baza/">certificatul de bază</Link>. Dacă ai termen
        de depunere, comandă cu o zi-două înainte.
      </p>

      <h2>Verificarea gratuită vs. documentul oficial</h2>
      <p>
        Poți afla orientativ starea unei firme din Buletinul Procedurilor de Insolvență sau din
        surse publice — util pentru o primă verificare, gratuit. Dar dosarul de licitație nu se
        depune cu un screenshot: îți trebuie certificatul ONRC semnat electronic. Cele două nu se
        exclud — verifici gratuit întâi, comanzi documentul când ai nevoie de el la dosar.
      </p>
    </ArticleLayout>
  );
}
