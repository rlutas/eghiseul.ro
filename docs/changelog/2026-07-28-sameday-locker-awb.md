# 2026-07-28 — AWB Sameday nu se putea genera: lockerul ales nu se salva nicăieri

Raportat pe comanda `E-260728-YFHH2`: „generare Sameday nu merge" + în cardul de
livrare din admin apăreau doar metoda, costul și curierul, fără niciun alt detaliu.

## Nu era sandbox — contul e live

Prima ipoteză a fost că rulăm pe API-ul demo. **Fals**, verificat direct:

| | Rezultat |
|---|---|
| `POST api.sameday.ro/api/authenticate` cu credențialele din producție | **200**, token valid 9 zile |
| `GET /api/client/pickup-points` | **200**, 1 punct de ridicare configurat |
| `GET /api/client/lockers` | **200**, 6.935 lockere |
| aceleași credențiale pe `sameday-api.demo.zitec.com` | 403 „Invalid credentials" |

`SAMEDAY_USE_DEMO=false`, utilizator `edigitalizareAPI`. Deci **nu e nevoie de alte
chei** — integrarea era live, dar îi lipsea o informație.

## Cauza reală

Sameday cere la emiterea AWB-ului către easybox câmpul `oohLastMile` = **ID-ul
lockerului**. Wizardul îl colecta corect (`delivery-step.tsx` pune `lockerId`,
`lockerName`, `lockerAddress` în `courierQuote`), dar payload-ul trimis la salvare
conținea doar `provider` și `service`. Coloana `orders.courier_quote` **exista și
nu era scrisă niciodată** — 0 rânduri completate, pe toate cele 14 comenzi cu curier,
indiferent de furnizor.

Ruta de AWB reconstruia din denumire doar SERVICIUL (`extractCourierQuote`), niciodată
lockerul — din „Livrare România · Sameday - EasyBox (easybox Kripton)" se putea deduce
`LOCKER_NEXTDAY`, dar nu și ID-ul. Rezultat: **niciuna dintre cele 5 comenzi Sameday
în locker n-a primit vreodată AWB**.

Același lucru explică și cardul gol din admin: blocul „Locker" se afișa doar dacă
exista `courierQuote.lockerName` (null), iar blocul „Adresa livrare" era ascuns tocmai
pentru că metoda era detectată ca locker. Deci nu se vedea nimic.

## Ce s-a reparat

1. **Wizardul trimite lockerul** — `delivery_method` primește `locker_id`,
   `locker_name`, `locker_address`, iar `courier_quote` pleacă întreg către API.
2. **API-ul îl salvează** — `POST` și `PATCH /api/orders/draft` scriu acum
   `courier_quote`, `courier_provider`, `courier_service`.
3. **Ruta de AWB** citește lockerul din cotație sau de pe `delivery_method` și, dacă
   e livrare în locker fără ID, se oprește cu un mesaj clar în loc să încerce și să
   eșueze la curier: *„Comanda are livrare în locker («easybox Kripton») dar nu are
   ID-ul lockerului salvat… generează AWB-ul din contul curierului și adaugă-l manual"*.
4. **Admin** — numele lockerului se recuperează din denumirea metodei chiar și fără
   cotație salvată, adresa de livrare se afișează ȘI la livrarea în locker, iar când
   ID-ul lipsește apare un avertisment galben.
5. `extractCourierQuote` a ieșit din fișierul de rută în `src/lib/courier/quote-from-delivery.ts`,
   cu 6 teste.

## Recuperarea comenzilor existente

`scripts/backfill-sameday-locker-ids.ts` caută numele lockerului (păstrat între
paranteze în denumirea metodei) în cele 6.935 de lockere Sameday și scrie ID-ul real.
Potrivire pe nume exact; dacă numele apare la mai multe lockere, comanda e raportată
și lăsată neatinsă — un colet livrat la alt locker e mai rău decât un AWB manual.

| Comandă | Locker | Rezultat |
|---|---|---|
| `E-260728-YFHH2` | easybox Kripton, Brașov | ✅ `lockerId 3386` — AWB-ul se poate genera acum |
| `E-260723-VJ39N` | easybox Târgu Neamț 10 | ✅ `lockerId 6245` |
| `E-260718-HXJZJ` | easybox Wash Point Lipova | ✅ `lockerId 5161` |
| `E-260727-734K8` | „Locker" | ⏭ ciornă neplătită, clientul n-a apucat să aleagă |
| `E-260717-YKNZ7` | „Locker" | ⏭ idem |

## Verificare

`1.361` teste trec (6 noi), `tsc` curat, build verde. Autentificarea și listarea
lockerelor testate pe API-ul live; **nu s-a emis niciun AWB automat** — prima emitere
o face echipa din admin, ca să nu creăm expedieri reale din script.
