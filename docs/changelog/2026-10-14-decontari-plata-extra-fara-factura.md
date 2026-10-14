# 14.10.2026 — Decontări: plata extra fără factură nu mai apare cu factura comenzii
<!-- categorie: plati -->

## Pentru echipă

- Contabilul a întrebat de ce factura **EGH-0439** apare încasată și pe 19–20.08, și pe 07–08.09. Răspuns: pe comanda **E-260817-J2BXD** au fost **două plăți cu cardul**:
  1. **17.08: 1.546 lei**, comanda (extras multilingv + certificat de naștere + livrare). Factura EGH-0439, banii în decontarea din 20.08.
  2. **03.09: 200 lei**, plată extra din admin („Taxa amendă eliberare certificat naștere nou”). Pentru ea s-a emis doar **proforma PEGH-0008**, iar **factura fiscală nu s-a emis** (în istoricul comenzii scrie „FACTURA NEEMISĂ — verifică Oblio”). Banii au intrat în decontarea din 08.09.
- Decontările afișau greșit factura comenzii (EGH-0439) și pe plata de 200 lei. Acum o afișează ca **„plată extra, factură neemisă (proforma PEGH-0008)”**.
- **De făcut:** factura pentru cei 200 de lei trebuie emisă din proforma PEGH-0008 (în Oblio sau o emitem noi la cerere), cu data stabilită împreună cu contabilul.
- Când vedeți în istoricul unei comenzi „FACTURA NEEMISĂ”, anunțați: de azi cronul o reîncearcă singur, dar doar 14 zile.

---

## Tehnic

- `unbilledExtraForRow()` (`src/lib/accounting/extra-invoice-match.ts`): rând de payout al unei plăți extra (potrivit DOAR pe PaymentIntent) fără `invoice` în `extra_billing` → `invoice_number = null` + descriere cu proforma; folosit în ambele ramuri (eghiseul, CJO) din `payout-sync.ts`. Rândul primește `_unbilledExtra`, ca pasul „păstrează facturile atașate manual” să nu repună factura veche din DB (prima resincronizare a arătat exact asta). Înainte: fallback pe factura principală a comenzii. Teste în `extra-invoice-match.test.ts`.
- 🔴 `cron/invoice-health-check`: `ordersTable` era UN builder `supabase.from('orders')` refolosit; filtrele primei interogări (`payment_status=paid`, `invoice_number IS NULL`) se adunau tăcut la următoarele. Efecte: verificarea SPV nu a rulat niciodată (cerea și `invoice_number IS NOT NULL`), Barou și reemiterea facturilor extra vedeau doar comenzi fără factură principală. Acum `ordersTable()` = builder nou per interogare. Verificat înainte de deploy: 0 comenzi candidate la Barou, 0 facturi de reverificat în SPV.
