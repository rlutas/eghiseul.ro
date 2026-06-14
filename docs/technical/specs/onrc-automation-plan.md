# Plan: Automatizare ONRC (coadă de stări + bot)

**Status:** ✅ **A→Z FUNCȚIONAL prin API** (submit + plată + retrieve + livrare). **Ultima actualizare:** 2026-06-14.
**Context:** vezi și `/Users/raul/.claude/plans/este-posibil-sa-construiesc-tidy-stallman.md` (handoff-ul original al botului). Flux DOM live: `worker-onrc/ONRC-FLOW.md`.

Un operator uman ia acum manual datele dintr-o comandă de **certificat constatator** / **furnizare informații**, aplică pe portalul **ONRC RECOM** (https://myportal.onrc.ro), plătește din creditul preîncărcat, descarcă PDF-ul și îl livrează clientului. Înlocuim operatorul cu un **bot de browser automation**, în 3 faze.

---

## ✅✅ A→Z FUNCȚIONAL prin API — submit autonom + livrare (2026-06-14)

**Comanda de test E-260614-UKM7K livrată complet, fără browser:** submit + plată ONRC prin **REST API** (Id cerere 20262192474, RC 2381989, 30 LEI din credit), ONRC a emis documentul (+ email de la ONRC), workerul l-a luat prin API, l-a urcat în S3 și l-a **atașat comenzii** (vizibil clientului), comanda pe `document_ready`, email trimis clientului.

- **Submit prin API** (fără browser): `worker-onrc/src/onrc/api-submit.ts` — `submitViaApi(job)`: creare draft (=GDPR), pașii 2-5, căutare firmă RECOM + validare nume, reportType+purpose din nomenclatoare, finalizare + plată wallet. Blueprint complet: `worker-onrc/ONRC-API-SUBMIT.md`. Validat dry-run (create+pași) + executat real (finalize+pay).
- **Retrieve prin API**: `worker-onrc/src/onrc/api.ts` (token Keycloak/sesiune, summary + opis + download).
- **Token**: password grant (dacă parola e corectă) sau fallback pe sesiunea de browser (`storageState.json`).

### Scope (decizie produs)
- **Certificat Constatator pe Firmă (de bază)** → **automat prin API** ✅
- **cu Istoric** → **manual deocamdată** (mai scump; implementăm mai târziu) → worker-ul îl trece `NEEDS_OPERATOR`.
- **Persoană Fizică** → **flux diferit** (solicitantul trebuie să fi fost administrator) → `NEEDS_OPERATOR` deocamdată.

### Token & headless (rezolvat 2026-06-14)
- **Password grant Keycloak MERGE** → token direct (`frontoffice-app`, grant `password`), TTL 2h.
  **Submit + retrieve rulează 100% headless, FĂRĂ browser.** (Fallback pe sesiune rămâne, dar nu mai e necesar.)
- ⚠️ **Parola conține `#`** → în `.env` trebuie **între ghilimele** (`ONRC_PASSWORD='...'`), altfel dotenv o taie la `#`.
  În **Railway** se pune **fără ghilimele** (injectează valoarea brută).

### Deploy & operare
- Worker pe GitHub: **`github.com/rlutas/worker-onrc`** (privat). Deploy pe **Railway** (Dockerfile + railway.json).
- Env Railway: `SOURCE_API_URL=https://eghiseul-ro.vercel.app`, `ONRC_WORKER_SECRET` (= cel din Vercel),
  `ONRC_USERNAME`, `ONRC_PASSWORD` (fără ghilimele), `AWS_*`, `HEADLESS=true`, `POLL_INTERVAL_MS=30000`.
  ⚠️ Parola ONRC NU se pune în Vercel — doar în worker (Railway).
- **Pagină „Stare sistem"**: `/api/status` (ONRC reachable + worker heartbeat <2 min) + componenta pe pagina
  constatator. Workerul scrie heartbeat la fiecare poll în `/api/onrc/pending` (migrarea 058 `system_heartbeats`).

### Prețuri (2026-06-14)
- de bază (firma) + PF: **79 RON** (de la 119,99) · cu istoric: **487 RON** (de la 499,99). Aliniat la competitor.

### Cunoscut / făcut
- ~~Preview PDF în admin~~ ✅ **reparat** (PDF-urile se servesc inline, fără conversie DOCX).

### Realizat — batch UX + robustețe (2026-06-14)
- **Submit autonom validat real** prin `submitViaApi` (modulul, cap-coadă, plată din wallet) — „cumpăr → se emite singur" confirmat în producție (worker Railway → DONE).
- **Tip raport (3) + „Altele" custom:** firma → de bază (auto) / fonduri IMM / insolvență; „Altele" trimite textul clientului ca `documentTypeOtherReason`. IMM/insolvență cu motiv nemapat → `NEEDS_OPERATOR`.
- **Safeguards:** auto-retry FAILED neplătit (max 4, backoff, anti-dublă-plată via `onrc_draft_id IS NULL`); reaper PROCESSING blocat >10 min; AWAITING >2h → `NEEDS_OPERATOR` (`awaiting_since`, migrarea 059); email „în procesare" la client; alerte Slack din worker.
- **Jurnal cronologic în admin** (`onrc_job_events`, migrarea 061) — coloana „Ce a făcut botul" în `/admin/onrc`.
- **Fără documente avocațiale** la constatator + carte funciară (contract-asistenta/împuternicire/cerere + nr. Barou scoase); **termen „câteva minute"** în admin + pe pagină (card preț + copy).
- **Link „Vezi ca clientul"** în admin (pagina de status a clientului).

---

## ✅ Realizat — flux mapat & testat live A→Z + design ASINCRON (2026-06-14)

Întreg fluxul „Certificat constatator" a fost **parcurs și executat real** pe `myportal.onrc.ro`, cu **comandă plătită din credit**: CUI 49278701 EDIGITALIZARE S.R.L., raport „de bază" / scop ANAF, **30 LEI din portofelul electronic** (WALLET), Id cerere **20262192280**, Nr. înregistrare **RC 2381836**, **PDF descărcat cu succes** (`edigitalizare_srl_j2023001097301.pdf`).

**Descoperire cheie — fluxul e ASINCRON:** după plată, cererea intră „În procesare în backoffice" și documentul apare **mai târziu** (minute) în tabelul „Opis - Documente atasate cererii" de pe `/request?id=<draftId>`. Botul rulează deci în **2 faze**:

1. **submit + plată** → salvează `onrc_request_id` (Id cerere) + `onrc_draft_id` → job `AWAITING_DOCUMENT`.
2. **retrieve (poll throttled)** → reîncarcă pagina cererii până apare PDF-ul → download → `DONE` → livrare client.

Implementat: migrarea `056_onrc_jobs_async.sql` (coloane `onrc_request_id`/`onrc_draft_id` + status `AWAITING_DOCUMENT`), `/api/onrc/pending` servește ambele faze (PENDING + AWAITING_DOCUMENT throttled la 3 min), `/api/onrc/result` acceptă `AWAITING_DOCUMENT`. Worker: `submitAndPay()` + `retrieveDocument()` + selectori confirmați (`worker-onrc/src/onrc/{selectors,apply}.ts`).

**Rămas:** seed `storageState.json` (login manual o dată) + profil Solicitant/Facturare salvat în contul ONRC + deploy worker pe Railway + reaper pentru job-uri blocate în `PROCESSING`.

### 🔌 Descoperire: portalul are REST API + Keycloak → retrieve fără browser

Sub SPA-ul Angular e un REST API curat (`https://myportal.onrc.ro/api/v1`) cu **Bearer JWT de la Keycloak**. Clientul `frontoffice-app` are **Direct Access Grants** activ → token-ul se ia direct cu user+parolă (`POST sso.onrc.ro/realms/onrc/.../token`, `grant_type=password`), TTL 2h. Verificat live A→Z (summary + opis + download PDF binary). Vezi `worker-onrc/ONRC-FLOW.md` + `worker-onrc/src/onrc/api.ts`.

**Consecință:** **faza de retrieve (status + detalii + descărcare document) e pur HTTP, fără Playwright.** Implementată deja în worker (`api.ts`). Opțional, poate fi mutată într-un **Vercel cron** în eghiseul.ro (fără worker pentru retrieve) — necesită stocarea credențialelor ONRC în Vercel env. **Submit-ul rămâne pe browser** (formular multi-pas + plată). Decizie deschisă: retrieve în worker (acum) vs. Vercel cron.

> Decizie cheie de arhitectură: botul Playwright **NU poate rula pe serverless** (Vercel functions mor în ~10–30s; fluxul ONRC durează 1–2 min cu sesiune logată). Botul e un **worker persistent separat** (proiect nou, ex. Railway) care interoghează eghiseul.ro printr-un API securizat. eghiseul.ro **NU rulează botul** — doar expune coada și primește rezultatul.

---

## Ce există deja (pregătit în acest sprint)

Formularul de comandă constatator (modul `constatator`, 2026-06-14) captează deja datele de care are nevoie botul, în `customer_data.constatator` + `customer_data.company`:
- `company.cui`, `company.companyName` (din company-KYC)
- `constatator.documentType` (`firma` / `pf` / `istoric`), `reportType`, `purpose`, `period{,From,To}`
- `constatator.requesterName`, `constatator.requesterCnp`
- `contact.email`, `contact.phone`

Deci **Faza 1** trebuie doar să adauge coada de stări peste comenzile existente.

---

## Faza 1 — Coadă de stări pe comenzi (în eghiseul.ro)

Migrare `0NN_onrc_queue.sql` — adaugă pe `orders` (sau pe o tabelă dedicată `onrc_jobs` legată prin `order_id`; recomand tabelă dedicată ca să nu încarce `orders`):

```sql
CREATE TABLE onrc_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  status text NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','PROCESSING','NEEDS_OPERATOR','DONE','FAILED')),
  document_type text NOT NULL,         -- FURNIZARE_INFORMATII | CERTIFICAT_CONSTATATOR
  cui text NOT NULL,
  company_name text,
  -- rezultat
  document_url text,                   -- S3 key / URL al PDF-ului emis
  registration_number text,
  downloaded_at timestamptz,
  error_message text,
  retry_count int NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  locked_at timestamptz,               -- pentru claim atomic (anti-dublu-procesare)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX onrc_jobs_status_idx ON onrc_jobs(status) WHERE status = 'PENDING';
```

- Job-ul se creează automat la **plata confirmată** (în webhook-ul Stripe / `ensure-invoice` flow) pentru serviciile ONRC (`certificat-constatator`, viitor furnizare-informații), citind `customer_data.constatator`.
- ⚠️ Claim atomic: vezi `.claude/rules/database.md` — **NU folosi `.or()` pe UPDATE**. Claim-ul = `UPDATE onrc_jobs SET status='PROCESSING', locked_at=now() WHERE id=$1 AND status='PENDING'` (atomic sub row-lock).

## Faza 2 — API securizat (în eghiseul.ro)

Două endpoint-uri sub `/api/onrc/`, protejate cu un secret (`ONRC_WORKER_SECRET` în env, header `Authorization: Bearer`):

- `GET /api/onrc/pending` → întoarce 1 job `PENDING`, îl marchează atomic `PROCESSING` (claim), și returnează `{ jobId, orderId, documentType, cui, companyName, requesterName, requesterCnp, reportType, purpose, period, clientEmail }`.
- `POST /api/onrc/result` → primește `{ jobId, status, documentUrl?, registrationNumber?, errorMessage? }`; pe `DONE` atașează PDF-ul la comandă + trimite email clientului (Resend) + (opțional) notificare Slack.

Standard răspuns ca în restul proiectului: `{ success, data?, error? }`. RLS bypass cu service-role în handler. Rate-limit / single-flight nu e necesar (volum < 50/zi).

## Faza 3 — Worker bot (PROIECT NOU, separat)

Stack: **Node + TypeScript + Playwright**, deploy **Railway** (worker persistent). NU în acest repo.

Structură (din handoff): `source-client.ts` (poll `/api/onrc/pending`, scrie `/api/onrc/result`), `onrc/session.ts` (login + `storageState`), `onrc/apply.ts` (căutare CUI → **validare nume firmă vs comandă** → selectare tip document → aplicare din credit → descărcare PDF), `storage.ts` (S3), `delivery.ts`, `notify-slack.ts`, `index.ts` (buclă poll ~2 min, secvențial, 1 comandă/dată).

Reguli ferme:
- **Validare obligatorie** înainte de submit (nume ONRC vs `company_name`); la mismatch → `NEEDS_OPERATOR`, NU aplică.
- Orice eroare → job nu se pierde: `FAILED`/`NEEDS_OPERATOR` + `error_message` + `retry_count++` + screenshot + alertă Slack.
- CAPTCHA neașteptat → `NEEDS_OPERATOR` + Slack (nu blochează).
- Botul NU atinge carduri (plată doar din credit preîncărcat).

---

## Ordinea de execuție recomandată

1. ✅ **Faza 1 — DONE (2026-06-14):** tabelă `onrc_jobs` (migrarea 055) + creare job idempotentă la plata confirmată (`lib/onrc/ensure-onrc-job.ts`, apelată din webhook-ul Stripe + `confirm-payment`, lângă crearea facturii). Unique index pe `order_id` = un job/comandă.
2. ✅ **Faza 2 — DONE (2026-06-14):** `GET /api/onrc/pending` (claim atomic PENDING→PROCESSING, doar filtre `.eq` — verificat contra producției) + `POST /api/onrc/result` (DONE/FAILED/NEEDS_OPERATOR + retry_count). Auth: `Authorization: Bearer ${ONRC_WORKER_SECRET}`. **⚠️ De setat `ONRC_WORKER_SECRET` în Vercel** înainte ca worker-ul să le folosească.
3. ✅ **Admin — DONE:** listă read-only `/admin/onrc` (contoare pe status, firmă/CUI, tip, retry, nr. înregistrare/PDF, eroare) pentru vizibilitate operator.
4. ✅ **Livrare — DONE:** `POST /api/onrc/result` pe `DONE` → `lib/onrc/deliver.ts`: atașează PDF-ul la comandă (`order_documents`, `visible_to_client`), marchează `document_ready` și trimite email clientului (idempotent).
5. ⏳ **Faza 3 — worker Playwright** (proiect nou `worker-onrc/` pe Railway). Schelet complet + typecheck curat; **rămâne maparea selectorilor LIVE** pe contul ONRC logat (`src/onrc/selectors.ts`) + deploy.

**Următorul pas concret:** mapare selectori ONRC (cu cont + `HEADLESS=false`) + deploy worker pe Railway.

---

## Postmortem & hardening (2026-06-14, seara)

Worker-ul a trecut de la Playwright la **submit 100% prin REST API** (`worker-onrc/src/onrc/api-submit.ts`) — fără browser. Comenzi reale plătite live (RC 2381836, 2381989, 2382077). În testarea comenzii `E-260614-D5TBA` au apărut 3 probleme; toate rezolvate:

### 1. Railway rula cod vechi (browser) → `page.waitForSelector: Timeout`
- **Cauză:** „Redeploy" în Railway re-rulează build-ul vechi, nu ultimul commit. Instanța veche (browser) și cea nouă (API) au coexistat în tranziție.
- **Fix:** deploy-ul corect se face prin **push pe `github.com/rlutas/worker-onrc`** (auto-deploy din ultimul commit). NU folosi „Redeploy" pe un deployment vechi.

### 2. `account-profile.json` lipsea pe Railway → `NEEDS_OPERATOR`
- **Cauză:** fișierul e gitignored (date cont) → nu ajunge în imaginea Railway.
- **Fix:** fallback pe **`ONRC_ACCOUNT_PROFILE`** (JSON-ul în base64) ca env var pe Railway. Vezi `profile()` în `api-submit.ts`.

### 3. ⚠️ Dublă plată (incident) — reset al unui job deja plătit
- **Cauză:** un job depus+plătit a fost resetat manual cu `onrc_draft_id = null` → worker-ul l-a considerat nedepus și a **re-depus + re-plătit** (cereri 20262192998 + 20262193010 pe aceeași firmă). Pierdere ~30 LEI.
- **Fix permanent (anti-dublă-plată):**
  - Worker-ul salvează **`draftId`-ul în coadă IMEDIAT după createDraft, ÎNAINTE de plată** — status nou `CHECKPOINT` în `POST /api/onrc/result`. Orice eșec ulterior (crash, eroare după plată, reset) lasă jobul cu un `draftId` → merge pe ramura **retrieve**, niciodată re-submit. Vezi `submitViaApi(job, onDraftCreated)` + `processJob`.
  - `GET /api/onrc/pending` claim-ul de SUBMIT cere acum **`onrc_draft_id IS NULL`** — un job cu draft nu mai poate fi re-depus.
  - Reaper-ul existent: `PROCESSING` blocat **cu** draft → retrieve; **fără** draft → `NEEDS_OPERATOR` (nu re-depune). Auto-retry FAILED doar dacă `onrc_draft_id IS NULL`.
  - **Regulă operare:** NU reseta niciodată un job care a fost plătit (verifică pe portalul ONRC întâi). Pentru re-livrare folosește status `AWAITING_DOCUMENT` cu draft-ul existent (retrieve-only).

### 4. Notă de calcul (NC) pentru contabilitate
- Worker-ul capturează **NC-ul** la `finalize()` și îl raportează (`calculationNote`) → coloană nouă `onrc_jobs.onrc_calc_note` (migrarea **063**). Afișat în `/admin/onrc` (coloana „Notă calcul") ca echipa de contabilitate să le poată lista per comandă.

### 5. Ora afișată greșit (timezone)
- Paginile randate server-side afișau orele în UTC. Fixat cu `timeZone: 'Europe/Bucharest'` în formatările de dată din `/admin/onrc`, `/admin/orders`, detaliul comenzii și `/comanda/status`.

---

## „De ce nu se eliberează IMM" — investigație completă (2026-06-14, noapte)

Comanda de test `E-260614-D5TBA` (fonduri IMM) nu se elibera, deși „de bază" iese instant. Investigat A→Z, inclusiv un **test manual pe portalul oficial ONRC observat pas-cu-pas prin Playwright** (capturat fiecare apel API) + teste dry-run. Concluzii:

### Două viteze la ONRC (nu e bug la noi)
- **„De bază" (subtip 070)** → eliberare **automată, instant, 24/7** (status DONE / cod 13).
- **„Fonduri IMM" (072)** și **„insolvență" (071)** → trec prin **backoffice-ul ONRC** (operator, în program), pot dura până la ~24h lucrătoare (status WORKING / cod 04). Concurentul „instant" are aceeași realitate — clauză explicită „livrare în max. 24h lucrătoare sau banii înapoi".

### Cauza reală a blocării: MOTIV INACTIV
- Diff complet (submisie bot vs submisie manuală care a ieșit) → **singura diferență la pasul 4**: botul trimitea motivul **„Accesare Fonduri"**, omul a ales **„Fonduri IMM"**.
- „Accesare Fonduri" (namespace `f20a7ad7-…`) este un motiv **INACTIV** — endpoint-ul `cc-reasons-subtype-association/072` îl întoarce, dar UI-ul oficial **îl ascunde**. **Trimiterea unui motiv inactiv → ONRC rutează cererea în backoffice** (și o ține).
- Taxa e identică pentru toate (`7515`, 30 LEI — confirmat capturând UI-ul oficial); plata (`platitor`+`complete` WALLET), pașii și structura sunt identice. Deci NU taxa, NU viteza, NU „pare bot".

### Filtrul corect (sursa de adevăr a motivelor)
UI-ul ONRC populează dropdown-ul „Document solicitat spre a servi la" din **INTERSECȚIA**:
```
GET /common-nomen/cc-reasons/active                          (motive ACTIVE)
GET /common-nomen/cc-reasons/cc-reasons-subtype-association/{cod}
```
Asocierea singură întoarce și motive inactive/legacy. ⚠️ Namespace-ul `f20a7ad7` **NU** e un indicator de „inactiv" (ex: insolvență „Tribunal" `f20a7ad7-d1f1` e ACTIV/valid). Numere valide: **de bază 37, fonduri IMM 7, insolvență 3** (Licitație, Birou notar public, Tribunal).

### Ce am reparat
1. **Formular (DB `services.verification_config`)** — motivele per tip de raport sincronizate EXACT cu setul valid ONRC (script `scripts/sync-constatator-purposes.mjs`). Clientul nu mai poate selecta un motiv inactiv. „Altele" + text liber există DOAR la „de bază" (ca în UI).
2. **Worker** (`worker-onrc/src/onrc/api-submit.ts`):
   - `documentTypeOtherReason="Informare"` pentru motive normale (UI-ul nu duplică motivul acolo; doar „Altele" duce text liber).
   - Pașii în ordinea UI **2→3→4→5** (Facturare ULTIMA, nu 2→5→3→4).
   - **Delay uman ~0.8–1.7s** între pași (nu burst sub-secundă).
   - `buildStep4Doc` exportat pentru teste; **filtrul `f20a7ad7` greșit a fost revertat** (excludea motive valide de insolvență).
3. Validare: 9/9 `buildStep4Doc` + 4/4 dry-run complete (IMM/insolvență/de bază) trec.

### Reguli de operare
- Formularul = sursa de adevăr a motivelor; botul trimite ce a ales clientul (acum doar motive active).
- Re-rulează `scripts/sync-constatator-purposes.mjs` dacă ONRC modifică lista de motive active.
- IMM/insolvență NU se promit „instant" fără caveat — folosim „de obicei câteva minute, max 24h lucrătoare".
- `E-260614-D5TBA` = comandă de test cu motiv inactiv → nelivrată, oprită din polling (`NEEDS_OPERATOR`), rezolvare manuală (refund/re-emitere).
