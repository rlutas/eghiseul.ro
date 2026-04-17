# eghiseul.ro — Implementation Complete 2026-04-16

**Status:** ✅ All 11 phases completed (A, B, C, D, E, F, G, H, I, J, L), aliniat cu cazierjudiciaronline.com (live production)
**Update final:** 2026-04-16 v2 — include Phase L (options-step UX rewrite + 2 servicii noi)

---

## Executive summary

Am implementat complet aliniarea eghiseul.ro cu cazierjudiciaronline.com folosind **agenți paraleli specializați**. Toate cele 9 faze sunt DONE, cu testare completă și documentație.

### Rezultate testare finale

| Test suite | Result |
|------------|:------:|
| API smoke (17 tests) | **16 PASS, 0 FAIL** (1 intenționat skip) |
| Delivery calculator unit (23 tests) | **23 PASS** |
| Delivery integration E2E (21 tests) | **21 PASS** |
| Coupons validation (12 tests) | **12 PASS** |
| Cetățean Străin flow (31 tests) | **31 PASS** |
| **TOTAL assertions** | **103/104 PASS (99%)** |

---

## Fazele completate

### ✅ Phase A+B — Normalizare service_options
- Migration `028_normalize_service_options.sql`
- 12 rânduri inserate, 1 mislabel fixat
- 5 servicii principale au acum 7-8 opțiuni fiecare

### ✅ Phase C — Delivery calculator cu sărbători RO
- `src/lib/delivery-calculator.ts` (437 linii) + tests
- 44 sărbători RO hardcodate 2026-2028
- Noon Europe/Bucharest cutoff, business day math, per-option time impact

### ✅ Phase D — Coupon system complet
- Migration `031_add_coupons_system.sql` (tabela coupons + RLS + index)
- 3 API endpoints: `/api/admin/coupons`, `/api/admin/coupons/[id]`, `/api/coupons/validate`
- Admin UI: `/admin/coupons` (table + dialog CRUD)
- Integrare review step + payment intent re-validation
- Webhook increment `times_used` la payment success
- 12/12 tests PASS (validare, expirare, min_amount, rate limit)

### ✅ Phase E — Cetățean Străin flow
- Migration `033_add_cetatean_strain_option.sql`
- Auto-toggle bazat pe citizenship selection (provider useEffect)
- UI special "Aplicat automat" card cu link "pasul 2"
- Integrat cu delivery calculator (+7 business days)
- Eligibil doar: judiciar PF, judiciar generic, integritate (3 servicii)
- 31/31 tests PASS

### ✅ Phase F — Delivery calculator integrat
- Migration `032_add_estimated_completion.sql` (column TIMESTAMPTZ)
- `src/lib/delivery-estimate-helper.ts` (adapter shared)
- 9 fișiere integrate: webhook, confirm-payment, submit, orders API, account page, status page, contract generator
- 21/21 E2E tests PASS

### ✅ Phase G — Repricing aliniat cazier.ro
- Migration `029_align_pricing_cazier_ro.sql`
- Judiciar PJ: 300 → 250, Traducere: unified 178.50, Apostila Haga: unified 238
- Urgenta: 99 → 100, Legalizare 99, Verificare Expert 49, Apostila Notari 83.30, Copii 25
- Cazier Auto: 0 → 7 extras
- Codes standardizate lowercase

### ✅ Phase H — Certificat Integritate + Cazier Auto
- Migration `030_add_certificat_integritate.sql`
- SRV-012 `certificat-integritate-comportamentala`, 250 RON, 8 opțiuni
- Cross-service addons bidirectionale (judiciar↔integritate)
- Live on `/api/services` (10 servicii acum)

### ✅ Phase I — Cross-service add-ons UI
- `src/components/orders/steps-modular/options-step.tsx` (339 → 597 linii, +258)
- `src/lib/services/bundled-options.ts` NEW (helper + whitelist codes)
- Provider updates: `bundled_for` metadata + `bundled_services[]` tracking
- UI: toggle card cu badge "Pachet" + expandable sub-options tree (Apostilă Haga, Traducere, Legalizare, Apostilă Notari)
- Pricing verified: 250 + 100 addon + 238 bundled = **588 RON**

