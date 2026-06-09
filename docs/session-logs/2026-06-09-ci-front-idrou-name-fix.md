# Sesiune 2026-06-09 — Fix nume CI față: prefixul MRZ „IDROU" scăpa în lastName

**Status:** ✅ Aplicat în cod (10 teste noi + build OK)
**Fișiere:** `src/lib/services/document-ocr.ts`, `tests/unit/lib/services/document-ocr-ci-front-names.test.ts`

---

## Bug raportat

La un CI vechi (holder ANDREI EUGEN), pagina „Date extrase" arăta clientului **„IDROU ANDREI EUGEN"**. Gemini extrăsese:
- `lastName: "IDROU"`  ❌
- `firstName: "ANDREI EUGEN"`  ❌

Corect, de pe card:
- Nume (Last name): **ANDREI**
- Prenume (First name): **EUGEN**

## Cauză

CI-ul e format **vechi cu MRZ pe 2 linii (TD2)**, unde numele e pe **linia 1, după prefixul `IDROU`**:
```
Linia 1: IDROUANDREI<<EUGEN<<<<<...   (ID = tip act, ROU = țară, apoi SURNAME<<GIVEN)
Linia 2: NZ261166<4ROU7206018M31080312747856
```
Gemini a tratat `IDROU` (tip document + cod țară) ca parte din nume. Parserul determinist existent `parseRomanianEciMrz` acoperă **doar** formatul nou eCI (TD1, nume pe linia 3), deci la CI față numele nu era niciodată corectat din MRZ.

## Fix

În `document-ocr.ts`:

1. **`recoverNamesFromMrz(mrz)`** (export nou) — recuperă surname/given din MRZ pentru ambele layout-uri:
   - TD2 (nume pe linia 1, după prefixul `IDROU`/`IROU`/`I<ROU`)
   - TD1 (nume pe linia 3 `SURNAME<<GIVEN`)
   - Respinge liniile cu cifre (linia doc-number/CNP) și NU strică numele care încep cu „I" (ex. IONESCU).

2. **`correctCiFrontNames(result)`** (export nou) — apelat în `extractFromCIFront` după `applyMrzCnpFallback`. MRZ-ul e sursa de adevăr pentru **split-ul** nume↔prenume; reconstruiește din MRZ doar când split-ul vizual diferă, dar **recuperează diacriticele** din câmpurile vizuale (MRZ e ASCII). No-op când datele sunt deja corecte sau MRZ n-are nume utilizabil.

3. **Prompt Gemini** (CI față) — adăugat bloc „⚠️ NUME vs PRENUME (CRITIC)": „IDROU" = tip act + țară, NU face parte din nume; formatul MRZ e `SURNAME<<GIVEN_NAMES`.

## Verificare

- `tests/unit/lib/services/document-ocr-ci-front-names.test.ts` — 10 teste noi (TD2, TD1, anti-corupție „IONESCU", păstrare diacritice „ȘTEFĂNESCU", no-op pe date curate)
- Toate testele serviciilor: **225 passed**
- `npm run build` → OK

## Notă produs

Afișarea „Date extrase" e `lastName firstName` = **„ANDREI EUGEN"** (nume de familie primul, ca pe document). Dacă vrei ordinea prenume-nume („Eugen Andrei"), e o schimbare separată de UI în `PersonalDataStep.tsx`.
