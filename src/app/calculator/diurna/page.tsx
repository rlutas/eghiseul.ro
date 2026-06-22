import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { DiurnaCalculator } from '@/components/calculators/diurna-calculator';

const SLUG = 'diurna';
const TITLE = 'Calculator Diurnă 2026 — Plafon Neimpozabil Delegație';
const DESCRIPTION =
  'Calculează diurna neimpozabilă pentru delegație în țară (57,5 lei/zi) sau străinătate și partea impozabilă, conform regulilor fiscale 2026.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Diurnă')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Diurnă 2026"
      description="Estimează partea neimpozabilă și partea impozabilă a diurnei pentru delegație sau detașare, în țară sau în străinătate."
      widget={<DiurnaCalculator />}
      faqs={[
        {
          q: 'Cât este diurna neimpozabilă în țară în 2026?',
          a: 'Plafonul neimpozabil pentru sectorul privat este de 57,5 lei pe zi (2,5 × diurna din sectorul public, care este 23 lei). Există și un plafon lunar de 3 salarii de bază. Ce depășește aceste plafoane se impozitează ca venit salarial.',
        },
        {
          q: 'Cum se calculează diurna în străinătate?',
          a: 'Pentru fiecare țară există o valoare de bază (categoria I) stabilită prin HG 518/1995. Plafonul neimpozabil pentru sectorul privat este 2,5 × această valoare. De exemplu, pentru Germania baza este 35 EUR/zi, deci plafonul neimpozabil este 87,5 EUR/zi.',
        },
        {
          q: 'Ce taxe se aplică pe partea impozabilă a diurnei?',
          a: 'Partea de diurnă care depășește plafonul neimpozabil se impozitează ca salariu: impozit 10%, CAS 25% și CASS 10% (plus CAM 2,25% datorat de angajator).',
        },
        {
          q: 'Cum funcționează plafonul de 3 salarii de bază?',
          a: 'Pe lângă limita de 57,5 lei/zi, diurna neimpozabilă lunară nu poate depăși echivalentul a 3 salarii de bază corespunzătoare locului de muncă. Dacă numărul de zile de delegație este mare, se aplică plafonul mai mic dintre cele două (zilnic sau lunar). Practic, ambele condiții trebuie respectate simultan.',
        },
        {
          q: 'Diurna pe o deplasare mai scurtă de 12 ore se reduce?',
          a: 'Da. Pentru deplasările care durează sub 12 ore se acordă, de regulă, 50% din diurnă, în timp ce peste 24 de ore se acordă diurna integrală pentru fiecare zi de delegație. Plafonul neimpozabil se aplică proporțional cu suma efectiv acordată.',
        },
        {
          q: 'Se cumulează diurna în țară cu cea din străinătate în aceeași lună?',
          a: 'Da, dar fiecare se raportează la propriul plafon: 57,5 lei/zi pentru deplasările interne și 2,5 × valoarea categoriei I pe țară pentru cele externe. Excedentul peste fiecare plafon se impozitează ca venit salarial (impozit 10%, CAS 25%, CASS 10%).',
        },
      ]}
    >
      <h2>Ce este diurna și când e neimpozabilă</h2>
      <p>
        Diurna este suma acordată angajatului pentru cheltuielile de delegație sau detașare. O parte este{' '}
        <strong>neimpozabilă</strong> (până la un plafon), iar ce depășește plafonul se impozitează ca venit salarial.
      </p>

      <h2>Plafoane 2026</h2>
      <ul>
        <li><strong>În țară:</strong> 57,5 lei/zi (2,5 × 23 lei), limitat și la 3 salarii de bază pe lună;</li>
        <li><strong>Străinătate:</strong> 2,5 × valoarea categoriei I pe țară (ex. Germania 87,5 EUR/zi).</li>
      </ul>

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Presupunem o delegație de 5 zile în Germania, cu o diurnă acordată de 120 EUR/zi. Plafonul neimpozabil
        pentru Germania este 2,5 × 35 EUR = <strong>87,5 EUR/zi</strong>. Calculul pe zi arată astfel:
      </p>
      <ul>
        <li><strong>Diurnă acordată:</strong> 120 EUR/zi;</li>
        <li><strong>Partea neimpozabilă:</strong> 87,5 EUR/zi (rămâne netă, fără taxe);</li>
        <li><strong>Partea impozabilă:</strong> 120 − 87,5 = 32,5 EUR/zi.</li>
      </ul>
      <p>
        Pentru cele 5 zile rezultă un excedent impozabil de 5 × 32,5 = <strong>162,5 EUR</strong>, care se adaugă la
        baza salarială și se impozitează cu impozit 10%, CAS 25% și CASS 10%. Partea neimpozabilă de 5 × 87,5 =
        437,5 EUR rămâne netă pentru angajat.
      </p>

      <h2>Comparație rapidă pe câteva țări</h2>
      <p>
        Valoarea de bază (categoria I) pe țară este stabilită prin HG 518/1995, iar plafonul neimpozabil în sectorul
        privat este 2,5 × această valoare:
      </p>
      <table>
        <thead>
          <tr>
            <th>Destinație</th>
            <th>Bază categoria I</th>
            <th>Plafon neimpozabil (2,5×)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>România (în țară)</td>
            <td>23 lei/zi</td>
            <td>57,5 lei/zi</td>
          </tr>
          <tr>
            <td>Germania</td>
            <td>35 EUR/zi</td>
            <td>87,5 EUR/zi</td>
          </tr>
        </tbody>
      </table>

      <h2>Greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Ignorarea plafonului de 3 salarii de bază:</strong> chiar dacă diurna zilnică se încadrează în
          57,5 lei, la multe zile de delegație suma lunară poate depăși plafonul de 3 salarii de bază și devine
          parțial impozabilă;
        </li>
        <li>
          <strong>Aplicarea diurnei integrale pe deplasări scurte:</strong> pentru deplasările sub 12 ore se acordă,
          de regulă, doar 50% din diurnă;
        </li>
        <li>
          <strong>Confuzia cu sectorul public:</strong> valoarea de bază de 23 lei este reperul din sectorul public;
          în privat plafonul neimpozabil este de 2,5 ori mai mare, adică 57,5 lei/zi.
        </li>
      </ul>

      <p>
        Vezi și <Link href="/calculator/salariu/">calculatorul de salariu net</Link>,{' '}
        <Link href="/curs-valutar/">cursul valutar BNR</Link> (util pentru diurna în valută) sau{' '}
        <Link href="/calculator/contributii-pfa/">calculatorul de contribuții PFA</Link> dacă activezi pe cont propriu.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă. Plafonul de 3 salarii și regulile pentru deplasări parțiale (sub 12 ore = 50%) pot
        influența rezultatul.
      </p>
    </CalculatorLayout>
  );
}
