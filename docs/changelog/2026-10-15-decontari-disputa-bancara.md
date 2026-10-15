# 15.10.2026 — Decontări: disputele bancare apar cu clientul, factura și starea lor
<!-- categorie: plati -->

## Pentru echipă

- Contabilul a întrebat ce e linia de **−179,99 lei** din decontarea Stripe din **08.09**. Este o **dispută bancară** (chargeback): clientul a contestat la bancă plata de 79,99 lei din 02.07 pentru un extras CF (factura **EGI2024-24278**). Stripe a retras cei 79,99 lei și a reținut **100 lei comision** pentru dispută.
- **Am contestat disputa pe 15.10**, cu dovezile de livrare. Banca decide în până la 3 luni (Stripe estimează până pe 13.01.2027). Dacă o câștigăm, banii revin; dacă o pierdem, se emite **storno de −79,99 lei** pe factura inițială.
- **De acum, în Decontări**, orice linie de dispută are eticheta galbenă **„Dispută bancară”** și arată:
  - clientul și factura inițială;
  - suma retrasă și comisionul Stripe;
  - starea disputei, actualizată la fiecare sincronizare: „deschisă”, „contestată de noi, așteptăm decizia băncii”, „câștigată” sau „pierdută”.
- Același text apare și în exportul CSV pentru contabil.
- **Regula pentru contabilitate:** storno se face doar pentru suma plătită de client și doar după ce disputa e pierdută. **Comisionul Stripe de 100 lei e cheltuială** și nu se trece pe factura clientului.

---

## Tehnic

- `src/lib/accounting/disputes.ts`: `refreshDisputeRows()` rulează la finalul fiecărui `syncPayouts()` pe TOATE rândurile de dispută salvate, nu doar pe fereastra sync-ului, pentru că o dispută se decide la luni după payout. Rândurile se recunosc după `raw.reporting_category` (`dispute`, `dispute_reversal`), descrierea „Chargeback…” sau taxele „Card Dispute … Fee”. Charge-ul vine din descriere („Chargeback withdrawal for ch_…/py_…”), starea din `stripe.disputes.list({ charge })`, iar clientul și factura din rândul încasării inițiale. Se scriu `description`, `charge_id`, client, comandă și platformă.
- UI: `/admin/decontari/[payoutId]` afișează eticheta „Dispută bancară” cu textul complet, iar coloana factură arată „vezi dispută” în loc de „nefacturat”.
- Disputa `du_1UC9voHGb8JBHhclAT55CWaV` a fost contestată din dashboard pe 15.10.2026, cu un PDF de dovezi (comanda, emailul de livrare, răspunsul clientului, capturi cu cele două servicii) și factura.
- Teste: `tests/unit/lib/accounting/disputes.test.ts` (8).
