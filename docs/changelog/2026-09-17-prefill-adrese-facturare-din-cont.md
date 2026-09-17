# 17.09.2026 — Adresele și profilul de facturare din cont completează comanda
<!-- categorie: comenzi -->

## Pentru echipă

Clientul care are cont și și-a salvat adrese în secțiunea „Adrese" le vede acum
la pasul de livrare, într-o listă „Folosește o adresă salvată" deasupra
formularului. Alege una și se completează județul, localitatea, strada,
numărul, blocul și codul poștal dintr-o mișcare; poate modifica orice câmp
după aceea, nimic nu e blocat.

La fel, profilul de facturare „persoană fizică" salvat în cont completează acum
datele de facturare, așa cum profilul de firmă o făcea deja. Se întâmplă doar
acolo unde cardul „persoană fizică" înseamnă chiar clientul (imobiliare, comenzi
pe firmă); la cazier, unde există „Facturează pe mine" din actul scanat, cardul
„Altă persoană fizică" rămâne gol, ca până acum.

La comanda telefonică nu se completează nimic din cont — comanda e a clientului
de la telefon, nu a operatorului logat.

---

## Ce era

Ambele lucruri erau write-only: clientul le salva în cont și nu le mai vedea
niciodată.

- `GET /api/user/prefill-data` returna `savedAddresses`, dar niciun consumator
  în tot `src/` — tabul „Adrese" nu prefila nimic.
- Tabul „Facturare" salvează profiluri cu `type: 'persoana_fizica'` și
  `'persoana_juridica'`, iar `billing-step.tsx` citea doar
  `persoana_juridica`; ramura PF se construia exclusiv din pasul de KYC, deci
  pe serviciile fără scan de act (imobiliare) profilul salvat nu făcea nimic.

## Ce s-a livrat

**Livrare.** `SavedAddressPicker` (același tipar ca `SavedVehiclePicker` de la
cazier auto: select simplu, deasupra formularului, invizibil pentru guest și
pentru cine n-are adrese salvate) citește `GET /api/user/addresses` și aplică
adresa aleasă pe formularul domestic.

Capcana: pasul de livrare golește în cascadă câmpurile de sub județ la
schimbarea județului și pe cele de sub localitate la schimbarea localității
(efectele există ca să nu rămână o stradă dintr-un alt oraș). O adresă salvată
completează tot lanțul dintr-o dată, deci cascada ar fi șters exact ce tocmai
am pus. Rezolvat cu `isApplyingSavedAddress`, un ref ținut o singură „tură"
(`setTimeout(..., 0)`, același truc ca `isInitialMount`).

Filtre, în `src/lib/delivery/saved-address.ts` (pur, testat): se oferă doar
adrese din România (Fan Courier/Sameday nu livrează altundeva) și doar cele cu
stradă + localitate + un județ care se mapează pe dropdown. Codul poștal se ia
doar dacă are 6 cifre — altfel formularul ar afișa eroare pe un câmp neatins.

**Facturare.** `src/lib/wizard/saved-billing-profile.ts` (pur, testat) mapează
profilul PF salvat pe câmpurile pasului. Se aplică la selectarea cardului PF,
simetric cu `company`, și doar când setul de opțiuni NU conține „Facturează pe
mine" — adică unde cardul PF înseamnă clientul. Profilul salvat are nume, CNP
și o singură linie de adresă: localitatea și județul (obligatorii pentru Oblio)
rămân de completat, deci pasul nu devine valid din greșeală.

Re-apăsarea cardului PF deja selectat nu mai șterge ce a tastat clientul
(înainte golea tot, inclusiv o adresă de facturare din străinătate).

**Mod telefonic.** Ambele căi sunt tăiate cu `isPhoneOrderMode()`, ca
`PREFILL_FROM_PROFILE` din provider. Gardă adăugată și pe profilul de firmă,
care până acum se prefila și în modul telefonic — adică datele firmei
operatorului ajungeau pe comanda clientului.

**Colateral.** `canonicalCountyName()` nou în `src/lib/data/romania-counties.ts`:
`findCounty()` compară literal, deci „Bucuresti" fără diacritice nu găsea nimic,
iar rezultatul trebuie să se potrivească cu o opțiune din dropdown.

## Fișiere

| Fișier | Ce face |
|---|---|
| `src/lib/delivery/saved-address.ts` | filtrare + mapare adresă salvată → formular (pur) |
| `src/lib/wizard/saved-billing-profile.ts` | mapare profil PF salvat → câmpuri de facturare (pur) |
| `src/components/orders/steps-modular/SavedAddressPicker.tsx` | selectul „Folosește o adresă salvată" |
| `src/components/orders/steps-modular/delivery-step.tsx` | aplicarea adresei + gardă pe cascade |
| `src/components/orders/steps-modular/billing-step.tsx` | ramura PF prefilată, gardă mod telefonic |
| `src/lib/data/romania-counties.ts` | `canonicalCountyName()` |
| `tests/unit/lib/delivery/saved-address.test.ts` | 10 teste |
| `tests/unit/lib/wizard/saved-billing-profile.test.ts` | 6 teste |
