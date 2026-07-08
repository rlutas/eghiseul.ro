import Link from 'next/link';
import { buildPageMetadata, BASE_URL } from '@/lib/seo';
import { LegalLayout } from '@/components/legal/legal-layout';

export const metadata = buildPageMetadata({
  title: 'Termeni și Condiții',
  description:
    'Termenii și condițiile de utilizare a platformei eGhișeul.ro (eDigitalizare SRL): servicii, comandă, ' +
    'plată, termene, anulare și rambursare, semnătură electronică, GDPR și răspundere.',
  path: '/termeni-si-conditii/',
});

export const revalidate = 86400;

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Acasă', item: `${BASE_URL}/` },
    { '@type': 'ListItem', position: 2, name: 'Termeni și Condiții', item: `${BASE_URL}/termeni-si-conditii/` },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <LegalLayout title="Termeni și Condiții" updated="8 iulie 2026">
        <p>
          Acești Termeni și Condiții reglementează utilizarea platformei <strong>eGhișeul.ro</strong>, operată de
          <strong> eDigitalizare SRL</strong> (CUI RO49278701, Reg. Com. J2023001097301, sediul în Jud. Satu Mare,
          Com. Odoreu, Str. Salcâmilor nr. 2) — denumită în continuare „eGhișeul”, „Prestatorul” sau „noi”. Prin
          accesarea platformei și plasarea unei comenzi, confirmi că ai citit, înțeles și acceptat integral acești
          termeni. Dacă nu ești de acord cu oricare prevedere, te rugăm să nu utilizezi serviciile.
        </p>

        <h2>1. Definiții</h2>
        <ul>
          <li><strong>Platforma</strong> — site-ul eGhișeul.ro, cu toate paginile, formularele și funcționalitățile.</li>
          <li><strong>Prestatorul</strong> — eDigitalizare SRL, datele de mai sus.</li>
          <li><strong>Beneficiarul (Clientul)</strong> — orice persoană fizică sau juridică ce utilizează serviciile.</li>
          <li><strong>Serviciile</strong> — serviciile private de asistență la obținerea documentelor de la autoritățile competente din România.</li>
          <li><strong>Comanda</strong> — solicitarea fermă a beneficiarului, finalizată prin acceptarea termenilor și efectuarea plății.</li>
          <li><strong>Colaboratorul</strong> — un specialist partener (de ex. topograf autorizat, avocat) care procesează anumite documente în numele Prestatorului.</li>
        </ul>

        <h2>2. Serviciile noastre</h2>
        <p>
          eGhișeul este o platformă privată de intermediere. Nu suntem o instituție publică și nu suntem afiliați
          niciunui organ guvernamental; acționăm în numele tău, pe bază de împuternicire/contract de prestări
          servicii, pentru depunerea cererilor și obținerea documentelor. Documentele sunt emise exclusiv de
          autoritățile competente. Oferim asistență pentru, printre altele:
        </p>
        <ul>
          <li><strong>Caziere</strong> — cazier judiciar (IGPR), cazier fiscal (ANAF), cazier auto (DRPCIV), certificat de integritate comportamentală.</li>
          <li><strong>Stare civilă</strong> — certificate de naștere, căsătorie, celibat (duplicate/extrase).</li>
          <li><strong>Cadastru și carte funciară</strong> (ANCPI/OCPI) — extras de carte funciară, plan cadastral, identificare imobil, certificat de sarcini, copii din arhiva OCPI, plan de amplasament și delimitare, releveu și alte documente cadastrale.</li>
          <li><strong>Firme</strong> — certificat constatator (ONRC).</li>
          <li><strong>Rovinietă</strong> și alte servicii afișate pe platformă.</li>
        </ul>

        <h2>3. Procesul de comandă</h2>
        <ol>
          <li><strong>Completezi formularul online</strong> — date de contact și datele necesare serviciului (de ex. CNP/act de identitate la caziere, date imobil la servicii cadastrale).</li>
          <li><strong>Alegi opțiunile</strong> — serviciul, eventual procesare prioritară și opțiuni suplimentare.</li>
          <li><strong>Accepți termenii și, unde e cazul, semnezi electronic</strong> contractul de prestări servicii și împuternicirea.</li>
          <li><strong>Plătești online</strong>, securizat prin Stripe.</li>
        </ol>
        <p>După confirmarea plății, comanda este fermă, iar Prestatorul începe procedurile. Primești confirmare pe email.</p>

        <h2>4. Prețuri și plată</h2>
        <p>
          Tarifele sunt afișate pe platformă în RON, cu TVA inclus, și includ, după caz, taxele instituțiilor
          emitente. Prețul final depinde de serviciul ales, de procesarea prioritară și de opțiunile suplimentare,
          fiind afișat transparent înainte de plată.
        </p>
        <p>
          Plata se efectuează online prin card (Visa, Mastercard, Apple Pay, Google Pay), procesată securizat prin
          <strong> Stripe</strong> (certificat PCI DSS Level 1). Nu stocăm datele cardului pe serverele noastre.
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
          afara programului, termenul se calculează începând cu următoarea zi lucrătoare. Pentru documentele procesate
          automat (de ex. extras de carte funciară, certificat constatator), livrarea poate fi în câteva minute, dacă
          sistemul instituției este operațional.
        </p>
        <p>Pot apărea întârzieri din motive independente de Prestator, precum:</p>
        <ul>
          <li>indisponibilitatea serverelor sau platformelor instituțiilor publice (IGPR, ANAF, DRPCIV, ANCPI/OCPI, ONRC);</li>
          <li>necesitatea furnizării unor documente sau clarificări suplimentare de către client;</li>
          <li>furnizarea de date eronate sau incomplete;</li>
          <li>necesitatea digitalizării unor documente (de ex. cărți funciare nedigitalizate);</li>
          <li>sărbători legale, lipsă de personal sau alte dificultăți la instituțiile competente;</li>
          <li>întârzieri ale serviciilor de curierat.</li>
        </ul>
        <p>Astfel de întârzieri nu pot fi imputate Prestatorului.</p>

        <h2>6. Condiții specifice pe servicii</h2>
        <p>
          Termenul estimat pentru fiecare serviciu este cel afișat pe pagina serviciului la momentul plasării
          comenzii. Suplimentar, se aplică următoarele reguli specifice:
        </p>
        <ul>
          <li><strong>Cazier judiciar, cazier auto, certificat de integritate, cazier fiscal, acte de stare civilă</strong> — necesită împuternicire avocațială semnată electronic. Pentru persoanele născute în străinătate sau în cazul unor verificări suplimentare la instituții, termenul se poate prelungi (până la 15 zile lucrătoare la cazierul judiciar, auto și certificatul de integritate; cazierul fiscal NU se prelungește pentru cetățeni străini). Anularea este posibilă doar în primele 30 de minute (rambursare 70%), conform secțiunii 8.</li>
          <li><strong>Extras de carte funciară, extras de plan cadastral, certificat constatator</strong> — intră imediat în procesare automată; <strong>anularea nu este posibilă după plasarea comenzii</strong>. Dacă imobilul nu este digitalizat sau datele necesită verificări, termenul se poate prelungi cu până la 3 zile lucrătoare.</li>
          <li><strong>Imobil fără geometrie / neidentificabil</strong> — dacă imobilul nu poate fi identificat sau nu are geometrie în sistemul ANCPI, instituția emite un document de respingere, care se livrează clientului; suma achitată nu se rambursează, serviciul de procesare fiind prestat.</li>
          <li><strong>Identificare imobil</strong> (după proprietar și adresă) — termen de până la 10 zile lucrătoare; dacă imobilul nu este înscris în cartea funciară, se livrează documentul de respingere, fără rambursare. Anularea nu este posibilă după plasarea comenzii.</li>
          <li><strong>Certificat constatator pentru entități neînregistrate la ONRC</strong> (de ex. cabinete medicale, ONG-uri) sau cu date incorecte — nu se emite document de respingere; clientul este informat și primește un <strong>credit</strong> pentru eliberarea documentului, transferabil pe alt CUI sau către un alt serviciu de preț egal.</li>
        </ul>

        <h2>7. Modalități de livrare</h2>
        <p>
          Documentele pot fi livrate în format digital (email și/sau cont online), fizic prin curier, sau în ambele
          formate, conform opțiunilor afișate pe platformă la plasarea comenzii. Eventualele costuri suplimentare de
          curierat (de ex. livrare internațională) sunt afișate înainte de plată sau comunicate prin email/WhatsApp
          împreună cu opțiunile disponibile.
        </p>

        <h2>8. Dreptul de retragere, anulare și rambursare</h2>
        <p>
          Conform OUG 34/2014 art. 16 lit. m), dreptul legal de retragere nu se aplică după începerea efectivă a
          prestării serviciului (depunerea cererii la instituție), serviciul fiind personalizat. Suplimentar, pentru
          <strong> serviciile eligibile</strong> oferim o politică de anulare proprie:
        </p>
        <ul>
          <li><strong>În primele 30 de minute</strong> de la confirmarea plății, dacă serviciul comandat este eligibil, poți solicita anularea din pagina de <Link href="/comanda/status/">verificare status comandă</Link> (opțiunea apare acolo doar pentru serviciile eligibile) și primești <strong>70%</strong> din suma plătită (30% acoperă costurile administrative și de procesare). Pentru serviciile care intră imediat în procesare automată, anularea poate să nu fie disponibilă.</li>
          <li><strong>După depunerea cererii</strong> la autorități, anularea nu mai este posibilă, procedura fiind deja inițiată.</li>
          <li><strong>Dacă serviciul nu poate fi prestat din culpa Prestatorului</strong>, primești rambursare integrală (100%).</li>
        </ul>
        <p>Rambursările se procesează prin aceeași metodă de plată, în 5–10 zile lucrătoare.</p>

        <h2>9. Semnătura electronică</h2>
        <p>
          Contractul de prestări servicii și împuternicirea se semnează electronic pe platformă, conform
          <strong> Legii nr. 214/2024</strong> privind digitalizarea și <strong>Regulamentului (UE) nr. 910/2014
          (eIDAS)</strong>. Semnătura electronică simplă utilizată produce efecte juridice și este admisibilă ca
          probă, conform art. 25 din eIDAS. Atestăm semnătura prin: numele semnatarului, adresa IP, data și ora
          (timestamp), user-agent-ul dispozitivului și consimțământul exprimat prin acțiune afirmativă, plus hash-ul
          SHA-256 al documentului semnat.
        </p>

        <h2>10. Contractul, asistența juridică și serviciile de specialitate</h2>
        <p>
          La finalizarea comenzii se generează automat documentele aferente (de ex. contract de prestări servicii,
          contract de asistență, împuternicire), cu număr unic și semnătură electronică. Prin plasarea comenzii,
          beneficiarul autorizează Prestatorul să încheie, în numele său, contractele necesare și să dea împuternicire
          de reprezentare în fața autorităților competente pentru depunerea și ridicarea documentelor.
        </p>
        <p>
          <strong>Onorarii specialiști.</strong> Din suma totală plătită:
        </p>
        <ul>
          <li>pentru documentele judiciare, fiscale și de stare civilă, suma de <strong>15 lei (TVA inclus)</strong> reprezintă <strong>onorariul avocatului partener</strong> pentru reprezentare în fața autorităților;</li>
          <li>pentru documentele cadastrale (ANCPI/OCPI), suma de <strong>15 lei (TVA inclus)</strong> reprezintă <strong>onorariul topografului/colaboratorului autorizat</strong> care obține și pregătește documentul.</li>
        </ul>
        <p>Documentele semnate sunt stocate securizat și pot fi descărcate din contul tău sau solicitate pe email.</p>

        <h2>11. Cesionarea și subcontractarea</h2>
        <p>
          Prestatorul poate cesiona și/sau subcontracta o terță parte (de ex. avocat partener, topograf autorizat,
          traducător, curier) pentru serviciile aferente onorării comenzii, cu informarea prealabilă a Clientului,
          fără a fi necesar acordul acestuia. În orice situație, Prestatorul rămâne responsabil față de Client pentru
          îndeplinirea tuturor obligațiilor contractuale.
        </p>

        <h2>12. Obligațiile beneficiarului și corectitudinea datelor</h2>
        <ul>
          <li>Să furnizeze date corecte, complete și actuale — orice eroare poate duce la respingerea cererii.</li>
          <li>Să încarce documente lizibile și valabile, acolo unde sunt necesare.</li>
          <li>Să achite integral tariful înainte de începerea procesării.</li>
          <li>Să răspundă solicitărilor de informații suplimentare în maximum 48 de ore.</li>
          <li>Să nu utilizeze serviciile în scopuri ilegale și să nu furnizeze datele altor persoane fără acordul/împuternicirea acestora.</li>
        </ul>
        <p>
          Este esențial ca datele furnizate în formularul de comandă să fie corecte și complete: orice eroare poate
          genera întârzieri, documente incorecte sau chiar imposibilitatea prestării serviciului, fără drept de
          rambursare. Verifică atent informațiile înainte de trimitere. Dacă observi o greșeală, contactează-ne cât
          mai repede — cel mai rapid pe{' '}
          <a href="https://wa.me/40757708181" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
        </p>

        <h2>13. Obligațiile prestatorului</h2>
        <ul>
          <li>Să proceseze cererile cu diligență profesională, în termenele estimate.</li>
          <li>Să informeze clientul despre stadiul comenzii (email și/sau telefon).</li>
          <li>Să asigure confidențialitatea datelor conform GDPR.</li>
          <li>Să livreze documentul în format digital (email/cont online) și/sau fizic (curier), conform opțiunii alese.</li>
          <li>Să notifice clientul în cel mai scurt timp în cazul oricărui impediment.</li>
        </ul>

        <h2>14. Protecția datelor (GDPR)</h2>
        <p>
          eDigitalizare SRL, în calitate de operator, prelucrează datele conform Regulamentului (UE) 2016/679 (GDPR).
          Temeiul prelucrării este executarea contractului (art. 6 alin. 1 lit. b) și îndeplinirea obligațiilor legale
          (art. 6 alin. 1 lit. c). Ai drept de acces, rectificare, ștergere, restricționare, portabilitate și opoziție;
          plângeri pot fi depuse la ANSPDCP (<a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">www.dataprotection.ro</a>).
          Detalii în <Link href="/politica-de-confidentialitate/">Politica de Confidențialitate</Link> și pagina <Link href="/gdpr/">GDPR</Link>.
        </p>

        <h2>15. Limitarea răspunderii</h2>
        <p>Prestatorul nu răspunde pentru: date incorecte furnizate de beneficiar; întârzieri/ refuzuri ale autorităților sau ale curierilor; forță majoră (inclusiv indisponibilitatea sistemelor instituțiilor); utilizarea documentelor în alte scopuri; daune indirecte. Răspunderea totală a Prestatorului este limitată la valoarea serviciului achitat pentru comanda respectivă.</p>

        <h2>16. Proprietate intelectuală</h2>
        <p>Întregul conținut al platformei (texte, imagini, design, logo-uri, cod) este proprietatea eDigitalizare SRL și este protejat de lege. Reproducerea fără acord scris este interzisă.</p>

        <h2>17. Reclamații, legislație aplicabilă și soluționarea litigiilor</h2>
        <p>
          Pentru orice nelămuriri, sugestii sau reclamații ne poți contacta pe{' '}
          <a href="https://wa.me/40757708181" target="_blank" rel="noopener noreferrer">WhatsApp</a> sau la{' '}
          <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a>. Ne angajăm să răspundem prompt și să tratăm
          toate sesizările cu seriozitate.
        </p>
        <p>
          Acești termeni sunt guvernați de legea română. Litigiile se soluționează amiabil; în caz contrar, de
          instanțele competente din România. Consumatorii pot apela la{' '}
          <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer">ANPC — SAL</a> sau la platforma{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">SOL (ODR)</a>.
        </p>

        <h2>18. Contact</h2>
        <p>
          eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · email:{' '}
          <a href="mailto:contact@eghiseul.ro">contact@eghiseul.ro</a> · telefon/WhatsApp:{' '}
          <a href="tel:+40757708181">+40 757 708 181</a>.
        </p>
      </LegalLayout>
    </>
  );
}
