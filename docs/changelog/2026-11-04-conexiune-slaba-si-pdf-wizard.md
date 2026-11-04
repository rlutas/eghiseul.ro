# 04.11.2026 — Comanda nu se mai blochează la semnal slab; buletinul se poate trimite ca PDF
<!-- categorie: comenzi -->

## Pentru echipă

- Dacă un client rămânea pe „Se încarcă...” cu „Failed to fetch”, cauza era o conexiune slabă la trecerea între pași. Comanda nu ajungea în sistem, deci nu o găseați nicăieri.
- Acum pagina își revine singură când se întoarce semnalul, iar datele completate rămân. Clientul vede un mesaj în română și, la nevoie, butonul „Reîncarcă pagina”.
- Dacă salvarea eșuează, se reia automat. Clientul vede „Conexiune slabă. Reîncercăm automat.”
- În „Erori clienți” apar două tipuri noi: „Comandă nesalvată” și „Pas neîncărcat”, cu codul comenzii văzut de client. Așa puteți căuta un cod pe care „Comenzi” nu îl are.
- La pasul de acte, clienții pot încărca buletinul sau pașaportul ca PDF, până la 1,5 MB. Selfie-ul rămâne doar poză.
- Pe fișa comenzii, actul poate fi deci și PDF, ca la pasul de scanare a actului.
- Pe documentero, citirea automată a actului era refuzată de server, deci clienții completau datele de mână. Acum merge ca pe eghiseul.
- Numele foarte lungi nu mai sunt tăiate la citirea actului. Înainte, „ANDREEA-MĂDĂLINA” putea ieși „ANDREEA MADALIN”, pentru că banda de la baza actului are lățime fixă.

Detalii despre erori: [Credit Gemini și Erori clienți](../admin/credit-gemini-si-erori-clienti.md).

---

## Ce s-a întâmplat

Raport client, E-261104-SAQKA, pe telefon: „Eroare salvare”, „Failed to fetch”, spinner permanent la pasul 2. Comanda nu exista în DB, iar `client_error_log` nu acoperea salvarea și încărcarea modulelor.

## Cauze găsite

1. `modular-order-wizard.tsx` prindea eșecul `import()` al modulului și randa `StepLoading` la nesfârșit. Butonul „Reîncearcă” relua doar salvarea.
2. Reimportul nu ajută: pe build-ul de producție, chunk-ul eșuat rămâne reținut pe durata paginii și nu mai pleacă nicio cerere. Doar reîncărcarea paginii recuperează.
3. La reload, restaurarea din localStorage primea 404 pentru un draft nesalvat niciodată și ștergea singura copie a datelor. Acum șterge doar dacă `cacheData.orderId` există (draftul a existat pe server).
4. Salvarea afișa textul brut al browserului și nu avea timeout sau reîncercări.
5. `KYCDocumentsStep` oferea PDF în selectorul de fișiere, apoi îl refuza („Format invalid”). `PersonalDataStep` îl accepta deja.
6. La `/submit`, PDF-urile de identitate primeau cheie S3 `.jpg`, cu `Content-Type` corect. Cheile comenzilor vechi rămân neschimbate.

## Ce s-a schimbat

- `src/lib/wizard/module-load.ts`: timeout 25 s, reload automat o singură dată per pas și tab, după un `HEAD` reușit. Reload-ul propriu nu mai declanșează promptul `beforeunload`.
- `src/lib/wizard/save-failure.ts` + provider: reîncercări la 3, 8, 20 și 60 s, reluare la evenimentul `online`, timeout 20 s, `POST` direct pe `/api/orders/draft/` (fără 308).
- `src/lib/client-errors/report.ts`: coadă în `sessionStorage` (`queueClientError`, `flushQueuedClientErrors`), pentru că `sendBeacon` raportează succes și fără rețea.
- `src/lib/images/read-pdf-for-upload.ts`: PDF ≤ 1,5 MB, verificare `%PDF-`. Limita vine din autosave: toate documentele pleacă în base64 în același request, iar limita Vercel e 4,5 MB. Cel mai mare PDF pe comandă plătită în ultimele 120 de zile: 1,33 MB.

## Citirea datelor (OCR)

- `POST /api/ocr/extract` refuza originea `documentero.ro` cu 403: lista permisă avea doar eghiseul. Verificat pe live cu `curl`. Doar 1 din cele 13 comenzi documentero din DB are rezultate OCR.
- `correctNamesFromMrz` reconstruia numele din MRZ când acesta diferea de textul tipărit. MRZ-ul are lățime fixă, deci prenumele lung ajungea tăiat, fără cratimă și fără diacritice. Dacă MRZ-ul e doar începutul prenumelui tipărit, rămâne textul tipărit. Bug-ul nu ține de PDF.
- CJO are aceeași funcție în repo-ul său și nu e reparată aici.

Verificare cu Gemini real, pe 6 PDF-uri sintetice cu date inventate (card întreg, A4, față-verso, 2 pagini, rotit 90°, mic, gri și neclar): CNP, nume, prenume, serie și număr corecte pe toate 6, după fix. Înainte, prenumele lung era tăiat pe toate 6. Data nașterii citită greșit o dată (15.02 în loc de 15.03); formularul o ia din CNP când CNP-ul e valid.

Date reale, comenzi plătite eghiseul din ultimele 180 de zile, OCR comparat cu valoarea finală a comenzii:

| Act | Format | CNP | Nume | Prenume |
|---|---|---|---|---|
| CI față | PDF | 18/18 | 18/18 | 18/18 |
| CI față | poză | 103/105 | 104/105 | 105/105 |
| Pașaport | PDF | 4/4 | 3/4 | 4/4 |
| Pașaport | poză | 24/26 | 23/26 | 26/26 |

Valoarea finală poate fi chiar cea propusă de OCR, dacă clientul n-a corectat-o, deci tabelul e o limită superioară.

## Date PDF

- CJO/ecazier (acceptă PDF de la lansare): 146 din 1.044 comenzi din mai–noiembrie au actul în PDF, cam 14%.
- eghiseul: `client_error_log` există din 02.11 și are un singur refuz PDF, deci nu măsoară încă fenomenul.

## Teste

- Unit: 2.379+ teste trecute, inclusiv `module-load`, `save-failure`, `queue`, `read-pdf-for-upload`.
- Browser pe build de producție local, cu salvarea simulată: salvare eșuată + modul eșuat + revenire semnal; modul blocat permanent (mesaj, fără buclă, buton); PDF valid, prea mare, fals; selfie PDF refuzat.
- Neverificat: PDF la pasul Acte până la S3 și în admin. Drumul e același cu cel al PDF-urilor de la pasul de scanare.

## De verificat separat

E-261013-B3RQ8 și E-260929-BE4AB (finalizate) au documentul `ro_cei_reader_pdf` fără `s3Key` și fără `base64`.
