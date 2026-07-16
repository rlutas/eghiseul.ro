# 2026-07-16 — Celibat: țara căsătoriei la intenție de căsătorie în străinătate

**Cerință Raul:** la certificat de celibat, când clientul răspunde „Da" la „Solicitați certificatul în vederea încheierii căsătoriei în străinătate?", să apară întrebarea extra: **în ce țară va fi folosit actul** — cu listă completă de țări.

**Caz real:** E-260716-RAFUG (plătită azi) — `marriageAbroadIntent: true` + numele viitoarei soții, dar țara lipsea din date; echipa o deducea doar din opțiunea de apostilă.

## Implementare

- `CivilStatusStep.tsx`: câmp nou condițional „**În ce țară va avea loc căsătoria (unde va fi folosit certificatul)?**" — apare DOAR când `marriageAbroadIntent === true` și serviciul nu are deja `countryOfUse` activat în config (fără dubluri). SearchableSelect pe lista mondială, fără România (actul e explicit pentru străinătate). Obligatoriu (intră în lista „Ca să poți continua…"). La schimbarea răspunsului pe „Nu", țara se golește din state.
- **Fără migrare de config**: `fields.countryOfUse` rămâne `false` la celibat; condiția e derivată din răspunsul clientului — regula se aplică automat oricărui serviciu civil-status cu `marriageAbroadIntent` activ.
- `src/config/countries.ts`: audit listă — 195 → **196 țări** (adăugat Palestina), fără duplicate, ordonare umană (ex. „Republica Centrafricană" la C), „Marea Britanie" denumirea uzuală. Căutarea din SearchableSelect acoperă restul.
- Valoarea se salvează în `customer_data.civil_status.countryOfUse` — vizibilă în admin la datele de stare civilă.
