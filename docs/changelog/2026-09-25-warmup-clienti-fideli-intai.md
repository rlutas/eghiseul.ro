# 25.09.2026 — Emailul de reactivare: clienții fideli întâi, cu cupon de 10%, 50 pe zi
<!-- categorie: clienti -->

## Pentru echipă

- Emailul de reactivare către vechii clienți pleacă acum **întâi la cei care au cumpărat de mai multe ori**: întâi cei cu mai multe comenzi pe site, apoi cei care au cerut mai multe servicii pe site-ul vechi (~830 de oameni), apoi restul listei.
- Emailul spune acum pe nume ce a obținut omul prin noi (de exemplu „certificat constatator și extras de carte funciară”), iar butonul îl duce direct în formularul acelui serviciu.
- **Clienții fideli** (cel puțin două comenzi sau două servicii) primesc un **cupon de 10%**, cu codul FIDEL-…, valabil 30 de zile, o singură folosire, pe orice serviciu. Din butonul din email cuponul se aplică singur. În Admin → Cupoane apare cu eticheta „Client fidel”.
- Ritmul a scăzut de la 75 la **50 de emailuri pe zi**. Motivul: 10 dezabonări la 550 de emailuri trimise (1,8%), peste pragul de 0,5% pe care ni l-am stabilit.
- Nu trebuie să faceți nimic. Comutatorul și numărul pe zi rămân în Admin → Marketing. Dacă dezabonările cresc în continuare, opriți campania de acolo.

---

## Tehnic

- Migrarea `187_warmup_priority_loyal_first.sql`:
  - `contacts.warmup_priority integer GENERATED ALWAYS AS (COALESCE(orders_count,0)*10 + COALESCE(cardinality(services),0)) STORED`;
  - index parțial `contacts_warmup_queue_idx (warmup_priority DESC, created_at) WHERE warmup_email_sent_at IS NULL AND warmup_skipped_at IS NULL`;
  - `admin_settings.warmup_campaign.dailyBatchSize` = 50.
- `src/app/api/cron/warmup-campaign/route.ts`: `.order('warmup_priority', { ascending: false }).order('created_at')` în loc de FIFO după `first_seen_at`.
- Coada la 25.09 (netrimiși, eligibili): prioritate 11 → 2 contacte, 4 → 2, 3 → 20, 2 → 810, 1 → 70.917. Toți cei 412 clienți de pe platformă (39 cu 2+ comenzi) primiseră deja emailul înainte de schimbare, pentru că stăteau primii în coada FIFO.
- Migrarea `188_coupon_kind_loyalty.sql`: `coupons_system_kind_check` acceptă și `'loyalty'`.
- `src/lib/coupons/loyalty.ts`: `isLoyalContact` (`orders_count >= 2` sau `services.length >= 2`) și `mintLoyaltyCoupon` (`FIDEL-` + 8 caractere, 10%, 30 de zile, `max_uses 1`, nelegat de cont). Dacă inserarea eșuează, emailul pleacă fără cupon.
- `warmup-reengagement.ts`: primește `serviceSlugs`, `isCustomer` și `coupon`. Scrie „Ai obținut prin noi …” doar pentru `is_customer` și „Ai apelat la noi pentru …” pentru lead-urile de pe site-ul vechi. Butonul duce la `/comanda/<primul slug cunoscut>/?coupon=…` cu `utm_campaign=warmup-fidel`, sau la `/servicii/` când nu există slug cunoscut. Subiectul emailului fidel: „<Nume>, ai 10% reducere pentru că ne-ai ales de mai multe ori”.
- Admin: eticheta „Client fidel” în `/admin/coupons`; valoarea `loyalty` e adăugată în enum-ul zod din `POST /api/admin/coupons`.
- Teste: `tests/unit/lib/email/warmup-reengagement.test.ts`.
- Observație: `/api/contacts/unsubscribe` nu actualizează `contacts.updated_at`, deci data dezabonării nu se poate citi din DB. Rata s-a calculat pe contactele cu `warmup_email_sent_at` și `marketing_status='unsubscribed'`.
- Spec: `docs/technical/specs/warmup-email-campaign.md`.
