import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'transcriere-certificat-de-nastere';
const TITLE = 'Transcriere Certificat de Naștere din Străinătate: Ghid Complet';
const DESCRIPTION =
  'Copilul s-a născut în străinătate? Vezi cum se face transcrierea certificatului de naștere în registrele din România: apostilă, traducere legalizată, termen și obținerea CNP.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';

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
      publishedLabel="22 iunie 2026"
      updatedLabel="22 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-nastere',
          label: 'Certificat de Naștere Online',
          desc: 'Solicită online certificatul de naștere sau duplicatul, fără drum la Starea Civilă.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este transcrierea certificatului de naștere?',
          a: 'Transcrierea este procedura prin care un certificat de naștere emis de autoritățile dintr-o altă țară este înscris (transcris) în registrele de stare civilă din România. Pentru copilul unui cetățean român născut în străinătate, actul străin nu are efecte depline în România până nu este transcris; abia după transcriere se poate emite certificatul de naștere românesc.',
        },
        {
          q: 'Am nevoie de apostilă pentru transcrierea certificatului de naștere?',
          a: 'De regulă, da. Certificatul străin trebuie să fie apostilat (pentru statele membre ale Convenției de la Haga) și însoțit de o traducere legalizată în limba română. Există însă și excepția extrasului multilingv eliberat conform Convenției de la Viena din 1976, care este recunoscut fără apostilă și fără traducere.',
        },
        {
          q: 'Cât durează transcrierea certificatului de naștere?',
          a: 'Termenul este de aproximativ 30 de zile de la data depunerii cererii complete. Durata poate varia în funcție de instituția competentă și de complexitatea dosarului, dar 30 de zile este reperul standard.',
        },
        {
          q: 'De ce este obligatorie transcrierea?',
          a: 'Transcrierea este obligatorie pentru ca minorul să poată obține codul numeric personal (CNP) și, ulterior, actul de identitate românesc. Fără transcriere, copilul nu apare în evidențele de stare civilă din România.',
        },
        {
          q: 'Transcrierea certificatului de naștere este diferită de cea a căsătoriei?',
          a: 'Da, sunt proceduri distincte. Transcrierea certificatului de naștere privește actul de naștere al unei persoane, iar transcrierea certificatului de căsătorie privește actul de căsătorie. Documentele și instituțiile competente pot diferi, chiar dacă logica (apostilă plus traducere sau extras multilingv) este similară.',
        },
      ]}
    >
      <p>
        Atunci când copilul unui cetățean român se naște în străinătate, actul de naștere este emis
        de autoritățile din țara respectivă. Pentru ca acest act să producă efecte depline în
        România — adică pentru ca minorul să poată obține <strong>CNP</strong> și ulterior buletin —
        certificatul străin trebuie <strong>transcris în registrele de stare civilă din România</strong>.
        În acest ghid afli ce înseamnă transcrierea certificatului de naștere, ce documente sunt
        necesare (apostilă, traducere legalizată sau extras multilingv), în cât timp se face și de ce
        este obligatorie.
      </p>

      <h2>Ce înseamnă transcrierea certificatului de naștere</h2>
      <p>
        Transcrierea este procedura prin care un <strong>certificat de naștere emis în străinătate</strong>{' '}
        este înscris în registrele de stare civilă din România. Practic, statul român „preia” actul
        străin și emite, pe baza lui, un certificat de naștere românesc. Fără transcriere, copilul
        născut în afara țării nu există în evidențele românești, chiar dacă unul sau ambii părinți
        sunt cetățeni români.
      </p>
      <p>
        Este important de reținut că transcrierea certificatului de naștere este o procedură
        <strong> distinctă</strong> de{' '}
        <Link href="/transcriere-certificat-de-casatorie/">transcrierea certificatului de căsătorie</Link>.
        Prima privește actul de naștere al unei persoane (de regulă al unui minor), a doua privește
        actul de căsătorie a doi soți. Deși logica documentelor este asemănătoare, dosarele și uneori
        instituțiile competente sunt diferite.
      </p>

      <h2>De ce este obligatorie transcrierea</h2>
      <p>
        Transcrierea nu este opțională. Ea este <strong>obligatorie</strong> pentru a putea obține:
      </p>
      <ul>
        <li>
          <strong>codul numeric personal (CNP)</strong> al copilului — acesta se atribuie odată cu
          înregistrarea în registrele românești;
        </li>
        <li>
          ulterior, <strong>actul de identitate</strong> românesc, atunci când copilul ajunge la
          vârsta la care i se eliberează cartea de identitate;
        </li>
        <li>
          recunoașterea deplină a statutului civil al copilului în România, pentru orice demers
          administrativ (înscriere la școală, pașaport, moșteniri etc.).
        </li>
      </ul>
      <p>
        Pe scurt: actul de naștere străin atestă nașterea, dar pentru ca minorul să fie „vizibil”
        pentru autoritățile române, certificatul trebuie transcris.
      </p>

      <h2>Acte necesare: apostilă și traducere sau extras multilingv</h2>
      <p>
        Pentru transcriere, certificatul de naștere străin trebuie pregătit într-una dintre cele două
        variante acceptate:
      </p>
      <ul>
        <li>
          <strong>Certificat apostilat plus traducere legalizată</strong> — certificatul emis în
          străinătate primește <strong>apostila</strong> (pentru statele membre ale Convenției de la
          Haga) și este însoțit de o <strong>traducere legalizată</strong> în limba română;
        </li>
        <li>
          <strong>Extras multilingv</strong> — eliberat conform{' '}
          <strong>Convenției de la Viena din 1976</strong>, acest tip de document este recunoscut
          direct, <strong>fără apostilă și fără traducere</strong>, deoarece este deja redactat în mai
          multe limbi într-un format standardizat.
        </li>
      </ul>
      <p>
        Iată, pe scurt, diferența dintre cele două căi:
      </p>
      <table>
        <thead>
          <tr>
            <th>Variantă</th>
            <th>Apostilă</th>
            <th>Traducere legalizată</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Certificat clasic (Convenția de la Haga)</td>
            <td>Da, necesară</td>
            <td>Da, necesară</td>
          </tr>
          <tr>
            <td>Extras multilingv (Convenția de la Viena 1976)</td>
            <td>Nu</td>
            <td>Nu</td>
          </tr>
        </tbody>
      </table>
      <p>
        Alegerea variantei nu îți aparține întotdeauna: depinde de ce tip de document poate emite
        autoritatea din țara unde s-a născut copilul. Dacă statul respectiv eliberează extrase
        multilingve, această cale este de departe cea mai simplă, pentru că elimină atât apostila, cât
        și traducerea.
      </p>

      <h2>Cât durează transcrierea</h2>
      <p>
        Termenul standard este de <strong>aproximativ 30 de zile de la data depunerii</strong> cererii
        complete. Acest interval poate varia ușor în funcție de instituția competentă și de cât de
        complet este dosarul la depunere. Un dosar cu acte lipsă sau cu o traducere care nu respectă
        cerințele poate fi întârziat, de aceea pregătirea corectă din prima încercare este esențială.
      </p>

      <h2>Exemplu concret</h2>
      <p>
        Să presupunem că un copil se naște într-o țară membră a Convenției de la Haga, iar părinții
        sunt cetățeni români. Autoritatea locală emite certificatul de naștere, pe care părinții îl
        apostilează. Apoi obțin o traducere legalizată în limba română. Cu acest dosar depun cererea
        de transcriere, iar în aproximativ 30 de zile copilul este înregistrat în registrele de stare
        civilă din România și primește <strong>CNP</strong>. Dacă, în schimb, statul respectiv ar fi
        eliberat un <strong>extras multilingv</strong>, părinții ar fi sărit complet peste apostilă și
        traducere.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Confuzia cu transcrierea căsătoriei</strong> — sunt proceduri diferite; nu folosi
          documentele sau formularele pentru un act atunci când ai nevoie de transcrierea celuilalt.
        </li>
        <li>
          <strong>Lipsa apostilei</strong> — pentru certificatele clasice din statele Convenției de la
          Haga, fără apostilă dosarul nu poate fi acceptat.
        </li>
        <li>
          <strong>Traducere care nu este legalizată</strong> — o simplă traducere nu este suficientă;
          aceasta trebuie legalizată conform cerințelor.
        </li>
        <li>
          <strong>Ignorarea extrasului multilingv</strong> — mulți părinți fac apostilă și traducere
          inutil, deși ar fi putut cere direct un extras multilingv care le-ar fi scutit ambii pași.
        </li>
        <li>
          <strong>Amânarea transcrierii</strong> — fără transcriere copilul nu poate obține CNP și
          act de identitate, ceea ce blochează ulterior alte demersuri (pașaport, înscrieri).
        </li>
      </ul>

      <h2>Ce trebuie să știi înainte de a depune</h2>
      <p>
        Înainte de a începe, verifică ce tip de document poate emite autoritatea străină (certificat
        clasic sau extras multilingv), pentru că asta decide dacă ai nevoie de apostilă și traducere.
        Asigură-te că toate datele copilului și ale părinților sunt corecte și concordante între acte
        — orice neconcordanță de nume sau de date poate complica înregistrarea. Și ține cont de
        termenul de aproximativ 30 de zile atunci când planifici alte demersuri care depind de CNP-ul
        copilului.
      </p>

      <h2>Cum te ajutăm prin eGhișeul.ro</h2>
      <p>
        Dacă ești în diaspora sau pur și simplu vrei să eviți drumurile și birocrația, te putem ajuta
        să pregătești dosarul corect pentru transcriere. Vezi detaliile despre serviciile noastre de{' '}
        <Link href={nastereUrl}>certificat de naștere online</Link> sau, dacă ai pierdut un act
        existent în România, citește ghidul despre{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificatul de naștere pierdut</Link>. Pentru
        costurile de legalizare și autentificare la notar, poți folosi orientativ și{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
      </p>

      <h2>Concluzie</h2>
      <p>
        Transcrierea certificatului de naștere din străinătate este pasul obligatoriu prin care copilul
        unui cetățean român, născut în afara țării, devine recunoscut în evidențele de stare civilă din
        România și poate obține <strong>CNP</strong> și act de identitate. Cheia este să pregătești
        corect dosarul: fie <strong>certificat apostilat plus traducere legalizată</strong>, fie un{' '}
        <strong>extras multilingv</strong> conform Convenției de la Viena din 1976. Cu actele complete,
        transcrierea durează în jur de <strong>30 de zile</strong>. Nu uita că aceasta este o procedură
        distinctă de{' '}
        <Link href="/transcriere-certificat-de-casatorie/">transcrierea certificatului de căsătorie</Link>.
      </p>
    </ArticleLayout>
  );
}
