# 23.11.2026 — Cazierul pe persoană fizică apărea ca „Persoană juridică”
<!-- categorie: comenzi -->

## Pentru echipă

- Unele comenzi de cazier judiciar pe persoană fizică apăreau în admin ca „Persoană juridică”. Nu aveau CUI sau firmă, dar aveau CNP, buletin și facturare pe persoană fizică.
- Cauza: clientul își redeschidea comanda (din linkul de continuare sau după un refresh), iar formularul îl trecea singur pe „juridică”. Clientul nu alegea „juridică”.
- Actele generate au fost corecte: cererea de eliberare a ieșit pe persoană fizică la toate comenzile.
- De acum, la redeschidere, formularul păstrează ce a ales clientul.
- În plus, la plată: o comandă marcată „juridică” fără CUI și fără nume de firmă se salvează automat ca persoană fizică.
- Cele 4 comenzi plătite afectate au fost corectate pe persoană fizică.
- Dacă mai vedeți o comandă „juridică” fără CUI și fără nume de firmă, tratați-o ca persoană fizică și trimiteți codul comenzii.

---

## Ce s-a întâmplat

`serverOrderToCache()` (`src/providers/modular-wizard-provider.tsx`) deducea tipul clientului la reluarea draftului de pe server astfel: `cd.company ? 'PJ' : …`. Serviciul combinat `cazier-judiciar` (cu selector PF/PJ) are `companyKyc.enabled`, așa că `INIT_SERVICE` creează un obiect `company` gol pentru orice client, iar autosave-ul îl scrie în `customer_data`. Orice reluare de pe server (`?order=`, `?resume=`, sau reload când copia de pe server e mai nouă decât localStorage) transforma un draft PF în PJ.

Utilizatorul nu vedea pasul „Date firmă”: draftul revenea pe pasul salvat, care era după acel pas. Autosave-ul următor scria `clientType: 'pj'` în DB. Verificarea documentelor de firmă din `/submit` pornește doar când există `company.cui`, deci nu a blocat plata.

Ce s-a schimbat: `clientTypeFromServerDraft()` (`src/lib/wizard/restored-client-type.ts`) folosește `customer_data.clientType` salvat (din 18.09), iar deducerea veche rămâne doar pentru drafturile fără alegere salvată (serviciile fără selector). A doua protecție, la `/submit`: `flippedCompanyClientType()` — pe serviciile cu `clientTypeSelection.enabled`, `clientType: 'pj'` fără `company.cui` și fără `company.companyName` se salvează ca `pf` (pasul „Date firmă” nu lasă un PJ real să treacă fără ele). Test: `tests/unit/lib/wizard/restored-client-type.test.ts`.

## Comenzi afectate (cazier-judiciar, din 01.10)

Cele 4 comenzi plătite au primit `customer_data.clientType = 'pf'` pe 23.11.

| Comandă | Status | Ce s-a generat |
|---|---|---|
| E-261019-CX84E | completed | cerere PF |
| E-261118-2XXEZ | completed | cerere PF |
| E-261118-YAMCQ | submitted_to_institution | cerere PF |
| E-261118-X6FMM | la_tradus | cerere PF |
| E-261105-PPPE9 | draft | — (facturare PJ, neclar; lăsat neatins) |
