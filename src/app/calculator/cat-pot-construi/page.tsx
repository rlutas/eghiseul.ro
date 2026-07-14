import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { CalculatorLayout } from '@/components/calculators/calculator-layout';
import { PotCutCalculator } from '@/components/calculators/pot-cut-calculator';

const SLUG = 'cat-pot-construi';
const TITLE = 'Cât Pot Construi pe Teren? Calculator POT și CUT';
const DESCRIPTION =
  'Introdu suprafața terenului și POT-ul din certificatul de urbanism → afli câți metri pătrați poate ocupa construcția la sol și cât poți construi în total (CUT). Gratuit.';

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
      heading="Cât pot construi pe teren?"
      description="Vrei să construiești și nu știi cât teren poți ocupa cu noua construcție? Introdu suprafața din acte și procentul de ocupare (POT) din certificatul de urbanism — îți spunem pe loc câți metri pătrați poate ocupa construcția ta."
      tldr="Suprafața maximă construibilă la sol = suprafața terenului × POT / 100. Pe un teren de 500 mp cu POT 35%, construcția poate ocupa cel mult 175 mp la sol. Cât poți construi în total, pe toate etajele, îți spune CUT: teren × CUT = suprafață desfășurată maximă. Ambele valori sunt scrise în certificatul de urbanism."
      widget={<PotCutCalculator />}
      faqs={[
        {
          q: 'Ce este POT (procentul de ocupare a terenului)?',
          a: 'POT este raportul dintre suprafața construită la sol și suprafața parcelei, înmulțit cu 100 (Legea 350/2001, anexa 2). Un POT de 35% înseamnă că amprenta clădirii poate acoperi cel mult 35% din teren — restul rămâne curte, grădină, alei.',
        },
        {
          q: 'Ce este CUT (coeficientul de utilizare a terenului)?',
          a: 'CUT este raportul dintre suprafața construită desfășurată (suma tuturor etajelor supraterane) și suprafața parcelei. Un CUT de 0,9 pe un teren de 500 mp îți permite maximum 450 mp construiți în total, indiferent cum îi împarți pe niveluri.',
        },
        {
          q: 'De unde aflu POT-ul și CUT-ul terenului meu?',
          a: 'Din certificatul de urbanism pentru informare, eliberat de primăria localității — acolo sunt scrise valorile maxime exacte pentru parcela ta. Orientativ, le poți căuta și în PUG sau PUZ: PUG-ul (plan urbanistic general) e făcut de primărie și acoperă toată localitatea; PUZ-ul (plan urbanistic zonal) e făcut de regulă de un investitor pentru o zonă anume — de exemplu 1-2 hectare pe care vrea să construiască case sau blocuri — și poate schimba regulile PUG-ului acolo. Certificatul rămâne documentul care contează.',
        },
        {
          q: 'Care este POT-ul maxim în zonele rezidențiale?',
          a: 'Regulamentul General de Urbanism (HG 525/1996, anexa 2) dă limite orientative: 35% în zonele exclusiv rezidențiale cu locuințe P, P+1, P+2; 20% la locuințe cu peste 3 niveluri; 40% în zonele predominant rezidențiale. PUG-ul local poate stabili valori diferite.',
        },
        {
          q: 'Ce intră în suprafața construită la calculul POT?',
          a: 'Amprenta la sol a clădirii, balcoanele cu cota sub 3 m de la sol și logiile închise. NU intră: terasele deschise, subsolurile cu înălțime liberă sub 1,80 m, aleile de acces, scările exterioare și trotuarele de protecție.',
        },
        {
          q: 'Pot construi 300 mp pe un teren de 500 mp?',
          a: 'La sol, doar dacă POT-ul zonei e de cel puțin 60% — rar în zone rezidențiale obișnuite (uzual 35-40%). În total însă da: cu POT 35% și CUT 1,2 poți avea amprentă de 175 mp și 600 mp desfășurați pe mai multe niveluri.',
        },
        {
          q: 'Diferă POT-ul de la o localitate la alta?',
          a: 'Da. HG 525/1996 dă plafoane generale, dar fiecare primărie stabilește prin PUG/PUZ valorile exacte pe zone. Același tip de teren poate avea POT 35% într-o comună și 50% în alta — de-aia calculul serios pleacă de la certificatul de urbanism, nu de la valori „din auzite”.',
        },
        {
          q: 'Am nevoie de certificat de urbanism ca să cumpăr un teren?',
          a: 'Nu e obligatoriu la cumpărare, dar e cea mai ieftină asigurare: afli ÎNAINTE de a plăti dacă poți construi ce vrei — POT, CUT, regim de înălțime, interdicții, servituți. Certificatul pentru informare nu dă dreptul de a construi, dar îți spune exact ce se poate.',
        },
        {
          q: 'Suprafața din acte diferă de cea măsurată. Pe care o folosesc?',
          a: 'POT-ul se aplică la suprafața parcelei din documentația cadastrală (cea din extrasul de carte funciară). Dacă actele vechi și măsurătorile diferă, situația se lămurește la OCPI înainte de autorizare — altfel riști să proiectezi pe o suprafață greșită.',
        },
        {
          q: 'Terenul e măsurat în ari sau jugăre. Cum calculez?',
          a: 'Un ar = 100 mp, deci 5 ari = 500 mp — calculatorul face conversia automat. Pentru unități vechi din acte (jugăre, stânjeni, pogoane) folosește întâi convertorul nostru de unități de teren, apoi introdu rezultatul în mp aici.',
        },
      ]}
    >
      <h2>Cum calculezi cât poți construi pe teren</h2>
      <p>
        Ai nevoie de două numere: <strong>suprafața terenului</strong> (o găsești în actul de proprietate
        sau în <Link href="/servicii/extras-de-carte-funciara/">extrasul de carte funciară</Link>) și{' '}
        <strong>POT-ul maxim</strong> al zonei (scris în certificatul de urbanism). Formula e simplă:
      </p>
      <p>
        <strong>Suprafață maximă construibilă la sol = Teren (mp) × POT / 100</strong>
      </p>
      <p>
        Exemplu concret: teren de 500 mp, POT 35% → construcția poate ocupa cel mult{' '}
        <strong>175 mp la sol</strong>. Restul de 325 mp rămâne obligatoriu neconstruit: curte, grădină,
        parcare, alei.
      </p>
      <p>
        Al doilea plafon e <strong>CUT</strong> — cât poți construi în total, adunând toate etajele.
        Teren × CUT = suprafața desfășurată maximă. Cu CUT 0,9, pe același teren de 500 mp poți ridica
        maximum 450 mp în total: de exemplu parter de 175 mp + etaj de 175 mp + mansardă de 100 mp.
      </p>

      <h2>Ce înseamnă POT și CUT, pe scurt</h2>
      <p>
        Amândoi indicatorii sunt definiți în <strong>Legea 350/2001</strong> privind amenajarea
        teritoriului și urbanismul (anexa 2):
      </p>
      <ul>
        <li>
          <strong>POT (procent de ocupare a terenului)</strong> = suprafața construită la sol ÷ suprafața
          parcelei × 100. Limitează amprenta clădirii.
        </li>
        <li>
          <strong>CUT (coeficient de utilizare a terenului)</strong> = suprafața construită desfășurată ÷
          suprafața parcelei. Limitează volumul total construit, deci indirect și înălțimea.
        </li>
      </ul>
      <p>
        Cele două lucrează împreună: POT-ul îți spune cât de „lată” poate fi casa, CUT-ul cât de „mare”
        în total. Regimul de înălțime propriu-zis (P+1, P+2 etc.) e stabilit separat în PUG/PUZ.
      </p>

      <h2>Valori orientative POT pe tipuri de zone</h2>
      <p>
        Regulamentul General de Urbanism (<strong>HG 525/1996</strong>, anexa 2) stabilește plafoane
        generale — primăria le poate ajusta prin PUG/PUZ:
      </p>
      <table>
        <thead>
          <tr>
            <th>Tipul zonei</th>
            <th>POT maxim orientativ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Zonă exclusiv rezidențială — locuințe P, P+1, P+2</td>
            <td>35%</td>
          </tr>
          <tr>
            <td>Zonă rezidențială — clădiri cu peste 3 niveluri</td>
            <td>20%</td>
          </tr>
          <tr>
            <td>Zonă predominant rezidențială (locuințe + dotări)</td>
            <td>40%</td>
          </tr>
          <tr>
            <td>Zonă centrală</td>
            <td>80%</td>
          </tr>
        </tbody>
      </table>
      <p>
        Atenție: astea sunt plafoane generale, nu valorile parcelei tale. Într-o zonă protejată POT-ul
        poate coborî la 20%; într-o zonă comercială poate urca peste 80%. Valoarea care contează juridic
        e cea din certificatul de urbanism.
      </p>
      <p>
        Ce înseamnă PUG și PUZ, ca să nu le confunzi: <strong>PUG-ul</strong> (plan urbanistic general) e
        făcut de primărie și acoperă întreaga localitate — el dă regulile implicite pentru fiecare zonă.{' '}
        <strong>PUZ-ul</strong> (plan urbanistic zonal) e făcut de regulă de un investitor pentru un teren
        anume, de exemplu 1-2 hectare pe care vrea să ridice case sau blocuri, și poate modifica local
        regulile din PUG (alt POT, alt regim de înălțime). Dacă parcela ta e într-o zonă cu PUZ aprobat,
        valorile PUZ-ului sunt cele valabile.
      </p>

      <h2>Ce intră și ce nu intră în suprafața construită</h2>
      <p>Aici se fac cele mai multe greșeli de calcul. La amprenta pentru POT:</p>
      <ul>
        <li>
          <strong>Intră:</strong> proiecția la sol a clădirii, balcoanele cu cota sub 3 m față de sol,
          logiile închise.
        </li>
        <li>
          <strong>Nu intră:</strong> terasele deschise și neacoperite, subsolurile cu înălțimea liberă sub
          1,80 m, garajele complet îngropate, aleile, scările exterioare, trotuarele de protecție.
        </li>
      </ul>
      <p>
        La CUT nu se numără podurile neamenajabile și spațiile tehnice. Dacă proiectezi la limită, aceste
        excepții pot face diferența între o autorizație aprobată și una respinsă.
      </p>

      <h2>Nu știi POT-ul terenului tău?</h2>
      <p>
        POT-ul și CUT-ul exacte pentru parcela ta sunt scrise în{' '}
        <strong>certificatul de urbanism pentru informare</strong>, eliberat de primărie. Îl poți{' '}
        <Link href="/servicii/certificat-urbanism-informare/">solicita online prin eGhișeul</Link> — noi
        depunem cererea la primăria localității și primești documentul cu regimul tehnic, juridic și
        economic complet al terenului. Iar dacă nu ai la îndemână suprafața exactă din acte,{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extrasul de carte funciară</Link> se eliberează
        automat, în câteva minute.
      </p>
      <p>
        Terenul e din acte vechi, măsurat în jugăre sau stânjeni? Folosește întâi{' '}
        <Link href="/calculator/jugar-stanjen-in-mp/">convertorul de unități vechi de teren</Link> și
        introdu aici rezultatul în metri pătrați.
      </p>
      <p>
        Vrei tot contextul — exemple pe cifre, retrageri, ce faci pas cu pas înainte de proiect? L-am pus
        în ghidul <Link href="/cat-poti-construi-pe-teren/">Cât poți construi pe terenul tău: POT și CUT
        explicate simplu</Link>.
      </p>
    </CalculatorLayout>
  );
}
