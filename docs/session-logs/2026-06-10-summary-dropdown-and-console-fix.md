# Sesiune 2026-06-10 (11) — Dropdown rezumat curat, spacing header, erori consolă

**Status:** ✅ Aplicat (tsc/lint/build OK, wizard E2E 17/17)
**Fișiere:**
- `src/components/orders/order-sidebar.tsx`, `price-sidebar-modular.tsx`, `modular-order-wizard.tsx`
- `src/components/orders/modules/signature/SignatureStep.tsx`

---

## 1. Dropdown „Rezumat comandă" mai curat (mobil)
`OrderSidebar` are acum un prop `variant`:
- `summary` → doar cardul de preț (folosit în dropdown-ul barei sticky) — fără timp estimat / badge-uri.
- `extras` → doar „Timp estimat livrare" + badge-urile de încredere.
- `full` (default) → tot (sidebar desktop).

În wizard: dropdown-ul = `variant="summary"` (curat). Timpul estimat + badge-urile (`variant="extras"`) apar acum în **formular pe mobil, sub „Ai nevoie de ajutor?"** (`lg:hidden`). Desktop neschimbat. (commit 9d00383)

## 2. Spațiu prea mare header → progress bar (mobil)
`mb-8` → `mb-4 sm:mb-6` pe header; rândul de titlu `mb-4` → `mb-3 sm:mb-4`. (commit 9d00383)

## 3. Erori în consolă la completarea formularului
„Unable to preventDefault inside passive event listener invocation." (zeci, la desenarea semnăturii). Canvas-ul de semnătură apela `e.preventDefault()` în `onTouchStart`/`onTouchMove`, dar React atașează listener-ele de touch ca **pasive** → warning la fiecare `touchmove`. Canvas-ul are deja `touch-none`, deci `preventDefault` se apelează acum **doar pentru mouse**. (commit 088018c)

## Verificare
`tsc`/`lint`/`build` curate; wizard E2E 17/17 verde.
