# 10.11.2026 — Black Friday se aplică acum singur la plată, pe eghiseul și documentero
<!-- categorie: plati -->

## Pentru echipă

- **Ce s-a întâmplat:** din 06.11 până azi, 8 din 12 comenzi plătite pe eghiseul și documentero au plătit prețul întreg. Reducerea Black Friday trebuia să se pună singură, dar se punea doar dacă clientul venea din linkul barei de sus sau tasta codul.
- **Acum:** pe pagina de plată, codul BLACKFRIDAY se pune singur pe toate serviciile din campanie, până pe 16.11 la 23:59. Cine vine cu un cupon personal din email îl păstrează pe acela.
- **CJO și ecazier nu au fost afectate:** toate comenzile plătite de acolo au reducerea.
- **Comenzile care au plătit întreg:** E-261106-RCGP2, E-261106-GB4TM, E-261106-7UKTJ, E-261107-BDJ55, E-261108-Z6DNW, E-261109-HDDYQ, E-261109-VW7PA, E-261109-4LEEZ. Dacă un client întreabă de reducere, are dreptate: bara îi spunea că se aplică automat. Decizia de a returna diferența o ia Raul.

---

## Tehnic

- Aplicarea automată stătea în `review-step.tsx`, dar pasul Review a fost scos din wizard pe 27.05.2026 (`step-builder.ts`: ultimul pas e Billing, apoi `/comanda/checkout/[orderId]`). Codul nu rula deloc.
- `/comanda/checkout/[orderId]/page.tsx`: efectul care aplica `?coupon=` aplică acum și `BLACKFRIDAY` când `isBlackFridayActive()` și `blackFridayRate(order.service_slug) > 0`, comanda n-are cupon și nu e plătită. Merge prin `POST /api/orders/[id]/coupon`, care calculează procentul pe serviciu. Codul din URL are prioritate.
- Cele 4 comenzi cu BLACKFRIDAY (DDFMV, MHKJK, 8RY2B, 754AK) aveau codul din link sau tastat.
- CJO (`OrderForm`) aplică singur codul și nu a avut problema.
