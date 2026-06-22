import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { ConcediuOdihnaCalculator } from '@/components/calculators/concediu-odihna-calculator';

const SLUG = 'zile-concediu-odihna';
const TITLE = 'Calculator Zile Concediu de Odihnă — Proporțional';
const DESCRIPTION =
  "Calculează zilele de concediu de odihnă cuvenite proporțional cu lunile lucrate (minim legal 20 de zile lucrătoare).";

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
      heading="Calculator Zile Concediu de Odihnă"
      description="Află câte zile de concediu de odihnă ți se cuvin proporțional cu perioada lucrată în anul curent."
      widget={<ConcediuOdihnaCalculator />}
      faqs={[
        { q: 'Câte zile de concediu de odihnă am pe an?', a: 'Minimul legal este de 20 de zile lucrătoare pe an (Codul Muncii, art. 145). Prin contract sau contract colectiv pot fi acordate mai multe (frecvent 21-25).' },
        { q: 'Cum se calculează concediul proporțional?', a: 'Dacă nu ai lucrat tot anul, zilele se acordă proporțional cu lunile lucrate: zile pe an × luni lucrate / 12.' },
        { q: 'Ce se întâmplă cu zilele neefectuate?', a: 'La încetarea contractului, zilele de concediu neefectuate se compensează în bani (indemnizație de concediu).' },
        { q: 'Pot reporta zilele de concediu în anul următor?', a: 'Da. Dacă din motive justificate nu ai efectuat concediul în anul de referință, angajatorul are obligația de a-l acorda într-o perioadă de 18 luni începând cu anul următor (Codul Muncii, art. 146 alin. 4). Înlocuirea concediului cu bani în timpul derulării contractului este interzisă, cu excepția compensării la încetare.' },
        { q: 'Sărbătorile legale și weekendul se scad din zilele de concediu?', a: 'Nu. Concediul de odihnă se exprimă în zile lucrătoare, deci zilele de repaus săptămânal (de regulă sâmbătă și duminică) și sărbătorile legale nu se includ în cele 20 de zile și nu se consumă din ele.' },
        { q: 'Câte zile de concediu am dacă m-am angajat la jumătatea anului?', a: 'Pentru anul angajării concediul se acordă proporțional cu perioada lucrată. La 20 de zile pe an și 6 luni lucrate rezultă 20 × 6 / 12 = 10 zile lucrătoare.' },
      ]}
    >
      <h2>Cum se calculează zilele de concediu de odihnă</h2>
      <p>
        Concediul de odihnă se acordă proporțional cu timpul lucrat:{' '}
        <strong>zile cuvenite = zile pe an × luni lucrate / 12</strong>. Numărul de zile pe an pornește
        de la minimul legal de <strong>20 de zile lucrătoare</strong> (Codul Muncii, art. 145), dar
        poate fi mai mare prin contract.
      </p>
      <p className="text-sm text-neutral-500">
        Estimare orientativă. Concediile suplimentare (pentru condiții deosebite, tineri sub 18 ani
        etc.) și regulile din contractul colectiv pot modifica rezultatul.
      </p>

      <h2>Exemplu de calcul pas cu pas</h2>
      <p>
        Să presupunem un angajat cu un contract care prevede <strong>21 de zile lucrătoare</strong> de
        concediu pe an, care a fost angajat pe <strong>1 mai</strong> și pleacă din firmă pe
        <strong> 31 octombrie</strong> în același an. A lucrat efectiv <strong>6 luni</strong> (mai, iunie,
        iulie, august, septembrie, octombrie).
      </p>
      <ul>
        <li><strong>Pasul 1 — zile pe an:</strong> 21 de zile lucrătoare (conform contractului).</li>
        <li><strong>Pasul 2 — luni lucrate:</strong> 6 din 12.</li>
        <li><strong>Pasul 3 — proporția:</strong> 21 × 6 / 12 = <strong>10,5 zile</strong>.</li>
        <li><strong>Pasul 4 — rotunjire:</strong> rezultatul se rotunjește în favoarea salariatului, deci
        <strong> 11 zile lucrătoare</strong> cuvenite.</li>
      </ul>
      <p>
        Dacă angajatul nu a efectuat niciuna dintre aceste zile, la încetarea contractului cele 11 zile
        se compensează în bani, prin indemnizația de concediu calculată la media zilnică a veniturilor
        din ultimele 3 luni.
      </p>

      <h2>Tabel orientativ: zile cuvenite proporțional</h2>
      <p>
        Tabelul de mai jos arată câte zile de concediu se cuvin în funcție de lunile lucrate, la cele
        două praguri uzuale (minimul legal de 20 de zile și valoarea frecventă de 25 de zile prin
        contract). Valorile fracționare se rotunjesc, de regulă, în favoarea salariatului.
      </p>
      <ul>
        <li><strong>3 luni:</strong> 5 zile (la 20/an) · 6,25 ≈ 7 zile (la 25/an)</li>
        <li><strong>6 luni:</strong> 10 zile (la 20/an) · 12,5 ≈ 13 zile (la 25/an)</li>
        <li><strong>9 luni:</strong> 15 zile (la 20/an) · 18,75 ≈ 19 zile (la 25/an)</li>
        <li><strong>12 luni:</strong> 20 zile (la 20/an) · 25 zile (la 25/an)</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Estimare orientativă. Modul exact de rotunjire și eventualele zile suplimentare se stabilesc prin
        regulamentul intern sau contractul colectiv de muncă.
      </p>

      <h2>Situații speciale și greșeli frecvente</h2>
      <ul>
        <li>
          <strong>Concediu suplimentar:</strong> salariații care lucrează în condiții deosebite, vătămătoare
          sau periculoase, nevăzătorii și tinerii sub 18 ani au dreptul la cel puțin 3 zile lucrătoare în
          plus față de minimul legal (Codul Muncii, art. 147).
        </li>
        <li>
          <strong>Concediul medical nu reduce dreptul:</strong> perioadele de incapacitate temporară de
          muncă, concediul de maternitate sau cel pentru creșterea copilului sunt considerate perioade de
          activitate la stabilirea dreptului la concediu de odihnă.
        </li>
        <li>
          <strong>Greșeală frecventă — scăderea sărbătorilor:</strong> zilele de concediu se numără doar în
          zile lucrătoare, deci sărbătorile legale care cad în interval nu se consumă din concediu.
        </li>
        <li>
          <strong>Greșeală frecventă — compensarea în timpul contractului:</strong> concediul nu poate fi
          înlocuit cu bani cât timp contractul este activ; compensarea în bani este permisă doar la
          încetarea raportului de muncă.
        </li>
      </ul>
      <p>
        Dacă pregătești un dosar pentru un nou loc de muncă, ai putea avea nevoie și de un{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazier judiciar online</Link>, iar pentru a-ți
        verifica anii de activitate poți folosi{' '}
        <Link href="/calculator/vechime-in-munca/">calculatorul de vechime în muncă</Link>.
      </p>
    </CalculatorLayout>
  );
}
