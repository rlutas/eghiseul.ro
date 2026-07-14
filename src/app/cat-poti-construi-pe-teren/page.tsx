import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cat-poti-construi-pe-teren';
const TITLE = 'Cât Poți Construi pe Terenul Tău? POT și CUT explicate simplu';
const DESCRIPTION =
  'Câți metri pătrați poate ocupa casa pe teren? Formula: teren × POT / 100. Afli POT-ul din certificatul de urbanism. ' +
  'Ghid cu exemple concrete, valori legale pe zone (HG 525/1996) și greșelile frecvente de calcul.';
const DATE_PUBLISHED = '2026-07-14';
const DATE_MODIFIED = '2026-07-14';

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
      publishedLabel="14 iulie 2026"
      updatedLabel="14 iulie 2026"
      imageAlt="Teren delimitat cu țăruși și sfoară pentru amprenta viitoarei case, cu plan de situație și ruletă în prim-plan — calculul POT înainte de construire"
      relatedServices={[
        {
          slug: 'certificat-urbanism-informare',
          label: 'Certificat de urbanism pentru informare',
          desc: 'Afli POT, CUT, regim de înălțime și interdicții — de la primărie, prin noi.',
        },
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Suprafața exactă a terenului, automat, în câteva minute.',
        },
        {
          href: '/calculator/cat-pot-construi/',
          label: 'Calculator: cât pot construi',
          desc: 'Teren + POT → suprafața maximă construibilă, pe loc.',
        },
      ]}
      faqs={[
        {
          q: 'Cât pot construi pe un teren de 500 mp?',
          a: 'Depinde de POT-ul zonei. Cu POT 35% (uzual în zone rezidențiale cu case), construcția poate ocupa maximum 175 mp la sol. Cu CUT 0,9 poți construi în total 450 mp, împărțiți pe niveluri. Valorile exacte pentru parcela ta sunt în certificatul de urbanism.',
        },
        {
          q: 'Unde găsesc POT-ul și CUT-ul terenului meu?',
          a: 'În certificatul de urbanism pentru informare, eliberat de primăria localității unde se află terenul. Orientativ apar și în PUG/PUZ, dar certificatul e documentul pe care îl iei în calcul la proiectare.',
        },
        {
          q: 'Ce se întâmplă dacă depășesc POT-ul?',
          a: 'Nu primești autorizație de construire. Dacă ai construit deja peste POT fără autorizație, construcția nu poate fi intabulată și riști amendă și obligația de desființare (Legea 50/1991).',
        },
        {
          q: 'Certificatul de urbanism îmi dă dreptul să construiesc?',
          a: 'Nu. Certificatul de urbanism pentru informare doar îți spune ce se poate construi (POT, CUT, regim de înălțime, restricții). Pentru a construi ai nevoie de autorizația de construire, care se obține ulterior, pe baza unui proiect.',
        },
        {
          q: 'Balconul și terasa intră în POT?',
          a: 'Balcoanele cu cota sub 3 m față de sol și logiile închise intră în suprafața construită. Terasele deschise și neacoperite, subsolurile cu înălțime liberă sub 1,80 m, aleile și scările exterioare NU intră.',
        },
        {
          q: 'Pot cere un POT mai mare decât cel din zonă?',
          a: 'Doar printr-un PUZ (plan urbanistic zonal) aprobat de consiliul local — procedură lungă și cu rezultat incert. Pentru o casă obișnuită, practic lucrezi cu POT-ul existent al zonei.',
        },
      ]}
    >
      <h2>Răspunsul scurt</h2>
      <p>
        <strong>Suprafața maximă pe care o poate ocupa construcția la sol = suprafața terenului × POT /
        100.</strong> POT (procentul de ocupare a terenului) e scris în certificatul de urbanism al
        parcelei. Pe un teren de 500 mp cu POT 35%, casa poate ocupa cel mult 175 mp la sol.
      </p>
      <p>
        Dacă vrei calculul pe cifrele tale, l-am făcut interactiv:{' '}
        <Link href="/calculator/cat-pot-construi/">calculatorul „Cât pot construi”</Link> — introduci
        terenul și POT-ul, primești amprenta maximă și suprafața totală construibilă.
      </p>

      <h2>Cei doi indicatori care decid cât construiești: POT și CUT</h2>
      <p>
        Orice parcelă din România are două limite de construire, stabilite prin planurile urbanistice și
        definite în Legea 350/2001 (anexa 2):
      </p>
      <ul>
        <li>
          <strong>POT — procentul de ocupare a terenului.</strong> Raportul dintre suprafața construită la
          sol și suprafața parcelei, × 100. POT 35% = clădirea acoperă cel mult 35% din teren. Restul
          rămâne curte, grădină, alei, parcare.
        </li>
        <li>
          <strong>CUT — coeficientul de utilizare a terenului.</strong> Raportul dintre suprafața
          construită desfășurată (suma tuturor etajelor supraterane) și suprafața parcelei. CUT 0,9 pe 500
          mp = maximum 450 mp construiți în total.
        </li>
      </ul>
      <p>
        POT-ul limitează cât de întinsă e clădirea, CUT-ul cât de mare e în total. Împreună cu regimul de
        înălțime din PUG/PUZ (P+1, P+2 etc.), ele descriu complet ce ai voie să ridici pe teren.
      </p>

      <h2>Un exemplu pe cifre reale</h2>
      <p>Să zicem că ai găsit un teren de 600 mp într-o zonă rezidențială cu POT 35% și CUT 0,9:</p>
      <ul>
        <li>Amprenta maximă la sol: 600 × 35 / 100 = <strong>210 mp</strong>.</li>
        <li>Total construibil (toate etajele): 600 × 0,9 = <strong>540 mp</strong>.</li>
        <li>
          Cu amprentă plină de 210 mp, poți face parter + etaj (420 mp) și o mansardă parțială de 120 mp —
          exact la limita CUT.
        </li>
        <li>Teren rămas liber: 390 mp.</li>
      </ul>
      <p>
        Același teren, într-o zonă cu POT 20% (blocuri, zone protejate), permite doar 120 mp la sol.
        Diferența dintre 35% și 20% înseamnă, la o casă, o cameră de zi și două dormitoare. De-asta
        valorile exacte contează înainte să cumperi, nu după.
      </p>

      <h2>Valorile legale orientative, pe zone</h2>
      <p>
        Regulamentul General de Urbanism (HG 525/1996, anexa 2) fixează plafoane generale de POT.
        Primăriile le pot modifica prin PUG/PUZ, dar orientarea e asta:
      </p>
      <table>
        <thead>
          <tr>
            <th>Tipul zonei</th>
            <th>POT maxim</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Exclusiv rezidențială, locuințe P–P+2</td>
            <td>35%</td>
          </tr>
          <tr>
            <td>Rezidențială, clădiri peste 3 niveluri</td>
            <td>20%</td>
          </tr>
          <tr>
            <td>Predominant rezidențială (locuințe + dotări)</td>
            <td>40%</td>
          </tr>
          <tr>
            <td>Zonă centrală</td>
            <td>80%</td>
          </tr>
        </tbody>
      </table>
      <p>
        Practic: la casă în zonă obișnuită de locuințe, calculează din start cu 35%. Dacă certificatul de
        urbanism îți dă mai mult, e bonus.
      </p>

      <h2>Ce intră în suprafața construită (și ce scapă)</h2>
      <p>
        Aici pierd oamenii metri pătrați degeaba sau, invers, își fac planuri prea mari. Regula de calcul:
      </p>
      <ul>
        <li>
          <strong>Se numără:</strong> proiecția la sol a clădirii, balcoanele aflate la mai puțin de 3 m de
          sol, logiile închise.
        </li>
        <li>
          <strong>Nu se numără:</strong> terasele deschise, subsolurile cu înălțimea liberă sub 1,80 m,
          garajul complet îngropat, aleile de acces, scările exterioare, trotuarele de protecție.
        </li>
      </ul>
      <p>
        Exemplu practic: dacă amprenta permisă e 175 mp și casa proiectată are 172 mp + o terasă acoperită
        de 15 mp, ai depășit. Aceeași terasă, lăsată neacoperită, nu se numără. Astfel de detalii se
        rezolvă în faza de proiect, dar e bine să le știi când îți faci socotelile.
      </p>

      <h2>De unde iei cifrele pentru calcul</h2>
      <p>Ai nevoie de două date, ambele din documente oficiale:</p>
      <ol>
        <li>
          <strong>Suprafața terenului</strong> — din actul de proprietate sau, mai sigur, din{' '}
          <Link href="/servicii/extras-de-carte-funciara/">extrasul de carte funciară</Link> (acolo e
          suprafața din măsurătorile cadastrale, cea care contează la autorizare). La terenuri cu acte
          vechi din Ardeal, suprafața poate fi în jugăre sau stânjeni —{' '}
          <Link href="/calculator/jugar-stanjen-in-mp/">convertorul nostru</Link> le transformă în metri
          pătrați.
        </li>
        <li>
          <strong>POT-ul și CUT-ul parcelei</strong> — din{' '}
          <Link href="/servicii/certificat-urbanism-informare/">
            certificatul de urbanism pentru informare
          </Link>
          , eliberat de primărie. Certificatul îți dă și regimul de înălțime, retragerile față de limitele
          parcelei, interdicțiile și servituțile — tot ce poate schimba planul de construire.
        </li>
      </ol>
      <p>
        Valorile vin, la origine, din planurile urbanistice — și merită să știi diferența dintre ele.{' '}
        <strong>PUG-ul</strong> (plan urbanistic general) e făcut de primărie și acoperă toată localitatea:
        el stabilește regulile implicite pentru fiecare zonă. <strong>PUZ-ul</strong> (plan urbanistic
        zonal) e făcut de regulă de un investitor, pentru un teren anume — de exemplu 1-2 hectare pe care
        vrea să construiască un ansamblu de case sau blocuri — și poate schimba local regulile PUG-ului:
        alt POT, alt CUT, alt regim de înălțime. Dacă terenul tău a fost prins într-un PUZ aprobat,
        valorile din PUZ sunt cele care se aplică, iar certificatul de urbanism le va reflecta.
      </p>
      <p>
        Cumperi teren și vânzătorul „știe sigur” că e construibil cu POT 40%? Verifică. Certificatul de
        urbanism costă puțin față de o parcelă pe care descoperi după cumpărare că e zonă protejată cu POT
        20% sau interdicție temporară de construire. Se poate solicita de oricine, pentru orice teren — nu
        trebuie să fii proprietar.
      </p>

      <h2>Greșelile frecvente</h2>
      <ul>
        <li>
          <strong>Calculul pe suprafața din actul vechi</strong>, nu pe cea din cadastru. La autorizare
          contează măsurătorile — dacă diferă, lămurește întâi situația la OCPI.
        </li>
        <li>
          <strong>Confuzia POT cu CUT.</strong> POT 35% nu înseamnă că poți construi doar 35% din teren ca
          suprafață totală — etajele se adună separat, sub plafonul CUT.
        </li>
        <li>
          <strong>Valori „din auzite”.</strong> POT-ul diferă între localități și între zonele aceleiași
          localități. Vecinul de peste drum poate fi în altă unitate teritorială de referință, cu alt POT.
        </li>
        <li>
          <strong>Ignorarea retragerilor.</strong> Chiar și sub POT, casa trebuie retrasă față de limitele
          parcelei (aliniament, vecinătăți). Pe parcele înguste, retragerile pot limita amprenta mai tare
          decât POT-ul.
        </li>
      </ul>

      <h2>Pașii concreți, în ordine</h2>
      <ol>
        <li>
          Ia suprafața exactă a terenului (<Link href="/servicii/extras-de-carte-funciara/">extras CF</Link>{' '}
          — se eliberează online, în câteva minute).
        </li>
        <li>
          Cere <Link href="/servicii/certificat-urbanism-informare/">certificatul de urbanism pentru
          informare</Link> — afli POT, CUT, regim de înălțime, restricții.
        </li>
        <li>
          Bagă cifrele în <Link href="/calculator/cat-pot-construi/">calculator</Link> — vezi instant
          amprenta maximă și totalul construibil.
        </li>
        <li>Cu limitele clare, mergi la arhitect pentru proiect și apoi la autorizația de construire.</li>
      </ol>
      <p>
        Ordinea asta te scutește de scenariul clasic: proiect plătit, apoi refăcut, pentru că s-a proiectat
        pe presupuneri în loc de valorile reale ale parcelei.
      </p>
    </ArticleLayout>
  );
}
