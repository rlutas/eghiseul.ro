import Link from 'next/link';
import { CazierFiscalGuide, GuideLink } from '@/components/cazierfiscal/guide';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { cazierFiscalArticleGraph } from '@/lib/seo/cazierfiscal-schema';
import { getServicePricing, lei } from '@/lib/documentero/services';
import { CAZIERFISCAL_INDEXABLE } from '@/config/cazierfiscal-nav';

export const revalidate = 3600;

const PATH = '/ghiduri/cazier-fiscal-sau-certificat-fiscal/';
const PUBLISHED = '2026-12-01';
const UPDATED = '2026-12-01';
const TITLE = 'Cazier fiscal, certificat fiscal sau atestare fiscală: care îți trebuie';
const DESCRIPTION =
  'Trei acte cu nume aproape la fel: cazierul fiscal (sancțiuni), certificatul de atestare fiscală de la ANAF (datorii) și certificatul fiscal de la primărie (taxe locale). Ce arată fiecare, cine îl dă, cât e valabil.';

export const metadata = buildPageMetadata({ brand: 'cazierfiscal', title: TITLE, description: DESCRIPTION, path: PATH, noindex: !CAZIERFISCAL_INDEXABLE });

/**
 * Facts checked 11.11.2026 on the consolidated texts (legislatie.just.ro):
 * OG 39/2015 art. 4, 8, 9; Codul de procedură fiscală art. 158, 159 (alin. 5 and 5^2
 * as amended by OUG 7/2026, in force 25.02.2026), 160.
 */
