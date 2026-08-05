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
| Componente pe coloane | Serviciu cabinet / Urgență / Apostilă Haga — separate, un rând per comandă |
| **Excluse din sumele ei** | livrare/transport (Fan/Sameday/DHL/Poșta), traducere, legalizare, **apostilă NOTARILOR**, custom_extra, verificare_expert |
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

**/admin/colaboratori → tab „Avocat — decont cabinet"** — doar comenzile eghiseul, filtru pe lună, export TSV. API: `/api/admin/collaborators/avocat-decont`. CJO + WP se scot cu scriptul de decont (vezi memoria `decont-avocat-tarta` a sesiunii Claude).

## Istoric decontări

| Luna | Poziții | Servicii cu TVA | fără TVA | Onorarii | Notă |
|---|---|---|---|---|---|
| Iunie 2026 | 195 (lista contabililor) | 63.460 | — | — | delegațiile 6677→7103; includea și ecazier + WP |
| **Iulie 2026** | **208** (90 egh + 94 CJO + 21 WP + 3 identificate) | **73.284,49** | **60.565,69** | **3.105** | verificat Stripe (183/183) + registru (continuitate 7101→7468); 2 poziții „de confirmat cu echipa" (galbene) |

Prețuri „ciudate" legitime: 305,10 = cetățean străin (220+119−10%); 178,20 = apostila Haga cu ONLINE10; 448,20 = urgent+apostilă cu discount.
