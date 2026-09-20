import Link from 'next/link';
import { LegalLayoutDocumentero } from '@/components/documentero/legal-layout';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { documenteroBreadcrumb, documenteroOrganizationNode, documenteroWebsiteNode } from '@/lib/seo/documentero-schema';
import { BRANDS } from '@/lib/brand/brands';
import { DOCUMENTERO_INDEXABLE, DOCUMENTERO_TRACK_HREF } from '@/config/documentero-nav';

const PATH = '/termeni-si-conditii/';
const brand = BRANDS.documentero;

export const metadata = buildPageMetadata({
  brand: 'documentero',
  title: 'Termeni și condiții',
  description:
    'Termenii și condițiile de utilizare a platformei documentero.ro (eDigitalizare SRL): acte de stare civilă prin avocat, ' +
    'comandă, plată, termene, livrare, anulare și rambursare, semnătură electronică, GDPR și răspundere.',
  path: PATH,
  noindex: !DOCUMENTERO_INDEXABLE,
});

export const revalidate = 86400;

/**
 * Same company and the same provisions as eghiseul.ro/termeni-si-conditii/
 * (src/app/(eghiseul)/termeni-si-conditii/page.tsx), scoped to what
 * documentero sells: civil-status documents obtained through the partner
 * lawyer. The cancellation percentages and windows are copied as-is; the
 * cancel endpoint enforces the same rules on both brands.
 */
