# Parity Matrix — eghiseul.ro vs cazierjudiciaronline.com

**Sursă referință:** `/Users/raul/Projects/cazierjudiciaronline.com/docs/admin/*` (4 fișiere, 996 linii)
**Data audit:** 2026-05-27
**Scop:** ghid pentru aducerea adminului eghiseul.ro la paritate cu sister project, + features EXTRA (umbrella platform).

## Filozofie

- **Sister projects** (`cazierjudiciaronline.com`, `ecazier.ro`) sunt single-tenant per service type, optimizate strâns pe cazier judiciar/fiscal/auto/integritate. Folosesc flag-uri boolean explicite pe order row (`order.traducere`, `order.apostila_haga`, etc.).
- **eghiseul.ro** este **umbrella platform** — un singur codebase care găzduiește catalog multi-service generic. JSONB `selected_options` permite adăugarea de servicii noi (extras carte funciară, certificat constatator, etc.) fără migrations + cod per addon.
- **Customer journey identic** cu sister projects (paritate vizuală + UX + termen + facturare). Implementare internă diferită ca model de date.

## Paritate atinsă (2026-05-27 sesiune)

| Feature | Status | Cod |
|---------|--------|-----|
| Sticky order summary nested (main + secondary services + addons indent) | ✅ | `src/components/orders/order-sidebar.tsx`, `src/components/payment/OrderSummaryCard.tsx` |
| Delivery time per-step real (urgenta + traducere + legalizare + apostila*) | ✅ | `src/lib/delivery-calculator.ts` `estimateFromSelectedOptions` |
| Suffix marketing strip „(adaugă în aceeași comandă)" | ✅ | `src/lib/orders/normalize.ts` `stripSecondaryServiceSuffix` |
| Admin order detail grouped services + real estimate | ✅ | `src/app/admin/orders/[id]/page.tsx` |
| Bundled options matching parent (synthetic optionId) | ✅ | `src/components/orders/steps-modular/options-step.tsx` `isBundledSelected` |
| Apostila Haga preț aliniat (238 → 198) | ✅ | migration 040 |
| Oblio invoice line items per addon + coupon discount line | ✅ | `src/lib/oblio/invoice.ts` |
| Contract DOCX `{{SERVICII_DETALIATE}}` + `{{TERMEN_LIVRARE_DETALIAT}}` | ✅ | `src/lib/documents/generator.ts` |
| Success page services unified rendering | ✅ | `src/app/comanda/success/[orderId]/page.tsx` |
| Status page strip suffix din nume opțiuni | ✅ | `src/app/comanda/status/page.tsx` |
| **Auto-abandon pending > 30 min → abandoned** | ✅ | `src/app/api/cron/auto-abandon/route.ts`, migration 041 |
| **Recovery email + cupon auto-generat** (10% / 48h / single-use) | ✅ | `src/app/api/cron/recovery-emails/route.ts`, `src/lib/email/resend.ts`, `src/lib/email/templates/abandoned-recovery.ts` |
| **Tab Abandonate** + status badge nou | ✅ | `src/app/admin/orders/page.tsx`, `src/app/api/admin/orders/list/route.ts` |
| **Sandbox/test filter** (`is_test` column + query params) | ✅ | migration 041, payment route stamps is_test, list endpoint filter |
| **Note Echipă endpoint** (separat de tranziții) | ✅ (endpoint) | `src/app/api/admin/orders/[id]/notes/route.ts` — UI card TODO |
| **Admin dashboard: Coșuri abandonate funnel** (4 tile-uri) | ✅ | `src/app/admin/page.tsx` + `/api/admin/dashboard/stats` |
| **Admin dashboard: Distribuție pe status** (bar chart) | ✅ | idem |
| **Admin dashboard: Servicii (luna curentă)** (bar chart count + revenue) | ✅ | idem |
| **Buton Modifică comandă plătită** (refund auto / plată extra) | ✅ | `src/app/api/admin/orders/[id]/modify/route.ts`, `src/lib/orders/modify-diff.ts`, `src/components/admin/modify-order-dialog.tsx`, migration 042 |
| **Email plată extra** Resend template | ✅ | `src/lib/email/templates/extra-payment.ts` (HTML + text + XSS escape) |
| **Health-check cron** paid fără factură + Slack | ✅ | `src/app/api/cron/invoice-health-check/route.ts` |
| **Storno + Reemite factură Oblio** | ✅ (behind `OBLIO_REISSUE_ENABLED` flag) | `src/app/api/admin/orders/[id]/reissue-invoice/route.ts` + `src/lib/oblio/parse-number.ts` |
| **Admin shell port** (dark slate-900 sidebar + Abandonuri nav) | ✅ | `src/app/admin/layout.tsx` |
| **Orders list tabs port** (Toate/Plătite/Procesare/Expediate/Finalizate/Abandonate + counts) | ✅ | `src/app/admin/orders/page.tsx` + `src/lib/admin/orders-tabs.ts` |
| **Sandbox chips** (Ascunse/Doar test/Toate cu badge count) | ✅ | `src/app/admin/orders/page.tsx` |
| **Service filter dropdown** + Reset filtre | ✅ | `src/app/admin/orders/page.tsx` |
| **`/api/admin/orders/counts`** head-only count() per tab | ✅ | `src/app/api/admin/orders/counts/route.ts` |
| **30-min client self-cancel** (timer + endpoint + email 70% refund policy) | ✅ | `src/app/api/orders/cancel/route.ts` + `src/components/orders/self-cancel-card.tsx` |
| **Status PATCH liber** (admin escape hatch + mandatory note + audit) | ✅ | `src/app/api/admin/orders/[id]/status/route.ts` + `src/components/admin/status-override-dialog.tsx` |
| **Standby (SLA pauzat)** + estimated_completion_date shift | ✅ | `src/lib/orders/standby.ts` + migration 043 |
| **Cancellation banner + Refund 70% button** on admin order detail | ✅ | `src/app/api/admin/orders/[id]/process-cancellation/route.ts` + inline `CancellationRequestedBanner` |
| **Add services în Modify dialog** (full catalog, not just existing options) | ✅ | `src/app/api/admin/orders/[id]/available-options/route.ts` + `modify-order-dialog.tsx` |
| **Note Echipă UI card** (Cmd+Enter, filters system-*) | ✅ | inline `NoteEchipaCard` în `src/app/admin/orders/[id]/page.tsx` |
| **Update Status inline card** (dropdown + notă opțională + buton, înlocuiește dialog) | ✅ | `src/components/admin/update-status-card.tsx` + `src/lib/admin/status-options.ts` |
| **Layout admin order detail** (ROW 1 stacked Contact+Personal / Serviciu+Livrare; AWB embed în Livrare; Docs full-width grid responsive; Contract + Facturare cards stil sister; Plata full-width) | ✅ | `src/app/admin/orders/[id]/page.tsx` |
| **Contract semnat card** (Semnat / Data / IP / Browser / SHA-256 PDF) | ✅ | inline `ContractSignedCard` |
| **Facturare card** stil sister + slot Nr. factură Oblio cu link | ✅ | inline în `src/app/admin/orders/[id]/page.tsx` |
| **KYC merged în Documente card** (OCR % + Match % inline pe fiecare poză) | ✅ | inline `extractKycByDocType` + `ClientDocumentCard` |

