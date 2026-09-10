# 10.09.2026 — Plata prin transfer bancar: fluxul nu a funcționat niciodată

**Declanșator:** comanda `E-260905-DMUZA` (1.646,00 RON). Clientul a plătit prin
transfer bancar, banii au intrat în cont, iar în platformă comanda apărea
**„Abandonată"**. Clientul nu a primit niciun email — nici confirmare, nici
datele contului. În schimb a primit, la 15 minute după abandonare, emailul
automat de recuperare coș cu un cupon de −10%.

---

## Ce era stricat (trei defecte suprapuse)

### 1. Ruta de transfer bancar rula sub RLS și nu vedea comanda

`POST /api/orders/[id]/bank-transfer` folosea `createClient()` (cheia anonimă,
supusă politicilor de acces). Politicile pe `orders` permit unui vizitator
neautentificat să citească și să modifice **doar** comenzi cu `status='draft'`.
O comandă ajunsă la checkout e `pending`, deci ruta răspundea
`{"success":false,"error":"Order not found"}` — inclusiv atunci când clientul
chiar încărca dovada de plată.

Dovada în date: `payment_method` era **NULL pe toate cele ~1.300 de comenzi din
tabelă**, inclusiv pe cele plătite cu cardul. Nicio comandă nu a fost vreodată
marcată `bank_transfer`.

### 2. Alegerea „transfer bancar" nu se salva fără dovadă de plată încărcată

Butonul „Confirmă Plata prin Transfer" era blocat până la încărcarea unui ordin
de plată (`disabled={!bankTransferProofKey}`). Cine pleacă să plătească din
aplicația băncii nu se mai întoarce pe site, deci pentru sistem comanda rămânea
o simplă comandă `pending` neplătită.

### 3. Cronul auto-abandon o îngropa în 30 de minute

`/api/cron/auto-abandon` trece pe `abandoned` orice comandă `pending` mai veche
de 30 de minute — prag gândit pentru plata cu cardul, care durează secunde. Un
transfer interbancar durează 1-3 zile lucrătoare. Apoi
`/api/cron/recovery-emails` a văzut o comandă „abandonată" și a trimis cuponul.

### Bonus descoperit la testare

`payment_proof_submitted` **nu era în lista albă** a lui
`order_history.event_type`, deși ruta îl scria de la început, iar panoul de
admin avea deja etichetă pentru el. Insertul pica **tăcut**, deci alegerea
transferului bancar nu apărea niciodată în istoricul comenzii.

---

## Ce s-a schimbat

| Zonă | Înainte | Acum |
|---|---|---|
| Ruta `bank-transfer` | `createClient()`, blocată de RLS | `createAdminClient()`, cu același control de acces ca `GET /api/orders/[id]` |
| Dovada de plată | obligatorie | opțională — butonul rezervă comanda oricum |
| Statusul comenzii | rămânea `pending` | `awaiting_payment` + `payment_status='awaiting_verification'` |
| Auto-abandon | prindea comanda la 30 min | nu vede `awaiting_payment`; în plus exclude explicit `payment_status='awaiting_verification'` |
| Email client | niciunul | datele contului, suma, numărul comenzii ca detalii de plată, link la starea comenzii |
| Email echipă | niciunul | heads-up către `contact@eghiseul.ro` (sau `ADMIN_NOTIFY_EMAIL`) |
| Admin — listă | invizibilă printre abandonuri | tab propriu **„Așteptare plată"** cu badge de număr; apare și în „Toate" |
| Admin — comandă | fără buton de confirmare (marcarea manuală exista DOAR pe comenzile telefonice) | panou „Confirmă plata" cu referință obligatorie din extras |
| Dashboard „Plăți de verificat" | filtru `status='pending' AND payment_method='bank_transfer'` — combinație inexistentă, deci mereu 0 | numărat pe `payment_status='awaiting_verification'`, link către noul tab |

Confirmarea din admin cheamă `/api/admin/orders/[id]/mark-paid`, deci rulează
**exact același lanț** ca plata cu cardul: factură Oblio cu colectare „Transfer
bancar", upsert contact, email de confirmare către client, joburi ONRC/ANCPI,
documente Barou.

## Migrarea 154

- `orders_status_check` — status nou `awaiting_payment`;
- `order_history_event_type_check` — `payment_proof_submitted` și
  `bank_transfer_submitted`.

## Fișiere

