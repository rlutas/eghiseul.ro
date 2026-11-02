# 02.11.2026 — Țara pe factură la clienții din străinătate + verificarea decontărilor pe septembrie și octombrie
<!-- categorie: plati -->

## Pentru echipă

- **Facturi pentru clienți din străinătate:** pe cazierjudiciaronline.com, la pasul de facturare, țara se alege acum PRIMA. Dacă nu e România, dispare câmpul de județ și localitatea se scrie liber. Înainte, clientul din Elveția rămânea cu județul completat din CNP (de exemplu Bacău), iar factura ieșea „Lugano, Bacău, Elveția”.
- Pe eghiseul.ro, regiunea scrisă de clientul străin (de exemplu „Lombardia”) trece acum în localitate, nu în județ. O factură pentru un client din Italia (EGH-0625, septembrie) a plecat la ANAF cu țara România din cauza asta.
- **Decontările din septembrie și octombrie sunt verificate.** Toate payout-urile Stripe se regăsesc pe extrasul de bancă, cu aceeași sumă. Toate plățile cu cardul au factură. Extrasul din octombrie e importat complet, o singură dată.
- **Client care a plătit de două ori 89 lei** (extras CF, 22 și 23.10): al doilea transfer e folosit pentru comanda lui nouă, care e acum plătită și facturată. Nota e pe ambele comenzi.
- **Disputa bancară de 79,99 lei (extras CF din iulie), pierdută la bancă:** decizie, factura rămâne, nu se face storno, iar clientul are credit pentru un extras CF. Rândul din decontări scrie asta în loc de „se emite storno”.
- Facturile vechi emise cu județ greșit pe țară străină nu se corectează; problema e reparată pentru facturile noi.
- La o proformă Oblio plătită cu cardul, rândul din decontări arată „Proformă Oblio EGIP …”, iar factura e în coloana Factură (de exemplu EGIP 0323 → EGI2024-24340).

---

## Tehnic

- **CJO** (`1a39e12d`): `Step6Payment.tsx`: țara primul câmp; pentru țară ≠ România, fără `JudetSelect`/`CityInput`, localitate text liber, `county` trimis gol, validarea de județ doar pentru România. `src/lib/oblio/address.ts`: `state: '-'` mereu la client străin. Test nou în `tests/unit/oblio-address.test.ts`.
- **eghiseul**: `resolveInvoiceAddress` (`src/lib/oblio/address.ts`) trimite `state: '-'` la client străin, iar regiunea intră în localitate („Stezzano, Lombardia”). Testele `address`, `build-client`, `invoice` sunt actualizate.
- **Verificarea e-Factura, live pe 02.11:** 49 de facturi eghiseul și 18 CJO cu țară străină din 01.08 trec exportul SPV.
  - EGH-0625 are `RO/RO-CT` în XML pentru un client din Italia.
  - Pe CJO, `CountrySubentity` iese „IT-DJ”, „CH-BC” (județ românesc pe țară străină).
  - EGH-0583 era marcată `blocked` (02.09). Acum trece: a fost corectată în Oblio, iar statusul din DB era vechi.
  - Facturile deja emise nu se modifică automat.
- **Decontări:** `stripe_payouts` față de `bank_statement_entries` pe 09 și 10: 22/22 + 22/22 potrivite la ban. Intrarea în bancă e cu o zi lucrătoare înainte de `arrival_date`. 172 de rânduri charge/payment în octombrie, 172 de facturi distincte. Ce nu are factură e intenționat: dispută, comision dispută 100 lei, rambursări 70% fără factură inițială.
- **Dispută `EGI2024-24278` (79,99 lei):** Stripe o raportează `lost`. Decizia lui Raul (02.11): fără storno, clientul are credit pentru un extras CF. `DISPUTE_DECISIONS` în `src/lib/accounting/disputes.ts` (cheie = charge id) înlocuiește textul implicit „se emite storno” la următorul sync.
