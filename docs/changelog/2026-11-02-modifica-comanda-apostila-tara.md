# 02.11.2026 — „Modifică comanda": apostila de la Camera Notarilor nu mai blochează linkul de plată
<!-- categorie: comenzi -->

## Pentru echipă

- Când comanda are deja Apostila Haga și adăugați Legalizare + Apostilă Notari, linkul de plată extra se creează normal.
- Până acum apărea „Selectează țara pentru apostilă", deși țara era deja aleasă în listă, și nu puteați trece mai departe. Pe E-260918-SGXMY ați ocolit cu un serviciu extra scris de mână.
- Cele două apostile folosesc aceeași țară. Apostila adăugată o preia automat pe cea de pe comandă. Dacă vreți altă țară, o schimbați din listă.

---

## Tehnic

- Cauza: `toggleOption` adăuga `apostila_notari` fără `metadata.country`. Selectul de țară e comun și apare sub Haga cu valoarea deja setată, deci `onChange` nu se declanșa. Validarea din client citea țara de pe Haga și trecea; serverul (`modify/route.ts`) cerea țara pe rândul nou → 400 `MISSING_COUNTRY`.
- Dialog: apostila adăugată moștenește țara apostilei existente.
- Server: `sharedApostilleCountry()` (`src/lib/orders/modify-diff.ts`) completează țara lipsă pe Haga/Notari înainte de validare.
- Teste în `tests/unit/lib/orders/modify-diff.test.ts`.
