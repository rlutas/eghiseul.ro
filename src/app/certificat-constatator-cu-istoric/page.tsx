import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-cu-istoric';
const TITLE = 'Certificat Constatator cu Istoric — Ce Conține, Preț, Cum Îl Obții';
const DESCRIPTION =
  'Certificatul constatator cu istoric arată toate modificările unei firme de la înființare până azi: ' +
  'asociați, sedii, capital, administratori. Când ai nevoie de el, cât costă și cum îl comanzi online.';
const DATE_PUBLISHED = '2026-07-13';
const DATE_MODIFIED = '2026-07-13';

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
      updatedLabel="13 iulie 2026"
      relatedServices={[
        { slug: 'certificat-constatator', label: 'Certificat Constatator Online', desc: 'Toate tipurile, doar cu CUI-ul firmei — comandă 24/7.' },
        { href: '/cele-4-tipuri-de-certificat-constatator-online/', label: 'Cele 4 tipuri de certificat constatator', desc: 'Ghidul complet: care tip îți trebuie și de ce.' },
        { href: '/servicii/cazier-fiscal-online/', label: 'Cazier Fiscal Online', desc: 'De la ANAF — adesea cerut împreună cu constatatorul.' },
      ]}
      faqs={[
        {
          q: 'Ce este certificatul constatator cu istoric?',
          a: 'Este varianta extinsă a certificatului constatator: pe lângă situația actuală a firmei, conține toate mențiunile înregistrate la ONRC de la înființare până în prezent — schimbări de asociați, administratori, sediu, denumire, capital social, suspendări sau reluări de activitate.',
        },
        {
          q: 'Cât costă certificatul constatator cu istoric?',
          a: 'Prin eGhișeul, 487 lei cu TVA și taxele ONRC incluse. Certificatul de bază (situația la zi, fără istoric) costă 89 lei.',
        },
        {
          q: 'Când am nevoie de istoric și când ajunge certificatul de bază?',
          a: 'Istoricul e cerut în litigii, executări silite, due diligence la achiziții de firme și dosare bancare complexe — oriunde contează cine a controlat firma în trecut. Pentru licitații, bănci sau ANAF, în majoritatea cazurilor ajunge certificatul de bază, care arată situația actuală.',
        },
        {
          q: 'Ce îmi trebuie ca să îl comand?',
          a: 'Doar CUI-ul firmei. Nu trebuie să fii asociat sau administrator — informațiile din Registrul Comerțului sunt publice.',
        },
        {
          q: 'Cât durează eliberarea?',
          a: 'Comanda se plasează online oricând, 24/7, iar certificatul cu istoric se emite automat — de obicei în câteva minute, inclusiv noaptea și în weekend.',
        },
      ]}
    >
      <p>
        Certificatul constatator obișnuit îți arată firma așa cum e azi. Cel <strong>cu istoric</strong> îți arată tot
        filmul: cine a înființat-o, prin câte mâini a trecut, ce sedii a avut, când și-a schimbat numele, când i s-a
        majorat sau redus capitalul. Pentru anumite situații, exact istoricul ăsta face diferența.
      </p>

      <h2>Ce conține, concret</h2>
      <p>Toate mențiunile înregistrate la Registrul Comerțului de la înființarea firmei:</p>
      <ul>
        <li>schimbările de <strong>asociați și acționari</strong>, cu datele fiecărei cesiuni;</li>
        <li>numirile și revocările de <strong>administratori</strong>;</li>
        <li>mutările de <strong>sediu social</strong> și schimbările de <strong>denumire</strong>;</li>
        <li>majorările și reducerile de <strong>capital social</strong>;</li>
        <li>suspendările, reluările de activitate, fuziunile, divizările;</li>
        <li>plus tot ce conține și certificatul de bază: situația actuală completă.</li>
      </ul>

      <h2>Când îți trebuie istoricul</h2>
      <p>
        În practică, documentul apare pe listă în câteva scenarii precise. Dacă nu te regăsești în ele, probabil îți
        ajunge certificatul de bază, care costă considerabil mai puțin.
      </p>
      <ul>
        <li>
          <strong>Litigii și executări silite</strong> — vrei să dovedești cine controla firma la o anumită dată, de
          exemplu când s-a semnat un contract sau s-a născut o datorie.
        </li>
        <li>
          <strong>Due diligence</strong> — cumperi o firmă sau intri în asociere și vrei să vezi tot trecutul ei, nu
          doar fotografia de azi.
        </li>
        <li>
          <strong>Recuperări de creanțe</strong> — urmărești un debitor care și-a tot mutat sediul sau și-a schimbat
          asociații.
        </li>
        <li>
          <strong>Dosare bancare sau de finanțare complexe</strong> — unele instituții cer evoluția completă a
          acționariatului.
        </li>
      </ul>

      <h2>Cât costă și cum îl obții</h2>
      <p>
        Prin <Link href="/servicii/certificat-constatator-online/">eGhișeul</Link>, certificatul constatator cu istoric
        costă <strong>487 lei cu TVA</strong>, cu taxele ONRC incluse. Îl comanzi online cu CUI-ul firmei, la orice
        oră, iar documentul se emite automat — de obicei în câteva minute, inclusiv noaptea sau în weekend. Vine pe
        email, semnat electronic de ONRC, valabil oriunde e cerut.
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
        Te interesează <em>prezentul</em> firmei (licitație, bancă, ANAF, verificare partener) → certificatul{' '}
        <Link href="/servicii/certificat-constatator-online/">de bază, 89 lei</Link>, eliberat în câteva minute.
        Te interesează <em>trecutul</em> ei (litigiu, due diligence, creanțe) → varianta cu istoric.
      </p>
      <p>
        Dacă nu ești sigur ce tip îți trebuie, am scris un{' '}
        <Link href="/cele-4-tipuri-de-certificat-constatator-online/">ghid despre toate cele 4 tipuri de certificat
        constatator</Link> — cu exemple pentru fiecare situație.
      </p>
    </ArticleLayout>
  );
}
