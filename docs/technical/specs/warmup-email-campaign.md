# Warm-up email — registrul de 72k contacte

**Status:** ✅ LIVRAT 2026-09-14 · migrațiile 157 + 158 · implicit oprit la deploy, **PORNIT în aceeași seară la 25/zi** (50/zi din 18.09, 75/zi din 23.09, **înapoi la 50/zi pe 25.09** după 10 dezabonări la 550 trimise = 1,8%) (Raul a văzut preview-urile; prag de oprire: dezabonări >0,5% din trimiși, vizibil în cardul „KPI marketing")
**Context:** decizie de business (Raul) — contactele din `contacts` (72.278, majoritatea import WPForms de pe eghiseul.ro vechi) sunt foști clienți/lead-uri cu consimțământ acordat pe platforma veche. Se trimite email de reactivare la toți, dar treptat. Detalii complete + cercetare în `docs/marketing/email-marketing-plan-2026-09.md`.

## De ce implicit oprit (la deploy)

Trimiterea reală către mii de persoane e o acțiune cu impact greu de reversat
(reputație de sender, plângeri, imagine). Feature-ul e complet funcțional dar
**nu pornește singur** — cronul rulează zilnic oricum (per `vercel.json`) dar
iese imediat dacă `admin_settings.warmup_campaign.enabled = false` (valoare
implicită). Echipa pornește manual din `/admin/marketing` după ce revizuiește
conținutul emailului.

## Schema DB (migrațiile 157 + 158)

```sql
ALTER TABLE contacts ADD COLUMN unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE contacts ADD COLUMN warmup_email_sent_at TIMESTAMPTZ;
-- 158: contacte sărite definitiv (altfel blochează capul cozii FIFO)
ALTER TABLE contacts ADD COLUMN warmup_skipped_at TIMESTAMPTZ;
ALTER TABLE contacts ADD COLUMN warmup_skip_reason TEXT;
-- index unic pe token + index parțial pentru selecția batch-ului zilnic
```

Populație țintă: `marketing_status NOT IN ('unsubscribed', 'suppressed')` —
tabelul `contacts` deja suportă aceste statusuri (migrația 110) — și
`warmup_email_sent_at IS NULL AND warmup_skipped_at IS NULL`.

Un contact iese din coadă într-un singur fel: **trimis** (`warmup_email_sent_at`)
sau **sărit** (`warmup_skipped_at` + `warmup_skip_reason`: `no email`,
`test email`, `undeliverable domain`, `resend rejected: ...`). Erorile
tranzitorii (Resend 429/5xx, rețea) NU marchează nimic — retry la rularea
următoare.

## Cron — `POST/GET /api/cron/warmup-campaign`

- Auth: `CRON_SECRET` (Bearer), programat zilnic 07:00 UTC în `vercel.json`.
- Citește `admin_settings.warmup_campaign` (`{ enabled, dailyBatchSize }`,
  implicit `{ enabled: false, dailyBatchSize: 25 }` dacă rândul nu există).
- Iese imediat dacă `enabled=false`.
- Selectează batch-ul: netrimiși și nesăriți, eligibili, ordonați după
  `warmup_priority DESC` apoi `created_at` (din 2026-09-25, migrarea 187).
  `warmup_priority` = coloană generată `orders_count × 10 + cardinality(services)`:
  clienții cu mai multe comenzi pe platformă, apoi contactele care au cerut mai
  multe servicii pe site-ul vechi, apoi restul FIFO. Înainte de 25.09 ordinea
  era FIFO pur (`first_seen_at`, `created_at`).
- Trimite `src/lib/email/templates/warmup-reengagement.ts` prin Resend
  (`idempotencyKey: warmup-<contact.id>` — protecție împotriva dublei trimiteri
  la rulări suprapuse, nu există claim atomic separat), cu header-ele
  `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
  (cerință Gmail/Yahoo pentru expeditori în volum).
- Pauză de 600 ms între trimiteri (Resend: 2 cereri/s); `maxDuration = 300`,
  deci într-o rulare încap ~400 de emailuri — un batch mai mare se continuă
  a doua zi, fiecare contact fiind marcat imediat după trimitere.
- Marchează `warmup_email_sent_at` doar la succes real; Resend neconfigurat
  (`skipped`) lasă contactul nemarcat pentru retry.
- ⚠️ Fiecare UPDATE folosește un `admin.from('contacts')` **nou**: postgrest-js
  își mută URL-ul builder-ului la fiecare filtru, deci refolosirea celui de
  la SELECT ar cumula `id=eq.A&id=eq.B` și ar marca doar primul contact din
  batch (bug prins la review, 2026-09-14). Aceeași regulă în
  `warmup-stats` și `priority-calls`.

## Dezabonare — `GET|POST /api/contacts/unsubscribe?token=`

`POST` există pentru one-click RFC 8058 (clientul de mail trimite
`List-Unsubscribe=One-Click` în body pe URL-ul din header); logica e identică
cu `GET`.

Independent de `/api/newsletter/unsubscribe` (acela operează pe
`newsletter_subscribers`, opt-in explicit, populație diferită — cei ~37).
Token propriu per contact (`contacts.unsubscribe_token`), un click →
`marketing_status = 'unsubscribed'`. Rândul rămâne (dovadă), nu se șterge.

## Admin UI — `/admin/marketing`

Card nou deasupra listei de abonați newsletter:
- Statistici live: total contacte, câte au primit deja emailul, câte rămân
  (eligibile, netrimise, nesărite), câte au fost sărite, câți s-au dezabonat
  (`GET /api/admin/marketing/warmup-stats`).
- Switch enable/disable + input „câți pe zi" — salvează în
  `admin_settings.warmup_campaign` prin endpoint-ul generic
  `PATCH /api/admin/settings` (cheie adăugată în allowlist, cu validare de
  formă `{enabled: boolean, dailyBatchSize: 1-2000}`).

## Fișiere

- `supabase/migrations/157_contacts_warmup_campaign.sql`
- `supabase/migrations/158_contacts_warmup_skip.sql`
- `src/lib/email/resend.ts` (extins: `headers` passthrough + `ResendError` cu status)
- `tests/unit/api/cron-warmup-campaign.test.ts`
- `src/lib/email/deliverability.ts` (nou — extras din `recovery-emails`, TEST_EMAILS + isUndeliverable partajate)
- `src/lib/email/templates/warmup-reengagement.ts`
- `src/app/api/cron/warmup-campaign/route.ts`
- `src/app/api/contacts/unsubscribe/route.ts`
- `src/app/api/admin/marketing/warmup-stats/route.ts`
- `src/app/api/admin/settings/route.ts` (extins cu cheia `warmup_campaign`)
- `src/app/admin/marketing/page.tsx` (extins cu `WarmupCampaignCard`)

## Ce NU face (scop redus intenționat)

- Nu segmentează conținutul per serviciu dincolo de un hint simplu (primul
  serviciu din `contacts.services`) — un singur template pentru toți.
- Nu crește automat volumul zilnic — echipa ajustează manual din UI pe măsură
  ce verifică bounce/spam rate în Resend.
- Nu are claim atomic pe rândul de contact înainte de trimitere — se bazează
  pe idempotency key la Resend (risc scăzut, batch mic, o singură trimitere
  per contact oricum).


## Conținut personalizat și cupon pentru clienții fideli (2026-09-25)

- Emailul numește serviciile din `contacts.services`, fără dubluri. Scrie „Ai obținut prin noi …” pentru `is_customer` și „Ai apelat la noi pentru …” pentru lead-urile de pe site-ul vechi, ca să nu afirme o cumpărare nedovedită.
- Butonul duce la `/comanda/<primul slug cunoscut>/`. `?coupon=` se aplică singur la pasul de plată (`review-step.tsx`).
- Contact fidel = `orders_count >= 2` sau `cardinality(services) >= 2`. Primește un cupon `FIDEL-XXXXXXXX` (10%, 30 de zile, `max_uses 1`, `system_kind='loyalty'`, migrarea 188), creat chiar înainte de trimitere în `src/lib/coupons/loyalty.ts`.
- UTM: `utm_campaign=warmup-fidel` pentru emailurile cu cupon și `warmup` pentru restul.
