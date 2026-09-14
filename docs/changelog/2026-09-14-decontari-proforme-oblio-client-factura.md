# 14.09.2026 (partea a doua) — decontări: cele 3 payout-uri „nefacturate"

Raul a semnalat în `/admin/decontari` payout-uri cu facturi lipsă (ex.
`po_1U5E4N…` din 18.08, 25/26). Verificare pe toate cele 67 de payout-uri din
ultimele 95 de zile: **3 payout-uri, 3 tranzacții** fără factură. Două cauze
diferite.

## 1. Plăți prin link-ul de card al proformelor Oblio (2 rânduri, iunie)

`po_1Tlel5…` (25.06, 17/18) și `po_1Tjpss…` (22.06, 4/5). Ambele erau plăți
din era WordPress făcute prin butonul „Plătește cu cardul" de pe o proformă
Oblio (EGIP 0315 — 250 lei, EGIP 0313 — 50 lei). Facturile existau în Oblio
(EGI2024-24180, EGI2024-24150), dar sync-ul nu le găsea.

**Cauza.** Pasul `attachOblioProformaInvoices` căuta factura după **emailul
plătitorului din Stripe** + total. Cardul e des al altcuiva decât clientul
facturat: EGIP 0315 a fost plătită de pe `abuhouf01@…`, dar proforma și factura
sunt pe `yosef.sa99@…` (Abu Hof Fadi). Zero potriviri → „nefacturat" trei
luni. În plus, lista de facturi se lua doar din „ultimele 45 de zile" de la
momentul sync-ului, deci un payout de iunie re-sincronizat în septembrie n-avea
cum să-și găsească factura nici cu emailul corect.

**Fixul.** Sync-ul ia întâi **proforma** (după serie+număr din linia Checkout,
altfel după `id`-ul numeric din `metadata.orderId`), apoi caută factura după
**clientul proformei** (email, altfel nume) + total exact, în fereastra de 30
de zile de la data proformei. Potrivirea e în `pickInvoiceForProforma`
(`lib/accounting/extra-invoice-match.ts`, pură, 4 teste). Rândul afișează acum
clientul facturat, nu titularul cardului. Sync local rulat pe 95 de zile:
ambele payout-uri au ajuns 18/18 și 5/5.

## 2. Comandă CJO plătită, factură NEEMISĂ (1 rând, august) — ⚠️ de emis

`po_1U5E4N…` → `CJO-20260813-73785`, **270 lei**, PJ (TIE SERVICES
INTERNATIONAL SRL, CUI 15478497), plătită 13.08 07:32, finalizată 08:29.
Factura **nu există în Oblio** (verificat pe toate facturile din 1 august
încoace, plus nomenclatorul de clienți — firma nu a fost creată niciodată).
Singura comandă plătită fără factură de la cutover (8 iulie) încoace.

**De ce n-a reparat-o cron-ul.** Emiterea a picat în webhook (cauza inițială e
pierdută — logurile Vercel din 13.08 nu mai există; toate celelalte comenzi PJ
din perioadă, inclusiv cele fără localitate, s-au facturat). Sweep-ul orar din
`health-check` (CJO) devine eligibil abia la +30 min, dar filtra pe statusurile
„în lucru" — **fără `completed`**. Comanda a fost finalizată la 57 de minute de
la plată, deci la prima rulare eligibilă era deja invizibilă. Fereastra de 7
zile a închis definitiv subiectul.

**Fixul (CJO).** Sweep-ul de facturi acoperă acum și `completed` + `standby`,
pe 30 de zile în loc de 7. Sweep-ul Barou rămâne pe lista veche.

**Rămas de decis:** emiterea facturii de 270 lei pentru `CJO-20260813-73785`
— factură cu data de azi pentru o încasare din 13.08. Nu am emis-o automat.

## Fișiere

- `src/lib/accounting/payout-sync.ts` — pasul proformă → client → factură
- `src/lib/accounting/extra-invoice-match.ts` — `pickInvoiceForProforma`
- `tests/unit/lib/accounting/extra-invoice-match.test.ts`
- CJO: `src/app/api/cron/health-check/route.ts`
