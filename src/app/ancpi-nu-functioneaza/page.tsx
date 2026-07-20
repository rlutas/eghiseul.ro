import Link from 'next/link';
import Image from 'next/image';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { SystemStatus } from '@/components/services/system-status';

const SLUG = 'ancpi-nu-functioneaza';
// H1 — descriptive. The SERP <title> is shorter (META_TITLE): the long one
// was 72 chars and Google rewrote it into a lowercase tail fragment.
const TITLE = 'ANCPI și e-Terra nu funcționează: atac cibernetic, sisteme picate național (din 13 iulie 2026)';
const META_TITLE = 'ANCPI Picat După Atac Cibernetic — Până Când și Ce Poți Face';
const DESCRIPTION =
  'ANCPI a confirmat un atac cibernetic: e-Terra și restul sistemelor sunt picate național din 13 iulie. Update 20 iulie: aplicațiile se mută în Cloudul Guvernamental, migrare estimată până pe 22 iulie; revenirea va fi etapizată. Comandă extrasul CF acum — îl eliberăm automat la revenire.';
const DATE_PUBLISHED = '2026-07-15';
const DATE_MODIFIED = '2026-07-20';

export const revalidate = 3600; // outage news — refresh hourly

export const metadata = buildPageMetadata({
  title: META_TITLE,
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
      publishedLabel="15 iulie 2026"
      updatedLabel="20 iulie 2026"
      imageAlt="Sistem temporar nefuncțional — sistemele informatice ANCPI indisponibile la nivel național"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Comanda se pune în coadă și se eliberează automat, cu prioritate, la revenirea ANCPI.',
        },
        {
          slug: 'identificare-imobil',
          label: 'Identificare Imobil',
          desc: 'Afli numărul de CF și cadastral după adresă.',
        },
        {
          href: '/calculator/valabilitate-documente/',
          label: 'Mai e valabil documentul meu?',
          desc: 'Verifică dacă extrasul CF sau cazierul tău mai e în termen.',
        },
      ]}
      faqs={[
        {
          q: 'De ce nu funcționează ANCPI?',
          a: 'ANCPI a confirmat că indisponibilitatea este cauzată de un atac cibernetic — pe care l-a descris drept cea mai amplă întrerupere tehnică din istoria instituției. Inițial, comunicarea vorbea doar despre „un incident tehnic aflat în curs de investigare". Căderea afectează aplicațiile la nivel național, nu doar un județ.',
        },
        {
          q: 'Ce s-a întâmplat cu datele din cartea funciară? Sunt în pericol?',
          a: 'ANCPI susține oficial că datele administrate prin sistemele sale sunt în siguranță și nu au fost compromise. În paralel, presa a relatat că un hacker susține că a obținut și a scos la vânzare date din rețelele ANCPI și codul sursă al aplicațiilor. Aceste susțineri nu au fost confirmate oficial; investigația este în curs, cu implicarea mai multor instituții. Important: înscrierile din cartea funciară rămân valabile — registrul juridic nu se pierde.',
        },
        {
          q: 'De ce nu funcționează e-Terra?',
          a: 'e-Terra este aplicația centrală de cadastru și carte funciară a ANCPI — cea folosită de OCPI-uri, notari, topografi, bănci și cetățeni. E indisponibilă din același motiv: atacul cibernetic a picat sistemele centrale ale agenției, deci e-Terra, ePay și geoportalul sunt toate blocate. Nu e o problemă locală de cont sau de browser — nu funcționează pentru nimeni.',
        },
        {
          q: 'Până când e picat ANCPI?',
          a: 'Termenul inițial comunicat de oficiile teritoriale — 20 iulie 2026 — a fost depășit. Pe 20 iulie, ANCPI a anunțat că aplicațiile se mută în Cloudul Guvernamental, operațiune coordonată de STS, cu estimarea de finalizare a migrării miercuri, 22 iulie. După migrare, sistemele vor fi verificate de instituțiile abilitate, care întocmesc un raport — abia pe baza acestuia ANCPI va comunica un termen de reluare. Repunerea în funcțiune se va face etapizat, pe componente, nu dintr-odată. Deci: 22 iulie este termenul migrării, NU al revenirii serviciilor.',
        },
        {
          q: 'Datele mele din cartea funciară au fost afectate?',
          a: 'ANCPI a comunicat pe 20 iulie că, în urma tuturor verificărilor efectuate până acum, bazele de date tehnice și juridice ale instituției nu au fost afectate. Instituția a precizat și că dispunea de mai multe locații de backup la momentul incidentului. Investigațiile tehnice și penale sunt însă în curs, iar concluziile oficiale nu au fost comunicate. Independent de asta, înscrierile din cartea funciară rămân valabile — registrul juridic nu se pierde printr-un atac informatic.',
        },
        {
          q: 'Pot obține un extras de carte funciară în această perioadă?',
          a: 'Nu, din nicio sursă — nici de la ghișeul OCPI, nici prin ANCPI online, nici prin intermediari, pentru că toate folosesc aceleași sisteme centrale. Poți plasa comanda acum: intră în coadă și se eliberează automat, cu prioritate, imediat ce sistemele revin.',
        },
        {
          q: 'Cum primesc extrasul CF fără să urmăresc eu revenirea ANCPI?',
          a: 'Plasezi comanda pe eGhișeul acum și ai terminat: intră în coadă cu prioritate, iar sistemul nostru monitorizează ANCPI continuu și eliberează documentul automat în momentul revenirii. Îl primești pe email — nu trebuie să verifici site-urile sau să reiei comanda.',
        },
        {
          q: 'Ce se întâmplă cu tranzacțiile imobiliare programate?',
          a: 'Notarii nu pot obține extrasele de autentificare, deci semnările programate în acest interval se amână de regulă după restabilirea sistemelor. OCPI-urile au recomandat oficial reprogramarea operațiunilor.',
        },
        {
          q: 'Am comandat un extras CF pe eGhișeul înainte de cădere. Ce se întâmplă cu el?',
          a: 'Nimic de făcut din partea ta: comanda e în coadă și sistemul nostru încearcă automat eliberarea imediat ce ANCPI revine. Primești documentul pe email fără să reiei comanda. Am notificat separat clienții cu comenzi în așteptare.',
        },
        {
          q: 'Extrasul CF pe care îl am deja mai e valabil?',
          a: 'Extrasul de informare nu are termen legal de valabilitate, dar instituțiile cer de regulă unul de maximum 30 de zile. Verifică rapid cu calculatorul nostru de valabilitate. Extrasul de autentificare (notar) e valabil 10 zile lucrătoare.',
        },
      ]}
    >
      <h2>Ce s-a întâmplat, pe scurt</h2>
      <p>
        Din noaptea de <strong>luni, 13 iulie 2026</strong>, sistemele informatice ale ANCPI
        (Agenția Națională de Cadastru și Publicitate Imobiliară) sunt indisponibile{' '}
        <strong>la nivel național</strong>. Monitorizarea noastră automată, care verifică
        constant portalul ePay ANCPI, a înregistrat căderea la <strong>ora 23:02</strong> — de
        atunci, serverele agenției nu mai răspund.
      </p>
      <p>
        Termenul comunicat inițial de oficiile teritoriale — <strong>20 iulie 2026</strong>, „ca
        urmare a unui incident tehnic aflat în curs de investigare” — <strong>a fost depășit</strong>.
        Situația la zi: aplicațiile se mută în Cloudul Guvernamental, migrare estimată până pe{' '}
        <strong>22 iulie</strong>, iar revenirea serviciilor se va face etapizat, cu termen anunțat
        abia după verificările instituțiilor abilitate (vezi <a href="#cronologie">cronologia</a>).
        Presa locală a relatat blocajul în mai multe județe
        (printre primele,{' '}
        <a href="https://www.bihon.ro/stirile-judetului-bihor/bihorul-afectat-de-blocajul-national-al-ancpi-cadastrul-nu-functioneaza-pana-luni-5337687/" target="_blank" rel="nofollow noopener">
          Bihorul
        </a>
        ), dar problema e centrală — aceleași sisteme deservesc toate OCPI-urile din țară.
      </p>

      {/* Timeline — cronologia oficială a incidentului. Ține cititorul (și
          clientul cu comandă în coadă) la curent fără să reia tot articolul.
          Cel mai recent sus: cine revine pe pagină vede întâi ce e nou. */}
      <h2 id="cronologie">Cronologia incidentului</h2>
      <p>
        Actualizăm secțiunea la fiecare comunicat oficial ANCPI. Cel mai recent apare primul.
      </p>
      <div className="not-prose my-6 space-y-0">
        {[
          {
            date: '20 iulie 2026',
            tag: 'Comunicat ANCPI',
            latest: true,
            body: (
              <>
                <strong>Bazele de date nu au fost afectate</strong>, în urma tuturor verificărilor
                efectuate până acum. A început <strong>migrarea aplicațiilor ANCPI în Cloudul
                Guvernamental</strong>, operațiune coordonată de <strong>STS</strong>, cu estimare de
                finalizare <strong>miercuri, 22 iulie</strong>. Urmează verificarea sistemelor de
                către instituțiile abilitate și un raport — abia apoi se comunică termenul de
                reluare. <strong>Repunerea în funcțiune va fi etapizată</strong>, în funcție de
                prioritățile operaționale.
              </>
            ),
          },
          {
            date: '19 iulie 2026',
            tag: 'Comunicat ANCPI',
            body: (
              <>
                Infrastructura informatică e într-un „amplu proces de reinstalare și consolidare”.
                ANCPI precizează că, la momentul incidentului,{' '}
                <strong>dispunea de mai multe locații de backup</strong> — contrazicând indirect
                susținerea atacatorului că backup-urile ar fi fost șterse. Investigațiile tehnice
                și penale sunt în curs, fără concluzii oficiale. Instituția atrage atenția că
                informațiile din spațiul public despre consecințele atacului{' '}
                <em>nu provin din surse oficiale</em>.
              </>
            ),
          },
          {
            date: '17 iulie 2026',
            tag: 'Cauza confirmată',
            body: (
              <>
                ANCPI confirmă oficial că este vorba despre un <strong>atac cibernetic</strong>,
                după ce inițial comunicase „incident tehnic”. Îl descrie drept cea mai amplă
                întrerupere din istoria instituției. <strong>DNSC</strong> este implicat în
                gestionarea incidentului.
              </>
            ),
          },
          {
            date: '15 iulie 2026',
            tag: 'Revendicare atacator',
            body: (
              <>
                Un actor cunoscut drept „ByteToBreach” anunță pe o platformă de comercializare a
                datelor că vinde informații din rețelele ANCPI și codul sursă al aplicațiilor.{' '}
                <strong>Susțineri neconfirmate oficial</strong>, dezmințite parțial de comunicatele
                ulterioare ale agenției.
              </>
            ),
          },
          {
            date: '15 iulie 2026',
            tag: 'Prima confirmare oficială',
            body: (
              <>
                Oficiile teritoriale comunică oficial indisponibilitatea și un termen estimat de
                revenire: <strong>20 iulie 2026</strong> — termen care avea să fie depășit.
              </>
            ),
          },
          {
            date: '13 iulie 2026, 23:02',
            tag: 'Începutul căderii',
            body: (
              <>
                Monitorizarea noastră automată înregistrează căderea portalului ePay ANCPI. De
                atunci, serverele agenției nu mai răspund.
              </>
            ),
          },
        ].map((e, i) => (
          <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
            {/* linia verticală */}
            <div className="flex flex-col items-center">
              <div
                className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${
                  e.latest ? 'bg-primary-500 ring-4 ring-primary-100' : 'bg-neutral-300'
                }`}
              />
              <div className="mt-1 w-px grow bg-neutral-200" />
            </div>
            <div className="grow pb-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-secondary-900">{e.date}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    e.latest
                      ? 'bg-primary-100 text-primary-900'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {e.tag}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-secondary-900/80">{e.body}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Cauza confirmată: atac cibernetic</h2>
      <p>
        Ce inițial a fost comunicat drept „incident tehnic” s-a dovedit a fi altceva:{' '}
        <strong>ANCPI a confirmat oficial că este victima unui atac cibernetic</strong>, descris de
        instituție drept cea mai amplă întrerupere tehnică din istoria sa (
        <a href="https://www.mediafax.ro/social/atac-cibernetic-la-ancpi-institutia-anunta-ca-sistemele-sunt-nefunctionale-dar-datele-nu-au-fost-compromise-23772862" target="_blank" rel="nofollow noopener">
          Mediafax
        </a>
        ). Directoratul Național de Securitate Cibernetică (DNSC) colaborează cu agenția pentru
        gestionarea incidentului, iar investigația implică mai multe instituții ale statului.
      </p>
      <p>
        Ce știm, cu atribuirea de rigoare:
      </p>
      <ul>
        <li>
          <strong>Poziția oficială ANCPI:</strong> datele administrate prin sistemele instituției
          „sunt în siguranță și nu au fost compromise”.
        </li>
        <li>
          <strong>Ce susține atacatorul:</strong> un actor cunoscut sub numele „ByteToBreach” a
          anunțat pe 15 iulie, pe o platformă folosită pentru comercializarea datelor din atacuri
          informatice, că vinde date obținute din rețelele ANCPI și codul sursă al aplicațiilor
          (inclusiv e-Terra, printr-o copie a serverelor GitLab), susținând că a instalat ransomware și a șters
          backup-uri — susținere pe care ANCPI a contrazis-o pe 19 iulie, precizând că{' '}
          <strong>dispunea de mai multe locații de backup</strong> la momentul incidentului — relatare{' '}
          <a href="https://publicrecord.ro/2026/07/17/atac-cibernetic-ancpi/" target="_blank" rel="nofollow noopener">
            Public Record
          </a>{' '}
          și{' '}
          <a href="https://hotnews.ro/datele-furate-dupa-atacul-cibernetic-asupra-agentiei-pentru-cadastru-scoase-la-vanzare-pe-internet-2302793" target="_blank" rel="nofollow noopener">
            HotNews
          </a>
          . <strong>Aceste susțineri nu au fost confirmate oficial.</strong>
        </li>
        <li>
          <strong>Ce nu se pierde:</strong> înscrierile din cartea funciară sunt registru juridic —
          drepturile de proprietate nu dispar din cauza unui atac informatic. Problema e de{' '}
          <em>acces</em> la sisteme, nu de valabilitate a înscrierilor.
        </li>
      </ul>

      {/* CTA principal — mesajul care ne diferențiază în SERP-ul de outage:
          nu aștepta tu revenirea, comanda intră în coadă și se livrează singură. */}
      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Nu sta să urmărești când revine ANCPI — urmărim noi pentru tine
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Plasezi comanda de extras CF acum și ai terminat: intră în coadă cu prioritate, iar în
          secunda în care sistemele ANCPI revin, platforma noastră o eliberează <strong>automat</strong> și
          primești documentul pe email. Fără refresh la site-uri, fără drumuri, fără să reiei
          comanda.
        </p>
        <Link
          href="/comanda/extras-carte-funciara/"
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Comandă extras CF — se eliberează automat la revenire →
        </Link>
      </div>

      <figure className="not-prose my-6">
        <Image
          src="/images/articole/ancpi-informare-oficiala-iulie-2026.webp"
          alt="Informarea oficială ANCPI/OCPI: aplicațiile informatice nu vor fi funcționale până în 20.07.2026, sistem temporar nefuncțional"
          width={1200}
          height={800}
          className="w-full rounded-xl border border-neutral-200"
        />
        <figcaption className="mt-2 text-center text-sm text-neutral-500">
          Informarea oficială distribuită de oficiile teritoriale ANCPI (aici, OCPI Bihor) la
          începutul incidentului: sistemele nefuncționale până în 20.07.2026 — termen ulterior
          depășit.
        </figcaption>
      </figure>

      <h2>Starea sistemelor ANCPI, în timp real</h2>
      <p>
        Monitorizarea noastră verifică portalul ANCPI continuu — indicatorul de mai jos e live, cu
        momentul exact de la care sistemele sunt indisponibile:
      </p>
      <div className="not-prose my-6">
        <SystemStatus service="ancpi" />
      </div>

      <h2>Ce nu funcționează în acest interval</h2>
      <ul>
        <li>eliberarea extraselor de carte funciară (informare și autentificare) — online și la ghișeu;</li>
        <li>recepțiile cadastrale și înscrierile în cartea funciară (intabulări, notări, radieri);</li>
        <li>aplicația e-Terra (cadastru și carte funciară), ePay și geoportalul ANCPI;</li>
        <li>implicit: autentificările notariale care au nevoie de extras de autentificare — semnările se reprogramează.</li>
      </ul>
      <p>
        Important de înțeles: <strong>nimeni nu poate ocoli căderea</strong>. Ghișeul OCPI,
        platformele online și intermediarii folosesc toți aceleași sisteme centrale. Cine promite
        „extras CF acum” în acest interval nu are cum să livreze.
      </p>

      <h2>Ce facem noi cu comenzile din această perioadă</h2>
      <p>
        Platforma noastră eliberează extrasele automat, direct din sistemele ANCPI — deci și noi
        depindem de revenirea lor. Ce am făcut:
      </p>
      <ul>
        <li>
          <strong>Statusul e afișat transparent</strong> pe paginile de comandă: indicatorul „Portal
          ANCPI” arată roșu, în timp real, cât timp sistemele sunt picate.
        </li>
        <li>
          <strong>Comenzile plasate acum intră în coadă</strong> și se eliberează automat, cu
          prioritate, în momentul în care ANCPI revine — nu trebuie să reiei comanda sau să ne
          suni.
        </li>
        <li>
          <strong>Clienții cu comenzi în așteptare au fost notificați</strong> pe email despre
          situație și despre noul termen estimat.
        </li>
      </ul>
      <p>
        Dacă ai nevoie de document imediat ce revine sistemul, cel mai sigur e să{' '}
        <Link href="/comanda/extras-carte-funciara/">plasezi comanda de pe acum</Link> — coada se
        procesează în ordinea plasării, iar tu primești extrasul pe email fără să mai faci nimic.
        Detalii despre serviciu:{' '}
        <Link href="/servicii/extras-de-carte-funciara/">extras de carte funciară</Link>.
      </p>

      <h2>Ce poți face între timp</h2>
      <ul>
        <li>
          <strong>Verifică documentele existente:</strong> poate extrasul pe care îl ai deja e încă
          în termen —{' '}
          <Link href="/calculator/valabilitate-documente/">calculatorul de valabilitate</Link> îți
          spune în 5 secunde.
        </li>
        <li>
          <strong>Pregătește dosarul:</strong> dacă urmează cadastru/intabulare, folosește pauza ca
          să aduni actele —{' '}
          <Link href="/cat-costa-cadastrul-si-intabularea/">ghidul nostru cu checklist descărcabil</Link>{' '}
          le listează pe scenarii.
        </li>
        <li>
          <strong>Amână depunerile fizice:</strong> OCPI-urile au recomandat oficial reprogramarea
          operațiunilor programate în acest interval.
        </li>
      </ul>

      <h2>Actualizări</h2>
      <p>
        <strong>20 iulie 2026:</strong> ANCPI anunță că{' '}
        <strong>bazele de date tehnice și juridice nu au fost afectate</strong>, în urma
        verificărilor de până acum. A început <strong>migrarea aplicațiilor în Cloudul
        Guvernamental</strong>, coordonată de STS, estimată să se încheie{' '}
        <strong>miercuri, 22 iulie</strong>. Atenție la nuanță: 22 iulie e termenul{' '}
        <em>migrării</em>, nu al revenirii serviciilor — după migrare urmează verificarea
        sistemelor de către instituțiile abilitate și un raport, iar termenul de reluare se
        comunică abia atunci. Repunerea va fi <strong>etapizată</strong>, pe componente. Sursă:{' '}
        <a href="https://www.ancpi.ro/" target="_blank" rel="nofollow noopener">
          comunicatele oficiale ANCPI
        </a>
        .
      </p>
      <p>
        <strong>19 iulie 2026:</strong> infrastructura e în „amplu proces de reinstalare și
        consolidare”. ANCPI precizează că avea <strong>mai multe locații de backup</strong> la
        momentul incidentului — contrazicând indirect susținerea atacatorului că ar fi șters
        copiile de siguranță. Investigațiile tehnice și penale continuă, fără concluzii oficiale.
      </p>
      <p>
        <strong>17 iulie 2026:</strong> cauza e confirmată — <strong>atac cibernetic</strong>.
        ANCPI recunoaște oficial atacul (după ce inițial comunicase „incident tehnic”) și susține
        că datele nu au fost compromise; DNSC e implicat în investigație. În paralel, presa
        relatează că un hacker a scos la vânzare date și cod sursă despre care susține că provin
        din rețelele ANCPI — susțineri neconfirmate oficial. Sistemele rămân indisponibile;
        estimarea de revenire rămâne 20 iulie 2026. Comenzile plasate în această perioadă se
        acumulează în coadă și se vor procesa automat, în ordinea plasării, la revenire.
      </p>
      <p>
        <strong>15 iulie 2026:</strong> oficiile teritoriale au confirmat oficial indisponibilitatea
        și estimarea de revenire 20 iulie 2026. Actualizăm articolul când ANCPI publică informații
        noi sau când monitorizarea noastră detectează revenirea sistemelor.
      </p>
    </ArticleLayout>
  );
}
