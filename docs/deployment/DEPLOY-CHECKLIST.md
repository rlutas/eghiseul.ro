# Deploy Checklist — eGhișeul.ro

**Status:** 🔴 NU SUNTEM ÎNCĂ LIVE. Acest document acumulează tot ce trebuie la cutover.
**Ultima actualizare:** 2026-05-27
**Aplicat ca referință când:** „suntem gata să mergem live cu eghiseul.ro"

---

## TL;DR — cutover one-liner

```
☐ Aplicat toate migrations 001-042 pe DB prod
☐ Setate env vars (vezi secțiunea Env Vars) în Vercel
☐ DNS Resend (DKIM + DMARC + SPF) propagat pe eghiseul.ro
☐ Stripe webhook configurat → /api/webhooks/stripe
☐ Oblio webhook configurat (dacă există în setup-ul lor)
☐ Cron-uri programate (vezi vercel.json — 4 cron-uri)
☐ Smoke tests trecute (vezi secțiunea finală)
☐ Backup DB curent + plan rollback
```

---

## 1. Database (Supabase)

### Migrations de aplicat (în ordine, niciuna nu poate fi sărită)

```
001-002    schema inițial + servicii
003-035    sprint 0-6 (orders/admin/RBAC/AWB/numere registru/etc.)
036        pricing realignment 2026-05-20
037        cazier PJ entity blocking
038        cazier judiciar display range (2-4 zile)
039        Step 2 simplification (parentDataRequired: false, etc.)
040        Apostila Haga 238 → 198 RON
041        🆕 abandoned cart system (status='abandoned', is_test, system_kind, recovery_email_sent_at)
042        🆕 modify order refund tracking (refunded_amount, additional_paid_amount, pending_extra_payment_*, last_modified_*)
```

**Procedura recomandată:**
```bash
# Verifică ce e aplicat
ls supabase/migrations/

# Aplică toate (recomandat prin Node pg module + script)
# vezi docs/deployment/DATABASE_MIGRATIONS.md pentru ghidul complet
```

### Coloane noi (de verificat post-migration)

```sql
-- orders
SELECT column_name FROM information_schema.columns
WHERE table_name='orders' AND column_name IN (
  'is_test', 'recovery_email_sent_at',
  'refunded_amount', 'additional_paid_amount',
  'pending_extra_payment_url', 'pending_extra_payment_amount', 'pending_extra_payment_intent_id',
  'last_modified_at', 'last_modified_by'
);
-- Expected: 9 rows

-- coupons
SELECT column_name FROM information_schema.columns
WHERE table_name='coupons' AND column_name = 'system_kind';
-- Expected: 1 row

-- order_history event_types
SELECT pg_get_constraintdef(oid) FROM pg_constraint
WHERE conname = 'order_history_event_type_check';
-- Expected: trebuie să conțină 'abandoned', 'modified', 'recovery_email_sent', 'extra_payment_sent', 'extra_payment_received'
```

### Backup înainte de cutover

```bash
# Supabase Pro: PITR ar trebui să fie activat. Cere snapshot manual înainte de deploy.
# Verifică din dashboard: Database → Backups → Create backup
```

### RLS policies

Pentru cron endpoint-uri folosim service role (bypass RLS). Verifică că:
- `orders` RLS policies există pentru customer access
- Service role key disponibil în Vercel env vars

---

## 2. Env Vars — Vercel

### Existente (deja configurate probabil în dev)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://llbwmitdrppomeptqlue.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_PASSWORD=...                    # pentru migrations script-uri

# Google AI (OCR + KYC)
GOOGLE_AI_API_KEY=...

# Stripe (cheie LIVE pentru cutover, NU sk_test_!)
STRIPE_SECRET_KEY=sk_live_...               # ⚠️ schimbat din test la live
STRIPE_WEBHOOK_SECRET=whsec_...             # generat după webhook setup (vezi mai jos)

# AWS S3 (KYC + contracts + signatures)
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET_DOCUMENTS=eghiseul-documents

# Couriers
FANCOURIER_USERNAME=...
FANCOURIER_PASSWORD=...
FANCOURIER_CLIENT_ID=...
SAMEDAY_USERNAME=...
SAMEDAY_PASSWORD=...
SAMEDAY_USE_DEMO=false                       # ⚠️ pe live!

# Oblio (facturare)
OBLIO_CLIENT_ID=...
OBLIO_CLIENT_SECRET=...
OBLIO_COMPANY_CIF=...
OBLIO_SERIES_NAME=EGH