## Paritate de atins (priorizat după impact business)

### 🔴 P0 — Operațional critic (echipa pierde timp / risc legal)

1. ~~**Buton „Modifică" comandă plătită**~~ ✅ **GATA + email** (2026-05-27 PM) — refund auto + plată extra via PaymentIntent + email Resend cu link. Vezi `docs/admin/modify-order.md`. Limitare rămasă: curier swap incomplet (delivery_method JSONB doar `deliveryPrice`).
2. ~~**Storno + Reemite factură Oblio**~~ ✅ **GATA** (2026-05-27 PM, behind feature flag) — endpoint `/api/admin/orders/[id]/reissue-invoice` cu Oblio `/docs/cancel` + emitere corectivă, UI button cu confirm pe order detail. Feature-flag `OBLIO_REISSUE_ENABLED=true` activează la cutover. Documents secundare (Cazier+Integritate combo) — vezi `docs/admin/secondary-service-documents.md` (Phase 2).
3. ~~**Health-check cron** „paid fără factură > 30 min"~~ ✅ **GATA** (2026-05-27 PM) — `/api/cron/invoice-health-check` rulează la 1h, alertă Slack când `SLACK_WEBHOOK_URL` setat.

### 🟡 P1 — Quality of life pentru echipă

4. ~~**Note Echipă** card separat~~ ✅ **GATA + UI** (2026-05-27 PM)
5. **Copy pentru Sheet** Google Sheets TSV (Sheet 1 clienți + Sheet 2 instituții)
   - **Sister:** 4 locuri (rând, header listă, dialog detalii, header order detail)
   - **Estimare:** 4 ore
6. ~~**Sandbox/test filter**~~ ✅ **GATA — schema + endpoint + chips UI** (2026-05-27 PM)
7. **Quick-picks motiv solicitare** la Step 1 (chip-uri 4 motive comune per service)
   - **Sister:** ANGAJARE, ALTE MOTIVE, etc. — 70% click instant
   - **Estimare:** 4 ore

### 🟢 P2 — Automation + delight

