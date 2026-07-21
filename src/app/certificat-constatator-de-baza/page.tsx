import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-de-baza';
const TITLE = 'Certificat Constatator de Bază — Preț, Ce Conține, Eliberare în Minute';
const DESCRIPTION =
  'Certificatul constatator de bază costă 30 lei la ONRC (cu cont pe portal) sau 89 lei cu tot cu taxe la eGhișeul, eliberat automat în câteva minute, 24/7, doar cu CUI-ul firmei. Ce conține și unde ți-l cer.';
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
          desc: 'Toate tipurile de certificat constatator, eliberate automat cu CUI-ul firmei.',
        },
        {
          href: '/cele-4-tipuri-de-certificat-constatator-online/',
          label: 'Tipurile de certificat constatator',
          desc: 'De bază, fonduri IMM, insolvență, istoric — care îți trebuie.',
        },
        {
          href: '/certificat-constatator-pentru-banca/',
          label: 'Certificat constatator pentru bancă',
          desc: 'Ce cere banca la deschiderea contului sau la credit.',
        },
      ]}
      faqs={[
        {
          q: 'Cât costă certificatul constatator de bază?',
          a: 'Tariful oficial ONRC este 30 de lei (Ordinul Ministerului Justiției nr. 380/C/2024), plătibil online prin portalul ONRC, unde ai nevoie de cont. Prin eGhișeul costă 89 de lei cu toate taxele incluse, fără cont ONRC, cu eliberare automată în câteva minute, la orice oră.',
        },
        {
          q: 'Ce conține certificatul constatator de bază?',
          a: 'Datele de identificare ale firmei (denumire, CUI, număr de ordine în Registrul Comerțului, sediu social, capital social), asociații și administratorii cu cotele și puterile lor, obiectul de activitate și starea curentă a firmei: în funcțiune, dizolvare, radiere. Nu conține istoricul modificărilor — pentru asta există certificatul cu istoric.',
        },
        {
          q: 'Cât durează eliberarea?',
          a: 'Prin eGhișeul, certificatul de bază se emite automat, de obicei în câteva minute — inclusiv noaptea, în weekend și de sărbători. Ai nevoie doar de CUI-ul firmei.',
        },
        {
          q: 'Ce valabilitate are certificatul constatator de bază?',
          a: 'Legea nu îi dă un termen de valabilitate, dar instituțiile care îl cer (bănci, notari, autorități de licitație) acceptă de regulă un certificat de maximum 30 de zile de la emitere. Unele cer chiar mai recent, de exemplu 15 zile — verifică cerința exactă a instituției.',
        },
        {
          q: 'E valabil certificatul electronic, fără ștampilă?',
          a: 'Da. Certificatul se emite electronic, cu semnătura electronică a ONRC, și are aceeași valoare juridică precum cel de la ghișeu. Instituțiile îl pot verifica direct.',
        },
        {
          q: 'Pot obține certificat constatator de bază pentru orice firmă?',
          a: 'Da — pentru orice firmă înregistrată la Registrul Comerțului, nu doar pentru firma ta. Informațiile din Registrul Comerțului sunt publice, deci poți verifica un partener de afaceri, un furnizor sau un client înainte să semnezi un contract.',
        },
      ]}
    >
      <p>
        Certificatul constatator de bază este documentul ONRC cerut cel mai des de la o firmă:
        arată cine o deține, cine o administrează și dacă e în funcțiune. Tariful oficial e 30 de
        lei prin portalul ONRC (cu cont), iar prin eGhișeul — 89 de lei cu tot cu taxe, eliberat
        automat în câteva minute, doar cu CUI-ul firmei, la orice oră.
      </p>

      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Comandă certificatul de bază — îl primești pe email în câteva minute
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Completezi CUI-ul, alegi scopul, plătești cu cardul. Certificatul se emite automat,
          24/7 — inclusiv noaptea și în weekend. 89 lei, toate taxele incluse.
        </p>
        <Link
          href="/comanda/certificat-constatator/?tip=de-baza"
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Comandă acum — 89 lei, taxe incluse →
        </Link>
      </div>

      <h2>Ce conține certificatul constatator de bază</h2>
      <p>Documentul emis de ONRC cuprinde, la zi:</p>
      <ul>
        <li>
          <strong>Datele de identificare:</strong> denumirea firmei, CUI, numărul de ordine în
          Registrul Comerțului (J/F/C), forma juridică, sediul social, durata societății;
        </li>
        <li>
          <strong>Capitalul social</strong> subscris și vărsat;
        </li>
        <li>
          <strong>Asociații/acționarii</strong> cu cotele de participare și{' '}
          <strong>administratorii</strong> cu puterile lor;
        </li>
        <li>
          <strong>Obiectul de activitate</strong> — activitatea principală și cele secundare
          (coduri CAEN);
        </li>
        <li>
          <strong>Sediile secundare</strong> / punctele de lucru;
        </li>
        <li>
          <strong>Starea firmei:</strong> în funcțiune, dizolvare, lichidare, radiere,
          insolvență (mențiunea sumară).
        </li>
      </ul>
      <p>
        Ce NU conține: istoricul modificărilor (cine a fost asociat acum 5 ani, sediile vechi,
        schimbările de nume). Pentru asta există{' '}
        <Link href="/certificat-constatator-cu-istoric/">certificatul constatator cu istoric</Link>,
        alt document, cu alt tarif.
      </p>

      <h2>Unde ți-l cer</h2>
      <p>
        Lista reală, din formularele ONRC: bancă (deschidere cont, credit,{' '}
        <Link href="/certificat-constatator-pentru-banca/">detalii aici</Link>), licitații publice,
        birou notarial, ANAF și înregistrarea în scopuri de TVA, obținere viză, leasing, accesare
        fonduri europene, instanță, ambasadă, autorizări diverse. La comandă alegi exact scopul —
        el apare pe certificat, așa cum îl cere instituția.
      </p>
      <p>
        Îl folosești la fel de des pentru verificări: înainte să semnezi cu un furnizor nou sau să
        dai un avans, certificatul îți spune cine e în spatele firmei și dacă nu cumva e în
        dizolvare. Datele Registrului Comerțului sunt publice — poți cere certificatul pentru
        orice firmă, nu doar pentru a ta.
      </p>

      <h2>30 de lei la ONRC vs. 89 de lei aici — comparația onestă</h2>
      <ul>
        <li>
          <strong>Direct la ONRC:</strong> 30 lei (Ordinul MJ 380/C/2024), prin portal.onrc.ro
          sau InfoCert. Îți trebuie cont pe portal, iar drumul prin meniuri nu e scurt — dar dacă
          ai timp și cont, e varianta cea mai ieftină.
        </li>
        <li>
          <strong>Prin eGhișeul:</strong> 89 lei cu tot cu taxa ONRC. Fără cont, fără navigat prin
          portal: CUI, scop, plată cu cardul, iar certificatul vine pe email de obicei în câteva
          minute — și la 2 noaptea, și duminica. Factura se emite automat.
        </li>
      </ul>
      <p>
        Diferența de 59 de lei cumpără timpul și ora: sistemul nostru depune cererea și descarcă
        certificatul automat, non-stop. Când licitația se închide luni la 9 dimineața și tu îți
        amintești duminică seara, asta e diferența care contează.
      </p>

      <h2>Cum îl obții, pas cu pas</h2>
      <ol>
        <li>
          Intri pe{' '}
          <Link href="/comanda/certificat-constatator/?tip=de-baza">pagina de comandă</Link> —
          tipul „de bază” e deja selectat;
        </li>
        <li>Completezi CUI-ul firmei — datele se verifică automat în baza ANAF;</li>
        <li>Alegi scopul din lista ONRC (bancă, licitație, TVA…);</li>
        <li>Plătești cu cardul (Apple Pay / Google Pay merg și ele);</li>
        <li>Primești certificatul pe email, semnat electronic de ONRC.</li>
      </ol>

      <h2>De bază sau alt tip?</h2>
      <p>
        Dacă instituția a cerut explicit „certificat constatator”, fără alte precizări, de bază e
        aproape sigur ce îți trebuie. Excepțiile: fondurile IMM și dosarele de insolvență au{' '}
        <Link href="/certificat-constatator-insolventa/">rapoarte dedicate</Link>, PFA-urile și
        întreprinderile individuale primesc{' '}
        <Link href="/certificat-constatator-pfa/">certificat pe persoană fizică</Link>, iar
        istoricul complet al firmei e{' '}
        <Link href="/certificat-constatator-cu-istoric/">documentul cu istoric</Link>. Ghidul
        complet al tipurilor e{' '}
        <Link href="/cele-4-tipuri-de-certificat-constatator-online/">aici</Link>, iar toate
        variantele se comandă din pagina de{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator online</Link>.
      </p>
    </ArticleLayout>
  );
}
