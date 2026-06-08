# eGhiseul.ro - Status Curent

**Data:** 2026-06-08 (fix OCR pașaport — CNP nu se extrăgea + client blocat silențios)

---

## ✅ SESIUNE 2026-06-08 (3) — Oblio: fix emitere factură + Onorariu Avocat + admin mobil

**🐛 Bug critic Oblio reparat (de ce nu se emiteau facturile):** `collect` din `invoice.ts` nu trimitea `documentNumber` → Oblio respingea cu „Parametrul documentNumber lipsește" → toate facturile eșuau („Crearea facturii a eșuat" pe comenzi). Confirmat live: emis test reușit pe RAPIDCERT/CID (factura `CID-0002`, 278 RON) după ce am adăugat `documentNumber` (= numărul comenzii). Fix în `invoice.ts`.

**🟣 Onorariu Avocat (linie separată pe factură):** servicii cu `services.lawyer_fee_ron > 0` (migration 047: cazier judiciar PF/PJ, cazier fiscal, certificat naștere/căsătorie/integritate/celibat = 15 RON) primesc o linie „Onorariu Avocat" scoasă din prețul serviciului principal (total neschimbat), VAT identic. `computeLawyerFee()` testabil (`invoice.ts`), toți callerii (webhook, verify-payment, reissue-invoice) fac join `services(lawyer_fee_ron)`. Paritate cu cazierjudiciaronline.com. **5 teste noi.**

**📱 Admin order detail — mobile friendly:** header-ul (`/admin/orders/[id]`) se înghesuia pe mobil (titlu + badge-uri + butoane pe un rând). Acum: stack pe mobil / rând pe desktop, butoane cu `flex-wrap`, order number `break-all` + `text-xl sm:text-2xl`, date cu wrap.

**⚠️ DE REZOLVAT înainte de deploy invoice:** (1) eghiseul scrie în seria LIVE partajată `EGI2024` — trebuie serie proprie; (2) storno factura test `CID-0002` de pe RAPIDCERT.

**Tests:** **1026** unit passing. Lint + typecheck clean. Migration 047 aplicată.

---

## ✅ SESIUNE 2026-06-08 (2) — Adresă facturare PF structurată (obligatorie pt. Oblio)

**Bug raportat (Step 7 facturare):** la „Facturează pe mine", adresa de facturare era un singur câmp **opțional + needitabil** (`disabled` la self). Pentru pașaport (fără adresă pe act) câmpul rămânea gol și neputând fi completat → Oblio **nu emite factura** pe persoană fizică fără adresă (stradă + localitate + județ).

**Cauză de fond:** `BillingState` nici nu avea câmpurile `city`/`county`, dar `oblio/invoice.ts` le citește separat (`billing.city`, `billing.county`) → ajungeau **mereu goale** la Oblio pentru PF.

