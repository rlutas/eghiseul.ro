# 03.11.2026 — Deconturile cu cabinetul de avocatură, lună cu lună, în admin
<!-- categorie: plati -->

## Pentru echipă

- În Colaboratori, tabul cu decontul cabinetului de avocatură, sus apare acum tabelul „Deconturi închise”: pentru fiecare lună, câte poziții au fost, cât au făcut serviciile cabinetului, onorariile, factura lunară, transferul și totalul către cabinet.
- Coloana Stare spune dacă luna e plătită sau doar verificată și de plătit.
- **Octombrie 2026 e verificat de Raul (03.11)**: 99 de poziții pe toate cele 4 site-uri, 3.677,44 lei către cabinet (onorarii 1.470 + factura lunară 1.250 + transfer 957,44). Plata urmează.
- Lângă suma serviciilor apare scăderea față de luna dinainte: iulie 73.284 → octombrie 30.925 lei, adică −58% în trei luni.
- Selectorul de lună pornește acum pe luna trecută, cea care se decontează.

---

## Tehnic

- `src/lib/admin/avocat-settlements.ts` (nou): `AVOCAT_SETTLEMENTS`, date pure, o intrare pe lună închisă (`paid`, `paidOn?`, `checkedOn?`); `settlementTotal()` = onorarii + factura lunară + transfer.
- `src/app/(eghiseul)/admin/colaboratori/page.tsx`: `AvocatSettlementsHistory` deasupra formularului `AvocatDecont`; luna implicită = luna precedentă.
- Cifrele vin din exporturile trimise (iulie, august, septembrie din `docs/admin/decont-avocat-colaborator.md`, octombrie din calculul de azi). Când se plătește octombrie: `paid: true, paidOn`.
