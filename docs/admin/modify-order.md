# Modifică Comandă Plătită — Ghid Admin

**Status:** ✅ Aplicat 2026-05-27 · actualizat major 2026-07-23 (limbă/țară/termen + expirare link plată extra — vezi secțiunile de la final)
**Inspirat din:** `cazierjudiciaronline.com/docs/admin/modifica-comanda.md` (511 linii) + `/api/admin/orders/[id]/modify/route.ts` (527 linii)

## Ce face

Permite operatorului să **schimbe o comandă deja plătită** și să **reconcilieze automat banii**:

| Situație | Acțiune | Ce se întâmplă |
|----------|---------|----------------|
| Schimbi pe ceva **mai ieftin** (scoți apostila, downgrade curier) | Aplică + refund | Stripe trimite refund-ul automat pe cardul clientului |
| Schimbi pe ceva **mai scump** (adaugi apostilă, traducere, urgenta) | Aplică + plată extra | Sistem creează PaymentIntent nou pentru diferență, customer-ul primește email cu link |
| Schimbi date fără diferență de bani | Aplică modificare | Doar update câmpuri + audit log, fără bani |

**⚠️ Notă istorică (corectată 2026-07-23):** paragraful inițial spunea că folosim PaymentIntent + Elements. **NU mai e adevărat** — fluxul de plată extra folosește **Stripe Hosted Checkout Sessions** (link hostat, ca la sister) din 2026-07-14, fiindcă vechiul flux PI arăta spre o pagină `/comanda/plata-extra` care nu exista. Sesiunea se construiește prin `src/lib/orders/extra-payment-link.ts` (`createExtraPaymentSession`) — orice loc nou care creează link de plată extra TREBUIE să folosească acest helper (setează și expirarea).

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

1. **Curierul nu se schimbă** — doar `deliveryPrice` se actualizează. Pentru schimb de courier complet (cu adresa de livrare etc.) folosește pagina order detail direct pentru update manual + creează un modify doar pentru bani. (Caz real: E-260719-LS53Y — DHL adăugat prin custom extra, delivery_method actualizat cu script.)
2. ~~Email-ul pentru plată extra nu pleacă automat~~ — **REZOLVAT 2026-07-14**: emailul pleacă automat (template branduit `extra-payment.ts`), cu link-ul Hosted Checkout; din 23.07 există și reminder pre-expirare + regenerare (vezi mai jos).
3. **Storno + Reemite factură Oblio** — separat, nu e încă implementat. După modify, dacă există factură Oblio emisă, trebuie storno + reemitere manual din admin. (Fluxul standard folosește PROFORMĂ la link + factura se emite abia la plată, deci storno-ul e rar necesar.)

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

---

## Update 2026-07-23 — limbă/țară/termen în dialog

Vezi changelog: `docs/changelog/2026-07-23-modifica-comanda-limba-tara-termen.md`.

- **Traducere Autorizată** selectată → dropdown obligatoriu „Limba traducerii"
  (`TRANSLATION_LANGUAGES`, aceeași listă ca wizard-ul).
- **Apostilă Haga/Notari** → dropdown obligatoriu „Țara de utilizare"
  (`APOSTILA_COUNTRIES`, țară partajată între cele două tipuri).
- Alegerile intră în `selected_options[].metadata.{language,country}` — apar
  în admin (Limba/Țara), pe contract, în sumarul Stripe/email/proformă
  („adăugat: traducere (Germană)").
- Validare dublă (dialog + server 400 `MISSING_LANGUAGE`/`MISSING_COUNTRY`) —
  DOAR pe opțiunile nou adăugate; comenzile vechi fără metadata nu se blochează.
- **Reguli de dependență** ca în wizard: Legalizarea cere Traducere; Apostila
  Notari cere Legalizare (checkbox disabled + cascade la debifare).
- Badge **„Plătit deja"** (gri) pe opțiunile existente vs **„Nou"** (verde).
- **Calcul live** sub listă: total opțiuni + custom + „termen +N zile".
- **Termenul comenzii se extinde automat la apply** cu zilele codurilor NOU
  adăugate (traducere +2z, legalizare +1z, apostile +1z, cetățean străin
  +7z — `computeAddedTermShiftDays`); scoaterile NU scurtează. Nota „termen
  extins cu N zile (X → Y)" intră în istoric + toast.

## Update 2026-07-23 — expirarea link-ului de plată extra

Vezi changelog: `docs/changelog/2026-07-23-plati-extra-expirare-reminder-regenerare.md`.
Incident declanșator: E-260719-LS53Y (824,50 RON pending, link expirat silențios).

**Link-urile Stripe Checkout mor după 24h.** Acum:

| Când | Ce se întâmplă |
|---|---|
| La creare (Modifică) | `pending_extra_payment_expires_at` scris pe comandă (migrația 133) |
| Link mai are <6h | **Cron orar** trimite clientului UN reminder branduit („expiră în ~Xh", același link). Dedupe: `pending_extra_reminder_sent_at` (migrația 134) + Idempotency-Key Resend |
| Link activ | Banner amber pe comandă: „expiră în ~Xh" + link copiabil |
| Link EXPIRAT | Banner **roșu „🔴 LINK DE PLATĂ EXPIRAT — contactează clientul"**; NU se trimite email automat (anti-spam) — echipa sună/scrie + regenerează |
| Butonul „**Generează link nou**" | Expiră sesiunea veche în Stripe (anti dublă-plată) → sesiune nouă pe aceeași sumă → **proforma Oblio se REFOLOSEȘTE** (nu se re-emite) → email automat către client → istoric „REGENERAT" |

**Chip listă comenzi**: „Plată extra în așteptare" (Filtre rapide, cu count) —
toate comenzile cu link pending neîncasat.

Cron: `/api/cron/extra-payment-reminders/` (vercel.json, min :15, GET
passthrough + slash final). Verificare post-deploy: `curl` → 401, nu 405/308.

## Backlog v2 (nefăcut, de discutat)

- Rânduri multiple de serviciu custom per modificare.
- Dropdown cu servicii custom frecvente + preț presetat (reduce typo-uri).
- Confirmare contabil pe denumirile libere trimise în Oblio.
- Rândul custom existent nu apare în lista de opțiuni la un al doilea
  „Modifică" (limitare mod catalog; se retrimite corect din state).
