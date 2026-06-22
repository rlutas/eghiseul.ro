import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { TaxeNotarialeCalculator } from '@/components/calculators/taxe-notariale-calculator';

const SLUG = 'taxe-notariale';
const TITLE = 'Calculator Taxe Notariale 2026 — Vânzare, Donație, Succesiune';
const DESCRIPTION =
  'Calculează taxele notariale 2026: onorariu notarial, intabulare, impozit la stat și extras de carte funciară, pentru vânzare, donație, succesiune sau partaj.';

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
      heading="Calculator Taxe Notariale 2026"
      description="Estimează onorariul notarial, intabularea, impozitul la stat și extrasul de carte funciară pentru vânzare, donație, succesiune sau partaj, conform grilelor în vigoare în 2026."
      widget={<TaxeNotarialeCalculator />}
      faqs={[
        {
          q: 'Cum se calculează onorariul notarial în 2026?',
          a: 'Onorariul notarial pentru vânzare și donație se calculează progresiv, pe tranșe de valoare, conform Ordinului Ministerului Justiției 177/C/2024 (de exemplu 2,2% până la 20.000 lei, apoi procente descrescătoare pentru sumele care depășesc fiecare prag). Onorariile sunt minime — notarul poate percepe mai mult. La onorariu se adaugă TVA 21%.',
        },
        {
          q: 'Cine plătește taxele notariale la vânzarea unui imobil?',
          a: 'De regulă cumpărătorul plătește onorariul notarial și intabularea (înscrierea în cartea funciară), iar vânzătorul plătește impozitul pe transfer către stat și extrasul de carte funciară. Părțile pot conveni altfel (frecvent toate taxele cad în sarcina cumpărătorului).',
        },
        {
          q: 'Cât este impozitul pe vânzarea unui imobil în 2026?',
          a: 'Conform Codului Fiscal (art. 111), impozitul este 3% dacă imobilul a fost deținut sub 3 ani și 1% dacă a fost deținut peste 3 ani, aplicat la valoarea din contract (fără deducerea de 450.000 lei, eliminată). Impozitul este reținut și virat de notar.',
        },
        {
          q: 'Cât costă intabularea în cartea funciară?',
          a: 'Tariful ANCPI de înscriere în cartea funciară este 0,15% din valoare pentru persoane fizice și 0,5% pentru persoane juridice.',
        },
        {
          q: 'Se plătește impozit pe donație sau pe moștenire?',
          a: 'Donația este scutită de impozit între rude și afini până la gradul III inclusiv și între soți; în rest se aplică 1% sau 3% (după vechime). Moștenirea este scutită dacă succesiunea este dezbătută în 2 ani de la deces; dacă se depășesc 2 ani, se plătește 1% din valoarea masei succesorale.',
        },
        {
          q: 'Sunt aceste sume exacte?',
          a: 'Sunt estimări orientative bazate pe grilele oficiale 2026 (OMJ 177/C/2024, Cod Fiscal art. 111, tarife ANCPI). Onorariile sunt minime și pot varia de la un notar la altul, iar valoarea de impozitare nu poate fi sub valoarea de grilă a Camerei Notarilor. Pentru o cifră exactă, cere o ofertă la biroul notarial.',
        },
      ]}
    >
      <h2>Ce taxe plătești la notar</h2>
      <p>
        La un transfer imobiliar apar mai multe costuri: <strong>onorariul notarial</strong> (cu TVA 21%),{' '}
        <strong>intabularea</strong> în cartea funciară (tarif ANCPI), <strong>impozitul</strong> către stat (acolo
        unde se aplică) și <strong>extrasul de carte funciară</strong>. Calculatorul le estimează pe toate, separat pe
        cumpărător și vânzător.
      </p>

      <h2>Onorariul notarial (grila OMJ 177/C/2024)</h2>
      <p>
        Onorariile minime sunt stabilite prin Ordinul Ministerului Justiției 177/C/2024 și se calculează progresiv, pe
        tranșe de valoare. Pentru vânzare și donație, grila pornește de la 2,2% (minim 230 lei) și scade procentual pe
        măsură ce valoarea crește. Succesiunea are o grilă separată (Anexa 3), iar partajul are un onorariu minim pe
        loturi. Atenție: vechea grilă (OMJ 46/C/2011) a fost abrogată — multe calculatoare online folosesc încă cifre
        depășite.
      </p>

      <h2>Grila de onorarii notariale 2026 (vânzare și donație)</h2>
      <p>
        Onorariul minim se calculează progresiv pe tranșe de valoare. Sumele de mai jos sunt{' '}
        <strong>fără TVA</strong> — la total se adaugă TVA 21%.
      </p>
      <table>
        <thead>
          <tr>
            <th>Valoarea tranzacției</th>
            <th>Onorariu minim (fără TVA)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>până la 20.000 lei</td>
            <td>2,2% (minim 230 lei)</td>
          </tr>
          <tr>
            <td>20.001 – 35.000 lei</td>
            <td>440 lei + 1,9% pentru ce depășește 20.000</td>
          </tr>
          <tr>
            <td>35.001 – 65.000 lei</td>
            <td>725 lei + 1,6% pentru ce depășește 35.000</td>
          </tr>
          <tr>
            <td>65.001 – 100.000 lei</td>
            <td>1.205 lei + 1,5% pentru ce depășește 65.000</td>
          </tr>
          <tr>
            <td>100.001 – 200.000 lei</td>
            <td>1.705 lei + 1,1% pentru ce depășește 100.000</td>
          </tr>
          <tr>
            <td>200.001 – 600.000 lei</td>
            <td>2.805 lei + 0,9% pentru ce depășește 200.000</td>
          </tr>
          <tr>
            <td>peste 600.000 lei</td>
            <td>6.405 lei + 0,6% pentru ce depășește 600.000</td>
          </tr>
        </tbody>
      </table>
      <p>
        Succesiunea are o grilă separată (mai mică): 2,7% până la 20.000 lei (minim 240 lei/dosar), apoi 540 lei + 1,9%,
        725 lei + 1,6% și, peste 65.000 lei, 1.205 lei + 0,85%. Partajul are un onorariu minim de 450 lei plus 115 lei
        pentru fiecare lot format.

      </p>

      <h2>Exemplu: vânzare apartament de 350.000 lei</h2>
      <ul>
        <li>
          <strong>Onorariu notarial:</strong> 2.805 + 0,9% × (350.000 − 200.000) = 4.155 lei, plus TVA 21% ≈{' '}
          <strong>5.028 lei</strong>.
        </li>
        <li>
          <strong>Intabulare (0,15% PF):</strong> 525 lei.
        </li>
        <li>
          <strong>Impozit la stat (1%, peste 3 ani):</strong> 3.500 lei (plătit de vânzător).
        </li>
        <li>
          <strong>Extras de carte funciară (autentificare):</strong> ~40 lei.
        </li>
      </ul>

      <h2>Impozitul pe transfer (Cod Fiscal art. 111)</h2>
      <p>
        Impozitul este <strong>3% dacă imobilul a fost deținut sub 3 ani</strong> și <strong>1% peste 3 ani</strong>,
        aplicat la valoarea din contract (dar nu sub valoarea de grilă a Camerei Notarilor). Deducerea de 450.000 lei a
        fost eliminată — impozitul se aplică de la primul leu. Notarul îl calculează, reține și virează.
      </p>

      <h2>Greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Grilă veche.</strong> Cifrele din OMJ 46/C/2011 (praguri de 15.000/300.000 lei) nu mai sunt valabile.
        </li>
        <li>
          <strong>Uiți TVA-ul.</strong> Onorariul din grilă este net; clientul plătește +21% TVA.
        </li>
        <li>
          <strong>Confuzia preț–valoare de grilă.</strong> Impozitul și onorariul se calculează la maximul dintre prețul
          declarat și valoarea de grilă notarială.
        </li>
      </ul>

      <p>
        Pentru actul de vânzare ai nevoie și de un{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link> actualizat. Vezi și{' '}
        <Link href="/calculator/taxa-judiciara-de-timbru/">calculatorul de taxă judiciară de timbru</Link> sau{' '}
        <Link href="/calculator/tva/">calculatorul de TVA</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Rezultat orientativ. Onorariile notariale sunt minime și pot varia de la un notar la altul; sumele finale se
        stabilesc la biroul notarial, iar cursul BNR se actualizează zilnic.
      </p>
    </CalculatorLayout>
  );
}