# Cron
CRON_SECRET=<random 32+ chars>               # același folosit de toate cron-urile

# SMS + Email (Resend) — vezi secțiunea 3
RESEND_API_KEY=re_...
SMSLINK_API_KEY=...
```

### Noi pentru features 2026-05-27 (de adăugat)

```env
# Resend — pentru recovery emails + extra payment emails + viitor notifications
RESEND_API_KEY=re_xxx                        # 🆕 obține din Resend dashboard
RESEND_FROM='eGhișeul.ro <contact@eghiseul.ro>'  # 🆕
RESEND_REPLY_TO=contact@eghiseul.ro          # 🆕

# Public app URL pentru link-uri în emails (recovery, extra payment, etc.)
NEXT_PUBLIC_APP_URL=https://eghiseul.ro      # 🆕 (fără slash trailing)

# Slack alerting (opțional dar recomandat — fără el cron-urile doar log)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/.../...   # 🆕 opțional

# Feature flags
OBLIO_REISSUE_ENABLED=true                   # 🆕 activează butonul „Storno + Reemite" în admin
                                              # Fără el endpoint-ul returnează 503; admin face manual din Oblio UI
```

### Verificare env vars în Vercel UI

```
Project Settings → Environment Variables → asigură-te că:
  • Toate sunt setate pe „Production"
  • Stripe key e sk_live_*, NU sk_test_*
  • SAMEDAY_USE_DEMO=false
  • Nu există typos pe key-uri
```

---

## 3. DNS + Resend

### Pași în Resend Dashboard

1. **Sign up / Login** la resend.com
2. **Domains → Add Domain** → `eghiseul.ro`
3. Vor da 3 DNS records de adăugat:
   - **DKIM** (`resend._domainkey.eghiseul.ro` TXT)
   - **SPF** (`@` TXT cu `include:_spf.resend.com`)
   - **DMARC** (`_dmarc.eghiseul.ro` TXT cu `v=DMARC1; p=quarantine; rua=mailto:dmarc@eghiseul.ro`)

### Pași în provider DNS (Cloudflare / Namecheap / etc.)

1. Adaugă cele 3 records primite din Resend
2. **Timpul de propagare:** 5-30 min de obicei, până la 24h în cazuri rare
3. **Verificare:** `dig @1.1.1.1 resend._domainkey.eghiseul.ro TXT`

### Verificare în Resend

```
Dashboard → Domains → eghiseul.ro → status trebuie să fie „Verified" (verde)
```

### Test trimitere email

```bash
# După deploy + DNS propagat:
curl -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "eGhișeul.ro <contact@eghiseul.ro>",
    "to": ["sishuletz@gmail.com"],
    "subject": "Test cutover",
    "html": "<p>If you see this, DNS + Resend works.</p>"
  }'
# Expected: {"id":"...", ...}
```

---

## 4. Stripe Webhook

### URL endpoint

```
https://eghiseul.ro/api/webhooks/stripe
```

### Pași în Stripe Dashboard (live mode!)

1. **Live mode** (toggle dreapta sus) — NU test mode pentru cutover
2. **Developers → Webhooks → Add endpoint**
3. URL: `https://eghiseul.ro/api/webhooks/stripe`
4. **Events to send** (selectează):
   - `payment_intent.succeeded` (existent — confirmă plata)
   - `payment_intent.payment_failed`
   - `charge.refunded` (🆕 pentru modify dialog — sincronizează refunded_amount)
   - `checkout.session.completed` (dacă mai folosim Checkout — în prezent doar PaymentIntents)
5. **Signing secret:** copiază în `STRIPE_WEBHOOK_SECRET` (Vercel env var)
6. **Save**

### Verificare

```bash
# Trimite eveniment test din dashboard → trebuie să vadă răspuns 200
curl -s https://eghiseul.ro/api/webhooks/stripe -X POST \
  -H 'stripe-signature: t=...'  # invalid signature pentru test
# Expected: 400 cu invalid signature (asta confirmă că endpoint primește requests)
```

---

## 5. Crons (Vercel)

`vercel.json` are 4 cron-uri active. Vercel le programează automat la deploy:

| Path | Schedule | Frecvență | Ce face |
|------|----------|-----------|---------|
| `/api/cron/update-tracking` | `*/30 * * * *` | la 30 min | Update AWB tracking pentru orderele active |
| `/api/cron/auto-abandon` | `*/15 * * * *` | la 15 min | Pending > 30 min → abandoned |
| `/api/cron/recovery-emails` | `*/15 * * * *` | la 15 min | Generează cupoane RECOVERY + trimite emailuri |
| `/api/cron/invoice-health-check` | `0 * * * *` | la 1 oră | Alertă Slack pentru paid fără factură > 30 min |

### Verificare după deploy

```
Vercel Dashboard → Project → Crons → ar trebui să vezi 4 rânduri verzi
Click pe oricare → Logs → ultimul run trebuie să fie 200 OK
```

### Test manual

```bash
# Auto-abandon (dev only GET; pe prod folosește POST)
curl -X POST "https://eghiseul.ro/api/cron/auto-abandon" \
  -H "Authorization: Bearer $CRON_SECRET"
# Expected: {"success":true,"data":{"abandonedCount":N, ...}}
```

---

## 6. Oblio Webhook (facturare)

Oblio nu trimite webhook în mod implicit — invoice generation pleacă DIN api-ul nostru. Setup:

1. **Obține credentials** din Oblio Dashboard → Account → API
2. Adaugă în Vercel env vars: `OBLIO_CLIENT_ID`, `OBLIO_CLIENT_SECRET`, `OBLIO_COMPANY_CIF`, `OBLIO_SERIES_NAME=EGH`
3. **Test invoice generation:**
   ```bash
   # După prima comandă reală de pe live, verifică:
   # Admin → /admin/orders/[id] → trebuie să apară invoice_number + invoice_url
   ```
4. **Health-check cron** va alerta automat dacă Oblio nu generează factura în 30 min.

---

## 7. Hardcoded URLs de verificat

Înainte de live, grep pentru orice referință la `localhost:3000` sau `cazierjudiciaronline.com` în UI/email-uri:

```bash
grep -rn "localhost:3000\|http://localhost" src --include="*.tsx" --include="*.ts" | grep -v "\.test\." | grep -v "// " | head
```

**Cunoscute** (toate folosesc `NEXT_PUBLIC_APP_URL` fallback la `eghiseul.ro`):
- `src/app/api/cron/recovery-emails/route.ts` (resume URL)
- `src/app/api/admin/orders/[id]/modify/route.ts` (extra payment URL)
- `src/lib/email/resend.ts` (FROM default)

---

## 8. Security checklist

```
☐ SUPABASE_SERVICE_ROLE_KEY rotat (cheia veche e în git history — vezi STATUS_CURRENT)
☐ CRON_SECRET nou (32+ chars random)
☐ STRIPE_SECRET_KEY = sk_live_* (NU test)
☐ AWS S3 bucket policy: deny public read, allow signed URLs only
☐ Resend API key: limitat la "Send only" (nu admin)
☐ Slack webhook: dedicat unui canal privat (#bots / #alerts)
☐ Toate API routes admin verifică `requirePermission(...)` — verificat
☐ Toate cron routes verifică `Bearer ${CRON_SECRET}` — verificat
```

Vezi și `docs/deployment/PRODUCTION_SECURITY_SETUP.md` pentru ghidul de securitate complet.

---

## 9. SEO + Redirects (cutover specific)

WordPress curent live cu trafic. La cutover:

```
☐ Sitemap nou (/sitemap.xml) verificat în Google Search Console
☐ Redirects 301 din WP slugs vechi → Next.js (vezi seo/REBUILD-QUEUE.md)
☐ robots.txt permite crawlers (verifică /robots.txt)
☐ llms.txt prezent (deja există /public/llms.txt)
☐ Schema.org markup pe paginile rebuilt (deja prezent pe Cazier #1)
☐ Page #1 (cazier-judiciar-online) — user feedback negativ pe vizual, decizie pre-launch
☐ Restul 46 pagini SEO rebuild queue — minim Page #2 (cazier-fiscal-online) înainte de cutover
```

Vezi `docs/seo/SEO-MASTER-PLAN-2026-05-20.md` + `docs/seo/REBUILD-QUEUE.md`.

---

## 10. Monitoring & Alerting

### Sentry (recomandat)

```
☐ Sentry project creat pentru eghiseul.ro
☐ NEXT_PUBLIC_SENTRY_DSN setat
☐ Source maps uploaded la deploy
```

### Vercel Analytics

```
☐ Web Analytics enabled în Vercel project
☐ Speed Insights enabled
```

### Slack alerts (din cron-uri)

