# Comparație Live (cazier.ro) vs Local (eghiseul.ro) — 2026-04-16

**Data:** 2026-04-16
**Metodă:** Playwright MCP navigation + inspecție cod sursă
**Scope:** Verificare că eghiseul.ro are toate extras-urile după migrările 028, 029, 030

---

## 1. Rezumat executiv

După migrările 028+029+030, eghiseul.ro are **paritate completă** cu cazier.ro la nivel de **date** (DB options), dar **diferă la UI rendering**.

| Aspect | cazier.ro (live) | eghiseul.ro (local) | Status |
|--------|------------------|---------------------|:------:|
| 7 extras standard (traducere, apostila haga/notari, legalizare, verificare, urgenta, copii) | ✅ Toate serviciile | ✅ 5 servicii principale | ✅ PARITATE |
| Prețuri extras | Hardcoded TS configs | DB-driven (aliniate) | ✅ IDENTICE |
| Certificat Integritate | ✅ Serviciu dedicat | ✅ Serviciu nou creat | ✅ PARITATE |
| Cross-service addon (Cazier Judiciar in Integritate order) | ✅ UI special — toggle + sub-options tree | ⚠️ DB option simplu, render ca option normal | 🟡 **PARTIAL** |
| Cetățean străin surcharge +119/+100 RON | ✅ Flag în step 2 | ❌ Nu e implementat | ❌ LIPSĂ |
| Coupons | ✅ Full system + admin UI | ❌ Schema există, logică lipsește | ❌ LIPSĂ |
| Delivery cutoff + holidays RO 2026-28 | ✅ Live | ✅ `src/lib/delivery-calculator.ts` (nou) | ⚠️ Nu e integrat în wizard |
| Landing pages city SEO (/bucuresti, /cluj etc.) | ✅ SSG pages pentru 40+ orașe | ❌ Nu există | ❌ LIPSĂ |

---

## 2. Screenshots comparative

### cazier.ro live

| Screenshot | URL |
|-----------|-----|
| `tests/screenshots/cazier-live-01-homepage.png` | `/` — Homepage cu wizard în hero + secțiuni full page |
| `tests/screenshots/cazier-live-02-integritate-landing.png` | `/certificat-integritate-comportamentala` — landing dedicat |
| `tests/screenshots/cazier-live-03-hero-form.png` | Wizard step 1 (Contact) detailed |

### eghiseul.ro local

| Screenshot | URL |
|-----------|-----|
| `tests/screenshots/eghiseul-local-01-integritate-step1.png` | `/comanda/certificat-integritate-comportamentala` — Step 1 Date Contact |
| `tests/screenshots/eghiseul-local-02-integritate-step2-personal.png` | Step 2 Date Personale (CNP, nume, adresa, Cetățenie dropdown, Prenume tată/mamă) |

---

## 3. Cazier.ro wizard — arhitectură (din cod sursă)

Sursa: `/Users/raul/Projects/cazierjudiciaronline.com/src/components/form/steps/Step4Options.tsx`

**6 pași:**
1. Contact (email, telefon, PF/PJ)
2. Date Personale (CI, CNP, nume, cetățenie, parent names)
3. Documente (upload CI)
4. **Opțiuni** ← AICI sunt extras + add-ons + urgency
5. Contract (consent + IP capture)
6. Plata (Stripe Checkout redirect)

**Step 4 — structura UI renderată (din Step4Options.tsx):**

