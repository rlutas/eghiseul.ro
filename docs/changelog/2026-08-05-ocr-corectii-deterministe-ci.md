# 2026-08-05 — OCR CI: corecții deterministe (serie din MRZ, localitate din adresă) + bug nume în P, pe toate 3 platformele

## Rapoarte echipă (CJO)

1. `CJO-20260804-61939` — „extrage incorect numele de familie"
2. Maria: „la județ și localitate mai greșește sistemul"

Verificat pe actul real din storage (CI PARASCHIV CĂTĂLIN-ALEXANDRU, seria SZ, domiciliu Sat. Vlădeni).

## Ce era stricat

| Problemă | Exemplu | Cauză |
|---|---|---|
| Seria CI greșită | „IL" în loc de „SZ" | Gemini citea JUDEȚUL din adresă drept serie |
| Localitatea domiciliului greșită | „Slobozia" (locul nașterii) în loc de „Vlădeni" | Modelul confundă domiciliul cu locul nașterii (ambele pe față) |
| Numele în P mutilate | „PARASCHIV" → „SCHIV" | **BUG în fixul din 28.07**: strip-ul de prefix MRZ rula secvențial — după „IDROU", regexul de pașaport (P+3 litere) mai tăia o dată din numele rămas. Prins de testele noi. |
| Cratimele pierdute | „CĂTĂLIN-ALEXANDRU" → „CATALIN ALEXANDRU" | Corecția din MRZ nu era hyphen-tolerantă → rebuild din MRZ (fără diacritice) |

## Fixuri (deterministe, nu prompt-tweaks)

- `extractDocNumberFromMrz` — seria+numărul din **MRZ** (are cifră de control), formate TD1 (eCI nou) și TD2 (CI vechi); bat citirea vizuală când diferă.
- `deriveCityFromFullAddress` — localitatea domiciliului din **adresa brută** de pe act (Sat > Com > Mun/Orș), care se extrage corect.
- `applyCiDeterministicCorrections` — aplicate pe `ci_front` + `ci_back`.
- Strip prefix MRZ: **either-or** (IDROU sau P<ROU), nu secvențial.
- `correctNamesFromMrz`: comparație hyphen-tolerantă → numele compuse păstrează cratima și diacriticele.

## Livrare

- CJO/ecazier: `656a7311` (cherry-pick pe origin/main, migrarea ecazier tot nepushată) — 291 teste.
- eghiseul: bug P `a669867` + port complet `b727cfc` — 1436 teste. Verificat întâi dacă e nevoie: eghiseul NU păstrează OCR-urile brute pe comenzi (doar s3Key) → verdictul a fost structural (cod identic, aceleași prompturi/model, seria ajunge pe cereri/împuterniciri prin `buildCIInfo`).
- DB: `CJO-20260804-61939` corectat manual (SZ / Vlădeni / CĂTĂLIN-ALEXANDRU) — cererea/împuternicirea de regenerat din admin dacă erau emise cu seria IL.
