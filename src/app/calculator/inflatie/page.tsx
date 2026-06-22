import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { InflatieCalculator } from '@/components/calculators/inflatie-calculator';

const SLUG = 'inflatie';
const TITLE = 'Calculator Inflație — Puterea de Cumpărare a Banilor';
const DESCRIPTION =
  'Calculează cum a afectat inflația valoarea banilor între doi ani, pe baza ratei medii anuale a inflației (IPC) publicate de INS. Vezi puterea de cumpărare.';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/calculator/${SLUG}/`,
  ogImage: `/api/og/calculator?title=${encodeURIComponent('Calculator Inflație')}`,
});

export default function Page() {
  return (
    <CalculatorLayout
      slug={SLUG}
      title={TITLE}
      heading="Calculator Inflație"
      description="Află cât valorează azi o sumă de bani din trecut și cât a fost inflația cumulată între doi ani, pe baza datelor INS."
      widget={<InflatieCalculator />}
      faqs={[
        {
          q: 'Cum se calculează efectul inflației?',
          a: 'Se înmulțesc ratele anuale ale inflației pentru fiecare an din interval. De exemplu, dacă inflația a fost 5% și apoi 10%, o sumă de 100 lei ajunge să valoreze 100 × 1,05 × 1,10 = 115,5 lei în termeni de putere de cumpărare.',
        },
        {
          q: 'Ce rată a inflației folosește calculatorul?',
          a: 'Folosește rata medie anuală a inflației (indicele prețurilor de consum, IPC) publicată de Institutul Național de Statistică (INS), pentru anii 2000–2025.',
        },
        {
          q: 'De ce în unii ani inflația este negativă?',
          a: 'În 2015 și 2016 România a avut deflație (prețurile au scăzut, în parte din cauza reducerii TVA), deci rata anuală a fost negativă. Calculatorul ține cont de aceste valori.',
        },
        {
          q: 'Care este diferența dintre rata anuală a inflației și factorul cumulat?',
          a: 'Rata anuală arată cât au crescut prețurile într-un singur an. Factorul cumulat este produsul tuturor ratelor anuale (1 + rata/100) din intervalul ales și arată efectul total pe mai mulți ani. Inflația se compune: un factor cumulat de 1,5 înseamnă că ai nevoie de 150 lei azi pentru a cumpăra ce cumpărai cu 100 lei la începutul intervalului.',
        },
        {
          q: 'Inflația din calculator este aceeași cu cea resimțită de mine?',
          a: 'Nu neapărat. Calculatorul folosește rata medie anuală IPC publicată de INS, care măsoară un coș național standard de bunuri și servicii. Inflația resimțită pe coșul tău personal poate fi mai mare sau mai mică, în funcție de cât cheltui pe energie, alimente, chirie sau combustibil față de media națională.',
        },
        {
          q: 'Pot folosi acest calculator pentru a actualiza o sumă dintr-un contract sau o pensie?',
          a: 'Calculatorul oferă o estimare orientativă a puterii de cumpărare pe baza IPC INS și poate fi util pentru a înțelege evoluția unei sume în timp. Pentru indexări oficiale (pensii, chirii, despăgubiri) se folosesc indici și formule stabilite prin lege sau contract, care pot diferi de media folosită aici.',
        },
      ]}
    >
      <h2>Ce arată calculatorul de inflație</h2>
      <p>
        Inflația erodează puterea de cumpărare a banilor: aceeași sumă cumpără mai puțin pe măsură ce trec anii.
        Calculatorul îți arată cât ar trebui să ai azi ca să cumperi ce cumpărai cu o anumită sumă într-un an din trecut,
        pe baza ratelor oficiale INS.
      </p>

      <h2>Cum se calculează</h2>
      <p>
        Se aplică, an de an, rata medie anuală a inflației. Factorul cumulat este produsul tuturor ratelor din interval.
        De exemplu, 1.000 lei din 2015 valorează semnificativ mai mult azi din cauza inflației ridicate din 2022–2023.
      </p>

      <h2>Exemplu numeric pas cu pas</h2>
      <p>
        Să presupunem că ai economisit <strong>2.000 lei în 2018</strong> și vrei să știi câți lei îți trebuie azi
        pentru aceeași putere de cumpărare. Pentru fiecare an din interval se aplică rata medie anuală IPC publicată
        de INS, iar factorul cumulat este produsul acestor rate:
      </p>
      <ul>
        <li>Pas 1 — pornești de la suma inițială: <strong>2.000 lei</strong>.</li>
        <li>Pas 2 — înmulțești succesiv cu (1 + rata/100) pentru fiecare an, din 2018 până în anul țintă.</li>
        <li>Pas 3 — rezultatul este suma echivalentă azi; diferența reprezintă puterea de cumpărare pierdută.</li>
      </ul>
      <p>
        Anii cu inflație ridicată (de exemplu 2022 și 2023) cresc puternic factorul cumulat, în timp ce anii de deflație
        din 2015 și 2016 îl reduc ușor. Tocmai pentru că inflația se compune, efectul pe mai mulți ani este mult mai mare
        decât simpla adunare a ratelor anuale.
      </p>

      <h2>Greșeli frecvente când calculezi inflația</h2>
      <ul>
        <li>
          <strong>Aduni ratele în loc să le înmulțești.</strong> Inflația se compune an de an, deci factorul corect este
          produsul (1 + rata/100), nu suma procentelor.
        </li>
        <li>
          <strong>Ignori anii de deflație.</strong> În 2015 și 2016 prețurile au scăzut, iar rata anuală a fost negativă;
          a sări peste acești ani denaturează rezultatul.
        </li>
        <li>
          <strong>Confunzi inflația medie anuală cu inflația de la sfârșit de an.</strong> Calculatorul folosește rata
          medie anuală IPC INS, care poate diferi de valoarea raportată în luna decembrie.
        </li>
        <li>
          <strong>Aștepți precizie la nivel de leu.</strong> Rezultatul este o estimare orientativă a puterii de
          cumpărare pe un coș național, nu o valoare contabilă exactă.
        </li>
      </ul>

      <h2>Context: de ce scade puterea de cumpărare</h2>
      <p>
        Puterea de cumpărare a banilor scade în timp pentru că, în majoritatea anilor, prețurile cresc. Cu o rată medie
        anuală IPC pozitivă pentru cea mai mare parte a intervalului 2000–2025, aceeași sumă cumpără tot mai puține bunuri
        și servicii pe măsură ce trec anii. De aceea o sumă păstrată „la saltea” pierde valoare reală: chiar dacă numărul
        de lei rămâne neschimbat, ce poți cumpăra cu ei se micșorează. Calculatorul transformă această erodare într-o
        cifră concretă, ușor de comparat între doi ani.
      </p>

      <p>
        Vezi și <Link href="/curs-valutar/">cursul valutar BNR</Link>,{' '}
        <Link href="/calculator/salariu/">calculatorul de salariu</Link> sau{' '}
        <Link href="/calculator/rambursare-anticipata/">calculatorul de rambursare anticipată</Link>.
      </p>

      <p className="text-sm text-neutral-500">
        Estimare orientativă, pe baza ratei medii anuale a inflației (IPC) INS. Inflația resimțită pe coșul personal
        poate diferi de media națională.
      </p>
    </CalculatorLayout>
  );
}
