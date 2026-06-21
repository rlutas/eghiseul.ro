import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'acte-necesare-certificat-de-nastere';
const TITLE = 'Acte Necesare Certificat de Naștere: Listă Completă pe Situații';
const DESCRIPTION =
  'Ce acte îți trebuie pentru certificatul de naștere: duplicat (pierdut sau deteriorat), ' +
  'înregistrarea unui nou-născut și eliberarea prin împuternicire sau din diaspora. ' +
  'Listă completă + cum obții duplicatul online prin eGhișeul.ro.';
const DATE_PUBLISHED = '2026-06-19';
const DATE_MODIFIED = '2026-06-19';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/og/services/certificat-nastere.png',
});

export default function Page() {
  const nastereUrl = serviceUrl('certificat-nastere');
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image="/og/services/certificat-nastere.png"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="19 iunie 2026"
      updatedLabel="19 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-nastere',
          label: 'Certificat de Naștere Online',
          desc: 'Obține duplicatul certificatului de naștere online, fără drum la Starea Civilă.',
        },
      ]}
      faqs={[
        {
          q: 'Ce acte îmi trebuie pentru un duplicat de certificat de naștere?',
          a: 'De regulă: cerere tip, act de identitate valabil al titularului sau solicitantului și, când cererea o depune altcineva, o împuternicire. Taxa de stare civilă este mică sau zero în multe primării. Prin eGhișeul.ro completăm noi documentația corectă.',
        },
        {
          q: 'Ce acte sunt necesare pentru certificatul de naștere al unui nou-născut?',
          a: 'Pentru prima înregistrare a nașterii: certificatul medical constatator al nașterii, actele de identitate ale părinților și, dacă e cazul, certificatul de căsătorie. Înregistrarea o fac părinții, la Starea Civilă din localitatea nașterii sau, unde se poate, direct la maternitate.',
        },
        {
          q: 'În cât timp trebuie înregistrat nou-născutul?',
          a: 'Declararea nașterii se face, de regulă, în termen de 30 de zile de la naștere. Primul certificat de naștere se eliberează gratuit la înregistrare.',
        },
        {
          q: 'Ce acte trebuie dacă cer certificatul din străinătate sau din altă localitate?',
          a: 'Ai nevoie de o împuternicire prin care altcineva depune cererea la primăria din localitatea de naștere. Prin eGhișeul.ro semnezi împuternicirea online și primești documentul prin curier, fără să te deplasezi.',
        },
      ]}
    >
      <p>
        Lista de <strong>acte necesare pentru certificatul de naștere</strong> diferă în funcție de
        situație: vorbim despre <strong>un duplicat</strong> (când ai pierdut sau ți s-a deteriorat
        documentul), despre <strong>înregistrarea unui nou-născut</strong> (primul certificat) sau
        despre <strong>eliberarea prin împuternicire</strong> (din altă localitate ori din diaspora).
        Mai jos găsești lista pentru fiecare caz.
      </p>

      <h2>Acte necesare pentru un duplicat de certificat de naștere</h2>
      <p>
        Se aplică atunci când ai <Link href="/certificat-de-nastere-pierdut/">pierdut certificatul</Link>{' '}
        sau vrei să-l <Link href="/schimbare-certificat-de-nastere-vechi/">înlocuiești pe modelul actual</Link>:
      </p>
      <ul>
        <li><strong>cerere tip</strong> pentru eliberarea duplicatului;</li>
        <li><strong>act de identitate valabil</strong> al titularului sau al solicitantului;</li>
        <li><strong>împuternicire</strong>, când cererea este depusă de o altă persoană în numele tău;</li>
        <li>dovada taxei de stare civilă, acolo unde se percepe (de regulă mică sau zero).</li>
      </ul>
      <p>
        Prin eGhișeul.ro completăm noi cererea și pregătim documentația corectă pentru Starea Civilă
        competentă — vezi pașii pe pagina de{' '}
        <Link href={nastereUrl}>certificat de naștere online</Link>.
      </p>

      <h2>Acte necesare pentru certificatul de naștere al unui nou-născut</h2>
      <p>
        Pentru <strong>prima înregistrare a nașterii</strong>, demersul îl fac părinții, iar primul
        certificat se eliberează <strong>gratuit</strong>. Actele uzuale sunt:
      </p>
      <ul>
        <li><strong>certificatul medical constatator al nașterii</strong> (eliberat de maternitate);</li>
        <li><strong>actele de identitate</strong> ale ambilor părinți;</li>
        <li><strong>certificatul de căsătorie</strong> al părinților, dacă este cazul;</li>
        <li>o <strong>declarație privind numele de familie</strong> al copilului, când părinții au nume diferite.</li>
      </ul>
      <p>
        Declararea nașterii se face de regulă în <strong>30 de zile</strong>, la Starea Civilă din
        localitatea nașterii sau, unde se poate, direct la maternitate. (Pentru această primă
        înregistrare nu este nevoie de un serviciu intermediar — o fac părinții.) Ulterior, dacă ai
        nevoie de un exemplar suplimentar sau pierzi documentul, soliciți un duplicat.
      </p>

      <h2>Acte necesare pentru eliberare prin împuternicire (altă localitate / diaspora)</h2>
      <p>
        Dacă nu te poți deplasa la primăria din localitatea de naștere, certificatul poate fi obținut
        de altcineva în numele tău, pe baza unei <strong>împuterniciri</strong>. Ai nevoie de:
      </p>
      <ul>
        <li><strong>împuternicire</strong> semnată de titular (online, prin eGhișeul.ro);</li>
        <li><strong>copie după actul de identitate</strong> al titularului;</li>
        <li>datele exacte de naștere (data și localitatea înregistrării).</li>
      </ul>
      <p>
        Este soluția potrivită mai ales pentru românii din <strong>diaspora</strong>: depunem cererea
        la primăria competentă și îți trimitem certificatul prin curier oriunde te afli.
      </p>

      <h2>Cum simplifici totul prin eGhișeul.ro</h2>
      <p>
        În loc să afli lista exactă a fiecărui ghișeu și să te deplasezi, completezi datele online,
        semnezi împuternicirea în aplicație și plătești cu cardul — restul îl facem noi. Vezi detalii
        și cost pe pagina de <Link href={nastereUrl}>eliberare certificat de naștere online</Link>.
      </p>
    </ArticleLayout>
  );
}
