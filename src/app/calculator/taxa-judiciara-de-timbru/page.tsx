import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TaxaTimbruCalculator } from '@/components/calculators/taxa-timbru-calculator';

const SLUG = 'taxa-judiciara-de-timbru';
const TITLE = 'Calculator Taxă Judiciară de Timbru 2026 (OUG 80/2013)';
const DESCRIPTION =
  "Calculează taxa judiciară de timbru pe tranșe (OUG 80/2013) plus taxele fixe frecvente: divorț, apel, ordonanță președințială.";

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: '/og/default.png',
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Taxă Judiciară de Timbru"
      description="Estimează taxa judiciară de timbru pentru o cerere evaluabilă în bani, conform tranșelor din OUG 80/2013, plus taxele fixe cele mai întâlnite."
      widget={<TaxaTimbruCalculator />}
      faqs={[
        { q: 'Cum se calculează taxa de timbru pentru o cerere evaluabilă în bani?', a: 'Se aplică tranșe progresive (Art. 3 OUG 80/2013): de exemplu, pentru 100.000 lei taxa este 2.105 lei + 2% din suma ce depășește 50.000 lei = 3.105 lei.' },
        { q: 'Cât este taxa de timbru pentru divorț?', a: 'Divorțul prin acord sau din culpă se timbrează cu 200 lei; cel din motive de sănătate cu 50 lei. Cererile accesorii (locuința copilului, autoritatea părintească) — 20 lei fiecare.' },
        { q: 'Se indexează taxa de timbru cu inflația?', a: 'Nu. Sumele din OUG 80/2013 sunt nominale și nu se indexează. Ultima modificare cu impact asupra valorilor a fost Legea 268/2024.' },
        { q: 'Cât plătesc dacă fac apel?', a: 'La apel se datorează 50% din taxa achitată la judecata în fond a cererii (Art. 23 OUG 80/2013). Dacă în fond ai plătit, de exemplu, 3.105 lei pentru o cerere de 100.000 lei, taxa de apel este 1.552,5 lei. Recursul se timbrează la 100 lei pentru motive de nelegalitate sau tot 50% din taxa de fond, în funcție de tipul cauzei.' },
        { q: 'Cum se calculează taxa pentru partaj (ieșire din indiviziune)?', a: 'Taxa depinde de ce solicită cererea: doar partajul bunurilor — 3% din valoarea masei partajabile; stabilirea bunurilor supuse împărțelii — 5%; și stabilirea calității de coproprietar și a cotei — 5%. Dacă se cer mai multe dintre acestea, procentele se cumulează.' },
        { q: 'Ce se întâmplă dacă greșesc suma taxei de timbru?', a: 'Dacă ai plătit mai puțin, instanța îți pune în vedere să completezi diferența până la primul termen; cererea netimbrată corect se anulează. Dacă ai plătit mai mult, poți cere restituirea sumei achitate în plus în termen de un an de la data plății. Pentru încadrarea corectă a cererii, este recomandat un avocat.' },
      ]}
    >
      <h2>Cum se calculează taxa judiciară de timbru</h2>
      <p>
        Pentru <strong>cererile evaluabile în bani</strong>, taxa se calculează pe tranșe progresive,
        conform Art. 3 din OUG 80/2013:
      </p>
      <ul>
        <li>până la 500 lei: 8% (minimum 20 lei);</li>
        <li>501–5.000 lei: 40 lei + 7% peste 500;</li>
        <li>5.001–25.000 lei: 355 lei + 5% peste 5.000;</li>
        <li>25.001–50.000 lei: 1.355 lei + 3% peste 25.000;</li>
        <li>50.001–250.000 lei: 2.105 lei + 2% peste 50.000;</li>
        <li>peste 250.000 lei: 6.105 lei + 1% peste 250.000.</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Valori orientative conform OUG 80/2013 (text consolidat 2026). Pentru încadrarea exactă a
        cererii tale, consultă un avocat.
      </p>

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem că ai o <strong>cerere evaluabilă în bani de 100.000 lei</strong> (de exemplu,
        recuperarea unei datorii). Pentru a afla taxa, identifici mai întâi tranșa în care se încadrează
        valoarea — aici, intervalul <strong>50.001–250.000 lei</strong>:
      </p>
      <ul>
        <li>componenta fixă a tranșei: <strong>2.105 lei</strong>;</li>
        <li>suma care depășește pragul inferior: 100.000 − 50.000 = <strong>50.000 lei</strong>;</li>
        <li>procentul aplicat peste prag: 2% × 50.000 = <strong>1.000 lei</strong>;</li>
        <li>taxă totală: 2.105 + 1.000 = <strong>3.105 lei</strong>.</li>
      </ul>
      <p>
        Dacă pierzi în fond și ataci hotărârea, la <strong>apel</strong> vei plăti 50% din această sumă,
        adică 1.552,5 lei. Procentul nu se aplică niciodată la întreaga valoare a cererii, ci doar la
        partea care depășește pragul tranșei — de aceea taxa crește lent, nu liniar.
      </p>

      <h2>Tabel cu tranșele și cotele aplicate</h2>
      <p>
        Pentru cererile evaluabile în bani, fiecare tranșă are o sumă fixă plus un procent aplicat doar
        la valoarea care depășește pragul inferior al tranșei:
      </p>
      <ul>
        <li><strong>până la 500 lei:</strong> 8% din valoare, dar nu mai puțin de 20 lei;</li>
        <li><strong>501–5.000 lei:</strong> 40 lei + 7% pentru ce depășește 500 lei;</li>
        <li><strong>5.001–25.000 lei:</strong> 355 lei + 5% pentru ce depășește 5.000 lei;</li>
        <li><strong>25.001–50.000 lei:</strong> 1.355 lei + 3% pentru ce depășește 25.000 lei;</li>
        <li><strong>50.001–250.000 lei:</strong> 2.105 lei + 2% pentru ce depășește 50.000 lei;</li>
        <li><strong>peste 250.000 lei:</strong> 6.105 lei + 1% pentru ce depășește 250.000 lei.</li>
      </ul>

      <h2>Taxe fixe frecvente</h2>
      <p>
        Multe cereri <strong>nu se evaluează în bani</strong> și au taxe fixe stabilite de lege,
        independent de valoarea pretențiilor:
      </p>
      <ul>
        <li><strong>divorț prin acord sau din culpă:</strong> 200 lei;</li>
        <li><strong>divorț din motive de sănătate</strong> sau după o separare îndelungată: 50 lei;</li>
        <li><strong>cereri accesorii divorțului</strong> (locuința copilului, autoritatea părintească, numele de familie): 20 lei fiecare;</li>
        <li><strong>ordonanță președințială:</strong> 20 lei (sau 50 lei dacă obiectul este evaluabil în bani și depășește 2.000 lei);</li>
        <li><strong>apel:</strong> 50% din taxa datorată pentru cererea respinsă în fond.</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Valorile fixe sunt orientative și pot varia în funcție de obiectul exact al cererii; verifică
        încadrarea cu instanța sau cu un avocat înainte de plată.
      </p>

      <h2>Greșeli frecvente la stabilirea taxei</h2>
      <ul>
        <li>
          <strong>Aplicarea procentului la întreaga valoare a cererii</strong> — procentul se aplică
          doar la partea care depășește pragul tranșei, nu la suma totală.
        </li>
        <li>
          <strong>Confuzia dintre cereri evaluabile și neevaluabile în bani</strong> — un divorț are taxă
          fixă, chiar dacă în dosar se discută partaj sau pensie de întreținere (acestea se timbrează separat).
        </li>
        <li>
          <strong>Omisiunea cererilor accesorii</strong> — fiecare capăt de cerere (locuința copilului,
          numele de familie etc.) se timbrează distinct cu 20 lei.
        </li>
        <li>
          <strong>Plata insuficientă</strong> — cererea netimbrată corect se anulează dacă diferența nu
          este achitată până la termenul stabilit de instanță.
        </li>
      </ul>
      <p>
        Dacă ai nevoie să verifici antecedentele penale înainte de o reabilitare judecătorească sau pentru
        un dosar, poți comanda online un{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazier judiciar</Link>. Pentru alte estimări utile,
        vezi și calculatorul de{' '}
        <Link href="/calculator/reabilitare/">termen de reabilitare</Link>.
      </p>
    </CalculatorLayout>
  );
}
