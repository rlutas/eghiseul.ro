import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'certificat-constatator-pentru-notar';
const TITLE = 'Certificat Constatator pentru Notar: Ce Tip Îți Cere și Cum Îl Obții';
const DESCRIPTION =
  'Notarul îți cere un certificat constatator de cel mult 30 de zile pentru cesiune de părți sociale, vânzarea firmei sau acte imobiliare. Vezi ce versiune accepți și cum îl obții online.';
const CATEGORY = 'Comercial / ONRC';
const OGIMAGE = '/og/services/certificat-constatator.png';
const DATE_PUBLISHED = '2026-06-22';
const DATE_MODIFIED = '2026-06-22';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: OGIMAGE,
});

export default function Page() {
  const constatatorUrl = serviceUrl('certificat-constatator');
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
          label: 'Certificat Constatator Online',
          desc: 'Obține certificatul constatator emis de ONRC, cu PDF e-semnat, valabil la notar.',
        },
        {
          href: '/calculator/taxe-notariale/',
          label: 'Calculator Taxe Notariale',
          desc: 'Estimează onorariul notarial înainte de a merge la birou.',
        },
      ]}
      faqs={[
        {
          q: 'Ce tip de certificat constatator îmi cere notarul?',
          a: 'Pentru majoritatea actelor (cesiune de părți sociale, vânzarea firmei, acte imobiliare ale firmei) notarul acceptă certificatul constatator de bază, care arată cine sunt asociații și administratorii și cine poate semna legal pentru firmă. Versiunea istorică (raportul de istoric) se folosește mai ales la due-diligence, atunci când cumperi o firmă și vrei să vezi toate modificările din timp.',
        },
        {
          q: 'Cât de vechi poate fi certificatul constatator acceptat de notar?',
          a: 'Notarul cere de regulă un certificat constatator de cel mult 30 de zile, ca să fie sigur că informația despre administratori și asociați este de actualitate la momentul semnării actului. Un certificat mai vechi de o lună riscă să fie refuzat, așa că îl obții cât mai aproape de data programării la notar.',
        },
        {
          q: 'Certificatul constatator în PDF e-semnat este acceptat de notar?',
          a: 'Da. Certificatul constatator emis de ONRC în format PDF, cu semnătură electronică, este documentul original — nu o copie. Notarul îl poate verifica electronic, fără să fie nevoie de un exemplar pe hârtie ștampilat la ghișeu.',
        },
        {
          q: 'Care este diferența dintre certificatul de bază și raportul istoric?',
          a: 'Certificatul de bază reflectă situația actuală a firmei (asociați, administratori, sediu, capital, obiect de activitate) și este suficient pentru semnarea actelor la notar. Raportul istoric (în jur de 250 de lei) arată și modificările succesive din timp și se folosește pentru verificarea aprofundată a unei firme înainte de cumpărare.',
        },
        {
          q: 'Pot obține certificatul constatator pentru notar fără să merg la ONRC?',
          a: 'Da. Prin eGhișeul.ro soliciți certificatul constatator online, iar documentul emis de ONRC îți este livrat în format PDF e-semnat, gata de prezentat la notar. Nu trebuie să stai la coadă la registrul comerțului.',
        },
      ]}
    >
      <p>
        Când programezi o <strong>semnare la notar</strong> pentru o firmă — fie că vinzi părți
        sociale, vinzi firma în întregime sau încheii un act imobiliar în numele societății — aproape
        sigur ți se cere un <strong>certificat constatator</strong>. Notarul nu cere acest document
        din formalism: are nevoie să verifice oficial <strong>cine poate semna legal pentru firmă</strong>{' '}
        la momentul exact al actului. În acest ghid vezi ce versiune îți trebuie, cât de vechi poate
        fi, cum o accepți și cum o obții online, fără drum la registrul comerțului.
      </p>

      <h2>De ce îți cere notarul un certificat constatator</h2>
      <p>
        Un act notarial care implică o firmă trebuie semnat de <strong>persoana îndreptățită</strong>{' '}
        — administratorul sau asociatul cu putere de reprezentare. Notarul nu poate presupune cine
        deține aceste calități; el le verifică pe baza unui document oficial emis de{' '}
        <strong>Oficiul Național al Registrului Comerțului (ONRC)</strong>. Certificatul constatator
        este exact acel document: confirmă, la zi, cine sunt asociații, cine este administrator și
        cine are dreptul să semneze obligații în numele societății.
      </p>
      <p>
        Fără acest certificat, notarul nu poate autentifica actul, pentru că nu are dovada că semnatarul
        chiar reprezintă legal firma. De aceea certificatul constatator este, practic, prima piesă din
        dosarul pe care îl duci la birou.
      </p>

      <h2>Pentru ce acte notariale ai nevoie de certificat constatator</h2>
      <p>Cele mai frecvente situații în care notarul îți cere acest document sunt:</p>
      <ul>
        <li>
          <strong>cesiunea de părți sociale</strong> — transferul de părți sociale între asociați sau
          către o persoană nouă;
        </li>
        <li>
          <strong>vânzarea firmei</strong> — preluarea integrală a societății de către un nou
          proprietar;
        </li>
        <li>
          <strong>acte imobiliare ale firmei</strong> — vânzarea sau cumpărarea unui imobil în numele
          societății, ipoteci, garanții.
        </li>
      </ul>
      <p>
        În toate aceste cazuri, miza este aceeași: notarul trebuie să confirme că persoana care semnează
        are puterea legală să o facă, iar certificatul constatator îi oferă această certitudine.
      </p>

      <h2>Ce versiune de certificat constatator îți trebuie</h2>
      <p>
        Aici se face cea mai des întâlnită confuzie. Există, în esență, două variante utile la notar:
      </p>

      <table>
        <thead>
          <tr>
            <th>Versiune</th>
            <th>Ce conține</th>
            <th>Când o folosești</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Certificat de bază</strong>
            </td>
            <td>
              Situația actuală a firmei: asociați, administratori, sediu, capital, obiect de activitate
            </td>
            <td>
              Acceptat de notar pentru cesiune de părți sociale, vânzarea firmei, acte imobiliare
            </td>
          </tr>
          <tr>
            <td>
              <strong>Raport istoric</strong> (~250 lei)
            </td>
            <td>Modificările succesive ale firmei în timp — istoricul complet al schimbărilor</td>
            <td>Due-diligence: verificarea aprofundată a unei firme înainte de cumpărare</td>
          </tr>
        </tbody>
      </table>

      <p>
        Pentru semnarea propriu-zisă la notar, <strong>versiunea de bază este acceptată</strong> și
        este suficientă. Raportul <strong>istoric</strong>, care costă în jur de 250 de lei, este util
        mai ales <strong>cumpărătorului</strong> care vrea să înțeleagă toate modificările prin care a
        trecut firma — schimbări de asociați, de administratori, de sediu — înainte de a o achiziționa.
        Pe scurt: pentru a semna, ai nevoie de cel de bază; pentru a verifica în profunzime, alegi
        istoricul.
      </p>

      <h2>Cât de vechi poate fi certificatul: regula celor 30 de zile</h2>
      <p>
        Aceasta este partea pe care mulți o ratează. Notarul cere un certificat constatator{' '}
        <strong>de cel mult 30 de zile</strong>. Motivul este simplu: structura unei firme se poate
        schimba oricând — un asociat poate ieși, un administrator poate fi revocat — iar notarul are
        nevoie de informația <strong>valabilă la momentul semnării</strong>, nu de una veche de luni de
        zile.
      </p>
      <p>
        În practică, asta înseamnă că nu are sens să obții certificatul prea devreme. Cel mai bine este
        să îl soliciți <strong>cu câteva zile înainte de programarea la notar</strong>, ca să te
        încadrezi confortabil în fereastra de 30 de zile. Dacă a expirat, va trebui pur și simplu să
        ceri unul nou — documentul este ușor de reînnoit.
      </p>

      <h2>Certificatul în PDF e-semnat este originalul</h2>
      <p>
        O întrebare frecventă: „pot duce la notar un certificat în format electronic?” Răspunsul este
        <strong> da</strong>. Certificatul constatator emis de ONRC în format{' '}
        <strong>PDF cu semnătură electronică</strong> este documentul <strong>original</strong>, nu o
        simplă copie. Notarul îl poate verifica electronic, iar valabilitatea lui nu depinde de o
        ștampilă pe hârtie. Nu mai trebuie să stai la coadă la ghișeu pentru un exemplar tipărit.
      </p>

      <h2>Exemplu concret: o cesiune de părți sociale</h2>
      <p>
        Să presupunem că doi asociați ai unui SRL vor să transfere o parte din părțile sociale către o
        persoană nouă. Pașii tipici sunt:
      </p>
      <ul>
        <li>se stabilește data semnării la notar;</li>
        <li>
          se obține un <strong>certificat constatator de bază</strong>, emis cu mai puțin de 30 de zile
          înainte;
        </li>
        <li>
          notarul verifică în certificat că asociații care semnează sunt chiar cei înregistrați și că
          au dreptul să cesioneze;
        </li>
        <li>se autentifică actul de cesiune, iar ulterior modificarea se înregistrează la ONRC.</li>
      </ul>
      <p>
        Dacă cumpărătorul ar vrea, în plus, să se asigure că firma nu are surprize în trecut, ar putea
        cere și <strong>raportul istoric</strong> înainte de a accepta cesiunea — exact scenariul de
        due-diligence.
      </p>

      <h2>Greșeli frecvente de evitat</h2>
      <ul>
        <li>
          <strong>Obținerea certificatului prea devreme.</strong> Dacă îl iei cu o lună și jumătate
          înainte, riscă să depășească cele 30 de zile până la semnare și notarul îl refuză.
        </li>
        <li>
          <strong>Confundarea versiunii istorice cu cea de bază.</strong> Pentru semnare ai nevoie de
          cel de bază; nu cheltui ~250 de lei pe raportul istoric dacă nu faci due-diligence.
        </li>
        <li>
          <strong>Presupunerea că PDF-ul nu e valabil.</strong> Certificatul PDF e-semnat de ONRC este
          originalul — nu trebuie tipărit și ștampilat suplimentar.
        </li>
        <li>
          <strong>Verificarea în ultima clipă.</strong> Solicită documentul cu câteva zile înainte, ca
          să ai timp dacă apare ceva de corectat în dosar.
        </li>
      </ul>

      <h2>Cum obții certificatul constatator pentru notar, online</h2>
      <p>
        Nu trebuie să mergi la registrul comerțului și să stai la coadă. Prin eGhișeul.ro soliciți{' '}
        <Link href={constatatorUrl}>certificatul constatator online</Link>, iar documentul emis de
        ONRC îți este livrat în <strong>PDF e-semnat</strong>, gata de prezentat la notar. Pașii sunt
        simpli:
      </p>
      <ul>
        <li>introduci datele firmei (CUI / denumire) în formular;</li>
        <li>alegi versiunea de care ai nevoie — de bază pentru semnare sau istoric pentru verificare;</li>
        <li>achiți online și primești certificatul în format electronic, valabil la notar.</li>
      </ul>
      <p>
        Înainte de programare, poți estima și costurile cu{' '}
        <Link href="/calculator/taxe-notariale/">calculatorul de taxe notariale</Link>, ca să știi din
        timp la ce onorariu să te aștepți.
      </p>

      <h2>Concluzie</h2>
      <p>
        Certificatul constatator este documentul care îi spune notarului{' '}
        <strong>cine poate semna legal pentru firmă</strong>. Pentru cesiune de părți sociale,
        vânzarea firmei sau acte imobiliare îți trebuie, de regulă, <strong>versiunea de bază</strong>,
        emisă cu <strong>cel mult 30 de zile</strong> înainte de semnare. Raportul istoric îl alegi
        doar la due-diligence, când cumperi o firmă. Iar dacă vrei să sari peste coada de la ONRC, îl
        obții direct <Link href={constatatorUrl}>online, prin eGhișeul.ro</Link>, în PDF e-semnat
        valabil la notar.
      </p>
    </ArticleLayout>
  );
}
