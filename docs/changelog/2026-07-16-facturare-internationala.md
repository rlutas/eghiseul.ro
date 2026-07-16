# 2026-07-16 — Facturare pe orice țară (Oblio, clienți străini)

**Problema:** wizardul forța date de facturare românești (dropdown județ/localitate RO, CNP obligatoriu, `country: 'Romania'` hardcodat). Dovadă: 13/13 comenzi plătite cu livrare în străinătate (120 zile) au facturi pe adrese RO improvizate; clienții fără CNP/adresă RO se blocau complet. Pe WordPress mergea (WP-199959, „Perugia, Italia").

**Documentare Oblio (docs + FAQ oficial):** `country` text liber; `state` (județ) text liber pentru străini sau „-"; CNP nu e cerut (e-Factura/SPV pune 13 zerouri); cod fiscal firmă străină acceptat cu avertisment.

## Livrat

- **`billing-step.tsx`**: checkbox „Adresa de facturare este în afara României" la PF (`self`+`other_pf`) → SearchableSelect țară (listă mondială, fără România) + localitate/regiune text liber + cod poștal alfanumeric; CNP devine opțional. Mod străin derivat din `billing.country` → draft restore re-bifează automat. Erori `data-wizard-error` (scroll automat). Toggle bifat fără țară aleasă NU validează.
- **`billing-validation.ts`**: `isForeignBillingCountry()` (normalizare diacritice) + `isPfBillingComplete` country-aware (străin → CNP/county opționale; address+city+country obligatorii).
- **`invoice.ts`** (`buildOblioClient` PF): `state` → „-" fallback la străin (guard-ul `getMissingInvoiceClientFields` trece nemodificat); **fix corectitudine**: la țară străină fără CNP pe billing, `cif` nu mai moștenește CNP-ul cumpărătorului din KYC.
- **Admin** `orders/[id]`: card Facturare afișează „Țară" + label „Regiune" la facturi străine.
- **`auto-generate.ts`**: adresa de facturare din contracte include țara.
- **TVA 21% / RON / RO neatinse** (decizie: B2C la sediul prestatorului, fără taxare inversă/OSS). PJ străine (VIES) excluse — flux manual.

## Teste

13 teste noi în `billing-validation.test.ts` + `build-client.test.ts` (normalizare țară, complet fără CNP/county la străin, `state='-'`, no-CNP-inheritance, regresii domestice). Total suită: 1181/1181 ✅, tsc + eslint curate.

## Operațional

- Informare contabil: facturile PF externe poartă acum țara reală + județ „-"/regiune; TVA rămâne 21%.
- De verificat prima comandă reală cu țară străină: factura în Oblio + e-Factura fără blocaje.