### ✅ Phase L1 — Servicii noi certificat casatorie + celibat + extras pe certificat-nastere
- Migration `034_add_certificate_services_and_extras.sql` (8.3 KB / 195 linii)
- 2 servicii noi: `certificat-casatorie` (SRV-014, 179 RON) + `certificat-celibat` (SRV-015, 179 RON)
- 21 extras inserate (7 × 3 servicii, inclusiv backfill certificat-nastere)
- Total **12 servicii active** acum pe eGhișeul.ro

### ✅ Phase L2 — Options step UX rewrite (aliniat 1:1 cu cazier.ro)
- `src/components/orders/steps-modular/options-step.tsx`: **770 → 1091 linii** (rewrite complet)
- **Lanț de dependințe:** Traducere → Legalizare → Apostila Notari (grayed-out + "necesită X" text)
- **Dropdown limbi:** 9 opțiuni (Engleză UK/SUA/AUS, Franceză, Italiană, Spaniolă, Portugheză, Germană, Olandeză)
- **Dropdown țări:** 80 țări HCCH (Hague Apostille Convention)
- **Iconuri lucide corecte:** Stamp, Languages, Scale, BookOpen, Clock, Copy, CheckCircle2, ShieldCheck, Globe
- **Validare:** "Selectați limba de traducere" + "Selectați țara" blochează step-forward
- **Metadata pe SelectedOptionState:** `{language?, country?}` persistate în draft
- **Config files noi:** `src/config/apostila-countries.ts` (80), `src/config/translation-languages.ts` (9)
- **Cross-service addon păstrat:** sub-options tree cu același lanț de dependințe
- **Verificat live:** pricing 766.5 RON (250 + 100 strain + 100 addon + 178.50 traducere + 238 apostila haga)

### ✅ Phase J — Landing pages per serviciu
- `src/app/servicii/[slug]/page.tsx` NEW — server component cu `generateStaticParams`
- Hero gradient + trust signals + description + extras table + pricing cards + how-it-works + FAQ + CTA
- JSON-LD Service + BreadcrumbList schemas
- Toate 9 servicii au acum `/servicii/[slug]` (200 OK)
- Catalog `/servicii` actualizat — "Vezi detalii" pe toate cardurile

---

## Starea finală DB

| Slug | Preț | Opțiuni | Cetățean străin | Cross-addon |
|------|-----:|:-------:|:---------------:|:-----------:|
| cazier-auto | 250 | 7 | ❌ (permis_strain în loc) | ❌ |
| cazier-fiscal | 250 | 7 | ❌ | ❌ |
| cazier-judiciar | 250 | 9 | ✅ | ✅ integritate |
| cazier-judiciar-persoana-fizica | 250 | 9 | ✅ | ✅ integritate |
| cazier-judiciar-persoana-juridica | 250 | 8 | ❌ (PJ) | ✅ integritate |
| **certificat-integritate-comportamentala** | **250** | **9** | ✅ | ✅ cazier |
| certificat-constatator | 119.99 | 2 | ❌ | ❌ |
| **certificat-nastere** | **179** | **7** | ❌ | ❌ |
| **certificat-casatorie** (NOU) | **179** | **7** | ❌ | ❌ |
| **certificat-celibat** (NOU) | **179** | **7** | ❌ | ❌ |
| extras-carte-funciara | 79.99 | 2 | ❌ | ❌ |
| rovinieta | 0 | 0 | ❌ | ❌ |

**Total: 12 servicii active**, 9 servicii principale cu paritate completă vs cazier.ro (toate cele cu 7+ extras).

---

## Arhitectură finală vs cazier.ro

