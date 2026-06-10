# Sesiune 2026-06-10 (4) — Verificare E2E Playwright + fix-uri teste

**Status:** ✅ 71/71 verde pe suitele stabile (chromium); build OK
**Fișiere:**
- `src/components/shared/PhoneInputClient.tsx` (a11y, producție)
- `tests/e2e/wizard/foreign-citizen-flow.spec.ts` (rescris)
- `tests/e2e/wizard/pf-flow-ui.spec.ts`, `ui-elements.spec.ts`
- `tests/e2e/orders/status-page.spec.ts` (nou)
- `tests/e2e/services/service-detail.spec.ts`, `tests/e2e/homepage.spec.ts`

---

## Context

User: „fă teste Playwright și verifică dacă totul e ok." Am rulat suita E2E existentă, am reparat ce s-a stricat / era învechit și am adăugat teste pentru schimbările recente.

## Schimbare de producție (necesară pentru teste + a11y)

`PhoneInputClient.tsx`: adăugat `aria-label="Telefon"` la input-ul `react-international-phone` (care altfel randa un `<input>` fără nume accesibil). Beneficii: cititoarele de ecran anunță câmpul; testele îl pot ținti după rol/nume.

## Teste reparate / adăugate

- **`foreign-citizen-flow.spec.ts`** — REScris pentru noua **bifă unică** „Sunt cetățean străin" (vechiul UI cu 2 butoane + UE/non-UE a fost eliminat). Verifică: bifa apare, bifarea arată panoul „Date despre naștere", lista de țări e completă (Germania + SUA în aceeași listă), debifarea ascunde panoul. **4/4 ✓**
- **`pf-flow-ui.spec.ts`** — adăugat helper `fillContact` care **tastează** numărul (react-international-phone ignoră `fill()` cu string formatat). Aliniat fluxul la realitatea curentă: slug-ul `/-persoana-fizica` merge **contact → date personale direct** (fără pas „tip client"); testul de tip client mutat pe slug-ul umbrella. Așteptare pentru modulul KYC dinamic înainte de „Completez manual". **Toate ✓**
- **`ui-elements.spec.ts`** — scoasă asertarea pe radio group-ul „preferred contact" (eliminat din UI); telefonul acum găsit prin `aria-label`. **✓**
- **`status-page.spec.ts`** (NOU) — pagina de status randează formularul (cod + email + buton); căutare comandă inexistentă nu crapă. **2/2 ✓**
- **`service-detail.spec.ts` + `homepage.spec.ts`** — corectat assertarea URL `/services/` → `/servicii/` (rute RO).

## Rezultat (chromium)

- wizard (foreign + pf-flow + ui-elements): **18/18 ✓**
- orders/status-page: **2/2 ✓**
- smoke + api + homepage: **✓**
- **Total suite stabile: 71/71 ✓**

## Rămase roșii (PRE-EXISTENTE, neatinse de munca mea)

- `service-detail.spec.ts` 2 teste: „breadcrumb navigation" și „documente necesare section" — asertă conținut/structură care **nu există** pe pagina `/servicii/[slug]` actuală. Nu am slăbit testele artificial și nici n-am redesenat pagina (în afara scopului). De decis: ori adăugăm breadcrumb + secțiune „documente necesare" pe pagina de serviciu, ori actualizăm/ștergem aceste 2 teste.
- `orders/full-order-flow.spec.ts` — flux complet cu Stripe; necesită mediu de plată, nu a fost rulat aici.

## Cum rulezi
```
npm run test:e2e -- --project=chromium tests/e2e/wizard tests/e2e/orders/status-page.spec.ts tests/e2e/smoke
```
(serverul de dev pornește automat / se refolosește pe localhost:3000)
