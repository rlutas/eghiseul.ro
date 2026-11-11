import Link from 'next/link';
import { LegalLayoutConstatator } from '@/components/constatator/legal-layout';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { constatatorBreadcrumb, constatatorOrganizationNode, constatatorWebsiteNode } from '@/lib/seo/constatator-schema';
import { CONSTATATOR_INDEXABLE } from '@/config/constatator-nav';

const PATH = '/termeni-si-conditii/';

export const metadata = buildPageMetadata({
  brand: 'constatator',
  title: 'Termeni și condiții',
  description:
    'Termenii și condițiile platformei certificat-constatator-express.ro (eDigitalizare SRL): certificatul constatator de la ONRC, ' +
    'comandă, preț cu taxa inclusă, livrare pe email, anulare, credit și răspundere.',
  path: PATH,
  noindex: !CONSTATATOR_INDEXABLE,
});

export const revalidate = 86400;

/**
 * Same company and the same provisions as eghiseul.ro/termeni-si-conditii/
 * (src/app/(eghiseul)/termeni-si-conditii/page.tsx), scoped to the one
 * service this site sells: the ONRC certificat constatator. That service is
 * fully automated, has no lawyer (only a contract-prestari, see
 * src/lib/documents/no-lawyer-services.ts) and `allow_self_cancel = false`
 * in the DB, so there is no 30-minute window here.
 */
