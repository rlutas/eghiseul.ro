# 02.11.2026 — La plata prin transfer, termenul pornește când verificați dovada
<!-- categorie: plati -->

## Pentru echipă

- La comenzile plătite prin transfer bancar, termenul de livrare se calculează acum din momentul în care apăsați „Dovadă verificată — pornește lucrul".
- Până acum termenul pornea de la plasarea comenzii. Dacă clientul trimitea dovada după câteva zile, comanda apărea expirată chiar când începeați lucrul (E-261026-B9HW3: plasată pe 26.10, dovadă pe 01.11, termen 02.11).
- „Confirmă plata" păstrează același termen, nu îl mai mută. Dacă confirmați plata direct, fără „Dovadă verificată", termenul pornește de la confirmare, ca până acum.
- Pe E-261026-B9HW3 termenul e corectat: 06.11.

---

## Tehnic

- `startWorkOnVerifiedProof` (`src/lib/orders/start-work-on-proof-run.ts`): recalculează `estimated_completion_date` cu `computeEstimatedCompletionISOForOrder(..., now)` în același UPDATE condiționat care pune `processing`.
- `fulfilManuallyPaidOrder` (`src/lib/orders/fulfil-paid.ts`): ancora calculului = `proof_verified_at` când există, altfel acum.
- Test: `tests/unit/lib/orders/start-work-on-proof-run.test.ts`.
