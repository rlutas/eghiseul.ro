# Sesiune 2026-06-09 — Navigare optimistă în wizard (butonul „Continuă" nu mai așteaptă salvarea)

**Status:** ✅ Aplicat (tsc + lint + build OK)
**Fișier:** `src/components/orders/modular-order-wizard.tsx`

---

## Simptom raportat

User: „la fiecare pas butonul «Continuă» se încarcă cam greu — oare pentru că se salvează datele din comandă?"

Da, exact. Diagnostic confirmat în cod.

## Cauză

Butonul era:
```tsx
disabled={!stepValid || state.isSaving || isSubmitting}
{(state.isSaving || isSubmitting) && <Loader2 ... />}
```

`state.isSaving` se aprinde la **auto-save-ul de draft** (`POST /api/orders/draft`), declanșat (debounce 500ms) ori de câte ori `state.isDirty === true` — adică după ce modifici un câmp pe pas. Deci: completezi date → apeși „Continuă" → butonul stă blocat cu spinner 1-3s cât durează scrierea în DB, apoi avansează. La fiecare pas.

## Fix

Navigare **optimistă**: pașii intermediari avansează instant; salvarea de draft continuă în fundal (are deja indicator separat `<SaveStatus>` în header). Doar pasul final („Plătește") mai așteaptă salvarea/submisia — acolo integritatea contează.

```tsx
disabled={ !stepValid || isSubmitting || (isLastStep && state.isSaving) }
{((isLastStep && state.isSaving) || isSubmitting) && <Loader2 ... />}
```

Plus butonul „Înapoi": `disabled={isFirstStep}` (înainte era blocat și el de `state.isSaving`).

## De ce e sigur

- `NEXT_STEP` nu setează `isDirty`, deci simpla navigare nu declanșează salvări noi.
- Salvarea trimite **tot** state-ul și folosește AbortController; o salvare ulterioară o înlocuiește pe cea în zbor — avansarea nu pierde date.
- Endpoint-ul `/api/orders/draft` are deduplicare după `friendly_order_id`.
- La pasul final butonul **tot** blochează pe `state.isSaving`, deci nu se trimite plata înainte ca draftul să fie persistat.
- `<SaveStatus>` rămâne vizibil → userul vede „se salvează / salvat / eroare + retry".

## Verificare

- `npx tsc --noEmit` → 0
- `eslint` → 0
- `npm run build` → OK

## Notă (rămas, minor)

La intrarea în pașii de verificare (KYC etc.) modulul se încarcă dinamic (`<StepLoading />` ~100-500ms). E separat de fix-ul ăsta; dacă devine deranjant, se poate prefetch-ui modulul următor.
