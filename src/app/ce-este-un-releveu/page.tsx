import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'ce-este-un-releveu';
const TITLE = 'Ce este un releveu și cum îl obții (apartament, casă)';
const DESCRIPTION =
  'Ce este un releveu, ce conține și cum îl obții pentru apartament sau casă. Diferența față de planul ' +
  'cadastral, cine face releveul și cât costă. Copie releveu din arhiva OCPI, livrată pe email.';
const DATE_PUBLISHED = '2026-06-25';
const DATE_MODIFIED = '2026-06-25';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/default.png',
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
      publishedLabel="iunie 2026"
      updatedLabel="25 iunie 2026"
      relatedServices={[
        { slug: 'copie-releveu', label: 'Copie după Releveu', desc: 'Releveul imobilului din arhiva OCPI, livrat pe email.' },
        { slug: 'copie-plan-cadastral', label: 'Copie Plan Cadastral', desc: 'Planul cadastral al imobilului din arhiva OCPI.' },
        { slug: 'extras-carte-funciara', label: 'Extras de Carte Funciară', desc: 'Situația juridică a imobilului, în câteva minute.' },
      ]}
      faqs={[
        { q: 'Ce înseamnă releveu?', a: 'Releveul este planul la scară al unei unități individuale (apartament, spațiu, casă) care arată compartimentarea: camerele, suprafețele utile și dimensiunile interioare. Este piesa care reprezintă „pe hârtie" interiorul imobilului.' },
        { q: 'Ce este un releveu de apartament?', a: 'Este planul apartamentului depus la cadastru, cu fiecare cameră, suprafața utilă și dimensiunile pereților. Apare des la vânzare, la credit ipotecar sau când verifici suprafața reală a locuinței.' },
        { q: 'Cine face releveul?', a: 'Releveul inițial îl întocmește un topograf/persoană autorizată la efectuarea cadastrului. Dacă imobilul are deja cadastru, nu mai e nevoie de o măsurătoare nouă — soliciți copia releveului din arhiva OCPI.' },
        { q: 'Cât costă un releveu?', a: `O copie a releveului din arhiva OCPI costă ${' '}119 RON (cu taxe incluse) prin eGhișeul. O măsurătoare cadastrală nouă, cu releveu întocmit de la zero, costă mai mult și se face la fața locului.` },
        { q: 'Care e diferența dintre releveu și planul cadastral?', a: 'Releveul arată interiorul imobilului (compartimentarea, suprafețele utile). Planul cadastral arată poziția și conturul parcelei pe hartă. Sunt documente complementare.' },
        { q: 'Cum obțin o copie a releveului?', a: 'Dacă imobilul are cadastru, comanzi copia releveului online: alegi județul și localitatea, introduci numărul cadastral sau de carte funciară și primești documentul pe email.' },
      ]}
    >
      <p>
        Când cumperi un apartament, ceri un credit sau vrei să verifici suprafața reală a locuinței, apare des un
        cuvânt: <strong>releveu</strong>. Mulți îl confundă cu planul cadastral sau cu schița din anunț. Hai să
        lămurim ce este, ce conține și cum îl obții fără să te deplasezi la ghișeu.
      </p>

      <h2>Ce este un releveu</h2>
      <p>
        Releveul este <strong>planul la scară al unei unități individuale</strong> — un apartament, o casă sau un
        spațiu — care arată compartimentarea interioară: camerele, suprafețele utile și dimensiunile. Practic,
        este reprezentarea „pe hârtie" a interiorului imobilului, așa cum a fost măsurat la cadastru.
      </p>

      <h2>Ce conține releveul unui apartament</h2>
      <p>
        Un <strong>releveu de apartament</strong> conține planul fiecărui nivel al unității, cu încăperile numerotate,
        suprafața utilă a fiecărei camere și suprafața totală. Pe baza lui se calculează suprafața utilă din actele
        de proprietate. De aceea apare la vânzare, la bancă (pentru credit ipotecar) și când vrei să confirmi că
        spațiul construit corespunde cu cel din scripte.
      </p>

      <h2>Releveu de casă</h2>
      <p>
        Și o <strong>casă</strong> are releveu, întocmit la efectuarea cadastrului: planul fiecărui nivel, camerele
        și suprafețele. Dacă imobilul este deja înscris în cartea funciară, releveul există în arhiva OCPI și poți
        cere o copie, fără o măsurătoare nouă.
      </p>

      <h2>Cine face releveul</h2>
      <p>
        Releveul inițial îl întocmește un <strong>topograf autorizat</strong> în cadrul lucrării de cadastru, când
        imobilul intră prima dată în evidențe. După ce imobilul are cadastru, nu mai ai nevoie de o măsurătoare nouă
        pentru a obține releveul — soliciți <Link href={serviceUrl('copie-releveu')}>copia releveului</Link> din
        arhiva OCPI.
      </p>

      <h2>Releveu vs. plan cadastral</h2>
      <p>
        Cele două se confundă des, dar arată lucruri diferite. <strong>Releveul</strong> arată interiorul
        imobilului — compartimentarea și suprafețele utile. <strong>Planul cadastral</strong> arată poziția și
        conturul parcelei pe hartă. Pentru multe proceduri (vânzare, credit, dosare) ai nevoie de ambele. Vezi și{' '}
        <Link href={serviceUrl('copie-plan-cadastral')}>copia planului cadastral</Link>.
      </p>

      <h2>Cum obții copia releveului online</h2>
      <p>
        Dacă imobilul are cadastru, nu mai e nevoie de deplasare. Prin{' '}
        <Link href={serviceUrl('copie-releveu')}>serviciul de copie după releveu</Link> alegi județul și localitatea,
        introduci numărul cadastral sau de carte funciară, plătești online și primești releveul pe email. Dacă nu
        cunoști numărul, îl putem afla după adresă.
      </p>

      <h2>Cât costă</h2>
      <p>
        O copie a releveului din arhiva OCPI costă <strong>119 RON</strong>, cu taxele incluse. O lucrare nouă de
        cadastru, cu releveu întocmit la fața locului de un topograf, costă mai mult și depinde de tipul imobilului.
        Dacă imobilul este deja intabulat, copia din arhivă este soluția rapidă și ieftină.
      </p>
    </ArticleLayout>
  );
}
