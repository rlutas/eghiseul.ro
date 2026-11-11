import Link from 'next/link';
import { ConstatatorGuide, GuideLink } from '@/components/constatator/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorArticleGraph } from '@/lib/seo/constatator-schema';
import { getConstatatorPrices } from '@/lib/constatator/pricing';
import { lei } from '@/lib/documentero/services';
import { CONSTATATOR_INDEXABLE, CONSTATATOR_ORDER_HREF } from '@/config/constatator-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/raport-istoric-onrc/';
const PUBLISHED = '2026-12-09';
const UPDATED = '2026-12-09';
const TITLE = 'Raport istoric ONRC: ce conține, cât costă și cât durează';
const DESCRIPTION =
  'Raportul istoric ONRC arată toate înregistrările unei firme, în ordine cronologică, plus situația la zi. Taxa e de 250 de lei, iar ONRC îl emite în cel mult 30 de zile.';

export const metadata = buildPageMetadata({ brand: 'constatator', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CONSTATATOR_INDEXABLE });

/**
 * Facts checked 11.11.2026: ONRC "Informații RC" section I (definition, 250
 * lei/firmă, at most 30 days "în funcție de complexitatea lucrării", pct. 4.2
 * with one box ticked, channels e-mail / fax / poștă + 9,78 lei / ghișeu;
 * InfoCert is not listed for it); form 11-10-188 pct. 4.2 and footnote 2
 * (1990–1998 archive, computerised register since 1998); Ordin MJ 380/C/2024
 * annex pct. 2. Our "cu istoric" product = the ONRC raport istoric, handled
 * by the team; timing depends on ONRC, so no speed promise.
 */
const SOURCES = [
  ['ONRC: Informații din registrul comerțului, raportul istoric (conținut, tarif, termen)', 'https://onrc.ro/index.php/ro/informatii/informatii-rc'],
  ['ONRC: formularul 11-10-188, cerere de eliberare acte și informații (PDF)', 'https://www.onrc.ro/templates/site/formulare/11-10-188.pdf'],
  ['Ordinul ministrului justiției nr. 380/C/2024: tarifele ONRC', 'https://www.onrc.ro/documente/legislatie/Ordin%20nr.%20380.doc'],
  ['ONRC: Certificate constatatoare (pentru comparație)', 'https://onrc.ro/index.php/ro/informatii/certificate-constatatoare'],
] as const;

