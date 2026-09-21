# Caziere și certificat de integritate: fișa pentru echipă

Patru acte care merg pe același drum: clientul se identifică cu actul și un
selfie, semnează în formular, iar actul se obține prin cabinetul avocatei pe
baza împuternicirii avocațiale. Fișă scrisă pe 21.09.2026 din platformă;
prețul și termenul vii sunt în **Setări → Servicii**.

## Cele patru acte

| Act | Instituția | Preț | Termen | Urgență | Ce atestă | Valabil |
|---|---|--:|---|---|---|---|
| Cazier judiciar persoană fizică | IPJ (Poliție) | 198 | 3-5 zile lucrătoare | +80 → 1-2 zile | condamnări / lipsa lor | 6 luni |
| Cazier judiciar persoană juridică | IPJ | 198 | 3-5 zile lucrătoare | +80 → 1-2 zile | cazierul firmei (licitații SEAP, contracte) | 6 luni |
| Cazier judiciar pentru cetățean străin | IPJ + verificări IGI | 298 (198 + 100) | 7-15 zile lucrătoare | nu se poate | idem, pentru cetățeni străini | 6 luni |
| Cazier fiscal persoană fizică | ANAF | 198 | 1-3 zile lucrătoare | nu | lipsa datoriilor / faptelor fiscale | 30 zile |
| Cazier auto (fișa conducătorului auto) | Poliția Rutieră | 198 | 3-5 zile lucrătoare | +80 → 1-2 zile | sancțiuni rutiere, puncte, suspendări ale **șoferului** (nu ale mașinii) | uzual 30 zile |
| Cazier auto cu permis emis în străinătate | autoritatea străină | 350 | 7-10 zile lucrătoare | nu se poate | idem; fișa se cere autorității care a emis permisul | |
| Certificat de integritate comportamentală | IGPR | 198 | 3-5 zile lucrătoare | +80 → 1-2 zile | că persoana nu are fapte împotriva minorilor / persoanelor vulnerabile (Legea 118/2019); cerut la lucrul cu copii | uzual 6 luni |

Combinații în aceeași comandă (o singură plată, o singură livrare):

- **Cazier judiciar + certificat de integritate**: al doilea act costă **100 lei** în plus, indiferent care e principalul. Comanda are **două împuterniciri** (una per act) și **o singură cerere de eliberare**, cea pentru cazierul judiciar. Certificatul de integritate și cazierul auto **nu au cerere**: se ridică doar pe împuternicire.
- **Cetățean străin**: bifă la primul pas (doar la cazier judiciar și integritate; la cazier auto nu există, acolo contează unde a fost emis permisul). Adaugă 100 lei și 7 zile, scoate urgența.
- Opțiunile (traducere, legalizare, apostile, copii): vezi [Opțiuni suplimentare](optiuni-suplimentare.md). Pe un act combinat, opțiunile se pot bifa separat pentru fiecare act („Apostilă de la Haga (Certificat Integritate)”).

## Ce completează și încarcă clientul

