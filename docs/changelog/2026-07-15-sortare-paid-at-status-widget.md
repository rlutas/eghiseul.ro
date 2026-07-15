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

## 4. 🟣 Politica de anulare 30 min — pusă la punct (`bb3bd06`)

**Audit (cerere Raul):** eghiseul AVEA deja self-cancel complet (endpoint `/api/orders/cancel` + `SelfCancelCard` pe status + countdown + email + 70% refund manual din admin), config per-serviciu corect (constatator + extras CF excluse ca instant). Găsite și reparate:

1. **Gate-ul de status era mai strict decât promisiunea**: anularea mergea DOAR din status `paid` — dacă echipa pornea procesarea în minutul 5, clientul pierdea dreptul de 30 min din termeni. Acum (paritate CJO): fereastra de 30 min e garantată indiferent de progresul intern; blochează doar `shipped`/`completed`/anulate/neplătite.
2. **Termeni secțiunea 8**: anchor `#anulare` + excepția instant numită explicit (extras CF, constatator) + garanția ferestrei chiar cu procesare începută.
3. **Footer**: link nou „Politica de anulare" → `/termeni-si-conditii/#anulare`.
4. **Migrarea 122** (rulată în prod): `allow_self_cancel=true` explicit pe certificat-urbanism-informare (era null — endpoint-ul îl trata permisiv prin `!== false`, dar config-ul trebuie explicit).

Mecanica: client cere anularea din `/comanda/status/` → status `cancellation_requested` + email → echipa face refundul de 70% din admin (review manual al cazurilor borderline).

## 5. 🟣 Pagini dedicate „Politica de anulare" pe TOATE platformele (`63467ab` + CJO `dd5a6880`)

- **eGhișeul**: `/politica-de-anulare/` (LegalLayout: 30 min/70%, pași, excepții instant extras CF + constatator, FAQ, temei OUG 34/2014) + link footer „Politica de anulare" + sitemap + termenii §8 linkuiesc pagina.
- **CJO**: `/politica-de-anulare` pe template-ul legal propriu + link în footer (Legal) + sitemap.
- **eCazier**: `/ecazier/politica-de-anulare` (branding cabinet, diacritice) + link în footer-ul propriu; rewrite-ul multi-tenant servește automat `ecazier.ro/politica-de-anulare`.
