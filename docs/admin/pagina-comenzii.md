# Pagina comenzii în admin: ce face fiecare buton

Pagina unei comenzi (Comenzi → click pe comandă) e împărțită în carduri. Aici
e fiecare card cu butoanele lui, ce fac și când le folosiți. Scris pe
21.09.2026 din platformă. Statusurile în detaliu:
[Statusurile comenzii](statusuri-comenzi.md).

## Bara de sus

- **Statusul** cu badge (și „Anulare solicitată”, „documentero”, „test”).
- **„Site: eghiseul.ro / documentero.ro”** (din 12.11.2026): site-ul pe care a comandat clientul. Linkurile copiate de aici (status, continuare, plată) se deschid pe acel site.
- **Copiază linkul de status**: linkul pe care îl trimiteți clientului (pre-completat, vede stadiul, primește email la fiecare pas). **Deschide pagina de status** ca s-o vedeți ca el.
- **Modifică**: schimbă opțiuni / curier / limbă / țară după plată; refund automat sau link de plată extra ([procedura](modify-order.md)).
- **Schimbă serviciul** (din 02.11.2026): clientul a plătit alt serviciu decât voia, când azi ambele costă la fel (ex. Cazier Judiciar în loc de Cazier Fiscal, sau Copie intabulare în loc de Copie contract de vânzare). Merge și pe comenzi finalizate, ca să corectați evidența. Pașii sunt în secțiunea „Schimbă serviciul” de mai jos.
- **Marchează comanda urgentă**: trece prima în lista lui Mircea (doar pe serviciile lui).

## Schimbă serviciul

Butonul din bara de sus, pe orice comandă plătită care nu e anulată sau
rambursată. Pentru clientul care a plătit, de exemplu, Cazier Judiciar
Persoană Fizică și voia Cazier Fiscal sau Cazier Auto (toate 198 lei), sau a
plătit Copie încheiere intabulare și voia Copie contract de vânzare (ambele
216,59 lei).

**Cu ce se poate schimba** (regulile lui Raul, 02.11.2026):

- **Același preț de azi.** Contează cât costă azi cele două servicii pe site,
  nu cât a plătit clientul. Dacă a plătit la un preț mai vechi, dar azi
  serviciul lui și cel corect costă la fel, schimbarea merge. Banii nu se
  mișcă, iar prețul de pe comandă rămâne cel plătit. Dacă azi prețurile
  diferă: „Modifică” sau anulare și comandă nouă.
- **În aceeași familie:**
  - serviciile prin avocat între ele (caziere, certificat de integritate,
    stare civilă);
  - serviciile imobiliare prin topograf între ele (copii OCPI, certificate,
    identificări), de exemplu Copie intabulare ↔ Copie contract de vânzare ↔
    Copie plan cadastral.

  Nu se trece de la avocat la imobiliare sau invers: fluxurile sunt diferite.
- **Nu** se schimbă serviciile emise automat (extras CF, extras de plan
  cadastral, certificat constatator): documentul pleacă pe loc.

**Comenzi finalizate, expediate sau livrate** se pot schimba, ca să corectați
evidența după fapt (exemplu: E-261007-K59HB, finalizată). Fereastra arată
„Comanda e deja …: schimbarea corectează doar evidența; documentele deja
depuse/livrate nu se schimbă”. La acestea termenul rămâne cel de acum.
Statusul comenzii nu se schimbă niciodată din acest buton.

**La imobiliare, schimbarea e blocată când:**

- topograful a început deja lucrul: a depus cererea la OCPI (are număr de
  înregistrare), a raportat identificarea, a încărcat documentul sau comanda e
  de la „Depus la instituție” încolo (inclusiv finalizată);
- robotul ANCPI a pornit deja comanda. Dacă era doar pus în coadă și nu
  pornise, se șterge singur din coadă la schimbare;
- topograful care are comanda nu lucrează pe serviciul nou (ar dispărea din
  portalul lui);
- serviciului nou îi lipsesc date: numărul de carte funciară (de exemplu, de
  la o identificare după adresă la o copie) sau datele proprietarului pentru
  convenția cu topograful.

Dacă trece, comanda rămâne la același topograf și apare în portalul lui cu
serviciul nou.

**Pașii:**

1. Apăsați **„Schimbă serviciul”**. Sus apar serviciile din aceeași familie
   în care se poate muta comanda. Sub ele, „De ce nu apar celelalte servicii”
   arată motivul pentru fiecare serviciu care nu se poate alege.
