# 12.11.2026 — Adresa de domiciliu: obligatorie, cu țara corectă și dusă în facturare
<!-- categorie: documente -->

## Pentru echipă

Trei reparații la adresa de domiciliu, toate la pasul „Date Personale”:

1. **Adresa de domiciliu este acum obligatorie** pentru cetățenii români, la serviciile unde formularul o cere (stare civilă, celibat și celelalte; nu la caziere, unde secțiunea nu apare). Înainte, câmpurile aveau steluță, dar clientul putea trece cu ele goale, iar contractul ieșea fără domiciliu. Acum completează fie adresa din România (cel puțin județul și localitatea; strada nu e obligatorie, fiindcă multe sate nu au străzi), fie „Nu, în străinătate” cu țara și adresa.
2. **Cetățeni străini fără domiciliu în România**: „Țara de domiciliu” se salvează separat. Înainte, alegerea ei scria peste **țara nașterii**. Adresa lor din străinătate apare acum pe contract, cu țara.
3. **Facturarea** pornește de la țara și adresa din străinătate, când clientul a declarat domiciliul acolo. El mai adaugă doar localitatea.

Ce faceți diferit: nimic la comenzile noi. La comenzile telefonice adresa rămâne opțională, o completați când o aveți.

Atenție la comenzile mai vechi de cetățeni străini cu domiciliul în străinătate: țara nașterii din comandă poate fi de fapt țara de domiciliu. Verificați în act înainte de a genera cererea.

---

## Ce s-a schimbat în cod

- `PersonalDataStep.tsx`: `needsRomanianAddress()` cere județ + localitate când secțiunea de adresă e vizibilă, cetățenia e română, nu e comandă telefonică și clientul nu a ales domiciliu în străinătate. Selectul „Țara de domiciliu” al cetățenilor străini scrie în `foreignData.domicileCountry`, nu în `foreignData.birthCountry`; obligatoriu la „Nu”.
- `contact-step.tsx`: păstrează `domicileCountry` când se schimbă localitatea sau țara nașterii.
- `src/lib/orders/domicile.ts`: `resolveDomicile()` citește și `foreignData.foreignAddress` + `domicileCountry` (cetățean străin, `hasRomanianAddress === false`). La comenzile vechi, fără `domicileCountry`, tipărește doar adresa.
- `billing-step.tsx`: `prefillFromId` pornește de la `domicileAbroad` (țară + adresă), cu localitatea goală.

## Verificat

- `tests/unit/lib/orders/domicile.test.ts`: cetățean străin cu țara de domiciliu diferită de țara nașterii, comandă veche fără țară, cetățean străin cu adresă în România.
- Toate testele unitare.
- În browser, local: adresă goală → „Continuă” cere județul și localitatea; județ + localitate fără stradă → trece.
- Netestat în browser: fluxul cetățeanului străin și precompletarea facturării.

## Limite cunoscute

- Validarea de pe server (`src/lib/validations/foreign-citizen.ts`) nu cere încă țara de domiciliu; o cere doar formularul.
- Ciornele începute înainte de azi de cetățeni străini cu domiciliul în străinătate trebuie să aleagă din nou țara de domiciliu dacă revin la pasul 2.
