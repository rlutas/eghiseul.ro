import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'ce-este-planul-cadastral';
const TITLE = 'Ce este planul cadastral (și diferența față de releveu și extras CF)';
const DESCRIPTION =
  'Ce este planul cadastral, ce conține și cum îl obții online. Diferența dintre planul cadastral, ' +
  'extrasul de plan cadastral pe ortofotoplan, releveu și extrasul de carte funciară.';
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
        { slug: 'extras-plan-cadastral', label: 'Extras de Plan Cadastral', desc: 'Imobilul pe ortofotoplan, după numărul cadastral.' },
        { slug: 'copie-plan-cadastral', label: 'Copie Plan Cadastral', desc: 'Copie a planului cadastral din arhiva OCPI.' },
        { slug: 'copie-releveu', label: 'Copie după Releveu', desc: 'Planul interior al imobilului (compartimentare).' },
      ]}
      faqs={[
        { q: 'Ce este un plan cadastral?', a: 'Planul cadastral este reprezentarea grafică a imobilului: conturul parcelei, poziția și vecinătățile, așa cum sunt înscrise la cadastru. Arată „unde" și „cât" — spre deosebire de extrasul de carte funciară, care arată situația juridică.' },
        { q: 'Ce conține planul cadastral?', a: 'Conturul parcelei, numărul cadastral, suprafața, vecinătățile și poziția imobilului. Pe varianta pe ortofotoplan, conturul este suprapus peste imaginea aeriană georeferențiată.' },
        { q: 'Care e diferența dintre planul cadastral și releveu?', a: 'Planul cadastral arată parcela pe hartă (contur, poziție, vecinătăți). Releveul arată interiorul imobilului (camerele, suprafețele utile). Sunt documente complementare.' },
        { q: 'Ce este extrasul de plan cadastral pe ortofotoplan?', a: 'Este planul cadastral suprapus peste o imagine aeriană georeferențiată (ortofotoplan), util pentru a localiza terenul după numărul cadastral. Îl obții online de la ANCPI.' },
        { q: 'Cum obțin un plan cadastral online?', a: 'Alegi județul și localitatea, introduci numărul cadastral sau de carte funciară și primești documentul pe email. Nu ai nevoie de cont ANCPI.' },
        { q: 'Plan cadastral și extras de carte funciară — am nevoie de amândouă?', a: 'Des, da. Planul cadastral arată imobilul pe hartă, iar extrasul de carte funciară arată proprietarul, suprafața și sarcinile. Pentru tranzacții și dosare tehnice ai nevoie de ambele.' },
      ]}
    >
      <p>
        „Am nevoie de planul cadastral" — auzi des asta la notar, la bancă sau când depui o documentație. Dar ce
        este, mai exact, <strong>planul cadastral</strong>, și cu ce diferă de releveu sau de extrasul de carte
        funciară? Le punem cap la cap, ca să știi exact ce să ceri.
      </p>

      <h2>Ce este planul cadastral</h2>
      <p>
        Planul cadastral este <strong>reprezentarea grafică a imobilului</strong> așa cum este înscris la cadastru:
        conturul parcelei, poziția, suprafața și vecinătățile. Pe scurt, arată „unde se află" și „cum este delimitat"
        terenul sau construcția, spre deosebire de extrasul de carte funciară, care arată situația juridică.
      </p>

      <h2>Ce conține planul cadastral</h2>
      <p>
        Un plan cadastral conține <strong>conturul parcelei, numărul cadastral, suprafața, vecinătățile</strong> și
        poziția imobilului. Forma pe care o vezi cel mai des este{' '}
        <Link href={serviceUrl('extras-plan-cadastral')}>extrasul de plan cadastral pe ortofotoplan</Link>, unde
        conturul este suprapus peste imaginea aeriană georeferențiată — util pentru a localiza terenul după numărul
        cadastral.
      </p>

      <h2>Plan cadastral vs. releveu</h2>
      <p>
        Diferența pe care o caută mulți: planul cadastral arată <strong>parcela pe hartă</strong> (contur, poziție,
        vecinătăți), iar <Link href={serviceUrl('copie-releveu')}>releveul</Link> arată{' '}
        <strong>interiorul imobilului</strong> (camerele și suprafețele utile). Unul e „de afară", celălalt „de
        dinăuntru". Pentru o tranzacție completă ai nevoie de ambele.
      </p>

      <h2>Plan cadastral vs. extras de carte funciară</h2>
      <p>
        Planul cadastral arată imobilul pe hartă; <Link href={serviceUrl('extras-carte-funciara')}>extrasul de
        carte funciară</Link> arată proprietarul, suprafața și sarcinile (ipoteci, interdicții). Sunt documente
        diferite, dar care merg împreună la notar, la bancă sau în dosarele tehnice.
      </p>

      <h2>Extras de plan cadastral vs. copie din arhivă</h2>
      <p>
        Ai două variante. <Link href={serviceUrl('extras-plan-cadastral')}>Extrasul de plan cadastral</Link> pe
        ortofotoplan arată situația la zi a parcelei pe hartă. <Link href={serviceUrl('copie-plan-cadastral')}>Copia
        planului cadastral</Link> din arhiva OCPI reproduce planul de situație înregistrat la recepția cadastrală.
        Pentru localizare rapidă alegi extrasul; pentru documentația de arhivă alegi copia.
      </p>

      <h2>Cum obții planul cadastral online</h2>
      <p>
        Nu ai nevoie de deplasare sau de cont ANCPI. Alegi județul și localitatea, introduci numărul cadastral sau
        de carte funciară, plătești online și primești documentul pe email. Dacă nu cunoști numărul, îl putem afla
        după adresă.
      </p>
    </ArticleLayout>
  );
}
