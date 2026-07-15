# 2026-07-15 — Selfie UX pe toate platformele + îmbunătățiri liste admin

## 1. 🔴→🟣 Selfie-uri greșite: diagnoza + fix UX (eGhișeul + CJO + eCazier)

**Problema raportată de Raul:** „pozele selfie nu se încarcă corect pe toate platformele".

**Diagnoza (pe date reale, nu presupuneri):** upload-ul tehnic funcționa perfect (JPEG-uri valide în S3). Problema era UMANĂ, permisă de UX: clienții urcau poza greșită în slotul de selfie — dovadă: comanda E-260714-GDWBL avea ca selfie fișierul „CI TIBOR PUSKAS.jpeg" (poza buletinului!), plus „WhatsApp Image…" și poze de galerie din 2025. Notă: `kycValidation.selfie` cu confidence 0 + `manual_review_only` este BY DESIGN din 2026-06-09 (face-match AI scos intenționat — lent/nesigur) — nu era bug.

**Cauze pe platforme:**
- CJO/eCazier: inputul de selfie nu avea `capture` → pe telefon se deschidea galeria, nu camera.
- eGhișeul: avea `capture` static, dar accepta și PDF la selfie; pe desktop = file picker liber.
- Nicio platformă nu arăta un exemplu vizual la slotul de selfie (eGhișeul).

**Capcană evitată:** primul fix (capture static peste tot) ar fi STRICAT cazul legitim „soțul face selfie-ul și îl trimite soției care completează comanda" — pe iOS, `capture` static forțează camera și blochează complet galeria. Semnalat de Raul, corectat imediat.

**Fix-ul final (decizie Raul: FĂRĂ AI deocamdată, UX + măsurare):**
- **Două acțiuni explicite** la slotul de selfie: „📷 Fă selfie acum" (capture se setează per-click → camera frontală) și „Încarcă o poză existentă" (galeria — mereu disponibilă, pentru cazul soț/soție/părinte). Pe toate 3 platformele; pe CJO acoperă toate 3 sloturile (PF, cetățean străin, PJ).
- **Imagine-exemplu** pe eGhișeul (generată AI: selfie cu act GENERIC, text blurat — nu buletin real; `public/images/upload-guides/selfie-cu-act-exemplu.webp`, 35KB) cu **badge „EXEMPLU"** pe poză + titlul „Așa trebuie să arate poza ta" (fără etichetă, clienții puteau crede că poza e deja încărcată). CJO avea deja exemplu vizual.
- **Text explicit**: „Aplici pentru altcineva (soț/soție, părinte)? Încarcă selfie-ul ACELEI persoane cu actul ei." — pe toate platformele.
- eGhișeul: selfie acceptă doar imagini (PDF scos din accept).

**Commits:** eghiseul `04cfa45` + `e36b46d` + `7336729` + `3c24981`; CJO `87957e76` + `83e5f32d` (acoperă și eCazier — același Step3Documents multi-tenant).

### 📋 PLAN B dacă nu se îmbunătățește (~2 săptămâni de măsurare)

Echipa monitorizează la verificarea KYC dacă mai apar acte/poze random în slotul de selfie. **Dacă da → validare AI la upload:**
- La încărcarea selfie-ului, un call Gemini Flash: „e un selfie cu o față umană (ideal ținând un act)? sau e un document/altceva?" → dacă nu, mesaj pe loc: „Poza încărcată pare a fi un act, nu un selfie — te rugăm să încarci o poză cu fața ta."
- Cost: sub 1 ban/verificare. eGhișeul: infra Gemini există (document-ocr/KYC), ~1-2h. CJO/eCazier: de adăugat GOOGLE_AI_API_KEY + un endpoint mic, ~2-3h.
- De decis atunci: blocking strict sau cu fallback „continuă oricum" (anti-pierdere comenzi la false-positive).

## 2. 🟣 Liste comenzi admin — sweep pe toate platformele (cerințe Raul)

- **Telefonul clientului sub email**, direct în listă (eGhișeul `5daa3dc`; CJO+eCazier `94aae162` — coloana `phone` adăugată în selectCols).
- **eGhișeul: nr. contract asistență · nr. delegație sub numărul comenzii** (paritate CJO) — din `order_documents` (contract_asistenta + imputernicire), batch query în API-ul de listă.
- **eGhișeul: coloana AWB scoasă** din tabel (rămâne pe pagina comenzii); placeholder căutare actualizat.

## 3. 🟣 Extras plan cadastral: 89 lei + intern + UI asignări colaboratori

Migrarea 119: preț 89 (aliniat extras CF), scos de la topograf. Panou nou „Servicii alocate" în /admin/colaboratori (checkbox per serviciu, users.manage) + `POST /api/admin/collaborators/services` — asignările fără migrări. Commit `feb4859`.