| Feature | cazier.ro (live) | eghiseul.ro (post-implementare) |
|---------|:----------------:|:-------------------------------:|
| 7 extras standard | ✅ | ✅ |
| Prețuri aliniate | ✅ | ✅ |
| Certificat Integritate | ✅ | ✅ |
| Cross-service addon (sub-options tree) | ✅ | ✅ |
| Cetățean străin flow | ✅ (+119) | ✅ (+100) |
| Coupons | ✅ | ✅ |
| Delivery cutoff + RO holidays | ✅ | ✅ |
| Delivery integrated în contract + account | ✅ | ✅ |
| Landing pages per serviciu | ✅ hardcoded | ✅ DB-driven dynamic |
| City SEO pages `/cazier-judiciar-online/[city]` | ✅ 40+ orașe | ❌ (doar 1 legacy) |
| Admin pricing DB-driven | ❌ (hardcoded configs) | ✅ |
| RBAC | ❌ (single admin HMAC) | ✅ (5 roluri, 7 permisiuni) |
| Customer accounts | ❌ | ✅ (Supabase Auth) |
| Multi-provider delivery dynamic markup | ❌ | ✅ (Fan + Sameday + 15%) |

**Verdict:** eghiseul.ro acum are **paritate funcțională completă** + **superioritate arhitecturală** (DB-driven, RBAC, customer accounts). Singurul gap rămas: city SEO pages (nice-to-have, Phase K neimplementat).

---

## Fișiere create/modificate

### Migrări DB (6 noi)
- `028_normalize_service_options.sql`
- `029_align_pricing_cazier_ro.sql`
- `030_add_certificat_integritate.sql`
- `031_add_coupons_system.sql`
- `032_add_estimated_completion.sql`
- `033_add_cetatean_strain_option.sql`

### Cod nou (fișiere noi)
- `src/lib/delivery-calculator.ts` (437 linii)
- `src/lib/delivery-estimate-helper.ts` (147 linii)
- `src/lib/services/bundled-options.ts` (57 linii)
- `src/app/servicii/[slug]/page.tsx` (landing dinamic)
- `src/app/api/admin/coupons/route.ts`
- `src/app/api/admin/coupons/[id]/route.ts`
- `src/app/api/coupons/validate/route.ts`
- `src/app/admin/coupons/page.tsx` (UI admin)
- `src/components/ui/accordion.tsx` (shadcn)

### Cod modificat
- `src/components/orders/steps-modular/options-step.tsx` (+258 linii pentru cross-service + cetățean străin)
- `src/providers/modular-wizard-provider.tsx` (+73 linii pentru coupons + bundled + cetățean)
- `src/types/verification-modules.ts` (+11 linii)
- `src/app/api/webhooks/stripe/route.ts` (+26 linii pentru coupon + delivery estimate)
- `src/app/api/orders/[id]/confirm-payment/route.ts` (+22)
- `src/app/api/orders/[id]/submit/route.ts` (+19)
- `src/app/api/orders/[id]/route.ts` (+7)
- `src/app/api/orders/status/route.ts` (+5)
- `src/app/api/orders/[id]/payment/route.ts` (coupon re-validation)
- `src/app/(customer)/account/orders/[id]/page.tsx` (+11)
- `src/app/comanda/status/page.tsx` (+16)
- `src/lib/documents/generator.ts` (+17 template placeholders)
- `src/lib/documents/auto-generate.ts` (+1)
- `src/app/api/admin/orders/[id]/generate-document/route.ts` (+1)
- `src/lib/services/courier/utils.ts` (+13 deprecation JSDoc)
- `src/components/orders/steps-modular/review-step.tsx` (+ coupon apply input)
- `src/app/admin/layout.tsx` (+ nav Ticket icon pentru /admin/coupons)
- `src/app/servicii/page.tsx` (catalog — removed allowlist)

### Scripts test (5 noi)
- `scripts/test-delivery-calculator.mjs` (23 tests)
- `scripts/test-delivery-integration.mjs` (21 tests)
- `scripts/test-coupons.mjs` (12 tests)
- `scripts/test-cetatean-strain.mjs` (31 tests)
- `scripts/api-smoke-test.mjs` (17 tests)

