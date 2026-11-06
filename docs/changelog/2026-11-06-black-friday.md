# 06.11.2026 — Black Friday pe toate site-urile, până luni 16.11
<!-- categorie: plati -->

## Pentru echipă

- Până luni, 16.11.2026, ora 23:59, toate site-urile au o bară cu Black Friday și un cronometru. Termenul nu se prelungește, pentru că cronometrul trebuie să spună adevărul.
- Codul este BLACKFRIDAY și se aplică singur la plată. Clientul îl poate scoate sau îl poate introduce manual.
- −20%: cazier judiciar, auto, fiscal, certificat de integritate, certificat de naștere, certificat de căsătorie.
- −10%: certificat constatator, extras de carte funciară, extras de plan cadastral, serviciile prin topograf, certificat de celibat, extras multilingv.
- Reducerea se calculează doar la prețul de bază. Opțiunile, urgența, traducerea, legalizarea și livrarea rămân la preț întreg. Rovinieta nu intră în campanie.
- Un client folosește un singur cupon pe comandă. Cine vine cu cupon personal din email îl păstrează pe acela.
- În pagina de cupoane, BLACKFRIDAY apare cu 10%. Procentul real se calculează pe serviciu, deci nu modificați cuponul de acolo.
- Cumpărătorii de certificat constatator primesc o campanie separată, iar emailurile de reactivare menționează reducerea până la final.

---

## Ce s-a schimbat

`src/lib/coupons/black-friday.ts` ține codul, data de final și procentele pe `slug`. `couponAmount()` este apelat din `/api/coupons/validate`, `/api/orders/[id]/coupon`, `/api/orders/[id]/payment` și `computeServerPricing` (`/submit`), iar wizardul calculează la fel din cod. Celelalte cupoane rămân pe subtotal, ca înainte. Nu există migrare: procentele stau în cod, iar rândul din `coupons` dă doar valabilitatea (`valid_until` = 2026-11-16T21:59:59Z).

`BlackFridayBar` stă în layouturile `(eghiseul)`, `(order)` și `documentero`, ascunsă pe `/admin` și `/colaborator`. Pasul de plată aplică singur codul dacă nu există alt cupon. `?coupon=` din URL are prioritate.

Tot în această livrare intră motorul de campanii pe serviciu din `a2e0b54d`: segmentul `service_buyers`, migrarea 202 și coloanele `service_slug`, `min_last_paid_at`, `max_last_paid_at`.

Prețul de referință: reducerea pleacă de la prețul curent. Nu există migrări care să fi schimbat prețuri în ultimele 30 de zile, dar modificările din admin nu au fost verificate.

De șters după 16.11: modulul, bara și apelurile lor, împreună cu rândul din `coupons`.

Teste: `tests/unit/lib/coupons/black-friday.test.ts`.
