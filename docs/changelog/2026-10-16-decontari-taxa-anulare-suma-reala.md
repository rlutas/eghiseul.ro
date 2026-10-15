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
- **Corectare a doua, aceeași zi** (contabilul: „EGH-0681 este 59,40 lei, nu e factură cu minus”): pe linia de **rambursare** nu mai apare factura de 59,40 lei, pentru că nu e document cu minus. Linia apare **„fără document (vezi nota)”**: nu a existat factură inițială, deci nici storno.
- **Am verificat toate decontările din mai până azi**: 1.176 de linii, fiecare comparată cu factura ei din Oblio (sumă și semn). Toate facturile există. 12 linii erau prezentate greșit și sunt reparate:
  - **anulări cu storno complet + factură nouă** (EGH-0683+0684, 0474+0475, 0377+0378, 0245+0246): pe rambursare scrie acum „rambursat 138,60 lei = storno −198,00 lei + factura de 59,40 lei păstrați”;
  - **două anulări din iunie** aveau storno și factură nouă în Oblio (EGI2024-24129+24130, EGI2024-24160+24161), dar nu erau trecute pe comenzi; acum sunt;
  - **două plăți extra din iunie–iulie** (249,75 și 307,80 lei) apăreau cu factura principală de 198 lei; acum apar cu facturile lor (EGI2024-24233, EGH-0016).

---

## Tehnic

- `cancelFeeOnlyNote()` în `src/lib/accounting/extra-invoice-match.ts`, folosit în ambele ramuri din `payout-sync.ts` (eghiseul: `total_price`/`refunded_amount` în RON; CJO: `amount_total`/`refunded_amount_bani` în bani). Înlocuiește nota generică „taxă anulare 30%, fără factură inițială”.
- `/admin/decontari/[payoutId]`: ultima parte a descrierii („ · …”), când e notă contabilă (factur/storno/rambursare), se afișează sub serviciu. Înainte se vedea doar numele serviciului.
- `applyRefundDocument()` în `payout-sync.ts` (ambele platforme): storno, plus `stornoWithFeeNote` când s-a rambursat parțial; fără factură inițială → document gol + `_keepEmpty`, ca pasul „păstrează facturile atașate manual” să nu repună factura veche.
- Date CJO completate (audit 16.10): `storno_invoice_number`/`cancel_fee_invoice_number` pe CJO-20260615-13680 și CFO-20260618-78061; `extra_billing` pe CJO-20260626-60476 (EGI2024-24233) și CJO-20260709-26957 (EGH-0016), cu PaymentIntent-ul plății extra.
- Audit: lista facturilor Oblio (API, din 01.05) comparată cu `stripe_payout_transactions.invoice_number`: încasare = total pozitiv egal, rambursare = storno egal.
- Teste: `tests/unit/lib/accounting/cancel-fee-note.test.ts`.
