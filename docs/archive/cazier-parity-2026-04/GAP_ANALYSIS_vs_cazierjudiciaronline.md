# Gap Analysis — eghiseul.ro vs cazierjudiciaronline.com

**Data:** 2026-04-16
**Scope:** Servicii, prețuri, extras, livrare, admin control
**Surse:** Explorare automatizată cu 2 agenți paraleli Explore (medium thoroughness)

---

## 1. Arhitectură comparativă

| Aspect | **cazierjudiciaronline.com** | **eghiseul.ro** | Câștigător |
|--------|------------------------------|-----------------|------------|
| Source of truth prețuri | Hardcoded în `src/config/*.ts` | DB (`services` table) + admin API | eghiseul ✅ |
| Admin editare prețuri | ❌ Doar prin cod | ✅ PATCH `/api/admin/settings/services` | eghiseul ✅ |
| Extras (add-ons) | Global + hardcoded în config | DB `service_options` cu FK per serviciu | eghiseul ✅ |
| TVA afișare | "TVA inclus" în preț | 21% vizibil separat în sidebar | eghiseul ✅ |
| Coupons/discount | ✅ Tabelă + UI admin + API validare | ⚠️ Schema există, logica lipsește | cazier ✅ |
| Delivery cutoff logic | ✅ Noon Europe/Bucharest + sărbători 2026-28 | ❌ Nu există | cazier ✅ |
| International couriers | ✅ DHL Express, Poșta Română | ❌ Doar Fan + Sameday domestic | cazier ✅ |
| Dual-provider markup | ❌ Fixed per courier | ✅ 15% markup pe quote real | eghiseul ✅ |
| RBAC | ❌ Single admin | ✅ 5 roluri + 7 permisiuni | eghiseul ✅ |

**Verdict arhitectural:** eghiseul.ro e **platformă modernă**, cazierjudiciaronline.com e **configurabil-prin-cod**. eghiseul scalează mai bine, cazier iterează mai rapid.

---

## 2. Catalog servicii — comparare

### cazierjudiciaronline.com (4 servicii)

| Slug | Preț std | Preț urgent | Preț strain |
|------|---------:|------------:|------------:|
| cazier-judiciar | 250 RON (3-5 zile) | 350 RON (1-2 zile) | 350 RON (7-15 zile) |
| cazier-fiscal | 250 RON (1-3 zile) | — (fără urgență) | — |
| cazier-auto | 250 RON (1-3 zile) | — | 350 RON (permis străin) |
| certificat-integritate | 250 RON (3-5 zile) | 350 RON (1-2 zile) | 350 RON |

### eghiseul.ro (5 servicii active)

| Slug | Preț | Urgenta add-on | Zile | Zile urgent |
|------|-----:|---------------:|----:|------------:|
| cazier-fiscal | 250.00 RON | — | 5 | 2 |
| cazier-judiciar-persoana-fizica | 169.00 RON | +99 RON | 5 | 2 |
| cazier-judiciar-persoana-juridica | 199.00 RON | +99 RON | 7 | 3 |
| certificat-constatator | 119.99 RON | — | 5 | 2 |
| extras-carte-funciara | 79.99 RON | — | 5 | 2 |

### 🔴 Găsire critică: eghiseul subpricing pe cazier judiciar

| Serviciu | cazier.ro | eghiseul.ro | Diferență |
|----------|----------:|------------:|----------:|
| Cazier fiscal standard | 250 | 250 | = |
| Cazier judiciar PF standard | **250** | **169** | **-81 RON (-32%)** |
| Cazier judiciar PF urgent | 350 | 169+99 = **268** | **-82 RON (-23%)** |
| Cazier judiciar PJ | 250 | 199 | -51 RON (-20%) |

**Pierde ~80 RON per comandă de cazier judiciar PF.** La 100 comenzi/lună = 8.000 RON/lună potențial pierdut. Merită audit decizie de preț.

### 🔴 Serviciu lipsă în eghiseul
- **Certificat Integritate Comportamentală** (250/350 RON) — există în cazier, complet absent din eghiseul. Cerere reală există pe piață (angajări în medii sensibile).
- **Cazier auto** — există în DB eghiseul dar NU e activ (draft).

