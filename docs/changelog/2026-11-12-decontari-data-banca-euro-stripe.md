# 12.11.2026 — Decontări: luna din extras, contul în euro, factura Stripe
<!-- categorie: plati -->

## Pentru echipă

**Decontarea din ultima zi a lunii.** Decontarea Stripe de 1.143,42 lei a
intrat în bancă pe 30.10, dar în admin apărea la noiembrie, pentru că Stripe
anunța sosirea pe 02.11. De acum decontările se pun în luna din **extrasul de
bancă**. Coloana se numește „Data în bancă”; unde extrasul nu e importat încă,
scrie „estimat”. Exportul CSV pentru contabil folosește aceeași dată.

**Extrasul contului în euro.** Se poate importa din „Extras bancă”, ca cel în
lei. Plătitorii din străinătate apar ca „Încasare client”, cu suma în euro și
echivalentul în lei, și se leagă singuri de comandă când au trecut numărul
comenzii sau când la „Confirmă plata” ați scris referința tranzacției. Nu mai
trebuie notat de mână pe extras cine a plătit.

**Factura Stripe.** În „Facturi furnizori” apare acum și Stripe, în fiecare
lună, cu suma comisioanelor. Factura lor vine în jurul datei de 7 a lunii
următoare, în dashboard.stripe.com → Settings → Documents.

Proceduri: [Decontări: cum citești liniile](../admin/decontari-cum-citesti.md),
[Facturi furnizori](../admin/facturi-furnizori-contabil.md).

---

## Tehnic

- `src/lib/accounting/payout-month.ts`: `payoutAccountingDate()` (data liniei
  de extras → ziua creării payout-ului, ora României → `arrival_date`) și
  `loadPayoutsByAccountingDate()`. Folosit de `/api/admin/decontari`, de
  export și de checklistul de furnizori. Pe payout-urile verificate, banca
  creditează în ziua creării; `arrival_date` e cu o zi lucrătoare mai târziu.
- `bank-statement.ts`: `accountCurrency()` (din IBAN-ul BT), `ronEquivalent()`
  („CURS … ECHIVALENT LEI …”), `hasPayerIban()` cu IBAN străin ca segment
  întreg; potrivirea pe sumă la liniile în valută compară echivalentul în lei
  cu totalul comenzii, cu toleranță de 1 leu. Fără schimbare de schemă:
  `debit_bani` / `credit_bani` țin subunitatea monedei contului.
- `banca/route.ts` + pagina: `currency`, `ron_equivalent_bani`, totaluri pe
  categorie și monedă.
- `supplier-invoices.ts`: `stripeFeeGroup()`; ruta calculează comisioanele pe
  lună din `stripe_payout_transactions.fee_bani`.
- Teste: `payout-month.test.ts`, `bank-statement-euro.test.ts`,
  `supplier-invoices.test.ts`.

**Reconciliere verificată** (decontări Stripe vs linii Stripe din extras):
septembrie 22 = 22, 52.436,20 lei; octombrie 22 = 22, 47.844,86 lei; diferență
zero, nicio linie nelegată. Cu gruparea nouă, septembrie câștigă și el o
decontare (3.001,74 lei, în bancă pe 30.09, la Stripe pe 01.10). Comisioane
Stripe pe octombrie: 1.129,54 lei.

**Extrasul în euro pe octombrie** are două încasări: una cu numărul comenzii în
text, una fără. Ambele comenzi au referința tranzacției trecută la confirmare,
deci se leagă la import.