export default async function Page() {
  const p = await getConstatatorPrices();
  const graph = constatatorArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    citations: SOURCES,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Raport istoric', path: PATH }],
  });
  return (
    <ConstatatorGuide
      path={PATH}
      crumb="Raport istoric"
      title={TITLE}
      lead="Certificatul constatator îți spune cum arată o firmă azi. Raportul istoric îți spune și cum a ajuns așa: fiecare înregistrare făcută la registru, de la înființare sau dintr-o perioadă aleasă. E mai scump și durează mai mult, deci merită să știi exact când îți trebuie."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.istoric)}
      summary={[
        <>Raportul istoric cuprinde toate înregistrările din registrul comerțului pentru o firmă, în ordine cronologică, completate cu situația la zi.</>,
        <>Taxa ONRC e de 250 de lei pe firmă (Ordinul MJ 380/C/2024, anexa, pct. 2).</>,
        <>ONRC îl emite în cel mult 30 de zile de la înregistrarea cererii, în funcție de complexitate.</>,
        <>Îl ceri pe toată durata firmei sau pe o perioadă aleasă, bifând o singură căsuță la pct. 4.2 din formular.</>,
      ]}
      toc={[
        ['ce-este', 'Ce este raportul istoric'],
        ['fata-de-certificat', 'Față de certificatul constatator'],
        ['cat-costa', 'Cât costă și cât durează'],
        ['cum-se-cere', 'Cum se cere la ONRC'],
        ['inainte-de-1998', 'Firmele vechi: perioada 1990–1998'],
        ['cand-iti-trebuie', 'Când îți trebuie'],
      ]}
      readMinutes={5}
      orderLead="Raportul istoric îl poți cere și prin noi, cu taxa ONRC și TVA-ul incluse. Echipa depune cererea în programul de lucru, iar raportul îți vine pe email, ca PDF, când îl emite ONRC."
    >
      <h2 id="ce-este">Ce este raportul istoric</h2>
      <p>
        Pe pagina ONRC, raportul istoric e descris ca „informaţii despre toate înregistrările efectuate în registrul
        comerţului în dreptul unei firme, prezentate în ordine cronologică şi completate cu situaţia la zi”. Pe
        formular apare ca „Raport istoric despre profesionist”, deci se poate cere și pentru un PFA sau o
        întreprindere individuală, nu doar pentru o societate.
      </p>
      <p>
        Fiecare modificare înregistrată la o firmă lasă o urmă în registru: un administrator numit sau revocat, un
        asociat care intră sau iese, o mutare de sediu, o schimbare de denumire, activități noi, o majorare de
        capital, o suspendare. Raportul istoric le pune pe toate într-o listă, în ordinea în care s-au întâmplat, iar
        la final adaugă situația de azi.
      </p>

      <h2 id="fata-de-certificat">Față de certificatul constatator</h2>
      <p>Cele două documente se completează, nu se înlocuiesc:</p>
      <ul>
        <li>
          <strong>Certificatul constatator</strong> „prezintă starea la zi a firmei”, cum spune ONRC. Vezi cine e
          administrator azi, nu cine a fost acum cinci ani. Costă 30 de lei și, online, se emite automat.
        </li>
        <li>
          <strong>Raportul istoric</strong> arată drumul până azi. Costă 250 de lei și îl pregătește ONRC, în cel mult
          30 de zile.
        </li>
      </ul>
      <p>
        Dacă cineva îți cere un certificat „extins” sau „cu istoric”, întreabă dacă vrea de fapt raportul istoric. Am
        explicat diferențele în ghidul despre{' '}
        <GuideLink href="/ghiduri/certificat-constatator-extins/">certificatul constatator „extins”</GuideLink>.
      </p>

      <h2 id="cat-costa">Cât costă și cât durează</h2>
      <p>
        Taxa ONRC e de 250 de lei pentru o firmă (Ordinul MJ 380/C/2024, anexa, pct. 2). Nu depinde de câți ani are
        firma sau de câte înregistrări are.
      </p>
      <p>
        Termenul e mai lung decât la certificat. Pagina ONRC spune că raportul „se eliberează în termen de maximum 30
        de zile de la data înregistrării cererii, în funcție de complexitatea lucrării”. O firmă înființată anul
        trecut, cu două-trei modificări, nu e același volum de lucru ca una cu treizeci de ani de istorie. ONRC nu
        publică un termen mai scurt garantat, așa că nici noi nu promitem unul.
      </p>
      <p>
        Practic: dacă raportul îți trebuie într-un dosar cu termen, cere-l cât mai devreme. Spre deosebire de
        certificatul constatator, aici întârzierea vine de la timpul de emitere, nu de la valabilitate.
      </p>

      <h2 id="cum-se-cere">Cum se cere la ONRC</h2>
      <p>
        Se folosește același formular ca la certificat, 11-10-188. La pct. 2 treci profesionistul, cu numărul de
        ordine din registru și CUI-ul. La pct. 4.2, „Raport istoric despre profesionist”, bifezi o singură variantă:
      </p>
      <ul>
        <li>„de la înființare până în prezent”, pentru tot istoricul firmei;</li>
        <li>„în perioada”, unde scrii intervalul care te interesează.</li>
      </ul>
      <p>
        Pagina ONRC listează patru căi de depunere pentru raportul istoric: prin email, prin fax, prin poștă, cu un
        tarif auxiliar de 9,78 lei, sau la ghișeul ONRC ori al unui oficiu al registrului comerțului de pe lângă
        tribunale. Serviciul online InfoCert, cel prin care certificatul constatator se emite automat, nu apare la
        raportul istoric.
      </p>
      <p>
        Dacă ceri prin email sau prin poștă, cererea trebuie însoțită de o copie a actului de identitate, cu excepția
        celor semnate cu semnătură electronică calificată (Legea 265/2022, art. 11 alin. 2).
      </p>

      <h2 id="inainte-de-1998">Firmele vechi: perioada 1990–1998</h2>
      <p>
        Formularul ONRC are o notă importantă pentru firmele înființate în anii &apos;90: pentru perioada 1990–1998
        poți cere, în copie sau în copie certificată, documentele arhivate la dosarul firmei. Motivul dat de ONRC e
        că obligația de a ține registrul comerțului computerizat a apărut abia în 1998.
      </p>
      <p>
        Dacă te interesează exact ce s-a întâmplat la o firmă în primii ei ani, raportul istoric singur poate să nu
        fie suficient. Copiile actelor din dosar se cer separat, tot pe formularul 11-10-188, la punctele 4.4 și 4.5.
      </p>

      <h2 id="cand-iti-trebuie">Când îți trebuie</h2>
      <p>
        Raportul istoric îl ceri când contează trecutul firmei, nu doar starea ei de azi. Câteva situații tipice:
      </p>
      <ul>
        <li>o instituție sau un partener îți cere explicit „raport istoric” sau „istoricul mențiunilor”;</li>
        <li>vrei să vezi cine a condus o firmă într-o anumită perioadă, de exemplu înainte să cumperi părți sociale;</li>
        <li>verifici când s-a mutat sediul sau când s-au schimbat asociații, pentru un litigiu sau pentru un audit;</li>
        <li>ai nevoie de dovada că o persoană a fost administrator într-un anumit interval.</li>
      </ul>
      <p>
        Dacă îți trebuie doar situația de azi, nu plăti pentru istoric. Certificatul constatator e suficient și îl ai
        în câteva minute. Despre cât timp rămâne bun, vezi{' '}
        <GuideLink href="/ghiduri/valabilitate-certificat-constatator/">valabilitatea certificatului constatator</GuideLink>.
      </p>
      <p>
        La noi, raportul istoric costă {lei(p.istoric)} lei, cu taxa ONRC de 250 de lei și TVA-ul incluse. Comanda
        o preia echipa, în programul de lucru, iar raportul vine pe email când îl emite ONRC. Certificatul pe firmă,
        pentru situația la zi, costă {lei(p.firma)} lei. Poți{' '}
        <Link href={CONSTATATOR_ORDER_HREF}>comanda raportul istoric</Link> din același formular sau vedea toate
        variantele pe <Link href="/">pagina principală</Link>.
      </p>
    </ConstatatorGuide>
  );
}