### ✅ Servicii unice eghiseul
- **Extras Carte Funciară** (79.99 RON) — categoria imobiliare, bun diferentiator
- **Certificat Constatator** ONRC (119.99 RON) — categoria comerciale

---

## 3. Extras / Options — comparare exhaustivă

### Matrice prețuri pentru extras comune

| Extra | cazier.ro | eghiseul.ro | Delta | Notă |
|-------|----------:|-------------|------:|------|
| Traducere autorizată | 178.50 | 178.50 (fiscal) / **80** (judiciar) | Inconsistent | eghiseul are prețuri diferite pe servicii — confuz |
| Apostila Haga | **238** | **150** (judiciar only) | -88 RON | eghiseul subpriced |
| Apostila Notari (camera notarilor) | 83.30 | 83.30 (fiscal) | = | identice |
| Legalizare | 99 | ❌ | lipsă | eghiseul nu oferă |
| Verificare expert | 49 | ❌ | lipsă | eghiseul nu oferă |
| Urgency surcharge | 100 | 99 | -1 RON | quasi-identic |
| Cetățean străin | 119 | ❌ | lipsă | eghiseul nu oferă — target market mai mic |
| Certificat integritate add-on | 150 | ❌ | lipsă | serviciu absent din eghiseul |
| Copie suplimentară | ❌ | 30 (25 fiscal) | eghiseul extra | unicitate eghiseul |
| Onorariu avocat | 15 (split din base) | ❌ (bakat în preț) | — | cazier are transparență mai mare pe factură |

### Extras livrare — comparare

| Metodă | cazier.ro | eghiseul.ro | Comentariu |
|--------|----------:|------------:|------------|
| Fan Courier | 25 RON fix | Dynamic (quote + 15% markup) | eghiseul mai corect cu distanța |
| Sameday Easybox | 30 RON fix | Dynamic (quote + 15% markup) | idem |
| Locker Sameday vs locker Fan | ambele fixe | ambele dinamice | — |
| **DHL Express international** | 200 RON | ❌ | lipsă eghiseul |
| **Poșta Română internațional** | 100 RON | ❌ | lipsă eghiseul |

**eghiseul.ro nu servește clienți internaționali prin livrare fizică** — doar email/download. cazier.ro are 2 opțiuni internaționale.

---

## 4. Delivery cutoff & calendar business days

### cazier.ro (MATUR)
Fișier `src/lib/delivery-calculator.ts` (316 linii):
- **Cutoff 12:00 Europe/Bucharest** — orders după noon începe next business day
- **Sărbători RO hardcodate 2026-2028** (Codul Muncii art. 139 + Legea 220/2023):
  - Anul Nou, Bobotează, Sf. Ion, 24 Ianuarie, Vinerea Mare, Paștele Ortodox (2 zile), 1 Mai, Rusalii (2 zile), Sf. Maria, Sf. Andrei, 1 Decembrie, Crăciun (2 zile)
- **Timpi per opțiune:** traducere +1-2 zile, legalizare +1, apostila +1
- **Timpi per courier:** DHL +1-3, Fan +1-3, Sameday +1, Poșta +7-15

### eghiseul.ro (GAP)
- ❌ Nu are cutoff noon
- ❌ Nu are sărbători hardcodate
- ⚠️ Are `calculate_estimated_completion()` PG function (migration 002) dar fără sărbători
- ⚠️ Business days skip weekend în `src/lib/services/courier/utils.ts:323-344`

**Impact:** eghiseul comunică timpi de livrare inexacți când comanda cade în preajma Paștelui / Crăciunului. Clienții reclamă → trust degradat.

---

## 5. Pricing engine — comparare

### cazier.ro: server-side in Stripe create-intent
**Fișier:** `src/app/api/stripe/create-payment-intent/route.ts` (432 linii)
- Subtotal = base + urgency + strain + options + courier
- Avocat fee 15 RON split din base → line item separat pe factură
- Coupon validation serverside: `is_active`, `times_used < max_uses`, `valid_from/until`, `min_amount`
- **Fiecare extra = Stripe line item separat** → factură clară

