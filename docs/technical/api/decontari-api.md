# Decontări — API admin

Rute sub `/api/admin/decontari/`. Toate cer sesiune de admin și
`requirePermission(userId, 'payments.verify')`. Răspuns: `{ success, data?, error? }`.
Spec complet: [`../specs/decontari-stripe-reconciliation.md`](../specs/decontari-stripe-reconciliation.md).

| Metodă | Rută | Ce face |
|---|---|---|
| GET | `/api/admin/decontari?month=YYYY-MM` | payout-uri Stripe cu statusul facturilor |
| POST | `/api/admin/decontari/sync` | `{ sinceDays }`: sincronizează payout-urile din Stripe |
| GET | `/api/admin/decontari/[payoutId]` | detaliul unui payout |
| GET | `/api/admin/decontari/export?month=YYYY-MM` | CSV lunar pentru contabil |
| POST | `/api/admin/decontari/bank-import` | `multipart file`: import CSV BT (upsert pe `reference`; reimportul păstrează legăturile payout/comandă) |
| GET | `/api/admin/decontari/banca?month=YYYY-MM` | liniile extrasului, categorisite |
| GET | `/api/admin/decontari/facturi-furnizori` | istoric: `{ months: [{ month, suppliers, handed, total_bani }] }` |
| GET | `/api/admin/decontari/facturi-furnizori?month=YYYY-MM` | `{ month, suppliers: [{ key, label, where, count, total_bani, payments[], downloaded, printed, handed, note }] }`; fiecare pas e `null` sau `{ at, by }` (nume din `profiles`) |
| POST | `/api/admin/decontari/facturi-furnizori` | `{ month, supplier_key, step: 'downloaded'\|'printed'\|'handed', done: boolean }` sau `{ month, supplier_key, note }`: upsert în `supplier_invoice_checks` |

## Facturi furnizori (14.10.2026)

Furnizorii NU se salvează la import. Se calculează la fiecare citire din
descrierea liniei (`supplierFor()`): întâi `SUPPLIER_RULES`, apoi orice plată POS
în USD/EUR/GBP, grupată după comerciant. O regulă nouă se aplică deci și
extraselor vechi. Furnizorii a căror factură vine în SPV (avocat, curieri, DHL
prin MyBill) nu au regulă și nu apar.
