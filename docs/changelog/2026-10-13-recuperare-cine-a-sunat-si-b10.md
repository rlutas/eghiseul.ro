# 13.10.2026 — Recuperare: cine a sunat, eticheta „Sunat” în Abandonuri și emailul „Mai ai nevoie?” pe eGhiseul
<!-- categorie: clienti -->

## Pentru echipă

- La **„Marchează sunat”** alegeți acum **cine a sunat: Maria sau Carla**. Fără nume, apelul nu se salvează.
- În lista de abandonuri (eGhiseul: **Comenzi → Neplătite**; CazierJudiciarOnline: **Abandonuri**) apare eticheta **„📞 Sunat 12.10 · Maria”** la clienții sunați deja, pe toate comenzile lor. Dacă o vedeți, nu-l mai sunați încă o dată.
- Pe CazierJudiciarOnline puteți marca apelul **direct din Abandonuri**, cu butonul cu telefon. Asta e pentru clienții opriți înainte de plată. Apelul apare și în Recuperare telefonică.
- **eGhiseul:** clienții cu o comandă neplătită de 7–60 de zile primesc **un singur email** „Mai ai nevoie de …?”, fără cupon, cu butonul „Reia comanda”. Pleacă cel mult 90 pe zi, între 10:00 și 18:00. Nu îl primesc cei sunați sau cărora le-ați scris în ultima săptămână, nici cei care au plătit. Dacă clientul răspunde, răspunsul vine pe contact@.

Procedura completă: [Recuperare telefonică](../admin/recuperare-telefonica.md).

---

## De ce

Pe 12.10 echipa a sunat din Recuperare telefonică, apoi din Abandonuri, și a ajuns la aceiași clienți. Lista de abandonuri nu știa de apeluri. Pe eGhiseul, 11 din 149 de comenzi neplătite din 30 de zile erau clienți sunați pe o altă comandă de-a lor. Toate apelurile erau salvate cu emailul contului comun (`serviciiseonethut@gmail.com`), deci nu se vedea cine a sunat.

## eGhiseul

- `src/lib/orders/phone-recovery-wins.ts`: `PHONE_CALLERS` (`Maria`, `Carla`), `isPhoneCaller`, `phoneKey` (ultimele 9 cifre), `buildCallIndex` / `findCall` (email sau telefon, apelul cel mai nou câștigă). Teste în `tests/unit/lib/orders/phone-recovery-wins.test.ts`.
- `POST /api/admin/orders/[id]/phone-contact`: `caller` obligatoriu (400 „Alege cine a sunat: Maria sau Carla”). Se salvează în `phone_contacted_by` și e folosit ca nume de agent în emailul de follow-up. `order_history` notează „Contactat telefonic de <nume>”.
- `GET /api/admin/orders/list`: pentru comenzile neplătite din pagină întoarce `phone_call`. E apelul cel mai nou pe oricare comandă cu același email sau telefon, din ultimele 60 de zile.
- `/admin/orders`: eticheta sub status. `/admin/recuperare-telefonica`: butoanele Maria/Carla în dialog, ultimul nume ales ținut în `localStorage`.

### B10: emailul „Mai ai nevoie de …?”

- `src/lib/orders/reengage.ts`: regulile, cu teste în `tests/unit/lib/orders/reengage.test.ts`.
- `src/lib/email/templates/reengage-order.ts`: emailul, fără cupon, cu disclosure și resume link (`withUtm('recovery', 'reengage-order')`).
- `src/app/api/cron/reengage-orders/route.ts`: `CRON_SECRET`, `?dry=1` pentru simulare.
- Cron în `vercel.json`: `5 7-15 * * *` (10:05–18:05 RO). Maximum 15 pe rulare și 90 în 24 de ore. Se oprește la 500 trimise (aceeași regulă de test ca B9 pe CJO).
- Exclude:
  - comenzile de test și documentero;
  - clienții care au plătit (după comanda neplătită sau cu ≤60 de zile înainte);
  - drafturile oprite la contact;
  - contactele suprimate sau dezabonate și adresele de test, invalide sau cu greșeli de tastare;
  - clienții cu o comandă mai nouă;
  - clienții sunați, contactați manual sau care au primit un email de recuperare în ultimele 7 zile;
  - pe cei care au primit deja acest email.
- Evidența se ține fără migrare: `order_history` cu `event_type='recovery_email_sent'` și `changed_by='system-reengage'`. Rândul se scrie înainte de trimitere și se șterge dacă trimiterea eșuează. Resend primește cheia de idempotență `reengage-order-<email>`.
- Prima rulare, după simularea pe baza live: **197 de adrese eligibile** din 322 de comenzi. Primul val se termină în ~3 zile.
- **Măsurăm pe 20.10:** comenzi plătite cu `utm_campaign=reengage-order`.

## CazierJudiciarOnline (commit CJO `08838e7d`)

- Migrarea CJO 042: `abandoned_sessions.phone_contacted_at/_by/_notes`.
- `POST /api/admin/abandoned/[id]/phone-contact` (nou). `POST /api/admin/phone-recovery/[id]` cere acum `caller`.
- `src/lib/phone-recovery.ts`: `PHONE_CALLERS`, `buildCallIndex` peste comenzi și sesiuni, `findCall`, `applyCalls`. Un apel marcat din Abandonuri ascunde clientul din coada „De sunat” și contează la KPI și la „Recuperate”.
- `MarkCalledDialog` comun pentru Recuperare telefonică, lista Abandonuri și detaliul sesiunii.
- Verificat: 527 de teste trec, deploy Vercel reușit. **Nu s-a verificat vizual în browser.**
