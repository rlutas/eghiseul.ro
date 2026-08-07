import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cazier-fiscal-persoana-fizica';
const TITLE = 'Cazier fiscal pentru persoană fizică: ce este, cine îl cere și cum îl obții (2026)';
const DESCRIPTION =
  'Ghid complet despre cazierul fiscal al persoanei fizice: ce fapte se înscriu, când se șterg, ' +
  'cât este valabil, cine îl eliberează și cum îl obții prin SPV sau prin împuternicit dacă nu ' +
  'poți activa contul ANAF.';
const DATE_PUBLISHED = '2026-08-07';
const DATE_MODIFIED = '2026-08-07';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
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
      updatedLabel="7 august 2026"
      imageAlt="Femeie citind acasă un certificat proaspăt tipărit, cu laptopul și imprimanta pe masă — cazierul fiscal obținut online, fără drum la ANAF"
      relatedServices={[
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Cazier fiscal eliberat de ANAF prin împuternicit, fără cont SPV. 198 RON, 1–3 zile.',
        },
        {
          href: '/servicii/cazier-judiciar-online/',
          label: 'Cazier Judiciar Online',
          desc: 'Documentul cerut la angajare — se confundă des cu cel fiscal.',
        },
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator',
          desc: 'Celălalt act cerut la licitații și la dosarele de finanțare.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este cazierul fiscal al persoanei fizice?',
          a: 'Este documentul prin care ANAF atestă dacă o persoană fizică a săvârșit sau nu fapte sancționate de legislația fiscală, contabilă, vamală sau de disciplină financiară. Cel mai frecvent se eliberează „fără mențiuni", adică fără fapte înscrise, iar acesta este documentul cerut la înființarea unei firme sau la dosarele de autorizare.',
        },
        {
          q: 'Cine are cazier fiscal?',
          a: 'Toate persoanele fizice și juridice au o poziție în cazierul fiscal, gestionată de ANAF. Nu înseamnă că ai „ceva la dosar" — majoritatea cazierelor sunt curate. Cazierul se completează doar dacă ai fost sancționat pentru fapte fiscale, nu la orice datorie sau întârziere.',
        },
        {
          q: 'Ce fapte se înscriu în cazierul fiscal?',
          a: 'Se înscriu faptele prevăzute de OG 39/2015: infracțiuni de evaziune fiscală și fapte asimilate, atragerea răspunderii solidare sau patrimoniale, inactivitatea fiscală declarată, precum și contravențiile la regimul fiscal, contabil, vamal sau de disciplină financiară — dar numai cele expres prevăzute de lege, rămase definitive.',
        },
        {
          q: 'Când se șterg faptele din cazierul fiscal?',
          a: 'Contravențiile se radiază de regulă la un an de la data achitării integrale a amenzii, iar în cazul inactivității fiscale la trei luni de la reactivare. Faptele de natură penală se scot la cinci ani de la rămânerea definitivă a hotărârii sau de la reabilitare. Radierea se face din oficiu, nu la cerere.',
        },
        {
          q: 'Cât este valabil cazierul fiscal?',
          a: 'Certificatul de cazier fiscal este valabil 30 de zile de la data emiterii și se folosește o singură dată, la instituția pentru care a fost cerut. Un document emis acum două luni nu mai este acceptat, deci nu are sens să îl scoți „în avans".',
        },
        {
          q: 'Cine eliberează cazierul fiscal pentru persoane fizice?',
          a: 'ANAF, prin administrațiile financiare și prin Spațiul Privat Virtual. Nu se eliberează la primărie și nici prin ghiseul.ro, deși mulți îl caută acolo — ghiseul.ro este platforma de plăți a statului, nu emitent de caziere fiscale.',
        },
        {
          q: 'Cât costă cazierul fiscal?',
          a: 'Eliberat direct de ANAF, prin SPV sau la ghișeu, este gratuit. Costul apare doar dacă îl obții printr-un împuternicit care depune cererea și ridică documentul în locul tău — la eGhișeul.ro, 198 RON cu TVA, taxe incluse.',
        },
        {
          q: 'Se poate scoate cazierul fiscal online?',
          a: 'Da, prin Spațiul Privat Virtual al ANAF, dacă ai contul activat. Dacă nu ai cont sau nu poți trece de activare — cazul frecvent al românilor din străinătate — documentul se poate obține prin împuternicit, cu procură, fără să te deplasezi.',
        },
        {
          q: 'Care este diferența dintre cazierul fiscal și certificatul de atestare fiscală?',
          a: 'Cazierul fiscal arată dacă ai fapte sancționate înscrise. Certificatul de atestare fiscală arată dacă ai datorii la bugetul de stat. Sunt documente diferite, emise separat, iar instituțiile le cer uneori pe amândouă în același dosar.',
        },
        {
          q: 'Am nevoie de cazier fiscal ca să înființez o firmă?',
          a: 'Da. La înmatricularea unei societăți sau a unui PFA, Registrul Comerțului verifică situația fiscală a asociaților și administratorilor. O faptă înscrisă în cazierul fiscal poate bloca înregistrarea până la radierea ei.',
        },
      ]}
    >
      <p>
        Cazierul fiscal al unei persoane fizice este documentul prin care ANAF confirmă dacă acea
        persoană a fost sau nu sancționată pentru fapte fiscale, contabile, vamale sau de disciplină
        financiară. În practică, aproape toate certificatele se eliberează <strong>fără mențiuni</strong>,
        iar cel care îl cere (Registrul Comerțului, o autoritate contractantă, o bancă) vrea exact
        această confirmare pe hârtie.
      </p>
      <p>
        Se obține gratuit de la ANAF, prin Spațiul Privat Virtual sau de la administrația financiară, și
        este valabil 30 de zile. Mai jos: ce se înscrie de fapt în el, când se șterg faptele, în ce
        situații ți se cere și ce faci dacă nu poți activa contul SPV.
      </p>

      <h2>Ce este, mai exact, cazierul fiscal</h2>
      <p>
        Cazierul fiscal este o evidență ținută de ANAF în care se înscriu faptele sancționate de
        legislația financiară, în condițiile stabilite de Ordonanța Guvernului nr. 39/2015. Fiecare
        persoană fizică și juridică are o poziție în această evidență, asta nu înseamnă că are „ceva la
        dosar&rdquo;. Poziția e goală atâta timp cât nu există o sancțiune definitivă înscrisă, iar certificatul
        eliberat în acest caz spune explicit că titularul nu are fapte înscrise.
      </p>
      <p>
        Confuzia cea mai frecventă e cu <strong>certificatul de atestare fiscală</strong>. Sunt două
        documente diferite: cazierul arată sancțiuni, atestarea arată datorii. Poți avea cazier curat și
        datorii la stat, sau invers. Unele dosare le cer pe amândouă, mai ales la
        licitații publice, iar cine aduce doar unul se întoarce.
      </p>
      <p>
        A doua confuzie e cu <Link href="/servicii/cazier-judiciar-online/">cazierul judiciar</Link>,
        cerut la angajare și eliberat de Poliție. Nu au nicio legătură între ele. Unul ține de ANAF și de
        fapte fiscale, celălalt de MAI și de fapte penale.
      </p>

      <h2>Ce fapte se înscriu în cazierul fiscal</h2>
      <p>
        Nu orice greșeală ajunge acolo. O declarație depusă cu întârziere, o amendă de circulație sau o
        datorie curentă la ANAF <em>nu</em> se înscriu. Legea enumeră limitativ ce se trece:
      </p>
      <ul>
        <li>infracțiuni de evaziune fiscală și fapte asimilate acestora, rămase definitive;</li>
        <li>atragerea răspunderii solidare sau patrimoniale, stabilită prin decizie definitivă;</li>
        <li>inactivitatea fiscală declarată de ANAF;</li>
        <li>
          contravențiile la regimul fiscal, contabil, vamal și de disciplină financiară, dar numai cele
          prevăzute expres, și numai după ce sancțiunea a rămas definitivă.
        </li>
      </ul>
      <p>
        Pentru persoanele fizice care nu au avut niciodată o firmă, cazierul este aproape întotdeauna
        curat. Situațiile problematice apar la cei care au fost asociați sau administratori într-o
        societate declarată inactivă ori sancționată, faptul se răsfrânge asupra persoanei fizice și
        poate bloca ulterior înființarea unei firme noi.
      </p>

      <h2>Când se șterg faptele</h2>
      <table>
        <thead>
          <tr>
            <th>Tipul faptei</th>
            <th>Se radiază după</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Contravenție sancționată cu amendă</td>
            <td>1 an de la achitarea integrală a amenzii</td>
          </tr>
          <tr>
            <td>Inactivitate fiscală</td>
            <td>3 luni de la data reactivării</td>
          </tr>
          <tr>
            <td>Faptă de natură penală</td>
            <td>5 ani de la rămânerea definitivă a hotărârii sau de la reabilitare</td>
          </tr>
          <tr>
            <td>Atragerea răspunderii solidare / patrimoniale</td>
            <td>după stingerea integrală a obligației, în condițiile legii</td>
          </tr>
        </tbody>
      </table>
      <p>
        Radierea se face <strong>din oficiu</strong>, nu la cerere. Nu trebuie să depui nimic, dar merită
        să ceri un certificat înainte de a intra într-un dosar important, ca să vezi dacă ștergerea a fost
        operată. Dacă o faptă apare deși termenul a trecut, se depune o cerere de rectificare la
        administrația financiară.
      </p>

      <h2>Cine îți cere cazier fiscal ca persoană fizică</h2>
      <ul>
        <li>
          <strong>Registrul Comerțului</strong>, la înființarea unei firme sau a unui PFA, și la
          schimbarea asociaților ori a administratorului. Aici se blochează cele mai multe dosare.
        </li>
        <li>
          <strong>Autoritățile contractante</strong>, la licitații publice , de regulă împreună cu
          certificatul de atestare fiscală și cu{' '}
          <Link href="/servicii/certificat-constatator-online/">certificatul constatator</Link>.
        </li>
        <li>
          <strong>Instituțiile care acordă autorizații și licențe</strong> (transport, construcții, jocuri
          de noroc, servicii financiare).
        </li>
        <li>
          <strong>Băncile și instituțiile financiare</strong>, la creditele pentru afaceri.
        </li>
        <li>
          <strong>Organizațiile</strong> care numesc cenzori, membri în consilii sau persoane cu atribuții
          de gestiune.
        </li>
      </ul>

      <h2>Cum îl obții: cele trei căi</h2>
      <h3>1. Prin Spațiul Privat Virtual, gratuit, dacă ai cont</h3>
      <p>
        Din SPV, cererea se depune electronic, iar certificatul vine semnat digital, de regulă în câteva
        ore până la o zi lucrătoare. Este cea mai simplă cale <em>dacă</em> ai deja contul activat.
        Activarea se face online, prin video-identificare, sau la orice administrație financiară.
      </p>
      <h3>2. La ghișeul administrației financiare, gratuit, cu deplasare</h3>
      <p>
        Se depune cererea tip, cu actul de identitate. Termenul legal este de până la 5 zile lucrătoare,
        în practică deseori mai scurt. Dezavantajul e evident: program cu publicul și deplasare la
        administrația de domiciliu fiscal.
      </p>
      <h3>3. Prin împuternicit, contra cost, fără deplasare și fără SPV</h3>
      <p>
        Aici intră situațiile în care primele două căi nu funcționează: românii plecați din țară care nu
        pot trece de video-identificare, persoanele care au nevoie de document rapid și nu sunt în
        localitatea de domiciliu fiscal, sau cei care cer cazierul pentru o firmă în care nu figurează ca
        reprezentant legal. Cererea o depune un împuternicit, pe baza unei procuri, iar documentul ajunge
        pe email. La eGhișeul.ro, serviciul de{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazier fiscal online</Link> costă 198 RON cu TVA,
        taxe incluse, cu livrare în 1–3 zile lucrătoare.
      </p>

      <h2>Patru greșeli care costă timp</h2>
      <p>
        Prima: îl ceri prea devreme. Valabilitatea e de 30 de zile, așa că un cazier scos „ca să îl
        am&rdquo; expiră până se adună restul dosarului. A doua: îl cauți pe ghiseul.ro. Platforma aceea
        e pentru plăți către stat, iar cazierul fiscal îl eliberează ANAF.
      </p>
      <p>
        A treia, cea mai costisitoare: confunzi persoana fizică cu firma. Pentru o societate se cere
        cazierul fiscal al persoanei juridice, care e alt document, chiar dacă ești singurul asociat.
        Și a patra: presupui că ai cazier „murdar&rdquo; fiindcă ai avut datorii la stat. Datoriile nu se
        înscriu nicăieri în cazier. Cel mai simplu mod de a te lămuri e să ceri certificatul.
      </p>

      <h2>Pe scurt</h2>
      <p>
        Cazierul fiscal al persoanei fizice atestă lipsa faptelor fiscale sancționate, se eliberează de
        ANAF, e gratuit prin SPV sau la ghișeu și e valabil 30 de zile. Faptele se radiază automat, la
        termenele din tabelul de mai sus. Dacă nu ai cont SPV sau nu poți ajunge la administrația
        financiară, documentul se obține prin împuternicit, fără deplasare.
      </p>
    </ArticleLayout>
  );
}
