import { buildPageMetadata } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'Termeni și Condiții',
  description: 'Termenii și condițiile de utilizare a platformei eGhișeul.ro (RapidCert SRL).',
  path: '/termeni-si-conditii/',
});

export const revalidate = 86400;

export default function Page() {
  return (
    <LegalLayout title="Termeni și Condiții" updated="16 iunie 2026">
      <p>
        Acești termeni și condiții reglementează utilizarea platformei <strong>eGhișeul.ro</strong>, operată de
        <strong> RapidCert SRL</strong> („eGhișeul”, „noi”). Prin plasarea unei comenzi, accepți integral acești termeni.
      </p>

      <h2>1. Serviciile noastre</h2>
      <p>
        eGhișeul este o platformă privată de intermediere care te ajută să obții documente oficiale (cazier judiciar,
        certificate de stare civilă, extras de carte funciară, certificat constatator etc.) de la instituțiile emitente.
        Nu suntem o instituție publică; acționăm în numele tău, pe bază de împuternicire/contract de prestări servicii,
        pentru depunerea cererilor și obținerea documentelor.
      </p>

      <h2>2. Comandă și plată</h2>
      <p>
        Plasezi comanda completând formularul online și achiți tariful afișat (care include, după caz, taxele oficiale ale
        instituțiilor). Plata se procesează securizat prin Stripe. Prețurile sunt afișate transparent înainte de plată,
        cu TVA.
      </p>

      <h2>3. Termene de livrare</h2>
      <p>
        Termenele afișate sunt estimative și depind de instituțiile emitente. Pentru documentele procesate automat,
        livrarea poate fi în câteva minute (dacă sistemul instituției este operațional). Dacă datele introduse sunt
        incorecte sau documentul necesită verificări suplimentare, eliberarea se face în timpul programului de lucru și
        este posibil să te contactăm.
      </p>

      <h2>4. Dreptul de retragere</h2>
      <p>
        Conform OUG 34/2014 art. 16 lit. m), dreptul de retragere nu se aplică după începerea efectivă a prestării
        serviciului (depunerea cererii la instituție), serviciul fiind personalizat. Pentru orice problemă, contactează-ne
        și vom găsi o soluție.
      </p>

      <h2>5. Responsabilități</h2>
      <p>
        Ești responsabil pentru corectitudinea datelor furnizate. eGhișeul depune toate diligențele pentru obținerea
        documentelor, dar nu răspunde pentru întârzieri sau refuzuri cauzate de instituțiile emitente ori de date eronate
        furnizate de tine.
      </p>

      <h2>6. Contact</h2>
      <p>
        RapidCert SRL · email: <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a> · telefon:
        <a href="tel:+40312299399"> +40 312 299 399</a> · WhatsApp: +40 757 708 181.
      </p>
    </LegalLayout>
  );
}
