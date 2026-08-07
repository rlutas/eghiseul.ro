import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { ArticleLayout } from '@/components/articole/article-layout';

const SLUG = 'cazier-fiscal-fara-spv';
const TITLE = 'Cazier fiscal din SPV: cum îl ceri online de la ANAF și ce faci dacă nu poți activa contul (2026)';
// Titlul din SERP e mai scurt decât H1-ul: peste ~65 de caractere Google îl rescrie.
const META_TITLE = 'Cazier fiscal din SPV: cum îl ceri online și ce faci fără cont';
const DESCRIPTION =
  'Procedura pas cu pas pentru cazierul fiscal prin Spațiul Privat Virtual: înrolarea în SPV ' +
  'online sau la ghișeu, formularele 502 și 504, cât durează eliberarea și ce alternative ai ' +
  'când contul ANAF nu poate fi activat.';
const DATE_PUBLISHED = '2026-08-07';
const DATE_MODIFIED = '2026-08-07';

export const revalidate = 86400;

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
      category="Documente fiscale"
      title={TITLE}
      description={DESCRIPTION}
      datePublished={DATE_PUBLISHED}
      dateModified={DATE_MODIFIED}
      publishedLabel="august 2026"
      updatedLabel="7 august 2026"
      imageAlt="Bărbat la masa din bucătărie, seara, comparând buletinul cu ecranul telefonului în fața laptopului, blocat la activarea contului SPV"
      relatedServices={[
        {
          href: '/servicii/cazier-fiscal-online/',
          label: 'Cazier Fiscal Online',
          desc: 'Cazier fiscal eliberat de ANAF prin împuternicit, fără cont SPV. 198 RON, 1–3 zile.',
        },
        {
          href: '/servicii/cazier-judiciar-online/',
          label: 'Cazier Judiciar Online',
          desc: 'Documentul cerut la angajare, eliberat de Poliție, nu de ANAF.',
        },
        {
          href: '/servicii/certificat-constatator-online/',
          label: 'Certificat Constatator',
          desc: 'Actul de la Registrul Comerțului, cerut des în același dosar.',
        },
      ]}
      faqs={[
        {
          q: 'Se poate scoate cazier fiscal online?',
          a: 'Da. Prin Spațiul Privat Virtual al ANAF depui cererea electronic și primești certificatul semnat digital, fără să te deplasezi. Condiția este să ai contul SPV activat, nu doar creat. Dacă activarea nu reușește, documentul rămâne accesibil la administrația financiară sau printr-un împuternicit cu procură.',
        },
        {
          q: 'Cum obțin cazierul fiscal din SPV?',
          a: 'Te autentifici pe portalul ANAF, intri în secțiunea de cereri a Spațiului Privat Virtual, alegi cererea de eliberare a certificatului de cazier fiscal, completezi datele și scopul, apoi transmiți. Răspunsul apare în secțiunea de mesaje, ca fișier PDF semnat electronic.',
        },
        {
          q: 'Ce formular se folosește pentru cazierul fiscal?',
          a: 'Formularul 504, cererea de eliberare a certificatului de cazier fiscal. În SPV se completează direct pe ecran, iar la ghișeu se depune pe hârtie, împreună cu actul de identitate al solicitantului.',
        },
        {
          q: 'Ce este formularul 502?',
          a: 'Este cererea de înregistrare în Spațiul Privat Virtual, adică formularul cu care ceri accesul la SPV. Se depune la administrația financiară atunci când alegi înrolarea la ghișeu, în locul identificării online. Nu are legătură directă cu cazierul fiscal, dar fără el, sau fără video-identificare, nu ajungi la formularul 504.',
        },
        {
          q: 'Cât durează eliberarea cazierului fiscal prin SPV?',
          a: 'De regulă câteva ore, uneori până la o zi lucrătoare. Cererile depuse vineri seara sau înaintea unei sărbători legale se procesează în prima zi lucrătoare. Termenul legal maxim este oricum mai lung decât practica din SPV.',
        },
        {
          q: 'Cazierul fiscal online este gratuit?',
          a: 'Da. Eliberat de ANAF, prin SPV sau la ghișeu, certificatul de cazier fiscal nu se taxează. Un cost apare doar dacă alegi să depună cererea altcineva în locul tău, ca împuternicit.',
        },
        {
          q: 'Cum îmi fac cont SPV dacă sunt plecat din țară?',
          a: 'Singura cale la distanță este video-identificarea, care presupune act de identitate românesc valabil, cameră funcțională și o programare într-un interval orar de la noi din țară. Cine nu poate trece de acest pas, pentru că actul a expirat sau numărul de telefon din evidența ANAF este vechi, are nevoie de o persoană împuternicită în România.',
        },
        {
          q: 'Pot scoate cazier fiscal fără cont SPV?',
          a: 'Da, în două feluri: mergi personal la administrația financiară de domiciliu fiscal cu formularul 504 și actul de identitate, sau împuternicești pe cineva printr-o procură să depună cererea și să ridice certificatul în locul tău.',
        },
        {
          q: 'Cazierul fiscal primit în SPV este valabil fără ștampilă?',
          a: 'Da. Semnătura electronică a ANAF are aceeași valoare ca ștampila și semnătura de pe hârtie. Fișierul PDF se poate transmite mai departe prin email sau tipări; instituția care îl primește verifică semnătura la deschidere. Valabilitatea rămâne de 30 de zile de la emitere.',
        },
        {
          q: 'Pot cere din SPV-ul meu cazierul fiscal al firmei?',
          a: 'Nu. Contul personal îți dă acces doar la propria situație fiscală. Pentru o societate, firma trebuie înrolată separat în SPV de către reprezentantul legal sau de un împuternicit cu certificat digital calificat. Asociatul care nu figurează ca reprezentant legal nu poate cere din contul propriu cazierul persoanei juridice.',
        },
      ]}
    >
      <p>
        Cazierul fiscal se obține online, gratuit, din Spațiul Privat Virtual al ANAF: depui cererea
        electronic, folosind formularul 504, și primești certificatul semnat digital în secțiunea de
        mesaje, de regulă în câteva ore, cel mult într-o zi lucrătoare. Nu se plătește nimic și nu se
        merge nicăieri.
      </p>
      <p>
        Partea complicată nu este cererea, ci contul. Aproape toți cei care caută „cazier fiscal din
        SPV&rdquo; au deja o problemă la activare: identificarea video nu trece, actul de identitate a
        expirat, numărul de telefon din evidența ANAF e cel de acum opt ani. Mai jos sunt pașii exacți
        ai rutei electronice, blocajele care apar cel mai des și ce rămâne de făcut când SPV-ul nu
        merge. Dacă vrei mai întâi noțiunile de bază, ce este cazierul fiscal și ce fapte se înscriu în
        el, sunt explicate în ghidul despre{' '}
        <Link href="/cazier-fiscal-persoana-fizica/">cazierul fiscal al persoanei fizice</Link>.
      </p>

      <h2>Ce este SPV și de ce este ruta gratuită</h2>
      <p>
        Spațiul Privat Virtual este contul tău pe portalul ANAF. Prin el corespondezi cu fiscul în
        format electronic: vezi obligațiile de plată, depui declarații, primești notificări și ceri
        certificate. Odată activat, cazierul fiscal devine o cerere de câteva minute, fără taxă, fără
        program cu publicul și indiferent unde te afli.
      </p>
      <p>
        Contul e legat de o persoană, nu de un dispozitiv. Îl folosești de pe telefon sau de pe
        calculator, iar documentele rămân în arhiva contului. Din perspectiva ANAF, comunicarea prin
        SPV este considerată comunicare valabilă, deci certificatul care apare acolo are aceeași
        greutate ca unul ridicat de la ghișeu.
      </p>

      <h2>Cele două căi de înrolare în SPV</h2>
      <p>
        Înregistrarea se face o singură dată. Alegi între identificarea la distanță și un drum la
        administrația financiară.
      </p>

      <h3>Online, prin video-identificare</h3>
      <p>
        Îți creezi contul pe portalul ANAF, completezi datele de identificare și programezi o sesiune
        video. La ora stabilită, un operator îți verifică identitatea în timp real: arăți actul de
        identitate în fața camerei și confirmi datele. Îți trebuie un act de identitate românesc
        valabil, o cameră care funcționează, o conexiune stabilă și accesul la adresa de email și la
        numărul de telefon pe care le-ai declarat.
      </p>
      <p>
        Există și varianta cu certificat digital calificat, folosită în special de contabili și de
        reprezentanții firmelor. Pentru o persoană fizică obișnuită nu are sens să cumperi un
        certificat doar ca să ceri un cazier fiscal.
      </p>

      <h3>La ghișeul administrației financiare</h3>
      <p>
        Depui formularul 502, cererea de înregistrare în Spațiul Privat Virtual, împreună cu actul de
        identitate. Funcționarul verifică identitatea pe loc, iar contul se aprobă în urma acestei
        verificări. Este calea sigură atunci când video-identificarea eșuează, dar presupune deplasare
        și program cu publicul.
      </p>
      <p>
        Diferența practică între cele două: online eviți drumul, dar depinzi de o sesiune video care
        poate fi reprogramată; la ghișeu pierzi o dimineață, însă ieși de acolo cu problema rezolvată.
      </p>

      <h2>Pașii după activarea contului</h2>
      <ol>
        <li>Te autentifici pe portalul ANAF cu utilizatorul și parola contului SPV.</li>
        <li>Intri în secțiunea de cereri a Spațiului Privat Virtual, cea din care se solicită documente.</li>
        <li>Alegi cererea de eliberare a certificatului de cazier fiscal, formularul 504.</li>
        <li>
          Completezi datele de identificare și scopul pentru care ceri documentul: înființare firmă,
          licitație, autorizare, dosar bancar. Câmpul contează, pentru că unele instituții verifică
          destinația înscrisă.
        </li>
        <li>Transmiți cererea și primești pe loc confirmarea de înregistrare.</li>
        <li>
          Aștepți răspunsul în secțiunea de mesaje. Certificatul vine ca fișier PDF semnat electronic,
          de regulă în câteva ore, uneori în ziua lucrătoare următoare.
        </li>
        <li>
          Descarci fișierul și îl trimiți mai departe prin email sau îl tipărești. Semnătura
          electronică ține loc de ștampilă, iar valabilitatea rămâne de 30 de zile de la emitere.
        </li>
      </ol>

      <h2>Formularele 502 și 504, pe scurt</h2>
      <p>
        Cele două numere apar constant în căutări și sunt confundate între ele. Formularul{' '}
        <strong>502</strong> este cererea prin care ceri accesul la Spațiul Privat Virtual, adică
        actul de intrare în sistem. Îl depui la administrația financiară doar dacă alegi înrolarea la
        ghișeu; la video-identificare nu îl completezi separat.
      </p>
      <p>
        Formularul <strong>504</strong> este cererea de eliberare a certificatului de cazier fiscal,
        pe care o depui după ce ai deja cont. În SPV se completează direct pe ecran, la ghișeu se
        depune pe hârtie. Un al treilea formular circulă în discuții, cel de rectificare, folosit
        atunci când o faptă apare în certificat deși termenul de radiere a trecut demult.
      </p>

      <h2>Unde se blochează lumea, de fapt</h2>
      <h3>Ești plecat din țară și video-identificarea nu trece</h3>
      <p>
        Este cazul cel mai frecvent. Sesiunile video se programează în intervale orare de la noi din
        țară, ceea ce pentru cineva din Canada sau din Australia înseamnă noaptea. Se adaugă
        conexiuni instabile, calitatea imaginii și numărul limitat de locuri disponibile într-o
        săptămână. Cine are act de identitate valabil și răbdare ajunge, până la urmă, să treacă. Cine
        nu are actul valabil nu are ce încerca.
      </p>

      <h3>Actul de identitate a expirat</h3>
      <p>
        Fără buletin valabil nu se poate face nici identificarea video, nici înrolarea la ghișeu.
        Reînnoirea cere prezența în țară sau o procedură prin consulat, care durează, deci multă lume
        rămâne blocată aici luni întregi. Cazierul fiscal poate fi însă cerut în continuare printr-un
        împuternicit, pe baza unei procuri.
      </p>

      <h3>Numărul de telefon sau emailul din evidența ANAF sunt vechi</h3>
      <p>
        Codurile de confirmare pleacă spre datele existente în evidența fiscului. Dacă ai schimbat
        numărul după ce ai lucrat ultima dată în România, nu primești codul și nu poți finaliza
        înregistrarea. Actualizarea datelor de contact se face tot prin ANAF, ceea ce închide cercul:
        îți trebuie acces la cont ca să schimbi datele cu care ai ajunge în cont.
      </p>

      <h3>Contul e creat, dar neactivat</h3>
      <p>
        Mulți cred că au SPV pentru că au completat formularul de înregistrare. Contul rămâne în
        așteptare până la validarea identității, iar din el nu se poate depune nicio cerere.
        Verificarea rapidă: dacă la autentificare nu vezi secțiunea de cereri și mesaje, contul nu e
        activ. Emailul de confirmare ajunge des în spam.
      </p>

      <h3>Ceri cazierul pentru o firmă în care nu ești reprezentant legal</h3>
      <p>
        Contul personal acoperă doar situația ta fiscală. Pentru o societate, persoana juridică se
        înrolează separat în SPV, de către reprezentantul legal sau de un împuternicit cu certificat
        digital calificat. Un asociat cu 50% din părți sociale, dar fără calitatea de administrator,
        nu poate cere din contul propriu cazierul firmei. Este motivul pentru care cererile depuse în
        grabă înainte de o licitație se întorc respinse.
      </p>

      <h2>Cele trei rute, comparate</h2>
      <table>
        <thead>
          <tr>
            <th>Criteriu</th>
            <th>SPV</th>
            <th>Administrația financiară</th>
            <th>Împuternicit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cost</td>
            <td>gratuit</td>
            <td>gratuit</td>
            <td>tarif de intermediere</td>
          </tr>
          <tr>
            <td>Timp până la document</td>
            <td>ore, maximum o zi lucrătoare</td>
            <td>pe loc sau până la 5 zile lucrătoare</td>
            <td>1–3 zile lucrătoare</td>
          </tr>
          <tr>
            <td>Ce îți trebuie</td>
            <td>cont SPV activat</td>
            <td>act de identitate valabil, formularul 504</td>
            <td>procură și copie după actul de identitate</td>
          </tr>
          <tr>
            <td>Deplasare</td>
            <td>niciuna</td>
            <td>la administrația de domiciliu fiscal</td>
            <td>niciuna</td>
          </tr>
          <tr>
            <td>Când este alegerea potrivită</td>
            <td>ai deja contul activ</td>
            <td>ești în țară și ai act valabil</td>
            <td>ești în străinătate sau activarea SPV nu reușește</td>
          </tr>
        </tbody>
      </table>

      <h2>Cât costă, de fapt</h2>
      <p>
        Certificatul în sine nu costă nimic, indiferent de rută. ANAF nu percepe taxă pentru cazierul
        fiscal, nici în SPV, nici la ghișeu. Suma apare doar când plătești pe cineva să depună cererea
        și să preia documentul în locul tău, adică plătești serviciul, nu actul. La eGhișeul.ro,{' '}
        <Link href="/servicii/cazier-fiscal-online/">cazierul fiscal online</Link> costă 198 RON cu
        TVA, taxe incluse, cu livrare în 1–3 zile lucrătoare, iar cererea se depune pe bază de procură,
        fără să ai nevoie de cont SPV.
      </p>
      <p>
        O precizare care scutește un drum inutil: cazierul fiscal nu are legătură cu{' '}
        <Link href="/servicii/cazier-judiciar-online/">cazierul judiciar</Link>. Al doilea se
        eliberează de Poliție și nu se cere niciodată din SPV, oricât de activ ar fi contul.
      </p>

      <h2>Pe scurt</h2>
      <p>
        Ruta electronică funcționează bine și este gratuită, cu o singură condiție: contul SPV să fie
        activ. Înrolarea se face prin video-identificare sau la administrația financiară, cu
        formularul 502; cererea propriu-zisă este formularul 504, iar certificatul semnat electronic
        vine în câteva ore. Când actul de identitate a expirat, numărul de telefon din evidența ANAF
        este vechi sau ai nevoie de cazierul unei firme în care nu ești reprezentant legal, drumul
        prin SPV se închide și rămân ghișeul, dacă ești în țară, ori un împuternicit cu procură, dacă
        nu ești.
      </p>
    </ArticleLayout>
  );
}
