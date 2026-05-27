# Coșuri Abandonate — Sistemul complet

**Status:** ✅ Aplicat 2026-05-27
**Inspirat din:** `cazierjudiciaronline.com/api/cron/abandonment` (cazierjudiciaronline foloseste un singur cron; noi am separat în două pentru claritate operațională)

## Ce este un coș abandonat

O comandă în statusul `pending` care nu a primit confirmare de plată în 30 de minute. Cauze tipice:
- Clientul a ajuns la pagina de plată dar a închis tab-ul înainte de redirect-ul Stripe
- Cardul a fost respins și clientul n-a încercat altul
- Clientul s-a răzgândit ultimul moment

Aceste comenzi rămâneau în `pending` la nesfârșit și poluau lista admin „Toate". Acum:

## Cum funcționează (3 layere)

### Layer 1: Auto-abandon (cron 15 min)

**Endpoint:** `POST /api/cron/auto-abandon`
**Frecvență:** la fiecare 15 min (vercel.json)
**Auth:** `Authorization: Bearer ${CRON_SECRET}`

Caută comenzi `status='pending' AND created_at < NOW() - 30 min` și le flip-uiește la `status='abandoned'`. Inserează rând în `order_history` cu:
- `event_type: 'abandoned'`
- `changed_by: 'system-cron'`
- `notes: 'Auto-abandonat: nicio plată confirmată în 30 min'`

Răspuns: `{ success: true, data: { abandonedCount: N, processedAt, ids } }`.

**Defensiv:**
- Cap la 500 rânduri pe rulare (nu blochează tabela)
- Audit insert failure nu blochează update-ul (rare, dar nu pierdem state-ul de status)
- `GET` handler disponibil în non-production pentru dry-run debugging

### Layer 2: Recovery email + cupon (cron 15 min)

**Endpoint:** `POST /api/cron/recovery-emails`
**Frecvență:** la fiecare 15 min (rulează după auto-abandon)
**Auth:** `Authorization: Bearer ${CRON_SECRET}`

Pentru fiecare comandă `status='abandoned'` din ultimele 7 zile cu email valid și fără recovery trimis (`recovery_email_sent_at IS NULL`):

1. **Generează cupon unic**: `RECOVERY-XXXXXXXX` (8 caractere din alfabet curat fără 0/O/1/I/L). Retry o dată dacă collision UNIQUE (extrem de rar).
   - `discount_type: percentage`, `discount_value: 10`
   - `max_uses: 1`, `valid_until: now + 48h`
   - `system_kind: 'recovery'` (filtru pentru tab Recovery în /admin/coupons)
2. **Trimite email** via Resend (subject + HTML + text plain):
   - Subject: „Ionel, ai uitat Cazier Judiciar — reducere 10% pe 48h"
   - Card cu codul cuponului (font mare, dashed border galben)
   - Buton mare „Continuă comanda" → `/comanda/checkout/<orderId>` (cuponul se aplică automat în viitor; user poate introduce manual între timp)
3. **Marchează** `orders.recovery_email_sent_at = now()` pentru a nu re-trimite la următoarea rulare
4. **Audit log**: `event_type='recovery_email_sent'`, `notes: 'Email recovery trimis cu cupon RECOVERY-XXX (-10%, 48h)'`

**Comportament când Resend nu e configurat** (`RESEND_API_KEY` lipsește):
- Cupon **este creat** (testabil)
- Email **nu se trimite** (skipped log)
- `recovery_email_sent_at` **NU se setează** → o rulare ulterioară cu Resend configurat va trimite

**Cap pe rulare:** 100 comenzi (evită burst pe Resend rate limit).

### Layer 3: Vizibilitate admin

**Tab „Abandonate"** în `/admin/orders` cu filter `?status=abandoned`. Statusul `abandoned` are badge propriu (`bg-neutral-200 text-neutral-700`, label „Abandonata").

**Default `all` view ascunde** `draft + pending + abandoned` (`HIDDEN_FROM_DEFAULT`). Operatorii văd doar comenzi reale care necesită acțiune.

**Counts endpoint** (existant) returnează `abandoned` ca count separat când i se cere.

## Database schema (migration 041)

