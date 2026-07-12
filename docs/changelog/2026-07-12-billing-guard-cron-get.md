# 2026-07-12 — Guard billing server-side + cron-uri Vercel reparate (GET 405)

## Incidente investigate (rezolvate)

1. **E-260712-VQ3WA** (extras CF, 89 RON, Papara) — plătită cu billing incomplet
   (`billing = { lastName: "Papa", isValid: false }`, fără prenume/adresă/localitate/județ).
   Factura **EGH-0028** a ieșit cu client „Papa" fără adresă. Clienta a văzut extrasul livrat,
   apoi a re-plasat comanda identică (**E-260712-UGGG8**, CF 30155) cu billing complet →
   **a plătit 89 RON de 2×** (de decis refund). Emailurile duble (confirmare + livrare ×2) =
   două comenzi separate, comportament normal.
2. **E-260710-EFNSH** (identificare imobil, 198 RON, Husaru) — fără factură 2 zile: Oblio a
   răspuns `401 token expired` exact la webhook, iar plasa de siguranță (cron
   `invoice-health-check`) **nu rula deloc în producție** (vezi mai jos). Recuperată manual
   2026-07-12 împreună cu **WP-260707-99959** (998 RON, Malitca) — ambele au fost emise din
   greșeală pe seria **EGI2024** (`.env.local` avea seria veche; corectat la EGH). Decizie
   utilizator: rămân pe EGI2024, nu se reemite.

## Cauze rădăcină + fixuri

### 1. Billing incomplet putea ajunge la plată

- **Client-side:** `stepValid` nu se reseta la schimbarea pasului în
  `modular-order-wizard.tsx` — un double-tap rapid pe „Continuă" folosea validitatea pasului
  VECHI și sărea complet peste validarea noului pas. **Fix:** `setStepValid(false)` înainte de
  `nextStep()`.
- **Server-side:** `/api/orders/[id]/submit` nu valida billing deloc (nici `payment`).
  **Fix:** guard nou `BILLING_INCOMPLETE` (HTTP 400) în submit, folosind
  `getMissingInvoiceClientFields()` din `src/lib/oblio/invoice.ts` — validează clientul
  EFECTIV de factură, cu aceleași fallback-uri ca `buildOblioClient` (contact/KYC personal),
  ca să nu blocheze comenzile KYC cu billing sparse (ex. E-260708-U5LC9, legitime).
  - PF: nume complet (≥2 cuvinte) + stradă + localitate + județ. CNP NU e cerut server-side.
  - PJ: doar denumire + CUI (Oblio completează adresa din ANAF — dovadă EGH-0022).
  - Unit tests: `tests/unit/lib/oblio/build-client.test.ts` (shape-ul exact VQ3WA + 4 cazuri).

### 2. Patru cron-uri Vercel nu rulau NICIODATĂ în producție

Vercel Cron invocă path-urile cu **GET**; rutele răspundeau 405 („GET disabled in production")
sau nu exportau GET deloc. Doar `update-tracking` avea passthrough-ul corect.

| Cron | Înainte | Acum |
|---|---|---|
| `invoice-health-check` (orar) | GET → 405 | GET → POST (job real) |
| `auto-abandon` (15 min) | GET → 405 | prod: GET → POST; dev: dry-run |
| `auto-finalize-delivered` (zilnic) | GET → 405 | prod: GET → POST; dev: dry-run |
| `recovery-emails` (15 min) | fără GET → 405 | GET → POST |

Consecințe istorice: facturi eșuate nerecuperate (EFNSH, WP-99959), zero emailuri de recovery
trimise de cron, comenzi `pending` neabandonate automat, comenzi livrate nefinalizate automat.

## Notă Oblio (verificat empiric)

Match-ul pe email din Oblio NU corupe facturile eghiseul: factura afișează mereu datele trimise
de noi (EGH-0029 corect „Elena Daniela Papara" deși nomenclatorul avea clientul „Papa" pe același
email). eghiseul nu trimite `autocomplete: 1` (spre deosebire de cazierjudiciaronline) și trimite
billing-ul comenzii curente la fiecare factură.

## Rămase deschise

- Refund de decis pentru dublura Papara (VQ3WA vs UGGG8, 89 RON).
- EGH-0028 emisă cu client incomplet („Papa") — de corectat manual în Oblio dacă se dorește.
- `payment`/`bank-transfer` nu au guard propriu (acoperit indirect: submit blochează înainte).
