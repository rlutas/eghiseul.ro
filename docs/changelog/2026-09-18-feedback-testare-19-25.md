# 18.09.2026 — Feedback-ul de testare, punctele 19–25: motivul, actul din cont, opțiunile, pasul KYC, contractul, plata prin transfer pe pagina comenzii
<!-- categorie: comenzi -->

## Pentru echipă

A treia tranșă din testele lui Raul, verificată în cinci runde de o inspecție
independentă (Codex) înainte de a scrie codul. Ce se schimbă pentru client:

- **Motivul solicitării** (caziere, integritate): câmpul are etichetă, exemple
  în locul gol, motivele cele mai folosite sunt primele în listă, lista se
  deschide în jos (nu peste câmp), iar dacă apasă „Continuă" fără motiv vede
  eroarea chiar sub câmp.
- **Actul din cont** (pasul 2): un client logat care are actul în cont vede
  cardul „Actul tău din cont — CI seria X nr. Y" și merge mai departe; nu i se
  mai cere tipul actului și nici scanarea. „Folosește alt act" dacă vrea altul.
  Selfie-ul rămâne la pasul următor. Actul din cont se copiază în comandă
  la trimitere, deci îl vedeți în admin ca până acum.
- **Opțiuni**: un singur rând sus („Apasă și selectează opțiunile
  suplimentare dorite"), grupuri mici, explicațiile după „Ce înseamnă?",
  procesarea urgentă e cardul principal, cu „Recomandat" și „⚡ Gata în N zile
  lucrătoare". Serviciile suplimentare au bifă vizibilă.
- **Pasul KYC**: un singur rând de reasigurare; „De ce cerem selfie-ul" se
  deschide la apăsare (rezumatul rămâne vizibil: scop, cine compară, 90 de
  zile / 3 ani). Pe telefon, „Continuă" e în bara de jos, fără scroll.
- **Contractul**: previzualizarea nu mai fuge stânga-dreapta pe telefon.
- **Transfer bancar, pagina comenzii**: clientul vede clar „Trebuie să
  efectuezi plata și să încarci dovada plății", cu IBAN, beneficiar, sumă,
  referință și butoane de copiere, plus **„Încarcă dovada plății" direct
  acolo**, și fără cont. După ce urcă dovada, cardul zice „Am primit dovada".
  Voi primiți heads-up-ul o singură dată per dovadă, iar în istoricul comenzii
  „dovadă primită" apare doar când chiar există o dovadă (înainte apărea și
  la simpla alegere a transferului).

Procedura la transfer bancar nu se schimbă:
[plata-transfer-bancar](../admin/plata-transfer-bancar.md).

**Curățenie:** comenzile de test ale lui Raul (9, toate neplătite) au fost
șterse, ca următoarele teste să pornească de la zero.

---

## Rezumat tehnic

Planul (`PLAN-2`, scratchpad) a trecut prin 5 runde de review Codex
(8 → 6 → 5 → 3 → 2 constatări, toate acceptate); ultimele două (limita de
10 MB verificată server-side la atașare, cheia imutabilă a dovezii numită
după ETag) sunt încorporate dar nerevizuite la nivel de plan. Codul e
inspectat separat (rundă nouă, vezi jos).

- **19** `PINNED_MOTIVE` + `pinnedFirst()` în `config/motiv-options.ts`
  (valori exacte per serviciu, test de apartenență); `SearchableSelect`
  `preferDirection="down"` (scroll în loc de flip); `PurposeSelect` cu
  `label`, exemple, eroare inline (`data-wizard-error`).
- **20** `prefill.identity_document` (primul front neexpirat: tip, serie,
  număr, verificat/expiră) → `state.accountKyc.identity`;
  `PersonalKYCState.useOtherDocument`; `PersonalDataStep` card + gating pe
  `skipsIdScan`; `KYCDocumentsStep` nu mai cere `act_identitate` când actul e
  din cont. `/submit`: (1) proprietate ÎNAINTE de orice — owner sau
  `resumeToken` (comparat constant-time, neexpirat); (2) config-ul serviciului
  citit primul, 503 la eroare (nu mai e fail-open); (3) materializare doar când
  `personalKyc.enabled`, comanda n-are front și `useOtherDocument !== true`:
  rândul din `kyc_verifications` al userului comenzii (`kyc/<user_id>/…`,
  HeadObject > 0) copiat în `kyc/<orderId>/<tip>.<ext>` + `uploadedDocuments`
  persistat, 500 la eșec; (4) guard pe aliasuri (`isIdentityFrontType`,
  `isPassportType`), selfie ≠ același obiect cu actul. Draftul telefonic:
  `phoneOrder: true` → `user_id: null` + `customer_data.phone_order`;
  `canUpdateDraft` acceptă `resumeToken`; providerul ține tokenul în memorie
  (`SET_RESUME_TOKEN`) și îl trimite la autosave + submit; `/submit` îl
  șterge la succes.
- **21/22** `options-step`: un `<h3>` sus, `SectionHeader` → etichetă de grup
  (`<p>`), `OptionCard` cu `variant="primary"`, `badge`, `term`
  (`formatUrgentDays(service)`), descrierea după „Ce înseamnă?"; checkbox
  vizual pe `OptionCard` și `CrossServiceAddonCard`.
- **23** `SelfieLegalNotice` = `<details>` cu `<summary>` care conține
  scopul + cine compară + 90 zile/3 ani (adevărat conform notei din fișier și
  politicii); banner-ul albastru scos; bara fixă de jos (mobil) primește
  „Continuă" (același `handleNext`).
