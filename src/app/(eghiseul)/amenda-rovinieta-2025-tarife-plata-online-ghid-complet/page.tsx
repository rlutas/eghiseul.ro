import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

// Slug-ul păstrează „2025” intenționat: URL-ul are poziții în Google.
const SLUG = 'amenda-rovinieta-2025-tarife-plata-online-ghid-complet';
const TITLE = 'Amendă Rovinietă 2026: Sume, Plată și Contestație';
const DESCRIPTION =
  'Amenda pentru lipsa rovinietei după 1 octombrie 2026: sumele pe categoriile A–D, ' +
  'plata a jumătate din minim în 15 zile, contestația și ce se aplică la camioane (TollRo).';
const DATE_PUBLISHED = '2025-01-01';
const DATE_MODIFIED = '2026-10-13';

const UTM = 'utm_source=eghiseul.ro&utm_medium=referral&utm_campaign=articol-amenda';
const EROVINIETA_CHECKOUT = `https://erovinieta.net/checkout?${UTM}`;
const EROVINIETA_VERIFICARE = `https://erovinieta.net/verificare-rovinieta?${UTM}`;
const EROVINIETA_PRETURI = `https://erovinieta.net/preturi?${UTM}`;
const EROVINIETA_AMENZI = `https://erovinieta.net/amenzi-rovinieta?${UTM}`;
const EROVINIETA_TOLLRO = `https://erovinieta.net/tollro?${UTM}`;
const LEGEA_226 = 'https://legislatie.just.ro/Public/DetaliiDocument/272230';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE}`,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Auto"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2025"
      updatedLabel="13 octombrie 2026"
      relatedServices={[
        {
          href: '/tools/verificare-rovinieta-online/',
          label: 'Verificare Rovinietă Online',
          desc: 'Verifică valabilitatea rovinietei pe numărul de înmatriculare.',
        },
        {
          href: '/servicii/rovinieta-online/',
          label: 'Rovinietă Online',
          desc: 'Cumperi rovinieta pe categoria și norma Euro corecte.',
        },
        {
          href: '/informatii-cazier-auto-online/',
          label: 'Istoricul sancțiunilor rutiere',
          desc: 'Ce rămâne în evidența Poliției Rutiere și cât timp.',
        },
      ]}
      faqs={[
        {
          q: 'Cât este amenda pentru lipsa rovinietei în 2026?',
          a: 'La autoturisme (categoria A) amenda e între 500 și 1.000 lei, iar dacă plătești în 15 zile de la comunicarea procesului-verbal achiți 250 lei. La categoria B (marfă până la 3,5 t) e 1.140–2.280 lei, la C (10–23 de locuri) 3.800–7.600 lei, iar la D (peste 23 de locuri) 6.650–13.300 lei. Suma exactă e cea trecută pe procesul-verbal.',
        },
        {
          q: 'De când curg cele 15 zile pentru plata a jumătate din amendă?',
          a: 'De la data la care ți s-a comunicat procesul-verbal, nu de la data faptei. Procesele-verbale de rovinietă se fac pe baza imaginilor din camere și vin prin poștă, uneori la câteva săptămâni după ce ai circulat. Contează data de pe confirmarea de primire.',
        },
        {
          q: 'Am circulat cinci zile fără rovinietă. Primesc cinci amenzi?',
          a: 'Nu automat. Legea 226/2023 tratează lipsa rovinietei ca pe o contravenție continuă și spune că, de la data faptei până la comunicarea procesului-verbal, nu se pot încheia alte procese-verbale pentru același vehicul. După ce primești actul, dacă tot circuli fără rovinietă, pot veni procese-verbale noi.',
        },
        {
          q: 'Camioanele peste 3,5 tone mai iau amendă de rovinietă?',
          a: 'Nu. De la 1 octombrie 2026 vehiculele de marfă peste 3,5 tone nu mai cumpără rovinietă, ci plătesc TollRo, pe kilometru. Neplata TollRo se amendează separat: între 10 și 20 de ori suma datorată sau 5.000 lei dacă distanța parcursă nu se poate stabili, conform art. 19 din Legea 226/2023.',
        },
        {
          q: 'Am vândut mașina, dar cumpărătorul nu a transcris-o. Cine plătește?',
          a: 'Ataci procesul-verbal în instanță, în 15 zile, și depui contractul de vânzare-cumpărare. Pe vechea ordonanță, Înalta Curte a stabilit prin Decizia RIL nr. 4/2018 că fostul proprietar nu mai răspunde după vânzare, iar dovada se face cu contractul. CNAIR nu poate anula procesul-verbal pe cale administrativă.',
        },
        {
          q: 'Am cumpărat rovinieta cu o literă greșită la numărul de înmatriculare. Ce fac?',
          a: 'Anunță imediat vânzătorul de la care ai cumpărat-o și cere corectarea sau o rovinietă nouă pe numărul corect. Pentru intervalul în care rovinieta a stat pe alt număr, mașina ta a circulat fără rovinietă valabilă; un proces-verbal deja întocmit pentru acel interval se atacă în instanță.',
        },
        {
          q: 'Unde se depune contestația la amenda de rovinietă?',
          a: 'La judecătoria de pe raza căreia domiciliezi sau îți ai sediul, nu la cea de la locul faptei (art. 20 din Legea 226/2023), în 15 zile de la comunicare. Dacă nu ataci și nu plătești, procesul-verbal ajunge la executare silită: la persoane fizice banii se fac venit la bugetul local al localității de domiciliu.',
        },
        {
          q: 'Cât costă rovinieta în 2026?',
          a: 'De la 1 octombrie 2026 prețul depinde și de norma Euro (Ordinul MTI nr. 888/2026). Pentru un autoturism, tariful CNAIR pe 12 luni este de 228 lei la electric, 254 lei la Euro 6, 292 lei la Euro 4–5 și 330 lei la Euro 0–3. O zi costă între 20 și 29 lei. Dacă norma nu se poate stabili, mașina plătește ca Euro 0.',
        },
      ]}
    >
      <p>
        La autoturisme, amenda pentru lipsa rovinietei e între <strong>500 și 1.000 lei</strong>,
        iar dacă plătești în 15 zile scapi cu 250 lei. Cele 15 zile curg de la{' '}
        <strong>comunicarea procesului-verbal</strong>, nu de la ziua în care ai circulat, și aici
        greșește cei mai mulți.
      </p>
      <p>
        De la 1 octombrie 2026 rovinieta e reglementată de Legea 226/2023, nu de vechea Ordonanță
        15/2002. Au rămas patru categorii (A–D), prețul depinde de norma Euro, iar camioanele peste
        3,5 tone au ieșit din sistem și plătesc TollRo, pe kilometru. Restul s-a schimbat mai puțin
        decât s-ar crede: termenele și contestația funcționează aproape la fel.
      </p>

      <h2>Cât e amenda pe categorii de vehicule</h2>
      <p>
        Suma depinde de categoria vehiculului. Reducerea pentru plata rapidă se calculează din{' '}
        <strong>minimul</strong> prevăzut pentru categoria ta, așa că la autoturisme plătești 250
        lei indiferent ce sumă scrie pe procesul-verbal.
      </p>
      <table>
        <thead>
          <tr>
            <th>Categorie</th>
            <th>Vehicul</th>
            <th>Amendă minimă</th>
            <th>Amendă maximă</th>
            <th>Plătit în 15 zile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A</td>
            <td>Autoturisme (max. 8+1 locuri)</td>
            <td>500 lei</td>
            <td>1.000 lei</td>
            <td>250 lei</td>
          </tr>
          <tr>
            <td>B</td>
            <td>Marfă, până la 3,5 t</td>
            <td>1.140 lei</td>
            <td>2.280 lei</td>
            <td>570 lei</td>
          </tr>
          <tr>
            <td>C</td>
            <td>Transport persoane, 10–23 locuri</td>
            <td>3.800 lei</td>
            <td>7.600 lei</td>
            <td>1.900 lei</td>
          </tr>
          <tr>
            <td>D</td>
            <td>Transport persoane, peste 23 locuri</td>
            <td>6.650 lei</td>
            <td>13.300 lei</td>
            <td>3.325 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Sursa sumelor:{' '}
        <a href={EROVINIETA_AMENZI} rel="noopener">
          erovinieta.net/amenzi-rovinieta
        </a>
        . Legea 226/2023 (art. 18) fixează amenda între dublul și de patru ori prețul rovinietei
        de 12 luni și o actualizează anual cu inflația, așa că sumele se pot schimba de la un an la
        altul. Suma pe care o datorezi e cea scrisă pe procesul-verbal.
      </p>
      <p>
        Cel mai des se greșește între A și B. Dubițele, autoutilitarele și mașinile mixte de până
        la 3,5 tone sunt categoria B, dar mulți le cumpără din obișnuință rovinietă de A. Legea
        spune că rovinieta valabilă trebuie să corespundă categoriei și clasei de emisii a
        vehiculului (art. 6), deci una pe categoria greșită nu te acoperă.
      </p>
      <p>
        Vechile categorii C–H nu mai există. Microbuzele (fostă G) au devenit C, autocarele (fostă H)
        au devenit D, iar camioanele nu mai au deloc rovinietă.
      </p>

      <h2>Camioanele peste 3,5 tone: TollRo, nu rovinietă</h2>
      <p>
        De la 1 octombrie 2026 vehiculele de marfă cu masa maximă autorizată peste 3,5 tone plătesc
        pe kilometru parcurs pe autostrăzi, drumuri expres și drumuri naționale. Tarifele sunt în
        Ordinul MTI nr. 1.925/2025. Plata se face în trei feluri: cu un echipament de bord (OBU),
        pe bază de contract cu un furnizor autorizat, cu un tichet de rută cumpărat înainte de
        plecare sau prin aplicația CNAIR.
      </p>
      <p>
        Amenda e alta decât la rovinietă. Pentru neplata TollRo, art. 19 din Legea 226/2023 prevede
        între 10 și 20 de ori suma datorată, sau 5.000 lei când distanța parcursă nu se poate
        stabili. Aici contravenția nu e continuă, iar dacă plătești suma cerută prin scrisoarea de
        informare în 72 de ore de la primire, nu mai urmează alte sancțiuni. Detalii și un
        calculator pe traseu găsești pe{' '}
        <a href={EROVINIETA_TOLLRO} rel="noopener">
          erovinieta.net/tollro
        </a>
        .
      </p>
      <p>
        Rovinietele cumpărate pentru camioane înainte de 1 octombrie și-au încetat valabilitatea la
        acea dată. Banii pentru perioada rămasă se recuperează doar la cerere scrisă către CNAIR
        (art. 24 alin. (4)); restituirea nu e automată.
      </p>

      <h2>Termenele, în ordinea în care contează</h2>
      <ul>
        <li>
          <em>Patru luni de la faptă.</em> În acest termen trebuie aplicată sancțiunea (art. 18
          alin. (12)). Prima verificare pe care o faci e diferența dintre data în care ai circulat
          și data procesului-verbal.
        </li>
        <li>
          <em>Cel mult două luni pentru comunicare</em>, socotite de la data procesului-verbal
          (art. 18 alin. (11)). Mulți le numără de la data faptei și greșesc.
        </li>
        <li>
          <em>Cincisprezece zile de la comunicare.</em> În ele poți plăti jumătate din minim sau
          poți depune plângere. E un singur termen, care curge din același moment.
        </li>
      </ul>
      <p>
        <strong>Cinci zile fără rovinietă nu înseamnă cinci amenzi.</strong> Circulația fără
        rovinietă e contravenție continuă, iar până la comunicarea procesului-verbal nu se pot
        încheia alte procese-verbale pentru același vehicul. Intervalul ăsta poate dura săptămâni
        bune. Odată ce ai primit actul, protecția se termină și, dacă tot circuli fără rovinietă,
        vine alt proces-verbal.
      </p>

      <h2>Cine răspunde</h2>
      <p>
        Procesul-verbal nu se dă șoferului oprit în trafic. Se întocmește pe numărul de
        înmatriculare, din imaginile camerelor, pe numele celui trecut în certificatul de
        înmatriculare. Legea îl numește „utilizator”: conducătorul sau deținătorul vehiculului.
      </p>
      <p>
        <strong>Mașina vândută, dar netranscrisă.</strong> Când primești amendă pentru o mașină
        vândută acum câteva luni, calea e plângerea în instanță, cu contractul de vânzare-cumpărare
        atașat. Pe vechea ordonanță, Înalta Curte a decis prin RIL nr. 4/2018 că fostul proprietar
        nu mai răspunde după vânzare, iar dovada se face cu contractul. CNAIR nu poate anula
        procesul-verbal administrativ, oricâte acte i-ai trimite.
      </p>
      <p>
        La mașinile în leasing, dacă în certificatul de înmatriculare e trecut și utilizatorul,
        procesul-verbal se emite pe numele lui, nu pe al firmei de leasing.
      </p>
      <p>
        Pentru mașinile înmatriculate în străinătate răspunde conducătorul, iar sancțiunea se aplică
        pe loc, la control (art. 18 alin. (6)).
      </p>

      <h2>Plângerea: unde se depune și ce oprește</h2>
      <p>
        Plângerea se depune în 15 zile de la comunicare, la{' '}
        <strong>judecătoria de pe raza căreia domiciliezi</strong> sau îți ai sediul, nu la cea de
        la locul faptei. E o derogare expresă din art. 20 alin. (2) al Legii 226/2023.
      </p>
      <p>
        Plângerea suspendă executarea până se judecă, fără să trebuiască să plătești întâi. Merită
        depusă când ai contractul de vânzare a mașinii, când procesul-verbal a venit după cele
        patru luni sau când aveai rovinietă valabilă și o poți dovedi.
      </p>
      <p>
        Dacă nici nu ataci, nici nu plătești, procesul-verbal ajunge la executare silită. La
        persoane fizice banii merg la <strong>bugetul local al localității de domiciliu</strong>,
        deci execută primăria. La firme, amenda se face venit la bugetul de stat (art. 20 alin.
        (4)).
      </p>

      <h2>Unde plătești amenda</h2>
      <p>
        Pornește de la procesul-verbal. Pe el scrie instituția și contul în care se plătește.
        Dacă plătești în alt cont, banii pleacă, amenda rămâne neachitată și afli abia la somație.
      </p>
      <p>
        Platforma online a statului este <strong>ghiseul.ro</strong>, cu „g”. Noi suntem
        eGhișeul.ro, un serviciu privat, și nu încasăm amenzi. Escrocii profită de asemănarea
        numelor și trimit SMS-uri cu „amendă neplătită” și linkuri spre domenii aproape identice;
        am descris un astfel de caz în{' '}
        <Link href="/sms-fals-amenda-ghiseul-ro/">articolul despre SMS-ul fals cu amendă</Link>.
        Nicio instituție nu îți cere datele cardului printr-un link din SMS.
      </p>
      <p>
        Mai poți plăti la bancă, la poștă sau la trezorerie. Păstrează dovada plății: dacă
        instituțiile nu reconciliază corect plata, doar ea oprește o executare pornită din greșeală.
      </p>

      <h2>Cum iei amendă deși ai plătit rovinieta</h2>
      <p>
        <strong>Număr de înmatriculare greșit.</strong> O literă greșită și rovinieta e pe altă
        mașină. Verifică emailul de confirmare imediat după plată și, dacă vezi o greșeală, cere
        corectarea de la cine ți-a vândut-o. Un proces-verbal deja întocmit pentru intervalul acela
        nu dispare prin corectare; se atacă în instanță.
      </p>
      <p>
        <strong>Categorie sau normă Euro greșită.</strong> Rovinieta trebuie să corespundă
        categoriei și clasei de emisii a vehiculului. Norma se găsește în cartea de identitate a
        vehiculului (CIV), nu în talon. Dacă nu se poate stabili, se aplică tariful pentru Euro 0.
      </p>
      <p>
        <strong>Valabilitatea pornește de la înregistrare.</strong> Rovinieta e valabilă din
        momentul în care apare în sistemul CNAIR. Între plata cu cardul și înregistrare pot trece
        câteva minute. Dacă verificarea nu o arată imediat, așteaptă și verifică din nou înainte să
        cumperi a doua oară.
      </p>
      <p>
        <strong>Număr de înmatriculare schimbat.</strong> Rovinieta merge mai departe pe numărul nou
        doar dacă VIN-ul (seria de șasiu) a fost trecut corect la cumpărare. Altfel trebuie să ceri
        transferul de la CNAIR.
      </p>

      <h2>Cât costă rovinieta din 1 octombrie 2026</h2>
      <p>
        Tarifele sunt acum în lei, cu TVA, și depind de categorie, perioadă și norma Euro (Ordinul
        MTI nr. 888/2026). Pentru autoturisme, tariful oficial CNAIR arată așa:
      </p>
      <table>
        <thead>
          <tr>
            <th>Perioadă</th>
            <th>Electric</th>
            <th>Euro 6</th>
            <th>Euro 4–5</th>
            <th>Euro 0–3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1 zi</td>
            <td>20 lei</td>
            <td>22 lei</td>
            <td>26 lei</td>
            <td>29 lei</td>
          </tr>
          <tr>
            <td>10 zile</td>
            <td>27 lei</td>
            <td>30 lei</td>
            <td>35 lei</td>
            <td>39 lei</td>
          </tr>
          <tr>
            <td>30 de zile</td>
            <td>43 lei</td>
            <td>48 lei</td>
            <td>55 lei</td>
            <td>62 lei</td>
          </tr>
          <tr>
            <td>60 de zile</td>
            <td>68 lei</td>
            <td>76 lei</td>
            <td>87 lei</td>
            <td>99 lei</td>
          </tr>
          <tr>
            <td>12 luni</td>
            <td>228 lei</td>
            <td>254 lei</td>
            <td>292 lei</td>
            <td>330 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        La categoria B (marfă până la 3,5 t), rovinieta de 12 luni costă între 521 lei (electric)
        și 752 lei (Euro 0–3), iar cea de o zi între 46 și 67 lei. Toate tarifele, inclusiv C și D,
        sunt pe{' '}
        <a href={EROVINIETA_PRETURI} rel="noopener">
          erovinieta.net/preturi
        </a>
        .
      </p>
      <p>
        Nu mai există rovinietă de 7 sau de 90 de zile. Perioadele sunt 1 zi, 10 zile, 30 de zile,
        60 de zile și 12 luni, la toate categoriile. Rovinietele de autoturism cumpărate înainte de
        1 octombrie rămân valabile până expiră.
      </p>
      <p>
        Rovinieta pe un an pentru un autoturism Euro 6 costă 254 lei, cam cât amenda redusă. Una de
        o zi costă cel mult 29 lei. Dacă ai de ales între cele două, alegerea se face singură.
      </p>

      <h2>Verifică rovinieta înainte de drum</h2>
      <p>
        Verificarea e gratuită și durează câteva secunde. Introduci numărul de înmatriculare în{' '}
        <Link href="/tools/verificare-rovinieta-online/">instrumentul de verificare rovinietă</Link>{' '}
        și vezi dacă ai una activă, până când e valabilă și pe ce categorie a fost cumpărată.
        Același lucru îl poți face și pe{' '}
        <a href={EROVINIETA_VERIFICARE} rel="noopener">
          erovinieta.net
        </a>
        .
      </p>
      <p>
        Dacă nu ai rovinietă sau expiră curând,{' '}
        <a href={EROVINIETA_CHECKOUT} rel="noopener">
          o cumperi online de pe erovinieta.net
        </a>{' '}
        în câteva minute, pe categoria și norma Euro ale mașinii. Textul legii îl găsești pe{' '}
        <a href={LEGEA_226} rel="noopener noreferrer" target="_blank">
          portalul legislativ (Legea 226/2023)
        </a>
        .
      </p>
    </ArticleLayout>
  );
}
