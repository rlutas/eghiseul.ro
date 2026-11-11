import Link from 'next/link';
import { ConstatatorGuide, GuideLink } from '@/components/constatator/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorArticleGraph } from '@/lib/seo/constatator-schema';
import { getConstatatorPrices } from '@/lib/constatator/pricing';
import { lei } from '@/lib/documentero/services';
import { CONSTATATOR_INDEXABLE, CONSTATATOR_ORDER_HREF } from '@/config/constatator-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/certificat-constatator-pfa-punct-de-lucru/';
const PUBLISHED = '2026-11-25';
const UPDATED = '2026-11-25';
const TITLE = 'Certificat constatator PFA și punct de lucru: ce document îți trebuie';
const DESCRIPTION =
  'Pentru PFA și punct de lucru există două certificate constatatoare: cel de informare, de 30 de lei, și cel care atestă declarația pentru sediu, primit la înregistrare. Cum le deosebești.';

export const metadata = buildPageMetadata({ brand: 'constatator', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CONSTATATOR_INDEXABLE });

/**
 * Facts checked 11.11.2026: Legea 265/2022 art. 4 alin. 1, art. 7 alin. 1
 * lit. c, art. 11 alin. 1, art. 121 alin. 1, art. 122 alin. 1, 4, 7, 9
 * (consolidated text); ONRC "Certificate constatatoare" (contents list, 30
 * lei); ONRC "Informații RC" section IV (duplicates of the art. 122
 * certificate: legal representative, proof of a newspaper notice); form
 * 11-10-188 pct. 2 / pct. 3. The ONRC contents list names "directori/
 * reprezentanți pentru sucursale/subunități/sedii secundare" but does not say
 * the address of each punct de lucru is printed, so the page does not claim it.
 * We do not obtain the art. 122 certificate or its duplicate.
 */
