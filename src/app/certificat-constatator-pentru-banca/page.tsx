import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-pentru-banca';
const TITLE = 'Certificat Constatator pentru Bancă: De Ce Îl Cere și Cum Îl Obții';
const DESCRIPTION =
  'Banca îți cere certificat constatator emis în ultimele 30 de zile pentru cont de firmă sau credit. Vezi de ce, ce versiune îți trebuie și cum îl obții online ca PDF original.';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';
const OGIMAGE = '/og/services/certificat-constatator.png';
const CATEGORY = 'Comercial / ONRC';

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
      category={CATEGORY}
      image={OGIMAGE}
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="22 iunie 2026"
      updatedLabel="22 iunie 2026"
      relatedServices={[
        {
          slug: 'certificat-constatator',
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator Online',
          desc: 'Obține certificatul constatator de la ONRC online, ca PDF e-semnat, fără drum la registru.',
        },
      ]}
      faqs={[
        {
          q: 'De ce îmi cere banca un certificat constatator?',
          a: 'Banca îl folosește pentru verificările KYC/AML: confirmă că firma este Activă, cine este administratorul cu drept de semnătură, care sunt codurile CAEN și cine sunt beneficiarii reali. Pe baza lui banca știe că persoana care deschide contul sau semnează contractul de credit chiar poate angaja legal societatea.',
        },
        {
          q: 'Ce versiune de certificat constatator îmi trebuie pentru bancă?',
          a: 'Pentru deschiderea unui cont sau pentru un credit este suficientă versiunea de bază, cea cu taxa oficială de 30 lei la ONRC. Ea cuprinde starea firmei, sediul, administratorii, capitalul, codurile CAEN și beneficiarii reali. Nu ai nevoie de varianta cu istoric, decât dacă banca îți cere explicit acest lucru.',
        },
        {
          q: 'De câte zile trebuie să fie certificatul ca să fie acceptat de bancă?',
          a: 'Băncile cer de obicei un certificat constatator emis în ultimele 30 de zile. Documentul nu „expiră” oficial, dar banca vrea o fotografie recentă a firmei, așa că un certificat mai vechi de o lună este de regulă refuzat.',
        },
        {
          q: 'Banca îmi cere certificatul „în original”. PDF-ul e-semnat este valabil?',
          a: 'Da. Certificatul constatator descărcat online de la ONRC este semnat electronic, iar PDF-ul e-semnat este chiar documentul original, nu o copie. Are aceeași valoare juridică cu cel ridicat de la ghișeu și este acceptat de bănci. Nu trebuie să tipărești și să ștampilezi nimic.',
        },
        {
          q: 'Pot obține certificatul constatator pentru bancă fără să merg la ONRC?',
          a: 'Da. Se obține integral online prin myportal.onrc.ro. Prin eGhișeul.ro completezi datele firmei, noi solicităm certificatul de la ONRC și îți livrăm PDF-ul e-semnat, gata de trimis la bancă, de regulă în aceeași zi pentru versiunea de bază.',
        },
      ]}
    >
      <p>
        Când deschizi un cont de firmă sau ceri un credit pentru afacere, aproape sigur ți se va cere
        un <strong>certificat constatator pentru bancă</strong>. Este unul dintre cele mai frecvent
        solicitate documente la ghișeul băncii, alături de actul de identitate al administratorului și
        de actele firmei. În acest ghid afli de ce îl cere banca, ce versiune îți trebuie de fapt, de
        câte zile trebuie să fie și cum îl obții online, ca <strong>PDF original e-semnat</strong>,
        fără drum la registrul comerțului.
      </p>

      <h2>Ce este certificatul constatator</h2>
      <p>
        Certificatul constatator este documentul oficial emis de{' '}
        <strong>Oficiul Național al Registrului Comerțului (ONRC)</strong> care descrie situația la zi
        a unei firme sau a unui PFA. El confirmă datele de identificare ale societății și starea ei
        juridică. Pentru bancă, acest document este „buletinul” firmei: arată dacă entitatea este
        activă și cine o poate reprezenta legal.
      </p>
      <p>
        Documentul cuprinde, în versiunea de bază, informațiile esențiale despre firmă:
      </p>
      <ul>
        <li>
          <strong>denumirea, CUI-ul și numărul de înregistrare</strong> la registrul comerțului;
        </li>
        <li>
          <strong>starea firmei</strong> — element-cheie pentru bancă: trebuie să fie „Activă”;
        </li>
        <li>
          <strong>sediul social</strong> și, după caz, punctele de lucru declarate;
        </li>
        <li>
          <strong>administratorii</strong> și puterile lor de reprezentare (cine poate semna);
        </li>
        <li>
          <strong>capitalul social</strong> și structura asociaților;
        </li>
        <li>
          <strong>codurile CAEN</strong> autorizate — obiectul de activitate al firmei;
        </li>
        <li>
          <strong>beneficiarii reali</strong>, esențiali pentru verificările antispălare de bani.
        </li>
      </ul>

      <h2>De ce îți cere banca un certificat constatator</h2>
      <p>
        Băncile sunt obligate prin lege să facă verificări de tip <strong>KYC</strong> („cunoaște-ți
        clientul”) și <strong>AML</strong> (prevenirea spălării banilor) înainte de a deschide un cont
        sau de a acorda un credit unei firme. Certificatul constatator este sursa oficială prin care
        banca verifică, dintr-o singură privire, mai multe lucruri:
      </p>
      <ul>
        <li>
          <strong>că administratorul poate semna</strong> — persoana care deschide contul sau
          contractează creditul trebuie să aibă drept de reprezentare conform registrului;
        </li>
        <li>
          <strong>că firma este Activă</strong> — o societate suspendată, radiată sau în insolvență
          schimbă complet decizia băncii;
        </li>
        <li>
          <strong>codurile CAEN</strong> — banca verifică dacă obiectul de activitate corespunde cu
          scopul contului sau al creditului;
        </li>
        <li>
          <strong>beneficiarii reali</strong> — cine controlează efectiv firma, parte obligatorie din
          procedura AML.
        </li>
      </ul>
      <p>
        Pe scurt: banca nu se bazează pe declarațiile tale, ci pe documentul oficial de la ONRC. Fără
        el, dosarul de deschidere de cont sau de credit nu poate fi procesat.
      </p>

      <h2>Ce versiune de certificat constatator îți trebuie pentru bancă</h2>
      <p>
        Aici se face cea mai frecventă confuzie. ONRC emite mai multe tipuri de certificate
        constatatoare, iar pentru bancă, în marea majoritate a cazurilor,{' '}
        <strong>versiunea de bază este suficientă</strong>. Aceasta are taxa oficială la ONRC de{' '}
        <strong>30 lei</strong> și conține exact ce verifică banca: starea firmei, administratorii,
        sediul, capitalul, codurile CAEN și beneficiarii reali.
      </p>
      <p>
        <strong>Nu ai nevoie de versiunea cu istoric</strong> (mai scumpă și mai amplă) decât dacă
        banca îți cere în mod explicit acest lucru — situație rară pentru un cont obișnuit sau un
        credit standard. Înainte să comanzi o variantă scumpă „ca să fii sigur”, întreabă consilierul
        bancar ce versiune acceptă; aproape întotdeauna răspunsul este cea de bază.
      </p>

      <h2>Versiunea de bază vs. cea cu istoric</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Criteriu</th>
              <th>Versiunea de bază</th>
              <th>Versiunea cu istoric</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Taxă oficială ONRC</td>
              <td>30 lei</td>
              <td>Mai mare</td>
            </tr>
            <tr>
              <td>Stare firmă, sediu, administratori</td>
              <td>Da</td>
              <td>Da</td>
            </tr>
            <tr>
              <td>Coduri CAEN, capital, beneficiari reali</td>
              <td>Da</td>
              <td>Da</td>
            </tr>
            <tr>
              <td>Istoricul modificărilor în timp</td>
              <td>Nu</td>
              <td>Da</td>
            </tr>
            <tr>
              <td>Acceptat de bancă pentru cont / credit</td>
              <td>Da, în mod uzual</td>
              <td>Doar dacă e cerut explicit</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>De câte zile trebuie să fie certificatul</h2>
      <p>
        Băncile cer, de regulă, un certificat constatator <strong>emis în ultimele 30 de zile</strong>.
        Documentul nu „expiră” oficial — informația rămâne valabilă cât timp firma nu se schimbă — dar
        banca vrea o <strong>fotografie recentă</strong> a societății, ca să fie sigură că datele sunt
        actuale la momentul deschiderii contului sau al acordării creditului.
      </p>
      <p>
        Concluzia practică: nu folosi un certificat vechi de câteva luni pe care îl ai în sertar. Cere
        unul nou exact înainte de a depune dosarul la bancă, ca să te încadrezi confortabil în
        intervalul de 30 de zile.
      </p>

      <h2>„Trebuie în original?” — răspunsul scurt</h2>
      <p>
        Mulți antreprenori se blochează la întrebarea pe care le-o pune banca: „aveți certificatul în
        original?”. Răspunsul este simplu: <strong>PDF-ul e-semnat este originalul</strong>.
        Certificatul constatator obținut online de la ONRC este <strong>semnat electronic</strong>, iar
        semnătura electronică îi conferă aceeași valoare juridică cu a unui document tipărit și
        ștampilat la ghișeu.
      </p>
      <p>
        Nu trebuie să tipărești PDF-ul, să-l ștampilezi sau să-l legalizezi. Îl trimiți băncii exact
        așa cum l-ai primit — fișierul PDF cu semnătură electronică. Multe bănci preferă chiar acest
        format, pentru că pot verifica automat valabilitatea semnăturii. Dacă un funcționar insistă pe
        „original pe hârtie”, poți explica liniștit că documentul electronic <em>este</em> originalul,
        conform reglementărilor ONRC.
      </p>

      <h2>Cum obții certificatul constatator pentru bancă online</h2>
      <p>
        Nu trebuie să te deplasezi la registrul comerțului. Certificatul se obține integral{' '}
        <strong>online prin myportal.onrc.ro</strong>, iar prin{' '}
        <Link href="/servicii/certificat-constatator-online/">eGhișeul.ro</Link> procesul este și mai
        simplu:
      </p>
      <ul>
        <li>completezi datele firmei (CUI-ul) în formularul online, în câteva minute;</li>
        <li>noi solicităm certificatul de la ONRC, în versiunea de bază potrivită pentru bancă;</li>
        <li>
          primești <strong>PDF-ul e-semnat</strong>, document original, gata de trimis la bancă;
        </li>
        <li>pentru versiunea de bază, livrarea se face de regulă în aceeași zi.</li>
      </ul>
      <p>
        Astfel ai un document recent, în intervalul de 30 de zile cerut de bancă, fără drumuri și fără
        cozi. Vezi pașii și costul exact pe pagina de{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator online</Link>.
      </p>

      <h2>Exemplu: deschiderea unui cont pentru un SRL nou</h2>
      <p>
        Să presupunem că tocmai ți-ai înființat un SRL și vrei să deschizi contul firmei la o bancă.
        Consilierul îți cere actul de identitate, actele de înființare și un{' '}
        <strong>certificat constatator emis în ultimele 30 de zile</strong>. Comanzi online versiunea
        de bază (30 lei taxă ONRC), primești în câteva ore PDF-ul e-semnat, îl atașezi la dosar, iar
        banca confirmă din el că firma este Activă, că tu ești administratorul cu drept de semnătură și
        care sunt beneficiarii reali. Contul se deschide fără să fie nevoie de alte certificate. Același
        flux se aplică și pentru un PFA care vrea un cont dedicat activității.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Comanzi versiunea cu istoric „ca să fii sigur”.</strong> Plătești mai mult degeaba —
          pentru cont sau credit, banca acceptă în mod uzual versiunea de bază.
        </li>
        <li>
          <strong>Folosești un certificat vechi.</strong> Dacă e mai vechi de 30 de zile, banca îl
          poate refuza. Cere unul nou chiar înainte de a depune dosarul.
        </li>
        <li>
          <strong>Tipărești și cauți ștampile pentru „original”.</strong> PDF-ul e-semnat este deja
          originalul; nu are nevoie de ștampilă sau legalizare.
        </li>
        <li>
          <strong>Nu verifici starea firmei înainte.</strong> Dacă societatea apare suspendată sau cu
          mențiuni neașteptate, e mai bine să afli din certificat înainte de a merge la bancă.
        </li>
      </ul>

      <h2>Ce trebuie să reții</h2>
      <p>
        Pentru deschiderea unui cont de firmă sau pentru un credit, banca cere un{' '}
        <strong>certificat constatator de bază, emis în ultimele 30 de zile</strong>, prin care
        confirmă că firma este Activă, cine semnează, ce coduri CAEN are și cine sunt beneficiarii
        reali. Versiunea de bază (30 lei la ONRC) este suficientă, iar{' '}
        <strong>PDF-ul e-semnat este originalul</strong> acceptat de bancă — nu trebuie tipărit sau
        ștampilat. Cel mai simplu îl obții{' '}
        <Link href="/servicii/certificat-constatator-online/">online, prin eGhișeul.ro</Link>, de
        regulă în aceeași zi.
      </p>
      <p>
        Ai nevoie și de alte documente pentru dosare oficiale? Vezi și ghidurile pentru{' '}
        <Link href="/certificat-de-nastere-pierdut/">certificat de naștere pierdut</Link>,{' '}
        <Link href="/servicii/eliberare-certificat-de-casatorie/">certificat de căsătorie</Link> sau{' '}
        <Link href="/servicii/eliberare-certificat-de-celibat/">certificat de celibat</Link>, iar
        pentru estimarea costurilor notariale folosește{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>.
      </p>
    </ArticleLayout>
  );
}
