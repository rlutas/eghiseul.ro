import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'extras-carte-funciara-gratuit';
const TITLE = 'Extras de Carte Funciară Gratuit prin MyTerra — Ghid + Limite';
const DESCRIPTION =
  'Da, extrasul de carte funciară de informare este gratuit prin platforma MyTerra (ANCPI) din iunie 2025. ' +
  'Ce condiții sunt, cum îți faci cont, cât durează și când are sens varianta plătită, eliberată instant.';
const DATE_PUBLISHED = '2026-07-13';
const DATE_MODIFIED = '2026-07-13';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/images/articole/cum-aflam-numarul-carte-functionara-si-nr-cadastral.webp',
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
      publishedLabel="13 iulie 2026"
      updatedLabel="13 iulie 2026"
      image="/images/articole/cum-aflam-numarul-carte-functionara-si-nr-cadastral.webp"
      relatedServices={[
        { slug: 'extras-carte-funciara', label: 'Extras de Carte Funciară Online', desc: 'Fără cont ANCPI, eliberat automat în câteva minute, 24/7.' },
        { href: '/cum-aflam-numarul-carte-functionara-si-nr-cadastral/', label: 'Cum afli numărul de carte funciară', desc: 'Din acte, dintr-un extras vechi sau după adresă.' },
        { href: '/totul-despre-cartea-funciara-colectiva/', label: 'Cartea funciară colectivă', desc: 'Ce este și când ai nevoie de ea.' },
      ]}
      faqs={[
        {
          q: 'Este gratuit extrasul de carte funciară?',
          a: 'Da. Din 2 iunie 2025, extrasul de carte funciară pentru informare și extrasul din planul cadastral pe ortofotoplan se eliberează gratuit prin platforma MyTerra a ANCPI. Condiția este să ai cont MyTerra cu identitatea verificată (ROeID, semnătură electronică calificată sau o vizită la ghișeu).',
        },
        {
          q: 'Ce documente sunt gratuite prin MyTerra?',
          a: 'Două documente: extrasul de carte funciară pentru informare și extrasul din planul cadastral pe ortofotoplan. Extrasul autentic (pentru notariat) și celelalte servicii ANCPI rămân cu plată.',
        },
        {
          q: 'Cât durează să obții extrasul gratuit prin MyTerra?',
          a: 'După ce ai contul verificat, extrasul se emite în general repede. Partea care durează este contul: dacă nu ai ROeID sau semnătură electronică calificată, identitatea se confirmă la ghișeu, iar procesarea poate dura până la 72 de ore.',
        },
        {
          q: 'Pot obține extrasul gratuit fără cont MyTerra?',
          a: 'Nu. Gratuitatea este condiționată de contul MyTerra cu identitate verificată. Fără cont, variantele sunt ghișeul OCPI sau un serviciu online care obține extrasul pentru tine.',
        },
        {
          q: 'Extrasul gratuit de informare e valabil la notar?',
          a: 'Nu pentru autentificarea actelor. Pentru tranzacții notariale este nevoie de extrasul de carte funciară pentru autentificare, pe care îl solicită notarul. Extrasul de informare rămâne util pentru verificări: proprietar, sarcini, ipoteci, suprafețe.',
        },
        {
          q: 'Pot scoate extrasul de carte funciară noaptea sau în weekend?',
          a: 'Prin MyTerra, da, dacă ai deja cont verificat. Dacă nu ai cont și îți trebuie repede, eGhișeul eliberează extrasul automat, 24/7, în câteva minute, fără niciun cont — inclusiv sâmbăta, duminica și noaptea.',
        },
      ]}
    >
      <p>
        Răspunsul scurt: da, extrasul de carte funciară pentru informare este gratuit. Din 2 iunie 2025, ANCPI îl
        eliberează fără nicio taxă prin platforma <a href="https://myeterra.ancpi.ro/" rel="nofollow noopener" target="_blank">MyTerra</a>.
        Anunțul a fost făcut chiar de directorul general al ANCPI, iar{' '}
        <a href="https://www.juridice.ro/784317/extrasele-de-carte-funciara-se-pot-elibera-gratuit-prin-platforma-myeterra.html" rel="noopener" target="_blank">juridice.ro</a>{' '}
        și avocatnet.ro au scris pe larg despre asta la vremea respectivă.
      </p>
      <p>
        Există însă o condiție care schimbă socoteala pentru mulți: îți trebuie cont MyTerra cu identitatea
        verificată. Aici se împiedică majoritatea oamenilor, așa că merită să știi exact ce presupune înainte să te
        apuci. Mai jos ai tot procesul, pas cu pas, plus situațiile în care varianta plătită rămâne alegerea practică.
      </p>

      <h2>Ce primești gratuit prin MyTerra</h2>
      <p>Două documente:</p>
      <ul>
        <li>
          <strong>Extrasul de carte funciară pentru informare</strong> — documentul care arată proprietarul actual,
          suprafața, sarcinile și ipotecile unui imobil. Cel mai cerut document ANCPI.
        </li>
        <li>
          <strong>Extrasul din planul cadastral pe ortofotoplan</strong> — poziționarea imobilului pe hartă.
        </li>
      </ul>
      <p>
        Restul serviciilor ANCPI rămân cu plată. Extrasul pentru autentificare (cel cerut de notar la
        vânzare-cumpărare) se obține în continuare doar prin notariat.
      </p>

      <h2>Condiția: cont MyTerra cu identitate verificată</h2>
      <p>
        Gratuitatea nu funcționează anonim. ANCPI vrea să știe cine solicită documentul, deci contul trebuie legat de
        identitatea ta reală. Ai patru variante:
      </p>
      <ol>
        <li>
          <strong>Autentificare cu ROeID</strong> — dacă ai cont în aplicația de identitate electronică a statului,
          contul MyTerra se creează automat. Cea mai simplă rută, cu mențiunea că înrolarea în ROeID e un proces
          separat, cu propriii pași.
        </li>
        <li>
          <strong>Semnătură electronică calificată</strong> — dacă ai deja una (certificat calificat), poți face
          contul complet online, cu link de confirmare pe email.
        </li>
        <li>
          <strong>Verificare la ghișeu</strong> — faci contul online, apoi mergi o singură dată la un birou teritorial
          ANCPI cu buletinul, în termen de 72 de ore, ca să confirmi identitatea.
        </li>
        <li>
          <strong>Cerere direct la ghișeu</strong> — totul de la biroul teritorial, cu procesare în maximum 72 de ore.
        </li>
      </ol>
      <p>
        Dacă ai deja ROeID sau semnătură calificată, treaba se rezolvă din fotoliu. Dacă nu ai niciuna, apare drumul
        la ghișeu — exact lucrul pe care voiai să-l eviți cerând documentul online.
      </p>

      <h2>Pașii, după ce ai contul</h2>
      <ol>
        <li>Te loghezi pe myeterra.ancpi.ro.</li>
        <li>Cauți imobilul. Ai nevoie de numărul de carte funciară sau de numărul cadastral, plus județ și localitate.</li>
        <li>Soliciți extrasul de informare și îl primești în cont, în format electronic.</li>
      </ol>
      <p>
        Dacă nu știi numărul de carte funciară sau cel cadastral, am scris un{' '}
        <Link href="/cum-aflam-numarul-carte-functionara-si-nr-cadastral/">ghid separat despre unde le găsești</Link>{' '}
        — în actele de proprietate, într-un extras vechi sau după adresă.
      </p>

      <h2>Limitele variantei gratuite</h2>
      <p>Ca să nu descoperi pe drum:</p>
      <ul>
        <li>
          <strong>Contul cere identificare reală.</strong> Fără ROeID sau semnătură calificată, ajungi la ghișeu.
          Pentru cineva care vrea documentul azi, dintr-un alt oraș sau din străinătate, asta blochează tot procesul.
        </li>
        <li>
          <strong>Îți trebuie identificatorul imobilului.</strong> Platforma nu te ajută să găsești imobilul doar după
          adresă. Dacă ai moștenit o casă și nu ai actele la îndemână, te oprești aici.
        </li>
        <li>
          <strong>Doar extras de informare.</strong> Pentru autentificare la notar rămâne circuitul notarial.
        </li>
        <li>
          <strong>Procesul depinde de sistemele statului.</strong> ROeID, confirmări pe email, termene de 72 de ore la
          verificare. Când merge, merge. Când nu, nu ai la cine suna la 11 noaptea.
        </li>
      </ul>

      <h2>Când are sens varianta plătită</h2>
      <p>
        Sincer: dacă ai cont MyTerra verificat și timp, folosește varianta gratuită. Pentru asta am scris ghidul de
        mai sus.
      </p>
      <p>
        Varianta plătită are sens când timpul contează mai mult decât taxa. Prin{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>serviciul nostru de extras de carte funciară online</Link>{' '}
        documentul se eliberează automat, în câteva minute, la orice oră — inclusiv noaptea, în weekend și de
        sărbători. Fără cont ANCPI, fără ROeID, fără drum la ghișeu. În plus, putem identifica imobilul și după
        adresă, când nu ai numărul de carte funciară. Costă 89 lei cu toate taxele incluse, iar documentul este
        extrasul oficial ANCPI, cu semnătură electronică, verificabil.
      </p>

      <h2>Gratuit prin MyTerra vs. eGhișeul — comparația onestă</h2>
      <ul>
        <li><strong>Preț:</strong> MyTerra 0 lei · eGhișeul 89 lei, taxe incluse.</li>
        <li><strong>Cont:</strong> MyTerra cere cont cu identitate verificată (ROeID / semnătură calificată / ghișeu) · eGhișeul nu cere niciun cont.</li>
        <li><strong>Timp până la document:</strong> MyTerra — rapid după ce ai cont, dar contul poate însemna drum la ghișeu și până la 72 de ore · eGhișeul — câteva minute de la comandă.</li>
        <li><strong>Program:</strong> MyTerra funcționează non-stop pentru conturi existente · eGhișeul eliberează automat 24/7, fără nicio condiție prealabilă.</li>
        <li><strong>Identificare după adresă:</strong> MyTerra nu · eGhișeul da.</li>
        <li><strong>Documentul:</strong> identic — extrasul oficial ANCPI de informare, în format electronic.</li>
      </ul>
      <p>
        Alegerea e simplă: ai cont verificat și răbdare → gratuit. Îți trebuie acum, la orice oră, fără birocrație →{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>comandă online</Link> și primești extrasul pe email în câteva
        minute.
      </p>
    </ArticleLayout>
  );
}
