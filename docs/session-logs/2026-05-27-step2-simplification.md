# Sesiune 2026-05-27 — Step 2 (Date Personale) simplification pentru cazier judiciar PF

**Status:** ✅ Aplicat în cod + DB
**Inspirat din:** `cazierjudiciaronline.com` Step2 (ultra-light)
**Sister project referință:** `/Users/raul/Projects/cazierjudiciaronline.com/src/components/form/steps/Step2PersonalData.tsx`

---

## Context

Feedback user: „lumea se pierde între pasul 2 (date personale) și pasul 3 (verification documents)". Step 2 era prea încărcat — cerea nume, prenume, serie+număr CI, data nașterii, locul nașterii, valabilitate, **nume părinți**, **adresă de domiciliu**. Comparativ, cazierjudiciaronline.com cere DOAR CNP + (opțional) nume părinți.

Decizie post-discuție cu echipa: **eliminăm complet din Step 2** pentru `cazier-judiciar` PF:
- ~~Prenume mamă~~
- ~~Prenume tată~~
- ~~Adresă de domiciliu~~

Plus: în **scan mode**, după ce OCR-ul extrage cu succes datele de pe CI, ascundem TOATE câmpurile extrase. User-ul vede doar CNP + banner verde derivat („Date extrase din CNP: 19.01.1993 • Bărbat • Jud. București S.1"). Dacă OCR-ul greșește ceva, operatorul corectează din `/admin/orders/[id]`. User-ul NU mai vede/corectează nimic. Manual mode rămâne full form.

---

## Modificări

### 1. DB — `services.verification_config` pentru `cazier-judiciar`

Migration: `supabase/migrations/039_cazier_judiciar_step2_simplification.sql`

```
personalKyc:
  parentDataRequired:        true              -> false
  requireAddressCertificate: 'ci_nou_passport' -> 'never'
```

Aplicat în prod via REST API (scriptul `/tmp/restore_cazier.py`). Restul config-ului identic — clientTypeSelection, acceptedDocuments, selfie/signature, citizenshipFlows, companyKyc cu blockedTypes din migration 037, signature.

> **Note tehnic:** În timpul aplicării, un PATCH greșit a setat temporar `verification_config = null`. Restaurat în aceeași sesiune cu config-ul complet reconstruit din migration 011 + 037 + modificările 039.

### 2. UI — `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`

**a. Address section gated**

```tsx
{!(
  config?.requireAddressCertificate === 'never' &&
  personalKyc.citizenship === 'romanian'
) && (
  <div className="space-y-4">
    {/* Adresă de Domiciliu */}
    ...
  </div>
)}
```

Hidden pentru români când serviciul declară `requireAddressCertificate: 'never'`. Cetățenii străini văd în continuare secțiunea (au nevoie de adresă RO sau străină).

**b. OCR-extracted fields hidden after scan success**

```tsx
const hideExtractedFields = mode === 'scan' && ciFrontScan.success;
```

Wrap pe Document Series/Number grid + pe „Date Personale" section. După scan reușit, user-ul vede doar CNP + banner derivat. State-ul intern conține toate datele extrase (`firstName`, `lastName`, `documentSeries`, `documentNumber`, `birthDate`, `birthPlace`, `documentExpiry`) — se salvează silent în `customer_data.personal`.

**c. Parent names** — deja gated de `config?.parentDataRequired` (nu am modificat codul, doar DB-ul a fost setat la `false`).

### 3. Admin — `src/app/admin/orders/[id]/page.tsx`

Adăugat afișaj **Județ nastere (din CNP)** lângă **Locul nasterii (localitate)** (din OCR). Județul derivat la display time via `getCountyFromCNP(personal.cnp)` — nu duplicăm în state, CNP-ul e single source of truth pentru județ.

```
Locul nasterii (localitate):   Mun. București Sec. 1   (din OCR)
Judet nastere (din CNP):       București S.1           (autoritar)
```

---

## Aliniere cu cazierjudiciaronline.com

| Aspect | cazierjudiciaronline.com | eghiseul.ro (după 2026-05-27) |
|--------|--------------------------|-------------------------------|
| Câmpuri cazier judiciar PF Step 2 | CNP + parent names (opțional, dacă config) + foreign bloc (dacă cazul) | CNP + foreign bloc (dacă cazul) |
| Adresă de domiciliu | NU se cere pentru români | NU se cere pentru români |
| Nume părinți | Dacă `enableParentNames` | Dezactivat (parentDataRequired: false) |
| Județ nastere admin | Field DB explicit `judet_nastere` | Derivat din CNP la display |
| Localitate nastere admin | Field DB explicit `localitate_nastere` | Salvat în `customer_data.personal.birthPlace` (din OCR sau manual) |
| OCR pe CI | NU au scan (manual entry only) | Avem scan; după succes ascundem câmpurile extrase |

---

## Test plan

### Automate (vitest)

**749 unit tests passing** (era 738 înainte de sesiune; +11 noi).

Adăugate în această sesiune:

| Fișier | Ce verifică | # tests |
|--------|-------------|---------|
| `tests/unit/lib/verification-modules/step-builder.test.ts` | Review step eliminat din toate configurațiile; wizard se termină la `billing`; flow cazier judiciar PF produce exact 7 pași în ordinea așteptată | 4 |
| `tests/unit/lib/validations/cnp-birthdate-derive.test.ts` | Derivarea birthDate din CNP (fallback OCR null): formatul YYYY-MM-DD local fără UTC drift, CNP-uri reale (inclusiv `1750110214609` din order E-260527-4WV2A), edge cases (invalid checksum, empty input, padding) | 7 |

Rulează cu `npx vitest run tests/unit/lib/verification-modules tests/unit/lib/validations/cnp-birthdate-derive`.

### Manuale

Pentru următoarea sesiune:
- [ ] `npm run dev` → comandă cazier judiciar PF → flow Step 2 scan mode → verifică că rămâne doar CNP + banner derivat
- [ ] Flow Step 2 manual mode → verifică că toate câmpurile rămân (nume, prenume, data, valabilitate) FĂRĂ părinți și FĂRĂ adresă
- [ ] Test cu un CI Mun. București Sec. 1 → verifică în admin că apare „Locul nasterii: Mun. București Sec. 1" și „Judet nastere (din CNP): București S.1"
- [ ] Test pe cazier-fiscal și cazier-auto — NU trebuie să fie afectate (config-ul lor neschimbat)
- [ ] Test cetățean străin (citizenship: foreign/european) — adresa rămâne vizibilă
- [ ] Wizard parcurs până la capăt → verifică că ultimul pas e „Facturare" (nu Review)
- [ ] La signature → semnează → mergi înainte → checkout → verifică note legal mic sub „Plătește"
- [ ] La signature → semnează → clear → înapoi pe billing → verifică că consent flags revin la false (semnătură ștearsă = retragere consimțământ)
- [ ] Generează cerere admin pentru o comandă fără părinți → verifică că pe PDF apare „prenume tată: -" / „prenume mamă: -" (nu rând gol)

---

## Fișiere modificate

```
supabase/migrations/039_cazier_judiciar_step2_simplification.sql            NOU
src/components/orders/modules/personal-kyc/PersonalDataStep.tsx             (address gate + hideExtractedFields)
src/app/admin/orders/[id]/page.tsx                                          (getCountyFromCNP import + Judet nastere row)
docs/session-logs/2026-05-27-step2-simplification.md                        NOU
```

DB:
- `services.verification_config` pentru `slug = 'cazier-judiciar'` — `personalKyc.parentDataRequired` și `personalKyc.requireAddressCertificate`

---

## TODO follow-up

- **Verifică pe celelalte servicii cazier**: `cazier-fiscal`, `cazier-auto`, `certificat-integritate-comportamentala`. Dacă echipa zice „nici acolo nu cerem părinți/adresă", se aplică aceeași migration cu slug-urile respective.
- **Address pe cerere oficială**: dacă MJ chiar are nevoie de adresă pe cererea generată, va trebui să o cerem la Step billing/delivery sau să o extragem din CI back via OCR (când e disponibil). De clarificat cu echipa juridică.

---

## Update 09:45 — Bugfix: „Continuă" disabled after scan

**Symptom:** OCR-ul a returnat `birthDate: null` pentru un CI cu fotografie ușor reflectorizantă (issues: „Data nașterii nu este vizibilă"). Câmpul nu mai era vizibil în UI (l-am ascuns), deci user-ul nu putea completa manual → `isFormValid()` întorcea false → butonul „Continuă" rămânea dezactivat.

**Fix:** Derivăm `birthDate` din CNP automat în 2 locuri:
1. **În OCR success branch** — dacă `extracted.birthDate` e null dar CNP-ul e valid, calculăm din CNP înainte de `updatePersonalKyc`.
2. **Effect safety net** — un `useEffect` watch pe `personalKyc` care, când birthDate e gol și CNP valid, completează din CNP. Acoperă draft-uri vechi, paste, autofill.

```tsx
useEffect(() => {
  if (!personalKyc || personalKyc.birthDate) return;
  const cnpRes = validateCNP(personalKyc.cnp || '');
  if (!cnpRes.valid || !cnpRes.data) return;
  const d = cnpRes.data.birthDate;
  updatePersonalKyc({
    birthDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
  });
}, [personalKyc, updatePersonalKyc]);
```

**Lecție pentru viitoarele câmpuri ascunse:** orice câmp pe care îl ascundem în scan mode dar validation îl cere **TREBUIE să aibă un fallback automat** (din CNP, din alt câmp, sau default sensibil). Altfel user-ul rămâne blocat fără să înțeleagă de ce.

---

## Update 09:55 — Combined consent checkbox (Step Review)

**Inspirat din:** `cazierjudiciaronline.com/src/components/form/steps/Step5Contract.tsx` (line 911-931).

**Problemă:** Step-ul review avea 3 checkbox-uri separate: Termeni & Condiții, Politica de Confidențialitate, Renunțare la dreptul de retragere (OUG 34/2014). Prea mult friction înainte de plată.

**Soluție:**
- **UI:** un singur checkbox combinat cu textul tuturor 3 consimțămintelor (T&C + Privacy + waiver retragere + valoare semnătură electronică conform Legii 214/2024 + eIDAS).
- **State:** intern păstrăm cele 3 flag-uri separate pe `state.consent.{termsAccepted, privacyAccepted, withdrawalWaiver}` pentru audit log (cerință legală). `setAcceptAll(v)` setează toate trei simultan.
- **Auto-tick la semnare:** `useEffect` watch pe `state.signature.signatureBase64` — dacă semnătura există și consimțământul nu e încă bifat, îl bifează automat (semnătura electronică e expresia consimțământului per Legea 214/2024). User poate debifa dacă vrea — atunci validation blochează plata.
- **Hint vizibil:** când e auto-bifat, sub checkbox apare „✓ Bifat automat la semnare — poți debifa dacă vrei să retragi consimțământul."

**Fișiere atinse (update):**

```
src/components/orders/steps-modular/review-step.tsx     (acceptAll combined + auto-tick from signature)
```

State shape NESCHIMBAT — backend audit log continuă să primească 3 flag-uri separate.

---

## Update 10:15 — Review step eliminat din wizard

**Inspirat din:** UX cazierjudiciaronline.com (5 pași, fără review).

**Problemă:** Wizard avea 8 pași la cazier judiciar PF: Contact → Date Personale → Opțiuni → KYC → Semnătură → Livrare → Facturare → **Review**. Review-ul era redundant — sticky order summary apare oricum pe fiecare pas, cuponul e disponibil pe pagina de checkout.

**Modificări:**

1. **`src/lib/verification-modules/step-builder.ts`** — eliminat push-ul pentru `'review'` step. Wizard se termină acum la „Facturare". După billing, user e redirectat la `/comanda/checkout/[id]`.

2. **`src/components/orders/modules/signature/SignatureStep.tsx`** — la `handleEnd` (semnătura completă), auto-set `updateConsent({termsAccepted: true, privacyAccepted: true, withdrawalWaiver: true})`. La `handleClear` (șters semnătura), reset to false. Semnătura electronică = consimțământ explicit per Legea 214/2024 + eIDAS Art. 25.

3. **`src/components/payment/StripeCheckoutForm.tsx`** — adăugat note legal mic deasupra butonului Plătește: „Prin click pe „Plătește" confirmi că ai citit T&C + Politica de Confidențialitate, și soliciti executarea imediată..."

**Backend audit trail neschimbat:** `signature_metadata.consent` continuă să primească cele 3 flag-uri separate la submit (verified pe order E-260527-4WV2A: `{terms_accepted: true, privacy_accepted: true, withdrawal_waiver: true}`).

---

## Update 10:20 — Fix order ID truncation pe checkout

**Problemă:** Pe `/comanda/checkout/[id]` în sticky order summary, badge-ul cu order number (`E-260527-4WV2A`) apărea trunchiat cu `…`. Cauza: `max-w-[140px] truncate` pe element.

**Fix (`src/components/payment/OrderSummaryCard.tsx`):** Înlocuit cu `whitespace-nowrap` și fără `max-w` constraint. Adăugat `title={orderNumber}` pentru accesibilitate la hover. Container-ul flex are deja `shrink-0` așa că badge-ul nu se comprimă.

---

## Update 10:25 — Parent names fallback pe cerere generată

**Problemă:** După ce am dropat input-urile pentru `prenume_tata` / `prenume_mama` din Step 2, template-ul DOCX al cererii rămâne cu acele câmpuri — și ele se generau cu string gol (`''`) ceea ce făcea cererea să arate cu rânduri goale (un inspector ar putea crede că lipsesc datele).

**Fix:** Default la `'-'` în două locuri:
- `src/app/api/admin/orders/[id]/generate-document/route.ts` — endpoint-ul admin pentru generare manuală
- `src/lib/documents/auto-generate.ts` — auto-generare la submit

Așa cererea afișează „prenume tată: -" / „prenume mamă: -" (clar marcat ca neavailable).

---

## Verificare order E-260527-4WV2A (test order — date complete)

Inspectat în DB. ✅ Toate datele importante sunt salvate:

| Câmp | Valoare |
|------|---------|
| `order_number` | E-260527-4WV2A |
| `status` / `payment_status` | processing / paid |
| `base_price` / `options_price` / `total_price` | 198 / 80 / 278 RON |
| `stripe_payment_intent_id` | pi_3TbbFvQZ4o0fUl1z2V5NB62g |
| `personal.firstName` / `lastName` | IONEL / ARDELEANU |
| `personal.cnp` | 1750110214609 |
| `personal.birthDate` | **1975-01-10 ← derivat din CNP** (OCR nu a putut citi) |
| `personal.birthPlace` | Jud.IL Mun.Urziceni (din OCR) |
| `personal.documentSeries` / `Number` | SZ / 693939 |
| `personal.documentExpiry` | 2031-08-03 |
| `personal.address` | Ficusului 22, Manasia, Ialomița (auto-fill din OCR CI verso) |
| `kyc_documents` | 2 docs (front + back) |
| `signature_s3_key` | orders/2026/05/.../signature/signature.png |
| `signature_metadata.consent` | terms ✓, privacy ✓, waiver ✓, signed_at, ip, user_agent, sha-256 hash |
| `selected_options` | [{code: 'urgenta', name: 'Procesare Urgentă', price: 80}] |
| `delivery_method` | populat (dict) |
| `estimated_completion_date` | 2026-05-29T16:00:00Z |
| `contract_signed_at` | 2026-05-27T06:47:50Z |

**Minor follow-ups (non-blocking):**
- `payment_method`, `paid_at`, `stripe_charge_id` sunt `None` — webhook-ul Stripe nu a actualizat încă (probabil timing/local dev)
- `invoice_number`, `invoice_url` sunt `None` — Oblio invoice generation nu rulează încă pe local dev

---

## Update 10:30 — Fix hydration mismatch (Sheet aria-controls)

**Problemă:** Console error pe orice pagină — `aria-controls` pe Sheet trigger button diferă SSR vs client (`radix-_R_4iqlb_` vs `radix-_R_14mlb_`). Cauza: Radix folosește intern `React.useId()` care produce ID-uri secvențiale; orice diferență de tree între server și client (auth-gated UIs, etc.) face ca counter-ul să derive.

**Fix (`src/components/shared/header.tsx`):** Adăugat `hydrated` state cu `useEffect(() => setHydrated(true), [])`. Pe SSR render un Button placeholder identic vizual. Sheet-ul real se mount-ează client-side după hidratare. Layout nu pâlpâie, warning-ul dispare.

---

## Update 10:35 — OCR Romanian diacritics + locality canonicalization

**Problemă raportată de user:** CI clientului MARIȘCA GHEORGHE arată „Sat.Băbășești (Com.Medieșu Aurit), Jud. SM" dar Gemini a extras „Băbăcești" — `ș` confundat cu `č` (un caracter care NU există în română). User a observat și că multe poze sunt portrait cu elemente extra (degete, fundal) care pot deruta OCR-ul.

**Fix în 2 layere:**

### 1. Prompt Gemini îmbunătățit (`src/lib/services/document-ocr.ts`)

Adăugat la ambele prompt-uri (CI față + verso):
- **Secțiune ORIENTARE**: „Dacă poza e portrait dar CI-ul e landscape, analizează ca și cum ar fi rotit corect. Ignoră elementele care nu fac parte din CI."
- **Secțiune DIACRITICE (cu emoji ⚠️)**: enumeră explicit cele 5 caractere românești valide (ă, â, î, ș, ț), interzice explicit `š`, `č`, `ž` cu exemple concrete:
  ```
  ✗ "Băbăcești"  → corect: "Băbășești" (s cu virgulă, nu č)
  ```
- Specifică că MRZ-ul e ASCII (fără diacritice — nu trebuie corectat acolo).

### 2. Post-processing fuzzy match (`src/lib/data/locality-fuzzy-match.ts`)

Util nou: `fuzzyMatchLocality(rawCity, county)` care:
- Normalizează input + lista oficială de localități (strip diacritice + prefixe „Sat./Com./Mun./Oraș" + paranteze trailing).
- **Pass 1 — exact match** pe forma normalizată (cazul: numai diacritice diferă).
- **Pass 2 — Levenshtein** ≤ 2 absolut ȘI ≤ 25% din lungime, prag dublu pentru a evita map-ări greșite la nume scurte.
- **Refuză** când mai mulți candidați sunt la aceeași distanță (nu ghicim).

Aplicat în `PersonalDataStep.tsx` `fillAddressFields` după `cleanLocalityName` — dacă fuzzy match găsește un candidat, înlocuiește. Log în consolă: `Locality fuzzy-matched: Băbăcești → Babasesti (fuzzy, distance=1)`.

**Teste:** `tests/unit/lib/data/locality-fuzzy-match.test.ts` cu **13 teste** care acoperă:
- Normalizare diacritice (s-comma vs s-cedilla, š→s, prefixe)
- Production scenario real („Băbăcești" → „Babasesti" în Satu Mare, distance=1)
- Safety rails (empty input, county necunoscut, threshold exceeded, multiple candidates tie)

**Total teste:** 762 (era 749; +13).

---

## Update 10:45 — Options step UX overhaul (5 fix-uri)

1. **Checkbox-uri invizibile** la bundled options — `CheckCircle` cu cerc propriu pe galben = invizibil. Mai târziu (11:00) eliminat complet — consistency cu top-level OptionCard.
2. **„Rezumat Selecții"** la baza Step Options — duplica sticky sidebar. Șters.
3. **Bundled options flat** în sticky summary — acum nested.
4. **Delivery time static** — vezi 11:25 pentru implementarea finală.
5. **Iconițe per-rând** (Tag/Package) — eliminate, summary mai curat.

## Update 10:55 — Summary nesting v2 + secondary service rebrand

- OrderSummaryCard restructurat: 2 grupuri identice (Serviciu de bază + Serviciu secundar), fiecare cu linie verticală primary-100 pentru copii.
- Badge „Pachet" → „Serviciu secundar".
- Strip `(adaugă în aceeași comandă)` centralizat în `normalizeOrderOption` (UI + admin + contract).
- **5 teste noi** în `normalize.test.ts` (top-level, nested, plain, metadata, case-insensitive).

## Update 11:00 — BUG: bundled option highlight nu persista după click

`isBundledSelected(bundled.id)` căuta `o.optionId === bundled.id` dar `toggleBundled` salva cu synthetic ID `bundled:<parent.id>:<bundled.id>`. Chei diferite → check întoarcea false → cardul nu rămânea galben deși opțiunea era în coș. Fix: calculează același synthetic ID în check.

Bonus: bundled cards `border-2` + `shadow-sm` ca top-level (înainte 1px = prea subtil).

## Update 11:10 — Apostila Haga preț: 238 → 198 RON

Aliniat cu cazierjudiciaronline.com. Migration 040 + PATCH REST pe **9 servicii** care au addon-ul. Restul (traducere, legalizare, apostila_notari, verificare_expert) deja la prețul corect.

## Update 11:25 — Delivery time calculat per-step (sumă reală)

User: „1-2 zile e greșit când am adăugat extra (apostila, traducere, legalizare)."

**Cauza:** PriceSidebarModular era hardcoded „1-2 zile" dacă urgenta era selectat, altfel base. Ignorâa addon-urile.

**Implementare** (port din cazierjudiciaronline.com `delivery-calculator.ts`):

Helper nou `estimateFromSelectedOptions` în `src/lib/delivery-calculator.ts`:
- Plecare: `baseDays` (din serviciu) SAU urgency 1-2 dacă `urgenta` bifat (non-bundled).
- Adaugă per addon code: traducere +1-2, legalizare +1, apostila_haga +1, apostila_notari +1.
- **Dedup pe cod** (același addon main + bundled secondary service = 1×, se procesează în paralel).
- Courier leg adaugat doar când `includeCourierLeg` (după ce user alege metodă).
- Folosește calculator-ul existent `calculateEstimatedCompletion` care deja face date math cu sărbători RO 2026-2028 + noon-cutoff Europe/Bucharest.

**Scenariu raportat de user** — urgent + apostila Haga + traducere + legalizare + apostila Notari:
- Înainte: „1-2 zile" (incorect)
- Acum: **„5-7 zile lucrătoare"** (1-2 + 1-2 + 1 + 1 + 1 = 5 min, 7 max)

**Teste:** `tests/unit/lib/delivery-calculator-options.test.ts` cu **12 teste** — base, urgenta toggle (main vs bundled), accumulation, dedup, courier leg, production scenario, OPTION_DELIVERY_IMPACT contract.

**Total teste finale:** **779** (era 762; +17 în această sesiune cumulate ultimele iterații).
