# 2026-07-15 — „Comanda dispărută" din admin (sortare paid_at) + mesaj outage în widget stare

## 1. 🔴 Comandă plătită „invizibilă" în lista admin — sortare pe paid_at (eGhișeul + CJO/eCazier)

**Raportat de Raul:** comandă cazier fiscal plătită (PI `pi_3TtNU0…`) negăsită în lista de comenzi pe nicio platformă.

**Diagnoza:** comanda exista și era deja procesată — **E-260714-773QA** (cazier fiscal PF, 198 lei): draft creat 14.07 11:35, plătită 15.07 07:44, trimisă la instituție 08:10. Dar lista admin se sorta pe `created_at` → comanda apărea la poziția de IERI, îngropată sub comenzile de azi. Echipa se uită la capul listei → părea dispărută.

**Fix (ambele platforme):** sortare `paid_at desc (nulls last)` cu fallback `created_at desc` — o comandă plătită azi sare în topul listei azi, indiferent când a început draftul. Neplătitele rămân pe data creării. Verificat: 1 singur rând istoric fără `paid_at` pe eghiseul, 0 pe CJO — impact zero. Commits: eghiseul `60ca3dc`, CJO `bf277eb7`.

**Notă investigație:** PI-ul nu se putea căuta în Stripe local (chei test în `.env.local`; cheia live doar în Vercel) — comanda s-a găsit direct în DB pe `orders.stripe_payment_intent_id`.

## 2. 🟣 Widget „Stare sistem": mesaj complet de liniștire la outage (`5d87e32`)

Cât timp ANCPI/ONRC e jos, caseta galbenă din widget (sidebar wizard extras CF + constatator, pagini serviciu, articol outage) afișează mesajul complet cerut de Raul: „**Atenție:** sistemele naționale ANCPI sunt temporar indisponibile, însă **poți plasa comanda în continuare**. Cererea ta este înregistrată și va fi procesată **cu prioritate, automat**, imediat ce sistemele redevin funcționale…". Dispare singur la revenire; sub el rămâne „Indisponibil din …" cu data reală din monitorizare.

## 3. ✅ Nr. contract · delegație mutate sub numărul comenzii (`1bc9d3f`)

Erau afișate sub client (implementarea din 15.07 dimineața); mutate în celula numărului de comandă — paritate exactă cu admin-ul CJO.
