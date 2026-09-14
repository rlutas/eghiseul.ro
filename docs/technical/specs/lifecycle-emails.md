# Emailuri de lifecycle + campanii manuale

**Status:** ✅ LIVRAT 2026-09-14 · migrația 159 · **toate comutatoarele implicit OPRITE**
**Unde:** `/admin/marketing` — cardurile „Emailuri automate după comandă" și „Campanii"
**Context:** `docs/marketing/email-marketing-plan-2026-09.md` (analiză + cercetare). Completează
warm-up-ul (`warmup-email-campaign.md`, către lead-uri) cu emailuri către **clienți** (au cumpărat).

## Cele patru fluxuri

| Flux | Când | Cui | Șablon |
|---|---|---|---|
| **Cerere recenzie Google** | 3–10 zile după finalizare | doar comenzi **în termen** fără incidente (`wasOnTime`) | `review-request.ts` → `GOOGLE_REVIEW_WRITE_URL` |
| **Reminder expirare document** | `[expirare − 14 zile, expirare + 30 zile]`, o dată per comandă | servicii cu valabilitate legală (tabel mai jos); nu dacă a recomandat deja același serviciu | `expiry-reminder.ts` |
| **Cross-sell** | 30–60 zile după finalizare | 2–3 documente înrudite, active în catalog, necumpărate; **un email per client la 180 zile** | `cross-sell.ts` + `CROSS_SELL_BLURBS` |
| **Campanii manuale** | când pornește echipa, tranșe zilnice | segment ales: clienți / abonați / tot registrul | `campaign.ts` (markdown-lite, `{{prenume}}`) |

Toate: exclud `contacts.marketing_status IN (unsubscribed, suppressed)`, adrese de test,
domenii nelivrabile, comenzi `is_test` și cu `email_bounced_at`. Toate au link de
dezabonare per contact + header-ele `List-Unsubscribe` (RFC 8058). Pauză 600 ms între
trimiteri (Resend 2 req/s), `maxDuration = 300`.

### Valabilități (`DOCUMENT_VALIDITY_DAYS`, zile calendaristice de la `completed_at`)

| Serviciu | Zile | Temei |
|---|---|---|
| cazier judiciar (PF, PJ, generic) | 180 | Legea 290/2004 art. 27 |
| certificat integritate comportamentală | 180 | Legea 118/2019 |
| cazier fiscal | 30 | OG 39/2015 art. 11 |
| certificat constatator | 30 | uzanță ONRC / licitații / bănci |
| cazier auto | 30 | cerință DRPCIV / angajatori |
| extras CF (informare, colectiv) | 30 | cerință notari / bănci / instituții (decizie Raul 14.09) |

