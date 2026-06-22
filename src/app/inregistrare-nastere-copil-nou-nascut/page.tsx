import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'inregistrare-nastere-copil-nou-nascut';
const TITLE = 'Înregistrarea Nașterii Copilului: Termen, Acte și Primul Certificat';
const DESCRIPTION =
  'Cum înregistrezi nașterea copilului nou-născut: termenul legal de 30 de zile, actele necesare, CNP-ul și primul certificat de naștere, care este gratuit. Ghid pas cu pas.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';
const OGIMAGE = '/og/services/certificat-nastere.png';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: OGIMAGE,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Stare civilă"
      image={OGIMAGE}
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      faqs={[
        {
          q: 'În cât timp trebuie înregistrată nașterea copilului?',
          a: 'Termenul legal este de 30 de zile de la naștere, pentru copilul născut viu. Dacă s-a născut mort, declararea se face în 15 zile. Dacă a decedat în interiorul celor 30 de zile de la naștere, înregistrarea trebuie făcută în 3 zile de la deces. Recomandarea practică este să nu lași declararea pe ultima zi.',
        },
        {
          q: 'Unde se înregistrează nașterea?',
          a: 'Nașterea se declară la serviciul de stare civilă al localității unde s-a produs nașterea, de regulă primăria de pe raza căreia se află maternitatea în care a venit copilul pe lume.',
        },
        {
          q: 'Cât costă primul certificat de naștere al copilului?',
          a: 'Primul certificat de naștere al copilului este gratuit. Eliberarea lui face parte din procedura de înregistrare a nașterii. Costuri pot apărea ulterior doar pentru duplicate sau pentru documente conexe, precum apostila ori traducerea autorizată.',
        },
        {
          q: 'Ce acte îmi trebuie ca să înregistrez nașterea?',
          a: 'Ai nevoie de certificatul medical constatator al nașterii eliberat de maternitate, de actele de identitate ale părinților și, dacă părinții sunt căsătoriți, de certificatul de căsătorie.',
        },
        {
          q: 'Ce se întâmplă dacă am depășit termenul de 30 de zile?',
          a: 'Dacă termenul de 30 de zile este depășit, vorbim despre o înregistrare tardivă a nașterii, care necesită aprobări suplimentare față de procedura obișnuită. Nașterea tot se înregistrează, însă pașii sunt mai complicați, motiv pentru care este important să respecți termenul.',
        },
      ]}
    >
      <p>
        Vine pe lume un copil și, dincolo de emoția momentului, urmează un pas administrativ esențial:{' '}
        <strong>înregistrarea nașterii</strong>. Aceasta este procedura prin care nou-născutul capătă
        existență juridică, primește <strong>primul său certificat de naștere</strong> și un{' '}
        <strong>CNP</strong>. Vestea bună este că procedura este clară, iar primul certificat de
        naștere al copilului este <strong>gratuit</strong>. Important este însă să respecți termenul
        legal, pentru a evita complicațiile unei înregistrări tardive.
      </p>

      <h2>Ce înseamnă înregistrarea nașterii</h2>
      <p>
        Înregistrarea nașterii este actul prin care nașterea copilului este consemnată oficial în
        registrele de stare civilă. Pe baza acestei înregistrări se întocmește{' '}
        <strong>primul certificat de naștere</strong> — documentul de identitate fundamental al
        copilului, care îl însoțește toată viața. Tot în acest moment copilul primește{' '}
        <strong>codul numeric personal (CNP)</strong>, indispensabil pentru orice demers ulterior: de
        la înscrierea la medicul de familie, la alocație, creșă, grădiniță și, mai târziu, prima carte
        de identitate.
      </p>
      <p>
        Spre deosebire de un <Link href="/duplicat-certificat-de-nastere/">duplicat de certificat de
        naștere</Link>, care se cere atunci când documentul deja există în registre, înregistrarea
        nașterii este momentul în care actul de naștere se creează pentru prima dată.
      </p>

      <h2>Termenul legal: 30 de zile de la naștere</h2>
      <p>
        Cel mai important lucru de reținut este <strong>termenul</strong>. Pentru copilul născut viu,
        nașterea trebuie declarată în <strong>30 de zile</strong> de la naștere. Există însă și situații
        speciale, cu termene mai scurte:
      </p>
      <table>
        <thead>
          <tr>
            <th>Situația</th>
            <th>Termen de declarare</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Copil născut viu</td>
            <td>30 de zile de la naștere</td>
          </tr>
          <tr>
            <td>Copil născut mort</td>
            <td>15 zile</td>
          </tr>
          <tr>
            <td>Copil decedat în interiorul celor 30 de zile de la naștere</td>
            <td>3 zile de la deces</td>
          </tr>
        </tbody>
      </table>
      <p>
        Recomandarea practică este să nu lași declararea pe ultima zi. Dacă lipsește un document sau
        apare o eroare, ai nevoie de timp să o corectezi înainte de expirarea termenului. Ideal este să
        pregătești actele încă din maternitate și să mergi la starea civilă în primele zile după
        externare.
      </p>

      <h2>Unde se înregistrează nașterea</h2>
      <p>
        Nașterea se declară la <strong>serviciul de stare civilă al localității unde s-a produs
        nașterea</strong>. În practică, este vorba despre primăria pe raza căreia se află maternitatea
        în care a venit copilul pe lume. Dacă, de exemplu, locuiești într-un sat, dar ai născut la
        maternitatea din orașul reședință de județ, înregistrarea se face la primăria din acel oraș,
        nu la cea din localitatea ta de domiciliu.
      </p>

      <h2>Acte necesare pentru înregistrarea nașterii</h2>
      <p>
        Setul de documente este, de regulă, simplu și îl primești în mare parte chiar de la maternitate:
      </p>
      <ul>
        <li>
          <strong>certificatul medical constatator al nașterii</strong>, eliberat de maternitatea în
          care s-a născut copilul — documentul-cheie al întregii proceduri;
        </li>
        <li>
          <strong>actele de identitate ale părinților</strong> (buletin/carte de identitate valabile);
        </li>
        <li>
          <strong>certificatul de căsătorie al părinților</strong>, dacă aceștia sunt căsătoriți.
        </li>
      </ul>
      <p>
        Dacă părinții nu sunt căsătoriți, regulile privind stabilirea filiației și a numelui copilului
        diferă, iar ghișeul de stare civilă îți va indica pașii suplimentari. Pentru familiile în care
        actele de stare civilă au fost încheiate în străinătate, poate fi nevoie întâi de o{' '}
        <Link href="/transcriere-certificat-de-casatorie/">transcriere a certificatului de
        căsătorie</Link> în registrele românești.
      </p>

      <h2>Primul certificat de naștere este gratuit</h2>
      <p>
        Un aspect care liniștește multe familii: <strong>primul certificat de naștere al copilului
        este gratuit</strong>. Eliberarea lui face parte din procedura de înregistrare a nașterii și nu
        presupune o taxă. Tot atunci copilul primește CNP-ul, înscris chiar pe certificat.
      </p>
      <p>
        Costuri pot apărea abia ulterior și doar în situații specifice — de exemplu, dacă ai nevoie de
        un al doilea exemplar (un <Link href="/duplicat-certificat-de-nastere/">duplicat</Link>) sau de
        documente conexe, precum apostila și traducerea autorizată, atunci când certificatul trebuie
        folosit în străinătate.
      </p>

      <h2>Pașii înregistrării, pe scurt</h2>
      <ul>
        <li>la externare, primești de la maternitate certificatul medical constatator al nașterii;</li>
        <li>
          pregătești actele de identitate ale părinților și, dacă e cazul, certificatul de căsătorie;
        </li>
        <li>
          mergi, în termen de 30 de zile, la serviciul de stare civilă al localității unde s-a produs
          nașterea;
        </li>
        <li>
          completezi declarația de naștere; ofițerul de stare civilă întocmește actul de naștere;
        </li>
        <li>
          primești primul certificat de naștere al copilului, cu CNP-ul deja înscris, gratuit.
        </li>
      </ul>

      <h2>Exemplu: o familie din mediul rural</h2>
      <p>
        Ana și Mihai locuiesc într-o comună, dar Ana a născut la maternitatea din orașul reședință de
        județ. La externare, au primit certificatul medical constatator al nașterii. În a opta zi după
        naștere, Mihai s-a prezentat la serviciul de stare civilă al primăriei din oraș (acolo unde se
        află maternitatea), cu certificatul medical, buletinele amândurora și certificatul lor de
        căsătorie. A completat declarația, iar în aceeași zi a plecat acasă cu primul certificat de
        naștere al copilului, pe care era deja trecut CNP-ul. Nu a plătit nimic pentru el.
      </p>

      <h2>Înregistrarea tardivă: ce se întâmplă dacă depășești termenul</h2>
      <p>
        Dacă cele 30 de zile au trecut, nașterea nu se mai poate înregistra prin procedura obișnuită.
        Se intră în regimul de <strong>înregistrare tardivă</strong>, care necesită{' '}
        <strong>aprobări suplimentare</strong> față de cazul normal. Copilul tot va fi înregistrat și
        va primi certificat și CNP, dar pașii sunt mai mulți și mai complicați, iar durata crește. Acesta
        este și motivul principal pentru care merită să tratezi termenul de 30 de zile cu maximă seriozitate.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Amâni declararea până aproape de ziua 30.</strong> Orice document lipsă sau eroare îți
          poate consuma marja de timp și te poate împinge în zona înregistrării tardive.
        </li>
        <li>
          <strong>Te prezinți la primăria de domiciliu, nu la cea a maternității.</strong> Nașterea se
          înregistrează la localitatea unde s-a produs, adică acolo unde se află maternitatea.
        </li>
        <li>
          <strong>Uiți certificatul de căsătorie.</strong> Dacă părinții sunt căsătoriți, acesta este
          necesar pentru întocmirea corectă a actului de naștere.
        </li>
        <li>
          <strong>Mergi fără actele de identitate valabile ale părinților.</strong> Buletinele expirate
          pot bloca procedura la ghișeu.
        </li>
        <li>
          <strong>Confunzi înregistrarea cu duplicatul.</strong> Înregistrarea creează actul de naștere;
          un <Link href="/duplicat-certificat-de-nastere/">duplicat</Link> se cere mai târziu, dacă ai
          nevoie de un nou exemplar.
        </li>
      </ul>

      <h2>Documente de stare civilă conexe</h2>
      <p>
        Înregistrarea nașterii este doar primul dintre actele de stare civilă pe care le vei gestiona
        de-a lungul timpului. Mai târziu îți pot fi utile și alte documente, pe care le poți obține și
        online:
      </p>
      <ul>
        <li>
          <Link href="/servicii/eliberare-certificat-de-nastere/">eliberarea certificatului de
          naștere</Link> (de exemplu, un nou exemplar pentru un dosar);
        </li>
        <li>
          <Link href="/servicii/eliberare-certificat-de-casatorie/">certificatul de căsătorie</Link>,
          dacă ai nevoie de el într-un demers administrativ;
        </li>
        <li>
          <Link href="/servicii/eliberare-certificat-de-celibat/">certificatul de celibat</Link> sau,
          pentru detalii, ghidul despre{' '}
          <Link href="/certificat-de-celibat/">certificatul de celibat</Link>;
        </li>
        <li>
          un <Link href="/duplicat-certificat-de-casatorie/">duplicat de certificat de
          căsătorie</Link>, dacă ai pierdut originalul.
        </li>
      </ul>

      <h2>Ce trebuie să știi pe scurt</h2>
      <ul>
        <li>Nașterea copilului născut viu se declară în 30 de zile de la naștere.</li>
        <li>Se înregistrează la starea civilă a localității unde s-a produs nașterea.</li>
        <li>
          Actele necesare: certificatul medical constatator, actele de identitate ale părinților și,
          dacă e cazul, certificatul de căsătorie.
        </li>
        <li>Copilul primește CNP la înregistrare.</li>
        <li>Primul certificat de naștere este gratuit.</li>
        <li>Depășirea termenului duce la o înregistrare tardivă, cu aprobări suplimentare.</li>
      </ul>

      <h2>Concluzie</h2>
      <p>
        Înregistrarea nașterii este un pas administrativ simplu dacă îl tratezi la timp: cu certificatul
        medical de la maternitate, actele de identitate ale părinților și, când e cazul, certificatul de
        căsătorie, mergi în <strong>30 de zile</strong> la starea civilă a localității unde s-a produs
        nașterea. Copilul primește CNP, iar <strong>primul certificat de naștere este gratuit</strong>.
        Respectarea termenului îți evită complicațiile unei înregistrări tardive. Iar mai târziu, dacă ai
        nevoie de un nou exemplar, îl poți obține printr-un{' '}
        <Link href="/duplicat-certificat-de-nastere/">duplicat de certificat de naștere</Link> sau direct
        prin{' '}
        <Link href="/servicii/eliberare-certificat-de-nastere/">eliberarea certificatului de naștere
        online</Link>.
      </p>
    </ArticleLayout>
  );
}
