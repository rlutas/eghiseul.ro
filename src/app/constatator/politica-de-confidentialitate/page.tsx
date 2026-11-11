import Link from 'next/link';
import { LegalLayoutConstatator } from '@/components/constatator/legal-layout';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorBreadcrumb, constatatorOrganizationNode, constatatorWebsiteNode } from '@/lib/seo/constatator-schema';
import { CONSTATATOR_INDEXABLE } from '@/config/constatator-nav';

const PATH = '/politica-de-confidentialitate/';

export const metadata = buildPageMetadata({
  brand: 'constatator',
  title: 'Politica de confidențialitate',
  description:
    'Cum colectează, folosește și protejează certificat-constatator-express.ro (eDigitalizare SRL) datele tale personale: ' +
    'date colectate, scop, temei legal, destinatari și persoane împuternicite, durata stocării și drepturile tale GDPR.',
  path: PATH,
  noindex: !CONSTATATOR_INDEXABLE,
});

export const revalidate = 86400;

/**
 * Same operator and the same provisions as eghiseul.ro/politica-de-confidentialitate/
 * (src/app/(eghiseul)/politica-de-confidentialitate/page.tsx); the data
 * categories and the recipients are the ones a certificat constatator order
 * touches (no ID scan, no selfie, no signature, no courier).
 */
