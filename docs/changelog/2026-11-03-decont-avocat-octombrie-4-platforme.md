# 03.11.2026 — Decontul avocatei pe octombrie, pe toate cele 4 platforme
<!-- categorie: plati -->

## Pentru echipă

- Decontul cu cabinetul de avocatură cuprinde acum **toate cele patru site-uri**: eghiseul.ro, documentero.ro, cazierjudiciaronline.com și ecazier.ro. Regula: intră tot ce s-a încasat la noi. Comenzile ecazier plătite direct cabinetului rămân ale cabinetului.
- În admin, la „Avocat — decont cabinet”, opțiunea „Toate” arată câte o casetă pentru fiecare site care are comenzi în lună.
- **Plățile prin proformă Oblio** (fără comandă în platformă) intră și ele dacă sunt muncă de cabinet. În octombrie: cazierul unui client firmă (scăpat din septembrie) și o apostilă Haga plătită ca extra pe o comandă existentă. Traducerea și transportul DHL plătite prin proformă nu intră.
- O plată extra pe o comandă care e deja în decont nu mai primește încă un onorariu de 15 lei, pentru că e același contract.
- Octombrie: 99 de poziții, 30.924,92 lei cu TVA, 98 de contracte. Către cabinet: factura de onorarii 1.470 + factura lunară 1.250 + transfer 957,44 = 3.677,44 lei.
- Procedura: [Decontul lunar cu avocata](../admin/decont-avocat-colaborator.md).

---

- `src/lib/admin/avocat-decont.ts`: `Platform` adds `ecazier`; `PLATFORMS`; `loadCjo` filters `stripe_account = 'edigitalizare'` (was `source = 'cazierjudiciaronline'`), row platform = `ecazier` when `source = 'ecazier'`. July–September unchanged (no ecazier order on our Stripe before EFC-20261002-61612).
- `MANUAL_DECONT_ROWS` (per month): payments with no order. `extraOf` = extra on an order already in the decont: no second onorariu, no registry/Stripe match on that row. `summarize().contracts`; onorarii = contracts × 15.
- `byPlatform` is `Record<Platform, …>`; TSV, Excel and `/admin/colaboratori` list every platform with orders.
- The Excel builder moved to `src/lib/admin/avocat-decont-xlsx.ts` (`buildAvocatDecontWorkbook`); the route only authorizes.
- October check: registry 115 contracts 6343–6457 = 42 egh + 1 documentero + 53 CJO + 1 ecazier + 18 manual "Client avocat" (excluded), no voided, no gaps. Stripe fee 846,65; 3 card orders of 31.10 not synced yet (~13 lei), one bank transfer. Proformas EGIP 0322/0323/0324 read from the Oblio PDFs; 0324 = DHL transport, excluded.
