# Session 2026-04-29 — Wizard redesign (UX + Step 1/2 merge)

**Branch:** main (working tree, uncommitted)
**Continuă din:** 2026-04-28 (test infra + cleanup ESLint)
**Trigger:** wizard-ul avea redundanțe (step „Tip Client" separat de Contact, două locuri pentru Citizenship, summary card duplicat) + bug-uri cumulate (CNP off-by-one, motiv dropdown clipped, OCR progress stuck la 40%, crypto.randomUUID throws pe HTTP/IP local)
**Outcome:** Step 1+2 merge-uite, summary unificat, 5 bug-uri reproductibile fix-uite, 2 opțiuni deprecated curățate

---

## TL;DR

| Arie | Înainte | După |
|------|---------|------|
| Step 1 Contact | doar email/phone/preferredContact | + Tip Client + Cetățenie + Motivul (PF), eliminat preferredContact |
| Step „Tip Client" | step separat | merged în Contact |
| Step 2 Date Personale | citizenship dropdown duplicat, fără preview CNP, OCR progress stuck 40% | mode picker Scan/Manual, CNP live preview (`summarizeCNP`), country list filtered EU/non-EU, fake-anim 40→68% |
| Order summary | două componente diferite (sidebar wizard + checkout) | un singur `OrderSummaryCard` + `normalize.ts` canonical |
| Wizard progress | conectori segmentați între pași | track continuu fără segmente |
| `crypto.randomUUID()` | aruncă pe `http://192.168.x.x:3000` (telefon LAN) | fallback RFC4122 v4 + Math.random — `lib/random-id.ts` |
| Stripe metadata | doar `orderId` + `total` | + `line_N_*` per produs + `couponCode` + `discountAmount` + descriere bogată |
| Oblio TVA | 19% | 21% (aliniat cu rest of app) |
| Opțiuni deprecate | `verificare_expert`, `copii_suplimentare` în UI + drafts | curățate, auto-șterse din drafts vechi |

---

## Etape

### Etapa 1 — Layout & navigation

**README rewrite + gap fix.** Un gap vizual mare deasupra wizard-ului (margin top dublat din header global + container) apărea pe toate paginile `/comanda/*`. Containerul wizard reasezat cu padding-top redus.

**Mobile sticky bar.** Pe mobile, butonul „Continuă" era sub fold pe step-uri lungi (KYC + delivery). Adăugat sticky CTA bar la baza viewport-ului mobile cu prețul curent + buton mare; ascuns pe desktop.

**Scroll-to-top pe schimbare step.** La next/prev pasul fizic se schimba dar utilizatorul rămânea derulat la mijloc; adăugat `window.scrollTo({ top: 0 })` pe transition. Important pentru mobile unde tastatura îți mișcă viewport-ul.

**Wizard progress redesign.** Înainte: cerculețe numerotate cu conectori segmentați (linie ruptă între fiecare pas); design segmentat semna prost pe wizard cu 7-9 pași (PF cu KYC + signature + delivery + billing + review). Acum: un singur track continuu cu indicator de progres care alunecă, plus dot mic per pas (active/done/upcoming).

**Removed redundant order-code card.** Pe step 1 + 2 era afișat un card cu „Codul comenzii: ORD-…" — informație inutilă în wizard (utilizatorul nu are acțiune pe ea înainte de plată). Eliminat din `modular-order-wizard.tsx`.

### Etapa 2 — Order summary unificat

**Problema:** existau două componente care afișau aproape același conținut:
- Sidebar wizard (custom, în `modular-order-wizard.tsx`)
- Checkout/payment screen (componentă separată `OrderSummaryCard.tsx`)

Inconsistente: TVA calculat diferit, opțiunile aparente în formate diferite (uneori doar nume, uneori cu cantitate), couponul lipsea pe sidebar.

**Schimbare aplicată:**

1. **NOU `src/lib/orders/normalize.ts`** — `normalizeOrderOption()` + `normalizeOrderOptions()`. Acceptă oricare din cele 3 forme în care `selected_options` ajunge în cod (camelCase wizard runtime, snake_case DB, legacy admin) și produce `OrderOptionLine` canonical:
   ```ts
   { code, name, description, unitPrice, quantity, total, isAutoApplied, bundledForParentId }
   ```
   Append metadata (limbă/țară) la name automat. Filter zero-price by default.

2. **`OrderSummaryCard.tsx`** rescris ca single source of truth:
   - acceptă fie un `apiOrder` (DB shape) fie un `wizardState`
   - randează aceeași breakdown peste tot: linie produs principal + opțiuni (cu cantitate dacă > 1) + delivery + coupon (negativ) + subtotal + TVA 21% + total
   - suffixează numele serviciului cu „Cazier Judiciar PF" / „Cazier Judiciar PJ" în funcție de `clientType` (cerință legală pentru factură)
   - arată couponCode dacă există în breakdown

3. **API extension:** `apiOrder` returnat de `/api/orders/[id]` acum include `apiOrder.options` (array normalizat) + `breakdown.couponCode` (era doar pe wizard state, nu pe DB read). Permite checkout-ului post-redirect Stripe să afișeze couponul aplicat.

Sidebar wizard + status page + success page folosesc acum aceeași componentă cu props diferite — zero duplicare.

### Etapa 3 — Step 1 (Contact) merged cu Tip Client

`src/components/orders/steps-modular/contact-step.tsx`

**Înainte:** Contact (email/phone/preferredContact radio) → Client Type Selector (PF/PJ, step separat) → … 

**După:** Step 1 unificat cu:
- email + telefon
- Tip Client (PF/PJ) când serviciul îl cere — `verificationConfig.clientTypeSelection.enabled`
- Cetățenie (doar pentru PF) — toggle Romanian / Foreign cu sub-pick EU vs non-EU
- Motivul solicitării (doar pentru PF + cazier-services) — dropdown searchable, prioritized

**`PhoneInput`** (NOU `src/components/shared/PhoneInput.tsx`) — dropdown de țară cu flag prefix folosind `react-international-phone`. Validare E.164: `^\+[1-9]\d{6,14}$`. Default `+40`. Înlocuiește input simplu.

**Eliminat preferredContact.** Era radio „Telefon / Email / WhatsApp" care nu avea pickup nicăieri downstream — pure noise. Câmpul e șters din `customer_data.contact`.

**Citizenship toggle.** Doar pentru PF (PJ-urile sunt prin definiție entități juridice românești). 2 carduri mari (Cetățean român / Cetățean străin) cu pictograme `Flag` și `Globe`. Când e selectat „străin", apare un sub-panou amber cu 2 butoane (Născut în UE / Născut în afara UE) — necesar pentru filtrarea listei de țări la step 2 + arătare timp de procesare diferit (7-15 zile lucrătoare în loc de 3-5).

**Purpose dropdown.** `getPurposeOptionsForService(slug)` mapează slug-ul (cazier-judiciar / cazier-fiscal / cazier-auto / integritate) la una din 4 liste de motive importate din `src/config/motiv-options.ts`:

| Listă | Lungime | Service |
|-------|--------|---------|
| `MOTIV_CAZIER_OPTIONS` | 207 entries | cazier-judiciar |
| `MOTIV_CAZIER_FISCAL_OPTIONS` | 30 entries | cazier-fiscal |
| `MOTIV_CAZIER_AUTO_OPTIONS` | 7 entries | cazier-auto |
| `MOTIV_INTEGRITATE_OPTIONS` | 12 entries | integritate |

Cele mai folosite (ANGAJARE / ADOPȚIE / VIZĂ / EMIGRARE / CĂSĂTORIE / CONCURS / ALTE MOTIVE pentru cazier-judiciar) sunt afișate primele cu un badge „frecvent" prin prop-ul `priorityOptions` la `SearchableSelect`. Restul listei alfabetic; câmp de search inline.

Motivul ales se persistă pe `customer_data.contact.purpose` — apare scris pe documentul eliberat (cazier judiciar are câmp „motivul").

### Etapa 4 — Step 2 (Date Personale) refactor

`src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`

**Mode picker Scan vs Manual.** Înainte: input file pentru CI era arătat de la început, OCR rula imediat ce se uploada. Pentru mobile: utilizatorul trebuia să decide dacă scanează sau introduce manual înainte să vadă orice form.

Acum 2 carduri mari (mobile-first, side-by-side pe desktop):
- **Scan** — „Fotografiază CI-ul, completăm noi datele" (recomandat, badge primary)
- **Manual** — „Completez eu datele" (fallback, badge neutru)

State `mode: 'scan' | 'manual'` controlează ce randează. Switching între ele păstrează datele (utilizatorul poate scana, vedea OCR-ul, schimba la manual și corecta).

**CNP live preview.** Sub câmpul CNP, când utilizatorul tastează 13 cifre valide, apare un chip cu summary derivat:
```
02.07.1992 · Bărbat · Jud. Satu Mare
```
Folosește `summarizeCNP()` din `src/lib/validations/cnp.ts:277`. Returnează null dacă CNP invalid (chip ascuns). Util pentru a confirma vizual că CNP-ul e tastat corect, fără să aștepți validation submit.

**Removed citizenship Select.** Dropdown-ul de citizenship din step 2 era duplicat pentru cel din step 1 — acum e citit din `state.contact.citizenship`. Unique source of truth.

**Country dropdown filtrat.** Câmpul „Țară" pentru cetățeni străini folosea o listă plată cu 195 țări. Acum:
```ts
getCountriesForForeignType(state.contact.foreignType) // 'eu' | 'non-eu'
```
Returnează `EU_COUNTRIES` (28 entries) sau `NON_EU_COUNTRIES` (computed = `COUNTRIES \ EU_SET`). Configurat în `src/config/countries.ts`. Reduce drastic noise-ul (UE: ~28 opțiuni vs full 195) și e aliniat cu sub-pick-ul de la step 1.

**Adresa Domiciliu Romania required pentru cetățeni străini.** Pentru documentul cazier judiciar, instituția are nevoie de o adresă de domiciliu pe teritoriul României (chiar dacă cetățeanul e străin — adresa de rezidență legală). Câmpul „Adresa în România" devine required când `citizenship === 'foreign'`. Validation Zod corespunzătoare.

**OCR progress fake-animation.** Înainte: bara de progres OCR sărea la 40% imediat ce începea fetch-ul către Gemini, apoi rămânea blocată acolo 1.9-3.5s până la response → utilizatorul credea că s-a blocat. Acum: când fetch-ul începe, animație continuă smooth de la 40% la 68% peste durata estimată (3s). La response real, sare la 100%. UX-ul e perceput ca activ.

### Etapa 5 — Bug fixes

**1. `crypto.randomUUID` fallback (HTTP/mobile).**

Symptom: când utilizatorul deschide dev de pe telefon prin `http://192.168.1.5:3000`, wizard-ul throws `TypeError: crypto.randomUUID is not a function` la primul update de draft. Reason: `crypto.randomUUID` e disponibil DOAR în secure contexts (HTTPS sau localhost) — nu și pe IP local.

Fix: NOU `src/lib/random-id.ts` — `randomId()` cu 3 nivele de fallback:
1. `globalThis.crypto.randomUUID()` (preferred)
2. `getRandomValues(Uint8Array(16))` + RFC 4122 v4 manual (set version + variant bits)
3. `Math.random()` last resort (never in prod secure ctx)

Toate apelurile la `crypto.randomUUID()` din wizard providers + componente refactorate la `randomId()`.

**2. CNP date off-by-one (UTC drift).**

Symptom: CNP `1920702...` (născut 02.07.1992) extras corect pe display, dar pe contract apărea `01.07.1992`. Cauză: `validateCNP` construia data prin `new Date(year, month-1, day)` (locală) iar `toISOString()` mai târziu o reseta la UTC midnight → înainte de RO offset (UTC+2/3) datele se pierdeau cu 1 zi în vest.

Fix: `extractBirthDateFromCNP` returnează acum `Date` UTC (`Date.UTC(year, month-1, day)`). `summarizeCNP` formatează cu `getDate/getMonth/getFullYear` pe Date object (deja UTC) → fără drift.

**3. CNP-derived auto-fill.**

Când utilizatorul tastează CNP-ul (sau e auto-completat din OCR), step 2 acum auto-completează:
- `birthDate` = derivat din primii 7 digiți
- `birthPlace` = județul derivat din digiții 8-9 (cod 01-52, mapat la nume județ via `COUNTY_CODES`)

Înainte trebuiau introduse manual chiar dacă info-ul era 100% deductibil din CNP. Reduce ~3 câmpuri pe utilizator.

**4. Eliminat emojis (lucide icons everywhere).**

Existau emojis hardcoded (✅, 🚀, 🔒, 📞) în 7+ componente. Toate înlocuite cu icons `lucide-react` (CheckCircle, Rocket, Lock, Phone). Consistency vizuală + render correct pe browsere fără emoji font.

**5. Motiv dropdown z-index (Portal escape).**

Symptom: dropdown-ul `SearchableSelect` cu lista de 207 motive era clipped vertical în step 1 — parent-ul avea `overflow-hidden` (necesar pentru border-radius pe card-ul wizardului). Lista se vedea trunchiată la ~5 entries.

Fix: `SearchableSelect` randează acum dropdown-ul prin `React.createPortal` direct în `document.body` cu position absolute calculat dinamic la trigger. Escape complet din overflow-hidden parent. z-index 9999.

**6. Motiv priority ordering.**

Înainte: lista alfabetică plată — utilizatorul trebuia să caute „ANGAJARE" printre 207 entries. Acum: pe top sunt afișate cele mai folosite (badge „frecvent"), apoi separator vizual, apoi restul alfabetic. Vezi `getPurposePriorityForService(slug)` din `contact-step.tsx`.

### Etapa 6 — Stripe + Oblio metadata

**Problema:** Stripe PaymentIntent avea doar `metadata: { orderId, totalAmount }`. Pentru reconciliation Stripe ↔ Oblio + audit financiar, lipseau detalii pe ce s-a plătit. Plus discount-ul de coupon nu apărea nicăieri în Stripe.

**Schimbare aplicată în PaymentIntent creation (`src/lib/stripe.ts`):**

- `description` îmbogățit:
  ```
  Cazier Judiciar PF — ORD-260429-XXXXX
  ```
  (fallback sensible dacă serviceName lipsește)

- `metadata` extins per linie:
  ```ts
  {
    orderId: '...',
    friendlyOrderId: 'ORD-260429-XXXXX',
    totalAmount: '36861',  // cents
    line_1_name: 'Cazier Judiciar PF',
    line_1_price: '25000',  // cents per unit
    line_1_code: 'cazier-judiciar-pf',
    line_2_name: 'Apostilă Haga',
    line_2_price: '10000',
    line_2_code: 'apostila_haga',
    // ...
    couponCode: 'WELCOME10',  // dacă aplicat
    discountAmount: '2500',   // cents
    cnp: '***1234',           // masked (privacy)
    cui: 'RO12345678',        // plain text PJ
  }
  ```

  Stripe limit: 50 keys, 500 chars each. Cu prefix `line_N_*` rămânem sub limit pentru până la ~10 opțiuni.

- **Oblio TVA 19% → 21%.** Aliniere cu rest of app (TVA RO actual). `vatRate` schimbat în `src/lib/oblio/invoice.ts` la `21`. Fără impact pe display (e calculat din total — utilizatorul plătește același total inclusiv-TVA), dar factura legală apare corect.

### Etapa 7 — Cleanup deprecated options

Două opțiuni rămase de la versiuni vechi ale wizard-ului:

| Opțiune | Status | Acțiune |
|---------|--------|---------|
| `verificare_expert` | nu mai e în service config, dar apărea în UI dacă era în draft vechi | scoasă din randerul Options step + curățat din auto-resync drafts |
| `copii_suplimentare` | înlocuit de quantity pe alte opțiuni | scoasă din UI + drafts |

Drafts auto-cleanup: la load, dacă draft conține codes care nu mai sunt în service config, sunt filtered out tăcut. Fără breaking change pentru utilizatori cu drafts vechi în localStorage.

---

## Persistare DB

Toate noile câmpuri se salvează automat prin pipeline-ul existent:

```ts
customer_data.contact = {
  email, phone,
  citizenship: 'romanian' | 'foreign',
  foreignType: 'eu' | 'non-eu' | undefined,
  purpose: '...',  // motivul ales
}
```

Niciun migration nou necesar — `customer_data` e JSONB pe `orders`, schema-less by design.

Admin order detail (`/admin/orders/[id]`) afișează acum 2 rânduri noi:
- **Cetățenie:** Cetățean român / Cetățean străin (UE) / Cetățean străin (non-UE)
- **Motivul solicitării:** valoarea purpose

---

## Validare

- `npx tsc --noEmit` → exit 0
- `npm run lint` → 0 erori, 3 warnings React Compiler informaționale (pre-existente)
- `npm test` → 596 passed (zero regresii pe test suite existent)
- Test manual flux PF complet: contact → personal data scan + manual mode → KYC → options → signature → delivery → billing → review → payment OK
- Test manual cetățean străin: foreignType=eu, country list filtrată corect, adresă Romania required
- Test manual mobile sticky bar pe iPhone Safari + Chrome Android

---

## Fișiere modificate

```
src/components/orders/steps-modular/contact-step.tsx              (rewrite — merged Tip Client)
src/components/orders/modules/personal-kyc/PersonalDataStep.tsx   (mode picker, CNP preview, OCR progress)
src/components/orders/modular-order-wizard.tsx                    (progress redesign, sticky bar, scroll-to-top)
src/components/payment/OrderSummaryCard.tsx                       (rewrite — unified, breakdown, coupon)
src/components/shared/PhoneInput.tsx                              NOU (react-international-phone wrapper)
src/components/shared/SearchableSelect.tsx                        (Portal for z-index escape, priority ordering)
src/lib/orders/normalize.ts                                       NOU (canonical option shape)
src/lib/random-id.ts                                              NOU (UUID fallback)
src/lib/validations/cnp.ts                                        (summarizeCNP added, UTC drift fix)
src/config/countries.ts                                           (EU_COUNTRIES + getCountriesForForeignType)
src/config/motiv-options.ts                                       (4 lists already existed; no change today)
src/lib/stripe.ts                                                 (per-line metadata, rich description)
src/lib/oblio/invoice.ts                                          (TVA 19→21)
src/app/api/orders/[id]/route.ts                                  (apiOrder.options + breakdown.couponCode)
src/app/admin/orders/[id]/page.tsx                                (display Cetățenie + Motivul)
src/providers/modular-wizard-provider.tsx                         (auto-clean deprecated options, randomId)
package.json                                                      (+react-international-phone)
```

Plus refactor minor în ~6 componente pentru emojis → lucide icons.

---

## Etapa 8 — Iterații suplimentare (2026-04-29 PM)

A doua jumătate a sesiunii a fost focusată pe coupon UX la checkout, expansiune completă a fluxului pentru cetățeni străini (aliniere cu cazierjudiciaronline.com), suport PDF pe upload-uri ID, plus extindere test coverage cu helper-i pure-function și E2E Playwright.

### 8.1 Coupon input pe pagina de checkout

Anterior couponul putea fi aplicat doar din wizard (la review step) — utilizatorul care ajungea pe checkout fără coupon nu mai avea cale înapoi fără să reia comanda. Adăugat:

- **NOU `src/app/api/orders/[id]/coupon/route.ts`** — POST + DELETE.
  - POST validează codul, recalculează `total_price`, persistă `coupon_code` + `discount_amount`. Critical: **anulează PaymentIntent-ul Stripe existent** (`paymentIntents.cancel`) ca să se genereze unul nou cu suma corectă la următorul fetch al pagini.
  - DELETE restaurează subtotal-ul, același cancel intent.
  - Refuză operația dacă `payment_status === 'paid'`.
- **NOU `src/components/payment/CouponInput.tsx`** — două stări: default (input + Aplică) / applied (card verde cu × Elimină); loader spinner; inline errors.
- Integrat în sidebar-ul checkout-ului sub `OrderSummaryCard`. La apply/remove → `handleCouponChange()` setează `clientSecret = null` și refetch-uiește order-ul (forțează re-create PaymentElement cu suma corectă).

### 8.2 Cetățean străin — flux complet (aliniere cazierjudiciaronline.com)

Înainte: doar toggle Romanian/Foreign + EU/non-EU sub-pick. După: flux end-to-end pe step 1, 2, și 4 cu câmpuri și documente specifice.

**Step 1 (Contact)** — `src/components/orders/steps-modular/contact-step.tsx`:
- NOU `<ForeignBirthFields>` randat ABOVE motivul, BELOW sub-pick-ul EU/non-EU. 2 câmpuri: Localitatea Nașterii + Țara Nașterii (filtered prin `getCountriesForForeignType`). Salvează în `state.personalKyc.foreignData.{birthCity, birthCountry}` via `updatePersonalKyc`.
- Hint sub butonul „Cetățean străin": *„Marchează această opțiune dacă nu ești născut în România dar ai permis de rezidență sau de ședere"*.
- Bug fix: `ForeignBirthFields` era doar în prefilled view, lipsea din editable form — acum în ambele.

**Step 2 (Date Personale)** — `src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`:
- Mode picker auto-skip la `'manual'` pentru străini (CI scan irelevant).
- Mesajul mode manual updated: *„La pasul 4 va trebui să încarci 3 documente: pașaportul deschis, selfie cu pașaportul, permisul de rezidență / certificat de înregistrare fiscală"*.
- CNP devenit OPȚIONAL pentru străini (label: „(opțional pentru cetățeni străini)", placeholder: „Lasă gol dacă nu ai CNP").
- „Locul Nașterii" HIDDEN pentru străini (deja la step 1 ca `birthCity`).
- Address Section restructurat: pentru români → grid existing (Județ/Localitate/Stradă); pentru străini → toggle nou „Am domiciliu în România? Da/Nu". Da → grid românesc; Nu → country dropdown EU/non-EU + `foreignAddress` text. Validation split pe `hasRomanianAddress`.

**Step 4 (KYC Documents)** — 3 sloturi noi pentru străini, oglindă pe cazierjudiciaronline.com:
1. **Pașaport** (deschis — ambele pagini vizibile) — doc type nou `passport`.
2. **Selfie cu Document** (label updated: „cu CI sau pașaport").
3. **Permis Rezidență / Certificat de Înregistrare Fiscală**.

Românii păstrează fluxul existing (CI scan + selfie + cert domiciliu). Toate documentele pentru străini sunt mandatory (validation enforced). File accept extins cu `application/pdf`.

### 8.3 Suport PDF pe upload-uri ID

`accept="image/jpeg,image/jpg,image/png,application/pdf"` (era doar JPG/PNG). În `handleFileSelect`, branch nou: PDF-uri citite via `arrayBuffer().toString(base64)` fără compresie; imaginile rămân pe `compressImage()`. Gemini OCR API acceptă `application/pdf` mimeType nativ. Preview placeholder card (FileCheck icon + „Document PDF încărcat") în loc de `<img>` pentru PDF-uri. Hint text updated: „JPG, PNG sau PDF, max 10MB".

### 8.4 Country list — corecții oficiale

- **„Olanda" → „Țările de Jos"** (per Romanian MAE post-2020 Dutch rebrand).
- Verificat lista contra europa.eu official EU member states (27 confirmate post-Brexit).
- Re-sortat în `COUNTRIES` și `EU_COUNTRIES` din `src/config/countries.ts`.

### 8.5 Unit tests — foreign-citizen helper

- NOU `src/lib/validations/foreign-citizen.ts` cu `validateForeignKyc()` pure function — extras din inline component validation pentru testabilitate izolată.
- NOU `tests/unit/lib/validations/foreign-citizen.test.ts` — **17 teste** acoperă:
  - path român: CNP required + valid checksum
  - foreign + Romanian domicile: birth city/country + Romanian address required
  - foreign abroad: `foreignAddress` required, Romanian address NOT required
  - CNP optional pentru străini (dar dacă e completat, must be valid)

**Total unit tests:** **645** (era 628, +17).

### 8.6 E2E Playwright — foreign-citizen flow

NOU `tests/e2e/wizard/foreign-citizen-flow.spec.ts` — 5 teste, toate trec pe chromium:
1. Tile „Cetățean Străin" vizibil după pick PF.
2. Helper hint + EU/non-EU + birth panel revealed la click.
3. Country dropdown filtrează corect EU vs non-EU (verificat specific: Germania, Țările de Jos vs USA, UK, Turcia).
4. Foreign panel wrapped cu border amber.
5. Hint dispare când switch înapoi la „Cetățean Român".

Notă: testele se opresc la step 1 (visibility/state). Advance prin tot wizard-ul e brittle pentru că `react-international-phone` nu sync-uiește state-ul cu Playwright `.fill()` — flow-ul complet cu plată e acoperit deja în `full-order-flow.spec.ts`.

### 8.7 DB persistence (zero migrations)

Toate noile câmpuri persistă prin pipeline-ul JSONB existent:
- `customer_data.contact.{citizenship, foreignType, purpose}` (step 1)
- `customer_data.personal.foreignData.{birthCity, birthCountry, hasRomanianAddress, foreignAddress}` (step 1 + step 2 toggle)
- `customer_data.personal.uploadedDocuments[]` cu `type: 'passport'` (nou pentru străini)
- `orders.coupon_code` + `orders.discount_amount` (existau, acum mutable din checkout via API nou)

### 8.8 Admin display (no changes needed)

`/admin/orders/[id]` afișează deja:
- Date contact card → Cetățenia + Motivul (adăugat în Etapa 4, încă funcționale).
- Documents section → toate documentele inclusiv `passport` (via `getDocumentLabel`).

### Fișiere noi/modificate (Etapa 8)

```
src/app/api/orders/[id]/coupon/route.ts                            NOU (POST/DELETE coupon, intent cancel)
src/components/payment/CouponInput.tsx                             NOU (default/applied states)
src/components/orders/steps-modular/contact-step.tsx               (ForeignBirthFields, hint, helper)
src/components/orders/modules/personal-kyc/PersonalDataStep.tsx    (CNP opt., addr toggle, mode auto-skip, PDF accept)
src/components/orders/modules/personal-kyc/KYCDocumentsStep.tsx    (3 foreign slots, passport type, PDF accept)
src/lib/validations/foreign-citizen.ts                             NOU (validateForeignKyc pure fn)
src/config/countries.ts                                            (Olanda → Țările de Jos, re-sort)
tests/unit/lib/validations/foreign-citizen.test.ts                 NOU (17 tests)
tests/e2e/wizard/foreign-citizen-flow.spec.ts                      NOU (5 tests)
src/app/comanda/checkout/[orderId]/page.tsx                        (sidebar CouponInput, handleCouponChange)
```
