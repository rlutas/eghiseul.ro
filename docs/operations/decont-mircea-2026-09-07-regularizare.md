# Regularizarea decontului cu Mircea — 07.09.2026

Recalcularea decontului din 26.08 (`decont-mircea-2026-08-26.md`), după ce au intrat
toate taxele OCPI și după ce au fost adăugate costurile care lipseau din primul calcul.

**Raport pentru Mircea (valabil):** https://claude.ai/code/artifact/7af1f9b5-d533-4689-b4f6-540bfba0854f
— conține și lista completă a celor 162 de comenzi (încasat, taxă OCPI, comision Stripe, comision 15 lei).

**Raportul din 26.08** (https://claude.ai/code/artifact/e541ea9b-c68c-49a1-8ca6-57007d7d025c) a rămas
online ca istoric, cu banner în capul paginii care trimite la cel nou. ⚠️ Artifactul e partajat prin
link, iar vizitatorii văd versiunea „pinned" — după republicare trebuie mutat pin-ul din meniul de
share, altfel Mircea vede tot varianta veche.

## Perioada

7 iulie – **31 august 2026** (inclusiv), 162 comenzi plătite (fără anulate/rambursate/test).
Cutoff-ul vechi (`E-260826-F7GHD`) e depășit — decontul se face acum cumulat pe toată
perioada, iar din el se scade ce s-a distribuit deja.

## Ce s-a schimbat față de 26.08

| | La 26.08 | Acum | Δ |
|---|---|---|---|
| Comenzi | 159 | 162 | +3 |
| Încasat cu TVA | 17.267,04 | 17.643,04 | +376,00 |
| Taxe OCPI | 2.035,00 | **3.055,00** | +1.020,00 |
| Comisioane Stripe | nescăzute | **451,55** | +451,55 |
| Parte de persoană | 4.316,61 | **3.907,07** | −409,54 |

Cele 53 de comenzi plătite-nelucrate de la primul cutoff au fost lucrate; taxele lor OCPI
au intrat în sistem — exact rezerva #2 din documentul precedent.

## Calculul

| Pas | lei |
|---|---|
| Încasat cu TVA | 17.643,04 |
| − TVA 21% | −3.062,02 |
| **= Net fără TVA** | **14.581,02** |
| − Taxe OCPI | −3.055,00 |
| − Comisioane Stripe | −451,55 |
| **= Profit brut** | **11.074,47** |
| − Impozit profit 16% | −1.771,92 |
| − Impozit dividende 16% | −1.488,41 |
| **= De distribuit** | **7.814,15** |
| **Parte/cap (comisionul inclus)** | **3.907,07** |

> **Decizia lui Raul (07.09):** găzduirea și programele de dezvoltare (500 lei/lună) **NU** se
> alocă zonei imobiliare — rămân cheltuială generală a firmei. `PLATFORM_COST_PER_MONTH = 0`.
> Taxele estimate pe comenzile nelucrate (240 lei) rămân **informative**, nu se provizionează:
> intră în costuri când se lucrează comenzile.

### Cine cât rămâne de dat/luat

**Ce s-a plătit efectiv pe 26.08** (confirmat de Raul, 07.09): lui Mircea i s-au virat
**3.791,61 lei** = partea calculată atunci (4.316,61) **minus comisionul de 525**, pe care îl
încasează prin factură. Raul a luat 4.316,61 direct. Deci amândoi au primit aceeași valoare.

| | Cuvenit | Cash primit | Comision prin factură | Total primit | De reglat |
|---|---|---|---|---|---|
| Raul | 3.907,07 | 4.316,61 | — | 4.316,61 | **409,54** |
| Mircea | 3.907,07 | 3.791,61 | 525,00 (net) | 4.316,61 | **409,54** |

Comisionul perioadei e **555 lei** (37 comenzi × 15); factura din 28.08 acoperă 525, deci Mircea mai
are de facturat **30 lei**. Poziția lui netă: 409,54 − 30 = **379,54**. Nu se returnează nimic: factura se plătește la termen,
ca atare, iar diferența **se scade din decontul pe septembrie** (decizia lui Raul, 07.09).

### Provizionul de 240 lei

12 comenzi încasate dar nelucrate la 31.08 (10 identificare-imobil, 2
identificare-imobile-proprietar), la taxa medie de 20 lei pe serviciu. Exact rezerva care a
umflat primul decont: se împărțea profit pe comenzi ale căror costuri nu apăruseră încă.
Se calculează automat (`estimatePendingOcpi`), din taxa medie deja plătită pe același
serviciu; comenzile finalizate fără taxă rămân la 0 (serviciul chiar nu are taxă).

## Factura de comision

Mirandsof SRL, seria SM nr. 153 / 28.08.2026: **525,00 fără TVA + 110,25 TVA = 635,25 lei**.
Înțelegerea era 15 lei/comandă **cu TVA inclus** (35 comenzi = 525 total, adică 433,88 net).
**Factura a fost PLĂTITĂ pe 07.09**, ca atare, fără refacere. TVA-ul se
deduce, deci costul rămas al firmei e 525 lei — exact suma scăzută din partea lui Mircea.

**Regula comisionului (Raul, 07.09):** comisionul de 15 lei/comandă NU e cost înainte de
împărțeală. Se calculează DUPĂ ce se știe partea colaboratorului și se scade din ea, pentru
că el îl încasează prin factură către EDIGITALIZARE — aceeași convenție ca la avocată.

Pe extrasele de carte funciară nu s-a facturat comision — coerent cu clarificarea din 26.08
(acolo nu există onorariu per comandă).

## Avansurile pentru taxe se urmăresc în platformă (migrarea 151)

Tabela `collaborator_advances` ține banii TRIMIȘI colaboratorului (Revolut, card, transfer,
numerar); consumul rămâne în `order_supplier_costs` (taxele per comandă), iar soldul e
diferența. UI: **/admin/colaboratori → colaborator selectat → „Avansuri pentru taxe"** —
trei carduri (trimis / consumat / sold) + formular + listă. API:
`/api/admin/collaborators/advances` (GET/POST/DELETE, `orders.view`).

Seed la creare: cele 10 mișcări din extrasele Revolut 21.08–07.09 (**3.240 lei**, din care
40 lei taxe OCPI plătite direct cu cardul). Consumat pe tot istoricul: **3.275 lei** → sold
**−35 lei**, dar cifra e incompletă: transferurile dinainte de 21 august nu sunt introduse
(extrasele lipsesc), deci soldul real e în favoarea lui Mircea.

## Reconciliere cu Revolut (parțială)

Transferuri către Mircea în extrasele disponibile (21.08 – 07.09): **3.200 lei**, plus 40 lei
taxe OCPI plătite direct cu cardul pe 21.08. Taxele înregistrate în sistem pe toată perioada
iulie–august: 3.055 lei (din care 2.795 înregistrate în august, 120 în septembrie).

Extrasele nu acoperă 07.07–20.08, deci soldul real (avans la Mircea vs. taxe consumate) se
poate stabili doar confruntând cu evidența lui. **De clarificat la următorul decont.**

## Ce s-a schimbat în cod (07.09)

`src/lib/collaborator/settlement.ts` rămâne sursa unică, dar modelul include acum toate
costurile: `computeSettlementBreakdown(collected, ocpi, { stripeFees, commission,
platformCost })`, plus `PLATFORM_COST_PER_MONTH = 500` și `platformCostForRange()`.

- Comisioanele Stripe vin reale, per comandă, din `stripe_payout_transactions`.
- Comisionul colaboratorului = suma `services.lawyer_fee_ron`, dar se scade din partea LUI
  (`collaboratorShare`), nu din profitul comun.
- Găzduirea + programele de dezvoltare: `PLATFORM_COST_PER_MONTH = 500` (lunar, confirmat de
  Raul 07.09), alocat proporțional cu zilele din perioadă.
- `estimatePendingOcpi()` calculează provizionul pentru comenzile încasate dar nelucrate.
- Ambele UI-uri (`/colaborator/decont` și `/admin/colaboratori`) afișează pașii separat,
  deci Mircea vede aceleași cifre ca în raport, fără document separat.

## Regula pentru costurile întârziate (stabilită 07.09)

Problema de fond: comanda se încasează într-o lună, taxa OCPI se plătește când se lucrează —
uneori luna următoare. Soluția adoptată, în ordinea importanței:

1. **Costul intră în decontul în care a fost înregistrat**, nu în luna comenzii. Nu se
   provizionează nimic: comenzile blocate în așteptarea clientului s-ar putea să nu se lucreze
   niciodată (și atunci n-au nici cost, iar uneori nici venit — se rambursează).
2. **Decontul e CUMULATIV**, nu pe felii de perioadă: se recalculează toată perioada de la
   `SETTLEMENT_PERIOD_START` și din partea cuvenită se scade `DISTRIBUTED_PER_SIDE` (lista
   `DISTRIBUTIONS` din `settlement.ts`). Orice cost întârziat se corectează singur la decontul
   următor — nu se poate pierde și nu se poate număra de două ori.
3. **Se vede în ambele UI**: „Distribuit deja" și „De reglat" apar direct în portal și în admin.

Verificare la 07.09: cu comenzile din 1–7 septembrie incluse, partea cuvenită cumulat urcă la
**4.181,59** lei, iar diferența de reglat scade de la 409,54 la **135,02** lei — mecanismul se
așază singur.

**La fiecare distribuire se adaugă o intrare în `DISTRIBUTIONS`** (dată, sumă/parte, cât cash și
cât prin factură la colaborator). Ăsta e singurul pas manual rămas.

## Deschise

1. **Soldul avansurilor pentru taxe** — de reconciliat cu evidența lui Mircea (vezi mai sus).
2. **Găzduirea + programele NU se alocă** aici (decizie 07.09) — costul real de infrastructură
   (~730 lei/lună) deservește toate platformele și rămâne cheltuială generală. Dacă se revine,
   se schimbă doar `PLATFORM_COST_PER_MONTH`.
3. **Volumul a căzut după 20.08** (de la ~10 comenzi/zi la 1–2) — efectul actualizării Google
   din 20 august asupra traficului organic, nu o problemă de execuție.
