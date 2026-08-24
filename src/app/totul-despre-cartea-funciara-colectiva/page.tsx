import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'totul-despre-cartea-funciara-colectiva';
const TITLE = 'Cartea funciară colectivă: ce este, ce conține și cum obții extrasul';
const DESCRIPTION =
  'Cartea funciară colectivă descrie blocul întreg: terenul, construcția și cotele fiecărui apartament din părțile comune. ' +
  'Ce găsești în părțile A, B și C, când ți se cere și cum obții extrasul.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-08-24';

export const revalidate = 86400;

export const metadata = buildPageMetadata({
  title: `${TITLE}`,
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
      publishedLabel="ianuarie 2024"
      updatedLabel="24 august 2026"
      relatedServices={[
        { slug: 'extras-carte-funciara', label: 'Extras de Carte Funciară', desc: 'Document ANCPI, livrat pe email.' },
        { href: '/cum-aflam-numarul-carte-functionara-si-nr-cadastral/', label: 'Cum afli numărul de carte funciară', desc: 'Unde găsești nr. CF și nr. cadastral al imobilului.' },
      ]}
      faqs={[
        {
          q: 'Ce este cartea funciară colectivă?',
          a: 'Este cartea funciară a condominiului întreg: terenul, construcția și cotele din părțile comune care revin fiecărui apartament. Se deschide la OCPI odată cu prima carte funciară individuală dintr-un bloc.',
        },
        {
          q: 'Care este diferența dintre un extras de carte funciară și un extras de carte funciară colectivă?',
          a: 'Extrasul obișnuit descrie o singură unitate: apartamentul tău, cu proprietarii și sarcinile lui. Extrasul colectiv descrie clădirea și terenul comun, cu cota fiecărui apartament din ele.',
        },
        {
          q: 'Ce fac dacă datele din extras nu sunt actualizate?',
          a: 'Depui la OCPI o cerere de înscriere cu actele care dovedesc schimbarea (contract de vânzare, act de dezmembrare etc.). Până nu se face înscrierea, extrasul va arăta în continuare situația veche.',
        },
        {
          q: 'Când e nevoie de carte funciară colectivă?',
          a: 'Cel mai des la vânzarea unui apartament, la credit ipotecar, la dezmembrări sau alipiri de spații și în litigii pe părțile comune, de exemplu când se dispută cota de teren aferentă unui apartament.',
        },
        {
          q: 'De ce informații am nevoie pentru a scoate un extras de carte funciară colectivă?',
          a: 'Ajunge numărul cărții funciare colective și localitatea. Dacă nu-l știi, se poate identifica după adresa imobilului sau după numărul cadastral.',
        },
      ]}
    >
      <h2>Ce este cartea funciară?</h2>
      <p>
        Cartea funciară este registrul public în care statul ține evidența juridică a imobilelor, conform Legii
        cadastrului și publicității imobiliare nr. 7/1996. Pentru fiecare imobil, ea răspunde la trei întrebări: ce
        este (descrierea, suprafața, destinația), al cui este (proprietarii și cotele lor) și ce îl grevează
        (ipoteci, servituți, sechestre).
      </p>
      <p>
        Ce nu e înscris în cartea funciară, practic nu există pentru terți. De asta ți-o cere notarul la orice
        vânzare și banca la orice ipotecă: e singurul loc unde se vede negru pe alb cine e proprietar și dacă
        imobilul are datorii legate de el.
      </p>

      <h2>Cum apare cartea funciară colectivă</h2>
      <p>
        La un bloc, lucrurile se împart în două. Apartamentul tău are cartea lui funciară individuală. Dar casa
        scării, acoperișul și terenul de sub bloc (părțile comune) nu aparțin nimănui în întregime, ci tuturor, în
        cote. Evidența lor se ține într-o carte funciară separată, cea colectivă, deschisă la OCPI odată cu prima
        carte funciară individuală din condominiu.
      </p>
      <p>
        În ea găsești terenul pe care stă construcția, clădirea în ansamblu și cota-parte din părțile comune care
        revine fiecărui apartament. Când cumperi un apartament, cumperi de fapt și cota lui din cartea colectivă,
        chiar dacă în actul de vânzare scrie doar „apartament nr. 12”.
      </p>

      <h2>Ce conține extrasul de carte funciară colectivă</h2>
      <p>
        Extrasul e fotografia la zi a cărții colective și are aceeași structură în trei părți ca orice extras de
        carte funciară:
      </p>
      <ul>
        <li>
          Partea A, descrierea imobilului: terenul, construcția, numărul cadastral, suprafețele.
        </li>
        <li>
          Partea B, proprietatea: lista unităților individuale din condominiu, cu cota fiecăreia din părțile
          comune. La un bloc mare, partea asta se poate întinde pe zeci de pagini.
        </li>
        <li>
          Partea C, sarcinile: ipoteci, servituți sau alte drepturi înscrise asupra imobilului în ansamblu.
        </li>
      </ul>
      <p>
        Notarii îl cer la tranzacții ca să verifice că apartamentul vândut chiar are cota de părți comune pe care o
        pretinde vânzătorul, iar băncile la creditele ipotecare, din același motiv.
      </p>

      <h2>Cine răspunde de actualizarea ei</h2>
      <p>
        Nimeni nu o actualizează „din oficiu”. Fiecare înscriere se face la cererea celui interesat: proprietarul
        care a cumpărat, dezvoltatorul care a dezmembrat, asociația de proprietari când se modifică ceva la părțile
        comune. Asociația are aici un rol practic: ea știe prima când se schimbă ceva la nivelul condominiului și
        poate semnala proprietarilor că situația din cartea colectivă a rămas în urmă.
      </p>
      <p>
        O carte colectivă rămasă neactualizată se simte abia la vânzare: notarul vede că suma cotelor nu bate cu
        realitatea sau că un spațiu comun a fost între timp închiriat ori vândut fără înscriere, și tranzacția se
        oprește până se lămurește situația.
      </p>

      <h3>Cum obții extrasul</h3>
      <p>
        Ai trei căi. La ghișeul OCPI din județul imobilului, cu cerere și taxa plătită la casierie. Prin notar, care
        îl obține pentru actele pe care le întocmește. Sau online: noi îl obținem de la ANCPI și ți-l trimitem pe
        email, semnat electronic:{' '}
        <Link href="/servicii/extras-cf-colectiv/">extras de carte funciară colectivă online</Link>. Pentru
        apartamentul în sine, separat, există{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extrasul de carte funciară individual</Link>.
      </p>

      <h2>Intabularea schimbărilor</h2>
      <p>
        Orice schimbare (vânzare, moștenire, dezmembrare, modificarea cotelor) produce efecte față de terți doar
        după ce e înscrisă. Procedura la OCPI arată așa:
      </p>
      <ol>
        <li>
          Depui cererea de înscriere, cu actul care dovedește schimbarea: contract de vânzare-cumpărare autentificat,
          certificat de moștenitor, act de dezmembrare.
        </li>
        <li>
          Anexezi actul de identitate și, unde e cazul, documentația cadastrală întocmită de o persoană autorizată.
        </li>
        <li>
          Registratorul OCPI verifică actele. Dacă ceva lipsește, primești referat de completare cu termen; dacă
          totul e în ordine, dispune înscrierea.
        </li>
        <li>
          Primești încheierea de carte funciară. Din acel moment, extrasul va arăta situația nouă.
        </li>
      </ol>

      <h2>La ce te ajută, concret</h2>
      <p>
        Înainte să cumperi un apartament, extrasul colectiv îți spune lucruri pe care extrasul individual nu le
        arată: dacă terenul de sub bloc e în proprietatea condominiului sau doar în folosință, dacă blocul are
        sarcini înscrise asupra ansamblului și dacă cota de părți comune din anunț chiar există în acte. Am văzut
        tranzacții blocate la notar fix pe diferența dintre cota din contract și cea din cartea colectivă. O
        verificare de câteva zeci de lei, făcută la timp, scutește luni de corespondență cu OCPI.
      </p>
      <p>
        Dacă vrei să afli întâi numărul cărții funciare sau numărul cadastral al imobilului, am scris separat{' '}
        <Link href="/cum-aflam-numarul-carte-functionara-si-nr-cadastral/">cum le găsești</Link>.
      </p>
    </ArticleLayout>
  );
}
