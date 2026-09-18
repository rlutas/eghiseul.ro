# 18.09.2026 — Actul de identitate se cere doar la comandă, iar facturarea pornește din datele scanate
<!-- categorie: clienti -->

## Pentru echipă

Două lucruri găsite de Raul testând contul pe telefon, amândouă reparate.

**1. Contul nu mai cere actul de identitate.** Clientul scana buletinul la
„Date personale" și, un rând mai jos, „Act de identitate" îi cerea să-l
fotografieze din nou. Pasul a dispărut din lista de completare a contului.
Actul și selfie-ul se cer **doar în formularul de comandă**, și doar la
serviciile care au nevoie de ele (caziere, stare civilă). Avantaj: actul
ajunge la instituție mereu proaspăt, nu unul încărcat în cont acum șase luni.
Tabul „Act de identitate" din cont rămâne, cu documentele venite din comenzi.

Ce înseamnă pentru voi: un client cu profil „100% complet" tot va fi întrebat de
act când comandă un cazier. E normal, nu e o problemă de raportat.

**2. „Date de facturare" începe cu o întrebare.** Dacă în cont există deja
numele și CNP-ul (din scanare sau scrise de mână), popup-ul arată datele și
întreabă: *„Le folosim și pe factură?"*

- **Da** + are adresă de livrare din România salvată → profilul de facturare se
  creează pe loc, fără să scrie nimic;
- **Da** + nu are adresă → se deschide formularul cu numele și CNP-ul deja
  puse și îi cere doar adresa;
- **Nu** → formularul obișnuit, unde poate alege și persoană juridică: scrie
  CUI-ul și restul vine de la ANAF.

---

## Rezumat tehnic

### Pasul „identity" scos din cont

- `ProfileStepId` = `contact | personal | address | billing`;
  `profileCompleteness()` nu mai citește `kycDocumentTypes` și
  `serviceInterests` (parametrii au fost scoși din `ProfileInput`, împreună cu
  ramura care ascundea pasul după răspunsul de onboarding). `hasIdentityDocuments`
  rămâne exportată: o folosesc badge-ul din header și `serviceReadiness`.
- `IdentityStepPanel.tsx` șters; `ProfileStepDialog` nu mai are intrarea
  `identity`.
- `serviceReadiness`: rândul lipsă devine „actul de identitate și un selfie, la
  comandă" — clientul nu-l poate bifa din cont, deci spunem unde se cere.
- `interestConsequence()` pentru răspunsurile cu act: „îl fotografiezi direct în
  comandă, ca să fie mereu actual" (înainte promitea că rămâne salvat).
- Wizardul e neschimbat: `has_valid_kyc` din prefill sare peste încărcare
  pentru conturile care au deja documente valide din comenzi.
- Decizie D9 în `docs/dashboard-client/PLAN.md`.

### Facturare din datele profilului

`BillingStepForm` are trei faze: `loading` (citește `GET /api/user/profile` +
`useAddresses()`), `offer` (preview `<dl>` cu nume, CNP, adresă; focus pe
„Da" când apare, fiindcă dialogul a rulat deja `focusFirstField` înainte să
existe conținut) și `form` (ce era). „Da" cu adresă → `create()` direct cu
`streetLineFromIdData(adresă)` + localitate + județ (adresa aleasă: cea
implicită dacă e `RO`, altfel prima `RO`); fără adresă → formularul prefilat,
`role="status"` deasupra și focus pe `#address`. Eticheta profilului e
`formatPersonName(lastName, firstName)`. Dirty = doar ce diferă de valorile cu
care s-a deschis formularul, deci un prefill nu declanșează confirmarea la
închidere. Decizie D10.

Verificat în browser la 390px pe un cont de test (șters după): ambele ramuri
ale lui „Da", profilul rezultat trece `isPfBillingComplete`, checklistul
ajunge la 4/4 și dispare.

### Teste

`profile-completeness.test.ts` (pasul nu mai există, 4 pași, procent întreg),
`service-readiness.test.ts` (textul rândului). 98 de teste verzi pe
`tests/unit/lib/account` + `tests/unit/components/account`.