1. **Contact**: email, telefon (cu prefix de țară și verificare), motivul solicitării. La cazier judiciar și integritate, aici e și bifa „sunt cetățean străin”.
2. **Date personale**: scanarea actului (OCR) sau completare manuală. CNP validat pe cifra de control (codul de județ din CNP nu e listă albă). La cazier judiciar PF și la integritate se cer și **prenumele mamei și tatălui**.
3. **Firma** (doar cazier judiciar PJ): CUI, datele vin automat de la ANAF și rămân doar de citit; datele reprezentantului legal. Firmele **radiate sau dizolvate sunt blocate**; cele **suspendate** trec cu un avertisment. **PFA, II, ÎF nu sunt persoane juridice**: cazierul se eliberează pe persoana fizică titulară, formularul îl trimite pe fluxul PF. Instituțiile publice n-au număr de Registrul Comerțului și nici formă juridică, e normal să fie goale.
4. **Permisul** (doar cazier auto): „Permisul a fost emis în: România / Străinătate”. Numărul permisului nu se mai tastează, se citește din poză.
5. **Opțiuni**: urgență, traducere, legalizare, apostile, copii suplimentare, actul suplimentar.
6. **Acte**: act de identitate față + spate (CI vechi, CI nou, pașaport; se acceptă și certificatul de domiciliu ca act suplimentar) + **selfie cu actul**. La cazier auto și **poza feței permisului**. Actul **expirat nu este acceptat** la caziere și integritate (la stare civilă da). Un fișier de 0 bytes (poză doar în cloud pe telefon) e respins.
7. **Semnătura** desenată în formular, cu acceptarea termenilor. Semnătura intră în contractul de asistență și în împuternicire; se salvează IP, ora serverului și amprenta documentului (validitate legală).
8. **Livrare**: implicit PDF pe email; opțional curier în România (Fan Courier, Sameday, easybox) sau internațional (Poșta Română 100 lei, DHL 250 lei).
9. **Facturare**: persoană fizică (CNP opțional pentru străinătate) sau firmă (CUI verificat la ANAF). Un client PF poate cere factura pe o firmă.
10. **Verificare și plată**: card / Apple Pay / Google Pay sau transfer bancar (IBAN afișat, comanda intră în „Așteptare plată”).

Clientul cu cont își ia actul, adresa și facturarea din cont; actul de
identitate se cere oricum la comandă (nu se ține în cont fără comandă).

## Cine lucrează și ce se generează

- **La plată, automat**: factura, contractul de prestări, **contractul de asistență juridică** și **împuternicirea avocațială** (fiecare cu număr din registrul Baroului Satu Mare, alocat abia după plată), emailul de confirmare cu linkul de status.
- **Din admin, la nevoie**: **cererea de eliberare** (doar cazier judiciar și cazier fiscal; se apasă „Generează” în „Procesare comandă”; se descarcă PDF sau Word ca s-o corectați înainte de depunere).
- **Cabinetul avocatei** (Tarța Ana-Gabriela) semnează împuternicirea și contractul de asistență și **depune fizic** toate cele patru acte: cazierul fiscal, cazierul judiciar (PF și PJ), cazierul auto și certificatul de integritate (confirmat de Raul, 21.09). Rolul „avocat” din admin vede doar comenzile cu avocat. Decontul e lunar, pe ambele site-uri, din tabul de decont.
- **Echipa** verifică actele, apasă statusurile, trimite scanul clientului, expediază originalul dacă a ales curier, ține legătura cu clientul.

## Statusurile, în ordinea în care le apăsați

| Când | Status | Butonul din „Procesare comandă” | Clientul vede |
|---|---|---|---|
| Plata a intrat | Plătită | **„Începe procesarea”** | „Plata a intrat. Pregătim documentele.” |
| Ați verificat actele și documentele sunt bune | În procesare | **„Marchează documente generate”** | „Lucrăm la comanda ta.” |
| Cererea a plecat la instituție | Documente generate → **Trimis instituție** | **„Marchează depusă la IPJ”** (același buton la ANAF / Poliția Rutieră) | „Dosarul este la instituție.” |
| A venit actul | Document primit | **„Marchează document primit”** (încărcați scanul aici; devine vizibil clientului) | „Am primit documentul de la instituție.” |
| Are traducere / legalizare / apostilă | La traducere → La legalizare → Apostilă Notari → Apostilă Haga | din dropdown-ul „Actualizează status” | „La traducere”, „Apostilă Haga obținută” |
| Totul e gata | Documentul este eliberat | **„Marchează gata de expediere”** | „Documentul este eliberat și urmează livrarea.” |
| Doar email | → Finalizată | emailul cu documentul pleacă singur | „Finalizată” |
| Curier | Expediată → Livrată → Finalizată | **„Generează AWB”** (apoi urmărirea e automată) | „Coletul este la curier.” |

Detalii pe fiecare status (inclusiv „Așteptare client”, „Anulare solicitată”)
în [Statusurile comenzii](../statusuri-comenzi.md).

