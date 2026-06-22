import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { SomajCalculator } from '@/components/calculators/somaj-calculator';

const SLUG = 'indemnizatie-somaj';
const TITLE = 'Calculator Indemnizație de Șomaj 2026';
const DESCRIPTION =
  "Calculează indemnizația de șomaj 2026: baza de 75% din ISR plus suplimentul pe stagiu, durata și reținerea CASS.";

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
      heading="Calculator Indemnizație de Șomaj 2026"
      description="Estimează indemnizația de șomaj lunară și durata de acordare, în funcție de stagiul de cotizare și de salariul mediu."
      widget={<SomajCalculator />}
      faqs={[
        { q: 'Cât este indemnizația de șomaj în 2026?', a: 'Baza este 75% din ISR (660 lei) = 495 lei, la care se adaugă un procent din salariul mediu brut din ultimele 12 luni, în funcție de vechime: +3% (peste 3 ani), +5% (peste 5), +7% (peste 10), +10% (peste 20). Din indemnizație se reține CASS 10%.' },
        { q: 'Cât timp se acordă șomajul?', a: 'Durata depinde de stagiul de cotizare: 6 luni (1-5 ani), 9 luni (5-10 ani), 12 luni (peste 10 ani).' },
        { q: 'Se reține ceva din indemnizația de șomaj?', a: 'Da, din 1 august 2025 se reține CASS 10% din indemnizația de șomaj. Astfel, dintr-o indemnizație brută de 800 lei rămân 720 lei net.' },
        { q: 'Care este indemnizația minimă de șomaj?', a: 'Cuantumul minim este baza de 75% din ISR, adică 495 lei brut (circa 446 lei net după CASS 10%). Persoanele cu stagiu de cotizare scurt (sub 3 ani) primesc doar această bază, fără supliment pe vechime.' },
        { q: 'Absolvenții primesc indemnizație de șomaj?', a: 'Da, dar într-un regim separat: absolvenții fără loc de muncă primesc 50% din ISR (330 lei brut) pe o perioadă de 6 luni, dacă se înregistrează la ANOFM în termen de 60 de zile de la absolvire. Acest calculator estimează indemnizația pentru persoanele cu stagiu de cotizare.' },
        { q: 'Cum se calculează stagiul de cotizare pentru șomaj?', a: 'Conta perioada în care ai fost asigurat în sistemul asigurărilor pentru șomaj. Pentru a primi indemnizație ai nevoie de minimum 12 luni de cotizare în ultimele 24 de luni dinaintea înregistrării la ANOFM.' },
      ]}
    >
      <h2>Cum se calculează indemnizația de șomaj</h2>
      <p>
        Indemnizația = <strong>495 lei (75% × ISR)</strong> + un procent din salariul mediu brut al
        ultimelor 12 luni, stabilit după stagiul de cotizare. Din suma brută se reține{' '}
        <strong>CASS 10%</strong> (din august 2025).
      </p>
      <h2>Suplimentul pe stagiu și durata indemnizației</h2>
      <p>
        Peste baza fixă de <strong>495 lei</strong> se adaugă un procent din salariul mediu brut al
        ultimelor 12 luni, iar perioada în care primești șomaj depinde tot de vechimea în muncă.
        Tabelul de mai jos rezumă pragurile din Legea 76/2002:
      </p>
      <table>
        <thead>
          <tr>
            <th>Stagiu de cotizare</th>
            <th>Supliment (din salariul mediu brut)</th>
            <th>Durata indemnizației</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1 – 3 ani</td>
            <td>0% (doar baza de 495 lei)</td>
            <td>6 luni</td>
          </tr>
          <tr>
            <td>3 – 5 ani</td>
            <td>+3%</td>
            <td>6 luni</td>
          </tr>
          <tr>
            <td>5 – 10 ani</td>
            <td>+5%</td>
            <td>9 luni</td>
          </tr>
          <tr>
            <td>10 – 20 ani</td>
            <td>+7%</td>
            <td>12 luni</td>
          </tr>
          <tr>
            <td>peste 20 ani</td>
            <td>+10%</td>
            <td>12 luni</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Procentele și durata sunt orientative și se aplică stagiului efectiv de cotizare; cuantumul
        final se stabilește de ANOFM pe baza adeverințelor depuse.
      </p>

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem un salariat cu <strong>8 ani</strong> de stagiu de cotizare și un salariu mediu
        brut de <strong>5.000 lei</strong> în ultimele 12 luni:
      </p>
      <ul>
        <li><strong>Pasul 1 – baza:</strong> 75% × ISR (660 lei) = <strong>495 lei</strong>.</li>
        <li>
          <strong>Pasul 2 – suplimentul:</strong> stagiul de 8 ani intră în tranșa 5 – 10 ani, deci
          +5% din salariul mediu brut: 5% × 5.000 = <strong>250 lei</strong>.
        </li>
        <li>
          <strong>Pasul 3 – indemnizația brută:</strong> 495 + 250 = <strong>745 lei</strong> pe lună.
        </li>
        <li>
          <strong>Pasul 4 – reținerea CASS 10%:</strong> 745 − 74,50 ≈ <strong>671 lei net</strong> pe
          lună.
        </li>
        <li>
          <strong>Pasul 5 – durata:</strong> pentru 5 – 10 ani de stagiu, indemnizația se acordă{' '}
          <strong>9 luni</strong>.
        </li>
      </ul>
      <p className="text-sm text-neutral-500">
        Valorile sunt rotunjite și orientative. CASS se aplică din 1 august 2025; verifică decizia
        ANOFM pentru cuantumul exact.
      </p>

      <h2>Cazuri speciale și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Absolvenții</strong> nu intră în acest calcul: ei primesc 50% din ISR (330 lei brut)
          timp de 6 luni, dacă se înregistrează la ANOFM în 60 de zile de la absolvire.
        </li>
        <li>
          <strong>Stagiu sub 1 an</strong> în ultimele 2 luni înseamnă lipsa dreptului la indemnizație —
          chiar dacă ai lucrat mulți ani în trecut, contează ultimele 24 de luni.
        </li>
        <li>
          <strong>Confuzia salariu net cu brut:</strong> suplimentul se aplică la salariul mediu{' '}
          <strong>brut</strong>, nu la cel net. Folosirea netului subestimează indemnizația.
        </li>
        <li>
          <strong>Uitarea CASS:</strong> din indemnizația brută se reține 10% CASS, deci suma încasată
          efectiv este mai mică decât cea calculată brut.
        </li>
        <li>
          <strong>Termenul de înregistrare:</strong> cererea trebuie depusă la ANOFM în maximum 30 de
          zile de la încetarea raportului de muncă pentru a primi indemnizația de la data înregistrării.
        </li>
      </ul>

      <h2>Documente utile când rămâi fără loc de muncă</h2>
      <p>
        Pentru angajarea la un nou loc de muncă, multe firme cer un{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazier judiciar</Link> recent, pe care îl poți
        obține 100% online, fără drum la ghișeu. Dacă vrei să estimezi și salariul de la viitorul job,
        folosește <Link href="/calculator/salariu/">calculatorul de salariu net</Link>, iar pentru
        vechimea acumulată poți verifica{' '}
        <Link href="/calculator/vechime-in-munca/">calculatorul de vechime în muncă</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă conform Legii 76/2002. Absolvenții au un regim separat. Cuantumul exact se
        stabilește de ANOFM.
      </p>
    </CalculatorLayout>
  );
}
