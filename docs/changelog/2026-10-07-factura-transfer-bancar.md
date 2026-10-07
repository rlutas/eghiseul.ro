# 07.10.2026 — Factura la plata prin transfer bancar se emite din nou corect
<!-- categorie: plati -->

## Pentru echipă

- La „Confirmă plata" pe o comandă plătită prin transfer, factura nu se emitea: Oblio refuza tipul de încasare. Comanda E-261007-JWBHC a rămas așa azi; factura ei s-a emis după reparație.
- De acum factura de la transfer are încasarea **„Ordin de plată"**, data în care au intrat banii și referința bancară pe care o scrieți la confirmare. La „Mențiuni" apare tot: plată prin transfer bancar, referința, data încasării, numărul comenzii.
- Fluxul rămâne același: lucrul pornește la „Confirmă plata", sau mai devreme cu „Dovadă verificată — pornește lucrul" dacă vreți să nu așteptați banii. Factura și emailul de confirmare pleacă doar la „Confirmă plata".
- În Decontări, transferul se leagă de comandă din **„Extras bancă"**: urcați CSV-ul de la BT, iar linia se potrivește singură după referință sau numărul comenzii. Nu apare la plățile Stripe, pentru că banii n-au trecut prin Stripe.
- Atenție, contabilitate: primele 3 facturi de transfer (EGH-0647, EGH-0703, EGH-0731) au fost emise automat cu încasare „Card". Încasarea lor trebuie corectată în Oblio pe „Ordin de plată".

Procedura: [Plată prin transfer bancar](../admin/plata-transfer-bancar.md).

---

**Cauza.** `createInvoiceFromOrder` trimitea `collect.type = 'Transfer bancar'` (și `'Cash'`), valori pe care Oblio nu le acceptă: `400 Metodele acceptate de incasare sunt: Chitanta, Bon fiscal, Alta incasare numerar, Ordin de plata, Mandat postal, Card, CEC, Bilet ordin, Ramburs, Alta incasare banca`. Toate cele 4 transferuri de până acum au eșuat la confirmare. Primele 3 au fost „vindecate" de cronul orar `invoice-health-check`, care apela `ensureInvoiceForPaidOrder(id, 'Card')` pentru orice comandă, deci au ieșit cu încasare Card. A patra (E-261007-JWBHC) nu prinsese încă rularea; lacătul de facturare a fost pus temporar pe o oră viitoare ca să nu iasă și ea pe Card până la deploy.

**Reparația.**
- `src/lib/oblio/invoice.ts`: `oblioCollectType()` mapează `Transfer bancar` → `Ordin de plata`, `Cash` → `Alta incasare numerar`; `paymentMethodForOrder()` citește metoda din `orders.payment_method`; `manualPaymentMentions()` scrie mențiunea (ASCII, ajunge și în e-Factura). La transfer/cash, `collect.documentNumber` = `payment_reference`, `collect.documentDate` = data din `paid_at`.
- `ensure-invoice.ts`: metoda o dă comanda, nu apelantul — cronul orar și `confirm-payment` nu mai pot emite un transfer ca Card. Trimite și `payment_reference` + `paid_at`.
- `reissue-invoice`: refacerea facturii folosea mereu `'Card'`; acum metoda comenzii.
- `OblioInvoiceInput.mentions` adăugat în tipuri.
- Teste: `tests/unit/lib/oblio/invoice.test.ts` (Ordin de plata, referință, dată, mențiuni; cash; card fără mențiuni), `ensure-invoice.test.ts` (regresie: transfer apelat cu 'Card' tot Transfer bancar).
