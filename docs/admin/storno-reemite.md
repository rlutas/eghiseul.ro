# Storno + Reemite factură Oblio

**Stare:** ✅ Implementat (behind feature flag `OBLIO_REISSUE_ENABLED=true`)
**Endpoint:** `POST /api/admin/orders/[id]/reissue-invoice`
**Permisiune RBAC:** `orders.manage`
**Audit log:** `order_history.event_type = 'note_added'` cu `from_status='invoice_reissued'`

---

## Context business

În sister project (cazierjudiciaronline.com) `docs/admin/modifica-comanda.md` descrie regula:

> Dacă factura este deja emisă în Oblio, modificarea comenzii necesită **anulare (storno) + emitere nouă**. Operațiunea ajunge automat în SPV — operatorul **trebuie să confirme** înainte.

La noi cu Oblio API există endpoint dedicat `/docs/cancel` care creează storno automat (diferit de SmartBill care cere factură nouă cu cantitate negativă). Combinăm cu `createInvoiceFromOrder` pe rândul curent al order-ului (deja conține line items per addon + linia de cupon din migration 040+041).

---

## Cum funcționează

```
Operator click „Storno + Reemite" în /admin/orders/[id]
  ↓ confirm dialog (irreversibilă, ajunge în SPV)
POST /api/admin/orders/[id]/reissue-invoice
  ↓ STEP 1 — feature flag check (503 dacă off)
  ↓ STEP 2 — auth + RBAC (orders.manage)
  ↓ STEP 3 — load order, validate paid + has invoice_number
  ↓ STEP 4 — anti-double-click: 60s guard pe invoice_issued_at
  ↓ STEP 5 — parseInvoiceNumber("EGH-0001") → {seriesName, number}
  ↓ STEP 6 — Oblio cancelInvoice() → storno automat în SPV
  ↓ STEP 7 — createInvoiceFromOrder() → factură nouă corectivă cu liniile actuale
  ↓ STEP 8 — UPDATE orders SET invoice_number, invoice_url, invoice_issued_at
  ↓ STEP 9 — INSERT order_history (audit cu vechi → nou)
  ↓ Response { success: true, oldInvoice, newInvoice }
```

---

## Error handling

| Scenariu | Behavior |
|----------|----------|
| `OBLIO_REISSUE_ENABLED ≠ 'true'` | 503 + mesaj clar; UI button ascuns dacă feature flag în client |
| Order nu există / nu plătit | 404 / 400 cu motiv |
| Order fără `invoice_number` | 400 — nu există ce storno |
| Reissue în ultimele 60 secunde | 429 anti-double-click |
| Oblio `cancelInvoice` failează | 502 + audit log; factură veche rămâne validă |
| Storno OK, dar emitere nouă failează | Audit reține ambele stări, instrucțiune operatorului să emită manual din Oblio UI + să actualizeze `invoice_number` din admin |

---

## Cazuri când apelezi Storno

1. **După Modify cu factură deja emisă** — clientul a plătit, factura e în SPV, apoi cere upgrade la traducere → Modify face refund/extra, apoi Storno + Reemite alinează factura
2. **Eroare de date pe factură** — CUI greșit, adresă incorectă (sub-caz: edit client data → reissue)
3. **Anulare totală** comandă deja facturată — alternativ la doar `cancelInvoice` (manual din Oblio UI)

---

## NU apela Storno când

- Comanda încă neplătită (`payment_status ≠ 'paid'`)
- Factură niciodată emisă (`invoice_number IS NULL`)
- Vrei doar să retrimiți email-ul cu factura existentă (folosește butonul „Resend invoice email" — TODO)

---

## UI

Pe `/admin/orders/[id]`, deasupra cardului „Detalii client", lângă butonul „Modifică":

```
[ Modifică ] [ Storno + Reemite ]
```

Stiluri:
- **Modifică**: `bg-amber-50 text-amber-900 border-amber-200` (default)
- **Storno**: `bg-white text-amber-700 border-amber-300` cu icon `RotateCcw` (Lucide)

Confirm dialog text:
> Ești sigur? Storno va anula factura curentă în Oblio (operațiune ireversibilă — ajunge automat în SPV) și va emite o factură nouă corectivă cu liniile actuale ale comenzii.

---

## Activare la cutover

```bash
# .env.production
OBLIO_REISSUE_ENABLED=true
```

Fără variabilă, endpoint-ul returnează 503 și butonul rămâne vizibil dar inactiv. Justificare: vrem să testăm prima dată în staging înainte să producem storno-uri reale (ajung în SPV ANAF — nu reversibile).

---

## Referințe

- `src/app/api/admin/orders/[id]/reissue-invoice/route.ts` — endpoint
- `src/lib/oblio/parse-number.ts` — split „EGH-0001" → `{seriesName, number}`
- `src/lib/oblio/invoice.ts` — `cancelInvoice` + `createInvoiceFromOrder`
- `tests/unit/lib/oblio/parse-number.test.ts` — 6 teste
- Sister: `/Users/raul/Projects/cazierjudiciaronline.com/docs/admin/modifica-comanda.md` (sectiunea „Storno + Reemite", linii 380-470)
