# Sesiune 2026-05-27 (după-amiază) — Admin parity overhaul

**Continuare** după `2026-05-27-step2-simplification.md`. Focus: paritate cu `cazierjudiciaronline.com` admin + sistem complet coșuri abandonate + extras `eghiseul.ro` ca **umbrella platform**.

**Started:** ~10:00 RO
**Last Updated:** ~14:50 RO
**Tests:** 786 → **844** (+58)
**Polish final:** Pure functions extracted (`recovery-code.ts`, `dashboard-aggregators.ts`) — toate logice complexe acum unit-testabile fără Supabase/Stripe mock.

---

## Context

User a cerut explicit:
1. „bun acuma în admin dashboard să avem toate chestiile noi ce le-ai făcut ca în celălalt proiect"
2. „și partea cu coșuri abandonate"
3. „să arate la fel cazierjudiciaronline.com ca și aici, și în nav la fel, adminul să fie la fel"

Înainte de a face cod, am citit DOCS-urile din sister project:
- `cazierjudiciaronline.com/docs/admin/orders.md` (270 linii)
- `cazierjudiciaronline.com/docs/admin/dashboard.md` (104 linii)
- `cazierjudiciaronline.com/docs/admin/modifica-comanda.md` (511 linii)
- `cazierjudiciaronline.com/docs/admin/coupons.md` (111 linii)
- `cazierjudiciaronline.com/src/app/(admin)/admin/orders/[id]/page.tsx` (2062 linii — scanat selectiv)
- `cazierjudiciaronline.com/src/components/admin/admin-shell.tsx` (148 linii — port integral)
- `cazierjudiciaronline.com/src/app/(admin)/admin/page.tsx` (421 linii — dashboard layout)
- `cazierjudiciaronline.com/src/lib/delivery-calculator.ts` (326 linii)

Apoi am creat **PARITY-MATRIX.md** cu inventar feature-by-feature.

---

## Realizat

### 1. Sistem complet coșuri abandonate

**DB migration 041** (`041_abandoned_cart_system.sql`):
- `orders.status` CHECK extended cu `'abandoned'`
- `orders.is_test BOOLEAN` (sandbox filter) + index compus
- `order_history.event_type` CHECK extended cu `abandoned`, `recovery_email_sent`, `note_added` + legacy values (`order_submitted`, `payment_confirmed`)
- `coupons.system_kind TEXT` (`'recovery'` pentru auto-generate) + partial index
- `orders.recovery_email_sent_at TIMESTAMPTZ`

**Cron auto-abandon** (`src/app/api/cron/auto-abandon/route.ts`):
- `POST` flip-uiește `status='pending' AND created_at < NOW() - 30 min` → `abandoned`
- Audit per order: `event_type='abandoned'`, `changed_by='system-cron'`
- Cap 500 rânduri/rulare, `GET` dry-run în dev
- Mirror exact al `cazierjudiciaronline.com/api/cron/abandonment` step 1

**Cron recovery-emails** (`src/app/api/cron/recovery-emails/route.ts`):
- Pentru abandoned 30min-7days fără recovery trimis:
  - Generează cupon `RECOVERY-XXXXXXXX` (alfabet curat, retry on collision)
  - 10% off, 48h, max_uses=1, `system_kind='recovery'`
  - Trimite email via Resend (HTML + text, XSS-escaped)
  - Marchează `recovery_email_sent_at`
- Fără `RESEND_API_KEY`: creează cupoane, skipează send (rulare ulterioară cu key va trimite)
- Cap 100/rulare

**Resend wrapper** (`src/lib/email/resend.ts`):
- Fetch-based REST API (fără dependency în package.json)
- `sendEmail(input)` returnează `{id, skipped, reason}`
- Idempotency-Key header pentru dedup 24h

**Email template** (`src/lib/email/templates/abandoned-recovery.ts`):
- `buildRecoverySubject` — personalizat cu prenume când există
- `buildRecoveryHtml` — full inline (no external assets), XSS escape (`<script>` în prenume → `&lt;script&gt;`)
- `buildRecoveryText` — plain text fallback

**vercel.json**: 2 cron-uri noi `*/15 * * * *` (`auto-abandon`, `recovery-emails`).

### 2. Admin list extins

