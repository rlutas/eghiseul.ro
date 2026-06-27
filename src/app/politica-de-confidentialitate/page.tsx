import Link from 'next/link';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'Politica de Confidențialitate',
  description:
    'Cum colectează, folosește și protejează eGhișeul.ro (eDigitalizare SRL) datele tale personale: ' +
    'date colectate, scop, temei legal, destinatari și persoane împuternicite, durata stocării și drepturile tale GDPR.',
  path: '/politica-de-confidentialitate/',
});

export const revalidate = 86400;

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Acasă', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Politica de Confidențialitate', item: `${BASE_URL}/politica-de-confidentialitate/` },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LegalLayout title="Politica de Confidențialitate" updated="27 iunie 2026">
        <p>
          <strong>eDigitalizare SRL</strong> (CUI RO49278701, Reg. Com. J2023001097301, sediul în Jud. Satu Mare,
          Com. Odoreu, Str. Salcâmilor nr. 2), operatorul platformei <strong>eGhișeul.ro</strong> — denumită în
          continuare „Operatorul” sau „noi” — prelucrează datele tale cu caracter personal în conformitate cu
          Regulamentul (UE) 2016/679 (GDPR), Legea nr. 190/2018 și legislația națională în vigoare. Această politică
          explică ce date colectăm, în ce scop, cui le divulgăm, cât le păstrăm și ce drepturi ai.
        </p>

        <h2>1. Operatorul de date</h2>
        <p>
          Operatorul de date cu caracter personal pentru platforma eGhișeul.ro este <strong>eDigitalizare SRL</strong>,
          cu datele de identificare de mai sus. Pentru orice solicitare privind datele tale, ne poți contacta la{' '}
          <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a> sau{' '}
          <a href="tel:+40757708181">+40 757 708 181</a>.
        </p>

        <h2>2. Ce date colectăm</h2>
        <p>În funcție de serviciul solicitat, colectăm următoarele categorii de date:</p>
        <h3>a) Date de identificare</h3>
        <ul>
          <li>Nume și prenume, iar pentru persoane juridice denumirea și CUI-ul firmei.</li>
          <li>Cod numeric personal (CNP), serie și număr act de identitate, cetățenie.</li>
          <li>Data și locul nașterii, numele părinților — unde sunt necesare actului (de ex. cazier judiciar, stare civilă).</li>
          <li>Date despre imobil (număr cadastral, carte funciară, adresă) — pentru serviciile cadastrale (ANCPI/OCPI).</li>
          <li>Număr de înmatriculare / permis de conducere — pentru serviciile auto.</li>
        </ul>
        <h3>b) Date de contact</h3>
        <ul>
          <li>Adresă de email, număr de telefon, adresă de domiciliu/livrare.</li>
        </ul>
        <h3>c) Documente și imagini</h3>
        <ul>
          <li>Copie/scan act de identitate (CI/pașaport).</li>
          <li>Fotografie de verificare (selfie cu actul) — acolo unde verificarea identității este necesară.</li>
          <li>Documente justificative ale firmei sau ale imobilului, după caz.</li>
        </ul>
        <h3>d) Semnătura electronică</h3>
        <ul>
          <li>Semnătura electronică simplă aplicată pe contract și împuternicire.</li>
          <li>Data și ora semnării (timestamp), adresa IP și user-agent-ul dispozitivului, hash-ul SHA-256 al documentului semnat.</li>
        </ul>
        <h3>e) Date de plată</h3>
        <ul>
          <li>Datele tranzacției, procesate securizat de furnizorul de plăți. <strong>Nu stocăm datele cardului</strong> pe serverele noastre.</li>
        </ul>
        <h3>f) Date tehnice și de navigare</h3>
        <ul>
          <li>Adresă IP, tip browser și dispozitiv, pagini vizitate, sursa traficului.</li>
        </ul>

        <h2>3. Scopul prelucrării</h2>
        <ul>
          <li><strong>Prestarea serviciului</strong> — completarea și depunerea cererilor la autoritățile competente (IGPR, ANAF, DRPCIV, ANCPI/OCPI, ONRC) în numele tău și obținerea documentelor.</li>
          <li><strong>Încheierea și executarea contractului</strong> — generarea contractului de prestări servicii, a împuternicirii și a documentelor asociate.</li>
          <li><strong>Facturare și plăți</strong> — emiterea facturilor și procesarea plăților.</li>
          <li><strong>Comunicare</strong> — informarea ta privind stadiul comenzii și solicitarea de informații suplimentare.</li>
          <li><strong>Obligații legale</strong> — conformarea cu obligațiile fiscale, contabile și de arhivare.</li>
          <li><strong>Securitate și prevenirea fraudelor</strong> — verificarea identității și prevenirea utilizării abuzive a serviciului.</li>
          <li><strong>Îmbunătățirea serviciilor</strong> — analiza agregată a utilizării platformei.</li>
        </ul>

        <h2>4. Temeiul legal</h2>
        <ul>
          <li><strong>Executarea contractului</strong> (art. 6 alin. 1 lit. b GDPR) — pentru prestarea serviciului comandat.</li>
          <li><strong>Consimțământul</strong> (art. 6 alin. 1 lit. a GDPR) — pentru verificarea identității pe bază de fotografie și pentru comunicări/cookie-uri neesențiale.</li>
          <li><strong>Obligația legală</strong> (art. 6 alin. 1 lit. c GDPR) — pentru obligațiile fiscale, contabile și de arhivare.</li>
          <li><strong>Interesul legitim</strong> (art. 6 alin. 1 lit. f GDPR) — pentru securitatea platformei, prevenirea fraudelor și îmbunătățirea serviciilor.</li>
        </ul>

        <h2>5. Destinatarii datelor și persoanele împuternicite</h2>
        <p>
          Pentru a presta serviciul, divulgăm datele strict necesare către următoarele categorii de destinatari. Unii
          dintre aceștia acționează în calitate de <strong>persoane împuternicite</strong> (procesatori), în baza unor
          contracte de prelucrare conforme cu <strong>art. 28 GDPR</strong>, care le impun să prelucreze datele
          exclusiv conform instrucțiunilor noastre și să asigure confidențialitatea și securitatea lor.
        </p>
        <h3>a) Autorități publice emitente</h3>
        <ul>
          <li>IGPR / Inspectoratele de Poliție (cazier judiciar), ANAF (cazier fiscal), DRPCIV (cazier auto), ANCPI/OCPI (cadastru și carte funciară), ONRC (certificat constatator) — pentru depunerea cererii și obținerea documentului.</li>
        </ul>
        <h3>b) Colaboratori autorizați (persoane împuternicite)</h3>
        <ul>
          <li><strong>Avocat partener</strong> — pentru reprezentarea în fața autorităților la documentele judiciare, fiscale și de stare civilă. Primește doar datele necesare întocmirii și depunerii cererii.</li>
          <li><strong>Topograf/specialist autorizat</strong> — pentru obținerea și pregătirea documentelor cadastrale (ANCPI/OCPI). Primește, prin portalul de colaborator, exclusiv datele comenzii cadastrale alocate lui (date imobil și de contact necesare), pe baza unui contract de prelucrare conform art. 28 GDPR.</li>
        </ul>
        <h3>c) Furnizori de servicii (persoane împuternicite)</h3>
        <ul>
          <li><strong>Stripe, Inc.</strong> — procesare plăți online (certificat PCI DSS Level 1).</li>
          <li><strong>Supabase, Inc.</strong> — infrastructură cloud (bază de date și autentificare), date găzduite în Uniunea Europeană.</li>
          <li><strong>Amazon Web Services (AWS S3)</strong> — stocare securizată a documentelor și contractelor, regiunea eu-central-1 (Frankfurt, UE).</li>
          <li><strong>Google LLC (Gemini AI)</strong> — extragerea automată a datelor din documentele încărcate și verificarea identității; folosit strict pentru procesarea comenzii.</li>
          <li><strong>Resend</strong> — trimiterea email-urilor tranzacționale (confirmări, notificări comandă).</li>
          <li><strong>SMSLink.ro</strong> — trimiterea notificărilor prin SMS.</li>
          <li><strong>Oblio</strong> — emiterea facturilor (e-factură).</li>
          <li><strong>Fan Courier și Sameday</strong> — livrarea documentelor fizice (doar nume, adresă și telefon).</li>
          <li><strong>CloudConvert</strong> — conversia/optimizarea documentelor (de ex. DOCX → PDF).</li>
        </ul>
        <p>
          <strong>Nu vindem, nu închiriem și nu transferăm</strong> datele tale către terți în scopuri de marketing
          sau alte scopuri comerciale.
        </p>

        <h2>6. Transferuri internaționale de date</h2>
        <p>
          Datele sunt găzduite în principal în Uniunea Europeană (Supabase — UE; AWS S3 — Frankfurt). Unii furnizori
          (de ex. Stripe, Google) pot prelucra date și în afara Spațiului Economic European. În aceste cazuri,
          transferul este protejat prin Cadrul UE-SUA privind confidențialitatea datelor (EU-US Data Privacy Framework)
          și/sau clauze contractuale standard, conform art. 46 GDPR.
        </p>

        <h2>7. Durata stocării</h2>
        <ul>
          <li><strong>Date contractuale și ale comenzilor:</strong> pe durata executării contractului + 3 ani de arhivare (termene de prescripție).</li>
          <li><strong>Documente fiscale (facturi):</strong> 5 ani, conform legislației fiscale.</li>
          <li><strong>Documente încărcate (act de identitate, fotografie de verificare):</strong> se șterg în termen de 30 de zile de la livrarea documentului solicitat.</li>
          <li><strong>Contracte semnate electronic:</strong> 3 ani de la finalizarea comenzii.</li>
          <li><strong>Date analitice:</strong> până la 14 luni.</li>
        </ul>
        <p>La expirarea perioadei, datele sunt șterse definitiv sau anonimizate ireversibil.</p>

        <h2>8. Securitatea datelor</h2>
        <ul>
          <li><strong>HTTPS/TLS</strong> — toate comunicațiile sunt criptate.</li>
          <li><strong>Criptare la stocare</strong> — documentele sensibile sunt stocate criptat.</li>
          <li><strong>Acces restricționat</strong> — accesul la date este limitat strict la personalul autorizat, pe principiul „need-to-know”.</li>
          <li><strong>Plăți securizate</strong> — procesate exclusiv prin Stripe; nu stocăm datele cardului.</li>
          <li><strong>Backup și monitorizare</strong> — backup-uri regulate și monitorizarea evenimentelor de securitate.</li>
        </ul>

        <h2>9. Drepturile tale</h2>
        <p>Conform GDPR, ai următoarele drepturi privind datele tale:</p>
        <ul>
          <li><strong>Dreptul de acces</strong> (art. 15) — o copie a datelor prelucrate.</li>
          <li><strong>Dreptul la rectificare</strong> (art. 16) — corectarea datelor inexacte.</li>
          <li><strong>Dreptul la ștergere</strong> (art. 17, „dreptul de a fi uitat”) — sub rezerva obligațiilor legale de păstrare.</li>
          <li><strong>Dreptul la restricționarea prelucrării</strong> (art. 18).</li>
          <li><strong>Dreptul la portabilitatea datelor</strong> (art. 20).</li>
          <li><strong>Dreptul la opoziție</strong> (art. 21).</li>
          <li><strong>Dreptul de a retrage consimțământul</strong> în orice moment, fără a afecta legalitatea prelucrării anterioare.</li>
        </ul>
        <p>
          Pentru exercitarea acestor drepturi, scrie-ne la <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>.
          Răspundem în termenul legal de cel mult 30 de zile.
        </p>

        <h2>10. Cookie-uri</h2>
        <p>
          Platforma folosește cookie-uri esențiale (pentru funcționare și securitate) și, cu acordul tău, cookie-uri
          de analiză/funcționalitate. Detalii complete și modul de gestionare în{' '}
          <Link href="/politica-cookies/">Politica de Cookies</Link>.
        </p>

        <h2>11. Modificări ale politicii</h2>
        <p>
          Ne rezervăm dreptul de a modifica această politică pentru a reflecta schimbări ale practicilor noastre sau
          ale legislației. Modificările semnificative sunt publicate pe această pagină, cu indicarea datei ultimei
          actualizări. Recomandăm verificarea periodică.
        </p>

        <h2>12. Contact și plângeri</h2>
        <p>
          Pentru orice întrebare privind datele tale: <strong>eDigitalizare SRL</strong> ·{' '}
          <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a> · <a href="tel:+40757708181">+40 757 708 181</a>.
        </p>
        <p>
          Dacă apreciezi că prelucrarea îți încalcă drepturile, te poți adresa{' '}
          <strong>Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong>:{' '}
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>,
          B-dul G-ral Gheorghe Magheru nr. 28-30, Sector 1, București. Te încurajăm totuși să ne contactezi întâi pe
          noi pentru soluționarea amiabilă.
        </p>
      </LegalLayout>
    </>
  );
}