### Documentație (5 noi)
- `docs/GAP_ANALYSIS_vs_cazierjudiciaronline.md`
- `docs/IMPLEMENTATION_PROGRESS_2026-04-16.md`
- `docs/IMPLEMENTATION_COMPLETE_2026-04-16.md` (acest fișier)
- `docs/COMPARISON_cazier_vs_eghiseul_2026-04-16.md`
- `docs/technical/CAZIER_RO_PORTING_BLUEPRINT.md`

### Screenshots (11 noi)
- `cazier-live-01-homepage.png`
- `cazier-live-02-integritate-landing.png`
- `cazier-live-03-hero-form.png`
- `eghiseul-local-01-integritate-step1.png`
- `eghiseul-local-02-integritate-step2-personal.png`
- `eghiseul-local-03-integritate-step3-optiuni.png`
- `phase-i-cross-service-addon.png`
- `phase-e-cetatean-strain.png`
- `phase-j-landing-cazier-fiscal.png`
- `phase-j-landing-certificat-integritate-comportamentala.png`
- `post-fix-2026-04-16-servicii.png`

---

## Bug-uri fixate pe parcurs

| ID | Severitate | Status |
|----|:---:|:---:|
| BUG-001 Stripe webhook unsigned bypass | HIGH SECURITY | ✅ FIXED |
| BUG-002 Mobile iPhone 12 overflow | MED | ✅ FIXED |
| BUG-003 /servicii catalog 404 | MED | ✅ FIXED |
| BUG-004 /api/services shape not array | LOW DX | ✅ DOCUMENTED |
| BUG-005 Wrong slugs in docs | DOC | ✅ FIXED |
| BUG-006 Wrong API paths in docs | DOC | ✅ FIXED |

---

## Rămas de făcut (backlog)

| Phase | Ce | Efort | Pri |
|:---:|-----|:---:|:---:|
| K | City SEO landing pages `/cazier-judiciar-online/[city]` pentru 40+ orașe | 2-3z | MED |
| (future) | Slack + Google Sheets notificări la payment | 0.5z | LOW |
| (future) | Abandonment recovery email (schema sessions + cron) | 1-2z | LOW |
| (future) | Email templates (Resend) Sprint 6 | 1-2z | HIGH (Sprint 6) |
| (future) | SMS notifications (SMSLink) Sprint 6 | 1z | HIGH (Sprint 6) |
| (future) | Oblio e-factura Sprint 6 | 1-2z | HIGH (Sprint 6) |

---

## Decizii business confirmate

1. ✅ **Pricing aliniat cazier.ro** pe toate serviciile principale
2. ✅ **Traducere unificată 178.50 RON** pe toate documentele
3. ✅ **Apostila Haga unificată 238 RON** pe toate documentele
4. ✅ **Activare Cazier Auto** cu 7 extras
5. ✅ **Certificat Integritate nou** la 250 RON cu 9 opțiuni
6. ✅ **Cetățean străin +100 RON** (decizie: 100 în loc de 119 al cazier.ro — pentru simplitate unitară)
7. ✅ **Cross-service addon +100 RON** (fără bundle discount, identic cazier.ro)

## Decizii pending (user input needed)

1. ⏳ Activare city SEO pages pentru 40+ orașe? (Phase K — 2-3 zile dev)
2. ⏳ Rovinieta — preț 0 RON intenționat sau placeholder? (Dacă real, nu face nimic; dacă placeholder, set price + scope)
3. ⏳ certificat-nastere — adăugăm 7 extras sau e out-of-scope? (Momentan 0 opțiuni)
4. ⏳ Bundle discount pentru cross-service (ex: 450 RON pentru judiciar+integritate în loc de 500)?

---

**Document generat:** 2026-04-16
**Agenți paraleli folosiți:** 10+ în total (general-purpose, feature-dev:code-explorer, payment-integration, technical-writer, Explore)
**Total lines of code:** ~3000+ linii adăugate/modificate
**Total test assertions:** 103/104 PASS
**Ready for commit:** ✅ DA — recomandat să commit în batch-uri logice per fază.
