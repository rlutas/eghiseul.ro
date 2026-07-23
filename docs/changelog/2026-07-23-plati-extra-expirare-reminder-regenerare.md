# Plăți extra: alertă expirare + reminder automat + regenerare link (2026-07-23)

## Problema (caz real E-260719-LS53Y)

Link-urile de plată extra (Modifică → Stripe Checkout) mor după 24h. Nimeni nu
afla: clientul cu 824,50 lei de plată a lăsat link-ul să expire (22.07 10:50 →
23.07 10:50) fără niciun semnal în admin, fără reminder, și fără vreo cale de
a-i genera un link nou în afară de re-rularea întregului flux Modifică.

## Ce s-a livrat

### Date (migrațiile 133 + 134, rulate)
- `orders.pending_extra_payment_expires_at` — expirarea sesiunii Stripe,
  scrisă la creare (Modifică) și la regenerare.
- `orders.pending_extra_reminder_sent_at` — dedupe reminder (pattern
  recovery_email_sent_at); resetată la regenerare ca link-ul nou să-și
  primească propriul reminder.

### Builder partajat
`src/lib/orders/extra-payment-link.ts` — `createExtraPaymentSession()`:
sesiunea Checkout construită identic (line item, metadata purpose=extra_charge,
success/cancel pe status page) pentru AMBELE fluxuri; Modifică folosește acum
helper-ul (fără schimbare de comportament) + persistă expirarea.

### 1. Alertă în admin
- **Comandă**: banner-ul „Așteptăm plată extra" arată acum „expiră în ~Xh";
  după expirare devine roșu „🔴 LINK DE PLATĂ EXPIRAT — contactează clientul",
  link-ul vechi tăiat, buton „Generează link nou". Link-urile pre-migrația 133
  apar cu „vechime necunoscută".
- **Listă**: chip nou „Plată extra în așteptare" (Filtre rapide, cu count) —
  filtrează comenzile cu link pending neîncasat.

### 2. Reminder automat pre-expirare
Cron orar nou `/api/cron/extra-payment-reminders/` (vercel.json, min :15, cu
GET passthrough + slash final — convențiile anti-405/308): comenzile plătite
cu link pending care expiră în <6h primesc UN email de reminder („expiră în
~Xh", același link, template branduit `buildExtraPaymentReminder*`). Dedupe:
coloana 134 + Idempotency-Key Resend pe session id. Link-urile deja expirate
NU primesc email automat (decizie: adminul contactează clientul + regenerează
— evită spam-ul); sunt numărate în răspunsul cronului.

### 3. Regenerare 1-click
`POST /api/admin/orders/[id]/regenerate-extra-payment` (orders.manage):
- expiră întâi sesiunea veche în Stripe (dacă mai e deschisă — evită două
  link-uri plătibile / dublă încasare)
- sesiune nouă pe ACEEAȘI sumă pending; proforma Oblio existentă se
  refolosește (nu se re-emite)
- email automat către client cu link-ul proaspăt + event `extra_payment_sent`
  (marcat „REGENERAT") în istoric; dacă emailul pică, nota spune explicit
  „partajează manual link-ul"

### Punctual
`scripts/backfill-extra-expiry-LS53Y.mjs` (rulat) — expirarea confirmată din
Stripe (23.07 07:50 UTC) scrisă pe comanda-incident → alerta roșie apare
imediat după deploy; echipa apasă „Generează link nou".

## Verificare
tsc curat, 1236 teste verzi, lint curat. Cron: de verificat post-deploy
`curl -s -o /dev/null -w "%{http_code}" https://eghiseul.ro/api/cron/extra-payment-reminders/`
→ 401 (nu 405/308).
