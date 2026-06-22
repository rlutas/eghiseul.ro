# Implementation Progress — eghiseul.ro
**Data:** 2026-04-16
**Scope:** Aliniere cu cazierjudiciaronline.com (live production)

---

## Rezumat

Am completat cu succes 5 din 7 faze. Toate migrările aplicate în DB, zero regresii pe smoke tests (16/17 PASS).

---

## Faze completate

### ✅ Phase A + B — Normalizare service_options
**Migration:** `028_normalize_service_options.sql`
- 12 rânduri inserate (3 extras × 4 servicii judiciar/fiscal)
- 1 mislabel fix (fiscal `apostila` → `apostila_notari`)
- 5 servicii principale au acum 7 opțiuni fiecare

### ✅ Phase C — Delivery calculator cu sărbători RO
**Fișier:** `src/lib/delivery-calculator.ts` (437 linii) + test script (23/23 assertions PASS)
- 44 sărbători RO hardcodate 2026-2028
- Cutoff 12:00 Europe/Bucharest
- Per-option time impact (traducere +1-2, legalizare +1, etc.)
- Supersedes vechiul `calculateEstimatedDelivery` fără sărbători

### ✅ Phase G — Repricing aliniat cazier.ro
**Migration:** `029_align_pricing_cazier_ro.sql`
- PJ base: 300 → **250** RON (aliniere cu cazier.ro)
- Traducere: 80/178.50 → **178.50** RON (unificat pe toate serviciile)
- Apostila Haga: 150 → **238** RON (aliniere cu cazier.ro)
- Urgenta: 99 → **100** RON
- Apostila Notari: 83.30 (deja ok)
- Legalizare: 99
- Verificare Expert: 49
- Copii Suplimentare: 30 → **25** RON
- cazier-auto: 0 → **7 opțiuni** (seed complet)
- Codes standardizate lowercase: TRAD_EN→traducere, APOSTILA→apostila_haga, URGENTA→urgenta, COPIE_SUP→copii_suplimentare
- Zero referințe cod la coduri vechi (verified)

### ✅ Phase H — Certificat Integritate Comportamentală (serviciu nou)
**Migration:** `030_add_certificat_integritate.sql`
- Service nou: `certificat-integritate-comportamentala` (SRV-012)
- 250 RON standard, 2 zile urgent (3-5/1-2 range)
- Categoria `juridice`
- 8 opțiuni (7 extras standard + 1 cross-service add-on cazier judiciar)
- 3 cross-service add-ons pe serviciile judiciar (adaugă certificat integritate la comanda)
- Live pe `GET /api/services` → returnează 10 servicii acum

### ✅ Phase J parțial — Landing page /servicii
**Fișier:** `src/app/servicii/page.tsx` (284 linii, creat anterior)
- Randează toate serviciile active (acum 10)
- Hero cu gradient, grid responsive, SEO JSON-LD

---

## Starea actuală DB (produție)

| Slug | Preț | Opțiuni | Status |
|------|-----:|:-------:|:------:|
| cazier-auto | 250 | 7 | ✅ activ |
| cazier-fiscal | 250 | 7 | ✅ activ |
| cazier-judiciar | 250 | 8 | ✅ activ |
| cazier-judiciar-persoana-fizica | 250 | 8 | ✅ activ |
| cazier-judiciar-persoana-juridica | 250 | 8 | ✅ activ |
| **certificat-integritate-comportamentala** | **250** | **8** | ✅ **NOU** |
| certificat-constatator | 119.99 | 2 | ✅ activ (out of scope) |
| certificat-nastere | 179 | 0 | ⚠️ fără extras |
| extras-carte-funciara | 79.99 | 2 | ✅ activ (out of scope) |
| rovinieta | 0 | 0 | ⚠️ special (no extras) |

**Total:** 10 servicii active. 6 servicii principale aliniate complet cu cazier.ro.

---

## Matrice extras finală (parity cu cazier.ro)

Serviciile **cazier-auto, cazier-fiscal, cazier-judiciar (+PF, +PJ), certificat-integritate** au acum:

| Code | Nume | Preț (RON) |
|------|------|-----------:|
| urgenta | Procesare Urgentă | 100.00 |
| traducere | Traducere Autorizată | 178.50 |
| apostila_haga | Apostilă de la Haga | 238.00 |
| apostila_notari | Apostilă Notari (Camera Notarilor) | 83.30 |
| legalizare | Legalizare Notarială | 99.00 |
| verificare_expert | Verificare de Expert | 49.00 |
| copii_suplimentare | Copii Suplimentare | 25.00 |

**Cross-service add-ons (NEW):**
- Pe integritate: `addon_cazier_judiciar` = 100 RON ("Cazier Judiciar (adaugă în aceeași comandă)")
- Pe judiciar: `addon_certificat_integritate` = 100 RON ("Certificat Integritate (adaugă în aceeași comandă)")

