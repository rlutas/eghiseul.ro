import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { PenalitatiAnafCalculator } from '@/components/calculators/penalitati-anaf-calculator';

const SLUG = 'penalitati-anaf';
const TITLE = 'Calculator Penalități și Dobânzi ANAF — Întârziere la Plată';
const DESCRIPTION =
  "Calculează dobânzile (0,02%/zi) și penalitățile ANAF pentru taxe plătite cu întârziere, conform Codului de procedură fiscală.";

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
      heading="Calculator Penalități și Dobânzi ANAF"
      description="Estimează accesoriile (dobândă + penalități) pentru o obligație fiscală plătită cu întârziere, conform Codului de procedură fiscală."
      widget={<PenalitatiAnafCalculator />}
      faqs={[
        { q: 'Cât este dobânda de întârziere la ANAF?', a: 'Dobânda de întârziere este 0,02% pe zi (aproximativ 7,3% pe an), conform art. 174 din Codul de procedură fiscală. Se aplică în toate cazurile de plată cu întârziere.' },
        { q: 'Care e diferența între penalitatea de întârziere și cea de nedeclarare?', a: 'Penalitatea de întârziere (0,01%/zi) se aplică sumelor declarate dar neplătite. Penalitatea de nedeclarare (0,08%/zi) se aplică sumelor descoperite de ANAF la control (nedeclarate) și nu se cumulează cu cea de întârziere pe aceeași sumă.' },
        { q: 'Se poate reduce penalitatea de nedeclarare?', a: 'Da, cu 75% dacă debitul stabilit se achită în termen sau se eșalonează. Penalitatea de nedeclarare nu poate depăși valoarea debitului.' },
        { q: 'Din ce zi încep să curgă accesoriile?', a: 'Accesoriile (dobânda și penalitatea) curg începând cu ziua imediat următoare scadenței și până la data stingerii sumei datorate inclusiv, conform art. 174 din Codul de procedură fiscală. Pentru fiecare zi de întârziere se aplică cota zilnică pe debitul rămas.' },
        { q: 'Se calculează accesorii și pentru sume sub 100 de lei?', a: 'Nu. Pentru obligațiile fiscale principale mai mici de un anumit prag (de regulă sub plafonul stabilit prin Codul de procedură fiscală), organul fiscal nu calculează și nu comunică accesorii. Verifică decizia de impunere sau certificatul de atestare fiscală pentru cuantumul exact.' },
        { q: 'Cum aflu suma exactă de plată a penalităților?', a: 'Suma exactă rezultă din decizia referitoare la obligațiile de plată accesorii emisă de ANAF, vizibilă și în Spațiul Privat Virtual (SPV). Calculatorul oferă o estimare orientativă; pentru reconcilierea finală folosește certificatul de atestare fiscală sau consultă un contabil.' },
      ]}
    >
      <h2>Cum se calculează penalitățile ANAF</h2>
      <p>
        Pentru o obligație fiscală plătită cu întârziere se datorează <strong>accesorii</strong>,
        calculate pe zile de întârziere (de la scadență până la data plății):
      </p>
      <ul>
        <li><strong>dobândă de întârziere: 0,02%/zi</strong> (se aplică mereu);</li>
        <li><strong>penalitate de întârziere: 0,01%/zi</strong> — pentru sume declarate dar neplătite;</li>
        <li><strong>penalitate de nedeclarare: 0,08%/zi</strong> — pentru sume nedeclarate, descoperite la control (în loc de cea de întârziere).</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Estimare orientativă conform Legii 207/2015. Pentru cuantumul exact, consultă decizia de
        impunere sau un contabil.
      </p>

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem o obligație fiscală <strong>declarată dar neplătită</strong> de 10.000 lei,
        achitată cu <strong>60 de zile</strong> întârziere față de scadență. Accesoriile se
        calculează separat, pe aceeași perioadă de întârziere:
      </p>
      <ul>
        <li><strong>Dobândă de întârziere:</strong> 10.000 × 0,02% × 60 zile = <strong>120 lei</strong>;</li>
        <li><strong>Penalitate de întârziere:</strong> 10.000 × 0,01% × 60 zile = <strong>60 lei</strong>;</li>
        <li><strong>Total accesorii:</strong> 120 + 60 = <strong>180 lei</strong>, pe lângă debitul de 10.000 lei.</li>
      </ul>
      <p>
        Dacă aceeași sumă de 10.000 lei ar fi fost <strong>nedeclarată</strong> și descoperită de
        ANAF la control, în locul penalității de întârziere s-ar aplica penalitatea de nedeclarare:
        10.000 × 0,08% × 60 zile = <strong>480 lei</strong>. Cu reducerea de 75% (la plata sau
        eșalonarea debitului în termen), penalitatea de nedeclarare scade la <strong>120 lei</strong>.
        Dobânda de 0,02%/zi rămâne datorată în ambele situații.
      </p>
      <p className="text-sm text-neutral-500">
        Valori orientative. Numărul exact de zile se socotește de la ziua următoare scadenței până
        la data plății inclusiv.
      </p>

      <h2>Cotele de accesorii pe zi și pe an</h2>
      <table>
        <thead>
          <tr>
            <th>Tip accesoriu</th>
            <th>Cotă/zi</th>
            <th>Echivalent anual (aprox.)</th>
            <th>Când se aplică</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Dobândă de întârziere</td>
            <td>0,02%</td>
            <td>~7,3%</td>
            <td>Întotdeauna, pentru orice plată cu întârziere</td>
          </tr>
          <tr>
            <td>Penalitate de întârziere</td>
            <td>0,01%</td>
            <td>~3,65%</td>
            <td>Sume declarate, dar neplătite la scadență</td>
          </tr>
          <tr>
            <td>Penalitate de nedeclarare</td>
            <td>0,08%</td>
            <td>~29,2%</td>
            <td>Sume nedeclarate, descoperite la control (plafonată la debit)</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Cotele anuale sunt simple înmulțiri ale cotei zilnice cu 365 de zile, oferite pentru
        orientare. Penalitatea de nedeclarare nu se cumulează cu cea de întârziere pe aceeași sumă.
      </p>

      <h2>Greșeli frecvente și situații speciale</h2>
      <ul>
        <li>
          <strong>Cumularea greșită a penalităților:</strong> pe aceeași sumă nu se aplică simultan
          penalitatea de întârziere (0,01%/zi) și cea de nedeclarare (0,08%/zi) — se aplică una sau
          alta, în funcție de cum a fost stabilit debitul.
        </li>
        <li>
          <strong>Uitarea dobânzii:</strong> dobânda de 0,02%/zi se datorează „mereu”, indiferent
          dacă mai există sau nu o penalitate. Mulți estimează doar penalitatea și subestimează
          totalul.
        </li>
        <li>
          <strong>Numărarea zilelor:</strong> perioada se socotește de la ziua următoare scadenței
          până la data plății inclusiv, nu de la data emiterii deciziei de impunere.
        </li>
        <li>
          <strong>Plafonul la nedeclarare:</strong> penalitatea de nedeclarare nu poate depăși
          valoarea debitului principal, oricât de lungă ar fi întârzierea.
        </li>
        <li>
          <strong>Ratarea reducerii de 75%:</strong> reducerea penalității de nedeclarare se pierde
          dacă debitul nu este achitat sau eșalonat în termenul comunicat de ANAF.
        </li>
      </ul>

      <p>
        Pentru obligații curente, verifică-ți situația fiscală în Spațiul Privat Virtual (SPV)
        înainte de scadență. Dacă ai nevoie de alte estimări online, încearcă și{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link> sau{' '}
        <Link href="/calculator/tva/">calculatorul de TVA</Link>.
      </p>
    </CalculatorLayout>
  );
}
