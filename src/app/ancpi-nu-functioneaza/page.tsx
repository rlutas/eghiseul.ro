import Link from 'next/link';
import Image from 'next/image';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { SystemStatus } from '@/components/services/system-status';

const SLUG = 'ancpi-nu-functioneaza';
// H1 — descriptive. The SERP <title> is shorter (META_TITLE): the long one
// was 72 chars and Google rewrote it into a lowercase tail fragment.
const TITLE = 'ANCPI nu funcționează: cădere națională a sistemelor (13–20 iulie 2026)';
const META_TITLE = 'ANCPI Nu Funcționează — Până Când e Picat și Ce Poți Face';
const DESCRIPTION =
  'Sistemele ANCPI sunt picate național din 13 iulie; revenire estimată: 20 iulie 2026. Comandă extrasul CF acum — îl eliberăm automat la revenire și îl primești pe email, fără să urmărești tu site-urile.';
const DATE_PUBLISHED = '2026-07-15';
const DATE_MODIFIED = '2026-07-17';

export const revalidate = 3600; // outage news — refresh hourly

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="15 iulie 2026"
      updatedLabel="17 iulie 2026"
      imageAlt="Sistem temporar nefuncțional — sistemele informatice ANCPI indisponibile la nivel național"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Comanda se pune în coadă și se eliberează automat, cu prioritate, la revenirea ANCPI.',
        },
        {
          slug: 'identificare-imobil',
          label: 'Identificare Imobil',
          desc: 'Afli numărul de CF și cadastral după adresă.',
        },
        {
          href: '/calculator/valabilitate-documente/',
          label: 'Mai e valabil documentul meu?',
          desc: 'Verifică dacă extrasul CF sau cazierul tău mai e în termen.',
        },
      ]}
      faqs={[
        {
          q: 'De ce nu funcționează ANCPI?',
          a: 'ANCPI a comunicat oficial că „o parte din sistemele informatice sunt temporar indisponibile, ca urmare a unui incident tehnic aflat în curs de investigare". Natura exactă a incidentului nu a fost făcută publică. Căderea afectează aplicațiile la nivel național, nu doar un județ.',
        },
        {
          q: 'Până când e picat ANCPI?',
          a: 'Oficiile teritoriale (OCPI) au comunicat prin informările oficiale că aplicațiile nu vor fi funcționale până în data de 20 iulie 2026. Termenul poate fi scurtat sau prelungit — ANCPI a promis informații actualizate.',
        },
        {
          q: 'Pot obține un extras de carte funciară în această perioadă?',
          a: 'Nu, din nicio sursă — nici de la ghișeul OCPI, nici prin ANCPI online, nici prin intermediari, pentru că toate folosesc aceleași sisteme centrale. Poți plasa comanda acum: intră în coadă și se eliberează automat, cu prioritate, imediat ce sistemele revin.',
        },
        {
          q: 'Cum primesc extrasul CF fără să urmăresc eu revenirea ANCPI?',
          a: 'Plasezi comanda pe eGhișeul acum și ai terminat: intră în coadă cu prioritate, iar sistemul nostru monitorizează ANCPI continuu și eliberează documentul automat în momentul revenirii. Îl primești pe email — nu trebuie să verifici site-urile sau să reiei comanda.',
        },
        {
          q: 'Ce se întâmplă cu tranzacțiile imobiliare programate?',
          a: 'Notarii nu pot obține extrasele de autentificare, deci semnările programate în acest interval se amână de regulă după restabilirea sistemelor. OCPI-urile au recomandat oficial reprogramarea operațiunilor.',
        },
        {
          q: 'Am comandat un extras CF pe eGhișeul înainte de cădere. Ce se întâmplă cu el?',
          a: 'Nimic de făcut din partea ta: comanda e în coadă și sistemul nostru încearcă automat eliberarea imediat ce ANCPI revine. Primești documentul pe email fără să reiei comanda. Am notificat separat clienții cu comenzi în așteptare.',
        },
        {
          q: 'Extrasul CF pe care îl am deja mai e valabil?',
          a: 'Extrasul de informare nu are termen legal de valabilitate, dar instituțiile cer de regulă unul de maximum 30 de zile. Verifică rapid cu calculatorul nostru de valabilitate. Extrasul de autentificare (notar) e valabil 10 zile lucrătoare.',
        },
      ]}
    >
      <h2>Ce s-a întâmplat, pe scurt</h2>
      <p>
        Din noaptea de <strong>duminică, 13 iulie 2026</strong>, sistemele informatice ale ANCPI
        (Agenția Națională de Cadastru și Publicitate Imobiliară) sunt indisponibile{' '}
        <strong>la nivel național</strong>. Monitorizarea noastră automată, care verifică
        constant portalul ePay ANCPI, a înregistrat căderea la <strong>ora 23:02</strong> — de
        atunci, serverele agenției nu mai răspund.
      </p>
      <p>
        Oficiile teritoriale au confirmat oficial: aplicațiile ANCPI{' '}
        <strong>nu vor fi funcționale până în 20 iulie 2026</strong>, „ca urmare a unui incident
        tehnic aflat în curs de investigare”. Presa locală a relatat blocajul în mai multe județe
        (printre primele,{' '}
        <a href="https://www.bihon.ro/stirile-judetului-bihor/bihorul-afectat-de-blocajul-national-al-ancpi-cadastrul-nu-functioneaza-pana-luni-5337687/" target="_blank" rel="nofollow noopener">
          Bihorul
        </a>
        ), dar problema e centrală — aceleași sisteme deservesc toate OCPI-urile din țară.
      </p>

      {/* CTA principal — mesajul care ne diferențiază în SERP-ul de outage:
          nu aștepta tu revenirea, comanda intră în coadă și se livrează singură. */}
      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Nu sta să urmărești când revine ANCPI — urmărim noi pentru tine
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Plasezi comanda de extras CF acum și ai terminat: intră în coadă cu prioritate, iar în
          secunda în care sistemele ANCPI revin, platforma noastră o eliberează <strong>automat</strong> și
          primești documentul pe email. Fără refresh la site-uri, fără drumuri, fără să reiei
          comanda.
        </p>
        <Link
          href="/comanda/extras-carte-funciara/"
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Comandă extras CF — se eliberează automat la revenire →
        </Link>
      </div>

      <figure className="not-prose my-6">
        <Image
          src="/images/articole/ancpi-informare-oficiala-iulie-2026.webp"
          alt="Informarea oficială ANCPI/OCPI: aplicațiile informatice nu vor fi funcționale până în 20.07.2026, sistem temporar nefuncțional"
          width={1200}
          height={800}
          className="w-full rounded-xl border border-neutral-200"
        />
        <figcaption className="mt-2 text-center text-sm text-neutral-500">
          Informarea oficială distribuită de oficiile teritoriale ANCPI (aici, OCPI Bihor): sistemele
          nefuncționale până în 20.07.2026.
        </figcaption>
      </figure>

      <h2>Starea sistemelor ANCPI, în timp real</h2>
      <p>
        Monitorizarea noastră verifică portalul ANCPI continuu — indicatorul de mai jos e live, cu
        momentul exact de la care sistemele sunt indisponibile:
      </p>
      <div className="not-prose my-6">
        <SystemStatus service="ancpi" />
      </div>

      <h2>Ce nu funcționează în acest interval</h2>
      <ul>
        <li>eliberarea extraselor de carte funciară (informare și autentificare) — online și la ghișeu;</li>
        <li>recepțiile cadastrale și înscrierile în cartea funciară (intabulări, notări, radieri);</li>
        <li>eTerra, ePay și geoportalul ANCPI;</li>
        <li>implicit: autentificările notariale care au nevoie de extras de autentificare — semnările se reprogramează.</li>
      </ul>
      <p>
        Important de înțeles: <strong>nimeni nu poate ocoli căderea</strong>. Ghișeul OCPI,
        platformele online și intermediarii folosesc toți aceleași sisteme centrale. Cine promite
        „extras CF acum” în acest interval nu are cum să livreze.
      </p>

      <h2>Ce facem noi cu comenzile din această perioadă</h2>
      <p>
        Platforma noastră eliberează extrasele automat, direct din sistemele ANCPI — deci și noi
        depindem de revenirea lor. Ce am făcut:
      </p>
      <ul>
        <li>
          <strong>Statusul e afișat transparent</strong> pe paginile de comandă: indicatorul „Portal
          ANCPI” arată roșu, în timp real, cât timp sistemele sunt picate.
        </li>
        <li>
          <strong>Comenzile plasate acum intră în coadă</strong> și se eliberează automat, cu
          prioritate, în momentul în care ANCPI revine — nu trebuie să reiei comanda sau să ne
          suni.
        </li>
        <li>
          <strong>Clienții cu comenzi în așteptare au fost notificați</strong> pe email despre
          situație și despre noul termen estimat.
        </li>
      </ul>
      <p>
        Dacă ai nevoie de document imediat ce revine sistemul, cel mai sigur e să{' '}
        <Link href="/comanda/extras-carte-funciara/">plasezi comanda de pe acum</Link> — coada se
        procesează în ordinea plasării, iar tu primești extrasul pe email fără să mai faci nimic.
        Detalii despre serviciu:{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link>.
      </p>

      <h2>Ce poți face între timp</h2>
      <ul>
        <li>
          <strong>Verifică documentele existente:</strong> poate extrasul pe care îl ai deja e încă
          în termen —{' '}
          <Link href="/calculator/valabilitate-documente/">calculatorul de valabilitate</Link> îți
          spune în 5 secunde.
        </li>
        <li>
          <strong>Pregătește dosarul:</strong> dacă urmează cadastru/intabulare, folosește pauza ca
          să aduni actele —{' '}
          <Link href="/cat-costa-cadastrul-si-intabularea/">ghidul nostru cu checklist descărcabil</Link>{' '}
          le listează pe scenarii.
        </li>
        <li>
          <strong>Amână depunerile fizice:</strong> OCPI-urile au recomandat oficial reprogramarea
          operațiunilor programate în acest interval.
        </li>
      </ul>

      <h2>Actualizări</h2>
      <p>
        <strong>17 iulie 2026:</strong> sistemele rămân indisponibile; estimarea oficială de
        revenire rămâne 20 iulie 2026. Comenzile plasate în această perioadă se acumulează în
        coadă și se vor procesa automat, în ordinea plasării, la revenire.
      </p>
      <p>
        <strong>15 iulie 2026:</strong> oficiile teritoriale au confirmat oficial indisponibilitatea
        și estimarea de revenire 20 iulie 2026. Actualizăm articolul când ANCPI publică informații
        noi sau când monitorizarea noastră detectează revenirea sistemelor.
      </p>
    </ArticleLayout>
  );
}
