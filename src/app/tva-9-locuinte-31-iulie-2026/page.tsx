import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';
import { SystemStatus } from '@/components/services/system-status';

const SLUG = 'tva-9-locuinte-31-iulie-2026';
const TITLE =
  'TVA 9% la locuințe: termenul de livrare este 30 septembrie 2026, prin Legea 161/2026. Cine mai intră, cine nu';
const META_TITLE = 'TVA 9% Locuințe: Termen 30 Septembrie 2026 (Legea 161/2026)';
const DESCRIPTION =
  'Legea 161/2026 (M. Of. 642 din 4 august 2026, în vigoare din 7 august) a mutat termenul de livrare cu TVA 9% de la 31 iulie la 30 septembrie 2026. Condițiile nu s-au schimbat: antecontract până la 1 august 2025, 120 mp, 600.000 lei fără TVA. Cine a semnat la 21% între 1 și 6 august 2026 poate cere diferența înapoi din 1 octombrie.';
const DATE_PUBLISHED = '2026-07-20';
const DATE_MODIFIED = '2026-09-09';

export const revalidate = 3600; // subiect cu termen fix; ordinul ANAF de restituire poate apărea oricând

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
      updatedLabel="9 septembrie 2026"
      imageAlt="Termen fiscal 30 septembrie 2026 pentru cota redusă de TVA la locuințe"
      relatedServices={[
        {
          slug: 'extras-carte-funciara',
          label: 'Extras de Carte Funciară',
          desc: 'Extrasul de informare, obținut prin partener autorizat, în 2 zile lucrătoare.',
        },
        {
          href: '/ancpi-nu-functioneaza/',
          label: 'Starea sistemelor ANCPI',
          desc: 'Ce merge și ce nu după atacul din iulie, actualizat la fiecare comunicat.',
        },
        {
          href: '/calculator/tva/',
          label: 'Calculator TVA',
          desc: 'Diferența exactă între 9% și 21% pentru prețul locuinței tale.',
        },
        {
          href: '/calculator/valabilitate-documente/',
          label: 'Mai e valabil documentul meu?',
          desc: 'Verifică dacă extrasul CF pe care îl ai deja mai e în termen.',
        },
      ]}
      faqs={[
        {
          q: 'Până când se mai poate cumpăra o locuință cu TVA 9%?',
          a: 'Livrarea trebuie să aibă loc cel târziu pe 30 septembrie 2026 inclusiv (Legea 161/2026 art. I alin. (1) lit. b)). Termenul inițial, 31 iulie 2026, fusese stabilit prin art. III din Legea 141/2025. De la 1 octombrie 2026 livrările de locuințe se taxează cu cota standard de 21%.',
        },
        {
          q: 'Pot semna acum un antecontract ca să prind 9%?',
          a: 'Nu. Condiția d) din art. I al Legii 161/2026 cere un act juridic de plată în avans încheiat până la 1 august 2025. Prelungirea din august 2026 a mutat doar data livrării, nu și data antecontractului. Cine nu avea antecontract la 1 august 2025 nu intră în regim, indiferent ce semnează acum.',
        },
        {
          q: 'Care sunt condițiile, exact?',
          a: 'Cumulativ: suprafață utilă de maximum 120 mp fără anexe gospodărești și valoare de maximum 600.000 lei fără TVA, inclusiv terenul; locuința să poată fi locuită ca atare la livrare, cel târziu pe 30 septembrie 2026; cumpărătorul să nu fi achiziționat altă locuință cu cotă redusă de la 1 ianuarie 2023, verificat în Registrul achizițiilor de locuințe cu cota redusă de TVA; antecontract încheiat până la 1 august 2025. Pentru antecontractele din 3 până în 31 iulie 2025 se cere în plus dovada unui avans de 20% din valoarea fără TVA, plătit integral până la 31 iulie 2025 (art. I alin. (2)).',
        },
        {
          q: 'Am semnat actul la 21% pe 3 august 2026, când legea nu era încă în vigoare. Ce fac?',
          a: 'Ceri restituirea diferenței dintre 21% și 9%. Art. II din Legea 161/2026 acoperă exact livrările făcute cu cota standard între 1 august 2026 și 6 august 2026, ultima zi dinaintea intrării în vigoare, dacă îndeplinești toate condițiile. Cererile se pot depune începând cu 1 octombrie 2026, după procedura aprobată prin ordin al președintelui ANAF. Restituirea se acordă pentru o singură locuință.',
        },
        {
          q: 'A apărut procedura ANAF de restituire?',
          a: 'Legea dă ANAF 30 de zile de la 7 august 2026 ca să aprobe procedura prin ordin publicat în Monitorul Oficial. La data actualizării acestui articol, 9 septembrie 2026, nu am găsit ordinul publicat. Până apare, păstrează factura, actul autentic și dovada plății; cererea se depune oricum abia de la 1 octombrie.',
        },
        {
          q: 'Ce înseamnă „livrare”: actul la notar sau înscrierea în cartea funciară?',
          a: 'Actul la notar. Codul fiscal art. 281 alin. (6) spune că pentru bunuri imobile data livrării este data la care intervine transferul dreptului de a dispune de bun ca proprietar, adică actul autentic de vânzare. Înscrierea în cartea funciară vine după și nu schimbă cota. Practic însă, notarul nu autentifică fără extras de carte funciară pentru autentificare, iar acela vine de la ANCPI.',
        },
        {
          q: 'Locuința costă 620.000 lei fără TVA. Se aplică 9% până la plafon și 21% peste?',
          a: 'Nu. Condiția a) cere ca valoarea să nu depășească 600.000 lei fără TVA. Dacă o depășește, cota redusă se pierde pentru întreaga valoare, nu doar pentru ce trece de prag. La fel pentru suprafața de 120 mp.',
        },
        {
          q: 'Cât pierd dacă ratez termenul de 30 septembrie?',
          a: 'Diferența dintre 21% și 9% din prețul fără TVA. La 400.000 lei: 84.000 lei față de 36.000 lei, adică 48.000 lei în plus. La plafonul de 600.000 lei: 126.000 lei față de 54.000 lei, adică 72.000 lei în plus.',
        },
        {
          q: 'Cine suportă diferența dacă dezvoltatorul nu livrează la timp?',
          a: 'Depinde de antecontract. Dacă întârzierea e imputabilă dezvoltatorului, diferența de TVA e un prejudiciu pe care îl poți invoca, dar temeiul stă în clauzele semnate, nu în legea fiscală. Verifică termenul de finalizare și consecințele întârzierii cu un avocat înainte să accepți o recalculare a prețului.',
        },
        {
          q: 'ANCPI funcționează? Se pot obține extrase pentru autentificare?',
          a: 'Aplicația e-Terra a fost repornită etapizat din 11 august 2026 pentru personalul ANCPI, oficiile de cadastru și notari, deci extrasele pentru autentificare se pot cere din nou. Platformele online pentru public au rămas oprite mai mult timp, iar oficiile lucrează cu restanțe. Starea la zi, cu cronologia completă, e în articolul despre ANCPI.',
        },
      ]}
    >
      <p>
        <strong>Ce s-a schimbat de la ultima actualizare.</strong> Prelungirea votată de Senat pe 27
        iulie a devenit lege: <strong>Legea 161/2026</strong> privind unele măsuri fiscal-bugetare,
        promulgată prin Decretul 712 din 4 august 2026, publicată în Monitorul Oficial nr. 642 din
        aceeași zi și în vigoare de pe <strong>7 august 2026</strong>. Termenul de livrare cu TVA 9%
        nu mai este 31 iulie, ci <strong>30 septembrie 2026 inclusiv</strong>. Condițiile au rămas
        identice, iar cine a fost nevoit să semneze la 21% în cele șase zile dintre 1 și 6 august
        are un mecanism de restituire.
      </p>

      {/* Bloc de sinteză auto-conținut: răspunde la „când expiră” și „ce condiții”
          fără context din restul paginii. Formă extractibilă pentru AI Overviews. */}
      <div className="not-prose my-6 rounded-xl border border-neutral-300 bg-neutral-50 p-5">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
          Pe scurt
        </p>
        <dl className="space-y-2 text-sm leading-relaxed text-secondary-900">
          <div>
            <dt className="inline font-semibold">Când expiră TVA de 9% la locuințe? </dt>
            <dd className="inline">
              Livrarea, adică actul autentic la notar, trebuie făcută până pe 30 septembrie 2026
              inclusiv (Legea 161/2026 art. I). De la 1 octombrie 2026 se aplică 21%.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Mai pot intra acum în regimul de 9%? </dt>
            <dd className="inline">
              Nu. Antecontractul trebuia încheiat până la 1 august 2025. Prelungirea a mutat doar
              data livrării.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Am plătit 21% între 1 și 6 august 2026. </dt>
            <dd className="inline">
              Ceri diferența înapoi, pentru o singură locuință, din 1 octombrie 2026, după
              procedura ANAF (art. II).
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">Cât costă ratarea termenului? </dt>
            <dd className="inline">
              Între 48.000 și 72.000 lei în plus, pentru o locuință de 400.000 până la 600.000 lei
              fără TVA.
            </dd>
          </div>
        </dl>
      </div>

      <h2>Cum s-a ajuns aici: cotele la locuințe, în ordine</h2>
      <p>
        Regimul de acum e ultimul rest al unei facilități care s-a strâns în trei pași, și fiecare
        pas a lăsat în urmă un articol de tranziție. Ca să înțelegi de ce „9%” mai există într-un
        Cod fiscal care nu îl mai prevede, trebuie citite în ordine.
      </p>
      <table>
        <thead>
          <tr>
            <th>Perioadă</th>
            <th>Cota la locuințe (≤120 mp, ≤600.000 lei)</th>
            <th>Actul</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>până la 31 decembrie 2023</td>
            <td>5%</td>
            <td>Codul fiscal art. 291 alin. (3) lit. c), forma de atunci</td>
          </tr>
          <tr>
            <td>1 ianuarie 2024 – 31 iulie 2025</td>
            <td>9%, o singură locuință de persoană</td>
            <td>Legea 296/2023, care a mutat locuințele la art. 291 alin. (2) lit. m) pct. 3</td>
          </tr>
          <tr>
            <td>de la 1 august 2025</td>
            <td>21% (cota standard); 9% doar tranzitoriu, cu antecontract până la 1 august 2025 și livrare până la 31 iulie 2026</td>
            <td>Legea 141/2025 art. II pct. 42–43 și art. III</td>
          </tr>
          <tr>
            <td>7 august – 30 septembrie 2026</td>
            <td>9% tranzitoriu, aceleași condiții, livrare până la 30 septembrie 2026</td>
            <td>Legea 161/2026 art. I</td>
          </tr>
          <tr>
            <td>de la 1 octombrie 2026</td>
            <td>21%</td>
            <td>Codul fiscal art. 291 alin. (1)</td>
          </tr>
        </tbody>
      </table>
      <p>
        Detaliul care contează pentru cine citește Codul fiscal direct: Legea 141/2025 a rescris
        art. 291 alin. (1) și (2) cu cotele de 21% și 11% și a abrogat alin. (3), unde stăteau
        locuințele. Cota de 9% la locuințe nu mai e în Cod, ci într-un articol de tranziție de sine
        stătător, art. III din Legea 141/2025, pe care Legea 161/2026 l-a preluat cu un termen nou.
        Dacă cauți „9%” în art. 291 și nu îl găsești, nu înseamnă că facilitatea a dispărut; înseamnă
        că e în altă parte.
      </p>

      <h2>Condițiile, așa cum sunt scrise în Legea 161/2026</h2>
      <p>
        Art. I alin. (1): persoana fizică, singură sau împreună cu alte persoane fizice, poate
        cumpăra <strong>o singură locuință</strong> cu 9% în perioada dintre 7 august și 30 septembrie
        2026 inclusiv, dacă îndeplinește cumulativ:
      </p>
      <ul>
        <li>
          suprafață utilă de maximum 120 mp, exclusiv anexele gospodărești, și valoare de maximum
          600.000 lei fără TVA, inclusiv terenul pe care e construită; suprafața utilă e cea din
          Legea locuinței 114/1996, anexele cele din Legea 50/1991;
        </li>
        <li>
          locuința să poată fi locuită ca atare la livrare, care nu poate depăși 30 septembrie 2026,
          conform condițiilor în vigoare la data antecontractului;
        </li>
        <li>
          să nu fi cumpărat altă locuință cu cotă redusă începând cu 1 ianuarie 2023, potrivit
          Registrului achizițiilor de locuințe cu cota redusă de TVA;
        </li>
        <li>
          să fi încheiat până la 1 august 2025 un act juridic între vii care are ca obiect plata în
          avans pentru locuință.
        </li>
      </ul>
      <p>
        Alin. (2) adaugă condiția specială pentru antecontractele semnate <strong>între 3 și 31 iulie
        2025</strong>, în ultimele săptămâni dinaintea schimbării: la livrare trebuie dovedit un avans
        de 20% din valoarea fără TVA, plătit integral până la 31 iulie 2025. Pentru un antecontract din
        iunie 2025 sau mai vechi, condiția asta nu există.
      </p>
      <p>
        Alin. (3) pune notarii în rolul de filtru. Înainte de autentificare, ei consultă registrul;
        dacă persoana a mai cumpărat cu cotă redusă din 2023, autentifică numai cu 21%. Completează
        registrul la autentificare și înscriu în act cota aplicată. Nu e o verificare pe care o poți
        ocoli sau negocia.
      </p>

      <h2>Ce înseamnă „livrare” și de ce contează notarul, nu cartea funciară</h2>
      <p>
        Codul fiscal art. 281 alin. (6): pentru bunuri imobile, data livrării este data la care
        intervine transferul dreptului de a dispune de bun ca proprietar. Asta e data actului autentic
        de vânzare. Înscrierea în cartea funciară e ulterioară și nu mută cota.
      </p>
      <p>
        Legătura cu ANCPI e indirectă, dar reală: la autentificarea unui act prin care se transferă
        un drept imobiliar, notarul cere extrasul de carte funciară pentru autentificare, valabil 10
        zile lucrătoare, timp în care nu se mai face nicio altă înscriere pe imobil (Legea 7/1996 art.
        35 alin. (3)). Fără extras nu există act autentic; fără act autentic nu există livrare. Exact
        așa a ajuns blocajul din iulie să pună în pericol cota de 9% pentru oameni care își
        îndepliniseră toate condițiile.
      </p>

      <h2>Cine nu intră, oricât ar vrea</h2>
      <ul>
        <li>
          cine a semnat antecontractul pe 1 august 2025 sau după: legea cere „până la data de 1
          august 2025”, iar prelungirea din 2026 nu a atins această dată;
        </li>
        <li>
          cine a semnat între 3 și 31 iulie 2025 fără să fi plătit 20% avans până la 31 iulie 2025;
        </li>
        <li>
          cine a cumpărat deja o locuință cu 5% sau 9% de la 1 ianuarie 2023 încoace, singur sau în
          comun;
        </li>
        <li>
          locuința care trece de 600.000 lei fără TVA sau de 120 mp utili: pragul nu e tranșă, se
          pierde tot.
        </li>
      </ul>

      <h2>Restituirea pentru cei prinși în golul 1–6 august 2026</h2>
      <p>
        Între expirarea termenului vechi, 31 iulie, și intrarea în vigoare a legii noi, 7 august, au
        fost șase zile în care unii au semnat la 21% pentru că nu mai puteau amâna. Art. II din Legea
        161/2026 e scris pentru ei: persoana fizică ce a cumpărat cu cota standard în perioada dintre
        1 august 2026 și data intrării în vigoare poate cere restituirea diferenței dintre 21% și 9%,
        pentru o singură locuință, dacă îndeplinește aceleași condiții a)–d) și, după caz, condiția
        avansului de 20%. Dacă a cumpărat mai multe locuințe eligibile în intervalul ăsta, se
        restituie diferența doar pentru cea al cărei fapt generator a intervenit primul (alin. (3)).
      </p>
      <p>
        Cererile se pot depune începând cu <strong>1 octombrie 2026</strong>, potrivit procedurii
        aprobate prin ordin al președintelui ANAF în termen de 30 de zile de la intrarea în vigoare,
        deci până în jurul datei de 6 septembrie, cu publicare în Monitorul Oficial (alin. (5)). La 9
        septembrie 2026, când am actualizat pagina, nu am găsit ordinul publicat. Verificăm și
        completăm când apare. Până atunci: actul autentic, factura cu TVA 21% și dovada plății sunt
        documentele de păstrat.
      </p>

      <h2>Cât pierzi dacă livrarea alunecă în octombrie</h2>
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
        Pentru suma ta exactă, <Link href="/calculator/tva/">calculatorul de TVA</Link> adaugă sau
        scoate TVA din orice valoare, la 21% sau la cotele reduse.
      </p>

      <h2>ANCPI, la zi</h2>
      <p>
        Motivul prelungirii a fost blocajul sistemelor ANCPI, indisponibile la nivel național din
        13–14 iulie 2026 după un atac informatic. Aplicația e-Terra a fost repornită etapizat pe{' '}
        <strong>11 august</strong> pentru personalul ANCPI, oficiile de cadastru și notari, iar din 12
        august pentru topografi, experți și executori. Asta înseamnă că notarii pot cere din nou
        extrase pentru autentificare, cu timpi de răspuns mai mari cât se recuperează restanțele.
        Platformele online pentru public au revenit mai încet. Cronologia completă, cu fiecare
        comunicat, e în <Link href="/ancpi-nu-functioneaza/">articolul despre ANCPI</Link>.
      </p>
      <div className="not-prose my-6">
        <SystemStatus service="ancpi" />
      </div>
      <p>
        Dacă ai nevoie de un extras de carte funciară de informare, ca să verifici sarcinile
        înainte de semnare sau ca să îl dai băncii, îl obținem prin{' '}
        <Link href="/comanda/extras-carte-funciara/">partener autorizat, în 2 zile lucrătoare</Link>.
        Extrasul pentru autentificare îl cere numai notarul, în numele lui; nu îl poate comanda
        nimeni altcineva în locul lui.
      </p>

      <h2>Ce faci concret până pe 30 septembrie</h2>
      <div className="not-prose my-6 space-y-3">
        {[
          {
            step: '1. Fixează data la notar acum',
            detail:
              'Ultimele două săptămâni din septembrie vor fi aglomerate, pentru că toți cei prinși de blocaj au același termen. Notarul trebuie să ceară extrasul de autentificare cu cele 10 zile lucrătoare de valabilitate în minte; întreabă-l când îl solicită.',
          },
          {
            step: '2. Cere dezvoltatorului confirmarea în scris',
            detail:
              'Că locuința e finalizată, poate fi locuită ca atare și că semnează până pe 30 septembrie. Dacă întârzierea vine de la el, corespondența scrisă e ce vei avea în mână la o discuție despre cine suportă diferența.',
          },
          {
            step: '3. Verifică-ți încadrarea înainte de ziua semnării',
            detail:
              'Data antecontractului (până la 1 august 2025), avansul de 20% dacă ai semnat în iulie 2025, suprafața utilă din documentația cadastrală, prețul fără TVA sub 600.000 lei. Notarul verifică registrul în ziua actului; mai bine afli tu înainte.',
          },
          {
            step: '4. Dacă ai semnat la 21% între 1 și 6 august',
            detail:
              'Pregătește dosarul de restituire: act autentic, factură, dovada plății, antecontractul și dovada avansului. Cererea se depune de la 1 octombrie 2026, după ordinul ANAF.',
          },
          {
            step: '5. Dacă ratezi termenul, nu semna în grabă la 21%',
            detail:
              'Citește clauzele antecontractului despre termenul de finalizare și consecințele întârzierii, cu un avocat. Diferența de zeci de mii de lei merită o oră de consultanță înainte de semnătură.',
          },
        ].map((row, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4">
            <p className="mb-1 font-bold text-secondary-900">{row.step}</p>
            <p className="text-sm leading-relaxed text-secondary-900/75">{row.detail}</p>
          </div>
        ))}
      </div>

      <h2>Ce urmărim</h2>
      <p>
        Două lucruri pot schimba pagina asta: ordinul ANAF cu procedura de restituire și o eventuală
        nouă prelungire, despre care la 9 septembrie nu există niciun proiect depus pe care să îl fi
        găsit. Actualizăm la fiecare act publicat în Monitorul Oficial, nu la fiecare declarație.
      </p>

      <p className="text-sm text-neutral-600">
        <strong>Surse:</strong> Legea 161/2026, M. Of. nr. 642 din 4 august 2026 (textul integral pe
        static.anaf.ro); Legea 141/2025, M. Of. nr. 699 din 25 iulie 2025, art. II pct. 42–43 și art.
        III; Legea 296/2023, sinteza ANAF; Legea 227/2015 privind Codul fiscal, art. 281 și 291;
        Legea 7/1996 art. 35. <strong>Precizare:</strong> articolul are scop informativ și nu
        constituie consultanță fiscală sau juridică. Pentru clauzele antecontractului, calculul exact
        al TVA și opțiunile în caz de întârziere, consultă notarul, contabilul sau un avocat.
      </p>
    </ArticleLayout>
  );
}