export default function Page() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      constatatorOrganizationNode(),
      constatatorWebsiteNode(),
      constatatorBreadcrumb([{ name: 'Acasă', path: '/' }, { name: 'Termeni și condiții', path: PATH }], PATH),
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <LegalLayoutConstatator title="Termeni și condiții" path={PATH} updated="11 noiembrie 2026">
        <p>
          Acești Termeni și Condiții reglementează utilizarea platformei <strong>certificat-constatator-express.ro</strong>,
          operată de <strong>eDigitalizare SRL</strong> (CUI RO49278701, Reg. Com. J2023001097301, sediul în Jud. Satu
          Mare, Com. Odoreu, Str. Salcâmilor nr. 2), denumită în continuare „Constatator Express”, „Prestatorul” sau
          „noi”. Prin accesarea platformei și plasarea unei comenzi, confirmi că ai citit, înțeles și acceptat integral
          acești termeni. Dacă nu ești de acord cu oricare prevedere, te rugăm să nu utilizezi serviciul.
        </p>

        <h2>1. Definiții</h2>
        <ul>
          <li><strong>Platforma</strong>: site-ul certificat-constatator-express.ro, cu toate paginile, formularele și funcționalitățile.</li>
          <li><strong>Prestatorul</strong>: eDigitalizare SRL, cu datele de mai sus.</li>
          <li><strong>Beneficiarul (Clientul)</strong>: orice persoană fizică sau juridică ce comandă certificatul pe platformă.</li>
          <li><strong>Serviciul</strong>: serviciul privat de obținere a certificatului constatator de la Oficiul Național al Registrului Comerțului (ONRC), în numele beneficiarului.</li>
          <li><strong>Comanda</strong>: solicitarea fermă a beneficiarului, finalizată prin acceptarea termenilor și efectuarea plății.</li>
        </ul>

        <h2>2. Serviciul nostru</h2>
        <p>
          Constatator Express este o platformă privată de intermediere. Nu suntem o instituție publică, nu suntem ONRC
          și nu suntem afiliați niciunui organ guvernamental. Certificatul constatator este eliberat exclusiv de
          Oficiul Național al Registrului Comerțului, care îl eliberează și direct, la ghișeu sau prin portalul propriu,
          contra taxei legale. Noi depunem cererea în locul tău, plătim taxa ONRC și îți trimitem certificatul emis.
          Prețul nostru include taxa ONRC, serviciul nostru și TVA-ul.
        </p>
        <p>Pe această platformă obținem:</p>
        <ul>
          <li><strong>Certificatul constatator pentru firmă</strong> (societate, PFA, întreprindere individuală sau familială), în varianta de bază sau extinsă;</li>
          <li><strong>Certificatul constatator pentru persoană fizică</strong>, care arată calitățile unei persoane în firmele înregistrate la ONRC;</li>
          <li><strong>Certificatul constatator cu istoric</strong>, care cuprinde și modificările înregistrate în timp.</li>
        </ul>
        <p>Nu prestăm alte servicii pe această platformă.</p>

        <h2>3. Procesul de comandă</h2>
        <ol>
          <li><strong>Completezi formularul online</strong>: datele de contact și codul fiscal (CUI) al firmei sau datele persoanei, după tipul de certificat.</li>
          <li><strong>Alegi tipul certificatului și scopul</strong> pentru care îl ceri.</li>
          <li><strong>Accepți termenii</strong> și contractul de prestări servicii.</li>
          <li><strong>Plătești</strong> online cu cardul, securizat prin Stripe, sau prin transfer bancar.</li>
        </ol>
        <p>
          După confirmarea plății, comanda este fermă și cererea pleacă la ONRC. Primești confirmare pe email și, apoi,
          certificatul.
        </p>

        <h2>4. Prețuri și plată</h2>
        <p>
          Tarifele sunt afișate pe platformă în RON, cu TVA inclus, și cuprind taxa ONRC pentru eliberarea
          certificatului. Prețul final este afișat înainte de plată și nu se adaugă alte costuri.
        </p>
        <p>
          <strong>Plata cu cardul</strong> (Visa, Mastercard, Apple Pay, Google Pay) se efectuează online, procesată
          securizat prin <strong>Stripe</strong> (certificat PCI DSS Level 1). Nu stocăm datele cardului pe serverele
          noastre.
        </p>
        <p>
          <strong>Plata prin transfer bancar</strong>: contul (IBAN) și numărul comenzii, care trebuie trecut la
          detaliile plății, se afișează la finalizarea comenzii și în emailul de confirmare. Până la confirmarea
          încasării comanda rămâne în „Așteptare plată”, iar cererea pleacă la ONRC abia după confirmarea plății. O
          comandă neplătită nu creează nicio obligație de plată; scrie-ne și o închidem.
        </p>

        <h2>5. Termene de procesare</h2>
        <p>
          Certificatul constatator de bază pentru firmă se cere automat, inclusiv seara, în weekend și în zilele
          libere, și ajunge de obicei pe email în câteva minute de la confirmarea plății, dacă sistemul ONRC este
          operațional. Celelalte variante (de exemplu certificatul pentru persoană fizică sau cel cu istoric) pot
          avea nevoie de intervenția echipei noastre, în programul de lucru:
        </p>
        <ul>
          <li>Luni – Joi: 08:00 – 16:00</li>
          <li>Vineri: 08:00 – 15:00</li>
          <li>Sâmbătă, Duminică și sărbători legale: închis</li>
        </ul>
        <p>Termenele afișate sunt estimative. Pot apărea întârzieri din motive independente de Prestator, precum:</p>
        <ul>
          <li>indisponibilitatea portalului sau a sistemelor informatice ale ONRC;</li>
          <li>date incomplete sau eronate în comandă;</li>
          <li>verificări suplimentare cerute de ONRC;</li>
          <li>sărbători legale sau alte dificultăți la ONRC.</li>
        </ul>
        <p>
          Când ONRC nu răspunde, comanda rămâne în lucru, iar un om din echipă o preia și îți scrie. Astfel de
          întârzieri nu pot fi imputate Prestatorului.
        </p>

        <h2>6. Condiții specifice</h2>
        <ul>
          <li><strong>Datele din certificat</strong> sunt cele din evidența ONRC la data emiterii. Nu modificăm și nu corectăm conținutul certificatului; o corectură în registru se cere doar de la ONRC.</li>
          <li><strong>Entități neînregistrate la ONRC</strong> (de exemplu cabinete medicale individuale, asociații, fundații) sau CUI greșit: ONRC nu emite un document de respingere. Te anunțăm și primești un <strong>credit</strong> pentru eliberarea certificatului, pe care îl poți folosi pe alt CUI.</li>
          <li><strong>Scopul declarat</strong> se trece în cerere. Dacă instituția la care depui certificatul cere un alt scop, o altă variantă sau un certificat mai nou, asta nu face din comandă una greșită și nu dă drept de rambursare.</li>
        </ul>

        <h2>7. Livrare</h2>
        <p>
          Certificatul se trimite pe email, ca fișier PDF semnat electronic de ONRC, așa cum îl emite instituția.
          Documentul electronic are aceeași valoare ca cel eliberat la ghișeu. Nu livrăm certificatul pe hârtie prin
          curier.
        </p>

        <h2 id="anulare">8. Dreptul de retragere, anulare și rambursare</h2>
        <p>
          Conform OUG 34/2014 art. 16 lit. m), dreptul legal de retragere nu se aplică după începerea efectivă a
          prestării serviciului, serviciul fiind personalizat. Cererea către ONRC pleacă automat în câteva minute de la
          plată, de aceea <strong>anularea nu este posibilă după plasarea comenzii</strong>, iar opțiunea de anulare nu
          apare în pagina comenzii.
        </p>
        <ul>
          <li><strong>Dacă serviciul nu poate fi prestat din culpa Prestatorului</strong>, primești rambursare integrală (100%).</li>
          <li><strong>Dacă ONRC nu poate emite certificatul pentru datele din comandă</strong> (secțiunea 6), primești credit pentru un alt certificat.</li>
        </ul>
        <p>
          Rambursările se procesează prin aceeași metodă de plată, în 5–10 zile lucrătoare. Detalii:{' '}
          <Link href="/politica-de-anulare/">Politica de anulare și rambursare</Link>.
        </p>

        <h2>9. Acceptarea electronică</h2>
        <p>
          Termenii și contractul de prestări servicii se acceptă electronic pe platformă, prin acțiune afirmativă,
          conform <strong>Legii nr. 214/2024</strong> privind digitalizarea și <strong>Regulamentului (UE) nr.
          910/2014 (eIDAS)</strong>. Atestăm acceptarea prin adresa IP, data și ora (timestamp) și user-agent-ul
          dispozitivului.
        </p>

        <h2>10. Contractul de prestări servicii</h2>
        <p>
          La finalizarea comenzii se generează automat contractul de prestări servicii, cu număr unic. Prin plasarea
          comenzii, beneficiarul autorizează Prestatorul să depună, în numele său, cererea de eliberare a
          certificatului constatator la ONRC și să plătească taxa aferentă. Contractul poate fi solicitat pe email.
        </p>

        <h2>11. Subcontractarea</h2>
        <p>
          Prestatorul poate folosi terțe părți (de exemplu procesatorul de plăți sau furnizorul de email) pentru
          onorarea comenzii. În orice situație, Prestatorul rămâne responsabil față de Client pentru îndeplinirea
          obligațiilor contractuale.
        </p>

        <h2>12. Obligațiile beneficiarului</h2>
        <ul>
          <li>Să furnizeze date corecte și complete, în special CUI-ul firmei și adresa de email.</li>
          <li>Să achite integral tariful înainte de începerea procesării.</li>
          <li>Să răspundă solicitărilor de informații suplimentare în maximum 48 de ore.</li>
          <li>Să nu utilizeze serviciul în scopuri ilegale.</li>
        </ul>
        <p>
          Un CUI sau un email greșit poate duce la un certificat pentru altă firmă sau la un email care nu ajunge.
          Verifică datele înainte de plată. Dacă observi o greșeală, scrie-ne cât mai repede, prin{' '}
          <a href="/contact/">formularul de contact</a>.
        </p>

        <h2>13. Obligațiile prestatorului</h2>
        <ul>
          <li>Să depună cererea la ONRC cu diligență, în termenele estimate.</li>
          <li>Să informeze clientul despre stadiul comenzii, pe email.</li>
          <li>Să asigure confidențialitatea datelor conform GDPR.</li>
          <li>Să trimită certificatul emis de ONRC pe email, nemodificat.</li>
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
        <p>
          Prestatorul nu răspunde pentru: date incorecte furnizate de beneficiar; conținutul certificatului, care
          reflectă evidența ONRC; întârzieri sau refuzuri ale ONRC; forță majoră (inclusiv indisponibilitatea
          sistemelor ONRC); utilizarea certificatului în alte scopuri; daune indirecte. Răspunderea totală a
          Prestatorului este limitată la valoarea serviciului achitat pentru comanda respectivă.
        </p>

        <h2>16. Proprietate intelectuală</h2>
        <p>Întregul conținut al platformei (texte, imagini, design, logo-uri, cod) este proprietatea eDigitalizare SRL și este protejat de lege. Reproducerea fără acord scris este interzisă.</p>

        <h2>17. Reclamații, legislație aplicabilă și soluționarea litigiilor</h2>
        <p>
          Pentru orice nelămuriri, sugestii sau reclamații ne poți contacta prin{' '}
          <a href="/contact/">formularul de contact</a>.
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
          eDigitalizare SRL · CUI RO49278701 · Reg. Com. J2023001097301 · contact:{' '}
          <a href="/contact/">formularul de contact</a>.
        </p>
      </LegalLayoutConstatator>
    </>
  );
}