2. Alegeți serviciul corect. Fereastra arată:
   - **ce blochează** (roșu), de exemplu alt preț azi, o opțiune care nu
     există la serviciul nou (urgența nu există la Cazier Fiscal), trecerea de
     la firmă la persoană fizică sau lucrul deja început de topograf;
   - **avertismentul** (galben), dacă comanda e deja la instituție sau
     încheiată;
   - **ce se schimbă**: prețul vechi plătit (dacă e cazul), topograful,
     coada robotului ANCPI, termenul, statusul (rămâne același);
   - **ce trebuie făcut după** schimbare: semnătura lipsă („Cere completare”),
     poza permisului la Cazier Auto („Solicită documente”), prenumele
     părinților („Corectează datele clientului”);
   - **documentele de regenerat** (contracte, împuternicire, convenția cu
     topograful) și ce se întâmplă cu cererea de eliberare (Cazier Auto și
     Certificatul de integritate nu au cerere, doar împuternicire);
   - **factura**: rămâne cu denumirea serviciului vechi. Dacă trebuie refăcută,
     o face Raul sau contabila. Nu apăsați „Storno + Reemite” fără acordul
     lor.
3. La Cazier Auto: bifați că ați confirmat cu clientul că **permisul e emis în
   România**. Permisul străin are alt preț și alt termen, deci acolo se face
   anulare și comandă nouă.
4. Scrieți motivul (apare în istoric) și apăsați **„Schimbă serviciul”**.
5. După schimbare: din „Procesare comandă” **regenerați** documentele (la
   avocat: contractele, împuternicirea și cererea, dacă serviciul nou o are;
   la imobiliare: contractul și convenția). Documentele vechi nu se șterg
   singure. La serviciile prin avocat, numerele de Barou rămân aceleași: se
   mută pe serviciul nou în registru. La imobiliare nu există numere de Barou.

Termenul se recalculează cu regulile serviciului nou, pornind tot de la data
plății. Excepție: la comenzile finalizate, expediate sau livrate rămâne cel
vechi.

Ce **nu** face butonul: nu mută bani, nu schimbă statusul, nu schimbă
factura. Pe cazierjudiciaronline.com nu există încă.

## Detalii serviciu

Serviciul, opțiunile bifate cu prețul, termenul estimat, data plății, tipul
de document (constatator), permisul (auto), motivul. La comenzile combinate:
serviciul secundar.

## Informații client

Numele din act și din contact, CNP, telefon, email, cetățenia; părinții (la
caziere / integritate); firma (PJ). **Salvează corecturile** modifică datele
clientului (nume, CNP, adresă, contact) și îl aduce pe client cu datele
corectate dacă se întoarce în formular. Nu semnați și nu plătiți în locul
lui.

Pe comenzile **plătite** (din 02.11.2026): butonul **„Corectează datele
clientului”**, sub „Corectează contact”. Schimbă nume, CNP, data și locul
nașterii, părinții și adresa din act. După salvare, **regenerați cererea și
împuternicirea**, pentru că cele generate au datele vechi. Factura emisă nu se
schimbă de aici: datele de facturare se corectează în Oblio.

Pe comenzile neterminate: banner galben cu **„Copiază link continuare”**
(link special, 48 de ore, îl duce la pasul lui cu datele lui, merge și fără
email) și **pasul unde s-a oprit**. Tot acolo e **„Finalizează ca comandă
telefonică”**: pentru comenzile începute de echipă pe formularul public, le
trece pe fluxul telefonic (link de plată, apoi link de completare pentru acte,
selfie și semnătură), fără să mai ceară selfie înainte de plată.

Dacă clientul a apăsat deja „Plătește” fără să plătească (În așteptare sau
Abandonată), formularul e închis. **„Redeschide formularul (schimbă opțiuni)”**
trece comanda înapoi pe Ciornă și copiază linkul de continuare, ca să se poată
adăuga o opțiune uitată; clientul semnează și trimite din nou. Detalii:
[Client blocat](ghid-echipa-ajutare-client-blocat.md).

## Date stare civilă / Date imobil / Firmă

Cardurile specifice serviciului: răspunsurile din pasul de stare civilă, CF /
cadastral / adresă + UAT, numărul de depunere OCPI, datele firmei de la ANAF.
La identificare imobil: „Are acte pentru identificare” (Da/Nu) și **Acte trimise
de client** (extras CF vechi, titlu, contract), cu click care deschide fișierul.

## Mesaje cu clientul

Din 29.09 e o **bară sub „Note Echipă”**, cu butonul **„Scrie clientului”**
(sau „Vezi / scrie clientului” dacă există mesaje). Butonul deschide o
fereastră separată, cu avertismentul că mesajul pleacă la client. Nu mai e o
casetă de scris deschisă lângă note, ca să nu fie confundată cu ele. Dacă clientul a răspuns și nimeni nu a citit, bara e
galbenă și scrie „răspuns nou”; din lista de comenzi, linkul spre mesaje
deschide fereastra direct.

Ce scrieți în fereastră ajunge la client pe email și în pagina comenzii; el
răspunde de acolo, cu poze atașate, iar răspunsul vine pe email la contact@
și la topograf. Vedeți „văzut de client” sub fiecare mesaj.
Din 02.11 puteți atașa la mesaj până la 5 poze sau PDF-uri (butonul „Atașează poză sau PDF”).
Notele interne rămân în „Note Echipă”. Detalii: [Mesajele cu clientul](mesaje-client.md).

## Documente încărcate de client

Actul față / spate, selfie, permisul, cu previzualizare și OCR-ul citit.

