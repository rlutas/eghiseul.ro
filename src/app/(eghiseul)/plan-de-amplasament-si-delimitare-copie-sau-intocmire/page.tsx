import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'plan-de-amplasament-si-delimitare-copie-sau-intocmire';
const TITLE = 'Plan de amplasament și delimitare (PAD): copie din arhiva OCPI sau întocmire nouă?';
// The root layout appends " | eGhiseul.ro"; this keeps the <title> at 60 characters.
const META_TITLE = 'Plan amplasament și delimitare: copie sau nou';
const DESCRIPTION =
  'Ce este planul de amplasament și delimitare (PAD), când îți ajunge copia din arhiva OCPI ' +
  'și când trebuie întocmit unul nou, de un topograf autorizat.';
const DATE_PUBLISHED = '2026-10-06';
const DATE_MODIFIED = '2026-10-06';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: '/images/articole/cat-costa-cadastrul-si-intabularea.webp',
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
      publishedLabel="6 octombrie 2026"
      updatedLabel="6 octombrie 2026"
      image="/images/articole/cat-costa-cadastrul-si-intabularea.webp"
      imageAlt="Stație totală de topografie în fața unei case, cu un plan de amplasament și delimitare pe masă"
      relatedServices={[
        {
          slug: 'plan-amplasament-delimitare',
          label: 'Copie plan de amplasament și delimitare',
          desc: 'Planul deja recepționat, scos din arhiva OCPI după numărul cadastral.',
        },
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de carte funciară',
          desc: 'Proprietarii și sarcinile înscrise, pe email.',
        },
        {
          href: '/cat-costa-cadastrul-si-intabularea/',
          label: 'Cât costă cadastrul și intabularea',
          desc: 'Tarifele ANCPI pe coduri și ce plătești topografului.',
        },
      ]}
      faqs={[
        {
          q: 'Ce este planul de amplasament și delimitare?',
          a: 'Este desenul la scară al imobilului din documentația cadastrală: conturul parcelei, lungimea fiecărei laturi, suprafața măsurată, construcțiile și vecinii de pe fiecare latură. Îl întocmește o persoană autorizată de ANCPI, iar după recepția la OCPI rămâne în dosarul imobilului.',
        },
        {
          q: 'Pot obține o copie a planului de amplasament și delimitare?',
          a: 'Da, dacă imobilul a fost înscris în cadastru și planul a fost recepționat. Copia se scoate din arhiva OCPI după numărul cadastral sau după numărul de carte funciară. Dacă imobilul nu are număr cadastral, nu există niciun plan de copiat.',
        },
        {
          q: 'Pentru intabulare îmi ajunge o copie a PAD-ului?',
          a: 'Nu, dacă imobilul se înscrie acum pentru prima dată: prima înregistrare cere o documentație cadastrală nouă, cu plan întocmit pe baza măsurătorilor. Pentru intabularea dreptului unui cumpărător pe un imobil deja înscris, notarul lucrează cu extrasul de carte funciară, nu cu un plan nou.',
        },
        {
          q: 'Cine face planul de amplasament și delimitare?',
          a: 'O persoană fizică sau juridică autorizată de ANCPI să execute lucrări de cadastru, adică un topograf autorizat. El măsoară imobilul, întocmește planul și răspunde pentru corectitudinea lui. OCPI doar îl verifică la recepție.',
        },
        {
          q: 'Cât costă un plan de amplasament și delimitare nou?',
          a: 'Nu există un tarif stabilit prin lege pentru munca topografului: e preț de piață și depinde de suprafață, de forma parcelei, de construcții, de acte și de distanța până la teren. Cere două sau trei oferte scrise și verifică ce includ. Tariful ANCPI pentru recepția la prima înregistrare este zero din 7 aprilie 2025.',
        },
      ]}
    >
      <p>
        <strong>Planul de amplasament și delimitare</strong> (PAD) se poate obține în două feluri, care nu
        se înlocuiesc unul pe altul. Dacă imobilul e deja înscris în cadastru, planul există și îl poți cere
        ca copie din arhiva OCPI, în câteva zile. Dacă imobilul n-are încă număr cadastral, dacă împarți sau
        unești terenuri ori dacă gardul de azi nu mai seamănă cu planul vechi, îți trebuie un plan nou. Pe
        acela îl face un topograf autorizat, care iese pe teren și măsoară.
      </p>

      <h2>Ce este planul de amplasament și delimitare</h2>
      <p>
        PAD-ul este planșa principală dintr-o documentație cadastrală. Regulamentul de recepție și
        înscriere în evidențele de cadastru și carte funciară, aprobat prin Ordinul directorului general al
        ANCPI nr. 600/2023, îl trece printre piesele obligatorii ale documentației (art. 21 lit. g) și cere
        să fie întocmit la o scară între 1:200 și 1:5000 (art. 19 alin. 3).
      </p>
      <p>Pe un PAD citești:</p>
      <ul>
        <li>conturul parcelei, desenat pe baza măsurătorilor;</li>
        <li>lungimea fiecărei laturi;</li>
        <li>suprafața rezultată din măsurătoare, care adesea diferă de cea din actul vechi;</li>
        <li>construcțiile de pe teren, cu amprenta lor;</li>
        <li>vecinătățile: cine sau ce se află pe fiecare latură (un nume, un număr cadastral, un drum);</li>
        <li>numărul cadastral și datele de identificare ale imobilului.</li>
      </ul>
      <p>
        Dacă ai nevoie de coordonatele exacte ale colțurilor, ca să trasezi limitele pe teren, le găsești
        în inventarul de coordonate, care se cere separat de planșă.
      </p>

      <h2>Copie din arhivă sau plan nou: diferența pe scurt</h2>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Copie din arhiva OCPI</th>
            <th>Plan nou</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ce primești</td>
            <td>Planul recepționat deja, așa cum a rămas în dosarul imobilului</td>
            <td>Un plan întocmit acum, pe baza măsurătorilor din teren</td>
          </tr>
          <tr>
            <td>Condiția</td>
            <td>Imobilul are număr cadastral</td>
            <td>Oricare imobil, inclusiv neînscris</td>
          </tr>
          <tr>
            <td>Cine se ocupă</td>
            <td>OCPI eliberează copia din arhivă</td>
            <td>Un topograf autorizat de ANCPI, apoi recepția la OCPI</td>
          </tr>
          <tr>
            <td>Măsurători în teren</td>
            <td>Nu</td>
            <td>Da</td>
          </tr>
          <tr>
            <td>Arată situația</td>
            <td>De la data recepției</td>
            <td>De azi</td>
          </tr>
          <tr>
            <td>Folosit pentru</td>
            <td>Verificări, comparații, punctul de pornire al unei lucrări noi</td>
            <td>Prima înregistrare, dezlipire, alipire, actualizarea datelor tehnice</td>
          </tr>
        </tbody>
      </table>

      <h2>Când îți ajunge copia din arhiva OCPI</h2>
      <p>
        Copia e suficientă de fiecare dată când vrei să afli ce s-a măsurat și s-a recepționat, fără să
        schimbi ceva în evidențe:
      </p>
      <ul>
        <li>
          Înainte să cumperi un teren. Vezi forma parcelei, lungimea laturilor și cine sunt
          vecinii, apoi compari cu ce vezi la fața locului. Un gard care taie un colț se observă imediat.
        </li>
        <li>
          Ai pierdut planul primit la cadastru. Dosarul a rămas la OCPI, deci planul se poate
          scoate din nou.
        </li>
        <li>
          Discuții de hotar cu vecinul. Planul arată ce s-a măsurat la recepție și cine era
          vecin pe fiecare latură. Nu tranșează singur un conflict, dar e documentul de la care pornește orice
          expertiză.
        </li>
        <li>
          Pregătești o lucrare nouă. Topograful sau proiectantul pornește de la planul
          existent ca să știe ce s-a recepționat deja.
        </li>
        <li>
          Diferențe de suprafață. Ai în act 1.000 mp și vrei să vezi cât s-a măsurat efectiv
          la înscriere.
        </li>
      </ul>
      <p>
        Noi obținem copia din arhivă după numărul cadastral sau după numărul de carte funciară și ți-o
        trimitem pe email:{' '}
        <Link href={serviceUrl('plan-amplasament-delimitare')}>copie plan de amplasament și delimitare</Link>.
        Dacă nu știi numărul, îl aflăm după adresă cu serviciul de{' '}
        <Link href={serviceUrl('identificare-imobil')}>identificare imobil</Link>.
      </p>

      <h2>Când îți trebuie un plan de amplasament și delimitare nou</h2>
      <p>
        O copie nu poate înlocui un plan nou atunci când trebuie schimbat ceva în cadastru sau în cartea
        funciară. Regulamentul ANCPI enumeră documentațiile cadastrale (art. 18), iar fiecare dintre cele de
        mai jos se face cu un plan nou:
      </p>
      <ul>
        <li>
          Prima înregistrare. Terenul sau casa nu are încă număr cadastral. Dacă nu s-a făcut
          niciodată cadastru, nu există nimic de copiat în arhivă.
        </li>
        <li>
          Dezlipire sau alipire. Împarți o parcelă în loturi sau unești două parcele.
          Regulamentul are pentru asta o anexă separată, planul de amplasament și delimitare cu propunerea de
          dezlipire.
        </li>
        <li>
          Actualizarea informațiilor tehnice. S-a schimbat ceva față de ce s-a recepționat:
          suprafața, limitele, categoria de folosință.
        </li>
        <li>
          Construcție nouă sau extindere. Clădirea trebuie să apară în cadastru, cu amprenta
          ei reală.
        </li>
        <li>
          Apartamentare. O clădire se împarte în unități individuale, fiecare cu carte
          funciară proprie.
        </li>
      </ul>
      <p>
        Planul vechi rămâne util și aici, dar doar ca punct de pornire: topograful îl compară cu ce măsoară
        acum, iar diferențele trebuie explicate în documentație.
      </p>

      <h2>Cine întocmește PAD-ul și cine îl verifică</h2>
      <p>
        Planul nou îl face o persoană fizică sau juridică autorizată de ANCPI să execute lucrări de
        cadastru, în limbaj obișnuit „topograful”. Potrivit art. 24 alin. 1 din regulament, ea răspunde
        pentru măsurarea imobilului indicat de proprietar și pentru corectitudinea documentației față de
        realitatea din teren.
      </p>
      <p>
        Documentația se depune la oficiul de cadastru (OCPI) din județul imobilului. OCPI o verifică la
        recepție, atribuie numărul cadastral și, după caz, deschide cartea funciară. Abia după recepție planul
        intră în arhivă, de unde se poate scoate ulterior o copie.
      </p>

      <h2>PAD pentru intabulare și pentru autorizația de construire</h2>
      <p>
        Cuvântul „intabulare” acoperă două situații diferite. La <strong>prima înscriere</strong> a unui
        imobil, documentația cadastrală, cu plan nou, este chiar cea care deschide cartea funciară. La o{' '}
        <strong>vânzare</strong> a unui imobil deja înscris, notarul nu cere un plan nou: lucrează cu{' '}
        <Link href={serviceUrl('extras-carte-funciara')}>extrasul de carte funciară</Link>, iar cumpărătorul
        își intabulează dreptul pe cartea funciară existentă.
      </p>
      <p>
        La <strong>autorizația de construire</strong>, primăria pornește de la certificatul de urbanism, iar
        proiectantul lucrează de regulă pe un plan topografic recent, întocmit de o persoană autorizată și
        recepționat la OCPI. Un PAD vechi din arhivă îi arată proiectantului limitele recepționate, dar nu
        ține loc de ridicarea topografică pe care o cere proiectul. Ce acte se depun exact se scrie în
        certificatul de urbanism, așa că merită citit înainte să comanzi orice plan. Pentru localizarea
        terenului pe hartă ajunge, de multe ori,{' '}
        <Link href={serviceUrl('extras-plan-cadastral')}>extrasul de plan cadastral</Link>.
      </p>

      <h2>Cât costă planul de amplasament și delimitare</h2>
      <p>
        Copia din arhivă are un preț fix, afișat pe pagina serviciului, în care e inclus
        tariful plătit la OCPI. Nu depinde de suprafața terenului.
      </p>
      <p>
        Pentru un plan nou nu există un tarif stabilit prin lege. Onorariul topografului e
        preț de piață și ține de suprafață, de forma parcelei, de construcțiile care trebuie măsurate, de
        starea actelor și de distanța până la teren. Peste onorariu vine tariful ANCPI pentru recepție: la
        prima înregistrare este zero din 7 aprilie 2025, iar la dezlipire sau alipire se plătesc 60 lei plus
        60 lei pe fiecare imobil rezultat. Detaliile pe coduri sunt în ghidul{' '}
        <Link href="/cat-costa-cadastrul-si-intabularea/">cât costă cadastrul și intabularea</Link>.
      </p>
      <p>
        Când ceri oferte pentru un plan nou, întreabă ce includ: măsurătorile, întocmirea documentației,
        depunerea la OCPI și eventuala redepunere dacă dosarul primește referat de completare. Două oferte cu
        aceeași sumă pot acoperi lucruri foarte diferite.
      </p>

      <h2>Cum alegi, în trei întrebări</h2>
      <ol>
        <li>
          <strong>Imobilul are număr cadastral?</strong> Dacă nu, ai nevoie de plan nou. Dacă nu știi,
          verifică întâi în extrasul de carte funciară sau prin identificarea după adresă.
        </li>
        <li>
          <strong>Vrei să schimbi ceva în cadastru sau în cartea funciară?</strong> Împărțire, unire,
          construcție nouă, suprafață corectată: plan nou.
        </li>
        <li>
          <strong>Vrei doar să vezi ce s-a recepționat?</strong> Pentru cumpărare, pentru o discuție cu
          vecinul sau pentru un plan pierdut îți ajunge copia din arhivă.
        </li>
      </ol>
      <p>
        Dacă după aceste trei întrebări nu e clar, începe cu copia: e mai ieftină, vine în câteva zile și îi
        arată topografului de unde pornește, dacă până la urmă e nevoie și de un plan nou.
      </p>
    </ArticleLayout>
  );
}
