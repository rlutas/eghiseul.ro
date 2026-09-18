# API — contul în wizard, dovada plății prin transfer, token-uri (18.09.2026)

Endpoint-urile atinse de testul A→Z al contului (punctele 1–34) și de cele
două bucle de inspecție Codex. Formatul răspunsurilor rămâne
`{ success, data?, error? }`.

## Wizard

### `GET /api/user/prefill-data`
Neschimbat ca formă; corpul e construit de `buildUserPrefillData(supabase, user)`
(`src/lib/account/prefill.ts`), pe care îl folosește și pagina
`/comanda/[service]` pe server (`initialPrefill` către `ModularWizardProvider`).
Câmpuri noi: `identity_document` (`{ type, series, number, verifiedAt,
expiresAt } | null` — primul act de identitate front neexpirat) și
`has_valid_kyc` (act + selfie, `hasCompleteKyc`).

### `POST /api/orders/draft` / `PATCH /api/orders/draft`
- `phoneOrder: true` (mod telefonic) → draftul se creează cu `user_id: null`
  și `customer_data.phone_order = true` (comanda e a clientului, nu a
  operatorului logat).
- `resumeToken` (din `?resume=`, ținut în memorie de wizard) autorizează un
  guest să editeze un draft legat de alt `user_id`, dacă `orders.resume_token`
  coincide (comparare constant-time) și `resume_token_expires_at` e în viitor.

### `POST /api/orders/[id]/submit`
Ordinea: (1) proprietate — comanda cu `user_id` cere sesiunea proprietarului
sau `body.resumeToken` valid; altfel 403; (2) config-ul serviciului
(`verification_config.personalKyc`), 503 la eroare de citire (nu fail-open);
(3) imaginile inline (`base64`, JPEG/PNG/WebP după magic bytes, 2 KB–12 MB)
se urcă în `kyc/<orderId>/<tip>.<ext>` înainte de verificare; (4) când
contul are un front neexpirat și comanda nu are, iar
`personal.useOtherDocument !== true`, actul contului se copiază server-side
(din `kyc/<user_id>/…`, HeadObject) în `kyc/<orderId>/` și în
`uploadedDocuments` (`fromAccount: true`); (5) guard-ul numără doar obiectele
din `kyc/<orderId>/` confirmate cu HeadObject; selfie-ul trebuie să difere de
act după SHA-256; pașaportul acceptă `passport` și `passport_opened`.
Erori: `FORBIDDEN`, `CONFIG_UNAVAILABLE` (503), `ACCOUNT_KYC_UNAVAILABLE`
(503), `ACCOUNT_KYC_COPY_FAILED` (500), `KYC_INCOMPLETE` (400). La succes
`resume_token` se șterge.

### `GET /api/courier/quote`
Parametru nou `locker_id` — pentru Sameday, estimarea de locker se face
pentru lockerul dat (altfel pentru unul din localitate/județ). Sameday cere
județ + localitate în `awbRecipient` și la locker, plus `oohLastMile`.

## Dovada plății prin transfer bancar

### Token `payment-proof`
`src/lib/orders/payment-proof-token.ts`: `issuePaymentProofToken(orderId)` /
`verifyPaymentProofToken(token, orderId)`. HMAC-SHA256 peste
`payment-proof:<orderId>:<exp>`, 2 ore, secret `PAYMENT_PROOF_TOKEN_SECRET`
(fallback: derivat din `SUPABASE_SERVICE_ROLE_KEY`), `timingSafeEqual`.
Emis de:
- `GET /api/orders/status` (după codul comenzii + email) — câmpul
  `proofToken`, doar pentru `status='awaiting_payment'` +
  `payment_status='awaiting_verification'`; tot aici: `paymentMethod`,
  `proofVerifiedAt`, `hasPaymentProof`.
- `GET /api/orders/[id]` (apelant deja autorizat) — `proofToken` pentru comenzi
  neplătite `pending`/`awaiting_payment`; `paymentProofUrl` semnat 1 h pentru
  cheia din `uploads/` sau din `proof/` a comenzii.

### `POST /api/upload` — `category: 'payment-proof'`
Singura ramură fără sesiune obligatorie: proprietarul (sesiune) SAU
`proofToken` valid pentru același `orderId`; comanda neplătită, `pending` /
`awaiting_payment`; MIME JPEG/PNG/WebP/PDF, ≤ 10 MB; cheia e generată de
server (`orders/<yyyy>/<mm>/<orderId>/uploads/proof-<ts>-<id>.<ext>`);
≤ 5 presign-uri / comandă / oră (`count_proof_presign`, în DB). Ramura
`orders` cere acum proprietate pentru utilizatorii autentificați.

### `POST /api/orders/[id]/bank-transfer`
Body: `{ paymentProofKey?, proofOnly?, proofToken? }`.
- Înregistrare (comandă `pending`): setează `payment_method/payment_status/
  status`, scrie `order_history.bank_transfer_submitted`, trimite emailul cu
  IBAN-ul + heads-up-ul echipei (o dată).
- `proofOnly: true`: comandă legată → sesiunea proprietarului; comandă de
  guest → `proofToken` valid. Fără înregistrare, fără email către client.
- Orice `paymentProofKey` (pe ambele căi) trece prin
  `attachPaymentProof()` (`src/lib/orders/attach-payment-proof.ts`):
  namespace-ul comenzii → citire (≤ 10 MB, magic bytes) → SHA-256 → scriere
  sub `orders/…/proof/<sha256>.<ext>` (imutabil) → RPC
  `attach_payment_proof` (migrarea 180: `payment_proof_events` UNIQUE
  (order, digest), istoric `payment_proof_submitted` în aceeași tranzacție,
  `unchanged` la replay, `not_awaiting` pe metodă/status greșit) →
  heads-up echipă o dată per dovadă (`team_notified_at`, marcat doar când
  Resend a trimis).
- Răspuns: `data.proof` ∈ `attached | unchanged | null`; erori 400
  (`invalid_key`, `missing_object`, `too_large`, `not_awaiting`) / 500.

## Admin

### `GET /api/admin/orders/list`
Sortare: `is_closed ASC` (coloană generată, migrarea 179:
`completed/cancelled/refunded`), apoi `paid_at DESC NULLS FIRST`, `created_at DESC`.
