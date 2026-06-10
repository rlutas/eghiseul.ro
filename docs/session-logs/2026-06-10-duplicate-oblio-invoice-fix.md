# Sesiune 2026-06-10 (7) — Factură Oblio duplicată (E-260610-ZHGXB) — șters + fix cauză

**Status:** ✅ Facturi șterse din Oblio + DB curățat + cauză reparată (migrare + webhook, build OK)
**Fișiere:**
- `supabase/migrations/049_invoice_generating_lock.sql` (nou, rulat)
- `src/app/api/webhooks/stripe/route.ts`

---

## Incident

Comanda `E-260610-ZHGXB` (total 952.81 RON) a generat **2 facturi în Oblio**:
- `EGI2024-24075` (09:57:26)
- `EGI2024-24076` (09:57:28)

`order_history` arăta **două** evenimente `payment_confirmed` la ~1.6s diferență.

## Cauză (race condition / TOCTOU)

Stripe trimite, pentru aceeași plată cu cardul, **două** evenimente: `checkout.session.completed` ȘI `payment_intent.succeeded` (~1-2s diferență). Ambele apelează `handlePaymentSucceeded`, care:
1. citește comanda, verifică `invoice_number` (guard),
2. creează factura în Oblio (apel ~1.5s),
3. scrie `invoice_number`.

Cele două evenimente trec amândouă de guard **înainte** ca vreunul să scrie `invoice_number` (fereastra = durata apelului Oblio) → **2 facturi**.

## Rezolvare

### 1. Ștergere facturi (manual, prin Oblio API)
- DELETE `EGI2024-24076` apoi `EGI2024-24075` (în ordine descrescătoare — Oblio permite ștergerea doar a ultimei din serie). Format corect: `DELETE /api/docs/invoice?cif=..&seriesName=EGI2024&number=..`. Confirmat: „Documentul a fost sters" + verificat că nu mai există.
- Golit `invoice_number` / `invoice_url` / `invoice_issued_at` pe comandă; `order_history` (`admin_action`) loghează ștergerea.

### 2. Fix cauză — lock atomic
- Migrare **049**: coloană `orders.invoice_generating_at timestamptz` (lock care se auto-expiră ~2 min).
- Webhook: **înainte** de `createInvoiceFromOrder`, un UPDATE condiționat atomic claim-uiește rândul:
  ```
  UPDATE orders SET invoice_generating_at = now()
  WHERE id = $1 AND invoice_number IS NULL
    AND (invoice_generating_at IS NULL OR invoice_generating_at < now() - 2min)
  RETURNING id
  ```
  Doar webhook-ul care „câștigă" rândul creează factura; celălalt iese (`skip`). Lock-ul expiră în 2 min → un retry real poate re-claim-ui dacă emiterea a eșuat.

## Verificare
- Oblio: ambele facturi inexistente (verificat via API).
- DB: câmpuri factură NULL pe `E-260610-ZHGXB`.
- `tsc`/`lint`/`build` curate.

## Note / follow-up
- Aceeași logică ar putea fi adăugată și la `verify-payment` (transfer bancar) pentru consistență — risc mai mic (declanșat manual de admin), dar de luat în calcul.
- Pe live, dacă mai apar duplicate, verifică `invoice_generating_at` pe comandă în loguri.
