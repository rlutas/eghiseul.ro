# Sesiune 2026-06-09 — Dependențe apostilă/traducere/legalizare la serviciile secundare (bundled)

**Status:** ✅ Aplicat (6 teste noi, 1042 total pass, build OK)
**Fișiere:**
- `src/lib/services/option-dependencies.ts` (nou — regulile, pur + testabil)
- `tests/unit/lib/services/option-dependencies.test.ts` (nou)
- `src/components/orders/steps-modular/options-step.tsx` (cardul bundled folosește helper-ul)

---

## Cerință

User: la „Certificat Integritate" (și orice serviciu secundar adăugat care are apostilă/traducere/legalizare), opțiunile trebuie să respecte aceeași dependență ca la opțiunile principale de sus:
- **Legalizare Notarială** selectabilă DOAR dacă e bifată **Traducere Autorizată**
- **Apostilă Notari (Camera Notarilor)** selectabilă DOAR dacă e bifată **Legalizare**

„uitate ca si sus" — secțiunea secundară permitea selectarea fără prerechizită.

## Diagnostic

- Opțiunile **principale** (sus) aplicau deja dependența: guard-uri în handlere + `disabled` + cascadă la deselectare + text „Necesită...".
- Opțiunile **bundled** (`CrossServiceAddonCard`, secțiunea „OPȚIUNI SUPLIMENTARE PENTRU ...") NU aveau nimic — `toggleBundled` accepta orice cod, fără `disabled`, fără hint.

## Soluție

1. **Helper pur nou** `option-dependencies.ts`:
   - `OPTION_DEPENDENCIES`: `legalizare → traducere`, `apostila_notari → legalizare`.
   - `isOptionDepBlocked(code, selectedSet)` — parcurge tot lanțul (apostila_notari cere și legalizare ȘI traducere).
   - `cascadeDropCodes(code)` — la deselectarea unei prerechizite, întoarce tranzitiv codurile de eliminat (traducere → legalizare → apostila_notari). Tranzitivitate corectă, calculată din map, nu hardcodată.

2. **`CrossServiceAddonCard`** (bundled):
   - Calculează codurile selectate **în grupul acelui părinte** (`selectedBundledCodes`) — dependența e scoped per serviciu secundar, nu amestecată cu cea principală.
   - `toggleBundled`: blochează selectarea unui dependent înainte de prerechizită; la deselectare aplică `cascadeDropCodes`.
   - Randare: `disabled` + stil estompat (`opacity-50 cursor-not-allowed`) + text „Necesită Traducere Autorizată" / „Necesită Legalizare" + `PriceChip` disabled — exact ca `OptionCard`-ul de sus.

## Note

- Secțiunea **principală** rămâne neschimbată (funcționa deja). Poate fi refactorizată ulterior la același helper pentru o singură sursă de adevăr — nu am atins-o acum ca să nu introduc risc.
- **Validare server-side:** nu există (nici pentru opțiunile principale). Dependența e enforce-uită client-side în ambele secțiuni. Dacă vrem apărare în adâncime, se poate adăuga un check în `/api/orders` care respinge `legalizare` fără `traducere` etc. — follow-up opțional.

## Verificare

- `npx tsc --noEmit` → 0
- `eslint` → 0 erori
- `vitest run tests/unit` → **1042 passed** (6 noi)
- `npm run build` → OK
