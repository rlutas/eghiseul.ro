import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { ChecklistDownload } from '@/components/articole/checklist-download';

const SLUG = 'cat-costa-cadastrul-si-intabularea';
const TITLE = 'Cât Costă Cadastrul și Intabularea în 2026? Prețuri reale + acte necesare';
const DESCRIPTION =
  'Cadastru apartament: 700–1.100 lei topograf + 120 lei taxă ANCPI. Casă cu teren: 1.400–2.500 lei + 120. ' +
  'Intabulare după cumpărare: 0,15% din preț. Toate taxele, actele pe scenarii și greșelile care te costă.';
const DATE_PUBLISHED = '2026-07-14';
const DATE_MODIFIED = '2026-07-14';

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
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="14 iulie 2026"
      updatedLabel="14 iulie 2026"
      imageAlt="Topograf autorizat cu stație totală măsurând limita unui teren cu casă, cu planul de amplasament și delimitare și extrasul de carte funciară pe capota mașinii"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Verifici situația cadastrală a imobilului — automat, în câteva minute.',
        },
        {
          slug: 'copie-carte-funciara',
          label: 'Copie carte funciară',
          desc: 'Actele vechi din arhiva OCPI, când originalele lipsesc.',
        },
        {
          slug: 'plan-amplasament-delimitare',
          label: 'Plan de amplasament și delimitare (PAD)',
          desc: 'Piesa tehnică obligatorie la prima înregistrare a terenurilor.',
        },
        {
          href: '/calculator/cost-cadastru-intabulare/',
          label: 'Calculator: cost cadastru și intabulare',
          desc: 'Tipul imobilului + situația ta → taxa ANCPI exactă și totalul estimat.',
        },
      ]}
      faqs={[
        {
          q: 'Cât durează cadastrul și intabularea?',
          a: 'Măsurătorile și documentația topografului: 1–3 săptămâni. Soluționarea la OCPI: în jur de 18 zile lucrătoare la prima înregistrare în regim normal, 6 zile la urgență. Intabularea simplă după cumpărare, depusă de notar, se soluționează de regulă în câteva zile.',
        },
        {
          q: 'Cine plătește intabularea la vânzare-cumpărare?',
          a: 'Cumpărătorul. Taxa de 0,15% din preț (0,50% la firme) se achită de regulă prin notar, la semnare — apare pe deviz lângă onorariul notarial și se virează la ANCPI odată cu cererea de intabulare.',
        },
        {
          q: 'E obligatoriu cadastrul?',
          a: 'Nu există amendă pentru lipsa lui, dar fără cadastru și carte funciară nu poți vinde notarial, nu poți ipoteca imobilul pentru credit și nu poți dezmembra sau alipi. Orice tranzacție serioasă îl presupune.',
        },
        {
          q: 'Pot vinde un imobil fără intabulare?',
          a: 'Notarial, nu. Codul civil cere înscrierea în cartea funciară pentru transferul proprietății, iar notarul refuză autentificarea fără extras CF valabil. Un antecontract se poate semna, dar vânzarea propriu-zisă așteaptă intabularea.',
        },
        {
          q: 'Cât costă cadastrul la un apartament?',
          a: '700–1.100 lei onorariul topografului plus 120 lei taxa ANCPI de primă înregistrare. Total orientativ: 820–1.220 lei. Dacă apartamentul are deja cadastru și doar îl cumperi, plătești numai intabularea: 0,15% din preț.',
        },
        {
          q: 'Ce este PAD-ul (planul de amplasament și delimitare)?',
          a: 'Piesa tehnică desenată de topograful autorizat care fixează limitele exacte ale imobilului în sistemul național de coordonate. Fără PAD recepționat de OCPI, un teren nu poate primi număr cadastral. La apartamente rolul lui îl ține releveul.',
        },
        {
          q: 'Taxa ANCPI e aceeași în toată țara?',
          a: 'Da. Tarifele sunt naționale, din Ordinul ANCPI 16/2019. Ce diferă între județe e doar onorariul topografului, negociat liber.',
        },
      ]}
    >
      <h2>Răspunsul scurt</h2>
      <p>
        Pentru un <strong>apartament</strong> fără cadastru: 700–1.100 lei onorariul topografului
        autorizat plus 120 lei taxa ANCPI. Pentru o <strong>casă cu teren</strong>: 1.400–2.500 lei
        plus aceiași 120 lei. Iar dacă imobilul are deja cadastru și doar îl cumperi,{' '}
        <strong>intabularea</strong> costă 0,15% din prețul din contract (minim 60 lei), plătită de
        regulă prin notar — fără topograf.
      </p>
      <p>
        Cifrele exacte pentru situația ta le scoate în două clicuri{' '}
        <Link href="/calculator/cost-cadastru-intabulare/">
          calculatorul de cost cadastru și intabulare
        </Link>
        : alegi tipul imobilului, contextul și regimul, primești taxa ANCPI la leu și intervalul de
        onorariu.
      </p>

      <h2>Din ce se compune prețul</h2>
      <p>
        Costul are două părți care se confundă des. Prima e <strong>taxa ANCPI</strong> — stabilită
        prin Ordinul ANCPI 16/2019, aceeași în toată țara. La prima înregistrare a unui imobil în
        cartea funciară e fixă: 120 lei. La intabularea dreptului de proprietate după o cumpărare e
        procentuală: 0,15% din preț pentru persoane fizice, 0,50% pentru firme.
      </p>
      <p>
        A doua parte e <strong>onorariul topografului autorizat</strong>. El măsoară imobilul,
        întocmește documentația cadastrală — la terenuri inclusiv{' '}
        <Link href="/servicii/plan-amplasament-delimitare/">
          planul de amplasament și delimitare (PAD)
        </Link>{' '}
        — și o depune la OCPI. Onorariul nu e reglementat de nimeni: e negociere liberă, de unde și
        diferențele mari între oferte.
      </p>
      <p>
        Regula de aur: topograful apare doar când imobilul nu are cadastru (sau când modifici ceva —
        dezmembrare, alipire, extindere). Dacă imobilul are număr cadastral, cumpărarea implică doar
        taxa procentuală de intabulare. Verifici în ce situație ești dintr-un{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link> — se
        eliberează online, în câteva minute, și îți arată numărul cadastral, proprietarul înscris și
        eventualele sarcini.
      </p>

      <h2>De ce diferă onorariile topografilor</h2>
      <p>
        Același apartament costă 700 lei la Satu Mare și 1.100 la București. Nu e țeapă, e piață.
        Prețul urcă odată cu județul (marile orașe sunt mai scumpe), cu suprafața și forma terenului
        (o parcelă neregulată de 2 hectare nu se compară cu o garsonieră), cu starea actelor și cu
        distanța de deplasare.
      </p>
      <p>
        Actele sunt factorul subestimat. Un dosar cu contract recent și schițe clare merge repede. Un
        teren moștenit, cu titlu de proprietate din 1993 și suprafață care nu bate cu realitatea din
        teren, înseamnă ore în plus de birou și drumuri la OCPI — iar asta se vede în preț. Când
        originalele lipsesc, copiile actelor vechi se recuperează din arhiva OCPI printr-o{' '}
        <Link href="/servicii/copie-carte-funciara/">copie de carte funciară</Link>. Iar dacă nu știi
        nici măcar numărul de carte funciară al imobilului,{' '}
        <Link href="/servicii/identificare-imobil/">identificarea imobilului</Link> pornește de la
        datele vechi (adresă, topografic) și îți găsește CF-ul actual.
      </p>

      <h2>Taxele ANCPI exacte</h2>
      <p>
        Tarifele de mai jos sunt naționale (Ordin ANCPI 16/2019). Urgența costă 5× tariful normal —
        adică un supliment de 4×, plafonat la 5.000 lei la taxele procentuale — și taie termenul la o
        treime:
      </p>
      <table>
        <thead>
          <tr>
            <th>Operațiune</th>
            <th>Tarif normal</th>
            <th>Urgență</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Recepție + înființare CF (primă înregistrare, cod 2.1.1)</td>
            <td>120 lei/imobil</td>
            <td>600 lei</td>
          </tr>
          <tr>
            <td>Recepție documentație cadastrală (cod 2.1.2)</td>
            <td>60 lei/imobil</td>
            <td>300 lei</td>
          </tr>
          <tr>
            <td>Intabulare proprietate — persoane fizice (cod 2.3.2)</td>
            <td>0,15% din preț, min. 60 lei</td>
            <td>5× taxa, supliment max. 5.000 lei</td>
          </tr>
          <tr>
            <td>Intabulare proprietate — persoane juridice (cod 2.3.1)</td>
            <td>0,50% din preț, min. 60 lei</td>
            <td>5× taxa, supliment max. 5.000 lei</td>
          </tr>
          <tr>
            <td>Actualizare informații tehnice, ex. adresă (cod 2.6.3)</td>
            <td>75 lei</td>
            <td>375 lei</td>
          </tr>
          <tr>
            <td>Extras CF pentru informare (cod 2.7.2)</td>
            <td>20 lei online / 25 lei la ghișeu</td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
      <p>
        Un exemplu pe cifre: apartament de 450.000 lei, cumpărător persoană fizică — taxa de
        intabulare e 675 lei. La urgență: 675 + 4×675 = 3.375 lei. La un imobil de 5.000.000 lei taxa
        e 7.500 lei, iar urgența costă 12.500 lei în total, nu 37.500 — suplimentul se oprește la
        plafonul de 5.000. <Link href="/calculator/cost-cadastru-intabulare/">Calculatorul</Link>{' '}
        aplică plafonul automat, ca să nu-l aplici tu greșit.
      </p>

      <h2>Actele necesare, pe scenarii</h2>
      <p>
        <strong>Apartament (primă înregistrare):</strong>
      </p>
      <ul>
        <li>actul de proprietate (contract de vânzare, certificat de moștenitor, contract de donație);</li>
        <li>actul de identitate al proprietarului;</li>
        <li>certificatul fiscal de la primărie (valabil, cu mențiunea „pentru cadastru și intabulare”);</li>
        <li>releveul apartamentului, întocmit de topograf;</li>
        <li>acordul asociației / documentația condominiului, unde OCPI o cere.</li>
      </ul>
      <p>
        <strong>Casă cu teren:</strong>
      </p>
      <ul>
        <li>actul de proprietate pentru teren și, separat dacă există, pentru construcție;</li>
        <li>autorizația de construire și procesul-verbal de recepție (la case construite după 2001);</li>
        <li>certificatul fiscal cu valoarea de impunere a construcției;</li>
        <li>PAD-ul întocmit de topograful autorizat, cu limitele măsurate în teren;</li>
        <li>actul de identitate al proprietarului.</li>
      </ul>
      <p>
        <strong>Teren fără construcții:</strong>
      </p>
      <ul>
        <li>titlul de proprietate / contractul / certificatul de moștenitor;</li>
        <li>certificatul fiscal de la primăria pe raza căreia e terenul;</li>
        <li>PAD cu inventarul de coordonate;</li>
        <li>la extravilan: extrasul din registrul agricol, unde e cazul.</li>
      </ul>
      <p>
        Checklist-ul complet cu actele pe scenarii îl găsești mai jos, descărcabil — bun de printat și
        bifat înainte de drumul la topograf.
      </p>
      <div id="checklist" />
      <ChecklistDownload
        file="/downloads/checklist-cadastru-intabulare.pdf"
        title="Checklist PDF: actele pentru cadastru și intabulare"
        description="Toate actele pe scenarii (apartament, casă cu teren, teren), taxele ANCPI și pașii în ordine — o pagină de printat și bifat. Gratuit, pe email."
        source="checklist-cadastru"
      />

      <h2>Pașii de la A la Z</h2>
      <ol>
        <li>
          Scoate un <Link href="/servicii/extras-de-carte-funciara/">extras CF</Link> sau, dacă nu
          știi datele imobilului, cere o{' '}
          <Link href="/servicii/identificare-imobil/">identificare de imobil</Link> — afli dacă există
          cadastru și ce e înscris.
        </li>
        <li>Strânge actele de proprietate; recuperează din arhiva OCPI ce lipsește.</li>
        <li>Ia certificatul fiscal de la primărie — are valabilitate scurtă, nu-l lua primul.</li>
        <li>Contractează topograful autorizat: măsurători, releveu sau PAD, documentația cadastrală.</li>
        <li>Topograful depune dosarul la OCPI cu taxa de 120 lei (600 la urgență).</li>
        <li>OCPI recepționează, alocă numărul cadastral și înființează cartea funciară.</li>
        <li>
          La cumpărare, notarul depune cererea de intabulare și încasează taxa de 0,15% odată cu
          restul costurilor.
        </li>
        <li>Primești încheierea de intabulare și extrasul CF cu numele tău la proprietari.</li>
      </ol>

      <h2>Greșeli care te costă</h2>
      <p>
        <strong>Calculul pe acte vechi.</strong> Suprafața din titlul de proprietate din anii &#39;90
        rar coincide cu măsurătoarea reală. Dacă diferența depășește toleranțele, dosarul se complică:
        declarații, acorduri de la vecini, uneori rectificări. Bugetează asta din start, nu după ce
        topograful ți-o spune la telefon.
      </p>
      <p>
        <strong>Lipsa unui extras CF recent.</strong> Oamenii pornesc lucrarea convinși că imobilul
        „n-are nimic” și descoperă la OCPI o ipotecă veche neradiată sau un proprietar decedat înscris
        în CF. Extrasul costă câteva zeci de lei și se eliberează în minute; o lucrare blocată costă
        săptămâni. La tranzacții, un{' '}
        <Link href="/servicii/certificat-sarcini/">certificat de sarcini</Link> îți arată și istoricul
        sarcinilor din perioada registrelor vechi de transcripțiuni.
      </p>
      <p>
        <strong>PAD lipsă sau nerecepționat.</strong> La terenuri, fără plan de amplasament și
        delimitare recepționat de OCPI nu există număr cadastral, punct. Dacă ai cumpărat cândva un
        teren „cu acte” dar fără PAD, prima înregistrare pleacă de la zero, cu măsurători noi.
      </p>

      <h2>Ai intabulat. Ce urmează?</h2>
      <p>
        Dacă planul e să construiești pe terenul proaspăt intabulat, următoarele două numere care te
        interesează sunt POT-ul și CUT-ul parcelei.{' '}
        <Link href="/calculator/cat-pot-construi/">Calculatorul „Cât pot construi”</Link> îți dă
        amprenta maximă a casei pe cifrele tale, iar ghidul{' '}
        <Link href="/cat-poti-construi-pe-teren/">Cât poți construi pe terenul tău</Link> explică de
        unde iei valorile și ce greșeli de calcul să eviți. Ordinea corectă rămâne aceeași ca la
        cadastru: întâi documentele, apoi banii.
      </p>
    </ArticleLayout>
  );
}
