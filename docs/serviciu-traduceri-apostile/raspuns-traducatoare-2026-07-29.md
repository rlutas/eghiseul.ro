# Răspunsul traducătoarei (Iudith Bancoș, 29 iul) — prețuri confirmate + marje

**Sursă:** Excel completat (`~/Downloads/Preturi-traduceri-eghiseul (1) (1).xlsx`) + mesaj.
**Esențial fiscal:** traducătoarea e NEPLĂTITOR de TVA — facturează simplu, fără TVA.
Noi vindem cu TVA 21% inclus, deci din prețul de site rămâne net doar `preț / 1,21`,
iar costul ei se scade din net. Toate marjele de mai jos țin cont de asta.

## Prețurile confirmate (per DOCUMENT simplu, 1 pagină, fără TVA)

| Limbă | Cost/doc | Termen | Suprataxă când comanda are și Apostilă Haga |
|---|---|---|---|
| Engleză (UK/SUA/AUS), Franceză, Italiană, Spaniolă, Germană, **Maghiară** | 45 | 1 zi | 20 (DE: 35) |
| Portugheză | 65 | 1 zi | 35 |
| Olandeză | 85 | 1 zi | 35 |
| Rusă, Ucraineană | 90 | 1 zi | 70 (cod QR) |
| Bulgară ⚠️ | 100 | 2 zile | 50 — **DOAR traducere autorizată, FĂRĂ legalizare notarială** |
| Poloneză, Greacă | 110 | 2 zile | 30 |
| Cehă, Slovacă | 110 | 3 zile | 30 |
| Suedeză | 130 | 4 zile | 60 |
| Daneză, Norvegiană | 150 | 4 zile | 75 |

Reguli suplimentare din mesaj:
- **Acte complexe:** aceleași tarife, dar la caractere — **1 pagină = 2.000 caractere cu spații** (mărime 12).
- **Acte medicale:** +10 lei la tariful normal.
- **Suedeză/daneză/norvegiană:** traducătorul EVALUEAZĂ comanda înainte de preluare.
- Tarifele „pot fi ușor mărite în funcție de complexitate".
- Secțiunea 2 (diplome/contracte/sentințe) — **NECOMPLETATĂ**; acoperită doar de regula caracterelor.

**Coloana „apostilă" (clarificat de Raul, 29 iul):** e SUPRATAXA traducătoarei când
comanda include și **Apostila de la Haga** — se traduce și apostila, deci costul
traducerii crește cu suma din coloană (+20 EN/FR/IT/ES/HU … +75 DA/NO; RU/UA +70 cu
cod QR). Consecință pe marjă: apostila Haga rămâne venit ~198 lei cu cost instituțional
zero, dar pe comenzile traducere+apostilă costul REAL al traducerii = cost/doc +
suprataxa limbii. Ex. engleză: 45+20=65 → marja traducerii scade din 102,52 la 82,52,
compensată de marja apostilei. **Regulă pentru echipă la pop-up-ul de costuri:** dacă
comanda are și apostilă Haga, adaugă suprataxa limbii peste suma pre-completată
(sugestia automată nu o știe încă).

## Marja pe limbile ACTIVE azi (client plătește 178,50 cu TVA → net 147,52)

| Limbă | Cost | Marjă netă | % din net |
|---|---|---|---|
| EN×3, FR, IT, ES, DE | 45 | **102,52** | 69% |
| Portugheză | 65 | 82,52 | 56% |
| Olandeză | 85 | 62,52 | 42% |

Sănătos peste tot. Nota veche „de renegociat, țintă 30-35" e ISTORIE — 45 e confirmat.

## Limbile NOI pe care le acoperă și nu le vindem — marja la prețul actual (178,50)

| Limbă | Cost | Marjă la 178,50 | Verdict |
|---|---|---|---|
| **Maghiară** | 45 | 102,52 (69%) | ✅ de activat IMEDIAT la prețul existent |
| Rusă, Ucraineană | 90 | 57,52 (39%) | acceptabil, dar mai bine tier nou |
| Bulgară | 100 | 47,52 (32%) | tier nou + mențiune „fără legalizare" |
| Poloneză, Cehă, Slovacă, Greacă | 110 | 37,52 (25%) | subțire → tier nou |
| Suedeză | 130 | 17,52 (12%) | ❌ nu la 178,50 |
| Daneză, Norvegiană | 150 | **−2,48 (PIERDERE)** | ❌ nu la 178,50 |

### Propunere de preț pe 3 trepte (de decis Raul)

