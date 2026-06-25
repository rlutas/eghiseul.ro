# Test E2E A-Z — Servicii topograf + cont colaborator

Ghid de testare pas-cu-pas pentru fluxul complet: client comandă serviciu cadastral →
plată Stripe → topograf (colaborator) procesează → livrare → client primește documentul.

Acoperă cele 14 servicii noi `imobiliare` (vezi `docs/changelog/2026-06-25-colaborator-topograf-servicii.md`).

---

## Prerechizite

- Dev server: `npm run dev` (http://localhost:3000)
- Stripe în **mod test** (cheile `sk_test_`/`pk_test_` în `.env.local`) — checkout hosted, fără bani reali
- Cont colaborator de test: **mircea@yahoo.com / asdasd123** (rol `collaborator`, 14 servicii alocate)
- Card de test Stripe: **4242 4242 4242 4242**, expirare orice viitor (ex `12/34`), CVC orice (`123`)
  - Alte carduri: `4000 0000 0000 9995` (fonduri insuficiente), `4000 0025 0000 3155` (3DS) — vezi stripe.com/docs/testing

> Notă: comenzile plătite în mod test au automat `is_test=true` (excluse din rapoartele reale).

---

## Flux A-Z (client → plată → colaborator → livrare)

### 1. Client plasează comanda (guest)
1. `/comanda/<slug>` (ex `/comanda/certificat-sarcini`). Dropdown-ul „Alt document cadastral?" permite schimbarea serviciului.
2. **Pas 1 — Date Contact**: email + telefon (`react-international-phone`, format E.164 `+40...`). „Continuă".
3. **Pas 2 — Date Imobil**: Județ + Localitate (Radix select), apoi tab `Nr. Carte Funciară` / `Nr. Cadastral` / `Adresă`. Pt serviciile „după proprietar" (identificare-imobile-proprietar, certificat-detineri-imobile) se cere numele proprietarului. Autosave („Salvat acum"). „Continuă".
4. **Pas 3 — Facturare**: alege „Facturează pe mine" / „Altă persoană fizică" (CNP, adresă) / „Persoană juridică" (CUI). „Plătește <total> RON".
5. **Checkout** (`/comanda/checkout/<id>`): metodă plată (Card / Transfer bancar), cupon opțional. „Plătește cu cardul".
6. **Stripe hosted** (`checkout.stripe.com`): card 4242, expirare, CVC, nume. „Plătiți".
7. **Success** (`/comanda/success/<id>`): „Plată confirmată!" + rezumat + „Verifică Statusul".

**Verificare DB după plată:**
```
payment_status = paid ; status = processing ; stripe_payment_intent_id setat ; is_test = true
customer_data.contact/property/billing populate corect
```

### 2. Client urmărește statusul
- `/comanda/status?order=<cod>&email=<email>` → „Plată confirmată", timeline (Comandă plasată → Plată confirmată → Documente generate → În procesare), termen estimat, contract auto-generat.

### 3. Colaborator (Mircea) procesează
1. Login `mircea@yahoo.com / asdasd123` → `/colaborator/orders` (vede DOAR comenzile serviciilor alocate, scoped prin RLS pe `service_id`).
2. Deschide comanda → „Date pentru lucrare" (client, contact, imobil/proprietar).
3. „Încarcă PDF scanat" → PDF (`%PDF-`, ≤20MB) → **comprimat cu CloudConvert** (fallback la original) → S3 (`final/YYYY/MM/<order_id>/`) → atașat ca `visible_to_client=false`.
4. „Marchează gata & livrează" → `deliverCollaboratorResult()`:
   - documentele colaborator devin `visible_to_client=true`
   - `status = document_ready`
   - email idempotent către client (Resend, key `collaborator-deliver-<id>`)

**Verificare DB după livrare:**
```
orders.status = document_ready
order_documents: type=collaborator-document, visible_to_client=true, metadata.source=collaborator
```

### 4. Client primește documentul
- `/comanda/status` → status `document_ready`, document vizibil la „Documente" → „Vizualizează".
- `/account` (dacă logat) → documentul în comandă.

---

## Rezultate rulare 2026-06-25 (Playwright, real Stripe test)

Comandă reală **E-260625-D3L8W** (certificat-sarcini, guest):
- ✅ Wizard A-Z: contact (`+40712345678`), imobil (Cluj/Cluj-Napoca/CF 123456), facturare (PF Popescu Ion, CNP, Cluj-Napoca)
- ✅ Stripe hosted checkout, card 4242 → `payment_status=paid`, PI real, `is_test=true`, total 302.50
- ✅ Success „Plată confirmată" + status tracking cu timeline + termen „joi 2 iulie 2026" + contract auto-generat
- ✅ Mircea: vede comanda scoped → upload PDF (CloudConvert, fallback original) → S3 `final/2026/06/...` → „Marchează gata"
- ✅ `status=document_ready`, doc `visible_to_client=true`, client vede documentul pe pagina de status

Verificat și separat: toate 14 wizardurile rezolvă serviciul corect; toate 17 paginile imobiliare au switcher; scoping colaborator (vede doar 14 servicii ale lui).

### Rezolvat după testare (2026-06-25)
- Pagina `/comanda/status`: adăugate label-uri pentru statusurile reale (`document_ready` = „Documentul este eliberat", + documents_generated/submitted_to_institution/document_received/extras_in_progress); document `collaborator-document` → „Document eliberat" (`DOC_TYPE_LABELS`).
- `document_ready` = „Documentul este eliberat" și în `status-options.ts` (admin + portal colaborator).
- Facturare pe serviciile imobiliare (toate 17): doar **2 opțiuni** — Persoană fizică / Persoană juridică (fără „Facturează pe mine", fără scan act); heading nu mai afișează „(din act)". CNP opțional.
- Detaliu colaborator: mărime fișier afișată în KB sub 1MB.
- Header de marketing ascuns pe `/colaborator` (ca la `/admin`); redirect login corectat la `/auth/login`.

---

## Reset date de test

Comenzile de test (`is_test=true`, inclusiv cele seed `E-TEST-*`):
```sql
DELETE FROM order_documents WHERE order_id IN (SELECT id FROM orders WHERE is_test = true);
DELETE FROM orders WHERE is_test = true;
```
(Rulează prin `pg` / service role — vezi `.claude/rules/database.md`.)
