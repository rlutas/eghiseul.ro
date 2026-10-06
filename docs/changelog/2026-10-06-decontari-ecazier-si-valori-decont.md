# 06.10.2026 — Decontări: plăți ecazier recunoscute + valori implicite în decontul avocatei
<!-- categorie: plati -->

## Pentru echipă

- **Decontări:** o plată de ecazier încasată pe contul nostru Stripe (EFC-20261002-61612, payoutul din 07.10) apărea fără factură, deși factura există (EGH 0794). Acum sistemul recunoaște și comenzile ecazier și le leagă factura.
- **Payoutul din 18.08:** factura comenzii CJO-20260813-73785 (EGH 0706) a fost emisă după ce payoutul fusese sincronizat. Se leagă apăsând „Backfill 90 zile” în Decontări.
- **Decontul avocatei, jos în Excel:** blocul nou „DE PLATĂ CĂTRE GABRIELA” arată ce primește și cum. Sunt trei sume: factura cabinetului pentru onorarii (ex. 151 × 15 = 2.265, TVA inclus), factura lunară (1.250, TVA inclus) și transferul în contul TM (restul după dividende), apoi totalul.
- **Decontul avocatei:** formularul pornește acum cu factura lunară a cabinetului 1.250 lei, angajați 12.000 lei, contabilitate 1.500 lei și un rând „Reclamă” pe 0, de completat lunar. Fiecare cheltuială are un câmp de comentariu, care apare în Excel în coloana din dreapta. La angajați comentariul arată, doar informativ, costul real de 19.025 și din ce e compus (în decont se scad tot 12.000), iar la contabilitate scrie EDIGITALIZARE SRL și BMR DIGITAL.

---

- `src/lib/accounting/payout-sync.ts`: `ORDER_RE` matches `EFC-`; `EJC-`/`EFC-` (ecazier, CJO database) moved from the eghiseul prefixes to `CJO_PREFIXES`. The eghiseul DB has no `EJC-` orders (only `E-` and one `WP-`), so nothing previously matched changes.
- Late invoices: the cron re-syncs payouts created in the last 30 days; the 18.08 payout is older, so it needs the 90-day backfill.
- Lawyer decont xlsx: closing block `DE PLATĂ CĂTRE GABRIELA` (onorarii invoice, monthly invoice, transfer to the TM account, total).
- `/admin/colaboratori` lawyer decont defaults: `facturaCabinet` 1250, Taxe angajați 12000 (note shows the real 19025 cost, informative only), Contabilitate 1500, Reclamă 0 (lines with 0 are not sent to the export). Cost lines carry an optional `note` (max 300 chars) written to the note column.
