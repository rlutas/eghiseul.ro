import Link from 'next/link';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'GDPR — Protecția Datelor',
  description: 'Drepturile tale GDPR și modul în care eGhișeul.ro (eDigitalizare SRL) protejează datele personale.',
  path: '/gdpr/',
});

export const revalidate = 86400;

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Acasă', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'GDPR — Protecția Datelor', item: `${BASE_URL}/gdpr/` },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LegalLayout title="GDPR — Protecția Datelor" updated="27 iunie 2026">
        <p>
          <strong>eDigitalizare SRL</strong> (eGhișeul.ro), în calitate de operator de date, respectă Regulamentul
          General privind Protecția Datelor (UE) 2016/679 și Legea nr. 190/2018. Această pagină rezumă angajamentele
          noastre și drepturile tale. Pentru detalii complete vezi{' '}
          <Link href="/politica-de-confidentialitate/">Politica de Confidențialitate</Link>.
        </p>

        <h2>Principiile noastre</h2>
        <ul>
          <li>Colectăm doar datele strict necesare prestării serviciului.</li>
          <li>Folosim datele exclusiv în scopurile comunicate.</li>
          <li>Stocăm datele securizat, în principal în Uniunea Europeană.</li>
          <li>Nu vindem datele tale către terți.</li>
        </ul>

        <h2>Persoane împuternicite (art. 28 GDPR)</h2>
        <p>
          Pentru a presta serviciul, lucrăm cu colaboratori și furnizori care prelucrează datele în numele nostru, pe
          baza unor contracte de prelucrare conforme cu art. 28 GDPR: avocatul partener (documente judiciare/fiscale/
          stare civilă), topograful autorizat (documente cadastrale ANCPI/OCPI) și furnizori tehnici (procesare plăți,
          găzduire, email/SMS, facturare, curierat). Lista detaliată este în{' '}
          <Link href="/politica-de-confidentialitate/">Politica de Confidențialitate</Link>, secțiunea 5.
        </p>

        <h2>Drepturile tale</h2>
        <ul>
          <li>Dreptul de acces la datele tale (art. 15).</li>
          <li>Dreptul de rectificare și de ștergere („dreptul de a fi uitat”) (art. 16-17).</li>
          <li>Dreptul la restricționarea și opoziția la prelucrare (art. 18, 21).</li>
          <li>Dreptul la portabilitatea datelor (art. 20).</li>
          <li>Dreptul de a retrage consimțământul oricând.</li>
          <li>Dreptul de a depune plângere la ANSPDCP.</li>
        </ul>

        <h2>Cum îți exerciți drepturile</h2>
        <p>
          Trimite o cerere la <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>. Răspundem în termenul legal
          de cel mult 30 de zile. Te poți adresa și{' '}
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">ANSPDCP</a>.
        </p>
      </LegalLayout>
    </>
  );
}
