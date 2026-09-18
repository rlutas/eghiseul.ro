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

Nimic nou pentru voi în admin. Punctele 26–34 sunt reparate fără inspecție
Codex separată (bugetul buclei anterioare e consumat); dacă vrei o rundă,
spune.

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
- **34** status: cardul de transfer doar la `status='awaiting_payment'`; badge
  „Dovadă verificată" când `payment_status='awaiting_verification'` și statusul
  a trecut mai departe (`work_started_on_proof`).
