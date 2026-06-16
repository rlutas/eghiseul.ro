import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'valabilitate-extras-de-carte-funciara';
const TITLE = 'Valabilitate Extras de Carte Funciară: Cât Este Valabil';
const DESCRIPTION =
  'Cât este valabil extrasul de carte funciară emis de ANCPI: în general 30 de zile. ' +
  'Cum verifici valabilitatea online, ce faci când expiră și cât ține un extras pentru informare.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-06-16';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE} | eGhișeul`,
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
        { slug: 'extras-carte-funciara', label: 'Extras de Carte Funciară', desc: 'Document oficial ANCPI, livrat pe email în câteva minute.' },
        { slug: 'identificare-imobil', label: 'Identificare Imobil după Adresă', desc: 'Nu știi numărul cadastral? Îl aflăm noi după adresă.' },
      ]}
      faqs={[
        { q: 'Cât este valabil extrasul de carte funciară?', a: 'Perioada de valabilitate a extrasului de carte funciară emis de ANCPI este, în general, de 30 de zile. Este recomandat să verifici reglementările locale specifice pentru a fi sigur de perioada de valabilitate în zona ta.' },
        { q: 'Se poate prelungi valabilitatea unui extras de carte funciară?', a: 'Nu, valabilitatea unui extras de carte funciară nu se poate prelungi. În schimb, poți obține un extras nou direct pe platforma eGhișeul.ro.' },
        { q: 'Ce se întâmplă dacă folosesc un extras de carte funciară expirat într-o tranzacție?', a: 'Utilizarea unui document expirat poate duce la nevalidarea tranzacției sau la întârzieri, deoarece informațiile cuprinse pot să nu mai fie actuale.' },
        { q: 'Cât timp este valabil un extras de carte funciară pentru informare?', a: 'Un extras pentru informare rămâne valabil până la următoarea modificare înregistrată asupra proprietății. Se recomandă, totuși, ca acesta să nu fie mai vechi de 30 de zile.' },
        { q: 'Cum verific valabilitatea unui extras de carte funciară?', a: 'ANCPI oferă verificarea online a valabilității extrasului, completând date precum numărul cadastral al imobilului, numărul de identificare fiscală al proprietarului sau numărul unic de identificare al bunului imobil. Serviciul este disponibil 24/7 și nu necesită deplasare la sediul ANCPI.' },
      ]}
    >
      <p>
        Valabilitatea unui <strong>extras de carte funciară</strong> se referă la perioada în care documentul este
        considerat valabil conform legii. Pentru a asigura legalitatea unei tranzacții imobiliare, este important ca
        extrasul să fie valabil în momentul încheierii tranzacției. Atât cumpărătorii, cât și vânzătorii trebuie să
        verifice valabilitatea extrasului pentru a evita orice probleme legale ulterioare.
      </p>

      <h2>De ce este importantă valabilitatea extrasului de carte funciară?</h2>

      <h3>Ce reprezintă valabilitatea unui extras de carte funciară?</h3>
      <p>
        Valabilitatea unui extras de carte funciară se referă la perioada în care documentul este considerat valabil
        conform legii. Pentru a asigura legalitatea unei tranzacții imobiliare, este important ca extrasul de carte
        funciară să fie valabil în momentul încheierii tranzacției. Cumpărătorii și vânzătorii trebuie să verifice
        valabilitatea extrasului pentru a evita orice probleme legale ulterioare.
      </p>

      <h3>Cum să verifici valabilitatea extrasului de carte funciară?</h3>
      <p>
        ANCPI oferă posibilitatea de verificare a valabilității extrasului de carte funciară online, prin completarea
        unor informații precum <strong>numărul cadastral al imobilului</strong>, <strong>numărul de identificare
        fiscală al proprietarului</strong> sau <strong>numărul unic de identificare al bunului imobil</strong>.
        Serviciul este disponibil 24/7 și nu necesită deplasare fizică la sediul ANCPI.
      </p>

      <h2>Termenul de valabilitate al extrasului de carte funciară</h2>

      <h3>Care este perioada de valabilitate a unui extras de carte funciară emis de ANCPI?</h3>
      <p>
        Perioada de valabilitate a extrasului de carte funciară emis de ANCPI <strong>este, în general, de 30 de
        zile</strong>. Este important să verifici reglementările locale specifice pentru a fi sigur de perioada de
        valabilitate în zona ta.
      </p>

      <h3>Cum poate fi prelungită valabilitatea unui extras de carte funciară?</h3>
      <p>
        Valabilitatea unui extras de carte funciară nu se poate prelungi, dar se poate obține un nou extras pe
        platforma <Link href={serviceUrl('extras-carte-funciara')}>eGhișeul.ro</Link>. Procesul este 100% online, iar
        documentul oficial îți este livrat pe email în câteva minute.
      </p>

      <h3>Există situații în care valabilitatea unui extras de carte funciară poate fi redusă?</h3>
      <p>
        Da. Valabilitatea extrasului de carte funciară poate fi redusă în cazul unor modificări legale sau evenimente
        care afectează statutul imobilului, inclusiv:
      </p>
      <ul>
        <li>schimbări ale proprietății;</li>
        <li>divizarea sau unirea terenurilor;</li>
        <li>schimbări ale destinației;</li>
        <li>exproprieri;</li>
        <li>alte acte administrative care impun restricții asupra drepturilor de proprietate.</li>
      </ul>

      <h2>Întrebări frecvente</h2>

      <h3>Este necesar să actualizez extrasul de carte funciară în mod regulat?</h3>
      <p>
        Da, este recomandat să actualizezi extrasul în mod regulat, mai ales înainte de efectuarea oricărei tranzacții
        imobiliare.
      </p>

      <h3>Ce se întâmplă dacă folosesc un extras de carte funciară expirat într-o tranzacție?</h3>
      <p>
        Utilizarea unui document expirat poate duce la nevalidarea tranzacției sau la întârzieri, deoarece informațiile
        pot să nu mai fie actuale.
      </p>

      <h3>Cât timp este valabil un extras de carte funciară pentru informare?</h3>
      <p>
        Un extras pentru informare rămâne valabil până la următoarea modificare înregistrată asupra proprietății. Se
        recomandă ca acesta să nu fie mai vechi de 30 de zile.
      </p>

      <p>
        Dacă nu cunoști numărul cadastral sau cel de carte funciară al imobilului, îl putem afla noi prin serviciul de{' '}
        <Link href={serviceUrl('identificare-imobil')}>Identificare Imobil după Adresă</Link>, după care îți eliberăm
        un extras de carte funciară valabil.
      </p>
    </ArticleLayout>
  );
}
