import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cazier-fiscal-fara-spv';
const TITLE =
  'Cazierul fiscal: ce conține, cine îl cere, când se șterg faptele și cum îl obții din SPV, de la ghișeu sau prin împuternicit';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Cazier fiscal: ce conține, cine îl cere și cum îl obții (2026)';
const DESCRIPTION =
  'Ghidul cazierului fiscal pe OG 39/2015: ce fapte se înscriu și ce nu, cât rămân (o lună, 5 ani, la ' +
  'reactivare), PF vs firmă, de ce nu poți verifica cazierul altcuiva, formularele 502 și 504 și cele trei ' +
  'căi: SPV, orice ghișeu ANAF sau împuternicit.';
const DATE_PUBLISHED = '2026-08-07';
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
      category="Documente fiscale"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="august 2026"
      updatedLabel="9 septembrie 2026"
      imageAlt="Bărbat la masa din bucătărie, seara, comparând buletinul cu ecranul telefonului în fața laptopului, blocat la activarea contului SPV"
      relatedServices={[
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Îl obținem noi de la ANAF, cu împuternicire, fără cont SPV. 198 RON, 1–3 zile lucrătoare.',
        },
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator',
          desc: 'Documentul de la registrul comerțului, cerut de regulă în același dosar.',
        },
        {
          href: '/servicii/cazier-judiciar-online/',
          label: 'Cazier Judiciar Online',
          desc: 'Alt document, de la Poliție: fapte penale, nu fiscale.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este cazierul fiscal?',
          a: 'Evidența ținută de ANAF în care se înscriu faptele sancționate contravențional sau penal de legile fiscale, contabile, vamale și de disciplină financiară, pentru persoane fizice, firme și entități fără personalitate juridică (OG 39/2015 art. 1 și art. 4). Certificatul de cazier fiscal e documentul care spune dacă titularul are sau nu fapte înscrise.',
        },
        {
          q: 'Cazierul fiscal arată datoriile la stat?',
          a: 'Nu. Datoriile nu sunt fapte sancționate, deci nu se înscriu. Poți avea cazier fiscal curat și restanțe la ANAF, sau cazier cu o mențiune și zero datorii. Pentru datorii există certificatul de atestare fiscală, alt document, cu altă cerere.',
        },
        {
          q: 'Cât timp rămâne o amendă în cazierul fiscal?',
          a: 'O contravenție se scoate din evidență la o lună de la înscriere, dacă amenda a fost plătită. Dacă nu, iese în 3 zile lucrătoare de la plată, iar dacă nu se plătește deloc, la 5 ani de la înscriere (OG 39/2015 art. 6 alin. (1) lit. e)). Pentru produse accizabile termenul este de un an. Infracțiunile se scot la 5 ani de la executarea pedepsei, la cererea contribuabilului.',
        },
        {
          q: 'Cât este valabil certificatul de cazier fiscal?',
          a: '30 de zile de la data emiterii și numai în scopul în care a fost eliberat (OG 39/2015 art. 9 alin. (7)). Pentru două dosare diferite se cer două certificate.',
        },
        {
          q: 'Cazierul fiscal costă ceva?',
          a: 'Nu. Certificatul se emite fără perceperea de taxe (OG 39/2015 art. 9 alin. (5), în forma dată de Legea 1/2017), pe hârtie sau electronic, și se eliberează de îndată (alin. (8)). Plătești doar dacă trimiți pe cineva în locul tău.',
        },
        {
          q: 'Pot verifica cazierul fiscal al unei firme sau al unui partener?',
          a: 'Nu. Certificatul se eliberează titularului, reprezentantului legal sau unui împuternicit cu mandat (OG 39/2015 art. 9 alin. (9)), iar ANAF nu are o interogare publică după CNP sau CUI. Singura cale este să ceri partenerului să îți prezinte el certificatul. Public rămân certificatul constatator de la ONRC și registrul contribuabililor inactivi.',
        },
        {
          q: 'Ce formular folosesc pentru cazierul fiscal?',
          a: 'Formularul 502 este cererea de eliberare a certificatului de cazier fiscal, formularul 503 este cererea de rectificare, iar 504 este certificatul propriu-zis, documentul pe care îl primești. Înregistrarea în SPV nu are număr de formular: se face pe portalul ANAF, cu identificare vizuală online, potrivit Ordinului ANAF 1090/2022.',
        },
        {
          q: 'Trebuie să merg la ANAF-ul de care aparțin?',
          a: 'Nu. Cererea se depune la orice organ fiscal competent în eliberarea certificatului, indiferent de domiciliul fiscal (OG 39/2015 art. 9 alin. (1) și (2)). Pentru persoane fizice, personal sau prin procură autentică ori împuternicire avocațială; pentru firme, prin reprezentantul legal, cu dovada calității, sau prin mandatar.',
        },
        {
          q: 'Mai trebuie să duc cazierul fiscal la Registrul Comerțului?',
          a: 'La înființare, la cesiunea de părți sociale și la numirea de administratori sau asociați noi, ONRC cere informațiile direct de la ANAF, electronic, iar ANAF răspunde în cel mult 2 ore (OG 39/2015 art. 8 alin. (2)). Nu mai depui certificatul, dar verificarea se face la fel, și dacă apare o faptă, cererea este respinsă.',
        },
        {
          q: 'Pot scoate cazier fiscal fără cont SPV?',
          a: 'Da. La ghișeul oricărei administrații fiscale, cu formularul 502 și actul de identitate, sau prin împuternicit, pe bază de procură autentică ori împuternicire avocațială. Prin SPV e doar varianta fără deplasare.',
        },
      ]}
    >
      <p>
        Cazierul fiscal e un document mic, o pagină, care blochează lucruri mari: înființarea
        unei firme, cumpărarea de părți sociale, numirea ca administrator, o licitație, un
        credit. Aproape toate certificatele ies fără mențiuni, iar cine îl cere vrea exact
        confirmarea asta pe hârtie sau în PDF. Ghidul de mai jos acoperă tot subiectul: ce se
        înscrie și ce nu, cât rămâne, cine îl poate cere și pentru cine, și cele trei căi prin
        care îl obții, cu articolele din OG 39/2015 lângă fiecare afirmație, pentru că pe
        subiectul ăsta circulă multe cifre greșite, inclusiv în varianta anterioară a acestei
        pagini.
      </p>

      <h2>Ce este și ce nu este</h2>
      <p>
        OG 39/2015 art. 1 definește cazierul fiscal drept mijlocul de evidență a persoanelor
        fizice, juridice și a entităților fără personalitate juridică care au săvârșit fapte
        sancționate de legile fiscale, contabile, vamale și de disciplină financiară. Îl
        organizează ANAF, la nivel central (art. 3). Fiecare contribuabil are o poziție în el, iar
        poziția e goală până la o sancțiune rămasă definitivă.
      </p>
      <p>
        Trei confuzii costă cele mai multe drumuri. Cazierul fiscal nu arată datorii: o restanță
        la ANAF nu este o faptă sancționată și nu se înscrie nicăieri; pentru datorii există
        certificatul de atestare fiscală. Nu are nicio legătură cu{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazierul judiciar</Link>, care vine de la
        Poliție și privește fapte penale. Și nu se ia de pe ghiseul.ro, care e o platformă de
        plăți; cazierul fiscal îl eliberează ANAF.
      </p>

      <h2>Ce se înscrie în el</h2>
      <p>
        Art. 4 alin. (1) spune că se înscriu faptele sancționate contravențional sau penal de
        legile fiscale, contabile, vamale și cele privind disciplina financiară. Lista concretă e
        în anexa la HG 1000/2015, actualizată prin HG 1568/2022 (în vigoare din 29 ianuarie
        2023), și are câteva sute de poziții. Câteva exemple din ea, ca să vezi cât de jos coboară
        pragul:
      </p>
      <ul>
        <li>
          nedepunerea la termen a declarațiilor de înregistrare fiscală sau de mențiuni și
          neîndeplinirea la termen a obligațiilor de declarare (Codul de procedură fiscală art.
          336 alin. (1) lit. a) și b));
        </li>
        <li>
          deținerea de active sau datorii neînregistrate în contabilitate și nedepunerea
          situațiilor financiare anuale (Legea contabilității 82/1991 art. 41);
        </li>
        <li>neemiterea bonului fiscal și nepăstrarea rapoartelor de închidere zilnică (OUG 28/1999);</li>
        <li>evaziunea fiscală și infracțiunile vamale, cu toate formele lor.</li>
      </ul>
      <p>
        Da, o declarație depusă cu întârziere este pe listă. Ghidurile care spun că „o declarație
        întârziată nu se înscrie” greșesc pe jumătate: fapta e pe listă, dar intră în cazier doar
        dacă a fost sancționată cu amendă, iar avertismentul nu se înscrie niciodată (art. 4 alin.
        (2)). Și, cum vezi mai jos, o amendă plătită dispare din evidență după o lună.
      </p>
      <p>
        Pe lângă fapte, art. 4 alin. (4) adaugă trei situații: atragerea răspunderii solidare cu
        debitorul, stabilită prin decizie definitivă a ANAF; atragerea răspunderii patrimoniale a
        administratorului pentru datoriile unei firme ajunse în insolvență, prin hotărâre
        judecătorească definitivă; și inactivitatea fiscală declarată de ANAF. Cu o excepție
        scrisă expres: inactivitatea fiscală care rezultă din înscrierea inactivității temporare
        la registrul comerțului nu se înscrie. Firma suspendată corect la ONRC nu lasă urme în
        cazier; firma lăsată „în aer” lasă.
      </p>

      <h2>Persoana fizică și firma: două caziere, o singură capcană</h2>
      <p>
        Firma are cazierul ei, pe CUI. Asociații și administratorii îl au pe al lor, pe CNP.
        Capcana e că faptele firmei se răsfrâng asupra oamenilor. Art. 4 alin. (5) și (6) spun că
        inactivitatea fiscală se înscrie și în cazierul reprezentanților legali din perioada în
        care a intervenit, iar alin. (7) extinde înscrierea la reprezentanții noi dacă
        inactivitatea continuă mai mult de un semestru după numirea lor. Răspunderea patrimonială
        dintr-o insolvență intră direct în cazierul persoanei.
      </p>
      <p>
        De aici întrebarea clasică, „dacă am cazier fiscal pot fi asociat?”, cu răspunsul clar din
        art. 8 alin. (5): se interzice autorizarea operațiunilor de la alin. (1) dacă în cazier
        există înscrieri. Nu până la radierea faptei. Și situația inversă, la fel de neplăcută:
        administratorul unei firme care a fost declarată inactivă și apoi radiată păstrează
        inactivitatea în cazierul personal încă un an de la radiere (art. 6 alin. (1) lit. j)).
        Închiderea firmei nu șterge ce s-a înscris pe numele oamenilor.
      </p>
      <p>
        Pentru persoana fizică obișnuită, fără firmă în trecut, cazierul e aproape mereu curat.
        Problemele apar la foștii administratori de firme abandonate și la cei cărora li s-a atras
        răspunderea.
      </p>

      <h2>Când se șterg faptele</h2>
      <p>
        Aici circulă cele mai multe cifre greșite, așa că tabelul e făcut direct pe art. 6 din OG
        39/2015.
      </p>
      <table>
        <thead>
          <tr>
            <th>Situația</th>
            <th>Se scoate din evidență</th>
            <th>Cum</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Contravenție sancționată cu amendă (lit. e)</td>
            <td>
              la o lună de la înscriere, dacă amenda e plătită; altfel, în 3 zile lucrătoare de
              la plată; dacă nu se plătește deloc, la 5 ani de la înscriere
            </td>
            <td>din oficiu</td>
          </tr>
          <tr>
            <td>Contravenție la regimul produselor accizabile (lit. f)</td>
            <td>la un an de la înscriere, cu amenda plătită; aceleași reguli în rest</td>
            <td>din oficiu</td>
          </tr>
          <tr>
            <td>Infracțiune (lit. c)</td>
            <td>la 5 ani de la executarea pedepsei, fără alte fapte de același fel</td>
            <td>la cererea contribuabilului (art. 6 alin. (2))</td>
          </tr>
          <tr>
            <td>Faptă penală sancționată cu amendă sau avertisment (lit. d)</td>
            <td>la 5 ani de la înscriere</td>
            <td>din oficiu</td>
          </tr>
          <tr>
            <td>Răspundere solidară sau patrimonială (lit. g)</td>
            <td>la stingerea creanțelor, dar nu mai devreme de o lună de la înscriere; altfel, la 5 ani</td>
            <td>din oficiu</td>
          </tr>
          <tr>
            <td>Inactivitate fiscală, firmă reactivată (lit. h)</td>
            <td>
              la data reactivării, dacă inactivitatea a venit din declarații nedepuse; la 3 luni de
              la reactivare în celelalte cazuri (sediu expirat, de pildă)
            </td>
            <td>din oficiu, inclusiv pentru reprezentanți</td>
          </tr>
          <tr>
            <td>Nu mai ești reprezentant al firmei inactive (lit. i)</td>
            <td>la un an de la înscrierea schimbării la registrul comerțului</td>
            <td>din oficiu</td>
          </tr>
          <tr>
            <td>Firma inactivă a fost radiată (lit. j)</td>
            <td>la un an de la radiere, pentru reprezentanți</td>
            <td>din oficiu</td>
          </tr>
          <tr>
            <td>Amnistie, reabilitare, dezincriminare (lit. a, b)</td>
            <td>la data la care intervin</td>
            <td>din oficiu</td>
          </tr>
        </tbody>
      </table>
      <p>
        Două lucruri de reținut din tabel. Pentru infracțiuni, ștergerea nu vine singură: art. 6
        alin. (2) o pune la cerere, deci cine a avut o condamnare pentru evaziune trebuie să o
        ceară, cu dovada executării pedepsei. Și orice scoatere din oficiu se poate cere și mai
        devreme, cu documente (alin. (3)), util când sistemul întârzie să opereze o plată de
        amendă. Istoricul celor scoși din evidență se păstrează 10 ani la ANAF (art. 7), dar nu
        mai apare în certificat.
      </p>

      <h2>Cine îți cere cazier fiscal</h2>
      <p>
        Art. 8 alin. (1) enumeră situațiile în care prezentarea e obligatorie: la înființarea
        societăților, cooperativelor și entităților fără personalitate juridică, de către
        asociați, acționari și reprezentanți legali; la înscrierea asociațiilor și fundațiilor, de
        către fondatori; la autorizarea unei activități independente; la cesiunea părților sociale
        sau acțiunilor, de către noii asociați; la numirea de reprezentanți legali noi și la
        cooptarea de asociați noi prin majorare de capital; și în alte cazuri prevăzute de lege,
        unde intră licitațiile, autorizările și o parte din dosarele bancare.
      </p>
      <p>
        Pentru tot ce trece prin registrul comerțului, din lista de mai sus, nu mai depui tu
        certificatul. Art. 8 alin. (2) spune că obligația e îndeplinită prin transmiterea
        electronică a informațiilor de la ANAF la ONRC, la cererea acestuia, în cel mult 2 ore.
        Verificarea nu a dispărut, s-a mutat în fundal, și asta are o consecință practică: dacă
        ai o faptă înscrisă, afli când cererea de înmatriculare sau de mențiune e respinsă. De
        aceea, dacă ai fost implicat în trecut într-o firmă cu probleme, merită să îți ceri
        certificatul înainte să pornești dosarul, nu după. Tabelul cu cine se verifică la fiecare
        operațiune:
      </p>
      <table>
        <thead>
          <tr>
            <th>Situația</th>
            <th>Al cui cazier se verifică</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Înmatriculare SRL sau SA</td>
            <td>asociații, acționarii și reprezentanții legali, ca persoane fizice</td>
          </tr>
          <tr>
            <td>PFA, întreprindere individuală sau familială</td>
            <td>titularul, respectiv membrii</td>
          </tr>
          <tr>
            <td>Cesiune de părți sociale</td>
            <td>persoanele care intră în societate</td>
          </tr>
          <tr>
            <td>Administrator sau reprezentant legal nou</td>
            <td>persoana numită</td>
          </tr>
          <tr>
            <td>Asociație sau fundație</td>
            <td>membrii fondatori și cei care devin reprezentanți legali</td>
          </tr>
          <tr>
            <td>Licitație, finanțare, autorizare, dosar bancar</td>
            <td>firma, pe CUI, uneori și administratorii</td>
          </tr>
        </tbody>
      </table>
      <p>
        Cetățenii străini și firmele străine neînregistrate fiscal în România nu au cum să aibă
        cazier fiscal românesc, așa că art. 8 alin. (4) le cere în loc o declarație autentică pe
        propria răspundere. Un asociat străin într-un SRL nou nu trebuie trimis după un document
        care nu există.
      </p>

      <h2>„Verificare cazier fiscal”: ce se poate și ce nu</h2>
      <p>
        Întrebarea reală din spatele căutării e „cum aflu dacă am ceva înscris” sau, mai des, „cum
        aflu dacă partenerul meu are”. La a doua răspunsul e scurt: nu ai cum. Certificatul se
        eliberează titularului, reprezentantului legal sau unui împuternicit cu mandat (art. 9
        alin. (9)), iar instituțiilor publice doar când au de soluționat o cerere care îl
        presupune (alin. (10)). Nu există o interogare publică după CNP sau CUI, iar site-urile
        care promit „verificare instant” nu au acces la evidența ANAF. Dacă ai nevoie de garanția
        asta într-un contract, ceri partenerului să îți prezinte el certificatul, exact ca o
        autoritate contractantă.
      </p>
      <p>
        Ce poți verifica fără acordul nimănui: starea firmei, asociații, administratorii, sediul
        și eventualele mențiuni de insolvență sau dizolvare, dintr-un{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator</Link> de la
        registrul comerțului; și dacă firma e declarată inactivă fiscal, din registrul
        contribuabililor inactivi publicat de ANAF. Cele două acoperă aproape toate riscurile pe
        care lumea încearcă să le prevină căutând cazierul celuilalt.
      </p>
      <p>
        La prima întrebare, despre propria situație, răspunsul e tot certificatul: îl ceri și
        citești ce scrie. Dacă apare o faptă pe care o credeai ștearsă, compari data din
        certificat cu termenele din tabelul de mai sus și, dacă termenul a trecut, depui cererea
        de rectificare (formularul 503) la organul fiscal care a făcut înscrierea, cu dovada:
        chitanța amenzii, decizia de reactivare, hotărârea definitivă. ANAF răspunde în 5 zile
        (art. 10 alin. (4)) și eliberează un certificat nou sau o decizie de respingere, care se
        contestă la tribunal în 30 de zile (art. 11).
      </p>

      <h2>Ce scrie în certificat</h2>
      <p>
        Formularul 504, adică certificatul, are o pagină: antetul ANAF, numărul și data, datele
        de identificare ale titularului și rubrica de mențiuni, care spune fie că nu există fapte
        înscrise, fie enumeră faptele cu sancțiunea, temeiul legal și data rămânerii definitive.
        Nu are hologramă și nu se tipărește pe hârtie specială. În varianta electronică, singurul
        element care îl face autentic e semnătura digitală a ANAF, vizibilă la deschiderea
        PDF-ului într-un cititor care validează semnături. Printat, PDF-ul devine o imagine fără
        semnătură; instituțiile care lucrează electronic cer fișierul, nu scanul lui.
      </p>
      <p>
        Valabilitatea: 30 de zile de la emitere și numai în scopul pentru care a fost eliberat
        (art. 9 alin. (7)). Pentru registrul comerțului și pentru o licitație îți trebuie două
        certificate, iar un cazier scos „ca să îl am” expiră, de regulă, până se adună restul
        dosarului.
      </p>

      <h2>Cele trei căi</h2>
      <h3>1. Din Spațiul Privat Virtual, fără deplasare</h3>
      <p>
        SPV e contul tău pe portalul ANAF, prin care comunici electronic cu fiscul: vezi
        obligațiile, depui declarații, ceri certificate. Odată activat, cazierul fiscal e o
        cerere de câteva minute: te autentifici, intri la cereri, alegi eliberarea certificatului
        de cazier fiscal, completezi scopul (contează, pentru că certificatul e valabil doar în
        acel scop) și transmiți. Răspunsul apare în secțiunea de mesaje, ca PDF semnat
        electronic, de regulă în câteva ore și cel mult în ziua lucrătoare următoare pentru
        cererile de vineri seara. Legea spune „de îndată” (art. 9 alin. (8)); în SPV asta chiar
        se întâmplă.
      </p>
      <p>
        Problema nu e cererea, ci contul. Înregistrarea în SPV a persoanelor fizice e
        reglementată de Ordinul ANAF 1090/2022 (Monitorul Oficial 585 din 16 iunie 2022): trimiți
        cererea online cu actul de identitate fotografiat și îți programezi o sesiune de
        identificare vizuală, în care un funcționar îți verifică identitatea pe video. Alternativ,
        te duci cu numărul cererii și cu actul la orice administrație fiscală și aprobarea se face
        la ghișeu. Nu există un „formular 502 pentru SPV”; 502 e cererea de cazier, vezi mai jos.
      </p>
      <p>Unde se blochează lumea, în ordinea frecvenței:</p>
      <ul>
        <li>
          ești plecat din țară și sesiunile video se programează în ore de România, pe conexiuni
          instabile și cu locuri limitate; cine are act valabil și răbdare trece, cine nu are act
          valabil nu are ce încerca;
        </li>
        <li>
          actul de identitate a expirat: nu se poate face nici identificarea video, nici aprobarea
          la ghișeu, iar reînnoirea cere prezența în țară sau consulatul;
        </li>
        <li>
          telefonul sau emailul din evidența ANAF sunt vechi, codurile de confirmare pleacă spre
          ele, și ca să le schimbi îți trebuie exact accesul pe care nu îl ai;
        </li>
        <li>
          contul e creat, dar neaprobat: dacă la autentificare nu vezi secțiunea de cereri și
          mesaje, nu ai SPV, oricât de mult ai completat;
        </li>
        <li>
          ceri cazierul firmei din contul personal: contul tău acoperă doar situația ta; pentru
          firmă, persoana juridică se înrolează separat, de reprezentantul legal, iar asociatul
          fără calitatea de administrator nu poate cere din contul propriu cazierul societății.
        </li>
      </ul>

      <h3>2. La ghișeu, la orice administrație fiscală</h3>
      <p>
        Nu „la cea de domiciliu”: art. 9 alin. (1) și (2) spun că cererea se depune la orice
        organ fiscal competent în eliberarea certificatului, indiferent de domiciliul fiscal.
        Pentru persoana fizică: formularul 502 și actul de identitate. Pentru firmă: cererea
        depusă de reprezentantul legal, cu documente care îi atestă calitatea (act constitutiv,
        hotărâre de numire sau un certificat constatator recent), ori de un mandatar. Contabilul
        care ține evidența firmei nu poate cere certificatul fără o împuternicire scrisă.
        Eliberarea e de îndată (alin. (8)), pe loc în practică, și gratuită (alin. (5)).
        Dezavantajul e doar programul cu publicul și drumul.
      </p>

      <h3>3. Prin împuternicit</h3>
      <p>
        Art. 9 alin. (1) admite două forme de mandat pentru persoanele fizice: procura autentică
        și împuternicirea avocațială. E calea pentru cine e plecat și nu trece de video, pentru
        cine are actul expirat, pentru cine are nevoie de cazierul unei firme în care nu e
        reprezentant legal dar are mandat de la acesta, și pentru cine vrea documentul pe email
        fără să se ocupe. Asta facem noi: prin serviciul de{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazier fiscal online</Link> depunem cererea
        cu împuternicire și îți trimitem certificatul în 1–3 zile lucrătoare, pentru 198 RON cu
        TVA. Plătești munca, nu documentul; certificatul în sine nu costă nimic la nicio cale.
        Dacă ești în țară, ai act valabil și un ghișeu în apropiere, varianta 2 e mai rapidă și
        gratuită.
      </p>

      <table>
        <thead>
          <tr>
            <th>Criteriu</th>
            <th>SPV</th>
            <th>Ghișeu ANAF</th>
            <th>Împuternicit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cost</td>
            <td>gratuit</td>
            <td>gratuit</td>
            <td>tariful serviciului</td>
          </tr>
          <tr>
            <td>Timp</td>
            <td>ore, cel mult o zi lucrătoare</td>
            <td>pe loc</td>
            <td>1–3 zile lucrătoare</td>
          </tr>
          <tr>
            <td>Ce îți trebuie</td>
            <td>cont SPV aprobat</td>
            <td>formularul 502, act de identitate valabil</td>
            <td>procură autentică sau împuternicire avocațială</td>
          </tr>
          <tr>
            <td>Deplasare</td>
            <td>niciuna</td>
            <td>la orice administrație fiscală</td>
            <td>niciuna</td>
          </tr>
          <tr>
            <td>Potrivit când</td>
            <td>ai deja contul activ</td>
            <td>ești în țară și ai act valabil</td>
            <td>ești plecat, actul a expirat sau ceri pentru o firmă fără acces la SPV-ul ei</td>
          </tr>
        </tbody>
      </table>

      <h2>Formularele, cu numerele corecte</h2>
      <p>
        Numerele circulă amestecat, inclusiv în versiunea anterioară a acestei pagini, așa că pe
        scurt, după Ordinul ANAF 2594/2015 cu modificările ulterioare: 502 este cererea de
        eliberare a certificatului de cazier fiscal, cea pe care o completezi; 503 este cererea de
        rectificare a datelor înscrise; 504 este certificatul de cazier fiscal, adică documentul
        pe care îl primești; 505 e fișa de înscriere pentru răspundere solidară sau patrimonială,
        folosită de ANAF, nu de tine. În SPV nu completezi formulare cu număr, alegi tipul de
        cerere din listă.
      </p>

      <h2>Inactivitatea fiscală, mențiunea care apare cel mai des la firme</h2>
      <p>
        La o firmă obișnuită, fără infracțiuni și fără controale spectaculoase, singura mențiune
        care ajunge frecvent în cazier e inactivitatea fiscală. ANAF o declară în situațiile
        prevăzute de Codul de procedură fiscală art. 92, cele mai comune fiind nedepunerea
        niciunei declarații un semestru întreg și expirarea dovezii de sediu. A doua e capcana
        discretă: contractul de comodat pentru sediu trece de termen, nimeni nu depune mențiunea
        de prelungire, ANAF constată și declară firma inactivă, iar mențiunea intră în cazierul
        firmei și al administratorului. De aici și căutarea „cazier fiscal sediu expirat”:
        legătura merge de la sediu la inactivitate și de la inactivitate la cazier, nu invers.
      </p>
      <p>
        Reactivarea nu curăță instant certificatul. Dacă inactivitatea a venit din declarații
        nedepuse, ștergerea se face la data reactivării; dacă a venit din sediu expirat sau din
        alte cauze, abia la 3 luni de la reactivare (art. 6 alin. (1) lit. h)). O firmă reactivată
        luna trecută pentru sediu primește încă un cazier cu mențiuni, și la fel administratorul
        ei. Pentru dosarele cu termen, cele trei luni se planifică. Verificarea rapidă a stării
        sediului se face dintr-un certificat constatator, unde apar actul de sediu și data
        expirării lui; procedura de prelungire sau mutare e în{' '}
        <Link href="/rolul-si-atributiile-onrc-romania/">ghidul despre ONRC</Link>.
      </p>

      <h2>Pe scurt</h2>
      <p>
        Cazierul fiscal arată sancțiuni, nu datorii. O amendă plătită iese după o lună,
        inactivitatea la reactivare sau la trei luni după, infracțiunile la cinci ani de la
        executarea pedepsei și doar la cerere. Certificatul e gratuit, se eliberează de îndată, la
        orice administrație fiscală, e valabil 30 de zile și doar pentru scopul declarat. La
        registrul comerțului nu îl mai duci tu, îl cere ONRC de la ANAF în două ore. Cazierul
        altcuiva nu se poate verifica; al tău, da, și merită făcut înainte de dosar, nu după. Iar
        când SPV-ul nu merge, rămân ghișeul, dacă ești în țară, și împuternicitul, dacă nu ești.
      </p>
    </ArticleLayout>
  );
}
