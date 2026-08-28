import Link from 'next/link';
import { buildPageMetadata, serviceUrl } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cele-4-tipuri-de-certificat-constatator-online';
const TITLE = 'Tipurile de certificat constatator online: ghid actualizat';
const DESCRIPTION =
  'Cele cinci rapoarte care se numesc toate „certificat constatator”: pe firmă (de bază, fonduri IMM, insolvență), ' +
  'pe persoană fizică și cu istoric. Ce conține fiecare, la ce ți-l cer instituțiile, cât costă și când merită luat direct de la ONRC prin InfoCert.';
const DATE_PUBLISHED = '2024-01-01';
const DATE_MODIFIED = '2026-08-28';

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
      category="Comercial / ONRC"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="ianuarie 2024"
      updatedLabel="28 august 2026"
      relatedServices={[
        { slug: 'certificat-constatator', label: 'Certificat Constatator ONRC', desc: 'Obține certificatul constatator online, fără drum la ghișeu.' },
        { href: '/eliberare-certificat-constatator-onrc-ghid/', label: 'Ghid eliberare certificat constatator', desc: 'Pașii compleți pentru obținere de la ONRC.' },
      ]}
      faqs={[
        { q: 'Câte tipuri de certificat constatator există?', a: 'Pe firmă (CUI) există trei rapoarte: certificatul constatator de bază, cel pentru fonduri IMM și cel pentru insolvență. Separat, poți comanda certificat constatator pe persoană fizică (CNP) și certificat constatator cu istoric.' },
        { q: 'Ce este certificatul constatator?', a: 'Este documentul prin care ONRC atestă ce scrie în Registrul Comerțului despre o firmă la data emiterii: date de identificare, coduri CAEN, administratori, asociați și starea ei.' },
        { q: 'Ce tip de certificat constatator îmi trebuie?', a: 'Pentru licitații, bănci, notar, viză, leasing, instanță sau ANAF/TVA: cel de bază. Pentru accesare de fonduri europene/IMM (AFIR, APIA, ministere, primărie): cel pentru fonduri IMM. Pentru licitație, notar sau tribunal în context de insolvență: cel pentru insolvență. Pentru verificarea unei persoane (asociat/administrator): cel pe persoană fizică. Pentru istoricul complet al firmei: cel cu istoric.' },
        { q: 'Cât costă certificatul constatator online?', a: 'Certificatul constatator pe firmă (de bază, fonduri IMM sau insolvență) și cel pe persoană fizică costă 73,55 lei + TVA. Certificatul constatator cu istoric costă 402,48 lei + TVA.' },
        { q: 'Cât durează eliberarea certificatului constatator?', a: 'Certificatul de bază, cel pe persoană fizică și cel cu istoric se emit automat, de obicei în câteva minute, 24/7, inclusiv noaptea și în weekend. Rapoartele pentru fonduri IMM și insolvență trec prin backoffice-ul ONRC și durează de regulă până la 24 de ore lucrătoare.' },
      ]}
    >
      {/* Intro rescris 26 iulie 2026: varianta veche pornea cu două fraze despre
          „rolul esențial al ONRC” înainte de orice informație utilă. Query-ul
          „certificat constatator online” are 17.884 expuneri/3 luni la CTR 0,56% —
          omul vrea să știe ce tip îi trebuie, nu ce rol are instituția. */}
      <p>
        Există cinci rapoarte diferite care se numesc, toate, „certificat constatator”, iar dacă
        alegi greșit îl plătești de două ori. Pe firmă (după CUI) sunt trei: cel de bază, cel pentru
        fonduri IMM și cel pentru insolvență. Separat, mai există certificatul pe persoană fizică
        (după CNP) și cel cu istoric.
      </p>
      <p>
        Mai jos: ce conține fiecare, la ce anume ți-l cer instituțiile, plus întrebarea
        care apare mereu: <a href="#infocert">când merită să-l iei direct de la ONRC</a> și când nu.
      </p>

      <h2>Ce este un certificat constatator?</h2>
      <p>
        E documentul prin care ONRC atestă, cu semnătură electronică, ce scrie în Registrul Comerțului despre o
        firmă sau o persoană la data emiterii: cine o administrează, unde are sediul, ce coduri CAEN are
        autorizate, în ce stare e. Instituția care ți-l cere nu se mulțumește cu spusele tale, vrea fotografia
        oficială din registru.
      </p>

      <h2>Tipurile de certificat constatator (actualizat 2026)</h2>
      <p>
        În formularul nostru de comandă alegi întâi subiectul certificatului, firmă (CUI),
        persoană fizică (CNP) sau firmă cu istoric, iar pentru firmă alegi apoi tipul de raport:
        de bază, pentru fonduri IMM sau pentru insolvență. Mai jos găsești fiecare variantă, cu scopurile exacte
        acceptate de ONRC și prețul.
      </p>

      <h3>1. Certificat constatator de bază (pe firmă): 73,55 lei + TVA</h3>
      <p>
        Cel mai cerut tip: situația la zi a societății (date de identificare, sediu, coduri CAEN,
        administratori/asociați, statut). Scopurile acceptate includ: licitație, bancă, leasing, birou
        notar public, obținere viză, ambasadă, instanță, parchet, poliție, eliberare cazier judiciar, ANAF /
        Administrația Finanțelor Publice, înregistrare în scopuri de TVA, Registrul Operatorilor Intracomunitari,
        autorizare, ARR, RAR, vamă, CNAS, Casa de Pensii, OCPI, primărie, informare și altele.
        Se emite automat, de obicei în câteva minute, 24/7, inclusiv noaptea și în weekend. Detalii
        complete: <Link href="/certificat-constatator-de-baza/">certificatul constatator de bază</Link>.
      </p>
      <p>
          <Link
            href="/comanda/certificat-constatator/?tip=de-baza"
            className="not-prose inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 px-5 py-2.5 text-sm font-semibold text-secondary-900 transition-colors no-underline"
          >
            Comandă certificat de bază · 73,55 lei + TVA
          </Link>
      </p>

      <h3>2. Certificat constatator pentru fonduri IMM (pe firmă): 73,55 lei + TVA</h3>
      <p>
        Destinat firmelor care accesează fonduri europene sau granturi. Scopuri acceptate:
        Accesare Fonduri Europene, Fonduri IMM, APIA (Agenția de Plăți și Intervenții în
        Agricultură), AFIR, Ministerul Muncii, Ministerul Economiei, primărie. Include, pe lângă
        datele de identificare, informații despre acționari/asociați și capital. Trece prin
        backoffice-ul ONRC, deci îl primești de regulă în maximum 24 de ore lucrătoare.
      </p>
      <p>
          <Link
            href="/comanda/certificat-constatator/?tip=imm"
            className="not-prose inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 px-5 py-2.5 text-sm font-semibold text-secondary-900 transition-colors no-underline"
          >
            Comandă certificat fonduri IMM · 73,55 lei + TVA
          </Link>
      </p>

      <h3>3. Certificat constatator pentru insolvență (pe firmă): 73,55 lei + TVA</h3>
      <p>
        Necesar în procedurile de insolvență. Scopuri acceptate: licitație, birou notar public, tribunal. Include, pe lângă informațiile de bază, situațiile financiare anuale (cifră de afaceri,
        profit/pierderi). Se eliberează prin backoffice-ul ONRC, de regulă în maximum 24 de ore lucrătoare. Detalii complete: <Link href="/certificat-constatator-insolventa/">certificatul pentru insolvență</Link>.
      </p>
      <p>
          <Link
            href="/comanda/certificat-constatator/?tip=insolventa"
            className="not-prose inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 px-5 py-2.5 text-sm font-semibold text-secondary-900 transition-colors no-underline"
          >
            Comandă certificat pentru insolvență · 73,55 lei + TVA
          </Link>
      </p>

      <h3>4. Certificat constatator persoană fizică (CNP): 73,55 lei + TVA</h3>
      <p>
        Verifică dacă o persoană fizică deține calitatea de asociat, acționar sau administrator în
        firme înregistrate la Registrul Comerțului. Scopuri acceptate: informare, ANAF / Administrația
        Finanțelor Publice, înregistrare în scopuri de TVA, eliberare cazier judiciar, poliție, autorizare, AFIR,
        primărie și altele. Se emite automat, în câteva minute, 24/7. Detalii complete:
        <Link href="/certificat-constatator-pfa/"> certificatul pentru PFA / persoană fizică</Link>.
      </p>
      <p>
          <Link
            href="/comanda/certificat-constatator/?tip=pf"
            className="not-prose inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 px-5 py-2.5 text-sm font-semibold text-secondary-900 transition-colors no-underline"
          >
            Comandă certificat persoană fizică · 73,55 lei + TVA
          </Link>
      </p>

      <h3>5. Certificat constatator cu istoric: 402,48 lei + TVA</h3>
      <p>
        Include istoricul modificărilor firmei, de la înființare până în prezent sau pe o perioadă
        aleasă de tine. Util în litigii, due diligence, succesiuni sau verificări amănunțite ale unui partener de
        afaceri. Se emite automat, în câteva minute, 24/7. Am scris și un{' '}
        <Link href="/certificat-constatator-cu-istoric/">ghid dedicat certificatului constatator cu istoric</Link>:
        ce conține exact și când merită diferența de preț.
      </p>
      <p>
          <Link
            href="/comanda/certificat-constatator/?tip=istoric"
            className="not-prose inline-flex items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 px-5 py-2.5 text-sm font-semibold text-secondary-900 transition-colors no-underline"
          >
            Comandă certificat cu istoric · 402,48 lei + TVA
          </Link>
      </p>

      {/* Secțiune nouă 26 iulie 2026: intenția „ruta oficială ONRC/InfoCert” are
          peste 8.000 de expuneri/3 luni („certificat constatator onrc” 4.953,
          „constatator online” 3.288) și nu era acoperită nicăieri pe site.
          Comparație onestă — cine poate lua singur de la ONRC, ia. */}
      <h2 id="infocert">Direct de la ONRC (InfoCert) sau printr-un intermediar</h2>
      <p>
        ONRC are propriul serviciu online, InfoCert, accesibil prin myportal.onrc.ro. Emite
        certificate semnate electronic, 24 de ore din 24, fără să-ți ceară semnătură electronică
        proprie, iar plata se face exclusiv cu cardul. Tariful pentru certificatul constatator
        standard este de 30 de lei, conform Ordinului MJ nr. 380/C/2024.
      </p>
      <p>
        Spus direct: dacă ai CUI-ul, ai card, știi exact ce tip de raport îți trebuie și îți convine
        să-ți faci cont pe portal, ia-l de acolo. E mai ieftin și e sursa.
      </p>

      <div className="not-prose my-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-100 text-left">
              <th className="border border-neutral-200 p-3 font-bold">&nbsp;</th>
              <th className="border border-neutral-200 p-3 font-bold">InfoCert (ONRC)</th>
              <th className="border border-neutral-200 p-3 font-bold">Prin eGhișeul</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-neutral-200 p-3 font-semibold">Cost certificat de bază</td>
              <td className="border border-neutral-200 p-3">30 lei (Ordin MJ 380/C/2024)</td>
              <td className="border border-neutral-200 p-3">73,55 lei + TVA, taxa ONRC inclusă</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-200 p-3 font-semibold">Cont pe portal</td>
              <td className="border border-neutral-200 p-3">Da</td>
              <td className="border border-neutral-200 p-3">Nu</td>
            </tr>
            <tr>
              <td className="border border-neutral-200 p-3 font-semibold">Alegerea tipului de raport</td>
              <td className="border border-neutral-200 p-3">O faci tu, din nomenclatorul portalului</td>
              <td className="border border-neutral-200 p-3">Îți spunem noi ce se cere pentru scopul tău</td>
            </tr>
            <tr className="bg-neutral-50">
              <td className="border border-neutral-200 p-3 font-semibold">Factură pe firmă</td>
              <td className="border border-neutral-200 p-3">Prin portal</td>
              <td className="border border-neutral-200 p-3">Automat, la fiecare comandă</td>
            </tr>
            <tr>
              <td className="border border-neutral-200 p-3 font-semibold">Rapoarte IMM / insolvență</td>
              <td className="border border-neutral-200 p-3" colSpan={2}>
                La fel în ambele cazuri: trec prin backoffice-ul ONRC și durează până la 24 de ore
                lucrătoare. Nimeni nu le poate emite instant.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Diferența de preț plătește trei lucruri concrete: nu-ți faci cont, nu alegi singur tipul de
        raport (și nu-l plătești de două ori dacă greșeai), și primești factură fără să te ocupi de
        ea. Pentru o comandă pe an, probabil nu merită. Pentru contabili și firme care scot
        certificate săptămânal, de obicei merită.
      </p>
      <p>
        Un lucru pe care nu ți-l poate promite nimeni, nici noi, nici alt intermediar: emiterea
        instantanee a rapoartelor pentru fonduri IMM și insolvență. Ele trec prin backoffice-ul ONRC
        și durează. Dacă vezi „instant” lipit pe ele, e marketing, nu procedură.
      </p>

      <div className="not-prose my-8 rounded-2xl border-2 border-primary-500 bg-primary-50 p-6">
        <p className="mb-1 text-lg font-bold text-secondary-900">
          Știi ce tip îți trebuie? Comanda durează un minut
        </p>
        <p className="mb-4 text-sm leading-relaxed text-secondary-900/80">
          Doar cu CUI-ul firmei. Certificatul de bază, cel pe persoană fizică și cel cu istoric se
          emit automat, de regulă în câteva minute, inclusiv noaptea și în weekend.
        </p>
        <Link
          href={serviceUrl('certificat-constatator')}
          className="inline-flex items-center rounded-xl bg-primary-500 px-5 py-3 text-sm font-bold text-secondary-900 shadow-[0_6px_14px_rgba(236,185,95,0.35)] transition-all hover:bg-primary-600 hover:shadow-[0_10px_20px_rgba(236,185,95,0.45)]"
        >
          Comandă certificat constatator →
        </Link>
      </div>

      <p>
        Indiferent de tipul de care ai nevoie, îl obții 100% online prin serviciul nostru de{' '}
        <Link href={serviceUrl('certificat-constatator')}>certificat constatator</Link>: completezi datele, plătești
        securizat cu cardul și primești documentul pe email, fără drumuri la ONRC și fără program de ghișeu.
      </p>

      <p>
        Constatatorul apare aproape întotdeauna în mijlocul unei proceduri mai mari la Registrul
        Comerțului. Dacă fix asta pregătești, avem ghiduri separate pentru{' '}
        <Link href="/schimbare-sediu-social-srl-ghid/">schimbarea sediului social</Link>,{' '}
        <Link href="/suspendare-activitate-firma-ghid/">suspendarea activității firmei</Link> și{' '}
        <Link href="/radiere-firma-srl-ghid/">radierea unui SRL</Link>, cu actele, termenele și
        greșelile care întorc dosarele.
      </p>
    </ArticleLayout>
  );
}
