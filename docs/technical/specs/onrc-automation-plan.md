# Plan: Automatizare ONRC (coadă de stări + bot)

**Status:** backbone implementat; flux ONRC **mapat & testat live A→Z**. **Ultima actualizare:** 2026-06-14.
**Context:** vezi și `/Users/raul/.claude/plans/este-posibil-sa-construiesc-tidy-stallman.md` (handoff-ul original al botului). Flux DOM live: `worker-onrc/ONRC-FLOW.md`.

Un operator uman ia acum manual datele dintr-o comandă de **certificat constatator** / **furnizare informații**, aplică pe portalul **ONRC RECOM** (https://myportal.onrc.ro), plătește din creditul preîncărcat, descarcă PDF-ul și îl livrează clientului. Înlocuim operatorul cu un **bot de browser automation**, în 3 faze.

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