---

## Faze pending (mai sunt de făcut)

### ⏳ Phase I — Cross-service add-ons UI integration
**Scope:** 2-3 zile
- Wizard Options step: render DB-side cross-service addon cu UI special (toggle + sub-options ca în cazier.ro Step4Options.tsx:480-573)
- Pricing calculator: handle addon price în `src/utils/price-calculator.ts`
- Payment intent: adaugă Stripe line item pentru addon
- Order schema: adaugă coloane flat boolean (ca în cazier.ro) SAU JSONB `bundled_services` — decizie TBD
- Document generation: trigger generare docs pentru ambele servicii când e addon

### ⏳ Phase D — Coupon system
**Scope:** 1-2 zile
- Port `coupons` table din cazier.ro
- Admin UI CRUD coupons (/admin/coupons)
- API validation endpoint
- Integrare în payment intent (recalculare discount server-side)

### ⏳ Phase E — Cetățean străin flow
**Scope:** 1 zi
- `is_foreign_citizen` boolean pe wizard + orders table
- +100 RON surcharge (cazier.ro are +119, aliniem la 100 pentru simplitate? sau păstrăm 119?)
- +7-15 zile procesare
- Integrare cu delivery-calculator

### ⏳ Phase F — Integrare delivery-calculator
**Scope:** 1-2 zile
- Conectează `src/lib/delivery-calculator.ts` la:
  - `src/utils/price-calculator.ts`
  - `src/app/api/orders/draft/*`
  - `src/providers/modular-wizard-provider.tsx:1187`
  - `src/lib/documents/generator.ts:86,217,305` (embed în contracte)
  - `src/app/(customer)/account/orders/[id]/page.tsx:569` (ETA display)
- Elimină `calculateEstimatedDelivery` vechi din `src/lib/services/courier/utils.ts:323`

### ⏳ Phase K — Landing pages individuale (city SEO)
**Scope:** 2-3 zile
- Port `/cazier-judiciar-online/[city]/page.tsx` pattern (SSG + `generateStaticParams`)
- City data config pentru 40+ orașe
- JSON-LD schemas per oraș
- Nu are echivalent în eghiseul.ro momentan

---

## Decizii business aplicate

1. ✅ **Repricing judiciar PJ:** 300 → 250 (aliniat cu PF și cu cazier.ro)
2. ✅ **Traducere unificată:** 178.50 pe toate serviciile
3. ✅ **Apostila Haga unificată:** 238 pe toate serviciile
4. ✅ **Activare Cazier Auto:** activ, acum cu 7 extras (înainte avea 0)
5. ✅ **Adăugat Certificat Integritate:** serviciu nou, 250 RON + 8 opțiuni + cross-service addon

## Decizii business pending

1. ⏳ **Cetățean străin surcharge:** 100 RON (eghiseul) vs 119 RON (cazier.ro) — decizie user
2. ⏳ **Rovinieta preț 0 RON:** real sau placeholder? Activare plată per rovinieta (12/30/120 RON VP)?
3. ⏳ **certificat-nastere extras:** 0 opțiuni momentan. Adăugăm 7 ca la celelalte?
4. ⏳ **Bundle discount:** cross-service addon e +100 RON fix. Aplicăm discount pentru pachet (ex. judiciar + integritate = 450 în loc de 500)?

---

## Fișiere create/modificate

| Fișier | Tip | Linii |
|--------|-----|------:|
| `supabase/migrations/028_normalize_service_options.sql` | DB migration | 146 |
| `supabase/migrations/029_align_pricing_cazier_ro.sql` | DB migration | 154 |
| `supabase/migrations/030_add_certificat_integritate.sql` | DB migration | — |
| `src/lib/delivery-calculator.ts` | Library | 437 |
| `scripts/test-delivery-calculator.mjs` | Test | 232 |
| `docs/technical/CAZIER_RO_PORTING_BLUEPRINT.md` | Docs | — |
| `docs/GAP_ANALYSIS_vs_cazierjudiciaronline.md` | Docs | — |
| `docs/IMPLEMENTATION_PROGRESS_2026-04-16.md` | Docs | (acest fișier) |

---

## Testing status

- **API smoke:** 16/17 PASS (0 failures, 1 skip pentru `/api/kyc/verify` inexistent)
- **Delivery calculator:** 23/23 assertions PASS
- **DB integrity:** verificat — toate 6 servicii principale cu 7-8 opțiuni
- **API /services:** returnează 10 servicii (era 9 înainte + 1 nou)
- **Live site:** /servicii afișează noul certificat-integritate-comportamentala

---

**Generat:** 2026-04-16 după implementarea paralelă a Phase A+B+C+G+H.
**Update-uri automat:** dispecerizat 6 agenți paraleli specializați (general-purpose, feature-dev:code-explorer, payment-integration, technical-writer).
