import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-cu-istoric';
const TITLE = 'Certificat constatator cu istoric: ce conține, preț, cum îl obții';
const DESCRIPTION =
  'Certificatul constatator cu istoric arată toate modificările unei firme de la înființare până azi: ' +
  'asociați, sedii, capital, administratori. Când ai nevoie de el, cât costă și cum îl comanzi online.';
const DATE_PUBLISHED = '2026-07-13';
const DATE_MODIFIED = '2026-08-28';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Firme & ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="13 iulie 2026"
      updatedLabel="28 august 2026"
      relatedServices={[
        { slug: 'certificat-constatator', label: 'Certificat Constatator Online', desc: 'Toate tipurile, doar cu CUI-ul firmei, comandă 24/7.' },
        { href: '/cele-4-tipuri-de-certificat-constatator-online/', label: 'Cele 4 tipuri de certificat constatator', desc: 'Ghidul complet: care tip îți trebuie și de ce.' },
        { href: '/servicii/cazier-fiscal-online/', label: 'Cazier Fiscal Online', desc: 'De la ANAF, adesea cerut împreună cu constatatorul.' },
      ]}
      faqs={[
        {
          q: 'Ce este certificatul constatator cu istoric?',
          a: 'Este varianta extinsă a certificatului constatator: pe lângă situația actuală a firmei, conține toate mențiunile înregistrate la ONRC de la înființare până în prezent: schimbări de asociați, administratori, sediu, denumire, capital social, suspendări sau reluări de activitate.',
        },
        {
          q: 'Cât costă certificatul constatator cu istoric?',
          a: 'Prin eGhișeul, 487 lei cu TVA și taxele ONRC incluse. Certificatul de bază (situația la zi, fără istoric) costă 89 lei.',
        },
        {
          q: 'Când am nevoie de istoric și când ajunge certificatul de bază?',
          a: 'Istoricul e cerut în litigii, executări silite, due diligence la achiziții de firme și dosare bancare complexe, adică oriunde contează cine a controlat firma în trecut. Pentru licitații, bănci sau ANAF, în majoritatea cazurilor ajunge certificatul de bază, care arată situația actuală.',
        },
        {
          q: 'Ce îmi trebuie ca să îl comand?',
          a: 'Doar CUI-ul firmei. Nu trebuie să fii asociat sau administrator, pentru că informațiile din Registrul Comerțului sunt publice.',
        },
        {
          q: 'Cât durează eliberarea?',
          a: 'Comanda se plasează online oricând, 24/7, iar certificatul cu istoric se emite automat, de obicei în câteva minute, inclusiv noaptea și în weekend.',
        },
      ]}
    >
      <p>
        Certificatul constatator obișnuit îți arată firma așa cum e azi. Cel cu istoric îți arată tot
        filmul: cine a înființat-o, prin câte mâini a trecut, ce sedii a avut, când și-a schimbat numele, când i s-a
        majorat sau redus capitalul. Pentru anumite situații, exact istoricul ăsta face diferența.
      </p>

      <h2>Ce conține, concret</h2>
      <p>
        Documentul cuprinde toate mențiunile înregistrate la Registrul Comerțului de la înființarea
        firmei: schimbările de asociați și acționari cu datele fiecărei cesiuni, numirile și
        revocările de administratori, mutările de sediu social, schimbările de denumire, majorările
        și reducerile de capital, suspendările și reluările de activitate, fuziunile și divizările.
        La toate astea se adaugă tot ce conține și certificatul de bază, adică situația actuală
        completă a firmei.
      </p>
      <p>
        Mențiunile apar în ordine cronologică, fiecare cu numărul și data înregistrării la ONRC. La
        o firmă de 20 de ani cu acționariat agitat, documentul poate avea zeci de pagini; la un SRL
        tânăr cu un singur asociat, câteva. Prețul e însă același, indiferent de lungime.
      </p>

      <h2>Când îți trebuie istoricul</h2>
      <p>
        În practică, documentul apare pe listă în câteva scenarii precise. Dacă nu te regăsești în ele, probabil îți
        ajunge certificatul de bază, care costă considerabil mai puțin.
      </p>
      <p>
        Primul: litigii și executări silite, unde vrei să dovedești cine controla firma la o anumită
        dată, de exemplu când s-a semnat contractul sau s-a născut datoria. Al doilea: due
        diligence. Cumperi o firmă sau intri în asociere și vrei să vezi tot trecutul ei, nu doar
        fotografia de azi; un sediu mutat de cinci ori în trei ani sau cesiuni în lanț chiar înainte
        de vânzare sunt lucruri care se văd doar aici. Al treilea: recuperări de creanțe, când
        urmărești un debitor care și-a tot schimbat asociații. Și al patrulea: dosare bancare sau de
        finanțare complexe, unde unele instituții cer evoluția completă a acționariatului.
      </p>

      <h2>Cât costă și cum îl obții</h2>
      <p>
        Prin <Link href="/servicii/certificat-constatator-online/">eGhișeul</Link>, certificatul constatator cu istoric
        costă 487 lei cu TVA, cu taxele ONRC incluse. Îl comanzi online cu CUI-ul firmei, la orice
        oră, iar documentul se emite automat, de obicei în câteva minute, inclusiv noaptea sau în weekend. Vine pe
        email, semnat electronic de ONRC, valabil oriunde e cerut.
      </p>
      <p>
        Un detaliu util: istoricul se poate cere și pe o perioadă anume, nu doar de la înființare
        până azi. Dacă procesul tău privește doar anii 2019-2021, poți limita raportul la intervalul
        ăla. Iar pentru o firmă radiată, mențiunile rămân în registru, deci istoricul se eliberează
        în continuare; e chiar situația tipică în recuperările de creanțe.
      </p>
      <p>
        Alternativa clasică:{' '}
        <a href="https://www.onrc.ro/index.php/ro/informatii/certificate-constatatoare" rel="noopener" target="_blank">
          portalul ONRC
        </a>
        , unde ai nevoie de cont, sau ghișeul Registrului Comerțului, în programul de lucru. Taxele oficiale sunt mai
        mici pe cont propriu, dar procesul cere cont validat și răbdare cu formularele.
      </p>

      <h2>Istoric sau de bază? Regula simplă</h2>
      <p>
        Dacă te interesează prezentul firmei (licitație, bancă, ANAF, verificare partener), ia
        certificatul <Link href="/servicii/certificat-constatator-online/">de bază, 89 lei</Link>,
        eliberat în câteva minute. Dacă te interesează trecutul ei (litigiu, due diligence,
        creanțe), ia varianta cu istoric.
      </p>
      <p>
        Dacă nu ești sigur ce tip îți trebuie, am scris un{' '}
        <Link href="/cele-4-tipuri-de-certificat-constatator-online/">ghid despre toate tipurile de certificat
        constatator</Link>, cu exemple pentru fiecare situație.
      </p>
    </ArticleLayout>
  );
}
