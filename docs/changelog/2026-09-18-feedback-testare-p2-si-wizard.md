# 18.09.2026 — Feedback-ul de testare, partea a doua: comanda pornește cu datele contului, fără pasul de acte pentru contul verificat, facturarea din profilurile salvate
<!-- categorie: comenzi -->

## Pentru echipă

A doua tranșă din lista de testare a lui Raul (18 puncte). Ce se schimbă
pentru client — și pentru voi, în admin nu se schimbă nimic:

**Comanda, pentru un client cu cont**
- Pasul 1 se deschide direct cu emailul și telefonul din cont. Nu mai apare
  formularul gol care se umplea singur după o secundă.
- Prima întrebare la pasul 1, când datele sunt din cont: „Aplici ca persoană
  fizică sau juridică?" — abia sub ea rezumatul de contact.
- **Pasul cu actele nu mai apare deloc** pentru un cont cu act și selfie
  valabile, la serviciile care nu cer alte documente. Cazierul auto (cere și
  permisul) îl păstrează. Trimiterea comenzii re-verifică pe server că actele
  sunt acolo — un cont fără selfie nu poate sări pasul.
- Facturare: dacă în cont sunt salvate date de persoană fizică și/sau de
  firmă, clientul vede **doar cardurile cu ce are salvat + „Alte date"**. Alege
  unul și gata; formularul cu câmpuri apare numai la „Alte date" sau dacă
  profilul salvat e incomplet. Datele firmei după verificarea ANAF apar ca text,
  nu ca trei câmpuri blocate.

