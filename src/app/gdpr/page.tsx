import { buildPageMetadata } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'GDPR — Protecția Datelor',
  description: 'Drepturile tale GDPR și modul în care eGhișeul.ro (RapidCert SRL) protejează datele personale.',
  path: '/gdpr/',
});

export const revalidate = 86400;

export default function Page() {
  return (
    <LegalLayout title="GDPR — Protecția Datelor" updated="16 iunie 2026">
      <p>
        <strong>RapidCert SRL</strong> (eGhișeul.ro) respectă Regulamentul General privind Protecția Datelor (UE)
        2016/679. Această pagină rezumă angajamentele noastre și drepturile tale.
      </p>

      <h2>Principiile noastre</h2>
      <ul>
        <li>Colectăm doar datele strict necesare prestării serviciului.</li>
        <li>Folosim datele exclusiv în scopurile comunicate.</li>
        <li>Stocăm datele securizat, în Uniunea Europeană.</li>
        <li>Nu vindem datele tale către terți.</li>
      </ul>

      <h2>Drepturile tale</h2>
      <ul>
        <li>Dreptul de acces la datele tale.</li>
        <li>Dreptul de rectificare și de ștergere („dreptul de a fi uitat”).</li>
        <li>Dreptul la restricționarea și opoziția la prelucrare.</li>
        <li>Dreptul la portabilitatea datelor.</li>
        <li>Dreptul de a depune plângere la ANSPDCP.</li>
      </ul>

      <h2>Cum îți exerciți drepturile</h2>
      <p>
        Trimite o cerere la <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>. Răspundem în termenul legal de
        cel mult 30 de zile. Vezi și <a href="/politica-de-confidentialitate/">Politica de Confidențialitate</a>.
      </p>
    </LegalLayout>
  );
}
