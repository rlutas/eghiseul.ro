import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ZileLucratoareCalculator } from '@/components/calculators/zile-lucratoare-calculator';

const SLUG = 'zile-lucratoare';
const TITLE = 'Calculator Zile Lucrătoare 2026';
const DESCRIPTION =
  'Calculator zile lucrătoare 2026: află câte zile lucrătoare sunt într-un interval, fără weekenduri și sărbători legale. ~250 zile lucrătoare în 2026.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Zile Lucrătoare')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Zile Lucrătoare 2026"
      description="Calculează câte zile lucrătoare sunt între două date, excluzând automat weekendurile și sărbătorile legale din Codul Muncii. În 2026 sunt aproximativ 250 de zile lucrătoare."
      widget={<ZileLucratoareCalculator />}
      faqs={[
        { q: 'Câte zile lucrătoare are anul 2026?', a: 'Anul 2026 are aproximativ 250 de zile lucrătoare, după excluderea weekendurilor (sâmbătă și duminică) și a sărbătorilor legale prevăzute de Codul Muncii.' },
        { q: 'Ce este o zi lucrătoare?', a: 'O zi lucrătoare este o zi de luni până vineri care nu este sărbătoare legală. Calculatorul scade automat din interval atât weekendurile, cât și zilele libere oficiale.' },
        { q: 'Ce sărbători legale se exclud din calcul?', a: 'Se exclud sărbătorile legale prevăzute de art. 139 din Codul Muncii, printre care 1 și 2 ianuarie, Vinerea Mare, Paștele și Rusaliile (date mobile), 1 mai, 1 iunie, 15 august, 30 noiembrie, 1 decembrie și 25–26 decembrie.' },
        { q: 'De ce diferă numărul de zile lucrătoare de la an la an?', a: 'Pentru că Paștele și Rusaliile sunt sărbători mobile, iar zilele de 1 sau 2 ianuarie, 1 mai etc. pot cădea în weekend. În funcție de cum se aliniază aceste date, un an are între aproximativ 248 și 252 de zile lucrătoare.' },
        { q: 'Sărbătorile care cad în weekend se recuperează?', a: 'Nu. Conform Codului Muncii, dacă o sărbătoare legală cade sâmbăta sau duminica, ea nu se mai transferă într-o zi lucrătoare, deci nu adaugă o zi liberă suplimentară.' },
      ]}
    >
      <h2>Cum se calculează zilele lucrătoare</h2>
      <p>
        O zi lucrătoare este orice zi de <strong>luni până vineri</strong> care nu este sărbătoare
        legală. Pentru a afla câte zile lucrătoare sunt într-un interval, se parcurge fiecare zi de la
        data de început până la data de sfârșit și se exclud:
      </p>
      <ul>
        <li>weekendurile — toate zilele de <strong>sâmbătă și duminică</strong>;</li>
        <li>
          <strong>sărbătorile legale</strong> prevăzute de art. 139 din Codul Muncii, inclusiv cele
          mobile (Paște și Rusalii), care se schimbă de la an la an.
        </li>
      </ul>
      <p>
        Restul zilelor rămase reprezintă zilele lucrătoare. În <strong>2026</strong> rezultă, pe tot
        anul, aproximativ <strong>250 de zile lucrătoare</strong>.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem că vrei să afli câte zile lucrătoare sunt într-o săptămână obișnuită, de luni
        până duminică:
      </p>
      <ul>
        <li>intervalul are în total <strong>7 zile calendaristice</strong>;</li>
        <li>scazi <strong>2 zile de weekend</strong> (sâmbătă și duminică);</li>
        <li>
          dacă în acea săptămână nu cade nicio sărbătoare legală, rămân{' '}
          <strong>5 zile lucrătoare</strong>.
        </li>
      </ul>
      <p>
        Dacă în interval cade o sărbătoare legală într-o zi de luni–vineri, mai scazi încă o zi: de
        exemplu, o săptămână care include 1 mai (atunci când acesta pică într-o zi lucrătoare) are
        doar <strong>4 zile lucrătoare</strong>. Calculatorul de mai sus aplică automat aceste reguli
        pentru orice interval, oricât de lung.
      </p>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Numărarea zilelor calendaristice în loc de cele lucrătoare.</strong> Multe termene
          legale și de muncă se exprimă în zile lucrătoare, nu calendaristice — diferența contează.
        </li>
        <li>
          <strong>Uitarea sărbătorilor mobile.</strong> Paștele și Rusaliile cad în date diferite în
          fiecare an, așa că nu poți presupune aceleași zile libere de la un an la altul.
        </li>
        <li>
          <strong>Așteptarea recuperării sărbătorilor din weekend.</strong> Dacă o sărbătoare legală
          pică sâmbăta sau duminica, ea nu se reportează într-o zi lucrătoare.
        </li>
        <li>
          <strong>Includerea sau excluderea greșită a capetelor de interval.</strong> Verifică dacă
          atât data de început, cât și cea de sfârșit trebuie numărate în situația ta.
        </li>
      </ul>

      <h2>Context legal</h2>
      <p>
        Sărbătorile legale în care nu se lucrează sunt stabilite de <strong>art. 139 din Codul
        Muncii</strong>. Lista include zile fixe (1 și 2 ianuarie, 1 mai, 1 iunie, 15 august, 30
        noiembrie, 1 decembrie, 25–26 decembrie) și zile mobile, legate de calendarul ortodox —
        Vinerea Mare, Paștele și Rusaliile. Tocmai pentru că aceste date mobile se schimbă anual,
        numărul total de zile lucrătoare diferă de la un an la altul, oscilând în jurul cifrei de{' '}
        <strong>250 de zile lucrătoare</strong> pentru 2026.
      </p>
      <p>
        Calculul în zile lucrătoare este relevant pentru termene de muncă, concedii și anumite
        proceduri administrative. Vezi și{' '}
        <Link href="/calculator/zile-concediu-odihna/">calculatorul de zile de concediu de odihnă</Link>{' '}
        dacă îți planifici concediul, sau{' '}
        <Link href="/calculator/termene-judiciare/">calculatorul de termene judiciare</Link> pentru
        termenele procedurale.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative. Pentru termene legale stricte verifică actul normativ aplicabil
        sau consultă un specialist, deoarece unele proceduri folosesc reguli proprii de calcul al
        zilelor.
      </p>
    </CalculatorLayout>
  );
}
