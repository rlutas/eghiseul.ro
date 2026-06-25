# 2026-06-25 — Fix: firmă marcată greșit „inactivă" (TRANSFER sediu)

## Bug (raportat: SOLTERA PLAST S.R.L., CUI 49754074)
La constatator, firma era blocată cu „Firma nu este activă în Registrul Comerțului", deși la ONRC e în funcțiune.

Cauză: `isActive` din `infocui.ts` cerea ca `stare_inregistrare` (ANAF) să conțină cuvântul „INREGISTRAT". ANAF întoarce însă și alte stări ACTIVE care nu-l conțin — aici `"TRANSFER(SOSIRE) din data 06.10.2025"` (firma și-a mutat sediul în alt județ). `statusInactivi` era `false` (NU în registrul de inactivi), firma ne-radiată → totuși marcată inactivă.

## Fix
`isCompanyActive(stare, inInactiveRegister)` (extras + testat): firmă = ACTIVĂ dacă NU e în registrul ANAF de inactivi (`stare_inactiv.statusInactivi`) ȘI starea nu indică RADIAT/DIZOLVAT/LICHIDARE/INACTIV. Nu mai cere „INREGISTRAT" în string → TRANSFER(SOSIRE/PLECARE) și alte stări active trec corect.

Verificat live pe CUI 49754074 → `isActive = true`. Teste: `tests/unit/company/is-active.test.ts` (7). Build verde.