```
┌─ Urgenta [toggle +100 RON] ─────────────────────┐
│  Standard (3-5 zile)  |  Urgent (1-2 zile)      │
├─ Certificat Integritate [toggle +250 RON] ──────┤  ← doar pe judiciar
│  └─ sub-options expanse:                        │
│     • Apostila Haga +238                        │
│     • Traducere +178.50                         │
│     • Legalizare +99 (require Traducere)        │
│     • Apostila Notari +83.30 (require Legal.)   │
├─ Cazier Judiciar [toggle +100 RON] ─────────────┤  ← doar pe integritate
│  └─ aceleași 4 sub-options                      │
├─ Traducere Autorizată [toggle +178.50] ─────────┤
├─ Apostila Haga [toggle +238] ───────────────────┤
├─ Legalizare [toggle +99] ───────────────────────┤
├─ Apostila Notari [toggle +83.30] ───────────────┤
├─ Verificare Expert [toggle +49] ────────────────┤
└─ Livrare: Fan / Sameday / DHL / Poșta ──────────┘
```

**Preț total** calculat în `useMemo` (liniile 109-179) client-side, re-verificat server-side în `create-payment-intent/route.ts`.

---

## 4. Eghiseul.ro wizard — arhitectură actuală

Sursa: `src/components/orders/steps-modular/options-step.tsx` (339 linii)

**8 pași (diferă):**
1. Date Contact
2. Date Personale
3. **Opțiuni** ← AICI extras
4. Documente KYC
5. Semnătură (canvas)
6. Livrare
7. Facturare
8. Finalizare

**Step 3 (Opțiuni) — comportament actual:**

Codul (`options-step.tsx:53-69`) grupează opțiunile în 3 categorii pe baza numelui:
```typescript
if (name.includes('urgent')) → groups.speed
else if (name.includes('traduc')) → groups.translations
else → groups.addons  // tot restul aici (apostila, legalizare, cross-service addon)
```

**Rendering real pentru Certificat Integritate (verificat prin `/api/services/certificat-integritate-comportamentala`):**

```
┌─ Opțiuni disponibile (8 total) ─────────────────┐
│  speed:                                         │
│    • Procesare Urgentă +100                     │
│  translations:                                  │
│    • Traducere Autorizată +178.50               │
│  addons (7 items):                              │
│    • Apostilă Notari +83.30                     │
│    • Apostilă de la Haga +238                   │
│    • Legalizare Notarială +99                   │
│    • Verificare de Expert +49                   │
│    • Copii Suplimentare +25                     │
│    • Cazier Judiciar (adaugă...) +100  ←══ CROSS-SERVICE
└─────────────────────────────────────────────────┘
```

**⚠️ Diferența cheie:** Cross-service addon `addon_cazier_judiciar` apare ca simple option card — NU se deschide o sub-tree cu propriile extras (apostila, traducere etc.) pentru serviciul bundled.

---

## 5. Gap list pentru paritate completă

### ✅ Realizat (fără cod necesar — doar DB)

- [x] 7 extras standard pe toate serviciile principale (migration 028+029)
- [x] Prețuri aliniate: urgenta 100, traducere 178.50, apostila haga 238, apostila notari 83.30, legalizare 99, verificare expert 49, copii 25
- [x] Certificat Integritate — serviciu nou (migration 030)
- [x] Cazier Auto — activat cu 7 extras
- [x] Codes standardizate lowercase (TRAD_EN → traducere, etc.)
- [x] Cross-service option în DB pentru ambele direcții (judiciar↔integritate)

### 🟡 Parțial (UI simplu există, UX special lipsește — Phase I)

- [ ] **Sub-options tree** când se selectează cross-service addon
  - Când user pune check pe "Cazier Judiciar (adaugă în aceeași comandă)" la integritate order, ar trebui să apară opțional nested:
    - Apostila Haga pe cazier judiciar
    - Traducere pe cazier judiciar
    - Legalizare pe cazier judiciar
    - Apostila Notari pe cazier judiciar
  - Cod de modificat: `src/components/orders/steps-modular/options-step.tsx`
  - Pattern: adaugă un nou grup `crossService` în `groupedOptions` (filtrat prin `code.startsWith('addon_')`) și render cu `expanded state` + sub-options fetch-ed din celălalt serviciu.

