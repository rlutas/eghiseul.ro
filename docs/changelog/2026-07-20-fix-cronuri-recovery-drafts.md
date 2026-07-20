# 2026-07-20 — Fix cron-uri Vercel moarte + recovery coșuri abandonate extins la drafts

## Problema descoperită

**Toate cele 6 cron-uri Vercel nu au rulat NICIODATĂ în producție.** Cauza: `next.config.ts`
are `trailingSlash: true`, iar path-urile cron din `vercel.json` erau fără slash final →
fiecare invocare primea **308 Permanent Redirect** în loc să execute handler-ul (Vercel Cron
nu urmează redirecturi). Al doilea incident de cron-uri moarte după GET→POST din 2026-07-12.

Dovezi la momentul fix-ului:
- 0 email-uri recovery trimise vreodată, 0 comenzi `abandoned`, 0 rânduri `order_history` de la `system-cron`
- 17 comenzi `pending` neatinse, cea mai veche din 7 iulie (trebuia flip la 30 min)
- 171 drafts acumulate (6–20 iul), **~60.500 RON** valoare, toate cu email + telefon
- Afectate colateral: `update-tracking`, `invoice-health-check` (heal facturi), `auto-finalize-delivered`, `payout-sync`

## Ce s-a livrat

1. **`vercel.json`** — slash final la toate cele 6 path-uri cron. Regulă nouă: orice cron
   nou = GET→POST passthrough + slash final în path.
2. **Recovery extins la drafts** (`/api/cron/recovery-emails`):
   - Pool nou: `status='draft'` din ultimele 7 zile, cu **idle ≥ 2h** (`updated_at`) și
     **progres dincolo de pasul contact** (`hasProgressBeyondContact` — cel puțin o valoare
     reală într-o secțiune ≠ contact/billing). Cerință Raul: nu trimitem la cei care au lăsat
     doar emailul.
   - Excludere trafic intern de test: `serviciiseonethut@gmail.com` (set `TEST_EMAILS` în rută).
   - Resume link pe pool: `abandoned` → checkout; `draft` → wizard resume
     (`/comanda/<slug>?order=&email=`), ambele cu `&coupon=RECOVERY-XXX`.
3. **Auto-aplicare cupon din URL** (emailul promitea deja asta, dar nu era implementat):
   - Checkout page: `?coupon=` → POST `/api/orders/[id]/coupon` după load, apoi re-fetch.
   - Wizard review-step: citește `?coupon=` din URL (parametrii străini supraviețuiesc
     sincronizării URL între pași), validează și aplică singur; la eșec, inputul rămâne
     prefill-uit cu codul.

## Simulare pe date reale (înainte de deploy)

Prima rulare va trimite **~99 email-uri** (valoare comenzi ~36.500 RON): 125 candidați în
fereastra de 7 zile − 15 test − 3 încă active (<2h idle) − 8 fără progres dincolo de contact.
Cap 100/rulare rămâne ca throttle Resend.

## Rămas manual

- (Opțional) ștergerea comenzilor de test din DB — 20 drafts + 3 pending pe
  `serviciiseonethut@gmail.com`, toate `unpaid`, FK-uri CASCADE/SET NULL (blocat de
  permisiuni în sesiune; codul le exclude oricum de la email):
  ```sql
  DELETE FROM orders
  WHERE lower(customer_data->'contact'->>'email') = 'serviciiseonethut@gmail.com'
    AND status IN ('draft','pending') AND payment_status = 'unpaid';
  ```
- Monitorizare după deploy: `order_history` cu `changed_by='system-cron'` trebuie să apară
  în primele 15 min; apoi rata de recuperare (comenzi cu `recovery_email_sent_at` care ajung `paid`).

## Fișiere

- `vercel.json` — slash final pe toate cron-urile
- `src/app/api/cron/recovery-emails/route.ts` — pool drafts + filtre + resume URL per pool
- `src/app/comanda/checkout/[orderId]/page.tsx` — auto-apply `?coupon=`
- `src/components/orders/steps-modular/review-step.tsx` — auto-apply `?coupon=` în wizard
- `docs/admin/abandoned-carts.md` — actualizat (incident + drafts + auto-apply)