const SOURCES = [
  ['Legea nr. 265/2022 privind registrul comerțului, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocumentAfis/288036'],
  ['ONRC: Certificate constatatoare (conținut, tarif)', 'https://onrc.ro/index.php/ro/informatii/certificate-constatatoare'],
  ['ONRC: Informații din registrul comerțului (raport istoric, copii, duplicate)', 'https://onrc.ro/index.php/ro/informatii/informatii-rc'],
  ['ONRC: formularul 11-10-188, cerere de eliberare acte și informații (PDF)', 'https://www.onrc.ro/templates/site/formulare/11-10-188.pdf'],
  ['Ordinul ministrului justiției nr. 380/C/2024: tarifele ONRC', 'https://www.onrc.ro/documente/legislatie/Ordin%20nr.%20380.doc'],
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
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'PFA și punct de lucru', path: PATH }],
  });
  return (
    <ConstatatorGuide
      path={PATH}
      crumb="PFA și punct de lucru"
      title={TITLE}
      lead="Când ți se cere „certificatul constatator al PFA-ului” sau „certificatul constatator pentru punctul de lucru”, pot fi două documente diferite. Unul îl primești o singură dată, la înregistrare. Pe celălalt îl ceri oricând, pentru 30 de lei. Iată cum le deosebești și pe care îl comanzi."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.firma)}
      summary={[
        <>PFA-ul, întreprinderea individuală și cea familială sunt înregistrate la Registrul Comerțului, cu sediul profesional și punctele de lucru (Legea 265/2022, art. 7).</>,
        <>Certificatul constatator de informare se cere oricând și costă 30 de lei, la fel ca pentru un SRL.</>,
        <>La înregistrarea unui sediu sau a unui punct de lucru, ONRC eliberează un alt certificat constatator, care atestă declarația pe propria răspundere (art. 122 alin. 7).</>,
        <>Dacă l-ai pierdut pe al doilea, ceri un duplicat de la ONRC. Pe acesta nu îl obținem noi.</>,
      ]}
      toc={[
        ['pfa-in-registru', 'PFA-ul e în registrul comerțului'],
        ['doua-documente', 'Două documente cu același nume'],
        ['certificatul-de-informare', 'Certificatul de informare'],
        ['certificatul-de-sediu', 'Certificatul pentru sediu și punct de lucru'],
        ['duplicat', 'Dacă ai pierdut certificatul de la înregistrare'],
        ['pe-care-il-ceri', 'Pe care îl ceri'],
      ]}
      readMinutes={6}
      orderLead="Dacă ți se cere certificatul de informare, cu situația la zi a PFA-ului sau a firmei, îl comanzi aici pe CUI. Formularul recunoaște CUI-ul unui PFA și îți spune ce variantă să alegi. Certificatul vine pe email, ca PDF semnat."
    >
      <h2 id="pfa-in-registru">PFA-ul e în registrul comerțului</h2>
      <p>
        Persoana fizică autorizată, întreprinderea individuală și întreprinderea familială nu sunt societăți, dar sunt
        înregistrate tot la Registrul Comerțului. Legea le numește „profesioniști”, alături de SRL-uri și de
        celelalte societăți (Legea 265/2022, art. 4 alin. 1). Au un registru separat, în care se trec cu sediul
        profesional și, după caz, cu punctele de lucru din România (art. 7 alin. 1 lit. c).
      </p>
      <p>
        Pentru tine, asta înseamnă două lucruri. Primul: despre un PFA se pot cere aceleași documente ca despre o
        firmă, inclusiv certificat constatator. Al doilea: punctul de lucru nu e o entitate separată în registru. E
        înregistrat la PFA-ul sau la firma de care ține, deci orice certificat despre el pornește de la acel
        profesionist.
      </p>

      <h2 id="doua-documente">Două documente cu același nume</h2>
      <p>
        În legea registrului comerțului, „certificat constatator” apare în două sensuri, și de aici vin cele mai multe
        confuzii:
      </p>
      <ul>
        <li>
          <strong>Certificatul constatator de informare.</strong> Îl eliberează oficiul registrului comerțului, la
          cererea oricui, despre datele înregistrate (art. 11 alin. 1). Arată situația la zi și se poate cere de
          câte ori ai nevoie.
        </li>
        <li>
          <strong>Certificatul constatator pentru sediu.</strong> Îl primești odată cu înregistrarea, pentru sediul
          profesional și pentru fiecare sediu secundar, ca dovadă că s-a înregistrat declarația pe propria
          răspundere despre condițiile de funcționare (art. 122 alin. 7).
        </li>
      </ul>
      <p>
        Când cineva îți cere „certificatul constatator pentru punctul de lucru”, întreabă-l dacă vrea dovada
        autorizării activității la acel punct, adică al doilea document, sau doar o situație la zi a PFA-ului, adică
        primul. Răspunsul hotărăște de unde îl iei.
      </p>

      <h2 id="certificatul-de-informare">Certificatul de informare</h2>
      <p>
        E documentul pe care îl ceri de obicei pentru bancă, leasing, licitații sau finanțări. Pagina ONRC spune că
        „prezintă starea la zi a firmei” și enumeră ce conține, printre altele: denumirea, numărul de ordine din
        registru, CUI-ul, forma juridică, starea, activitatea principală și cele secundare, activitățile autorizate,
        reprezentanții pentru sucursale, subunități și sedii secundare. Lista completă e în ghidul despre{' '}
        <GuideLink href="/ghiduri/certificat-constatator-extins/">ce conține certificatul constatator</GuideLink>.
      </p>
      <p>
        Taxa ONRC e de 30 de lei, aceeași pentru SRL, PFA, II sau IF (Ordinul MJ 380/C/2024, anexa, pct. 1). Pe
        formularul ONRC de cerere, 11-10-188, alegi la început pentru cine ceri: pentru un profesionist, cu numărul
        de ordine și CUI-ul lui (pct. 2), sau pentru o persoană fizică, după CNP (pct. 3). Al doilea arată în ce
        firme apare persoana, nu situația unui anumit PFA.
      </p>
      <p>
        Activitățile autorizate din certificat sunt cele pentru care s-a înregistrat declarația pe propria
        răspundere. ONRC nu precizează pe pagina lui, rând cu rând, cum apare fiecare punct de lucru în
        certificatul de informare, așa că nu îți promitem un anumit format. Dacă instituția vrea să vadă un anumit
        punct de lucru, verifică după emitere că apare acolo unde are nevoie.
      </p>

      <h2 id="certificatul-de-sediu">Certificatul pentru sediu și punct de lucru</h2>
      <p>
        Legea leagă autorizarea funcționării de o declarație-tip pe propria răspundere. O depui odată cu cererea de
        înregistrare și îți asumi prin ea că desfășori legal activitățile declarate, la sediul profesional, la
        sediile secundare sau în afara lor (art. 121 alin. 1 și art. 122 alin. 1). Declarația o semnează, la un PFA,
        chiar persoana care cere înregistrarea, iar la o întreprindere individuală, titularul (art. 122 alin. 3).
      </p>
      <p>
        Odată cu încheierea registratorului, oficiul îți eliberează certificatul de înregistrare sau de mențiuni și,
        pentru fiecare sediu, un certificat constatator care atestă că declarația s-a înregistrat (art. 122 alin.
        7). Pe varianta de hârtie se aplică timbru sec. Pe cea electronică, timbrul sec e înlocuit cu sigiliul
        electronic calificat (alin. 9).
      </p>
      <p>
        O declarație nouă, deci și un certificat nou de acest tip, îți trebuie când (alin. 4):
      </p>
      <ul>
        <li>schimbi obiectul de activitate sau activitățile autorizate;</li>
        <li>muți sediul profesional;</li>
        <li>deschizi un sediu secundar nou, de exemplu un punct de lucru;</li>
        <li>întrerupi temporar activitatea PFA-ului, a întreprinderii individuale sau familiale, ori o reiei.</li>
      </ul>
      <p>
        Acest certificat nu se comandă separat, ca un document de informare. Vine la pachet cu înregistrarea pe care
        o faci la registru.
      </p>

      <h2 id="duplicat">Dacă ai pierdut certificatul de la înregistrare</h2>
      <p>
        ONRC eliberează duplicate ale certificatelor constatatoare care atestă depunerea declarațiilor pe propria
        răspundere. Condițiile sunt pe pagina ONRC cu informații din registru:
      </p>
      <ul>
        <li>duplicatul îl primește reprezentantul legal al firmei sau al PFA-ului, II-ului ori IF-ului;</li>
        <li>trebuie să depui dovada că ai publicat într-un ziar de largă circulație anunțul despre pierdere, furt sau distrugere;</li>
        <li>cererea se face la ghișeul oficiului registrului comerțului sau prin poștă.</li>
      </ul>
      <p>
        Atenție la diferență: pentru certificatul de înregistrare nu se eliberează duplicat. Dacă l-ai pierdut, ceri
        un certificat de înregistrare nou, tot cu dovada anunțului din ziar.
      </p>
      <p>
        Duplicatele și certificatele de la înregistrare nu le obținem noi. Le ceri direct de la oficiul registrului
        comerțului.
      </p>

      <h2 id="pe-care-il-ceri">Pe care îl ceri</h2>
      <p>Pe scurt, după ce îți cere instituția:</p>
      <ul>
        <li>
          „Certificat constatator” fără alte precizări, sau cu un termen de tipul „emis în ultimele 30 de zile”: e
          certificatul de informare. Despre termen, vezi{' '}
          <GuideLink href="/ghiduri/valabilitate-certificat-constatator/">cât e valabil certificatul constatator</GuideLink>.
        </li>
        <li>
          „Certificatul constatator privind autorizarea funcționării” sau „cel primit la înregistrarea punctului de
          lucru”: e documentul de la art. 122, pe care îl ai deja sau pentru care ceri duplicat.
        </li>
        <li>Situația unei persoane, în ce firme e asociat sau administrator: e certificatul pe persoană fizică, după CNP.</li>
      </ul>
      <p>
        La noi, certificatul de informare costă {lei(p.firma)} lei pe firmă și {lei(p.pf)} lei pe persoană fizică,
        cu taxa ONRC și TVA-ul incluse. Când scrii CUI-ul unui PFA, formularul îți spune ce variantă să alegi. Certificatul de bază pe firmă se emite automat, de obicei în
        câteva minute. Varianta pe persoană fizică o preia echipa, în programul de lucru. Poți{' '}
        <Link href={CONSTATATOR_ORDER_HREF}>comanda certificatul aici</Link> sau citi mai întâi{' '}
        <Link href="/">ce primești și cât costă</Link>.
      </p>
    </ConstatatorGuide>
  );
}
