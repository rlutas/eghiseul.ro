# Modifică Comandă Plătită — Ghid Admin

**Status:** ✅ Aplicat 2026-05-27 (sesiune 2 PM)
**Inspirat din:** `cazierjudiciaronline.com/docs/admin/modifica-comanda.md` (511 linii) + `/api/admin/orders/[id]/modify/route.ts` (527 linii)

## Ce face

Permite operatorului să **schimbe o comandă deja plătită** și să **reconcilieze automat banii**:

| Situație | Acțiune | Ce se întâmplă |
|----------|---------|----------------|
| Schimbi pe ceva **mai ieftin** (scoți apostila, downgrade curier) | Aplică + refund | Stripe trimite refund-ul automat pe cardul clientului |
| Schimbi pe ceva **mai scump** (adaugi apostilă, traducere, urgenta) | Aplică + plată extra | Sistem creează PaymentIntent nou pentru diferență, customer-ul primește email cu link |
| Schimbi date fără diferență de bani | Aplică modificare | Doar update câmpuri + audit log, fără bani |

**Diferență față de sister project:** noi folosim **PaymentIntent** (cu Elements pe checkout), nu Stripe Checkout Sessions. Asta înseamnă că pentru plată extra returnăm `client_secret` care poate fi folosit fie într-un mini-Elements page, fie copiat pentru email follow-up. Sister folosește Checkout Session URLs hostate.

## Cum funcționează

### UI: butonul „Modifică"

Pe `/admin/orders/[id]`, dacă `payment_status='paid'`, apare butonul **„Modifică"** lângă „Reincarca" în header. Click → dialog.

### Dialog — 2 pași

**Pasul 1: Adjustează**
- Listă cu opțiunile curente (checkbox-uri). Bifezi/debifezi.
- Input pentru preț livrare (RON).
- Notă opțională pentru istoric.

**Pasul 2: Preview → Apply**
- Click **„Calculează diferența"** → API `POST /api/admin/orders/[id]/modify` cu `action: 'preview'`.
- Banner afișează:
  - **Refund către client: X RON** (verde) când diff < 0
  - **Plată suplimentară necesară: X RON** (galben) când diff > 0
  - **Fără diferență de bani** când diff = 0
- Breakdown: Total inițial / Total nou / Refundat anterior / Plătit suplimentar / Net curent încasat
- Când e refund: input pentru **motiv** (apare pe Stripe).
- Click **„Aplică"** → API `action: 'apply'` → reload pagina.

## API endpoint

`POST /api/admin/orders/[id]/modify`

**Auth:** `orders.manage` permission.

**Body:**
```ts
{
  action: 'preview' | 'apply',
  selectedOptions: OrderOptionForDiff[],  // full replacement
  deliveryPrice?: number,                 // RON
  note?: string,                          // free-text, max 500 chars
  refundReason?: string,                  // required when diff < 0
}
```

**Response (preview):**
```ts
{
  success: true,
  data: {
    preview: true,
    diff: {
      newTotal: 219.9,
      currentNetPaid: 299.9,
      originalTotal: 299.9,
      refunded: 0,
      additionalPaid: 0,
      diff: -80,
      action: 'refund' | 'extra_payment' | 'none'
    },
    summary: 'scos: urgență'
  }
}
```

**Response (apply, refund):**
```ts
{
  success: true,
  data: {
    diff: { ...same as preview... },
    summary: 'scos: urgență',
    stripeRefundId: 're_xxx',
    pendingPaymentIntentId: null,
    pendingPaymentClientSecret: null
  }
}
```

**Response (apply, extra payment):**
```ts
{
  success: true,
  data: {
    diff: { ...same... },
    summary: 'adăugat: apostilă Haga',
    stripeRefundId: null,
    pendingPaymentIntentId: 'pi_xxx',
    pendingPaymentClientSecret: 'pi_xxx_secret_yyy'  // for Elements / share
  }
}
```

## Math (modify-diff.ts)

