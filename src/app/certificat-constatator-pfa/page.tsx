import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-pfa';
const TITLE = 'Certificat Constatator PFA — Cum Îl Obții Online, Preț, Ce Conține';
const DESCRIPTION =
  'PFA-urile, II-urile și IF-urile primesc certificat constatator pe persoană fizică, pe baza CNP-ului titularului — nu pe CUI, ca firmele. 89 lei cu taxe incluse, eliberat automat în câteva minute, 24/7.';
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
          desc: 'Toate tipurile de certificat constatator, pentru firme și persoane fizice.',
        },
        {
          href: '/cele-4-tipuri-de-certificat-constatator-online/',
          label: 'Tipurile de certificat constatator',
          desc: 'De bază, fonduri IMM, insolvență, istoric — care îți trebuie.',
        },
        {
          slug: 'cazier-fiscal',
          label: 'Cazier Fiscal Online',
          desc: 'Des cerut împreună cu certificatul constatator la autorizări.',
        },
      ]}
      faqs={[
        {
          q: 'Cum obții certificat constatator pentru PFA?',
          a: 'PFA-urile, întreprinderile individuale (II) și întreprinderile familiale (IF) primesc certificat constatator pe persoană fizică, eliberat pe baza CNP-ului titularului — nu pe CUI, ca firmele. Online, completezi numele și CNP-ul titularului plus scopul, iar certificatul se emite automat, de obicei în câteva minute.',
        },
        {
          q: 'Cât costă certificatul constatator pentru PFA?',
          a: 'La eGhișeul: 89 de lei cu toate taxele ONRC incluse, cu factură emisă automat. Tariful oficial ONRC este 30 de lei, dacă îl obții singur prin portalul ONRC, unde ai nevoie de cont.',
        },
        {
          q: 'Ce conține certificatul constatator de persoană fizică?',
          a: 'Tot ce e înregistrat pe persoana respectivă în Registrul Comerțului: calitatea de titular de PFA/II/IF cu datele înregistrării (denumire, cod unic, număr F…, sediu profesional, activități autorizate, stare) și calitățile deținute în firme — asociat, acționar sau administrator. Dacă persoana nu figurează cu nimic, certificatul atestă exact asta.',
        },
        {
          q: 'Unde se cere certificatul constatator de PFA?',
          a: 'Scopurile din formularul ONRC: ANAF și administrația financiară, înregistrarea în scopuri de TVA, eliberarea cazierului judiciar, poliție, autorizări, AFIR (fonduri pentru agricultură), primărie și informare. Practic: ori de câte ori o instituție vrea dovada că activitatea ta e înregistrată și activă.',
        },
        {
          q: 'CNP-ul meu e obligatoriu? De ce nu merge cu CUI?',
          a: 'La ONRC, formele fără personalitate juridică (PFA, II, IF) sunt evidențiate pe persoana titularului, așa că raportul se generează după CNP. CUI-ul PFA-ului nu e suficient pentru acest tip de certificat — sistemul ONRC îl cere pe titular.',
        },
        {
          q: 'Cât durează și când pot comanda?',
          a: 'Certificatul pe persoană fizică se emite automat, de obicei în câteva minute, la orice oră — inclusiv noaptea și în weekend. Comanda durează 3-4 minute.',
        },
      ]}
    >
      <p>
        Dacă ai PFA, întreprindere individuală sau familială și ți s-a cerut „certificat
        constatator”, e o diferență de știut din start: nu primești certificatul de firmă, pe CUI,
        ci <strong>certificatul constatator pe persoană fizică</strong>, eliberat pe CNP-ul
        titularului. Costă 89 de lei cu tot cu taxe și se emite automat, de obicei în câteva
        minute, la orice oră.
      </p>

      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Comandă certificatul pentru PFA — pe email în câteva minute
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Numele și CNP-ul titularului, scopul, plata cu cardul — atât. Emis automat 24/7,
          semnat electronic de ONRC, cu factură. 89 lei, taxe incluse.
        </p>
        <Link
          href="/comanda/certificat-constatator/?tip=pf"
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Comandă acum — 89 lei, taxe incluse →
        </Link>
      </div>

      <h2>De ce PFA-ul primește alt certificat decât firmele</h2>
      <p>
        PFA, II și IF sunt forme fără personalitate juridică: la Registrul Comerțului, evidența e
        legată de persoana titularului, nu de o entitate separată. De aici și mecanica: raportul se
        generează după <strong>CNP-ul titularului</strong> și adună tot ce e înregistrat pe acea
        persoană. Dacă introduci CUI-ul PFA-ului în formularul de firmă, sistemul te blochează —
        motiv pentru care wizard-ul nostru detectează automat PFA/II/IF și te duce pe formularul
        corect.
      </p>

      <h2>Ce conține certificatul</h2>
      <p>
        Raportul adună tot ce figurează pe persoana respectivă în Registrul Comerțului, pe două
        planuri:
      </p>
      <ul>
        <li>
          <strong>Înregistrările ca titular</strong> de PFA / II / IF: denumirea, codul unic de
          înregistrare, numărul F… din Registrul Comerțului, sediul profesional, activitățile
          autorizate (coduri CAEN) și starea curentă — în funcțiune, suspendare, radiere;
        </li>
        <li>
          <strong>Calitățile în firme:</strong> dacă persoana e asociat, acționar sau
          administrator în societăți înregistrate la ONRC.
        </li>
      </ul>
      <p>
        Partea cu activitățile autorizate contează des în practică: instituțiile verifică dacă
        CAEN-ul pentru care ceri autorizarea sau decontarea chiar figurează autorizat, nu doar
        declarat. Iar când persoana nu figurează cu nimic, certificatul atestă exact asta — motiv
        pentru care se cere și la eliberarea cazierului sau la unele autorizări.
      </p>

      <h2>Unde ți-l cer</h2>
      <p>
        Scopurile oficiale din formularul ONRC pentru persoane fizice: ANAF și administrația
        finanțelor publice, înregistrarea în scopuri de TVA, eliberarea cazierului judiciar
        (împreună cu care se cere des și{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazierul fiscal</Link>), poliție, autorizări,
        AFIR, primărie, informare. Tipic: deschizi cont bancar de business, intri într-un program
        de finanțare, ceri o autorizație de funcționare sau pur și simplu un client mare vrea
        dovada că PFA-ul tău e activ.
      </p>

      <h2>Cum îl obții, pas cu pas</h2>
      <ol>
        <li>
          Deschizi <Link href="/comanda/certificat-constatator/?tip=pf">pagina de comandă</Link> —
          tipul „persoană fizică” e preselectat;
        </li>
        <li>Completezi numele complet și CNP-ul titularului;</li>
        <li>Alegi scopul din lista ONRC;</li>
        <li>Plătești cu cardul;</li>
        <li>Primești certificatul pe email, semnat electronic — de obicei în câteva minute.</li>
      </ol>

      <h2>Întrebarea care revine: „dar eu am și SRL”</h2>
      <p>
        Certificatele nu se amestecă: SRL-ul primește{' '}
        <Link href="/certificat-constatator-de-baza/">certificat de firmă, pe CUI</Link>, PFA-ul
        primește certificat pe persoană fizică, pe CNP. Dacă instituția vrea situația ambelor,
        comanzi două certificate. Iar dacă ai nevoie de istoricul complet al unei firme (asociați
        vechi, sedii schimbate), acela e{' '}
        <Link href="/certificat-constatator-cu-istoric/">certificatul cu istoric</Link>.
      </p>
    </ArticleLayout>
  );
}
