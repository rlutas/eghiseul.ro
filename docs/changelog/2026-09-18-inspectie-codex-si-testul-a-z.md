# 18.09.2026 — După inspecția Codex și testul A→Z: KYC cere selfie, comanda cu IBAN se vede, contul e rapid
<!-- categorie: comenzi -->

## Pentru echipă

O inspecție independentă (Codex, sesiune nouă, doar citire) peste tot ce s-a
livrat azi, plus testul lui Raul cu contul legat, au scos 8 + 11 probleme.
Reparate acum, toate live:

**Grav, reparat**
- **Un cont cu doar fața buletinului trecea drept „verificat"** și comanda de
  cazier sărea complet pasul de acte: `E-260918-SJCQY` a ajuns la plată fără
  buletin și fără selfie. De acum „verificat" înseamnă act **și** selfie,
  peste tot (cont, precompletare, trimiterea comenzii). Contul lui Raul a fost
  demarcat; alte conturi nu erau afectate. **Comanda SJCQY trebuie
  completată manual: cereți clientului actul + selfie-ul înainte de depunere.**
- **Comanda cu transfer bancar „nu apărea în admin"**: era în tab-ul
  „Așteptare plată", dar în „Toate" cădea pe ultima pagină (neplătită = fără
  dată de plată = la coadă). Acum comenzile vii neplătite stau în capul listei.
- **„Persoană juridică — EDIGITALIZARE" pe pagina de status** deși clientul
  a aplicat ca persoană fizică și a ales firma doar pe factură. Pagina citea
  tipul din facturare; acum citește solicitantul real, iar formularul
  salvează explicit alegerea PF/PJ.
- Cuponul de bun-venit nu se mai poate folosi pe comanda altui cont, nici
  scris direct în draft; două cupoane create simultan pentru același cont
  (s-a întâmplat) nu mai sunt posibile.

**Contul**
- Schimbarea taburilor nu mai reîncarcă pagina de pe server (lag-ul); pagina
  contului face toate citirile deodată; legarea comenzilor de guest și
  sincronizarea comenzilor plătite se fac după ce pagina s-a afișat; skeleton
  la intrarea în cont.
- Poza scanată la „Date personale" se salvează, dar **nu mai scrie** numele,
  CNP-ul sau adresa înainte să apeși „Salvează" (înainte anularea lăsa datele
  citite de OCR în profil).
- Adresa din act nu mai suprascrie o adresă salvată; se completează doar ce
  lipsea.

**Comanda**
- Pasul 1 nu mai poate pierde telefonul tastat când sosesc datele din cont.
- Pasul 2: pentru un cont cu act complet nu mai apare „Ce tip de act deții?";
  pasul de acte nu mai afișează explicația „de ce avem nevoie".
- Livrare: codul poștal al adresei salvate se completează (și când adresa n-a
  avut cod: din localitate). „000000" era doar textul de ajutor al câmpului
  gol.
- Transfer bancar: cuponul e **deasupra** metodei de plată; după ce urcă
  dovada, textul spune „Am primit dovada", butonul zice „Plasează comanda",
  iar pagina de succes și cea de status spun „Dovadă primită, în verificare".
- Pagina de status: capul comenzii pe rânduri, nu înghesuit în dreapta.

**Prețuri curier (Odoreu):** FAN 25 lei = pragul minim; Sameday 41 lei = tariful
lor rural; easybox 35 lei = 85% din tariful rural, fiindcă estimarea de locker
la Sameday pică (lipsește `oohLastMile`) și cade pe fallback. Nereparat încă —
necesită test cu API-ul Sameday.

**Nefăcute (P2):** sortarea catalogului după popularitate, iconițe și
specimen per serviciu, simplificarea formularului de facturare.

---

## Rezumat tehnic

