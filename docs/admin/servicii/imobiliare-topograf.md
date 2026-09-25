# Servicii imobiliare prin topograf: fișa pentru echipă și pentru Mircea
<!-- audienta: colaborator -->

Cele 14 servicii de cadastru și carte funciară pe care nu le poate lucra
decât un topograf autorizat (Mircea Dumitrean), plus cele două servicii de
identificare a imobilului. Fișă scrisă pe 21.09.2026 din platformă; prețul
viu e în **Setări → Servicii**, tarifele ANCPI în **Tarife ANCPI** din admin.

Extrasul CF și planul cadastral au [fișă separată](extras-carte-funciara.md);
procedura când imobilul nu se găsește e în
[Identificare imobil: când topograful NU găsește imobilul](../identificare-imobil-nereusita.md).

## Serviciile și prețurile

Prețurile sunt aliniate **la leu** cu cfunciara.ro (concurentul direct); nu
sunt provizorii. „Prioritar” = opțiunea de urgență, cu prețul ei.

| Serviciu | Preț | Prioritar | Termen | Taxa ANCPI | Ce primește clientul |
|---|--:|--:|---|--:|---|
| Identificare imobil după adresă | 298 | | 1-3 zile lucrătoare (până la ~10 dacă se depune cerere la OCPI) | 100 (cod 2.7.8) | extrasul CF; dacă nu apare online, documentul OCPI (CF găsită și digitalizată, sau confirmarea că nu e înscris) |
| Identificare imobile după proprietar | 298 | | 1-3 zile lucrătoare (până la ~10 la OCPI) | 125 (cod 2.7.6) | extrasul CF al imobilului găsit; la mai multe, al celui ales de client (celelalte = comenzi separate); la OCPI, ca mai sus |
| Copie carte funciară (in extenso) | 168,19 | 182,71 | 4 zile lucrătoare | 25 | copia întregii cărți funciare |
| Extras de carte funciară colectivă | 168,19 | 182,71 | 4 zile lucrătoare | 20 | extrasul CF al blocului / condominiului |
| Copie certificată din arhiva OCPI | 216,59 | 134,31 | 4 zile lucrătoare | 25 | copie după un act din arhivă |
| Copie contract de vânzare-cumpărare | 216,59 | 255,31 | 4 zile lucrătoare | 25 | copia contractului din arhiva OCPI |
| Copie încheiere de intabulare | 216,59 | 255,31 | 4 zile lucrătoare | 25 | copia încheierii |
| Copie inventar de coordonate Stereo 70 | 216,59 | 134,31 | 4 zile lucrătoare | 25 | coordonatele imobilului |
| Copie plan cadastral | 216,59 | 255,31 | 4 zile lucrătoare | 25 | planul din arhivă |
| Copie plan de încadrare în zonă | 216,59 | 255,31 | 4 zile lucrătoare | 25 | planul de încadrare |
| Copie releveu | 216,59 | 134,31 | 4 zile lucrătoare | 25 | releveul construcției |
| Plan de amplasament și delimitare (PAD) | 216,59 | 255,31 | 4 zile lucrătoare | | planul PAD |
| Certificat de sarcini | 302,50 | | 4 zile lucrătoare | 100 | certificatul de sarcini |
| Certificat privind deținerea de imobile | 302,50 | | 5 zile lucrătoare | 10 | certificatul de (ne)deținere |
| Actualizare adresă în cartea funciară | 302,50 | 423,50 | 15 zile lucrătoare | 60 | încheierea CF + extras cu adresa nouă |
| Certificat de urbanism pentru informare | 943,50 | | cca. 30 zile lucrătoare (termen legal al primăriei) | | certificatul de la primărie |

Toate au contract de prestări + **convenția cu topograful** („Angajament de
execuție documentație”, semnată de client în formular odată cu contractul,
cu UAT, număr cadastral și număr de CF). Nu sunt servicii cu avocat: fără
contract de asistență, fără împuternicire, fără numere de Barou. Livrare pe
email (PDF); curier doar dacă documentul e fizic și clientul l-a ales.

## Ce completează clientul

Contact → **date imobil** (CF / cadastral / adresă, județ + localitate din
nomenclator, la identificare: adresa sau datele proprietarului) → datele
solicitantului (fără selfie) → semnătura (contract + convenție) → livrare →
facturare → plată. Urgența „Procesare prioritară” e la pasul de opțiuni,
acolo unde există.

## Cine face ce

| Cine | Ce |
|---|---|
| Platforma | la plată: factura, contractul, convenția, emailul de confirmare, **emailul către Mircea**; termenul se calculează pe zile lucrătoare |
| **Mircea** (portalul `/colaborator`) | preia comanda, o lucrează la OCPI, încarcă documentul, setează statusul; înregistrează numărul de depunere și costul |
| Echipa (admin) | răspunde clientului, corectează date, marchează comanda **urgentă** pentru Mircea („Marchează comanda urgentă” pe comandă: trece prima în lista lui), verifică costurile, face decontul |
| Raul | decontul cu Mircea (avansuri pentru taxe, costuri de perioadă, împărțeala) din **Colaboratori** în admin |

Mircea **nu vede**: anulările și rambursările (dispar din lista lui), datele
de facturare ale clientului, comenzile altor servicii. Vede: datele
imobilului, numele și telefonul solicitantului, motivul, notele.