## Problemele frecvente și ce faceți

| Situație | Ce faceți |
|---|---|
| Act expirat, selfie neclar, poză tăiată, verso lipsă | **„Solicită documente”** din cardul de documente: bifați ce lipsește + motivul; clientul primește email cu link, comanda intră singură în „Așteptare client” (termenul e pe pauză) și iese singură când a încărcat tot. Nu semnează și nu plătește din nou. |
| Numele din act arată „P<ROU” sau „IDROU” lipit | era o problemă de citire a zonei MRZ, reparată; dacă apare, corectați din „Salvează corecturile” pe cardul clientului. |
| Telefon greșit / fără prefix | corectați în admin („Salvează corecturile”); câmpul e cu prefix de țară din 18.09, comenzile vechi pot avea numere trunchiate. |
| Client PJ cu firmă suspendată | comanda trece; verificați că reprezentantul e cel din ANAF. Radiată / dizolvată: nu se poate comanda, clientul e blocat în formular. |
| PFA / II / ÎF vrea cazier „de firmă” | e cazier PF pe titular; formularul îl redirecționează. Dacă a plătit pe PJ, modificați comanda pe PF. |
| Clientul e în străinătate și vrea actul acolo | livrare internațională (Poșta 100 / DHL 250, urmărire pe parcelsapp, Poșta nu vede evenimentele din afara țării) + de regulă apostilă Haga și traducere. Prețul traducerii e **pe limbă**. |
| „Motivul solicitării” pe împuternicirea de apostilă | nu mai apare, e intenționat: prefectura apostilează indiferent de motiv. |
| Clientul întreabă unde e comanda | trimiteți **linkul de status** din admin („Copiază linkul de status”), acolo vede stadiul și primește email la fiecare pas. |
| Vrea să anuleze în primele 30 de minute | poate singur din pagina de status: primește 70%, reținem 30%. Vezi [Anulare în 30 min](../anulare-refund-70.md). |
| Vrea să adauge / să scoată o opțiune după plată | „Modifică” pe comandă: refund automat sau link de plată extra. Vezi [Modifică o comandă plătită](../modify-order.md). |
| A plătit prin transfer | tabul „Așteptare plată”: „Dovadă verificată — pornește lucrul” pe dovadă, „Confirmă plata” când intră banii. Vezi [Plata prin transfer bancar](../plata-transfer-bancar.md). |

## Ce îi spuneți clientului

- **Termen**: numărăm zile lucrătoare de la plată; urgența (1-2 zile) se poate adăuga și după plată prin „Modifică”. Cetățean străin: 7-15 zile, fără urgență.
- **Ce primește**: scanul pe email imediat ce îl avem; originalul prin curier doar dacă a ales curier.
- **Valabilitate**: cazier judiciar și integritate 6 luni, cazier fiscal 30 de zile. Clientul primește un email de reamintire înainte de expirare.
- **Cazier auto**: e fișa **șoferului** (permisul), nu istoricul mașinii. Nu cerem VIN sau număr de înmatriculare.
- **Nu suntem instituția**: obținem actul prin avocat, pe împuternicire; instituția îl eliberează. Clientul poate să-l ia și singur, gratuit, de la ghișeu sau din ghiseul.ro; noi vindem timpul și drumul.
- **Renunțare / refund**: în 30 de minute singur (70%); după, doar cu echipa, caz cu caz.

## Unde s-au schimbat lucrurile (istoric util)

- 14.08.2026: cazierul auto și integritatea nu mai au buton de cerere (produceau formularul greșit). Urgența la integritate a devenit 80 lei (era 100).
- 28.07.2026: cazier auto cu permis din străinătate (350 lei / 7-10 zile), numărul permisului nu se mai tastează.
- 12.08.2026: doar serviciile din lista „cu avocat” primesc contract de asistență și numere de Barou; anulările eliberează numerele înapoi.
- 20.08.2026: CNP-urile reale cu coduri de județ noi nu mai sunt respinse.
