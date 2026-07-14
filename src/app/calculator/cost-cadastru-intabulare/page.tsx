import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { CadastruCostCalculator } from '@/components/calculators/cadastru-cost-calculator';

const SLUG = 'cost-cadastru-intabulare';
const TITLE = 'Cât Costă Cadastrul și Intabularea? Calculator 2026';
const DESCRIPTION =
  'Calculează pe loc cât te costă cadastrul și intabularea: taxa ANCPI exactă (120 lei la prima înregistrare, 0,15% din preț la cumpărare) + onorariul topografului, pe tip de imobil. Gratuit.';

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
      heading="Cât costă cadastrul și intabularea?"
      description="Alege tipul imobilului și situația ta — primă înregistrare sau intabulare după cumpărare — și afli pe loc taxa ANCPI exactă, intervalul de onorariu al topografului și totalul estimat, în regim normal sau de urgență."
      tldr="La prima înregistrare în cartea funciară plătești taxa ANCPI fixă de 120 lei/imobil plus onorariul topografului autorizat: 700–1.100 lei la apartament, 1.400–2.500 lei la casă cu teren. Dacă imobilul are deja cadastru și doar îl intabulezi după cumpărare, taxa ANCPI e 0,15% din preț pentru persoane fizice (0,50% pentru firme), minim 60 lei — fără topograf."
      widget={<CadastruCostCalculator />}
      faqs={[
        {
          q: 'Cât costă cadastrul pentru un apartament?',
          a: 'Taxa ANCPI e fixă: 120 lei (recepție + înființare carte funciară, cod 2.1.1 din Ordinul ANCPI 16/2019). La ea se adaugă onorariul topografului autorizat, de regulă 700–1.100 lei pentru un apartament. Total orientativ: 820–1.220 lei.',
        },
        {
          q: 'Cât costă cadastrul și intabularea pentru o casă cu teren?',
          a: 'Aceeași taxă ANCPI de 120 lei, dar onorariul topografului e mai mare — 1.400–2.500 lei, pentru că se măsoară și terenul, se întocmește planul de amplasament și delimitare (PAD) și documentația e mai complexă. Total orientativ: 1.520–2.620 lei.',
        },
        {
          q: 'Cât costă intabularea după cumpărarea unui imobil?',
          a: 'Dacă imobilul are deja cadastru, plătești doar taxa ANCPI de intabulare: 0,15% din prețul din contract pentru persoane fizice, 0,50% pentru persoane juridice, minim 60 lei/imobil. La un apartament de 450.000 lei cumpărat de o persoană fizică, taxa e 675 lei. Nu mai e nevoie de topograf.',
        },
        {
          q: 'Cine plătește taxa de intabulare la vânzare-cumpărare?',
          a: 'Cumpărătorul. De regulă o plătește prin notar, la semnarea contractului — notarul depune cererea de intabulare la OCPI și virează taxa către ANCPI odată cu ea. Apare distinct pe devizul notarial, lângă onorariu și impozit.',
        },
        {
          q: 'Cât costă regimul de urgență la ANCPI?',
          a: 'Suplimentul de urgență e de 4 ori tariful normal (deci plătești în total 5× taxa), dar suplimentul e plafonat la 5.000 lei. Prima înregistrare urgentă costă 600 lei (120 + 480). O intabulare de 7.500 lei în regim de urgență costă 12.500 lei, nu 37.500 — plafonul limitează suplimentul. Termenul scade la 1/3 din cel normal.',
        },
        {
          q: 'De ce onorariile topografilor diferă atât de mult?',
          a: 'Pentru că sunt pe piață liberă — ANCPI nu le reglementează. Contează județul (în București și Cluj sunt mai scumpe decât în județe mici), suprafața și forma terenului, starea actelor (acte vechi, succesiuni nelămurite scumpesc lucrarea), distanța de deplasare și termenul cerut.',
        },
        {
          q: 'Ce documente îmi trebuie pentru cadastru și intabulare?',
          a: 'Actul de proprietate (contract, certificat de moștenitor, titlu de proprietate), actul de identitate, certificatul fiscal de la primărie (pentru intabulare) și, la prima înregistrare, documentația cadastrală întocmită de topograful autorizat. Dacă actele vechi lipsesc, copiile se pot obține din arhiva OCPI.',
        },
        {
          q: 'Cât durează cadastrul și intabularea?',
          a: 'Măsurătorile și documentația topografului: 1–3 săptămâni, în funcție de complexitate. Soluționarea la OCPI: în jur de 18 zile lucrătoare la prima înregistrare în regim normal, 6 zile la urgență. Intabularea simplă (după cumpărare) se soluționează de regulă în câteva zile lucrătoare.',
        },
        {
          q: 'E obligatoriu să fac cadastrul?',
          a: 'Nu există o amendă pentru lipsa cadastrului, dar fără el nu poți vinde notarial, nu poți ipoteca imobilul pentru un credit și nu poți dezmembra sau alipi terenuri. Practic, orice tranzacție serioasă cere imobilul înscris în cartea funciară.',
        },
        {
          q: 'Taxa ANCPI diferă de la un județ la altul?',
          a: 'Nu. Tarifele ANCPI sunt naționale, stabilite prin Ordinul 16/2019 — 120 lei e 120 lei și la Satu Mare, și la București. Ce diferă pe județe e doar onorariul topografului, care e negociat liber.',
        },
      ]}
    >
      <h2>Din ce se compune costul cadastrului și intabulării</h2>
      <p>
        Două componente, cu naturi complet diferite. Prima e <strong>taxa ANCPI</strong> — reglementată
        prin Ordinul ANCPI 16/2019, identică în toată țara: 120 lei fix la prima înregistrare a unui
        imobil, respectiv un procent din preț (0,15% pentru persoane fizice, 0,50% pentru firme) la
        intabularea dreptului de proprietate după o cumpărare.
      </p>
      <p>
        A doua e <strong>onorariul topografului autorizat</strong> — piață liberă, nereglementat. El
        măsoară imobilul, întocmește{' '}
        <Link href="/servicii/plan-amplasament-delimitare/">planul de amplasament și delimitare (PAD)</Link>{' '}
        și documentația cadastrală pe care OCPI o recepționează. Aici apar diferențele mari dintre
        oferte: același apartament poate costa 700 lei într-un județ și 1.100 în altul.
      </p>
      <p>
        Important: onorariul topografului apare doar la prima înregistrare (sau la modificări —
        dezmembrare, alipire, actualizare). Dacă imobilul are deja număr cadastral și cumperi, plătești
        doar taxa procentuală de intabulare — de regulă prin notar. Verifici în ce situație ești dintr-un{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link>, eliberat
        automat, în câteva minute.
      </p>

      <h2>Care sunt taxele oficiale ANCPI pe operațiuni</h2>
      <p>
        Tarifele de mai jos sunt cele din anexa Ordinului ANCPI 16/2019, valabile național. Coloana de
        urgență include suplimentul de 4× tariful normal:
      </p>
      <table>
        <thead>
          <tr>
            <th>Cod</th>
            <th>Operațiune</th>
            <th>Tarif normal</th>
            <th>Urgență</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2.1.1</td>
            <td>Recepție + înființare carte funciară (primă înregistrare)</td>
            <td>120 lei/imobil</td>
            <td>600 lei</td>
          </tr>
          <tr>
            <td>2.1.2</td>
            <td>Recepție documentație cadastrală</td>
            <td>60 lei/imobil</td>
            <td>300 lei</td>
          </tr>
          <tr>
            <td>2.3.2</td>
            <td>Intabulare drept de proprietate — persoane fizice</td>
            <td>0,15% din valoare, min. 60 lei</td>
            <td>5× taxa, supliment max. 5.000 lei</td>
          </tr>
          <tr>
            <td>2.3.1</td>
            <td>Intabulare drept de proprietate — persoane juridice</td>
            <td>0,50% din valoare, min. 60 lei</td>
            <td>5× taxa, supliment max. 5.000 lei</td>
          </tr>
          <tr>
            <td>2.6.3</td>
            <td>Actualizare informații tehnice (ex. adresă imobil)</td>
            <td>75 lei</td>
            <td>375 lei</td>
          </tr>
          <tr>
            <td>2.7.2</td>
            <td>Extras de carte funciară pentru informare</td>
            <td>20 lei (online) / 25 lei (ghișeu)</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>

      <h2>Cum funcționează taxa de urgență</h2>
      <p>
        Regula e simplă: suplimentul de urgență e <strong>de 4 ori tariful normal</strong>, deci în
        total plătești de 5 ori taxa. La prima înregistrare: 120 + 480 = 600 lei. În schimb, termenul
        de soluționare scade la <strong>1/3 din termenul normal</strong> — din 18 zile lucrătoare ajungi
        la 6.
      </p>
      <p>
        La taxele procentuale există o plasă de siguranță: <strong>suplimentul e plafonat la 5.000
        lei</strong>. Concret, la o intabulare de persoană fizică pentru un imobil de 5.000.000 lei,
        taxa normală e 7.500 lei; suplimentul de urgență ar fi 30.000 lei, dar plafonul îl taie la
        5.000 — plătești 12.500 lei în total, nu 37.500. Calculatorul de mai sus aplică plafonul
        automat.
      </p>

      <h2>De ce variază onorariul topografului</h2>
      <p>
        Spre deosebire de taxa ANCPI, onorariul nu e fixat de nimeni. Patru factori mișcă prețul:
      </p>
      <ul>
        <li>
          <strong>Județul și orașul.</strong> În marile centre (București, Cluj, Timișoara) onorariile
          sunt vizibil mai mari decât în județe mici — cerere mare, costuri mai mari.
        </li>
        <li>
          <strong>Suprafața și tipul imobilului.</strong> Un apartament se măsoară într-o oră; o casă
          cu teren de formă neregulată sau un teren extravilan de câteva hectare înseamnă muncă de teren
          serioasă plus PAD.
        </li>
        <li>
          <strong>Starea actelor.</strong> Acte vechi, suprafețe care nu bat cu realitatea, vecini
          neintabulați — fiecare complicație adaugă ore de lucru. Dacă actele originale lipsesc, copiile
          se recuperează din arhiva OCPI printr-o{' '}
          <Link href="/servicii/copie-carte-funciara/">copie de carte funciară</Link>.
        </li>
        <li>
          <strong>Deplasarea și termenul.</strong> Imobil la 80 km de sediul topografului sau lucrare
          „pe ieri” — ambele se plătesc.
        </li>
      </ul>
      <p>
        Intervalele din calculator (700–1.100 lei apartament, 1.400–2.500 lei casă cu teren) sunt medii
        de piață pentru 2026 — cere întotdeauna oferta exactă, cu tot ce include, înainte de a semna.
      </p>

      <h2>Care sunt pașii, în ordine</h2>
      <ol>
        <li>
          Verifică situația cadastrală a imobilului —{' '}
          <Link href="/servicii/extras-de-carte-funciara/">extrasul CF</Link> îți spune dacă există
          număr cadastral și cine e proprietarul înscris.
        </li>
        <li>
          Dacă imobilul nu are cadastru: contractezi un topograf autorizat, el măsoară și întocmește
          documentația (inclusiv PAD-ul), o depune la OCPI cu taxa de 120 lei.
        </li>
        <li>OCPI recepționează documentația, alocă număr cadastral și înființează cartea funciară.</li>
        <li>
          La cumpărare: notarul autentifică contractul, depune cererea de intabulare și încasează taxa
          de 0,15% (sau 0,50% la firme) odată cu restul costurilor — pe care le poți estima cu{' '}
          <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
        </li>
        <li>Primești încheierea de intabulare și noul extras CF cu numele tău la proprietari.</li>
      </ol>
      <p>
        Tot procesul, cu actele necesare pe fiecare scenariu (apartament, casă, teren) și greșelile care
        te costă bani, l-am detaliat în ghidul{' '}
        <Link href="/cat-costa-cadastrul-si-intabularea/">
          Cât costă cadastrul și intabularea în 2026
        </Link>
        .
      </p>

      <h2>Ce faci după intabulare</h2>
      <p>
        Dacă ai intabulat un teren și urmează construcția, primul pas e{' '}
        <Link href="/servicii/certificat-urbanism-informare/">
          certificatul de urbanism pentru informare
        </Link>{' '}
        — afli POT, CUT și restricțiile parcelei. Apoi{' '}
        <Link href="/calculator/cat-pot-construi/">calculatorul „Cât pot construi”</Link> îți dă pe loc
        amprenta maximă a viitoarei case.
      </p>
    </CalculatorLayout>
  );
}
