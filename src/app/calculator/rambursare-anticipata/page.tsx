import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { RambursareAnticipataCalculator } from '@/components/calculators/rambursare-anticipata-calculator';

const SLUG = 'rambursare-anticipata';
const TITLE = 'Calculator Rambursare Anticipată Credit — Dobândă Economisită';
const DESCRIPTION =
  'Calculează cât economisești dacă rambursezi anticipat o parte din credit: reduci durata sau rata și afli dobânda economisită, pentru un credit cu rate egale.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Rambursare Anticipată')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Rambursare Anticipată Credit"
      description="Află cât economisești dacă plătești anticipat o sumă din credit — comparând cele două opțiuni: reduci perioada sau reduci rata lunară."
      widget={<RambursareAnticipataCalculator />}
      faqs={[
        {
          q: 'Ce este mai avantajos: să reduc perioada sau rata?',
          a: 'Din punct de vedere al dobânzii economisite, reducerea perioadei (păstrând aceeași rată) economisește de regulă mai mult, pentru că termini creditul mai repede. Reducerea ratei îți ușurează bugetul lunar, dar economia de dobândă este mai mică. Calculatorul îți arată ambele variante.',
        },
        {
          q: 'Se plătește comision la rambursarea anticipată?',
          a: 'Pentru creditele cu dobândă variabilă, comisionul de rambursare anticipată este, conform OUG 50/2010, zero. Pentru creditele cu dobândă fixă, banca poate percepe un comision de maximum 1% (sau 0,5% dacă mai sunt sub un an până la final). Verifică în contract.',
        },
        {
          q: 'Cum se calculează dobânda economisită?',
          a: 'Se compară dobânda totală rămasă de plată înainte și după rambursarea anticipată. Suma plătită anticipat reduce soldul (principalul), deci dobânda care s-ar fi calculat pe acel sold dispare — de aici economia.',
        },
        {
          q: 'Pot rambursa anticipat doar o parte din credit?',
          a: 'Da. Rambursarea anticipată poate fi totală (achiți întreg soldul rămas) sau parțială (plătești o sumă peste rata curentă). La rambursarea parțială, banca îți recalculează scadențarul, fie scurtând durata, fie reducând rata lunară, în funcție de ce alegi.',
        },
        {
          q: 'Trebuie să anunț banca înainte de a plăti anticipat?',
          a: 'De regulă da: rambursarea anticipată parțială se solicită în scris, iar banca emite un nou grafic de rambursare. Pentru creditele cu dobândă variabilă comisionul este zero (OUG 50/2010), iar pentru cele cu dobândă fixă comisionul este de maximum 1%. Cere bancii calculul exact înainte de a transfera suma.',
        },
        {
          q: 'Merită să rambursez anticipat sau să economisesc banii?',
          a: 'Depinde de dobânda creditului față de randamentul pe care l-ai obține economisind sau investind. Dacă dobânda creditului este mai mare decât ce ai câștiga punând banii deoparte, rambursarea anticipată e de obicei mai avantajoasă. Păstrează însă mereu un fond de urgență și achită întâi datoriile cu dobânda cea mai mare.',
        },
      ]}
    >
      <h2>Cum funcționează rambursarea anticipată</h2>
      <p>
        Când plătești anticipat o sumă, aceasta se duce integral în <strong>principal</strong> (soldul rămas), nu în
        dobândă. Cu un sold mai mic, dobânda viitoare scade. Ai două opțiuni: să <strong>reduci perioada</strong>{' '}
        (păstrând rata lunară, termini mai repede) sau să <strong>reduci rata</strong> (păstrând durata, plătești mai
        puțin pe lună).
      </p>

      <h2>Care variantă economisește mai mult</h2>
      <p>
        <strong>Reducerea perioadei</strong> economisește de obicei mai multă dobândă, pentru că scurtează durata în care
        se aplică dobânda. <strong>Reducerea ratei</strong> e mai bună pentru flexibilitatea bugetului lunar. Calculatorul
        afișează economia de dobândă pentru ambele.
      </p>

      <h2>Comisioane</h2>
      <p>
        La creditele cu dobândă variabilă, rambursarea anticipată este gratuită (OUG 50/2010). La cele cu dobândă fixă,
        comisionul este de maximum 1%. Verifică întotdeauna contractul de credit.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un credit de consum cu un sold rămas de 50.000 lei, dobândă variabilă, 60 de luni rămase și o rată
        lunară de aproximativ 1.000 lei. Decizi să rambursezi anticipat 10.000 lei. Pașii de calcul sunt:
      </p>
      <ul>
        <li>
          <strong>Pasul 1.</strong> Suma de 10.000 lei se aplică integral pe principal, deci soldul scade de la 50.000
          lei la 40.000 lei.
        </li>
        <li>
          <strong>Pasul 2.</strong> Pentru că dobânda este variabilă, comisionul de rambursare anticipată este zero (OUG
          50/2010), așa că toți cei 10.000 lei reduc efectiv datoria.
        </li>
        <li>
          <strong>Pasul 3 (reduci perioada).</strong> Păstrezi rata de circa 1.000 lei pe lună, dar termini creditul cu
          mai multe luni mai devreme. Lunile eliminate sunt cele de la final, unde rata conține cea mai mare proporție de
          principal, însă scurtarea duratei reduce și dobânda totală acumulată.
        </li>
        <li>
          <strong>Pasul 4 (reduci rata).</strong> Păstrezi cele 60 de luni rămase, dar rata lunară scade, pentru că noul
          principal de 40.000 lei se reamortizează pe aceeași durată.
        </li>
      </ul>
      <p>
        Introdu valorile tale exacte în calculator pentru a vedea economia de dobândă în fiecare scenariu. Pentru
        comparație, varianta <strong>reduci perioada</strong> economisește de regulă mai multă dobândă decât
        <strong> reduci rata</strong>.
      </p>

      <h2>Reduci perioada sau reduci rata: comparație rapidă</h2>
      <table>
        <thead>
          <tr>
            <th>Criteriu</th>
            <th>Reduci perioada</th>
            <th>Reduci rata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rata lunară</td>
            <td>Rămâne la fel</td>
            <td>Scade</td>
          </tr>
          <tr>
            <td>Durata creditului</td>
            <td>Se scurtează</td>
            <td>Rămâne la fel</td>
          </tr>
          <tr>
            <td>Dobândă economisită</td>
            <td>Mai mare</td>
            <td>Mai mică</td>
          </tr>
          <tr>
            <td>Avantaj principal</td>
            <td>Economie maximă, scapi mai repede de credit</td>
            <td>Buget lunar mai relaxat</td>
          </tr>
          <tr>
            <td>Potrivit dacă</td>
            <td>Vrei să plătești cât mai puțină dobândă în total</td>
            <td>Vrei mai mult aer în bugetul lunar</td>
          </tr>
        </tbody>
      </table>

      <h2>Greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confunzi tipul de dobândă.</strong> La dobândă variabilă comisionul de rambursare anticipată este zero,
          dar la dobândă fixă banca poate percepe până la 1%. Verifică în contract înainte să decizi.
        </li>
        <li>
          <strong>Nu anunți banca corect.</strong> Rambursarea anticipată parțială trebuie de obicei cerută în scris, iar
          banca îți recalculează scadențarul. Confirmă în ce variantă se aplică suma: reducerea perioadei sau a ratei.
        </li>
        <li>
          <strong>Îți golești fondul de urgență.</strong> Înainte să plătești anticipat, păstrează o rezervă pentru
          cheltuieli neprevăzute. Un credit mai mic nu ajută dacă rămâi fără lichidități.
        </li>
        <li>
          <strong>Ignori alte datorii mai scumpe.</strong> Dacă ai un card de credit sau un alt împrumut cu dobândă mult
          mai mare, de multe ori e mai eficient să îl achiți pe acela întâi.
        </li>
      </ul>

      <p>
        Vezi și <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link> (util la creditul
        ipotecar), <Link href="/calculator/salariu/">calculatorul de salariu</Link> (pentru a verifica gradul de
        îndatorare) sau, dacă vrei să vinzi o proprietate cu credit, <Link href="/servicii/extras-de-carte-funciara/">extrasul
        de carte funciară</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ pentru un credit cu rate egale (anuitate), fără comisioane. Cifrele exacte depind de
        contractul tău și de dobânda curentă.
      </p>
    </CalculatorLayout>
  );
}