### eghiseul.ro: utility helper
**Fișier:** `src/utils/price-calculator.ts` (50 linii)
- Simplu: `basePrice + optionsTotal + deliveryPrice`
- Nu calculează TVA (afișat doar ca 21% inclus)
- Nu procesează discount

**Verdict:** cazier.ro are engine matur (coupon, line items separate, split avocat). eghiseul.ro e minimalist.

---

## 6. Ce merită portat din cazier → eghiseul

### 🔴 HIGH priority (câștig direct)

1. **Delivery calculator cu cutoff + sărbători** — portare `src/lib/delivery-calculator.ts` (316 linii cazier) → adaptare la eghiseul. **Impact:** timpi accurate, reduce plângeri post-sărbători.

2. **Coupon system implementare** — schema deja există în eghiseul (discount_amount, discount_type), lipsește doar UI + API validare. Port `src/app/(admin)/admin/coupons/page.tsx` + route handlers. **Impact:** marketing capability.

3. **Repricing cazier judiciar PF** — audit decizie business: creștere de la 169 → 220-250 RON (aliniere piață). **Impact financiar direct:** +50-80 RON/comandă.

### 🟡 MEDIUM priority (extinde catalog)

4. **Certificat Integritate Comportamentală** — adăugare ca serviciu nou (target: HR, angajări, voluntariat copii). DB migration + detail page + wizard config.

5. **Cetățean străin flow** — flag `is_foreign_citizen` + +119 RON surcharge + procesare 7-15 zile. Lărgește piața (diaspora).

6. **International couriers** — DHL Express + Poșta Română. Crește addressable market pentru români din străinătate care au nevoie de documente originale.

7. **Split onorariu avocat pe factură** — 15 RON separat din base, Stripe line item. **Avantaj:** transparență legală + posibil deductibil la client persoană juridică.

### 🟢 LOW priority (polish)

8. **Consistență prețuri extras** — traducere este 178.50 pe fiscal dar 80 pe judiciar. Standardizează.
9. **Adăugare extras lipsă:** Legalizare (99), Verificare Expert (49).
10. **Apostila Haga** pentru fiscal (238 RON) — nu doar pentru judiciar.

---

## 7. Ce merită portat din eghiseul → cazier

### 🔴 HIGH

1. **Mutare config în DB** — cazier nu poate schimba prețuri fără redeploy. Portare `services` + `service_options` schema din eghiseul. **Impact:** admin autonomy, A/B testing prețuri.

2. **RBAC cu 5 roluri** — cazier are single admin. Port `src/lib/admin/permissions.ts` pentru scalare echipă.

### 🟡 MEDIUM

3. **Dual-provider delivery cu markup dinamic 15%** — cazier are prețuri fixe per courier; eghiseul ia quote real și adaugă markup. Mai corect când distanța contează.

4. **TVA 21% vizibil separat** — transparență legală mai bună pentru clienți PJ care au nevoie de factură cu TVA.

---

## 8. Recomandări de prioritizare (roadmap)

### Sprint imediat (săptămâna asta)
- [ ] **Audit preț** cazier judiciar PF la eghiseul — decizie de business: 169 vs 220 vs 250?
- [ ] **Verifică diferența traducere** 178.50 vs 80 RON pe servicii — e intenționat sau bug de date?
- [ ] **Adaugă sărbători 2026-28** în logica de estimare delivery (copie din cazier `delivery-calculator.ts:45-91`)

### Sprint 6 (paralel cu notificări)
- [ ] Port coupon system
- [ ] Port cutoff 12:00 Europe/Bucharest

### Sprint 7+ (extindere catalog)
- [ ] Certificat Integritate service nou
- [ ] Cetățean străin flow
- [ ] International couriers (DHL + Poșta)

---

## 9. Apendix — fișiere-cheie pentru portare

