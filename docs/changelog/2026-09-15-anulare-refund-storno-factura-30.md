# 15.09.2026 — Anulare în 30 de minute: refund urmărit, storno + factura de 30%, ascunsă de la colaborator
<!-- categorie: plati -->

## Pentru echipă

- Butonul **„Procesează refund"** de pe „Anulare solicitată" face acum tot:
  refundul de 70% prin Stripe, **stornarea facturii** inițiale și **factura
  taxei de anulare** (30% reținut). Până azi doar dădea banii; factura rămânea
  pe 100% și cei 30% nu aveau document.
- După refund vezi un banner **verde** (refund dat automat / manual, id-ul
  Stripe, storno, factura de 30%) sau **galben** dacă lipsește ceva, cu butonul
  **„Reconciliază"** care completează ce lipsește. Dacă Stripe refuză refundul,
  comanda rămâne pe „Anulare solicitată" cu eroarea la vedere și cu butonul
  **„Am refundat manual"**.
- Aceeași funcție există acum și pe **cazierjudiciaronline.com / ecazier** —
  nu mai dai refundul de mână din Stripe.
- Comenzile cu anulare cerută **nu mai apar la topograf** (E-260915-M4A4V a fost
  lucrată degeaba la 2 minute după cererea de anulare).
- Contabilul: rambursările din Decontări se leagă de comandă și poartă numărul
  stornoului.
- Anulările vechi sunt curățate (15.09, cu „Reconciliază"): E-260915-M4A4V
  → EGH-0681; CAO-20260915-26899 (CJO) → storno EGH-0683 + EGH-0684;
  E-260819-BWB6G avea deja storno (EGH-0474) și factura de 30% (EGH-0475) făcute
  manual — legate în comandă. ⚠️ EGH-0682 (emisă azi pe BWB6G) e duplicat și
  trebuie **anulată din Oblio**; butonul verifică de acum dacă factura de 30%
  există deja înainte să emită alta. Legate și anulările din iulie–august
  (TDXDU, J6EEX, CJO-23113, CJO-15831). Procedura completă:
  [Anulare: refund 70% + factura de 30%](../admin/anulare-refund-70.md).

---

## Rezumat tehnic

**Cauză (E-260915-M4A4V, identificare imobil, 198 lei).** `process-cancellation`
făcea refundul Stripe și flip-ul pe `refunded`, atât. Insertul în `order_history`
folosea coloane inexistente (`from_status`/`to_status`) → pica tăcut → id-ul
refundului pierdut. Factura nu se emisese la plată (Oblio 401 „token expired"),
iar cronul `invoice-health-check` cere `payment_status='paid'` — după refund nu
mai reîncearcă → 59,40 reținuți fără document. Topograful a văzut comanda după
`cancellation_requested` (filtrul colaboratorului era doar pe `payment_status`).
Pe CJO butonul „Proceseaza refund 70%" doar PATCH-uia statusul.

**eghiseul.ro**
- migrarea 162: `orders.refund_stripe_id / refund_status (succeeded|failed|manual)
  / refund_error / refund_processed_at / storno_invoice_number /
  cancel_fee_invoice_number / cancel_fee_invoice_url`.
- `src/lib/oblio/storno.ts`: `createStornoInvoice` (POST `/docs/invoice` cu
  `referenceDocument{refund:1}` — Oblio pune liniile negative și **șterge
  încasarea** atașată, deci nu mai rămâne creditul fantomă din 03.08) +
  `getInvoiceFlags` (canceled/stornoed din listare). `cancelInvoice` corectat pe
  `PUT /docs/invoice/cancel` (vechiul `POST /docs/cancel` nu există; reemiterea
  nu fusese folosită niciodată).
- `src/lib/orders/cancel-fee-invoice.ts` (pur, 4 teste): taxa = total − refund
  la ban; o linie „Taxă anulare comandă … (30% reținut)", TVA inclus, collect
  Card pe PI.
- `src/lib/orders/cancellation-fiscal.ts`: idempotent — storno doar dacă factura
  există și nu e deja stornată/anulată; factura de 30% doar dacă lipsește;
  fiecare pas scrie în istoric, erorile nu blochează refundul.
- `POST /api/admin/orders/[id]/process-cancellation` cu `mode: auto | manual |
  reconcile`; la eșec Stripe comanda rămâne `cancellation_requested` cu
  `refund_status='failed'`; refund metadata primește `order_number`.
- Admin: `CancellationRequestedBanner` (eroare Stripe + „Am refundat manual") și
  `RefundOutcomeBanner` (verde/galben + „Reconciliază").
- Colaborator: `COLLAB_HIDDEN_STATUSES` (cancellation_requested/cancelled/
  refunded) pe listă, detaliu, cereri și decont.
- Decontări (`payout-sync`): sursa unei tranzacții `refund` e obiectul Refund →
  `resolveRefundReference` (pur, 4 teste) citește `order_number`/`order_ref`
  din metadata sau aduce charge-ul; rândurile de rambursare primesc
  `storno_invoice_number` (eghiseul + CJO) ca factură.

**cazierjudiciaronline.com** (paritate): migrarea 034 (aceleași coloane),
`createStornoInvoice`/`getInvoiceFlags` în `oblio/client.ts`,
`src/lib/cancel-fee-invoice.ts` (4 teste) + `cancellation-fiscal.ts`, ruta
`process-cancellation` (Stripe pe `orders.stripe_account`, PI din comandă sau
din sesiunea Checkout; SmartBill istoric → doar mesaj), bannerele din admin.

**Verificat pe Oblio API (după reconciliere):** EGH-0679 `stornoed=1`,
`collects=[]` (încasarea de 198 ștearsă de `refund:1`, deci fără credit fantomă);
EGH-0683 = −198 `storno=1`; EGH-0681/0684 = 59,40, `collected=1` pe PI-ul
comenzii. Gardă nouă `findExistingInvoiceForClient` (client + sumă, 60 zile)
în ambele module fiscale după duplicatul EGH-0682. Refundurile legate din Stripe: `re_…1sW0r8Lb`,
`re_…0ObFAPAv`, `re_…0RJiohBt`.
