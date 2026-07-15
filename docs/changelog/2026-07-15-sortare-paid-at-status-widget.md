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

## 6. 🔴 CI roșu din 14.07 + completări politică anulare + variante constatator în admin

- **CI GitHub roșu de la `feb4859`** (14.07): react-compiler dădea ERROR pe `/admin/colaboratori` (setState sincron în effect) — fix `ca58a38` (setTimeout 0). Toate rulările verzi din nou.
- **Rovinieta neanulabilă** (migrarea 124, rulată): odată emisă, CNAIR nu rambursează. Excepțiile pe `/politica-de-anulare/` afișează acum și detaliile variantelor (constatator: de bază/IMM/insolvență/PF/istoric; extras CF: informare 24/7; plan cadastral; rovinieta).
- **Prețurile variantelor constatator editabile în admin** (`fa46002`): trăiau doar în `verification_config.constatator.documentTypes` (firmă 89 / PF 89 / istoric 487) — invizibile. Acum secțiune „Prețuri pe variante" în Setări → Servicii → Edit; API-ul patch-uiește DOAR price (structura config rămâne intactă).
- **CJO + eCazier: bara „Total de Plătit" de la primul pas** (`e000f165`) — clientul vede prețul înainte să completeze orice câmp (paritate eghiseul; era din pasul 2).

## 7. 🟣 Comenzi telefonice A→Z (feature major — doc dedicat)

Echipa creează comenzi de la A la Z prin **wizard-ul real în mod telefonic** (paritate 100%: PF/PJ cu CUI→ANAF, constatator/CF/imobil, opțiuni, cupoane, curier cu cotații), ia plata prin **link emailat** (nu expiră) sau **marcare manuală** (transfer/cash, referință obligatorie, factură Oblio cu încasarea corectă), apoi clientul primește **link personalizat de completare** (confirmare email anti-forwarding + acte + semnătură pe ecran cu metadata legală; auto-standby; contracte regenerate cu semnătura). Migrările 125+126 rulate. Code-review de securitate: 2 findinguri reparate + retestate live (gate email, lock brute-force atomic, flux doar-semnătură). Commits: `ea6269e`, `dd9df3a`, `f47e1f7`. **Doc complet: [docs/admin/comenzi-telefonice/](../admin/comenzi-telefonice/README.md)**. CJO/eCazier: aceeași arhitectură, în verificare.
