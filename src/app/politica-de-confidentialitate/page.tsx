import { buildPageMetadata } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'Politica de Confidențialitate',
  description: 'Cum colectează, folosește și protejează eGhișeul.ro (RapidCert SRL) datele tale personale.',
  path: '/politica-de-confidentialitate/',
});

export const revalidate = 86400;

export default function Page() {
  return (
    <LegalLayout title="Politica de Confidențialitate" updated="16 iunie 2026">
      <p>
        <strong>RapidCert SRL</strong>, operatorul platformei <strong>eGhișeul.ro</strong>, prelucrează datele tale cu
        caracter personal în conformitate cu Regulamentul (UE) 2016/679 (GDPR). Această politică explică ce date colectăm,
        de ce și cum le protejăm.
      </p>

      <h2>1. Ce date colectăm</h2>
      <ul>
        <li>Date de identificare și de contact (nume, CNP/CUI după caz, email, telefon, adresă).</li>
        <li>Documentele și informațiile necesare pentru obținerea actului solicitat.</li>
        <li>Date de plată procesate securizat de furnizorul de plăți (nu stocăm datele cardului).</li>
        <li>Date tehnice (IP, tip dispozitiv) pentru funcționarea și securitatea site-ului.</li>
      </ul>

      <h2>2. Scopul prelucrării</h2>
      <p>
        Prelucrăm datele pentru a presta serviciul comandat (obținerea documentelor de la instituții), a emite factura, a
        comunica cu tine despre comandă și a respecta obligațiile legale.
      </p>

      <h2>3. Temeiul legal</h2>
      <p>
        Executarea contractului (art. 6(1)(b) GDPR), obligații legale (art. 6(1)(c)) și interesul legitim pentru
        securitate și îmbunătățirea serviciilor (art. 6(1)(f)).
      </p>

      <h2>4. Stocare și securitate</h2>
      <p>
        Datele sunt stocate securizat pe servere în Uniunea Europeană și păstrate doar atât cât este necesar pentru
        scopurile de mai sus și conform termenelor legale.
      </p>

      <h2>5. Drepturile tale</h2>
      <p>
        Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție. Pentru exercitarea
        acestora, scrie-ne la <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>. Te poți adresa și ANSPDCP.
      </p>

      <h2>6. Contact</h2>
      <p>
        RapidCert SRL · <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a> · +40 757 708 181.
      </p>
    </LegalLayout>
  );
}