### Inspecția Codex (round 1: REVISE, 8 constatări) — dispoziții
| ID | Disp. | Ce s-a făcut |
|---|---|---|
| REV-KYC-001 (high) | acceptat | `hasCompleteKyc()` în `lib/kyc/identity-documents.ts` (act + selfie); `kyc/save` recalculează `kyc_verified` din rândurile active, cere `fileKey` sub `kyc/<userId>/` și re-derivă URL-ul prin `getDownloadUrl`; `prefill-data.has_valid_kyc`, `submit` (re-verifică rândurile, nu flagul) și `copy-order-kyc` folosesc același predicat; `migrate_order_to_profile` cere selfie (migrarea 176) + demarcare conturi fără selfie. |
| REV-KYC-002 (high) | acceptat | `kyc/save` primește `storeOnly` (IdScanField îl trimite): niciun write pe profil/adresă/facturare la scanare; adresa potrivită se **completează**, nu se înlocuiește. Documentul rămâne stocat și la anulare — intenționat. |
| REV-COUPON-001 (high) | acceptat parțial | Proprietar strict: comanda trebuie să fie a proprietarului; draft de guest → legat de cont atomic (`update … is('user_id', null)`); `payment/route.ts` elimină cuponul cu proprietar pe comanda altcuiva înainte de încasare. **Rămas:** `times_used` incrementat doar în webhook-ul Stripe, ne-atomic — de mutat într-un RPC apelat din toate căile de plată (rundă separată). |
| REV-SYNC-001 (high) | acceptat | Marker prin `mark_account_sync(uuid, jsonb)` (`||` pe `customer_data`, migrarea 176), scris doar când niciun pas n-a eșuat; `ran:false` altfel → backlog-ul reîncearcă. Dublurile la rulări concurente rămân posibile (fără constrângeri unice) — acceptat, dedupe-ul reduce riscul. |
| REV-CONTACT-001 (medium) | acceptat | `userTyped` (state monoton) setat din `form.watch` doar la evenimente cu `info.name`, ignorând reset-ul (`resettingRef`). |
| REV-ADDRESS-001 (medium) | acceptat | `same-address.ts`: cratimele = spații, județ/țară comparate când ambele există; `kyc/save` merge; `POST addresses` dedupe fail-soft. |
| REV-COUPON-002 (medium) | acceptat | Index unic parțial `coupons_one_welcome_per_owner` (dublurile existente curățate în migrare); `ensureWelcomeCouponForUser` întoarce rândul câștigător la 23505. |
| REV-REMINDER-001 (medium) | acceptat | `order('updated_at')` + eroarea de marker raportată ca `error`. |

### Testul A→Z (Raul) — ce s-a schimbat în cod
- Perf: `AccountTabs` → `history.replaceState` în loc de `router.replace`
  (0 request-uri RSC la schimbarea tabului, verificat); remount doar pe tabul
  care deține pasul salvat; `account/page.tsx` → `Promise.all` pe toate
  citirile + `after()` pentru `claim_guest_orders` și
  `syncUnsyncedPaidOrdersForUser`; `account/loading.tsx`.
- `api/admin/orders/list`: `paid_at DESC NULLS FIRST`.
- `api/orders/status`: `isPJ` via `isPJForDocumentGeneration` + `clientType`;
  expune `hasPaymentProof`, `billingCompanyName`. Wizardul persistă
  `customerData.clientType` (`pf|pj`).
- Checkout: `CouponInput` deasupra `#payment-form-anchor`; textul de după
  dovadă; butonul „Plasează comanda"; bara sticky trimite comanda când
  detaliile sunt pe ecran sau dovada e urcată. Succes: `hasPaymentProof` din
  `api/orders/[id]`. Status: badge „Dovadă primită, în verificare", header
  stivuit.
- `KYCDocumentsStep`: blocul „De ce avem nevoie" ascuns când
  `hasValidAccountKyc`; `PersonalDataStep`: `DocumentTypePicker` ascuns când
  `hasValidKycFromAccount`.
- Livrare: `saved-address.ts` acceptă codul poștal cu spații; efect nou în
  `delivery-step.tsx` completează codul din localitate când câmpul e gol.

### Teste
`has-complete-kyc.test.ts` nou; `user-kyc-save.test.ts` (cheie proprie +
mock S3), `sync-paid-order.test.ts` (cratime, județ). Suita: 158 fișiere,
1966 teste verzi.
