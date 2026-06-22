import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ConcediuMedicalCalculator } from '@/components/calculators/concediu-medical-calculator';

const SLUG = 'concediu-medical';
const TITLE = 'Calculator Concediu Medical 2026 — Indemnizație';
const DESCRIPTION =
  "Calculează indemnizația de concediu medical 2026: procentul pe tip de concediu, baza de calcul și prima zi neplătită.";

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
      heading="Calculator Concediu Medical 2026"
      description="Estimează indemnizația de concediu medical pe baza venitului mediu, a tipului de concediu și a regulilor în vigoare în 2026."
      tldr="În 2026, boala obișnuită se plătește progresiv: 55% (zilele 1-7), 65% (8-14), 75% (15+). Baza e media venitului brut din ultimele 6 luni, plafonată la 12 salarii minime/lună, iar prima zi a episodului nu se plătește (OUG 91/2025)."
      widget={<ConcediuMedicalCalculator />}
      faqs={[
        { q: 'Cât la sută din salariu primesc pe concediu medical în 2026?', a: 'Depinde de tip: boala obișnuită are procent progresiv — 55% (până la 7 zile), 65% (8-14 zile), 75% (15+ zile). Urgențele și bolile din grupa A sunt 100%, maternitatea și îngrijirea copilului 85%, riscul maternal 75%, accidentul de muncă 80%.' },
        { q: 'Se plătește prima zi de concediu medical?', a: 'Pentru certificatele emise între 1 februarie 2026 și 31 decembrie 2027, prima zi a episodului de boală nu se plătește (OUG 91/2025). Excepție: accidentele de muncă și anumite situații.' },
        { q: 'Cum se calculează baza?', a: 'Media veniturilor brute lunare din ultimele 6 luni, plafonată la 12 salarii minime pe lună, împărțită la numărul de zile lucrătoare.' },
        { q: 'Procentul de 55/65/75% se aplică pe toate zilele sau progresiv?', a: 'Progresiv, în cadrul aceluiași episod de boală: primele 7 zile la 55%, zilele 8-14 la 65%, iar de la a 15-a zi 75%. Nu se aplică retroactiv procentul cel mai mare pe toate zilele.' },
        { q: 'Există un plafon al indemnizației de concediu medical?', a: 'Da. Baza de calcul este limitată la media a 12 salarii minime brute pe țară pe lună. În 2026 salariul minim este 4.050 lei (ianuarie-iunie) și 4.325 lei (iulie-decembrie), deci plafonul se modifică la mijlocul anului.' },
        { q: 'Accidentele de muncă au aceleași reguli ca boala obișnuită?', a: 'Nu. Accidentul de muncă și boala profesională se plătesc cu 80% și au regim separat (Legea 346/2002), iar prima zi neplătită nu li se aplică.' },
        { q: 'Din indemnizația de concediu medical se rețin impozit și contribuții?', a: 'Da. Indemnizația brută se impozitează cu 10% impozit pe venit și cu 10% CASS (contribuția de asigurări sociale de sănătate). Nu se reține CAS (pensie) pe indemnizația de boală. Suma încasată în mână este, așadar, mai mică decât indemnizația brută calculată.' },
        { q: 'Cine plătește indemnizația — angajatorul sau CNAS?', a: 'Primele zile sunt suportate din fondul de salarii al angajatorului, iar restul din bugetul Fondului național unic de asigurări sociale de sănătate (FNUASS), prin CNAS. Pentru salariat plata vine integral prin angajator, care apoi recuperează partea suportată de FNUASS.' },
        { q: 'De câte luni de stagiu am nevoie ca să primesc indemnizația?', a: 'Regula generală cere un stagiu de asigurare de minimum 6 luni realizate în ultimele 12 luni anterioare lunii certificatului. Pentru urgențe medico-chirurgicale și bolile din grupa A indemnizația se acordă fără condiție de stagiu.' },
      ]}
    >
      <h2>Cum se calculează indemnizația de concediu medical</h2>
      <p>
        Indemnizația = <strong>baza zilnică × procent × zile plătite</strong>. Baza zilnică e media
        venitului brut din ultimele 6 luni (plafonată la 12 salarii minime/lună), împărțită la zilele
        lucrătoare.
      </p>
      <h2>Procentele în 2026</h2>
      <ul>
        <li><strong>Boală obișnuită:</strong> progresiv 55% / 65% / 75% după durata episodului (Legea 141/2025);</li>
        <li><strong>Urgențe, grupa A, TBC, cancer:</strong> 100%;</li>
        <li><strong>Maternitate, îngrijire copil:</strong> 85%; <strong>risc maternal:</strong> 75%;</li>
        <li><strong>Accident de muncă:</strong> 80% (regim separat, Legea 346/2002).</li>
      </ul>
      <h2>Tabel: procentul în funcție de tipul de concediu</h2>
      <p>
        Procentul aplicat bazei de calcul depinde de motivul certificatului medical. Pentru boala
        obișnuită procentul crește odată cu durata episodului, conform Legii 141/2025.
      </p>
      <table>
        <thead>
          <tr>
            <th>Tip concediu</th>
            <th>Procent</th>
            <th>Bază legală</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Boală obișnuită — zilele 1-7</td>
            <td>55%</td>
            <td>Legea 141/2025</td>
          </tr>
          <tr>
            <td>Boală obișnuită — zilele 8-14</td>
            <td>65%</td>
            <td>Legea 141/2025</td>
          </tr>
          <tr>
            <td>Boală obișnuită — ziua 15 și peste</td>
            <td>75%</td>
            <td>Legea 141/2025</td>
          </tr>
          <tr>
            <td>Urgențe medico-chirurgicale, grupa A (TBC, cancer, SIDA, boli infecto-contagioase)</td>
            <td>100%</td>
            <td>OUG 158/2005</td>
          </tr>
          <tr>
            <td>Maternitate, îngrijirea copilului bolnav</td>
            <td>85%</td>
            <td>OUG 158/2005</td>
          </tr>
          <tr>
            <td>Risc maternal</td>
            <td>75%</td>
            <td>OUG 158/2005</td>
          </tr>
          <tr>
            <td>Accident de muncă / boală profesională</td>
            <td>80%</td>
            <td>Legea 346/2002</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Procentele pe tranșe se aplică progresiv în cadrul aceluiași episod de boală — nu retroactiv
        pe toate zilele. Valori orientative; norme metodologice în clarificare.
      </p>

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Un salariat cu venit brut mediu de <strong>6.000 lei/lună</strong> în ultimele 6 luni primește
        un certificat de boală obișnuită pentru <strong>10 zile lucrătoare</strong>. Presupunem 21 de
        zile lucrătoare în luna de referință.
      </p>
      <ul>
        <li><strong>Pas 1 — baza zilnică:</strong> 6.000 lei ÷ 21 zile = <strong>285,71 lei/zi</strong>;</li>
        <li><strong>Pas 2 — prima zi neplătită:</strong> din 10 zile, prima nu se plătește (OUG 91/2025), rămân <strong>9 zile plătite</strong>;</li>
        <li><strong>Pas 3 — procentul pe tranșe:</strong> zilele 2-7 (6 zile) la 55%, zilele 8-10 (3 zile) la 65%;</li>
        <li><strong>Pas 4 — indemnizația:</strong> 6 × 285,71 × 55% = 943 lei plus 3 × 285,71 × 65% = 557 lei → <strong>≈ 1.500 lei brut</strong>.</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Exemplu orientativ. Numărul exact de zile lucrătoare diferă de la o lună la alta, iar din
        indemnizație se rețin contribuțiile și impozitul aplicabile. Verifică cu angajatorul.
      </p>

      <h2>Plafonul de 12 salarii minime</h2>
      <p>
        Baza de calcul nu poate depăși media a <strong>12 salarii minime brute pe țară</strong> pe lună,
        indiferent cât de mare e venitul real. În 2026 salariul minim crește la mijlocul anului
        (4.050 lei în ianuarie-iunie, 4.325 lei în iulie-decembrie), așa că plafonul lunar al bazei se
        modifică în consecință. Pentru veniturile sub plafon, baza este chiar media venitului brut.
      </p>

      <h2>Greșeli frecvente</h2>
      <ul>
        <li><strong>Aplicarea unui procent fix pe boală:</strong> mulți cred că boala obișnuită e mereu 75% — de fapt este progresivă (55/65/75%) în 2026;</li>
        <li><strong>Plata primei zile:</strong> pentru certificatele emise în perioada 1 februarie 2026 — 31 decembrie 2027 prima zi nu se plătește, cu excepția accidentelor de muncă;</li>
        <li><strong>Ignorarea plafonului:</strong> veniturile mari sunt limitate la 12 salarii minime, deci indemnizația nu crește la nesfârșit;</li>
        <li><strong>Confundarea zilelor calendaristice cu cele lucrătoare:</strong> baza zilnică se raportează la zilele lucrătoare, iar definiția primei zile neplătite se clarifică prin norme.</li>
      </ul>
      <p>
        Dacă verifici și alte drepturi sau praguri, poți folosi și{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu net</Link> pentru a estima venitul
        brut din ultimele luni, ori{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link> dacă ești
        liber profesionist asigurat în sistemul de sănătate.
      </p>

      <h2>Cât rămâne în mână: impozitul și contribuțiile</h2>
      <p>
        Indemnizația calculată de calculator este una <strong>brută</strong>. Înainte să ajungă la
        salariat, din ea se rețin <strong>impozitul pe venit de 10%</strong> și{' '}
        <strong>CASS de 10%</strong> (contribuția de asigurări sociale de sănătate). Spre deosebire de
        salariul obișnuit, pe indemnizația de boală <strong>nu se reține CAS</strong> (contribuția la
        pensie), pentru că perioada de incapacitate temporară de muncă constituie oricum stagiu de
        cotizare asimilat.
      </p>
      <p>
        Reluând exemplul de mai sus, dacă indemnizația brută este de ≈ 1.500 lei, reținerile
        aproximative sunt 10% CASS și 10% impozit aplicat după CASS, iar suma încasată în mână scade
        corespunzător. Procentul exact depinde de ordinea reținerilor și de eventualele deduceri, însă
        ca regulă practică din indemnizația brută se duc aproximativ două cote de 10%.
      </p>

      <h2>Cine plătește și de unde vin banii</h2>
      <p>
        Plata indemnizației se face <strong>prin angajator</strong>, însă sursa banilor este împărțită.
        Primele zile ale concediului medical sunt suportate din <strong>fondul de salarii al
        angajatorului</strong>, iar partea care depășește această perioadă este suportată din{' '}
        <strong>Fondul național unic de asigurări sociale de sănătate (FNUASS)</strong>, gestionat de
        CNAS. Angajatorul avansează suma către salariat și ulterior recuperează de la FNUASS partea ce
        revine bugetului. Pentru salariat, fluxul este transparent: banii apar pe statul de plată
        împreună cu (sau în locul) salariului, după aceleași termene.
      </p>

      <h2>Condiția de stagiu și excepțiile</h2>
      <p>
        Ca să ai dreptul la indemnizație, ai nevoie de regulă de un <strong>stagiu de asigurare de
        minimum 6 luni</strong> realizate în ultimele 12 luni anterioare lunii în care a fost emis
        certificatul medical. Această condiție protejează fondul de asigurări împotriva folosirii
        abuzive imediat după angajare.
      </p>
      <ul>
        <li><strong>Fără condiție de stagiu:</strong> urgențele medico-chirurgicale și bolile din grupa A (TBC, cancer, SIDA, boli infecto-contagioase) — plătite cu 100% indiferent de vechime;</li>
        <li><strong>Stagiu insuficient:</strong> dacă nu acoperi cele 6 luni, dreptul la indemnizație poate fi limitat sau refuzat, chiar dacă certificatul este valabil medical;</li>
        <li><strong>Cumul de surse:</strong> stagiul se poate constitui din mai multe locuri de muncă sau perioade asimilate (inclusiv concedii medicale anterioare).</li>
      </ul>

      <h2>Tabel: ce intră și ce nu intră în calcul</h2>
      <p>
        Nu orice sumă încasată în ultimele 6 luni intră în baza de calcul, iar din rezultatul brut nu
        se rețin toate contribuțiile pe care le-ai vedea la un salariu normal. Tabelul de mai jos
        rezumă regulile.
      </p>
      <table>
        <thead>
          <tr>
            <th>Element</th>
            <th>Intră în calcul / se reține?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Venitul brut lunar (ultimele 6 luni)</td>
            <td>Da — formează media bazei de calcul</td>
          </tr>
          <tr>
            <td>Plafonul de 12 salarii minime/lună</td>
            <td>Da — limitează baza, oricât de mare e venitul</td>
          </tr>
          <tr>
            <td>Prima zi a episodului de boală</td>
            <td>Nu se plătește (OUG 91/2025), excepție accident de muncă</td>
          </tr>
          <tr>
            <td>Impozit pe venit 10%</td>
            <td>Da — se reține din indemnizația brută</td>
          </tr>
          <tr>
            <td>CASS 10%</td>
            <td>Da — se reține din indemnizația brută</td>
          </tr>
          <tr>
            <td>CAS (pensie)</td>
            <td>Nu — nu se reține pe indemnizația de boală</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        Valori orientative. Ordinea exactă a reținerilor și tratamentul deducerilor se aplică potrivit
        normelor în vigoare; verifică cu angajatorul.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă. Regulile 2026 (prima zi neplătită — zi calendaristică vs lucrătoare,
        excepții) se clarifică prin norme metodologice. Verifică cu angajatorul/CNAS.
      </p>
    </CalculatorLayout>
  );
}
