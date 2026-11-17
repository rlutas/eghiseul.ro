# 17.11.2026 — „Predat autorităților” la stare civilă; nume greșit din pașaport; linkul de continuare de pe cazierjudiciaronline
<!-- categorie: documente -->

## Pentru echipă

Trei rapoarte din Ghid, rezolvate:

- **Stare civilă: opțiune nouă „Predat autorităților”.** La „Vechiul certificat mi-a fost” clientul alege acum între „Pierdut” și „Predat autorităților” (la celibat rămân și „Distrus”, „Furat”). Pe cererea de duplicat de naștere sau de căsătorie apare ce a ales: „PIERDUT” sau „PREDAT ÎN ORIGINAL AUTORITĂȚILOR”. Câmpul nu mai vine bifat din oficiu pe „Pierdut”, deci clientul trebuie să aleagă. Merge la fel pe eghiseul.ro și pe documentero.ro. Comenzile deja plasate rămân pe „Pierdut”; dacă una dintre ele are nevoie de „Predat autorităților”, scrieți-i lui Raul numărul comenzii.
- **Nume cu „MOLDAVA” în față (E-261111-JUZ6Z).** Sistemul a lipit „MOLDAVA” în fața numelui de familie de pe pașaport (exemplu cu nume schimbat: MUNTEANU devenea MOLDAVAMUNTEANU), luând „Republica Moldova” de pe pagina de lângă. Nu se mai întâmplă: numele citit de pe act nu mai primește text în față. Pe comanda aceasta numele a rămas greșit pe contract, împuternicire și factură. Verificați-le și corectați numele din pagina comenzii.
- **cazierjudiciaronline: linkul de continuare deschidea formularul de cazier judiciar** și la abandonurile de cazier auto, cazier fiscal sau certificat de integritate. Acum linkul din Abandonuri, cel din pagina comenzii și cele din emailurile de recuperare deschid formularul serviciului comenzii. Linkurile vechi, deja trimise, duc și ele clientul pe formularul corect.

Raportul din 03.11 cu extrasul de carte funciară colectivă (cost 20 lei în loc de 0) era deja rezolvat: comenzile din 27.10 și 03.11 au costul 0.

Rămâne deschis raportul E-261031-68SFJ (cost intern 75 lei, nu 60): vezi mai jos.

**Erori clienți, ultimele 7 zile:** cele 3 erori de CNP de azi (2 pe documentero, 1 pe cazierjudiciaronline) au fost greșeli de tastare, corectate de client pe loc; nu e un defect. Toate celelalte comenzi cu erori în listă au fost plătite. Comanda E-261117-DEGWF (certificat de celibat, 798 lei) s-a oprit înainte de plată: merită un telefon.

---

## Rezumat tehnic

### 1. „Predat autorităților”

- `CivilStatusState.oldCertificateReason` acceptă `predat_autoritati`.
- `CivilStatusStep.tsx`: opțiunea nouă pe toate tipurile de act; pre-selectarea lui `pierdut` (din 24.07.2026) a fost scoasă, fiindcă declara o pierdere pe care clientul nu o afirmase.
- Șabloanele `certificat-nastere/cerere-eliberare-pf.docx` și `certificat-casatorie/cerere-eliberare-pf.docx` aveau „PIERDUT” ca text fix. Acum au `{{MOTIV_CERTIFICAT_VECHI}}`, completat de `buildMotivCertificatVechi()` din `generator.ts` (`client.old_certificate_reason`, trimis din `auto-generate.ts` și din ruta `generate-document`).
- Formularul oficial tipărește doar „furat/distrus/pierdut în următoarele împrejurări”. Textul „PREDAT ÎN ORIGINAL AUTORITĂȚILOR” intră la împrejurări.
- Eticheta din pagina comenzii: `CIVIL_STATUS_VALUE_LABELS`.
- Test: `tests/unit/lib/documents/motiv-certificat-vechi.test.ts`.

### 2. Text inventat în MRZ

