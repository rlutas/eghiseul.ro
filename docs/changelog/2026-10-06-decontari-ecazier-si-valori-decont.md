# 06.10.2026 — Decontări: plăți ecazier recunoscute + valori implicite în decontul avocatei
<!-- categorie: plati -->

## Pentru echipă

- **Decontări:** o plată de ecazier încasată pe contul nostru Stripe (EFC-20261002-61612, payoutul din 07.10) apărea fără factură, deși factura există (EGH 0794). Acum sistemul recunoaște și comenzile ecazier și le leagă factura.
- **Payoutul din 18.08:** factura comenzii CJO-20260813-73785 (EGH 0706) a fost emisă după ce payoutul fusese sincronizat. Se leagă apăsând „Backfill 90 zile” în Decontări.
- **Decontul avocatei:** formularul pornește acum cu factura lunară a cabinetului 1.250 lei, contabilitate 1.500 lei și un rând „Reclamă” pe 0, de completat lunar.

---

- `src/lib/accounting/payout-sync.ts`: `ORDER_RE` matches `EFC-`; `EJC-`/`EFC-` (ecazier, CJO database) moved from the eghiseul prefixes to `CJO_PREFIXES`. The eghiseul DB has no `EJC-` orders (only `E-` and one `WP-`), so nothing previously matched changes.
- Late invoices: the cron re-syncs payouts created in the last 30 days; the 18.08 payout is older, so it needs the 90-day backfill.
- `/admin/colaboratori` lawyer decont defaults: `facturaCabinet` 1250, Contabilitate 1500, Reclamă 0 (lines with 0 are not sent to the export).
