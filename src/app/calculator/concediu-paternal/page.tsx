import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ConcediuPaternalCalculator } from '@/components/calculators/concediu-paternal-calculator';

const SLUG = 'concediu-paternal';
const TITLE = 'Calculator Concediu Paternal 2026';
const DESCRIPTION =
  'Calculator concediu paternal 2026: 10 zile lucrătoare, plus 5 zile cu curs de puericultură. Vezi câte zile ți se cuvin și termenul de 8 săptămâni.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Concediu Paternal')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Concediu Paternal 2026"
      description="Află câte zile de concediu paternal ți se cuvin în 2026 conform Legii 210/1999: 10 zile lucrătoare de bază, plus 5 zile dacă ai absolvit un curs de puericultură, plătite 100% de angajator."
      widget={<ConcediuPaternalCalculator />}
      faqs={[
        {
          q: 'Câte zile de concediu paternal am dreptul în 2026?',
          a: 'Conform Legii 210/1999, tatăl are dreptul la 10 zile lucrătoare de concediu paternal. Dacă a absolvit un curs de puericultură, primește încă 5 zile lucrătoare, deci 15 zile în total.',
        },
        {
          q: 'În ce interval pot lua concediul paternal?',
          a: 'Concediul paternal se acordă în primele 8 săptămâni de la nașterea copilului. Este recomandat să depui cererea la angajator imediat după naștere, pentru a te încadra în acest termen.',
        },
        {
          q: 'Cine plătește concediul paternal?',
          a: 'Indemnizația pentru concediul paternal este plătită 100% de angajator. Nu se reține din bugetul de asigurări sociale și nu reduce salariul pe perioada respectivă.',
        },
        {
          q: 'Cum obțin cele 5 zile suplimentare?',
          a: 'Cele 5 zile lucrătoare suplimentare se acordă tatălui care a absolvit un curs de puericultură (îngrijirea nou-născutului). Trebuie să prezinți angajatorului dovada absolvirii cursului.',
        },
        {
          q: 'Concediul paternal se acordă în zile lucrătoare sau calendaristice?',
          a: 'Concediul paternal se calculează în zile lucrătoare. Cele 10 zile (sau 15 cu cursul de puericultură) nu includ weekendurile și sărbătorile legale.',
        },
        {
          q: 'Concediul paternal afectează concediul de odihnă anual?',
          a: 'Nu. Concediul paternal este un drept distinct și nu se scade din cele 21 de zile de concediu de odihnă anual. Cele 10 zile lucrătoare (sau 15 cu cursul de puericultură) se acordă suplimentar, plătite 100% de angajator.',
        },
        {
          q: 'Pot lua concediul paternal fracționat, în mai multe tranșe?',
          a: 'Legea 210/1999 stabilește cele 10 zile lucrătoare (sau 15 cu cursul de puericultură) ca un drept ce trebuie consumat în primele 8 săptămâni de la naștere. Modul de acordare se stabilește împreună cu angajatorul; important este să te încadrezi în termenul de 8 săptămâni, altfel pierzi dreptul.',
        },
        {
          q: 'Tatăl adoptiv are dreptul la concediu paternal?',
          a: 'Da, dreptul vizează participarea efectivă a tatălui la îngrijirea copilului. Tot 10 zile lucrătoare de bază, plus 5 zile cu cursul de puericultură (total 15), plătite integral de angajator. Pentru detalii privind situația ta, confirmă cu angajatorul condiția de acordare.',
        },
      ]}
    >
      <h2>Cum se calculează concediul paternal în 2026</h2>
      <p>
        Concediul paternal este reglementat de <strong>Legea 210/1999</strong> și se acordă tatălui
        pentru a participa la îngrijirea nou-născutului. Numărul de zile se stabilește astfel:
      </p>
      <ul>
        <li>
          <strong>10 zile lucrătoare</strong> — concediul paternal de bază, la care are dreptul orice
          tată salariat;
        </li>
        <li>
          <strong>+5 zile lucrătoare</strong> — dacă tatăl a absolvit un curs de puericultură, deci{' '}
          <strong>15 zile lucrătoare</strong> în total.
        </li>
      </ul>
      <p>
        Toate aceste zile sunt <strong>plătite 100% de angajator</strong> și trebuie luate în{' '}
        <strong>primele 8 săptămâni</strong> de la nașterea copilului.
      </p>

      <h2>Exemplu pas cu pas</h2>
      <p>
        Să presupunem că ești tată și copilul s-a născut într-o zi de luni. Calculezi astfel:
      </p>
      <ul>
        <li>
          <strong>Concediul de bază:</strong> 10 zile lucrătoare. Dacă începi luni, cele 10 zile
          acoperă două săptămâni lucrătoare consecutive (fără weekenduri).
        </li>
        <li>
          <strong>Cursul de puericultură:</strong> dacă l-ai absolvit și prezinți dovada, mai
          primești 5 zile lucrătoare, deci ajungi la <strong>15 zile lucrătoare</strong> în total.
        </li>
        <li>
          <strong>Termenul:</strong> toate zilele trebuie consumate în primele 8 săptămâni de la
          naștere. Dacă naști pe 1 iunie, ai timp până aproximativ la sfârșitul lunii iulie să le
          folosești.
        </li>
      </ul>
      <p>
        Calculatorul de mai sus îți arată automat câte zile ți se cuvin în funcție de absolvirea
        cursului de puericultură.
      </p>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confundarea cu concediul de creștere a copilului.</strong> Concediul paternal (10
          sau 15 zile) este distinct de concediul de creștere a copilului, care durează până la 2 ani
          și este plătit din bugetul de stat, nu de angajator.
        </li>
        <li>
          <strong>Depășirea termenului de 8 săptămâni.</strong> Concediul paternal nu poate fi amânat
          oricât — dacă nu îl iei în primele 8 săptămâni de la naștere, pierzi dreptul la el.
        </li>
        <li>
          <strong>Numărarea zilelor calendaristice.</strong> Cele 10 sau 15 zile sunt{' '}
          <strong>zile lucrătoare</strong>, nu calendaristice — weekendurile și sărbătorile legale nu
          se pun la socoteală.
        </li>
        <li>
          <strong>Lipsa dovezii pentru cele 5 zile suplimentare.</strong> Fără certificatul de
          absolvire a cursului de puericultură, angajatorul acordă doar cele 10 zile de bază.
        </li>
      </ul>

      <h2>Exemplu numeric detaliat: copil născut joi, 4 iunie 2026</h2>
      <p>
        Să luăm un caz concret și să urmărim calculul pas cu pas, ca să vezi exact cum se așază
        cele 10 zile lucrătoare în calendar și până când se închide fereastra de 8 săptămâni.
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — data nașterii:</strong> copilul se naște joi, 4 iunie 2026. Din acest
          moment pornește atât dreptul la concediu, cât și termenul de 8 săptămâni.
        </li>
        <li>
          <strong>Pasul 2 — depunerea cererii:</strong> tatăl depune cererea la angajator a doua
          zi, vineri 5 iunie. E recomandat să o depui cât mai repede, ca să te încadrezi sigur în
          termen.
        </li>
        <li>
          <strong>Pasul 3 — cele 10 zile de bază:</strong> dacă tatăl începe concediul luni, 8
          iunie, cele <strong>10 zile lucrătoare</strong> se întind pe două săptămâni de lucru
          consecutive (8–12 iunie și 15–19 iunie), sărind peste weekendul 13–14 iunie.
        </li>
        <li>
          <strong>Pasul 4 — cele 5 zile cu puericultură:</strong> dacă tatăl prezintă dovada
          cursului de puericultură, adaugă încă <strong>5 zile lucrătoare</strong> (22–26 iunie) și
          ajunge la <strong>15 zile lucrătoare</strong> în total.
        </li>
        <li>
          <strong>Pasul 5 — termenul de 8 săptămâni:</strong> 8 săptămâni de la 4 iunie înseamnă
          aproximativ 30 iulie 2026. Toate zilele de mai sus se consumă confortabil înainte de
          această dată.
        </li>
        <li>
          <strong>Pasul 6 — plata:</strong> pentru toate cele 10 (sau 15) zile, salariul rămâne
          neatins, fiind suportat <strong>100% de angajator</strong>.
        </li>
      </ul>

      <h2>Tabel: zile de concediu paternal în funcție de situație</h2>
      <table>
        <thead>
          <tr>
            <th>Situație</th>
            <th>Zile de bază</th>
            <th>Zile curs puericultură</th>
            <th>Total zile lucrătoare</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tată salariat, fără curs</td>
            <td>10</td>
            <td>0</td>
            <td>
              <strong>10</strong>
            </td>
          </tr>
          <tr>
            <td>Tată salariat, cu curs de puericultură</td>
            <td>10</td>
            <td>5</td>
            <td>
              <strong>15</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Indiferent de situație, zilele sunt <strong>lucrătoare</strong> (nu calendaristice), se iau
        în <strong>primele 8 săptămâni</strong> de la naștere și sunt plătite{' '}
        <strong>100% de angajator</strong>.
      </p>

      <h2>Documente necesare și pașii la angajator</h2>
      <p>
        Procedura este simplă, dar trebuie respectată ordinea ca să nu pierzi cele 5 zile
        suplimentare sau termenul de 8 săptămâni:
      </p>
      <ul>
        <li>
          <strong>Cerere scrisă</strong> adresată angajatorului, în care soliciți concediul
          paternal de 10 zile lucrătoare (sau 15, dacă invoci cursul de puericultură).
        </li>
        <li>
          <strong>Certificatul de naștere al copilului</strong> sau, imediat după naștere,
          adeverința de la maternitate care atestă data nașterii.
        </li>
        <li>
          <strong>Dovada absolvirii cursului de puericultură</strong> — obligatorie pentru cele 5
          zile suplimentare; fără ea, angajatorul acordă doar cele 10 zile de bază.
        </li>
        <li>
          <strong>Depunere în termen:</strong> ideal cât mai aproape de naștere, ca să te încadrezi
          în primele 8 săptămâni.
        </li>
      </ul>
      <p>
        Dacă ai nevoie și de certificate sau extrase oficiale legate de nașterea copilului, le poți
        obține rapid prin{' '}
        <Link href="/servicii/">serviciul de stare civilă</Link> de pe eGhișeul.ro.
      </p>

      <h2>Context legal</h2>
      <p>
        Dreptul la concediul paternal este garantat de Legea 210/1999 privind concediul paternal.
        Scopul reglementării este de a permite tatălui să fie alături de mamă și de nou-născut în
        primele săptămâni de viață. Indemnizația aferentă este suportată integral de angajator, iar
        durata și termenul sunt fixe: 10 zile lucrătoare (sau 15 cu cursul de puericultură), în
        primele 8 săptămâni de la naștere. Pentru beneficii pe termen mai lung, vezi concediul și
        indemnizația de creștere a copilului.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și au scop informativ. Pentru situația ta exactă consultă
        angajatorul sau un specialist în legislația muncii. Vezi și{' '}
        <Link href="/calculator/calculator-indemnizatie-crestere-copil/">
          calculatorul de indemnizație pentru creșterea copilului
        </Link>{' '}
        sau{' '}
        <Link href="/calculator/concediu-medical/">calculatorul de concediu medical</Link> pentru
        alte tipuri de indemnizații.
      </p>
    </CalculatorLayout>
  );
}