### Din cazier.ro
| Fișier | Linii | Ce conține |
|--------|------:|------------|
| `src/lib/delivery-calculator.ts` | 316 | Cutoff, business days, sărbători 2026-28, per-option times |
| `src/app/(admin)/admin/coupons/page.tsx` | 300+ | UI management coupons |
| `src/app/api/admin/coupons/route.ts` | — | CRUD coupons |
| `supabase/migrations/014_abandoned_sessions_and_coupons.sql` | 44 | Schema coupons |
| `src/app/api/stripe/create-payment-intent/route.ts:256-372` | 116 | Coupon validation server-side |

### Din eghiseul.ro (deja implementate)
| Fișier | Ce conține |
|--------|------------|
| `supabase/migrations/002_services.sql` | Services + options schema DB-driven |
| `src/lib/admin/permissions.ts` | RBAC complete |
| `src/app/api/admin/settings/services/route.ts` | Admin pricing PATCH API |

---

**Document generat:** 2026-04-16 prin 2 agenți paraleli Explore
**Ultima actualizare:** 2026-04-16 (Phase A + C implementate)

---

## 10. Progres implementare

| Fază | Status | Detalii |
|------|:------:|---------|
| Phase A: Normalizare `service_options` | ✅ DONE | Migration `028_normalize_service_options.sql`. 12 rânduri inserate (3 extras × 4 servicii), 1 mislabel fixat (fiscal apostila → apostila_notari). 4 servicii principale au acum 7 opțiuni fiecare. |
| Phase B: Standardizare nume + mislabel | ✅ DONE | Inclus în A. Fiscal.apostila (83.30, "Legalizare Traducere") → apostila_notari ("Apostilă Notari (Camera Notarilor)"). |
| Phase C: Delivery calculator RO holidays | ✅ DONE | `src/lib/delivery-calculator.ts` (437 linii) + `scripts/test-delivery-calculator.mjs` (232 linii). 44 sărbători RO 2026-2028, noon Europe/Bucharest cutoff, per-option time impact. 23/23 assertions PASS. |
| Phase D: Coupon system | ⏳ PENDING | Schema există în DB eghiseul (`discount_amount`), lipsește UI admin + API validare + integrare în payment intent. Port din `cazier.ro/src/app/(admin)/admin/coupons/` + `api/admin/coupons/route.ts`. |
| Phase E: Cetățean străin flow | ⏳ PENDING | `is_foreign_citizen` boolean + +119 RON surcharge + 7-15 zile procesare. Wizard step change + pricing calculator update. |
| Phase F: Testing final | 🟡 PARTIAL | Smoke 16/17 PASS post-fix. Necesită: integrarea delivery-calculator în price-calculator.ts + order API + wizard UI. |

### Artefacte create

| Fișier | Scop |
|--------|------|
| `supabase/migrations/028_normalize_service_options.sql` | DB migration Phase A |
| `src/lib/delivery-calculator.ts` | Delivery calculator nou (Phase C) |
| `scripts/test-delivery-calculator.mjs` | Unit tests delivery (23 assertions) |
| `tests/reports/api-smoke-2026-04-16-post-phase-ac.log` | Smoke post-implementare |

### Integrare delivery-calculator (TODO pentru Phase F sau D)

Calculatorul e independent. Trebuie conectat la:
- `src/utils/price-calculator.ts` — pentru estimare ETA per opțiune
- `src/app/api/orders/draft/*` — pentru persistare `estimated_completion_date`
- `src/providers/modular-wizard-provider.tsx:1187` — pentru pre-compute în wizard
- `src/lib/documents/generator.ts:86,217,305` — pentru embed calendar date în contracte
- `src/app/(customer)/account/orders/[id]/page.tsx:569` — pentru display ETA
- `src/lib/services/courier/utils.ts:323,361` — SUPERSEDE helpers vechi (fără sărbători)

### Business decizii pending (așteptăm input user)

1. **Repricing cazier-judiciar-persoana-fizica** 169 → 220/250 RON? (potential +80 RON/comandă)
2. **Traducere inconsistență**: 178.50 fiscal vs 80 judiciar — aliniere?
3. **Apostila Haga**: 150 judiciar vs 238 cazier.ro — aliniere?
4. **Adăugare servicii noi:** Certificat Integritate? Activare Cazier Auto?
