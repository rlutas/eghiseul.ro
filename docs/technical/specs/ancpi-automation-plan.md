# Plan: Automatizare ANCPI — Extras de Carte Funciară (coadă de stări + worker)

**Status:** ✅ **LIVE & FUNCȚIONAL A→Z (2026-06-16)** — comanda reală `E-260616-KAFEG` emisă 100% automat de worker-ul Railway: login OpenAM → validare imobil (CF 100015) → coș → checkout → comandă ePay `10057701` → `Finalizata/ADMIS` → descărcat `Extras_Informare_72368.pdf` + chitanță → atașat la comandă (`document_ready`) + email client. Fix-uri cheie: Dockerfile pin `playwright@1.48.0`; document id parsat din JSON HTML-encodat (`solutii[].idDocument`); stări soluție ADMIS/RESPINS; admin cu Reîncearcă/Copiază log/link ePay.

**Status (istoric):** 🟢 **Faza 1 + Faza 2 implementate (2026-06-15)** — coadă `ancpi_jobs` + creare job idempotentă la plată + API `/api/ancpi/{pending,result}` + livrare PDF (atașare la comandă + email). API ePay ANCPI **mapat A→Z prin recon live** (comandă reală de test emisă + descărcată). Rămâne **worker-ul `worker-ancpi/`** (Railway) + modulul de wizard. Comandă reală de test plasată + emisă + descărcată automat prin portalul ePay ANCPI: `Extras de carte funciară pentru informare online (preplătit)`, imobil Botoșani CF `50528-C1-U4`, **comanda ePay `10054451`, nr. înregistrare `69000`, status `Soluționată - ADMIS`, PDF `Extras_Informare_69000.pdf` (2 pagini) descărcat — totul în ~1 minut**. Worker-ul **NU e încă construit** — acest document e blueprint-ul complet de implementare. **Ultima actualizare:** 2026-06-15.

> **Model de referință:** worker-ul ONRC (`docs/technical/specs/onrc-automation-plan.md` + repo `worker-onrc/`). Replicăm exact tiparul (coadă de stări în eghiseul.ro + worker persistent pe Railway + livrare PDF la comandă), cu diferențele de portal documentate mai jos.

---

## 1. Rezumat & decizie produs

Un operator uman ia acum manual datele dintr-o comandă de **extras de carte funciară**, se loghează pe **ePay ANCPI** (`https://epay.ancpi.ro/epay`), caută imobilul, plătește din creditul preîncărcat (puncte), descarcă PDF-ul și îl livrează clientului. Înlocuim operatorul cu un **worker** identic conceptual cu cel ONRC.

**Verdict tehnic:** ✅ **Se poate complet prin HTTP** (cookie de sesiune + form POST + `EpayJsonInterceptor.action` JSON + `SearchEstate.action`/`DownloadFile.action`). NU e nevoie de Playwright pentru flux (doar, eventual, pentru seed-ul sesiunii / login — vezi §4).

**Scope (faza 1):**
- **Extras de carte funciară pentru informare** (prodId `14200` preplătit / `1420` la 20 lei) → **automatizabil** ✅
- **Extras din planul cadastral, pe ortofotoplan** (prodId `419`) → serviciu DB `extras-plan-cadastral` (79.99 RON) **operator-fulfilled** deocamdată (decizie produs); automatizabil ulterior prin același flux ePay 🟡
- **Identificare imobil după proprietar / adresă** → flux diferit (până la 5 zile, prin OCPI) → `NEEDS_OPERATOR` deocamdată ⏳
- **Extras CF colectivă** → ANCPI **NU eliberează online** extrase pentru CF colective (`NNNNN-Cx`) → `NEEDS_OPERATOR` ⏳

---

## 2. Arhitectură — ONRC vs ANCPI

| | ONRC (referință) | ANCPI ePay |
|---|---|---|
| Portal | `myportal.onrc.ro` (Angular SPA) | `epay.ancpi.ro/epay` (Struts 2 + AngularJS) |
| Auth | Keycloak, Bearer JWT (`grant_type=password`) | **OpenAM SSO** (`oassl.ancpi.ro/openam`) → **cookie de sesiune** (`iPlanetDirectoryPro` + `JSESSIONID`) |
| Backend | REST JSON `/api/v1` | Struts `*.action` + JSON via `EpayJsonInterceptor.action?reqType=...` |
| Model comandă | submit draft → pași → finalize+pay | **coș stateful** (`cartRegId`) → config imobil → checkout → confirm |
| Plată | wallet (LEI) | **puncte de credit** (preplătit, 1 punct/extras) |
| Async | da (poll retrieve) | da, dar **foarte rapid** (~1 min la testul live) |
| Livrare | PDF atașat la comandă (`order_documents`) | **identic** — PDF atașat la comandă, vizibil clientului |

> **Decizie de arhitectură (la fel ca ONRC):** worker-ul **NU rulează pe serverless** (Vercel). E un **worker persistent separat** (repo nou `worker-ancpi/`, deploy Railway) care interoghează eghiseul.ro printr-un API securizat. eghiseul.ro **NU rulează worker-ul** — doar expune coada și primește rezultatul.