**`src/app/api/admin/orders/list/route.ts`**:
- `HIDDEN_FROM_DEFAULT = ['draft', 'pending', 'abandoned']` în vederea „Toate"
- Sandbox filter `?test=only|all` (default ascunde `is_test=true`)
- Stripe payment route stamps `is_test=true` când cheia începe cu `sk_test_`

**`src/app/admin/orders/page.tsx`**:
- Status `'abandoned'` adăugat în `STATUS_CONFIG` cu badge nou „Abandonata" (`bg-neutral-200`)
- Status în `ALL_STATUSES` dropdown

### 3. Note Echipă endpoint

**`src/app/api/admin/orders/[id]/notes/route.ts`** — `POST` cu `{ note }`:
- Permission: `orders.manage`
- Validation: trim, min 1 char, max 5000
- Insert `order_history` cu `event_type='note_added'`, `changed_by=<admin email>`

UI card pe order detail rămâne TODO (endpoint testabil cu cURL acum).

### 4. Admin dashboard extins

**Stats endpoint** (`/api/admin/dashboard/stats`) +8 metrici:
- `abandonedToday`, `abandoned30d` — funnel
- `recoveryEmailsSent30d`, `recoveryRecovered30d`, `recoveryRatePercent`
- `testOrdersTotal` — cohort sandbox
- `statusDistribution[]` — pentru bar chart
- `serviceBreakdown[]` — pentru bar chart luna curentă cu count + revenue per service slug
- `totalOrders` recalculat exclude `HIDDEN_FROM_DEFAULT`

**Dashboard UI** (`/admin`):
- **Card mare „Coșuri abandonate (ultimele 30 zile)"** cu 4 tile-uri funnel (Abandonate astăzi / Total 30 zile / Emailuri trimise / Recuperate cu rate %) + link la lista filtrată
- **Bar chart „Distribuție pe status (30 zile)"** — badge color-coded + bar orizontal proporțional + count
- **Bar chart „Servicii (luna curentă)"** — nume + bar pe revenue + count + revenue formatat
- A11y: `role="progressbar"` + ARIA attributes
- Header right: **„Total (all time)"** stat (sister pattern)
- Subtitle: „Privire generală asupra comenzilor și veniturilor"

### 5. **Buton Modifică comandă plătită** — P0 mare feature (cel mai mare lipsă operațional)

Mirror al `cazierjudiciaronline.com/api/admin/orders/[id]/modify` (527 linii) adaptat la modelul nostru JSONB.

**Componente:**
- `supabase/migrations/042_modify_order_refund_tracking.sql` — 7 coloane noi pe orders (refunded_amount, additional_paid_amount, pending_extra_payment_*, last_modified_*), event_types modified/extra_payment_sent/extra_payment_received
- `src/lib/orders/modify-diff.ts` — pure math: `computeModifyDiff` + `describeChanges`. Float-safe round, cap defensive
- `src/lib/stripe.ts` — `createRefund(paymentIntentId, amountRon, reason, metadata)` + `createExtraPaymentIntent({orderId, amountRon, customerId, ...})`
- `src/app/api/admin/orders/[id]/modify/route.ts` — preview + apply (refund / extra payment / none) cu audit log
- `src/components/admin/modify-order-dialog.tsx` (~340 linii) — UI dialog 2-step (tweak → preview → apply)
- Buton „Modifică" lângă „Reincarca" pe order detail, vizibil doar pe `payment_status='paid'`

**Tests:** `tests/unit/lib/orders/modify-diff.test.ts` — **15 teste** (path-uri none/refund/extra, edge cases, humanization)

**Docs noi:** `docs/admin/modify-order.md` (handbook complet — scenarii, API, math, DB schema, audit, limitări vs sister, curl verification)

**Limitări curente (P1 pentru sesiunile următoare):**
- Curier swap incomplet — doar `deliveryPrice` se schimbă, nu `delivery_method` JSONB obiect complet (necesită UI dropdown)
- Email plată extra fără template Resend — `client_secret` returnat în răspuns + persistat în `pending_extra_payment_url` (admin copiază manual)
- Storno + Reemite factură Oblio — separat, P0 următoare sesiune

### 6. Admin shell — port vizual 1:1 cu sister