8. ~~**Auto-abandon** pending după 30 min + tab Abandonate~~ ✅ **GATA** (2026-05-27)
9. ~~**Recovery email** + cupon auto-generat~~ ✅ **GATA** (2026-05-27)
10. **Auto-finalizare după AWB** threshold per curier + overdue Slack
    - **Sister:** cron 04:00 zilnic; Sameday 5z, FAN 7z, DHL 14z, Poșta 30z
    - **Estimare:** 1 zi
11. **Localitate naștere dropdown sectoare București** + mismatch județ warning
    - **Sister:** dropdown 1-6 cu pre-select din CNP, avertisment colorat când localitate ≠ județ din CNP
    - **Estimare:** 1 zi
12. **Help card status-comandă** WhatsApp + Telefon
    - **Sister:** card verde fix sub status — primul touchpoint client
    - **Estimare:** 2 ore
13. **Tracking colet** centralizat `courier-tracking.ts` (URL per curier)
    - **Sister:** fan, dhl, posta, sameday — 4 curieri
    - **Estimare:** 2 ore

### Status workflow extins (de adoptat din sister)

Sister project folosește statusuri specifice cazier:
```
pending → paid → document_pregatit → depus_eliberare → eliberat_cazier
       → la_tradus → la_legalizat → eliberat_apostila_haga → la_apostila_notari
       → ridicat_curier → completed

Ramuri laterale: abandoned, refunded, cancellation_requested, standby (deadline pauzat)
```

Noi avem un workflow mai generic. Pentru paritate operațională, ar trebui adăugate statusurile granulare pentru documente cazier (de discutat cu echipa).

## Features EXTRA — umbrella platform (eghiseul.ro va avea, sister nu)

1. **Catalog multi-service config-driven** — `verification_config` JSONB pe `services` permite adăugarea de servicii noi (extras carte funciară, etc.) fără cod nou
2. **Wizard modular** — `src/lib/verification-modules/` cu module dinamice (personal-kyc, company-kyc, property, vehicle, signature, billing)
3. **Bundling cross-service** — `selectedOption.bundledFor` permite Certificat Integritate atașat la Cazier Judiciar într-o singură comandă (sister are doar bool flag `certificat_integritate`)
4. **OCR Gemini + face match KYC** — sister folosește manual entry pentru date personale
5. **Document generation pipeline** — docxtemplater + signature embedding (sister generează PDF prin alt sistem)
6. **Multi-payment-method** — card Stripe + transfer bancar cu validare manuală (sister doar card)
7. **Number registry** Barou — alocare numere contract avocat per order (sister are alt flow)

## Convenții împărtășite (cazier-specific)

Aceste convenții vin direct din sister project și NU trebuie reinventate:

- **Diacritice românești**: doar `ă, â, î, ș, ț` — `š`/`č`/`ž` NU EXISTĂ
- **Județ vs Localitate naștere**: CNP codifică DOAR județul (cifrele 7-8). Localitatea trebuie din OCR sau introdusă manual
- **Codul SIRUTA pentru București**: indică sectorul ÎNREGISTRĂRII actului, NU sectorul efectiv de naștere (poate diferi)
- **Stripe metadata cap**: 50 keys total, 40 chars per key, 500 chars per value
- **Stripe description cap**: 1000 chars
- **Holidays România 2026-2028**: deja în `src/lib/delivery-calculator.ts`, identice cu sister
- **Noon cutoff**: orderele după 12:00 RO încep procesare ziua următoare
- **Total real încasat = Plătit inițial + Plătit suplimentar − Refundat** (formula pentru banner-ul de încasări)

## Referințe complete

Citește acestea ORI DE CÂTE ORI vrei să implementezi o feature din lista de paritate:

- `/Users/raul/Projects/cazierjudiciaronline.com/docs/admin/orders.md` (270 linii)
- `/Users/raul/Projects/cazierjudiciaronline.com/docs/admin/dashboard.md` (104 linii)
- `/Users/raul/Projects/cazierjudiciaronline.com/docs/admin/modifica-comanda.md` (511 linii) — **cea mai detaliată; obligatorie înainte de buton Modifică**
- `/Users/raul/Projects/cazierjudiciaronline.com/docs/admin/coupons.md` (111 linii)
- `/Users/raul/Projects/cazierjudiciaronline.com/src/app/(admin)/admin/orders/[id]/page.tsx` (2062 linii — codul real)
- `/Users/raul/Projects/cazierjudiciaronline.com/src/lib/delivery-calculator.ts` (326 linii — deja portat în eghiseul cu modificări)
- `/Users/raul/Projects/cazierjudiciaronline.com/src/config/addons.ts` (50 linii — pricing addons)