export default function Page() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      constatatorOrganizationNode(),
      constatatorWebsiteNode(),
      constatatorBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Politica de confidențialitate', path: PATH }], PATH),
    ],
  };
  const email = <a href="/contact/">formularul de contact</a>;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <LegalLayoutConstatator title="Politica de confidențialitate" path={PATH}>
        <p>
          <strong>eDigitalizare SRL</strong> (CUI RO49278701, Reg. Com. J2023001097301, sediul în Jud. Satu Mare,
          Com. Odoreu, Str. Salcâmilor nr. 2), operatorul platformei <strong>certificat-constatator-express.ro</strong>, denumită în
          continuare „Operatorul” sau „noi”, prelucrează datele tale cu caracter personal în conformitate cu
          Regulamentul (UE) 2016/679 (GDPR), Legea nr. 190/2018 și legislația națională în vigoare. Această politică
          explică ce date colectăm, în ce scop, cui le divulgăm, cât le păstrăm și ce drepturi ai.
        </p>

        <h2>1. Operatorul de date</h2>
        <p>
          Operatorul de date cu caracter personal pentru platforma certificat-constatator-express.ro este <strong>eDigitalizare SRL</strong>,
          cu datele de identificare de mai sus. Pentru orice solicitare privind datele tale, ne poți contacta la{' '}
          {email}.
        </p>

        <h2>2. Ce date colectăm</h2>
        <p>Colectăm doar ce e necesar pentru cererea de certificat constatator:</p>
        <h3>a) Date despre firmă</h3>
        <ul>
          <li>Codul fiscal (CUI) și denumirea firmei, plus datele publice din Registrul Comerțului și de la ANAF aduse automat după CUI.</li>
        </ul>
        <h3>b) Date despre persoană (doar la certificatul pentru persoană fizică)</h3>
        <ul>
          <li>Numele complet și codul numeric personal (CNP) al persoanei pentru care se cere certificatul.</li>
        </ul>
        <h3>c) Date de contact și facturare</h3>
        <ul>
          <li>Adresa de email, numărul de telefon și datele de facturare (persoană fizică sau firmă).</li>
          <li>Scopul pentru care ceri certificatul, așa cum îl alegi în formular.</li>
        </ul>
        <h3>d) Date de acceptare a contractului</h3>
        <ul>
          <li>Data și ora acceptării termenilor (timestamp), adresa IP și user-agent-ul dispozitivului.</li>
        </ul>
        <h3>e) Date de plată</h3>
        <ul>
          <li>Datele tranzacției, procesate securizat de furnizorul de plăți. <strong>Nu stocăm datele cardului</strong> pe serverele noastre. La plata prin transfer bancar păstrăm dovada plății pe care ne-o trimiți și referința tranzacției.</li>
        </ul>
        <h3>f) Date tehnice și de navigare</h3>
        <ul>
          <li>Adresă IP, tip browser și dispozitiv, pagini vizitate, sursa traficului.</li>
        </ul>
        <p>Nu cerem act de identitate, fotografie sau semnătură pentru acest serviciu.</p>

        <h2>3. Scopul prelucrării</h2>
        <ul>
          <li><strong>Prestarea serviciului</strong>: depunerea cererii de eliberare a certificatului constatator la ONRC, în numele tău, și trimiterea certificatului pe email.</li>
          <li><strong>Încheierea și executarea contractului</strong>: generarea contractului de prestări servicii.</li>
          <li><strong>Facturare și plăți</strong>: emiterea facturilor și procesarea plăților.</li>
          <li><strong>Comunicare</strong>: informarea ta privind stadiul comenzii și solicitarea de informații suplimentare.</li>
          <li><strong>Obligații legale</strong>: conformarea cu obligațiile fiscale, contabile și de arhivare.</li>
          <li><strong>Securitate și prevenirea fraudelor</strong>: prevenirea utilizării abuzive a serviciului.</li>
          <li><strong>Îmbunătățirea serviciilor</strong>: analiza agregată a utilizării platformei.</li>
        </ul>

        <h2>4. Temeiul legal</h2>
        <ul>
          <li><strong>Executarea contractului</strong> (art. 6 alin. 1 lit. b GDPR): pentru prestarea serviciului comandat.</li>
          <li><strong>Consimțământul</strong> (art. 6 alin. 1 lit. a GDPR): pentru comunicări și cookie-uri neesențiale.</li>
          <li><strong>Obligația legală</strong> (art. 6 alin. 1 lit. c GDPR): pentru obligațiile fiscale, contabile și de arhivare.</li>
          <li><strong>Interesul legitim</strong> (art. 6 alin. 1 lit. f GDPR): pentru securitatea platformei, prevenirea fraudelor și îmbunătățirea serviciilor.</li>
        </ul>

        <h2>5. Destinatarii datelor și persoanele împuternicite</h2>
        <p>
          Pentru a presta serviciul, divulgăm datele strict necesare către următoarele categorii de destinatari. Unii
          dintre aceștia acționează în calitate de <strong>persoane împuternicite</strong> (procesatori), în baza unor
          contracte de prelucrare conforme cu <strong>art. 28 GDPR</strong>, care le impun să prelucreze datele
          exclusiv conform instrucțiunilor noastre și să asigure confidențialitatea și securitatea lor.
        </p>
        <h3>a) Autoritatea emitentă</h3>
        <ul>
          <li>Oficiul Național al Registrului Comerțului (ONRC), pentru depunerea cererii și eliberarea certificatului constatator.</li>
        </ul>
        <h3>b) Furnizori de servicii (persoane împuternicite)</h3>
        <ul>
          <li><strong>Stripe, Inc.</strong>: procesare plăți online (certificat PCI DSS Level 1).</li>
          <li><strong>Supabase, Inc.</strong>: infrastructură cloud (bază de date), date găzduite în Uniunea Europeană.</li>
          <li><strong>Amazon Web Services (AWS S3)</strong>: stocare securizată a certificatelor și contractelor, regiunea eu-central-1 (Frankfurt, UE).</li>
          <li><strong>Railway</strong>: serverul care trimite cererea către portalul ONRC.</li>
          <li><strong>Resend</strong>: trimiterea email-urilor tranzacționale (confirmări, notificări, certificatul).</li>
          <li><strong>Oblio</strong>: emiterea facturilor (e-factură).</li>
          <li><strong>CloudConvert</strong>: conversia contractului din DOCX în PDF.</li>
        </ul>
        <p>
          <strong>Nu vindem, nu închiriem și nu transferăm</strong> datele tale către terți în scopuri de marketing
          sau alte scopuri comerciale.
        </p>

        <h2>6. Transferuri internaționale de date</h2>
        <p>
          Datele sunt găzduite în principal în Uniunea Europeană (Supabase: UE; AWS S3: Frankfurt). Unii furnizori
          (de ex. Stripe) pot prelucra date și în afara Spațiului Economic European. În aceste cazuri, transferul este
          protejat prin Cadrul UE-SUA privind confidențialitatea datelor (EU-US Data Privacy Framework) și/sau clauze
          contractuale standard, conform art. 46 GDPR.
        </p>

        <h2>7. Durata stocării</h2>
        <ul>
          <li><strong>Date contractuale și ale comenzilor:</strong> pe durata executării contractului + 3 ani de arhivare (termene de prescripție).</li>
          <li><strong>Documente fiscale (facturi):</strong> 5 ani, conform legislației fiscale.</li>
          <li><strong>Certificatul emis:</strong> împreună cu dosarul comenzii, ca să ți-l putem retrimite. Poți cere ștergerea oricând.</li>
          <li><strong>Date analitice:</strong> până la 14 luni.</li>
        </ul>
        <p>La expirarea perioadei, datele sunt șterse definitiv sau anonimizate ireversibil.</p>

        <h2>8. Securitatea datelor</h2>
        <ul>
          <li><strong>HTTPS/TLS</strong>: toate comunicațiile sunt criptate.</li>
          <li><strong>Criptare la stocare</strong>: documentele sensibile sunt stocate criptat.</li>
          <li><strong>Acces restricționat</strong>: accesul la date este limitat strict la personalul autorizat, pe principiul „need-to-know”.</li>
          <li><strong>Plăți securizate</strong>: procesate exclusiv prin Stripe; nu stocăm datele cardului.</li>
          <li><strong>Backup și monitorizare</strong>: backup-uri regulate și monitorizarea evenimentelor de securitate.</li>
        </ul>

        <h2>9. Drepturile tale</h2>
        <p>Conform GDPR, ai următoarele drepturi privind datele tale:</p>
        <ul>
          <li><strong>Dreptul de acces</strong> (art. 15): o copie a datelor prelucrate.</li>
          <li><strong>Dreptul la rectificare</strong> (art. 16): corectarea datelor inexacte.</li>
          <li><strong>Dreptul la ștergere</strong> (art. 17, „dreptul de a fi uitat”): sub rezerva obligațiilor legale de păstrare.</li>
          <li><strong>Dreptul la restricționarea prelucrării</strong> (art. 18).</li>
          <li><strong>Dreptul la portabilitatea datelor</strong> (art. 20).</li>
          <li><strong>Dreptul la opoziție</strong> (art. 21).</li>
          <li><strong>Dreptul de a retrage consimțământul</strong> în orice moment, fără a afecta legalitatea prelucrării anterioare.</li>
        </ul>
        <p>
          Pentru exercitarea acestor drepturi, scrie-ne prin {email} sau prin poștă, la sediul firmei. Răspundem în termenul legal de cel mult 30 de zile.
        </p>

        <h2>10. Cookie-uri</h2>
        <p>
          Platforma folosește cookie-uri esențiale (pentru funcționare și securitate) și, cu acordul tău, cookie-uri
          de analiză și marketing. Detalii complete și modul de gestionare în{' '}
          <Link href="/politica-cookies/">Politica de cookie-uri</Link>.
        </p>

        <h2>11. Modificări ale politicii</h2>
        <p>
          Ne rezervăm dreptul de a modifica această politică pentru a reflecta schimbări ale practicilor noastre sau
          ale legislației. Modificările semnificative sunt publicate pe această pagină, cu indicarea datei ultimei
          actualizări. Recomandăm verificarea periodică.
        </p>

        <h2>12. Contact și plângeri</h2>
        <p>
          Pentru orice întrebare privind datele tale: <strong>eDigitalizare SRL</strong> · {email}.
        </p>
        <p>
          Dacă apreciezi că prelucrarea îți încalcă drepturile, te poți adresa{' '}
          <strong>Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong>:{' '}
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>,
          B-dul G-ral Gheorghe Magheru nr. 28-30, Sector 1, București. Te încurajăm totuși să ne contactezi întâi pe
          noi pentru soluționarea amiabilă.
        </p>
      </LegalLayoutConstatator>
    </>
  );
}