**`src/app/admin/layout.tsx`**:
- **Sidebar dark `bg-slate-900 text-white`** (înainte: white)
- Logo: badge `bg-primary-500` cu „eG" + „eGhișeul.ro" (sister: blue „CJ" + „Cazier Judiciar Online")
- Nav idle `text-slate-400`, active `bg-slate-800 text-white`, hover `bg-slate-800/50`
- Icon size `h-5 w-5 shrink-0` (sister sizing)
- **Nav item nou: „Abandonuri"** (icon `UserX`) → `/admin/orders?status=abandoned`
- User footer: avatar `bg-slate-700`, slate text colors, logout slate-themed
- Mobile header simplificat la `lg:hidden` cu „Admin Panel"

---

## Fișiere atinse

### Abandoned cart system + admin shell + dashboard

```
supabase/migrations/041_abandoned_cart_system.sql                NOU
src/app/api/cron/auto-abandon/route.ts                           NOU
src/app/api/cron/recovery-emails/route.ts                        NOU
src/app/api/admin/orders/[id]/notes/route.ts                     NOU
src/lib/email/resend.ts                                          NOU
src/lib/email/templates/abandoned-recovery.ts                    NOU
src/lib/coupons/recovery-code.ts                                 NOU (extract pure pentru testing)

src/app/api/admin/orders/list/route.ts                           (HIDDEN_FROM_DEFAULT + test filter)
src/app/api/admin/dashboard/stats/route.ts                       (+8 metrici, folosește aggregators)
src/app/api/orders/[id]/payment/route.ts                         (stamp is_test)
src/app/admin/layout.tsx                                         (dark slate sidebar + Abandonuri nav)
src/app/admin/page.tsx                                           (Coșuri abandonate card + bar charts + Total all time)
src/app/admin/orders/page.tsx                                    (status abandoned)
src/lib/admin/dashboard-aggregators.ts                           NOU (extract pure pentru testing)

vercel.json                                                       (+2 cron schedule)
```

### Modify order plătită (P0)

```
supabase/migrations/042_modify_order_refund_tracking.sql         NOU
src/lib/orders/modify-diff.ts                                    NOU (pure math)
src/lib/stripe.ts                                                (createRefund + createExtraPaymentIntent)
src/app/api/admin/orders/[id]/modify/route.ts                    NOU (preview + apply)
src/components/admin/modify-order-dialog.tsx                     NOU (~340 linii UI)
src/app/admin/orders/[id]/page.tsx                               (buton Modifică + state + mount dialog)
```

### Tests (+58 noi în sesiunea PM)

```
tests/unit/lib/email/abandoned-recovery.test.ts                  NOU (9 teste)
tests/unit/lib/orders/modify-diff.test.ts                        NOU (15 teste)
tests/unit/lib/coupons/recovery-code.test.ts                     NOU (9 teste)
tests/unit/lib/admin/dashboard-aggregators.test.ts               NOU (13 teste)
```

### Docs

```
docs/admin/abandoned-carts.md                                    NOU (handbook coșuri abandonate)
docs/admin/modify-order.md                                       NOU (handbook modify)
docs/admin/PARITY-MATRIX.md                                      (actualizat — 10 features marcate ✅)
docs/STATUS_CURRENT.md                                           (5 update-uri cronologice + header)
docs/session-logs/2026-05-27-admin-parity-overhaul.md            NOU (acest fișier)
docs/README.md                                                   (index actualizat)
```

---

## Env vars necesare

```env
CRON_SECRET=<random 32+ chars>
RESEND_API_KEY=re_xxx                    # opțional — fără el, cupoanele se creează dar nu se trimit emailuri
RESEND_FROM='eGhișeul.ro <contact@eghiseul.ro>'
RESEND_REPLY_TO=contact@eghiseul.ro
NEXT_PUBLIC_APP_URL=https://eghiseul.ro
```

În Vercel: setează env vars + configurează DNS Resend (DKIM + DMARC pentru `eghiseul.ro`).

---

## Tests

**Înainte:** 786 verzi · **După:** **844 verzi** (+58).

Adăugate astăzi PM:
- `tests/unit/lib/email/abandoned-recovery.test.ts` — **9 teste** — subject, HTML, XSS escape, plain text, URL attr escape
- `tests/unit/lib/orders/modify-diff.test.ts` — **15 teste** — toate path-urile (none/refund/extra_payment), edge cases (refunded > paid, snake_case options, additional_paid), humanization helper
- `tests/unit/lib/coupons/recovery-code.test.ts` — **9 teste** — alphabet curat (no 0/O/1/I/L), length 17, prefix, deterministic with injected RNG, anti-collision over 1000 runs, isRecoveryCouponCode classifier
- `tests/unit/lib/admin/dashboard-aggregators.test.ts` — **13 teste** — status distribution sort, service revenue rounding, recovery rate edge cases (0 sent, ties, null fallbacks)

