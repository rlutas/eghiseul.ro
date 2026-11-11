import Link from 'next/link';
import { CazierFiscalGuide } from '@/components/cazierfiscal/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalArticleGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/cazier-fiscal-din-spv/';
const PUBLISHED = '2026-11-10';
const UPDATED = '2026-11-11';
const TITLE = 'Cazier fiscal din SPV (ANAF): cum îl ceri online, gratuit';
const DESCRIPTION =
  'Cum ceri certificatul de cazier fiscal din Spațiul Privat Virtual (SPV) al ANAF: ce îți trebuie, unde e meniul, ce primești și cât e valabil. Plus ce faci dacă nu ai cont SPV.';

export const metadata = buildPageMetadata({ brand: 'cazierfiscal', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CAZIERFISCAL_INDEXABLE });

/** Facts re-checked 11.11.2026: OG 39/2015 art. 4, 9 (consolidated 08.11.2025), OPANAF 2594/2015 + 2048/2023, CPF art. 18. */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['OPANAF nr. 2594/2015: procedura de eliberare (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/171983'],
  ['OPANAF nr. 2048/2023: formularele actuale de cerere și certificat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/277749'],
  ['Codul de procedură fiscală, Legea nr. 207/2015, art. 18 (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/170007'],
  ['ANAF: înregistrarea în Spațiul Privat Virtual', 'https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori'],
] as const;

export default async function Page() {
  const p = await getServicePricing('cazier-fiscal');
  const graph = cazierFiscalArticleGraph({
    path: PATH,
    headline: TITLE,
    description: DESCRIPTION,
    datePublished: PUBLISHED,
    dateModified: UPDATED,
    citations: SOURCES,
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Cazier fiscal din SPV', path: PATH }],
  });
  return (
    <CazierFiscalGuide
      path={PATH}
      crumb="Cazier fiscal din SPV"
      title={TITLE}
      lead="Dacă ai cont în Spațiul Privat Virtual (SPV) al ANAF, cazierul fiscal îl ceri singur, de acasă, și nu plătești nimic. Îți arătăm drumul, ce primești la final și ce faci dacă nu ai cont."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.basePrice)}
      summary={[
        <>Cazierul fiscal se cere din SPV, din <strong>Solicitări → Eliberare documente → Certificat de cazier fiscal</strong>.</>,
        <>Răspunsul vine în secțiunea <strong>Mesaje</strong> din SPV, ca PDF cu semnătura electronică a Ministerului Finanțelor.</>,
        <>Este gratuit: legea spune că se eliberează „fără perceperea de taxe” (OG 39/2015, art. 9 alin. 5).</>,
        <>Este valabil 30 de zile de la emitere și numai pentru scopul trecut în cerere (art. 9 alin. 7).</>,
      ]}
      toc={[
        ['ce-iti-trebuie-inainte', 'Ce îți trebuie înainte'],
        ['pasii-in-spv', 'Pașii în SPV'],
        ['ce-primesti', 'Ce primești'],
        ['daca-nu-ai-cont-spv', 'Dacă nu ai cont SPV'],
      ]}
      readMinutes={3}
      orderLead="Fără cont SPV, cazierul fiscal se cere la ghișeul ANAF sau printr-un împuternicit. La noi, cererea o depune avocatul, pe baza împuternicirii pe care o semnezi pe telefon, iar certificatul îl primești pe email."
    >
      <h2 id="ce-iti-trebuie-inainte">Ce îți trebuie înainte</h2>
      <p>
        Un cont activ în Spațiul Privat Virtual, ca persoană fizică. Dacă nu ai unul, întâi îl creezi și îl activezi
        după procedura de pe{' '}
        <a href="https://www.anaf.ro/anaf/internet/ANAF/servicii_online/inregistrare_utilizatori" target="_blank" rel="nofollow noopener">pagina de înregistrare a ANAF</a>.
        Cererea de cazier fiscal nu poate fi făcută din SPV fără cont.
      </p>
      <p>
        Mai ai nevoie să știi <strong>scopul</strong> pentru care îți trebuie certificatul: angajare, licitație, credit
        sau alt dosar. Scopul apare pe certificat, iar certificatul e bun doar pentru el.
      </p>

      <h2 id="pasii-in-spv">Pașii în SPV</h2>
      <ol>
        <li>Intri în contul tău din Spațiul Privat Virtual.</li>
        <li>Deschizi meniul <strong>Solicitări</strong>, apoi <strong>Eliberare documente</strong>.</li>
        <li>Alegi <strong>Certificat de cazier fiscal</strong>, selectezi CNP-ul și completezi scopul.</li>
        <li>Trimiți cererea. Răspunsul vine în secțiunea <strong>Mesaje</strong>, ca PDF, pe care îl descarci din coloana „Descărcare document”.</li>
      </ol>
      <p>
        Legea spune că certificatul se eliberează „de îndată” (OG 39/2015, art. 9 alin. 8), dar ANAF nu publică un
        termen în zile pentru cererile din SPV, așa că nu îți promitem noi unul. Dacă dosarul tău are o dată limită,
        nu lăsa cererea pe ultima zi și nici nu o face prea devreme: certificatul expiră după 30 de zile.
      </p>

      <h2 id="ce-primesti">Ce primești</h2>
      <p>
        Un certificat în format electronic, cu semnătura electronică calificată a Ministerului Finanțelor. Pe el scrie
        scopul pentru care l-ai cerut și dacă ai sau nu fapte înscrise în cazierul fiscal.
      </p>
      <p>
        În cazierul fiscal se înscriu faptele sancționate contravențional sau penal de legile fiscale, contabile,
        vamale și de disciplină financiară, după lista din HG 1000/2015 (OG 39/2015, art. 4). Contravențiile
        sancționate doar cu avertisment nu se înscriu. Se mai înscriu atragerea răspunderii solidare sau patrimoniale
        pentru datoriile unei firme și inactivitatea fiscală a unei firme, aceasta din urmă în cazierul celor care
        o reprezentau legal în perioada respectivă.
      </p>
      <p>
        Datoriile restante la buget nu apar ca atare în cazierul fiscal. Ele apar în certificatul de atestare
        fiscală, care e alt document. Excepția: dacă ANAF ți-a atras răspunderea solidară pentru datoriile unei
        firme, decizia se înscrie în cazier.
      </p>

      <h2 id="daca-nu-ai-cont-spv">Dacă nu ai cont SPV</h2>
      <p>Ai două variante:</p>
      <ul>
        <li>
          <strong>Ghișeul ANAF.</strong> Mergi cu actul de identitate la orice unitate ANAF, indiferent de domiciliu.
          Legea spune că certificatul se eliberează „de îndată” (art. 9 alin. 8) și e tot gratuit.
        </li>
        <li>
          <strong>Printr-un împuternicit sau avocat.</strong> Cererea o poate depune un împuternicit (OG 39/2015, art. 9
          alin. 1), inclusiv un avocat cu împuternicire avocațială (Codul de procedură fiscală, art. 18 alin. 3). Asta facem noi: <Link href="/">cazier fiscal online prin avocat</Link>,
          {' '}{lei(p.basePrice)} lei, în 1–3 zile lucrătoare.
        </li>
      </ul>
      <p>
        Ești în altă țară? Citește și <Link href="/ghiduri/cazier-fiscal-din-strainatate/">cum obții cazierul fiscal din străinătate</Link>.
      </p>
    </CazierFiscalGuide>
  );
}
