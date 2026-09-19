import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'amenda-rovinieta-2025-tarife-plata-online-ghid-complet';
const TITLE = 'Amendă Rovinietă 2026: Tarife, Plată Online și Contestație';
const DESCRIPTION =
  'Cuantumul amenzii de rovinietă pe categorii, de când curg cele 15 zile pentru jumătate din minim, ' +
  'cine răspunde când mașina e vândută sau în leasing și ce se schimbă de la 1 octombrie 2026.';
const DATE_PUBLISHED = '2025-01-01';
const DATE_MODIFIED = '2026-09-09';

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
      updatedLabel="9 septembrie 2026"
      relatedServices={[
        {
          href: '/tools/verificare-rovinieta-online/',
          label: 'Verificare Rovinietă Online',
          desc: 'Verifică valabilitatea rovinietei pe numărul de înmatriculare.',
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
          a: 'Pentru autoturisme (categoria A), amenda este cuprinsă între 500 și 1.000 lei. Pentru celelalte categorii de vehicule cuantumul crește în funcție de masa totală maximă autorizată și numărul de locuri, ajungând până la 14.250–28.500 lei pentru vehiculele de minimum 12 tone cu cel puțin 4 axe.',
        },
        {
          q: 'De când curg cele 15 zile pentru plata a jumătate din amendă?',
          a: 'De la data înmânării sau a comunicării procesului-verbal, nu de la data faptei. Este diferența care costă cel mai des bani: procesele-verbale de rovinietă se emit pe baza imaginilor din camere și ajung prin poștă, uneori la săptămâni după ziua în care ai circulat. Data care contează e cea de pe confirmarea de primire.',
        },
        {
          q: 'Am circulat cinci zile fără rovinietă. Primesc cinci amenzi?',
          a: 'Nu automat. Ordonanța 15/2002 prevede că, până la comunicarea procesului-verbal deja întocmit, nu se pot încheia alte procese-verbale pentru același vehicul. Protecția acoperă intervalul dintre faptă și comunicare; după ce primești actul, ciclul se reia, iar procesele-verbale ulterioare, cu alte date de săvârșire, se plătesc separat.',
        },
        {
          q: 'Am vândut mașina, dar cumpărătorul nu a transcris-o. Cine plătește?',
          a: 'Nu tu, dar dovada se face în instanță. Înalta Curte de Casație și Justiție a stabilit prin Decizia RIL nr. 4/2018 că, la transmiterea dreptului de proprietate, fostul proprietar pierde calitatea de utilizator și de subiect activ al contravenției, iar dovada transmiterii se face potrivit dreptului comun, deci cu contractul de vânzare-cumpărare. CNAIR nu poate anula procesul-verbal pe cale administrativă; doar o instanță poate.',
        },
        {
          q: 'Mașina e în leasing. Pe cine se emite procesul-verbal?',
          a: 'Pe utilizator. CNAIR precizează că, atunci când în certificatul de înmatriculare este înscris și utilizatorul pe lângă deținător, procesul-verbal se emite pe numele utilizatorului.',
        },
        {
          q: 'Am cumpărat rovinieta cu o literă greșită la numărul de înmatriculare. Ce fac?',
          a: 'Corectează imediat. Normele permit îndreptarea erorii la același punct de lucru sau terminal în 60 de minute de la emitere, iar distribuitorii online aplică același termen prin condițiile lor de vânzare. Atenție însă: corecția nu anulează un proces-verbal deja întocmit pentru intervalul în care rovinieta era pe alt număr — acela se atacă tot în instanță.',
        },
        {
          q: 'Am plătit rovinieta chiar în ziua în care m-au prins camerele. Mai iau amendă?',
          a: 'Potrivit poziției publice a CNAIR, șoferul care își cumpără rovinieta în aceeași zi în care a fost înregistrat de camere nu este sancționat. Este o practică a administratorului drumului, nu un text din ordonanță, deci păstrează dovada plății cu data pe ea.',
        },
        {
          q: 'Care este termenul de contestație pentru amenda de rovinietă?',
          a: 'Cincisprezece zile de la înmânare sau comunicare. La rovinietă plângerea se depune la judecătoria pe raza căreia domiciliezi sau îți ai sediul, nu la cea de la locul faptei, iar depunerea ei suspendă automat executarea. Dacă nu ataci și nu plătești, procesul-verbal se trimite din oficiu spre executare silită în 30 de zile de la expirarea termenului de plângere; la persoane fizice execută organul fiscal al primăriei de domiciliu, fiindcă amenda se face venit la bugetul local.',
        },
        {
          q: 'Cât costă rovinieta în 2026?',
          a: 'Pentru autoturisme: 3,5€ o zi, 6€ zece zile, 9,5€ treizeci de zile, 15€ șaizeci de zile și 50€ pentru douăsprezece luni. Plata se face în lei, dar nu la cursul zilei: conversia se face lunar, după cursul BNR din penultima zi lucrătoare a lunii anterioare, și rămâne fixă toată luna. În septembrie 2026 asta înseamnă aproximativ 18 lei pentru o zi și 262 de lei pentru un an. Nu există rovinietă de 7 zile la autoturisme.',
        },
      ]}
    >
      <p>
        Pentru autoturisme fără rovinietă valabilă, amenda e între <strong>500 și 1.000 lei</strong>,
        iar plata în 15 zile o taie la jumătate din minim, adică 250 lei. Partea pe care o ratează
        aproape toată lumea nu e cuantumul, ci de unde încep să curgă cele 15 zile: de la{' '}
        <strong>comunicarea procesului-verbal</strong>, nu de la ziua în care ai circulat.
      </p>
      <p>
        Mai jos: tabelul pe categorii, cine răspunde când mașina e vândută sau în leasing, ce se
        schimbă de la 1 octombrie 2026 și greșelile care produc amendă chiar și când ai plătit
        rovinieta.
      </p>

      <h2>Cuantumul amenzii pe categorii de vehicule</h2>
      <p>
        Cuantumul depinde de categoria vehiculului, stabilită după masa totală maximă autorizată și
        numărul de locuri. Ultima coloană e cea care contează în practică: reducerea nu e „jumătate
        din amendă”, ci jumătate din <strong>minimul</strong> ei. Nu poți plăti niciodată jumătate
        din maxim, oricât de repede ai fi.
      </p>
      <table>
        <thead>
          <tr>
            <th>Categorie</th>
            <th>Tip vehicul</th>
            <th>Amendă minimă</th>
            <th>Amendă maximă</th>
            <th>Plătit în 15 zile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A</td>
            <td>Autoturisme</td>
            <td>500 lei</td>
            <td>1.000 lei</td>
            <td>250 lei</td>
          </tr>
          <tr>
            <td>B</td>
            <td>Vehicule ≤3,5t</td>
            <td>1.140 lei</td>
            <td>2.280 lei</td>
            <td>570 lei</td>
          </tr>
          <tr>
            <td>C</td>
            <td>Vehicule 3,5–7,5t</td>
            <td>3.800 lei</td>
            <td>7.600 lei</td>
            <td>1.900 lei</td>
          </tr>
          <tr>
            <td>D</td>
            <td>Vehicule 7,5–12t</td>
            <td>6.650 lei</td>
            <td>13.300 lei</td>
            <td>3.325 lei</td>
          </tr>
          <tr>
            <td>E</td>
            <td>Vehicule ≥12t (max. 3 axe)</td>
            <td>8.550 lei</td>
            <td>17.100 lei</td>
            <td>4.275 lei</td>
          </tr>
          <tr>
            <td>F</td>
            <td>Vehicule ≥12t (min. 4 axe)</td>
            <td>14.250 lei</td>
            <td>28.500 lei</td>
            <td>7.125 lei</td>
          </tr>
          <tr>
            <td>G</td>
            <td>Microbuze (9–23 locuri)</td>
            <td>3.800 lei</td>
            <td>7.600 lei</td>
            <td>1.900 lei</td>
          </tr>
          <tr>
            <td>H</td>
            <td>Autobuze (peste 23 locuri)</td>
            <td>6.650 lei</td>
            <td>13.300 lei</td>
            <td>3.325 lei</td>
          </tr>
        </tbody>
      </table>
      <p>
        Saltul de la categoria A la B e cel care surprinde. Aceeași masă de 3,5 tone, dar dacă
        vehiculul e înregistrat ca transport de marfă, minimul urcă de la 500 la 1.140 de lei.
        Autoutilitarele mici, dubițele și mașinile de firmă cad des în a doua categorie, iar
        proprietarii lor cumpără din obișnuință rovinietă de categoria A. La control, o rovinietă
        pe categoria greșită se tratează ca inexistentă.
      </p>
      <p>
        Cuantumurile astea sunt în vigoare din 8 septembrie 2025. La autoturisme e o creștere de
        peste 80% față de vechiul interval de 275–550 de lei, iar la celelalte categorii de circa
        20%. Dacă găsești pe internet o pagină care mai scrie 275 de lei, e dinainte de modificare.
      </p>

      <h2>Nu confunda amenda cu tariful de despăgubire</h2>
      <p>
        Prima întrebare pe care o pun oamenii care au mai avut de-a face cu subiectul acum zece ani
        e dacă, pe lângă amendă, mai vine și tariful de despăgubire. Răspunsul e nu, și e nu de mult
        timp.
      </p>
      <p>
        Până în 2012 exista un al doilea instrument, separat de amendă: un tarif de despăgubire
        datorat administratorului drumului, care mergea de la câteva zeci la peste o mie de euro, în
        funcție de categoria vehiculului. Cele două se cumulau, iar suma totală putea fi
        devastatoare pentru un transportator. Legea 144/2012 a abrogat dispozițiile care îl
        instituiau, împreună cu anexa în care erau trecute valorile, cu efect din 27 iulie 2012.
        Aceeași lege a prevăzut că tarifele deja aplicate și contestate în instanță până la acea dată
        se anulează.
      </p>
      <p>
        Astăzi rămâne o singură sancțiune pecuniară pentru lipsa rovinietei: amenda din tabelul de
        mai sus. Tabelele oficiale ale CNAIR nu mai conțin nicio coloană de despăgubire.
      </p>
      <p>
        O altă confuzie, de data asta actuală: <strong>peajul nu e rovinietă</strong>. Trecerea
        podurilor peste Dunăre se tarifează separat, iar amenda pentru lipsa peajului e și ea
        separată, între 190 și 380 de lei la autoturisme. Poți avea rovinietă valabilă și să iei
        amendă de peaj, sau invers.
      </p>

      <h2>Cine plătește, de fapt</h2>
      <p>
        Amenda de rovinietă nu se dă șoferului oprit în trafic, ci pe numărul de înmatriculare, pe
        baza imaginilor din camere. De aici vine cea mai frecventă nedreptate aparentă: primești
        acasă un proces-verbal pentru o mașină pe care ai vândut-o acum opt luni.
      </p>
      <p>
        <strong>Mașina vândută, dar netranscrisă.</strong> Înalta Curte de Casație și Justiție a
        rezolvat problema printr-o decizie obligatorie pentru toate instanțele, RIL nr. 4/2018: la
        transmiterea dreptului de proprietate, fostul proprietar pierde calitatea de utilizator și
        de subiect activ al contravenției, iar dovada transmiterii se face potrivit dreptului comun.
        Adică e suficient contractul de vânzare-cumpărare, chiar dacă noul proprietar nu a făcut
        transcrierea. Vestea proastă e că nu există cale administrativă: CNAIR nu poate anula
        procesul-verbal, oricâte acte i-ai trimite. Se atacă în instanță, în cele 15 zile, cu
        contractul atașat.
      </p>
      <p>
        <strong>Leasing.</strong> Când în certificatul de înmatriculare apare și utilizatorul, nu
        doar deținătorul, procesul-verbal se emite pe numele utilizatorului. Deci pe firma sau
        persoana care conduce mașina, nu pe societatea de leasing.
      </p>
      <p>
        <strong>Mașini înmatriculate în străinătate.</strong> Aici răspunde conducătorul, nu
        proprietarul, iar sancțiunea se aplică pe loc, în trafic, fiindcă nu există adresă în țară
        la care să fie trimis actul.
      </p>

      <h2>Termenele, în ordinea în care contează</h2>
      <p>
        Sunt patru termene distincte și niciunul nu curge de acolo de unde crede lumea.
      </p>
      <ul>
        <li>
          <em>Patru luni de la faptă</em> pentru ca sancțiunea să poată fi aplicată. E o prescripție
          specială a rovinietei, mai scurtă decât regula generală. Peste ea, procesul-verbal nu mai
          poate fi întocmit valabil, deci prima verificare pe care o faci e distanța dintre data
          circulației și data actului.
        </li>
        <li>
          <em>Două luni pentru comunicare</em>, socotite de la data aplicării sancțiunii, adică de
          la data procesului-verbal, nu de la data faptei. Confuzia asta e răspândită. Iar
          consecința nerespectării termenului nu e anularea actului, ci prescripția executării lui,
          care se invocă inclusiv în fața instanței sesizate cu plângerea.
        </li>
        <li>
          <em>Cincisprezece zile de la înmânare sau comunicare</em>, în care poți plăti jumătate din
          minimul amenzii și în care poți depune plângere. Sunt aceleași 15 zile, curgând din același
          moment, nu două termene separate.
        </li>
        <li>
          <em>Treizeci de zile</em> de la expirarea termenului de plângere, după care actul se
          trimite din oficiu spre executare silită.
        </li>
      </ul>
      <p>
        O precizare care contează dacă ajungi în instanță: Înalta Curte a stabilit, prin Decizia
        43/2016, că „data constatării contravenției” înseamnă data la care s-a întocmit
        procesul-verbal, nu ziua în care camera a înregistrat mașina. Cele două pot fi la săptămâni
        distanță.
      </p>
      <p>
        <strong>Grijă la cifra „48 de ore”</strong>, care mai apare și azi în textul ordonanței
        publicat pe portalul legislativ, fără notă de abrogare. E depășită: Legea 203/2018 a abrogat
        toate dispozițiile care fixau pentru plata pe jumătate un termen mai scurt decât cele 15 zile
        din regula generală. Dacă cineva îți spune că ai avut doar două zile, se uită la un text mort.
      </p>
      <p>
        <strong>Cinci zile de circulație nu înseamnă cinci amenzi.</strong> Circulația fără rovinietă
        e calificată drept contravenție continuă, iar ordonanța prevede expres că în intervalul de la
        data săvârșirii faptei până la comunicarea procesului-verbal nu se pot încheia alte
        procese-verbale pentru același vehicul. Fereastra asta poate ține până la două luni. După ce
        primești actul, ciclul se reia, iar procesele-verbale ulterioare, cu alte date de săvârșire,
        se plătesc fiecare în parte.
      </p>

      <h2>Plângerea: unde se depune și ce oprește</h2>
      <p>
        Plângerea contravențională se depune în 15 zile de la înmânare sau comunicare, iar la
        rovinietă există o regulă specială de competență: se introduce la{' '}
        <strong>judecătoria pe raza căreia domiciliezi</strong> sau îți ai sediul, nu la cea de la
        locul faptei. Norma generală permite, din 2022, și alegerea locului contravenției, dar la
        rovinietă se aplică derogarea, așa că varianta sigură rămâne judecătoria de domiciliu.
      </p>
      <p>
        Lucrul pe care merită să-l știi înainte de a decide dacă ataci sau plătești:{' '}
        <strong>plângerea suspendă executarea</strong>, automat și fără condiții. Nu trebuie să ceri
        separat suspendarea și nu trebuie să plătești ca să te aperi. Dacă ai contract de vânzare
        pentru mașină, dacă actul e emis peste cele patru luni sau dacă rovinieta exista și era
        valabilă, plângerea e calea, nu telefoanele la CNAIR.
      </p>
      <p>
        Dacă nu ataci și nici nu plătești, procesul-verbal se trimite spre executare. La persoane
        fizice execută <strong>organele fiscale ale primăriei de domiciliu</strong>, nu ANAF, fiindcă
        amenzile aplicate persoanelor fizice se fac venit integral la bugetul local. La persoane
        juridice, banii merg la bugetul de stat, deci execută ANAF.
      </p>

      <h2>Unde se plătește, de fapt</h2>
      <p>
        Începe cu procesul-verbal, nu cu Google. Pe el sunt trecute instituția beneficiară și
        contul în care se face plata, iar ele decid restul: dacă plătești în alt cont, banii pleacă,
        amenda rămâne neachitată și afli asta abia când primești somația.
      </p>
      <p>
        Platforma online a statului e <strong>ghiseul.ro</strong>, cu un „g”. Noi suntem
        eGhișeul.ro, un serviciu privat, și nu încasăm amenzi: vindem rovinieta, adică exact ce te
        scutește de amendă data viitoare. Confuzia dintre cele două nume e exploatată constant de
        escroci, care trimit SMS-uri cu „amendă neplătită” și link către domenii aproape identice
        cu al platformei oficiale. Am descris o campanie concretă în{' '}
        <Link href="/sms-fals-amenda-ghiseul-ro/">articolul despre SMS-ul fals cu amendă</Link>.
        Regula scurtă: nicio instituție nu îți cere datele cardului printr-un link din SMS.
      </p>
      <p>
        În afară de plata online mai ai ghișeul băncii, oficiul poștal și unitatea de trezorerie
        indicată pe act. Oricare ar fi calea, păstrează dovada de plată. Ea e singurul lucru care
        oprește o executare silită pornită din eroare, iar erorile de reconciliere între instituții
        chiar se întâmplă.
      </p>

      <h2>Cum iei amendă deși ai plătit rovinieta</h2>
      <p>
        Sunt patru situații, toate reale și toate reparabile dacă le prinzi la timp.
      </p>
      <p>
        <strong>Numărul de înmatriculare tastat greșit.</strong> O literă în plus și rovinieta e
        activă pe o mașină care nu există. Normele permit îndreptarea erorii la același punct de
        lucru sau terminal, în 60 de minute de la emitere, iar distribuitorii online aplică același
        termen prin condițiile lor de vânzare. Verifică emailul de confirmare imediat, nu peste o
        săptămână. Și reține că, dacă între timp ai fost înregistrat de camere, corecția nu șterge
        procesul-verbal deja întocmit.
      </p>
      <p>
        <strong>Valabilitatea începe la înregistrarea în sistem, nu la plată.</strong> O rovinietă
        e valabilă din momentul în care apare în baza de date, nu din secunda în care ți s-a debitat
        cardul. Între cele două momente pot trece minute. Dacă tocmai ai plătit și verificarea spune
        că nu există, mai așteaptă și reia verificarea; nu cumpăra a doua oară.
      </p>
      <p>
        <strong>Schimbarea numărului de înmatriculare.</strong> Rovinieta rămâne valabilă pe noul
        număr numai dacă la emitere a fost înscris corect numărul de identificare al vehiculului.
        Când VIN-ul lipsește sau e greșit, transferul automat nu se face și trebuie depusă o cerere
        la CNAIR, cu seria de șasiu și copii după cartea de identitate a vehiculului și certificatul
        de înmatriculare.
      </p>
      <p>
        <strong>Fereastra de după reînmatriculare.</strong> Accesul CNAIR la baza de date a
        vehiculelor se face zilnic, nu în timp real. După ce primești plăcuțe noi există un interval
        de până la o zi în care sistemul de camere încă nu știe de numărul tău. Nu e un motiv de
        panică, dar explică procesele-verbale care par imposibile.
      </p>
      <p>
        Există și o situație în favoarea ta: potrivit poziției publice a CNAIR, dacă îți cumperi
        rovinieta în aceeași zi în care ai fost înregistrat de camere, nu ești sancționat.
      </p>

      <h2>Ce se schimbă de la 1 octombrie 2026</h2>
      <p>
        Tot ce citești mai sus stă pe Ordonanța 15/2002, iar ea are termen de aplicare până pe{' '}
        <strong>30 septembrie 2026</strong>. Data a fost amânată de două ori, de la 1 ianuarie la 1
        iulie și apoi la 1 octombrie 2026, motiv pentru care circulă în paralel trei versiuni
        contradictorii pe internet. De la 1 octombrie intră în aplicare Legea 226/2023, iar CNAIR a
        confirmat public calendarul.
      </p>
      <p>
        Schimbarea cu efect direct asupra buzunarului e că <strong>amenda nu mai e o sumă fixă</strong>.
        Noul cadru o leagă de prețul rovinietei anuale, între dublul și de patru ori tariful de 12
        luni al categoriei respective, cu actualizare anuală după indicele prețurilor de consum.
        Practic, amenda urcă odată cu tariful, fără să mai fie nevoie de o modificare separată a
        legii.
      </p>
      <p>
        A doua schimbare privește cine răspunde: definiția utilizatorului se lărgește la
        „conducătorul vehiculului sau deținătorul”, deci autoritatea va putea alege, în loc să fie
        legată de cel înscris în certificatul de înmatriculare.
      </p>
      <p>
        Ce se întâmplă cu rovinietele cumpărate înainte de 1 octombrie și valabile după acea dată nu
        e limpede: textul noii legi spune că vechile roviniete își încetează valabilitatea, iar
        presa de specialitate a scris că cele pentru vehiculele sub 3,5 tone rămân valabile. Până la
        normele de aplicare, nu avem cum să dăm un răspuns ferm, iar cine cumpără acum o rovinietă
        anuală ar face bine să știe că întrebarea e deschisă.
      </p>

      <h2>Prețul rovinietei în 2026</h2>
      <p>
        Tarifele sunt stabilite în euro prin ordonanță, dar se plătesc în lei. Conversia nu se face
        la cursul zilei, cum crede lumea, ci <strong>lunar</strong>: se folosește cursul BNR din
        penultima zi lucrătoare a lunii anterioare, iar prețul în lei rămâne apoi neschimbat toată
        luna. De asta găsești pe site-uri diferite sume ușor diferite pentru aceeași rovinietă: sunt
        din luni diferite.
      </p>
      <table>
        <thead>
          <tr>
            <th>Durată</th>
            <th>Preț</th>
            <th>Recomandat pentru</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1 zi</td>
            <td>3,5€ (~18 lei)</td>
            <td>Călătorii ocazionale</td>
          </tr>
          <tr>
            <td>10 zile</td>
            <td>6€ (~31 lei)</td>
            <td>Vacanțe scurte</td>
          </tr>
          <tr>
            <td>30 de zile</td>
            <td>9,5€ (~50 lei)</td>
            <td>O lună de condus</td>
          </tr>
          <tr>
            <td>60 de zile</td>
            <td>15€ (~79 lei)</td>
            <td>Două luni, sezon</td>
          </tr>
          <tr>
            <td>12 luni</td>
            <td>50€ (~262 lei)</td>
            <td>Utilizare frecventă</td>
          </tr>
        </tbody>
      </table>
      <p>
        Aritmetica e brutală în favoarea rovinietei anuale: 50 de euro pe an înseamnă mai puțin
        decât o singură amendă redusă la jumătate. Chiar și cea de o zi, la 3,5 euro, e de peste
        treisprezece ori mai ieftină decât cei 250 de lei ai amenzii reduse.
      </p>
      <p>
        Nu există rovinietă de 7 zile pentru autoturisme, deși e căutată des. Perioadele disponibile
        la categoria A sunt cele cinci din tabel. Șapte zile există doar la categoriile de marfă
        grea și transport de persoane, C–H, care au altă structură: 1 zi, 7 zile, 30 de zile și 12
        luni.
      </p>

      <h2>Se schimbă tarifele? Ce se știe despre normele EURO</h2>
      <p>
        La 09.09.2026, diferențierea tarifului după norma de poluare <strong>nu se aplică</strong>.
        Tarifele sunt cele plate din tabelul de mai sus, identice pentru un Euro 3 și pentru un Euro 6.
      </p>
      <p>
        Ce există e un proiect de ordin al Ministerului Transporturilor, pus în consultare publică în
        mai 2026, care ar împărți vehiculele în trei clase pe principiul „poluatorul plătește”: Euro
        VI la tariful de bază, cu electricele încadrate tot acolo, Euro V–IV cu 15% peste, iar Euro
        III și mai vechi cu 30% peste. Tarifele propuse ar fi exprimate direct în lei, nu în euro, cu
        actualizare anuală după indicele prețurilor de consum. Pentru un autoturism, rovinieta de 12
        luni ar ajunge la 254, 292,10 sau 330,20 de lei, în funcție de clasă.
      </p>
      <p>
        Proiectul nu are număr de ordin și nu a fost publicat în Monitorul Oficial. Titlurile din
        presă care anunțau majorarea „de la 1 iulie 2026” sunt depășite: data a alunecat la 1
        octombrie odată cu tot pachetul legislativ, iar aplicarea depinde oricum de adoptarea
        ordinului. Actualizăm secțiunea când apare în Monitor.
      </p>

      <h2>Verifică-ți rovinieta înainte de a pleca la drum</h2>
      <p>
        Verificarea e gratuită și durează câteva secunde: introduci numărul de înmatriculare în{' '}
        <Link href="/tools/verificare-rovinieta-online/">instrumentul de verificare rovinietă</Link>{' '}
        și vezi dacă există una activă, până când e valabilă și, important, pe ce categorie a fost
        cumpărată. Tot acolo găsești și pe ce drumuri se cere rovinieta și pe care nu, inclusiv
        capcana porțiunii de drum național care traversează un municipiu.
      </p>
    </ArticleLayout>
  );
}
