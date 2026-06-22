import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { EstimarePensieCalculator } from '@/components/calculators/estimare-pensie-calculator';

const SLUG = 'estimare-pensie';
const TITLE = 'Calculator Estimare Pensie 2026 — Puncte și Cuantum';
const DESCRIPTION =
  'Estimează pensia pentru limită de vârstă în 2026 pe baza stagiului și a salariului: puncte de contributivitate + stabilitate × valoarea punctului de referință (81 lei).';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Estimare Pensie')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Estimare Pensie"
      description="Estimează cuantumul pensiei pentru limită de vârstă pe baza stagiului de cotizare și a salariului, conform sistemului de puncte din Legea 360/2023."
      tldr="În 2026, pensia = total puncte × 81 lei (valoarea punctului de referință, înghețată prin Legea 141/2025). Punctele se compun din contributivitate (salariul tău ÷ media de ~9.192 lei/an) plus stabilitate peste 25 de ani de stagiu. Exemplu: 35 de ani la media pe economie = 41,25 puncte ≈ 3.341 lei/lună."
      widget={<EstimarePensieCalculator />}
      faqs={[
        {
          q: 'Cum se calculează pensia în 2026?',
          a: 'Conform Legii 360/2023, pensia = numărul total de puncte × valoarea punctului de referință (VPR). Punctele se compun din punctele de contributivitate (raportul dintre salariul tău și salariul mediu pe economie, pe fiecare an de stagiu) plus punctele de stabilitate pentru stagiul peste 25 de ani.',
        },
        {
          q: 'Cât este valoarea punctului de referință în 2026?',
          a: 'Valoarea punctului de referință (VPR) este 81 de lei în 2026 și a fost înghețată (nu se indexează în 2026, conform Legii 141/2025).',
        },
        {
          q: 'Ce sunt punctele de stabilitate?',
          a: 'Sunt puncte suplimentare pentru stagiul de cotizare de peste 25 de ani: 0,50 puncte/an pentru anii 26-30, 0,75 puncte/an pentru 31-35 și 1,00 punct/an pentru fiecare an peste 35. De exemplu, 35 de ani de stagiu aduc 6,25 puncte de stabilitate.',
        },
        {
          q: 'Cât de exactă este estimarea?',
          a: 'Este orientativă. Calculul oficial al Casei de Pensii folosește venitul real lunar raportat la câștigul salarial mediu din fiecare an al carierei. Calculatorul folosește un salariu mediu constant, ca toate estimatoarele publice.',
        },
        {
          q: 'De ce nu crește pensia mea în 2026?',
          a: 'Pentru că valoarea punctului de referință (VPR) a fost înghețată la 81 de lei în 2026 prin Legea 141/2025, deci nu se aplică indexarea anuală. Numărul tău de puncte rămâne același, iar cuantumul se recalculează doar dacă mai adaugi stagiu de cotizare sau ani de stabilitate peste pragul de 25 de ani.',
        },
        {
          q: 'Salariul peste media pe economie îmi crește pensia?',
          a: 'Da. Punctul de contributivitate este raportul dintre venitul tău brut și câștigul salarial mediu pe economie (aproximativ 9.192 lei în 2026). Dacă ai câștigat dublu față de medie un an întreg, primești 2 puncte pentru acel an în loc de 1. De aceea anii cu venituri mari contează mai mult decât anii cu salariu minim.',
        },
        {
          q: 'Stagiul sub 25 de ani aduce puncte de stabilitate?',
          a: 'Nu. Punctele de stabilitate se acordă exclusiv pentru stagiul de cotizare care depășește 25 de ani. Sub acest prag primești doar puncte de contributivitate. Primul punct de stabilitate apare începând cu al 26-lea an de stagiu.',
        },
      ]}
    >
      <h2>Cum se calculează pensia în sistemul cu puncte</h2>
      <p>
        Din 2024 (Legea 360/2023), pensia se calculează ca <strong>număr total de puncte × valoarea punctului de
        referință (VPR)</strong>. VPR este 81 de lei în 2026. Numărul de puncte are două componente: punctele de
        contributivitate și punctele de stabilitate.
      </p>

      <h2>Punctele de contributivitate</h2>
      <p>
        Pentru fiecare an, punctajul este raportul dintre venitul tău brut și câștigul salarial mediu pe economie
        (aproximativ 9.192 lei în 2026). Dacă ai câștigat exact cât media, primești 1 punct pe an. Suma pe toți anii de
        stagiu dă punctele de contributivitate.
      </p>

      <h2>Exemplu: 35 de ani de stagiu, salariu egal cu media</h2>
      <p>
        Puncte de contributivitate = 1,0 × 35 = 35. Puncte de stabilitate = 0,50 × 5 (anii 26-30) + 0,75 × 5 (anii
        31-35) = 6,25. Total = 41,25 puncte × 81 lei = <strong>~3.341 lei/lună</strong>.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem o carieră de <strong>35 de ani</strong> în care ai câștigat, în medie, exact cât câștigul salarial
        mediu pe economie (raport 1,0). Iată cum se ajunge la cuantum, etapă cu etapă:
      </p>
      <ul>
        <li>
          <strong>Pasul 1 — punctele de contributivitate.</strong> Pentru fiecare an în care venitul tău brut a fost
          egal cu media pe economie (aproximativ 9.192 lei în 2026) primești 1 punct. Pe 35 de ani: 1,0 × 35 ={' '}
          <strong>35 de puncte</strong>.
        </li>
        <li>
          <strong>Pasul 2 — punctele de stabilitate pentru anii 26-30.</strong> Cei 5 ani de peste pragul de 25 aduc
          0,50 puncte/an: 0,50 × 5 = <strong>2,50 puncte</strong>.
        </li>
        <li>
          <strong>Pasul 3 — punctele de stabilitate pentru anii 31-35.</strong> Următorii 5 ani aduc 0,75 puncte/an:
          0,75 × 5 = <strong>3,75 puncte</strong>. Subtotal stabilitate = 2,50 + 3,75 = 6,25 puncte.
        </li>
        <li>
          <strong>Pasul 4 — total puncte.</strong> 35 + 6,25 = <strong>41,25 puncte</strong>.
        </li>
        <li>
          <strong>Pasul 5 — cuantumul.</strong> 41,25 × 81 lei (VPR în 2026) ={' '}
          <strong>~3.341 lei/lună</strong>.
        </li>
      </ul>

      <h2>Cum cresc punctele de stabilitate pe an de stagiu</h2>
      <p>
        Punctele de stabilitate se acordă doar pentru stagiul care depășește 25 de ani și cresc în trei trepte. Tabelul
        de mai jos arată cât adaugă fiecare interval de vechime:
      </p>
      <table>
        <thead>
          <tr>
            <th>Interval de stagiu</th>
            <th>Puncte de stabilitate/an</th>
            <th>Total pe interval</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Anii 26-30 (5 ani)</td>
            <td>0,50</td>
            <td>2,50 puncte</td>
          </tr>
          <tr>
            <td>Anii 31-35 (5 ani)</td>
            <td>0,75</td>
            <td>3,75 puncte</td>
          </tr>
          <tr>
            <td>Peste 35 de ani (fiecare an)</td>
            <td>1,00</td>
            <td>1,00 punct/an suplimentar</td>
          </tr>
        </tbody>
      </table>
      <p>
        Pe scurt: la 30 de ani de stagiu ai 2,50 puncte de stabilitate, la 35 de ani ajungi la 6,25 puncte, iar fiecare
        an lucrat peste 35 mai adaugă câte 1,00 punct întreg. Cu VPR de 81 de lei, un singur an în plus peste 35 înseamnă
        încă 81 de lei în cuantumul lunar.
      </p>

      <h2>Greșeli frecvente la estimarea pensiei</h2>
      <ul>
        <li>
          <strong>Confuzia dintre vechime și stagiu de cotizare.</strong> Doar perioadele pentru care s-au plătit
          contribuții intră în stagiu. Anii fără contribuții nu generează puncte de contributivitate.
        </li>
        <li>
          <strong>Aplicarea unei indexări inexistente.</strong> Mulți presupun că VPR crește anual, dar în 2026 valoarea
          este înghețată la 81 de lei (Legea 141/2025), deci cuantumul nu se majorează automat.
        </li>
        <li>
          <strong>Acordarea de puncte de stabilitate sub 25 de ani.</strong> Punctele de stabilitate apar abia de la al
          26-lea an de stagiu; sub acest prag există doar puncte de contributivitate.
        </li>
        <li>
          <strong>Folosirea salariului net în loc de cel brut.</strong> Raportul la media pe economie se face pe venitul
          brut, nu pe cel din mână.
        </li>
      </ul>

      <h2>Context legal</h2>
      <p>
        Sistemul cu puncte de contributivitate și stabilitate este reglementat de <strong>Legea 360/2023</strong>,
        aplicabilă din 2024, care a înlocuit vechiul mecanism bazat pe punctajul mediu anual. Valoarea punctului de
        referință (VPR) pentru 2026 este stabilită la 81 de lei și a fost înghețată prin <strong>Legea 141/2025</strong>,
        adică nu se aplică indexarea anuală pentru acest an. Calculul oficial și cuantumul definitiv se stabilesc de
        Casa Națională de Pensii Publice (CNPP) pe baza istoricului real de venituri din întreaga carieră.
      </p>

      <p>
        Vezi și <Link href="/calculator/varsta-pensionare/">calculatorul de vârstă de pensionare</Link>,{' '}
        <Link href="/calculator/impozit-pensie/">calculatorul de impozit pe pensie</Link> și{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu brut-net</Link> pentru a vedea ce venit brut
        raportezi la media pe economie.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă. Valoarea exactă se stabilește de CNPP pe baza istoricului real de venituri. VPR este
        înghețat la 81 de lei în 2026.
      </p>
    </CalculatorLayout>
  );
}
