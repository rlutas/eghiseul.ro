# Coșuri Abandonate — Sistemul complet

**Status:** ✅ Aplicat 2026-05-27 · ⚠️ MORT în producție până 2026-07-20 (vezi incident mai jos) · ✅ Reparat + extins la drafts 2026-07-20 · ✅ Completat cu recuperare telefonică 2026-09-14

> **2026-09-14:** cuponul automat de mai jos are **1,4% redemption** (20 din
> 1.444 cupoane create) — analiza completă în
> `docs/marketing/email-marketing-plan-2026-09.md`. Layer nou, uman:
> `docs/technical/specs/phone-recovery-abandoned-carts.md` (pagina
> `/admin/recuperare-telefonica`) — echipa sună prioritizat (telefon străin +
> stare civilă întâi) și dă cupoane discreționare, nu fixe.
**Inspirat din:** `cazierjudiciaronline.com/api/cron/abandonment` (cazierjudiciaronline foloseste un singur cron; noi am separat în două pentru claritate operațională)

## ⚠️ Incident: cron-urile nu au rulat NICIODATĂ (până la 2026-07-20)

Toate cele 6 cron-uri Vercel erau moarte: `next.config.ts` are `trailingSlash: true`, deci
`/api/cron/auto-abandon` (path-ul din `vercel.json`, fără slash) răspundea cu **308 redirect**
către varianta cu slash — iar invocarea Vercel Cron nu urmează redirecturi. Rezultat: 0 comenzi
abandonate, 0 email-uri recovery, `pending` vechi de 13 zile, health-check facturi nefuncțional.

**Fix:** slash final la TOATE path-urile cron din `vercel.json`. **Regulă permanentă: orice cron
nou în `vercel.json` primește slash final** (pe lângă regula GET→POST passthrough din incidentul
din 2026-07-12). Verificare rapidă: `curl -s -o /dev/null -w "%{http_code}" https://eghiseul.ro/<path>`
— trebuie 401 (auth), nu 308.

## Ce este un coș abandonat

Două cazuri, tratate de același sistem:

1. **`pending` neplătit** — comandă trimisă (submit + semnătură) fără confirmare de plată în 30 min. Cauze tipice:
   - Clientul a ajuns la pagina de plată dar a închis tab-ul înainte de redirect-ul Stripe
   - Cardul a fost respins și clientul n-a încercat altul
   - Clientul s-a răzgândit ultimul moment
2. **`draft` cu progres** (adăugat 2026-07-20) — abandon în wizard, ÎNAINTE de submit. Emailul și
   telefonul există din pasul 1 (contact), deci clientul e recuperabil. Volume reale la data fix-ului:
   171 drafts / 2 săptămâni, ~60.500 RON valoare, ~37% rată de finalizare a wizardului.

Aceste comenzi rămâneau în `pending`/`draft` la nesfârșit și poluau lista admin „Toate". Acum:

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

**Curățenie (2026-09-14):** la fiecare rulare, drafturile mai vechi de 30 de zile în care
clientul a lăsat DOAR contactul (nimic dincolo de pasul 1, `hasProgressBeyondContact = false`)
se **șterg** (max 200/rulare, cascadă pe `order_history` etc.). Nu intră nicăieri (coadă
telefonică, recovery, rapoarte) — doar umflau tabela (61 la data fix-ului). Drafturile CU
progres rămân ca analytics. Răspunsul cronului raportează `purgedDrafts`.

### Layer 2: Recovery email în 3 pași (cron 15 min) — rescris 2026-09-14

**Endpoint:** `POST /api/cron/recovery-emails`
**Frecvență:** la fiecare 15 min (rulează după auto-abandon)
**Auth:** `Authorization: Bearer ${CRON_SECRET}`