## Portalul lui Mircea, pe scurt

- **Lista comenzilor** pe etape (de lucrat / depuse / gata / finalizate), cu urgențele și vechimea; căutarea găsește orice comandă după număr, CF, localitate sau **numărul de depunere OCPI**, indiferent de tab (reparat 21.09).
- **Pagina comenzii**: datele imobilului, cererea generată de descărcat (la extras CF / plan cadastral), notă pentru echipă, și butoanele:
  - **„Am identificat imobilul”** (la identificări): salvează CF-ul, generează cererea de extras.
  - **„Nu am găsit — depun certificat la OCPI”**: statusul devine „Identificare nereușită — certificat OCPI depus”, clientul primește emailul, termenul +10 zile lucrătoare.
  - **„Am depus cererea la OCPI”**: numărul de înregistrare, **termenul dat de OCPI** (clientul îl vede în pagina comenzii) + costul (precompletat cu taxa serviciului). La CF obținut direct online nu se cere depunere: costul se înregistrează singur la încărcare.
  - **„Mesaje cu clientul”**: îi scrie direct clientului (întrebări, lista imobilelor găsite după proprietar, cerere de act vechi); clientul primește email și răspunde din pagina comenzii. Vezi [Mesajele cu clientul](../mesaje-client.md).
  - **„Acte trimise de client”** (în „Date pentru lucrare”): pozele/PDF-urile încărcate de client la comandă (extras CF vechi, titlu, contract).
  - **Statusul**: În lucru · Depusă la OCPI · Blocată — instituția indisponibilă (termenul pe pauză) · Problemă — necesare informații de la client (obligatoriu ce lipsește; comanda intră în „Așteptare client”, echipa îl contactează) · Documentul este eliberat · Finalizată · Livrată, încarcă document suplimentar.
  - **„Încarcă PDF și trimite clientului”**: documentul pleacă pe email, statusul se schimbă singur.
- **Decont** și **Tarife**: ce i se datorează și grila ANCPI.
- **Parola internă**: angajatul lui intră pe contul lui cu o parolă separată pentru paginile private.

## Statusurile, văzute din admin

Plătită → În procesare (Mircea „În lucru”) → Trimis instituție („Depusă la
OCPI”, cu număr) → [Identificare nereușită — certificat OCPI depus] →
Documentul este eliberat → Finalizată. Pauzele: „Așteptare client” (lipsesc
date) și „Blocat instituție” (OCPI / ANCPI indisponibil). Detalii:
[Statusurile comenzii](../statusuri-comenzi.md).

## Problemele frecvente

| Situație | Ce faceți |
|---|---|
| Comanda stă în „Plătită” după o zi lucrătoare | Mircea nu a preluat-o: verificați în istoric că emailul „comandă nouă” a plecat, scrieți-i pe WhatsApp. |
| Mircea a pus „Problemă — informații de la client” | nota lui spune ce lipsește; sunați clientul, corectați datele imobilului în admin, spuneți-i lui Mircea. Comanda e în tabul „Așteptare client”. |
| Imobilul nu se găsește în e-Terra | **nu** rămâne în „Așteptare client” cu „are credit”: Mircea apasă „Nu am găsit — depun certificat la OCPI”. Documentul OCPI (pozitiv sau negativ) **este livrarea**; extrasul după el e comandă nouă; nu dăm credit. Procesul complet: [Identificare imobil](../identificare-imobil-nereusita.md). |
| Mircea are o întrebare pentru client | o scrie el direct în „Mesaje cu clientul”, nu pe WhatsApp la echipă. Răspunsul clientului vine pe email la el și la contact@. |
| Clientul a comandat identificare, dar avea de fapt CF-ul | modificați comanda pe extras CF (diferența se rambursează automat). |
| Clientul întreabă de ce „doar 4 zile” la copie și „30” la urbanism | termenele sunt ale instituției: OCPI eliberează copiile în câteva zile; certificatul de urbanism e al primăriei, cu termen legal de 30 de zile. |
| Cost lipsă pe o comandă finalizată | costul intră singur la „Încarcă PDF” dacă serviciul are taxă cunoscută; altfel din pop-up-ul de la finalizare sau din **Costuri furnizori**. |
| Livrare directă cu cost 100 pus automat | a fost o eroare (28.08); costul automat se pune doar pe serviciile cu taxă cunoscută. Corectați din Costuri furnizori dacă mai vedeți așa ceva pe comenzi vechi. |
| Mircea nu vede o comandă care apare în admin | ori e anulată / rambursată (ascunsă intenționat), ori serviciul nu e alocat lui (Colaboratori → alocări). |

## Ce îi spuneți clientului

- Lucrarea o face un **topograf autorizat**; documentul vine de la OCPI, semnat de instituție.
- Termenul e pe zile lucrătoare de la plată; „prioritar” îl scurtează unde există opțiunea.
- La identificare: dacă topograful găsește imobilul, primește extrasul CF (1–3 zile). Dacă nu, cerem la OCPI (~10 zile) și primește documentul OCPI: CF găsită și digitalizată (extrasul se comandă separat) sau confirmarea că nu e înscris (merge la un topograf din zona lui pentru înscriere).
- Nu suntem OCPI / ANCPI.