```
☐ Webhook canal dedicat (#eghiseul-alerts sau similar)
☐ SLACK_WEBHOOK_URL setat în Vercel
☐ Test alert manual prin invoice-health-check GET în dev
```

---

## 11. Smoke tests după deploy (în ordine)

```
☐ Homepage `/` se încarcă (200)
☐ `/comanda/cazier-judiciar` deschide wizard-ul (200)
☐ Plasează o comandă PF de test (cu Stripe test card 4242...)
☐ Email confirmare pleacă (Resend log)
☐ Order apare în `/admin/orders` cu badge „Plătita"
☐ Detail page `/admin/orders/[id]` arată servicii grupate + termen estimat corect
☐ Buton „Modifică" apare pe order paid → dialog se deschide
☐ Click „Calculează diferența" returnează preview valid
☐ Webhook Stripe → invoice se generează în Oblio
☐ Crons rulează (verifică Vercel Functions logs la 15 min)
☐ Dashboard `/admin` arată metrici nenzero
```

### Cazuri de test specifice

1. **Order completă PF cu Stripe test** (cardul 4242 4242 4242 4242, orice CVV/dată viitoare)
2. **Modifică order plătită** → schimbă urgenta → preview → apply refund → verifică Stripe refund pe live (sau test mode dacă mai testezi)
3. **Coș abandonat** → plasează o comandă cu email, NU plăti, aștept 35 min → cron flag → primește email cu cupon
4. **Note Echipă** → POST `/api/admin/orders/[id]/notes` → verifică în istoric

---

## 12. Rollback plan

Dacă ceva merge prost post-deploy:

```
1. Vercel: Deployments → previous → Promote to Production (revine instant la versiunea anterioară)
2. DB migrations: NU se pot da rollback la 041+042 ușor (CHECK constraints + new columns)
   → Dacă strict necesar, rulează un down-migration manual care:
     - DROP CONSTRAINT orders_status_check
     - ADD CONSTRAINT cu setul vechi (fără 'abandoned')
     - DROP COLUMN orders.is_test, orders.refunded_amount, etc.
   → SAU lasă coloanele goale + revert codul (mai safe)
3. Stripe webhook: dezactivează endpoint-ul din Dashboard până rezolvi codul
4. Crons: șterge temporar din vercel.json → redeploy (oprește execuția)
```

---

## 13. Comunicare cutover

Înainte de DNS switch (WP → Next.js):

```
☐ Anunț pe Slack #equipa cu fereastra de cutover
☐ Email scurt la lista de clienți existenți (opțional, dar recomandat) cu noul URL/UX
☐ Status page `status-comanda` funcțional pe ambele versiuni în timpul tranziției (~24h)
☐ Echipa admin operațională în primele 24h pentru triere ordere primele
```

---

## Status azi (2026-05-27)

**LIVE-READY: 80%**

- ✅ Cod features-complete (admin, wizard, payment, refund, abandoned carts, dashboard)
- ✅ DB migrations 001-042 testate
- ✅ 854 unit tests passing
- ✅ Type-check curat
- ✅ Crons configurate
- ✅ Sister project parity 10/13 features

**Lipsă pentru cutover (P0-P1):**

- ~~Storno + Reemite factură Oblio~~ ✅ GATA (behind `OBLIO_REISSUE_ENABLED` feature flag)
- 🔴 Rotire `SUPABASE_SERVICE_ROLE_KEY` (leaked in git history Feb)
- 🟡 Page #1 (cazier-judiciar-online) — user feedback negativ pe vizual; rebuild Page #2 + #3 pentru cele mai SEO-cerute
- 🟡 Resend domain DNS configurat
- 🟡 Stripe live keys + webhook setup
- 🟡 SMTP/dunde Slack pentru alerts

**Estimare totală până la „LIVE":** 2-4 zile lucrătoare pentru a încheia P0 + decizie strategică despre Page #1 vizual.

---

## Referințe

- `docs/admin/PARITY-MATRIX.md` — feature comparison sister vs noi
- `docs/admin/abandoned-carts.md` — handbook coșuri abandonate
- `docs/admin/modify-order.md` — handbook Modifică comandă
- `docs/seo/SEO-MASTER-PLAN-2026-05-20.md` — strategie SEO cutover
- `docs/deployment/DATABASE_MIGRATIONS.md` — ghid migrations
- `docs/deployment/PRODUCTION_SECURITY_SETUP.md` — security setup
- `docs/deployment/AWS_S3_SETUP.md` — S3 bucket policies
- `vercel.json` — cron schedules
