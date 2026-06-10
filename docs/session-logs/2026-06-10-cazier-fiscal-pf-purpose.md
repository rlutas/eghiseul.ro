# Sesiune 2026-06-10 (16) — Cazier Fiscal: motiv la pasul 1 + etichetă „Persoană Fizică"

**Status:** ✅ Aplicat (migrare rulată, wizard E2E 19/19, build OK)
**Fișiere:**
- `src/providers/modular-wizard-provider.tsx`
- `supabase/migrations/051_cazier_fiscal_pf_name.sql` (rulat)
- `tests/e2e/wizard/pf-flow-ui.spec.ts`, `tests/e2e/wizard/cazier-fiscal-purpose.spec.ts` (nou)

---

## Cerință

La `cazier-fiscal` (proiectul soră îl are) lipseau față de noi: **„Motivul solicitării" nu apărea la pasul 1** și nu scria că e **Persoană Fizică**.

## Cauză

`cazier-fiscal` e PF-locked (personalKyc activ, fără `clientTypeSelection`). `INIT_SERVICE` **nu seta clientType** → rămânea `null`. Iar la pasul 1 motivul se afișează doar dacă `clientType === 'PF'` (`showsPurpose = !!purposeOptions && clientType === 'PF'`). Deci motivul nu apărea.

## Fix

1. **Provider `INIT_SERVICE`:** pentru serviciile PF-locked (`personalKyc.enabled && !companyKyc.enabled && !clientTypeSelection.enabled`) setează `clientType = 'PF'` automat. Afectează și `cazier-judiciar-persoana-fizica` + `certificat-integritate` (corect — sunt PF). Acum motivul apare și e cerut.
2. **DB (migrare 051):** redenumit `cazier-fiscal` → **„Cazier Fiscal Persoană Fizică"** (ca `cazier-judiciar-persoana-fizica`).

## Efect colateral (corect)
Motivul devine **obligatoriu** la pasul 1 și pentru `cazier-judiciar-persoana-fizica` (înainte clientType era null). Consistent cu umbrella cazier-judiciar (care cere motiv la PF). Testele `pf-flow-ui` actualizate să selecteze un motiv în `fillContact`.

## Verificare
- E2E nou `cazier-fiscal-purpose`: motivul apare + header „Cazier Fiscal Persoană Fizică". ✓
- Wizard E2E **19/19**; unit **1042**; `tsc`/`build` curate.
