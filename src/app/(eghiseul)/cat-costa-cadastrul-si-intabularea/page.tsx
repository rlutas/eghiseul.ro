import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { ChecklistDownload } from '@/components/articole/checklist-download';

const SLUG = 'cat-costa-cadastrul-si-intabularea';
const TITLE =
  'Cât costă cadastrul și intabularea în 2026: tarifele ANCPI, ce a devenit gratuit și ce rămâne de plătit topografului';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Cât costă cadastrul și intabularea în 2026: tarifele ANCPI reale';
const DESCRIPTION =
  'Taxa ANCPI pentru prima înregistrare a dispărut din 7 aprilie 2025 (Ordin 441/2025). Intabularea la ' +
  'cumpărare rămâne 0,15% din valoare, urgența costă de 4 ori tariful, iar onorariul topografului e preț de ' +
  'piață. Termenele pe Ordinul 1622/2025 și ce acoperă cadastrul gratuit prin PNCCF.';
const DATE_PUBLISHED = '2026-07-14';
const DATE_MODIFIED = '2026-09-09';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="14 iulie 2026"
      updatedLabel="9 septembrie 2026"
      imageAlt="Stație totală de topografie pe trepied galben în fața unei case, cu documentația cadastrală și planul de amplasament pe o masă de lemn, măsurători pentru cadastru și intabulare"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Afli dacă imobilul are cadastru, cine e înscris proprietar și ce sarcini are.',
        },
        {
          slug: 'plan-amplasament-delimitare',
          label: 'Plan de amplasament și delimitare (PAD)',
          desc: 'Piesa tehnică fără care un teren nu primește număr cadastral.',
        },
        {
          slug: 'copie-carte-funciara',
          label: 'Copie carte funciară',
          desc: 'Actele vechi din arhiva OCPI, când originalele lipsesc.',
        },
        {
          href: '/calculator/cost-cadastru-intabulare/',
          label: 'Calculator: cost cadastru și intabulare',
          desc: 'Taxa ANCPI pe situația ta și o estimare orientativă a totalului.',
        },
      ]}
      faqs={[
        {
          q: 'Cât costă taxa ANCPI la prima înregistrare a unui imobil?',
          a: 'Zero, din 7 aprilie 2025. Ordinul ANCPI 441/2025 a rescris art. 8 din Ordinul 16/2019 și a scutit de tarif serviciile de primă înregistrare (codurile 2.1.1–2.1.4: recepția cadastrală și înființarea cărții funciare), fără condiții legate de tipul imobilului. Până atunci se plăteau 120 lei pe imobil. Rămâne de plătit onorariul topografului autorizat, care nu este reglementat.',
        },
        {
          q: 'Cât costă intabularea după cumpărare?',
          a: '0,15% din valoarea din act pentru persoane fizice și 0,50% pentru persoane juridice, dar nu mai puțin de 60 lei (Ordin ANCPI 16/2019, codurile 2.3.2 și 2.3.1). Dacă valoarea din act e mai mică decât valoarea de circulație din studiul de piață folosit de notari, procentul se aplică la aceasta. La un apartament de 450.000 lei, cumpărător persoană fizică, taxa este de 675 lei și se plătește de regulă prin notar.',
        },
        {
          q: 'Cât costă urgența la ANCPI?',
          a: 'Un supliment de 4 ori tariful normal, dar cel mult 5.000 lei pe serviciu (Ordin 16/2019 art. 4 alin. (3)). La intabularea de 675 lei din exemplul de mai sus, urgența înseamnă 675 + 2.700 = 3.375 lei și un termen de 2 zile lucrătoare în loc de 7. La prima înregistrare urgența nu are sens: tariful e zero și termenul e de 15 zile lucrătoare în ambele regimuri.',
        },
        {
          q: 'Cât durează cadastrul și intabularea?',
          a: 'Termenele ANCPI, în zile lucrătoare, sunt în Ordinul 1622/2025: recepție cadastrală și înființare carte funciară 15 zile; intabulare 7 zile (2 în urgență); dezlipire sau alipire 7 zile (3 în urgență); înscrierea unei construcții 15 zile (5 în urgență). La acestea se adaugă timpul topografului pentru măsurători și documentație, care depinde de el și de starea actelor.',
        },
        {
          q: 'Cât costă topograful?',
          a: 'Nu există tarif reglementat: onorariul persoanei autorizate ANCPI este preț de piață și se negociază. Depinde de tipul imobilului, suprafață, forma parcelei, starea actelor și distanță. Singurul mod corect de a afla este să ceri două sau trei oferte scrise, cu precizarea a ce includ: măsurători, releveu sau PAD, depunerea la OCPI, redepunerea dacă dosarul e respins.',
        },
        {
          q: 'Este cadastrul obligatoriu? Pot vinde fără intabulare?',
          a: 'Nu există amendă pentru lipsa cadastrului, dar fără carte funciară nu poți vinde notarial: notarul cere extrasul de carte funciară pentru autentificare, care blochează cartea funciară 10 zile lucrătoare pentru tranzacție (Regulament ANCPI 600/2023 art. 207). Fără CF nu poți nici ipoteca imobilul pentru credit, nici dezmembra sau alipi.',
        },
        {
          q: 'Ce acoperă cadastrul gratuit prin PNCCF și ce nu?',
          a: 'Programul național de cadastru și carte funciară (Legea 7/1996 art. 9 alin. (23)) înregistrează gratuit imobilele dintr-o localitate sau dintr-un sector cadastral, sistematic, când ANCPI contractează lucrările acolo. Proprietarul nu plătește nici topograful, nici deschiderea cărții funciare, iar pentru succesiunile nedezbătute certificatele de moștenitor sunt plătite de ANCPI. Nu acoperă intabularea unei cumpărări, dezmembrările, construcțiile noi sau cererea ta individuală făcută în afara programului.',
        },
        {
          q: 'Extrasul de carte funciară e gratuit?',
          a: 'Pentru proprietarul imobilului, da: din 7 aprilie 2025 la ghișeu și din 2 iunie 2025 online, prin sistemul ANCPI (Ordin 441/2025, art. 8 alin. (1) lit. s)). Pentru oricine altcineva rămâne 20 lei online sau 25 lei la ghișeu. Extrasul pentru autentificare, cerut de notar, costă 40 lei.',
        },
      ]}
    >
      <p>
        Răspunsul scurt s-a schimbat în 2025 și puține pagini l-au actualizat. Taxa ANCPI pentru
        prima înregistrare a unui imobil în cartea funciară, cei 120 lei pe care îi știa toată
        lumea, nu se mai plătește din 7 aprilie 2025. Ce rămâne de plătit la cadastru e onorariul
        topografului, care nu e reglementat de nimeni. Iar la intabularea după o cumpărare taxa e
        procentuală, 0,15% din valoare pentru persoane fizice, și nu s-a schimbat. Mai jos sunt
        toate cifrele, cu ordinul și codul de serviciu lângă fiecare, termenele în zile lucrătoare
        și ce acoperă, de fapt, cadastrul gratuit prin programul național.
      </p>

      <h2>Din ce se compune costul</h2>
      <p>
        Două părți, care se confundă des. Prima e tariful ANCPI, stabilit prin Ordinul
        directorului general nr. 16/2019 (Monitorul Oficial 30 din 10 ianuarie 2019), modificat
        de mai multe ori, cel mai important prin Ordinul 441/2025 (Monitorul Oficial 281 din 31
        martie 2025, în vigoare din 7 aprilie 2025) și prin Ordinul 292/2026 (Monitorul Oficial
        164 din 4 martie 2026). Tariful e același în toată țara și se plătește înainte de
        înregistrarea cererii (art. 2).
      </p>
      <p>
        A doua parte e onorariul persoanei autorizate ANCPI, topograful. El măsoară imobilul,
        întocmește documentația cadastrală, la terenuri inclusiv{' '}
        <Link href="/servicii/plan-amplasament-delimitare/">
          planul de amplasament și delimitare (PAD)
        </Link>
        , și o depune la OCPI. Onorariul lui e preț de piață: se negociază, diferă de la un județ
        la altul și de la un dosar la altul, și nu există niciun act normativ care să îl
        plafoneze. Orice pagină care îți spune „cadastrul costă X lei” fără să precizeze că X e o
        ofertă a unui topograf, nu un tarif, te informează greșit.
      </p>
      <p>
        Regula care împarte lumea în două: topograful apare doar când imobilul nu are cadastru
        sau când modifici ceva fizic (dezmembrare, alipire, construcție nouă). Dacă imobilul are
        deja număr cadastral și doar îl cumperi, nu ai nevoie de topograf; plătești doar taxa
        procentuală de intabulare, prin notar. Verifici în ce situație ești dintr-un{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link>: arată
        numărul cadastral, proprietarul înscris și sarcinile.
      </p>

      <h2>Ce a schimbat Ordinul 441/2025</h2>
      <p>
        Până în aprilie 2025, art. 8 din Ordinul 16/2019 scutea de tarif prima înregistrare doar
        pentru terenurile agricole și forestiere dobândite prin titluri de proprietate și pentru
        imobilele statului. Ordinul 441/2025 a rescris litera a) și a lăsat-o fără condiții:
        „serviciile identificate prin codurile 2.1.1, 2.1.2, 2.1.3 și 2.1.4 din anexă”. Adică
        recepția cadastrală și înființarea cărții funciare, recepția cu alocare de număr cadastral
        și înființarea cărții funciare, pentru orice imobil, pentru orice proprietar. Tot atunci a
        dispărut și tariful de urgență de 480, respectiv 240 lei, care exista pentru aceste
        servicii.
      </p>
      <p>
        Același ordin a introdus litera s): extrasul de carte funciară pentru informare (cod
        2.7.2) și extrasul din planul cadastral (cod 2.7.7) sunt gratuite când le cere
        proprietarul imobilului sau primăria în numele lui, la ghișeu din 7 aprilie 2025 și online,
        prin sistemul informatic al ANCPI, din 2 iunie 2025. Pentru un cumpărător care verifică
        imobilul altcuiva, extrasul rămâne 20 lei online sau 25 lei la ghișeu.
      </p>

      <h2>Tarifele ANCPI, pe coduri</h2>
      <p>
        Valorile sunt din anexa la Ordinul 16/2019, așa cum e în vigoare în septembrie 2026.
        Urgența înseamnă un supliment de 4 ori tariful normal, plafonat la 5.000 lei pe serviciu
        (art. 4 alin. (3)), și un termen scurtat conform tabelului de termene de mai jos.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cod</th>
            <th>Serviciu</th>
            <th>Tarif normal</th>
            <th>Cu urgență</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2.1.1</td>
            <td>Recepție cadastrală și înființare carte funciară (prima înregistrare)</td>
            <td>0 lei din 7.04.2025 (înainte 120 lei)</td>
            <td>nu există regim de urgență</td>
          </tr>
          <tr>
            <td>2.1.2 / 2.1.3</td>
            <td>Recepție cu alocare număr cadastral / înființare carte funciară, separat</td>
            <td>0 lei din 7.04.2025 (înainte 60 lei fiecare)</td>
            <td>nu există regim de urgență</td>
          </tr>
          <tr>
            <td>2.3.2</td>
            <td>Intabulare drept de proprietate, persoane fizice</td>
            <td>0,15% din valoare, minimum 60 lei</td>
            <td>5 × taxa, supliment maximum 5.000 lei</td>
          </tr>
          <tr>
            <td>2.3.1</td>
            <td>Intabulare drept de proprietate, persoane juridice</td>
            <td>0,50% din valoare, minimum 60 lei</td>
            <td>5 × taxa, supliment maximum 5.000 lei</td>
          </tr>
          <tr>
            <td>2.3.3</td>
            <td>Înscriere ipotecă</td>
            <td>100 lei pe imobil + 0,1% din creanță</td>
            <td>5 × taxa, supliment maximum 5.000 lei</td>
          </tr>
          <tr>
            <td>2.2.1 + 2.2.2</td>
            <td>Dezlipire sau alipire: recepție și înscriere</td>
            <td>60 lei + 60 lei pe imobil</td>
            <td>300 lei + 300 lei</td>
          </tr>
          <tr>
            <td>2.6.1</td>
            <td>Înscriere construcție</td>
            <td>60 lei pe construcție + 0,05% din valoare</td>
            <td>5 × taxa</td>
          </tr>
          <tr>
            <td>2.6.2</td>
            <td>Extindere sau radiere construcție</td>
            <td>120 lei</td>
            <td>600 lei</td>
          </tr>
          <tr>
            <td>2.6.3</td>
            <td>Actualizare informații tehnice (adresă, categorie de folosință)</td>
            <td>75 lei</td>
            <td>375 lei</td>
          </tr>
          <tr>
            <td>2.7.2</td>
            <td>Extras de carte funciară pentru informare</td>
            <td>20 lei online / 25 lei la ghișeu; gratuit pentru proprietar</td>
            <td>online se livrează imediat</td>
          </tr>
          <tr>
            <td>2.7.3</td>
            <td>Extras de carte funciară pentru autentificare (notar)</td>
            <td>40 lei</td>
            <td>online se livrează imediat</td>
          </tr>
          <tr>
            <td>2.7.4</td>
            <td>Certificat de sarcini</td>
            <td>100 lei</td>
            <td>500 lei</td>
          </tr>
          <tr>
            <td>nou, 2026</td>
            <td>Recepție și înscriere construcție „bun viitor” (Ordin 292/2026)</td>
            <td>60 lei</td>
            <td>300 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Baza de calcul la intabulare e „valoarea din act”, dar cu o notă pe care notarii o
        aplică și cumpărătorii nu o știu: dacă valoarea din act e mai mică decât valoarea de
        circulație din studiul de piață al notarilor, procentul se aplică la valoarea din studiu
        (Nota 8 la anexă). Un apartament vândut la 300.000 lei într-o zonă unde grila spune
        380.000 se taxează la 380.000.
      </p>
      <p>
        Exemplul pe cifre: apartament de 450.000 lei, cumpărător persoană fizică, taxa de
        intabulare 675 lei. În urgență, 675 + 4 × 675 = 3.375 lei, pentru 2 zile lucrătoare în
        loc de 7. La un imobil de 5.000.000 lei taxa e 7.500 lei, iar urgența costă 12.500 lei în
        total, nu 37.500: suplimentul se oprește la plafonul de 5.000.{' '}
        <Link href="/calculator/cost-cadastru-intabulare/">Calculatorul</Link> aplică plafonul
        automat.
      </p>

      <h2>Termenele, în zile lucrătoare</h2>
      <p>
        Termenele de eliberare sunt în anexa la Ordinul 1764/2019, înlocuită prin Ordinul ANCPI
        1622/2025 (Monitorul Oficial 775 din 20 august 2025), și se numără în zile lucrătoare de
        la înregistrarea cererii. Cele care contează pentru un proprietar obișnuit:
      </p>
      <table>
        <thead>
          <tr>
            <th>Serviciu</th>
            <th>Termen normal</th>
            <th>Termen în urgență</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Recepție cadastrală și înființare carte funciară (prima înregistrare)</td>
            <td>15</td>
            <td>15</td>
          </tr>
          <tr>
            <td>Recepție cu alocare număr cadastral</td>
            <td>8</td>
            <td>8</td>
          </tr>
          <tr>
            <td>Dezlipire / alipire (recepție, apoi înscriere)</td>
            <td>7 + 7</td>
            <td>3 + 3</td>
          </tr>
          <tr>
            <td>Intabulare drept de proprietate</td>
            <td>7</td>
            <td>2</td>
          </tr>
          <tr>
            <td>Înscriere construcție / actualizare informații tehnice</td>
            <td>15</td>
            <td>5</td>
          </tr>
          <tr>
            <td>Extras de carte funciară (informare sau autentificare)</td>
            <td>online: imediat; la ghișeu: 2</td>
            <td>la ghișeu: 1</td>
          </tr>
          <tr>
            <td>Certificat de sarcini</td>
            <td>4</td>
            <td>2</td>
          </tr>
          <tr>
            <td>Copie de carte funciară</td>
            <td>2</td>
            <td>1</td>
          </tr>
          <tr>
            <td>Identificarea imobilului după numele proprietarului</td>
            <td>10</td>
            <td>3</td>
          </tr>
        </tbody>
      </table>
      <p>
        Două reguli din Regulamentul 600/2023 îți salvează săptămâni. Dacă dosarul are lipsuri,
        OCPI emite un referat de completare cu termen de 10 zile lucrătoare, iar termenul de
        soluționare se prelungește cu zilele de care ai avut nevoie (art. 33 alin. (13)). Și dacă
        cererea e respinsă, o poți redepune o singură dată, în 30 de zile de la comunicare, fără
        să plătești tariful din nou, cu condiția să conțină documentele a căror lipsă a justificat
        respingerea (alin. (9)). Un topograf bun știe ambele și le pune în contract.
      </p>

      <div className="not-prose my-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm leading-relaxed text-amber-950">
          <strong>Blocajul din vara lui 2026.</strong> Sistemele ANCPI au fost oprite din 13
          iulie 2026, după un atac cibernetic; e-Terra a repornit etapizat din 11 august, întâi
          pentru notari și OCPI, apoi pentru topografi, iar platformele pentru public au revenit
          separat. Termenele de mai sus curg doar când sistemul funcționează, iar cererile din
          perioada blocajului și-au păstrat rangul. Starea la zi, cu tot istoricul, e pe{' '}
          <Link href="/ancpi-nu-functioneaza/">pagina noastră despre ANCPI</Link>.
        </p>
      </div>

      <h2>Onorariul topografului: de ce nu găsești un preț</h2>
      <p>
        Pentru că nu există. Persoanele autorizate ANCPI lucrează pe piață liberă, fără tarif
        minim sau maxim, și același apartament poate primi oferte care diferă de două ori între
        ele. Ce mișcă prețul, în ordinea în care îl mișcă: tipul imobilului (un apartament cere
        un releveu, un teren cere măsurători în teren și PAD), suprafața și forma parcelei,
        starea actelor, distanța până la imobil și cât de încărcat e topograful în perioada
        respectivă.
      </p>
      <p>
        Actele sunt factorul subestimat. Un dosar cu contract recent și schițe clare merge repede.
        Un teren moștenit, cu titlu de proprietate din 1993 și o suprafață care nu bate cu
        măsurătoarea, înseamnă ore de birou, declarații, uneori acorduri de la vecini, și drumuri
        la OCPI, iar asta intră în onorariu. Când originalele lipsesc, actele vechi se recuperează
        din arhiva OCPI printr-o{' '}
        <Link href="/servicii/copie-carte-funciara/">copie de carte funciară</Link>, iar dacă nu
        știi nici numărul de carte funciară,{' '}
        <Link href="/servicii/identificare-imobil/">identificarea imobilului</Link> pornește de la
        adresă sau de la numărul topografic.
      </p>
      <p>
        Cum compari ofertele: cere-le scrise și cu aceleași întrebări. Include măsurătorile și
        deplasarea? Include PAD-ul sau releveul? Include depunerea la OCPI și ridicarea
        încheierii? Include redepunerea dacă dosarul e respins, sau aia se plătește separat? Cine
        plătește dacă OCPI cere completări? Un preț mic fără răspunsuri la ultimele două întrebări
        e rar un preț mic.
      </p>

      <h2>Cadastrul gratuit prin PNCCF: ce acoperă și ce nu</h2>
      <p>
        Legea 7/1996 art. 9 alin. (23) a instituit Programul național de cadastru și carte
        funciară, „în scopul înregistrării gratuite a imobilelor în sistemul integrat de cadastru
        și carte funciară”, la nivelul tuturor unităților administrativ-teritoriale. Programul a
        fost aprobat prin HG 294/2015 pentru perioada 2015–2023, iar HG 836/2022 (Monitorul
        Oficial 670 din 5 iulie 2022) i-a scos anul de final din titlu: continuă până la
        înregistrarea tuturor imobilelor, fără termen.
      </p>
      <p>
        Cifrele ANCPI din 7 iulie 2026: peste 10,8 milioane de imobile înregistrate prin
        înregistrare sistematică de la începutul programului, peste 750.000 doar în primul
        semestru al anului, lucrări finalizate pe întreg teritoriul în 492 de localități și în
        38.567 de sectoare cadastrale, pe 8,8 milioane de hectare, și lucrări în curs în 2.601
        localități. Deci în majoritatea comunelor din țară se lucrează sau s-a lucrat; în orașele
        mari, unde imobilele erau deja în mare parte înregistrate sporadic, mai puțin.
      </p>
      <h3>Ce primești gratuit</h3>
      <p>
        Când ANCPI contractează lucrări în localitatea sau sectorul tău cadastral, măsurătorile,
        documentația, planul cadastral și deschiderea cărții funciare se fac fără niciun cost
        pentru proprietar, inclusiv pentru construcții. Pentru succesiunile nedezbătute, notarii
        eliberează certificatele de moștenitor la sesizarea OCPI sau a primăriei, iar onorariile
        le plătește ANCPI (art. 9 alin. (25) și următoarele). Tu participi: la identificarea
        limitelor în teren, cu actele pe care le ai, și la verificarea documentelor tehnice în
        perioada de afișare publică, când se pot depune contestații, în termen de 60 de zile (art.
        14). Cine nu verifică afișarea descoperă după ani că vecinul e înscris cu doi metri din
        curtea lui.
      </p>
      <h3>Ce nu acoperă</h3>
      <p>
        Programul înregistrează situația existentă, sistematic, pe sectoare. Nu acoperă cererea ta
        individuală făcută înainte ca lucrările să ajungă la tine; pentru aceea, tariful ANCPI e
        oricum zero din 2025, dar topograful se plătește. Nu acoperă intabularea unei cumpărări
        (0,15% rămâne), dezmembrarea unui teren pentru vânzare, înscrierea unei construcții
        ridicate după finalizarea lucrărilor sau actualizările ulterioare. Și nu are termen pe
        care să te poți baza: faptul că localitatea ta e „în lucru” nu spune în ce an ajunge
        sectorul tău la afișare. Dacă ai o vânzare sau un credit în față, aștepți pe riscul tău.
      </p>

      <h2>Actele necesare, pe scenarii</h2>
      <p>
        Listele de mai jos sunt cele uzuale; topograful îți spune exact ce cere OCPI-ul din județul
        tău, pentru că există diferențe de practică.
      </p>
      <p>Apartament, primă înregistrare:</p>
      <ul>
        <li>actul de proprietate (contract de vânzare, certificat de moștenitor, donație);</li>
        <li>actul de identitate al proprietarului;</li>
        <li>certificatul fiscal de la primărie, cu mențiunea că se eliberează pentru cadastru;</li>
        <li>releveul apartamentului, întocmit de topograf;</li>
        <li>documentația condominiului sau acordul asociației, acolo unde OCPI le cere.</li>
      </ul>
      <p>Casă cu teren:</p>
      <ul>
        <li>actul de proprietate pentru teren și, dacă e separat, pentru construcție;</li>
        <li>autorizația de construire și procesul-verbal de recepție, pentru casele cu autorizație;</li>
        <li>certificatul fiscal cu valoarea de impunere a construcției;</li>
        <li>PAD-ul cu limitele măsurate în teren, întocmit de topograf;</li>
        <li>actul de identitate al proprietarului.</li>
      </ul>
      <p>Teren fără construcții:</p>
      <ul>
        <li>titlul de proprietate, contractul sau certificatul de moștenitor;</li>
        <li>certificatul fiscal de la primăria pe raza căreia e terenul;</li>
        <li>PAD cu inventarul de coordonate;</li>
        <li>la extravilan, extrasul din registrul agricol, unde e cazul.</li>
      </ul>
      <div id="checklist" />
      <ChecklistDownload
        file="/downloads/checklist-cadastru-intabulare.pdf"
        title="Checklist PDF: actele pentru cadastru și intabulare"
        description="Actele pe scenarii (apartament, casă cu teren, teren) și pașii în ordine, pe o pagină de printat și bifat. Gratuit, pe email."
        source="checklist-cadastru"
      />

      <h2>Pașii, în ordinea corectă</h2>
      <ol>
        <li>
          Scoate un <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link>{' '}
          sau, dacă nu știi datele imobilului, cere o{' '}
          <Link href="/servicii/identificare-imobil/">identificare de imobil</Link>. Afli dacă există
          cadastru, cine e înscris și ce sarcini sunt.
        </li>
        <li>Strânge actele de proprietate; recuperează din arhiva OCPI ce lipsește.</li>
        <li>Ia certificatul fiscal de la primărie ultimul, nu primul: are valabilitate scurtă.</li>
        <li>Contractează topograful, cu ofertă scrisă care spune ce include.</li>
        <li>Topograful depune dosarul la OCPI; la prima înregistrare nu mai e nicio taxă ANCPI.</li>
        <li>OCPI recepționează, alocă numărul cadastral și deschide cartea funciară, în 15 zile lucrătoare.</li>
        <li>
          La cumpărare, notarul cere extrasul de autentificare (40 lei, blochează cartea 10 zile
          lucrătoare), depune cererea de intabulare și încasează taxa de 0,15% odată cu restul.
        </li>
        <li>Primești încheierea de intabulare și extrasul cu numele tău la proprietari, de regulă în 7 zile lucrătoare.</li>
      </ol>

      <h2>Greșelile care costă</h2>
      <p>
        Calculul pe acte vechi. Suprafața din titlul de proprietate din anii &#39;90 rar coincide
        cu măsurătoarea reală. Dacă diferența depășește toleranțele, dosarul se complică cu
        declarații, acorduri de la vecini, uneori rectificări, și topograful îți cere bani în plus
        pe bună dreptate. Bugetează asta din start.
      </p>
      <p>
        Lipsa unui extras recent. Oamenii pornesc lucrarea convinși că imobilul „n-are nimic” și
        descoperă la OCPI o ipotecă veche neradiată sau un proprietar decedat înscris în CF.
        Extrasul e gratuit pentru proprietar și vine imediat online; o lucrare blocată costă
        săptămâni. La tranzacții, un{' '}
        <Link href="/servicii/certificat-sarcini/">certificat de sarcini</Link> arată și istoricul
        din registrele vechi de transcripțiuni.
      </p>
      <p>
        PAD lipsă sau nerecepționat. La terenuri, fără plan de amplasament și delimitare
        recepționat de OCPI nu există număr cadastral. Dacă ai cumpărat cândva un teren „cu acte”,
        dar fără PAD, prima înregistrare pleacă de la zero, cu măsurători noi.
      </p>
      <p>
        Și plata urgenței acolo unde nu există. La prima înregistrare termenul e 15 zile lucrătoare
        în ambele regimuri, deci nu e nimic de grăbit cu bani. Urgența are sens la intabulare (7
        zile devin 2) și la dezmembrare (7 devin 3), când ai un termen de la bancă sau de la notar.
      </p>

      <h2>Ai intabulat. Ce urmează</h2>
      <p>
        Dacă planul e să construiești pe terenul proaspăt intabulat, următoarele numere care te
        interesează sunt POT-ul și CUT-ul parcelei, din certificatul de urbanism.{' '}
        <Link href="/calculator/cat-pot-construi/">Calculatorul „Cât pot construi”</Link> îți dă
        amprenta maximă a casei pe cifrele tale. Iar construcția, odată recepționată, se înscrie
        în cartea funciară cu 60 lei plus 0,05% din valoare, în 15 zile lucrătoare: același drum,
        mult mai scurt.
      </p>
    </ArticleLayout>
  );
}
