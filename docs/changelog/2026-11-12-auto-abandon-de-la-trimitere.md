# 12.11.2026 — „Abandonată” se numără de la apăsarea pe „Plătește”
<!-- categorie: comenzi -->

## Pentru echipă

O comandă neplătită trece pe **Abandonată** după 30 de minute. Până acum cele
30 de minute se numărau de când clientul a început formularul, nu de când a
ajuns la plată. Cine începea dimineața și apăsa „Plătește” seara apărea la
„Abandonate” după câteva minute, deși încă era pe pagina de plată.

De acum cele 30 de minute pornesc de la apăsarea pe „Plătește”. Pentru voi:

- o comandă „În așteptare” chiar înseamnă că clientul e la plată de mai puțin de jumătate de oră;
- o comandă redeschisă cu „Redeschide formularul” și trimisă din nou primește alte 30 de minute;
- nu se schimbă nimic la transferul bancar și la emailurile de recuperare.

---

## Tehnic

`/api/cron/auto-abandon` filtra pe `created_at < acum − 30 min`. Pe
E-261111-EMRB4 ciorna era din 11:27, trimiterea la 21:39, abandonul la 21:45.
În ultimele 30 de zile, 8 din 19 abandonuri au venit la sub 25 de minute de la
trimitere.

- `src/lib/orders/abandon-due.ts`: `isAbandonDue()` numără de la
  `submitted_at`, cu `created_at` ca rezervă când lipsește. Filtrul SQL pe
  `created_at` rămâne ca prefiltru (e mereu mai vechi sau egal).
- Update-ul în bloc e acum condiționat de `status = 'pending'` și
  `payment_status != 'awaiting_verification'`: o comandă plătită între citire
  și scriere nu mai poate fi trecută pe „abandoned”. Rândurile din istoric se
  scriu doar pentru comenzile efectiv schimbate.
- Teste: `tests/unit/lib/orders/abandon-due.test.ts`.
