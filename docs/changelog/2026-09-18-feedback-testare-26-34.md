# 18.09.2026 — Feedback-ul de testare, punctele 26–34: un singur card din cont, facturarea pe două niveluri, easybox estimat corect, statusul curat după dovadă
<!-- categorie: comenzi -->

## Pentru echipă

A patra tranșă din testele lui Raul. Ce se schimbă pentru client:

- **Pasul 2, client logat**: un singur card „Datele tale din cont" (nume, CNP,
  data nașterii, actul din cont), cu „Modifică datele" și „Folosește alt act".
  Cele trei blocuri aproape identice (banner verde, cardul actului, „Date
  extrase") au dispărut.
- **„Datele tale sunt în siguranță"**: un singur component, pliat, același
  design peste tot; nu apare deloc pentru clientul logat. Pe pasul cu selfie
  rămâne doar nota despre selfie (pliată).
- **Opțiuni pe telefon**: prețul stă pe rândul lui, sub numele opțiunii,
  aliniat cu textul; iconița și bifa rămân în stânga.
- **Easybox (Sameday)**: estimarea se face acum pentru un locker real
  (cel ales, altfel unul din localitate/județ). Înainte cererea de estimare
  nu trimitea lockerul, pica, și prețul cădea pe 85% din tariful la adresă
  (35 lei la Odoreu). Dacă Sameday tot nu răspunde, fallback-ul rămâne, dar
  cauza apare în log.
- **Livrare**: „Informații despre termenul de livrare" e doar titlu; se
  deschide la apăsare.
- **Facturare, restructurată**: primul nivel „Persoană fizică / Persoană
  juridică", al doilea „Pe mine / Altă persoană" sau „Firma din comandă /
  Firma din cont / Altă firmă". Ce are clientul în cont e preselectat și
  apare ca un rând „Factura se emite pe …" cu „Modifică"; câmpurile se deschid
  doar la „Altă persoană / Altă firmă" sau când datele preselectate sunt
  incomplete.
- **Checkout, transfer bancar**: butonul din bara de jos nu se mai deformează.
- **Pagina comenzii, după „Dovadă verificată — pornește lucrul"**: instrucțiunile
  de plată și cardul de transfer dispar; badge-ul devine „Dovadă verificată".
  Cardul cu IBAN + upload apare doar cât comanda e pe „Așteptare plată".

Nimic nou pentru voi în admin.

**Inspecția Codex pe aceste puncte (sesiune nouă): 4 constatări, reparate**
- Easybox chiar nu se estima nici după primul fix: Sameday cere județ +
  localitate și la locker (verificat live: Odoreu 21,13 lei net față de 25,33
  din fallback și 29,80 la adresă). Reparat; iar după ce clientul alege
  lockerul, prețul se re-estimează pentru lockerul lui.
- Facturarea: alegerea PF/PJ se calculează din datele comenzii la fiecare
  afișare (o comandă PJ nu mai poate arăta „Pe mine" lângă factura pe firmă).

**A doua inspecție (ultima din buget): 5 constatări, reparate, nereinspectate**
- „Modifică datele" sau „Folosește alt act" la pasul 2 înseamnă act + selfie
  din nou la pasul următor (datele schimbate nu pot merge pe actul vechi).
- La imobiliare, proprietarul din pasul de imobil NU e presupus plătitor:
  „Pe mine" deschide formularul gol (sau profilul salvat din cont).
- Pagina comenzii folosește marcajul real „dovadă verificată" pus de echipă,
  nu statusul comenzii (o comandă mutată pe standby nu mai arată fals
  „Dovadă verificată").
- Lista de lockere Sameday: dacă o pagină pică, se folosesc celelalte.
- Prețul opțiunii, pe mobil, aliniat exact cu numele.

---

## Rezumat tehnic

- **26/27** `PersonalDataStep`: un card unic pentru `isPrefilled` (nume, CNP +
  `summarizeCNP`, `accountKyc.identity`), „Modifică datele" → `mode='manual'`,
  „Folosește alt act" → `useOtherDocument`; cardul „Date extrase" ascuns în
  scan mode pentru clientul logat; blocul albastru → `DataSafetyNote` (nou,
  `<details>`), doar pentru guest.
- **29** `KYCDocumentsStep`: linia verde scoasă; `DataSafetyNote` doar când nu
  există selfie de urcat și clientul nu e logat.
- **28** `OptionCard`: `flex-wrap` pe mobil, `PriceChip` pe rând propriu
  (`basis-full pl-[4.25rem]`), inline de la `sm`.
- **30** `SamedayProvider.getQuotes`: `estimate(serviceId, isLocker, lockerId)`
  trimite `oohLastMile` + `lockerId`; lockerul = `request.lockerId` sau primul
  `type='locker'` din `getServicePoints(city, county)` / (`'*'`, county);
  eroarea de estimare e logată. `QuoteRequest.lockerId` + `?locker_id=` pe
  `GET /api/courier/quote`.
- **31** `delivery-step`: nota de termen → `<details>`.
- **32** `billing-step`: `pick: 'me'|'other_pf'|'saved_pj'|'request_pj'|'other_pj'`
  derivat din draft, `editing`, `showForm`; `applyMe/applyOtherPf/applyRequestPj/
  applyOtherPj` peste `handleSourceSelect`/`applySavedPf`/`applySavedPj`;
  preselecție la mount (firma din comandă → firma din cont → „pe mine");
  `PickRow` în locul `SavedProfileCard`; grila veche cu 3 carduri eliminată.
- **33** checkout: `shrink-0 whitespace-nowrap` pe butonul din bara sticky.
- **Inspecție Codex (REVISE, 4)**: REV-BILL-001 — `pick` derivat cu `useMemo`
  din `billing` + context (`manualPick` doar pentru clicul explicit fără date),
  preselecție într-un efect pe `pick`; REV-BILL-002 — `propertyRequester` din
  `state.property.ownerName/ownerCnpCui` în `meAvailable`/`applyMe`;
  REV-SD-001 — `awbRecipient` cu `county/city/address` și la locker +
  `oohLastMile` (fără `lockerId`), verificat live cu `SamedayProvider`;
  REV-SD-002 — `delivery-step` re-estimează cu `locker_id` la alegerea
  lockerului și actualizează cotația în loc.
- **34** status: cardul de transfer cât `payment_status='awaiting_verification'`
  și `proof_verified_at` e null; badge „Dovadă verificată" pe
  `proofVerifiedAt` (expus de `/api/orders/status`).
- **Inspecție 2 (REVISE, 5)**: KYC-ALT-001 — `useOtherDocument` anulează
  scurtătura de cont în `step-builder`, `KYCDocumentsStep`,
  `PersonalDataStep`; „Modifică datele" setează și el flagul.
  BILL-OWNER-001 — `propertyRequester` eliminat; `meAvailable` =
  self/saved/`pfOptionIsCustomer`. STATUS-PROOF-001 — `proof_verified_at`
  canonic. SD-COLD-001 — `Promise.allSettled` pe paginile ooh-locations,
  listă parțială neîncachetată. OPT-ALIGN-001 — `pl-[5.25rem]`.
