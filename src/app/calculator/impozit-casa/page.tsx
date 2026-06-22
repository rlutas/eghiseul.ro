import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ImpozitCladiriCalculator } from '@/components/calculators/impozit-cladiri-calculator';

const SLUG = 'impozit-casa';
const TITLE = 'Calculator Impozit pe Casă (Clădiri) 2026';
const DESCRIPTION =
  'Calculează impozitul pe casă/clădiri în 2026 după suprafață, tip construcție, zonă și vechime, conform valorilor indexate din Codul Fiscal.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Impozit pe Casă')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Impozit pe Casă 2026"
      description="Estimează impozitul anual pe clădirea rezidențială pe baza suprafeței, tipului de construcție, zonei și vechimii, conform valorilor 2026."
      widget={<ImpozitCladiriCalculator />}
      faqs={[
        {
          q: 'Cum se calculează impozitul pe casă în 2026?',
          a: 'Se calculează o valoare impozabilă = suprafața construită × valoarea pe m² (din Codul Fiscal, indexată în 2026) × coeficientul de corecție (după zonă și rangul localității) × ajustarea pentru vechime. Impozitul este cota locală (0,08–0,2% pentru locuințe) aplicată acestei valori.',
        },
        {
          q: 'Ce reduceri se aplică pentru clădirile vechi?',
          a: 'Din 2026 (OUG 9/2026): clădirile cu vechime între 50 și 100 de ani au o reducere de 15% a valorii impozabile, iar cele peste 100 de ani o reducere de 25%. Sub 50 de ani nu se aplică reducere.',
        },
        {
          q: 'De ce a crescut impozitul pe casă în 2026?',
          a: 'Valorile pe metru pătrat din Codul Fiscal au fost indexate cu aproximativ 79,6% pentru 2026, ceea ce a dus la creșterea valorii impozabile și implicit a impozitului.',
        },
        {
          q: 'Cât este cota de impozitare?',
          a: 'Pentru clădirile rezidențiale ale persoanelor fizice cota este între 0,08% și 0,2%, stabilită de fiecare consiliu local (frecvent 0,1%). Pentru clădirile nerezidențiale cota este 0,2–1,3%.',
        },
        {
          q: 'Cum aflu coeficientul de corecție al casei mele?',
          a: 'Coeficientul de corecție (între 0,90 și 2,60) depinde de zona din localitate (A, B, C, D) și de rangul localității (0, I, II, III, IV, V), stabilite prin hotărâre a consiliului local. Îl găsești în hotărârea anuală de taxe și impozite a primăriei sau direct la Direcția de Taxe (DITL), care îți poate confirma zona în care se află imobilul.',
        },
        {
          q: 'Se cumulează reducerea pentru vechime cu indexarea din 2026?',
          a: 'Da. Valoarea pe m² indexată (+79,6%) se folosește la calculul valorii impozabile, iar reducerea pentru vechime (15% la 50–100 de ani, 25% peste 100 de ani) se aplică după aceea, asupra valorii deja calculate. Cele două se combină, deci o casă veche tot are de plătit mai mult în 2026 decât în 2025, dar mai puțin decât o casă nouă identică.',
        },
        {
          q: 'Plătesc impozit dacă am mai multe locuințe?',
          a: 'Da, fiecare clădire se impozitează separat, după aceeași formulă (suprafață × valoare/m² × coeficient de corecție × ajustare vechime, înmulțit cu cota locală de 0,08–0,2%). Unele primării aplică majorări pentru deținătorii de mai multe imobile; verifică hotărârea consiliului local și situația ta la Direcția de Taxe.',
        },
      ]}
    >
      <h2>Cum se calculează impozitul pe clădiri</h2>
      <p>
        Pentru 2026 se folosește metoda valorii impozabile pe metru pătrat (Cod Fiscal art. 457), cu valorile indexate.
        Formula este: <strong>suprafață × valoare/m² × coeficient de corecție × ajustare vechime</strong>, iar impozitul
        este cota locală aplicată valorii impozabile.
      </p>

      <h2>Ce influențează impozitul</h2>
      <ul>
        <li><strong>Tipul construcției</strong> și dacă are instalații (apă, canalizare, electricitate, încălzire);</li>
        <li><strong>Zona și rangul localității</strong> (coeficient între 0,90 și 2,60);</li>
        <li><strong>Vechimea</strong> (reduceri de 15% sau 25% pentru clădiri vechi);</li>
        <li><strong>Cota locală</strong> (0,08–0,2% pentru locuințe).</li>
      </ul>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem un apartament cu instalații complete, suprafață construită de <strong>80 m²</strong>, situat în
        zona B a unei localități de rang I, într-o clădire cu vechime de 60 de ani. Calculul se face astfel:
      </p>
      <ul>
        <li><strong>Pasul 1 – valoarea de bază:</strong> 80 m² × valoarea/m² indexată (Cod Fiscal art. 457, +79,6% în 2026);</li>
        <li><strong>Pasul 2 – corecția de zonă/rang:</strong> rezultatul se înmulțește cu coeficientul de corecție (între 0,90 și 2,60, după zonă și rangul localității);</li>
        <li><strong>Pasul 3 – ajustarea pentru vechime:</strong> pentru 60 de ani (intervalul 50–100 de ani) se aplică o reducere de 15% a valorii impozabile;</li>
        <li><strong>Pasul 4 – impozitul anual:</strong> valoarea impozabilă obținută se înmulțește cu cota locală (0,08–0,2%, frecvent 0,1%).</li>
      </ul>
      <p>
        Schimbând doar zona sau rangul (coeficient de la 0,90 până la 2,60) impozitul variază de aproape trei ori pentru
        aceeași casă, motiv pentru care zona contează adesea mai mult decât suprafața.
      </p>

      <h2>Greșeli frecvente la calculul impozitului</h2>
      <ul>
        <li><strong>Folosirea suprafeței utile în loc de cea construită</strong> – impozitul se raportează la suprafața construită desfășurată, nu la cea din actul de proprietate sau cea utilă;</li>
        <li><strong>Ignorarea instalațiilor</strong> – lipsa apei, canalizării, electricității sau încălzirii schimbă valoarea/m² folosită;</li>
        <li><strong>Aplicarea greșită a reducerii de vechime</strong> – reducerea de 15% este doar pentru 50–100 de ani, iar cea de 25% doar pentru clădiri de peste 100 de ani; sub 50 de ani nu există reducere;</li>
        <li><strong>Presupunerea unei cote fixe</strong> – cota rezidențială (0,08–0,2%) și coeficientul de corecție (0,90–2,60) diferă de la o primărie la alta.</li>
      </ul>

      <h2>Cazuri speciale</h2>
      <p>
        Pentru clădirile <strong>nerezidențiale</strong> (spații comerciale, birouri) cota este de 0,2–1,3%, mult peste
        cea rezidențială, iar valoarea impozabilă se determină de regulă pe baza unui raport de evaluare. La clădirile cu
        <strong> destinație mixtă</strong> (locuință plus spațiu folosit pentru activitate economică) impozitul se împarte
        proporțional pe cele două destinații. Reducerile pentru vechime (15% la 50–100 de ani, 25% peste 100 de ani) și
        indexarea valorilor/m² (+79,6%) rămân aplicabile părții rezidențiale, după aceeași logică ca la o locuință obișnuită.
      </p>

      <p>
        Vezi și <Link href="/calculator/calculator-impozit-auto/">calculatorul de impozit auto</Link>,{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link> sau, dacă vrei să verifici situația
        juridică a imobilului, serviciul de <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Orientativ. Cota exactă, zona și majorările locale se stabilesc prin hotărâre a consiliului local; valoarea
        obligatorie este la Direcția de Taxe (DITL) a primăriei tale.
      </p>
    </CalculatorLayout>
  );
}
