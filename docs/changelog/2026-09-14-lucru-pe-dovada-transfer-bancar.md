# 14.09.2026 — Transfer bancar: lucrul pornește pe dovada de plată, nu pe bani
<!-- categorie: plati -->

## Pentru echipă

Când un client plătește prin transfer bancar și ne trimite dovada (ordinul de
plată din aplicația băncii, pe email sau pe WhatsApp, ori încărcat în checkout),
**nu mai aștepți să intre banii**. Deschizi comanda din tabul „Așteptare plată”
și apeși **„Dovadă verificată — pornește lucrul”**: comanda trece pe „În
procesare”, se generează contractul de asistență, împuternicirea și cererea, și
poți depune la instituție.

Când banii apar în extras, apeși **„Confirmă plata”** ca până acum (cu
referința tranzacției). Abia atunci se emite factura și pleacă emailul de
confirmare către client. Comanda rămâne în „Așteptare plată” până atunci, cu
banner galben, ca să nu uităm de încasare.

Nu folosi dropdown-ul de status pentru niciuna din cele două: nu generează
documentele și nu emite factura. Procedura completă:
[Plata prin transfer bancar](../admin/plata-transfer-bancar.md).

---

**Declanșator:** comanda `E-260912-5SNRM` (certificat de căsătorie, 1.248,00
RON). Clientul a ales IBAN-ul pe 12.09 la 14:15 și a trimis ordinul de plată.
Pe 14.09 comanda era tot pe **„Așteptare plată"**: fluxul de procesare pornește
doar din `paid` (`VALID_TRANSITIONS` în `/api/admin/orders/[id]/process`), iar
contractul de asistență, împuternicirea și cererea se generează exclusiv după
plată (`ensureBarouDocumentsForPaidOrder` iese pe `payment_status !== 'paid'`).
Două zile în care echipa nu putea face nimic deși banii erau, de fapt, pe drum.

Cererea lui Raul: echipa să poată bifa că a verificat dovada și să înceapă
pregătirea documentelor și pașii la instituție, fără să stea blocată până intră
banii.

---

## Ce s-a livrat

### „Dovadă verificată — pornește lucrul" (panoul portocaliu de transfer bancar)

Buton nou, vizibil doar pe comenzile `awaiting_payment` +
`payment_status='awaiting_verification'` + `payment_method='bank_transfer'`.
La click (cu confirmare):

- `status` → `processing`; `proof_verified_at` / `proof_verified_by` marcate;
- eveniment `work_started_on_proof` în `order_history`;
- numerele de Barou + contract asistență + împuterniciri + cerere se generează
  **acum**, prin `ensureBarouDocumentsForPaidOrder(orderId, { allowVerifiedProof: true })`;
- `payment_status` **rămâne** `awaiting_verification`.

**Nu** face: factura Oblio, emailul de confirmare a plății, joburile ONRC/ANCPI
(cost real la instituție). Toate pleacă la „Confirmă plata", prin
`fulfilManuallyPaidOrder`, care păstrează statusul de lucru (comportament din
10.09) și rulează idempotent alocarea Barou (`barou_numbers_allocated_at`).

Gardă pură `assessStartWorkOnProof` în `src/lib/orders/start-work-on-proof.ts`
(6 teste), folosită și de rută (server), și de panou (ascunde butonul).
Acțiunea server-side în `start-work-on-proof-run.ts`; update condiționat pe
`status='awaiting_payment' AND proof_verified_at IS NULL`, deci dublu-click nu
pornește de două ori. Rută: `POST /api/admin/orders/[id]/start-work`
(`orders.manage`).

Butonul **nu cere dovadă încărcată în checkout** — `E-260912-5SNRM` avea
`payment_proof_url = NULL`, ordinul de plată a venit pe alt canal. Decizia e a
operatorului.

### Dovada se poate deschide din admin

Până acum panoul spunea doar „Clientul a atașat o dovadă de plată" — fără link.
`GET /api/admin/orders/[id]` întoarce `payment_proof_signed_url` (S3, 1h), iar
panoul arată „deschide dovada".

### Tabul „Așteptare plată" filtrează după plată, nu după status

O comandă pornită pe dovadă e „În procesare" ȘI încă neîncasată; cu filtrul
vechi (`status = 'awaiting_payment'`) ar fi dispărut din coada de confirmare.
`resolveStatusFilter('awaiting_payment')` întoarce acum
`{ paymentStatusEq: 'awaiting_verification', notIn: DEAD_FOR_PAYMENT }`, iar
list / export / counts trec prin același `applyStatusFilter` (înainte fiecare
rută își aplica forma pe cont propriu). Comanda apare în paralel și în „În
procesare". Cardul „Plăți de verificat" din dashboard număra deja pe
`payment_status`.

### Banner galben, nu roșu

`UnpaidWorkWarning` (10.09) devine **galben** când `proof_verified_at` e setat:
„În lucru pe dovada de transfer — încasarea NU e confirmată încă". Roșul rămâne
pentru comenzile avansate din greșeală, fără plată și fără decizie.

### Migrarea 161 (aplicată)

`orders.proof_verified_at timestamptz`, `orders.proof_verified_by uuid →
profiles`, index parțial pe `payment_status = 'awaiting_verification'`,
`work_started_on_proof` în lista albă `order_history.event_type`.

---

## Decizii

- **Numerele de Barou se alocă înainte de încasare.** Comentariul din
  `ensure-barou-documents.ts` spunea „ONLY by paid orders" — regula din
  registrul central (09.09) e că numerele nu se pierd: comanda neîncasată le
  **eliberează** (release), și le reconsumă următoarea comandă. Fără alocare
  butonul n-ar fi servit la nimic — pe stare civilă toate documentele cer
  număr.
- **Joburile ONRC/ANCPI nu pornesc pe dovadă.** Acolo plătim noi la
  instituție; dacă banii nu vin, pierdem taxa. Pornesc la „Confirmă plata".
- **Fără email către client la „pornește lucrul".** Clientul a primit deja
  emailul cu datele contului; confirmarea plății vine când banii intră.

## Fișiere

- `supabase/migrations/161_lucru_pe_dovada_transfer_bancar.sql`
- `src/lib/orders/start-work-on-proof.ts` (pur) + `start-work-on-proof-run.ts`
- `src/app/api/admin/orders/[id]/start-work/route.ts`
- `src/lib/documents/ensure-barou-documents.ts` — opțiunea `allowVerifiedProof`
- `src/lib/admin/orders-tabs.ts` — `paymentStatusEq`, `DEAD_FOR_PAYMENT`, `applyStatusFilter`
- `src/app/api/admin/orders/{list,export,counts}/route.ts`
- `src/app/api/admin/orders/[id]/route.ts` — `payment_proof_signed_url`
- `src/app/admin/orders/[id]/page.tsx` — buton, link dovadă, banner galben
- `tests/unit/lib/orders/start-work-on-proof.test.ts`, `tests/unit/lib/admin/orders-tabs.test.ts`
- `docs/admin/plata-transfer-bancar.md`

## Rămâne

- `E-260912-5SNRM` e încă pe „Așteptare plată": butonul e al echipei — cineva
  verifică ordinul de plată primit și apasă.
- Sweep-ul orar Barou (`invoice-health-check`) nu reia comenzile neplătite;
  dacă alocarea eșuează la „pornește lucrul", istoricul arată
  `barou_allocation_failed`, iar „Confirmă plata" o reia.
