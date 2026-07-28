# 2026-07-28 — ONRC emitea pe firma radiată când CUI-ul avea două înregistrări

**Incident:** comanda `E-260728-CEB26` — certificat constatator cerut pentru
licitație (ALEXSOFIA LOGISTIC S.R.L., CUI 37135520). Worker-ul a emis documentul
pe înregistrarea **radiată**. Echipa a obținut și a trimis manual varianta corectă.

## Cauza

`searchFirm()` din worker lua orb primul rezultat (`content[0]`) al căutării RECOM.
Pentru CUI-ul ăsta, căutarea întoarce **două** înregistrări, cu același nume și
același CUI:

| # | Nr. ordine | Stare |
|---|---|---|
| 0 | `J29/391/2017` | **radiată** (cod 1084) |
| 1 | `J2018000506398` | **funcţiune** (cod 1048) |

Verificat pe API-ul real cu o probă read-only (`worker-onrc/src/probe-company.ts`,
doar GET-uri — fără draft, fără plată). Trei lucruri de reținut, toate contraintuitive:

1. **`active=true` din query nu filtrează nimic** — întoarce ambele înregistrări.
2. **`companyStatus` e `undefined`** pe rezultatul căutării. Starea reală stă în
   `companyStatusList[].firmStatus` → `{name, code}`.
3. Numele stării vine cu **cedilla legacy**: `funcţiune` (ţ U+0163), nu virgulă
   dedesubt — aceeași capcană ca la diacriticele ANAF. Orice comparație pe text
   trebuie normalizată; de-aia comparăm întâi pe cod.

## Fixul

`pickFirmHit()` (worker `e5aa4d6`) alege în ordinea asta:

1. filtrează după numele firmei din comandă;
2. exact una în funcţiune → aia e;
3. mai multe în funcţiune → `NEEDS_OPERATOR` (nu ghicim);
4. niciuna activă, dar o singură înregistrare → o folosim (firma chiar e radiată,
   iar certificatul care spune asta e răspunsul corect);
5. mai multe înregistrări, niciuna activă → `NEEDS_OPERATOR`.

Regula „activă" e strictă deliberat: o înregistrare care poartă **și** „radiată",
**și** „funcţiune" pleacă la operator. Un click al operatorului costă mai puțin
decât 30 de lei plus un document greșit trimis clientului.

## Vizibilitate

Înregistrarea aleasă apare acum în două locuri, ca să nu mai fie nevoie de
arheologie: în alerta Slack de la plată și în jurnalul comenzii din `/admin/onrc`
(„Depus pe înregistrarea J2018000506398 (funcţiune)"). A fost adăugat câmpul
opțional `note` pe `POST /api/onrc/result` (status `CHECKPOINT`), logat ca eveniment.

## Verificare

`npx tsx src/check-pick-firm.ts` în `worker-onrc` — 10 cazuri construite din datele
reale ale probei: cazul incidentului, ordinea inversă a rezultatelor, firmă cu o
singură înregistrare radiată, două înregistrări active, stare lipsă, nume care nu
se potrivește, zero rezultate. Toate trec; `tsc` curat pe ambele repo-uri.

Deploy worker: `git push` (NU „Redeploy" din Railway — rulează build-ul vechi).

## Ce NU acoperă

Comenzile deja emise pe firma greșită nu se pot corecta automat — API-ul ONRC nu
retrage un document emis. Dacă mai apare o comandă veche cu aceeași problemă, e
tot upload manual din `/admin/onrc`.
