# 06.10.2026 — Recuperare telefonică: se vede cine a plătit după apel
<!-- categorie: clienti -->

## Pentru echipă

- În **Recuperare telefonică** apare acum un tab nou, **„✅ Recuperate”**: clienții sunați care au plătit după apel, cu suma și numărul comenzii plătite. Până azi nu le vedeați, pentru că omul plătește aproape mereu pe o comandă nouă, iar cea sunată rămânea „neplătită”.
- Sus sunt 4 cifre: câte apeluri ați făcut (7 și 30 de zile), câți clienți au plătit după apel și câți lei, câte comenzi neplătite din ultima săptămână n-au fost sunate încă.
- Clienții care au plătit între timp pe altă comandă **dispar singuri din „De sunat”**, deci nu-i mai sunați degeaba.
- Până la 06.10: 20 de apeluri, 2 comenzi plătite după apel (1.744,80 lei). Sunați zilnic coada: fiecare client recuperat înseamnă în medie ~870 de lei.

---

- `src/lib/orders/phone-recovery-wins.ts` (new): `buildPaidIndex`, `findPaymentAfter` (email match, paid after call minus 1 day; 0 grace for hiding open rows), `summarizeCalls`. Tests: `tests/unit/lib/orders/phone-recovery-wins.test.ts` (7).
- `GET /api/admin/orders/priority-calls`: loads paid orders of the last 90 days (`email:customer_data->contact->>email`), skips queue rows whose client paid on another order, returns `recovered[]` and `kpi { calls7, calls30, recovered, recoveredLei, unpaidNoCall7 }`; `conversion` removed.
- `/admin/recuperare-telefonica`: KPI cards + „De sunat / ✅ Recuperate” tabs.
- Spec: `docs/technical/specs/phone-recovery-abandoned-carts.md` § „Recuperate și KPI”.