```sql
-- 1. status CHECK extended with 'abandoned'
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('draft', 'pending', 'abandoned', 'paid', ...));

-- 2. is_test column for sandbox filter
ALTER TABLE orders ADD COLUMN is_test BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_orders_is_test_status ON orders (is_test, status, created_at DESC);

-- 3. order_history event_type extended
ALTER TABLE order_history ADD CONSTRAINT order_history_event_type_check
  CHECK (event_type IN ('status_changed', 'order_submitted', 'payment_confirmed',
    'abandoned', 'recovery_email_sent', ...));

-- 4. coupons.system_kind for filtering Recovery tab
ALTER TABLE coupons ADD COLUMN system_kind TEXT
  CHECK (system_kind IS NULL OR system_kind IN ('recovery'));
CREATE INDEX idx_coupons_system_kind ON coupons (system_kind, created_at DESC)
  WHERE system_kind IS NOT NULL;

-- 5. orders.recovery_email_sent_at to track recovery sends
ALTER TABLE orders ADD COLUMN recovery_email_sent_at TIMESTAMPTZ;
```

## Sandbox/Test filter

**Coloana `orders.is_test`:** flagged automat la `true` în `/api/orders/[id]/payment` dacă `STRIPE_SECRET_KEY` începe cu `sk_test_`. Folosit pentru a separa orderele sandbox din vederea operațională.

**Query params pe admin list:**

| Param | Comportament |
|-------|--------------|
| `?test=only` | `WHERE is_test = true` — doar comenzile sandbox |
| `?test=all` | fără filtru — vezi tot |
| (niciun param) | `WHERE is_test = false` — comenzile sandbox sunt invizibile (default) |

UI chips la `/admin/orders` (TODO — endpoint-ul e gata, chips de adăugat când e cerere de pe echipă):
- **Ascunse** (default)
- **Doar test** (chip cu count)
- **Toate**

## Note Echipă (independent de status transitions)

**Endpoint nou:** `POST /api/admin/orders/[id]/notes`

Body: `{ note: string }`. Min 1 char trimmed, max 5000 chars. Inserează rând în `order_history`:
- `event_type: 'note_added'`
- `changed_by: <admin email>`
- `notes: <textul>`

UI card (TODO — endpoint-ul e gata, card de adăugat pe admin order detail page):
- Textarea + buton „Adaugă notă" (Cmd/Ctrl+Enter shortcut)
- Listă note filtrate să excludă `changed_by` care începe cu `system-*` (eliminate zgomotul cron-urilor)

## Env vars necesare

```env
CRON_SECRET=<random 32+ chars>          # auth pentru cron endpoints
RESEND_API_KEY=re_xxx                   # opțional — fără el cron-ul de recovery doar creează cupoane
RESEND_FROM='eGhișeul.ro <contact@eghiseul.ro>'
RESEND_REPLY_TO=contact@eghiseul.ro
NEXT_PUBLIC_APP_URL=https://eghiseul.ro
```

## Setup pe Vercel

1. Setează env vars: `CRON_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`
2. Configurează domeniul Resend (DNS records DKIM + DMARC)
3. Verifică `vercel.json` are cele 3 cron-uri (`update-tracking`, `auto-abandon`, `recovery-emails`)
4. După deploy, testează manual cu:
   ```bash
   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
     https://eghiseul.ro/api/cron/auto-abandon
   ```
5. Monitorizează `Vercel → Functions → Logs` la fiecare cron run

## Verificare locală (dev)

```bash
# Auto-abandon (dry-run via GET, doar în dev)
curl -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/auto-abandon

# Auto-abandon (real)
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/auto-abandon

# Recovery emails (dacă RESEND_API_KEY nu e setat, doar creează cupoane)
curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/recovery-emails
```

## Diferențe față de cazierjudiciaronline.com

| Aspect | cazierjudiciaronline.com | eghiseul.ro |
|--------|---------------------------|-------------|
| Cron-uri pentru abandonment | 1 endpoint care face Step 1+2 | 2 endpoints separate (cleaner monitoring) |
| Email service | Resend | Resend |
| Coupon prefix | `RECOVERY-` | `RECOVERY-` (același) |
| Discount | 10% | 10% (același) |
| Validitate cupon | 48h | 48h (același) |
| Tab Recovery în /admin/coupons | discriminator `created_by='system-abandonment'` | discriminator `system_kind='recovery'` (mai clar) |
| Filtru anti-zgomot pe Note Echipă | exclude `changed_by` cu `system-*` | la fel |

## Tests

- `tests/unit/lib/email/abandoned-recovery.test.ts` (9 teste) — subject, HTML, text, XSS escaping pentru first name, URL attribute escaping, edge cases (no first name)

Restul cron-urilor sunt acoperite implicit prin type-check (Supabase query builder + Resend body shape). Pentru testing E2E al cron-urilor, vezi `tests/integration` (necesită DB live + RUN_INTEGRATION=1).