Diff calculation:
```ts
newTotal = base_price + sum(new options.price * quantity) + delivery_price
currentNetPaid = max(0, total_price - refunded_amount + additional_paid_amount)
diff = newTotal - currentNetPaid

action = diff < 0 ? 'refund'
       : diff > 0 ? 'extra_payment'
       : 'none'
```

Important:
- **`total_price` rămâne imuabil** = ce a fost capturat inițial de Stripe (pentru reconciliere contabilă).
- **`refunded_amount`** = cumulativ ce am refundat prin modify-uri succesive.
- **`additional_paid_amount`** = cumulativ ce a plătit extra prin link-uri de modify.
- **`currentNetPaid` cap la 0** dacă date corupte (refunded > paid) — semnal de problemă, nu crash.

## DB schema (migration 042)

```sql
-- Adaugă pe orders:
refunded_amount NUMERIC NOT NULL DEFAULT 0    -- RON refundați cumulativ
additional_paid_amount NUMERIC NOT NULL DEFAULT 0   -- RON plătiți extra cumulativ
pending_extra_payment_url TEXT                 -- client_secret pentru sharing
pending_extra_payment_amount NUMERIC
pending_extra_payment_intent_id TEXT
last_modified_at TIMESTAMPTZ
last_modified_by TEXT

-- Extinde order_history.event_type CHECK cu:
'modified', 'extra_payment_sent', 'extra_payment_received'
```

## Audit log

Fiecare apply scrie un rând în `order_history`:
- `event_type`: `'refunded'` / `'extra_payment_sent'` / `'modified'`
- `changed_by`: emailul adminului
- `new_value`: `{ diff, newTotal, refundId, pendingExtraPaymentIntentId }`
- `notes`: format `„Modificat de admin@x · refund 80 RON (Stripe re_xxx) · notă: ... · modificări: scos: urgență"`

Vizibil pe pagina order detail în secțiunea Istoric.

## Limitări actuale (vs sister)

1. **Curierul nu se schimbă** — doar `deliveryPrice` se actualizează. Pentru schimb de courier complet (cu adresa de livrare etc.) folosește pagina order detail direct pentru update manual + creează un modify doar pentru bani.
2. **Email-ul pentru plată extra nu pleacă automat** — Resend wrapper acceptă, dar template-ul nu e încă scris. Admin copiază `client_secret` din răspuns / DB (`pending_extra_payment_url`).
3. **Storno + Reemite factură Oblio** — separat, nu e încă implementat. După modify, dacă există factură Oblio emisă, trebuie storno + reemitere manual din admin (sau API când îl scriem).

Toate sunt P1 pentru sesiunile următoare.

## Tests

`tests/unit/lib/orders/modify-diff.test.ts` — **15 teste**:
- Path-uri: none / refund / extra_payment
- Edge cases: refunded > paid (cap), snake_case options, urgenta toggle
- Production scenarios: scoți apostila, swap DHL → Poșta, adaugi traducere

```bash
npx vitest run tests/unit/lib/orders/modify-diff.test.ts   # 15 passed
```

## Verificare manuală

```bash
# Preview (cere o comandă plătită cu o opțiune)
curl -X POST http://localhost:3000/api/admin/orders/<ORDER_ID>/modify \
  -H 'Content-Type: application/json' \
  -b 'sb-access-token=...' \
  -d '{
    "action": "preview",
    "selectedOptions": [],
    "deliveryPrice": 21.9
  }'
# → { success: true, data: { preview: true, diff: { ... }, summary: 'scos: urgență' } }

# Apply refund
curl -X POST http://localhost:3000/api/admin/orders/<ORDER_ID>/modify \
  -H 'Content-Type: application/json' \
  -b 'sb-access-token=...' \
  -d '{
    "action": "apply",
    "selectedOptions": [],
    "deliveryPrice": 21.9,
    "refundReason": "clientul a cerut scoaterea urgenței"
  }'
```