**Contul clientului**
- „Ce pot comanda": serviciile sortate după cât se comandă (ultimele 90 de
  zile), cu iconița din meniul site-ului și cu o miniatură a specimenului
  (buton „Cum arată actul") acolo unde avem specimen.
- Blocul „Verificare identitate": titlu, o linie de status și un singur buton
  („Alege actul" sau „Încarcă ce lipsește").
- Oferta de cont după plată enumeră concret ce câștigă clientul: precompletare,
  KYC o singură dată, istoric + documente, urmărire status, remindere de
  expirare. Apare și la comanda cu transfer bancar.

**Pagina comenzii din cont și pagina de status**
- Istoricul e în cuvintele clientului („Așteptăm plata", „Dovadă primită — o
  verificăm", „Plată confirmată", „În procesare"...), fără dubluri: fiecare
  etapă apare o singură dată. Notele interne ale echipei nu se văd.
- Comanda cu dovada plății urcată arată „Dovadă primită — în verificare", cu
  poza dovezii vizibilă direct pe comandă.
- Procesarea urgentă apare ca „⚡ Urgent — N zile lucrătoare", fără paragraful
  explicativ. Textul descriptiv de sub numele serviciului a dispărut.
- Capul paginii de status: „Pentru <nume> · factură pe <firmă>", pe rânduri.

**Runda 3 Codex (inspecție nouă peste tot ce s-a livrat azi): REVISE, 9 constatări, reparate**
- Un draft reluat nu mai pierde numele, CNP-ul sau adresa editate când sosesc
  datele din cont (datele din comandă au prioritate, contul doar completează).
- Pasul de acte sărit și verificarea de la trimitere folosesc aceeași regulă
  (actele active, neexpirate); nu se mai poate ca formularul să ascundă pasul
  și trimiterea să refuze comanda.
- Dovada plății la transfer bancar: se acceptă doar fișierul urcat pentru
  comanda respectivă, existent în stocare; linkul semnat se dă doar pentru el.
- O comandă plătită care a rămas fără cuponul consumat sau fără sincronizarea
  în cont (cădere între „plătită" și pașii următori) se recuperează la orice
  reîncercare și la intrarea în cont.
- Un act expirat din cont nu mai blochează copierea actelor proaspete din
  comanda plătită.
- Adresa salvată se completează cu apartamentul/codul poștal tastat ulterior,
  nu le mai pierde ca „duplicat".
- Înlocuirea unui act în cont: întâi se salvează cel nou, abia apoi se retrage
  cel vechi (nu mai poate rămâne contul fără niciun act activ).
- Un singur fișier declarat și „buletin" și „selfie" nu mai trece drept
  verificare completă (nici la trimitere, nici la copierea în cont).
- Cupon folosit peste plafon de două comenzi simultane: se contorizează
  corect și se semnalează în log (rezervarea la checkout rămâne de făcut).

**Rămase deschise**
- Prețul easybox (35 lei) la Sameday: estimarea de locker cade pe fallback;
  necesită test cu API-ul lor.
- Comanda `E-260918-SJCQY` (testul fără selfie) e închisă ca abandonată.

---

## Rezumat tehnic

Puncte din `eghiseul-feedback-testare.md`: 2, 3, 4, 5 (pasul sărit), 7, 11,
12 (afișare), 13 (descriere), 14, 15, 16, 17, 18 (beneficii).

- **Prefill la prima randare.** `lib/account/prefill.ts` exportă
  `buildUserPrefillData(supabase, user)` (extras din ruta
  `/api/user/prefill-data`, care rămâne pentru clientul vechi). Pagina
  `comanda/[service]` citește sesiunea pe server și dă `initialPrefill` către
  `ModularWizardProvider`; providerul aplică `PREFILL_FROM_PROFILE` în
  inițializatorul `useReducer` și o re-aplică o dată după `INIT_SERVICE` (când
  există `personalKyc`). `?telefonic=1` → `null` (contul e al operatorului).
- **Pasul KYC sărit.** `ModularWizardState.accountKyc = { valid }` setat din
  `prefill.has_valid_kyc` (= `hasCompleteKyc`, act + selfie neexpirate).
  `step-builder` ascunde `kyc-documents` când `accountKyc.valid` și
  `personalKyc.extraDocuments` e gol. `/submit` re-verifică rândurile (neschimbat).
- **Contact-step**: `ClientTypeSelector` mutat deasupra rezumatului în ramura
  precompletată.
- **Billing-step**: `savedChoice` (`pf|pj|other|null`), `SavedProfileCard`,
  `applySavedPf/applySavedPj`; grila clasică și formularele doar la `other`
  sau când profilul ales nu validează; datele PJ post-ANAF ca `<dl>`.
- **Timeline**: `lib/orders/customer-timeline.ts` (`INTERNAL_EVENTS`,
  `HIDDEN_STATUSES`, dedupe pe etapă) folosit de `GET /api/orders/[id]`;
  `paymentProofUrl` semnat 1h + `hasPaymentProof` pe listă și detaliu.
- **Cont**: `ServicesTab` (iconițe `serviceIconBySlug`, specimen, sortare pe
  comenzi plătite 90 zile), `KYCTab` card stivuit, `AccountOfferCard`
  beneficii + ramura transfer bancar pe pagina de succes.
- **Runda 3 Codex (REVISE, 9)** — dispoziții:

| ID | Disp. | Ce s-a făcut |
|---|---|---|
| REV3-PREFILL-001 (high) | acceptat | `PREFILL_FROM_PROFILE`: valoarea din wizard înainte de cea din profil pe toate câmpurile personale și de firmă (era invers); contactul avea deja ordinea corectă. |
| REV3-KYC-002 (high) | acceptat | `/submit` derivă completitudinea din rândurile active neexpirate, fără gate pe `profiles.kyc_verified`. |
| REV3-PROOF-001 (high) | acceptat | `isOrderUploadKey(key, orderId)` în `lib/aws/s3.ts`; `bank-transfer` acceptă doar `orders/<yyyy>/<mm>/<orderId>/uploads/<file>` + `getFileInfo`; `GET /api/orders/[id]` semnează doar chei care trec același test. |
| REV3-PAID-001 (high) | acceptat | Ramurile „already paid" din webhook, `confirm-payment`, `sync-stripe`, `fulfil-paid` apelează `redeemCouponForOrder` + `syncPaidOrderToAccount` (idempotente) înainte de return; `syncUnsyncedPaidOrdersForUser` reconciliază `coupon_code` fără `coupon_redeemed_at`. |
| REV3-SYNC-001 (medium) | acceptat | `sync-paid-order` și `copy-order-kyc` filtrează `expires_at` înainte de `hasCompleteKyc`. |
| REV3-ADDRESS-001 (medium) | acceptat | `missingAddressDetails()` în `same-address.ts`; `POST /api/user/addresses` și sync-ul completează rândul existent cu bloc/scară/etaj/ap./cod poștal/județ/țară lipsă. |
| REV3-KYC-003 (medium) | acceptat | `kyc/save`: insert întâi, apoi `is_active=false` pe predecesori `.neq('id', nou)`, eroarea logată; testul de ordine rescris. |
| REV3-KYC-001 (high) | acceptat parțial | `/submit`: selfie-ul care e același obiect (s3Key/base64) cu actul = lipsă; `copy-order-kyc` cere cheia `kyc/<orderId>/<tip>.<ext>` a tipului declarat + HeadObject. **Deferit:** verificare OCR/face-match server-side înainte de a marca contul verificat. |
| REV3-COUPON-001 (high) | acceptat parțial | Migrarea **178**: `redeem_coupon` întoarce `redeemed_over_cap` când `times_used >= max_uses` (contorizat oricum: banii sunt încasați), `redeem.ts` loghează warn. **Deferit:** rezervarea unei utilizări la checkout + eliberare la abandon. |

- Teste: `customer-timeline.test.ts`, `missing-address-details.test.ts`,
  `is-order-upload-key.test.ts`, `user-kyc-save.test.ts` (ordinea insert →
  retire). Suita: 161 fișiere, 1974 verzi.
