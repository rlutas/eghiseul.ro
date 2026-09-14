# 14.09.2026 — Recuperare telefonică a coșurilor + warm-up email pe registrul de 72k contacte

**Declanșator:** cuponul automat de −10% trimis de cronul `recovery-emails` are
redemption real de **1,4%** (20 din 1.444 cupoane). Baza de 72.278 contacte din
registrul intern (import WPForms de pe eghiseul.ro vechi) nu a primit niciodată
un email de marketing.

Detalii de business și cercetare: `docs/marketing/email-marketing-plan-2026-09.md`.

---

## 1. Recuperare telefonică (migrarea 156)

Pagină nouă `/admin/recuperare-telefonica`: coadă de comenzi `draft`/`abandoned`
din ultimele 30 de zile, ordonată pentru un om care sună, nu pentru un cron:

- **Prioritate maximă**: telefon străin + serviciu de stare civilă (naștere,
  căsătorie, extras multilingv) — diaspora cu termene reale.
- În fiecare tier, cine a completat mai multe date în wizard e primul, apoi
  cele mai recente.
- Comenzile fără niciun nume nu intră în coadă (emailul automat le acoperă).
- Bifă „sunat" + notă liberă (`phone_contacted_at/_by/_notes`, suprascrise la
  fiecare apel; istoricul complet rămâne în `order_history`).
- Cupon discreționar dintr-un click: `/admin/coupons` se deschide precompletat
  cu `system_kind='phone_recovery'` (badge „Telefonic" vs „Auto" în listă).
- Ghid tipărit pentru echipă: `docs/marketing/ghid-echipa-recuperare-telefonica.pdf`.

Spec: `docs/technical/specs/phone-recovery-abandoned-carts.md`.

## 2. Warm-up email (migrările 157 + 158) — **implicit OPRIT**

Cron zilnic `/api/cron/warmup-campaign` (07:00 UTC): un singur email de
reactivare per contact, câțiva pe zi (implicit 25), FIFO. Switch + volum în
`/admin/marketing`, cu progres live (trimise / rămase / sărite / dezabonați).
Link de dezabonare cu un click per contact (`/api/contacts/unsubscribe`, token
propriu) + header-ele `List-Unsubscribe` cerute de Gmail/Yahoo.

**Nu pornește singur.** Se pornește din admin după ce conținutul emailului
(`src/lib/email/templates/warmup-reengagement.ts`) e revizuit.

Spec: `docs/technical/specs/warmup-email-campaign.md`.

## 3. Ce a prins review-ul înainte de deploy

Codul inițial (scris de un agent, revizuit în aceeași zi) avea trei bug-uri din
aceeași cauză — **builder-ul postgrest-js refolosit după un SELECT**. `from()`
întoarce un obiect al cărui URL e mutat de fiecare filtru; refolosit pentru un
UPDATE sau un al doilea SELECT, cumulează filtrele:

- cronul de warm-up ar fi marcat ca trimis **doar primul contact din batch**
  (`id=eq.A&id=eq.B` → 0 rânduri), deci restul ar fi primit emailul din nou
  în fiecare zi după expirarea cheii de idempotență Resend (24 h);
- statisticile din `/admin/marketing` ar fi arătat același număr pe toate
  cele patru casete;
- conversia după apel din `/admin/recuperare-telefonica` ar fi fost mereu 0/0.

În plus: contactele sărite (fără email, domeniu nelivrabil, respinse de Resend)
nu erau marcate și ar fi blocat capul cozii FIFO la infinit → migrarea 158
(`warmup_skipped_at` + motiv); pauză de 600 ms între trimiteri (limita Resend
de 2 cereri/s); `POST` pe dezabonare pentru one-click RFC 8058.

Test nou: `tests/unit/api/cron-warmup-campaign.test.ts` (verifică inclusiv că
fiecare UPDATE folosește un `from()` nou).

## 4. Emailuri de lifecycle + campanii manuale (migrarea 159) — a doua rundă, aceeași zi

Propunerea acceptată de Raul („hai să facem propunerea"): emailuri către **clienți**
(au cumpărat), nu doar către lead-uri.

- **Cerere de recenzie Google** la 3–10 zile după finalizare — DOAR comenzile livrate în
  termen și fără pauze/reîncărcări (`wasOnTime`). Un client căruia i-a mers prost nu e
  rugat să scrie recenzie.
- **Reminder de expirare**: cazier judiciar + integritate 6 luni, cazier fiscal / auto /
  constatator 30 zile; pleacă cu 14 zile înainte (până la 30 zile după), o dată per
  comandă, nu dacă a recomandat deja. Extrasul CF nu primește (n-are termen legal).
- **Cross-sell** la 30–60 zile: 2–3 documente înrudite, active, necumpărate; un email per
  client la 6 luni.
- **Campanii manuale** în `/admin/marketing`: subiect + corp markdown-lite + buton,
  segment (clienți / abonați / tot registrul), tranșe zilnice, „Test" pe adresa proprie,
  Pornește / Pauză. Cronul parcurge registrul cu cursor keyset.
- `orders.completed_at` **nu exista** (`actual_completion_date` NULL pe toate cele 389) —
  coloană nouă, backfill din `order_history`, trigger pentru viitor.
- Claim atomic prin UNIQUE `(order_id, kind)` inserat înainte de trimitere.

Toate comutatoarele sunt **oprite**; se pornesc din admin după citirea șabloanelor.
Spec: `docs/technical/specs/lifecycle-emails.md`.

## Fișiere

- `supabase/migrations/156_phone_recovery_tracking.sql`, `157_contacts_warmup_campaign.sql`, `158_contacts_warmup_skip.sql` — toate aplicate live
- `src/app/admin/recuperare-telefonica/page.tsx`, `src/app/api/admin/orders/priority-calls/route.ts`, `src/app/api/admin/orders/[id]/phone-contact/route.ts`
- `src/app/api/cron/warmup-campaign/route.ts`, `src/app/api/contacts/unsubscribe/route.ts`, `src/app/api/admin/marketing/warmup-stats/route.ts`
- `src/lib/orders/abandoned-progress.ts` (extras din `recovery-emails` + scor de profunzime), `src/lib/email/deliverability.ts`, `src/lib/email/resend.ts`
- `vercel.json` (cron nou)
