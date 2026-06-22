import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { CreditIpotecarCalculator } from '@/components/calculators/credit-ipotecar-calculator';

const SLUG = 'credit-ipotecar';
const TITLE = 'Calculator Credit Ipotecar 2026 — Rata Lunară';
const DESCRIPTION =
  'Calculator credit ipotecar 2026: afli rata lunară, totalul de plată și dobânda totală pentru un credit cu rate egale, orientativ, fără comisioane.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Credit Ipotecar')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Credit Ipotecar 2026"
      description="Estimează rata lunară a unui credit ipotecar cu rate egale (anuitate), totalul de plată și dobânda totală. Calculul este orientativ, fără comisioane și fără DAE."
      widget={<CreditIpotecarCalculator />}
      faqs={[
        { q: 'Cum se calculează rata lunară la un credit ipotecar?', a: 'La un credit cu rate egale (anuitate) rata lunară se calculează cu formula R = P·i/(1−(1+i)^−n), unde P este suma împrumutată, i este dobânda lunară (dobânda anuală împărțită la 12) și n este numărul total de luni. Rata rămâne constantă pe toată perioada dacă dobânda nu se modifică.' },
        { q: 'Ce înseamnă totalul de plată și dobânda totală?', a: 'Totalul de plată este rata lunară înmulțită cu numărul de luni, adică tot ce returnezi băncii. Dobânda totală este diferența dintre totalul de plată și suma împrumutată — costul efectiv al banilor pe toată durata creditului.' },
        { q: 'Calculatorul include comisioanele și DAE?', a: 'Nu. Rezultatul este orientativ și ține cont doar de principal, dobândă și perioadă. Comisioanele de analiză, asigurările obligatorii și alte costuri nu sunt incluse, deci DAE (dobânda anuală efectivă) reală va fi mai mare decât dobânda nominală folosită aici.' },
        { q: 'Ce este gradul de îndatorare?', a: 'Este ponderea ratelor lunare totale în venitul net. Conform reglementărilor, rata lunară (împreună cu celelalte credite) nu trebuie să depășească, de regulă, 40% din venitul net lunar.' },
        { q: 'De ce diferă rata calculată aici de oferta băncii?', a: 'Banca aplică propria dobândă (de obicei legată de IRCC plus o marjă), adaugă comisioane și asigurări și poate folosi o altă metodă de rotunjire. Folosește acest calcul ca estimare, iar pentru cifra exactă cere graficul de rambursare de la bancă.' },
      ]}
    >
      <h2>Cum se calculează rata la un credit ipotecar</h2>
      <p>
        Cele mai multe credite ipotecare folosesc <strong>rate egale (anuitate)</strong>: plătești
        aceeași sumă în fiecare lună, dar proporția dintre dobândă și principal se schimbă în timp. La
        început rata conține mai multă dobândă, iar spre final mai mult principal. Rata lunară se
        calculează cu formula:
      </p>
      <p>
        <strong>R = P·i/(1−(1+i)^−n)</strong>
      </p>
      <p>
        unde <strong>P</strong> este suma împrumutată, <strong>i</strong> este dobânda lunară (dobânda
        anuală împărțită la 12), iar <strong>n</strong> este numărul total de luni. Din rată derivă
        apoi <strong>totalul de plată</strong> (rata × n) și <strong>dobânda totală</strong> (totalul
        de plată − P).
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un credit de <strong>300.000 lei</strong>, cu o dobândă anuală de{' '}
        <strong>6%</strong>, pe <strong>25 de ani</strong> (300 de luni). Calculul decurge astfel:
      </p>
      <ul>
        <li>
          <strong>dobânda lunară:</strong> i = 6% / 12 = 0,5% = 0,005;
        </li>
        <li>
          <strong>numărul de luni:</strong> n = 25 × 12 = 300;
        </li>
        <li>
          <strong>rata lunară:</strong> R = 300.000 × 0,005 / (1 − (1,005)^−300) ≈ 1.933 lei;
        </li>
        <li>
          <strong>totalul de plată:</strong> 1.933 × 300 ≈ 579.900 lei;
        </li>
        <li>
          <strong>dobânda totală:</strong> 579.900 − 300.000 ≈ 279.900 lei.
        </li>
      </ul>
      <p>
        Pe un orizont lung, dobânda aproape egalează suma împrumutată. Modifică perioada sau dobânda în
        calculatorul de mai sus ca să vezi cât de mult contează fiecare an în plus.
      </p>

      <h2>Situații și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Confundarea dobânzii nominale cu DAE.</strong> Acest calcul folosește dobânda
          nominală. Costul real (cu comisioane și asigurări) este reflectat de DAE, care este mai
          mare.
        </li>
        <li>
          <strong>Ignorarea gradului de îndatorare.</strong> Rata lunară, împreună cu celelalte
          credite, nu ar trebui să depășească <strong>40% din venitul net</strong>. Dacă o depășește,
          banca poate respinge cererea.
        </li>
        <li>
          <strong>Subestimarea perioadei.</strong> O perioadă mai lungă scade rata lunară, dar crește
          semnificativ dobânda totală plătită.
        </li>
        <li>
          <strong>Presupunerea unei dobânzi fixe pe toată durata.</strong> Multe credite au dobândă
          variabilă (IRCC plus o marjă), deci rata se poate modifica când indicele se schimbă.
        </li>
      </ul>

      <h2>Context legal și de bun-simț financiar</h2>
      <p>
        Gradul maxim de îndatorare este reglementat tocmai pentru a proteja debitorul de
        supraîndatorare: de regulă, ratele lunare totale nu pot depăși 40% din venitul net lunar. Un
        credit ipotecar este, de obicei, cea mai mare obligație financiară a unei gospodării pe câteva
        decenii, așa că merită comparate mai multe oferte și verificat impactul unei dobânzi variabile.
        Înainte de a semna, cere băncii graficul complet de rambursare și citește costurile incluse în
        DAE.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultatele sunt orientative și nu includ comisioane, asigurări sau DAE. Pentru cifra exactă
        cere graficul de rambursare de la bancă. Vezi și{' '}
        <Link href="/calculator/rambursare-anticipata/">calculatorul de rambursare anticipată</Link>{' '}
        dacă vrei să afli cât economisești achitând în avans, sau{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link> pentru costurile
        actului de vânzare-cumpărare.
      </p>
    </CalculatorLayout>
  );
}
