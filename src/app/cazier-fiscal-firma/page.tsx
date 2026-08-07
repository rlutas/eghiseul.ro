import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cazier-fiscal-firma';
const TITLE = 'Cazier fiscal pentru firmă (persoană juridică): când se cere și ce verifică Registrul Comerțului (2026)';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Cazier fiscal pentru firmă: când se cere și cine îl semnează';
const DESCRIPTION =
  'Cazierul fiscal al firmei și cel al asociaților sau administratorilor sunt două lucruri diferite. ' +
  'Când se cere fiecare, ce înseamnă inactivitatea fiscală pentru SRL sau PFA, ce se întâmplă la ' +
  'sediul expirat și ce acte sunt necesare pentru certificatul persoanei juridice.';
const DATE_PUBLISHED = '2026-08-07';
const DATE_MODIFIED = '2026-08-07';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/cazier-fiscal.png',
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
      updatedLabel="7 august 2026"
      image="/og/services/cazier-fiscal.png"
      imageAlt="Cazier fiscal pentru persoană juridică: certificatul cerut la Registrul Comerțului pentru firme, asociați și administratori"
      relatedServices={[
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Cazier fiscal eliberat de ANAF prin împuternicit, pentru firmă sau pentru asociat. 198 RON, 1–3 zile.',
        },
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator',
          desc: 'Situația firmei la Registrul Comerțului, cerută în același dosar cu cazierul fiscal.',
        },
        {
          href: '/servicii/cazier-judiciar-online/',
          label: 'Cazier Judiciar Online',
          desc: 'Documentul cerut administratorilor în dosarele de autorizare și la angajare.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este cazierul fiscal pentru persoană juridică?',
          a: 'Este certificatul prin care ANAF atestă situația unei societăți în evidența cazierului fiscal, emis pe codul de identificare fiscală al firmei. Arată dacă societatea are înscrise fapte sancționate de legislația fiscală, contabilă, vamală sau de disciplină financiară, inclusiv o eventuală declarare a inactivității fiscale.',
        },
        {
          q: 'Cum obțin cazierul fiscal pentru firmă online?',
          a: 'Prin Spațiul Privat Virtual al societății, dacă administratorul are contul activat pe CUI-ul firmei. Cererea se depune electronic, iar certificatul vine semnat digital. Dacă firma nu are cont SPV activ sau reprezentantul legal nu este disponibil, documentul se poate obține prin împuternicit, pe baza unei procuri, fără deplasare la administrația financiară.',
        },
        {
          q: 'Am nevoie de cazier fiscal la înființarea unei firme?',
          a: 'Da, dar nu pentru societatea care se înființează, fiindcă aceasta nu există încă. Se verifică situația fiscală a asociaților, acționarilor și a administratorilor sau reprezentanților legali, ca persoane fizice. În practică Registrul Comerțului obține de regulă aceste informații direct de la ANAF, prin schimb electronic de date, iar dosarul se blochează dacă vreuna dintre persoane are o faptă înscrisă.',
        },
        {
          q: 'Cazierul fiscal pentru SRL este același cu cel pentru PFA?',
          a: 'Nu. SRL-ul are personalitate juridică și o poziție proprie în cazier, pe CUI. PFA, întreprinderea individuală și întreprinderea familială sunt entități fără personalitate juridică, iar verificarea se face în principal pe persoana fizică titulară. La înregistrarea unui PFA contează cazierul fiscal al persoanei, nu al unei societăți.',
        },
        {
          q: 'Ce se întâmplă cu cazierul fiscal al unei firme inactive?',
          a: 'Declararea inactivității fiscale se înscrie în cazierul fiscal al societății. Mențiunea rămâne acolo până la trei luni de la data reactivării, iar în tot acest interval firma nu poate prezenta un certificat curat la licitații, la bănci sau în dosarele de autorizare.',
        },
        {
          q: 'Dacă am cazier fiscal pot fi asociat sau administrator?',
          a: 'O faptă înscrisă în cazierul fiscal al persoanei fizice blochează, pe durata în care rămâne acolo, înmatricularea unei societăți noi, cooptarea ca asociat, preluarea de părți sociale și numirea ca administrator. După radierea faptei, care se face din oficiu la termenele prevăzute de lege, situația se deblochează fără alte formalități.',
        },
        {
          q: 'Ce acte sunt necesare pentru cazier fiscal persoane juridice?',
          a: 'Cererea tip completată cu datele societății, codul de identificare fiscală, actul de identitate al reprezentantului legal și dovada calității acestuia (act constitutiv, hotărâre de numire sau certificat constatator). Dacă cererea o depune altcineva, este necesară o împuternicire sau o procură din partea reprezentantului legal.',
        },
        {
          q: 'Se cere cazier fiscal la înființarea unei asociații?',
          a: 'Da. Pentru asociații și fundații se verifică situația fiscală a membrilor fondatori, a persoanelor din organele de conducere și a cenzorilor, ca persoane fizice. Cerința se aplică și ulterior, la înlocuirea membrilor din consiliul director sau a cenzorului.',
        },
        {
          q: 'Cazierul fiscal se cere la prelungirea sau schimbarea sediului social?',
          a: 'Prelungirea sediului este o mențiune la Registrul Comerțului și, în funcție de ce se modifică odată cu ea, dosarul poate cere verificarea situației fiscale a persoanelor implicate. Problema reală apare când sediul expiră fără să fie prelungit: firma poate fi declarată inactivă, iar inactivitatea ajunge chiar în cazierul fiscal al societății.',
        },
        {
          q: 'Cât este valabil certificatul de cazier fiscal pentru persoană juridică?',
          a: 'Treizeci de zile de la data emiterii, la fel ca la persoana fizică. Se folosește o singură dată, la instituția pentru care a fost cerut, deci nu are sens să fie obținut înainte de a fi complet restul dosarului.',
        },
      ]}
    >
      <p>
        Cazierul fiscal al unei firme se emite pe codul de identificare fiscală al societății și arată
        dacă acea persoană juridică are înscrise fapte sancționate de legislația fiscală, contabilă,
        vamală sau de disciplină financiară. La Registrul Comerțului însă, în cele mai multe dosare, se
        verifică situația fiscală a <strong>persoanelor</strong>: asociați, acționari, administratori,
        reprezentanți legali. O firmă cu poziție curată poate rămâne blocată fiindcă unul dintre asociați
        are o faptă înscrisă pe numele lui.
      </p>
      <p>
        Certificatul este valabil 30 de zile, se eliberează gratuit de ANAF (din Spațiul Privat Virtual al
        societății sau de la administrația financiară) și poate fi cerut de reprezentantul legal ori de un
        împuternicit al acestuia. Noțiunile de bază, adică ce fapte se înscriu, când se radiază și prin ce
        diferă de certificatul de atestare fiscală, sunt în ghidul despre{' '}
        <Link href="/cazier-fiscal-persoana-fizica/">cazierul fiscal al persoanei fizice</Link>. Mai jos
        este partea specifică firmelor.
      </p>

      <h2>Cazierul firmei și cazierul asociatului sunt două documente diferite</h2>
      <p>
        Confuzia costă cele mai multe drumuri. Cine cere „cazier fiscal pentru SRL&rdquo; primește un
        certificat pe CUI, care spune ceva despre societate. Cine depune un dosar de înmatriculare are
        nevoie, de fapt, de situația fiscală a oamenilor din spatele firmei. Sunt evidențe separate, cu
        surse și efecte diferite.
      </p>
      <table>
        <thead>
          <tr>
            <th>Aspect</th>
            <th>Cazierul persoanei juridice</th>
            <th>Cazierul asociatului sau administratorului</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Se emite pe</td>
            <td>codul de identificare fiscală al societății</td>
            <td>CNP-ul persoanei fizice</td>
          </tr>
          <tr>
            <td>Conține</td>
            <td>faptele societății, inclusiv inactivitatea fiscală declarată</td>
            <td>faptele persoanei, inclusiv cele răsfrânte din firme anterioare</td>
          </tr>
          <tr>
            <td>Cine îl poate cere</td>
            <td>reprezentantul legal sau un împuternicit</td>
            <td>titularul sau un împuternicit</td>
          </tr>
          <tr>
            <td>Unde se cere de obicei</td>
            <td>licitații, finanțări, autorizări, dosare bancare</td>
            <td>înmatriculare, cesiune, numire administrator</td>
          </tr>
          <tr>
            <td>Ce blochează</td>
            <td>participarea firmei la o procedură</td>
            <td>înregistrarea unei firme noi sau a unei mențiuni</td>
          </tr>
        </tbody>
      </table>

      <h2>Când se cere cazierul fiscal și al cui</h2>
      <p>
        Ordonanța Guvernului nr. 39/2015 enumeră situațiile în care prezentarea certificatului este
        obligatorie. Tabelul de mai jos traduce lista în practica de zi cu zi.
      </p>
      <table>
        <thead>
          <tr>
            <th>Situația</th>
            <th>Se verifică</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Înmatriculare SRL sau societate pe acțiuni</td>
            <td>asociații, acționarii, administratorii și reprezentanții legali, ca persoane fizice</td>
          </tr>
          <tr>
            <td>Înregistrare PFA, întreprindere individuală sau familială</td>
            <td>titularul, respectiv membrii, ca persoane fizice</td>
          </tr>
          <tr>
            <td>Cesiunea părților sociale</td>
            <td>persoanele care intră în societate prin cesiune</td>
          </tr>
          <tr>
            <td>Numirea unui administrator sau reprezentant legal nou</td>
            <td>persoana numită</td>
          </tr>
          <tr>
            <td>Înființarea unei asociații sau fundații</td>
            <td>membrii fondatori, membrii organelor de conducere, cenzorii</td>
          </tr>
          <tr>
            <td>Licitație publică, finanțare, autorizare, dosar bancar</td>
            <td>societatea, pe CUI</td>
          </tr>
          <tr>
            <td>Mențiuni privind sediul social</td>
            <td>societatea, iar dacă se schimbă și persoanele, și acestea</td>
          </tr>
        </tbody>
      </table>
      <p>
        De la digitalizarea schimbului de date între ANAF și Registrul Comerțului, cazierele fiscale ale
        persoanelor implicate în dosarele de înmatriculare sunt obținute de regulă direct de instituție.
        Asta nu înseamnă că verificarea dispare, ci că ea se face în fundal. Dacă apare o faptă,
        rezoluția este de respingere sau de amânare, iar solicitantul află abia atunci că are o problemă.
        De aceea merită cerut certificatul înainte de depunere, mai ales dacă ai fost implicat în trecut
        într-o firmă cu probleme fiscale.
      </p>

      <h2>Ce se întâmplă când firma este declarată inactivă</h2>
      <p>
        Inactivitatea fiscală este singura mențiune care ajunge frecvent în cazierul unei societăți
        obișnuite, fără infracțiuni și fără controale spectaculoase. Codul de procedură fiscală prevede
        limitativ când ANAF declară un contribuabil inactiv, iar cele mai multe cazuri sunt administrative,
        nu de rea-credință.
      </p>
      <table>
        <thead>
          <tr>
            <th>Cauza inactivității</th>
            <th>Cum se iese din ea</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Nicio declarație depusă pe parcursul unui semestru calendaristic</td>
            <td>depunerea declarațiilor restante, apoi cerere de reactivare</td>
          </tr>
          <tr>
            <td>Firma nu funcționează la domiciliul fiscal declarat</td>
            <td>dovada unui sediu valabil și cerere de reactivare</td>
          </tr>
          <tr>
            <td>Durata deținerii spațiului cu destinație de sediu social a expirat</td>
            <td>prelungirea contractului sau mutarea sediului, apoi reactivarea</td>
          </tr>
          <tr>
            <td>Inactivitate temporară înscrisă la Registrul Comerțului</td>
            <td>reluarea activității și radierea mențiunii</td>
          </tr>
          <tr>
            <td>Societatea nu mai are organe statutare</td>
            <td>numirea unui administrator</td>
          </tr>
        </tbody>
      </table>
      <p>
        Efectele sunt imediate: codul de TVA se anulează, cheltuielile și TVA-ul aferent achizițiilor de la
        un contribuabil inactiv nu se deduc la partener, iar mențiunea intră în cazierul fiscal al firmei.
        Reactivarea nu curăță instant certificatul. Inactivitatea se radiază din cazier la{' '}
        <strong>trei luni de la data reactivării</strong>, așa că o firmă reactivată luna trecută încă
        primește un cazier cu mențiuni. Pentru dosarele cu termen, intervalul acesta trebuie planificat.
      </p>
      <p>
        Există o diferență importantă între inactivitatea declarată de ANAF și{' '}
        <Link href="/suspendare-activitate-firma-ghid/">suspendarea activității</Link> înregistrată
        voluntar la Registrul Comerțului. A doua este o decizie a asociaților, cu procedură proprie și cu
        efecte previzibile. Prima vine ca sancțiune și lasă urmă în cazier.
      </p>

      <h2>Sediul social expirat, capcana cea mai frecventă</h2>
      <p>
        Contractul de comodat sau de închiriere pentru sediu are termen. Când termenul trece și nimeni nu
        depune mențiunea de prelungire, situația nu rămâne suspendată la nesfârșit. ANAF poate constata că
        durata deținerii spațiului a expirat și poate declara societatea inactivă, cu tot ce înseamnă asta
        pentru cazier și pentru codul de TVA.
      </p>
      <p>
        Din acest motiv „cazier fiscal sediu expirat&rdquo; este o căutare atât de des întâlnită. Legătura nu
        este directă, în sensul că nimeni nu îți cere cazier fiscal pentru că ți-a expirat sediul. Legătura
        merge invers: sediul expirat duce la inactivitate, iar inactivitatea ajunge în cazier. Verificarea
        care lămurește situația rapid este{' '}
        <Link href="/servicii/certificat-constatator-online/">certificatul constatator</Link>, unde apar
        datele sediului și termenul acestuia.
      </p>

      <h2>Cum se răsfrânge o faptă asupra persoanei</h2>
      <p>
        Partea pe care puțini o anticipează: problemele unei societăți pot rămâne atașate persoanelor care
        au condus-o. Un administrator căruia i s-a atras răspunderea patrimonială sau solidară pentru
        obligațiile firmei ajunge cu fapta în propriul cazier fiscal. Din acel moment, întrebarea „dacă am
        cazier fiscal pot fi asociat&rdquo; are răspuns clar: nu, până la radierea faptei.
      </p>
      <p>
        Blocajul funcționează la înmatricularea unei societăți noi, la cooptarea ca asociat într-una
        existentă, la preluarea de părți sociale prin cesiune și la numirea ca administrator. Radierea se
        face din oficiu, la termenele prevăzute de lege, fără cerere. Un an de la achitarea integrală a
        amenzii în cazul contravențiilor, cinci ani de la rămânerea definitivă a hotărârii pentru faptele
        penale. Dacă termenul a trecut și fapta apare în continuare, se depune o cerere de rectificare la
        administrația financiară.
      </p>
      <p>
        Situația inversă apare la{' '}
        <Link href="/radiere-firma-srl-ghid/">radierea unei firme</Link>. Închiderea societății nu șterge
        automat ce a fost înscris pe numele persoanelor, iar o firmă radiată cu datorii sau cu inactivitate
        poate lăsa urme care se văd abia peste ani, când asociatul încearcă să înregistreze altceva.
      </p>

      <h2>Cine poate cere cazierul fiscal al firmei și cu ce acte</h2>
      <p>
        Cererea o depune reprezentantul legal al societății sau o persoană împuternicită de acesta.
        Contabilul, chiar dacă ține evidența firmei, nu poate solicita certificatul fără o împuternicire
        scrisă. Sunt necesare cererea tip completată cu datele societății și codul de identificare fiscală,
        actul de identitate al reprezentantului legal și dovada calității lui (act constitutiv, hotărâre de
        numire sau certificat constatator recent). Când depune un împuternicit, se adaugă procura sau
        împuternicirea avocațială.
      </p>
      <p>
        Sunt trei căi de obținere, cu aceleași reguli ca la persoana fizică. Prin Spațiul Privat Virtual
        activat pe CUI-ul firmei, gratuit și rapid, dacă administratorul are acces. La ghișeul
        administrației financiare de care aparține firma, gratuit, cu deplasare și cu termen legal de până
        la cinci zile lucrătoare. Sau prin împuternicit, contra cost, când administratorul este plecat,
        când firma nu are cont SPV funcțional sau când cel care are nevoie de document nu figurează ca
        reprezentant legal. La eGhișeul.ro, serviciul de{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazier fiscal online</Link> costă 198 RON cu TVA, taxe
        incluse, cu livrare în 1–3 zile lucrătoare.
      </p>

      <h2>Pe scurt</h2>
      <p>
        Firma are cazierul ei, pe CUI, iar asociații și administratorii îl au pe al lor, pe CNP. La
        Registrul Comerțului se verifică aproape întotdeauna persoanele, la licitații și la bănci se cere
        societatea. Inactivitatea fiscală este mențiunea care apare cel mai des în cazierul unei firme
        obișnuite și dispare abia la trei luni de la reactivare. Sediul social expirat este cauza care
        declanșează cel mai discret acest lanț. Certificatul are 30 de zile de valabilitate, iar cererea o
        poate depune doar reprezentantul legal sau un împuternicit.
      </p>
    </ArticleLayout>
  );
}