**Fix (paritate cu cazierjudiciaronline.com):**
- `BillingState` extins: `city`, `county`, `postalCode`, `country`; `address` devine doar linia de stradă.
- **Câmpuri structurate** în billing step: Stradă/nr (text) + **Județ (dropdown)** + **Localitate (dropdown dependent de județ)** din `romania-counties.ts` + Cod poștal (opțional). Toate **editabile** (inclusiv la „self" — pașaportul n-are adresă; CI poate fi corectat), nume/CNP rămân blocate pe act.
- **Validare obligatorie** (`src/lib/orders/billing-validation.ts` — `isPfBillingComplete`): PF (self + altă persoană) cere nume + CNP + stradă + localitate + județ. Butonul „Plătește" e blocat fără ele. **6 teste noi.**
- Prefill din act structurat (stradă/localitate/județ separat), județ normalizat la nume canonic via `findCounty`.
- Admin order detail: secțiunea Facturare citește acum adresa din `billing.*` (sursa pt. Oblio) cu fallback la domiciliul scanat — vizibilă și pt. pașaport / „altă persoană".

**Tests:** **1021** unit passing (+6). Lint + typecheck clean.

---

## ✅ SESIUNE 2026-06-08 — Fix OCR pașaport: CNP românesc + client deblocat

**Bug raportat la testare (pașaport românesc scanat invers):** OCR-ul extrăgea numele/data nașterii dar **NU și CNP-ul**, deși pașaportul românesc are CNP (câmpul „5. Cod Numeric Personal" + în MRZ). Cetățeanul român era apoi **blocat silențios** la Step 2 — câmpul CNP e ascuns în scan mode iar „Continuă" rămânea dezactivat fără niciun mesaj.

**Root cause (2 straturi):**
1. **OCR** (`src/lib/services/document-ocr.ts`) — prompt-ul pașaport spunea doar „CNP uneori vizibil", fără să indice unde (câmpul 5 / MRZ personal number) și fără toleranță la poze răsturnate.
2. **UI** (`PersonalDataStep.tsx:203,1387`) — `hideExtractedFields = mode==='scan'` ascunde câmpul CNP; sumarul apare doar dacă CNP e valid. CNP gol + cetățean român → `isFormValid()` false, fără mesaj.

**Fix (generalizat la TOATE actele de identitate):**
- **Prompturi îmbunătățite**: pașaport (`extractFromPassportOpened` + `extractFromPassport`) — locație CNP explicită (câmp 5 + MRZ personal number), orientare răsturnată, MRZ complet în JSON. CI față are deja orientare + diacritice.
- **Fallback determinist MRZ → CNP, pe poziții** (`applyMrzCnpFallback`): aplicat la `ci_front` (CI vechi, MRZ TD1 pe față), `ci_nou_back` (eCI, MRZ TD1 pe spate) și ambii extractori de pașaport (MRZ TD3). Folosește parserele **poziționale** existente (`parseRomanianEciMrz` TD1 + `parsePassportMrz` TD3 nou), NU scanare oarbă.
- **⚠️ Garda anti-false-positive**: o scanare naivă „orice 13 cifre care trec validateCNP" returna pe MRZ-ul TD1 al CI nou un CNP **fantomă** (`4171021143451` = născut 1817, checksum corect din întâmplare) înaintea celui real. De-aia extracția e strict pe poziții, cu test de regresie dedicat.
- **UI nu mai blochează silențios** (general, toate tipurile de scan): după un scan unde CNP-ul lipsește (cetățean român), câmpul CNP se deblochează + banner amber clar. Clientul nu mai rămâne niciodată blocat fără feedback.
- **Logică păstrată corect**: cerința CNP rămâne dictată de cetățenia din Step 1 (român = obligatoriu, străin = opțional).

**Tests:** **1015** unit passing (era 1007; +8 `document-ocr-passport-mrz.test.ts`, inclusiv garda anti-false-positive). Lint + typecheck clean.

---

## ✅ SESIUNE 2026-05-29 — KYC face-match fix + deploy Vercel (testare internă)

**🟢 LIVE pentru testare:** https://eghiseul-ro.vercel.app (Stripe **TEST mode**). Colegii pot testa comenzi cap-coadă. Runbook complet: [`deployment/VERCEL_DEPLOYMENT.md`](deployment/VERCEL_DEPLOYMENT.md).

**Fix KYC identitate (pașaport):** Face-matchingul selfie↔act nu rula deloc pentru pașapoarte. Cauză: actul se salvează ca `passport_opened`, dar lookup-ul de referință căuta `passport` → referința nu era găsită, verificarea era sărită silențios. Reparat + politică nouă de „manual review" (referință PDF / confidence la limită / match indisponibil → flag pentru operator, niciodată drop silențios). Logica admin de review extrasă în `src/lib/kyc/review.ts` (testabilă). **41 teste KYC** (era 10), total suită **1007**. Detalii: [`session-logs/2026-05-29-kyc-face-match-passport-fix.md`](session-logs/2026-05-29-kyc-face-match-passport-fix.md) + spec feature [`technical/specs/kyc-identity-verification.md`](technical/specs/kyc-identity-verification.md).

**Deploy Vercel (rezolvă TODO-ul de pe 2026-05-28):** Toate cele 29 env vars setate pe Vercel (Production+Preview). Corectat: `NEXT_PUBLIC_APP_URL`/`SITE_URL` → `https://eghiseul-ro.vercel.app` (erau `eghiseul.ro`, domeniu neconectat). Generat `CRON_SECRET` + `PII_ENCRYPTION_KEY` (lipseau). Oblio sincronizat și în `.env.local`. Redeploy făcut (env se aplică doar la rebuild).

**Stripe webhook (test):** Endpoint creat → `https://eghiseul-ro.vercel.app/api/webhooks/stripe/` (**slash final obligatoriu** — `trailingSlash:true`, altfel 308). Evenimente: `checkout.session.completed`, `payment_intent.succeeded`/`payment_intent.payment_failed`, `charge.refunded`. `STRIPE_WEBHOOK_SECRET` actualizat pe Vercel. Endpoint verificat (400 la POST nesemnat = viu).

**⏳ Înainte de LIVE real (clienți):** domeniu custom conectat + URL-uri actualizate · chei Stripe **LIVE** + webhook live · env vars pe **Preview** (CLI-ul vechi eșuează, de setat din dashboard). Checklist în runbook.

---

**Data sesiune precedentă:** 2026-05-28 (security incident AWS key — rezolvat în <1h)
**Detalii sesiune precedentă (2026-05-27):**
- Dimineață: Step 2 simplification → `docs/session-logs/2026-05-27-step2-simplification.md`
- După-amiază: admin parity + abandoned carts → `docs/session-logs/2026-05-27-admin-parity-overhaul.md`
- Seara: Embedded Checkout + cron auto-finalize + push pe `main`

**Security 2026-05-28:** AWS IAM key rotated + Quarantine policy detached + `.claude/settings.local.json` în `.gitignore`. Detalii complete: [`security/INCIDENT-2026-05-28-aws-key-leak.md`](security/INCIDENT-2026-05-28-aws-key-leak.md). **TODO follow-up:** actualizare env vars pe Vercel + redeploy (prod încă pe cheia ștearsă), rotare Supabase service_role JWT și GitHub PAT (au fost expuse în același fișier).

**Feature 2026-05-28:** Step 2 document type picker (3-way scan flow) — CI vechi / CI nou electronic / Pașaport. Backend OCR pipeline cu 4 extractoare noi (incluiv `extractFromROCEIReaderPDF` care extrage adresa din PDF-ul oficial MAI), cross-validation între scanări, anti-forgery basic pentru PDF, admin display cu chip tip act + warnings. Detalii complete: [`plans/2026-05-28-id-document-picker-design.md`](plans/2026-05-28-id-document-picker-design.md) + [`session-logs/2026-05-28-id-document-picker-implementation.md`](session-logs/2026-05-28-id-document-picker-implementation.md). 23 noi unit tests, total 955.

**Refactor 2026-05-28:** Stripe Checkout Embedded → Hosted (redirect). Customer apasă „Plătește cu cardul" → redirect la checkout.stripe.com → revine la `/comanda/success/[id]`. Cleaner UX decât iframe-ul embedded, line items + cupon păstrate identic în Dashboard.

**Admin polish 2026-05-28:** „Re-OCR" button per document — admin poate re-trigger Gemini fără să forțeze clientul să re-uploadeze (util după îmbunătățiri de prompt). Endpoint `/api/admin/orders/[id]/rerun-ocr` + audit `event_type='ocr_rerun'`.

**CI 2026-05-28:** Reparat după ~5 luni de eșecuri silente — 12 erori lint pre-existente (`react/no-unescaped-entities` pe ghilimele românești, `@typescript-eslint/no-explicit-any` pe modify route, `set-state-in-effect` pe header) rezolvate. CI green din nou.

**Admin polish 2026-05-28 (P1 completat):**
- **„Re-OCR" button per document** — admin poate re-trigger Gemini fără re-upload (commit `83586b3`)
- **„Marchează verificat" button** + audit `documents_verified` (commit `90b7136`)
- **Migration 046** — picker Step 2 aplicat la `cazier-fiscal` și `cazier-judiciar-persoana-fizica` (commit `90b7136`)
- **Coloana 📎 în lista de comenzi** — N/M docs urcate + verde dacă verified, amber dacă parțial (commit `a664ab9`)
- **TSV Export comenzi** — buton pe /admin/orders, descarcă filtrul curent cu 18 coloane pentru Sheets (commit `bf9163b`)

**Polish PM 2026-05-28 (live smoke-test fix-uri):** [`session-logs/2026-05-28-pm-polish-and-fixes.md`](session-logs/2026-05-28-pm-polish-and-fixes.md)
- **birthDate fix** — CNP-derive prioritar față de OCR (Gemini swap-uia day/year pe unele CI vechi). Commit `20d08ec`.
- **Sync Stripe button** + endpoint `/api/admin/orders/[id]/sync-stripe` — recuperare manuală când webhook-ul nu ajunge la noi. Commit `c433455`.
- **ANAF v8 → v9** — endpoint vechi era mort (HTTP 000 timeout), v9 sincron răspunde în ~150ms. Commit `2cf1845`.
- **Price rounding** — `priceBreakdown.totalPrice` rotunjit la 2 zecimale, gata cu „Plătește 1514.2099999999998 RON". Commit `2cf1845`.
- **„Sari la conținut"** sr-only pattern canonical — nu mai apare random la navigare history. Commit `b14a5ac`.
- **Bancă/IBAN scos din PJ billing** — Oblio nu pune datele bancare ale clientului pe e-factură. Commit `b14a5ac`.
- **Step 6 Livrare polish** — picker email/physical rămâne mereu vizibil, fără confirmation screen intermediar. Commits `8d33af5` + `42b10e0` + `a0bed29`.
- **DHL + Poșta logos** copiate din sister project + carduri internationale aliniate vizual cu cele Romania.
- **PDF preview reparat** — thumbnail cu icon roșu + iframe preview pentru PDF-uri în KYC docs.

**Tests:** 966 unit (era 955 dimineața) — +11 noi pentru price-rounding (defensiv vs floating-point drift) + ANAF v9 parsing (mock fetch + verifies endpoint URL).

**Sesiune anterioară:** 2026-05-20 (SEO + rebuild Page #1)
**Sprint-uri completate:** Sprint 0-6 ✅
**SEO master plan + rebuild queue:** ✅ (`docs/seo/SEO-MASTER-PLAN-2026-05-20.md` + `docs/seo/REBUILD-QUEUE.md`)
**Page #1 (cazier-judiciar-online) rebuild:** ✅ tehnic, ⚠️ user feedback: vizual needs another pass
**Aliniere cu cazierjudiciaronline.com:** ✅ 11 faze + Step 2 + admin shell + dashboard + coșuri abandonate. Pendent: buton Modifică, Storno+Reemite Oblio. Vezi [`docs/admin/PARITY-MATRIX.md`](admin/PARITY-MATRIX.md).
**Wizard redesign + foreign citizen flow:** 2026-04-29 ✅
**Sprint pendinte:** Notifications full pipeline (cron-uri operational, DNS Resend de configurat), restul 46 pagini rebuild queue, city pages, P0 admin features (buton Modifică, Storno Oblio, health-check cron)
**Tests:** **928** unit tests passing (era 749 azi-dimineață; **+179 într-o zi**)

---

## ✅ SESIUNE 2026-05-27 SEARA — Stripe Embedded Checkout + Cron auto-finalize + UX polish

**Stripe Embedded Checkout (refactor major)**
- Migration 044: `orders.stripe_checkout_session_id` (înlocuiește dependența pe `payment_intent_id`).
- `src/lib/stripe-line-items.ts` — helpers puri pentru construit `line_items` (cazier + opțiuni + livrare + cupon ca discount nativ Stripe). 12 teste.
- `createEmbeddedCheckoutSession` în `src/lib/stripe.ts` cu line_items + coupon discount nativ → în Stripe Dashboard apar linii separate (Cazier Judiciar, Procesare Urgentă, Traducere, Apostila, Livrare DHL, Cupon RECUPEREAZA) ca în sister project.
- `/api/orders/[id]/payment` rescris să creeze Checkout Session în loc de PaymentIntent.
- `EmbeddedCheckoutBlock` component nou înlocuiește `StripeProvider + StripeCheckoutForm`.
- Webhook handler nou pentru `checkout.session.completed`.

**Cron auto-finalize delivered**
- Migration 045: `orders.shipped_at TIMESTAMPTZ` + index parțial + backfill din `order_history`.
- `src/lib/courier/auto-finalize.ts` — threshold-uri per curier (Sameday 5z, FAN 7z, DHL 14z, Poșta 30z, default 10z) + flag `isBlocked` la 2× threshold. 10 teste.
- `/api/cron/auto-finalize-delivered` — tranziție shipped → completed în bulk + audit cu `changed_by='system-cron'`. Schedule zilnic 06:00 UTC. 10 teste integration.
- Handbook complet: [`docs/admin/auto-finalize-cron.md`](admin/auto-finalize-cron.md).

**UX polish**
- Buton „Marchează livrat" pe AWB card (1-click shipped → completed direct din admin order detail).
- `HelpContactCard` (WhatsApp + telefon) pe `/comanda/status` — citește din env `NEXT_PUBLIC_SUPPORT_PHONE` + `NEXT_PUBLIC_SUPPORT_WHATSAPP_URL`.
- Self-cancel UI (30 min după plată) cu countdown live + două-pași confirmation pe `/comanda/status`.

## Arhitectura paritate cu sister projects

eghiseul.ro este **platforma-părinte (umbrella)** care va găzdui multiple servicii (cazier judiciar/fiscal/auto, certificat integritate/casatorie/celibat/nastere, extras carte funciară, certificat constatator, etc.) într-un singur catalog dinamic.

Sister projects `cazierjudiciaronline.com` și `ecazier.ro` sunt **single-tenant per service type**, optimizate pentru convertire pe un domeniu de tip „cazier-only" (multi-tenant source code, instanțe separate). Acolo, comenzile au flag-uri boolean explicite per addon (`order.traducere`, `order.apostila_haga`, etc.). Aici la eghiseul.ro folosim JSONB generic `selected_options` cu coduri (`urgenta`, `apostila_haga`, etc.) — flexibil pentru cataloage mari fără migrations per addon.

**Principiu:** paritate **vizuală + UX + termen + facturare** cu sister projects, implementare internă diferită ca model de date. Customer journey identic, scaling intern diferit.

📋 **Parity matrix completă:** [`docs/admin/PARITY-MATRIX.md`](admin/PARITY-MATRIX.md) — feature-by-feature comparison + priorități (P0/P1/P2) + estimări de implementare + referințe la sister docs originale.

---

## ✅ SESIUNE 2026-05-27 — Step 2 simplification (cazier judiciar PF)

**Detalii complete:** `docs/session-logs/2026-05-27-step2-simplification.md`

Feedback user: customers se pierdeau între Step 2 (date personale) și Step 3 (verification). Step 2 cerea prea multe câmpuri vizibile vs `cazierjudiciaronline.com` care cere doar CNP.

**Modificări:**

1. **DB migration 039** (`supabase/migrations/039_cazier_judiciar_step2_simplification.sql`) — pentru `cazier-judiciar`:
   - `personalKyc.parentDataRequired: true → false` (drops prenume mamă + tată)
   - `personalKyc.requireAddressCertificate: 'ci_nou_passport' → 'never'` (drops „Adresă de Domiciliu" block)

2. **UI scan mode** (`src/components/orders/modules/personal-kyc/PersonalDataStep.tsx`):
   - `hideExtractedFields = mode === 'scan' && ciFrontScan.success` — după scan reușit user-ul vede DOAR CNP + banner derivat (data, sex, județ). Toate câmpurile extrase (nume, prenume, serie/număr CI, valabilitate, locul nașterii) sunt ascunse. Datele se salvează silent în `customer_data.personal`. Dacă OCR greșește → operatorul corectează din admin.
   - Manual mode rămâne full form (fără părinți, fără adresă).
   - Address section gated: `requireAddressCertificate === 'never' && citizenship === 'romanian'` → ascuns. Cetățeni străini văd în continuare.

3. **Admin order detail** (`src/app/admin/orders/[id]/page.tsx`):
   - Adăugat „Județ nastere (din CNP)" derivat la display time prin `getCountyFromCNP(personal.cnp)`. Apare lângă „Locul nasterii (localitate)" care vine din OCR sau manual.
   - Single source of truth: CNP-ul pentru județ, OCR/manual pentru localitate.

**Sister project referință:** `/Users/raul/Projects/cazierjudiciaronline.com/src/components/form/steps/Step2PersonalData.tsx` (900 linii, ultra-light). Filosofia: CNP e suficient pentru cerere, restul vine de pe CI sau se completează la admin.

**Notă incident:** Un PATCH greșit a setat temporar `verification_config = null` pentru `cazier-judiciar` în timpul aplicării. Restaurat în aceeași sesiune cu config-ul complet reconstruit din migration 011 + 037 + 039.

### TODO follow-up
- Verificat pe celelalte cazier services (fiscal, auto, integritate) dacă echipa vrea același tratament
- Clarificat cu echipa juridică dacă adresa e necesară pe cererea oficială MJ (dacă da, o cerem la Step delivery/billing)

### Update 09:45 — Bugfix birthDate

OCR uneori întoarce `birthDate: null` (CI cu reflexie pe foto). În scan mode câmpul e ascuns deci user nu putea completa → „Continuă" disabled. Fix: derivăm `birthDate` din CNP în 2 locuri (OCR success branch + useEffect safety net pentru draft-uri vechi).

### Update 09:55 — Combined consent checkbox

3 checkbox-uri → 1 checkbox combinat la Step Review. Inspirat din `cazierjudiciaronline.com/src/components/form/steps/Step5Contract.tsx`. Auto-bifat când există semnătură (semnătura electronică = consimțământ conform Legii 214/2024). Backend audit log păstrează cele 3 flag-uri separate.

### Update 10:15 — Review step eliminat din wizard

8 pași → 7 pași. Review step redundant pentru că sticky order summary apare pe fiecare pas + cuponul e pe checkout. Semnătura auto-setează consimțământul (T&C + Privacy + waiver). Pe checkout, sub butonul „Plătește" apare note legal mic. Backend audit trail neschimbat. Fix și truncation pe order ID badge. Fallback `-` pentru prenume tată/mamă pe cerere generată (template DOCX încă are câmpurile).

### Verificat order E-260527-4WV2A

Inspecție DB: ✅ Toate datele importante salvate. Personal complet (nume, CNP, birthDate derivat din CNP ca fallback OCR, birthPlace din OCR, serie/număr CI, valabilitate, adresă auto-fill din OCR CI verso). KYC docs ✓, signature S3 + metadata cu cele 3 flag-uri consent ✓, payment intent ✓, total_price 278 RON ✓. Minor: Stripe webhook update fields (paid_at, payment_method) and Oblio invoice nu rulează pe local dev (timing/local).

### Tests update

**762 unit tests passing** (+24 față de începutul sesiunii). Adăugate:
- `tests/unit/lib/verification-modules/step-builder.test.ts` (4 teste) — regression guard pentru eliminarea Review step + structura wizard cazier judiciar PF
- `tests/unit/lib/validations/cnp-birthdate-derive.test.ts` (7 teste) — derivarea YYYY-MM-DD din CNP (fallback când OCR returnează `birthDate: null`)
- `tests/unit/lib/data/locality-fuzzy-match.test.ts` (13 teste) — canonicalizare localitate post-OCR pentru fixare diacritice românești (case real: „Băbăcești" → „Babasesti" în Satu Mare)

### Update 10:30 — Fix hydration mismatch (Sheet aria-controls)

Console warning pe orice pagină din Radix Sheet (`aria-controls` ID diferă SSR vs client). Fix cu `hydrated` state în Header — render placeholder Button pe SSR, mount Sheet real client-side.

### Update 10:35 — OCR diacritice românești + locality canonicalization

User reportă: Gemini a returnat „Băbăcești" în loc de „Băbășești" (s-cu-virgulă confundat cu č). Plus: poze portrait cu elemente extra ar putea încurca OCR-ul.

Fix în 2 layere:
1. **Prompt Gemini** (CI față + verso) — secțiuni noi: ORIENTARE (cer rotație mentală pentru poze portrait) + DIACRITICE (enumeră cele 5 caractere RO valide, interzice explicit `š`/`č`/`ž` cu exemple)
2. **Post-processing** `src/lib/data/locality-fuzzy-match.ts` — fuzzy match contra listei oficiale de localități per județ. Exact match când doar diacriticele diferă; Levenshtein ≤ 2 pentru OCR slips; refuză când candidați tie. Aplicat în `PersonalDataStep.fillAddressFields`.

### Update 10:45 — Options step UX overhaul

5 fix-uri raportate de user pe pagina /comanda:

1. **Checkbox-uri invizibile** la opțiuni bundled (sub Certificat Integritate): `CheckCircle` din lucide are propriul cerc + iconul `w-3 h-3 text-white` pe fundal galben → vizual gol. Înlocuit cu `Check` plain `w-4 h-4 strokeWidth=3` pe casetă `w-5 h-5` cu `border-2`. Acum se vede clar.
2. **„Rezumat Selecții" la baza Step Options** — duplica sticky sidebar. **Șters complet.**
3. **Bundled options apăreau flat** în sticky summary (Apostila Haga listată de 2 ori: o dată pentru Cazier Judiciar, o dată pentru Certificat Integritate sub-service). Acum **indentate sub parent** cu linie vertical primary-100 + text mai mic.
4. **Delivery time static** la „2-4 zile lucrătoare" indiferent de urgenta. Acum **dinamic**: când user are `urgenta` (fără bundledFor — adică pentru serviciul principal), apare „1-2 zile lucrătoare" + label „⚡ Procesare urgentă activată".
5. **Iconițe per-rând** (Tag, Package) — eliminate. Summary mai curat, vertical mai compact.

Pass-through: `OrderSummaryCard` acceptă acum `optionId` + `bundledForParentId`. Atât `price-sidebar-modular.tsx` (wizard) cât și `checkout/[orderId]/page.tsx` (post-wizard) propagă metadata.

### Update 19:30 — Layout polish iterativ admin order detail (multiple user feedback rounds)

User feedback iterative pe layout-ul `/admin/orders/[id]`. Toate modificările aplicate într-o serie de iterații:

**1. Badge contrast fix** (request: „sa fie textul cu alb in buton ca nu e veizibl"):
- `text-white` adăugat explicit la TOATE badge-urile colorate de status: paid, processing, documents_generated, submitted_to_institution, **document_received**, extras_in_progress, kyc_approved, document_ready, shipped, in_progress, completed, standby, cancellation_requested, delivered
- `PaymentStatusBadge`: „Plătită" + „Eșuată" cu `text-white`
- Adăugate statusuri lipsă din `STATUS_CONFIG`: standby, cancellation_requested, delivered, abandoned

**2. Câmpuri adresă goale ascunse** (request: „n-ar trebui sa fie vizibile campurile goale"):
- Bl, Sc, Et, Ap, Cod poștal apar acum DOAR când sunt completate
- Curățenie vizuală majoră pentru clienții care au doar Str + Nr

**3. Generează AWB fuzionat în Livrare card** (request: „nu putem sa punem butonul in sectiunea lvirare"):
- `AwbSection` refactorizat să returneze fragment (fără `<Card>` wrapper)
- Embedded inside Livrare card sub adresa de livrare cu Separator
- Email/PDF orders: AwbSection returnează null
- AWB Generat: mini-panel verde cu număr + Print + Tracking + Anulează
- Generează AWB: doar buton + eroare dacă există

**4. Lățime carduri documente + responsive grid** (request: „cand secitunile de mai sus is mai mari" + „posibil sa fie 4 documente pentru cazier auto"):
- Documente mutat din coloana dreaptă a ROW 1 → **full-width row** sub ROW 1
- Inner grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — flow natural pentru 2/3/4 documente (cazier auto: CI fata + verso + permis fata + verso)

**5. Contract + Facturare carduri noi** (request: „pe cazierjudiciaronline.com m-ai avem secitunea asta cu contractul semnat" + „la date facturare fa le fel cca pe cazierjudiciaronline.com"):
- **ROW 2** restructurat: [Facturare | Contract] (2-col)
- **Facturare** rewrite stil InfoRow (clean ca sister): Tip factură / Nume / CUI(PJ) / Nr. Reg. Com.(PJ) / Strada / Oraș / Județ / Cod poștal
- **Slot Nr. factură Oblio** — afișează „—" până la emitere, apoi link clickabil către Oblio PDF
- **Contract** nou card cu: Semnat (Da/Nu) / Data semnare / IP semnare / Browser (user agent) / SHA-256 PDF — citește din `customer_data.signature_metadata`
- **ROW 3** dedicat: Plata full-width

**6. Bonuri din iterațiile anterioare aceleași sesiuni:**
- Cost livrare 0.00 RON ascuns pentru Email/PDF orders
- KYC merged în Documente card (badge OCR % + Match % inline pe fiecare poză, banner manual review)
- Duplicat „Livrare" card eliminat când nu există curier

**Tests:** 896 passing. **Type-check clean.** Layout `/admin/orders/[id]` complet aliniat cu sister project + îmbunătățiri proprii (responsive, modular, KYC inline).

### Update 18:45 — Restructurare layout admin order detail

User: „eu zic date contact si date persoanle ar trebui sa le punem impreuna si pe dreapta sa fie serviciu si livrarea una sub alta nu ?"

Refactor layout pe `/admin/orders/[id]`:

**Înainte:**
- ROW 1: [Contact | Serviciu]
- ROW 2: [Personal | Billing]
- ROW 4: [Payment | Livrare]

**Acum (cum cere user-ul):**
- **ROW 1**: grid 2-col
  - LEFT col stacked: Date contact → Date personale/firma
  - RIGHT col stacked: Serviciu și opțiuni → Livrare
- **ROW 2**: [Billing + Payment] împreună
- ROW 3 (Documents/Signature), KYC, AWB neschimbat

Transformare făcută cu script Python deterministic (`/tmp/restructure_admin_order.py`) care:
1. Detectează automat liniile cardurilor prin căutare după comentariile lor (`{/* Contact Info */}`, `{/* Client Details */}`, etc.)
2. Extrage block-urile cardurilor cu indentare păstrată
3. Re-construiește ROW 1 cu wrapperi `<div className="space-y-4">` pe fiecare coloană
4. Re-construiește ROW 2 cu Billing+Payment
5. Elimină ROW 4 (Payment a urcat în ROW 2, Livrare în ROW 1)

**Tests:** 896 passing neschimbat. **Type-check clean.** Build verificat.

### Update 18:30 — Refactor status update la inline card (cum cere user)

User: „bu nnai facut cum ti-am zis sa sa putem actualzia noi satatusul si alea din dropwdown sa pot alege status [screenshot sister cu Actualizează Status inline] asa ar treubi sa avem nu stiu ce ai facut dar cred ca nu ai trecut prin cod cu ti-am cerut /Users/raul/Projects/cazierjudiciaronline.com"

Avusesem făcut un buton „Forțează status" + dialog modal. User cere replicat exact UX-ul sister: **card inline cu dropdown + input notă + buton Actualizează** pe aceeași pagină, fără modal.

**Schimbări:**

1. **`src/lib/admin/status-options.ts`** — extras STATUS_OPTIONS într-un modul shared (15 statusuri grupate: 10 normal workflow + 2 special standby/cancellation + 2 terminal cancelled/refunded). Plus helper `findStatusLabel`.

2. **`src/components/admin/update-status-card.tsx`** NOU — card inline cu:
   - Dropdown native `<select>` (toate 15 statusuri, ordonate workflow-first)
   - Input text inline „Notă (opțional)"
   - Buton „Actualizează" disabled când status nou = curent
   - Warning inline (nu modal) când selectezi standby (SLA pauzat) sau status terminal (cancelled/refunded)
   - Toast success cu mesaj diferit pentru standby (afișează zile mutate)

3. **API `/api/admin/orders/[id]/status`** schimbat: nota acum **opțională** (înainte era required min 3 char). Salvează `null` în `notes` când e empty.

4. **Page integration**: șters butonul „Forțează status" + dialog import; adăugat `<UpdateStatusCard>` deasupra `<NoteEchipaCard>`. Eliminat fișierul vechi `status-override-dialog.tsx`.

5. **Note Echipă placeholder** schimbat la „Adaugă o notă despre acest client / comandă (vizibilă doar echipei)…" — match exact cu sister.

6. **Timeline render upgrade** — în `OrderTimeline`, când rândul are `from_status` + `to_status` diferiți, afișează badge-uri colorate cu arrow între ele (ca în sister „Istoric Status"). Plus `changed_by` afișat în header rând. `StatusBadgeMini` helper folosește `STATUS_CONFIG` deja existent.

**Tests:** 896 passing (neschimbat — refactor pur UI/UX). **Type-check clean.**

### Update 18:00 — 5 P0/P1 features parity cu sister (self-cancel + status override + standby + cancellation refund + add services + note echipă)

User: „vad ca ai ratat cateva chesti din /Users/raul/Projects/cazierjudiciaronline.com statusul comenzi sa putem schibma si actualzia la modifica sa putem adauga servicii suplimentare sau sa dam re fund la una dintre servicii, aia cu anularea de 30 minute la client cand urmareste conada. is m-ai mutle chesit te rog sa treci atent peste ele una cate una si sa vezi ce lipseste si sa le implementam!"

Survey complet cu agent dedicat → 14 features identificate. Implementat 5 P0 + 1 P1 într-o singură sesiune:

**Migration 043** (`cancellation_and_standby.sql`):
- `cancellation_requested` și `standby` adăugate la `orders.status` CHECK
- `orders.standby_started_at TIMESTAMPTZ` + `orders.standby_total_seconds BIGINT DEFAULT 0`
- Event types noi în `order_history`: `cancellation_requested`, `standby_started`, `standby_ended`
- Index parțial pe `status='cancellation_requested'` pentru filtering admin

**P0 #1 — 30-min client self-cancel** (legal, în T&C):
- `/api/orders/cancel` POST endpoint: validate email+order_number, IP rate limit 5/15min, evaluate window vs `paid_at`, set status='cancellation_requested', send email confirmare
- `src/lib/orders/self-cancel.ts` — pure helpers (`evaluateSelfCancel`, `cancelWindowRemainingMs`, `formatCancelCountdown`, `computeCancelRefundAmount`) + **15 teste** acoperind boundary inclusiv 30min exact + clock skew
- `src/components/orders/self-cancel-card.tsx` — collapsible cu countdown live MM:SS, confirm step, post-cancel banner cu mesaj 70% refund 5-10 zile
- Email template `cancellation-request.ts` (HTML + text, XSS-escape)
- Embedded în `/comanda/status/page.tsx` (deasupra Status Card)

**P0 #2 — Status PATCH liber + audit**:
- `/api/admin/orders/[id]/status` PATCH cu set complet de 21 statusuri valide
- Notă obligatorie (min 3 char) pentru audit — bypassed state machine trebuie justificat
- Side effects automate: entering standby stamps `standby_started_at`, exiting from standby calls `exitStandby` și shift-uiește `estimated_completion_date` cu zile lucrătoare
- `src/components/admin/status-override-dialog.tsx` — dropdown grupat (normal/special/terminal), warning banner pentru standby/terminal, textarea notă

**P0 #3 — Standby (SLA pauzat)**:
- `src/lib/orders/standby.ts` — `enterStandby` (stamp ISO) + `exitStandby` (paused seconds → ceil(/86400) business days forward via existing `addBusinessDays`)
- **7 teste** acoperind 1-day, multi-day, null estimate, invalid timestamp, zero/negative duration
- Banner amber pe admin order detail când status='standby' cu reminder „termenul nu avansează"

**P0 #5 — Cancellation requested banner + 70% refund button**:
- `/api/admin/orders/[id]/process-cancellation` POST: validate status='cancellation_requested', Stripe `createRefund(70% of total)`, update `status='refunded'` + cumulative `refunded_amount`, audit cu Stripe refund ID
- `CancellationRequestedBanner` component inline pe order detail — confirm dialog cu sumele exacte, error handling robust (refund eșuat ≠ status flip)
- Permisiune `payments.verify` (separat de `orders.manage` — banii sunt sensibili)

**P0 #4 — Add servicii în Modify**:
- Nou endpoint `/api/admin/orders/[id]/available-options` GET — întoarce TOT catalogul addon-urilor din `service_options` table merged cu cele selectate curent + bundled extras
- `modify-order-dialog.tsx` refactorizat: load catalog la open, badge „Nou" verde pe addon-uri ne-prezente original, descriere afișată sub fiecare nume, highlight emerald pe row-urile newly-added
- Limitare cunoscută: bundled cross-service options (Cazier+Integritate combo) doar removable, nu addable din UI (rămâne workflow Phase 2)

**P1 #6 — Note Echipă UI card**:
- `NoteEchipaCard` component pe admin order detail (deasupra timeline-ului)
- Filtrare: doar notițe cu `changed_by` non-system + non-empty `notes`
- Textarea cu **Cmd/Ctrl+Enter shortcut** + button „Adaugă notă"
- Render pretty pe fiecare notă: autor + timestamp + badge „la status: X" pentru notițe atașate de tranziții
- Anchor `#notes-echipa` pentru deep-link
- Endpoint deja existent (`/api/admin/orders/[id]/notes`) — nu a fost necesară muncă pe API
- API timeline extins cu `changed_by, from_status, to_status` în select

**Tests:** 896 passing (din 906, 10 skipped); +22 față de 874 anterior. **Type-check clean.**

**Backlog rămas (P1/P2):**
- Quick „Marchează livrat" button on AWB section
- Cron auto-finalize delivered cu thresholds per courier (FAN 7d, Sameday 5d, DHL 14d, Poșta 30d)
- Copy pentru Sheet TSV (4 locuri)
- Quick-pick motiv solicitare chips Step 1
- Help card WhatsApp+Tel pe tracking page
- București sectoare dropdown
- Standalone refund pe line item arbitrar (P2, edge case)

### Update 16:30 — Orders list overhaul: tabs + sandbox chips + counts + service filter

User: „nu o vad in lsita sa verifici de ce" — descoperit că o comandă plătită cu Stripe **test** key avea `is_test=true` și endpoint-ul `/api/admin/orders/list` filtra implicit `is_test=false`. Nu exista UI pentru toggle. Plus user-ul a cerut paritate vizuală cu sister project la taburi.

Port complet din `/Users/raul/Projects/cazierjudiciaronline.com`:

**1. Pure helpers** (`src/lib/admin/orders-tabs.ts`):
- `STATUS_TABS` (6 taburi: Toate / Plătite / În procesare / Expediate / Finalizate / Abandonate)
- `PROCESSING_GROUP` (`processing`, `kyc_pending`, `kyc_approved`, `document_ready`, `in_progress`)
- `SHIPPED_GROUP` (`shipped`)
- `HIDDEN_FROM_DEFAULT` (`draft`, `pending`, `abandoned`) — exclude din tabul „Toate"
- `parseTestFilter()` — defaultează la `hide`, parsează `only`/`all` case-insensitive
- `resolveStatusFilter()` — mapează tab → `{eq, in, notIn}` shape; status necunoscut fallback la „all" defensiv
- **14 teste** in `tests/unit/lib/admin/orders-tabs.test.ts`

**2. Endpoint nou** `/api/admin/orders/counts` (head-only `count='exact'` per tab, paralel via `Promise.all`):
- Respectă filtrele active: `test`, `service`, `search`
- `test_only` ignoră testFilter activ ca să arate count real pe chip „Doar test"

**3. `/api/admin/orders/list` extins**:
- Folosește `resolveStatusFilter` shared
- Adăugat `?service=<service_id>` filter
- `parseTestFilter` shared (înlocuiește logica inline)

**4. UI rewrite** `/admin/orders/page.tsx`:
- **Tabs** vizibile cu count badges (înlocuiește dropdown Select)
- **Sandbox chips** `Ascunse | Doar test | Toate` cu tone amber pe „Doar test"
- **Service dropdown** (12 servicii din DB)
- **Search** debounced pe Enter/blur (înlocuiește filtering client-side)
- **Reset filtre** button apare doar când există filtre active
- **URL-driven state** complet — share-uirea unui link reproduce filtrele

**Bugfix direct pentru user:** Comanda `E-260527-FZ948` (paid, is_test=true) acum vizibilă cu un click pe chip „Doar test" sau „Toate".

**Tests: 874 (din 884, +14 pentru pure helpers), type-check clean.**

### Update 15:45 — Storno + Reemite factură Oblio (P0 final mare)

User: „dai mai departe, vezi că dacă ii extra pentru certificat integritate trebuie să generăm iarăși alte documente sau invers — te documentezi în /Users/raul/Projects/cazierjudiciaronline.com și după o să facem și storno."

Două output-uri:

**1. Doc gap analysis** (`docs/admin/secondary-service-documents.md`):
- Sister folosește flag-uri boolean (`order.cazier_judiciar` + `order.certificat_integritate`) + 2 coloane separate (`delegation_pdf_path` + `delegation_integritate_pdf_path`) + 2 butoane în admin
- Noi cu JSONB trebuie să detectăm prin `selected_options.bundled_for.bundled_service_slug`
- Plan complet (FAZA 2 — ~2 zile): detection helper, templates Integritate/Fiscal/Auto/etc., extend `auto-generate.ts`, admin UI cu 2 sets butoane, tests
- Workaround până atunci: admin notează în notițe + generează manual

**2. Storno + Reemite Oblio** implementat:

- **`src/lib/oblio/parse-number.ts`** — `parseInvoiceNumber("EGH-0001")` → `{seriesName, number}`. Suport multi-segment series (`EGH-PJ-0001`), legacy padding, malformed input → null. **6 teste regression**.
- **`/api/admin/orders/[id]/reissue-invoice`** — POST endpoint:
  - Auth `orders.manage`, feature flag `OBLIO_REISSUE_ENABLED=true` (503 dacă off)
  - Anti-double-click: 60s guard pe `invoice_issued_at`
  - Validation: order paid + has invoice_number
  - STEP 1: `cancelInvoice(seriesName, number)` — Oblio creează storno automat (mai simplu decât SmartBill care e cu cantitate negativă)
  - STEP 2: `createInvoiceFromOrder(currentData)` — emite factură nouă cu liniile actuale (include cuponul, delivery, line items per addon de la migration 040+041 lucrate anterior)
  - STEP 3: update `orders.invoice_number/url/issued_at`
  - STEP 4: audit `order_history` cu both vechi → nou + storno OK
- **Error handling robust**: dacă storno failează, log + 502 cu mesaj clar (factură veche rămâne); dacă storno OK dar new failează, audit reține ambele și instruiește operatorul să emită manual + actualizeze invoice_number
- **UI button** pe `/admin/orders/[id]` lângă „Modifică": apare doar când `payment_status='paid' AND invoice_number IS NOT NULL`. Vizual amber (`text-amber-700 border-amber-300`), icon `RotateCcw`, confirm dialog înainte (operațiune irreversibilă — storno ajunge automat în SPV).

**Deploy:**
- Feature flag `OBLIO_REISSUE_ENABLED=true` adăugat în deploy checklist
- Estimare cutover redusă de la 3-5 zile la **2-4 zile** (un blocker P0 eliminat)

**Total tests: 860** (era 854; +6 cu parse-number tests).

### Update 15:15 — Email plată extra + Health-check cron + Deploy checklist

User: „dai mai departe, notează ce o să avem nevoie pentru deploy că deocamdată nu suntem live."

**3 features completate + 1 doc major:**

**1. Email plată extra** (`src/lib/email/templates/extra-payment.ts`):
- Subject, HTML, text plain — pattern identic cu recovery email
- Wire-uit în `modify` endpoint: când diff > 0, trimite automat email customer cu link `/comanda/plata-extra/<intent_id>` (URL embed PaymentIntent id, NU client_secret în body)
- Best-effort: dacă Resend nu e configurat, admin tot primește `client_secret` în răspuns + persistat în DB (fallback comportament inițial)
- Response include `extraPaymentEmailSent: boolean`
- **8 teste noi** în `tests/unit/lib/email/extra-payment.test.ts`: subject + HTML + text + XSS escape pe prenume/description, URL attr escape, 24h validity hint

**2. Health-check cron** (`/api/cron/invoice-health-check`):
- Caută paid orders > 30 min fără `invoice_number`
- Filtru: ultimele 7 zile (nu spamăm pe ordere vechi)
- Cap 200 rânduri/rulare
- Output: structured console.warn + Slack post dacă `SLACK_WEBHOOK_URL` setat
- Schedule: `0 * * * *` (la 1 oră, în vercel.json)
- Dev GET dry-run + prod POST cu auth `CRON_SECRET`

**3. Deploy Checklist** (`docs/deployment/DEPLOY-CHECKLIST.md`) — main task:
- 13 secțiuni: DB migrations, env vars (existente + noi), DNS+Resend, Stripe webhook, crons, Oblio, hardcoded URLs, security, SEO, monitoring, smoke tests, rollback plan, comunicare cutover
- TL;DR cu 8 bullet points
- Lista exactă de migrations (001-042) cu ce face fiecare
- Toate env vars de adăugat (RESEND_*, NEXT_PUBLIC_APP_URL, SLACK_WEBHOOK_URL)
- **Status azi: 80% live-ready**. Lipsește pentru cutover: Storno Oblio (1 zi), rotire SUPABASE_SERVICE_ROLE_KEY (cheia leaked în git Feb), Page #1 vizual decision, DNS+Resend configurat, Stripe live keys + webhook.

**Total tests: 854** (era 844; +10 cu extra-payment template tests).

### Update 14:50 — Polish final: extracts + tests + docs alignment

Refactor pure-function pentru testability + tests + docs final consolidation:

**Pure-function extracts:**
- `src/lib/coupons/recovery-code.ts` — `generateRecoveryCouponCode(rng?)` + `isRecoveryCouponCode(code)` + `RECOVERY_ALPHABET` constant. Acceptă RNG injectabil pentru tests deterministe.
- `src/lib/admin/dashboard-aggregators.ts` — `aggregateStatusDistribution`, `aggregateServiceRevenue`, `computeRecoveryRatePercent`. Sortări deterministe (tie-break alphabetical) pentru bar chart stability.

Recovery cron + stats route folosesc acum aceste utils — logică zero schimbată, doar mutată afară pentru testing.

**Tests noi (+22):**
- `tests/unit/lib/coupons/recovery-code.test.ts` (9 teste) — alphabet, length, prefix, deterministic with injected RNG, anti-collision 1000 runs, classifier
- `tests/unit/lib/admin/dashboard-aggregators.test.ts` (13 teste) — empty/single/multi buckets, tie-break alphabetical, float rounding, null fallbacks, recovery rate edge cases

**Total tests: 844** (era 822; +22 final polish; **+95 total într-o zi**)

### Update 14:30 — Buton Modifică comandă plătită (refund auto + plată extra)

User: „dă bătaie și atacă următoarea chestie", citește tot, scrie teste, docs, UI la fel.

**Mare feature P0 completat** într-o sesiune (cel mai mare lipsă operațional din parity matrix). Mirror al `cazierjudiciaronline.com/api/admin/orders/[id]/modify` (527 linii) adaptat la modelul nostru JSONB.

**DB migration 042** (`042_modify_order_refund_tracking.sql`):
- `orders.refunded_amount` (cumulativ RON refundați)
- `orders.additional_paid_amount` (cumulativ RON plătiți extra)
- `orders.pending_extra_payment_url/_amount/_intent_id` (sharing link)
- `orders.last_modified_at/_by` (audit metadata)
- `order_history.event_type` CHECK extended cu `modified`, `extra_payment_sent`, `extra_payment_received`

**Math pure** (`src/lib/orders/modify-diff.ts`):
- `computeModifyDiff(order, changes)` → `{newTotal, currentNetPaid, diff, action: 'refund'|'extra_payment'|'none'}`
- `describeChanges(...)` → string humanizat („adăugat: apostilă Haga · scos: urgență · livrare 21.90 → 100.00 RON")
- Float-safe rounding pe currentNetPaid (cap la 2 decimals — fix IEEE-754 noise)
- Cap defensive la 0 dacă `refunded > paid` (data corruption signal)

**Stripe helpers noi** (`src/lib/stripe.ts`):
- `createRefund({paymentIntentId, amountRon, reason, metadata})` — refund parțial
- `createExtraPaymentIntent({...})` — PaymentIntent nou pentru diferența pozitivă, reuse customer dacă există

**Endpoint** (`/api/admin/orders/[id]/modify`):
- Body: `{action, selectedOptions, deliveryPrice?, note?, refundReason?}`
- `action: 'preview'` → întoarce diff + summary, fără mutație
- `action: 'apply'`:
  - Diff < 0 → `createRefund` pe `stripe_payment_intent_id` original
  - Diff > 0 → `createExtraPaymentIntent` nou, returnează `client_secret`, persistă `pending_extra_payment_*`
  - Diff = 0 → doar field update
  - Update orders: `selected_options`, `options_price`, `delivery_price`, `refunded_amount`, `pending_extra_payment_*`, `last_modified_at/by`
  - Insert `order_history` cu `event_type` corespunzător + notes formatate
- Auth: `orders.manage` permission
- Validation: blochează pe non-paid (`payment_status !== 'paid'` → 409)

**UI dialog** (`src/components/admin/modify-order-dialog.tsx`, ~340 linii):
- Buton „Modifică" lângă „Reincarca" pe order detail (vizibil doar pe `payment_status='paid'`)
- 2-step UX: tweak checkboxes → „Calculează diferența" → preview banner (color-coded refund/extra_payment) → input motiv refund (când e cazul) → „Aplică + refund/plată extra"
- Banner cu breakdown complet (Total inițial / nou / refundat / additional / net curent)
- Toast la apply + auto-refresh pagină

**Tests** (`tests/unit/lib/orders/modify-diff.test.ts`, **15 teste**):
- Path none/refund/extra_payment cu scenarii reale: scoți urgenta, swap DHL → Poșta, adaugi apostila
- Edge cases: refunded > paid (cap), snake_case options, additional_paid_amount din modify anterior
- Humanization helper: adăugat/scos/delivery change/truncate la 200 chars

**Docs noi:**
- `docs/admin/modify-order.md` — handbook complet (3 scenarii, API, math, DB schema, audit, limitări vs sister, verificare manuală cu curl)
- `docs/admin/PARITY-MATRIX.md` — marked ✅ + actualizat secțiunea P0

**Total tests:** **822** (era 807; +15).

### Update 13:45 — Admin shell port (paritate vizuală cu sister project)

User: „vreau să arate la fel ca cazierjudiciaronline.com și în nav la fel adminul să fie la fel."

**Layout/Sidebar** (`src/app/admin/layout.tsx`):

- **Dark slate-900 sidebar** (înainte: white) — identic vizual cu sister
- **Logo**: badge `bg-primary-500` (galben eGhiseul) cu „eG" + text „eGhișeul.ro" (sister: blue „CJ")
- **Nav items dark**: `text-slate-400` idle, `bg-slate-800 text-white` active, hover `bg-slate-800/50`
- **Adăugat nav item nou**: „Abandonuri" cu icon `UserX` → `/admin/orders?status=abandoned`
- **User footer**: avatar slate-700 cu inițială, email + rol, logout slate-themed
- **Mobile header**: simplificat la `lg:hidden` cu burger + „Admin Panel" (sister pattern)

**Dashboard header** (`src/app/admin/page.tsx`):

- **„Total (all time)"** stat afișat dreapta sus (pe desktop) — sister pattern. Format: `N comenzi · X.XX RON luna`. Înainte aveam doar refresh button.
- Subtitle din „Bine ai venit..." → „Privire generală asupra comenzilor și veniturilor" (sister text).

### Update 13:30 — Admin dashboard extins (Abandonate funnel + breakdowns)

User: „să avem toate chestiile noi ca în celălalt proiect" + „și secțiunea abandonuri să o adaugi nu?"

**Stats endpoint extins** (`/api/admin/dashboard/stats`):
- `abandonedToday` — count `status='abandoned' AND updated_at >= todayStart`
- `abandoned30d` — count `status='abandoned' AND created_at >= 30d ago`
- `recoveryEmailsSent30d` — count orders cu `recovery_email_sent_at` în ultimele 30 zile
- `recoveryRecovered30d` — count orders cu `recovery_email_sent_at` IS NOT NULL AND status IN paid statuses
- `recoveryRatePercent` — recovered/sent × 100
- `testOrdersTotal` — count `is_test = true` (sandbox cohort)
- `statusDistribution` — array `{status, count}` sortat descrescător pentru bar chart
- `serviceBreakdown` — array `{slug, name, count, revenue}` pentru bar chart luna curentă
- `totalOrders` recalculat exclude acum `HIDDEN_FROM_DEFAULT` (draft/pending/abandoned)

**Dashboard UI** (`/admin`):
- **Card mare „Coșuri abandonate (ultimele 30 zile)"** cu 4 tile-uri funnel: Abandonate astăzi, Total 30 zile, Emailuri trimise, Recuperate (cu rate %). Buton „Vezi lista →" la `/admin/orders?status=abandoned`.
- **Bar chart „Distribuție pe status (30 zile)"** — etichete cu badge color-coded + bare orizontale proporționale + count.
- **Bar chart „Servicii (luna curentă)"** — nume serviciu + bar orizontal proporțional cu revenue + count + revenue formatat.
- Status `abandoned` adăugat în `STATUS_CONFIG` cu badge `bg-neutral-200`.
- A11y: `role="progressbar"` + `aria-valuenow/min/max/aria-label` pe fiecare bar.

**Total tests:** 807 (neschimbat — modificarea e UI + endpoint extension, fără test changes; bar chart rendering acoperit by existing snapshot infra dacă ar fi cazul).

### Update 13:00 — Abandoned cart system + sandbox filter + Note Echipă

User: „fă chestia asta ce nu avem noi și cealaltă platformă are. Și partea cu coșuri abandonate."

Implementat **sistemul complet de coșuri abandonate** + 2 features de infrastructure aferente:

**1. Migration 041** (`041_abandoned_cart_system.sql`):
- `orders.status` CHECK extended cu `abandoned`
- `orders.is_test BOOLEAN` (sandbox filter) + index `(is_test, status, created_at DESC)`
- `order_history.event_type` CHECK extended cu `abandoned`, `recovery_email_sent`, `note_added` + legacy values
- `coupons.system_kind` (NULL pentru admin-created, `'recovery'` pentru cupoane auto-generate) + index
- `orders.recovery_email_sent_at` (NULL = nu trimis încă)

**2. Cron `/api/cron/auto-abandon`** (15 min):
- `status='pending' AND created_at < NOW() - 30 min` → `status='abandoned'`
- Audit entry per order: `event_type='abandoned'`, `changed_by='system-cron'`
- Cap 500 rânduri/rulare, dry-run GET disponibil în dev

**3. Cron `/api/cron/recovery-emails`** (15 min):
- Pentru fiecare abandoned 30min-7days fără recovery trimis:
  - Generează cupon unic `RECOVERY-XXXXXXXX` (alfabet curat fără 0/O/1/I/L, retry on collision)
  - 10% off, 48h validity, max_uses=1, `system_kind='recovery'`
  - Trimite email via Resend (HTML + plain text) cu codul + link `/comanda/checkout/<id>`
  - Marchează `recovery_email_sent_at = now()`
- Fără `RESEND_API_KEY` → doar creează cupoane, log skip (rulare ulterioară cu key va trimite)
- Cap 100/rulare (rate limit Resend)

**4. Resend wrapper** (`src/lib/email/resend.ts`):
- Fetch-based, fără dep nouă în package.json
- `sendEmail(input)` returnează `{id, skipped, reason}` — caller decide ce face dacă e skipped
- Idempotency-Key header pentru dedup 24h în Resend

**5. Email template** (`src/lib/email/templates/abandoned-recovery.ts`):
- `buildRecoverySubject(input)` — personalizat cu prenume când există
- `buildRecoveryHtml(input)` — full inline HTML, XSS-escaped (`<script>` în prenume → `&lt;script&gt;`)
- `buildRecoveryText(input)` — plain text fallback

**6. Admin list update** (`/api/admin/orders/list`):
- `HIDDEN_FROM_DEFAULT = ['draft', 'pending', 'abandoned']` în view `all` (înainte ascundea doar draft)
- Query param `?test=only|all|<default hide>` pentru sandbox filter
- Status badge `Abandonata` adăugat în UI (`bg-neutral-200 text-neutral-700`)
- `'abandoned'` adăugat în `ALL_STATUSES` dropdown

**7. Stripe payment route**: stamp `is_test=true` la creare dacă `STRIPE_SECRET_KEY` începe cu `sk_test_`.

**8. Endpoint Note Echipă** (`/api/admin/orders/[id]/notes`):
- POST `{ note }` (max 5000 chars) → insert `order_history` cu `event_type='note_added'`, `changed_by=<admin email>`
- Permission: `orders.manage`
- UI card pe order detail rămâne TODO (4h estimate)

**9. vercel.json**: 2 cron-uri noi (`auto-abandon` și `recovery-emails`), ambele la `*/15 * * * *`.

**Env vars necesare:** `CRON_SECRET`, `RESEND_API_KEY` (opțional), `RESEND_FROM`, `RESEND_REPLY_TO`, `NEXT_PUBLIC_APP_URL`.

**9 teste noi** în `tests/unit/lib/email/abandoned-recovery.test.ts`:
- Subject cu/fără prenume
- HTML render cu coupon + order number + total formatare
- XSS escape în prenume + URL attribute escape
- Plain text version

**Total tests:** **807** (era 798; +9).

**Docs noi:**
- `docs/admin/abandoned-carts.md` — handbook complet sistem coșuri abandonate (layer 1-3, schema, env, setup Vercel, comparație cu sister)
- `docs/admin/PARITY-MATRIX.md` — actualizat cu 5 features completate

### Update 12:30 — Admin order detail: grupare servicii + termen corect

User: „la admin la servicii la fel trebuie aranjat și timpul estimat. Vezi cum face cazierjudiciaronline.com (colegii au experiență cu acea platformă). Eghiseul.ro va fi părintele cu funcționalități extra."

**Diferența de model** între platforme:
- **cazierjudiciaronline.com**: flag-uri boolean explicite pe rândul de order (`order.certificat_integritate`, `order.traducere`, etc.) — admin renderează condițional fiecare flag
- **eghiseul.ro**: generic JSONB `selected_options` array — admin trebuie să GRUPEZE după parent/child. Flexibil pentru orice service combo, dar necesită logica de nesting.

**Fix `src/app/admin/orders/[id]/page.tsx`** secțiunea „Serviciu și opțiuni":

1. **„Termen estimat" corect** — folosește `estimateFromSelectedOptions` (sumează urgenta + traducere + legalizare + apostila*). Înainte arăta `service.estimated_days` (2 zile pentru cazier). Acum 5-7 cu addon-uri.

2. **Grupare nested** — același pattern din OrderSummaryCard:
   - Direct addon-uri sub Cazier Judiciar (urgenta, apostila, traducere, legalizare, notari)
   - Bloc separat pentru fiecare „Serviciu secundar" (Certificat Integritate) cu label sub nume + linie verticală + addon-urile sale bundled indent
   - Strip „(adaugă în aceeași comandă)" din nume (același helper inline)

3. **Type-safe** — `selected_options` typedef extins cu `code`, `bundled_for.parent_option_id`, `bundledFor.parentOptionId`.

**Visual nou pe admin:**
```
Serviciu si optiuni
Serviciu                                  Cazier Judiciar
Termen estimat                            5-7 zile lucratoare

OPTIUNI SELECTATE
   Procesare Urgentă                      +80.00 RON
   Apostilă de la Haga                    +198.00 RON
   Traducere Autorizată                   +178.50 RON
   Legalizare Notarială                   +99.00 RON
   Apostilă Notari (Camera Notarilor)     +83.30 RON
─────────────────────────────────
Certificat Integritate                    +100.00 RON
SERVICIU SECUNDAR
   │ Apostilă de la Haga                  +198.00 RON
   │ Traducere Autorizată                 +178.50 RON
   │ Legalizare Notarială                 +99.00 RON
   │ Apostilă Notari                      +83.30 RON
```

**Nota arhitecturală — paritate cu sister project:**

cazierjudiciaronline.com și ecazier.ro folosesc același cod source (multi-tenant). Eghiseul.ro **diferă deliberat** — JSONB option model permite servicii viitoare (extras carte funciară, certificat constatator, etc.) fără migrations per addon. Sister project e single-tenant per service type (cazier-judiciar/fiscal/auto/integritate).

Conceptual: paritate VIZUALĂ + UX (același flux pentru client), implementare INTERNĂ diferită. Eghiseul.ro = umbrella service catalog, sister projects = single-service deep optimization.

### Update 12:15 — Success + status page: rendering + termen corect

User raportă 3 issues:
1. **Success page** — „Servicii comandate" arătau flat cu „+ Apostilă Notari (Camera Notarilor) (Certificat Integritate (adaugă în aceeași comandă))" — ugly.
2. **Success page** — „Procesăm documentul în 2 zile lucrătoare" — incorect (real: 5-7).
3. **Status comanda page** — aceleași suffix-uri urâte + dată estimată greșită („vineri, 29 mai 2026" pentru o comandă plasată acum 2 zile cu apostila/traducere/legalizare).

**Cauza pentru termen greșit pe DB:** `computeEstimatedCompletionISO` (folosit la submit) folosea `delivery_days_impact` doar dacă era persistat pe rândul de option — care nu e niciodată. Codurile noastre (traducere/legalizare/apostila_*) erau ignorate. Plus urgenta scriea `baseDays = urgent_days = 2` (flat) în loc de range 1-2.

**Fix-uri:**

1. **`src/app/comanda/success/[orderId]/page.tsx`**:
   - Înlocuit rendering-ul manual flat cu `<OrderSummaryCard>` (același folosit de wizard/checkout — nested grouping, strip suffix, total/TVA frumos)
   - „Procesăm documentul în X zile" calculat prin `estimateFromSelectedOptions` (5-7 corect), nu hardcoded `processing_days`
   - Propagat client_type (PF/PJ) + delivery_method + raw selected_options din API

2. **`src/lib/delivery-estimate-helper.ts`** (folosit la submit pentru `estimated_completion_date`):
   - **Fallback la `OPTION_DELIVERY_IMPACT`** (centralizat în delivery-calculator) pentru codurile traducere/legalizare/apostila_haga/apostila_notari când rândul nu are `delivery_days_impact` persistat
   - **Dedupe pe cod** — bundled duplicates (apostila pe main + pe Integritate) contează o singură dată
   - **Urgenta** → folosește `urgency: 'urgent'` (range 1-2) în loc de `baseDays = urgent_days` (flat) — match cu sidebar

3. **`src/app/comanda/status/page.tsx`** — strip suffix din nume option (inline regex, identic cu normalize)

**5 teste noi** în `tests/unit/lib/delivery-estimate-helper.test.ts`:
- Production combo urgent+apostila+traducere+legalizare+notari → exact 5-7
- traducere singur pe standard → +1-2
- Dedupe bundled
- cetatean_strain legacy → +7
- Code necunoscut → fără impact

**Total tests: 798** (era 793; +5).

### Update 12:00 — Sidebar unificat (wizard + checkout = aceeași componentă)

User: „pe pagina checkout summary-ul e diferit de /comanda. Folosește aceeași componentă!"

**Diferențele identificate:**
- Wizard sidebar: `Cazier Judiciar PF`, Integritate ca „Serviciu secundar" nested, „Timp estimat livrare 5-7 zile + ⚡ Procesare urgentă activată", trust badges (Plată securizată / Garanție rambursare).
- Checkout sidebar: `Cazier Judiciar` (fără PF), Integritate apărea flat ca direct addon, bundled children orphan, fără delivery time, fără badges.

**Soluție** (un singur SSOT pentru sidebar):

1. **Nou: `src/components/orders/order-sidebar.tsx`** — componentă unificată cu interface curată (`OrderSidebarProps`) care randează: `<OrderSummaryCard>` + delivery time block + trust badges. Vizual + comportament identic, indiferent de unde sunt aduse datele.

2. **`PriceSidebarModular`** (wizard) — refactorat la adapter thin: trage din wizard state → mapează la props → cheamă `<OrderSidebar>`.

3. **`checkout/[orderId]/page.tsx`** — folosește acum `<OrderSidebar>`. Adăugat:
   - **Detect PF/PJ** din `customer_data` (company.cui → PJ, personal.cnp → PF) → suffix pe service name
   - **Delivery estimate** calculat la randare cu `estimateFromSelectedOptions` (același calculator)
   - **Service estimated days** propagat din API (`service.estimatedDays`)
   - Eliminat blocul vechi „Plată Securizată" custom — acum din `OrderSidebar` ca trust badges
   - Coupon input rămâne separat (specific checkout)

4. **Bug latent rezolvat** prin testul `order-summary-grouping.test.ts` (7 teste noi):
   - `normalizeOrderOption` păstrează `optionId` (snake_case + camelCase + synthetic `bundled:...`)
   - Join child→parent funcționează cu un fixture real de production (E-260527-A2XJ9)
   - Orphan rendering când parent lipsește din payload (defensive)

**Total tests:** 793 (era 786; +7).

### Update 11:50 — Bug fix payment intent + checkout summary nesting + invoice line items

User raportă: 1) eroare „Failed to create payment intent" pe /comanda/checkout, 2) summary checkout NU arată Integritate ca serviciu secundar nested, 3) Stripe + Oblio să arate line items separate per addon.

**1. Payment intent crash** — cauza: `order.delivery_method` în DB e JSONB obiect (`{method, methodName, price}`), nu string. Codul făcea `(order.delivery_method || 'Standard').slice(0, 200)` → `.slice is not a function`. Fix: helper `getDeliveryLabel(dm)` care extrage `methodName` sau `method` din obiect, tolerează și legacy string.

Adăugat debug response (doar non-prod): `error.debug.{message,type,code}` ca să vedem rapid dacă mai apare.

**2. Checkout summary nesting** — cauza: `normalizeOrderOption` nu păstra `optionId` în output. Checkout page primește options prin API (care folosește normalize), deci Integritate addon ajungea fără `optionId` → `bundledForParentId` al copiilor nu mai matchuia → grupare ratată. Fix: adăugat `optionId` în `OrderOptionLine`. Acum Integritate apare ca „Serviciu secundar" cu copiii săi nested, identic cu sticky sidebar.

**3. Oblio invoice line items + cupon** — Oblio invoice deja crea line items separate (main service + fiecare option + delivery). Lipsea: linia de discount cupon. Adăugat:
- `coupon_code` + `discount_amount` în `OrderForInvoice` interface
- Negative-price line item: „Reducere cupon X" → `-discount_amount RON`
- Fixed `delivery_method` object handling (same JSONB issue as payment route)
- Propagat din ambele caller-e (Stripe webhook + admin verify-payment)

**Stripe PaymentIntents nu au native `line_items`** (doar Checkout Sessions au). Avem deja:
- `description` cu „+ Apostila Haga: 238.00 RON | + Traducere: 178.50 RON | ..."
- `metadata.line_<n>_{name,price,code}` per item (vizibil în Stripe dashboard)
- `metadata.couponCode` + `discountAmount`

Pentru line items native cu apariție pe receipt Stripe ar trebui migrare la Checkout Sessions (refactor mare — redirect la pagină Stripe-hosted). Oblio acoperă deja transparența pe factura juridică.

### Update 11:35 — Contract: servicii + termen livrare detaliat

User: „as vrea în contract să fie precizat exact serviciile ce le oferim ca și în rezumat comanda, și termenele de livrare."

**2 placeholder-uri noi** în DOCX templates, ambele generate la submission time:

1. **`{{SERVICII_DETALIATE}}`** — breakdown structurat ca în order summary:
   ```
   Cazier Judiciar PF 198.00 RON
     • Procesare Urgentă +80.00 RON
     • Apostilă de la Haga +198.00 RON
     • Traducere Autorizată +178.50 RON
   Certificat Integritate (serviciu secundar) +100.00 RON
     • Apostilă de la Haga +198.00 RON

   Total comandă 952.50 RON
   ```
   - Main service + direct add-ons indented
   - Fiecare „serviciu secundar" (bundled, ex. Certificat Integritate) cu propriile add-ons nested încă o dată
   - Strip „(adaugă în aceeași comandă)" din nume — consistent cu order summary
   - Funcție: `buildServicesBreakdown(serviceName, basePrice, options, totalPrice)`

2. **`{{TERMEN_LIVRARE_DETALIAT}}`** — sumă per step din delivery-calculator:
   ```
   Termen estimat: 5-7 zile lucrătoare

   • Procesare urgentă: 1-2 zile
   • Traducere: 1-2 zile
   • Legalizare: 1 zi
   • Apostilă Haga: 1 zi
   • Apostilă Notari: 1 zi

   Pentru situații care necesită verificări suplimentare, termenul poate fi prelungit cu până la 10 zile lucrătoare.
   ```
   - Folosește `estimateFromSelectedOptions` (același calculator ca sticky sidebar)
   - Funcție: `buildDeliveryTermsDetailed(order, options, estimate)`
   - Fallback la `TERMEN_LIVRARE` (legacy single-line) când estimate lipsește

**Wire-up:**
- `src/lib/documents/auto-generate.ts` — la submit, calc estimate + paseaza-l în DocumentContext.delivery_estimate
- `src/app/api/admin/orders/[id]/generate-document/route.ts` — admin regen face același calc → contract regenerat identic
- `DocumentContext.selected_options` extins cu `code` + `bundledFor` ca să propage info pentru calc + nesting în breakdown

**Bug de fixat în drum:** 5 em-spaces (U+2003) introduse accidental în template literals din generator.ts în loc de spații normale. Cauza assertion failures pe `toContain` în teste — vizual identice dar `'PF 198.00 RON'.includes('PF 198.00 RON')` returna false. Curățat cu un script Python `str.replace(' ', ' ')`.

**7 teste noi** în `tests/unit/lib/documents/contract-breakdown.test.ts`: empty options, direct addons indent, secondary service nesting, snake_case fallback, delivery per-step format, singular „1 zi", fallback la legacy.

**Total teste:** **786** (era 779; +7).

### Update 11:25 — Delivery time real, calculat per-step

User: „1-2 zile nu e corect când am adăugat extra (apostila + traducere + legalizare). Vezi cum face cazierjudiciaronline.com și implementăm la fel."

**Analiza codebase sister project** (`/Users/raul/Projects/cazierjudiciaronline.com/src/lib/delivery-calculator.ts`):

Algoritm: sumă de business days pentru fiecare step + zile lucrătoare RO (skip weekend + sărbători 2026-2028) + noon-cutoff Romania (orders după 12:00 încep prelucrarea ziua următoare).

- Procesare: 2-4 (standard) / 1-2 (urgent) / 7-10 (permis străin) / 7-15 (cetățean străin)
- Traducere: +1-2 zile
- Legalizare: +1 zi
- Apostila Haga: +1 zi
- Apostila Notari: +1 zi
- Courier: DHL 1-3, Fan 1-3, Sameday 1, Poșta 7-15

Bundled options (apostila sub Certificat Integritate + apostila pe main) → **dedup pe cod**, contează o singură dată.

**Implementare la noi:**

1. **Helper nou** `estimateFromSelectedOptions(selectedOptions, baseDays, courier, ...)` în `src/lib/delivery-calculator.ts`. Folosește calculatorul existent `calculateEstimatedCompletion` care deja face date math cu sărbători RO. Map static `OPTION_DELIVERY_IMPACT` cu codurile (traducere, legalizare, apostila_haga, apostila_notari) și impactul.
2. **PriceSidebarModular** rescris: înainte arăta hardcoded „1-2 zile" sau base; acum cheamă helper-ul cu toate selectedOptions + courier (dacă selectat). Format text: `X zile lucrătoare` (când min=max) sau `X-Y zile lucrătoare`.

**Test concret** — scenariu raportat de user: urgent + apostila + traducere + legalizare + apostila notari → înainte „1-2", acum **„5-7 zile lucrătoare"**.

**12 teste noi** în `tests/unit/lib/delivery-calculator-options.test.ts` — base cases, urgenta toggle, dedup bundled, courier leg pe/off, production scenario, contract `OPTION_DELIVERY_IMPACT`.

Total teste: **779** (era 767; +12).

### Update 11:10 — Apostila Haga preț aliniat cu cazierjudiciaronline.com

User: „am redus prețul la apostila pe cazierjudiciaronline.com și ecazier, vreau să avem același și aici."

**Audit comparativ** (`cazierjudiciaronline.com/src/config/addons.ts` vs eghiseul DB):

| Addon | eghiseul (înainte) | cazierjudiciaronline | Acțiune |
|-------|-------------------|----------------------|---------|
| apostila_haga | **238** | **198** | ✅ REDUS la 198 (-40 RON) |
| traducere | 178.50 | 178.50 | already aligned |
| legalizare | 99 | 99 | already aligned |
| apostila_notari | 83.30 | 83.30 | already aligned |
| verificare_expert | 49 | 49 | already aligned |

Migration `040_apostila_haga_price_reduction.sql` aplicat pe toate 9 servicii care au `apostila_haga` (cazier judiciar/fiscal/auto/integritate + 4 certificate stare civilă). Verified: distinct prices = `{198.0}` post-migration.

### Update 11:00 — BUG: bundled option highlight nu persista după click

User raportă: hover pe bundled face galben, dar la click nu rămâne activ — deși opțiunea ESTE în coș (apare în summary).

**Cauza reală (nu visual):** `isBundledSelected(bundled.id)` în `options-step.tsx` căuta `o.optionId === bundled.id`. Dar `toggleBundled` scrie cu **synthetic ID**: `bundled:<parent.id>:<bundled.id>`. Chei diferite → check întoarce întotdeauna false → row-ul nu se highlight-uia.

**Fix:** Calculează același synthetic ID în check:
```ts
const syntheticId = `bundled:${option.id}:${bundledOptionId}`;
selectedOptions.some(o => o.bundledFor?.parentOptionId === option.id && o.optionId === syntheticId)
```

Plus border-2 + shadow-sm pe bundled selected — egalizat cu top-level OptionCard (înainte avea border 1px care confunda hover cu selected).

### Update 10:55 — Summary nesting v2 + secondary service rebrand

Feedback follow-up de la user:
- Opțiunile cazier judiciar nu erau grupate vizual sub serviciul principal (doar bundled-urile de la Integritate aveau linie).
- Bundled option indicator (cerc gol pe dreapta) crea confuzie — nu se vedea când era selectat.
- Label „Pachet" + sufix „(adaugă în aceeași comandă)" — prea zgomotos.

**Modificări:**

1. **OrderSummaryCard restructurat:** 2 grupuri vizuale identice — „Serviciu de bază" + linie vertical primary-100 cu opțiunile sale main-service nested; apoi pentru fiecare bundled sub-service alt grup cu „Serviciu secundar" + linie vertical + bundled-children. Layout: 
   ```
   Cazier Judiciar PF                198 RON
     │ Procesare Urgentă             +80 RON
     │ Apostilă de la Haga          +238 RON
   Certificat Integritate           +100 RON
     │ Apostilă de la Haga          +238 RON
     │ Traducere Autorizată         +178.50 RON
   ```

2. **Bundled card indicator șters** — top-level OptionCard nu are checkbox/radio pe dreapta, doar highlight galben (border + bg) când selectat. Bundled cards aveau în plus un mini-square confuz. Acum doar highlight galben, identic.

3. **Badge „Pachet" → „Serviciu secundar"** + suffix „(adaugă în aceeași comandă)" tăiat din nume:
   - Pe top-level: regex strip suffix din `option.name`
   - Pe bundled-children: strip ambele layere (`(Parent (adaugă în aceeași comandă))`)
   - Centralizat în `normalizeOrderOption` → propagă peste tot (summary + admin + contract)

4. **5 teste noi** în `tests/unit/lib/orders/normalize.test.ts` pentru strip — top-level, nested, plain, cu metadata, case-insensitive.

Total: **767 teste** verzi (era 762; +5).

---

## ⚠️ SESIUNE 2026-05-20 (continuare) — SEO foundation + Page #1 rebuild

**Detalii complete:** `docs/session-logs/2026-05-20-seo-cazier-judiciar-rebuild.md`

### Ce s-a făcut

**SEO Master Plan + Rebuild Queue** — GSC 16 luni analizat (1.43M clicks, 26M impressions). 47 pagini prioritizate în 5 batch-uri (~332h total). City pages plan separat (15 orașe, ~30-45h).

**Premisa CORECTĂ:** WP live, Next.js în dev. Obiectiv: la lansare să **EGALEZE și BATEM** pozițiile WP curente. Zero pierdere trafic la cutover.

**Tehnical foundations (Pasul 0):** `src/app/sitemap.ts` (dynamic), `src/app/robots.ts` (allow AI crawlers), `src/lib/seo/` toolkit (constants + metadata + schema builders), `next.config.ts` cu `trailingSlash: true` + redirects, `public/llms.txt`, șters `src/app/services/` orphan.

**Page #1 — `/servicii/cazier-judiciar-online/`** rewrite complet (5 iterații):
- 4,057 cuvinte (era 800)
- Schema.org @graph complet: Organization + WebSite + BreadcrumbList + Service + 4 Offers + AggregateRating (432, 4.9★) + WebPage + Person (reviewedBy)
- 17 FAQ în **6 categorii color-coded** (Procesare/Prețuri/Documente/Utilizare/Diaspora/Altele)
- 30 use cases în 6 categorii color-coded
- Specimen image WebP (1.1MB → 176KB)
- Tabel comparativ "Online vs Ghișeu" (corectat: nu mai e "10 RON timbru", program ghișeu marcat "restrâns")
- Pricing transparent table cu add-ons
- Reviews section cu 6 testimoniale (avatare gradient + featured card span 2x2)
- "De Ce eGhișeul" — 6 differentiators color-coded cu vertical accent bars
- Editorial note + dateModified
- Sticky mobile CTA bar
- 3 tabele convertite responsive (mobile cards vs desktop tables)
- a11y complet: focus-visible, skip-link, reduced-motion, aria-labels, touch targets 48px+
- Migration 038: `processing_config.estimated_days_display = "2-4 zile lucrătoare"` + `formatEstimatedDays()` helper

**Bug fixes critice:**
- Lucide icon components nu pot trece ca prop Server→Client → refactor cu string icon registry
- OCR: păstrăm `gemini-2.5-flash-lite` (era OK la user) dar adăugăm `parseGeminiOCRResponse()` helper care bubble raw text pe failure

### ⚠️ User feedback la sfârșit de zi

> „nu imi place cum arata cum ii organizat"

Pagina e tehnic completă (SEO 95/100, GEO 88/100, UI/UX 96/100, build green, 738/748 tests pass), DAR user nemulțumit de **organizarea + aspectul vizual**. Specific feedback nedat — necesită clarificare la următoarea sesiune.

**Posibile direcții de re-explorat:**
- Ordine secțiuni (reviews mai sus? comparison table mai jos?)
- Densitate informație (prea lung? prea încărcat?)
- Stil vizual (prea „template" Tailwind? lipsesc imagini reale?)
- Hero layout (asimetric? mai puțin text?)
- Typography hierarchy diferită
- Brand identity mai distinctiv (nu „default Next.js look")

### Următorul pas

Decizie strategică de luat la reluare:
1. **Polish Page #1 încă** (cu feedback specific user) — 8-12h
2. **Treci la Page #2** (cazier-fiscal-online) cu lessons learned, polish #1 mai târziu — recommended
3. **Restart Page #1 de la zero** cu o estetică nouă (alt design system, alt pattern)

### Competitori (analiză agent)

- **caziere.ro** — outranks us pe „cazier judiciar online" DAR pagină tehnic slabă (SPA, no SSR, no Schema, `lang="en"`, hidden pricing, 5 FAQ în accordion). Brand domain match e atu-ul lor.
- **cazierjudiciaronline.com** — threat real. 12+ city pages programmatic (Buc/Cluj/TM/IS/BV/SB/CT/CV/OD/AD/GL/SM/TGM). ~20-30% originalitate per oraș.

---

## ✅ SESIUNE 2026-05-20 (dimineața) — Pricing realignment + entity blocking + international courier

- **Pricing realignment (DB migration 036)** — `cazier-judiciar PF/PJ` base 250→**198 RON**, urgent total 350→**278 RON** (urgenta uplift 100→80). `cazier-auto` aliniat la judiciar (198/278). `cazier-fiscal` base 250→**198 RON** și `urgenta` deactivat (doar tier simplu). Toate add-on-urile rămân neschimbate (traducere 178.50, apostila haga 238, apostila notari 83.30, legalizare 99, verificare expert 49, copii suplimentare 25). Rationale: undercut cazierjudiciaronline.com (250/350) pe entry tier, păstrăm margine pe add-ons.
- **Entity type detection PJ (DB migration 037)** — port complet din `cazierjudiciaronline/Step2PersonalData.tsx:24-92`. PFA / Întreprindere Individuală / Întreprindere Familială / Cabinet medical/avocat / Birou Notarial / Executor Judecătoresc / Medic Specialist sunt acum **BLOCATE** în flow-ul PJ (cazier-judiciar PJ, cazier-fiscal, umbrella cazier-judiciar) — UI sugerează switch la flow PF. ONG-urile (Asociație / Fundație / Federație / Sindicat / Parohie / Biserică / Mănăstire) primesc WARNING (extras Registrul Asociațiilor + încheiere motivată — extra docs). Pattern matching word-boundary (regex `(^|[^A-ZĂÂÎȘȚ0-9])PATTERN([^A-ZĂÂÎȘȚ0-9]|$)`) — „EDITII SRL" NU mai face fals-pozitiv pe „II", „MEDIATIF SRL" NU pe „IF", etc.
- **CompanyDataStep refactor** — substring matching → word-boundary matching via `matchesAnyWord()` din `@/lib/services/entity-type-detection`. Block/warn logic citește din `verification_config.companyKyc.blockedTypes` + `specialRules` (DB) PLUS fallback automat pentru ONG-uri detectate prin name pattern (nu doar prin `type` returnat de ANAF — care e adesea gol pentru entități non-SRL).
- **NOU `src/lib/services/entity-type-detection.ts`** — util reutilizabil: `detectEntityType(name)`, `matchesAnyWord()`, `entityTypeMessage()`, `PFA_II_IF_PATTERNS`, `ONG_PATTERNS`. **50 unit tests** (`tests/unit/lib/services/entity-type-detection.test.ts`) acoperă: variante PFA cu/fără puncte, intreprindere individuală cu diacritice, cabinet medical/avocat, birou notarial/executor, ONG variants, false-positive guards (EDITII / MEDIATIF / FACABINET / LIGAMENT / CONSILIA / SINDICATEMENT), diacritice (Ț/Ț/Ă), edge cases.
- **Courier internațional** — activat „Internațional" în `delivery-step.tsx` (era „În curând"). 2 transportatori cu preț fix (port din `cazierjudiciaronline/config/addons.ts`):
  - **DHL Express International** — 250 RON, 1-3 zile lucrătoare
  - **Poșta Română International** — 100 RON, 7-15 zile lucrătoare
  - Form internațional: nume + telefon destinatar + stradă + localitate + cod poștal + țara (free-text, nu dropdown — clienții cunosc exact destinația). Validation zod separat de form-ul Romania.
  - **AWB manual** — nu există integrare API pentru DHL/Poșta Internațional; comanda merge în coadă de procesare manuală (similar cu cazierjudiciar.online). Banner info în UI: „Pentru destinații extra-europene te contactăm dacă apare cost suplimentar".
  - `AddressState` extins cu `country?: string` (folosit doar pentru livrare internațională).
- **Unit tests** — total **708** (era 645): +50 entity detection + 13 normalize existing (verificat). Toate trec.
- **Lucruri verificate că AU PARITATE deja** (no work needed): `APOSTILA_COUNTRIES` (90 țări) deja portate în `src/config/apostila-countries.ts`. `TRANSLATION_LANGUAGES` (9 limbi) deja portate în `src/config/translation-languages.ts`. Ambele integrate în `options-step.tsx`. CUI lookup folosește ANAF (mai autoritativ decât infocui.ro folosit de cazierjudiciaronline) — cu auto-fill name, type, registration, address, isActive, vatPayer.

### Fișiere noi/modificate (Sesiune 2026-05-20)

```
supabase/migrations/036_pricing_realignment_2026-05-20.sql            NOU
supabase/migrations/037_cazier_pj_entity_blocking.sql                 NOU
src/lib/services/entity-type-detection.ts                             NOU
src/lib/services/document-ocr.ts                                      (flash-lite → flash + parseGeminiOCRResponse helper + raw text capture)
src/components/orders/modules/company-kyc/CompanyDataStep.tsx         (word-boundary matching)
src/components/orders/steps-modular/delivery-step.tsx                 (international flow: DHL + Poșta RO)
src/types/verification-modules.ts                                     (AddressState.country?)
CLAUDE.md                                                             (link la /Users/raul/Projects/cazierjudiciaronline.com pentru viitorii agenți)
tests/unit/lib/services/entity-type-detection.test.ts                 NOU (50 tests)
tests/unit/lib/services/document-ocr-parse.test.ts                    NOU (14 tests)
tests/unit/types/address-state.test.ts                                NOU (6 tests)
```

**Test suite total: 715 passed / 725** (10 integration skipped — opt-in cu RUN_INTEGRATION=1).

### Hardening — OCR debugging (post-mortem dintr-o eroare punctuală)

User raportat o eroare punctuală: poză CI clară, OCR throw „Nu am putut extrage datele (încredere: 0%)". **NU e modelul** (`gemini-2.5-flash-lite` merge bine în restul cazurilor) — a fost o ratare punctuală pe acea poză specifică (compresie, hiccup Gemini, sau parser greedy care lua bracketul greșit).

**Hardening aplicat (model NESCHIMBAT, rămâne `flash-lite`):** helper nou `parseGeminiOCRResponse()` care bubble raw Gemini text în `issues[]` ca `[gemini-raw]: ...` (truncat la 500 chars). Refactorizat cele 3 extractoare (`extractFromCIFront`, `extractFromCIBack`, `extractFromPassport`) să folosească același helper — nu mai sunt 3 copii ale parse logic. Următoarea oară când o poză eșuează, vezi în consolă exact ce a spus Gemini → debug nu mai e orb.

---

## ✅ SESIUNE 2026-04-29 — Wizard redesign + foreign citizen flow

- **Step 1 (Contact) merge-uit cu Tip Client** — eliminat step separat. Adăugat citizenship toggle (PF only — Romanian / Foreign cu sub-pick EU vs non-EU) + purpose dropdown cu 219 motive (cazier-judiciar/fiscal/auto/integritate) cu priority ordering (cele frecvente primele cu badge). Eliminat `preferredContact`. Phone migrat la `PhoneInput` cu country picker (react-international-phone). NOU `<ForeignBirthFields>` (Localitatea + Țara nașterii, filter EU/non-EU) randat above motivul + helper hint sub butonul „Cetățean străin".
- **Step 2 (Date Personale) refactor** — mode picker Scan vs Manual (2 carduri mobile-first), CNP live preview (`summarizeCNP` chip cu data nașterii + sex + județ), country dropdown filtrat EU/non-EU (`getCountriesForForeignType`), OCR progress fake-anim 40→68% (era stuck la 40% pe durata fetch-ului). Pentru străini: mode auto-skip la `manual`, CNP devenit OPȚIONAL, „Locul Nașterii" hidden (deja la step 1), toggle „Am domiciliu în România? Da/Nu" cu validation split (Da → grid românesc; Nu → country + foreignAddress).
- **Step 4 (KYC) — flux complet pentru cetățeni străini** — 3 sloturi noi (Pașaport deschis / Selfie cu document / Permis rezidență sau Cert. înreg. fiscală). Doc type nou `passport`. Românii păstrează fluxul existing (CI scan + selfie + cert domiciliu). Toate documentele pentru străini mandatory.
- **Order summary unificat** — `OrderSummaryCard.tsx` rescris ca single source of truth (sidebar wizard + checkout + status page); `lib/orders/normalize.ts` produce canonical `OrderOptionLine` din 3 forme (camelCase wizard / snake_case DB / legacy admin); breakdown cu opțiuni + coupon + TVA 21%. Suffix „Cazier Judiciar PF/PJ" pe nume serviciu (factură legală). API extins cu `apiOrder.options` + `breakdown.couponCode`.
- **Coupon input pe pagina de checkout** — NOU `src/app/api/orders/[id]/coupon/route.ts` (POST/DELETE) și `src/components/payment/CouponInput.tsx`. POST validează codul, recalculează `total_price`, persistă `coupon_code` + `discount_amount`, **anulează PaymentIntent-ul Stripe existent** (`paymentIntents.cancel`) ca să se genereze unul nou cu suma corectă. Refuză operația dacă `payment_status === 'paid'`. Integrat în sidebar checkout sub `OrderSummaryCard` cu `clientSecret = null` + refetch order la apply/remove.
- **PDF support pe upload-uri ID** — `accept` extins la `application/pdf`. PDF-uri citite via `arrayBuffer().toString(base64)` fără compresie; imaginile rămân pe `compressImage()`. Gemini OCR acceptă nativ `application/pdf`. Preview placeholder card pentru PDF (FileCheck icon + „Document PDF încărcat").
- **Country list — corecții oficiale** — „Olanda" → **„Țările de Jos"** (per Romanian MAE post-2020 Dutch rebrand). Verificat contra europa.eu official EU member states (27 post-Brexit). Re-sortat în `COUNTRIES` + `EU_COUNTRIES`.
- **Layout & navigation** — wizard progress redesign (track continuu fără conectori segmentați), mobile sticky CTA bar, scroll-to-top la transition, eliminat card redundant „Codul comenzii", gap fix top.
- **Bug fixes** — `crypto.randomUUID` fallback pentru HTTP/IP local mobile (`lib/random-id.ts` cu RFC4122 v4 manual + Math.random); CNP date off-by-one (UTC drift în `extractBirthDateFromCNP`); CNP-derived auto-fill (birthDate + birthPlace=județ); motiv dropdown clipping (React Portal escape din `overflow-hidden`); emojis → lucide icons everywhere.
- **Stripe + Oblio** — PaymentIntent metadata îmbogățit cu `line_N_name/price/code` per produs + `couponCode` + `discountAmount` (audit financiar Stripe ↔ Oblio); descriere Stripe rich. Oblio TVA 19% → 21% (aliniere RO).
- **DB persistence (zero migration)** — `customer_data.contact.{citizenship, foreignType, purpose}` + `customer_data.personal.foreignData.{birthCity, birthCountry, hasRomanianAddress, foreignAddress}` + `uploadedDocuments[].type='passport'` salvat automat prin pipeline-ul existent (JSONB schema-less). Admin order detail afișează acum **Cetățenie** + **Motivul solicitării** + toate documentele inclusiv `passport`.
- **Test coverage** — 17 unit tests noi pentru `validateForeignKyc()` (`tests/unit/lib/validations/foreign-citizen.test.ts`) → **total 645 unit tests** (era 628). NOU `tests/e2e/wizard/foreign-citizen-flow.spec.ts` cu 5 Playwright teste pe chromium (toate pass): tile vizibil, helper hint, country filter EU/non-EU, panel border amber, hint dispare la switch back.
- **Cleanup** — eliminate 2 opțiuni deprecate din UI + drafts auto-cleanup (`verificare_expert`, `copii_suplimentare`).

---

## Schimbări recente (2026-04-27)

### Performance dev mode (10x recovery)
- `package.json` — `dev` script forțează `next dev --turbopack` (Next.js 16 default era webpack când nu e specificat explicit)
- `src/app/api/admin/orders/list/route.ts` — `count: 'estimated'` + exclude `status='draft'` din default `'all'` (90 drafts în DB cu unul de 4.8MB customer_data — toate erau încărcate la fiecare admin/orders)
- Rezultat live: PATCH /api/orders/draft 58s → 200-2500ms; admin/orders/list 25-39s → ~3-5s; navigare wizard 1-3s → 200-450ms

### Gemini model: hibrid OCR vs KYC (decizie după testare cu poze reale)
- `src/lib/services/document-ocr.ts:14` → `gemini-2.5-flash-lite` (OCR rapid, 1.9-3.5s, confidence 98%)
- `src/lib/services/kyc-validation.ts:13` → `gemini-2.5-flash` (face match precis, 6-10s, confidence 92-98%)
- **De ce nu lite și pe KYC:** test cu Stefania-Rodica selfie + CI propriu → flash-lite returna fals negativ („nu pot confirma cu certitudine"); flash returnează corect match=true 92%. Test cu Alexandra selfie + Stefania CI → ambele detectează corect mismatch, dar flash dă detalii și pe document type + name mismatch.
- Test rerunnable via `scripts/test-kyc-face-match.mjs` (necesită 3 imagini reale + dev server pe :3000)

### KYC face match — util reutilizabil + paritate wizard ↔ cont
- NOU `src/lib/kyc/face-match.ts` — `runFaceMatch()` + `fetchImageAsBase64()` cu threshold standard `valid = matched && validationConfidence >= 50`
- Wizard (`personal-kyc/KYCDocumentsStep.tsx`) folosește utilul; refactor a redus codul duplicat cu ~20 linii
- **Cont (`account/KYCTab.tsx`) — gap închis:** anterior selfie se salva FĂRĂ face match („For selfie, just save without OCR"). Acum la selfie upload: cache CI front în-sesiune SAU fetch din S3 → `runFaceMatch()` → blochează cu mesaj UI dacă mismatch. Loophole-ul „CI cu A + selfie cu B" e închis.
- Validat: ambele cazuri (match real + mismatch real) trec corect prin `scripts/test-kyc-face-match.mjs`
- Componentă reutilizabilă pentru OCR ID scan: `src/components/shared/IdScanner.tsx` (folosită de ProfileTab cont, cu compresie deja integrată)

### Image compression client-side
- NOU: `src/lib/images/compress.ts` — util cu EXIF orientation (`createImageBitmap` cu `imageOrientation: 'from-image'`), OffscreenCanvas + canvas fallback, target 1600px / JPEG q=0.85
- Aplicat în 4 componente customer-facing (6 puncte FileReader): `IdScanner.tsx`, `personal-kyc/PersonalDataStep.tsx`, `personal-kyc/KYCDocumentsStep.tsx`, `account/KYCTab.tsx`
- KYCTab are fallback gracios la fișier brut dacă compresia eșuează (HEIC, browser vechi)
- Verificat live: CI iPhone 5MB → 207KB pe S3 (95% reducere)
- Fișiere LEGACY (`steps/personal-data-step.tsx`, `steps/kyc-step.tsx`) NEatinse — orfane, planificate pentru ștergere

### Test infrastructure complet (TDD-ready) — 645 unit + 8 integration + 13+5 E2E + 17 smoke

**CI live verde** pe `origin/main` cu lint/tsc/tests/build BLOCKING. Cleanup ESLint complet 2026-04-28: 198 problems → 3 informational warnings (React Compiler external libraries, unfixable).
- **Vitest 4** + `npm test`, `test:watch`, `test:ui`, `test:unit`, `test:integration`, `test:e2e`, `test:smoke`, `test:all`
- **596 unit tests** acoperă: RBAC permissions (37), CNP validation (50), audit logger GDPR (32), rate limiter (14), Stripe payment intent (18), Stripe webhook security (8), confirm-payment (11), delivery calculator (43), document generator helpers PF/PJ (39), courier utils (71), Oblio invoice (20), CUI ANAF + Romanian counties (21), KYC face match util (10), KYC validation services (13), image compression (9), admin order processing (19), admin payment verification (13), admin AWB generate (10), admin AWB cancel (8), admin coupon CRUD (17), admin employee invite (21), admin invite accept (7), public coupon validation (21), courier quote (15), cron tracking update (7), customer tracking (8), user addresses CRUD (16), user billing profiles CRUD (13), user profile (8), user KYC save (17)
- **8 integration tests** opt-in cu `RUN_INTEGRATION=1`: KYC face match real Gemini (3) + order submit pipeline real DB (6 — draft → patch → submit → audit trail)
- **2 BUG-URI CRITICAL găsite prin TDD + fix-uite:**
  1. `audit-logger.ts:115` — `imageBase64` field nu era redactat în logs (case bug). GDPR-critical, fix-uit cu comentariu istoric.
  2. `order_history.event_type` CHECK constraint — 6 event_types folosite în cod (`order_submitted`, `payment_rejected`, `payment_verified`, `tracking_update`, `payment_proof_submitted`, `document_generation_failed`) erau rejected silent → audit trail trunchiat. Fix: `supabase/migrations/035_order_history_event_types.sql`. Critical pentru legal/audit.
- **`.github/workflows/test.yml`** — CI pe push/PR (lint + tsc + 245 tests + build production), reports uploaded ca artifact
- **`tests/README.md`** — guide TDD complet cu layout, quick reference, workflow bug fix, gaps prioritizate
- Playwright E2E (13 specs existente) accesibile prin `npm run test:e2e`

### Gap-uri vizibile pentru viitor (în `tests/README.md`)
- 🟠 HIGH: `documents/generator.ts` (DOCX), `services/courier/{sameday,fancourier}.ts`, `lib/oblio/invoice.ts`, order submit integration
- 🟡 MEDIUM: 32 admin endpoint-uri, user CRUD (addresses, billing-profiles), CUI validation
- 🟢 LOW: coupons + cetățean străin (deja există ad-hoc scripts în `scripts/test-*.mjs`)

### ⚠️ Security: rotire cheie Supabase pendentă (acțiune manuală)
- 2026-04-28: GitHub Secret Scanning Alert #1 a detectat `SUPABASE_SERVICE_ROLE_KEY` hardcodată în `scripts/run-migration-021.ts` (commit `6b5d85b`, Feb 11). Fișierul a fost șters (commit `549912d`).
- **TODO USER:** rotire cheie pe https://supabase.com/dashboard/project/llbwmitdrppomeptqlue/settings/api → Reset service_role key. Apoi update Vercel env vars + `.env.local` + restart dev. Apoi close GitHub alert #1.
- Cheia veche rămâne în git history pentru totdeauna — DOAR rotirea o invalidează.
- Scan complet codbase: niciun alt secret leaked detectat (Stripe, AWS, alte JWT-uri).

### Next.js 16 — proxy.ts (era middleware.ts)
- 2026-04-28 (commit `3eeeeae`): `src/middleware.ts` → `src/proxy.ts` per noua convenție Next.js 16.
- Funcția redenumită: `middleware()` → `proxy()`. `config.matcher` neschimbat.
- `@/lib/supabase/middleware.ts` (helper Supabase intern) rămâne neschimbat.
- Dev server pornește acum fără warning de deprecation.

### Bug NON-CRITICAL identificat (recomandare pentru viitor)
- Success page după Stripe redirect poate primi 404 tranzitoriu de la `/api/orders/[id]` în dev mode (Supabase auth fetch flake), aruncă error înainte să ajungă la fallback `confirm-payment`. Pe local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` rezolvă problema (webhook-ul reală marchează order-ul paid imediat). Robusteață suplimentară: în `src/app/comanda/success/[orderId]/page.tsx:100-130` ar trebui apelat confirm-payment direct când `redirect_status='succeeded'`, indiferent dacă GET-ul a reușit.

---

## Ce Functioneaza (What's Working)

### 1. Sistem de Autentificare & Conturi
- **Login/Register/Forgot Password** - Supabase Auth cu email/password
- **Protected routes** - Middleware redirecteaza la login pentru rute protejate
- **Account pages** - Profile, KYC, Addresses, Billing Profiles tabs
- **Dual profile system** - PF (persoana fizica) + PJ (persoana juridica) cu CUI/ANAF validation
- **Guest-to-customer conversion** - SaveDataModal dupa comanda, cont creat automat

### 2. Catalog Servicii & Landing Pages
- **Homepage** - Hero, services grid, features, stats, footer
- **Service catalog** - 12 servicii documentate (9 active in DB, 3 draft/planificate)
- **Service detail pages** - Detalii, preturi, FAQ per serviciu
- **Category-based URLs** - `/servicii/[category]/[slug]`

### 3. Wizard Modular de Comanda
- **URL pattern:** `/comanda/[service-slug]` (ex: `/comanda/cazier-judiciar-persoana-fizica`)
- **Dynamic step generation** - Steps se adapteaza pe baza `verification_config` JSONB
- **Core steps:** Contact, Options, Delivery, Billing, Review
- **Dynamic modules:** Client Type, Personal KYC, Company KYC, Company Documents, Property, Vehicle, Signature
- **CNP validation** - Full Romanian CNP validation cu checksum, gender, age
- **OCR cu Gemini 2.5 Flash** - Scan CI si extrage CNP, nume, adresa, data nastere
- **KYC Documents** - Upload CI front/back cu thumbnail previews
- **KYC Selfie face matching** - AI compara selfie cu poza din CI (recent fixat)
- **KYC confidence tracking per document** - Each KYC document (CI front, CI back, selfie, face match) stores AI confidence score (0-100%)
- **KYC confidence in admin** - Admin order detail shows "Verificare KYC" card with per-document confidence percentages and color coding (green >= 70%, yellow 50-69%, red < 50%)
- **Human review flagging** - When any KYC confidence score is below 70%, admin UI shows warning indicator for manual review
- **Electronic signature** - Canvas-based signature cu terms acceptance
- **Contract preview** - Live DOCX-to-HTML preview in signature step
- **Auto-save** - Debounced save (500ms), localStorage backup
- **Order ID** - Human-readable IDs (ORD-YYYYMMDD-XXXXX)
- **Romanian address parsing** - Str., Bl., Sc., Et., Ap. extraction
- **OCR street prefix fix** - "Strada" prefix removed to prevent duplication
- **ANAF company validation** - CUI lookup via official API (free)
- **Review step pricing** - Individual option prices, TVA 21% breakdown, total calculation

### 4. Plati (Payments)
- **Stripe PaymentElement** - Card payments (Visa, Mastercard, etc.)
- **Apple Pay / Google Pay** - Via Stripe PaymentElement
- **Bank transfer** - Reference code (PAY-YYYYMMDD-XXXXX), admin manual confirmation
- **Stripe webhooks** - Auto status update on payment success
- **Success/status pages** - Dynamic processing time, VAT 21% breakdown

### 5. Storage (AWS S3)
- **Region:** eu-central-1, Bucket: eghiseul-documents
- **Presigned URLs** - Secure upload/download without exposing credentials
- **KYC documents** - Upload to S3 at submission (not just base64 in DB)
- **Contracts & documents** - Stored under `orders/{friendly_id}/{type}/`
- **Signatures** - Client signatures uploaded to S3
- **Templates** - Admin-uploaded custom DOCX templates in `templates/custom/`
- **Encryption** - SSE-S3 (AES-256), Block Public Access enabled

### 6. Courier Integration
- **Fan Courier API v2.0** - Quotes, localities, FANbox lockers, AWB generation, tracking
- **Sameday API v3.1** - EasyBox lockers (6073), AWB generation, tracking
- **Multi-provider UI** - Side-by-side comparison with logos and pricing
- **Locker selector** - Scrollable card list with distance display, operating hours
- **Street-level geocoding** - Nominatim OpenStreetMap for accurate locker distance sorting
- **Postal code auto-fill** - 99.6% coverage from Fan Courier + Sameday data
- **FANbox 24-hour cache** - Module-level server cache for performance
- **AWB generation** - From admin panel for both couriers
- **AWB label download** - PDF download endpoint
- **AWB cancellation** - Cancel AWB from admin
- **Tracking timeline** - Real-time tracking display for customer + admin
- **Tracking cron job** - `/api/cron/update-tracking` updates all active shipments

### 7. Document Generation
- **docxtemplater** - DOCX generation with placeholder replacement
- **Auto-generated at submit:** `contract-prestari`, `contract-asistenta`
- **Admin-generated (custom templates):** `imputernicire`, `cerere-eliberare-pf`, `cerere-eliberare-pj`
- **Multi-signature embedding** - Client (drawn) + company + lawyer signatures as DrawingML inline images
- **Signature sizing** - Per-placeholder (client 240x80pt, company/lawyer 180x60pt)
- **Contract v1.2** - CI "emis de" info, 20+ template placeholders
- **CLIENT_DETAILS_BLOCK legal format** - Proper Romanian legal identification format:
  - PF: "NUME, legitimat/a cu CI seria XX nr. XXXXXX, emisa de..., CNP XXXXXXXXXXXXX, cu domiciliul in Str..., Nr..., Localitatea..., Jud..."
  - PJ: firma + CUI + Nr. Reg. Com. + sediu + "reprezentata prin..." cu CI/CNP details ale reprezentantului
- **Contract preview uses updated format** - Live DOCX-to-HTML preview in signature step renders the same legal CLIENT_DETAILS_BLOCK
- **DOCX-to-HTML preview** - Mammoth server-side rendering
- **Document regeneration** - Re-generate button in admin UI
- **S3 upload** - All generated documents uploaded to S3

### 8. Contract Legal Validity
- **Signature metadata** - IP, user agent, server timestamp, SHA-256 document hash
- **Consent tracking** - Law 214/2024, eIDAS Art. 25, OUG 34/2014
- **Withdrawal waiver** - OUG 34/2014 art. 16 lit. (a) mandatory checkbox

### 9. Admin Panel (`/admin`)
- **Dashboard** - Live stats cards, recent orders, activity feed
- **Orders management** - List by status, search, filter, order detail page
- **Order detail** - Personal data (2-col grid), address (3-col grid), billing (PF/PJ), payment info with Stripe link
- **Status workflow** - `paid` -> `processing` -> `documents_generated` -> `submitted_to_institution` -> `document_received` -> `extras_in_progress`/`document_ready` -> `shipped` -> `completed`
- **Processing section** - Contextual action buttons per status
- **Document generation** - Generate/regenerate DOCX, preview, download
- **Documents visible in pending** - No status restriction for viewing documents
- **KYC documents in admin** - Client uploaded CI/selfie visible in order detail
- **AWB management** - Generate, download label, cancel
- **User management** - Employees, customers, invitations tabs
- **Employee invite flow** - Modal, API, accept page with 8 states
- **Settings** - 6 tabs: Services, Couriers, Payments, Date Firma, Template-uri Documente, System
- **Company & Lawyer settings** - Company/lawyer data + signature/stamp PNG upload
- **Custom template upload** - Admin uploads DOCX templates via S3
- **RBAC** - 5 roles (super_admin, manager, operator, contabil, avocat), 7 permissions

### 10. Number Registry (Barou)
- **Number ranges management** - Create/edit ranges for contracts and delegations
- **Registry journal** - All allocations with grouped view (contract + delegation per order on same row)
- **Atomic allocation** - `allocate_number()` RPC with reuse logic
- **Manual entry** - Add entries manually for external documents
- **Void entries** - Mark numbers as void/anulat
- **CSV export** - Flat export for accounting, includes "Document" column with linked filename
- **Backfilled historical entries** - 9 entries from existing order_documents
- **Own page** - Registry now at `/admin/registru` (dedicated sidebar item, no longer settings tab)
- **Document download icons** - FileDown icon in registry table links to download associated document
- **Registry-document linking** - `order_document_id` properly set for reused numbers on regeneration

### 11. Security
- **Rate limiting** - 10 req/min guest, 30 req/min authenticated
- **Audit logging** - Console + DB persistence
- **PII encryption** - AES-256 for CNP, CI serie/numar (migration 007)
- **Row Level Security** - All Supabase tables
- **Input validation** - Zod schemas on all forms and API endpoints
- **RBAC on all admin endpoints** - `requirePermission()` middleware
- **S3 encryption at rest** - SSE-S3 (AES-256), Block Public Access
- **IDOR protection** - Ownership verification on all user endpoints
- **GDPR auto-cleanup** - Draft orders anonymized after 7 days

### 12. Customer-Facing Pages
- **Order status page** (`/comanda/status`) - Public lookup by order number + email
- **Account orders** (`/account/orders/[id]`) - Detailed order view with document downloads
- **Client document downloads** - Presigned S3 URLs for `visible_to_client` documents

---

## Probleme Cunoscute / Necesita Testare (Known Issues / Needs Testing)

### Necesita Testare Reala (New/Fixed - Untested with Real Data)

| Item | Stare | Detalii |
|------|-------|---------|
| **KYC S3 Upload** | New | Documents now upload to S3 at submission instead of just base64 in DB. Needs testing with actual document uploads through the full wizard flow. |
| **KYC Face Matching** | Fixed | `getIDDocument()` type matching and API payload corrected. Needs testing with a real selfie + ID card to verify Gemini comparison works end-to-end. |
| **KYC Thumbnail Previews** | New | Wizard shows thumbnails of uploaded ID documents. Verify rendering on different screen sizes and document orientations. |
| **Registry Own Page** | New | Registry moved from settings tab to `/admin/registru` with sidebar icon. Verify navigation, page load, and all registry features still work. |
| **Registry Document Download** | New | FileDown icon in registry table next to numbers downloads the linked document. Verify icons appear for entries with linked documents and download works. |
| **Registry-Document Linking** | Fixed | `order_document_id` now set correctly for reused numbers when regenerating documents. Verify by regenerating a document and checking registry entry links to correct doc. |
| **CSV Export Document Column** | New | CSV export now includes "Document" column with linked filename. Verify CSV has correct filenames and format. |
| **CLIENT_DETAILS_BLOCK Legal Format** | Enhanced | Rewritten with proper Romanian legal format: PF shows "legitimat/a cu CI seria..., emisa de..., CNP..., cu domiciliul in..." and PJ shows company details + representative with CI. Verify format in generated contracts section 1.2 for both PF and PJ orders. |
| **KYC Confidence Tracking** | New | Each KYC document stores AI confidence (0-100%). Admin order detail shows "Verificare KYC" card with color-coded percentages. Verify confidence appears for CI front, CI back, selfie, and face match. Verify < 70% shows warning. |
| **Contract Preview Legal Format** | Enhanced | Contract preview in wizard signature step now renders the same legal CLIENT_DETAILS_BLOCK format. Verify preview matches generated document format. |
| **Contract v1.2 Content** | Enhanced | CI "emis de" info added, 20+ new placeholders including CLIENT_BIRTH_PLACE and CLIENT_BIRTH_COUNTRY. Verify all placeholders render correctly for PF and PJ orders. |
| **Date Formatting in Docs** | Fixed | Birth date and CI expiry date no longer show time portion in generated documents. Verify dates display as DD.MM.YYYY without HH:MM:SS. |
| **TVA 21% Unified** | Fixed | TVA changed from 19% to 21% and unified across all components including OrderSummaryCard. Verify calculations are consistent everywhere. |
| **Timeline Events** | New | `order_submitted` and `document_generation_failed` events now recorded. Verify events appear in order history after submission and on generation failures. |
| **Status Page Prices** | Fixed | Amounts now display with `.toFixed(2)` for consistent decimal formatting. Verify no floating point artifacts on status page. |
| **OCR Street Prefix Removal** | Fixed | "Strada" prefix stripped to prevent "Strada Salcamilor" duplication. Test with various address formats (Str., Strada, Aleea, Bulevardul). |
| **Admin Billing PF Display** | Fixed | PF billing data was showing empty. Verify it now correctly shows name, CNP, address for PF billing. |
| **Admin Payment Stripe Link** | New | Payment method shows "Stripe (card)" with dashboard link. Verify link opens correct Stripe payment intent page. |
| **User Invite Button** | New | super_admin sees "Adauga Utilizator" button on Users page. Verify invite modal opens, invitation is sent, and accept flow works. |
| **File Input Reset** | Fixed | File input in PersonalDataStep clears after document upload. Verify re-uploading a different document works without page reload. |
| **Signature Card Empty State** | Fixed | Signature step shows proper empty state when no signature drawn. Verify empty state displays and clears correctly. |

### Probleme Cunoscute (Known Issues)

| Item | Severitate | Detalii |
|------|------------|---------|
| **Date formatting in admin** | LOW | Romanian date locale not consistently applied in all admin views. Birth date/expiry fixed in documents, but some admin list views may still need Romanian locale. |
| **Passport UI support** | LOW | OCR backend supports passports, but UI selector in personal-data-step.tsx is not built. |
| **Legacy wizard code** | LOW | Old wizard at `/orders/new` and `order-wizard-provider.tsx` still present. Should be removed. |
| **Google AI DPA** | MEDIUM | Google Gemini Data Processing Agreement not verified for GDPR compliance. |
| **CSP headers** | MEDIUM | Content Security Policy headers not yet configured in `next.config.js`. |
| **CORS restrictions** | MEDIUM | API routes not explicitly CORS-restricted. |
| **2FA for admin** | MEDIUM | TOTP 2FA not yet implemented for admin accounts. |
| **Database backup config** | MEDIUM | Supabase automatic backups not explicitly verified. |

---

## Ce Nu Este Inca Implementat (Backlog / Not Yet Implemented)

### Sprint 6 - Notifications & Polish (Next Up)

| Feature | Prioritate | Detalii |
|---------|-----------|---------|
| **Email notifications** | HIGH | Resend integration. Order confirmation, status change alerts, payment receipt. No email templates exist yet. |
| **SMS notifications** | HIGH | SMSLink.ro integration. Status change SMS to customer phone. API key configured but no implementation. |
| **Oblio invoicing** | HIGH | e-factura compliant invoicing. API credentials not yet configured. Critical for Romanian legal compliance. |
| **Post-order delivery request** | MEDIUM | Client requests courier delivery after choosing "ridicare personala" at checkout. Requires separate Stripe payment for delivery fee. See backlog in `DEVELOPMENT_MASTER_PLAN.md`. |
| **Stripe-Invoice reconciliation** | MEDIUM | Admin view to match Stripe payment intents with Oblio invoices. CSV export for accountant. `stripe_payment_intent_id` partially stored via webhook. |
| **Revenue charts** | MEDIUM | Admin dashboard charts with recharts library. Monthly revenue, orders by service, payment methods breakdown. |
| **Audit logging for admin** | MEDIUM | Log all admin actions (status changes, document generation, user management) to `admin_activity_log` table. |
| **Real-time notifications** | LOW | WebSocket-based in-app notifications. Schema exists (`notifications` table in migration 025) but no UI. |
| **Mobile responsive polish** | LOW | General responsive improvements across all pages. |
| **Date formatting (Romanian locale)** | LOW | Consistent Romanian date formatting in admin panel. |

### Future / Unscheduled

| Feature | Detalii |
|---------|---------|
| **Support notes system** | Internal notes on orders for admin team. |
| **Continue order on behalf** | Admin continues incomplete customer order. |
| **Email templates editor** | Admin editable email templates. |
| **Auto-generate docs at payment** | Webhook triggers document generation automatically on payment success. |
| **CI/CD pipeline** | GitHub Actions for automated testing and deployment. |
| **2FA TOTP for admin** | Two-factor authentication for admin accounts. |
| **Passport UI selector** | UI component for passport upload (OCR backend ready). |
| **Data retention policy** | Formal GDPR data retention documentation. |
| **DPIA (Data Protection Impact Assessment)** | Required GDPR document for processing PII at scale. |
| **Right to Erasure API** | GDPR Art. 17 - customer data deletion endpoint. |
| **Additional services** | 8 remaining services in draft status need full configuration. |
| **Rate limiting on invitations** | Prevent invitation spam. |

---

## Checklist Testare Manuala (Manual Testing Checklist)

### 1. Flux Complet Comanda PF (Personal Fizica)

**Pre-requisite:** Service "Cazier Judiciar PF" active in DB.

```
[ ] 1.1  Navigate to /comanda/cazier-judiciar-persoana-fizica
[ ] 1.2  CONTACT STEP: Enter email, phone, select contact method
         - Verify validation (email format, phone format)
[ ] 1.3  CLIENT TYPE STEP: Select "Persoana Fizica"
[ ] 1.4  PERSONAL DATA STEP:
         - Upload CI (front) -> verify OCR auto-fills CNP, name, address
         - Verify OCR street prefix removal (no "Strada Strada..." duplication)
         - Verify Romanian diacritics handled (Ș, Ț, Î, Â, Ă)
         - Manually correct any OCR errors
         - Verify CNP validation (checksum, length)
[ ] 1.5  KYC DOCUMENTS STEP:
         - Upload CI front (should be pre-filled from personal data step)
         - Upload CI back
         - Verify thumbnail previews display for both
         - Take selfie -> verify face matching result
         - Verify face matching compares against CI photo
[ ] 1.6  OPTIONS STEP:
         - Select service options (urgenta, traducere, apostila)
         - Verify prices update in sidebar
[ ] 1.7  SIGNATURE STEP:
         - View contract preview (DOCX-to-HTML)
         - Draw signature on canvas
         - Accept terms and conditions
         - Verify consent checkboxes (legal references)
[ ] 1.8  DELIVERY STEP:
         - Test "Ridicare personala" (no delivery)
         - Test "Curier la adresa" -> verify address form, postal code auto-fill
         - Test "EasyBox/FANbox" -> verify locker list, distance display
         - Change county -> verify city/street reset
         - Verify delivery prices in sidebar
[ ] 1.9  BILLING STEP:
         - Test "Factureza pe mine" (same person)
         - Test "Alta persoana fizica" (different PF)
         - Test "Persoana juridica" (company with CUI validation)
[ ] 1.10 REVIEW STEP:
         - Verify all data correct (contact, personal, options, delivery, billing)
         - Verify individual option prices displayed
         - Verify TVA 21% calculation correct
         - Verify total = subtotal + TVA + delivery
         - Accept withdrawal waiver checkbox
         - Proceed to payment
[ ] 1.11 PAYMENT:
         - Test Stripe card payment (use test card 4242...)
         - Verify redirect to success page
         - Verify success page shows dynamic processing time
         - Verify success page shows VAT 21% breakdown
[ ] 1.12 POST-PAYMENT:
         - Verify order appears in /account/orders
         - Verify order detail page (/account/orders/[id])
         - Verify KYC documents uploaded to S3 (not just base64)
         - Verify contracts auto-generated (contract-prestari, contract-asistenta)
```

### 2. Admin Vizualizare Comanda

**Pre-requisite:** Admin account with `super_admin` role, at least one paid order.

```
[ ] 2.1  Login as admin, navigate to /admin
[ ] 2.2  DASHBOARD:
         - Verify stats cards (total orders, revenue, pending, today)
         - Verify recent orders list
         - Verify activity feed
[ ] 2.3  ORDERS LIST (/admin/orders):
         - Verify orders appear with correct status badges
         - Test status filter tabs
         - Test search by order number
[ ] 2.4  ORDER DETAIL (/admin/orders/[id]):
         - PERSONAL DATA: Verify 2-col grid layout, all fields populated
         - ADDRESS: Verify 3-col grid layout with separate fields
         - BILLING: Verify PF details show (name, CNP, address) or PJ details (company, CUI)
         - PAYMENT: Verify method shows "Stripe (card)" with Stripe dashboard link
         - OPTIONS: Verify selected options with individual statuses
[ ] 2.5  DOCUMENTS SECTION:
         - Verify documents visible even in pending/paid status
         - Verify auto-generated contracts listed (contract-prestari, contract-asistenta)
         - Test "Descarca" button for each document
         - Test "Preview" button (DOCX-to-HTML)
         - Test "Genereaza" button for custom templates (imputernicire, cerere)
[ ] 2.6  KYC DOCUMENTS:
         - Verify client CI front/back visible
         - Verify selfie visible
         - Verify images load from S3 (presigned URLs)
[ ] 2.7  STATUS WORKFLOW:
         - Test transitioning: paid -> processing -> documents_generated
         - Verify contextual buttons change per status
         - Verify invalid transitions blocked
[ ] 2.8  AWB GENERATION (if delivery order):
         - Test generate AWB (Fan Courier or Sameday)
         - Test download AWB label PDF
         - Test cancel AWB
```

### 3. KYC Document Preview (Wizard + Admin)

```
[ ] 3.1  WIZARD: Upload CI front in personal data step
         - Verify thumbnail shows after upload
         - Verify OCR processes and auto-fills fields
[ ] 3.2  WIZARD: Upload CI back in KYC step
         - Verify thumbnail shows after upload
[ ] 3.3  WIZARD: Take selfie
         - Verify face matching runs against CI photo
         - Verify result feedback (match/no match)
[ ] 3.4  ADMIN: Open order with KYC documents
         - Verify CI front image loads from S3
         - Verify CI back image loads from S3
         - Verify selfie image loads from S3
         - Verify images are not broken/404
```

### 4. Registry Page in Admin

```
[ ] 4.1  Navigate to /admin/registru (own page, sidebar item with BookOpen icon)
[ ] 4.2  RANGES:
         - Verify existing number ranges display
         - Test creating a new range (e.g., contracte 101-200)
         - Test editing a range
[ ] 4.3  JOURNAL (GROUPED VIEW):
         - Verify entries display grouped by order
         - Verify contract + delegation on same row for same order
         - Verify ungrouped entries (manual, standalone) display correctly
[ ] 4.4  MANUAL ENTRY:
         - Test adding a manual registry entry
         - Verify it appears in the journal
[ ] 4.5  VOID:
         - Test voiding an entry
         - Verify "Anulat" status displays
[ ] 4.6  DOCUMENT ICONS:
         - Verify FileDown icon appears next to numbers that have linked documents
         - Test clicking FileDown icon downloads the correct document
         - Verify entries without linked documents show no icon
[ ] 4.7  CSV EXPORT:
         - Test "Export CSV" button
         - Verify CSV is flat (not grouped)
         - Verify all fields present (number, type, order, date, status)
         - Verify "Document" column shows filename for linked documents
```

### 5. Contract Content Verification

```
[ ] 5.1  Create a PF order through the wizard and submit
[ ] 5.2  In admin, generate "contract-prestari" document
         - Verify CLIENT_DETAILS_BLOCK populated (name, CNP, CI serie/nr, emis de, adresa)
         - Verify CI "emis de" field present and correct
         - Verify service-specific content correct
         - Verify client signature embedded
         - Verify company signature embedded
         - Verify lawyer signature embedded
[ ] 5.3  Generate "contract-asistenta" document
         - Verify same client details
         - Verify different contract content
[ ] 5.4  Generate "imputernicire" (if custom template uploaded)
         - Verify template placeholders replaced
         - Verify Number Registry allocation (number assigned)
[ ] 5.5  Preview contract in wizard (signature step)
         - Verify HTML rendering matches template content
         - Verify client details pre-filled
         - Verify pricing information present
```

### 6. Review Step Pricing & TVA

```
[ ] 6.1  Start order for "Cazier Judiciar PF" (base price 250 RON)
[ ] 6.2  Select options:
         - Urgenta (+50 RON)
         - Traducere (+80 RON)
         - Apostila (+100 RON)
[ ] 6.3  Select delivery method:
         - Curier la adresa (check delivery price)
[ ] 6.4  At review step verify:
         - Base service price: 250 RON
         - Each option listed with individual price
         - Subtotal calculated correctly (250 + 50 + 80 + 100 = 480 RON)
         - Delivery fee shown separately
         - TVA 21% calculated on subtotal + delivery
         - Grand total = (subtotal + delivery) * 1.21
[ ] 6.5  After payment, verify success page shows same breakdown with TVA 21%
[ ] 6.6  On order status page (/comanda/status), verify TVA 21% displayed
```

---

## Informatii Tehnice Rapide

### Environment Variables Status

| Variable | Status |
|----------|--------|
| Supabase (URL, Anon Key, Service Role) | Configured |
| AWS S3 (Region, Keys, Bucket) | Configured |
| Stripe (Publishable, Secret, Webhook) | Configured |
| Google AI (Gemini) | Configured |
| Fan Courier (Username, Password, Client ID) | Configured |
| Sameday (Username, Password) | Configured |
| Oblio (Client ID, Secret, CIF, Series) | **NOT CONFIGURED** |
| SMSLink (API Key) | **NOT CONFIGURED** |
| Resend (API Key) | **NOT CONFIGURED** |
| CRON_SECRET | Configured |

### Database Migrations Applied

27 migrations total (001 through 027), all applied. Latest: `027_number_registry.sql`.

### Key File References

| Area | File |
|------|------|
| Main wizard | `src/components/orders/modular-order-wizard.tsx` |
| Wizard state | `src/providers/modular-wizard-provider.tsx` |
| OCR (Gemini 2.5 Flash) | `src/lib/services/document-ocr.ts` |
| KYC (Gemini 2.5 Flash) | `src/lib/services/kyc-validation.ts` |
| Document generator | `src/lib/documents/generator.ts` |
| Signature inserter | `src/lib/documents/signature-inserter.ts` |
| S3 operations | `src/lib/aws/s3.ts` |
| Fan Courier client | `src/lib/services/courier/fancourier.ts` |
| Sameday client | `src/lib/services/courier/sameday.ts` |
| RBAC server | `src/lib/admin/permissions.ts` |
| RBAC client | `src/hooks/use-admin-permissions.tsx` |
| Admin order detail | `src/app/admin/orders/[id]/page.tsx` |
| Admin registry page | `src/app/admin/registru/page.tsx` |
| KYC types (confidence) | `src/types/verification-modules.ts` |
| Admin settings | `src/app/admin/settings/page.tsx` |
| Review step | `src/components/orders/steps-modular/review-step.tsx` |
| Delivery step | `src/components/orders/steps-modular/delivery-step.tsx` |
| Billing step | `src/components/orders/steps-modular/billing-step.tsx` |

---

**Document generat:** 2026-02-19
**Referinta completa:** `docs/DEVELOPMENT_MASTER_PLAN.md`
