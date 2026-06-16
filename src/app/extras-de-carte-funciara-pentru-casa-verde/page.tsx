import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'extras-de-carte-funciara-pentru-casa-verde';
const TITLE = 'Extras de Carte Funciară pentru Casa Verde 2024 – Ghid Complet';
const DESCRIPTION =
  'De ce ai nevoie de un extras de carte funciară pentru programul Casa Verde, ce condiții ' +
  'trebuie să îndeplinească (nu mai vechi de 60 de zile), ce documente sunt necesare și cum îl ' +
  'obții online rapid pentru dosarul de finanțare.';
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
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="16 iunie 2026"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Document oficial ANCPI, livrat pe email în câteva minute.',
        },
        {
          slug: 'identificare-imobil',
          label: 'Identificare Imobil după Adresă',
          desc: 'Nu știi numărul cadastral? Îl aflăm noi după adresă.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este programul Casa Verde?',
          a: 'Programul Casa Verde este o inițiativă a guvernului român care oferă suport financiar proprietarilor de locuințe pentru instalarea sistemelor de energie regenerabilă, promovând eficiența energetică și soluțiile eco-friendly.',
        },
        {
          q: 'Ce înseamnă un Extras de Carte Funciară?',
          a: 'Extrasul de carte funciară este un document oficial care furnizează informații despre statutul juridic al unei proprietăți, inclusiv dreptul de proprietate, existența sarcinilor sau litigiilor.',
        },
        {
          q: 'Cine poate să aplice pentru Casa Verde?',
          a: 'Pot aplica rezidenții permanenți din România care dețin proprietatea imobilului unde urmează să fie instalate sistemele fotovoltaice și care nu au datorii restante la bugetele statului și locale.',
        },
        {
          q: 'Cât este valabil un Extras de Carte Funciară?',
          a: 'Pentru aplicarea la Programul Casa Verde, extrasul de carte funciară trebuie să fie actualizat și valabil, preferabil nu mai vechi de 60 de zile de la data aplicării.',
        },
        {
          q: 'Care sunt criteriile de eligibilitate pentru Programul Casa Verde?',
          a: 'Criteriile includ rezidența permanentă în România, proprietatea imobilului unde urmează a fi instalat sistemul fotovoltaic, acordul tuturor coproprietarilor pentru montarea sistemului, și lipsa datoriilor restante la bugetele statului și locale.',
        },
      ]}
    >
      <h2>Extrasul de carte funciară pentru Casa Verde 2024</h2>
      <p>
        Pentru a beneficia de avantajele <strong>Programului Casa Verde</strong>, un extras de carte funciară
        actualizat este indispensabil. Acest document asigură că proprietatea îndeplinește condițiile legale
        necesare pentru implementarea de sisteme fotovoltaice prin programul Casa Verde. Este important de menționat
        că cartea funciară <strong>nu trebuie să evidențieze litigii sau sarcini</strong> care ar putea împiedica
        instalarea panourilor fotovoltaice și să fie actualizată la data înscrierii.
      </p>

      <h2>Importanța cărții funciare în implementarea proiectelor Casa Verde</h2>
      <p>
        Pentru participanții la programul Casa Verde, obținerea extrasului de carte funciară demonstrează
        conformitatea imobilului cu regulamentele locale și naționale. Fie că este vorba de o{' '}
        <strong>carte funciară individuală</strong> sau de o <strong>carte funciară colectivă</strong>, acest
        document este esențial pentru verificarea datelor înscrierii și a termenului de valabilitate la data
        aplicării.
      </p>

      <h2>De ce este necesar extrasul de carte funciară pentru programul Casa Verde?</h2>
      <p>
        Pentru a beneficia de avantajele Programului Casa Verde, este imperativ{' '}
        <strong>să demonstrați proprietatea asupra imobilului pentru care solicitați finanțare</strong>. Extrasul de
        carte funciară servește ca dovadă incontestabilă a dreptului de proprietate, facilitând procesul de
        verificare și aprobare a dosarului dvs., și trebuie să fie actualizat la data înscrierii.
      </p>

      <h2>Procesul de obținere a extrasului de carte funciară</h2>
      <p>
        Procedura de obținere a extrasului de carte funciară implică{' '}
        <strong>
          interacțiunea cu autoritatea publică locală și cu organul teritorial de specialitate al ministerului
          finanțelor.
        </strong>{' '}
        Este necesar să se prezinte actul de identitate, certificatul de atestare fiscală privind situația
        imobilului, și să se achite o plată către bugetul de stat sau veniturile ale bugetului local, în funcție de
        specificațiile ghidului de finanțare.
      </p>
      <p>
        Dacă vrei să eviți drumurile la ghișeu, poți obține un{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>extras de carte funciară online</Link>, livrat oficial pe
        email, gata de atașat la dosarul Casa Verde.
      </p>

      <h2>Beneficiile programului Casa Verde</h2>
      <p>
        Participarea la Programul Casa Verde nu doar că vă permite să contribuiți activ la protecția mediului
        înconjurător, dar oferă și <strong>avantaje economice semnificative</strong>, prin reducerea costurilor
        energetice pe termen lung. <strong>Implementarea sistemelor de energie regenerabilă</strong>, cum ar fi
        panourile solare, pompele de căldură sau sistemele de încălzire bazate pe biomasă, poate fi susținută
        financiar prin acest program, cu condiția ca extrasul de carte funciară să fie emis pe numele
        solicitantului.
      </p>

      <h2>Documente necesare pentru Casa Verde 2024</h2>
      <p>Pentru a accesa finanțarea, sunt necesare următoarele documente, completate și actualizate:</p>
      <ul>
        <li>
          <strong>Cererea de finanțare</strong> completată integral prin tehnoredactare.
        </li>
        <li>
          <strong>Actul de identitate al solicitantului</strong> și, dacă este cazul, al coproprietarului sau
          devălmașului, trebuie să fie emis pe numele solicitantului de către autoritatea publică locală relevantă.
        </li>
        <li>
          <strong>Împuternicirea notarială</strong> și actul de identitate al persoanei împuternicite, dacă cererea
          este semnată de o altă persoană, emis pe numele solicitantului de către autoritatea publică locală.
        </li>
        <li>
          <strong>Extras de carte funciară</strong> actualizat nu mai vechi de 60 de zile la data, care să ateste
          dreptul de proprietate asupra construcției și/sau terenului deservit de sistemul de panouri fotovoltaice,
          în original sau în format tipărit dacă este obținut electronic.
        </li>
        <li>
          <strong>Copia cărții funciare colective</strong> pentru imobilele-construcții cu părți comune și
          proprietăți individuale, prezentată în format tipărit dacă este obținută electronic.
        </li>
        <li>
          <strong>Certificat de cazier fiscal</strong> privind obligațiile de plată către bugetul de stat și
          certificatul de atestare fiscală pentru impozitele și taxele locale, ambele emise pe numele solicitantului
          de către autoritatea locală a cărei rază teritorială își are domiciliul, în termen de valabilitate, în
          original sau copie legalizată, sau comunicate prin mijloace electronice.
        </li>
      </ul>

      <h2>Criterii de eligibilitate pentru programul Casa Verde</h2>
      <p>
        Pentru a accesa fondurile, aplicanții trebuie să îndeplinească anumite criterii de eligibilitate stabilite
        de <strong>Administrația Fondului pentru Mediu (AFM)</strong> și să pregătească un dosar complet de
        documente. Printre cei eligibili se numără:
      </p>
      <ul>
        <li>
          Rezidenții permanenți din România, înregistrând venituri ale bugetului local prin taxele locale și alte
          venituri.
        </li>
        <li>Proprietarii imobilului unde urmează a fi instalat sistemul fotovoltaic;</li>
        <li>
          Persoanele care au consimțământul tuturor coproprietarilor pentru montarea panourilor în cadrul acestui
          proiect, în cazul proprietăților deținute în comun;
        </li>
        <li>
          Persoanele fără datorii restante la bugetele statului și locale, și care au plătit taxele locale și alte
          venituri ale bugetului.
        </li>
      </ul>

      <h2>Cum eGhișeul poate ajuta în obținerea extrasului de carte funciară</h2>
      <p>
        <strong>eGhișeul</strong> oferă asistență în navigarea prin complexitatea obținerii extrasului de carte
        funciară, simplificând procesul pentru proprietarii care doresc să participe la programul{' '}
        <strong>Casa Verde</strong>. Platforma simplifică procesul de obținere a documentației necesare pentru
        participarea la Programul Casa Verde, oferind suport în completarea documentelor și interpretarea
        legislației aplicabile, totul din confortul propriei case. Dacă nu știi numărul cadastral al imobilului,
        poți folosi serviciul de{' '}
        <Link href={serviceUrl('identificare-imobil')}>identificare imobil după adresă</Link>.
      </p>

      <h2>Concluzie</h2>
      <p>
        Integrarea sistemelor fotovoltaice pentru producerea energiei în locuințele din România, prin intermediul{' '}
        <strong>Programului Casa Verde</strong>, reprezintă o inițiativă valoroasă pentru promovarea
        sustenabilității. Extrasele de carte funciară joacă un rol crucial în acest proces, asigurând conformitatea
        juridică și facilitând accesul la finanțare. Cu respectarea termenului de 60 de zile de la data aplicării și
        posibilitatea de a întocmi o carte funciară colectivă, proprietarii de imobile sunt mai bine pregătiți să
        facă tranziția către o energie curată și regenerabilă.
      </p>
    </ArticleLayout>
  );
}
