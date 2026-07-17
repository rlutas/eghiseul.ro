import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'verificare-proprietar-imobil';
const TITLE = 'Cum Afli Cine e Proprietarul unui Imobil (după Adresă sau CF)';
const DESCRIPTION =
  'Singura metodă oficială care îți arată numele proprietarului este extrasul de carte funciară — și îl poate cere oricine, e legal. ' +
  'Cum verifici proprietarul unui apartament sau teren, chiar dacă ai doar adresa.';
const DATE_PUBLISHED = '2026-07-17';
const DATE_MODIFIED = '2026-07-17';

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
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="17 iulie 2026"
      updatedLabel="17 iulie 2026"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară Online',
          desc: 'Documentul care arată proprietarul, sarcinile și ipotecile. Eliberat automat, fără cont ANCPI.',
        },
        {
          slug: 'identificare-imobil',
          label: 'Identificare Imobil după Adresă',
          desc: 'Afli numărul de carte funciară și numărul cadastral când ai doar adresa.',
        },
        {
          href: '/cum-aflam-numarul-carte-functionara-si-nr-cadastral/',
          label: 'Cum afli numărul de carte funciară',
          desc: 'Din acte, dintr-un extras vechi sau după adresă.',
        },
      ]}
      faqs={[
        {
          q: 'Cum aflu cine este proprietarul unui imobil?',
          a: 'Din extrasul de carte funciară pentru informare — singurul document oficial care arată numele proprietarului actual, plus ipotecile și sarcinile. Îl poate cere oricine, pentru orice imobil înscris în cartea funciară. Ai nevoie de numărul de carte funciară sau de numărul cadastral; dacă ai doar adresa, se face întâi o identificare a imobilului.',
        },
        {
          q: 'Pot afla proprietarul doar după adresă?',
          a: 'Da, în doi pași: întâi identificarea imobilului după adresă (îți dă numărul de carte funciară), apoi extrasul de carte funciară pe acel număr. Geoportalul ANCPI arată gratuit conturul parcelelor și uneori numărul cadastral, dar nu afișează niciodată numele proprietarului.',
        },
        {
          q: 'Este legal să verific cine e proprietarul unui imobil?',
          a: 'Da. Cartea funciară este un registru public (Legea 7/1996), iar Codul civil spune explicit la art. 883 că orice persoană poate cerceta cartea funciară fără să justifice vreun interes. Exact pentru asta există publicitatea imobiliară: să poți verifica cine deține un imobil înainte să cumperi, să închiriezi sau să semnezi ceva.',
        },
        {
          q: 'Cât costă să afli proprietarul unui imobil?',
          a: 'Extrasul de informare este gratuit prin platforma MyTerra a ANCPI, dacă ai cont cu identitate verificată (ROeID, semnătură electronică sau drum la ghișeu). Fără cont, un serviciu online ți-l eliberează în câteva minute contra unei taxe — la eGhișeul, 89 lei cu tot cu taxe. Identificarea după adresă e serviciu separat.',
        },
        {
          q: 'Terenul nu are carte funciară. Cum aflu al cui e?',
          a: 'Dacă imobilul nu a fost niciodată înscris în cartea funciară (cadastru nefinalizat), nu există o evidență centralizată cu proprietarul. Rămân registrul agricol de la primărie (acces limitat, de regulă doar cu interes dovedit), actele vechi de proprietate și, practic, discuția cu vecinii. Verifică întâi dacă există CF — multe terenuri au fost înscrise prin programul național de cadastru.',
        },
        {
          q: 'Pot vedea toate proprietățile unei persoane?',
          a: 'Da — căutarea inversă, de la persoană la imobile, există ca serviciu ANCPI de identificare a imobilelor după numele proprietarului (163,64 lei + TVA, același tarif ca identificarea după adresă). Primești cărțile funciare găsite pe numele respectiv, apoi poți comanda extrasul pentru oricare dintre ele.',
        },
        {
          q: 'Sistemele ANCPI sunt picate. Mai pot verifica proprietarul?',
          a: 'În timpul căderii ANCPI din iulie 2026 nimeni nu poate elibera extrase, din nicio sursă. Poți plasa comanda: intră în coadă și se eliberează automat imediat ce sistemele revin, iar documentul vine pe email.',
        },
      ]}
    >
      <p>
        Răspunsul scurt: numele proprietarului unui imobil apare într-un singur document oficial —{' '}
        <strong>extrasul de carte funciară pentru informare</strong>. Îl poate cere oricine, pentru
        orice apartament sau teren înscris în cartea funciară, fără să justifice vreun motiv. Ai
        nevoie doar de numărul de carte funciară sau de cel cadastral; dacă ai doar adresa, se
        rezolvă și asta, cu un pas în plus.
      </p>
      <p>
        Mai jos ai toate metodele, cu ce arată fiecare, cât costă și unde te blochezi — plus partea
        legală, pentru că întrebarea „am voie să verific?” apare de fiecare dată.
      </p>

      <h2>De ce ai verifica proprietarul</h2>
      <p>
        Cele mai comune situații din comenzile pe care le procesăm: cumperi sau închiriezi și vrei
        să verifici că cel care semnează chiar deține imobilul; ai o moștenire și nu știi pe numele
        cui a rămas casa; vecinul construiește pe o limită de teren și vrei să știi cu cine
        discuți; sau pur și simplu ți se pare că un teren de lângă tine e abandonat și vrei să afli
        al cui e.
      </p>
      <p>
        În toate cazurile, hârtia care contează e aceeași. Extrasul de carte funciară arată
        proprietarul actual cu nume complet, cota deținută, actul prin care a dobândit imobilul,
        plus lucrurile pe care un vânzător nu se grăbește să ți le spună: ipoteci, interdicții de
        înstrăinare, drepturi de uzufruct, litigii notate.
      </p>

      <h2>Metoda 1: știi numărul de carte funciară sau cel cadastral</h2>
      <p>
        Cazul simplu. Cu numărul de CF sau numărul cadastral plus localitatea, extrasul se obține
        pe două căi:
      </p>
      <ul>
        <li>
          <strong>Gratuit, prin MyTerra</strong> — platforma ANCPI eliberează extrasul de informare
          fără taxă din iunie 2025, cu condiția să ai cont cu identitatea verificată. Dacă nu ai
          ROeID sau semnătură electronică, verificarea înseamnă drum la ghișeu. Am scris{' '}
          <Link href="/extras-carte-funciara-gratuit/">un ghid separat despre varianta gratuită</Link>{' '}
          și limitele ei.
        </li>
        <li>
          <strong>Plătit, fără cont</strong> — prin{' '}
          <Link href={serviceUrl('extras-carte-funciara')}>serviciul nostru de extras de carte funciară</Link>{' '}
          documentul se eliberează automat în câteva minute, la orice oră, 89 lei cu taxe incluse.
          Același extras oficial ANCPI, cu semnătură electronică.
        </li>
      </ul>

      <h2>Metoda 2: ai doar adresa</h2>
      <p>
        Aici se împiedică majoritatea. Sistemul ANCPI nu caută după „strada X nr. 5” — caută după
        numărul de carte funciară. Așa că procesul are doi pași: întâi{' '}
        <Link href={serviceUrl('identificare-imobil')}>identificarea imobilului după adresă</Link>,
        care îți dă numărul de CF și numărul cadastral, apoi extrasul pe numărul găsit.
      </p>
      <p>
        Un caz aparte sunt apartamentele: blocul are o carte funciară colectivă, iar fiecare
        apartament are cartea lui individuală. Proprietarul apartamentului apare în CF-ul
        individual — detalii în{' '}
        <Link href="/totul-despre-cartea-funciara-colectiva/">ghidul despre cartea funciară colectivă</Link>.
      </p>

      <h2>Ce NU îți arată proprietarul (dar pare că ar trebui)</h2>
      <ul>
        <li>
          <strong>Geoportalul ANCPI</strong> — harta publică de pe geoportal.ancpi.ro arată
          conturul parcelelor și, unde există, numărul cadastral. Atât. Numele proprietarului nu
          apare nicăieri pe geoportal, oricât ai da zoom. E util doar ca prim pas, ca să vezi dacă
          imobilul e cadastrat.
        </li>
        <li>
          <strong>Primăria și taxele locale</strong> — direcția de taxe știe cine plătește
          impozitul, dar nu îți dă informația: datele fiscale sunt protejate și nu țin loc de
          evidență de proprietate. Cine plătește impozitul nu e neapărat proprietarul.
        </li>
        <li>
          <strong>Asociația de proprietari sau vecinii</strong> — afli un nume, poate chiar cel
          corect. Dar pentru orice pas juridic (ofertă de cumpărare, notificare, proces) îți
          trebuie numele din cartea funciară, nu cel din auzite.
        </li>
      </ul>

      <h2>E legal? Da — și e chiar scopul cărții funciare</h2>
      <p>
        Codul civil, articolul 883: orice persoană poate cerceta cartea funciară,{' '}
        <em>fără a fi ținută să justifice vreun interes</em>. Cartea funciară e registru public
        prin Legea 7/1996 tocmai ca să poți verifica cine deține un imobil înainte să semnezi ceva.
        Nu e o portiță, e regula. GDPR nu schimbă asta: publicitatea imobiliară e o obligație
        legală, iar extrasul de informare rămâne accesibil oricui.
      </p>
      <p>
        Singura nuanță: extrasul de informare e pentru verificare. La notar, pentru semnarea unei
        tranzacții, se folosește extrasul de autentificare, pe care îl cere notarul.
      </p>

      <h2>Comparația pe scurt</h2>
      <ul>
        <li><strong>Extras CF de informare:</strong> arată proprietarul — da, cu nume complet · oficial · gratuit cu cont MyTerra sau 89 lei fără cont, în câteva minute.</li>
        <li><strong>Identificare imobil după adresă:</strong> nu arată proprietarul direct, îți dă numărul de CF · pasul obligatoriu când ai doar adresa.</li>
        <li><strong>Geoportal ANCPI:</strong> gratuit, fără cont · doar contur și număr cadastral, fără nume.</li>
        <li><strong>Identificare după numele proprietarului:</strong> căutarea inversă — afli ce imobile sunt înscrise pe o persoană · 163,64 lei + TVA, prin <Link href="/comanda/identificare-imobile-proprietar/">același serviciu de identificare</Link>.</li>
        <li><strong>Primărie / taxe locale:</strong> nu eliberează date despre proprietar.</li>
        <li><strong>Registrul agricol:</strong> doar pentru terenuri neînscrise în CF, acces limitat, la primărie.</li>
      </ul>

      <h2>Dacă imobilul nu are carte funciară</h2>
      <p>
        Se întâmplă încă des la terenuri agricole și în sate unde cadastrul sistematic nu s-a
        finalizat. Fără înscriere în cartea funciară nu există o evidență centralizată a
        proprietarului — rămân registrul agricol de la primărie, actele vechi (titluri de
        proprietate, certificate de moștenitor) și memoria locului. Merită totuși verificat întâi
        dacă există CF: programul național de cadastru a înscris multe zone în ultimii ani, iar o{' '}
        <Link href={serviceUrl('identificare-imobil')}>identificare după adresă</Link> îți spune
        exact asta.
      </p>

      <h2>Nota momentului: căderea ANCPI din iulie 2026</h2>
      <p>
        În perioada în care <Link href="/ancpi-nu-functioneaza/">sistemele ANCPI sunt picate</Link>{' '}
        (atac cibernetic, revenire estimată 20 iulie), nimeni nu poate elibera extrase — nici
        ghișeul, nici MyTerra, nici intermediarii. Comenzile plasate la noi intră în coadă și se
        eliberează automat imediat ce sistemele revin, cu documentul trimis pe email.
      </p>
    </ArticleLayout>
  );
}
