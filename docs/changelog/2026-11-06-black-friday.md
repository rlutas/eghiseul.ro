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
- Cumpărătorii primesc campanii pe serviciu, până la 400 de emailuri pe zi: constatator, cazier judiciar, auto, fiscal, integritate, naștere, căsătorie și extras de carte funciară. Campaniile se opresc singure la final.
- Emailurile de reactivare menționează și ele reducerea până la final.
- Pe CJO și ecazier, comanda web neplătită are acum în pagină butonul „Copiază linkul”. Îl trimiteți clientului ca să continue comanda. Linkul merge 7 zile de la începerea comenzii; după aceea clientul plasează o comandă nouă.

---

## Ce s-a schimbat

`src/lib/coupons/black-friday.ts` ține codul, data de final și procentele pe `slug`. `couponAmount()` este apelat din `/api/coupons/validate`, `/api/orders/[id]/coupon`, `/api/orders/[id]/payment` și `computeServerPricing` (`/submit`), iar wizardul calculează la fel din cod. Celelalte cupoane rămân pe subtotal, ca înainte. Nu există migrare: procentele stau în cod, iar rândul din `coupons` dă doar valabilitatea (`valid_until` = 2026-11-16T21:59:59Z).

`BlackFridayBar` stă în layouturile `(eghiseul)`, `(order)` și `documentero`, ascunsă pe `/admin` și `/colaborator`. Pasul de plată aplică singur codul dacă nu există alt cupon. `?coupon=` din URL are prioritate.

Tot în această livrare intră motorul de campanii pe serviciu din `a2e0b54d`: segmentul `service_buyers`, migrarea 202 și coloanele `service_slug`, `min_last_paid_at`, `max_last_paid_at`.

Campaniile folosesc segmentul `service_buyers`, cu ultima plată până la 23.10.2026. La cazier judiciar plata e de după 21.07.2025, iar la extras CF de după 18.03.2025, ca lista să se termine până pe 16.11 la 400 de emailuri pe zi. `isExpiredBlackFridayCampaign()` oprește în cron orice campanie care numește codul după data de final. `cazier-judiciar-persoana-fizica` și `-juridica` au rămas pe dinafară: o parte mare dintre contacte sunt și pe `cazier-judiciar`, și ar fi primit același text de două ori.

Prețul de referință: reducerea pleacă de la prețul curent. Nu există migrări care să fi schimbat prețuri în ultimele 30 de zile, dar modificările din admin nu au fost verificate.

De șters după 16.11: modulul, bara și apelurile lor, împreună cu rândul din `coupons`.

Teste: `tests/unit/lib/coupons/black-friday.test.ts`.
