import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'apostila-de-la-haga-ghid-acte-obtinere';
const TITLE = 'Apostila de la Haga: pe ce acte se aplică, unde o obții și cât costă (2026)';
const DESCRIPTION =
  'Ghid complet apostilă Haga în 2026: ce acte se apostilează la prefectură, tribunal sau Camera ' +
  'Notarilor, cât durează, cât costă, când NU ai nevoie de apostilă și în ce ordine se face traducerea.';
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
      category="Documente pentru străinătate"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="iulie 2026"
      updatedLabel="31 iulie 2026"
      relatedServices={[
        {
          href: '/servicii/cazier-judiciar-online/',
          label: 'Cazier Judiciar Online',
          desc: 'Cazier eliberat prin împuternicit, cu opțiune de apostilare și traducere.',
        },
        {
          href: '/servicii/eliberare-certificat-de-nastere/',
          label: 'Certificat de Naștere',
          desc: 'Duplicat certificat de naștere, livrat oriunde în lume.',
        },
        {
          href: '/servicii/eliberare-certificat-de-celibat/',
          label: 'Certificat de Celibat',
          desc: 'Necesar la căsătoria în străinătate; se apostilează frecvent.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este apostila de la Haga?',
          a: 'Apostila este o ștampilă (sau un certificat electronic) care confirmă autenticitatea unui act românesc, astfel încât acesta să fie recunoscut în alt stat membru al Convenției de la Haga din 1961. Nu certifică conținutul actului, ci semnătura și calitatea celui care l-a emis.',
        },
        {
          q: 'Unde se aplică apostila în România?',
          a: 'La trei instituții, în funcție de act: Instituția Prefectului pentru acte administrative (caziere, certificate de stare civilă, diplome, adeverințe), tribunalul pentru hotărâri judecătorești și Camera Notarilor Publici pentru acte notariale, copii legalizate și traduceri legalizate.',
        },
        {
          q: 'Cât durează obținerea apostilei?',
          a: 'La prefectură, de regulă în aceeași zi dacă depui dimineața, sau în cel mult 48 de ore lucrătoare. Pentru actele administrative există și apostila electronică, emisă prin hub.mai.gov.ro fără deplasare.',
        },
        {
          q: 'Am nevoie de apostilă pentru actele folosite în Uniunea Europeană?',
          a: 'De multe ori, nu. Regulamentul UE 2016/1191 scutește de apostilă principalele acte publice (naștere, căsătorie, celibat, cazier fără mențiuni) prezentate autorităților din alt stat membru UE, iar extrasele multilingve de stare civilă circulă fără apostilă și fără traducere. Verifică întâi ce acceptă instituția din statul de destinație.',
        },
        {
          q: 'Se apostilează originalul sau traducerea?',
          a: 'Depinde de ce cere statul de destinație, dar ordinea corectă este: întâi apostila pe actul original, apoi traducerea autorizată a actului (împreună cu apostila), apoi, dacă se cere, legalizarea traducerii la notar și apostilarea traducerii legalizate la Camera Notarilor. Făcut invers, rişti să refaci tot lanțul.',
        },
        {
          q: 'Ce fac dacă statul de destinație nu e membru al Convenției de la Haga?',
          a: 'Apostila nu e valabilă acolo. Actul trece prin supralegalizare: un lanț de vize care începe la autoritățile române (MAE) și se termină la ambasada sau consulatul statului de destinație.',
        },
      ]}
    >
      <p>
        Cine a lucrat, s-a căsătorit sau și-a depus dosarul de cetățenie în străinătate s-a lovit de
        cerința care derutează pe toată lumea prima dată: „actul trebuie să aibă apostilă". În spatele
        denumirii pompoase stă un mecanism simplu, dar cu reguli precise despre cine o aplică, pe ce
        acte și în ce ordine față de traducere. Ghidul de mai jos le ia pe rând.
      </p>

      <h2>Ce este apostila și când îți trebuie</h2>
      <p>
        Apostila este o ștampilă specială (sau, mai nou, un certificat electronic) aplicată pe un act
        românesc pentru ca acesta să fie recunoscut oficial în alt stat. Ea nu „traduce" și nu
        certifică conținutul actului: confirmă doar că semnătura, ștampila și calitatea emitentului
        sunt autentice. Funcționează exclusiv între statele membre ale Convenției de la Haga din 1961,
        peste 120 de țări, de la SUA și Marea Britanie până la Australia și Brazilia.
      </p>
      <p>
        Situațiile clasice în care ți se cere: angajare sau detașare în străinătate (cazier judiciar
        apostilat), căsătorie cu un cetățean străin (certificat de naștere și certificat de celibat),
        dosare de cetățenie sau rezidență, echivalarea studiilor, pensie pentru anii lucrați afară,
        succesiuni cu bunuri în alt stat.
      </p>

      <h2>Cele trei instituții care aplică apostila — pe ce acte fiecare</h2>
      <table>
        <thead>
          <tr>
            <th>Instituția</th>
            <th>Ce acte apostilează</th>
            <th>Exemple</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Instituția Prefectului</td>
            <td>acte administrative</td>
            <td>cazier judiciar, certificate de naștere/căsătorie/deces, certificat de celibat, diplome și foi matricole, adeverințe</td>
          </tr>
          <tr>
            <td>Tribunalul</td>
            <td>acte judecătorești</td>
            <td>hotărâri de divorț, sentințe civile definitive, acte emise de instanțe</td>
          </tr>
          <tr>
            <td>Camera Notarilor Publici</td>
            <td>acte notariale</td>
            <td>procuri, declarații notariale, copii legalizate, traduceri legalizate</td>
          </tr>
        </tbody>
      </table>
      <p>
        Împărțirea asta e sursa celor mai multe drumuri făcute degeaba: un cazier dus la tribunal sau o
        procură dusă la prefectură se întorc neapostilate. Regula de memorat: cine a emis actul dictează
        instituția — autoritate administrativă → prefectură, instanță → tribunal, notar → Camera
        Notarilor.
      </p>

      <h2>Cât durează și cât costă</h2>
      <p>
        La prefectură, apostila se eliberează de regulă în aceeași zi (dacă depui dimineața) sau în cel
        mult 48 de ore lucrătoare. Pentru actele administrative există din 2023 și{' '}
        <strong>apostila electronică</strong>, cerută online prin platforma hub.mai.gov.ro — documentul
        vine în format electronic, semnat digital, fără nicio deplasare. La tribunal se plătește o taxă
        judiciară modică per act, iar la Camera Notarilor tariful este de ordinul zecilor de lei per
        document. Costul real al procesului nu e taxa în sine, ci timpul: cozile, programul cu publicul
        și faptul că instituția competentă poate fi în alt județ decât tine.
      </p>

      <h2>Când NU ai nevoie de apostilă</h2>
      <p>
        Aici se pierd cei mai mulți bani inutil. Două scutiri importante:
      </p>
      <ul>
        <li>
          <strong>În Uniunea Europeană</strong>, Regulamentul 2016/1191 scutește de apostilă principalele
          acte publice prezentate autorităților altui stat membru: certificate de naștere și căsătorie,
          certificatul de celibat, cazierul fără mențiuni. Multe instituții din UE le acceptă direct,
          eventual însoțite de un formular standard multilingv.
        </li>
        <li>
          <strong>Extrasele multilingve de stare civilă</strong> (Convenția de la Viena din 1976) circulă
          în statele semnatare fără apostilă și fără traducere. Pentru un dosar în Italia, Spania sau
          Germania, extrasul multilingv de naștere scutește și apostila, și traducătorul — am detaliat
          diferențele în ghidul despre{' '}
          <Link href="/certificat-de-nastere-din-strainatate/">certificatul de naștere folosit din străinătate</Link>.
        </li>
      </ul>
      <p>
        Concluzia practică: înainte să apostilezi, întreabă instituția de destinație ce acceptă. Un email
        trimis înainte poate economisi tot lanțul apostilă + traducere + legalizare.
      </p>

      <h2>Apostila și traducerea: ordinea corectă</h2>
      <p>
        Greșeala frecventă: actul se traduce întâi, apoi se apostilează originalul — iar traducerea
        rămâne fără apostila în ea și e refuzată. Ordinea corectă, atunci când statul de destinație cere
        și traducerea apostilată:
      </p>
      <ul>
        <li>pasul 1 — se aplică apostila pe <strong>actul original</strong> (la instituția competentă);</li>
        <li>pasul 2 — traducătorul autorizat traduce actul <strong>împreună cu apostila</strong>;</li>
        <li>pasul 3 — traducerea se legalizează la notar;</li>
        <li>pasul 4 — traducerea legalizată se apostilează la <strong>Camera Notarilor Publici</strong>.</li>
      </ul>
      <p>
        Nu orice dosar cere toți cei patru pași: unele state se mulțumesc cu apostila pe original și o
        traducere simplă făcută la ele. Din nou, cerințele destinației dictează.
      </p>

      <h2>Cum obții actele apostilate fără să vii în România</h2>
      <p>
        Pentru românii din diaspora, partea grea nu e apostila, ci tot ce vine înainte: obținerea
        actului în sine, din țară. Serviciile de intermediere rezolvă lanțul complet prin împuternicit:
        de exemplu, un <Link href="/servicii/cazier-judiciar-online/">cazier judiciar</Link> sau un
        duplicat de <Link href="/servicii/eliberare-certificat-de-nastere/">certificat de naștere</Link>{' '}
        se pot comanda online, cu apostilare și traducere incluse la cerere, iar documentele ajung prin
        curier oriunde în lume. Pentru căsătoria în străinătate, combinația cerută aproape mereu e
        certificatul de naștere plus{' '}
        <Link href="/certificat-de-celibat-pentru-casatorie-in-strainatate/">certificatul de celibat, apostilate</Link>.
      </p>

      <h2>Statele din afara Convenției: supralegalizarea</h2>
      <p>
        Dacă statul de destinație nu e membru al Convenției de la Haga (de exemplu Canada înainte de
        2024, mai multe state din Orientul Mijlociu și Asia), apostila nu ajută. Actul trece prin
        supralegalizare: vizarea la autoritățile române competente și la Ministerul Afacerilor Externe,
        apoi la ambasada sau consulatul statului respectiv. E un lanț mai lung și mai scump — încă un
        motiv să verifici întâi lista statelor membre pe site-ul Conferinței de la Haga (hcch.net).
      </p>
    </ArticleLayout>
  );
}
