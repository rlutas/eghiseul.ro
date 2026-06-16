import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cele-4-tipuri-de-certificat-constatator-online';
const TITLE = 'Cele 4 Tipuri de Certificat Constatator Online';
const DESCRIPTION =
  'Cele 4 tipuri de certificat constatator emise de ONRC: furnizare informații, certificat de bază, ' +
  'pentru fonduri IMM și pentru insolvență. Ce conține fiecare, când îl folosești și cum îl obții online.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-06-16';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE} | eGhișeul`,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Comercial / ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="16 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-constatator',
          label: 'Certificat Constatator ONRC',
          desc: 'Obține certificatul constatator online.',
        },
        {
          href: '/eliberare-certificat-constatator-onrc-ghid/',
          label: 'Ghid eliberare certificat constatator ONRC',
          desc: 'Pașii compleți pentru obținere.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este un certificat constatator?',
          a: 'Certificatul constatator este un document oficial emis de Oficiul Național al Registrului Comerțului (ONRC) în România, care servește ca o dovadă legală a diferitelor aspecte ale unei companii — date de identificare, modificări înregistrate și, în funcție de tip, informații financiare.',
        },
        {
          q: 'Câte tipuri de certificat constatator există?',
          a: 'Există patru tipuri: certificatul de furnizare informații, certificatul de bază, certificatul pentru fonduri IMM și certificatul pentru insolvență. Fiecare conține un set diferit de informații și se folosește în situații diferite.',
        },
        {
          q: 'Ce certificat îmi trebuie pentru bancă sau ANAF?',
          a: 'Certificatul de bază este cel necesar pentru interacțiunile cu băncile și ANAF. Tot el este indispensabil pentru accesarea fondurilor europene și participarea la licitații publice.',
        },
        {
          q: 'Ce certificat îmi trebuie pentru insolvență?',
          a: 'Certificatul pentru insolvență, solicitat de obicei de instanțele judecătorești sau de notari. Acesta include situațiile financiare anuale — cifra de afaceri, profit și pierderi.',
        },
        {
          q: 'Cum obțin certificatul constatator online?',
          a: 'Accesezi pagina serviciului, completezi formularul cu datele firmei, faci plata online securizat și primești certificatul pe email după procesare.',
        },
      ]}
    >
      <p>
        <strong>Certificatul constatator</strong> este un document oficial emis de Oficiul Național al Registrului
        Comerțului (ONRC) în România, care servește ca o dovadă legală a diferitelor aspecte ale unei companii. În
        funcție de scopul pentru care îl soliciți, există <strong>patru tipuri</strong> de certificat constatator,
        fiecare cu un set diferit de informații.
      </p>

      <h2>1. Certificat de furnizare informații</h2>
      <p>
        Oferă detaliile de identificare ale firmei: <strong>denumirea, forma juridică, numărul ONRC, CUI-ul (codul de
        identificare fiscală), adresa sediului și statusul</strong> acesteia. Conține, de asemenea, codurile CAEN
        sintetizate și informații despre administratori.
      </p>

      <h2>2. Certificat de bază</h2>
      <p>
        Este necesar pentru interacțiunile cu <strong>băncile și ANAF</strong>. Este indispensabil pentru accesarea
        fondurilor europene, obținerea de avize și autorizații, participarea la licitații publice sau înregistrarea ca
        plătitor de TVA. Conține informații detaliate despre modificările înregistrate ale firmei.
      </p>

      <h2>3. Certificat pentru fonduri IMM</h2>
      <p>
        Destinat <strong>întreprinderilor mici și mijlocii</strong> care accesează fonduri europene sau granturi.
        Include datele de identificare, informații despre asociați/acționari, precum și detalii financiare cum ar fi
        mărimea capitalului social și situația financiară curentă.
      </p>

      <h2>4. Certificat pentru insolvență</h2>
      <p>
        Esențial pentru inițierea procedurilor de insolvență. Este solicitat de obicei de{' '}
        <strong>instanțele judecătorești sau de notari</strong>. Pe lângă informațiile de bază, include{' '}
        <strong>situațiile financiare anuale</strong> — cifra de afaceri, profit și pierderi.
      </p>

      <h2>Cum soliciți certificatul constatator online</h2>
      <p>
        Procesul de obținere a unui{' '}
        <Link href={serviceUrl('certificat-constatator')}>certificat constatator online</Link> are patru pași simpli:
      </p>
      <ol>
        <li>Accesezi pagina serviciului.</li>
        <li>Completezi formularul cu datele firmei.</li>
        <li>Faci plata online, în mod securizat.</li>
        <li>Primești certificatul pe email, după procesare.</li>
      </ol>

      <h2>La ce folosesc aceste certificate</h2>
      <p>
        Indiferent de tip, certificatele constatatoare demonstrează conformitatea legală a firmei, oferă credibilitate
        în relațiile de afaceri, facilitează tranzacțiile bancare, sprijină procedurile juridice și confirmă
        informațiile actuale din registrul comerțului. Pentru pașii compleți de obținere, vezi și{' '}
        <Link href="/eliberare-certificat-constatator-onrc-ghid/">ghidul de eliberare a certificatului constatator ONRC</Link>.
      </p>
    </ArticleLayout>
  );
}
