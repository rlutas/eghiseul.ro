# 06.10.2026 — Decont avocat: factura lunară a cabinetului se scade înainte de dividende
<!-- categorie: plati -->

## Pentru echipă

- În decontul cu cabinetul de avocatură, factura lunară a cabinetului (ex. 1.250 lei) se scade acum **înainte** de impozitul pe dividende, la fel ca onorariile de 15 lei pe contract.
- Înainte se scădea după dividende, deci impozitul pe dividende era calculat pe o sumă prea mare. Pe septembrie diferența era de 200 lei în defavoarea avocatei.
- Câmpul din admin se numește acum „Factura lunară cabinet (RON)". Ultimul rând din Excel e „RĂMAS GABRIELA după dividende".
- Exportul pe septembrie trebuie refăcut după actualizare.

---

`POST /api/admin/collaborators/avocat-decont/xlsx`: Gabriela's share now subtracts both cabinet invoices (`onorarii` = contracts × 15 and `facturaCabinet`) before `dividendTaxPercent` is applied. Previously `facturaCabinet` came off after dividend tax.

September 2026 example: 45% share 7.283,83 − 2.265 − 1.250 = 3.768,83; dividend tax 603,01 (was 803,01); final 3.165,82 (was 2.965,82).

Verification of the September export (same session):
- 151 rows, column totals match the Decont sheet, no duplicate orders.
- Central registry: 41 eghiseul + 110 CJO contracts in September = the 151 rows. 23 gaps in 6169–6342 are MANUAL allocations (lawyer's own clients) + 1 voided, correctly excluded.
- Stripe fee 1.041,23 = 148 orders; the other 3 were bank transfers.