- **24** `.contract-preview`: `overflow-x-hidden`, `touch-action: pan-y`,
  `overscroll-behavior-x: none`, `table-layout: fixed`, `max-width: 100%`.
- **25** `lib/orders/payment-proof-token.ts` (HMAC-SHA256, audiență
  `payment-proof`, 2 h, `timingSafeEqual`; secret `PAYMENT_PROOF_TOKEN_SECRET`
  sau derivat din service-role key) emis de `/api/orders/status`
  (`awaiting_payment` + `awaiting_verification`) și `GET /api/orders/[id]`
  (neplătită, `pending`/`awaiting_payment`). `/api/upload` ramură
  `payment-proof`: owner sau token, cheie generată de server, MIME/≤10 MB,
  `count_proof_presign` (5/oră/comandă în DB); ramura `orders` cere acum
  proprietate. `lib/orders/attach-payment-proof.ts`: namespace + HeadObject
  (≤10 MB, altfel șters), copie la `orders/…/proof/<etag>.<ext>`, RPC
  `attach_payment_proof` (migrarea **180**: `payment_proof_events` UNIQUE
  (order, digest), istoric în aceeași tranzacție, `unchanged` la replay,
  `not_awaiting` pe metodă/status greșit), heads-up echipă o dată per dovadă
  (`team_notified_at`, `mark_payment_proof_notified`, vindecat la retry).
  Ruta `bank-transfer`: înregistrarea scrie `bank_transfer_submitted`
  (nu `payment_proof_submitted` fără dovadă), `proofOnly` cere owner sau
  token. `customerTimeline`: etichetă pentru `bank_transfer_submitted`.
  Pagina de status: card cu `BankTransferDetails` + `PaymentProofUpload`
  (`proofToken`) → POST proof-only → refetch. Checkout: `proof_token` din
  `GET /api/orders/[id]`.
- **Inspecția Codex pe cod (rundă nouă, base 74d89ac): REVISE, 7 constatări, toate reparate**

| ID | Disp. | Ce s-a făcut |
|---|---|---|
| REV2-CODE-001 (high) | acceptat | `/submit`: imaginile inline se urcă în `kyc/<orderId>/` ÎNAINTE de guard (base64 validat, ≥ 2 KB), iar guard-ul numără doar obiectele din namespace-ul comenzii confirmate cu HeadObject — un `s3Key` inventat sau un marker base64 nu mai contează. |
| REV2-CODE-002 (high) | acceptat | `/api/orders/status` selectează `payment_proof_url` (altfel `hasPaymentProof` era mereu false). |
| REV2-CODE-003 (medium) | acceptat | `bank-transfer`: dovada se atașează înainte de emailuri; emailul de înregistrare spune „am primit dovada" doar la `attached`/`unchanged`; la eșec, înregistrarea rămâne și răspunsul spune că dovada nu s-a salvat. |
| REV2-CODE-004 (medium) | acceptat | Pagina de status ține datele de transfer și după dovadă; `BankTransferDetails` arată IBAN-ul EUR indiferent de cursul BNR (cursul doar convertește suma). |
| REV2-CODE-005 (medium) | acceptat | Ramurile cetățean străin / permis străin / aplicat automat folosesc aceeași etichetă de grup și `<details>` pentru explicații — un singur heading pe pas. |
| REV2-CODE-006 (medium) | acceptat | `notifyTeamOfProof` marchează `team_notified_at` doar când Resend a trimis (nu la `skipped`). |
| REV2-CODE-007 (low) | acceptat | `SearchableSelect` primește `id` + `aria-invalid` + `aria-describedby`; eticheta „Motivul solicitării" focusează câmpul. |

- **Inspecția Codex, a doua rundă (ultima din buget): REVISE, 5 constatări, toate reparate — reparațiile NEINSPECTATE**

| ID | Disp. | Ce s-a făcut |
|---|---|---|
| REV2-CODE-008 (high) | acceptat | `/submit`: imaginile inline trebuie să fie JPEG/PNG/WebP după magic bytes, ≤ 12 MB; selfie-ul trebuie să fie ALTĂ poză decât actul, comparat pe SHA-256 al obiectelor stocate (eșec la citire = neacceptat). |
| REV2-CODE-009 (high) | acceptat | `attach-payment-proof`: obiectul se CITEȘTE (≤ 10 MB), se verifică magic bytes (JPEG/PNG/WebP/PDF), se calculează SHA-256 și se scriu exact acei octeți sub `proof/<sha256>.<ext>` — fără Head-then-Copy, fără ETag. |
| REV2-CODE-010 (medium) | acceptat | `GET /api/orders/[id]` semnează și cheia imutabilă (`isProofFinalKey`), deci pagina comenzii din cont vede din nou dovada. |
| REV2-CODE-011 (medium) | acceptat | `BankTransferDetails`: suma EUR doar cu curs BNR valid; fără curs, contul EUR apare ca informație, nu ca opțiune de plată cu sumă în RON. |
| REV2-CODE-012 (medium) | acceptat | `PaymentProofUpload` așteaptă `onUploadComplete` (atașarea) înainte de starea verde; pagina de status aruncă la eșec, deci widgetul rămâne în starea de reîncercare. |

- Teste: `attach-payment-proof` (8, incl. octeți non-imagine și email sărit).
  Suita: 164 fișiere, 1987 verzi.