- **Marchează verificat**: notează cine și când a verificat actele (chip „Verificat de … la …”, cu **Retrage**). Nu schimbă statusul; e urma voastră.
- **Solicită documente**: bifați ce lipsește (act față / verso / selfie / altele) + motivul; clientul primește email cu link; comanda intră singură în „Așteptare client” și iese singură când a încărcat tot. Cardul de progres arată ✓ pe fiecare fișier; de acolo copiați linkul sau îl trimiteți pe **WhatsApp**. Clientul confirmă întâi emailul comenzii; nu semnează și nu plătește din nou.
- **Act de identitate (manual)**: încărcați voi actul primit pe WhatsApp / email.

## Plata

Metoda, suma, Stripe (linkuri spre plată / sesiune în Stripe Dashboard),
cupon, factura Oblio (numărul; **„Emite acum”** dacă webhook-ul a picat;
cronul orar o emite oricum), plățile extra (link, expirare, **regenerare**).

Pe transfer bancar: dovada încărcată de client, **„Dovadă verificată —
pornește lucrul”**, **„Confirmă plata”** (referința din extras e
obligatorie), **„Banii nu au venit — abandonează”**. Pe comenzi telefonice:
**„Trimite link de plată”**, **„Trimite link de completare (acte +
semnătură)”**.

Pe „Anulare solicitată”: **„Procesează refund”** (refund Stripe 70% +
storno + factura de 30%), **„Am refundat manual”** (când Stripe refuză),
**„Reconciliază”** (când lipsește o piesă). [Procedura](anulare-refund-70.md).
Storno / reemitere factură: [procedura](storno-reemite.md).

## Procesare comandă

Cardul cu **butonul mare** care schimbă statusul la pasul următor (Începe
procesarea → Marchează documente generate → Marchează depusă la IPJ →
Marchează document primit → Marchează gata de expediere) și, sub el:

- **Cine lucrează comanda** (Echipa internă / Topograf): trimite comanda lui Mircea sau o retrage; el primește email.
- **Documente generate**: contractul de prestări, contractul de asistență, împuternicirea (una per act), cererea de eliberare (una per act; **Generează** / **Regenerează**), convenția cu topograful, documentul de la instituție, documentele de la colaborator. Fiecare cu **Previzualizare**, **Descarcă PDF**, **Word** (ca să modificați cererea înainte de depunere), numărul din registrul Baroului, și badge-ul „văzut de client” dacă l-a deschis.
- **Opțiuni extra**: bifă pe fiecare opțiune când e gata, cu data.
- **Actualizează status**: dropdown-ul pentru statusurile fără buton (traducere, legalizare, apostile, așteptare client, blocat instituție, corecții).

Cardul „Procesare comandă” apare pe orice status de lucru (a dispărut cândva
pe standby / traducere; reparat 21.07).

## Livrare

Metoda aleasă (email / Fan Courier / Sameday / easybox / Poșta internațional
/ DHL), adresa, **Copiază adresa**. Când documentul e eliberat:

- **Generează AWB**: creează AWB-ul la curier (Fan Courier sau Sameday; easybox cere lockerul ales de client; predarea noastră e în easybox-ul din Setări). Apoi **Printează eticheta**, **Copiază AWB**, linkul de urmărire, **AWB manual** (Poșta / DHL: introduceți numărul; internaționalul se urmărește pe parcelsapp), **Anulează AWB** (și puteți salva alt AWB în locul lui).
- **Marchează livrat**: când curierul nu raportează livrarea.
- Urmărirea rulează singură la 30 de minute; „Livrată” și „Finalizată” vin singure. Pe email: cardul arată „Email (PDF)” și data la care a plecat documentul.

## Facturare

Datele de facturare (PF / firmă), tipul facturii, numărul Oblio, adresa
pentru SPV (sector, județ, țara fără diacritice; CNP tastat greșit blochează
trimiterea în SPV).

## Cost intern & marjă

Apare doar pe comenzile unde plătim un terț: traducere, legalizare,
apostile, taxe ANCPI / ONRC (acestea intră singure). **Adaugă cost** cu
categoria și furnizorul; pop-up-ul apare și la „Expediată” / „Finalizată”.
Totalurile merg în **Costuri furnizori** și în deconturi.

## Istoric comandă, Note echipă, Proveniență

Istoricul e jurnalul complet (cine, când, ce; clientul vede o variantă
curată). **Note echipă** = note interne despre client / comandă, vizibile
doar vouă (și lui Mircea, pe comenzile lui, notele lui apar tot aici).
Proveniența: de unde a venit clientul (campanie, prima vizită).

## Contract

Semnătura desenată, data, IP-ul semnării, amprenta documentului: dovada
legală a contractului semnat în formular.

**Contractul de asistență juridică** spune din 12.11.2026 documentul comenzii
(„pe durata obținerii certificatului de celibat”, „…cazierului fiscal”), nu
„cazierului judiciar” la toate. Pe o comandă mai veche, dacă clientul cere
corectarea: generați din nou contractul de asistență din documente. Numărul de
contract rămâne același, data devine cea de azi.