Stare civilă nu expiră. Data e aproximativă (copy-ul spune „în jurul datei de") —
calculăm de la finalizarea comenzii, nu de la emitere.

### „În termen" (`wasOnTime`)

Fără evenimente negative în `order_history` (`standby_started`, `reupload_requested`,
`cancellation_requested`, `cancelled`, `refunded`, `kyc_rejected`,
`document_generation_failed`) ȘI `completed_at::date ≤ estimated_completion_date::date`.
Când comanda nu are termen estimat (extras CF: 126 din 133), cade pe promisiunea din
pagina serviciului (`processing_config.estimated_days_display`, limita superioară ×7/5 +1
zi de curier). Fără nicio referință → nu cerem recenzie.

## Schema (migrația 159)

- `orders.completed_at` — **nu exista** (`actual_completion_date` NULL pe toate cele 389
  finalizate). Backfill din `order_history` (`status_changed` → `completed`, 389/389) +
  trigger `trg_orders_stamp_completed_at` (BEFORE UPDATE OF status) — se stampează pe
  orice cale de finalizare, prezentă sau viitoare.
- `lifecycle_emails (order_id, kind UNIQUE, recipient_email, contact_id, resend_id,
  sent_at, failed_reason)` — rândul se **inserează înainte de trimitere** = claim atomic;
  23505 → rulare suprapusă, sare. Eroare tranzitorie (429/5xx/rețea) → rândul se șterge,
  retry mâine. Eroare permanentă (4xx) → rămâne cu `failed_reason`.
- `email_campaigns` + `email_campaign_sends (campaign_id, contact_id PK)` — campanii
  manuale cu cursor keyset `(cursor_created_at, cursor_id)` peste `contacts` ordonat după
  `(created_at, id)`: un contact e citit o singură dată, indiferent dacă i s-a trimis sau a
  fost sărit (altfel cei săriți ar bloca capul cozii).

## Cronuri (`vercel.json`)

| Rută | Oră UTC | Setare |
|---|---|---|
| `/api/cron/lifecycle-emails` | 07:20 | `admin_settings.lifecycle_emails` = `{ reviewRequest, expiryReminder, crossSell }` (toate `false` implicit) |
| `/api/cron/email-campaigns` | 07:40 | per campanie: `status = 'sending'`, `daily_batch_size` |

Ambele cu `GET` passthrough (Vercel Cron cheamă cu GET) și `CRON_SECRET` Bearer.

## Admin

- `GET /api/admin/marketing/lifecycle-stats` — trimise / 30 zile / eșuate per tip.
- `GET|POST /api/admin/marketing/campaigns`, `PATCH|DELETE .../campaigns/[id]`,
  `POST .../campaigns/[id]/test` (trimite pe adresa adminului, `[TEST]` în subiect).
- Tranziții: `draft → sending → paused → sending`; `done` doar din cron; conținutul se
  editează doar în `draft`/`paused`; se șterg doar drafturile.
- Permission: `settings.manage`.

### Markdown-lite (corpul campaniilor)

Linie goală = paragraf · `- text` = listă · `## Titlu` = subtitlu · `**bold**` ·
`[text](https://…)` · URL liber = link · `{{prenume}}` (fără prenume: dispare cu tot cu
spațiul din față, „Salut {{prenume}}," → „Salut,"). Tot restul e escapat — nu se poate
injecta HTML. Implementare: `src/lib/email/markdown-lite.ts`.

## Procedura echipei

1. **Lifecycle:** citește cele trei șabloane, apoi pornește comutatoarele din
   `/admin/marketing`. Recomandare: întâi recenzia (cohortă mică, ~20 comenzi/săptămână),
   apoi expirarea, apoi cross-sell-ul.
2. **Campanie:** „Campanie nouă" → completează → „Test" (îți vine pe email cu `[TEST]`) →
   citește-l pe telefon → „Pornește". Ritm recomandat: 100/zi la clienți, 200–300/zi la
   tot registrul după ce warm-up-ul a mers 2 săptămâni fără bounce.
3. **Monitorizare:** bounce/spam în dashboardul Resend; contoarele din admin.

## Fișiere

- `supabase/migrations/159_lifecycle_emails_and_campaigns.sql`
- `src/lib/lifecycle/rules.ts` (valabilități, cross-sell map, `wasOnTime`) · `contacts.ts`
- `src/lib/email/markdown-lite.ts` · `templates/marketing-footer.ts` · `review-request.ts` ·
  `expiry-reminder.ts` · `cross-sell.ts` · `campaign.ts`
- `src/app/api/cron/lifecycle-emails/route.ts` · `email-campaigns/route.ts`
- `src/app/api/admin/marketing/{lifecycle-stats,campaigns,campaigns/[id],campaigns/[id]/test}/route.ts`
- `src/app/admin/marketing/{lifecycle-card,campaigns-card}.tsx`
- Teste: `tests/unit/lib/lifecycle/rules.test.ts`, `tests/unit/lib/email/markdown-lite.test.ts`,
  `tests/unit/api/cron-lifecycle-emails.test.ts`

## Ce NU face (intenționat)

- Nu urmărește deschideri/clicuri (Apple MPP umflă open rate; judecăm după comenzi cu
  `utm_campaign=expiry|cross_sell` în GA4 și după recenziile noi pe Google).
- Nu are A/B pe subiect. Nu segmentează cross-sell-ul după valoare comandă.
- Recovery-ul în 3 pași e separat, în cronul `recovery-emails` (livrat tot 14.09) — vezi
  `docs/admin/abandoned-carts.md` Layer 2.
- Preview fizic al tuturor șabloanelor pe o adresă: `npx tsx scripts/email-previews.ts <email>`.
