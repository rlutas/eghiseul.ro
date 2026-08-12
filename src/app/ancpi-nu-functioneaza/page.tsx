import Link from 'next/link';
import Image from 'next/image';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { SystemStatus } from '@/components/services/system-status';
import { OutageAlertSignup } from '@/components/articole/outage-alert-signup';

const SLUG = 'ancpi-nu-functioneaza';
// H1 — descriptive. The SERP <title> is shorter (META_TITLE): the long one
// was 72 chars and Google rewrote it into a lowercase tail fragment.
const TITLE = 'ANCPI și e-Terra: atac cibernetic, blocaj național din 13 iulie — e-Terra repornită etapizat din 11 august, platformele publice încă oprite';
// Titlul din SERP țintește starea + acțiunea, nu evenimentul: cine caută vrea
// să știe dacă mai e picat și ce face, nu să citească încă o știre despre atac
// (presa ocupă oricum acele poziții cu autoritate mai mare).
// „Cadastru" adăugat 29.07: e numele sub care presa și Google Trends numesc
// criza („atacul de la Cadastru", trend 2K+/24h) — căutarea vine pe el.
const META_TITLE = 'ANCPI / Cadastru: ce funcționează azi — status live';
const DESCRIPTION =
  'Update 12 august: e-Terra a fost repornită etapizat (11 august, ora 15:00) pentru ANCPI, OCPI și notari, iar de azi, ora 8:30, și pentru topografi, experți judiciari și executori. Platformele online pentru public rămân OPRITE — verificat azi. Comandă extrasul CF acum, îl eliberăm automat la revenire.';
const DATE_PUBLISHED = '2026-07-15';
const DATE_MODIFIED = '2026-08-12';

export const revalidate = 3600; // outage news — refresh hourly

// Contor zile de blocaj. Cifra e primul lucru pe care îl caută cineva care
// revine pe pagină, iar un număr scris de mână se învechește în 24h —
// revalidate=3600 îl ține exact fără să atingem articolul zilnic.
// Referință: 14 iulie, data de la care ANCPI datează indisponibilitatea
// generalizată (noi detectasem căderea în noaptea de 13 spre 14, ora 23:02).
const OUTAGE_START_UTC = Date.UTC(2026, 6, 14);
function outageDayCount(): number {
  return Math.floor((Date.now() - OUTAGE_START_UTC) / 86_400_000) + 1;
}

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
  ogImage: `/images/articole/${SLUG}.webp`,
});

