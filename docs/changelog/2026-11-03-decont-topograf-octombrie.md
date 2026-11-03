# 03.11.2026 — Decontul cu topograful pe octombrie, verificat; taxa de 0 lei la CF colectiv
<!-- categorie: clienti -->

## Pentru echipă

- Decontul topografului pe octombrie e verificat comandă cu comandă: 43 de comenzi plătite, toate în decont, fără anulări sau rambursări în lună.
- Rezultatul lunii: încasat 5.581,22 lei, taxe OCPI 1.205, Stripe 116,76, fără reclamă (campaniile n-au mers în octombrie). Partea fiecăruia: **1.161 lei**. Topograful facturează comisionul lunii (9 comenzi × 15 = 135 lei, TVA inclus) și primește restul de 1.026 lei prin transfer.
- Toate extrasele CF au taxa trecută corect (20 lei pe fiecare extras din comandă).
- **Extrasul CF colectiv cu taxa 0:** o taxă trecută pe comandă cu 0 lei e acum taxă cunoscută. Nu mai apare cu portocaliu ca „taxă care urmează”, nici în portalul topografului, nici în admin.
- Rămâne deschisă actualizarea de adresă din 31.10, care e la instituție și n-are încă taxa trecută. Intră automat în decontul pe noiembrie.
- Topograful vede extrasul lunii în portal, la „Decont lunar”, luna octombrie.

---

- `src/lib/collaborator/settlement.ts`: `OcpiInput.ocpiRecorded` + `hasAncpiFeeRow()`; `estimateOrderOcpi` / `pendingOcpiSummary` skip orders that have an ANCPI `taxa_institutie` row at any amount, 0 included.
- `statement.ts`: `StatementOrder.ocpiRecorded`, used for pending and `byService.withoutOcpi`.
- `GET /api/collaborator/earnings` and `GET /api/admin/collaborators/orders` return `orders[].ocpiRecorded`; the portal and admin tables show "0,00" instead of an estimate.
- Test: `tests/unit/lib/collaborator/statement.test.ts` ("fee recorded at 0 lei").
- October verification (cumulative, same logic as the portal): correction from earlier months 0; Stripe fee 0 on 3 bank-transfer orders (correct) and on E-261031-68SFJ (card, payout of 31.10 not synced yet; it comes into November by itself). Advances: 4.540 recorded vs 5.260 fees; the topograf reports 90 lei left, so about 810 lei of transfers are missing from the advances list.
- Payout not yet recorded in `DISTRIBUTIONS`: add the October entry when it is paid.
