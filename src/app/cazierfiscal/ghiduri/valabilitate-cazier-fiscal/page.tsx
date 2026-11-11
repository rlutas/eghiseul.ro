import Link from 'next/link';
import { CazierFiscalGuide, GuideLink } from '@/components/cazierfiscal/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalArticleGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/valabilitate-cazier-fiscal/';
const PUBLISHED = '2026-11-17';
const UPDATED = '2026-11-17';
const TITLE = 'Cazier fiscal: cât e valabil, ce conține și când se șterge';
const DESCRIPTION =
  'Certificatul de cazier fiscal e valabil 30 de zile și doar pentru scopul din cerere. Ce fapte se înscriu, ce nu se înscrie și după cât timp ies din evidență, cu articolele din OG 39/2015.';

export const metadata = buildPageMetadata({ brand: 'cazierfiscal', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CAZIERFISCAL_INDEXABLE });

/**
 * Facts checked 11.11.2026 on the consolidated texts (legislatie.just.ro):
 * OG 39/2015 art. 4, 5, 6 (lit. h as amended by L 179/2025), 7, 9, 10, 11;
 * HG 1000/2015 annex as replaced by HG 1568/2022 (MO 1279/30.12.2022).
 */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['OPANAF nr. 2594/2015: procedura de înscriere, scoatere și eliberare (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/171983'],
  ['Codul de procedură fiscală, Legea nr. 207/2015 (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/170007'],
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
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Valabilitate și conținut', path: PATH }],
  });
  return (
    <CazierFiscalGuide
      path={PATH}
      crumb="Valabilitate și conținut"
      title={TITLE}
      lead="Certificatul de cazier fiscal e bun 30 de zile și doar pentru dosarul pentru care l-ai cerut. Mai jos: ce scrie în el, ce nu ajunge acolo și cât stă o faptă în evidență până dispare."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.basePrice)}
      summary={[
        <>Certificatul e valabil 30 de zile de la emitere și numai pentru scopul trecut pe el (OG 39/2015, art. 9 alin. 7).</>,
        <>În cazier ajung amenzile și condamnările pe legi fiscale, contabile, vamale și de disciplină financiară, plus câteva situații ale firmelor. Avertismentul nu ajunge (art. 4).</>,
        <>O contravenție iese din evidență la o lună după înscriere, dacă amenda e plătită (art. 6 alin. 1 lit. e).</>,
        <>Un impozit restant, singur, nu se înscrie în cazierul fiscal. Datoriile apar în certificatul de atestare fiscală.</>,
      ]}
      toc={[
        ['cat-e-valabil', 'Cât e valabil certificatul'],
        ['ce-se-inscrie', 'Ce se înscrie în cazierul fiscal'],
        ['ce-nu-apare', 'Ce nu apare'],
        ['cand-se-sterge', 'Când se șterge o faptă'],
        ['daca-e-o-greseala', 'Dacă în cazier e o greșeală'],
      ]}
      readMinutes={5}
      orderLead="Dacă îți trebuie un certificat nou pentru un dosar, cererea o poate depune avocatul nostru, pe baza împuternicirii semnate pe telefon. Certificatul vine pe email. Gratuit îl iei tot de la ANAF, din SPV sau de la ghișeu."
    >
      <h2 id="cat-e-valabil">Cât e valabil certificatul</h2>
      <p>
        Treizeci de zile, numărate de la data emiterii, nu de la data la care l-ai descărcat sau l-ai depus. Legea mai
        pune o condiție, pe care mulți o descoperă abia la ghișeul instituției: certificatul e valabil „numai în
        scopul în care a fost eliberat” (OG 39/2015, art. 9 alin. 7).
      </p>
      <p>
        Scopul îl scrii tu în cerere: angajare, licitație, credit, înființare de asociație. Dacă ai cerut un certificat
        pentru angajare și peste o săptămână îți cere și banca unul, legea spune că îți trebuie altul. Din fericire
        e gratuit (art. 9 alin. 5), deci costul e doar timpul.
      </p>
      <p>
        Practic: cere-l cât mai aproape de data la care depui dosarul. Dacă îl ceri cu o lună și ceva înainte, riști să
        fie expirat exact când îți trebuie.
      </p>

      <h2 id="ce-se-inscrie">Ce se înscrie în cazierul fiscal</h2>
      <p>
        Cazierul fiscal e o evidență ținută de ANAF (art. 3). Intră în ea faptele sancționate contravențional sau penal
        de legile fiscale, contabile, vamale și de cele de disciplină financiară (art. 4 alin. 1). Lista exactă a
        faptelor e în anexa la HG 1000/2015, înlocuită integral în 2022; în forma din 2022 are 251 de poziții.
      </p>
      <p>Câteva exemple din listă, ca să îți faci o idee:</p>
      <ul>
        <li>nedepunerea la termen a declarațiilor fiscale, când ai primit amendă (Codul de procedură fiscală, art. 336);</li>
        <li>neemiterea bonului fiscal;</li>
        <li>depășirea plafoanelor de plată în numerar (Legea 70/2015);</li>
        <li>operațiuni care nu sunt trecute în contabilitate;</li>
        <li>infracțiunile de evaziune fiscală din Legea 241/2005.</li>
      </ul>
      <p>
        Pe lângă fapte, se înscriu trei situații care nu sunt sancțiuni propriu-zise (art. 4 alin. 4): răspunderea
        solidară pentru datoriile unei firme, stabilită printr-o decizie ANAF definitivă; răspunderea patrimonială
        stabilită de instanță când firma a intrat în insolvență; inactivitatea fiscală a firmei. La inactivitate,
        înscrierea se face și în cazierul administratorilor din perioada respectivă (art. 4 alin. 5–7).
      </p>
      <p>
        Se înscriu doar actele rămase definitive (art. 4 alin. 12). O amendă pe care încă o contești în instanță nu e
        încă în cazier.
      </p>

      <h2 id="ce-nu-apare">Ce nu apare</h2>
      <ul>
        <li>
          Avertismentul. Dacă ai primit doar avertisment pentru o contravenție fiscală, fapta nu se înscrie (art. 4
          alin. 2).
        </li>
        <li>
          Datoriile la buget. Un impozit neplătit nu e, singur, o faptă înscrisă în cazier. Datoriile le vezi în
          certificatul de atestare fiscală de la ANAF. Am scris diferența pe larg în{' '}
          <GuideLink href="/ghiduri/cazier-fiscal-sau-certificat-fiscal/">cazier fiscal, certificat fiscal sau atestare fiscală</GuideLink>.
        </li>
      </ul>

      <h2 id="cand-se-sterge">Când se șterge o faptă</h2>
      <p>
        Legea spune „scoatere din evidență”. Termenul depinde de ce anume a fost înscris (art. 6 alin. 1):
      </p>
      <ul>
        <li>
          Contravenție obișnuită: la o lună de la înscriere, dacă amenda e plătită. Dacă o plătești mai târziu, fapta
          iese la 3 zile lucrătoare după plată. Dacă n-o plătești deloc, iese după 5 ani.
        </li>
        <li>Contravenție pe regimul produselor accizabile: la un an de la înscriere, cu aceleași reguli de plată.</li>
        <li>Infracțiune pedepsită cu amendă penală: după 5 ani de la înscriere, dacă n-ai mai săvârșit fapte de același fel.</li>
        <li>
          Infracțiune cu pedeapsă executată: după 5 ani de la executarea pedepsei, dacă n-ai mai săvârșit fapte de același fel. Aici e singurul caz în care
          trebuie să ceri tu scoaterea (art. 6 alin. 2). Celelalte se fac din oficiu.
        </li>
        <li>Răspundere solidară sau patrimonială: când datoria e stinsă, dar nu mai devreme de o lună de la înscriere. Altfel, după 5 ani.</li>
        <li>
          Inactivitate fiscală: la data reactivării firmei sau la 3 luni după, în funcție de motivul pentru care a fost
          declarată inactivă (art. 6 alin. 1 lit. h, modificat prin Legea 179/2025). Suspendarea activității înscrisă la Registrul Comerțului nu ajunge deloc în cazier (art. 4 alin. 4 lit. c).
        </li>
        <li>
          Ai plecat din funcția de administrator al unei firme inactive: după un an de la înregistrarea schimbării la
          Registrul Comerțului.
        </li>
      </ul>
      <p>
        Mai iese din evidență orice faptă care nu mai e sancționată de lege, sau pentru care a intervenit amnistia ori
        reabilitarea.
      </p>
      <p>
        După scoatere, ANAF mai păstrează informația încă 10 ani într-un „istoric” al
        contribuabililor, pe care îl folosesc organele fiscale „potrivit legii” (art. 7).
      </p>
      <p>
        Dacă termenul a trecut și fapta tot apare, poți cere scoaterea, cu acte doveditoare, de exemplu dovada plății
        amenzii (art. 6 alin. 3).
      </p>

      <h2 id="daca-e-o-greseala">Dacă în cazier e o greșeală</h2>
      <p>
        Ceri rectificarea la organul fiscal care a făcut înscrierea, cu acte care arată situația reală (art. 10). ANAF
        are 5 zile să-ți răspundă. Dacă îți dă dreptate, primești un certificat nou în locul celui greșit.
      </p>
      <p>
        Dacă cererea e respinsă sau nu primești răspuns în 5 zile, poți face contestație la tribunal, secția de
        contencios administrativ și fiscal, în 30 de zile (art. 11). Contestația merge și când greșeala nu e a ANAF.
      </p>
      <p>
        Vrei doar certificatul, fără bătăi de cap? Îl poți cere singur, <Link href="/ghiduri/cazier-fiscal-din-spv/">din SPV</Link>,
        sau ni-l lași nouă: <Link href="/">cazier fiscal online prin avocat</Link>, {lei(p.basePrice)} lei.
      </p>
    </CazierFiscalGuide>
  );
}