---

## 3. Catalog produse (prodId-uri ePay) & prețuri

| prodId | Produs | Cost ePay | Cod serviciu |
|--------|--------|-----------|--------------|
| `1420` | Extras de carte funciară pentru informare online | 20 Lei | `EXI_ONLINE` |
| `14200` | Extras CF pentru informare online **(preplătit)** | **0 Lei / 1 punct** | `EXI_ONLINE` |
| `419` | Extras din planul cadastral, pe ortofotoplan | 15 Lei | — |
| `11421` | Extras CF informare (pachet 50 extrase) | 900 Lei | — |
| `11420` | Extras CF informare (pachet 100 extrase) | 1.800 Lei | — |

**Model de operare (ca walletul ONRC):** se cumpără pachet (50/100 extrase) → apoi se trag extrase „preplătit" (prodId `14200`, 1 punct/extras) din sold. La testul live soldul era 51 → 50 puncte după 1 extras.

⚠️ **Înainte de prima comandă reală:** contul ePay trebuie să aibă **puncte de credit suficiente** (1 punct/extras informare).

---

## 4. Autentificare (OpenAM SSO)

- Login form: `https://oassl.ancpi.ro/openam/UI/Login?module=SelfRegistration&goto=http%3A%2F%2Fepay.ancpi.ro%3A80%2Fepay%2FLogIn.action`
- Câmpuri: `Utilizator (Adresa email)` + `Parola` → POST OpenAM → setează cookie `iPlanetDirectoryPro` → redirect la `epay.ancpi.ro/epay/LogIn.action` (setează `JSESSIONID`).
- **Toate apelurile ulterioare** merg pe cookie-ul de sesiune (nu Bearer token).

**Strategie worker (de decis la implementare):**
- **Opțiunea A (recomandată inițial):** seed sesiune o dată din browser (Playwright `storageState.json`, ca fallback-ul ONRC), worker-ul refolosește cookie-urile; re-login automat la expirare.
- **Opțiunea B:** reproducere POST OpenAM headless (form login → captură `iPlanetDirectoryPro`). De testat dacă OpenAM nu cere pași suplimentari (CAPTCHA/OTP). Dacă apare CAPTCHA → fallback pe A.

Cont folosit la recon: `eghiseul@gmail.com` → **EDIGITALIZARE SRL** (CUI 49278701), `differentSolicitant` id `823250`.

---

## 5. Fluxul complet A→Z (endpoint-uri capturate live)

Toate sub `https://epay.ancpi.ro/epay/`. JSON-ul vine în forma `{"jsonResult":"<string JSON escapat>"}`.

### 5.0 Nomenclatoare
```
POST EpayJsonInterceptor.action   body: reqType=shoppingCartCompleteInformation
→ jsonResult.pNomenclatoareMap.judeteNom = [{id:10,value:"ALBA"},{id:74,value:"BOTOSANI"},...]
                              .tipDocumentNom = [{id:38,"Hotarare judecatoreasca"},...]
```
⚠️ **Două numerotări de județ:** dropdown-ul UI folosește index 0–41 (ALBA=0, BOTOSANI=6), dar API-ul folosește **ID-ul real din `judeteNom`** (ALBA=10, BOTOSANI=74). Worker-ul lucrează cu ID-urile reale.

### 5.1 Adăugare produs în coș
```
GET/POST AddToCartOrWishListFromPost.action
  ?random=<ts>&addToWishList=false&prodId=14200&wishListId=-1
   &urgencyValue=5000&secondaryProductsJson=&basketRowId=&productQtyModif=1
→ creează linia de coș, returnează cartRegId (ex: 21640687)
```

### 5.2 Nomenclator UAT (după județ)
```
POST EpayJsonInterceptor.action   body: reqType=nomenclatorUAT&countyId=74
→ jsonResult = [{id:35731,value:"Botosani"},{id:36006,value:"Dorohoi"},...]
```
(UAT-ul real Botoșani = id `35731`.)

