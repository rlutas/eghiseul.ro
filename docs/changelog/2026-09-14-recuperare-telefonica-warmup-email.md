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

## 5. Recovery în 3 pași (migrarea 160) — a treia rundă, aceeași zi

Cronul `recovery-emails` (la 15 min) nu mai trimite un singur email cu cupon (1,4%
redemption), ci: **pasul 1** la 30 min (draft: 2 h idle) „reia de unde ai rămas", fără
cupon; **pasul 2** la +24 h încredere (cei 3 pași după plată, echipă reală, rating Google
real, WhatsApp), fără cupon; **pasul 3** la +48 h cuponul 10%/48 h. Progres pe comandă
(`recovery_email_step` 0–3); cei 774 care primiseră deja emailul vechi sunt marcați
terminați. Extrasul CF intră și el la reminderul de expirare (30 zile, decizie Raul).
Script de preview pentru toate șabloanele: `scripts/email-previews.ts`.
Detalii: `docs/admin/abandoned-carts.md` Layer 2.

## 6. Cupon + email de follow-up direct din „Bifează sunat" (idee Raul)

În `/admin/recuperare-telefonica`, dialogul „Bifează sunat" creează cuponul
`TEL-XXXXXXXX` (procent ales de agent, 7 zile, unică folosință) sau validează un
cod existent și trimite clientului emailul „ai vorbit cu <prenumele agentului>,
ai X% reducere, reia comanda din link" — link-ul poartă `?coupon=`, care se
aplică automat la aterizare (checkout + wizard). Fără email valid: cuponul se
creează, emailul se sare, agentul dă codul pe WhatsApp.

## 7. Coada telefonică reparată + curățenie cupoane și drafturi (a patra rundă)

Raul: „la abandonuri cam mică lista și-s numa de-ăștia super vechi". Audit pe 901
comenzi: coada arăta 37. **162 erau excluse ca „fără nume"** pentru că numele stătea
în `billing` (extras CF / proprietate), nu în `personal`. Reparat + ordine nouă
(cele sub 24 h primele, verde), un rând per email cu „×N", adrese inventate excluse.
Cupoane: 1.423 RECOVERY expirate și nefolosite în listă → `/admin/coupons` arată
implicit doar active (chips Active/Expirate/Toate, badge „Expirat"), iar cronul
`recovery-emails` șterge cupoanele de sistem expirate >7 zile și nefolosite.
Drafturi: cronul `auto-abandon` șterge drafturile >30 zile cu doar contactul
completat (61 azi). Nicio migrare.

## 8. Activare + KPI (a cincea rundă)

Raul: „hai să activăm campaniile care crezi că o să meargă". Pornite: recenzie,
expirare, cross-sell (`lifecycle_emails`) și warm-up la 25/zi. Recovery-ul în 3 pași
era deja activ. Campaniile manuale rămân la latitudinea echipei (editorul e gata).
Card nou **„KPI marketing"** în `/admin/marketing` (7/30/90 zile): trimise, comenzi,
venit per canal, din `orders.attribution.last` (UTM pe toate linkurile din emailuri,
`lib/email/utm.ts`) + legături directe (recovery step, bifa telefonică, cupoane).

## Fișiere

- `supabase/migrations/156_phone_recovery_tracking.sql`, `157_contacts_warmup_campaign.sql`, `158_contacts_warmup_skip.sql` — toate aplicate live
- `src/app/admin/recuperare-telefonica/page.tsx`, `src/app/api/admin/orders/priority-calls/route.ts`, `src/app/api/admin/orders/[id]/phone-contact/route.ts`
- `src/app/api/cron/warmup-campaign/route.ts`, `src/app/api/contacts/unsubscribe/route.ts`, `src/app/api/admin/marketing/warmup-stats/route.ts`
- `src/lib/orders/abandoned-progress.ts` (extras din `recovery-emails` + scor de profunzime), `src/lib/email/deliverability.ts`, `src/lib/email/resend.ts`
- `vercel.json` (cron nou)
