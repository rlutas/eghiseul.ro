import Link from 'next/link';
import Image from 'next/image';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'sms-fals-amenda-ghiseul-ro';
const TITLE = 'SMS Fals cu Amendă de la „Ministerul Transporturilor”: frauda care imită Ghișeul.ro';
const DESCRIPTION =
  'DNSC avertizează: SMS-uri false cu amenzi de circulație trimit șoferii pe ghiiseul.cc — o clonă a platformei Ghișeul.ro care fură datele cardului. Cum recunoști mesajul, ce faci dacă ai introdus cardul și cum verifici o amendă reală.';
const DATE_PUBLISHED = '2026-07-15';
const DATE_MODIFIED = '2026-07-15';

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
      category="Auto & amenzi"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="15 iulie 2026"
      updatedLabel="15 iulie 2026"
      imageAlt="Avertisment oficial DNSC: mesaj fals care impersonează Ghișeul.ro pentru a fura datele cardului bancar — telefon cu SMS-ul fraudulos despre încălcarea regulilor de circulație"
      relatedServices={[
        {
          href: '/calculator/amenda-circulatie/',
          label: 'Calculator amendă circulație',
          desc: 'Cât e amenda reală pe clase + plata redusă în 15 zile.',
        },
        {
          slug: 'cazier-auto',
          label: 'Cazier auto online',
          desc: 'Istoricul real al sancțiunilor tale rutiere, de la Poliție.',
        },
        {
          href: '/tools/verificare-rovinieta-online/',
          label: 'Verificare rovinietă',
          desc: 'Verifică gratuit dacă vehiculul are rovinietă valabilă.',
        },
      ]}
      faqs={[
        {
          q: 'Am primit SMS că am amendă de la Ministerul Transporturilor. E real?',
          a: 'Nu. Ministerul Transporturilor nu trimite amenzi prin SMS, iar Poliția Rutieră comunică amenzile prin proces-verbal — înmânat pe loc sau trimis prin poștă, la adresa din talon. Un SMS cu link de plată pentru o „încălcare surprinsă de cameră” este fraudă (avertisment oficial DNSC, iulie 2026).',
        },
        {
          q: 'Cum recunosc SMS-ul fals cu amendă?',
          a: 'Semnele clasice: urgență artificială (termen de câteva zile, „reducere dacă plătiți acum”), amenințări (penalități, blocarea ITP, parchet), link către un domeniu care seamănă cu ghiseul.ro dar nu e (în campania curentă: ghiiseul.cc, cu doi de „i”), și cerere de date de card cu CVV. Nicio instituție publică nu cere datele cardului printr-un link din SMS.',
        },
        {
          q: 'Am dat click și am introdus datele cardului. Ce fac?',
          a: 'Sună imediat banca (numărul de pe spatele cardului) și cere blocarea cardului — apoi contestă eventualele tranzacții. Raportează frauda la DNSC pe 1911 (apel gratuit) și schimbă parolele dacă ai introdus și alte date. Cu cât suni mai repede banca, cu atât șansele de a opri tranzacțiile cresc.',
        },
        {
          q: 'Cum verific dacă am cu adevărat o amendă de circulație?',
          a: 'Pe platforma oficială a statului, ghiseul.ro — scrisă de tine, manual, în browser (nu accesată din linkuri primite prin SMS/email). Alternativ, la ghișeul instituției care a emis-o. Istoricul complet al sancțiunilor tale rutiere apare și în cazierul auto, eliberat de Poliție.',
        },
        {
          q: 'Care e diferența dintre Ghișeul.ro și eGhișeul.ro?',
          a: 'Ghișeul.ro este platforma oficială a statului pentru plata taxelor și amenzilor. eGhișeul.ro (noi) este un serviciu privat de asistență pentru obținerea documentelor (cazier, extras CF, certificate) — nu procesăm amenzi și NU trimitem niciodată SMS-uri cu linkuri de plată. Escrocii au clonat platforma statului pe domeniul fals ghiiseul.cc.',
        },
        {
          q: 'Plata redusă a amenzii în 15 zile există cu adevărat?',
          a: 'Da — poți plăti jumătate din minimul amenzii în 15 zile de la comunicare, dar asta se aplică amenzilor REALE, comunicate prin proces-verbal. Escrocii exploatează exact această regulă ca momeală („beneficiați de reducere dacă achitați acum”). Calculează valoarea reală a unei amenzi cu calculatorul nostru.',
        },
      ]}
    >
      <h2>Pe scurt: ce e frauda și de ce funcționează</h2>
      <p>
        DNSC (Directoratul Național de Securitate Cibernetică) a emis pe 15 iulie 2026 un
        avertisment despre o campanie de SMS-uri false care anunță <strong>amenzi de circulație
        inexistente</strong>, pretinzând că vin de la „Ministerul Transporturilor din România”.
        Mesajul susține că vehiculul tău a fost surprins de o cameră depășind viteza și te presează
        să plătești rapid, cu o „reducere” — clasica urgență artificială.
      </p>
      <p>
        Linkul din mesaj duce către <strong>ghiiseul.cc</strong> (doi de „i”) — o clonă vizuală a
        platformei oficiale de plăți a statului, Ghișeul.ro. Pagina falsă îți cere numărul de
        înmatriculare, date personale și, la final, <strong>datele complete ale cardului, inclusiv
        CVV</strong>. Din acel moment, banii pot fi extrași de pe card.
      </p>

      <figure className="not-prose my-6">
        <Image
          src="/images/articole/sms-fals-amenda-site-fals.webp"
          alt="Captura oficială DNSC: site-ul fals ghiiseul.cc care imită vizual platforma Ghișeul.ro și cere numărul de înmatriculare"
          width={1200}
          height={1200}
          className="w-full rounded-xl border border-neutral-200"
        />
        <figcaption className="mt-2 text-center text-sm text-neutral-500">
          Site-ul fals (ghiiseul.cc) imită platforma oficială — captură publicată de{' '}
          <a href="https://www.facebook.com/DNSC.RO/posts/1422494039911101" target="_blank" rel="nofollow noopener">
            DNSC
          </a>
          . Domeniul e deja pe lista neagră DNSC.
        </figcaption>
      </figure>

      <h2>Cum arată mesajul și semnele că e fals</h2>
      <ul>
        <li>
          <strong>Pretinde că vine de la o instituție</strong> („Ministerul Transporturilor”) care,
          în realitate, nu emite și nu comunică amenzi de circulație.
        </li>
        <li>
          <strong>Număr de „încălcare” oficial-sounding</strong> (ex. LM-2026-07038551) — inventat.
        </li>
        <li>
          <strong>Urgență artificială</strong>: termen-limită de câteva zile, „nu ratați reducerea”,
          amenințări cu penalități, blocarea ITP sau trimiterea la parchet.
        </li>
        <li>
          <strong>Link către un domeniu aproape identic</strong> cu cel oficial — ghiiseul.cc în loc
          de ghiseul.ro. La prima privire, greu de observat.
        </li>
        <li>
          <strong>Cere datele cardului cu CVV</strong> — niciun serviciu public nu face asta printr-un
          link primit pe SMS.
        </li>
      </ul>
      <p>
        Regula simplă, formulată de DNSC: <strong>amenzile reale nu vin pe SMS cu link de plată</strong>.
        Procesul-verbal se înmânează pe loc sau vine prin poștă, la adresa din certificatul de
        înmatriculare.
      </p>

      <h2>Ce faci dacă ai primit mesajul</h2>
      <ol>
        <li><strong>Nu accesa linkul.</strong> Șterge mesajul sau raportează-l ca spam.</li>
        <li>
          <strong>Vrei să verifici dacă ai vreo amendă?</strong> Intră TU pe platforma oficială
          ghiseul.ro — tastată manual în browser — sau întreabă la instituția emitentă.
        </li>
        <li>
          <strong>Ai introdus deja datele cardului?</strong> Sună imediat banca (numărul de pe
          spatele cardului), blochează cardul și contestă tranzacțiile. Apoi raportează la DNSC:{' '}
          <strong>1911</strong>, apel gratuit, 24/7.
        </li>
      </ol>

      <h2>Context: de ce prind aceste escrocherii</h2>
      <p>
        Momeala e construită pe o regulă reală: amenzile de circulație chiar se pot plăti la{' '}
        <strong>jumătate din minim în 15 zile</strong> de la comunicare — deci „reducerea dacă
        plătiți acum” sună plauzibil. Diferența e canalul: reducerea se aplică amenzilor comunicate
        prin proces-verbal, nu unor SMS-uri cu link. Dacă vrei să știi cât ar costa de fapt o
        amendă pe clase de sancțiuni,{' '}
        <Link href="/calculator/amenda-circulatie/">calculatorul nostru de amenzi</Link> îți arată
        valorile reale, cu tot cu plata redusă. Iar istoricul real al sancțiunilor tale apare în{' '}
        <Link href="/servicii/cazier-auto-online/">cazierul auto</Link>, eliberat de Poliție — nu în
        mesaje text.
      </p>

      <h2>O clarificare importantă: Ghișeul.ro vs eGhișeul.ro</h2>
      <p>
        Pentru că numele se aseamănă, o spunem direct: <strong>Ghișeul.ro</strong> este platforma
        oficială a statului pentru plata taxelor și amenzilor. <strong>eGhișeul.ro</strong> — site-ul
        pe care ești acum — este un serviciu privat de asistență pentru obținerea documentelor
        (cazier judiciar și auto, extras de carte funciară, certificate de stare civilă).{' '}
        <strong>Nu procesăm amenzi și nu trimitem niciodată SMS-uri cu linkuri de plată.</strong>{' '}
        Orice comunicare de la noi vine pe emailul cu care ai plasat o comandă, referitor la acea
        comandă.
      </p>
      <p>
        Avertismentul complet, cu capturile oficiale, e publicat de DNSC pe{' '}
        <a href="https://www.facebook.com/DNSC.RO/posts/1422494039911101" target="_blank" rel="nofollow noopener">
          pagina lor de Facebook
        </a>{' '}
        și preluat de presă (
        <a href="https://www.digi24.ro/stiri/o-noua-frauda-online-care-vizeaza-soferii-dnsc-avertizeaza-asupra-unui-sms-prin-care-romanii-sunt-pacaliti-cu-amenzi-false-3862281" target="_blank" rel="nofollow noopener">
          Digi24
        </a>
        ). Lista neagră a domeniilor fraudulente e la{' '}
        <a href="https://pnrisc.dnsc.ro/blacklist/" target="_blank" rel="nofollow noopener">
          pnrisc.dnsc.ro/blacklist
        </a>
        .
      </p>
    </ArticleLayout>
  );
}