**46 teste noi pentru abandoned cart system + modify + dashboard.**

```bash
npm run test                # 844 passed | 10 skipped (854)
npx tsc --noEmit -p .       # clean
```

---

## Paritate cu sister project — status

Vezi [`docs/admin/PARITY-MATRIX.md`](../admin/PARITY-MATRIX.md) pentru tabelul complet.

**Completate astăzi (10 features mari):**
- ✅ Auto-abandon pending → abandoned (cron)
- ✅ Recovery email + cupon auto-generat (cron + Resend + template)
- ✅ Tab Abandonate + status badge
- ✅ Sandbox/test filter (schema + filter; chips UI TODO)
- ✅ Note Echipă endpoint (UI card TODO)
- ✅ Dashboard Coșuri abandonate funnel
- ✅ Dashboard Distribuție pe status bar chart
- ✅ Dashboard Servicii bar chart luna curentă
- ✅ Admin shell port (dark slate-900 sidebar + Abandonuri nav)
- ✅ **Buton Modifică comandă plătită** (refund auto + plată extra via PaymentIntent) — **cel mai mare P0**

**Pendinte (priorități descrescătoare):**

🔴 P0 (operațional critic):
- Buton Modifică comandă plătită (refund/plată extra) — 2-3 zile
- Storno + Reemite factură Oblio — 1 zi
- Health-check cron paid fără factură + Slack — 4 ore

🟡 P1 (quality of life):
- UI card Note Echipă pe order detail — 4 ore
- UI chips sandbox Ascunse/Doar test/Toate — 2 ore
- Quick-picks motiv Step 1 (4 chips comune per service) — 4 ore
- Copy Sheet 1/2 (TSV pentru Google Sheets) — 4 ore

🟢 P2 (automation + delight):
- Auto-finalizare după AWB threshold per curier — 1 zi
- Localitate naștere dropdown sectoare București — 1 zi
- Help card status-comandă WhatsApp + Telefon — 2 ore
- Tracking colet `courier-tracking.ts` — 2 ore

---

## Next session

**Recomandare prioritizată după impact business:**

🔴 **P0 (1-2 zile fiecare):**
1. **Storno + Reemite factură Oblio** — după modify, factura veche nu mai reflectă noile linii. Sister face 1-click stornare + factură corectivă, ambele în SPV. Vezi `cazierjudiciaronline.com/docs/admin/modifica-comanda.md` secțiunea „Storno + Reemite factură SmartBill".
2. **Health-check cron** „paid fără factură > 30 min" + alertă Slack — operațional critic, prinde rapid când Oblio API e jos.
3. **Email plată extra** Resend template — completează Modify P0 (acum admin copiază manual `client_secret`).

🟡 **P1 quick wins (4h fiecare, deblochează echipa):**
- UI card Note Echipă pe order detail (endpoint deja gata)
- UI chips sandbox Ascunse/Doar test/Toate (filter deja merge)
- Quick-picks motiv solicitare la Step 1 (4 chips comune per service)
- Copy Sheet 1/2 TSV pentru Google Sheets

🟢 **P2 automation:**
- Auto-finalizare după AWB threshold per curier (1 zi)
- Localitate naștere dropdown sectoare București + mismatch warning (1 zi)
- Help card status-comandă WhatsApp + Telefon (2h)
- Tracking colet centralizat (2h)
- Curier swap în UI Modify (4h)

Vezi [`docs/admin/PARITY-MATRIX.md`](../admin/PARITY-MATRIX.md) pentru status complet.

**Verificat pe browser:**
- ✅ Sidebar dark slate cu Abandonuri nav
- ✅ Dashboard cu Coșuri abandonate card + bar charts + Total all time
- ✅ Admin list tab abandoned cu badge
- ✅ Stripe payment intent funcționează
- ✅ Wizard sidebar + checkout sidebar identice (OrderSidebar unified)
- ✅ Success page cu OrderSummaryCard + delivery 5-7 zile

**De verificat pe Vercel după deploy:**
- Crons auto-abandon și recovery-emails rulează la 15 min
- Resend trimite emailul (după configurare DNS)
- `is_test` se stamp-uiește corect