const SOURCES = [
  ['OG nr. 39/2015 privind cazierul fiscal, text consolidat (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/303156'],
  ['Codul de procedură fiscală, Legea nr. 207/2015, art. 158–160 (legislatie.just.ro)', 'https://legislatie.just.ro/Public/DetaliiDocument/170007'],
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
    breadcrumb: [{ name: 'Acasă', path: '/' }, { name: 'Ghiduri', path: '/ghiduri/' }, { name: 'Cazier sau certificat fiscal', path: PATH }],
  });
  return (
    <CazierFiscalGuide
      path={PATH}
      crumb="Cazier sau certificat fiscal"
      title={TITLE}
      lead="Cazierul fiscal arată dacă ai fost sancționat pe legi fiscale. Certificatul de atestare fiscală arată dacă ai datorii la stat. Certificatul fiscal de la primărie arată dacă ai plătit impozitele locale. Sunt trei acte diferite și se cer în locuri diferite."
      updated={UPDATED}
      graph={graph}
      sources={SOURCES}
      price={lei(p.basePrice)}
      summary={[
        <>Cazierul fiscal (ANAF): sancțiuni pe legi fiscale, contabile, vamale. Gratuit, valabil 30 de zile (OG 39/2015, art. 9).</>,
        <>Certificatul de atestare fiscală (ANAF): datorii la bugetul administrat de ANAF. Se emite în maximum 3 zile lucrătoare (Codul de procedură fiscală, art. 158).</>,
        <>Certificatul fiscal (primărie): impozitele locale pe casă, teren, mașină. Se emite în maximum 2 zile lucrătoare, valabil 30 de zile (art. 159).</>,
        <>La vânzarea unei case sau a unui teren îți trebuie certificatul de la primărie, nu cazierul fiscal.</>,
      ]}
      toc={[
        ['pe-scurt-diferenta', 'Diferența, într-un tabel'],
        ['cazierul-fiscal', 'Cazierul fiscal'],
        ['atestarea-fiscala', 'Certificatul de atestare fiscală (ANAF)'],
        ['certificatul-de-la-primarie', 'Certificatul fiscal de la primărie'],
        ['verificare-cazier-fiscal', 'Poți verifica cazierul fiscal al altcuiva?'],
      ]}
      readMinutes={5}
      orderLead="Dacă ai nevoie de cazierul fiscal și nu ai SPV, cererea o depune avocatul nostru, pe baza împuternicirii semnate pe telefon, iar certificatul vine pe email. Atestarea fiscală și certificatul de la primărie nu le obținem noi."
    >
      <h2 id="pe-scurt-diferenta">Diferența, într-un tabel</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Cazier fiscal</th>
              <th>Atestare fiscală</th>
              <th>Certificat fiscal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cine îl dă</td>
              <td>ANAF</td>
              <td>ANAF</td>
              <td>Primăria (direcția de taxe locale)</td>
            </tr>
            <tr>
              <td>Ce arată</td>
              <td>Sancțiuni fiscale, contabile, vamale</td>
              <td>Datorii la bugetul administrat de ANAF</td>
              <td>Impozite și taxe locale</td>
            </tr>
            <tr>
              <td>Termen</td>
              <td>„De îndată”</td>
              <td>Max. 3 zile lucrătoare</td>
              <td>Max. 2 zile lucrătoare</td>
            </tr>
            <tr>
              <td>Valabil</td>
              <td>30 de zile, doar pentru scop</td>
              <td>30 de zile (90 pentru persoane fizice fără activitate)</td>
              <td>30 de zile</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="cazierul-fiscal">Cazierul fiscal</h2>
      <p>
        E evidența ANAF a celor care au fost sancționați pe legi fiscale, contabile, vamale sau de disciplină financiară
        (OG 39/2015, art. 1). Certificatul spune dacă ai sau nu fapte înscrise. Nu spune dacă ai datorii. Un om cu o
        amendă fiscală plătită acum două săptămâni poate avea cazierul „pătat”, iar unul cu impozit restant poate avea
        cazierul curat.
      </p>
      <p>
        E gratuit și se eliberează „de îndată”, de orice unitate ANAF (art. 9 alin. 5 și 8). Ce anume se înscrie și cât
        stă acolo am explicat în <GuideLink href="/ghiduri/valabilitate-cazier-fiscal/">ce conține cazierul fiscal și când se șterge</GuideLink>.
      </p>

      <h2 id="atestarea-fiscala">Certificatul de atestare fiscală (ANAF)</h2>
      <p>
        Arată obligațiile fiscale restante la ultima zi a lunii dinainte de cerere, care nu sunt stinse până la emitere
        (Codul de procedură fiscală, art. 158 alin. 2). Plus alte creanțe din titluri executorii pe care le administrează ANAF. Cu alte cuvinte: dacă datorezi bani statului.
      </p>
      <p>
        Îl emite ANAF în maximum 3 zile lucrătoare. Poți să-l folosești 30 de zile, iar dacă ești persoană fizică fără
        activitate independentă, 90 de zile (art. 158 alin. 5). Îl poate cere și cineva care are părți sociale într-o
        firmă, pentru acea firmă (art. 158 alin. 1).
      </p>
      <p>
        Dacă un dosar îți cere „certificat fiscal” fără alte precizări, întreabă ce anume vor. „Certificat de atestare
        fiscală” și „certificat de cazier fiscal” sunt acte diferite, iar unul nu ține locul celuilalt.
      </p>

      <h2 id="certificatul-de-la-primarie">Certificatul fiscal de la primărie</h2>
      <p>
        Numele oficial e tot „certificat de atestare fiscală”, dar îl dă primăria și privește doar impozitele și taxele
        locale (art. 159). În vorbirea curentă i se spune „certificat fiscal”. Se emite în cel mult două zile lucrătoare
        și e valabil 30 de zile.
      </p>
      <p>Când îți trebuie:</p>
      <ul>
        <li>
          la vânzarea unei clădiri, a unui teren sau a unei mașini, ca să arăți că ai plătit impozitele locale, inclusiv
          pe anul vânzării (art. 159 alin. 5). La mașini nu mai e nevoie dacă folosiți contractul standard de
          vânzare-cumpărare aprobat prin ordin (alin. 5^1);
        </li>
        <li>
          din 25.02.2026 și cumpărătorul trebuie să prezinte unul, pentru localitatea unde are domiciliul, sediul sau
          punctul de lucru (alin. 5^2, introdus prin OUG 7/2026);
        </li>
        <li>la succesiune: notarul cere certificatul pentru persoana decedată, atât de la primărie, cât și de la ANAF (art. 160 alin. 2).</li>
      </ul>
      <p>
        Legea permite ca certificatul să fie înlocuit cu verificarea electronică a datoriilor. Actele încheiate fără certificat sau verificare sunt nule de drept (art. 159 alin. 6), cu excepția executării silite, insolvenței și lichidării (alin. 7).
      </p>
      <p>Notarul sau primăria îți spun dacă îl cer pe hârtie. Cazierul fiscal nu-l înlocuiește.</p>

      <h2 id="verificare-cazier-fiscal">Poți verifica cazierul fiscal al altcuiva?</h2>
      <p>
        Nu. Legea nu are o consultare publică a cazierului fiscal și nici o cale „cu acordul” persoanei. Certificatul se
        eliberează doar persoanei, reprezentantului legal sau unui împuternicit cu mandat (OG 39/2015, art. 9 alin. 9).
        În afară de ei au acces Registrul Comerțului, procurorii și instanțele, autoritățile fiscale străine prin acorduri
        și instituțiile care soluționează o cerere a acelei persoane, când legea lor cere certificatul (art. 8 și 9).
        Atestarea fiscală e diferită: acolo legea permite accesul cu consimțământul expres al contribuabilului (Codul de
        procedură fiscală, art. 160 alin. 1).
      </p>
      <p>
        Dacă vrei să știi cum stă un viitor asociat sau angajat, cere-i să-ți aducă certificatul. Pentru propriul tău
        cazier, singura „verificare” pe care o prevede legea e chiar certificatul. Îl ceri gratuit{' '}
        <Link href="/ghiduri/cazier-fiscal-din-spv/">din SPV</Link> sau de la ghișeu, ori prin noi:{' '}
        <Link href="/">cazier fiscal online</Link>, {lei(p.basePrice)} lei.
      </p>
    </CazierFiscalGuide>
  );
}
