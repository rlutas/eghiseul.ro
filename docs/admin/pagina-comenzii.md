# Pagina comenzii în admin: ce face fiecare buton

Pagina unei comenzi (Comenzi → click pe comandă) e împărțită în carduri. Aici
e fiecare card cu butoanele lui, ce fac și când le folosiți. Scris pe
21.09.2026 din platformă. Statusurile în detaliu:
[Statusurile comenzii](statusuri-comenzi.md).

## Bara de sus

- **Statusul** cu badge (și „Anulare solicitată”, „documentero”, „test”).
- **Copiază linkul de status**: linkul pe care îl trimiteți clientului (pre-completat, vede stadiul, primește email la fiecare pas). **Deschide pagina de status** ca s-o vedeți ca el.
- **Modifică**: schimbă opțiuni / curier / limbă / țară după plată; refund automat sau link de plată extra ([procedura](modify-order.md)).
- **Marchează comanda urgentă**: trece prima în lista lui Mircea (doar pe serviciile lui).

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

Pe comenzile neterminate: banner galben cu **„Copiază link continuare”**
(link special, 48 de ore, îl duce la pasul lui cu datele lui, merge și fără
email) și **pasul unde s-a oprit**.

## Date stare civilă / Date imobil / Firmă

Cardurile specifice serviciului: răspunsurile din pasul de stare civilă, CF /
cadastral / adresă + UAT, numărul de depunere OCPI, datele firmei de la ANAF.

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
