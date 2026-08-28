import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania';
const TITLE = 'Anii lucrați în străinătate se pun la pensie în România?';
const DESCRIPTION =
  'Da, anii lucrați în străinătate (UE/SEE/Elveția) se iau în calcul la pensia din România. ' +
  'Vezi procedura de solicitare, totalizarea perioadelor de asigurare, calculul pro rata temporis și plata pensiei.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-08-28';

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
      category="Pensii"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="28 august 2026"
      relatedServices={[
        {
          href: '/calculator/varsta-pensionare/',
          label: 'Calculator vârstă de pensionare',
          desc: 'Află când poți ieși la pensie după legea nouă.',
        },
        {
          href: '/tabel-varsta-pensionare-anticipata-femei/',
          label: 'Tabel vârstă de pensionare anticipată pentru femei',
          desc: 'Vârsta de pensionare anticipată în funcție de stagiul de cotizare.',
        },
      ]}
      faqs={[
        {
          q: 'Anii lucrați în străinătate se pun la pensie în România?',
          a: 'Da. Pentru statele UE/SEE și Elveția, Regulamentul (CE) 883/2004 obligă la totalizarea perioadelor de asigurare: anii lucrați acolo se adună cu cei din România la stabilirea dreptului de pensie. Pentru alte state (Canada, Turcia, Coreea de Sud, Israel ș.a.) funcționează acordurile bilaterale de securitate socială.',
        },
        {
          q: 'Primesc o singură pensie sau mai multe?',
          a: 'Câte una din fiecare stat în care ai cotizat suficient. Fiecare stat plătește partea lui, calculată pro rata temporis, adică proporțional cu anii lucrați pe teritoriul lui. România nu îți plătește pensia pentru anii munciți în Germania; ți-o plătește Germania, iar România pe cei de acasă.',
        },
        {
          q: 'Unde depun cererea de pensionare dacă locuiesc în alt stat membru?',
          a: 'La instituția de pensii din statul unde locuiești. Ea devine „instituție de instrumentare” și trimite dosarul, prin sistemul electronic EESSI, către toate statele în care ai cotizat, inclusiv României. Nu trebuie să vii în țară pentru asta.',
        },
        {
          q: 'Ce documente sunt necesare pentru recunoașterea anilor lucrați în străinătate?',
          a: 'Pentru anii din România: carnetul de muncă și adeverințele de vechime. Pentru anii din străinătate: dovezile de asigurare de acolo (numărul de asigurat, fluturași, adeverințe de la angajatori sau de la instituția de pensii a statului respectiv). Perioadele se confirmă între instituții prin formulare standardizate, dar dosarul merge mult mai repede dacă vii cu actele tale.',
        },
        {
          q: 'Unde se plătește pensia?',
          a: 'Unde vrei tu: în cont în România sau în contul din statul de domiciliu. Pensia din România se poate exporta în orice stat UE/SEE și în statele cu acord bilateral; comunici casei de pensii datele contului (IBAN) și moneda urmează regulile băncii tale.',
        },
      ]}
    >
      <p>
        Răspunsul scurt: da. Dacă ai lucrat legal în alt stat UE, în SEE sau în Elveția, anii ăia
        se adună cu cei din România la stabilirea dreptului de pensie. Nu e o favoare a casei de
        pensii, e obligație din Regulamentul (CE) nr. 883/2004 privind coordonarea sistemelor de
        securitate socială. Pentru state din afara UE, România are acorduri bilaterale cu efect
        similar, printre care Canada, Turcia, Coreea de Sud, Israel, Macedonia de Nord și Serbia.
      </p>
      <p>
        Ce nu se întâmplă, și aici se nasc cele mai multe confuzii: România nu îți plătește pensie
        pentru anii lucrați afară. Fiecare stat plătește partea lui. Din Italia primești pensia
        italiană pentru anii din Italia, din România pe cea pentru anii de acasă. Anii din
        străinătate contează în România la un singur lucru, dar unul decisiv: îndeplinirea
        condițiilor de stagiu.
      </p>

      <h2>Totalizarea: la ce ajută concret anii din străinătate</h2>
      <p>
        Legea pensiilor (Legea 360/2023) cere un stagiu minim de cotizare de 15 ani ca să primești
        pensie din sistemul românesc. Să zicem că ai 12 ani munciți în România și 20 în Spania. Doar
        cu cei 12 ani românești n-ai avea drept de pensie aici. Prin totalizare, România numără
        12 + 20 = 32 de ani la verificarea condiției de stagiu, deci dreptul există; plata rămâne
        însă proporțională, adică România îți plătește pensie doar pentru cei 12 ani ai ei.
      </p>
      <p>
        Același mecanism funcționează și la pensia anticipată: stagiul realizat în alte state
        membre intră în calculul stagiului total care îți dă dreptul să te retragi mai devreme.
        Vârsta standard rămâne cea din legea română (65 de ani, cu creșterea etapizată pentru
        femei), iar condițiile de anticipată le poți verifica în{' '}
        <a href="/calculator/varsta-pensionare/">calculatorul nostru de vârstă de pensionare</a>.
      </p>

      <h2>Cum se calculează: pro rata temporis</h2>
      <p>
        Fiecare stat face două calcule. Întâi calculează pensia „națională”, doar după regulile și
        anii lui. Apoi calculează pensia „teoretică”, ca și cum toți anii tăi, de peste tot, ar fi
        fost lucrați la el, și din ea îți dă partea proporțională cu anii lucrați efectiv acolo.
        Primești varianta mai avantajoasă. Asta e „pro rata temporis” din deciziile de pensie.
      </p>
      <p>
        Practic: la 10 ani în România și 30 în Germania, România îți datorează aproximativ 10/40
        din pensia teoretică românească, Germania 30/40 din cea germană, fiecare după propria
        formulă de calcul. De aici și diferențele mari între cele două sume.
      </p>

      <h2>Unde depui cererea</h2>
      <p>
        Regula e simplă: depui o singură cerere, la instituția de pensii din statul unde locuiești.
        Dacă locuiești în România, la casa teritorială de pensii; ea contactează instituțiile din
        celelalte state prin sistemul electronic EESSI. Dacă locuiești în Germania, depui la
        Deutsche Rentenversicherung și ea anunță România. Nu depui câte o cerere în fiecare țară și
        nu trebuie să te deplasezi.
      </p>
      <p>
        Pentru statele cu acorduri bilaterale (în afara UE), schimbul se face prin formulare
        convenite între instituții, pe hârtie sau electronic, și durează de regulă mai mult decât
        prin EESSI. Termenele reale de soluționare a unui dosar internațional se măsoară în luni,
        uneori peste un an când un stat răspunde greu la confirmarea perioadelor.
      </p>

      <h2>Actele care fac diferența</h2>
      <p>
        Pentru anii românești: carnetul de muncă, adeverințele de vechime și, pentru perioada de
        după 2001, datele sunt deja în sistemul caselor de pensii. Pentru anii din străinătate,
        strânge de pe acum numărul de asigurat din fiecare țară, adeverințele de la angajatori și
        orice extras de cont de asigurare emis de instituția de pensii de acolo. Instituțiile își
        confirmă perioadele între ele, dar un dosar cu dovezi complete se soluționează vizibil mai
        repede decât unul în care România așteaptă răspuns de la trei state.
      </p>

      <h2>Plata pensiei în străinătate</h2>
      <p>
        Pensia românească se exportă: o poți primi în contul tău din statul de domiciliu, în orice
        țară UE/SEE și în statele cu acord bilateral. Comunici casei de pensii IBAN-ul, iar cursul
        și comisioanele urmează regulile băncii. Reversul e la fel de valabil: pensiile din alte
        state se pot plăti în România. Mulți pensionari întorși acasă primesc lunar două sau trei
        pensii, fiecare de la statul unde au cotizat.
      </p>
    </ArticleLayout>
  );
}
