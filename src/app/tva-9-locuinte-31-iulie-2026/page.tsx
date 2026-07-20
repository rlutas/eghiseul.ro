import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { SystemStatus } from '@/components/services/system-status';
import { OutageAlertSignup } from '@/components/articole/outage-alert-signup';

const SLUG = 'tva-9-locuinte-31-iulie-2026';
const TITLE =
  'TVA 9% la locuințe expiră pe 31 iulie 2026 — iar ANCPI e picat. Ce faci dacă ai antecontract';
const META_TITLE = 'TVA 9% Locuințe — Termen 31 Iulie 2026 și Blocajul ANCPI';
const DESCRIPTION =
  'Cota redusă de 9% se aplică doar locuințelor livrate până pe 31 iulie 2026 inclusiv. Diferența față de 21%: 48.000–72.000 lei. Ce faci dacă notarul nu poate autentifica din cauza blocajului ANCPI.';
const DATE_PUBLISHED = '2026-07-20';
const DATE_MODIFIED = '2026-07-20';

export const revalidate = 3600; // subiect cu termen — se poate schimba oricând

export const metadata = buildPageMetadata({
  title: META_TITLE,
  description: DESCRIPTION,
  path: `/${SLUG}/`,
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
      publishedLabel="20 iulie 2026"
      updatedLabel="20 iulie 2026"
      imageAlt="Termen fiscal 31 iulie 2026 pentru cota redusă de TVA la locuințe"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Necesar la notar pentru autentificare. Comanda intră în coadă și se eliberează automat la revenirea ANCPI.',
        },
        {
          href: '/ancpi-nu-functioneaza/',
          label: 'Starea sistemelor ANCPI',
          desc: 'Cronologia blocajului, actualizată la fiecare comunicat oficial.',
        },
        {
          href: '/calculator/tva/',
          label: 'Calculator TVA',
          desc: 'Calculează diferența exactă între 9% și 21% pentru locuința ta.',
        },
        {
          href: '/calculator/valabilitate-documente/',
          label: 'Mai e valabil documentul meu?',
          desc: 'Verifică dacă extrasul CF pe care îl ai deja mai e în termen.',
        },
      ]}
      faqs={[
        {
          q: 'Pot semna acum un antecontract ca să prind TVA de 9%?',
          a: 'Nu. Aceasta este cea mai frecventă confuzie. Termenul pentru încheierea actului juridic de plată în avans (antecontractul) a fost 1 august 2025 — a expirat acum aproape un an. Termenul de 31 iulie 2026 se referă la altceva: la LIVRAREA locuinței. Cine nu avea antecontract la 1 august 2025 nu mai poate intra în regimul de 9%, indiferent ce semnează acum.',
        },
        {
          q: 'Ce trebuie să se întâmple până pe 31 iulie 2026, mai exact?',
          a: 'Livrarea locuinței — adică transferul dreptului de proprietate prin act autentic la notar, iar locuința să poată fi locuită ca atare. Faptul generator al TVA la imobile este transferul proprietății, deci practic actul autentic trebuie semnat cel târziu pe 31 iulie 2026 inclusiv. Înscrierea ulterioară în cartea funciară nu mai schimbă cota aplicată.',
        },
        {
          q: 'Care sunt condițiile complete pentru cota de 9%?',
          a: 'Cumulativ: (a) suprafață utilă maximum 120 mp, exclusiv anexele, și valoare maximum 600.000 lei fără TVA, inclusiv terenul; (b) livrare până la 31 iulie 2026, locuibilă ca atare; (c) să nu fi achiziționat altă locuință cu cotă redusă începând cu 1 ianuarie 2023 (se verifică în „Registrul achizițiilor de locuințe cu cota redusă de TVA"); (d) act juridic de plată în avans încheiat până la 1 august 2025. Pentru actele încheiate între 3 și 31 iulie 2025 există o condiție suplimentară: dovada plății unui avans de 20% din valoarea fără TVA, achitat integral până la 31 iulie 2025.',
        },
        {
          q: 'Cât pierd concret dacă ratez termenul?',
          a: 'La o locuință de 400.000 lei fără TVA: 36.000 lei TVA la 9% față de 84.000 lei la 21% — diferență de 48.000 lei (aproximativ 9.400 euro). La plafonul maxim de 600.000 lei fără TVA: 54.000 față de 126.000 lei — diferență de 72.000 lei (aproximativ 14.000 euro).',
        },
        {
          q: 'ANCPI e picat și notarul nu poate autentifica. Se prelungește termenul?',
          a: 'La data publicării acestui articol (20 iulie 2026) NU există niciun act normativ publicat care să prelungească termenul. Presa relatează, pe surse, că premierul nu intenționează o prelungire — dar nu am identificat un comunicat oficial al Guvernului sau al Ministerului Finanțelor pe această temă. Există și o propunere privată de prelungire până în 2027, fără statut legislativ. Tratează termenul ca ferm și acționează în consecință; dacă apare o prelungire, actualizăm articolul.',
        },
        {
          q: 'Am antecontract din iunie 2025 fără avans de 20%. Mai am dreptul la 9%?',
          a: 'Da. Condiția avansului de 20% se aplică doar actelor juridice încheiate în perioada 3–31 iulie 2025. Pentru antecontractele anterioare datei de 3 iulie 2025 nu există această cerință — rămân valabile celelalte condiții (suprafață, plafon de preț, livrare până la 31 iulie 2026, să nu fi mai beneficiat din 2023).',
        },
        {
          q: 'Locuința costă 620.000 lei fără TVA. Se aplică 9% până la plafon și 21% peste?',
          a: 'Nu. Plafonul de 600.000 lei este un prag, nu o tranșă: dacă valoarea îl depășește, se pierde integral dreptul la cota redusă și se aplică 21% la întreaga valoare. Aceeași logică pentru suprafața de 120 mp.',
        },
        {
          q: 'Contează data actului autentic sau data înscrierii în cartea funciară?',
          a: 'Data livrării, adică a actului autentic prin care se transferă proprietatea. Înscrierea în cartea funciară este ulterioară și are rol de opozabilitate față de terți — nu determină cota de TVA aplicabilă. Practic însă, notarul nu autentifică fără extras de carte funciară de autentificare, ceea ce leagă indirect operațiunea de funcționarea sistemelor ANCPI.',
        },
        {
          q: 'Cine suportă diferența dacă dezvoltatorul întârzie livrarea?',
          a: 'Depinde de ce scrie în antecontract — de regulă există clauze despre termenul de finalizare și consecințele întârzierii. Dacă întârzierea e imputabilă dezvoltatorului, diferența de TVA poate fi un prejudiciu pe care îl poți invoca. Verifică antecontractul cu un avocat înainte să accepți semnarea la un preț recalculat.',
        },
        {
          q: 'Cum obțin extras de carte funciară cât timp e-Terra e picat?',
          a: 'Momentan nu se poate, din nicio sursă — nici la ghișeu, nici online, pentru că toate folosesc aceleași sisteme centrale. Poți plasa comanda acum, intră în coadă și se eliberează automat, cu prioritate, în momentul revenirii sistemelor. Urmărim starea ANCPI la fiecare 15 minute.',
        },
      ]}
    >
      <p>
        <strong>Cota redusă de TVA de 9% pentru locuințe expiră pe 31 iulie 2026.</strong> Peste
        acest termen se aplică 21%, iar diferența pe o singură locuință ajunge la{' '}
        <strong>48.000–72.000 lei</strong>. Complicația de acum: ANCPI e blocat din 13 iulie, iar
        fără extras de carte funciară notarii nu pot autentifica actele. Au rămas 11 zile.
      </p>

      {/* Bloc de sinteză auto-conținut, ~150 cuvinte: răspunde complet la cele
          două întrebări cu volum („când expiră" și „se prelungește") fără să
          ceară context din restul paginii. Formă extractibilă pentru AI
          Overviews și motoarele conversaționale. */}
      <div className="not-prose my-6 rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
          Pe scurt
        </p>
        <dl className="space-y-2 text-sm leading-relaxed text-secondary-900">
          <div>
            <dt className="inline font-semibold">Când expiră TVA de 9% la locuințe? </dt>
            <dd className="inline">
              Pe 31 iulie 2026 inclusiv. Locuința trebuie livrată (act autentic semnat la notar)
              până la această dată. Peste termen se aplică 21%.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Se prelungește termenul? </dt>
            <dd className="inline">
              La 20 iulie 2026 nu există niciun act normativ publicat care să prelungească
              termenul. Presa relatează pe surse că Guvernul nu intenționează o prelungire, fără
              comunicat oficial.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Mai pot semna acum ca să prind 9%? </dt>
            <dd className="inline">
              Nu. Antecontractul trebuia încheiat până la 1 august 2025.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Cât costă dacă ratez termenul? </dt>
            <dd className="inline">
              Între 48.000 și 72.000 lei în plus, pentru o locuință de 400.000–600.000 lei fără
              TVA.
            </dd>
          </div>
        </dl>
      </div>

      {/* Corecția care contează cel mai mult. Circulă masiv ideea că „trebuie să
          semnezi contractul până la sfârșitul lunii ca să prinzi 9%" — fals, și
          îi face pe oameni să semneze acte care nu le dau niciun drept. */}
      <div className="not-prose my-8 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
        <p className="mb-2 text-lg font-bold text-amber-950">
          Cea mai frecventă confuzie: nu poți „intra&rdquo; acum în cota de 9%
        </p>
        <p className="text-sm leading-relaxed text-amber-950/85">
          Termenul pentru <strong>încheierea antecontractului</strong> (actul juridic de plată în
          avans) a fost <strong>1 august 2025</strong>, deci a expirat acum aproape un an. Data de{' '}
          <strong>31 iulie 2026</strong> se referă la <strong>livrarea locuinței</strong>, nu la
          semnarea unui contract nou.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-950/85">
          Dacă nu aveai antecontract la 1 august 2025, nu mai poți beneficia de 9%, indiferent ce
          semnezi acum. Articolul acesta se adresează celor care{' '}
          <strong>au deja antecontract din 2025</strong> și așteaptă finalizarea.
        </p>
      </div>

      <h2>Care sunt condițiile pentru TVA de 9%?</h2>
      <p>
        Regimul e o excepție tranzitorie: facilitatea generală a fost eliminată prin{' '}
        <strong>Legea nr. 141/2025</strong>, iar cota standard e 21%. Persoana fizică poate
        achiziționa <strong>o singură locuință</strong> cu 9%, în perioada 1 august 2025 – 31 iulie
        2026, dacă îndeplinește <strong>cumulativ</strong>:
      </p>
      <ul>
        <li>
          <strong>suprafață utilă maximum 120 mp</strong>, exclusiv anexele gospodărești, și{' '}
          <strong>valoare maximum 600.000 lei fără TVA</strong>, inclusiv terenul;
        </li>
        <li>
          <strong>livrare până la 31 iulie 2026</strong>, iar locuința să poată fi locuită ca atare;
        </li>
        <li>
          <strong>să nu fi achiziționat altă locuință cu cotă redusă din 1 ianuarie 2023</strong> —
          se verifică în „Registrul achizițiilor de locuințe cu cota redusă de TVA&rdquo;;
        </li>
        <li>
          <strong>act juridic de plată în avans încheiat până la 1 august 2025</strong>.
        </li>
      </ul>
      <p>
        Condiție suplimentară pentru actele încheiate <strong>între 3 și 31 iulie 2025</strong>: la
        livrare trebuie dovedită plata unui <strong>avans de 20%</strong> din valoarea fără TVA,
        achitat integral până la 31 iulie 2025.
      </p>
      <p className="text-sm text-neutral-600">
        Sursa: comunicat oficial ANAF — DGRFP Cluj-Napoca nr. CJR_DEC 12532/05.08.2025, „Cote de TVA
        pentru livrarea de locuințe, începând cu data de 01 august 2025&rdquo;.
      </p>

      <h2>Cât pierzi dacă ratezi termenul de 31 iulie?</h2>
      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-300 text-left">
              <th className="py-2 pr-4 font-semibold">Preț fără TVA</th>
              <th className="py-2 pr-4 font-semibold">TVA 9%</th>
              <th className="py-2 pr-4 font-semibold">TVA 21%</th>
              <th className="py-2 font-semibold text-red-700">Diferență</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-neutral-200">
              <td className="py-2 pr-4">300.000 lei</td>
              <td className="py-2 pr-4">27.000 lei</td>
              <td className="py-2 pr-4">63.000 lei</td>
              <td className="py-2 font-bold text-red-700">36.000 lei</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="py-2 pr-4">400.000 lei</td>
              <td className="py-2 pr-4">36.000 lei</td>
              <td className="py-2 pr-4">84.000 lei</td>
              <td className="py-2 font-bold text-red-700">48.000 lei</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">600.000 lei (plafon)</td>
              <td className="py-2 pr-4">54.000 lei</td>
              <td className="py-2 pr-4">126.000 lei</td>
              <td className="py-2 font-bold text-red-700">72.000 lei</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Atenție la plafon: <strong>600.000 lei este prag, nu tranșă</strong>. O locuință de 620.000
        lei fără TVA nu primește 9% pe primii 600.000 și 21% pe rest, ci pierde integral cota
        redusă.
      </p>
      <p>
        Pentru suma ta exactă, folosește{' '}
        <Link href="/calculator/tva/">calculatorul de TVA</Link> — adaugi sau scoți TVA din orice
        valoare, la 21% sau la cotele reduse.
      </p>

      <h2>Problema din iulie 2026: ANCPI blocat cu 11 zile înainte de termen</h2>
      <p>
        Din <strong>13 iulie 2026</strong>, sistemele ANCPI sunt indisponibile la nivel național în
        urma unui atac cibernetic confirmat oficial. Pentru cine are termen fiscal, consecința e
        directă: <strong>extrasul de carte funciară de autentificare nu se poate obține</strong>,
        iar fără el <strong>notarul nu poate autentifica actul de vânzare</strong>.
      </p>
      <p>
        Adică oameni cu antecontract valabil din 2025, care au plătit avansul și au respectat toate
        condițiile, riscă să piardă cota redusă{' '}
        <strong>dintr-un motiv care nu ține de ei</strong>. Nu au ce să facă diferit; așteaptă un
        sistem informatic.
      </p>

      <div className="not-prose my-6">
        <SystemStatus service="ancpi" />
      </div>

      {/* CTA imediat sub status: cine vede indicatorul roșu are exact atunci
          întrebarea „și ce fac?". Mesajul e specific termenului fiscal, nu
          generic — miza aici e diferența de zeci de mii de lei, nu comoditatea. */}
      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Extrasul CF îl scoatem noi, în secunda în care revine ANCPI
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Cu termenul pe 31 iulie, ordinea în coadă poate face diferența. Plasezi comanda acum,
          intră în coadă, iar platforma noastră o eliberează <strong>automat</strong> imediat ce
          sistemele răspund — nu aștepți să afli tu că a revenit și nu reiei comanda.
        </p>
        <ul className="mb-4 space-y-1.5 text-sm text-secondary-900/80">
          <li className="flex gap-2">
            <span aria-hidden className="text-primary-600">✓</span>
            <span>
              <strong>Se procesează în ordinea plasării</strong> — cine comandă azi e servit
              înaintea celor care așteaptă revenirea ca să comande.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-primary-600">✓</span>
            <span>
              <strong>Dacă nu livrăm, primești banii înapoi</strong> — integral.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden className="text-primary-600">✓</span>
            <span>
              Monitorizăm ANCPI la <strong>15 minute</strong> — am detectat căderea cu ~10 ore
              înaintea primului comunicat oficial.
            </span>
          </li>
        </ul>
        <Link
          href="/comanda/extras-carte-funciara/"
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Comandă extras CF — prioritate la revenire →
        </Link>
      </div>

      <p>
        Cumpărătorii și dezvoltatorii au cerut public prelungirea termenului. La data publicării,{' '}
        <strong>nu există niciun act normativ care să prelungească</strong> — vezi mai jos.
      </p>

      <h2>Se prelungește termenul pentru TVA de 9%?</h2>
      <ul>
        <li>
          <strong>Nu există niciun OUG, lege sau ordin publicat</strong> care să prelungească
          termenul de 31 iulie 2026.
        </li>
        <li>
          Presa relatează, <em>pe surse</em>, că premierul nu intenționează o prelungire. Nu am
          identificat un <strong>comunicat oficial</strong> al Guvernului sau al Ministerului
          Finanțelor pe această temă.
        </li>
        <li>
          Există o <strong>propunere privată</strong> de prelungire a regimului până în 2027,
          depusă la Ministerul Finanțelor — fără statut legislativ.
        </li>
      </ul>
      <p>
        <strong>Recomandarea practică: tratează termenul ca ferm.</strong> A aștepta o prelungire
        care poate să nu vină, când miza e de zeci de mii de lei, e un pariu prost. Dacă apare un act
        normativ, actualizăm articolul.
      </p>

      <h2>Ce faci concret, dacă ai antecontract și termenul se apropie</h2>
      <div className="not-prose my-6 space-y-3">
        {[
          {
            step: '1. Vorbește azi cu notarul',
            detail:
              'Întreabă explicit dacă poate programa autentificarea în ipoteza revenirii ANCPI în ultimele zile și ce documente poate pregăti în avans. Notarii cunosc situația și mulți țin liste de așteptare pentru reprogramare rapidă.',
          },
          {
            step: '2. Vorbește cu dezvoltatorul, în scris',
            detail:
              'Cere confirmarea în scris că locuința e gata de livrare și că poate semna până pe 31 iulie. Dacă întârzierea e din partea lui, corespondența scrisă îți folosește ulterior — diferența de TVA poate fi un prejudiciu invocabil.',
          },
          {
            step: '3. Plasează comanda de extras CF acum',
            detail:
              'Comenzile se procesează în ordinea plasării. Cine comandă azi primește documentul înaintea celor care așteaptă revenirea ca să comande — iar în ultimele zile înainte de termen, ordinea în coadă poate decide.',
          },
          {
            step: '4. Verifică dacă ai deja un extras valabil',
            detail:
              'Extrasul de autentificare e valabil 10 zile lucrătoare. Dacă ai obținut unul chiar înainte de 13 iulie, s-ar putea să mai fie în termen — verifică înainte să presupui că trebuie altul.',
          },
          {
            step: '5. Dacă ratezi termenul, nu semna în grabă la 21%',
            detail:
              'Consultă un avocat înainte. În funcție de clauzele antecontractului și de cauza întârzierii, poți avea temei să ceri suportarea diferenței de către dezvoltator sau renegocierea prețului.',
          },
        ].map((row, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="mb-1 font-bold text-secondary-900">{row.step}</p>
            <p className="text-sm leading-relaxed text-secondary-900/75">{row.detail}</p>
          </div>
        ))}
      </div>

      <OutageAlertSignup service="ancpi" serviceLabel="ANCPI" sourcePage={`/${SLUG}/`} />

      <h2>Ce urmărim și actualizăm</h2>
      <p>
        Subiectul are termen fix și două necunoscute: dacă ANCPI revine la timp și dacă apare o
        prelungire. Actualizăm articolul la fiecare act normativ publicat sau comunicat oficial.
        Starea sistemelor ANCPI, cu cronologia completă a incidentului, e în{' '}
        <Link href="/ancpi-nu-functioneaza/">articolul dedicat</Link>.
      </p>

      <p className="text-sm text-neutral-600">
        <strong>Precizare:</strong> articolul are scop informativ și nu constituie consultanță
        fiscală sau juridică. Pentru situația ta concretă — clauzele antecontractului, calculul
        exact al TVA, opțiunile în caz de întârziere — consultă notarul, contabilul sau un avocat.
      </p>
    </ArticleLayout>
  );
}
