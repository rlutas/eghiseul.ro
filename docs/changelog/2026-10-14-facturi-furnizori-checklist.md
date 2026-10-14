# 14.10.2026 — Facturi furnizori pentru contabil: checklist lunar din extras
<!-- categorie: plati -->

## Pentru echipă

Facturile de la Meta (Facebook), Google, TikTok, OpenAI, Anthropic, Vercel și alți furnizori nu vin în SPV. Trebuie descărcate din contul furnizorului și duse la contabil, iar multe au fost uitate.

De azi există **Decontări → „Facturi furnizori”**:

- după importul extrasului, lista lunii se face singură: un rând pe furnizor, cu numărul de plăți și totalul;
- pe fiecare rând bifați **Descărcată → Listată → Predată contabil**. Se salvează cine a bifat și când;
- în stânga e istoricul lunilor (ex. `3/10`, sau „✓ complet”). Puteți reveni oricând la o lună veche să vedeți ce s-a predat și ce nu;
- cât timp o lună are furnizori nepredați, pe Decontări și Extras bancă apare o casetă galbenă.

Procedura: [Facturi furnizori pentru contabil](../admin/facturi-furnizori-contabil.md).

---

## Context

Lista roșie „Furnizori externi” din Extras bancă exista din iulie, dar doar ca listă de citit: nu se bifa nimic și nu se salva nimic. Mai grav, prindea doar plățile POS **în valută** (`needs_invoice` la import). Meta, Google Ads și TikTok taxează în RON, așa că în septembrie 22 de plăți Meta, 49 TikTok și Google Ads au căzut pe „Altele”.

## Ce s-a schimbat

- `src/lib/accounting/supplier-invoices.ts`: `SUPPLIER_RULES` (Meta, Google Ads, Google Cloud, TikTok, OpenAI, Anthropic, Vercel, Supabase, Railway, Resend, Zoho, Amazon), `supplierFor()` și `groupBySupplier()`. Furnizorul se calculează **la citire** din descriere, deci extrasele vechi intră fără reimport. Plățile POS în valută la comercianți necunoscuți se grupează după numele comerciantului (`pos:<NUME>`).
- Migrarea `195_supplier_invoice_checks.sql`: cheie `(month, supplier_key)`, coloane `downloaded/printed/handed_at/_by`, `note`. RLS activ, acces doar prin service role.
- `GET/POST /api/admin/decontari/facturi-furnizori` (`payments.verify`): istoric pe luni sau detaliu pe lună, plus bifă și notă (upsert).
- UI: `/admin/decontari/facturi-furnizori` și `SupplierInvoicesBanner` pe `/admin/decontari` și `/admin/decontari/banca`. Lista roșie veche a fost scoasă.
- `bank-statement.ts`: regulă nouă înaintea celei de valută. Furnizorii cunoscuți devin `furnizor_extern` + `needs_invoice` indiferent de monedă. 73 de linii existente au fost recategorisite din „altele”.
- Test: `tests/unit/lib/accounting/supplier-invoices.test.ts`.
- Reimport sigur: `importBankStatement` păstrează `matched_payout_id`/`matched_order_id` existente. Înainte, reimportul aceluiași extras scria `null` peste legăturile payout↔bancă, pentru că payout-urile deja legate nu mai erau candidate.

## La import (stare 14.10)

| Lună | Furnizori |
|---|---|
| iunie 2026 | 4 (Amazon 26 plăți, Anthropic, Vercel, Google Cloud) |
| iulie 2026 | 8 |
| august 2026 | 7 |
| septembrie 2026 | 10 (Meta 22, TikTok 49, OpenAI 8, Google Ads, Anthropic 2 …) |

Cifrele sunt fără DHL, care a fost scos din listă.

`Wallet payment from MyBil` (≈13.265 lei în iunie–septembrie) = **DHL Express** plătit prin MyBill. Factura DHL vine în SPV, deci nu intră în checklist: liniile sunt categorisite `curierat` („DHL Express (MyBill)”). Cabinetul de avocat, Delivery Solutions și ceilalți furnizori români plătiți prin OP trimit factura în SPV, deci rămân în afara listei.

## Bifele afișau numele avocatei pe contul de admin

Profilul contului comun de admin (`serviciiseonethut@`) avea `first_name/last_name` = numele avocatei, pus pe 17.09, cel mai probabil de sincronizarea comenzii plătite în cont (`sync-paid-order.ts` completează doar câmpurile goale). Numele a fost schimbat în „Admin eGhișeul”. Sincronizarea nu-l mai suprascrie, pentru că acum câmpul nu mai e gol.
