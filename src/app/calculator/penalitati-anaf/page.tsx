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
        { q: 'Se calculează accesorii și pe perioada eșalonării la plată?', a: 'Pe durata unei eșalonări la plată aprobate, în locul dobânzii de 0,02%/zi se aplică o dobândă de eșalonare, iar penalitatea de întârziere de 0,01%/zi nu se mai datorează pentru ratele plătite la termenele din graficul de eșalonare. Dacă pierzi eșalonarea, accesoriile se recalculează după regimul general. Cifrele standard din calculator (0,02% și 0,01% pe zi) se aplică în afara unei eșalonări active.' },
        { q: 'Plata parțială reduce accesoriile pentru zilele următoare?', a: 'Da. Accesoriile se calculează pe debitul rămas neachitat, zi de zi. Dacă plătești o parte din obligație, dobânda de 0,02%/zi și penalitatea de întârziere de 0,01%/zi se aplică de la acea dată doar pe soldul rămas, nu pe suma inițială. De aceea o plată parțială cât mai devreme reduce totalul accesoriilor.' },
        { q: 'Cine datorează penalitatea de nedeclarare de 0,08%/zi?', a: 'Penalitatea de nedeclarare de 0,08%/zi se aplică obligațiilor fiscale principale stabilite suplimentar de ANAF prin decizie de impunere, ca urmare a unei inspecții fiscale, pentru sume care nu fuseseră declarate. Nu se aplică sumelor pe care contribuabilul le-a declarat corect dar nu le-a plătit la timp — acolo se aplică penalitatea de întârziere de 0,01%/zi. Penalitatea de nedeclarare nu poate depăși debitul și se reduce cu 75% la conformare.' },
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

      <h2>Al doilea exemplu: TVA întârziat 90 de zile</h2>
      <p>
        Să luăm o obligație de <strong>TVA declarată dar neplătită</strong> de 25.000 lei, achitată
        cu <strong>90 de zile</strong> întârziere. Calculăm fiecare accesoriu pe debitul rămas, pas
        cu pas:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — dobânda de întârziere:</strong> 25.000 × 0,02% × 90 zile ={' '}
          <strong>450 lei</strong> (0,02%/zi se aplică întotdeauna);
        </li>
        <li>
          <strong>Pasul 2 — penalitatea de întârziere:</strong> 25.000 × 0,01% × 90 zile ={' '}
          <strong>225 lei</strong> (sumă declarată, deci 0,01%/zi);
        </li>
        <li>
          <strong>Pasul 3 — total accesorii:</strong> 450 + 225 = <strong>675 lei</strong>, pe
          lângă debitul de 25.000 lei, deci <strong>25.675 lei</strong> de plată în total.
        </li>
      </ul>
      <p>
        Dacă aceeași sumă ar fi fost <strong>nedeclarată</strong> și stabilită la inspecție,
        penalitatea de nedeclarare ar fi 25.000 × 0,08% × 90 zile = <strong>1.800 lei</strong>. La
        conformare (plata sau eșalonarea în termen), reducerea de 75% o aduce la{' '}
        <strong>450 lei</strong>, plus dobânda de 450 lei — sensibil mai mult decât regimul de sumă
        declarată corect. Observă cum penalitatea de nedeclarare de 0,08%/zi este de opt ori mai
        mare decât cea de întârziere de 0,01%/zi.
      </p>
      <p className="text-sm text-neutral-500">
        Valori orientative. Plata parțială mai devreme reduce debitul pe care se aplică accesoriile
        pentru zilele rămase.
      </p>

      <h2>Declarat vs. nedeclarat: ce regim ți se aplică</h2>
      <p>
        Cel mai important factor pentru cuantumul accesoriilor este <strong>cum a fost stabilit
        debitul</strong>. Tabelul de mai jos compară cele două situații pentru aceeași sumă și
        aceeași întârziere:
      </p>
      <table>
        <thead>
          <tr>
            <th>Situație</th>
            <th>Dobândă</th>
            <th>Penalitate aplicabilă</th>
            <th>Reducere posibilă</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sumă declarată, plătită cu întârziere</td>
            <td>0,02%/zi</td>
            <td>Penalitate de întârziere 0,01%/zi</td>
            <td>—</td>
          </tr>
          <tr>
            <td>Sumă nedeclarată, descoperită la control</td>
            <td>0,02%/zi</td>
            <td>Penalitate de nedeclarare 0,08%/zi (plafonată la debit)</td>
            <td>75% la conformare</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Dobânda de 0,02%/zi este comună ambelor situații. Diferă doar penalitatea: 0,01%/zi pentru
        sumele declarate, 0,08%/zi pentru cele nedeclarate. Reducerea de 75% privește exclusiv
        penalitatea de nedeclarare.
      </p>

      <h2>Context legal: temeiul accesoriilor</h2>
      <p>
        Accesoriile fiscale sunt reglementate de <strong>Legea 207/2015</strong> privind Codul de
        procedură fiscală. <strong>Dobânda de întârziere</strong> de 0,02%/zi (art. 174) reprezintă
        echivalentul prejudiciului adus bugetului prin neîncasarea la termen a sumei și se
        datorează în toate cazurile de plată cu întârziere. <strong>Penalitatea de întârziere</strong>{' '}
        de 0,01%/zi (art. 176) are caracter sancționatoriu și se aplică obligațiilor declarate dar
        neachitate. <strong>Penalitatea de nedeclarare</strong> de 0,08%/zi (art. 181) sancționează
        nedeclararea sumelor descoperite ulterior la control, nu se cumulează cu penalitatea de
        întârziere pe aceeași sumă, nu poate depăși valoarea debitului principal și se reduce cu
        75% atunci când contribuabilul se conformează (achită sau eșalonează debitul în termen).
      </p>
      <p>
        Toate cotele se aplică <strong>pe zi de întârziere</strong>, calculate de la ziua imediat
        următoare scadenței până la data stingerii obligației inclusiv. Sumele rezultate sunt
        comunicate prin decizia referitoare la obligațiile de plată accesorii, vizibilă în Spațiul
        Privat Virtual (SPV).
      </p>

      <h2>Cum eviți și cum reduci accesoriile</h2>
      <ul>
        <li>
          <strong>Plătește chiar și parțial:</strong> orice plată reduce debitul pe care se
          calculează dobânda de 0,02%/zi și penalitatea de 0,01%/zi pentru zilele următoare.
        </li>
        <li>
          <strong>Declară corect și la timp:</strong> o sumă declarată atrage doar penalitatea de
          întârziere de 0,01%/zi, nu cea de nedeclarare de 0,08%/zi — de opt ori mai mică.
        </li>
        <li>
          <strong>Conformează-te rapid după control:</strong> achitarea sau eșalonarea în termenul
          comunicat de ANAF declanșează reducerea de 75% a penalității de nedeclarare.
        </li>
        <li>
          <strong>Monitorizează SPV:</strong> verifică periodic obligațiile și deciziile de
          accesorii pentru a opri creșterea zilnică a sumelor.
        </li>
      </ul>

      <p>
        Pentru obligații curente, verifică-ți situația fiscală în Spațiul Privat Virtual (SPV)
        înainte de scadență. Dacă ai nevoie de alte estimări online, încearcă și{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link>,{' '}
        <Link href="/calculator/tva/">calculatorul de TVA</Link> sau{' '}
        <Link href="/calculator/dobanda-legala/">calculatorul de dobândă legală</Link>.
      </p>
    </CalculatorLayout>
  );
}
