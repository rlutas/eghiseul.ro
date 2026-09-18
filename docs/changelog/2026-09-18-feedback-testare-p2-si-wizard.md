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
- Teste: `customer-timeline.test.ts` (dedupe, ascunse, etichete). Suita: 159
  fișiere, 1970 verzi.
