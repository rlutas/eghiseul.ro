import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ProcenteCalculator } from '@/components/calculators/procente-calculator';

const SLUG = 'calculator-procente';
const TITLE = 'Calculator Procente Online — Cât e X% din Y';
const DESCRIPTION =
  "Calculator de procente online: cât e X% din Y, cât la sută reprezintă un număr din altul și variația procentuală. Gratuit.";

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent(TITLE)}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Procente"
      description="Calculează rapid procente: X% dintr-o valoare, cât la sută reprezintă un număr din altul sau variația procentuală dintre două valori."
      tldr="X% dintr-o valoare = valoare × procent / 100 (ex. 20% din 250 = 50). Cât la sută e X din Y = X / Y × 100. Variația procentuală = (final − inițial) / inițial × 100, pozitivă la creștere, negativă la scădere."
      widget={<ProcenteCalculator />}
      faqs={[
        { q: 'Cum calculez X% dintr-o valoare?', a: 'Înmulțești valoarea cu procentul împărțit la 100. De exemplu, 20% din 250 = 250 × 20 / 100 = 50. În calculatorul de mai sus alege modul „X% din Y".' },
        { q: 'Cum aflu cât la sută reprezintă un număr din altul?', a: 'Împarți numărul la total și înmulțești cu 100. De exemplu, 50 din 250 = 50 / 250 × 100 = 20%. Alege modul „Cât % e X din Y".' },
        { q: 'Cum calculez creșterea sau scăderea procentuală?', a: 'Scazi valoarea inițială din cea finală, împarți la valoarea inițială și înmulțești cu 100. Un rezultat negativ înseamnă scădere.' },
        { q: 'Cum aplic o reducere de X% la un preț?', a: 'Înmulțești prețul cu (100 − procentul reducerii) împărțit la 100. De exemplu, un preț de 250 lei cu reducere de 20% devine 250 × 80 / 100 = 200 lei. Diferența de 50 lei este valoarea reducerii.' },
        { q: 'Cum aflu prețul inițial dinainte de o majorare?', a: 'Împarți prețul actual la (100 + procentul majorării) și înmulțești cu 100. De exemplu, dacă un produs costă acum 121 lei după o majorare de 21%, prețul inițial era 121 / 121 × 100 = 100 lei. Atenție: nu scazi pur și simplu 21% din prețul final, fiindcă procentul s-a aplicat valorii vechi, nu celei noi.' },
        { q: 'De ce o creștere de 50% urmată de o scădere de 50% nu mă aduce la valoarea inițială?', a: 'Pentru că fiecare procent se aplică unei baze diferite. 100 + 50% = 150, apoi 150 − 50% = 75, nu 100. Variațiile procentuale succesive nu se adună și nu se anulează direct, ci se înmulțesc.' },
        { q: 'Cum calculez procentul dintr-un total când am mai multe valori?', a: 'Aduni toate valorile pentru a obține totalul, apoi împarți fiecare valoare la total și înmulțești cu 100. De exemplu, dacă trei sume sunt 50, 30 și 20, totalul este 100, iar ponderile sunt 50%, 30% și 20%. Suma tuturor procentelor unui întreg trebuie să dea 100%.' },
        { q: 'Care e diferența dintre puncte procentuale și procent?', a: 'Punctele procentuale măsoară diferența absolută dintre două procente, iar procentul măsoară variația relativă. O creștere de la 20% la 25% înseamnă +5 puncte procentuale, dar o creștere relativă de 25% (calculată ca 5 / 20 × 100). Confuzia dintre cele două este una dintre cele mai frecvente greșeli.' },
        { q: 'Pot calcula mai multe reduceri aplicate una după alta?', a: 'Da, dar reducerile succesive nu se adună. O reducere de 20% urmată de încă 10% nu înseamnă 30%. Înmulțești factorii: 250 × 0,8 × 0,9 = 180 lei, ceea ce echivalează cu o reducere totală de 28%, nu 30%. Folosește tabelul cu factori de înmulțire pentru a evita erorile.' },
      ]}
    >
      <h2>Cum funcționează calculatorul de procente</h2>
      <p>
        Procentul este o fracție raportată la 100. Calculatorul de mai sus acoperă cele trei
        situații cele mai întâlnite, fără să fie nevoie să ții minte formulele.
      </p>
      <h3>1. Cât este X% dintr-o valoare</h3>
      <p>
        Formula: <strong>rezultat = valoare × procent / 100</strong>. Util la reduceri, dobânzi,
        comisioane sau TVA.
      </p>
      <h3>2. Cât la sută reprezintă X din Y</h3>
      <p>
        Formula: <strong>procent = X / Y × 100</strong>. Util ca să afli ponderea unei sume într-un
        total.
      </p>
      <h3>3. Creșterea sau scăderea procentuală</h3>
      <p>
        Formula: <strong>variație = (final − inițial) / inițial × 100</strong>. Pozitiv = creștere,
        negativ = scădere.
      </p>

      <h2>Exemplu numeric pas cu pas: reducere și preț inițial</h2>
      <p>
        Să presupunem un produs de <strong>250 lei</strong> la care se aplică o reducere de{' '}
        <strong>20%</strong>. Iată cum calculezi atât prețul redus, cât și drumul invers, ca să afli
        valoarea de pornire.
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — valoarea reducerii:</strong> 250 × 20 / 100 = <strong>50 lei</strong>.
        </li>
        <li>
          <strong>Pasul 2 — prețul după reducere:</strong> 250 − 50 = <strong>200 lei</strong>. Mai
          rapid: 250 × (100 − 20) / 100 = 250 × 0,8 = 200 lei.
        </li>
        <li>
          <strong>Pasul 3 — drumul invers:</strong> dacă știi că 200 lei reprezintă prețul de{' '}
          <em>după</em> o reducere de 20% și vrei valoarea inițială, împarți la 0,8: 200 / 0,8 ={' '}
          <strong>250 lei</strong>. Nu aduni pur și simplu 20% peste 200 (ar da 240), pentru că
          procentul s-a aplicat valorii vechi.
        </li>
      </ul>
      <p>
        Același raționament se folosește când vrei <strong>valoarea inițială înainte de o
        majorare</strong>: pentru un preț de 121 lei după o majorare de 21%, valoarea de pornire este
        121 / 1,21 = 100 lei.
      </p>

      <h2>Tabel rapid: factorul cu care înmulțești</h2>
      <p>
        Ca să eviți calculele în doi pași, înmulțește direct valoarea cu factorul de mai jos. Este
        cea mai sigură metodă pentru reduceri și majorări succesive.
      </p>
      <table>
        <thead>
          <tr>
            <th>Operație</th>
            <th>Factor de înmulțire</th>
            <th>Exemplu pe 200 lei</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Reducere 10%</td>
            <td>× 0,90</td>
            <td>180 lei</td>
          </tr>
          <tr>
            <td>Reducere 25%</td>
            <td>× 0,75</td>
            <td>150 lei</td>
          </tr>
          <tr>
            <td>Majorare 11% (TVA redus)</td>
            <td>× 1,11</td>
            <td>222 lei</td>
          </tr>
          <tr>
            <td>Majorare 21% (TVA standard)</td>
            <td>× 1,21</td>
            <td>242 lei</td>
          </tr>
          <tr>
            <td>Extragere TVA 21% dintr-un preț cu TVA inclus</td>
            <td>× 21 / 121</td>
            <td>≈ 34,71 lei TVA</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Cotele de TVA folosite mai sus sunt cele în vigoare din 2026: <strong>21% standard</strong> și{' '}
        <strong>11% redus</strong>. Pentru calcule complete de adăugare sau extragere a TVA folosește{' '}
        <Link href="/calculator/tva/">calculatorul de TVA</Link>.
      </p>

      <h2>Exemplu numeric pas cu pas: creșterea procentuală</h2>
      <p>
        Variația procentuală este cea mai utilă când compari două valori — de pildă un preț, o
        cifră de afaceri sau un buget — între două momente. Să presupunem că o valoare a crescut de
        la <strong>200 lei</strong> la <strong>250 lei</strong>. Iată cum afli cu cât la sută a
        crescut.
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — diferența absolută:</strong> 250 − 200 = <strong>50 lei</strong>. Aceasta
          este creșterea în valoare, nu în procente.
        </li>
        <li>
          <strong>Pasul 2 — raportarea la valoarea inițială:</strong> 50 / 200 = 0,25. Întotdeauna
          împarți la valoarea <em>de la care</em> pleci, nu la cea finală.
        </li>
        <li>
          <strong>Pasul 3 — transformarea în procent:</strong> 0,25 × 100 ={' '}
          <strong>+25%</strong>. Valoarea a crescut cu 25%.
        </li>
      </ul>
      <p>
        Verificarea inversă confirmă rezultatul: 200 × 1,25 = 250 lei. Dacă ai fi raportat greșit
        diferența la valoarea finală (50 / 250 = 20%), ai fi obținut un rezultat eronat — de aceea
        numitorul corect este mereu valoarea inițială.
      </p>

      <h2>Tabel: aceeași diferență, două procente diferite</h2>
      <p>
        Una dintre capcanele procentelor este că aceeași diferență absolută înseamnă procente
        diferite, în funcție de sensul comparației. Tabelul arată de ce o creștere și o scădere
        între aceleași două valori nu au același procent.
      </p>
      <table>
        <thead>
          <tr>
            <th>Comparație</th>
            <th>Calcul</th>
            <th>Variație</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>De la 200 la 250</td>
            <td>50 / 200 × 100</td>
            <td>+25%</td>
          </tr>
          <tr>
            <td>De la 250 la 200</td>
            <td>−50 / 250 × 100</td>
            <td>−20%</td>
          </tr>
          <tr>
            <td>De la 100 la 150</td>
            <td>50 / 100 × 100</td>
            <td>+50%</td>
          </tr>
          <tr>
            <td>De la 150 înapoi la 100</td>
            <td>−50 / 150 × 100</td>
            <td>≈ −33,33%</td>
          </tr>
        </tbody>
      </table>
      <p>
        Observă ultimele două rânduri: ca să revii de la 150 la 100 ai nevoie de o scădere de
        aproximativ 33,33%, nu de 50%. Acesta este motivul matematic pentru care{' '}
        <strong>+50% urmat de −50% nu te readuce la valoarea inițială</strong> (100 → 150 → 75).
      </p>

      <h2>Greșeli frecvente la procente</h2>
      <ul>
        <li>
          <strong>Aduni puncte procentuale ca și cum ar fi procente.</strong> O creștere de la 20% la
          25% înseamnă +5 <em>puncte procentuale</em>, dar o creștere <em>relativă</em> de 25% (5 /
          20 × 100). Sunt două lucruri diferite.
        </li>
        <li>
          <strong>Inversezi greșit o majorare.</strong> Ca să afli valoarea dinainte de o majorare de
          21%, împarți la 1,21 — nu scazi 21% din prețul final.
        </li>
        <li>
          <strong>Crezi că +50% și −50% se anulează.</strong> Aplicate succesiv pe baze diferite,
          rezultatul nu este valoarea inițială (100 → 150 → 75).
        </li>
        <li>
          <strong>Confunzi „din” cu „mai mult decât”.</strong> 50 este 20% din 250, dar 250 este cu
          400% mai mult decât 50 — întreabă-te mereu care este valoarea de referință (Y).
        </li>
      </ul>
      <h2>Unde apar procentele în practică</h2>
      <p>
        Procentele nu sunt doar un exercițiu de matematică — le întâlnești zilnic în cumpărături,
        salarii, dobânzi și taxe oficiale. Câteva situații tipice în care un calcul corect te
        ajută să iei o decizie:
      </p>
      <ul>
        <li>
          <strong>Reduceri și promoții:</strong> verifici dacă o reducere de 25% chiar înseamnă
          economia anunțată și compari oferte exprimate diferit (preț redus vs. procent reducere).
        </li>
        <li>
          <strong>TVA și prețuri:</strong> adaugi sau extragi cota de TVA dintr-un preț, folosind
          factorii din tabelul de mai sus. Pentru calcule complete folosește{' '}
          <Link href="/calculator/tva/">calculatorul de TVA</Link>.
        </li>
        <li>
          <strong>Salariu și rețineri:</strong> contribuțiile sociale și impozitul pe venit se
          aplică procentual din salariul brut, iar diferența dintre brut și net se exprimă tot în
          procente.
        </li>
        <li>
          <strong>Taxe oficiale pe tranșe:</strong> unele taxe se calculează ca procent dintr-o
          valoare, uneori pe praguri succesive.
        </li>
      </ul>
      <p>
        Procentele apar des și în taxele oficiale: de exemplu, <strong>taxa judiciară de timbru</strong>{' '}
        se calculează pe tranșe procentuale din valoarea cererii — vezi{' '}
        <Link href="/calculator/taxa-judiciara-de-timbru/">calculatorul de taxă judiciară de timbru</Link>.
        Dacă vrei să compari rapid două sume sau să afli ponderea unei valori dintr-un total, poți
        reveni oricând la{' '}
        <Link href="/calculator/calculator-procente/">calculatorul de procente</Link> de mai sus.
        Iar dacă ai nevoie de un document precum cazierul judiciar, îl poți obține online
        prin <Link href="/servicii/cazier-judiciar-online/">serviciul de cazier judiciar</Link>.
      </p>
    </CalculatorLayout>
  );
}
