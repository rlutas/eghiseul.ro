import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'radiere-firma-srl-ghid';
const TITLE = 'Radierea unei firme (SRL): etape, acte, durată și greșeli de evitat (2026)';
const DESCRIPTION =
  'Ghid radiere SRL în 2026: dizolvare și lichidare voluntară pas cu pas, actele pentru ONRC, ' +
  'certificatul fiscal fără datorii, termenul de opoziție de 30 de zile și cât durează tot procesul.';
const DATE_PUBLISHED = '2026-07-31';
const DATE_MODIFIED = '2026-07-31';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      category="Firme & ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="iulie 2026"
      updatedLabel="31 iulie 2026"
      relatedServices={[
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator Online',
          desc: 'Verifică starea exactă a firmei înainte și după radiere.',
        },
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Un cazier fiscal curat condiționează înființarea firmelor viitoare.',
        },
      ]}
      faqs={[
        {
          q: 'Cât durează radierea unei firme?',
          a: 'Pentru dizolvarea voluntară fără datorii, în varianta cu lichidare simultană, procesul durează în practică în jur de 2–3 luni: înregistrarea dizolvării, termenul de opoziție de 30 de zile de la publicarea în Monitorul Oficial, apoi cererea de radiere propriu-zisă.',
        },
        {
          q: 'Se poate radia o firmă cu datorii?',
          a: 'Nu pe calea dizolvării voluntare. Datoriile către stat trebuie stinse — ANAF eliberează certificat de atestare fiscală, iar cele către creditori achitate sau reglate; altfel creditorii pot face opoziție, iar pentru firmele insolvabile calea este procedura insolvenței, nu radierea voluntară.',
        },
        {
          q: 'Ce acte trebuie pentru radiere?',
          a: 'În esență: hotărârea de dizolvare și lichidare (cu repartizarea activelor rămase, dacă asociații aleg varianta simultană), dovada publicării în Monitorul Oficial, situația financiară de lichidare, certificatul de atestare fiscală fără datorii și cererea de radiere la ONRC. La final, ONRC eliberează certificatul de radiere.',
        },
        {
          q: 'Ce se întâmplă cu banii și bunurile rămase în firmă?',
          a: 'După plata datoriilor, activele rămase se repartizează asociaților conform hotărârii de lichidare, iar sumele distribuite se impozitează conform regulilor pentru veniturile din lichidare. Contul bancar se închide după radiere, pe baza certificatului de radiere.',
        },
      ]}
    >
      <p>
        Închiderea unei firme e procedura pe care nimeni nu o învață până nu ajunge la ea — iar atunci
        descoperă că „radierea" e de fapt capătul unui lanț cu trei verigi: dizolvare, lichidare,
        radiere. Pentru un SRL fără datorii și fără activitate, drumul e previzibil și se termină în
        două-trei luni. Pentru unul cu datorii sau cu acte neglijate ani la rând, fiecare verigă se
        poate transforma într-un șantier. Ghidul de mai jos acoperă varianta voluntară, cea aleasă de
        asociați.
      </p>

      <h2>Cele trei etape, pe scurt</h2>
      <ul>
        <li>
          <strong>Dizolvarea</strong> — asociații decid oficial încetarea firmei (hotărâre AGA sau
          decizia asociatului unic) și înregistrează mențiunea la ONRC; hotărârea se publică în
          Monitorul Oficial.
        </li>
        <li>
          <strong>Lichidarea</strong> — se plătesc datoriile, se încasează creanțele, se închid
          contractele, iar ce rămâne se împarte asociaților. Dacă asociații se înțeleg asupra
          repartizării, dizolvarea și lichidarea se pot hotărî simultan, fără lichidator — scurtătura
          folosită de majoritatea firmelor mici.
        </li>
        <li>
          <strong>Radierea</strong> — după expirarea termenului de opoziție, se depune cererea de
          radiere cu situația financiară de lichidare și certificatul fiscal; firma dispare din
          registru, iar ONRC eliberează certificatul de radiere.
        </li>
      </ul>

      <h2>Termenul de 30 de zile: de ce nu se poate „repede"</h2>
      <p>
        De la publicarea hotărârii de dizolvare în Monitorul Oficial curge un termen de{' '}
        <strong>30 de zile</strong> în care orice creditor poate face opoziție. Termenul e fix și nu se
        poate cumpăra sau grăbi: el există tocmai ca firmele să nu se evapore peste noapte cu facturi
        neplătite în urmă. Abia după scurgerea lui se poate depune cererea de radiere. De aici vine
        durata totală realistă de 2–3 luni, oricât de simplu ar fi cazul.
      </p>

      <h2>Piesa centrală: certificatul fiscal fără datorii</h2>
      <p>
        Radierea nu trece fără <strong>certificatul de atestare fiscală</strong> din care să rezulte că
        firma nu are datorii la stat. Orice restanță — chiar și o amendă veche de 50 de lei sau o
        declarație nedepusă care a generat impuneri din oficiu — blochează dosarul până la stingere.
        De-asta primul pas practic, înainte de orice hotărâre de dizolvare, e o verificare completă:
        fișa fiscală la ANAF prin contabil și starea firmei în registru, printr-un{' '}
        <Link href="/servicii/certificat-constatator-online/">certificat constatator</Link> care arată
        exact ce e înscris la zi — sedii expirate, mențiuni uitate, puncte de lucru nedesființate.
      </p>

      <h2>Greșelile care lungesc procesul cu luni</h2>
      <ul>
        <li>
          <strong>Punctele de lucru uitate.</strong> Fiecare punct de lucru înregistrat trebuie închis;
          cele uitate ies la iveală fix la radiere.
        </li>
        <li>
          <strong>Casa de marcat nescoasă din evidențe.</strong> Aparatele fiscale se scot din evidența
          ANAF înainte de închidere; procedura uitată reînvie dosarul.
        </li>
        <li>
          <strong>Declarațiile „din oficiu".</strong> Firmele lăsate ani de zile fără declarații
          acumulează impuneri estimate de ANAF, care apar ca datorii reale la certificatul fiscal, deși
          firma n-a avut activitate. Corectarea lor durează mai mult decât radierea în sine — și e
          motivul pentru care o firmă nefolosită merită măcar{' '}
          <Link href="/suspendare-activitate-firma-ghid/">suspendată oficial</Link>, nu abandonată.
        </li>
        <li>
          <strong>Contul bancar închis prea devreme.</strong> Prin cont se plătesc ultimele obligații și
          se distribuie activul net; se închide ultimul, cu certificatul de radiere în mână.
        </li>
      </ul>

      <h2>Ce rămâne după radiere</h2>
      <p>
        Firma dispare, dar câteva lucruri persistă: arhiva contabilă se păstrează conform termenelor
        legale (ani buni după închidere), iar comportamentul fiscal al administratorului rămâne înscris
        acolo unde contează. Faptele din{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazierul fiscal</Link> — de exemplu atragerea
        răspunderii pentru datoriile unei firme închise prost — blochează înființarea sau administrarea
        altor firme în viitor. O radiere făcută curat e, în practică, biletul de intrare pentru
        următorul început: la înființarea firmei noi, registrul cere exact cazierul fiscal curat al
        fondatorului.
      </p>

      <h2>Radiere, suspendare sau vânzare?</h2>
      <p>
        Radierea e definitivă și curată, dar nu e singura ieșire. Pauza temporară e{' '}
        <Link href="/suspendare-activitate-firma-ghid/">suspendarea activității</Link> (maximum 3 ani),
        iar pentru firmele cu istoric bun există și varianta cesiunii părților sociale către un
        cumpărător. Regula practică: vinde doar ce are valoare reală (istoric, autorizații, contracte),
        suspendă doar ce are șanse reale de reluare, radiază tot restul — o firmă „ținută de rezervă"
        fără plan costă timp și expune administratorul la riscuri fără niciun câștig.
      </p>
    </ArticleLayout>
  );
}