### 5.3 Căutare / validare imobil în e-Terra ⭐ (piesa critică)
```
POST SearchEstate.action   body: identificator=50528-C1-U4&uat=35731&judet=74
→ jsonResult = [{
     countyId:"74", immovableId:"10691503", immovableTypeCode:"A",
     electronicIdentifier:"50528-C1-U4", previousCadNo:null, topographicNo:null,
     measureadArea:"77", legalArea:"64", status:"Activa",
     landBookType:{code:"I",catalogueCode:"LANDBOOK_TYPE"},  // I = individual; "C" = colectiv → nu se eliberează
     hasGraphics:false,
     address:"Judet:BOTOSANI, Uat:Botoșani, Loc:Botosani, Str:INDEPENDENŢEI, Nr:7, Bloc:A2, Etaj:2, Ap:8, ..."
  }]
```
- `immovableId` = ID-ul intern e-Terra al imobilului.
- **Caz greșit (identificator inexistent):** răspunsul NU e JSON, ci o **pagină HTML de eroare** („There has been an unexpected problem ... reference number"). → Worker tratează: răspuns ne-JSON **SAU** listă goală `[]` → **imobil negăsit → NEEDS_OPERATOR / cere corectură** (NU plătește).
- **Validare CF înainte de plată = chiar acest endpoint** — vezi §8 (integrare în wizard).

### 5.4 Validare + salvare configurație imobil (în linia de coș)
Două apeluri `EpayJsonInterceptor.action` (multipart form-data), ambele cu același `productMetadataJSON`:
```
1) reqType=validateCerereRGI                  + productMetadataJSON + basketId
2) reqType=saveProductMetadataForBasketItem   + productMetadataJSON
```
`productMetadataJSON` (model `metadateCerere`):
```json
{
  "basketId": 21640687, "productId": 14200, "metadataExists": false, "manufacturer": "ANCPI",
  "metadate": {
    "CF":   { "stringValues": ["50528-C1-U4"], "validators": {"required":"required"} },
    "CAD":  { "stringValues": ["50528-C1-U4"] },
    "TOPO": { "stringValues": [null] },
    "judet":{ "stringValue": "BOTOSANI", "bigDecimalValue": 74 },
    "uat":  { "stringValue": "Botosani", "bigDecimalValue": 35731 },
    "metodeLivrare": { "stringValue": "Electronic", "stringValues": ["Electronic"] },
    "differentSolicitant": { "stringValue": "823250", "stringValues": ["EDIGITALIZARE SRL, ,Salcamilor,nr. 2,Odoreu,447210,Romania"] },
    "electronicSignedDocs": { "booleanValue": true },
    "enableANCPIConversation": { "booleanValue": false },
    "singleUnit": { "booleanValue": false }
  }
}
```

### 5.5 Checkout → confirmare → plasare (form POST full-page, NU AJAX)
```
POST EditCartSubmit.action            (din butonul "Cumpără" / #continue-button → formValidate('formularEditCart',...))
   → pagina "CONFIRMAREA COMENZII" (deponent + coș + buton "Confirmă comanda")
POST CheckoutConfirmationSubmit.action  (din "Confirmă comanda" / #continue-button → formValidate('form1',...))
   → "Vă mulțumim... Pentru actualizări veți fi notificat pe e-mail." → comandă plasată, 1 punct consumat
```

### 5.6 Status comandă + descărcare PDF
```
(Istoric comenzi)   LogIn.action  → tabel cu Id comandă / Data / Stare / Total
                     Stări: In Asteptare → Receptionata → In curs de procesare → Finalizata
(Detalii comandă)   ShowOrderDetails.action?orderId=10054451  (click pe "Vizualizează"; navigarea directă cu GET e respinsă — necesită click/referer din istoric)
```
Pe pagina de detalii, când e `Finalizata`:
- **STAREA COMENZII:** `Finalizata`
- **Serviciu:** `Stare: Soluționată - ADMIS`, `Număr Înregistrare: 69000`, `Termen soluționare: <data>`
- **Soluții:** `Extras_Informare_69000.pdf` ← documentul livrabil
- **Documente Financiare:** `Chitanta ANCPI_11330011.pdf` (serie `ANCPI`, nr. `11330011`) ← chitanță/dovadă plată
- **Istoric:** Plată în curs → Recepționată → În curs (a primit nr. înregistrare) → Finalizată

**Download (link `downloadFile($event, typeD, idDocument, '')`):**
```
POST DownloadFile.action?typeD=4&id=48325457&source=&browser=chrome
→ PDF binary (Extras_Informare_69000.pdf — 2 pagini, PDF 1.5)
```
- `typeD=4` = document tip „soluție" (extrasul). Chitanța financiară folosește `typeD = docFinanciar.idTipDocument`.
- `id` = `idDocument` al fișierului (din pagina de detalii; ATENȚIE: e diferit de „Număr Înregistrare 69000" — id intern fișier `48325457`).

---

## 6. Maparea stărilor (worker)

| Stare ePay ANCPI | Acțiune worker |
|---|---|
| `In Asteptare` / `Plata in curs de procesare` | așteaptă (poll) |
| `Receptionata` | așteaptă (poll) |
| `In curs de procesare` | așteaptă (poll); capturează „Număr Înregistrare" |
| `Finalizata` + `Soluționată - ADMIS` | descarcă `Soluții` PDF → livrare → `DONE` |
| `Anulata` / `Plata refuzata` / respins | `FAILED` / `NEEDS_OPERATOR` |
| imobil negăsit / CF colectivă / `status != Activa` | `NEEDS_OPERATOR` (NU plătește) |

---

## 7. Design worker (replică ONRC)

### Faza 1 — Coadă de stări în eghiseul.ro
Tabelă dedicată `ancpi_jobs` (analog `onrc_jobs`), creată idempotent la **plata confirmată** (webhook Stripe + confirm-payment), citind `customer_data`:
```sql
CREATE TABLE ancpi_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','CHECKPOINT','AWAITING_DOCUMENT','NEEDS_OPERATOR','DONE','FAILED')),
  product_type text NOT NULL,          -- EXTRAS_CF | EXTRAS_PLAN_CADASTRAL | IDENTIFICARE_*
  prod_id text NOT NULL,               -- ex: 14200
  judet text, judet_id int,            -- ID real judeteNom (BOTOSANI=74)
  uat text, uat_id int,                -- ID nomenclatorUAT (Botosani=35731)
  identificator text,                  -- nr CF / cadastral / topo
  identificator_type text,             -- CF | CAD | TOPO
  immovable_id text,                   -- din SearchEstate (10691503)
  validated_address text,              -- adresa returnată de e-Terra (confirmare client)
  -- checkpoint anti-dublă-plată
  ancpi_cart_reg_id text,              -- cartRegId
  ancpi_order_id text,                 -- comanda ePay (10054451)
  ancpi_registration_number text,      -- nr înregistrare (69000)
  -- rezultat
  document_url text,                   -- S3 key PDF extras
  chitanta_url text,                   -- S3 key PDF chitanță (contabilitate)
  downloaded_at timestamptz,
  error_message text, retry_count int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz, locked_at timestamptz, awaiting_since timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ancpi_jobs_order_uidx ON ancpi_jobs(order_id);
CREATE INDEX ancpi_jobs_status_idx ON ancpi_jobs(status) WHERE status = 'PENDING';
```
⚠️ Claim atomic doar cu filtre `.eq/.is` (vezi `.claude/rules/database.md` — NU `.or()` pe UPDATE). Migrare cu `NOTIFY pgrst, 'reload schema';` + un `COMMENT ON COLUMN` real (vezi regula schema-cache).

### Faza 2 — API securizat în eghiseul.ro (`Bearer ANCPI_WORKER_SECRET`)
- `GET  /api/ancpi/pending` → 1 job `PENDING`, claim atomic → `PROCESSING`, returnează datele comenzii.
- `POST /api/ancpi/result` → `{ jobId, status, documentUrl?, chitantaUrl?, registrationNumber?, ancpiOrderId?, errorMessage? }`. Pe `DONE`: atașează PDF la comandă (`order_documents`, `visible_to_client`) + email client (Resend), **exact ca livrarea constatatorului ONRC** (`lib/onrc/deliver.ts` → analog `lib/ancpi/deliver.ts`).
- Checkpoint anti-dublă-plată: salvează `ancpi_cart_reg_id` / `ancpi_order_id` ÎNAINTE de confirmare; claim de submit cere `ancpi_order_id IS NULL`.

### Faza 3 — Worker (repo nou `worker-ancpi/`, Railway)
Stack: Node + TypeScript (+ Playwright DOAR pentru seed sesiune/login). Structură analog `worker-onrc`:
- `source-client.ts` (poll `/api/ancpi/pending`, scrie `/api/ancpi/result`)
- `ancpi/session.ts` (OpenAM login + cookie jar; storageState fallback)
- `ancpi/api.ts` — apeluri HTTP: `addToCart`, `nomenclatorUAT`, `searchEstate` (+ validare), `saveMetadata`, `editCartSubmit`, `checkoutConfirm`, `orderStatus`, `downloadFile`
- `storage.ts` (S3), `deliver`/raportare, `notify-slack.ts`, `index.ts` (buclă poll).

Reguli ferme (din ONRC):
- **Validare obligatorie înainte de plată:** `searchEstate` trebuie să întoarcă exact 1 imobil `Activa`, ne-colectiv, cu adresă; la mismatch/gol → `NEEDS_OPERATOR`, NU confirmă comanda.
- Anti-dublă-plată via checkpoint `ancpi_order_id IS NULL`; **nu reseta niciodată un job cu `ancpi_order_id`** (verifică în istoricul ePay întâi).
- Plata DOAR din puncte preplătite (botul nu atinge carduri).
- CAPTCHA/eroare neașteptată → `NEEDS_OPERATOR` + Slack.
- Deploy worker prin `git push` (NU „Redeploy" Railway) — lecție din ONRC.

---

## 8. Validare CF în wizard (anti-typo) — avantaj UX

Problema: clienții pot introduce greșit nr. CF. Soluția: **integrăm `SearchEstate.action` LIVE în wizard-ul de comandă** (proxy server-side în eghiseul.ro):
1. Client alege **Județ** (din `judeteNom`) → **UAT** (din `nomenclatorUAT`).
2. Scrie nr. CF / cadastral.
3. Server-side apelăm `SearchEstate` → arătăm **adresa reală găsită** (ex: „INDEPENDENŢEI nr.7, bl.A2, et.2, ap.8").
4. Client **confirmă vizual** „da, ăsta e imobilul meu" → abia apoi plătește.

Beneficii: typo-urile/CF inexistente prinse **înainte de plată**; CF colectivă & `status != Activa` detectate automat cu mesaj clar; mai puține comenzi pierdute → diferențiator UX față de concurență.

> Necesită credențiale ANCPI accesibile server-side pentru proxy-ul de validare (sesiune partajată cu worker-ul) — de decis la implementare dacă validarea live se face din eghiseul.ro sau e delegată unui mic endpoint pe worker.

---

## 9. Migrare formular (WPForms → platforma nouă)

Sursă: `wpforms-form-export-06-15-2026.json` — „Extras De Carte Funciara Online (eghiseul.ro)". Câmpuri relevante de portat în modulul nou de wizard:

| WPForms | Rol | Mapare API ANCPI |
|---|---|---|
| #67 `Alege Serviciul` | Extras CF / Plan Cadastral / Identificare proprietar / adresă | `prodId` (14200/419/…) |
| #84/#138 `Județul Imobilului` | județ | `judet` (ID `judeteNom`) |
| #141/#151+ `Localitatea / UAT` | UAT | `uat` (ID `nomenclatorUAT`) |
| #85/#139 `Număr de Carte Funciară` | identificator | `CF.stringValues[]` |
| #86/#142 `Număr Cadastral` | identificator | `CAD.stringValues[]` |
| #88/#140 `Număr Topografic (opțional)` | identificator | `TOPO.stringValues[]` |
| #89 `Motivul Solicitării (opțional)` | motiv | (opțional) |
| #103 `Adresa Imobilului` | adresă | confirmare/validare |
| #149 `Adaugă un Extras` | multi-imobil | mai multe linii coș (max ~25/comandă, **același județ**) |
| #98/#110 `Serviciu Urgență` | add-on | (urgency ePay — de verificat) |
| #74/#113 `CUI / CNP`, #133 `Adresă Facturare` | facturare | Oblio (ca restul platformei) |
| #79 termeni, #76 WhatsApp | consimțământ/livrare | audit + canal |

⚠️ Reguli ANCPI de respectat în wizard:
- **O comandă = un singur județ** pentru toate imobilele.
- Recomandat **max 25 extrase/comandă**.
- CF **colectivă** (`NNNNN-Cx`) → nu se eliberează online (mesaj + operator).

Prețuri site curente (din sprint extras-carte-funciara): Extras CF 79,99 RON; Plan Cadastral 79,99 RON; Colectivă 169,99 RON; Identificare 249,99 RON; add-on Urgență +19,99 / Colectiv +29,99 / Extras suplimentar +49,99.

---

## 10. Livrare (identic cu constatatorul ONRC)

PDF-ul `Extras_Informare_<nr>.pdf` se atașează la comandă în `order_documents` (`visible_to_client=true`, tip ex. `extras-carte-funciara`), comanda trece pe `document_ready`, email client (Resend), idempotent — **exact ca `lib/onrc/deliver.ts`**. Chitanța ANCPI se păstrează separat pentru contabilitate (analog notei de calcul ONRC).

---

## 11. De făcut (TODO implementare)

**✅ Faza 1 + Faza 2 — DONE (2026-06-15):**
- ✅ Migrare `065_ancpi_jobs_queue.sql` (`ancpi_jobs` + `ancpi_job_events`) — rulată în producție, schema cache OK.
- ✅ `lib/ancpi/ensure-ancpi-job.ts` — creare job idempotentă la plata confirmată; cablat în webhook Stripe + `confirm-payment` (2 call-site-uri), lângă `ensureOnrcJob`.
- ✅ `GET /api/ancpi/pending` (claim atomic PENDING→PROCESSING, doar filtre `.eq/.is`; reaper PROCESSING; retrieve AWAITING_DOCUMENT throttled; auto-retry FAILED fără `ancpi_order_id`).
- ✅ `POST /api/ancpi/result` (CHECKPOINT/AWAITING_DOCUMENT/DONE/FAILED/NEEDS_OPERATOR) + `lib/ancpi/deliver.ts` (atașează PDF extras + chitanță la comandă, `document_ready`, email client) + `lib/ancpi/log-event.ts`.
- ⚠️ **De setat `ANCPI_WORKER_SECRET` în Vercel** (header `Authorization: Bearer` între eghiseul.ro și worker) — analog `ONRC_WORKER_SECRET`.

**🟡 Worker schelet — DONE (2026-06-15):** repo `/Users/raul/Projects/worker-ancpi/` creat (oglindă `worker-onrc`), typecheck curat. Conține: `config`, `source-client` (contract `/api/ancpi/*`), `ancpi/session.ts` (login OpenAM → storageState → APIRequestContext), `ancpi/api.ts` (toate apelurile din §5), `process-order.ts` (submit + retrieve + checkpoint anti-dublă-plată), `index.ts` (poll loop), `seed-session.ts`, `dry-run.ts`. **Apelurile JSON (nomenclatoare, SearchEstate, DownloadFile) = confirmate; rămân de verificat LIVE (marcate `TODO(live)`):** selectorii login OpenAM, câmpurile form `EditCartSubmit`/`CheckoutConfirmationSubmit`, parsarea HTML `ShowOrderDetails`.

**✅ Serviciu + wizard + admin — DONE (2026-06-16):**
- ✅ Wizard CF **există deja** (`src/components/orders/modules/property/PropertyDataStep.tsx` → `customer_data.property`); contractul aliniat cu worker-ul. `ensure-ancpi-job.ts` citește `customer_data.property` și rezolvă `judetId` prin `src/lib/ancpi/judete.ts` (cele 42 ID-uri ANCPI); worker-ul rezolvă `uatId` din numele localității la runtime (`nomenclatorUAT`).
- ✅ Config serviciu `extras-carte-funciara` aliniat la flux automat cfunciara-style (migrarea `066`): `personalKyc.enabled=false`, `requires_kyc=false`, `estimated_days=1`, descriere „în câteva minute", preț 79.99 RON (sub cfunciara). **Decizie produs:** v1 = doar Extras CF automat; plan cadastral / colectivă / identificare → operator.
- ✅ Admin `/admin/ancpi` (`page.tsx` + `AncpiManualUpload.tsx`) + ruta `POST /api/admin/orders/[id]/ancpi-upload` (upload manual pt. NEEDS_OPERATOR/FAILED) + link în meniul admin.

**✅ Urgență + multi-imobil — DONE (2026-06-16, migrarea `067`):**
- **Urgență scoasă:** opțiunea `urgenta` (99 RON) dezactivată pentru serviciu — emitere automată ~minute 24/7, „standardul" e deja instant. Price sidebar afișează „câteva minute (24/7)" + `SystemStatus` (ANCPI) pentru extras CF.
- **„Adaugă un extras" (multi-imobil):** opțiune `extras_suplimentar` (49,99 RON, per_item, ascunsă din toggle-uri). `PropertyState.additionalImobile[]` (același județ, max 24). `PropertyDataStep` are UI add/remove + dropdown UAT per imobil + **sincronizează automat cantitatea opțiunii** în `selectedOptions` (preț live). `ensure-ancpi-job` construiește `detail.imobile[]` = principal + suplimentare. **Worker** validează TOATE imobilele întâi (orice invalid → operator, fără plasare parțială), adaugă câte o linie în coș per imobil, plasează o singură comandă, descarcă **toate** PDF-urile (`extrasDocIds[]`) și le livrează (`documentUrls[]`); `deliver` atașează fiecare PDF la comandă.

**⏳ Rămas (necesită credențiale ANCPI + rulare):**
1. ☐ Verificare LIVE worker (`HEADLESS=false npm run login` → `npm run dry-run` → 1 comandă reală pe staging) — confirmă cele 3 `TODO(live)` (login OpenAM, form checkout, parsare ShowOrderDetails).
2. ☐ Deploy worker pe Railway (git push) + env (`ANCPI_USERNAME/PASSWORD`, `ANCPI_SOLICITANT_ID/LABEL`, `ANCPI_WORKER_SECRET`, `AWS_*`, `SOURCE_API_URL`).
3. ☐ Alimentare puncte credit ANCPI.
4. ✅ **UAT dropdown — DONE (2026-06-16):** nomenclator complet (42 județe, 3185 UAT-uri) extras din WPForms în `src/lib/ancpi/uat-nomenclator.json` (cheiat pe județ normalizat, verificat că se potrivește cu ANCPI). `PropertyDataStep` are acum dropdown UAT dependent de județ (se golește la schimbarea județului). Worker-ul rezolvă `uatId` din nume la runtime.
2. ☐ Decide strategia de sesiune OpenAM (seed storageState vs login headless) — testează dacă apare CAPTCHA/OTP.
3. ☐ Validare live CF în wizard (`SearchEstate` proxy) — §8.
4. ☐ Modul wizard „extras-carte-funciară" (migrare WPForms §9) care populează `customer_data.carteFunciara` (vezi shape în `ensure-ancpi-job.ts`) + facturare Oblio.
5. ☐ Admin `/admin/ancpi` (read-only + upload manual pt. `NEEDS_OPERATOR`, ca `/admin/onrc`).
6. ☐ Pagină „Stare sistem" + heartbeat worker `ancpi_worker` (deja scris în `/api/ancpi/pending`).
7. ☐ Alimentare puncte credit ANCPI + 1 comandă reală end-to-end pe staging.

### Forma `customer_data.carteFunciara` (contract wizard ↔ worker)
```json
{
  "serviceType": "extras-cf | plan-cadastral | identificare-proprietar | identificare-adresa",
  "imobile": [
    { "judet": "BOTOSANI", "judetId": 74, "uat": "Botosani", "uatId": 35731,
      "identificator": "50528-C1-U4", "identificatorType": "CF",
      "immovableId": "10691503", "validatedAddress": "Str:INDEPENDENŢEI nr.7..." }
  ],
  "urgent": false, "ownerName": null, "address": null
}
```
`ensure-ancpi-job.ts` acceptă și o formă plată (un singur imobil cu câmpuri la rădăcină) pentru compatibilitate. Mapare serviceType→prodId în helper (extras-cf→14200 preplătit, plan-cadastral→419).

---

## 11b. Live deploy + teste reale (2026-06-16)

**Deploy:** platforma Next.js rulează pe **`eghiseul-ro.vercel.app`** (NU `eghiseul.ro`, care e încă WordPress-ul vechi). Worker `worker-ancpi` deployat pe **Railway** (proiect `worker-ancpi`), repo `github.com/rlutas/worker-ancpi`, polling `eghiseul-ro.vercel.app` la 60s. `ANCPI_WORKER_SECRET` în Vercel + Railway.

**Dry-run live confirmat:** login OpenAM **headless** merge; nomenclatoare OK; `searchEstate(50528-C1-U4) → immovableId 10691503, Activă`. Cele mai riscante părți (auth + e-Terra) funcționează. Rămân de confirmat la prima comandă reală: `EditCartSubmit`/`CheckoutConfirmationSubmit` + parsarea `ShowOrderDetails` (protejate de `placeOrder` care cere un ID de comandă NOU — altfel aruncă, fără livrare greșită).

**Bug reparat — sesiunea ePay expiră (~30 min):** `ensureLoggedIn()` (probe + re-login per job) + `searchEstate` distinge pagina de login (`SESSION_EXPIRED`) de „not found" + `processJob` reîncearcă o dată după refresh. Esențial pentru worker long-running.

**Test validare (variant C) pe comenzi reale (ePay SearchEstate):** 29/38 (76%) găsite+active în ~1,9s avg (p95 ~4s); restul typo-uri client / inactive. Maparea județ→UAT 100%.

**Reguli de input CF (non-blocant) — `src/lib/ancpi/cf-format.ts`:** validează identificatorul electronic (`12783` teren / `123456-C1-U2` apartament); avertizează la:
- **colectivă** `123456-C1` (construcția întreagă) → **emitem pe teren `123456`** + warning (decizie produs; `effectiveIdentifier` aplicat în `ensure-ancpi-job`);
- **format vechi** (`/`, titlu, top) → „CF nedigitalizat, nu se eliberează instant";
- **suspect** → „verifică numărul".
Testat pe 19.528 CF reale: 89% valid, 4% format vechi, 7% suspect. **Decizie: nu blocăm niciodată comanda — doar avertizăm.** Hint inline (verde/ambră) sub câmpuri în `PropertyDataStep`.

**Status sistem service-aware:** `/api/status?service=ancpi|onrc` → portal corect (`Portal ANCPI` vs `Portal ONRC`) + heartbeat worker. `SystemStatus` are prop `service`. Cardul „Timp estimat livrare" e ascuns la serviciile instant-digitale (constatator + CF) — rămâne doar caseta de status.

**Date de test reale:** Botoșani / Botoșani / CF `50528-C1-U4` (immovableId 10691503).

## 11c. Fără documente avocațiale (ca la constatator)

Extras carte funciară e serviciu **fără implicare avocațială** → la submit NU se generează **contract de asistență juridică**, **împuternicire avocațială**, **cerere** și NU se alocă **număr de Barou** (delegație). `lib/documents/auto-generate.ts`: slug-ul e în `NO_LAWYER_SERVICES` (`certificat-constatator`, `extras-carte-funciara` — atenție: slug DB e fără „de") → se generează doar `contract-prestari`; `delegationItems = []` pentru aceste servicii. (Bug reparat 2026-06-16: lista folosea greșit `extras-de-carte-funciara`, deci CF primea contract de asistență.)

## 11d. Identificare imobil după adresă (serviciu nou, 198 RON)

Serviciu pentru clienții care **nu știu numărul CF** — îl aflăm din adresă (+ nume proprietar). Model **operator + asistent geoportal**.

**Cum funcționează (validat live):**
- `GET /api/ancpi/lookup?address=&judet=&localitate=` → **geocode** (Esri World, Stereo70) → **query spațial** pe geoportalul ANCPI (`MapServer/1/query`, intersects, buffer 25m, 8 retry) → `NATIONAL_CADASTRAL_REFERENCE` = **numărul de carte funciară** + `IMMOVABLE_ID`.
- ⚠️ `NATIONAL_CADASTRAL_REFERENCE` = **nr. CF** (confirmat vs extras real: 106395 = „Carte Funciară Nr. 106395"), NU nr. cadastral (ăla e 4265).
- ⚠️ **Geoportalul ANCPI e foarte flaky** (valuri de 502) → endpoint-ul are AbortController 4s/încercare + 6-8 retry + `maxDuration=30`. Când e sus, găsește; în valuri proaste, „ancpi_unavailable" → reîncercare.
- ⚠️ La **apartamente**, punctul găsește **parcela/blocul** (CF-ul terenului/construcției), nu unitatea → punct de plecare pentru investigare manuală.
- ⚠️ Imobil **neînscris în CF** → nu se identifică; căutăm date utile prin alte surse.

**Admin:** `/admin/identifica-imobil` — operatorul introduce județ/localitate/adresă → rulează lookup-ul cu retry → afișează CF/parcela + adresa geocodată. Pe comanda de identificare, operatorul confirmă/cercetează și livrează (+ extras CF după identificare).

**Validat pe cazuri reale:** Odoreu/Salcâmilor 2 → CF 106395 ✓; Paul Greceanu 13 București (apt) → parcela CF 231817 ✓ (când ANCPI e sus). Apartamente/rural → uneori doar parcela sau ANCPI indisponibil → operator.

**Căutare după PROPRIETAR — DOAR MANUAL (NU automatizat):** `rp.ancpi.ro/owner-registry` (Registrul Proprietarilor, prin avocat) permite căutarea după nume proprietar. ⚠️ **Termenii rp.ancpi.ro interzic explicit** uzul comercial, extragerea automată și accesul în afara interfeței (§4-5), cu monitorizare + revocare + sancțiune (§6-7). **NU automatizăm rp.ancpi.ro.** Operatorul/avocatul îl folosește **manual prin interfață** dacă geoportalul nu e suficient — în admin există doar un LINK către rp.ancpi.ro (nu extragere). Canalul comercial automat legitim rămâne **ePay** (plătit, oficial).

**Fișiere:** `src/app/api/ancpi/lookup/route.ts`, `src/app/admin/identifica-imobil/{page,IdentificaImobilTool}.tsx`. Serviciu DB `identificare-imobil` (198 RON) — **ACTIV**. Wizard customer: `PropertyDataStep` validează **address-only** când `identificationService.enabled` (tab Adresă default; CF/cadastral opționale); facturare PF/PJ fără KYC (CNP opțional, ca CF); pasul Livrare sărit (digital/email); fără ancpi_job (operator-fulfilled, NU prin worker). Operatorul folosește unealta `/admin/identifica-imobil` + livrează manual (admin upload).

## 12. Dovezi recon (2026-06-15)

- Cont: EDIGITALIZARE SRL, 51→50 puncte după test.
- Comandă test: ePay `10054451`, imobil Botoșani CF `50528-C1-U4` (immovableId `10691503`), nr. înregistrare `69000`, `Soluționată - ADMIS`.
- PDF: `Extras_Informare_69000.pdf` (91 KB, 2 pagini) descărcat via `DownloadFile.action?typeD=4&id=48325457`.
- Chitanță: `Chitanta ANCPI_11330011.pdf`.
- Toate endpoint-urile din §5 capturate prin trafic live (Playwright network capture).

## 13. Recon MANUAL rp.ancpi.ro (Registrul Proprietarilor) — DOAR documentare câmpuri

> ⚠️ **NU automatizăm rp.ancpi.ro** (ToS §4-7 interzic uz comercial / extragere automată / acces în afara interfeței — vezi §11). Acest recon este **strict manual**, făcut de operator/avocat **logat în interfață**, doar ca să documentăm ce câmpuri de căutare și ce date returnează — pentru a ști când serviciul `identificare-imobil` poate fi rezolvat prin Registrul Proprietarilor (căutare după PROPRIETAR), nu prin geoportal (căutare după adresă/parcelă).
>
> **De ce manual:** căutarea după nume proprietar NU e expusă de geoportal (care merge după geometrie/adresă). rp.ancpi.ro o oferă, dar numai prin login avocat și numai manual. Operatorul deschide linkul din `/admin/identifica-imobil`, caută manual, copiază rezultatul în comandă.

### Checklist de completat (când ești logat în rp.ancpi.ro)

Completează tabelele de mai jos pe baza interfeței reale (nu prin captură de trafic — doar observare vizuală a formularului):

**A. Formular de căutare — ce câmpuri de input are:**

| Câmp | Tip (text / select / etc.) | Obligatoriu? | Observații (validări, format) |
|---|---|---|---|
| Nume proprietar | | | |
| Prenume proprietar | | | |
| CNP / CUI | | | |
| Județ | | | |
| Localitate / UAT | | | |
| Tip persoană (PF/PJ) | | | |
| _(alte câmpuri văzute)_ | | | |

**B. Rezultate căutare — ce coloane/date afișează lista:**

| Coloană rezultat | Conținut (ex.) | Util pentru identificare imobil? |
|---|---|---|
| Nr. carte funciară | | |
| Nr. cadastral | | |
| Județ / localitate | | |
| Adresă imobil | | |
| Cotă / tip drept | | |
| _(alte coloane)_ | | |

**C. Limitări observate:**
- Câte rezultate maxim returnează o căutare? ____
- Caută pe toată țara sau doar pe județul selectat? ____
- Necesită cotă/puncte sau plată per căutare? ____
- Mesaje de eroare / restricții văzute: ____

**D. Workflow operator (de confirmat):** comandă `identificare-imobil` cu doar adresă → operator încearcă întâi geoportal (`/admin/identifica-imobil`); dacă nu e suficient și are nume proprietar → caută MANUAL în rp.ancpi.ro → copiază nr. CF/cadastral în comandă → eliberează extrasul prin ePay (canalul automat legitim).

> **Status:** șablon de recon — de completat de Raul când e logat. Nu există automatizare planificată pentru rp.ancpi.ro.
