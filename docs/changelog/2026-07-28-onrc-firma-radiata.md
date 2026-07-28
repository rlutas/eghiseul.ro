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

## Audit pe tot istoricul — a doua comandă afectată

După fix am rulat selectorul peste **toate cele 21 de CUI-uri** din istoricul cozii
ONRC (probă live, doar GET-uri). Rezultat: **2 CUI-uri au dublură**, iar în ambele
cazuri înregistrarea radiată era prima în listă — deci ambele comenzi au primit
documentul greșit.

| CUI | Firmă | Comandă | Ce s-a livrat |
|---|---|---|---|
| 37135520 | ALEXSOFIA LOGISTIC S.R.L. | `E-260728-CEB26` (28.07, licitație) | radiată `J29/391/2017` — retrimis manual |
| 12664800 | ROMINSEM SRL | `E-260720-2ZVY9` (20.07, birou notar public) | radiată `J27/48/2000` — **nedescoperită până acum** |

A doua a fost confirmată citind PDF-ul livrat din S3: „Număr de ordine în Registrul
Comerţului: **J27/48/2000**… Stare firmă: **radiată** în data de 09.01.2001, având ca
motiv schimbare sediu în alt judet". Firma s-a mutat în alt județ, înregistrarea veche
a rămas radiată, iar cea nouă (`J2000000384090`) e în funcţiune.

⚠️ **De făcut manual:** clientul de la `E-260720-2ZVY9` (violeta.verona@rominsem.ro)
are un certificat inutilizabil la notar. Documentul corect se obține din `/admin/onrc`
(upload manual) sau printr-o comandă nouă pe înregistrarea activă.

Restul de 19 CUI-uri au o singură înregistrare, în funcţiune — comportamentul nu se
schimbă pentru ele. Rata dublurilor în traficul nostru real: **2 din 21 (~10%)**.

## Verificare

`npx tsx src/check-pick-firm.ts` în `worker-onrc` — 10 cazuri construite din datele
reale ale probei: cazul incidentului, ordinea inversă a rezultatelor, firmă cu o
singură înregistrare radiată, două înregistrări active, stare lipsă, nume care nu
se potrivește, zero rezultate. Toate trec; `tsc` curat pe ambele repo-uri.

Confirmat live după deploy: selectorul rulat peste rezultatele reale ale portalului
alege `J2018000506398 (funcţiune)` pentru CUI-ul incidentului și `J2000000384090
(funcţiune)` pentru ROMINSEM.

Deploy worker: `git push` (NU „Redeploy" din Railway — rulează build-ul vechi).

## Bonus livrat în aceeași sesiune: downtime-ul ONRC devine vizibil

Partea din eghiseul.ro pentru logarea căderilor de portal există din **19 iunie**
(`/api/onrc/pending?portal=up|down` → `platform_outages`), dar jumătatea din worker
a rămas necommisă ~6 săptămâni. Consecință măsurabilă: în `platform_outages` existau
**doar rânduri `ancpi`, zero `onrc`** — în timpul unei căderi ONRC clientul nu vedea
banner de hold pe constatator, iar adminul afișa „auto · min".

Livrat acum, cu trei întăriri față de varianta inițială:
- proba lovește SSO-ul ONRC o dată la `PROBE_INTERVAL_MS` (implicit **15 min**,
  același interval ca la worker-ul ANCPI) și e servită din cache între tick-uri —
  varianta WIP proba la fiecare tick, adică ~2.900 cereri/zi degeaba;
- **contactul real ține loc de probă**: când worker-ul depune efectiv o cerere și
  obține token-ul, `notePortalReachable()` marchează `up` și amână următoarea probă
  cu un interval întreg. Nu mai întrebăm ceva ce tocmai am aflat (observația lui Raul);
- `down` se raportează abia după **două** probe eșuate consecutiv; un singur hop de
  rețea deschidea o fereastră falsă (se vede la ANCPI: ferestre de 1 minut în iulie).

Net: ~96 de probe pe zi în loc de ~288, și zero probe redundante în perioadele cu
comenzi.

Proba nu poate bloca procesarea — erorile sunt prinse înăuntru, iar rezultatul
călătorește doar ca parametru de query. Confirmat în logurile Railway: `No pending
ONRC jobs. (portal: up)`.

## Ce NU acoperă

Comenzile deja emise pe firma greșită nu se pot corecta automat — API-ul ONRC nu
retrage un document emis. Dacă mai apare o comandă veche cu aceeași problemă, e
tot upload manual din `/admin/onrc`.
