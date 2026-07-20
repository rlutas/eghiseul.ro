import Link from 'next/link';
import Image from 'next/image';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { SystemStatus } from '@/components/services/system-status';
import { OutageAlertSignup } from '@/components/articole/outage-alert-signup';

const SLUG = 'ancpi-nu-functioneaza';
// H1 — descriptive. The SERP <title> is shorter (META_TITLE): the long one
// was 72 chars and Google rewrote it into a lowercase tail fragment.
const TITLE = 'ANCPI și e-Terra nu funcționează: atac cibernetic, sisteme picate național (din 13 iulie 2026)';
// Titlul din SERP țintește starea + acțiunea, nu evenimentul: cine caută vrea
// să știe dacă mai e picat și ce face, nu să citească încă o știre despre atac
// (presa ocupă oricum acele poziții cu autoritate mai mare).
const META_TITLE = 'ANCPI nu funcționează — status live, până când și ce faci';
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
        {
          q: 'Am antecontract cu termen de semnare care expiră în această perioadă. Ce fac?',
          a: 'Vorbește cu notarul și cu cealaltă parte înainte să expire termenul. Imposibilitatea de a obține extrasul de autentificare este o cauză externă, independentă de voința părților — în practică se semnează un act adițional care prelungește termenul cu durata blocajului. Nu lăsa termenul să treacă fără document scris: o prelungire verbală nu te protejează dacă cealaltă parte se răzgândește. Notarii cunosc situația și au procedura pregătită.',
        },
        {
          q: 'Am credit ipotecar aprobat. Se pierde aprobarea?',
          a: 'Aprobarea de principiu are de regulă un termen de valabilitate (30–90 de zile, în funcție de bancă). Anunță banca în scris despre blocajul ANCPI cât mai devreme — băncile sunt la curent cu situația și pot prelungi valabilitatea ofertei fără reanalizare. Riscul real nu e blocajul în sine, ci să-l anunți după ce a expirat termenul.',
        },
        {
          q: 'Notarul mi-a anulat programarea. Trebuie să reiau toată procedura?',
          a: 'Nu. Documentele deja adunate (acte de identitate, acte de proprietate, certificate fiscale) rămân valabile în limita propriilor termene. Se reprogramează doar semnarea, iar extrasul de autentificare se cere din nou la momentul potrivit — oricum are doar 10 zile lucrătoare valabilitate, deci nu se putea obține „în avans" pentru o dată incertă.',
        },
        {
          q: 'De ce durează atât reinstalarea? Nu aveau backup?',
          a: 'ANCPI a precizat pe 19 iulie că dispunea de mai multe locații de backup. După un atac cibernetic, restaurarea nu înseamnă doar copierea datelor înapoi: fiecare sistem trebuie izolat, curățat, verificat pentru a nu reintroduce vulnerabilitatea exploatată, apoi validat de instituțiile abilitate. Migrarea în Cloudul Guvernamental, anunțată pe 20 iulie, adaugă un pas suplimentar — dar și un nivel de protecție pe care infrastructura veche nu îl avea.',
        },
        {
          q: 'Cum aflu în secunda în care revine ANCPI?',
          a: 'Ai două variante, ambele fără să verifici tu nimic. Dacă ai nevoie de document: plasezi comanda acum și se eliberează automat la revenire. Dacă vrei doar să știi: lasă-ți emailul în caseta de alertă de pe această pagină și primești un singur mesaj în momentul revenirii. Monitorizarea noastră verifică portalul ANCPI la fiecare 15 minute — am detectat căderea cu aproximativ 10 ore înaintea primului comunicat oficial.',
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
            date: '17 iulie 2026, 15:01',
            tag: 'Comunicat ANCPI',
            body: (
              <>
                e-Terra, serviciile de e-mail și celelalte servicii informatice rămân indisponibile.
                Precizare importantă pentru cine avea dosar depus: fluxul de lucru fiind complet
                digitalizat, indisponibilitatea face imposibilă{' '}
                <strong>atât înregistrarea unor cereri noi, cât și soluționarea celor deja
                înregistrate</strong>. ANCPI anunță că va informa colaboratorii — persoane fizice
                autorizate, notari, executori judecătorești, avocați — prin canalele oficiale.
              </>
            ),
          },
          {
            date: '15 iulie 2026, 14:39',
            tag: 'Cauza confirmată',
            body: (
              <>
                ANCPI confirmă oficial că a fost <strong>ținta unui atac cibernetic</strong>, „care
                a generat cea mai amplă întrerupere tehnică din istoria instituției”. Precizează că
                datele administrate prin sistemele sale „sunt în siguranță și nu au fost
                compromise”. Estimarea comunicată: e-Terra nu va fi disponibilă{' '}
                <strong>până la finalul săptămânii</strong>.
              </>
            ),
          },
          {
            date: '15 iulie 2026, 12:59',
            tag: 'Amploarea reală',
            body: (
              <>
                ANCPI anunță că, începând de marți <strong>14 iulie</strong>,{' '}
                <strong>toate sistemele informatice</strong> gestionate de instituție —{' '}
                <strong>inclusiv adresele de e-mail</strong> și aplicația e-Terra — sunt
                nefuncționale. Despre cauză: „nu putem oferi detalii, întrucât situația este
                investigată de instituțiile abilitate”.
              </>
            ),
          },
          {
            date: '14 iulie 2026, 19:10',
            tag: 'Comunicat ANCPI',
            body: (
              <>
                e-Terra nu va fi disponibilă <strong>până la finalul săptămânii</strong>, ca urmare
                a unui <strong>„incident tehnic major”</strong> care a afectat o parte din sisteme.
              </>
            ),
          },
          {
            date: '14 iulie 2026, 09:06',
            tag: 'Primul comunicat',
            body: (
              <>
                ANCPI anunță că o parte din sistemele informatice sunt „temporar indisponibile, ca
                urmare a unui <strong>incident tehnic</strong> aflat în curs de investigare”.
                Accesul la anumite aplicații „poate fi limitat sau indisponibil”.
              </>
            ),
          },
          {
            date: '13 iulie 2026, 23:02',
            tag: 'Detectat de noi',
            body: (
              <>
                Monitorizarea noastră automată înregistrează căderea portalului ePay ANCPI — cu
                aproape 10 ore înaintea primului comunicat oficial. ANCPI datează ulterior începutul
                indisponibilității generalizate ca fiind <strong>marți, 14 iulie</strong>.
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

      {/* Plasat imediat după cronologie: cititorul tocmai a aflat că nu există
          termen ferm de revenire — exact momentul în care „te anunțăm noi" e
          cel mai relevant. Prinde publicul care nu comandă acum și care altfel
          pleca fără urmă. */}
      <OutageAlertSignup service="ancpi" serviceLabel="ANCPI" sourcePage={`/${SLUG}/`} />

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

      {/* CTA principal. Adresează cele două obiecții reale ale unui outage:
          „de ce aș plăti pentru ceva livrabil la o dată necunoscută?" (garanție
          + preț afișat) și „de unde știu că nu mă păcălești?" (coada e ordinea
          plasării, verificabilă). Fără astea, textul era doar promisiune. */}
      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Nu sta să urmărești când revine ANCPI — urmărim noi pentru tine
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Plasezi comanda de extras CF acum și ai terminat: intră în coadă, iar în secunda în care
          sistemele ANCPI revin, platforma noastră o eliberează <strong>automat</strong> și
          primești documentul pe email. Fără refresh la site-uri, fără drumuri, fără să reiei
          comanda.
        </p>
        <ul className="mb-4 space-y-1.5 text-sm text-secondary-900/80">
          <li className="flex gap-2">
            <span aria-hidden className="text-primary-600">✓</span>
            <span>
              <strong>Coada se procesează în ordinea plasării</strong> — cine comandă azi primește
              documentul înaintea celor care așteaptă revenirea ca să comande.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-primary-600">✓</span>
            <span>
              <strong>Dacă nu livrăm, primești banii înapoi</strong> — integral, fără discuții.
              Plata e blocată pe comandă, nu pe o promisiune.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-primary-600">✓</span>
            <span>
              Monitorizare automată la <strong>15 minute</strong> — noi am detectat căderea cu ~10
              ore înaintea primului comunicat oficial.
            </span>
          </li>
        </ul>
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
        <li>
          <strong>adresele de e-mail ale instituției</strong> — ANCPI a confirmat că sunt și ele
          nefuncționale, deci mesajele trimise către OCPI-uri în această perioadă nu ajung;
        </li>
        <li>implicit: autentificările notariale care au nevoie de extras de autentificare — semnările se reprogramează.</li>
      </ul>
      <p>
        <strong>Dacă ai deja un dosar depus, stă și el.</strong> ANCPI a precizat pe 17 iulie că,
        fluxul de lucru fiind complet digitalizat, indisponibilitatea face imposibilă{' '}
        <em>atât înregistrarea unor cereri noi, cât și soluționarea celor deja înregistrate</em>.
        Termenele de soluționare se decalează corespunzător — nu e nevoie să redepui.
      </p>
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

      {/* Publicul cel mai anxios și cel mai prost servit de presă: cine are o
          tranzacție în derulare. Știrile spun „ANCPI e picat"; nimeni nu spune
          ce faci cu termenul din antecontract care expiră marți. */}
      <h2>Ești în mijlocul unei tranzacții? Ce înseamnă concret pentru tine</h2>
      <p>
        Cea mai mare problemă a acestui blocaj nu e așteptarea în sine, ci{' '}
        <strong>termenele care curg</strong> indiferent dacă sistemele funcționează. Pe scurt, pe
        situații:
      </p>
      <div className="not-prose my-6 space-y-3">
        {[
          {
            situation: 'Ai antecontract cu termen de semnare care expiră acum',
            action:
              'Contactează notarul și cealaltă parte ÎNAINTE de expirare. Se semnează un act adițional care prelungește termenul cu durata blocajului. Imposibilitatea de a obține extrasul e o cauză externă, independentă de voința părților — dar o înțelegere verbală nu te protejează dacă cealaltă parte se răzgândește.',
          },
          {
            situation: 'Ai credit ipotecar aprobat',
            action:
              'Anunță banca în scris acum, nu după ce expiră oferta. Aprobarea are termen (de regulă 30–90 de zile); băncile cunosc situația și prelungesc fără reanalizare. Riscul e întârzierea anunțului, nu blocajul.',
          },
          {
            situation: 'Aveai programare la notar',
            action:
              'Se reprogramează doar semnarea. Documentele deja adunate rămân valabile în limita termenelor proprii — extrasul de autentificare oricum are 10 zile lucrătoare, deci nu se putea obține în avans pentru o dată incertă.',
          },
          {
            situation: 'Ai depus dosar de intabulare înainte de cădere',
            action:
              'Stă și el. ANCPI a confirmat pe 17 iulie că nu se pot soluționa nici cererile deja înregistrate. Nu redepui și nu plăti din nou — termenele de soluționare se decalează cu durata blocajului.',
          },
          {
            situation: 'Cumperi și vrei să verifici proprietarul înainte să plătești',
            action:
              'Extrasul CF nu se poate obține acum, din nicio sursă. Amână orice plată de avans până verifici — nu te baza pe un extras vechi de câteva luni și nici pe asigurările vânzătorului.',
          },
        ].map((row, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="mb-1 font-bold text-secondary-900">{row.situation}</p>
            <p className="text-sm leading-relaxed text-secondary-900/75">{row.action}</p>
          </div>
        ))}
      </div>

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
        <strong>17 iulie 2026:</strong> ANCPI precizează că, fluxul de lucru fiind complet
        digitalizat, indisponibilitatea face imposibilă{' '}
        <strong>atât înregistrarea unor cereri noi, cât și soluționarea celor deja
        înregistrate</strong> — deci și dosarele depuse înainte de cădere stau. În paralel, presa
        relatează că un hacker a scos la vânzare date și cod sursă despre care susține că provin
        din rețelele ANCPI — susțineri neconfirmate oficial.
      </p>
      <p>
        <strong>15 iulie 2026:</strong> ANCPI confirmă oficial (ora 14:39) că a fost{' '}
        <strong>ținta unui atac cibernetic</strong>, „care a generat cea mai amplă întrerupere
        tehnică din istoria instituției”, și susține că datele nu au fost compromise. Tot atunci
        (ora 12:59) anunță amploarea reală: <strong>toate</strong> sistemele informatice sunt
        nefuncționale din 14 iulie, <strong>inclusiv adresele de e-mail</strong> ale instituției.
        Comenzile plasate în această perioadă se acumulează în coadă și se procesează automat, în
        ordinea plasării, la revenire.
      </p>
      <p>
        <strong>14 iulie 2026:</strong> primul comunicat (ora 09:06) vorbește despre „un incident
        tehnic aflat în curs de investigare”, apoi seara (ora 19:10) despre un{' '}
        <strong>„incident tehnic major”</strong>, cu e-Terra indisponibilă până la finalul
        săptămânii. Actualizăm articolul la fiecare comunicat oficial nou sau când monitorizarea
        noastră detectează revenirea sistemelor.
      </p>
    </ArticleLayout>
  );
}