export default function Page() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      documenteroOrganizationNode(),
      documenteroWebsiteNode(),
      documenteroBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Termeni și condiții', path: PATH }], PATH),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <LegalLayoutDocumentero title="Termeni și condiții" path={PATH}>
        <p>
          Acești Termeni și Condiții reglementează utilizarea platformei <strong>documentero.ro</strong>, operată de
          <strong> eDigitalizare SRL</strong> (CUI RO49278701, Reg. Com. J2023001097301, sediul în Jud. Satu Mare,
          Com. Odoreu, Str. Salcâmilor nr. 2), denumită în continuare „documentero”, „Prestatorul” sau „noi”. Prin
          accesarea platformei și plasarea unei comenzi, confirmi că ai citit, înțeles și acceptat integral acești
          termeni. Dacă nu ești de acord cu oricare prevedere, te rugăm să nu utilizezi serviciile.
        </p>

        <h2>1. Definiții</h2>
        <ul>
          <li><strong>Platforma</strong>: site-ul documentero.ro, cu toate paginile, formularele și funcționalitățile.</li>
          <li><strong>Prestatorul</strong>: eDigitalizare SRL, cu datele de mai sus.</li>
          <li><strong>Beneficiarul (Clientul)</strong>: orice persoană fizică ce utilizează serviciile, pentru sine sau, cu împuternicire, pentru un membru al familiei.</li>
          <li><strong>Serviciile</strong>: serviciile private de asistență la obținerea actelor de stare civilă de la oficiile de stare civilă competente din România, prin avocat.</li>
          <li><strong>Comanda</strong>: solicitarea fermă a beneficiarului, finalizată prin acceptarea termenilor și efectuarea plății.</li>
          <li><strong>Avocatul partener</strong>: avocat înscris în Barou, care depune cererile și ridică actele în numele beneficiarului, pe baza împuternicirii avocațiale semnate electronic pe platformă.</li>
        </ul>

        <h2>2. Serviciile noastre</h2>
        <p>
          documentero este o platformă privată de asistență și intermediere. Nu suntem o instituție publică și nu
          suntem afiliați niciunui organ guvernamental; acționăm în numele tău, pe bază de contract de asistență
          juridică și împuternicire avocațială, pentru depunerea cererilor și ridicarea actelor. Actele sunt emise
          exclusiv de oficiile de stare civilă și de serviciile publice comunitare de evidență a persoanelor, care le
          pot elibera și direct, la ghișeu; tarifele noastre acoperă asistența, reprezentarea prin avocat și livrarea.
          Oferim asistență pentru:
        </p>
        <ul>
          <li><strong>Certificat de naștere</strong>: duplicat, pentru actul pierdut, deteriorat sau de model vechi.</li>
          <li><strong>Certificat de căsătorie</strong>: duplicat, inclusiv cu mențiunea de divorț.</li>
          <li><strong>Certificat de celibat (Anexa 9)</strong>: dovada stării civile, de regulă pentru căsătorie în străinătate.</li>
          <li><strong>Extras multilingv de naștere</strong> și <strong>extras multilingv de căsătorie</strong>: formularele standard multilingve prevăzute de Regulamentul (UE) 2016/1191, acceptate în statele Uniunii Europene fără traducere și fără apostilă.</li>
        </ul>
        <p>
          Nu prestăm alte servicii pe această platformă. Traducerea autorizată și apostila, atunci când sunt afișate
          ca opțiuni în comandă, sunt servicii suplimentare cu tarif propriu, afișat înainte de plată.
        </p>

        <h2>3. Procesul de comandă</h2>
        <ol>
          <li><strong>Completezi formularul online</strong>: date de contact și datele actului solicitat (numele titularului, CNP, data și locul nașterii sau al căsătoriei, după caz), plus actul tău de identitate.</li>
          <li><strong>Alegi opțiunile</strong>: actul, eventual procesarea prioritară, opțiunile suplimentare și modul de livrare.</li>
          <li><strong>Accepți termenii și semnezi electronic</strong> contractul de asistență juridică și împuternicirea avocațială.</li>
          <li><strong>Plătești</strong>: online cu cardul, securizat prin Stripe, sau prin transfer bancar.</li>
        </ol>
        <p>După confirmarea plății, comanda este fermă, iar Prestatorul începe procedurile. Primești confirmare pe email.</p>

        <h2>4. Prețuri și plată</h2>
        <p>
          Tarifele sunt afișate pe platformă în RON, cu TVA inclus. Pentru eliberarea actelor de stare civilă nu
          există taxă de stat; prețul acoperă asistența, reprezentarea prin avocat și livrarea aleasă. Prețul final
          depinde de actul ales, de procesarea prioritară și de opțiunile suplimentare, fiind afișat transparent
          înainte de plată.
        </p>
        <p>
          <strong>Plata cu cardul</strong> (Visa, Mastercard, Apple Pay, Google Pay) se efectuează online, procesată
          securizat prin <strong>Stripe</strong> (certificat PCI DSS Level 1). Nu stocăm datele cardului pe serverele
          noastre.
        </p>
        <p>
          <strong>Plata prin transfer bancar</strong>: contul (IBAN) și numărul comenzii, care trebuie trecut la
          detaliile plății, se afișează la finalizarea comenzii și în emailul de confirmare. Până la confirmarea
          încasării comanda rămâne în „Așteptare plată”, iar termenele de procesare curg de la confirmarea plății, nu
          de la plasarea comenzii. Dacă ne trimiți dovada plății (ordinul de plată), putem începe lucrul pe baza ei,
          înainte de încasare. O comandă neplătită nu creează nicio obligație de plată; scrie-ne și o închidem.
        </p>

        <h2>5. Program de lucru și termene de procesare</h2>
        <p><strong>Program de lucru:</strong></p>
        <ul>
          <li>Luni – Joi: 08:00 – 16:00</li>
          <li>Vineri: 08:00 – 15:00</li>
          <li>Sâmbătă, Duminică și sărbători legale: închis</li>
        </ul>
        <p>
          Termenele afișate sunt estimative, se exprimă în <strong>zile lucrătoare</strong> și curg din momentul
          confirmării plății și al primirii tuturor datelor necesare. Pentru comenzile plasate după ora 14:00 sau în
          afara programului, termenul se calculează începând cu următoarea zi lucrătoare. Termenul de livrare prin
          curier se adaugă termenului de eliberare.
        </p>
        <p>Pot apărea întârzieri din motive independente de Prestator, precum:</p>
        <ul>
          <li>indisponibilitatea sistemelor informatice ale oficiilor de stare civilă sau ale evidenței persoanelor;</li>
          <li>necesitatea furnizării unor documente sau clarificări suplimentare de către client;</li>
          <li>furnizarea de date eronate sau incomplete;</li>
          <li>acte înregistrate în străinătate, la misiunile diplomatice, sau înregistrări vechi care necesită verificări în arhivă;</li>
          <li>sărbători legale, lipsă de personal sau alte dificultăți la instituțiile competente;</li>
          <li>întârzieri ale serviciilor de curierat.</li>
        </ul>
        <p>Astfel de întârzieri nu pot fi imputate Prestatorului.</p>

        <h2>6. Condiții specifice</h2>
        <p>
          Termenul estimat pentru fiecare act este cel afișat pe pagina actului la momentul plasării comenzii.
          Suplimentar, se aplică următoarele reguli:
        </p>
        <ul>
          <li><strong>Toate actele de stare civilă</strong> necesită împuternicire avocațială semnată electronic. Pentru persoanele născute sau căsătorite în străinătate, pentru actele înregistrate la misiunile diplomatice sau în cazul unor verificări suplimentare la oficiul de stare civilă, termenul se poate prelungi. Anularea este posibilă doar în primele 30 de minute (rambursare 70%), conform secțiunii 8.</li>
          <li><strong>Actul solicitat pentru altă persoană</strong> (părinte, copil, soț/soție): oficiul de stare civilă eliberează duplicatul doar persoanelor îndreptățite; dacă cererea este respinsă pentru că solicitantul nu are această calitate, suma achitată nu se rambursează, serviciul de asistență fiind prestat.</li>
          <li><strong>Extrasul multilingv</strong> se eliberează pe baza actului de stare civilă înregistrat în România; dacă actul nu este înregistrat în registrele de stare civilă din România (de exemplu, nu a fost transcris), documentul nu poate fi emis, iar clientul este informat înainte de depunere.</li>
        </ul>

        <h2>7. Modalități de livrare</h2>
        <p>
          Actele se livrează în original, prin curier, în România sau în străinătate, la adresa indicată în
          comandă; o copie scanată se trimite pe email în ziua ridicării, atunci când opțiunea este afișată.
          Costul livrării în România și tarifele pentru livrarea internațională sunt afișate înainte de plată sau
          comunicate prin email/WhatsApp împreună cu opțiunile disponibile. Numărul de urmărire (AWB) se trimite pe
          email la predarea coletului.
        </p>

        <h2 id="anulare">8. Dreptul de retragere, anulare și rambursare</h2>
        <p>
          Conform OUG 34/2014 art. 16 lit. m), dreptul legal de retragere nu se aplică după începerea efectivă a
          prestării serviciului (depunerea cererii la instituție), serviciul fiind personalizat. Suplimentar, pentru
          <strong> serviciile eligibile</strong> oferim o politică de anulare proprie:
        </p>
        <ul>
          <li><strong>În primele 30 de minute</strong> de la confirmarea plății poți solicita anularea din pagina de <Link href={DOCUMENTERO_TRACK_HREF}>verificare status comandă</Link> și primești <strong>70%</strong> din suma plătită (30% acoperă costurile administrative și de procesare). Dreptul de anulare în această fereastră se păstrează chiar dacă procesarea internă a comenzii a început deja.</li>
          <li><strong>După expirarea celor 30 de minute</strong>, anularea online nu mai este posibilă: cererea este deja în curs de procesare la autorități.</li>
          <li><strong>Dacă serviciul nu poate fi prestat din culpa Prestatorului</strong>, primești rambursare integrală (100%).</li>
        </ul>
        <p>
          Rambursările se procesează prin aceeași metodă de plată, în 5–10 zile lucrătoare. Detalii
          complete, pași și întrebări frecvente: <Link href="/politica-de-anulare/">Politica de anulare
          și rambursare</Link>.
        </p>

        <h2>9. Semnătura electronică</h2>
        <p>
          Contractul de asistență juridică și împuternicirea avocațială se semnează electronic pe platformă, conform
          <strong> Legii nr. 214/2024</strong> privind digitalizarea și <strong>Regulamentului (UE) nr. 910/2014
          (eIDAS)</strong>. Semnătura electronică simplă utilizată produce efecte juridice și este admisibilă ca
          probă, conform art. 25 din eIDAS. Atestăm semnătura prin: numele semnatarului, adresa IP, data și ora
          (timestamp), user-agent-ul dispozitivului și consimțământul exprimat prin acțiune afirmativă, plus hash-ul
          SHA-256 al documentului semnat.
        </p>

        <h2>10. Contractul de asistență juridică și împuternicirea avocațială</h2>
        <p>
          La finalizarea comenzii se generează automat documentele aferente (contractul de asistență juridică și
          împuternicirea avocațială, cu număr din registrul cabinetului de avocatură), cu număr unic și semnătură
          electronică. Prin plasarea comenzii, beneficiarul autorizează Prestatorul să încheie, în numele său,
          contractele necesare și să dea împuternicire de reprezentare în fața oficiilor de stare civilă pentru
          depunerea cererii și ridicarea actului.
        </p>
        <p>
          <strong>Onorariul avocatului.</strong> Din suma totală plătită, suma de <strong>15 lei (TVA inclus)</strong>
          reprezintă <strong>onorariul avocatului partener</strong> pentru reprezentare în fața autorităților.
        </p>
        <p>Documentele semnate sunt stocate securizat și pot fi descărcate din pagina comenzii sau solicitate pe email.</p>

        <h2>11. Cesionarea și subcontractarea</h2>
        <p>
          Prestatorul poate cesiona și/sau subcontracta o terță parte (de ex. avocat partener, traducător autorizat,
          curier) pentru serviciile aferente onorării comenzii, cu informarea prealabilă a Clientului, fără a fi
          necesar acordul acestuia. În orice situație, Prestatorul rămâne responsabil față de Client pentru
          îndeplinirea tuturor obligațiilor contractuale.
        </p>

        <h2>12. Obligațiile beneficiarului și corectitudinea datelor</h2>
        <ul>
          <li>Să furnizeze date corecte, complete și actuale; orice eroare poate duce la respingerea cererii.</li>
          <li>Să încarce documente lizibile și valabile, acolo unde sunt necesare.</li>
          <li>Să achite integral tariful înainte de începerea procesării.</li>
          <li>Să răspundă solicitărilor de informații suplimentare în maximum 48 de ore.</li>
          <li>Să nu utilizeze serviciile în scopuri ilegale și să nu furnizeze datele altor persoane fără acordul/împuternicirea acestora.</li>
        </ul>
        <p>
          Este esențial ca datele furnizate în formularul de comandă să fie corecte și complete: orice eroare poate
          genera întârzieri, acte incorecte sau chiar imposibilitatea prestării serviciului, fără drept de
          rambursare. Verifică atent informațiile înainte de trimitere. Dacă observi o greșeală, contactează-ne cât
          mai repede, cel mai rapid pe{' '}
          <a href={`https://wa.me/${brand.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>.
        </p>

        <h2>13. Obligațiile prestatorului</h2>
        <ul>
          <li>Să proceseze cererile cu diligență profesională, în termenele estimate.</li>
          <li>Să informeze clientul despre stadiul comenzii (email și/sau telefon).</li>
          <li>Să asigure confidențialitatea datelor conform GDPR.</li>
          <li>Să livreze actul în original prin curier și, unde este cazul, copia scanată pe email, conform opțiunii alese.</li>
          <li>Să notifice clientul în cel mai scurt timp în cazul oricărui impediment.</li>
        </ul>

        <h2>14. Protecția datelor (GDPR)</h2>
        <p>
          eDigitalizare SRL, în calitate de operator, prelucrează datele conform Regulamentului (UE) 2016/679 (GDPR).
          Temeiul prelucrării este executarea contractului (art. 6 alin. 1 lit. b) și îndeplinirea obligațiilor legale
          (art. 6 alin. 1 lit. c). Ai drept de acces, rectificare, ștergere, restricționare, portabilitate și opoziție;
          plângeri pot fi depuse la ANSPDCP (<a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>).
          Detalii în <Link href="/politica-de-confidentialitate/">Politica de confidențialitate</Link>.
        </p>

        <h2>15. Limitarea răspunderii</h2>
        <p>Prestatorul nu răspunde pentru: date incorecte furnizate de beneficiar; întârzieri sau refuzuri ale autorităților ori ale curierilor; forță majoră (inclusiv indisponibilitatea sistemelor instituțiilor); utilizarea actelor în alte scopuri; daune indirecte. Răspunderea totală a Prestatorului este limitată la valoarea serviciului achitat pentru comanda respectivă.</p>

        <h2>16. Proprietate intelectuală</h2>
        <p>Întregul conținut al platformei (texte, imagini, design, logo-uri, cod) este proprietatea eDigitalizare SRL și este protejat de lege. Reproducerea fără acord scris este interzisă.</p>

        <h2>17. Reclamații, legislație aplicabilă și soluționarea litigiilor</h2>
        <p>
          Pentru orice nelămuriri, sugestii sau reclamații ne poți contacta pe{' '}
          <a href={`https://wa.me/${brand.whatsappNumber}`} target="_blank" rel="noopener noreferrer">WhatsApp</a> sau la{' '}
          <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a>. Ne angajăm să răspundem prompt și să
          tratăm toate sesizările cu seriozitate.
        </p>
        <p>
          Acești termeni sunt guvernați de legea română. Litigiile se soluționează amiabil; în caz contrar, de
          instanțele competente din România. Consumatorii pot apela la{' '}
          <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer">ANPC – SAL</a>.
          Platforma europeană SOL/ODR a fost închisă de Comisia Europeană; informații despre
          căile de atac disponibile în UE găsiți pe{' '}
          <a href="https://consumer-redress.ec.europa.eu/" target="_blank" rel="noopener noreferrer">consumer-redress.ec.europa.eu</a>.
        </p>

        <h2>18. Contact</h2>
        <p>
          eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · email:{' '}
          <a href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a> · telefon/WhatsApp:{' '}
          <a href={`tel:${brand.phoneDisplay.replace(/\s/g, '')}`}>{brand.phoneDisplay}</a>.
        </p>
      </LegalLayoutDocumentero>
    </>
  );
}