| Treaptă | Limbi | Preț client (cu TVA) | Net | Marjă |
|---|---|---|---|---|
| 1 (există) | EN, FR, IT, ES, DE, PT, NL + **HU** | 178,50 | 147,52 | 62–102 lei |
| 2 (nou) | RU, UA, BG, PL, CS, SK, EL | **249** | 205,79 | 96–116 lei (47–56%) |
| 3 (nou) | SV, DA, NO | **349** | 288,43 | 138–158 lei (48–55%), cu evaluare prealabilă |

## ✅ IMPLEMENTAT 29 iul seara (commit `8f629c8`) — eghiseul.ro

- **Preț per limbă în wizard**: opțiunea traducere își ia prețul din
  `translation_price_list.clientPriceDoc` (dropdown cu preț lângă limbă,
  se aplică și pe opțiunile bundled). Gardă server-side la submit — corectează
  în sus dacă payload-ul a fost umblat.
- **20 de limbi ACTIVE** pe toate cele 9 servicii cu opțiune de traducere
  (cazier PF/PJ/auto/fiscal, integritate, naștere, căsătorie, celibat) —
  lista e GLOBALĂ, nu per serviciu. Trepte: 178,50 / 249 / 349.
- **Bulgară**: legalizarea notarială blocată în wizard (card dezactivat +
  explicație + auto-drop).
- **Setări → Traduceri**: coloană „Cost apostilă" (suprataxa Haga per limbă,
  completată pe toate 20) + marja afișată e NETĂ (÷1,21). Switch-ul „Activ"
  per limbă controlează live dropdown-ul din wizard — dezactivarea unei limbi
  nu cere deploy.
- Tarifele traducătoarei în Setări → Furnizori (pop-up-ul de costuri
  pre-completează costul real per limbă).

**Completat seara (commits `e523add`, `f4d660c`):**
- **Supliment CLIENT la Apostilă Haga** per limbă (`clientPriceApostilaExtra` =
  2× costul, rotunjit la 10: EN +40 … DA/NO +150) — aplicat automat în wizard la
  bifarea apostilei, în garda de la submit și în **ruta Modifică** (plata extra
  trimitea flat-ul din catalog). Editabil în Setări → Traduceri („Supl. client").
- **Pop-up-ul de costuri** pre-completează cost/doc + suprataxa de apostilă când
  comanda are Haga (nu se mai adună de mână).

**RĂMAS:** portarea pe cazierjudiciaronline.com + ecazier.ro (liste proprii,
probabil hardcodate) · termen per limbă afișat în wizard (1–4 zile) ·
acte medicale +10 lei (doar în evidența internă). Changelog complet:
[2026-07-29-traduceri-pret-per-limba.md](../changelog/2026-07-29-traduceri-pret-per-limba.md).

## Cum funcționa logica ÎNAINTE (istoric) + restul îmbunătățirilor

**Azi:** opțiunea `traducere` = **178,50 flat pe 9 servicii**, indiferent de limbă;
limba e doar metadata (dropdown din `translation_price_list` → limbile active).
Câmpul `clientPriceDoc` din listă EXISTĂ dar wizardul NU-l folosește la preț.

**De îmbunătățit (în ordinea necesității):**
1. **Preț per limbă în wizard** — fără asta nu putem activa trepte: opțiunea să-și ia
   prețul din `clientPriceDoc` al limbii selectate (+ gardă server-side la submit,
   ca la CUI/prețuri). Condiție pentru activarea limbilor din treapta 2-3.
2. **Bulgară + legalizare = combinație imposibilă** — dacă activăm bulgara, wizardul
   trebuie să blocheze/ascundă legalizarea la ea.
2b. **Suprataxa de apostilă în sugestia de cost** — când comanda are traducere +
   apostilă Haga, pop-up-ul să pre-completeze cost/doc + suprataxa limbii (azi echipa
   o adaugă manual, după regula din secțiunea de prețuri).
3. Termen per limbă (1–4 zile) — afișat la selecție; azi termenul traducerii e unic.
4. Acte medicale +10 lei — deocamdată doar în evidența internă de costuri, nu în preț.

## Făcut azi (29 iul)

- ✅ `supplier_tariffs`: **20 tarife traducere** încărcate (cost/doc = cost/pagină
  suplimentară, per regula 2.000 caractere) — pop-up-ul de costuri pre-completează
  acum sumele REALE per limbă, inclusiv pe limbile inactive (gata pentru activare).
- ✅ `translation_price_list`: `ourCostDoc` corectat pe toate cele 20 (PT 45→65,
  NL 45→85, restul confirmate), note „cost confirmat 29.07".
- Închide OPEN-ul din `mesaj-echipa-costuri.md` (așteptam Excel-ul).