> **De ce 3 pași:** emailul unic cu cupon 10% avea **1,4% redemption** (20 din 1.444).
> Cercetarea (`docs/marketing/email-marketing-plan-2026-09.md` §4.1): reducerea NU e
> prima armă — antrenează abandonul pentru cupon; secvențele de 3 atingeri recuperează
> 15–25% din coșuri. Migrarea 160: `recovery_email_step` (0–3) +
> `recovery_email_last_sent_at`; cine primise deja emailul vechi cu cupon e marcat pas 3.

| Pas | Când | Conținut | Șablon |
|---|---|---|---|
| **1** | ≥30 min de la creare (draft: ≥2 h idle) | „Am păstrat tot ce ai completat — reia de unde ai rămas". FĂRĂ cupon. | `abandoned-recovery-sequence.ts` → `buildRecoveryStep1` |
| **2** | ≥24 h după pasul 1 | Încredere: cei 3 pași după plată, echipă reală (eDigitalizare SRL, Cluj), rating Google real din `SOCIAL_PROOF`, WhatsApp. FĂRĂ cupon. | `buildRecoveryStep2` |
| **3** | ≥48 h după pasul 2 (~72 h) | Cupon `RECOVERY-XXXXXXXX` 10% / 48 h / unică folosință, `system_kind='recovery'`. | `abandoned-recovery.ts` (șablonul vechi) |

Două pool-uri de candidați din ultimele 7 zile, cu email valid și `recovery_email_step < 3`:

- **`status='abandoned'`** — link la `/comanda/checkout/<orderId>` (pasul 3 adaugă `?coupon=`).
- **`status='draft'`** (2026-07-20) — cu DOUĂ filtre suplimentare:
  - **idle ≥ 2h** (`updated_at`) — nu trimitem cuiva care e încă în sesiune;
  - **progres dincolo de contact** (`hasProgressBeyondContact`, `lib/orders/abandoned-progress.ts`).
  Link înapoi în wizard: `/comanda/<slug>?order=<friendlyId>&email=<email>[&coupon=]` (resume
  cross-device; emailul e gardă anti-IDOR pe guest drafts). `?coupon=` se aplică automat la aterizare.

**Excludere trafic intern:** `TEST_EMAILS` (`lib/email/deliverability.ts`) — skip necondiționat.

**Marcare:** după fiecare trimitere reușită `recovery_email_step = pas`,
`recovery_email_last_sent_at = now()`; la pasul 1 și `recovery_email_sent_at = now()` (dashboardul
îl citește ca „a primit recovery"). Audit: `event_type='recovery_email_sent'`,
`new_value: { step, coupon_code? }`. Idempotency key la Resend: `recovery-<orderId>-step<n>`.

**Telefon + email merg în paralel:** o comandă bifată „sunată" în `/admin/recuperare-telefonica`
primește în continuare secvența (multi-canal +45% vs un singur canal).

**Când Resend nu e configurat:** pasul NU avansează (retry la următoarea rulare); cuponul de la
pasul 3 se creează oricum.

**Cap pe rulare:** 100 comenzi. Test: `tests/unit/api/cron-recovery-emails.test.ts`.

**Adrese inventate** (`isSuspiciousEmail`: „sssssssim@…", „test@…", „asdf…") se sar — domeniul
e real, dar trimiterea bounce-uiește și strică reputația.

**Curățenie cupoane (2026-09-14):** la fiecare rulare, cupoanele de sistem (`RECOVERY-`, `TEL-`)
expirate de peste 7 zile și **nefolosite** (`times_used = 0`) se șterg — lista din
`/admin/coupons` ajunsese la 1.423 de rânduri moarte. Cele folosite rămân (dovada reducerii
pe comandă), cupoanele manuale nu se ating. `/admin/coupons` arată implicit doar cupoanele
**active** (filtre: Active / Expirate / Toate) și badge „Expirat".

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
3. Verifică `vercel.json` are cron-urile (`auto-abandon`, `recovery-emails`, ...) — **toate path-urile CU slash final** (site-ul are `trailingSlash: true`; fără slash = 308 = cron mort)
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