export default function Page() {
  const outageDays = outageDayCount();

  return (
    <ArticleLayout
      slug={SLUG}
      category="Cadastru & imobiliare"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="15 iulie 2026"
      updatedLabel="12 august 2026"
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
          a: 'Nu există încă un termen oficial, dar există primul semnal concret. Potrivit circularei transmise camerelor notarilor publici pe 6 august, în urma întâlnirii cu ANCPI, reprezentanții agenției propun ca repornirea aplicației e-Terra să aibă loc săptămâna viitoare, cu reluare treptată a activității. Atenție: e o propunere dintr-o ședință de lucru, nu un comunicat ANCPI cu dată fermă. Toate termenele avansate până acum (20 iulie, 22 iulie, estimarea premierului 27–31 iulie) au fost depășite, iar pe 27 iulie Guvernul a refuzat explicit să mai avanseze o dată. Repunerea va fi etapizată, pe componente.',
        },
        {
          q: 'Migrarea în Cloudul Guvernamental s-a terminat pe 22 iulie. De ce tot nu funcționează?',
          a: 'Pentru că migrarea muta infrastructura, nu repunea serviciile. După mutare urmează pașii care durează efectiv: verificarea fiecărui sistem de către instituțiile abilitate, raportul tehnic pe baza căruia se decide reluarea, apoi repunerea etapizată, pe componente, pe măsură ce fiecare element de infrastructură e confirmat ca fiind sigur. Într-un incident de securitate, a reporni prea repede înseamnă riscul de a reintroduce exact vulnerabilitatea exploatată — de aceea termenul se comunică după raport, nu înainte.',
        },
        {
          q: 'Datele mele din cartea funciară au fost afectate?',
          a: 'ANCPI a comunicat pe 20 iulie că, în urma tuturor verificărilor efectuate până acum, bazele de date tehnice și juridice ale instituției nu au fost afectate. Instituția a precizat și că dispunea de mai multe locații de backup la momentul incidentului. Investigațiile tehnice și penale sunt însă în curs, iar concluziile oficiale nu au fost comunicate. Independent de asta, înscrierile din cartea funciară rămân valabile — registrul juridic nu se pierde printr-un atac informatic.',
        },
        {
          q: 'Pot obține un extras de carte funciară în această perioadă?',
          a: 'Încă nu online. Din 11 august e-Terra a repornit etapizat, dar DOAR pentru profesioniști (ANCPI, OCPI, notari, iar din 12 august topografi, experți judiciari și executori), iar platformele online pentru public rămân oprite până la un anunț separat — verificat de noi, portalul ePay nu răspunde nici azi. În plus, prima zi de funcționare a fost dedicată înregistrării actelor restante, cu solicitările de extrase blocate inclusiv pentru notari. Poți plasa comanda acum: intră în coadă și se eliberează automat, cu prioritate, imediat ce portalul public revine.',
        },
        {
          q: 'Cum primesc extrasul CF fără să urmăresc eu revenirea ANCPI?',
          a: 'Plasezi comanda pe eGhișeul acum și ai terminat: intră în coadă cu prioritate, iar sistemul nostru monitorizează ANCPI continuu și eliberează documentul automat în momentul revenirii. Îl primești pe email — nu trebuie să verifici site-urile sau să reiei comanda.',
        },
        {
          q: 'Ce se întâmplă cu tranzacțiile imobiliare programate?',
          a: 'Situația s-a deblocat parțial: din 11 august notarii au din nou acces la e-Terra și pot înregistra actele instrumentate în perioada blocajului, iar cererile aflate în lucru (~94.000) și-au păstrat rangul, cu termenele legale prelungite. Extrasele de autentificare nu s-au putut cere însă din prima zi, iar timpii de răspuns pot fi mai mari în perioada următoare — deci întreabă notarul înainte să confirmi o dată de semnare. Extrasele emise înainte de incident și valabile atunci au primit o prelungire egală cu durata indisponibilității.',
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
          q: 'Am citit că e-Terra a repornit. De ce tot nu-mi pot lua extrasul?',
          a: 'Fiindcă „e-Terra a repornit" nu înseamnă „ANCPI online a repornit". Repornirea din 11 august vizează exclusiv aplicația internă folosită de personalul ANCPI/OCPI, de notari și, din 12 august, de topografii autorizați, experții tehnici judiciari și executorii judecătorești. Platformele online destinate publicului — inclusiv cea prin care se eliberează extrasele de carte funciară — rămân oprite și revin, spune ANCPI, etapizat și cu anunț prealabil.',
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
        Suntem în <strong>ziua {outageDays}</strong> de blocaj. Termenul comunicat inițial de
        oficiile teritoriale — <strong>20 iulie 2026</strong>, „ca urmare a unui incident tehnic
        aflat în curs de investigare” — a fost depășit, la fel și termenul migrării în Cloudul
        Guvernamental (<strong>22 iulie</strong>), care s-a încheiat fără ca serviciile să revină.
        Situația la zi: atacul a fost confirmat pe <strong>27 iulie</strong> ca fiind de tip{' '}
        <strong>ransomware</strong> — o parte din infrastructura de virtualizare a fost criptată și
        ștearsă. <strong>Marți, 11 august, ora 15:00</strong>, e-Terra a fost{' '}
        <strong>repornită etapizat</strong> pentru personalul ANCPI, pentru oficiile de cadastru
        (OCPI) și pentru notarii publici, iar de <strong>miercuri, 12 august, ora 8:30</strong>,
        accesul s-a extins la persoanele autorizate să execute lucrări de cadastru, experții
        tehnici judiciari și executorii judecătorești. Atenție însă la ce NU s-a repornit:{' '}
        <strong>celelalte platforme online destinate publicului rămân oprite</strong> și revin
        „etapizat, cu anunț prealabil" — inclusiv portalul prin care se eliberează online extrasele
        de carte funciară (vezi <a href="#cronologie">cronologia</a>). Presa locală a relatat blocajul în mai multe județe
        (printre primele,{' '}
        <a href="https://www.bihon.ro/stirile-judetului-bihor/bihorul-afectat-de-blocajul-national-al-ancpi-cadastrul-nu-functioneaza-pana-luni-5337687/" target="_blank" rel="nofollow noopener">
          Bihorul
        </a>
        ), dar problema e centrală, aceleași sisteme deservesc toate OCPI-urile din țară.
      </p>

      {/* Statusul live + CTA-ul stau ÎMPREUNĂ, imediat după intro. Cine intră pe
          articol vrea două lucruri, în ordinea asta: „mai e picat?" și „ce fac
          acum?". Le aveam la jumătatea paginii, după cronologie, prea jos
          pentru cineva care caută răspunsul pe telefon. */}
      <h2 id="status">Mai e picat ANCPI? Starea sistemelor, în timp real</h2>
      <p>
        <strong>Parțial.</strong> De marți, 11 august, e-Terra merge din nou — dar{' '}
        <strong>doar pentru profesioniști</strong>: personalul ANCPI și OCPI, notarii publici și,
        din 12 august, topografii autorizați, experții tehnici judiciari și executorii
        judecătorești. Pentru public,{' '}
        <strong>platformele online ale ANCPI sunt în continuare oprite</strong> — am verificat
        portalul ePay și în ziua <strong>{outageDays}</strong> de blocaj, iar serverele tot nu
        răspund. Practic: notarul tău poate lucra din nou, dar un extras de carte funciară nu se
        poate încă scoate online. Verificăm portalul la fiecare 15 minute; indicatorul de mai jos e
        live:
      </p>
      <div className="not-prose my-6">
        <SystemStatus service="ancpi" />
      </div>

      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Ai nevoie de extras de carte funciară? Îl scoatem noi, imediat ce revine
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Nu poți grăbi revenirea ANCPI, dar poți fi primul în coadă când revine. Plasezi comanda
          acum, iar platforma noastră o eliberează <strong>automat</strong>, în secunda în care
          sistemele răspund. Primești documentul pe email, fără să reiei comanda și fără să
          urmărești tu nimic.
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

      {/* Timeline, cronologia oficială a incidentului. Ține cititorul (și
          clientul cu comandă în coadă) la curent fără să reia tot articolul.
          Cel mai recent sus: cine revine pe pagină vede întâi ce e nou. */}
      <h2 id="cronologie">Cronologia incidentului</h2>
      <p>
        Actualizăm secțiunea la fiecare comunicat oficial ANCPI. Cel mai recent apare primul.
      </p>
      <div className="not-prose my-6 space-y-0">
        {[
          {
            date: '12 august 2026',
            tag: 'Acces extins',
            latest: true,
            body: (
              <>
                De la <strong>ora 8:30</strong>, e-Terra devine disponibilă și pentru{' '}
                <strong>persoanele autorizate să execute lucrări de cadastru, experții tehnici
                judiciari și executorii judecătorești</strong> care aveau acces înainte de
                incident. <strong>Celelalte platforme online ale ANCPI destinate publicului rămân
                oprite</strong> și vor fi repuse „etapizat, cu anunț prealabil" — inclusiv cea prin
                care se eliberează online extrasele de carte funciară. Verificarea noastră din
                această zi: portalul ePay ANCPI tot nu răspunde. ANCPI avertizează că pot apărea{' '}
                <strong>timpi de răspuns mai mari</strong>, iar unele documente PDF pot fi
                temporar indisponibile până la finalizarea migrării în cloud. Call center:{' '}
                0749 012 525, 0749 016 331, 0735 950 582.
              </>
            ),
          },
          {
            date: '11 august 2026',
            tag: 'Repornire etapizată',
            body: (
              <>
                <strong>Prima veste bună în 29 de zile.</strong> De la <strong>ora 15:00</strong>,
                aplicația e-Terra este <strong>repornită etapizat</strong> pentru personalul ANCPI,
                pentru oficiile de cadastru și publicitate imobiliară (OCPI) și pentru{' '}
                <strong>notarii publici</strong>. Repornirea vizează exclusiv e-Terra — sistemul
                prin care se fac înregistrarea, gestiunea și evidența cadastrală și publicitatea
                imobiliară — și e „un prim pas către reluarea completă". Prima zi e dedicată{' '}
                <strong>înregistrării actelor din perioada de indisponibilitate</strong>: OCPI
                prioritizează actele primite prin corespondență, iar notarii pot înregistra actele
                instrumentate cât timp sistemul a fost blocat. Consecință directă pentru public:{' '}
                <strong>în prima zi nu se pot solicita extrase de carte funciară</strong>. Cele
                aproximativ <strong>94.000 de cereri</strong> aflate în lucru la momentul
                incidentului își păstrează <strong>rangul</strong>, cu termenele legale prelungite;
                extrasele emise înainte și valabile la data incidentului primesc o prelungire de
                valabilitate egală cu numărul zilelor de indisponibilitate.
              </>
            ),
          },
          {
            date: '6 august 2026',
            tag: 'Circulară notari',
            body: (
              <>
                Prin circulara nr. 4979, transmisă camerelor notarilor publici și consultată de
                noi, <strong>Uniunea Națională a Notarilor Publici</strong> comunică rezultatul
                întâlnirii de miercuri cu reprezentanții ANCPI: implementarea măsurilor tehnice
                pentru reoperaționalizarea e-Terra <strong>„se apropie de final, fiind la momentul
                actual în etapa de pregătire a reluării activității”</strong>. Potrivit aceleiași
                circulare, reprezentanții ANCPI{' '}
                <strong>propun ca repornirea aplicației să aibă loc săptămâna viitoare</strong>,
                cu reluare treptată. Primul semnal de dată de la începutul crizei, dar rămâne o{' '}
                <strong>propunere dintr-o ședință de lucru</strong>, nu un comunicat cu dată fermă:
                toate termenele anterioare au fost depășite, iar UNNPR însăși scrie că estimările
                de până acum „au fost pur speculative și au creat confuzie”.
              </>
            ),
          },
          {
            date: '5 august 2026',
            tag: 'Comunicat Guvern',
            body: (
              <>
                Guvernul confirmă că e-Terra rămâne oprită. La testele independente derulate de{' '}
                <strong>STS, DNSC și Cyberint</strong> într-un mediu controlat s-a identificat{' '}
                <strong>„un număr limitat de aspecte tehnice”</strong> care trebuie corectate
                înainte ca aplicația să fie expusă public. Repunerea se face „imediat ce toate
                testele tehnice și validările vor fi finalizate cu succes”, cu o informare nouă
                promisă <strong>cel târziu vineri, 7 august</strong>. În paralel, ANCPI și
                Ministerul Dezvoltării elaborează și testează, împreună cu notarii și cu
                specialiștii cadastrali, o <strong>procedură de reluare a activității</strong>,
                astfel încât înregistrarea operațiunilor să se facă cu respectarea strictă a legii
                și cu perturbări minime — adică se pregătește și modul în care se tratează coada de
                dosare acumulată.
              </>
            ),
          },
          {
            date: '3 august 2026',
            tag: 'Comunicat Guvern',
            body: (
              <>
                Guvernul anunță că testele de <strong>securitate, funcționalitate și
                performanță</strong> efectuate de <strong>STS, DNSC și Cyberint</strong> asupra
                aplicației e-Terra, în infrastructura din Cloudul Guvernamental, „au parcurs o
                nouă rundă de evaluare”. Constatările au fost transmise ANCPI, care lucrează cu
                cele trei instituții la <strong>remedierea și retestarea fiecărui aspect
                identificat</strong> — fiecare corecție trece printr-o validare înainte de etapa
                următoare. Repunerea în funcțiune se va face „imediat ce toate testele și
                validările tehnice sunt finalizate cu succes”, deci <strong>tot fără o dată
                anunțată</strong>; Guvernul promite o nouă informare publică{' '}
                <strong>cel târziu miercuri, 5 august</strong>.
              </>
            ),
          },
          {
            date: '29 iulie 2026',
            tag: 'Informare notari',
            body: (
              <>
                Notarii publici sunt informați, printr-o comunicare internă transmisă camerelor
                notarilor publici (consultată de noi), că în cursul zilei a avut loc o nouă rundă
                de discuții cu ANCPI: echipele tehnice au înregistrat progrese, dar{' '}
                <strong>„nu pot preciza o dată de la care aplicația informatică va fi
                funcțională”</strong>. Se discută și <strong>soluții alternative</strong> pentru
                deblocarea situației. Semnificația practică: nici profesioniștii care depind
                direct de e-Terra nu au primit un termen, confirmă poziția Guvernului din 27
                iulie.
              </>
            ),
          },
          {
            date: '27 iulie 2026',
            tag: 'Confirmare ransomware',
            body: (
              <>
                Guvernul confirmă natura atacului: <strong>ransomware</strong> — „atacatorii au{' '}
                <strong>criptat și șters o parte din infrastructura de virtualizare</strong> care
                găzduiește aplicațiile agenției”. Baza cadastrală centrală nu a fost afectată.
                Reconstrucția se face <strong>integral în Cloudul Guvernamental</strong>, dar{' '}
                <strong>fără termen</strong>: „nu putem încă anunța o oră sau o dată fermă de
                repunere în funcțiune, nu dorim să facem promisiuni pe care condițiile tehnice ne
                pot obliga să le amânăm”. Estimarea 27–31 iulie devine astfel incertă.
              </>
            ),
          },
          {
            date: '27 iulie 2026',
            tag: 'TVA 9% — Senat',
            body: (
              <>
                Senatul adoptă aproape unanim (126 la 1) prelungirea termenului pentru{' '}
                <strong>TVA 9% la locuințe: de la 31 iulie la 30 septembrie 2026</strong>, tocmai
                din cauza blocajului ANCPI. Proiectul include și restituirea diferenței de TVA
                pentru cei nevoiți să plătească 21% între timp. Atenție:{' '}
                <strong>nu e încă lege</strong> — urmează votul decisiv în Camera Deputaților,
                promulgarea și Monitorul Oficial.
              </>
            ),
          },
          {
            date: '23 iulie 2026',
            tag: 'Estimare guvern',
            body: (
              <>
                Premierul <strong>Bolojan</strong> anunță că{' '}
                <strong>„în cursul săptămânii viitoare se va relua activitatea agenției”</strong> —
                deci în intervalul <strong>27–31 iulie</strong> — și că accesul la baze de date va
                redeveni posibil. Precizează durata: „marți în această săptămână am avut o
                săptămână de când activitatea agenției este blocată; până marți săptămâna viitoare
                vor fi două săptămâni”. Reconfirmă că datele legate de proprietăți nu au fost
                afectate. Atenție: e o <strong>estimare guvernamentală</strong>, nu un termen
                asumat de ANCPI printr-un comunicat.
              </>
            ),
          },
          {
            date: '22 iulie 2026',
            tag: 'Termen depășit',
            body: (
              <>
                Data la care era estimată finalizarea migrării în Cloudul Guvernamental{' '}
                <strong>trece fără repunerea serviciilor</strong>. Era, de altfel, exact ce
                anunțase ANCPI: 22 iulie era termenul migrării, nu al revenirii. Urmează
                verificarea sistemelor de către instituțiile abilitate și raportul tehnic pe baza
                căruia se comunică termenul de reluare. e-Terra, ePay și geoportalul rămân
                indisponibile.
              </>
            ),
          },
          {
            date: '20 iulie 2026',
            tag: 'Comunicat ANCPI',
            body: (
              <>
                <strong>Bazele de date nu au fost afectate</strong>, în urma tuturor verificărilor
                efectuate până acum. A început <strong>migrarea aplicațiilor ANCPI în Cloudul
                Guvernamental</strong>, operațiune coordonată de <strong>STS</strong>, cu estimare de
                finalizare <strong>miercuri, 22 iulie</strong>. Urmează verificarea sistemelor de
                către instituțiile abilitate și un raport, abia apoi se comunică termenul de
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
                înregistrate</strong>. ANCPI anunță că va informa colaboratorii, persoane fizice
                autorizate, notari, executori judecătorești, avocați, prin canalele oficiale.
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
                <strong>inclusiv adresele de e-mail</strong> și aplicația e-Terra, sunt
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
          termen ferm de revenire, exact momentul în care „te anunțăm noi" e
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
          backup-uri, susținere pe care ANCPI a contrazis-o pe 19 iulie, precizând că{' '}
          <strong>dispunea de mai multe locații de backup</strong> la momentul incidentului, relatare{' '}
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
          începutul incidentului: sistemele nefuncționale până în 20.07.2026, termen ulterior
          depășit.
        </figcaption>
      </figure>

      <h2>Ce nu funcționează în acest interval</h2>
      <ul>
        <li>eliberarea extraselor de carte funciară (informare și autentificare) — online și la ghișeu;</li>
        <li>recepțiile cadastrale și înscrierile în cartea funciară (intabulări, notări, radieri);</li>
        <li>aplicația e-Terra (cadastru și carte funciară), ePay și geoportalul ANCPI;</li>
        <li>
          <strong>adresele de e-mail ale instituției</strong> — ANCPI a confirmat că sunt și ele
          nefuncționale, deci mesajele trimise către OCPI-uri în această perioadă nu ajung;
        </li>
        <li>implicit: autentificările notariale care au nevoie de extras de autentificare, semnările se reprogramează.</li>
      </ul>
      <p>
        <strong>Dacă ai deja un dosar depus, stă și el.</strong> ANCPI a precizat pe 17 iulie că,
        fluxul de lucru fiind complet digitalizat, indisponibilitatea face imposibilă{' '}
        <em>atât înregistrarea unor cereri noi, cât și soluționarea celor deja înregistrate</em>.
        Termenele de soluționare se decalează corespunzător, nu e nevoie să redepui.
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
          prioritate, în momentul în care ANCPI revine, nu trebuie să reiei comanda sau să ne
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
              'Contactează notarul și cealaltă parte ÎNAINTE de expirare. Se semnează un act adițional care prelungește termenul cu durata blocajului. Imposibilitatea de a obține extrasul e o cauză externă, independentă de voința părților, dar o înțelegere verbală nu te protejează dacă cealaltă parte se răzgândește.',
          },
          {
            situation: 'Ai credit ipotecar aprobat',
            action:
              'Anunță banca în scris acum, nu după ce expiră oferta. Aprobarea are termen (de regulă 30–90 de zile); băncile cunosc situația și prelungesc fără reanalizare. Riscul e întârzierea anunțului, nu blocajul.',
          },
          {
            situation: 'Aveai programare la notar',
            action:
              'Se reprogramează doar semnarea. Documentele deja adunate rămân valabile în limita termenelor proprii, extrasul de autentificare oricum are 10 zile lucrătoare, deci nu se putea obține în avans pentru o dată incertă.',
          },
          {
            situation: 'Ai depus dosar de intabulare înainte de cădere',
            action:
              'Stă și el. ANCPI a confirmat pe 17 iulie că nu se pot soluționa nici cererile deja înregistrate. Nu redepui și nu plăti din nou, termenele de soluționare se decalează cu durata blocajului.',
          },
          {
            situation: 'Cumperi și vrei să verifici proprietarul înainte să plătești',
            action:
              'Extrasul CF nu se poate obține acum, din nicio sursă. Amână orice plată de avans până verifici, nu te baza pe un extras vechi de câteva luni și nici pe asigurările vânzătorului.',
          },
          {
            situation: '⚠️ Ai antecontract cu TVA 9% și termenul fiscal expira pe 31 iulie',
            action:
              'Vești bune, cu o rezervă: Senatul a adoptat pe 27 iulie prelungirea termenului de livrare de la 31 iulie la 30 septembrie 2026, exact din cauza blocajului ANCPI, plus restituirea diferenței pentru cei care apucă să plătească 21%. NU e încă lege, mai trebuie votul Camerei Deputaților, promulgarea și publicarea în Monitorul Oficial. Până nu apare în Monitor, nu semna nimic pe 21% fără să vorbești cu notarul și cu dezvoltatorul despre clauze de ajustare. Detaliile la zi, în articolul dedicat.',
          },
        ].map((row, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="mb-1 font-bold text-secondary-900">{row.situation}</p>
            <p className="text-sm leading-relaxed text-secondary-900/75">{row.action}</p>
          </div>
        ))}
      </div>

      <p>
        Dacă ești în ultima situație, citește și{' '}
        <Link href="/tva-9-locuinte-31-iulie-2026/">
          ce înseamnă termenul de 31 iulie pentru TVA de 9%
        </Link>{' '}
        — condițiile exacte, cât pierzi dacă ratezi și dacă se prelungește termenul.
      </p>

      {/* Digital PR: „cadastru" e în Google Trends pe fondul crizei, iar noi
          suntem singurii cu monitorizare independentă la 15 min. Widgetul e
          gratuit la embed; linkul de atribuire din snippet e backlink-ul. */}
      <h2 id="embed">Pentru redacții și site-uri: widget live, gratuit de preluat</h2>
      <p>
        Monitorizăm independent sistemele ANCPI la fiecare 15 minute, din prima noapte a căderii —
        am detectat blocajul cu ~10 ore înaintea primului comunicat oficial. Widgetul de mai jos
        arată starea în timp real și contorul zilelor de blocaj, se actualizează singur și poate fi
        preluat gratuit de orice publicație. Singura condiție: păstrați linkul de atribuire.
      </p>
      <div className="not-prose my-6">
        <iframe
          src="/embed/ancpi/"
          width="400"
          height="150"
          style={{ border: 0, borderRadius: 12, overflow: 'hidden', maxWidth: '100%' }}
          title="Starea sistemelor ANCPI — monitorizare live eGhișeul.ro"
          loading="lazy"
        />
      </div>
      <p>Codul de preluare (copiază și lipește în pagină):</p>
      <div className="not-prose my-4 overflow-x-auto rounded-xl bg-neutral-900 p-4">
        <pre className="whitespace-pre-wrap break-all text-xs leading-relaxed text-neutral-100">{`<iframe src="https://eghiseul.ro/embed/ancpi/" width="400" height="150"
  style="border:0;border-radius:12px;max-width:100%"
  title="Starea sistemelor ANCPI — monitorizare live eGhișeul.ro" loading="lazy"></iframe>
<p style="font-size:12px;margin:4px 0 0">Sursa: <a href="https://eghiseul.ro/ancpi-nu-functioneaza/">monitorizare ANCPI live, eGhișeul.ro</a></p>`}</pre>
      </div>
      <p>
        Pentru redacții avem și <strong>datele brute de monitorizare</strong> (ferestrele exacte de
        indisponibilitate, cu timestamp) și un interlocutor pentru context, scrieți-ne la{' '}
        <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>.
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
        <strong>12 august 2026 — e-Terra a repornit, dar nu pentru tine (încă).</strong> Marți,{' '}
        <strong>11 august, ora 15:00</strong>, aplicația e-Terra a fost repornită etapizat pentru
        personalul ANCPI, pentru OCPI-uri și pentru notarii publici. De{' '}
        <strong>miercuri, 12 august, ora 8:30</strong>, accesul s-a extins la persoanele autorizate
        să execute lucrări de cadastru, la experții tehnici judiciari și la executorii
        judecătorești. E prima veste bună în 29 de zile și înseamnă că actele blocate încep să se
        înregistreze.
      </p>
      <p>
        Partea pe care o omit majoritatea titlurilor din presă:{' '}
        <strong>platformele online destinate publicului rămân oprite</strong>. ANCPI scrie explicit
        că vor fi repuse „etapizat, cu anunț prealabil". Am verificat noi portalul ePay în ziua{' '}
        <strong>{outageDays}</strong> — tot nu răspunde. Deci un extras de carte funciară încă nu
        se poate scoate online, nici de tine, nici de noi. Prima zi de funcționare a fost oricum
        dedicată înregistrării actelor restante, cu <strong>solicitările de extrase blocate</strong>{' '}
        chiar și pentru notari.
      </p>
      <p>
        Ce se întâmplă cu dosarele care așteaptă: cele aproximativ{' '}
        <strong>94.000 de cereri</strong> aflate în lucru la momentul incidentului își păstrează{' '}
        <strong>rangul</strong>, iar termenele legale au fost prelungite. Extrasele emise înainte de
        incident și valabile la acea dată primesc o prelungire de valabilitate egală cu numărul
        zilelor de indisponibilitate — adică nu-ți pică autentificarea din cauza unui document
        expirat între timp. ANCPI avertizează că, în prima perioadă, pot apărea{' '}
        <strong>timpi de răspuns mai mari</strong>, iar unele PDF-uri pot fi temporar indisponibile
        până la finalizarea migrării în cloud.
      </p>
      <p>
        Ce facem noi: comenzile rămân în coadă și se eliberează automat, în ordinea plasării, în
        momentul în care portalul public revine. Monitorizarea rulează la fiecare 15 minute, deci
        vei afla de la noi, nu invers.
      </p>
      <p>
        <strong>7 august 2026, primul semnal de dată concretă:</strong> printr-o circulară transmisă
        camerelor notarilor publici (nr. 4979 din 6 august), pe care am consultat-o,{' '}
        <strong>Uniunea Națională a Notarilor Publici</strong> anunță rezultatul întâlnirii de miercuri,
        6 august, cu reprezentanții ANCPI: implementarea măsurilor tehnice pentru reoperaționalizarea
        e-Terra <strong>„se apropie de final, fiind la momentul actual în etapa de pregătire a reluării
        activității”</strong>. Iar, potrivit aceleiași circulare, reprezentanții ANCPI{' '}
        <strong>propun ca repornirea aplicației să aibă loc săptămâna viitoare</strong>, cu reluare
        treptată a activității.
      </p>
      <p>
        Nuanța contează, și o spunem răspicat: e o <strong>propunere</strong> formulată într-o
        ședință de lucru, nu un comunicat ANCPI cu dată fermă. Toate termenele avansate până acum au
        fost depășite: 20 iulie, 22 iulie, estimarea premierului pentru 27–31 iulie. În plus, UNNPR
        însăși scrie în circulară că estimările anterioare „au fost pur speculative și au creat
        confuzie”, motiv pentru care comunicatele către notari au fost temporizate până la primirea
        unor elemente concrete din surse oficiale. Deci: primul semnal serios de dată, dar încă
        neconfirmat printr-un act oficial al ANCPI.
      </p>
      <p>
        Tot pe 7 august, ANCPI a confirmat public că lucrează, împreună cu Ministerul Dezvoltării, la
        o <strong>procedură de reluare a activității</strong>, elaborată și testată în consultare cu
        notarii și cu specialiștii cadastrali, astfel încât înregistrarea operațiunilor să se facă cu
        respectarea strictă a legii și cu perturbări minime. Practic, se pregătește nu doar repornirea
        tehnică, ci și modul în care se va trata coada de dosare acumulată în cele peste trei
        săptămâni de blocaj.
      </p>
      <p>
        <strong>7 august 2026:</strong> ziua <strong>{outageDays}</strong> de blocaj. Marți,{' '}
        <strong>5 august</strong>, Guvernul a confirmat că e-Terra rămâne oprită și că sistemul se
        redeschide „imediat ce toate testele tehnice și validările vor fi finalizate cu succes”, fără
        să avanseze o dată. Formularea folosită de autorități: la testele independente derulate de{' '}
        <strong>STS, DNSC și Cyberint</strong> într-un mediu controlat s-a identificat{' '}
        <strong>„un număr limitat de aspecte tehnice”</strong> care trebuie corectate înainte de
        expunerea publică a aplicației. Motivul invocat pentru prudență e rezonabil: mai bine găsesc
        problemele în teste decât după redeschidere, ca să nu urmeze o a doua cădere. În paralel, ANCPI
        poartă discuții cu notarii și cu specialiștii cadastrali despre procedurile de lucru la
        repornire. Guvernul a promis o informare publică{' '}
        <strong>cel târziu vineri, 7 august</strong>, cu stadiul concret al remedierilor, o adăugăm
        aici imediat ce apare.
      </p>
      <p>
        <strong>4 august 2026:</strong> ziua <strong>{outageDays}</strong> de blocaj. Pe{' '}
        <strong>3 august</strong>, Guvernul a comunicat oficial (gov.ro) că testele de{' '}
        <strong>securitate, funcționalitate și performanță</strong> derulate de STS, DNSC și
        Cyberint asupra e-Terra, în infrastructura din Cloudul Guvernamental, au parcurs{' '}
        <strong>o nouă rundă de evaluare</strong>; constatările au fost transmise ANCPI, care
        lucrează cu cele trei instituții la remedierea și retestarea fiecărui aspect. Semnal
        pozitiv: aplicația e instalată în cloud și se testează efectiv, dar repunerea rămâne
        condiționată de finalizarea cu succes a tuturor validărilor, <strong>fără dată
        anunțată</strong>. Guvernul promite o nouă informare publică{' '}
        <strong>cel târziu miercuri, 5 august</strong> — o documentăm aici imediat ce apare.
      </p>
      <p>
        <strong>29 iulie 2026 (după-amiază):</strong> potrivit unei informări interne transmise
        camerelor notarilor publici, pe care am consultat-o, în cursul zilei a avut loc o nouă
        rundă de discuții cu ANCPI: progrese tehnice, dar{' '}
        <strong>fără o dată la care aplicația va fi funcțională</strong> — nici notarii, care
        depind direct de e-Terra pentru autentificări, nu au primit un termen. În discuție sunt și{' '}
        <strong>soluții alternative</strong> pentru deblocarea situației; dacă apar concret, le
        documentăm aici.
      </p>
      <p>
        <strong>29 iulie 2026:</strong> ziua <strong>{outageDays}</strong> de blocaj, fără termen
        de repornire. Pe <strong>27 iulie</strong>, Guvernul a confirmat că atacul a fost de tip{' '}
        <strong>ransomware</strong> — atacatorii au criptat și șters o parte din infrastructura de
        virtualizare, și a refuzat explicit să mai avanseze o dată: „nu dorim să facem promisiuni
        pe care condițiile tehnice ne pot obliga să le amânăm”. Baza cadastrală centrală rămâne
        neafectată. Tot pe 27 iulie, <strong>Senatul a votat prelungirea termenului TVA 9% până la
        30 septembrie</strong> (detalii în{' '}
        <Link href="/tva-9-locuinte-31-iulie-2026/">articolul despre TVA</Link> — nu e încă lege,
        urmează Camera Deputaților).
      </p>
      <p>
        <strong>26 iulie 2026:</strong> sistemele ANCPI sunt în continuare picate, ziua{' '}
        <strong>{outageDays}</strong> de blocaj. Nu există comunicat ANCPI cu dată fermă de
        repunere; cel mai recent anunț de pe site-ul instituției rămâne cel privind migrarea
        încheiată pe 22 iulie. Ce e realist de așteptat: reluare <strong>în cursul săptămânii
        27–31 iulie</strong>, conform estimării premierului, și <strong>etapizat</strong> — adică
        e posibil ca unele servicii să revină înaintea altora. Monitorizarea noastră verifică
        portalul la fiecare 15 minute; comenzile deja plasate se eliberează automat, în ordinea
        plasării, în momentul revenirii.
      </p>
      <p>
        <strong>23 iulie 2026:</strong> premierul <strong>Bolojan</strong> declară că{' '}
        <strong>„în cursul săptămânii viitoare se va relua activitatea agenției”</strong> (deci
        27–31 iulie) și că accesul la bazele de date va redeveni posibil, reconfirmând că datele
        legate de proprietăți nu au fost afectate. Rămâne o estimare guvernamentală, ANCPI nu a
        confirmat o dată prin comunicat propriu.
      </p>
      <p>
        <strong>22 iulie 2026:</strong> termenul migrării în Cloudul Guvernamental trece{' '}
        <strong>fără repunerea serviciilor</strong> — exact cum anunțase ANCPI: 22 iulie era
        termenul migrării, nu al revenirii. Urmează verificarea sistemelor de instituțiile
        abilitate și raportul tehnic.
      </p>
      <p>
        <strong>20 iulie 2026:</strong> ANCPI anunță că{' '}
        <strong>bazele de date tehnice și juridice nu au fost afectate</strong>, în urma
        verificărilor de până acum. A început <strong>migrarea aplicațiilor în Cloudul
        Guvernamental</strong>, coordonată de STS, estimată să se încheie{' '}
        <strong>miercuri, 22 iulie</strong>. Atenție la nuanță: 22 iulie e termenul{' '}
        <em>migrării</em>, nu al revenirii serviciilor, după migrare urmează verificarea
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
        momentul incidentului, contrazicând indirect susținerea atacatorului că ar fi șters
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
