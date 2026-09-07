# Decontul lunar cu avocata colaboratoare (Tarta Ana Gabriela)

> Procedura completă, stabilită la decontul de iulie 2026 (sesiunea 05.08.2026).
> Referință de lucru: `~/Downloads/decont-avocat-tarta-iulie-2026-verificat.xlsx`.

## Scop

- **Platforme: eghiseul + cazierjudiciaronline (CJO)** + **plățile prin vechiul WordPress** (link-uri vechi de plată, încă primesc comenzi ocazional).
- **ecazier NU intră** — e cabinetul ei propriu (facturi SmartBill seria EJC, banii intră direct la ea). Atenție: lista istorică de iunie a contabililor le amesteca (prețurile 249/349 de acolo = ecazier pre-aliniere).
- **Servicii: TOT ce trece prin cabinet** — cazier judiciar (PF+PJ), cazier auto, cazier fiscal, certificat integritate, certificat naștere/căsătorie/celibat, extrase multilingve + add-on-urile lor de cabinet (apostilă **Haga**, extras multilingv, al doilea cazier, addon integritate/fiscal).

## Reguli de calcul

| Regulă | Detaliu |
|---|---|
| Componente pe coloane | Serviciu / Urgență / Apostilă Haga / Add-on cabinet — separate, un rând per comandă |
| **LISTĂ ALBĂ** (regula Raul 07.09.2026) | intră DOAR serviciul, urgența, apostila Haga și add-on-urile de cabinet (al 2-lea cazier `addon_*`, cetățean străin, extras multilingv, pachet certificate). **Orice opțiune necunoscută cade automat afară** + avertisment în raport |
| **Excluse din sumele ei** | livrare/transport (Fan/Sameday/DHL/Poșta/easybox), traducere, legalizare, **apostilă NOTARILOR**, custom_extra, verificare_expert, orice alt extra |
| Cupoane | Se aplică proporțional pe componentele ei (inclusiv ONLINE10 pe CJO) |
| Onorariu | **15 RON/comandă — coloană separată; NU se adună la total, se SCADE la decontare** |
| Totaluri | cu TVA 21% și fără TVA (÷1,21) |
| Excluse complet | comenzi refunded/cancelled/test (ex. iulie: E-260708-J6EEX, naștere 1.497 refundat integral) |
| Plăți extra pe comenzi | intră DOAR dacă sunt muncă de cabinet (ex. al doilea cazier); traduceri/km/legalizări extra NU |

## Surse de date & verificare (3 surse independente)

1. **eghiseul DB**: `base_price/options_price/discount_amount/selected_options` — descompunere directă; factor discount = 1−disc/(base+opts).
2. **CJO DB**: reconciliere pe sumă per comandă (coloane-flag + `amount_total`): era veche ≤~apr = 250/350 (apostilă 238); era nouă = 220/300 −10% ONLINE10 (stocat în `coupon_discount_amount`, **curierul NU se discountează**); cetățean străin = +119; permis străin = 350 flat; integritate = 250/350 flat; `additional_paid_bani`>0 = addon-uri plătite separat.
3. **Stripe** (export unified_payments pe lună): match pe `orderNumber/order_ref (metadata)`; fiecare comandă trebuie să aibă plată egală cu totalul ei (plățile extra pentru terți se ignoră).
4. **Registrul central Barou** (`number_registry`, proiect ksqkttalapjlgugshuks): fiecare comandă trebuie să aibă **contract + delegație**; comenzile ≤09.07.2026 au numerele în vechiul Google Sheets (rânduri `SHEET-xxxx`, import manual).
5. **Plățile WP** (fără metadata în Stripe): identificare după Description/`orderId (metadata)` numeric + registrul de contacte (`contacts`, sources `wpforms:*`); intră cu suma brută (ca în lista de iunie — nedescompozabil).

## Admin

**/admin/colaboratori → tab „Avocat — decont cabinet"** — filtru pe lună + **selector platformă** (Ambele / eghiseul / cazierjudiciaronline), sub-totaluri per platformă, export TSV cu coloană `Platforma`. API: `/api/admin/collaborators/avocat-decont?month=YYYY-MM&platform=all|eghiseul|cjo`.

Din **07.09.2026** raportul acoperă ambele platforme direct din DB:

| Platformă | Sursa descompunerii | Note |
|---|---|---|
| eghiseul | `base_price` + `selected_options` + `discount_amount` | factor cupon = 1−disc/(base+opts) |
| cazierjudiciaronline | `contract_snapshot.lineItems` (nume + preț per linie) | 100% acoperire pe august 2026; cuponul se aplică pe pozitivele NEcurier (verificat: 10% din suma fără curier) |

