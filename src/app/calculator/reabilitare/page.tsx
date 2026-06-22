import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ReabilitareCalculator } from '@/components/calculators/reabilitare-calculator';

const SLUG = 'reabilitare';
const TITLE = 'Calculator Reabilitare Cazier — Când se Șterge Condamnarea';
const DESCRIPTION =
  "Află când se șterge condamnarea din cazier: termenele de reabilitare din Codul Penal (3, 4, 5 sau 7 ani), calculate din data executării.";

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
      heading="Calculator Reabilitare Cazier Judiciar"
      description="Calculează data la care intervine reabilitarea și se șterge mențiunea din cazierul judiciar, pe baza termenelor fixe din Codul Penal."
      tldr="Condamnarea se șterge din cazier după termene fixe din Codul Penal (art. 165-167), calculate de la executarea pedepsei: 3 ani (amendă, închisoare ≤ 2 ani sau suspendare), 4 ani (2-5 ani), 5 ani (5-10 ani) și 7 ani (peste 10 ani)."
      widget={<ReabilitareCalculator />}
      faqs={[
        { q: 'După cât timp se șterge cazierul judiciar?', a: 'Depinde de pedeapsă: reabilitarea de drept intervine după 3 ani (amendă, închisoare ≤ 2 ani, suspendare). Reabilitarea judecătorească: 4 ani (2-5 ani închisoare), 5 ani (5-10 ani) sau 7 ani (peste 10 ani), calculate de la executarea pedepsei.' },
        { q: 'Ce diferență e între reabilitarea de drept și cea judecătorească?', a: 'Reabilitarea de drept operează automat la împlinirea termenului, fără cerere. Reabilitarea judecătorească trebuie cerută la instanță și presupune îndeplinirea unor condiții (fără nouă infracțiune, plata cheltuielilor și a despăgubirilor).' },
        { q: 'Ce se întâmplă după reabilitare?', a: 'Mențiunea condamnării nu mai apare în cazierul judiciar obișnuit (cel cerut de angajatori). Pentru a verifica situația ta actuală, poți obține cazierul judiciar online.' },
        { q: 'De când începe să curgă termenul de reabilitare?', a: 'Termenul curge de la data executării pedepsei principale: data eliberării din închisoare, data achitării integrale a amenzii sau data împlinirii termenului de supraveghere la suspendare. Dacă pedeapsa a fost grațiată, termenul curge de la data grațierii. Nu se calculează de la data condamnării.' },
        { q: 'O nouă infracțiune oprește termenul de reabilitare?', a: 'Da. Pentru reabilitarea judecătorească, condamnatul nu trebuie să fi săvârșit o nouă infracțiune în interiorul termenului. O nouă condamnare întrerupe termenul, care reîncepe de la executarea celei de-a doua pedepse. Reabilitarea de drept nu mai intervine automat dacă apare o nouă condamnare în interval.' },
        { q: 'Reabilitarea șterge condamnarea din cazierul cerut de instituții?', a: 'Reabilitarea elimină mențiunea din cazierul judiciar obișnuit (cel cerut de angajatori sau pentru acte uzuale). Totuși, condamnarea rămâne în evidențele interne ale poliției și apare în cazierul extins solicitat de organele judiciare. Pentru documentul standard, după reabilitare cazierul apare curat.' },
        { q: 'Trebuie să plătesc o taxă pentru cererea de reabilitare judecătorească?', a: 'Da. Cererea de reabilitare judecătorească se depune la instanță și presupune o taxă judiciară de timbru, plus eventuale cheltuieli pentru obținerea actelor doveditoare (cazier, dovada achitării despăgubirilor). Reabilitarea de drept, fiind automată, nu necesită cerere și nici taxă.' },
        { q: 'Reabilitarea de drept și cea judecătorească au aceeași dată de start a termenului?', a: 'Da, ambele se calculează de la executarea pedepsei principale (eliberarea din închisoare, achitarea amenzii sau împlinirea termenului de supraveghere). Diferă doar durata termenului și modul de operare: de drept intervine automat, judecătorească necesită cerere și hotărâre.' },
      ]}
    >
      <h2>Când se șterge cazierul judiciar prin reabilitare</h2>
      <p>
        Codul Penal (art. 165-167) prevede <strong>termene fixe</strong> după care condamnarea se
        consideră reabilitată — nu se mai aplică vechea formulă cu fracție din pedeapsă.
      </p>
      <ul>
        <li><strong>Reabilitare de drept — 3 ani:</strong> amendă, închisoare ≤ 2 ani sau suspendare sub supraveghere;</li>
        <li><strong>Reabilitare judecătorească — 4 ani:</strong> închisoare între 2 și 5 ani;</li>
        <li><strong>5 ani:</strong> închisoare între 5 și 10 ani;</li>
        <li><strong>7 ani:</strong> închisoare peste 10 ani.</li>
      </ul>
      <p>
        Termenul curge, de regulă, de la data executării pedepsei principale (sau a achitării
        amenzii). Pentru a verifica ce mențiuni există în prezent, poți obține{' '}
        <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar online</Link>, fără drum la ghișeu.
      </p>
      <h2>Tabelul termenelor de reabilitare (Cod Penal art. 165-167)</h2>
      <p>
        Termenele sunt <strong>fixe</strong> și depind exclusiv de tipul și durata pedepsei
        aplicate prin hotărâre, nu de fracțiuni din pedeapsă:
      </p>
      <table>
        <thead>
          <tr>
            <th>Pedeapsa aplicată</th>
            <th>Tip reabilitare</th>
            <th>Termen</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Amendă sau închisoare ≤ 2 ani / suspendare sub supraveghere</td>
            <td>De drept</td>
            <td>3 ani</td>
          </tr>
          <tr>
            <td>Închisoare între 2 și 5 ani</td>
            <td>Judecătorească</td>
            <td>4 ani</td>
          </tr>
          <tr>
            <td>Închisoare între 5 și 10 ani</td>
            <td>Judecătorească</td>
            <td>5 ani</td>
          </tr>
          <tr>
            <td>Închisoare peste 10 ani</td>
            <td>Judecătorească</td>
            <td>7 ani</td>
          </tr>
        </tbody>
      </table>
      <p className="text-sm text-neutral-500">
        La reabilitarea judecătorească termenul se adaugă peste durata executată; la condamnări
        succesive termenul se calculează după ultima pedeapsă executată.
      </p>

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        O persoană a fost condamnată la <strong>3 ani de închisoare</strong> și a fost eliberată
        la data de <strong>15 martie 2022</strong>. Cum aflăm când intervine reabilitarea?
      </p>
      <ul>
        <li><strong>Pasul 1 — încadrarea pedepsei:</strong> 3 ani se află în intervalul 2-5 ani, deci se aplică <strong>reabilitarea judecătorească</strong>;</li>
        <li><strong>Pasul 2 — termenul aplicabil:</strong> pentru închisoare între 2 și 5 ani termenul este de <strong>4 ani</strong>;</li>
        <li><strong>Pasul 3 — data de start:</strong> termenul curge de la executarea pedepsei, adică de la <strong>15 martie 2022</strong>;</li>
        <li><strong>Pasul 4 — data reabilitării:</strong> 15 martie 2022 + 4 ani = <strong>15 martie 2026</strong>.</li>
      </ul>
      <p>
        Reabilitarea nu operează automat: la împlinirea termenului, persoana trebuie să introducă
        cerere la instanță, dovedind că a achitat cheltuielile de judecată și despăgubirile civile
        și că nu a săvârșit o nouă infracțiune în interval.
      </p>

      <h2>Greșeli frecvente la calculul reabilitării</h2>
      <ul>
        <li><strong>Calculul de la data condamnării:</strong> termenul curge de la <strong>executarea</strong> pedepsei, nu de la data sentinței sau a rămânerii definitive;</li>
        <li><strong>Confundarea cu vechea formulă:</strong> Codul Penal actual folosește termene fixe (3/4/5/7 ani), nu fracțiuni din durata pedepsei plus un număr de ani, cum era în vechiul cod;</li>
        <li><strong>Ignorarea unei noi infracțiuni:</strong> o condamnare nouă în interiorul termenului îl întrerupe — termenul reîncepe de la zero după a doua pedeapsă;</li>
        <li><strong>Așteptarea ștergerii automate la reabilitarea judecătorească:</strong> aceasta NU intervine de drept; este nevoie de cerere și hotărâre a instanței.</li>
      </ul>
      <p>
        După ce termenul s-a împlinit, verifică efectiv situația cerând{' '}
        <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar online</Link>. Dacă pedeapsa a
        fost o amendă, poți estima și{' '}
        <Link href="/calculator/amenda-circulatie/">valoarea unei amenzi</Link> cu un calculator
        dedicat.
      </p>

      <h2>Cazuri speciale: condamnări succesive, grațiere și amânare</h2>
      <p>
        Regula termenelor fixe se aplică direct la o singură condamnare, dar realitatea aduce des
        situații mai complicate, în care data reabilitării se mută:
      </p>
      <ul>
        <li>
          <strong>Condamnări succesive:</strong> dacă persoana are mai multe condamnări, termenul
          de reabilitare se calculează după <strong>ultima pedeapsă executată</strong>, raportat la
          cea mai grea dintre ele. O nouă infracțiune în interval întrerupe termenul, care reîncepe
          de la zero după executarea celei de-a doua pedepse;
        </li>
        <li>
          <strong>Grațiere:</strong> când pedeapsa a fost grațiată total, termenul de reabilitare
          curge de la <strong>data grațierii</strong>, nu de la o eliberare care nu a mai avut loc.
          Durata termenului rămâne cea corespunzătoare pedepsei aplicate inițial (3, 4, 5 sau 7 ani);
        </li>
        <li>
          <strong>Amânarea aplicării pedepsei:</strong> dacă instanța a amânat aplicarea pedepsei și
          termenul de supraveghere s-a împlinit fără incident, persoana nu este considerată
          condamnată — deci nu mai vorbim despre reabilitare, ci despre o situație în care mențiunea
          nu produce efecte în cazierul uzual.
        </li>
      </ul>
      <p>
        În toate aceste situații, termenele rămân cele fixe din Codul Penal — se schimbă doar data de
        la care încep să curgă. Tot ce ține de procedura în instanță (cerere, dovezi, taxe) ține de
        reabilitarea judecătorească; reabilitarea de drept rămâne automată atât timp cât nu apare o
        nouă infracțiune în interval.
      </p>

      <h2>Ce documente îți trebuie și ce verifici după reabilitare</h2>
      <p>
        Pentru o cerere de reabilitare judecătorească, instanța verifică în principal trei condiții:
        împlinirea termenului, lipsa unei noi infracțiuni și achitarea integrală a cheltuielilor de
        judecată și a despăgubirilor civile. În acest scop sunt utile cazierul judiciar actualizat,
        dovada plăților efectuate și, dacă e cazul, hotărârile de condamnare. Pentru reabilitarea de
        drept nu se depune nimic — ea operează automat, iar mențiunea dispare singură din cazierul
        uzual la împlinirea celor 3 ani.
      </p>
      <p>
        După ce termenul s-a împlinit, pasul practic este să verifici efectiv documentul: comandă{' '}
        <Link href={serviceUrl('cazier-judiciar')}>cazierul judiciar online</Link> și confirmă că
        mențiunea nu mai apare. Dacă pregătești o cerere în instanță, poți estima costul cu{' '}
        <Link href="/calculator/taxa-judiciara-de-timbru/">calculatorul taxei judiciare de timbru</Link>{' '}
        și poți urmări încadrarea în{' '}
        <Link href="/calculator/termene-judiciare/">termenele procedurale</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă. Situațiile cu condamnări succesive sau pedepse speciale au reguli
        diferite — consultă un avocat.
      </p>
    </CalculatorLayout>
  );
}
