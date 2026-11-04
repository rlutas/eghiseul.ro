# 04.11.2026 — Emailul de reactivare merge întâi la cei care au cumpărat
<!-- categorie: clienti -->

## Pentru echipă

- Emailul de reactivare pleacă acum întâi către oamenii care au plătit deja, începând cu cei care au cumpărat cel mai recent.
- Volumul crește de la 400 la 800 de emailuri pe zi.
- Răspunsurile de la foști clienți pot crește în următoarele zile. Tratați-le ca de obicei.
- Dacă un client spune că emailul i-a ajuns în spam sau că nu mai vrea emailuri, spuneți-i lui Raul în aceeași zi.
- Nu trebuie să apăsați nimic și nu se schimbă nimic în comenzi.

---

## Ce s-a schimbat

- Migrarea 200 adaugă `contacts.stripe_last_paid_at`, data ultimei plăți Stripe găsite pentru adresa de email. Potrivirea s-a făcut pe hash-uri, pe contul EDIGITALIZARE și pe cel al cabinetului, și a completat 17.104 contacte.
- `/api/cron/warmup-campaign` sortează după `stripe_last_paid_at` (cele mai recente întâi, fără dată la final), apoi după `warmup_priority` și `created_at`.
- Cine are plată în Stripe primește formularea „Ai obținut prin noi”, chiar dacă `is_customer` e fals. `is_customer` rămâne neschimbat.
- `dailyBatchSize` trece la 800. Revine la nivelul anterior dacă bounce-ul trece de 3% într-o zi sau apare o plângere de spam.

## De ce

Din 12.400 de contacte emailate, 8.243 plătiseră înainte și 33 au plătit din nou după email: 3,9% la cumpărătorii de pe platforma nouă, 0,23% la cei de pe WordPress. Din 4.157 fără plată în Stripe nu a cumpărat niciunul. Coada rămasă are 8.837 de cumpărători (499 cu ultima plată în 2026, 4.436 în 2025, 3.902 în 2024) și 51.048 de contacte fără plată din 2024 încoace.

Contul Stripe BMR (CJO până la 01.06.2026) nu e inclus încă, deci unele contacte „fără plată” pot fi cumpărători.