- **ecazier iese automat**: filtrul e `source = 'cazierjudiciaronline'` (comenzile ei au `source = 'ecazier'`, cont Stripe `cabinet_tarta`, facturi SmartBill EJC) — deși stau în același DB, cu prefixe `EJC-`/`EFC-`. Prefixele `CJO-/CFO-/CAO-/CIC-` sunt ale noastre.
- **Clasificare linii CJO** (regex pe nume, listă albă): `Procesare Urgenta` → Urgență; `Apostila Haga (țară)` → Apostilă; `Cetatean Strain` / `… (add-on)` / `Extras multilingv` → Add-on cabinet; `Cazier Judiciar/Fiscal/Auto Online`, `Certificat (de) Integritate` → Serviciu. Livrare (`Fan Courier`, `Posta Romana`, `Livrare Sameday EasyBox`, `DHL Express`, Cargus) și terți (`Traducere Autorizata`, `Legalizare`, `Apostila Camera Notarilor`, verificare expert) — excluse. Orice alt nume → **exclus + avertisment**.
- **Acoperire `lineItems` pe CJO**: 100% din mai 2026 încoace; comenzile din aprilie 2026 (26 buc) n-au snapshot — apar ca avertisment, se rezolvă manual dacă se recalculează o lună veche.
- **Retururi**: retur integral = comanda iese din raport; retur parțial (de obicei doar curierul) rămâne, marcat cu badge roșu `RETUR x,xx` + coloană în TSV — decizia e a lui Raul la decontare.
- **Rămâne manual**: plățile prin vechiul WordPress (fără DB) — se adaugă din exportul Stripe, ca la iulie.

## Verificare cu Stripe (august 2026)

Export `unified_payments` din Stripe, reconciliat 07.09.2026 — **totul bate la leu**:

| Verificare | Rezultat |
|---|---|
| Plăți în export (august) | 325 plăți / 322 comenzi / 77.953,54 RON brut / comisioane 1.618,69 |
| Comenzi de decont găsite în Stripe | 185 din 186 |
| Încasat pe comenzile ei (tot, cu livrare + terți) | 63.567,49 |
| − partea ei (decont) | 54.218,80 |
| = livrare + traduceri + legalizări + apostilă notari + custom extra | 9.348,69 |
| Comision Stripe pe comenzile ei | 1.240,93 (1,95%) — din care **1.055,69 atribuit părții ei** |

Identitatea care închide reconcilierea: `Stripe 63.567,49 + 198 (comanda lipsă din export) = decont 54.218,80 + excluse 9.846,70 − 200 (extra plătit în septembrie) − 100 (add-on niciodată încasat)`.

**Atenție la exportul Stripe**: `unified_payments` NU conține charge-urile cu retur (coloana `Amount Refunded` iese 0 pe tot exportul). De aceea `CJO-20260811-23113` (retur parțial 138,60) lipsește, iar plata extra de 25 de pe `CJO-20260804-15831` (returnată) nu apare. Nu e diferență reală.

**Gardă nouă (07.09.2026)**: dacă suma componentelor facturate depășește banii încasați (comandă + plăți extra), raportul dă avertisment — opțiune adăugată fără link de plată. Găsit pe august: `CIC-20260807-86855` (add-on cazier 100 RON în contract, niciodată încasat).

## Istoric decontări

| Luna | Poziții | Servicii cu TVA | fără TVA | Onorarii | Notă |
|---|---|---|---|---|---|
| Iunie 2026 | 195 (lista contabililor) | 63.460 | — | — | delegațiile 6677→7103; includea și ecazier + WP |
| **Iulie 2026** | **208** (90 egh + 94 CJO + 21 WP + 3 identificate) | **73.284,49** | **60.565,69** | **3.105** | verificat Stripe (183/183) + registru (continuitate 7101→7468); 2 poziții „de confirmat cu echipa" (galbene) |
| **August 2026** | **186** (72 egh + 114 CJO) | **54.218,80** | **44.808,93** | **2.790** | calculat 07.09.2026 direct din admin (ambele platforme). Componente: serviciu 45.925,45 · urgență 4.620 · apostilă Haga 2.108,70 (11 buc) · add-on cabinet 1.564,65. 2 comenzi CJO cu retur parțial incluse (CJO-20260804-15831 −25, CJO-20260811-23113 −138,60); WP nereconciliat |
| 1–7 sept. 2026 (parțial) | 30 (5 egh + 25 CJO) | 7.847,30 | 6.485,37 | 450 | doar informativ — intră în decontul lunii septembrie |

Prețuri „ciudate" legitime: 305,10 = cetățean străin (220+119−10%); 178,20 = apostila Haga cu ONLINE10; 448,20 = urgent+apostilă cu discount.