- Exemplele folosesc un nume schimbat. MRZ-ul real: `PEROUMUNTEANU<<ANDREI…`. Modelul a întors `P<ROUMOLDAVAMUNTEANU<<<<ANDREI…` (53 de caractere), iar `correctNamesFromMrz` a rescris numele citit corect de pe act.
- Regulă nouă în `correctNamesFromMrz`: dacă numele tipărit este sfârșitul numelui din MRZ, lipit de alte litere în față, rămâne numele tipărit. Un nume dublu real are separator în MRZ și nu e atins. CJO avea deja regula echivalentă.
- Lungimea liniei nu poate fi criteriul: modelul întoarce des linii reale mai lungi de 44 de caractere (prefix repetat, umplutură în plus), acoperite de testele existente.
- Teste noi în `tests/unit/lib/services/document-ocr-passport-name-prefix.test.ts`.

### 3. Linkul de continuare CJO (repo `cazierjudiciaronline.com`)

- Cauza: `buildRecoveryUrl()` și cele două linkuri din `cron/abandonment` duceau mereu pe `/` (formularul de cazier judiciar), indiferent de `service_type`. Confirmat pe CAO-20261116-66355: sesiune `cazier-auto`, link spre `/`.
- `recoveryFormPath(source, serviceType)` alege pagina formularului pe site și serviciu; `buildRecoveryUrl` o folosește în admin și în emailuri.
- `OrderForm`: dacă sesiunea e a altui serviciu decât formularul, linkul redirecționează pe formularul corect; un token rămas în `sessionStorage` de pe altă pagină e ignorat.

### 4. Rămas deschis: E-261031-68SFJ

Colaboratorul a înregistrat la depunere „Cost eliberare: 75,00 lei” (istoric, 03.11.2026), dar rândul de cost nu mai există pe comandă, iar tariful precompletat pentru actualizarea adresei este 60 lei. De decis: se repune costul de 75 lei și, dacă 75 e tariful curent, se schimbă precompletarea din Setări → Servicii.

### 5. Erori clienți, 10–17.11 (verificare, fără modificări de cod)

| Site | Eroare | Câte | Ce a fost |
|---|---|---|---|
| documentero | CNP: lungime, apoi cifră de control | 2 | aceeași comandă (E-261117-DEGWF), tastare manuală; CNP-ul final e valid; comanda s-a oprit la plată |
| cazierjudiciaronline | CNP: lungime, la ieșirea din câmp | 3 | 11.11, 13.11, 17.11; câmpul nu are `maxLength`, deci nu e tăierea la lipire din 09.11; sesiunea din 17.11 a trecut la pasul următor cu 13 cifre |
| eghiseul | OCR eșuat pe pașaport PDF | 3 | aceeași comandă (E-261112-7A93Y), plătită |
| eghiseul | salvare eșuată, HTTP 500 | 1 | E-261113-B2RLT, plătită și finalizată |
| documentero | salvare eșuată, rețea / timeout | 2 | E-261111-EMRB4, plătită |
| eghiseul | selfie identic cu actul | 1 | blocaj corect; E-261116-JSFZ3, plătită |
| cazierjudiciaronline | poză HEIC prea mare | 1 | blocaj corect |

### 6. Verificări după publicare

- CJO: linkul vechi al sesiunii CAO-20261116-66355 (`/?recover=…`) redirecționează pe `/cazier-auto-online`. Paginile țintă răspund 200, inclusiv `ecazier.ro/cazier-auto` și `/cazier-fiscal`.
- CAO-20261116-06023 nu există în baza CJO sub acest număr (nici comandă, nici sesiune), deci nu a putut fi verificat direct; cauza e aceeași.
- Cererile de stare civilă se generează din șabloanele din repo; nu există variantă încărcată din admin care să le înlocuiască.
- DNS: `openai-business-claim.eghiseul.ro` TXT adăugat în Vercel pentru verificarea profilului din ChatGPT Business Hub; răspunde la interogare.
