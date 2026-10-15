# 16.10.2026 — Decontări: la anulările fără factură inițială se vede suma reală a facturii
<!-- categorie: plati -->

## Pentru echipă

- Contabilul a observat în decontarea din **18.09** că factura **EGH-0692** părea încasată cu **198 lei**, deși are **59,40 lei**. Are dreptate:
  - comanda a fost plătită cu 198 lei;
  - în 30 de minute a fost anulată, iar clientul a primit înapoi 138,60 lei (70%);
  - factura inițială nu apucase să se emită, așa că singurul document e factura taxei de anulare (30%): **EGH-0692 = 59,40 lei**.
- Decontarea punea EGH-0692 pe ambele linii, pe încasarea de 198 lei și pe rambursarea de 138,60 lei, fără să spună suma facturii. La fel arăta **EGH-0681**, tot din 18.09.
- **Acum**, sub serviciu, pe fiecare linie scrie explicit:
  - pe încasare: „EGH-0692 = 59,40 lei (taxa de anulare 30%), NU 198,00 lei: din 198,00 lei încasați s-au rambursat 138,60 lei; fără factură inițială”;
  - pe rambursare: „rambursare 138,60 lei (70%), fără storno: nu a existat factură inițială”.
- Același text apare și în exportul CSV.

---

## Tehnic

- `cancelFeeOnlyNote()` în `src/lib/accounting/extra-invoice-match.ts`, folosit în ambele ramuri din `payout-sync.ts` (eghiseul: `total_price`/`refunded_amount` în RON; CJO: `amount_total`/`refunded_amount_bani` în bani). Înlocuiește nota generică „taxă anulare 30%, fără factură inițială”.
- `/admin/decontari/[payoutId]`: ultima parte a descrierii („ · …”), când e notă contabilă (factur/storno/rambursare), se afișează sub serviciu. Înainte se vedea doar numele serviciului.
- Teste: `tests/unit/lib/accounting/cancel-fee-note.test.ts`.