- `src/app/api/orders/[id]/bank-transfer/route.ts` — rescrisă
- `src/lib/email/templates/bank-transfer-pending.ts` — nouă (2 emailuri)
- `src/app/comanda/checkout/[orderId]/page.tsx`
- `src/app/comanda/success/[orderId]/page.tsx`
- `src/components/payment/PaymentMethodSelector.tsx`
- `src/app/api/cron/auto-abandon/route.ts`
- `src/lib/admin/orders-tabs.ts`, `status-badges.ts`, `status-options.ts`, `order-quick-filters.ts`
- `src/app/api/admin/orders/counts/route.ts`, `.../[id]/status/route.ts`
- `src/app/api/admin/dashboard/stats/route.ts`
- `src/app/admin/orders/[id]/page.tsx`, `src/app/admin/orders/page.tsx`, `src/app/admin/page.tsx`
- `src/app/comanda/status/page.tsx`
- `supabase/migrations/154_status_asteptare_plata_transfer.sql`

## Testat

Comandă de test (ștearsă după), pe server local cu `RESEND_API_KEY` gol:

- POST fără dovadă → `success: true`, comanda trece pe
  `awaiting_payment` / `awaiting_verification` / `bank_transfer`;
- POST cu dovadă → în plus `payment_proof_url` salvat și rândul
  `payment_proof_submitted` în istoric;
- ambele emailuri construite corect (client + `contact@eghiseul.ro`);
- filtrul cronului auto-abandon nu mai returnează comanda nici când e forțată
  înapoi pe `pending` cu `created_at` vechi de 3 ore;
- `tsc --noEmit`, `eslint` și `next build` curate.

## Ce a primit efectiv clientul din `E-260905-DMUZA`

Verificat în baza de date, pe stampilele de trimitere (codul lasă stampila NULL
când trimiterea eșuează, deci o stampilă completată = email plecat):

| Email | Stare |
|---|---|
| Confirmare comandă | **niciodată trimis** (`confirmation_email_sent_at` NULL) |
| Factură | **inexistentă** (`invoice_number` NULL, `paid_at` NULL) |
| Datele contului / instrucțiuni de plată | nu existau în platformă la acea dată |
| Recuperare coș abandonat, cupon `RECOVERY-UJ8AUU3G` (−10%, 48h) | **trimis** 05.09 la 14:15 ora României |

Adică singurul email primit de client a fost cel prin care i se sugera că a
renunțat la comandă — după ce plătise 1.646,00 RON.

## Câți bani s-au mai pierdut așa

Extrasele Banca Transilvania iunie–august 2026 (`docs/artifact-gabi/`, contul
`RO82BTRLRONCRT0CP9350501`) au **68 de linii de încasare**, din care doar **5 nu
vin de la Stripe**. Dintre acelea, una singură e plată de la un client:

- **22.08.2026, 726,00 RON, IULIANA FUNERAR SRL**, cu descrierea „Plata fact EGH
  0278 din data 05.08" — deci factura exista deja, banii sunt contabilizați,
  nicio comandă blocată.

Restul sunt aport propriu și rambursări de la Vercel/Amazon. Prin urmare, în
iunie–august **nu s-a pierdut niciun ban** pe calea asta; cele 67 de comenzi
abandonate din august sunt abandonuri reale.

Extrasul pe septembrie nu era în folder la momentul verificării, deci
`E-260905-DMUZA` rămâne singurul caz confirmat. Merită trecut extrasul pe
septembrie prin aceeași verificare când e disponibil.

## ✅ E-260905-DMUZA, deznodământ

Comanda a fost mutată din `abandoned` pe **„Așteptare plată"**, cu rândul de
corecție în istoric. Echipa a apăsat **„Confirmă plata"** în aceeași zi, la
11:39, cu referința reală din extras — primul caz real trecut prin butonul nou:

| | |
|---|---|
| Referință | `C31ZEXA26251016D` |
| Factură | **EGH-0647**, emisă în Oblio |
| Email de confirmare | trimis clientului la 11:39:59 |
| Status | `submitted_to_institution` |

Plata venise ca **încasare SEPA din Germania: 324,66 EUR la curs 5,2508**, pentru
o comandă de 1.646,00 RON. Detaliile mai sunt în
[partea a doua](2026-09-10-incasari-iban-in-decontari.md).

Restul comenzilor din „Neplătite" au fost verificate contra extraselor
iunie–august: sunt abandonuri reale. De repetat verificarea pe extrasul din
septembrie când apare.

Instrucțiunile de lucru pentru echipă:
[docs/admin/plata-transfer-bancar.md](../admin/plata-transfer-bancar.md).
