import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'rolul-si-atributiile-onrc-romania';
const TITLE = 'Ce face ONRC, de fapt: registrul, înmatriculările și certificatul constatator';
const DESCRIPTION =
  'ONRC ține Registrul Comerțului: acolo se înmatriculează firmele, se înscriu modificările și de acolo ies ' +
  'certificatele constatatoare. Ce atribuții are instituția și ce documente eliberează.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-08-24';

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
      category="Comercial / ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="24 august 2026"
      relatedServices={[
        { slug: 'certificat-constatator', label: 'Certificat Constatator ONRC', desc: 'Obține certificatul constatator online, fără drum la ghișeu.' },
        { href: '/cele-4-tipuri-de-certificat-constatator-online/', label: 'Tipurile de certificat constatator', desc: 'Ce tip de certificat constatator îți trebuie.' },
      ]}
      faqs={[
        { q: 'Care este rolul ONRC în economia României?', a: 'ONRC ține Registrul Comerțului, evidența oficială a firmelor, PFA-urilor și celorlalți profesioniști. Orice firmă există legal din momentul înmatriculării acolo, iar datele ei publice pot fi consultate de oricine.' },
        { q: 'Ce proceduri implică înregistrarea unei societăți comerciale la ONRC?', a: 'Rezervi denumirea, întocmești actul constitutiv, depui dosarul (la ghișeu sau prin portal) și primești certificatul de înmatriculare cu CUI. De la eliminarea taxelor de înmatriculare, depunerea în sine nu mai costă nimic.' },
        { q: 'Cum pot accesa serviciile ONRC?', a: 'Prin portalul portal.onrc.ro (cu cont și, pentru unele operațiuni, semnătură electronică) sau la ghișeele oficiilor din fiecare județ.' },
        { q: 'Care sunt documentele necesare pentru obținerea unui certificat constatator de la ONRC?', a: 'Doar datele de identificare ale firmei — denumirea sau CUI-ul. Certificatul constatator conține informații publice, deci îl poate cere oricine, nu doar administratorul.' },
        { q: 'Cât durează eliberarea unui certificat constatator?', a: 'Cel de bază, cerut online, se emite de regulă în aceeași zi. Certificatele cu istoric sau cele pentru insolvență trec prin backoffice-ul ONRC și pot dura o zi lucrătoare în plus.' },
      ]}
    >
      <p>
        Oficiul Național al Registrului Comerțului e instituția la care se „naște” oficial orice firmă din România:
        acolo se înmatriculează, acolo se înscriu toate modificările din viața ei și tot de acolo ies documentele
        care dovedesc ce scrie în registru. Funcționează în subordinea Ministerului Justiției, cu câte un oficiu în
        fiecare județ.
      </p>

      <h2>Registrul Comerțului: evidența în sine</h2>
      <p>
        Miezul instituției e registrul electronic central în care figurează societățile, PFA-urile, întreprinderile
        individuale și familiale. Pentru fiecare: denumirea, CUI-ul, numărul de ordine (J/F/C), sediul,
        administratorii, asociații, obiectul de activitate pe coduri CAEN și starea firmei: în funcțiune,
        suspendată, în insolvență, radiată.
      </p>
      <p>
        Ce e înscris acolo e opozabil terților: dacă registrul spune că X e administrator, partenerii de afaceri se
        pot baza pe asta. De aceea o schimbare de sediu, o cesiune de părți sociale sau numirea unui
        administrator nu produc efecte față de terți până nu sunt înregistrate.
      </p>

      <h2>Ce face concret</h2>
      <p>
        Patru lucruri acoperă aproape tot ce atinge un antreprenor:
      </p>
      <ul>
        <li>
          Înmatriculează firme noi. Dosarul se depune la ghișeu sau prin portal, iar la final primești certificatul
          de înmatriculare cu CUI.
        </li>
        <li>
          Înscrie mențiuni: orice schimbare în actele firmei (sediu, denumire, asociați, CAEN, dizolvare) trece
          printr-o cerere de mențiuni.
        </li>
        <li>
          Publică actele: extrase din înregistrări ajung în Buletinul Electronic al Registrului Comerțului, ca
          informația să fie publică.
        </li>
        <li>
          Eliberează documente care atestă ce scrie în registru, cel mai cerut fiind certificatul constatator.
        </li>
      </ul>

      <h2>Certificatul constatator</h2>
      <p>
        E fotografia oficială a firmei la zi: cine o administrează, unde are sediul, ce stare are. Îl cer băncile la
        deschiderea de conturi și credite, primăriile la autorizații, finanțatorii la fonduri europene, notarii la
        tranzacții. Vine în mai multe variante (de bază, cu istoric, pentru insolvență) și am scris separat{' '}
        <Link href="/cele-4-tipuri-de-certificat-constatator-online/">care tip îți trebuie în fiecare situație</Link>.
      </p>
      <p>
        Îl poți obține singur prin portalul ONRC, cu cont și plata online, sau prin noi:{' '}
        <Link href="/servicii/certificat-constatator-online/">comanzi certificatul constatator online</Link> și îl
        primești pe email, fără să-ți faci cont pe portal.
      </p>

      <h2>Unde îl găsești</h2>
      <p>
        Portalul e la portal.onrc.ro, iar oficiile județene au program cu publicul în timpul săptămânii. Pentru
        verificări rapide, gratuite, există și serviciul de căutare după denumire sau CUI, util când vrei doar să
        vezi dacă o firmă există și ce stare are, fără un document oficial.
      </p>
    </ArticleLayout>
  );
}