- [ ] **Order schema** — coloană `bundled_services` JSONB sau boolean flags pe `orders`
  - Cazier.ro folosește flat boolean columns (`cazier_judiciar`, `cazier_traducere`, etc.) — simplu.
  - eghiseul poate folosi JSONB `{bundled: ["cazier-judiciar"], bundled_options: [...]}`.

- [ ] **Pricing calculator** — handle bundled price + sub-options price
  - Server-side în payment intent: adaugă line items pentru bundled service + sub-options.

- [ ] **Document generation** — generează documente pentru AMBELE servicii din order
  - `src/lib/documents/auto-generate.ts` — trebuie extins să recunoască `bundled_services` și să ruleze template-urile pentru fiecare.

### ❌ Lipsește complet (Phase D, E, K)

- [ ] **Phase D: Coupon system** — port `coupons` table + `/admin/coupons` UI + API validation + integrare în payment intent (1-2 zile)
- [ ] **Phase E: Cetățean străin** — flag + +100-119 RON surcharge + 7-15 zile processing (1 zi)
- [ ] **Phase F: Integrare delivery-calculator** — conectează noul `src/lib/delivery-calculator.ts` la price-calculator + order API + wizard + contract generator + account ETA display (1-2 zile)
- [ ] **Phase K: City SEO landing pages** — `/cazier-judiciar-online/[city]/page.tsx` cu SSG + 40+ orașe config + JSON-LD schema (2-3 zile)

---

## 6. Concluzie

**Starea după migrările de azi:**
- ✅ **DB parity:** eghiseul.ro are aceleași date ca cazier.ro (extras, prețuri, servicii)
- ✅ **UI minim:** toate extras-urile render ca option cards în step 3
- 🟡 **UX diferit:** cross-service addon render simpluplu, nu ca sub-tree ca pe cazier.ro
- ❌ **Features lipsă:** cetățean străin flow, coupons, city SEO pages

**Pentru a fi 100% equivalent cu cazier.ro** mai avem ~8-10 zile de dev (Phase I + D + E + F + K).

**Dar pentru MVP functional:** suntem deja acolo. Utilizatorii pot comanda Certificat Integritate + pot bifa opțional "Cazier Judiciar" (care apare ca opțiune regulară). Comanda se plătește, se generează documente (pentru serviciul principal — addon-ul va fi ignored momentan fără Phase I cod).

---

## 7. Ce îi arată utilizatorul concret pe ecran

### La cazier.ro `/certificat-integritate-comportamentala` (live)
- Hero cu wizard inline (Pasul 1 din 6)
- Section "Ce este?" cu specimen
- "Cand este necesar" — 6 use cases (adopție, voluntariat copii, învățământ, asistent maternal, asistență socială, funcții publice)
- Differenta fata de cazier judiciar
- Documente necesare
- Pricing tier: 250 RON standard / 350 RON urgent
- FAQ, testimoniale, cross-sell

### La eghiseul.ro `/comanda/certificat-integritate-comportamentala` (local)
- Hero cu title "Comandă Certificat de Integritate Comportamentală"
- Wizard cu 8 pași (Date Contact ativ)
- Sidebar cu Preț 250 RON, Timp estimat 5 zile lucrătoare, SSL, rambursare
- ✅ Există landing listă în `/servicii` (pagină catalog generică — ca parte din BUG-003 fix)
- ❌ Nu există landing page dedicat `/servicii/certificat-integritate-comportamentala` (doar `/servicii/cazier-judiciar-online` există ca landing dedicat)

---

**Document generat:** 2026-04-16
**Screenshots:** `tests/screenshots/cazier-live-*.png` + `tests/screenshots/eghiseul-local-*.png`
**Referințe cod:**
- `cazierjudiciaronline.com/src/components/form/steps/Step4Options.tsx:480-573` (cross-service addon UI)
- `eghiseul.ro/src/components/orders/steps-modular/options-step.tsx:53-69` (option grouping)
- `eghiseul.ro/supabase/migrations/{028,029,030}.sql` (DB changes)
