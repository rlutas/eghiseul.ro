import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'anii-lucrati-in-strainatate-se-pun-la-pensie-in-romania';
const TITLE = 'Anii Lucrați în Străinătate se Pun la Pensie în România?';
const DESCRIPTION =
  'Da, anii lucrați în străinătate (UE/SEE/Elveția) se iau în calcul la pensia din România. ' +
  'Vezi procedura de solicitare, totalizarea perioadelor de asigurare, calculul pro rata temporis și plata pensiei.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-06-16';

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
      updatedLabel="16 iunie 2026"
      relatedServices={[
        {
          href: '/tabel-varsta-pensionare-anticipata-femei/',
          label: 'Tabel vârstă de pensionare anticipată — femei',
          desc: 'Vârsta de pensionare anticipată în funcție de stagiul de cotizare.',
        },
      ]}
      faqs={[
        {
          q: 'Anii lucrați în străinătate se pun la pensie în România?',
          a: 'Da. Anii lucrați în străinătate se iau în calcul pentru stabilirea dreptului la pensie în România. Prin acordurile bilaterale și regulamentele europene, perioadele de muncă din alte state sunt recunoscute și contabilizate.',
        },
        {
          q: 'Unde depun cererea de pensionare dacă locuiesc în alt stat membru?',
          a: 'Cererea de pensionare se depune la instituția de asigurări sociale de la locul de domiciliu. Aceasta coordonează procesul cu instituția competentă din România, astfel încât nu este nevoie să te deplasezi în România.',
        },
        {
          q: 'Cum se calculează pensia pentru perioadele lucrate în mai multe state?',
          a: 'Fiecare stat implicat calculează drepturile de pensie proporțional cu perioadele de asigurare realizate pe teritoriul său, aplicând principiul pro rata temporis. Se iau în considerare toate perioadele de asigurare realizate, prin totalizare.',
        },
        {
          q: 'Ce documente sunt necesare pentru recunoașterea anilor lucrați în străinătate?',
          a: 'Sunt necesare documente doveditoare ale perioadelor de activitate din România (carnet de muncă, adeverințe de vechime) și din străinătate, pentru a solicita revizuirea drepturilor de pensie.',
        },
        {
          q: 'Unde se plătește pensia?',
          a: 'Pensia poate fi primită fie în România, fie în statul de domiciliu al beneficiarului, în funcție de preferințele acestuia. Pentru transferul pensiei în străinătate este necesară comunicarea detaliilor contului bancar.',
        },
      ]}
    >
      <h2>Condiții de pensionare potrivit legislației în vigoare</h2>
      <p>
        Conform noii legi a pensiilor, se propune o vârstă standard de pensionare de 65 de ani, atât pentru
        femei, cât și pentru bărbați. Totuși, pensionarea anticipată poate fi solicitată cu cel mult cinci ani
        înainte de împlinirea vârstei standard de pensionare, cu condiția realizării unui stagiu de cotizare de
        cel puțin 9 ani peste stagiul complet de cotizare. De asemenea, pentru stabilirea dreptului la pensie,
        sunt luați în considerare și anii lucrați în străinătate.
      </p>

      <h2>Procedura de solicitare a pensiei pentru cetățenii români care au lucrat în străinătate</h2>
      <ol>
        <li>
          <strong>Depunerea cererii de pensionare:</strong> Cei care locuiesc pe teritoriul unui alt stat membru
          trebuie să depună cererea de pensionare la instituția de asigurări sociale de la locul de domiciliu.
          Instituția respectivă va coordona procesul cu instituția competentă din România, evitând astfel
          necesitatea deplasării în România.
        </li>
        <li>
          <strong>Prezentarea documentelor necesare:</strong> Printre actele necesare se numără documente
          doveditoare ale perioadelor de activitate din România (carnet de muncă, adeverințe de vechime) și din
          străinătate, pentru a solicita revizuirea drepturilor de pensie. Este crucială o bună colaborare între
          instituțiile de securitate socială ale statelor implicate.
        </li>
        <li>
          <strong>Comunicarea între instituții:</strong> Prin intermediul sistemului informatic EESSI pentru
          statele UE/SEE/Elveția sau prin formulare bilingve pentru statele cu acorduri bilaterale, se asigură
          schimbul de informații între instituțiile competente.
        </li>
        <li>
          <strong>Calculul drepturilor de pensie:</strong> Fiecare stat implicat calculează drepturile de pensie
          proporțional cu perioadele de asigurare realizate pe teritoriul său, aplicând principiul pro rata
          temporis.
        </li>
        <li>
          <strong>Emiterea deciziilor de pensie:</strong> Instituțiile competente emit decizii de pensie care
          sunt comunicate beneficiarilor.
        </li>
      </ol>

      <h2>Avantajele pensionării anticipate</h2>
      <ul>
        <li>
          <strong>Reducerea vârstei standard de pensionare:</strong> Permite retragerea din activitate cu până la
          cinci ani înainte de împlinirea vârstei standard de pensionare, oferind mai mult timp pentru activități
          personale și relaxare.
        </li>
        <li>
          <strong>Contabilizarea anilor lucrați în străinătate:</strong> Prin acordurile bilaterale și
          regulamentele europene, anii lucrați în străinătate se pun la pensie, asigurând astfel o pensie mai
          mare pentru cei care au lucrat și în alte țări.
        </li>
      </ul>

      <h2>Dezavantajele pensionării anticipate</h2>
      <ul>
        <li>
          <strong>Reducerea cuantumului pensiei:</strong> Pensia anticipată poate fi mai mică decât pensia pentru
          limită de vârstă, din cauza reducerii vârstei de pensionare și a eventualelor perioade de cotizare mai
          scurte, care afectează calculul pensiei în România.
        </li>
        <li>
          <strong>Necesitatea unui stagiu complet de cotizare:</strong> Pentru a beneficia de pensionare
          anticipată fără penalizare, este necesar să fi realizat un stagiu complet de cotizare de 35 de ani.
        </li>
      </ul>

      <h2>Coordonarea între statele membre și acordurile bilaterale</h2>
      <p>Principiile fundamentale stabilite de regulamentele europene și acordurile bilaterale includ:</p>
      <ul>
        <li>
          <strong>Egalitatea de tratament:</strong> Toți cetățenii statelor membre beneficiază de aceleași
          drepturi și obligații în ceea ce privește securitatea socială.
        </li>
        <li>
          <strong>Totalizarea perioadelor de asigurare:</strong> Se iau în considerare toate perioadele de
          asigurare realizate atât în propriul stat, cât și în celelalte state membre.
        </li>
        <li>
          <strong>Exportul prestațiilor:</strong> Pensia poate fi plătită în orice stat membru în care
          beneficiarul are domiciliul.
        </li>
        <li>
          <strong>Cooperarea administrativă:</strong> Instituțiile de securitate socială ale statelor membre
          colaborează pentru a asigura drepturile beneficiarilor.
        </li>
      </ul>

      <h2>Plata pensiei</h2>
      <p>
        Pensia poate fi primită fie în România, fie în statul de domiciliu al beneficiarului, în funcție de
        preferințele acestuia. Pentru transferul pensiei în străinătate, este necesară comunicarea detaliilor
        contului bancar.
      </p>

      <h2>Concluzii</h2>
      <p>
        Anii lucrați în străinătate se pun la pensie în România, asigurând astfel recunoașterea și contabilizarea
        perioadelor de muncă din străinătate. Acest proces, facilitat de acordurile bilaterale și regulamentele
        europene, implică o strânsă colaborare între instituțiile de securitate socială ale statelor implicate
        pentru a beneficia de pensia corectă. Este important ca beneficiarii să fie bine informați și să urmeze
        procedurile corecte pentru a-și asigura drepturile de pensie.
      </p>
    </ArticleLayout>
  );
}
